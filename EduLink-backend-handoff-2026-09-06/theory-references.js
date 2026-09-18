/* Literature belongs to one theory path and one of its three source modules. */
function getTheoryLiterature(item, module) {
  const groups = window.THEORY_REFERENCES_DATA?.groups || [];
  const matches = groups.filter((entry) => entry.module === module
    && normalizeTheorySourceText(entry.theory_name) === normalizeTheorySourceText(item.name));
  const context = getTheoryRepresentativeContextRecord(item);
  if (context) {
    return matches.find((entry) => ['category', 'section', 'group'].every((part) =>
      normalizeTheorySourceText(entry[part]) === normalizeTheorySourceText(getTheoryRepresentativePathValue(context, part)))) || null;
  }
  return matches.length === 1 ? matches[0] : null;
}

function renderTheoryLiterature(item, module) {
  if (!['explanation', 'application', 'example'].includes(module)) return '';
  const entry = getTheoryLiterature(item, module);
  const body = entry
    ? `<button type="button" class="theory-literature-download" data-reference-download="${escapeHtml(entry.id)}" data-reference-filename="${escapeHtml(entry.filename)}" title="${escapeHtml(entry.filename)}"><span>${escapeHtml(entry.label)}</span><i data-lucide="download"></i></button><small>${entry.count === 1 ? '下载原文' : `共 ${entry.count} 篇，下载 ZIP 压缩包`}</small>`
    : '<span class="theory-literature-empty">暂无对应参考文献</span>';
  return `<section class="theory-literature" aria-label="参考文献"><h3><i data-lucide="book-open"></i>参考文献</h3><div>${body}</div></section>`;
}

document.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-reference-download]');
  if (!button || button.disabled) return;
  const original = button.innerHTML;
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 180000);
  button.disabled = true;
  button.setAttribute('aria-busy', 'true');
  button.textContent = '正在准备下载…';
  try {
    if (!EDULINK_RAG_CONFIG.baseUrl || !EDULINK_RAG_CONFIG.token) throw new Error('请先启动 EduLink 后端服务');
    const response = await fetch(`${EDULINK_RAG_CONFIG.baseUrl}/api/theory-references/${encodeURIComponent(button.dataset.referenceDownload)}/download`, {
      headers: { Authorization: `Bearer ${EDULINK_RAG_CONFIG.token}` }, signal: controller.signal
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.detail || `下载失败（${response.status}）`);
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = button.dataset.referenceFilename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    toast('参考文献已开始下载。');
  } catch (error) {
    toast(error.name === 'AbortError' ? '下载超时，请稍后重试。' : `参考文献下载失败：${error.message}`);
  } finally {
    window.clearTimeout(timeout);
    button.disabled = false;
    button.removeAttribute('aria-busy');
    button.innerHTML = original;
  }
});
