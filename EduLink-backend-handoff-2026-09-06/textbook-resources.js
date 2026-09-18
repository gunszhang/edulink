/* Textbook resource gallery for the resource-navigation workspace. */
(() => {
  "use strict";

  const TEXTBOOKS = [
    ["小学数学", "一年级数学上册", "2024秋版"],
    ["小学数学", "一年级数学下册", "2025春版"],
    ["小学数学", "二年级数学上册", "2025秋版"],
    ["小学数学", "二年级数学下册", "2026春版"],
    ["小学数学", "三年级数学上册", "2025秋版"],
    ["小学数学", "三年级数学下册", "2026春版"],
    ["小学数学", "四年级数学上册", "2026秋版"],
    ["小学数学", "四年级数学下册", "2026春版"],
    ["小学数学", "五年级数学上册", "2026秋版"],
    ["小学数学", "五年级数学下册", "2026春版"],
    ["小学数学", "六年级数学上册", "2026秋版"],
    ["小学数学", "六年级数学下册", "2026春版"],
    ["小学语文", "一年级语文上册", "2024秋版"],
    ["小学语文", "一年级语文下册", "2025春版"],
    ["小学语文", "二年级语文上册", "2025秋版"],
    ["小学语文", "二年级语文下册", "2026春版"],
    ["小学语文", "三年级语文上册", "2025秋版"],
    ["小学语文", "三年级语文下册", "2026春版"],
    ["小学语文", "四年级语文上册", "2026秋版"],
    ["小学语文", "四年级语文下册", "2026春版"],
    ["小学语文", "五年级语文上册", "2026秋版"],
    ["小学语文", "五年级语文下册", "2026春版"],
    ["小学语文", "六年级语文上册", "2026秋版"],
    ["小学语文", "六年级语文下册", "2026春版"]
  ].map(([subject, title, edition]) => ({
    subject,
    title,
    edition,
    file: `${title}（${edition}）.jpg`,
    path: `./assets/textbooks/${encodeURIComponent(subject)}/${encodeURIComponent(`${title}（${edition}）.jpg`)}`
  }));

  const escapeHtml = (value) => String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

  const icon = (name) => `<i data-lucide="${escapeHtml(name)}" aria-hidden="true"></i>`;

  function renderGroup(subject, items, query) {
    const filtered = items.filter((item) => {
      const haystack = `${item.subject} ${item.title} ${item.edition}`.toLowerCase();
      return !query || haystack.includes(query.toLowerCase());
    });
    if (!filtered.length) return "";
    const label = subject === "小学数学" ? "探索数学世界，培养逻辑思维" : "积累语言经验，发展阅读表达";
    return `<section class="textbook-resource-group" data-textbook-group="${escapeHtml(subject)}">
      <header class="textbook-group-head"><div><span class="textbook-group-icon">${icon(subject === "小学数学" ? "sigma" : "book-open-text")}</span><div><h3>${escapeHtml(subject)}</h3><small>${escapeHtml(label)}</small></div></div><b>${filtered.length} 本</b></header>
      <div class="textbook-card-grid">${filtered.map((item) => `<article class="textbook-card" data-textbook-card data-subject="${escapeHtml(item.subject)}" data-title="${escapeHtml(`${item.title} ${item.edition}`)}">
        <a href="${escapeHtml(item.path)}" target="_blank" rel="noopener noreferrer" title="查看${escapeHtml(item.title)}封面">
          <figure><img src="${escapeHtml(item.path)}" alt="${escapeHtml(item.title)}（${escapeHtml(item.edition)}）封面" loading="lazy" /><span>${icon("external-link")}</span></figure>
          <div class="textbook-card-copy"><h4>${escapeHtml(item.title)}</h4><p>（${escapeHtml(item.edition)}）</p><small>${escapeHtml(item.subject)} · 教材封面</small></div>
        </a>
      </article>`).join("")}</div>
    </section>`;
  }

  function renderGallery(query = "", subject = "all") {
    const host = document.querySelector("#textbook-resource-groups");
    if (!host) return;
    const subjects = subject === "all" ? ["小学数学", "小学语文"] : [subject];
    const groups = subjects
      .map((groupSubject) => renderGroup(groupSubject, TEXTBOOKS.filter((item) => item.subject === groupSubject), query))
      .filter(Boolean);
    host.innerHTML = groups.join("") || `<div class="textbook-resource-empty">${icon("search-x")}<b>没有匹配的教材</b><span>请更换书名或清除搜索条件。</span></div>`;
    const normalizedQuery = query.toLowerCase();
    const count = TEXTBOOKS.filter((item) => {
      const subjectMatches = subject === "all" || item.subject === subject;
      const queryMatches = !normalizedQuery || `${item.subject} ${item.title} ${item.edition}`.toLowerCase().includes(normalizedQuery);
      return subjectMatches && queryMatches;
    }).length;
    const countNode = document.querySelector("#textbook-resource-count");
    if (countNode) countNode.textContent = `${count} 本教材`;
    if (window.lucide?.createIcons) window.lucide.createIcons();
  }

  function mount() {
    const resourcePanel = document.querySelector('[data-workspace-panel="resource-navigation"]');
    if (!resourcePanel || resourcePanel.querySelector(".textbook-resource-panel")) return;
    const section = document.createElement("section");
    section.className = "resource-hub-panel textbook-resource-panel";
    section.setAttribute("aria-labelledby", "textbook-resource-title");
    section.innerHTML = `<div class="resource-hub-head textbook-resource-head"><div><p class="kicker">TEXTBOOK RESOURCE HUB</p><h2 id="textbook-resource-title">教材资源</h2><span>按学科浏览小学数学与小学语文教材封面，书名与版本一一对应。</span></div><div class="textbook-resource-count" id="textbook-resource-count">24 本教材</div></div>
      <div class="textbook-resource-toolbar"><div class="textbook-resource-filters" role="tablist" aria-label="教材学科筛选"><button class="active" type="button" role="tab" aria-selected="true" data-textbook-filter="all">全部教材</button><button type="button" role="tab" aria-selected="false" data-textbook-filter="小学数学">小学数学</button><button type="button" role="tab" aria-selected="false" data-textbook-filter="小学语文">小学语文</button></div><label class="textbook-resource-search">${icon("search")}<input id="textbook-resource-query" type="search" placeholder="搜索书名或版本" aria-label="搜索教材" /></label></div>
      <div id="textbook-resource-groups" class="textbook-resource-groups"></div>`;
    const anchor = resourcePanel.querySelector(".resource-navigation-grid");
    resourcePanel.insertBefore(section, anchor || resourcePanel.firstChild);

    const query = section.querySelector("#textbook-resource-query");
    const filters = section.querySelector(".textbook-resource-filters");
    let activeSubject = "all";
    const applyFilter = () => {
      const text = String(query?.value || "").trim();
      renderGallery(text, activeSubject);
    };
    filters?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-textbook-filter]");
      if (!button) return;
      activeSubject = button.dataset.textbookFilter || "all";
      filters.querySelectorAll("[data-textbook-filter]").forEach((item) => {
        const selected = item === button;
        item.classList.toggle("active", selected);
        item.setAttribute("aria-selected", String(selected));
      });
      applyFilter();
    });
    query?.addEventListener("input", applyFilter);
    renderGallery("", activeSubject);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount, { once: true });
  else mount();
  window.addEventListener("edulink:workspace-ready", mount);
})();
