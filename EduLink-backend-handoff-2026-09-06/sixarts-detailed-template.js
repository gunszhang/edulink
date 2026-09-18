/* September detailed template: one document model for the page and exports. */
function sixArtsDetailedDesignBlocks(data) {
  const value = (key, fallback) => assistantState.sixarts.designFieldDraft?.[key] ?? fallback ?? '';
  const field = (key, fallback) => ({ key, text: value(key, fallback) });
  const text = (title, key, fallback) => ({ title, fields: [field(key, fallback)] });
  const table = (title, headers, rows) => ({ title, headers, rows });
  return [
    text('一、设计理念', 'concept', data.concept),
    text('二、教材分析', 'textbook', data.textbook),
    text('三、学情分析', 'student', data.student),
    { title: '四、核心六艺融合点', fields: data.fusion.map(([key, content]) => ({ ...field(`fusion-point-${key}`, content), label: key })) },
    { title: '五、教学目标', children: [
      { title: '（一）学科知识与技能（指向学生）', fields: data.subjectGoals.map((content, i) => field(`subject-${i + 1}`, content)), ordered: true },
      table('（二）六艺素养目标（指向学生）', ['六艺维度', '具体表现'], data.competencies.map(row => [row.key, field(`competency-${row.key}`, row.text)])),
      { title: '（三）情感态度价值观（指向学生）', fields: data.values.map(([label, content], i) => ({ ...field(`value-${i + 1}`, content), label })) },
      table('（四）教师教学目标（指向“践行三学会”毕业要求）', ['一级指标', '二级指标', '三级指标', '本课达成目标'], data.teacherRows.map((row, i) => [row[0], row[1], cleanTeacherIndicatorText(row[2]), field(`teacher-${i + 1}`, row[3])]))
    ] },
    { title: '六、教学重难点', fields: [{ ...field('key', data.key), label: '重点' }, { ...field('difficult', data.difficult), label: '难点' }] },
    table('七、教学方法', ['教学方法', '六艺侧重（学生）', '对应教师三学会指标'], data.methods.map((row, i) => [row[0], field(`method-art-${i + 1}`, row[1]), field(`method-indicator-${i + 1}`, cleanTeacherIndicatorText(row[2]))])),
    text('八、教学准备', 'prep', data.prep)
  ];
}

function sixArtsTemplateTable(headers, rows) {
  return `<div class="sixarts-template-table-wrap"><table class="sixarts-template-table"><thead><tr>${headers.map(h => `<th scope="col">${escapeHtml(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

function renderSixArtsDetailedDesign(data) {
  const edit = field => `<div class="sixarts-design-field" contenteditable="true" spellcheck="false" data-sixarts-field="${escapeHtml(field.key)}">${escapeHtml(String(field.text))}</div>`;
  const block = (item, nested = false) => `<section class="${nested ? 'sixarts-template-subsection' : 'sixarts-template-section'}"><${nested ? 'h4' : 'h3'}>${escapeHtml(item.title)}</${nested ? 'h4' : 'h3'}>${item.children ? item.children.map(child => block(child, true)).join('') : item.rows ? sixArtsTemplateTable(item.headers, item.rows.map(row => row.map(cell => typeof cell === 'object' ? edit(cell) : escapeHtml(String(cell ?? ''))))) : `<div class="sixarts-template-fields">${item.fields.map((f, i) => `<div class="sixarts-template-field">${f.label || item.ordered ? `<b>${escapeHtml(f.label || `${i + 1}.`)}${f.label ? '：' : ''}</b>` : ''}${edit(f)}</div>`).join('')}</div>`}</section>`;
  return `<div class="sixarts-template-document sixarts-design-document is-detailed">${sixArtsDetailedDesignBlocks(data).map(item => block(item)).join('')}</div>`;
}

function sixArtsDetailedRows(stage) {
  const raw = stage.rows?.length ? stage.rows : (stage.steps || []).map(step => ({ step }));
  const rows = raw.map(row => Array.isArray(row) ? { step: row[0], teacher: row[1], student: row[2], arts: row[3], indicator: row[4] } : { ...row });
  if (stage.rows?.length) {
    const known = new Set(rows.flatMap(row => [String(row.step), sixArtsDetailedStepParts(row.step).step]));
    (stage.steps || []).forEach(step => {
      if (!known.has(String(step))) { rows.push({ step }); known.add(String(step)); }
    });
  }
  return rows;
}

function sixArtsDetailedStepParts(step) {
  const text = String(step || '');
  const match = text.match(/^([（(][一二三四五六七八九十\d]+[）)][^·：:]*?)[·：:]\s*(.+)$/);
  return match ? { group: match[1], step: match[2] } : { group: '', step: text.replace(/^\d+[.、]\s*/, '') };
}

function sixArtsDetailedStageHeading(stage, index) {
  const ordinal = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'][index] || String(index + 1);
  const title = String(stage.title || '教学环节').replace(/^(?:环节)?[一二三四五六七八九十\d]+[、.：:]\s*/, '').replace(/[（(](?:约)?\d+\s*分钟[）)]\s*$/, '');
  return `${ordinal}、${title}`;
}

function renderSixArtsDetailedProcess(context, stages) {
  const edit = (key, text, row = false) => `<div contenteditable="true" spellcheck="false" data-${row ? 'row' : 'stage'}-field="${key}">${escapeHtml(String(text || ''))}</div>`;
  const info = (stage, key, label) => `<div class="sixarts-template-field"><b>${label}：</b>${edit(key, stage[key])}</div>`;
  return `<div class="sixarts-template-process">${stages.map((stage, i) => {
    const rows = sixArtsDetailedRows(stage);
    const grouped = rows.some(row => sixArtsDetailedStepParts(row.step).group);
    const stepContent = (row, index) => {
      const parts = sixArtsDetailedStepParts(row.step);
      const details = [['teacher', '教师活动'], ['student', '学生活动'], ['arts', '学生六艺渗透'], ['indicator', '教师指标']].filter(([key]) => row[key]);
      return `<div data-sixarts-step-row="${index}" data-step-group="${escapeHtml(parts.group)}">${edit('step', parts.step, true)}${details.length ? `<details class="sixarts-template-step-details"><summary>活动展开</summary>${details.map(([key, label]) => `<div class="sixarts-template-field"><b>${label}：</b>${edit(key, key === 'indicator' ? cleanTeacherIndicatorText(row[key]) : row[key], true)}</div>`).join('')}</details>` : ''}</div>`;
    };
    const steps = grouped ? sixArtsTemplateTable(['环节', '具体步骤'], rows.map((row, index) => [escapeHtml(sixArtsDetailedStepParts(row.step).group || stage.title), stepContent(row, index)])) : `<ol class="sixarts-template-steps">${rows.map((row, index) => `<li>${stepContent(row, index)}</li>`).join('')}</ol>`;
    return `<article class="sixarts-template-section" data-sixarts-stage="${escapeHtml(String(stage.title || '教学环节'))}" data-sixarts-art-key="${escapeHtml(stage.art_key || '')}" data-sixarts-art-label="${escapeHtml(stage.art_label || stage.art_key || '')}" data-sixarts-art-activity="${escapeHtml(stage.art_activity || '')}"><header><h3>${escapeHtml(sixArtsDetailedStageHeading(stage, i))}<small>（<span contenteditable="true" data-stage-time>${escapeHtml(String(stage.time || ''))}</span>）</small></h3></header><div class="sixarts-template-fields">${info(stage, 'teacher', '教师活动')}${info(stage, 'student', '学生活动')}${info(stage, 'penetration', '学生六艺渗透')}</div><h4>教学步骤</h4>${steps}<div class="sixarts-template-notes">${[['intention', '设计意图'], ['evidence', '学习证据'], ['teacher_indicator', '教师指标'], ['materials', '材料'], ['expected_output', '学生产出'], ['question_chain', '追问链']].filter(([key]) => key !== 'question_chain' || stage[key]).map(([key, label]) => info(stage, key, label)).join('')}</div></article>`;
  }).join('')}</div>`;
}

function captureSixArtsDetailedRows(element, previous) {
  const elements = Array.from(element.querySelectorAll('[data-sixarts-step-row]'));
  if (!elements.length) return {};
  const rows = elements.map((item, index) => {
    const row = { ...(sixArtsDetailedRows(previous || {})[index] || {}) };
    // A closed <details> can report empty innerText in Chromium, despite
    // retaining its editable text. Do not erase collapsed activity content.
    item.querySelectorAll('[data-row-field]').forEach(field => { row[field.dataset.rowField] = (field.innerText || field.textContent || '').trim(); });
    if (item.dataset.stepGroup) row.step = `${item.dataset.stepGroup}·${row.step}`;
    return row;
  });
  return { rows, steps: rows.map(row => row.step) };
}

function sixArtsTemplateMarkdownTable(headers, rows) {
  const cell = value => String(value ?? '').replace(/\|/g, '｜').replace(/\r?\n/g, '；');
  return `| ${headers.map(cell).join(' | ')} |\n| ${headers.map(() => '---').join(' | ')} |\n${rows.map(row => `| ${row.map(cell).join(' | ')} |`).join('\n')}`;
}

function buildSixArtsDetailedDesignMarkdown(data) {
  const block = (item, depth = 3) => `${'#'.repeat(depth)} ${item.title}\n\n${item.children ? item.children.map(child => block(child, depth + 1)).join('\n\n') : item.rows ? sixArtsTemplateMarkdownTable(item.headers, item.rows.map(row => row.map(cell => typeof cell === 'object' ? cell.text : cell))) : item.fields.map((f, i) => `${f.label ? `${f.label}：` : item.ordered ? `${i + 1}. ` : ''}${f.text}`).join('\n\n')}`;
  return `## 教学设计正文\n\n${sixArtsDetailedDesignBlocks(data).map(item => block(item)).join('\n\n')}`;
}

function buildSixArtsDetailedProcessMarkdown(stages) {
  return stages.map((stage, index) => {
    const rows = sixArtsDetailedRows(stage);
    const expanded = row => `${sixArtsDetailedStepParts(row.step).step}${[['teacher', '教师活动'], ['student', '学生活动'], ['arts', '学生六艺渗透'], ['indicator', '教师指标']].filter(([key]) => row[key]).map(([key, label]) => `；${label}：${key === 'indicator' ? cleanTeacherIndicatorText(row[key]) : row[key]}`).join('')}`;
    const steps = rows.some(row => sixArtsDetailedStepParts(row.step).group) ? sixArtsTemplateMarkdownTable(['环节', '具体步骤'], rows.map(row => [sixArtsDetailedStepParts(row.step).group || stage.title, expanded(row)])) : rows.map((row, i) => `${i + 1}. ${expanded(row)}`).join('\n\n');
    return `### ${sixArtsDetailedStageHeading(stage, index)}（${stage.time || ''}）\n\n教师活动：${stage.teacher || ''}\n\n学生活动：${stage.student || ''}\n\n学生六艺渗透：${stage.penetration || ''}\n\n教学步骤：\n\n${steps}\n\n${[['intention', '设计意图'], ['evidence', '学习证据'], ['teacher_indicator', '教师指标'], ['materials', '材料'], ['expected_output', '学生产出'], ['question_chain', '追问链']].filter(([key]) => stage[key]).map(([key, label]) => `${label}：${stage[key]}`).join('\n\n')}`;
  }).join('\n\n');
}

function buildSixArtsDetailedPlanMarkdown(context) {
  const state = assistantState.sixarts;
  const defaults = getDefaultSixArtsEvaluationBundle(context);
  const arts = getSelectedSixArts();
  const stages = state.processDraft?.length ? state.processDraft : getDefaultSixArtsStages(context);
  const practice = state.practiceDraft?.length ? state.practiceDraft : defaults.practice || [];
  const practiceRows = practice.map((item, index) => {
    if (typeof item !== 'string') return [item.level || item.title || `练习${index + 1}`, item.content || item.task || JSON.stringify(item)];
    const match = item.match(/^([^：:]+)[：:](.*)$/s);
    return match ? [match[1], match[2]] : [`练习${index + 1}`, item];
  });
  const evaluation = buildSixArtsEvaluationMarkdown(context).replace(/^## (0[1-5]) /gm, (_, n) => `### ${['一', '二', '三', '四', '五'][Number(n) - 1]}、`).replace(/^### 0([1-4]) /gm, '#### $1.');
  const refs = (state.referenceDraft || []).map(item => `- ${item.title || item.source_title || '依据资料'}（${item.type || item.source_type || '参考资料'}）`).join('\n');
  return `# 《${String(context.title || '').replace(/[《》]/g, '')}》六艺融合教学设计\n\n## 课情设置\n\n版本：详案版\n\n学段年级：${context.stage} ${context.grade}\n\n学科教材：${context.subject} · ${context.edition}\n\n课时安排：${context.lessons} 课时 / ${context.duration} 分钟\n\n重点融合：${arts.map(art => art.key).join('、')}\n\n教学内容：${context.summary || ''}\n\n核心要求：${context.requirement || ''}\n\n${buildSixArtsDetailedDesignMarkdown(getSixArtsDesignDocument(context, arts))}\n\n## 教学过程（${context.duration}分钟）\n\n${buildSixArtsDetailedProcessMarkdown(stages)}\n\n## 六艺课堂评价与项目拓展\n\n${evaluation}\n\n### 六、课堂练习与课后巩固\n\n${sixArtsTemplateMarkdownTable(['程度', '要求'], practiceRows)}\n\n### 七、课后项目式拓展\n\n课后任务：${state.homeworkDraft || defaults.homework}\n\n项目拓展：${state.extensionDraft || defaults.extension}\n\n## 生成依据\n\n${refs || '- 内置参考模板'}`;
}

function sixArtsDetailedEvaluationTables(context, sourceRows, defaults, designData, html = false) {
  const data = getSixArtsEditableEvaluation(context, sourceRows, defaults, designData);
  const text = value => html ? escapeHtml(String(value ?? '')) : String(value ?? '');
  const grade = (key, label) => html ? sixArtsGrade(key, label) : (/^[ABCD]$/.test(sixArtsEvaluationValue(key)) ? sixArtsEvaluationValue(key) : '未评价');
  const input = (key, label, fallback = '') => html ? sixArtsEvaluationInput(key, label, fallback) : (sixArtsEvaluationValue(key, fallback) || '未填写');
  const table = (title, headers, rows) => ({ title, headers, rows });
  return [
    { title: '六艺 · 三学会融合教师课堂教学评价', description: '依据课堂可观察证据，分别评价四个维度的教师教学行为。', tables: ['践行师德', '学会教学', '学会育人', '学会发展'].map((group, i) => table(`${i + 1}.${group}`, ['三级指标', '评价标准（观察教师行为）', '评价等级'], data.teachers.filter(r => r.group === group).map(r => [text(r.third), text(r.observable), grade(`teacher-${r.index}`, `${r.third}课堂评价`)]))) },
    { title: '六艺 · 三学会教师行为综合达成统计表', description: '汇总本课达成表现，结合观察记录为各项指标选择等级。', tables: [table('', ['一级指标', '二级指标', '三级指标', '本课达成表现', '评价等级', '教师记录'], data.teachers.map(r => [text(r.first || r.group), text(r.second), text(r.third), input(`achievement-${r.index}`, '本课达成表现', r.observable), grade(`summary-${r.index}`, `${r.third}综合达成`), input(`teacher-note-${r.index}`, '教师记录')]))] },
    { title: '学生六艺素养评价量表（课堂观察应用）', description: '关联学生具体行为与学习证据，记录六艺表现。', tables: [table('', ['六艺', '评价维度', '可观察行为', '学习证据', '评价等级', '学生自我表现 / 教师记录'], data.students.map(r => [text(r.key), text(r.dimension), text(r.observable), text(r.evidence), grade(`student-${r.key}`, `${r.key}学生六艺评价`), input(`student-note-${r.key}`, '学生自我表现 / 教师记录')]))] },
    { title: '自评与反思', description: '学生按实际表现勾选达成条目，教师结合证据填写反思与改进计划。', tables: [
      table('附件一：学生六艺自评表', ['达成打勾', '条目'], data.self.map((item, i) => [html ? `<label class="sixarts-evaluation-check"><input type="checkbox" aria-label="${escapeHtml(String(item))}" data-sixarts-evaluation="self-${i}" ${sixArtsEvaluationValue(`self-${i}`, false) === true ? 'checked' : ''}></label>` : (sixArtsEvaluationValue(`self-${i}`, false) === true ? '☑' : '☐'), text(item)])),
      table('附件二：教师教学反思', ['序号', '条目'], [...data.reflections.map((item, i) => [String(i + 1), html ? input(`reflection-${i}`, item) : `${item}；反思：${input(`reflection-${i}`, item)}`]), ...[['next-improvement', '下一次教学，我准备优先改进'], ['next-evidence', '我将用以下证据验证']].map(([key, label], i) => [String(data.reflections.length + i + 1), html ? input(key, label) : `${label}：${input(key, label)}`])])
    ] },
    { title: '六艺课堂常态全景表', description: '围绕课堂证据、可观察行为和本课目标评分，留下改进记录。', tables: [table('', ['六艺', '课堂证据', '可观察行为', '本课目标', '评价等级', '改进记录'], data.students.map(r => [text(r.key), text(r.evidence), text(r.observable), text(r.target), grade(`panorama-${r.key}`, `${r.key}课堂常态评价`), input(`panorama-note-${r.key}`, '改进记录')]))] }
  ];
}

function renderSixArtsDetailedTemplateEvaluation(context, rows, defaults, designData) {
  const sections = sixArtsDetailedEvaluationTables(context, rows, defaults, designData, true);
  return `<div class="sixarts-template-evaluation sixarts-editable-evaluation"><p class="sixarts-evaluation-hint">每项等级单选 A / B / C / D。评分、勾选和文字记录会随当前详案保存，并同步到 Markdown 和 Word。</p>${sections.map((section, i) => `<section class="sixarts-template-section" id="sixarts-evaluation-part-${i + 1}"><h3>${['一', '二', '三', '四', '五'][i]}、${escapeHtml(section.title)}</h3><p>${escapeHtml(section.description)}</p>${section.tables.map(table => `${table.title ? `<h4>${escapeHtml(table.title)}</h4>` : ''}${sixArtsTemplateTable(table.headers, table.rows)}`).join('')}</section>`).join('')}</div>`;
}

function buildSixArtsDetailedEvaluationMarkdown(context) {
  return sixArtsDetailedEvaluationTables(context).map((section, i) => `### ${['一', '二', '三', '四', '五'][i]}、${section.title}\n\n${section.description}\n\n${section.tables.map(table => `${table.title ? `#### ${table.title}\n\n` : ''}${sixArtsTemplateMarkdownTable(table.headers, table.rows)}`).join('\n\n')}`).join('\n\n');
}

function buildSixArtsDetailedDocxTable(rows) {
  const headers = rows[0] || [];
  const count = headers.length;
  // Allocate space to prose; narrow identity/rating columns need less room.
  const weights = count === 2 ? [20, 80] : count === 3 ? [18, 64, 18] : count === 4 ? [14, 14, 16, 56] : count === 6 ? [10, 14, 19, 25, 10, 22] : headers.map(() => 1);
  const total = weights.reduce((a, b) => a + b, 0);
  const widths = weights.map(w => Math.floor(9638 * w / total));
  widths[widths.length - 1] += 9638 - widths.reduce((a, b) => a + b, 0);
  const body = rows.map((row, i) => `<w:tr>${i === 0 ? '<w:trPr><w:tblHeader/></w:trPr>' : ''}${row.map((cell, j) => `<w:tc><w:tcPr><w:tcW w:w="${widths[j]}" w:type="dxa"/><w:shd w:fill="${i === 0 ? 'EFEAF7' : 'FFFFFF'}"/><w:vAlign w:val="top"/></w:tcPr><w:p><w:pPr><w:spacing w:after="80" w:line="300" w:lineRule="auto"/></w:pPr><w:r><w:rPr>${i === 0 ? '<w:b/>' : ''}<w:sz w:val="21"/></w:rPr><w:t xml:space="preserve">${xmlEscape(cell)}</w:t></w:r></w:p></w:tc>`).join('')}</w:tr>`).join('');
  return `<w:tbl><w:tblPr><w:tblW w:w="9638" w:type="dxa"/><w:tblLayout w:type="fixed"/><w:tblCellMar><w:top w:w="90" w:type="dxa"/><w:left w:w="100" w:type="dxa"/><w:bottom w:w="90" w:type="dxa"/><w:right w:w="100" w:type="dxa"/></w:tblCellMar><w:tblBorders>${['top', 'left', 'bottom', 'right', 'insideH', 'insideV'].map(side => `<w:${side} w:val="single" w:sz="4" w:color="D8CEE7"/>`).join('')}</w:tblBorders></w:tblPr><w:tblGrid>${widths.map(width => `<w:gridCol w:w="${width}"/>`).join('')}</w:tblGrid>${body}</w:tbl>`;
}

function sixArtsPlanDocxBody(content) {
  if (assistantState.sixarts.detailLevel !== 'detailed') return markdownToDocxBody(content);
  return markdownToDocxBody(content, buildSixArtsDetailedDocxTable).replace(/(<w:pPr><w:pStyle w:val="(?:Title|Heading\d)"\/>)/g, '$1<w:keepNext/>');
}
