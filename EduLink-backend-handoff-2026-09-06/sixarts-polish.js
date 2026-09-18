function renderSixArtsConciseProcess(context, stages) {
  const edit = (key, value) => `<div contenteditable="true" spellcheck="false" data-stage-field="${key}">${escapeHtml(String(value || ''))}</div>`;
  return `<div class="sixarts-concise-timeline">${stages.map((stage, index) => {
    const art = sixArtsDimensions.find(item => item.key === stage.art_key) || getSelectedSixArts()[index % Math.max(1, getSelectedSixArts().length)] || sixArtsDimensions[0];
    const title = String(stage.title || '教学环节');
    const steps = stage.steps?.length ? `<div class="concise-stage-steps"><h4>教学步骤</h4><ol>${stage.steps.map(step => `<li>${edit('step', step)}</li>`).join('')}</ol></div>` : '';
    const details = stage.rows?.length ? `<details class="concise-process-details"><summary>查看环节具体安排 <span>${stage.rows.length} 项</span></summary><div>${stage.rows.map(row => `<article><h4>${escapeHtml(String(row.step || row[0] || ''))}</h4><dl><dt>教师行为</dt><dd>${escapeHtml(String(row.teacher || row[1] || ''))}</dd><dt>学生行为</dt><dd>${escapeHtml(String(row.student || row[2] || ''))}</dd><dt>六艺渗透</dt><dd>${escapeHtml(String(row.arts || row[3] || ''))}</dd><dt>教师指标</dt><dd>${escapeHtml(cleanSixArtsIndicator(row.indicator || row[4] || ''))}</dd></dl></article>`).join('')}</div></details>` : '';
    return `<article class="concise-stage-card" data-sixarts-stage="${escapeHtml(title)}" data-sixarts-art-key="${art.key}" data-sixarts-art-label="${escapeHtml(stage.art_label || art.key)}" data-sixarts-art-activity="${escapeHtml(stage.art_activity || art.activity)}">
      <header><span class="concise-stage-number">${String(index + 1).padStart(2, '0')}</span><div><h3>${escapeHtml(title)}</h3><span data-stage-time>${escapeHtml(String(stage.time || ''))}</span></div><span class="concise-stage-art">${escapeHtml(stage.art_label || art.key)} · ${escapeHtml(stage.art_activity || art.activity)}</span></header>
      <div class="concise-stage-actors"><section><h4>教师活动</h4>${edit('teacher', stage.teacher)}</section><section><h4>学生活动</h4>${edit('student', stage.student)}</section></div>
      ${steps}${details}<div class="concise-stage-fusion"><h4>学生六艺渗透</h4>${edit('penetration', stage.penetration || `${art.key}：${art.activity}`)}</div>
      <div class="concise-stage-notes"><section><h4>设计意图</h4>${edit('intention', stage.intention)}</section><section><h4>学习证据</h4>${edit('evidence', stage.evidence || art.evidence)}</section></div>
      <details class="concise-process-details"><summary>材料、产出与追问</summary><div class="concise-stage-notes"><section><h4>材料</h4>${edit('materials', stage.materials)}</section><section><h4>学生产出</h4>${edit('expected_output', stage.expected_output || stage.evidence)}</section><section><h4>追问链</h4>${edit('question_chain', stage.question_chain)}</section><section><h4>教师指标</h4>${edit('teacher_indicator', stage.teacher_indicator)}</section></div></details>
    </article>`;
  }).join('')}</div>`;
}
