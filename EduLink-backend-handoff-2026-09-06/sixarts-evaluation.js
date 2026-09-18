/* Editable evaluation records, shared by the screen and both document exports. */
function cleanSixArtsIndicator(value) {
  return String(value || '').replace(/(^|[、，,；;\s])\d+(?:[.．]\d+)+(?:[.．、])?\s*/g, '$1').trim();
}

function sixArtsEvaluationResponses() {
  return assistantState.sixarts.evaluationResponses ||= {};
}

function sixArtsEvaluationValue(key, fallback = '') {
  return sixArtsEvaluationResponses()[key] ?? fallback;
}

function sixArtsGrade(key, label) {
  const value = sixArtsEvaluationValue(key);
  return `<fieldset class="sixarts-grade" aria-label="${escapeHtml(label)}"><legend class="sr-only">${escapeHtml(label)}</legend>${['A', 'B', 'C', 'D'].map(grade => `<label><input type="radio" name="sixarts-eval-${escapeHtml(key)}" data-sixarts-evaluation="${escapeHtml(key)}" value="${grade}" ${value === grade ? 'checked' : ''}><span>${grade}</span></label>`).join('')}</fieldset>`;
}

function sixArtsEvaluationInput(key, label, fallback = '') {
  return `<label class="sixarts-evaluation-text"><span>${escapeHtml(label)}</span><textarea data-sixarts-evaluation="${escapeHtml(key)}" rows="3" placeholder="请根据课堂证据填写">${escapeHtml(String(sixArtsEvaluationValue(key, fallback)))}</textarea></label>`;
}

function getSixArtsEditableEvaluation(context, sourceRows, defaults, designData) {
  defaults ||= getDefaultSixArtsEvaluationBundle(context);
  designData ||= getSixArtsDesignDocument(context, getSelectedSixArts());
  const generated = assistantState.sixarts.evaluationDraft || [];
  const source = getDefaultSixArtsEvaluationRows(context);
  const students = (sourceRows || sixArtsDimensions.map(item => generated.find(row => row.key === item.key) || source[item.key] || { key: item.key })).map((row, index) => {
    const art = sixArtsDimensions.find(item => item.key === row.key) || sixArtsDimensions[index];
    return { ...row, key: art.key, icon: art.icon, dimension: row.dimension || art.ability, observable: row.observable || art.evidence, evidence: row.evidence || `${art.activity}的过程记录或作品`, target: row.target || '达成课堂目标' };
  });
  const teachers = (designData.teacherRows || []).map((row, index) => {
    const third = String(row[2] || row.key || '观察指标');
    const number = Number(third.match(/^\s*(\d+)/)?.[1]);
    const first = String(row[0] || row.level || '');
    const group = ['践行师德', '学会教学', '学会育人', '学会发展'].find(name => first.includes(name))
      || ([1, 2].includes(number) ? '践行师德' : [6, 7].includes(number) ? '学会育人' : [8, 9].includes(number) ? '学会发展' : '学会教学');
    return { index, group, first, second: String(row[1] || row.dimension || ''), third: cleanSixArtsIndicator(third), observable: String(row[3] || row.observable || '') };
  });
  const choose = (key, fallback) => assistantState.sixarts[key]?.length ? assistantState.sixarts[key] : fallback;
  return { teachers, students, self: choose('selfAssessmentDraft', defaults.selfAssessment || []), reflections: choose('reflectionPromptsDraft', defaults.reflectionPrompts || []) };
}

function renderSixArtsEditableEvaluation(context, rows, defaults, designData) {
  if (assistantState.sixarts.detailLevel === 'detailed') return renderSixArtsDetailedTemplateEvaluation(context, rows, defaults, designData);
  const data = getSixArtsEditableEvaluation(context, rows, defaults, designData);
  const heading = (number, title, description) => `<header class="sixarts-detailed-evaluation-heading"><span>${number}</span><div><h3>${title}</h3><p>${description}</p></div></header>`;
  const table = (headers, body) => `<div class="sixarts-detailed-summary-table-wrap"><table class="sixarts-detailed-summary-table"><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${body}</tbody></table></div>`;
  const groups = ['践行师德', '学会教学', '学会育人', '学会发展'];
  const teacherCards = groups.map((group, index) => `<article class="sixarts-detailed-teacher-card teacher-tone-${index + 1}"><header><span>${String(index + 1).padStart(2, '0')}</span><div><b>${group}</b><small>教师课堂行为观察</small></div></header><div class="sixarts-detailed-teacher-list">${data.teachers.filter(row => row.group === group).map(row => `<div><strong>${escapeHtml(row.third)}</strong><p>${escapeHtml(row.observable)}</p>${sixArtsGrade(`teacher-${row.index}`, `${row.third}课堂评价`)}</div>`).join('')}</div></article>`).join('');
  const teacherSummary = data.teachers.map(row => `<tr><td>${row.index + 1}</td><td>${escapeHtml(row.first || row.group)}</td><td>${escapeHtml(row.second)}</td><td>${escapeHtml(row.third)}</td><td>${sixArtsEvaluationInput(`achievement-${row.index}`, '本课达成表现', row.observable)}</td><td>${sixArtsGrade(`summary-${row.index}`, `${row.third}综合达成`)}${sixArtsEvaluationInput(`teacher-note-${row.index}`, '教师记录')}</td></tr>`).join('');
  const studentCards = data.students.map(row => `<article class="sixarts-detailed-student-card art-${row.key}"><header><span><i data-lucide="${row.icon}"></i>${escapeHtml(row.key)}</span><b>${escapeHtml(row.dimension)}</b></header>${sixArtsGrade(`student-${row.key}`, `${row.key}学生六艺评价`)}<p>${escapeHtml(row.observable)}</p><small>学习证据：${escapeHtml(row.evidence)}</small>${sixArtsEvaluationInput(`student-note-${row.key}`, '学生自我表现 / 教师记录')}</article>`).join('');
  const checklist = data.self.map((item, index) => `<li><label class="sixarts-evaluation-check"><input type="checkbox" data-sixarts-evaluation="self-${index}" ${sixArtsEvaluationValue(`self-${index}`, false) === true ? 'checked' : ''}>${escapeHtml(String(item))}</label></li>`).join('');
  const reflections = data.reflections.map((item, index) => sixArtsEvaluationInput(`reflection-${index}`, String(item))).join('');
  const panorama = data.students.map(row => `<tr><td>${escapeHtml(row.key)}</td><td>${escapeHtml(row.evidence)}</td><td>${escapeHtml(row.observable)}</td><td>${escapeHtml(row.target)}</td><td>${sixArtsGrade(`panorama-${row.key}`, `${row.key}课堂常态评价`)}${sixArtsEvaluationInput(`panorama-note-${row.key}`, '改进记录')}</td></tr>`).join('');
  return `<div class="sixarts-detailed-evaluation sixarts-editable-evaluation">
    <nav class="sixarts-detailed-evaluation-tabs">${['教师课堂评价', '达成统计', '学生六艺评价', '自评与反思', '六艺融合全景'].map((label, index) => `<button type="button" data-sixarts-evaluation-anchor="${index + 1}"><b>0${index + 1}</b>${label}</button>`).join('')}</nav>
    <p class="sixarts-evaluation-hint">按课堂证据选择 A / B / C / D，每项单选。未评分项导出为“未评价”；勾选及文字记录会随当前教案保存并导出。</p>
    <section class="sixarts-detailed-evaluation-section" id="sixarts-evaluation-part-1">${heading('01', '六艺 · 三学会融合教师课堂教学评价', '依据课堂可观察证据评价教师教学行为。')}<div class="sixarts-detailed-teacher-grid">${teacherCards}</div></section>
    <section class="sixarts-detailed-evaluation-section" id="sixarts-evaluation-part-2">${heading('02', '六艺 · 三学会教师行为综合达成统计表', '汇总单项观察结果，记录实际达成表现和课堂证据。')}${table(['序号', '一级指标', '二级指标', '三级指标', '本课达成表现', '评价等级 / 教师记录'], teacherSummary)}</section>
    <section class="sixarts-detailed-evaluation-section" id="sixarts-evaluation-part-3">${heading('03', '学生六艺素养评价量表（课堂观察应用）', '依据具体行为和学习证据评价学生六艺表现。')}<div class="sixarts-detailed-student-grid">${studentCards}</div></section>
    <section class="sixarts-detailed-evaluation-section" id="sixarts-evaluation-part-4">${heading('04', '自评与反思', '从学生表现与教师行为两条线回看本课。')}<div class="sixarts-self-reflection-columns"><div><b>附件一：学生六艺自评表</b><ul>${checklist}</ul></div><div><b>附件二：教师教学反思</b>${reflections}${sixArtsEvaluationInput('next-improvement', '下一次教学，我准备优先改进')}${sixArtsEvaluationInput('next-evidence', '我将用以下证据验证')}</div></div></section>
    <section class="sixarts-detailed-evaluation-section" id="sixarts-evaluation-part-5">${heading('05', '六艺课堂常态全景表', '关联六艺维度、课堂证据和改进行动。')}${table(['六艺', '课堂证据', '可观察行为', '本课目标', '评价等级 / 改进记录'], panorama)}</section>
  </div>`;
}

function buildSixArtsEvaluationMarkdown(context) {
  if (assistantState.sixarts.detailLevel === 'detailed') return buildSixArtsDetailedEvaluationMarkdown(context);
  const data = getSixArtsEditableEvaluation(context);
  const cell = value => String(value ?? '').replace(/\|/g, '｜').replace(/\r?\n/g, '；');
  const table = (headers, rows) => `| ${headers.join(' | ')} |\n| ${headers.map(() => '---').join(' | ')} |\n${rows.map(row => `| ${row.map(cell).join(' | ')} |`).join('\n')}`;
  const grade = key => /^[ABCD]$/.test(sixArtsEvaluationValue(key)) ? sixArtsEvaluationValue(key) : '未评价';
  const text = (key, fallback = '未填写') => sixArtsEvaluationValue(key, fallback) || '未填写';
  const teachers = ['践行师德', '学会教学', '学会育人', '学会发展'].map((group, index) => `### 0${index + 1} ${group}\n\n${table(['三级指标', '评价标准（观察教师行为）', '评价等级'], data.teachers.filter(r => r.group === group).map(r => [r.third, r.observable, grade(`teacher-${r.index}`)]))}`).join('\n\n');
  return `## 01 六艺 · 三学会融合教师课堂教学评价\n\n${teachers}\n\n## 02 六艺 · 三学会教师行为综合达成统计表\n\n${table(['一级指标', '二级指标', '三级指标', '本课达成表现', '评价等级', '教师记录'], data.teachers.map(r => [r.first || r.group, r.second, r.third, text(`achievement-${r.index}`, r.observable), grade(`summary-${r.index}`), text(`teacher-note-${r.index}`)]))}\n\n## 03 学生六艺素养评价量表（课堂观察应用）\n\n${table(['六艺', '评价维度', '可观察行为', '学习证据', '评价等级', '学生自我表现 / 教师记录'], data.students.map(r => [r.key, r.dimension, r.observable, r.evidence, grade(`student-${r.key}`), text(`student-note-${r.key}`)]))}\n\n## 04 自评与反思\n\n### 附件一：学生六艺自评表\n\n${data.self.map((item, i) => `- [${sixArtsEvaluationValue(`self-${i}`, false) === true ? 'x' : ' '}] ${cell(item)}`).join('\n')}\n\n### 附件二：教师教学反思\n\n${data.reflections.map((item, i) => `${item}\n\n${text(`reflection-${i}`)}`).join('\n\n')}\n\n下一次教学，我准备优先改进：${text('next-improvement')}\n\n我将用以下证据验证：${text('next-evidence')}\n\n## 05 六艺课堂常态全景表\n\n${table(['六艺', '课堂证据', '可观察行为', '本课目标', '评价等级', '改进记录'], data.students.map(r => [r.key, r.evidence, r.observable, r.target, grade(`panorama-${r.key}`), text(`panorama-note-${r.key}`)]))}`;
}

function saveSixArtsEvaluationInput(event) {
  const input = event.target.closest('[data-sixarts-evaluation]');
  if (!input || (input.type === 'radio' && !input.checked)) return;
  sixArtsEvaluationResponses()[input.dataset.sixartsEvaluation] = input.type === 'checkbox' ? input.checked : input.value;
  saveSixArtsVersionDraft();
  scheduleWorkspaceSave();
}
document.addEventListener('input', saveSixArtsEvaluationInput);
document.addEventListener('change', saveSixArtsEvaluationInput);
document.addEventListener('click', event => {
  const button = event.target.closest('[data-sixarts-evaluation-anchor]');
  if (button) document.getElementById(`sixarts-evaluation-part-${button.dataset.sixartsEvaluationAnchor}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
});
