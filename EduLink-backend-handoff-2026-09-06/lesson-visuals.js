/* Backend-backed board assets; never send the image provider key to browsers. */
const sixArtsVisualBlobs = new Map();
const sixArtsVisualHydrated = new WeakSet();

function sixArtsVisualContextKey() {
  const form = assistantState.sixarts.form || getSixArtsFormData();
  return JSON.stringify([form.title, form.subject, form.grade, form.term]);
}

function sixArtsVisualState() {
  const key = sixArtsVisualContextKey();
  if (assistantState.sixarts.lessonVisuals?.key !== key) assistantState.sixarts.lessonVisuals = { key, board: null };
  const state = assistantState.sixarts.lessonVisuals;
  if (!sixArtsVisualHydrated.has(state)) {
    sixArtsVisualHydrated.add(state);
    if (state.board?.status === 'loading') state.board = null;
  }
  return state;
}

async function sixArtsVisualFetch(path, options = {}) {
  if (!EDULINK_RAG_CONFIG.token) throw new Error('请先配置后端访问令牌。');
  const response = await fetch(`${EDULINK_RAG_CONFIG.baseUrl}${path}`, { ...options, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${EDULINK_RAG_CONFIG.token}`, ...options.headers }, signal: AbortSignal.timeout(30000) });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `图片请求失败（${response.status}）`);
  }
  return response;
}

async function sixArtsVisualBlob(id) {
  if (!sixArtsVisualBlobs.has(id)) {
    const promise = sixArtsVisualFetch(`/api/sixarts/visuals/images/${encodeURIComponent(id)}`)
      .then(response => response.blob()).then(blob => ({ blob, url: URL.createObjectURL(blob) }))
      .catch(error => { sixArtsVisualBlobs.delete(id); throw error; });
    sixArtsVisualBlobs.set(id, promise);
  }
  return sixArtsVisualBlobs.get(id);
}

function renderSixArtsBoard() {
  let panel = document.getElementById('sixarts-board-panel');
  if (!panel) {
    panel = document.createElement('section');
    panel.id = 'sixarts-board-panel';
    panel.className = 'sixarts-board-panel';
    document.getElementById('sixarts-process-output')?.after(panel);
  }
  const state = sixArtsVisualState();
  const card = (kind, title) => {
    const result = state[kind];
    const pending = ['queued', 'generating', 'loading'].includes(result?.status);
    const pictures = result?.images || [];
    return `<article class="lesson-visual-card"><header><div><span class="lesson-visual-kicker">${kind === 'board' ? 'BLACKBOARD DESIGN' : 'TEACHING VISUAL'}</span><h3>${title}</h3></div><span class="lesson-visual-origin">${result?.origin === 'sample' ? 'Word 原样例' : result?.origin === 'generated' ? 'image2 生成' : '按课题匹配'}</span></header>
      ${pictures.map(image => `<figure><img data-lesson-visual-image="${escapeHtml(image.id)}" alt="${escapeHtml(image.title)}"><figcaption>${escapeHtml(image.source_file || image.source || '')}${image.source_paragraph ? ` · 第 ${image.source_paragraph} 段` : ''}<button type="button" data-lesson-image-download="${escapeHtml(image.id)}" data-image-title="${escapeHtml(image.title)}">下载图片</button></figcaption></figure>`).join('')}
      ${pending ? '<div class="lesson-visual-progress" role="status"><span></span>正在准备本课图片，您可以继续查看或修改教案…</div>' : ''}
      ${result?.status === 'failed' ? `<p class="lesson-visual-error" role="alert">${escapeHtml(result.message || '图片暂不可用，请重试')}</p>` : ''}
      ${!pictures.length && !pending && result?.status !== 'failed' ? `<p class="lesson-visual-empty">${kind === 'board' ? '优先使用相同课题的板书原图；没有样例时，根据本课教案生成板书。' : '可按教学需要生成情境图、操作示意图或课文关系图。'}</p>` : ''}
      <button type="button" class="lesson-visual-action" data-lesson-visual-create="${kind}" ${pending ? 'disabled' : ''}>${result?.status === 'failed' ? '重试' : pictures.length ? '重新获取' : kind === 'board' ? '获取本课板书' : '生成教学配图'}</button>
    </article>`;
  };
  panel.innerHTML = `<div class="lesson-visual-heading"><div><span>课堂视觉支持</span><h2>板书设计</h2></div><p>围绕《${escapeHtml(String((assistantState.sixarts.form || {}).title || '本课').replace(/[《》]/g, ''))}》，让知识结构看得见。</p></div>${card('board', '板书')}`;
  panel.querySelectorAll('[data-lesson-visual-image]').forEach(async image => {
    try { const asset = await sixArtsVisualBlob(image.dataset.lessonVisualImage); if (image.isConnected) image.src = asset.url; }
    catch { if (image.isConnected) image.alt += '（加载失败，请重新获取）'; }
  });
  if (!state.board) void requestSixArtsVisual('board', !assistantState.sixarts.generated);
  else if (['queued', 'generating'].includes(state.board.status)) void pollSixArtsVisual(state, 'board', state.board.id);
}

const sixArtsVisualPolls = new Set();
async function pollSixArtsVisual(snapshot, kind, jobId) {
  if (!jobId || sixArtsVisualPolls.has(jobId)) return;
  sixArtsVisualPolls.add(jobId);
  try {
    for (let attempt = 0; attempt < 180; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      if (assistantState.sixarts.lessonVisuals !== snapshot) return;
      const result = await (await sixArtsVisualFetch(`/api/sixarts/visuals/jobs/${jobId}`)).json();
      snapshot[kind] = result;
      if (['ready', 'failed'].includes(result.status)) { scheduleWorkspaceSave(); renderSixArtsBoard(); return; }
    }
    throw new Error('图片生成等待超时，可稍后重新获取');
  } catch (error) {
    snapshot[kind] = { status: 'failed', message: error.message };
    if (assistantState.sixarts.lessonVisuals === snapshot) { scheduleWorkspaceSave(); renderSixArtsBoard(); }
  } finally { sixArtsVisualPolls.delete(jobId); }
}

async function requestSixArtsVisual(kind, lookupOnly = false) {
  if (kind !== 'board') return;
  const snapshot = sixArtsVisualState();
  if (['queued', 'generating', 'loading'].includes(snapshot[kind]?.status)) return;
  const context = assistantState.sixarts.form || getSixArtsFormData();
  snapshot[kind] = { status: 'loading', images: [] };
  renderSixArtsBoard();
  try {
    const content = `课题：${context.title}\n概述：${context.summary || ''}\n要求：${context.requirement || ''}\n` + buildSixArtsPlanText().slice(0, 14000);
    const result = await (await sixArtsVisualFetch('/api/sixarts/visuals', { method: 'POST', body: JSON.stringify({ title: context.title, subject: context.subject, grade: context.grade, term: context.term || '', kind, lesson_content: content.slice(0, 18000), lookup_only: lookupOnly }) })).json();
    snapshot[kind] = result;
    if (assistantState.sixarts.lessonVisuals === snapshot) { scheduleWorkspaceSave(); renderSixArtsBoard(); }
    if (['queued', 'generating'].includes(result.status)) void pollSixArtsVisual(snapshot, kind, result.id);
  } catch (error) {
    snapshot[kind] = { status: 'failed', message: error.message };
    if (assistantState.sixarts.lessonVisuals === snapshot) { scheduleWorkspaceSave(); renderSixArtsBoard(); }
  }
}

async function collectSixArtsVisualAssets() {
  const state = sixArtsVisualState();
  const images = state.board?.images || [];
  const assets = [];
  for (const image of images) {
    const { blob } = await sixArtsVisualBlob(image.id);
    const data = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(blob); });
    const bitmap = await createImageBitmap(blob);
    assets.push({ ...image, data, width: bitmap.width, height: bitmap.height, extension: blob.type.includes('jpeg') ? 'jpg' : blob.type.includes('webp') ? 'webp' : 'png' });
    bitmap.close();
  }
  return assets;
}

function sixArtsVisualExportNotice() {
  const state = sixArtsVisualState();
  return state.board && state.board.status !== 'ready' ? `板书：${state.board.status === 'failed' ? state.board.message : '图片尚未生成完成，可完成后再次导出。'}` : '';
}

async function exportSixArtsMarkdownWithImages() {
  try {
    const text = buildSixArtsPlanText();
    const assets = await collectSixArtsVisualAssets();
    const visuals = assets.map(asset => `### ${asset.title}\n\n来源：${asset.source_file || asset.source}\n\n![${asset.title}](${asset.data})`).join('\n\n');
    downloadText('六艺融合教案.md', `${text}\n\n## 板书设计\n\n${visuals}\n\n${sixArtsVisualExportNotice()}`);
  } catch (error) { toast(`图片导出失败：${error.message}。请重新获取图片后再试。`); }
}

function sixArtsDocxVisuals(zip, assets) {
  let body = '', relationships = '';
  for (const [index, asset] of assets.entries()) {
    const id = `rIdLessonVisual${index + 1}`;
    const filename = `lesson-visual-${index + 1}.${asset.extension}`;
    zip.folder('word/media').file(filename, asset.data.split(',')[1], { base64: true });
    relationships += `<Relationship Id="${id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${filename}"/>`;
    const scale = Math.min(5600000 / asset.width, 7300000 / asset.height);
    const cx = Math.round(asset.width * scale), cy = Math.round(asset.height * scale);
    body += buildDocxParagraph(asset.title, 'Heading2') + buildDocxParagraph(`来源：${asset.source_file || asset.source}`);
    body += `<w:p><w:r><w:drawing><wp:inline xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/><wp:docPr id="${index + 1}" name="${xmlEscape(asset.title)}"/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="0" name="${filename}"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:embed="${id}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`;
  }
  return { body: assets.length ? buildDocxParagraph('板书设计', 'Heading1') + body : '', relationships };
}

document.addEventListener('click', async event => {
  const create = event.target.closest('[data-lesson-visual-create]');
  if (create) { void requestSixArtsVisual(create.dataset.lessonVisualCreate); return; }
  const download = event.target.closest('[data-lesson-image-download]');
  if (!download) return;
  try {
    const asset = await sixArtsVisualBlob(download.dataset.lessonImageDownload);
    const a = document.createElement('a'); a.href = asset.url; a.download = download.dataset.imageTitle + (asset.blob.type.includes('jpeg') ? '.jpg' : '.png'); a.click();
  } catch (error) { toast(error.message); }
});
