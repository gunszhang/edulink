const sampleTranscript = `00:10:30 师：今天我们来玩数数大比拼。蓝队数左边，红队数右边，比比哪队数得又快又准。
00:12:35 生1：不公平，红队的都是用包装装的，我们却是散的。
00:12:42 师：为什么不公平？
00:12:48 生2：红队的很整齐，我们蓝队的很零散。
00:13:05 师：装起来的一盒是多少个？
00:13:12 生：（齐）10 个。
00:13:18 师：一盒鸡蛋 10 个，一盒彩笔 10 个，一袋糖也是 10 个。
00:15:22 师：看，盒子里有几瓶牛奶？
00:15:25 生：（齐）九瓶。
00:18:30 师：一个圆片代表一瓶牛奶，你可以在魔力板上数一数，说说 13 是怎么来的。
00:19:20 生3：我是这样算的，这里有 9 瓶牛奶，移 1 瓶过来等于 10 瓶牛奶，10 加 3 等于 13。
00:22:30 师：为什么 4 里面拿出的是 1 瓶，而不是 2 瓶、3 瓶呢？
00:22:48 生4：因为 9 只差 1 就变成 10。
00:23:10 师：你发现了 9 和 1 的关系，这很关键。谁能再完整说一遍？
00:24:50 师：那 9+8 呢？我们还可以怎么凑十？
00:25:05 生5：从 8 里面拿 1 给 9，变成 10 加 7。
00:27:20 师：观察 9+2=11，9+3=12，9+4=13，你有什么发现？
00:27:42 生6：得数个位都比后面的数少 1。
00:28:00 师：这个 1 跑哪里去了？
00:28:08 生7：跑去跟 9 凑成 10 了。
00:33:10 师：以后遇到 8 加几、7 加几，也可以想办法先凑成 10。`;

const theoryRules = [
  {
    name: "建构主义学习理论",
    category: "教育心理学 → 学习理论",
    keys: ["自己", "探究", "发现", "问题", "经验", "想法", "理由", "怎么做"],
    mechanisms: ["自主探究", "经验激活", "意义建构"],
    insight: "学生基于已有经验，在问题解决、表达与协商中主动建构新知识。",
    gap: "若主要由教师讲解结论，学生的主动建构过程仍不充分。",
    improvement: "把结论前移为学生任务，让学生先尝试、表达、比较，再由教师组织概括。",
    teacherTalk: "先不要急着给答案，请用自己的方法试一试，再说说你为什么这样想。"
  },
  {
    name: "认知冲突教学理论",
    category: "教育心理学 → 概念转变",
    keys: ["不公平", "不同意", "矛盾", "疑惑", "错误", "摇头", "质疑", "纠正"],
    mechanisms: ["认知冲突", "观点辨析", "概念修正"],
    insight: "通过暴露原有认识与新事实之间的不一致，引发学生调整认知结构。",
    gap: "冲突若由教师直接化解，学生可能只看到现象而没有完成观点重建。",
    improvement: "保留分歧并组织学生举证，让不同观点在比较中完成概念修正。",
    teacherTalk: "现在出现了两种不同看法，先各自找证据，看看哪一种能解释所有情况。"
  },
  {
    name: "情境认知理论",
    category: "教育心理学 → 情境学习",
    keys: ["生活", "游戏", "比赛", "土地", "牛奶", "鸡蛋", "数学书", "古埃及", "问题情境"],
    mechanisms: ["情境创设", "生活联结", "任务驱动"],
    insight: "知识被置于具有意义的真实或拟真任务中，学生在应用情境里理解概念。",
    gap: "情境如果只承担吸引注意的功能，而未持续支撑核心问题，容易停留在表层。",
    improvement: "让同一情境贯穿问题提出、方法检验和迁移应用，而不是只用于导入。",
    teacherTalk: "回到刚才的真实问题，我们的新方法解决了什么，为什么更有效？"
  },
  {
    name: "教学对话理论（IRF）",
    category: "课堂与班级管理 → 课堂话语",
    keys: ["谁能", "你说", "回答", "说一说", "同意吗", "为什么", "再说", "补充"],
    mechanisms: ["课堂提问", "追问反馈", "对话推进"],
    insight: "教师发起、学生回应和教师反馈构成互动链，反馈质量决定思维能否继续推进。",
    gap: "连续师问生答可能形成教师中心的单向对话，学生之间缺少回应与协商。",
    improvement: "把部分反馈权交给学生，增加学生复述、追问、补充和反驳同伴观点。",
    teacherTalk: "先不由老师评价，谁能复述他的想法，再提出一个追问或补充？"
  },
  {
    name: "苏格拉底式问答法",
    category: "学科教学法 → 启发式教学",
    keys: ["为什么", "怎么来的", "依据", "理由", "哪里", "如果", "还能", "究竟"],
    mechanisms: ["深度追问", "理由解释", "假设检验"],
    insight: "连续而有逻辑的追问促使学生澄清概念、检验依据并显化推理过程。",
    gap: "追问过密或教师预设答案过强，会把探究变成猜教师意图。",
    improvement: "在关键追问后增加独立思考和同伴讨论，并接纳多种可论证的路径。",
    teacherTalk: "你的结论依据是什么？如果换一种情况，它还成立吗？"
  },
  {
    name: "等待时间理论",
    category: "课堂与班级管理 → 课堂提问",
    keys: ["想一想", "静静思考", "不急", "等待", "停顿", "先思考", "分钟", "最后"],
    mechanisms: ["独立思考", "等待时间", "全员参与"],
    insight: "开放问题后的适度等待能提升回答长度、复杂度，并扩大参与学生范围。",
    gap: "逐字稿若没有停顿或时间标记，只能确认提问存在，不能判断真实等待时长。",
    improvement: "开放问题后明确保留3至5秒，先独立思考或书写，再邀请不同层次学生表达。",
    teacherTalk: "先不举手，给每个人五秒钟想一想，把你的理由组织完整。"
  },
  {
    name: "数学表征理论",
    category: "学科教学理论 → 数学教学",
    keys: ["实物", "学具", "圆片", "魔力板", "图", "画", "算式", "公式", "符号", "字母", "摆", "移", "拼", "剪", "折"],
    mechanisms: ["操作表征", "图形表征", "符号表征", "表征转换"],
    insight: "实物、动作、图形、语言与符号之间的双向转换，使抽象关系变得可观察、可操作、可表达。",
    gap: "若只从操作单向走向算式，学生可能会做动作，却不能逆向解释符号含义。",
    improvement: "增加算式到图示、图示到操作的逆向表征任务，并要求学生解释对应关系。",
    teacherTalk: "如果只有这个算式，你能把刚才移动、拼接或观察的过程画出来吗？"
  },
  {
    name: "皮亚杰认知发展理论",
    category: "教育心理学 → 认知发展",
    keys: ["动手", "学具", "实物", "摸", "摆", "拼", "剪", "折", "操作", "具体"],
    mechanisms: ["具体操作", "动作内化", "认知适配"],
    insight: "具体材料和动作经验为抽象概念提供认知支架，尤其适合儿童由直观思维走向逻辑思维。",
    gap: "学具活动若缺少语言概括和符号记录，动作经验难以稳定内化。",
    improvement: "每次操作后安排说理、画图或符号记录，完成动作到表象再到抽象的过渡。",
    teacherTalk: "你刚才手上做了什么？请把这个动作先说清楚，再用图或式子记录下来。"
  },
  {
    name: "布鲁纳发现学习理论",
    category: "教育心理学 → 发现学习",
    keys: ["观察", "发现", "规律", "归纳", "分类", "联系", "推理", "比较"],
    mechanisms: ["比较观察", "规律发现", "结构归纳"],
    insight: "学生通过操作、比较多个案例和组织信息，主动发现概念关系并形成知识结构。",
    gap: "如果规律完全由教师提示，学生只是跟随得出结论，发现过程不完整。",
    improvement: "提供正例、变式和反例，让学生提出猜想、验证范围并用完整语言归纳。",
    teacherTalk: "比较这些例子，你先提出一个猜想，再找一个新例子验证它是否总成立。"
  },
  {
    name: "学习迁移理论",
    category: "教育心理学 → 学习迁移",
    keys: ["以后", "应用", "迁移", "类似", "其他", "还能", "继续", "新问题", "解决"],
    mechanisms: ["方法迁移", "变式应用", "新情境检验"],
    insight: "学生把课堂形成的方法和结构应用到新问题，说明知识正在从单一任务走向可迁移策略。",
    gap: "教师口头提示可以迁移，不等于学生已经能够独立识别和应用方法。",
    improvement: "设计条件变化、表征变化或逆向问题，让学生独立判断是否以及如何迁移。",
    teacherTalk: "现在换一个条件，这个方法还能用吗？请先判断，再说明需要调整什么。"
  },
  {
    name: "形成性评价理论",
    category: "教育评价 → 过程性评价",
    keys: ["很好", "真棒", "关键", "谢谢", "纠正", "提醒", "有道理", "说得", "评价", "掌声"],
    mechanisms: ["即时反馈", "描述性评价", "学习调节"],
    insight: "课堂中的即时反馈帮助学生识别当前表现、理解成功标准并调整后续学习。",
    gap: "仅有即时表扬或对错判断时，反馈未必指出好在哪里、下一步如何改进。",
    improvement: "把笼统表扬改为描述性反馈，明确指出有效策略、证据质量和下一步目标。",
    teacherTalk: "你把两个量之间的关系说清楚了，这是有效的；下一步请补上你的依据。"
  },
  {
    name: "社会互动学习理论",
    category: "教育心理学 → 社会文化理论",
    keys: ["小组", "同桌", "合作", "交流", "讨论", "互相", "汇报", "补充", "同伴"],
    mechanisms: ["同伴协作", "语言外化", "社会协商"],
    insight: "学生通过同伴交流、分工协作和公开论证，把个体想法转化为可讨论的共同知识。",
    gap: "只有活动形式而没有观点差异、互相回应或共同产出时，合作可能流于表面。",
    improvement: "为小组设置明确角色、共同产出和观点比较任务，并要求汇报协商过程。",
    teacherTalk: "小组先形成一个共同结论，同时保留不同意见，汇报时说明你们怎样达成一致。"
  },
  {
    name: "变式教学理论",
    category: "数学学科教学理论 → 变式教学",
    keys: ["练习", "变式", "换", "不同", "剩下", "另一种", "其他方法", "举例", "验证"],
    mechanisms: ["条件变式", "表征变式", "概念辨析"],
    insight: "通过改变非本质属性并保持核心关系，帮助学生区分概念本质与表面特征。",
    gap: "重复同型练习只能强化程序，不能证明学生识别了结构和适用边界。",
    improvement: "增加条件变化、反例、错例和逆向任务，要求学生解释不变关系。",
    teacherTalk: "这道题哪里变了，哪里没有变？原来的方法为什么仍然成立或不再成立？"
  }
];

const state = {
  analysis: null,
  report: "",
  reflection: "",
  search: "",
  trendPeriod: "all",
  currentView: "observe",
  currentSection: "observe-overview",
  observationSource: "none",
  observationAnalyzedTranscript: "",
  restoring: false
};

const workspaceHistoryState = { back: [], forward: [] };

function syncWorkspaceHistoryControls() {
  $("#workspace-history-back")?.toggleAttribute("disabled", workspaceHistoryState.back.length === 0);
  $("#workspace-history-forward")?.toggleAttribute("disabled", workspaceHistoryState.forward.length === 0);
}

function navigateWorkspaceHistory(direction) {
  const source = direction === "back" ? workspaceHistoryState.back : workspaceHistoryState.forward;
  const target = direction === "back" ? workspaceHistoryState.forward : workspaceHistoryState.back;
  const next = source.pop();
  if (!next || !workspaceSections[next]) {
    syncWorkspaceHistoryControls();
    return;
  }
  if (state.currentSection && state.currentSection !== next) target.push(state.currentSection);
  setWorkspaceSection(next, { fromHistory: true, keepScroll: true });
  syncWorkspaceHistoryControls();
}

const reflectionTheoryCatalog = [
  { name: "教学过程最优化理论", group: "教育学与教学论", score: 96, core: "课堂时间与活动资源应围绕核心目标配置，优先保障最能促进概念理解的学习任务。", mechanism: "目标优先、时间配置、过程调节", action: "为探究、讨论、汇报和教师总结设置明确时间节点，压缩重复汇报，为概念深化与迁移应用保留时间。" },
  { name: "认知冲突教学理论", group: "教育心理学", score: 94, core: "通过反例、比较与追问暴露原有认识的局限，推动学生完成概念重构。", mechanism: "冲突暴露、证据比较、概念重构", action: "增加极端数据、反例和连续追问，让学生由关注单个数据转向理解整体代表性。" },
  { name: "差异化教学理论", group: "课程与教学", score: 92, core: "根据学生准备状态与表达特点提供不同层次的任务、支架和展示机会。", mechanism: "分层任务、适切支架、机会公平", action: "设置分层提问、异质分组和多种展示方式，为基础薄弱及较少发言学生提供可完成的表达任务。" },
  { name: "合作学习理论", group: "教育心理学", score: 89, core: "高质量合作需要明确角色、共同产出、观点比较和个体责任。", mechanism: "角色分工、共同产出、同伴互证", action: "采用记录员、解释员、质疑员等角色，并要求小组汇报观点如何形成以及如何处理分歧。" },
  { name: "RME现实数学教育", group: "数学学科教学", score: 87, core: "从真实、可理解的现实问题出发，让学生经历数学化并用数学支持判断和决策。", mechanism: "真实情境、水平数学化、数据决策", action: "把生活举例升级为真实数据任务，让学生经历收集、比较、计算、解释与决策。" },
  { name: "形成性评价理论", group: "教育评价", score: 85, core: "评价嵌入学习过程，通过持续获取证据、反馈与调整缩小学习差距。", mechanism: "证据采集、描述反馈、即时调节", action: "为关键目标设置出口条、解释任务和同伴互评，并依据学生回答即时调整支架。" },
  { name: "脚手架教学理论", group: "教育心理学", score: 83, core: "通过递进支持帮助学生完成暂时无法独立完成的任务，并随能力增长逐步撤除支架。", mechanism: "支架搭建、逐步撤除、独立完成", action: "从操作、图示、语言到符号表达逐级提供支架，并记录学生能否脱离支架独立解释。" },
  { name: "数学表征理论", group: "数学学科教学", score: 81, core: "实物、动作、图形、语言和符号的双向转换帮助学生理解抽象数学关系。", mechanism: "多元表征、双向转换、意义联结", action: "增加操作到图示、图示到算式及算式反向解释操作意义的任务。" }
];

const reflectionState = {
  schemaVersion: 2,
  fileName: "",
  outputType: "reflection",
  selectedTheories: ["教学过程最优化理论", "认知冲突教学理论", "差异化教学理论", "RME现实数学教育"],
  recommendedTheories: [],
  activeTheory: "教学过程最优化理论",
  diagnoses: [],
  actions: [],
  diagnosisData: null,
  actionsData: null,
  profileData: null,
  diagnosedObservationTranscript: "",
  diagnosticReady: false,
  actionReady: false,
  rounds: [
    { round: 1, date: "2026-05-18", label: "初始实践", score: 62, status: "已完成", problems: ["探究环节耗时较长", "学生参与不均衡", "生活联结停留在举例"], strategy: "明确核心问题，记录课堂时间与参与分布。", result: "形成初始问题基线。" },
    { round: 2, date: "2026-06-02", label: "改进验证", score: 76, status: "当前轮", problems: ["概念追问仍可深入", "基础薄弱学生展示不足"], strategy: "压缩重复汇报，增加分层提问和小组角色。", result: "课堂节奏改善，参与范围扩大。" },
    { round: 3, date: "待实施", label: "持续优化", score: null, status: "待验证", problems: ["真实数据决策任务的迁移效果"], strategy: "增加极端数据、反例与真实决策任务。", result: "等待下一轮课堂证据。" }
  ],
  metadataRequestId: 0,
  metadataTimer: null,
  metadataProjectTouched: false,
  metadataLessonTouched: false,
  diagnosisRequestId: 0,
  diagnosisController: null,
  actionsRequestId: 0,
  actionsController: null,
  outcomeRequestId: 0,
  outcomeController: null,
  profileRequestId: 0,
  profileController: null,
  lastAutoProject: "",
  lastAutoLesson: "",
  pending: { diagnose: false, actions: false, outcome: false, profile: false },
  usedModel: false,
  warning: "",
  references: [],
  selectedTheoryProfiles: [],
  growthProfile: null
};

function resetReflectionAnalysisState({ preserveTheorySelection = false, clearOutcome = false } = {}) {
  ["diagnosisController", "actionsController", "outcomeController", "profileController"].forEach((key) => {
    if (typeof reflectionState[key]?.abort === "function") reflectionState[key].abort();
    reflectionState[key] = null;
  });
  ["diagnosisRequestId", "actionsRequestId", "outcomeRequestId", "profileRequestId", "metadataRequestId"].forEach((key) => {
    reflectionState[key] = Number(reflectionState[key] || 0) + 1;
  });
  const selected = preserveTheorySelection ? reflectionState.selectedTheories : [];
  Object.assign(reflectionState, {
    selectedTheories: Array.isArray(selected) ? selected.filter(Boolean) : [],
    recommendedTheories: [],
    selectedTheoryProfiles: [],
    activeTheory: selected?.[0] || "教学过程最优化理论",
    diagnoses: [], actions: [], diagnosisData: null, actionsData: null,
    profileData: null, references: [], diagnosedObservationTranscript: "",
    diagnosticReady: false, actionReady: false, usedModel: false, warning: "",
    pending: { diagnose: false, actions: false, outcome: false, profile: false }
  });
  if (clearOutcome) {
    state.reflection = "";
    if (els.reflection) els.reflection.value = "";
  }
  ["#run-reflection-analysis", "#regenerate-reflection-actions", "#generate-reflection"].forEach((selector) => {
    const button = $(selector);
    if (button) button.disabled = false;
  });
}

const STORAGE_KEY = "edulink-classroom-workspace-v3";
const AUTH_KEY = "edulink-user-session-v1";
const PROFILE_KEY = "edulink-user-profile-v1";
const ACCOUNTS_KEY = "edulink-local-accounts-v1";
const CUSTOM_THEORIES_KEY = "edulink-custom-theories-v1";
const TRAINING_CLIENT_ID_KEY = "edulink-theory-training-client-v1";
const WORKSPACE_GUIDE_SEEN_KEY = "edulink-workspace-guide-seen-v2";
const WORKSPACE_GUIDE_AUTO_KEY = "edulink-workspace-guide-auto-v1";
const RENDER_QUALITY_KEY = "edulink-render-quality-v1";
const POINTER_GLASS_KEY = "edulink-pointer-glass-v1";
// Increment this when source-backed lesson content is replaced. It lets an
// existing browser workspace discard only the stale generated copy once.
const SIXARTS_SOURCE_CONTENT_REVISION = "20260913-circle-concise-template-v1";
const CLOUD_DRIVE_KEY = "edulink-cloud-drive-v1";
const WORKSPACE_FONT_SCALE_KEY = "edulink-workspace-font-scale-v1";
const WORKSPACE_LOCAL_FONT_KEY = "edulink-workspace-local-fonts-v1";
const WORKSPACE_LOCAL_BOX_KEY = "edulink-workspace-local-boxes-v1";
const WORKSPACE_DEVICE_KEY = "edulink-workspace-font-device-v1";
const WORKSPACE_EDITOR_POSITION_KEY = "edulink-workspace-editor-position-v1";
const DEFAULT_AVATAR = "./assets/default-avatar.svg";
const FEMALE_GUIDE_MENTOR = "./assets/nav-mentor-female.png?v=20260830-mentor-v2";
const MALE_GUIDE_MENTOR = "./assets/nav-mentor-male.png?v=20260830-mentor-v2";

// A deployment can inject the public backend URL before this script loads.
// The model relay key remains server-side; this token only protects EduLink's
// own browser-to-backend API during the current deployment.
const pageHost = window.location.hostname;
const isPrivateNetworkHost = /^(10\.|192\.168\.|172\.(?:1[6-9]|2\d|3[0-1])\.)/.test(pageHost);
const LOCAL_RAG_BASE_URL = ["localhost", "127.0.0.1"].includes(pageHost) || isPrivateNetworkHost
  ? `http://${pageHost}:8000`
  : "";
const EDULINK_RAG_CONFIG = Object.freeze({
  baseUrl: (window.EDULINK_RAG_CONFIG?.baseUrl || LOCAL_RAG_BASE_URL).replace(/\/+$/, ""),
  token: window.EDULINK_RAG_CONFIG?.token || "",
  topK: 6,
  timeoutMs: 180000
});
const THEORY_STREAM_MAX_ATTEMPTS = 8;
const THEORY_STREAM_RETRY_DELAYS_MS = Object.freeze([1200, 2000, 3000, 4500, 6000, 8000, 10000]);
const OBSERVATION_MAX_TEXT_CHARS = 120000;
const REFLECTION_MAX_TEXT_CHARS = 80000;
const WORKSPACE_FONT_PROFILE = Object.freeze({
  minScale: 0.8,
  maxScale: 1.8,
  defaultScale: 1,
  desktopFloorPx: 15,
  twoKFloorPx: 17,
  fourKFloorPx: 19
});
let workspaceFontScaleDraft = null;
const workspaceLocalFontState = {
  active: false,
  mode: "text",
  target: null,
  boxTarget: null,
  selector: "",
  boxSelector: "",
  storageKey: "",
  boxStorageKey: "",
  fragment: null,
  suppressClickUntil: 0,
  baseFontSize: 15,
  baseHeight: 0,
  textWeight: 400,
  textLineHeight: 140,
  textLetterSpacing: 0,
  boxFill: "#ffffff",
  boxBorder: "#d9d2ef",
  boxRadius: 24,
  boxOpacity: 100,
  boxBorderWidth: 1,
  boxShadow: 0,
  boxFillChanged: false,
  boxBorderChanged: false,
  boxRadiusChanged: false,
  boxOpacityChanged: false,
  boxBorderWidthChanged: false,
  boxShadowChanged: false,
  dragging: false
};

const authState = {
  user: null,
  draftAvatar: DEFAULT_AVATAR,
  draftAvatarChanged: false,
  enterAfterLogin: false,
  pendingWorkspaceSection: "",
  mode: "login"
};

const workspaceSections = {
  "theory-overview": { view: "theory", eyebrow: "THEORY LEARNING / OVERVIEW", title: "理论学习助手" },
  "theory-library": { view: "theory", eyebrow: "THEORY LEARNING / LIBRARY", title: "教育理论库" },
  "theory-detail": { view: "theory", eyebrow: "THEORY LEARNING / DETAIL", title: "理论详情" },
  "theory-dialogue": { view: "theory", eyebrow: "THEORY LEARNING / DIALOGUE", title: "对话式理论学习" },
  "theory-scenario": { view: "theory", eyebrow: "THEORY LEARNING / PRACTICE", title: "专项训练" },
  "sixarts-overview": { view: "sixarts", eyebrow: "NEW SIX ARTS / OVERVIEW", title: "六艺融合备课总览" },
  "sixarts-course": { view: "sixarts", eyebrow: "NEW SIX ARTS / COURSE CONTEXT", title: "六艺融合课情设置" },
  "sixarts-design": { view: "sixarts", eyebrow: "NEW SIX ARTS / STUDIO", title: "六艺智教坊" },
  "sixarts-process": { view: "sixarts", eyebrow: "NEW SIX ARTS / PROCESS", title: "六艺融合教学过程" },
  "sixarts-evaluate": { view: "sixarts", eyebrow: "NEW SIX ARTS / ASSESSMENT", title: "六艺课堂评价" },
  "sixarts-library": { view: "sixarts", eyebrow: "NEW SIX ARTS / ARCHIVE", title: "六艺活动资源" },
  "observe-overview": { view: "observe", eyebrow: "CLASSROOM OBSERVATION / OVERVIEW", title: "课堂观察总览" },
  "observe-material": { view: "observe", eyebrow: "CLASSROOM OBSERVATION / MATERIAL", title: "课堂材料与证据" },
  "observe-decoder": { view: "observe", eyebrow: "CLASSROOM OBSERVATION / DEEP DECODER", title: "课堂深度解码台" },
  "observe-coding": { view: "observe", canonical: "observe-decoder", eyebrow: "CLASSROOM OBSERVATION / CODING", title: "逐字稿编码结果" },
  "observe-events": { view: "observe", canonical: "observe-decoder", eyebrow: "CLASSROOM OBSERVATION / KEY MOMENTS", title: "关键课堂事件" },
  "observe-insights": { view: "observe", canonical: "observe-decoder", eyebrow: "CLASSROOM OBSERVATION / INSIGHTS", title: "课堂数据洞察" },
  "observe-theory": { view: "observe", eyebrow: "CLASSROOM OBSERVATION / THEORY", title: "理论映射证据链" },
  "observe-report": { view: "observe", eyebrow: "CLASSROOM OBSERVATION / REPORT", title: "课堂观察分析报告" },
  "reflect-overview": { view: "reflect", eyebrow: "REFLECTION & TRANSFORMATION / OVERVIEW", title: "反思与成果转化总览" },
  "reflect-material": { view: "reflect", eyebrow: "REFLECTION & TRANSFORMATION / MATERIAL", title: "教学反思材料" },
  "reflect-diagnosis": { view: "reflect", eyebrow: "REFLECTION & TRANSFORMATION / KNOWLEDGE TO ACTION", title: "知行转化路径" },
  "reflect-theory": { view: "reflect", eyebrow: "REFLECTION & TRANSFORMATION / KNOWLEDGE TO ACTION", title: "知行转化路径" },
  "reflect-action": { view: "reflect", eyebrow: "REFLECTION & TRANSFORMATION / KNOWLEDGE TO ACTION", title: "知行转化路径" },
  "reflect-outcomes": { view: "reflect", eyebrow: "REFLECTION & TRANSFORMATION / OUTCOMES", title: "专业成果生成" },
  "reflect-trajectory": { view: "reflect", eyebrow: "REFLECTION & TRANSFORMATION / IMPROVEMENT PORTRAIT", title: "改进历程全像" },
  "reflect-profile": { view: "reflect", eyebrow: "REFLECTION & TRANSFORMATION / IMPROVEMENT PORTRAIT", title: "改进历程全像" },
  "resource-navigation": { view: "resources", eyebrow: "RESOURCE HUB / AUTHORITATIVE LINKS", title: "权威信息与资源导航" },
  "cloud-drive": { view: "resources", eyebrow: "RESOURCE HUB / CLOUD DRIVE", title: "云盘" }
};

const defaultWorkspaceSections = {
  theory: "theory-overview",
  sixarts: "sixarts-overview",
  observe: "observe-overview",
  reflect: "reflect-overview",
  resources: "resource-navigation"
};

const workspaceSectionOrder = {
  theory: ["theory-overview", "theory-library", "theory-dialogue", "theory-scenario"],
  sixarts: ["sixarts-overview", "sixarts-course", "sixarts-design", "sixarts-process", "sixarts-evaluate", "sixarts-library"],
  observe: ["observe-overview", "observe-material", "observe-decoder", "observe-theory", "observe-report"],
  reflect: ["reflect-overview", "reflect-material", "reflect-diagnosis", "reflect-outcomes", "reflect-trajectory"],
  resources: ["resource-navigation", "cloud-drive"]
};

const OBSERVATION_DECODER_SECTIONS = ["observe-coding", "observe-events", "observe-insights"];

function canonicalWorkspaceSection(sectionName) {
  return workspaceSections[sectionName]?.canonical || sectionName;
}

function observationDecoderTarget(sectionName) {
  return OBSERVATION_DECODER_SECTIONS.includes(sectionName) ? sectionName : "observe-coding";
}

const REFLECTION_PATH_SECTIONS = ["reflect-diagnosis", "reflect-theory", "reflect-action"];
const REFLECTION_HISTORY_SECTIONS = ["reflect-trajectory", "reflect-profile"];
const REFLECTION_PATH_LABELS = {
  "reflect-diagnosis": "问题诊断",
  "reflect-theory": "理论匹配",
  "reflect-action": "改进行动"
};

const workspaceSectionGuides = {
  "theory-overview": "查看理论学习进度、知识版图和建议学习路径。",
  "theory-library": "按领域、课堂问题或关键词检索教育理论，并加入学习计划。",
  "theory-detail": "阅读理论机制、适用场景、课堂范本和常见误区。",
  "theory-dialogue": "围绕当前理论连续提问，形成可回看的学习对话。",
  "theory-scenario": "在真实课堂情境中练习理论辨析与判断。",
  "sixarts-overview": "浏览说、唱、弹、舞、书、画的育人维度与活动资源。",
  "sixarts-course": "录入课情、选择融合维度，并决定一键生成或分阶段生成。",
  "sixarts-design": "进入六艺智教坊，连续完成教学设计、教学过程、六艺评价与 Word 下载。",
  "sixarts-process": "逐环节修改教师活动、学生活动和按需出现的六艺渗透。",
  "sixarts-evaluate": "确认评价证据与项目拓展，汇总并下载最终 Word 教案。",
  "sixarts-library": "检索可复用的六艺活动案例、课堂形式和学习证据。",
  "observe-overview": "快速查看课堂结构、互动趋势、关键发现和分析完成度。",
  "observe-material": "导入逐字稿与音视频，并勾选本次参与分析的教育理论。",
  "observe-decoder": "在一个工作台中查看逐字稿编码、关键事件与数据洞察，并沿证据回到原文。",
  "observe-coding": "查看逐字稿的自动行为编码并回到对应课堂证据。",
  "observe-events": "定位值得深入分析的关键课堂事件。",
  "observe-insights": "比较互动、提问、参与和课堂结构等量化指标。",
  "observe-theory": "核对课堂事实、教学机制与教育理论之间的证据链。",
  "observe-report": "编辑、复制并导出课堂观察分析报告。",
  "reflect-overview": "查看从反思材料到专业成果与下一轮验证的完整闭环。",
  "reflect-material": "导入课后反思并接入课堂观察证据。",
  "reflect-diagnosis": "在知行转化路径中识别核心问题，并区分事实与判断。",
  "reflect-theory": "在知行转化路径中勾选理论，建立现象、原因与理论之间的解释链。",
  "reflect-action": "在知行转化路径中形成下一节课可执行、可观察的改进行动。",
  "reflect-outcomes": "生成反思、案例、教研报告、论文框架或教学改进方案。",
  "reflect-trajectory": "在改进历程全像中对比多轮实践，并查看教师专业成长画像。",
  "reflect-profile": "在改进历程全像中汇总改进轨迹、成长趋势和课例档案。",
  "resource-navigation": "访问教育政策、教材平台、高校资源与权威教育网站。",
  "cloud-drive": "查看历史上传材料、生成成果与下载记录。"
};

const workspaceAssistantMeta = {
  theory: { index: "01", title: "理论学习", icon: "library-big", copy: "通过理论库、详情阅读、对话和专项训练建立教育理论解释力。" },
  sixarts: { index: "02", title: "艺智备课", icon: "palette", copy: "从课情设置进入教学设计、过程、评价和资源复用，形成可下载教案。" },
  observe: { index: "03", title: "课堂观察", icon: "scan-eye", copy: "从课堂事实出发，完成编码、事件识别、数据洞察、理论解释和报告生成。" },
  reflect: { index: "04", title: "反思与成果转化", icon: "notebook-tabs", copy: "把课后感受转化为问题诊断、改进行动、专业成果和跨轮成长轨迹。" },
  resources: { index: "05", title: "资源中心", icon: "cloud", copy: "访问权威教育资源，管理课堂材料与生成成果。" }
};

const workspaceAssistantSubnav = {
  theory: [
    { section: "theory-overview", label: "理论总览", icon: "orbit" },
    { section: "theory-library", label: "理论库", icon: "library" },
    { section: "theory-dialogue", label: "对话学习", icon: "messages-square" },
    { section: "theory-scenario", label: "专项训练", icon: "list-checks" }
  ],
  sixarts: [
    { section: "sixarts-overview", label: "六艺总览", icon: "layout-dashboard" },
    { section: "sixarts-course", label: "课情设置", icon: "file-pen-line" },
    { section: "sixarts-design", label: "六艺智教坊", icon: "wand-sparkles" },
    { section: "sixarts-library", label: "活动资源", icon: "images" }
  ],
  observe: [
    { section: "observe-overview", label: "分析总览", icon: "layout-dashboard" },
    { section: "observe-material", label: "课堂材料", icon: "file-input" },
    { section: "observe-decoder", label: "课堂深度解码台", icon: "scan-search" },
    { section: "observe-theory", label: "理论证据链", icon: "git-branch" },
    { section: "observe-report", label: "分析报告", icon: "file-chart-column" }
  ],
  reflect: [
    { section: "reflect-overview", label: "转化总览", icon: "panels-top-left" },
    { section: "reflect-material", label: "反思材料", icon: "file-input" },
    { section: "reflect-diagnosis", label: "知行转化路径", icon: "route" },
    { section: "reflect-outcomes", label: "成果生成", icon: "files" },
    { section: "reflect-trajectory", label: "改进历程全像", icon: "chart-no-axes-combined" }
  ],
  resources: [
    { section: "resource-navigation", label: "权威导航", icon: "landmark" },
    { section: "cloud-drive", label: "云盘", icon: "cloud" }
  ]
};

const workspaceTourSteps = [
  {
    eyebrow: "WELCOME TO EDULINK",
    title: "你好，我是引导员小智",
    copy: "接下来我会逐页介绍四个助手、分级任务导航、成果生成和个人设置。引导只切换展示页面，不会修改你已经填写的内容。",
    tip: "共 20 步，只有上一步、下一步和跳过本次可以操作",
    icon: "sparkles",
    focusLabel: "工作台总览",
    placement: "center",
    targets: []
  },
  {
    eyebrow: "STEP 02 · ASSISTANTS",
    title: "先选择与你任务对应的助手",
    copy: "顶部助手切换区包含课堂观察、反思成果转化、理论学习和六艺融合备课。切换助手后，左侧任务路径会同步更新。",
    tip: "当前选中的助手会保持高亮",
    icon: "layout-grid",
    focusLabel: "助手切换",
    placement: "below",
    targets: ["#workspace-app .assistant-switcher"]
  },
  {
    eyebrow: "STEP 03 · NAVIGATION",
    title: "左侧导航就是完整任务路径",
    copy: "选择助手后，这里会展开对应的二级任务。每个入口都是独立页面；带锁图标的环节需要先完成上一阶段，避免成果链断开。",
    tip: "引导结束后可以直接点击任意已开放任务",
    icon: "panel-left",
    focusLabel: "分级任务导航",
    placement: "right",
    targets: ["#workspace-app .rail"]
  },
  {
    eyebrow: "STEP 04 · OBSERVATION OVERVIEW",
    title: "课堂观察：先掌握分析全貌",
    copy: "分析总览汇总课堂结构、互动趋势、关键发现和完成度。适合先判断数据是否完整，再决定从编码、事件还是理论证据链继续深入。",
    tip: "总览数据会随材料和分析结果实时更新",
    icon: "scan-eye",
    focusLabel: "课堂观察总览",
    placement: "left",
    section: "observe-overview",
    targets: ["#observe [data-workspace-panel=\"observe-overview\"]"]
  },
  {
    eyebrow: "STEP 05 · MATERIAL",
    title: "导入课堂材料并明确分析依据",
    copy: "课堂材料页支持逐字稿、文档和音视频输入，并可勾选本次参与分析的教育理论。理论选择会影响后续解释链和报告建议。",
    tip: "先核对课题、学科、年级和课时信息",
    icon: "file-input",
    focusLabel: "课堂材料与理论选择",
    placement: "left",
    section: "observe-material",
    targets: ["#observe [data-workspace-panel=\"observe-material\"]"]
  },
  {
    eyebrow: "STEP 06 · CODING & EVENTS",
    title: "从逐字稿编码定位关键课堂事件",
    copy: "逐字稿编码会标记教师提问、学生回应、反馈和互动行为；关键事件页进一步聚合值得解释的片段，并保留回到原始证据的位置。",
    tip: "编码是事实层，关键事件是后续分析入口",
    icon: "tags",
    focusLabel: "类别选择与编码结果",
    placement: "left",
    section: "observe-coding",
    targets: ["#observe [data-workspace-panel=\"observe-coding\"]"]
  },
  {
    eyebrow: "STEP 07 · INSIGHTS",
    title: "用图表比较课堂互动与参与结构",
    copy: "数据洞察页呈现提问、回应、参与分布、等待时间和课堂节奏。它用于发现结构性问题，不代替对具体课堂语境的专业判断。",
    tip: "可切换统计周期并对照关键事件阅读",
    icon: "chart-no-axes-combined",
    focusLabel: "课堂数据洞察",
    placement: "left",
    section: "observe-insights",
    targets: ["#observe [data-workspace-panel=\"observe-insights\"]"]
  },
  {
    eyebrow: "STEP 08 · THEORY CHAIN",
    title: "把事实、机制和教育理论连成证据链",
    copy: "理论证据链要求先引用课堂事实，再解释可能机制，最后匹配理论并形成可执行建议。勾选或取消理论后，报告依据会同步变化。",
    tip: "避免只贴理论标签而缺少课堂证据",
    icon: "git-branch",
    focusLabel: "理论证据链",
    placement: "left",
    section: "observe-theory",
    targets: ["#observe [data-workspace-panel=\"observe-theory\"]"]
  },
  {
    eyebrow: "STEP 09 · REPORT",
    title: "生成、编辑并导出课堂分析报告",
    copy: "分析报告汇总课堂概况、观察证据、数据指标、理论解释和改进建议。正文可以继续编辑、复制，并导出为后续教研使用的成果文件。",
    tip: "报告保留事实与解释的对应关系",
    icon: "file-chart-column",
    focusLabel: "课堂分析报告",
    placement: "left",
    section: "observe-report",
    targets: ["#observe [data-workspace-panel=\"observe-report\"]"]
  },
  {
    eyebrow: "STEP 10 · REFLECTION MATERIAL",
    title: "反思转化：先导入课后反思与观察证据",
    copy: "反思材料页接收教师课后记录，并可同步课堂观察结果。系统会区分事实、感受和判断，为后续问题诊断保留证据来源。",
    tip: "不是把感受直接改写成结论，而是先补足证据",
    icon: "notebook-tabs",
    focusLabel: "反思材料",
    placement: "left",
    section: "reflect-material",
    targets: ["#reflect [data-workspace-panel=\"reflect-material\"]"]
  },
  {
    eyebrow: "STEP 11 · DIAGNOSIS",
    title: "识别真正值得改进的教学问题",
    copy: "问题诊断从材料中提取核心矛盾，判断证据是否充分，并区分现象、原因假设和价值判断。你可以修改诊断后再进入理论解释。",
    tip: "证据不足的结论会提示继续补充材料",
    icon: "scan-search",
    focusLabel: "问题诊断",
    placement: "left",
    section: "reflect-diagnosis",
    targets: ["#reflect [data-workspace-panel=\"reflect-diagnosis\"]"]
  },
  {
    eyebrow: "STEP 12 · THEORY & ACTION",
    title: "用理论解释问题，再转成可观察行动",
    copy: "理论匹配页建立现象、原因和理论之间的解释链；改进行动页把解释转化为下一节课可执行的教师行为、学生表现和观察指标。",
    tip: "每条行动都应能在下一轮课堂中被验证",
    icon: "route",
    focusLabel: "理论解释与改进行动",
    placement: "left",
    section: "reflect-action",
    targets: ["#reflect [data-workspace-panel=\"reflect-action\"]"]
  },
  {
    eyebrow: "STEP 13 · OUTCOMES",
    title: "把反思沉淀为多种专业成果",
    copy: "成果生成可形成教学反思、案例、教研报告、论文框架和实验方案；改进轨迹负责跨轮比较，成长画像则汇总多个课例中的专业发展趋势。",
    tip: "成果正文可以继续修改后再下载",
    icon: "files",
    focusLabel: "专业成果生成",
    placement: "left",
    section: "reflect-outcomes",
    targets: ["#reflect [data-workspace-panel=\"reflect-outcomes\"]"]
  },
  {
    eyebrow: "STEP 14 · THEORY LIBRARY",
    title: "理论学习：从理论库建立知识地图",
    copy: "理论总览、理论库和理论详情用于检索教育理论、核心观点、作用机制、适用场景、课堂范例与误用风险，并可加入个人学习计划。",
    tip: "搜索与分类筛选可以组合使用",
    icon: "library-big",
    focusLabel: "教育理论库",
    placement: "left",
    section: "theory-library",
    targets: ["#theory [data-workspace-panel=\"theory-library\"]"]
  },
  {
    eyebrow: "STEP 15 · THEORY PRACTICE",
    title: "通过对话和专项训练理解理论",
    copy: "对话学习支持围绕理论连续追问，回车即可发送；历史对话可以检索。专项训练则用课堂案例检验你能否正确选择并解释理论。",
    tip: "学习记录与最近对话会保存在当前浏览器",
    icon: "messages-square",
    focusLabel: "对话式理论学习",
    placement: "left",
    section: "theory-dialogue",
    targets: ["#theory [data-workspace-panel=\"theory-dialogue\"]"]
  },
  {
    eyebrow: "STEP 16 · SIX ARTS COURSE",
    title: "六艺备课：先设置课情与融合边界",
    copy: "课情设置包含学科、年级、课时、教学材料和六艺维度。六艺不是额外表演，而是围绕学科目标选择说、唱、弹、舞、书、画中的适切活动。",
    tip: "一节课只需选择真正服务目标的六艺维度",
    icon: "palette",
    focusLabel: "六艺课情设置",
    placement: "left",
    section: "sixarts-course",
    targets: ["#sixarts [data-workspace-panel=\"sixarts-course\"]"]
  },
  {
    eyebrow: "STEP 17 · SIX ARTS DESIGN",
    title: "分阶段生成或一键形成完整教学设计",
    copy: "分阶段生成便于教师逐步修改目标、学情和教学过程；一键生成适合快速得到完整教案。核心素养目标始终保留，六艺渗透按整节课需要配置。",
    tip: "教学设计正文可直接编辑，再继续生成下一阶段",
    icon: "wand-sparkles",
    focusLabel: "六艺教学设计",
    placement: "left",
    section: "sixarts-design",
    targets: ["#sixarts [data-workspace-panel=\"sixarts-design\"]"]
  },
  {
    eyebrow: "STEP 18 · PROCESS & RESOURCES",
    title: "教学过程、评价和资源库形成完整闭环",
    copy: "教学过程呈现教师活动、学生活动和按需出现的六艺渗透；评价页汇总学习证据并下载 Word；活动资源库用于检索和复用成熟课堂案例。",
    tip: "未完成前一阶段时，过程或评价入口会保持锁定",
    icon: "route",
    focusLabel: "过程、评价与活动资源",
    placement: "right",
    section: "sixarts-library",
    targets: ["#workspace-app .assistant-branch[data-assistant-branch=\"sixarts\"]"]
  },
  {
    eyebrow: "STEP 19 · PROGRESS & SETTINGS",
    title: "保存进度，并固定你的显示与引导偏好",
    copy: "页码箭头用于顺序切换任务；右上角可以保存、恢复、调整低中高画质并进入偏好设置。画质和是否自动引导都会长期沿用最后一次选择。",
    tip: "清除浏览器站点数据后，本地偏好才会被重置",
    icon: "sliders-horizontal",
    focusLabel: "进度与个人设置",
    placement: "below-left",
    targets: ["#workspace-app .assistant-switcher"]
  },
  {
    eyebrow: "STEP 20 · READY",
    title: "引导完成，现在开始你的任务",
    copy: "你已经看过四个助手的主要工作路径。点击“开始使用”后会回到引导开始前的页面；之后也可以从顶部功能导航或偏好设置重新播放。",
    tip: "所有已填写内容和偏好仍保留在当前浏览器中",
    icon: "badge-check",
    focusLabel: "准备就绪",
    placement: "center",
    targets: []
  }
];

const workspaceTourState = {
  index: 0,
  target: null,
  returnFocus: null,
  layoutFrame: 0,
  originSection: "",
  originView: ""
};

const assistantFlyoutState = {
  branch: null,
  closeTimer: 0,
  openTimer: 0
};

const workspaceMotionState = {
  transitionToken: 0,
  assistantTransitionActive: false,
  activeAssistantSection: "",
  pendingAssistantTransition: null,
  pendingSectionAfterAssistant: null,
  sectionTransitionActive: false,
  pendingSectionTransition: null,
  canvasFrame: 0,
  lastCanvasPaint: 0,
  canvasPaint: null
};
let liquidGlassAbortController = null;

const mediaState = {
  file: null,
  url: "",
  type: "",
  name: "",
  markers: [],
  metadataIdentity: "",
  metadataTouched: { title: false, subject: false, grade: false, duration: false },
  metadataAutoValues: { title: "", subject: "", grade: "", duration: "" },
  durationSeconds: null
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const els = {
  transcript: $("#transcript"),
  lessonTitle: $("#lesson-title"),
  subject: $("#subject"),
  grade: $("#grade"),
  duration: $("#duration"),
  teacherName: $("#teacher-name"),
  analysisDate: $("#analysis-date"),
  fileInput: $("#file-input"),
  report: $("#report-output"),
  reflection: $("#reflection-output"),
  codedList: $("#coded-list"),
  theoryList: $("#theory-list"),
  events: $("#events"),
  toast: $("#toast")
};

const learningTheoryProfiles = [
  { name: "教育本质论", group: "教育学基础理论类", english: "Essence of Education", core: "教育是有目的地促进人的发展与社会文化传承的实践活动，育人价值始终先于工具效率。", tags: ["人的发展", "文化传承", "育人目的"], subject: "适用于课程目标审视、育人价值分析与教学活动取舍。", example: "设计一项课堂任务时，先说明它要促进学生哪一种发展，再选择活动形式与数字工具。", risk: "只强调知识传递或技术效率，忽略学生完整发展和教育价值。" },
  { name: "建构主义学习理论", group: "心理学理论类", english: "Constructivist Learning", core: "学习不是被动接收结论，而是学习者基于已有经验，在问题、协作与反思中主动建构意义。", tags: ["意义建构", "已有经验", "主动探究"], subject: "适用于问题解决、概念教学、探究学习和项目式学习。", example: "教师呈现有争议的真实问题，让学生先提出解释、比较证据，再共同形成概念。", risk: "把课堂完全交给学生，缺少必要支架、反馈和知识结构化。" },
  { name: "人本主义学习理论", group: "心理学理论类", english: "Humanistic Learning", core: "学习应关注完整的人，尊重学生的需要、情感、选择与自我实现，建立真诚和安全的学习关系。", tags: ["自我实现", "情感需要", "学习选择"], subject: "适用于班级关系、个性化学习、学习动机与成长性反馈。", example: "在共同目标下提供任务难度和表达方式选择，并用描述性反馈支持学生自我评价。", risk: "把尊重误解为无原则放任，忽略共同学习目标和必要规范。" },
  { name: "布鲁纳发现学习理论", group: "心理学理论类", english: "Discovery Learning", core: "学习者通过操作材料、比较案例、形成猜想并验证，在发现关系的过程中掌握知识结构。", tags: ["发现规律", "结构学习", "螺旋课程"], subject: "适用于数学规律、科学概念、语言规则与材料归纳。", example: "提供正例、变式和反例，让学生提出猜想并用新案例检验适用范围。", risk: "教师提示过强，把发现过程变成猜测预设答案。" },
  { name: "情境认知理论", group: "心理学理论类", english: "Situated Cognition", core: "知识与产生、使用它的情境不可分割，学习应发生在有意义的任务、工具与共同体中。", tags: ["真实任务", "情境学习", "实践共同体"], subject: "适用于综合实践、职业教育、语言运用和真实问题解决。", example: "围绕校园真实问题组织资料调查、方案设计、公开表达和应用评价。", risk: "情境只用于热闹导入，没有持续支撑核心知识与任务。" },
  { name: "教学对话理论（IRF）", group: "课堂与班级管理理论类", english: "Classroom Dialogue", core: "教师发起、学生回应、教师反馈构成基本互动链，反馈方式决定学生思维是否继续推进。", tags: ["课堂提问", "追问反馈", "对话推进"], subject: "适用于课堂话语分析、提问设计与师生互动改进。", example: "教师暂缓评价，邀请学生复述、补充或质疑同伴观点，再组织归纳。", risk: "连续师问生答形成单向控制，学生之间没有真实回应。" },
  { name: "苏格拉底式问答法", group: "学科教学理论类", english: "Socratic Questioning", core: "通过有逻辑的连续追问，促使学习者澄清概念、检验依据、发现矛盾并修正判断。", tags: ["深度追问", "证据推理", "概念澄清"], subject: "适用于概念辨析、价值讨论、文本解读和论证写作。", example: "围绕‘你的依据是什么、反例是否成立、条件改变后会怎样’展开追问。", risk: "追问密度过高或答案预设过强，让学生只猜教师意图。" },
  { name: "等待时间理论", group: "课堂与班级管理理论类", english: "Wait-Time Theory", core: "问题后的适度沉默能提升回答长度和复杂度，扩大参与范围，并提高学生提问与同伴回应的概率。", tags: ["思考时间", "全员参与", "回答质量"], subject: "适用于开放性提问、全班讨论和复杂任务启动。", example: "开放问题后保留三至五秒，先独立思考或书写，再邀请不同层次学生表达。", risk: "教师自问自答，或只等待举手最快的少数学生。" },
  { name: "形成性评价理论", group: "课堂与班级管理理论类", english: "Formative Assessment", core: "评价嵌入学习过程，通过明确目标、获取证据、反馈与调整，持续缩小当前表现和学习目标之间的差距。", tags: ["学习证据", "描述反馈", "教学调节"], subject: "适用于课堂反馈、表现性任务、学习单和单元进阶评价。", example: "用成功标准让学生自评，再依据课堂证据给出‘有效之处+下一步’反馈。", risk: "只给分数、表扬或对错，不说明改进方向。" },
  { name: "学习迁移理论", group: "心理学理论类", english: "Transfer of Learning", core: "真正理解表现为能够识别新情境中的共同结构，并对已有知识、方法和策略进行调整后应用。", tags: ["变式应用", "结构识别", "新情境"], subject: "适用于单元复习、跨学科任务、变式练习和真实应用。", example: "改变条件、表征或问题方向，让学生判断原方法是否适用并解释调整。", risk: "教师口头说‘可以迁移’，但学生没有独立应用证据。" },
  { name: "社会互动学习理论", group: "课堂与班级管理理论类", english: "Social Interaction Learning", core: "知识在语言交流、工具使用和共同活动中形成，合作质量取决于互相回应与共同产出。", tags: ["同伴协作", "社会协商", "语言外化"], subject: "适用于小组合作、同伴互评、协作探究与共同写作。", example: "设置明确角色和共同成果，要求小组汇报如何处理分歧并形成结论。", risk: "只有分组形式，没有观点差异、互相回应或共同责任。" },
  { name: "数学表征理论", group: "学科教学理论类", english: "Mathematical Representation", core: "实物、动作、图形、语言和符号的双向转换，为抽象关系提供可观察、可操作的认知支架。", tags: ["操作表征", "图形表征", "符号表征"], subject: "适用于数概念、运算、几何与数量关系教学。", example: "让学生把操作过程画成图，再把图解释为算式，并完成逆向转换。", risk: "只从操作走向算式，学生会做动作却不能解释符号意义。" },
  { name: "多媒体学习认知理论", group: "教育技术理论", english: "Cognitive Theory of Multimedia Learning", core: "文字、图像与声音应依据双通道、有限容量和主动加工原则协同组织，帮助学生选择、组织并整合信息。", tags: ["双通道加工", "认知负荷", "多媒体设计"], subject: "适用于课件、微课、数字教材与智慧课堂资源设计。", example: "删去与目标无关的装饰信息，让图文在时空上邻近呈现，并用提示突出关键关系。", risk: "把媒体数量等同于教学质量，造成信息冗余和认知超载。" }
].map((profile, index) => {
  const rule = theoryRules.find((item) => item.name === profile.name);
  return {
    ...profile,
    id: `theory-${index + 1}`,
    mechanism: rule?.mechanisms?.join("、") || profile.tags.join("、"),
    improvement: rule?.improvement || `围绕“${profile.tags[0]}”设计可观察的教师行为和学生学习证据。`,
    teacherTalk: rule?.teacherTalk || "请先说明你的判断依据，再用课堂事实检验这一观点。"
  };
});

const theoryCategories = [
  { name: "教育学基础理论类", count: 128, icon: "graduation-cap", note: "教育本质、目的、价值与人的发展" },
  { name: "心理学理论类", count: 166, icon: "brain-circuit", note: "学习、动机、认知与个体发展" },
  { name: "课堂与班级管理理论类", count: 98, icon: "users-round", note: "课堂互动、评价与班级治理" },
  { name: "学科教学理论类", count: 124, icon: "book-open-check", note: "学科知识、思维与教学实践" },
  { name: "教育技术理论", count: 90, icon: "monitor-cog", note: "媒体、环境与数字化学习设计" }
];

const THEORY_INDEX_DISPLAY_TOTAL = 606;
const theoryDirectoryData = window.THEORY_DIRECTORY_DATA || { total: THEORY_INDEX_DISPLAY_TOTAL, categories: [] };
const theorySourceData = window.THEORY_SOURCE_DATA || {};
const theorySourceDataByName = new Map(Object.entries(theorySourceData).map(([name, value]) => [
  String(name).replace(/[\s\p{P}\p{S}]/gu, '').toLowerCase(),
  value
]));

function getTheorySourceRecord(item) {
  if (!item?.name) return null;
  return theorySourceData[item.name]
    || theorySourceDataByName.get(String(item.name).replace(/[\s\p{P}\p{S}]/gu, '').toLowerCase())
    || null;
}

function getTheorySourceParagraphs(record, block) {
  return Array.isArray(record?.[block]?.paragraphs) ? record[block].paragraphs.filter(Boolean).map(String) : [];
}

function getTheorySourceField(paragraphs, labels = []) {
  const line = (Array.isArray(paragraphs) ? paragraphs : []).find((paragraph) => labels.some((label) => String(paragraph).trim().startsWith(label)));
  if (!line) return '';
  const value = String(line).trim();
  const separator = value.search(/[：:]/);
  return separator >= 0 ? value.slice(separator + 1).replace(/^[：:]+/, '').trim() : value;
}

function normalizeTheorySourceText(value) {
  return String(value || '').replace(/[\s\p{P}\p{S}]/gu, '').toLowerCase();
}

function stripTheorySourceHeading(value, theoryName = '') {
  let text = String(value || '').replace(/\*{1,3}/g, '').trim();
  const prefix = text.match(/^(?:[（(][一二三四五六七八九十百千万0-9０-９]+[）)]|[0-9０-９]+[\.．、])\s*/);
  if (!prefix && /^\d{1,2}(?=[\u3400-\u9fff])/.test(text)) text = text.replace(/^\d{1,2}/, '').trim();
  if (!prefix) return text.replace(/^[：:]+/, '').trim();
  const rest = text.slice(prefix[0].length).trim();
  const theoryKey = normalizeTheorySourceText(theoryName);
  const restWithoutColon = rest.replace(/^[：:]+/, '').trim();
  if (theoryKey && normalizeTheorySourceText(restWithoutColon) === theoryKey) return '';
  if (theoryName && rest.startsWith(String(theoryName).trim()) && /^[：:]/.test(rest.slice(String(theoryName).trim().length))) {
    return rest.slice(String(theoryName).trim().length).replace(/^[：:]+/, '').trim();
  }
  return text.replace(/^[：:]+/, '').trim();
}

function formatTheorySourceParagraph(value) {
  const text = String(value || '')
    .replace(/\r?\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/：{2,}/g, '：')
    .replace(/:{2,}/g, ':')
    .trim();
  if (!text) return '';
  const preservedSegments = [];
  const protectedText = text.replace(
    /【[^】]*】|《[^》]*》|（[^）]*）|\([^)]*\)|\[[^\]]*\]|「[^」]*」|『[^』]*』|“[^”]*”|‘[^’]*’/g,
    (segment) => {
      // Numbered markers such as “（1）” are real paragraph boundaries.
      if (/^[（(][0-9０-９]{1,2}[）)]$/.test(segment)) return segment;
      const token = `\uE000${preservedSegments.length}\uE001`;
      preservedSegments.push(segment);
      return token;
    }
  );
  const labels = /英文名称|英文别称|别名|主领域分类|次领域标签|理论定位|提出背景|代表人物\/理论来源|代表人物|理论来源|配套理论|内涵|关键判断标准|关键判定标准|关键词|一句话记忆|理论贡献|理论局限|理论说明|核心观点|学术界存在的争议与流派|学术界存在争议流派|课堂落地方式|课堂观察指标|AI理论识别规则|AI 理论识别规则|教师行为|学生行为|课堂语言|学科应用|学科具体应用|通用应用范围|课堂范本|课堂案例|具体课例|优质落地课堂|情境训练|情境判断|情境辨析|训练题|标准答案|详细解析|备考易错提醒|理论解读|深度辨析总结/g;
  return protectedText
    .replace(labels, (match, offset, source) => {
      if (offset === 0) return match;
      const before = source.slice(0, offset);
      const after = source.slice(offset + match.length);
      const inlinePairs = [['【', '】'], ['《', '》'], ['（', '）'], ['(', ')'], ['[', ']'], ['「', '」'], ['『', '』'], ['“', '”'], ['‘', '’']];
      const isInsideDelimitedText = inlinePairs.some(([open, close]) => before.split(open).length > before.split(close).length);
      if (isInsideDelimitedText) return match;
      const isFieldBoundary = /^[：:]/.test(after) || /[。！？；;]\s*$/.test(before);
      return isFieldBoundary ? `\n${match}` : match;
    })
    .replace(/(?=[（(][0-9０-９]{1,2}[）)])/g, '\n')
    .replace(/(?=(?:[0-9０-９]{1,2})[\.．、]\s*[\u3400-\u9fff])/g, '\n')
    .replace(/([。！？；;])\s*(?=(?:\d+|[①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳])[\.．、])/g, '$1\n')
    .replace(/\n{2,}/g, '\n')
    .replace(/\uE000(\d+)\uE001/g, (token, index) => preservedSegments[Number(index)] || token)
    .trim();
}

function repairTheorySourceFragments(lines) {
  const repaired = [];
  const onlyClosingMarks = /^[】）》）\]”’」』》〉〕〗〙〛]+[。！？；;，,：:]?$/;
  const beginsWithClosingMark = /^[】）》）\]”’」』》〉〕〗〙〛]/;
  const pairs = [['【', '】'], ['《', '》'], ['（', '）'], ['(', ')'], ['[', ']'], ['「', '」'], ['『', '』'], ['“', '”'], ['‘', '’']];
  const hasUnclosedPair = (text) => pairs.some(([open, close]) => text.split(open).length > text.split(close).length);

  (Array.isArray(lines) ? lines : []).forEach((value) => {
    const line = String(value || '').trim();
    if (!line) return;
    const previous = repaired[repaired.length - 1];
    if (previous && (onlyClosingMarks.test(line) || (beginsWithClosingMark.test(line) && hasUnclosedPair(previous)))) {
      repaired[repaired.length - 1] = `${previous}${line}`;
      return;
    }
    repaired.push(line);
  });
  return repaired;
}

function cleanTheorySourceParagraphs(paragraphs, theoryName = '') {
  const theoryKey = normalizeTheorySourceText(theoryName);
  const lines = (Array.isArray(paragraphs) ? paragraphs : [])
    .flatMap((paragraph) => formatTheorySourceParagraph(stripTheorySourceHeading(paragraph, theoryName)).split(/\n+/))
    .map((paragraph) => {
      let text = paragraph.replace(/^[：:]+/, '').trim();
      const withoutRedundantLeadNumber = text.replace(/^1[\.．、]\s*/, '');
      if (theoryKey && normalizeTheorySourceText(withoutRedundantLeadNumber).startsWith(theoryKey)) {
        text = withoutRedundantLeadNumber;
      }
      return text;
    });
  return repairTheorySourceFragments(lines)
    .filter((text) => {
    if (!text || /^[】）》）\]”’」』》〉〕〗〙〛]+[。！？；;，,：:]?$/.test(text)) return false;
    if (/^(?:\d{1,3}|[０-９]{1,3})[\.．、:：；;]?$/.test(text)) return false;
    const compact = normalizeTheorySourceText(text.replace(/^[（(][^）)]{1,10}[）)]\s*/, '').replace(/^[0-9０-９]+[\.．、；;:]\s*/, '').replace(/^[A-ZＡ-Ｚ][\.．、]\s*/, '').replace(/[：:]\s*$/, ''));
    if (theoryKey && compact === theoryKey) return false;
    // A bare chapter label is not source content and should not occupy a paragraph.
    // Classroom mode labels are deliberately kept because they drive the
    // normal/quality lesson split in the classroom-template view.
    const isClassroomModeLabel = /(?:常态(?:应试)?课堂|优质(?:落地)?课堂|优质实践)/.test(text);
    if (!getTheorySourceSection(text) && !isClassroomModeLabel && !/[：:。！？；;，,]/.test(text) && text.length <= 40 && /理论|范本|应用|训练|辨析|对比|维度|课堂操作|边界提醒|详细解析|标准答案|题目/.test(text)) return false;
    return true;
  });
}

const THEORY_SOURCE_SECTION_LABELS = [
  '代表人物/理论来源', '学术界存在的争议与流派', '关键判断标准', '关键判定标准',
  'AI理论识别规则', 'AI 理论识别规则', '学科具体应用', '通用应用范围', '课堂落地方式',
  '课堂观察指标', '一句话记忆', '主领域分类', '次领域标签', '英文别称', '英文名称',
  '理论定位', '提出背景', '代表人物', '理论来源', '配套理论', '理论说明', '核心观点',
  '内涵', '关键词', '理论贡献', '理论局限', '学科应用', '课堂范本', '课堂案例',
  '具体课例', '优质落地课堂', '情境训练', '情境判断', '情境辨析', '训练题', '标准答案',
  '详细解析', '备考易错提醒', '理论解读', '深度辨析总结', '教师行为', '学生行为', '课堂语言',
  '对比组合', '对比维度', '核心界定', '关注焦点', '适用场景', '课堂操作方式', '边界提醒'
].sort((left, right) => right.length - left.length);

function getTheorySourceSection(value) {
  const original = String(value || '').trim().replace(/^[#*•\s]+/, '');
  if (!original) return null;
  const text = original.replace(/^[（(]?[一二三四五六七八九十百千万0-9０-９]+[）)\.．、\s]+/, '').trim();
  const label = THEORY_SOURCE_SECTION_LABELS.find((candidate) => {
    if (!text.startsWith(candidate)) return false;
    const tail = text.slice(candidate.length);
    return !tail || /^[：:\s]/.test(tail);
  });
  if (!label) return null;
  const rest = text.slice(label.length).replace(/^[：:]+\s*/, '').trim();
  return { label, rest };
}

function parseTheorySourceBlocks(paragraphs, theoryName = '') {
  const lines = cleanTheorySourceParagraphs(paragraphs, theoryName)
    .map((line) => String(line || '').replace(/^p(?=(?:教师|理论解读))/, '').trim())
    .filter(Boolean);
  const blocks = [];
  let current = null;
  lines.forEach((line) => {
    const section = getTheorySourceSection(line);
    if (section) {
      current = { label: section.label, lines: section.rest ? [section.rest] : [] };
      blocks.push(current);
      return;
    }
    if (!current) {
      current = { label: '原文概览', lines: [] };
      blocks.push(current);
    }
    current.lines.push(line);
  });
  return blocks.filter((block) => block.lines.some((line) => String(line || '').trim())).map((block) => {
    const caseSection = ['具体课例', '课堂范本', '课堂案例', '优质落地课堂'].includes(block.label);
    if (!caseSection) return block;
    const source = block.lines.map((line) => String(line || '')).join(' ');
    const bracketedTitle = source.match(/《[^》]{1,80}》/);
    const quotedTitle = source.match(/[“\"「」]([^”\"「」]{1,80})[”\"」]/);
    const title = bracketedTitle?.[0] || (quotedTitle ? `《${quotedTitle[1]}》` : '');
    return title ? { ...block, label: `${block.label}-${title}` } : block;
  });
}

function theorySourceIcon(label) {
  const iconMap = {
    英文名称: 'languages', 英文别称: 'languages', 别名: 'tag', 主领域分类: 'layers-3', 次领域标签: 'tags',
    理论定位: 'locate-fixed', 提出背景: 'history', 代表人物: 'users-round', '代表人物/理论来源': 'users-round', 代表人物理论来源: 'users-round',
    理论来源: 'book-open', 配套理论: 'network', 内涵: 'book-open-text', 核心观点: 'lightbulb',
    关键词: 'hash', 一句话记忆: 'quote', 理论贡献: 'sparkles', 理论局限: 'shield-alert',
    课堂落地方式: 'wand-sparkles', 课堂观察指标: 'scan-search', AI理论识别规则: 'bot',
    学科应用: 'panels-top-left', 学科具体应用: 'square-library', 通用应用范围: 'compass',
    课堂范本: 'presentation', 课堂案例: 'presentation', 具体课例: 'school', 优质落地课堂: 'school',
    情境训练: 'brain-circuit', 情境判断: 'circle-help', 情境辨析: 'git-compare', 训练题: 'list-checks',
    理论说明: 'file-text', 理论解读: 'file-text', 教师行为: 'user-round', 学生行为: 'graduation-cap',
    课堂语言: 'message-circle', 默认: 'file-text'
  };
  if (iconMap[label]) return iconMap[label];
  const baseLabel = Object.keys(iconMap).find((key) => key !== '默认' && String(label || '').startsWith(key));
  return iconMap[baseLabel] || iconMap.默认;
}

function normalizeTheoryDisplayLabel(label) {
  const value = String(label || '').trim();
  const aliases = {
    '学术界存在的争议与流派': '学术界的争议与流派',
    '学术界存在争议流派': '学术界的争议与流派',
    'AI理论识别规则': 'AI 理论识别规则'
  };
  return aliases[value] || value;
}

function renderTheoryDisplayLabel(label) {
  const value = normalizeTheoryDisplayLabel(label);
  if (value === '代表人物/理论来源') return '代表人物<br>理论来源';
  return escapeHtml(value);
}

function renderTheorySourceBody(lines, extraClass = '') {
  return (Array.isArray(lines) ? lines : []).map((line) => {
    const text = String(line || '').trim();
    if (!text) return '';
    const numbered = text.match(/^(\d+|[一二三四五六七八九十百千万]+|[①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳])(?:[\.．、]\s*|\s+)(.*)$/);
    if (numbered) {
      const body = numbered[2].trim();
      const isSubheading = body.length <= 80 && !/[。！？；;]$/.test(body);
      return `<p class="theory-source-line is-numbered${isSubheading ? ' is-subheading' : ''}${extraClass ? ` ${extraClass}` : ''}"><span class="theory-source-number">${escapeHtml(numbered[1])}</span><span>${escapeHtml(body)}</span></p>`;
    }
    const parenthesized = text.match(/^[（(](\d+)[）)]\s*(.*)$/);
    if (parenthesized) {
      const body = parenthesized[2].trim();
      if (!body) return '';
      const isSubheading = body.length <= 80 && !/[。！？；;]$/.test(body);
      return `<p class="theory-source-line is-numbered${isSubheading ? ' is-subheading' : ''}${extraClass ? ` ${extraClass}` : ''}"><span class="theory-source-number">${escapeHtml(parenthesized[1])}</span><span>${escapeHtml(body)}</span></p>`;
    }
    return `<p class="theory-source-line${extraClass ? ` ${extraClass}` : ''}">${escapeHtml(text)}</p>`;
  }).join('');
}

function renderTheoryBasicInfo(paragraphs, theoryName = '') {
  const blocks = parseTheorySourceBlocks(paragraphs, theoryName);
  if (!blocks.length) return '';
  return `<section class="theory-basic-info-shell"><div class="theory-basic-info-head"><div><p class="kicker">第一块 · 理论解释</p><h3>基本信息</h3><p>把原文中的核心字段、理论边界与课堂观察线索整理成可扫描的知识档案。</p></div><span><i data-lucide="scan-text"></i>${blocks.length} 个信息字段</span></div><dl class="theory-basic-info-list">${blocks.map((block) => `<div class="theory-basic-info-row${block.lines.length > 2 ? ' is-long' : ''}"><dt><i data-lucide="${theorySourceIcon(block.label)}"></i><b>${escapeHtml(block.label)}</b></dt><dd>${renderTheorySourceBody(block.lines)}</dd></div>`).join('')}</dl></section>`;
}

function renderTheorySourceBlocks(label, title, paragraphs, theoryName = '') {
  const blocks = parseTheorySourceBlocks(paragraphs, theoryName);
  if (!blocks.length) return '';
  const nav = blocks.map((block, index) => `<a href="#theory-source-block-${index}" title="跳转到${escapeHtml(block.label)}"><span>${String(index + 1).padStart(2, '0')}</span>${escapeHtml(block.label)}</a>`).join('');
  const cards = blocks.map((block, index) => `<article class="theory-source-block" id="theory-source-block-${index}"><header><span class="theory-source-block-index">${String(index + 1).padStart(2, '0')}</span><div><h3>${escapeHtml(block.label)}</h3></div><i data-lucide="${theorySourceIcon(block.label)}"></i></header><div class="theory-source-block-body">${renderTheorySourceBody(block.lines)}</div></article>`).join('');
  return `<section class="theory-source-reading theory-source-reading-segmented"><div class="theory-source-reading-head"><div><p class="kicker">${escapeHtml(label)}</p><h3>${escapeHtml(title)}</h3></div><span>${blocks.length} 个内容模块</span></div><div class="theory-source-layout"><nav class="theory-source-outline" aria-label="理论详情目录"><p>本页目录</p>${nav}</nav><div class="theory-source-blocks">${cards}</div></div></section>`;
}

const THEORY_DETAIL_SUBJECTS = [
  { key: '数学', label: '小学数学', icon: 'sigma', pattern: /小学数学|数学课|数与代数|图形与几何|加减法|分数|小数|方程|平均数|圆的认识/ },
  { key: '语文', label: '小学语文', icon: 'book-open-text', pattern: /小学语文|语文课|阅读教学|写作教学|课文|古诗|朗读|作文/ },
  { key: '英语', label: '小学英语', icon: 'languages', pattern: /小学英语|英语课|词汇|语法|听说读写|English|Colours/i },
  { key: '科学', label: '小学科学', icon: 'flask-conical', pattern: /小学科学|科学课|科学探究|实验教学|观察实验/ },
  { key: '道德与法治', label: '道德与法治', icon: 'landmark', pattern: /道德与法治|思政课|品德课/ },
  { key: '音乐', label: '小学音乐', icon: 'music-2', pattern: /小学音乐|音乐课|歌唱|节奏/ },
  { key: '美术', label: '小学美术', icon: 'palette', pattern: /小学美术|美术课|绘画|造型/ },
  { key: '体育', label: '小学体育', icon: 'activity', pattern: /小学体育|体育课|运动技能/ },
  { key: '信息技术', label: '信息技术', icon: 'monitor-cog', pattern: /信息技术|数字化|人工智能|编程课/ }
];

function splitTheoryParadigmSource(paragraphs) {
  const parts = { paradigm: [], application: [] };
  let mode = 'paradigm';
  (Array.isArray(paragraphs) ? paragraphs : []).forEach((paragraph) => {
    const text = String(paragraph || '').trim();
    if (/学科具体应用|学科应用范围|^\s*3[\.．、]\s*学科/.test(text)) mode = 'application';
    parts[mode].push(text);
  });
  return parts;
}

function splitTheoryThirdSource(paragraphs) {
  const parts = { application: [], example: [], comparison: [], training: [] };
  let mode = 'application';
  (Array.isArray(paragraphs) ? paragraphs : []).forEach((paragraph) => {
    const text = String(paragraph || '').trim();
    if (/学科应用|学科具体应用|通用应用范围/.test(text) && !/课堂范本|课堂案例|具体课例/.test(text)) mode = 'application';
    if (/课堂范本|课堂案例|具体课例|优质落地课堂|案例\s*\d*/.test(text)) mode = 'example';
    if (/功能二|相似理论对比辨析|对比组合/.test(text)) mode = 'comparison';
    if (/功能三|情境判断训练|情境训练（|情境训练\(|训练题|^\s*题目\s*[：:]/.test(text)) mode = 'training';
    parts[mode].push(text);
  });
  return parts;
}

function getTheorySubjectDefinition(value, strict = false) {
  const text = String(value || '');
  if (strict) {
    const heading = normalizeTheorySourceText(stripTheoryEntryMarker(text));
    const explicit = THEORY_DETAIL_SUBJECTS.find((subject) => heading === normalizeTheorySourceText(subject.label));
    // Strict mode is used while parsing a standalone subject heading. Do not
    // fall back to keyword matching here: a normal lesson line such as
    // “7、小数加法……” must remain inside the current case.
    return explicit || null;
  }
  return THEORY_DETAIL_SUBJECTS.find((subject) => subject.pattern.test(text)) || null;
}

function stripTheoryEntryMarker(value) {
  return String(value || '')
    .replace(/^\s*(?:[（(]\d+[）)]|[①②③④⑤⑥⑦⑧⑨⑩⑪⑫]|\d+[\.．、])\s*/, '')
    .replace(/[：:]\s*$/, '')
    .trim();
}

function getTheoryRelatedItems(item) {
  const records = typeof getAllTheoryDirectoryRecords === 'function' ? getAllTheoryDirectoryRecords() : [];
  const current = records.find((record) => record.name === item.name);
  const related = current
    ? records.filter((record) => record.name !== item.name && record.group?.name === current.group?.name).slice(0, 4).map(ensureDirectoryTheoryProfile)
    : learningTheoryProfiles.filter((profile) => profile.id !== item.id && profile.group === item.group).slice(0, 4);
  return related.filter(Boolean);
}

function safeTheoryRepresentativeUrl(value) {
  try {
    const url = new URL(String(value || ""));
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

function getTheoryRepresentativePathValue(record, key) {
  const value = record?.[key];
  return String(value && typeof value === "object" ? value.name : value || "").trim();
}

function getTheoryRepresentativeContextRecord(item) {
  const records = typeof getAllTheoryDirectoryRecords === "function" ? getAllTheoryDirectoryRecords() : [];
  const theoryKey = normalizeTheorySourceText(item?.name);
  const path = Array.isArray(assistantState.theory.directoryPath) ? assistantState.theory.directoryPath : [];
  const exactSelection = path.length >= 3
    ? records.find((record) => record.categoryIndex === Number(path[0])
      && record.sectionIndex === Number(path[1])
      && record.groupIndex === Number(path[2])
      && normalizeTheorySourceText(record.name) === theoryKey)
    : null;
  if (exactSelection) return exactSelection;
  const nameMatches = records.filter((record) => normalizeTheorySourceText(record.name) === theoryKey);
  return nameMatches.length === 1 ? nameMatches[0] : null;
}

function getTheoryRepresentativeRecord(theoryName, catalogueRecord = null) {
  const records = Array.isArray(window.THEORY_REPRESENTATIVE_LINKS_DATA?.theories)
    ? window.THEORY_REPRESENTATIVE_LINKS_DATA.theories
    : [];
  const key = normalizeTheorySourceText(theoryName);
  const nameMatches = records.filter((record) => normalizeTheorySourceText(record?.theory_name) === key);
  if (!nameMatches.length) return null;
  const cataloguePath = ["category", "section", "group"].map((part) => normalizeTheorySourceText(getTheoryRepresentativePathValue(catalogueRecord, part)));
  const hasFullCataloguePath = cataloguePath.every(Boolean);
  const pathMatch = hasFullCataloguePath
    ? nameMatches.find((record) => ["category", "section", "group"].every((part, index) => (
      normalizeTheorySourceText(getTheoryRepresentativePathValue(record, part)) === cataloguePath[index]
    )))
    : null;
  // Duplicate names can only be resolved by their complete catalogue path.
  const match = pathMatch || (nameMatches.length === 1 ? nameMatches[0] : null);
  if (!match) return null;
  const representatives = [];
  const seen = new Set();
  (Array.isArray(match?.representatives) ? match.representatives : []).forEach((person) => {
    const name = String(person?.name || "").trim();
    const url = safeTheoryRepresentativeUrl(person?.url);
    const signature = `${normalizeTheorySourceText(name)}\n${url}`;
    if (!name || seen.has(signature)) return;
    seen.add(signature);
    representatives.push({ name, url });
  });
  return {
    theory_name: theoryName,
    category: match.category,
    section: match.section,
    group: match.group,
    representatives
  };
}

function renderTheoryRepresentativeLinks(representatives) {
  const items = (Array.isArray(representatives) ? representatives : []).map((person) => {
    const name = String(person?.name || "").trim();
    const url = safeTheoryRepresentativeUrl(person?.url);
    if (!name) return "";
    if (!url) return `<span class="theory-representative-person is-unlinked"><i data-lucide="user-round"></i>${escapeHtml(name)}</span>`;
    return `<a class="theory-representative-person" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" title="查看${escapeHtml(name)}的权威资料"><i data-lucide="external-link"></i><span>${escapeHtml(name)}</span></a>`;
  }).filter(Boolean);
  return items.length ? `<div class="theory-representative-links" aria-label="代表人物与理论来源链接">${items.join("")}</div>` : "";
}

function renderTheoryReferenceRows(blocks) {
  return blocks.map((block) => {
    const links = renderTheoryRepresentativeLinks(block.representatives);
    return `<div class="theory-reference-info-row"><dt><span><i data-lucide="${theorySourceIcon(block.label)}"></i></span><b>${renderTheoryDisplayLabel(block.label)}</b></dt><dd>${renderTheorySourceBody(block.lines)}${links}</dd></div>`;
  }).join('');
}

function renderTheoryExplanationReference(item, paragraphs) {
  const parsedBlocks = parseTheorySourceBlocks(paragraphs, item.name);
  let blocks = parsedBlocks.length ? parsedBlocks : [
    { label: '理论定位', lines: [item.core] },
    { label: '主领域分类', lines: [item.group] },
    { label: '次领域标签', lines: [item.tags.join('、')] },
    { label: '课堂落地方式', lines: [item.improvement] },
    { label: '理论局限', lines: [item.risk] }
  ];
  const representativeRecord = getTheoryRepresentativeRecord(item.name, getTheoryRepresentativeContextRecord(item));
  if (representativeRecord?.representatives?.length) {
    const representativeIndex = blocks.findIndex((block) => ['代表人物', '代表人物/理论来源', '理论来源'].includes(block.label));
    if (representativeIndex >= 0) {
      blocks = blocks.map((block, index) => index === representativeIndex
        ? { ...block, representatives: representativeRecord.representatives }
        : block);
    } else {
      const insertAt = Math.max(0, blocks.findIndex((block) => block.label === '内涵'));
      blocks = [
        ...blocks.slice(0, insertAt),
        { label: '代表人物/理论来源', lines: [], representatives: representativeRecord.representatives },
        ...blocks.slice(insertAt)
      ];
    }
  }
  const explanationExcludedLabels = new Set(['AI理论识别规则', 'AI 理论识别规则', '教师行为', '学生行为', '课堂语言']);
  const explanationBlocks = blocks.filter((block) => !explanationExcludedLabels.has(block.label));
  const primaryLabels = new Set(['英文名称', '英文别称', '别名', '主领域分类', '次领域标签', '理论定位', '提出背景', '代表人物', '代表人物/理论来源', '理论来源', '内涵', '核心观点', '关键判断标准', '关键判定标准']);
  const primary = explanationBlocks.filter((block) => primaryLabels.has(block.label));
  const concepts = explanationBlocks.filter((block) => !primaryLabels.has(block.label) && block.label !== '原文概览');
  const visiblePrimary = primary.length ? primary : explanationBlocks.slice(0, Math.min(explanationBlocks.length, 10));
  const visibleConcepts = concepts.length ? concepts : explanationBlocks.slice(visiblePrimary.length);
  const related = getTheoryRelatedItems(item);
  const relationNodes = related.length ? related : item.tags.slice(0, 4).map((name, index) => ({ id: '', name, group: index ? '关联概念' : item.group }));
  return `<section class="theory-reference-layout">
    <article class="theory-reference-basic-card">
      <header class="theory-reference-section-head"><span><i data-lucide="contact-round"></i></span><div><p>BASIC INFORMATION</p><h3>基本信息</h3></div></header>
      <dl class="theory-reference-info-list">${renderTheoryReferenceRows(visiblePrimary)}</dl>
    </article>
    <aside class="theory-reference-side">
      <article class="theory-reference-map-card">
        <header class="theory-reference-section-head"><span><i data-lucide="orbit"></i></span><div><p>RELATION MAP</p><h3>理论关系图谱</h3></div></header>
        <div class="theory-reference-orbit theory-reference-relation-map">
          <div class="theory-relation-spine" aria-hidden="true"></div>
          <span class="theory-reference-orbit-center">${escapeHtml(item.name)}</span>
          ${relationNodes.slice(0, 4).map((node, index) => node.id
            ? `<button type="button" class="relation-node relation-node-${index + 1}" data-theory-id="${node.id}"><span class="relation-node-label">${escapeHtml(node.name)}</span></button>`
            : `<span class="relation-node relation-node-${index + 1}"><span class="relation-node-label">${escapeHtml(node.name)}</span></span>`).join('')}
        </div>
      </article>
      <article class="theory-reference-related-card">
        <header class="theory-reference-section-head"><span><i data-lucide="sparkles"></i></span><div><p>RELATED READING</p><h3>关联推荐</h3></div></header>
        <div class="theory-reference-related-list">${related.length ? related.slice(0, 4).map((profile, index) => `<button type="button" data-theory-id="${profile.id}"><span>${String(index + 1).padStart(2, '0')}</span><div><b>${escapeHtml(profile.name)}</b><small>${escapeHtml(profile.group)}</small></div><i data-lucide="arrow-up-right"></i></button>`).join('') : item.tags.slice(0, 4).map((tag, index) => `<div><span>${String(index + 1).padStart(2, '0')}</span><b>${escapeHtml(tag)}</b></div>`).join('')}</div>
      </article>
    </aside>
  </section>${visibleConcepts.length ? `<section class="theory-reference-concepts"><header class="theory-reference-section-head"><span><i data-lucide="notebook-tabs"></i></span><div><p>KEY CONCEPTS</p><h3>关键概念释义</h3></div></header><dl class="theory-reference-concept-list">${renderTheoryReferenceRows(visibleConcepts)}</dl></section>` : ''}`;
}

function parseTheoryParadigmEntries(paragraphs, theoryName) {
  const lines = cleanTheorySourceParagraphs(paragraphs, theoryName);
  const generalIndex = lines.findIndex((line) => /通用应用范围/.test(line));
  const applicationIndex = lines.findIndex((line, index) => index > generalIndex && /学科具体应用|学科应用范围/.test(line));
  const coreLines = (generalIndex >= 0 ? lines.slice(0, generalIndex) : lines)
    .filter((line) => !/教理范式/.test(line) && !/^\s*(?:\d+[\.．、]?\s*)?通用应用范围\s*[：:]?\s*$/.test(line))
    .map((line) => line.replace(/^\s*(?:\d+[\.．、]\s*)?[^：:]{0,90}核心适用逻辑\s*[：:]\s*/, '').trim())
    .filter(Boolean);
  const generalLines = generalIndex >= 0
    ? lines.slice(generalIndex + 1, applicationIndex >= 0 ? applicationIndex : lines.length)
    : [];
  const entries = [];
  let current = null;
  generalLines.forEach((line) => {
    const heading = line.match(/^\s*(?:[（(]\d+[）)]|[①②③④⑤⑥⑦⑧⑨⑩⑪⑫]|\d+[\.．、])\s*(.+)$/);
    if (heading && heading[1].trim().length <= 90) {
      const rawTitle = heading[1].trim();
      const inlineSeparator = rawTitle.search(/[：:]/);
      const title = inlineSeparator >= 0 ? rawTitle.slice(0, inlineSeparator).trim() : rawTitle;
      const inlineBody = inlineSeparator >= 0 ? rawTitle.slice(inlineSeparator + 1).trim() : '';
      current = { title: stripTheoryEntryMarker(title), lines: inlineBody ? [inlineBody] : [] };
      entries.push(current);
      return;
    }
    if (current) current.lines.push(line);
  });
  return {
    core: coreLines.filter((line) => !/^\s*\d+\s*通用应用范围/.test(line)).join(' '),
    entries: entries.filter((entry) => entry.title && !/通用应用范围|核心适用逻辑|教理范式/.test(entry.title))
  };
}

const THEORY_PARADIGM_TITLES = [
  '教学设计顶层标准',
  '课堂价值纠偏',
  '学生课堂行为处理',
  '评课、反思、说课核心依据',
  '学科德育、新课标素养落地顶层指导'
];

function isMeaningfulTheoryCardContent(lines, title = '', context = '') {
  const values = (Array.isArray(lines) ? lines : [])
    .map((line) => String(line || '').trim())
    .filter(Boolean);
  if (!values.length) return false;
  const content = values.join(' ').replace(/^[：:]+/, '').trim();
  const contentKey = normalizeTheorySourceText(content);
  const rejectedKeys = [title, context].map(normalizeTheorySourceText).filter(Boolean);
  if (!contentKey || rejectedKeys.includes(contentKey)) return false;
  if (/^(?:小学|初中|高中)?(?:语文|数学|英语|科学|音乐|美术|体育|信息技术|道德与法治)(?:课堂)?(?:范本|应用)?$/.test(content.replace(/\s/g, ''))) return false;
  if (values.every((line) => /^(?:课堂范本|课堂案例|具体课例|理论解读|通用应用范围|学科具体应用|学科应用范围)[：:]?$/.test(line))) return false;
  return content.replace(/[\s\p{P}\p{S}]/gu, '').length >= 6;
}

function renderTheoryParadigmPanel(item, paragraphs, fallbackCards) {
  const parsed = parseTheoryParadigmEntries(paragraphs, item.name);
  const fallbackEntries = (Array.isArray(fallbackCards) ? fallbackCards : [])
    .map(([title, body]) => ({ title, lines: [body] }))
    .filter((entry) => isMeaningfulTheoryCardContent(entry.lines, entry.title));
  const sourceEntries = parsed.entries.length ? parsed.entries : fallbackEntries;
  const fallbackLines = [
    item.core,
    item.improvement,
    item.subject,
    item.improvement,
    `把${item.name}转化为学科育人目标、课堂机会和可观察的学习证据，推动核心素养在真实任务中落地。`
  ];
  const entries = THEORY_PARADIGM_TITLES.map((title, index) => {
    const titleKey = normalizeTheorySourceText(title);
    const sourceEntry = sourceEntries.find((entry) => {
      const entryKey = normalizeTheorySourceText(entry.title);
      return entryKey === titleKey || entryKey.includes(titleKey) || titleKey.includes(entryKey);
    });
    return {
      title,
      // Keep each card bound to the source heading with the same meaning. An
      // absent paragraph remains absent instead of borrowing the next card's
      // body and silently assigning it to the wrong application range.
      lines: sourceEntry ? sourceEntry.lines : [fallbackLines[index]]
    };
  });
  return `<section class="theory-v3-panel theory-paradigm-panel"><header class="theory-v3-heading"><span><i data-lucide="boxes"></i></span><div><p>TEACHING PARADIGM</p><h3>教理范式</h3></div></header><article class="theory-core-logic"><div><i data-lucide="sparkles"></i><strong>核心适用逻辑</strong></div><p>${escapeHtml(parsed.core || item.core)}</p></article><div class="theory-general-applications"><h4>通用应用范围</h4><div>${entries.map((entry, index) => `<article><span>${String(index + 1).padStart(2, '0')}</span><div><h5>${escapeHtml(entry.title)}</h5>${renderTheorySourceBody(entry.lines)}</div></article>`).join('')}</div></div></section>`;
}

function groupTheoryApplications(paragraphs, theoryName) {
  const lines = cleanTheorySourceParagraphs(paragraphs, theoryName);
  const groups = new Map();
  let group = null;
  let entry = null;
  let activeCase = null;
  const ensureGroup = (subject) => {
    const definition = subject || { key: '通用', label: '通用学科', icon: 'layout-grid' };
    if (!groups.has(definition.key)) groups.set(definition.key, { ...definition, entries: [] });
    return groups.get(definition.key);
  };
  lines.forEach((line) => {
    const subject = getTheorySubjectDefinition(line, true);
    if (subject && stripTheoryEntryMarker(line).length <= 24) {
      group = ensureGroup(subject);
      entry = null;
      activeCase = null;
      return;
    }
    if (/学科具体应用|学科应用范围/.test(line) && line.length <= 40) return;
    if (!group) group = ensureGroup(getTheorySubjectDefinition(line) || null);
    const caseMatch = line.match(/具体课例\s*[：:]?\s*(.*)$/);
    if (caseMatch) {
      if (!entry) {
        entry = { title: `${group.label}课堂应用`, lines: [], cases: [] };
        group.entries.push(entry);
      }
      const lesson = line.match(/《[^》]+》/)?.[0] || `课例 ${entry.cases.length + 1}`;
      activeCase = { title: lesson, lines: caseMatch[1] ? [caseMatch[1]] : [] };
      entry.cases.push(activeCase);
      return;
    }
    const heading = line.match(/^\s*(?:[①②③④⑤⑥⑦⑧⑨⑩⑪⑫]|[（(]\d+[）)])\s*(.+)$/);
    if (heading && heading[1].trim().length <= 90) {
      entry = { title: stripTheoryEntryMarker(line), lines: [], cases: [] };
      group.entries.push(entry);
      activeCase = null;
      return;
    }
    if (!entry) {
      entry = { title: `${group.label}应用要点`, lines: [], cases: [] };
      group.entries.push(entry);
    }
    if (activeCase) activeCase.lines.push(line);
    else entry.lines.push(line);
  });
  return [...groups.values()].map((item) => {
    const entries = item.entries.map((entryItem) => ({
      ...entryItem,
      // This sentence is a section-level explanation, not a separate
      // classroom application. Keeping it beside the concrete case makes
      // the same lesson appear twice in the rendered panel.
      lines: entryItem.lines.filter((line) => !/^将.+作为.+核心依据/.test(String(line || '').trim())),
      cases: entryItem.cases.map((caseItem) => {
        const genericTitlePrefix = /^以《[^》]*》(?:（[^）]*）|\([^)]*\))?为例[，,:：]?\s*/;
        return {
          ...caseItem,
          lines: (caseItem.lines || []).map((line, index) => {
            const text = String(line || '').trim();
            return index === 0 ? text.replace(genericTitlePrefix, '').trim() : text;
          }).filter(Boolean).filter((line) => !/^将.+作为.+核心依据/.test(line))
        };
      })
    }));

    // The same lesson is often supplied once for design, once for reflection,
    // and once for unit integration. Keep the shortest complete version so
    // one textbook lesson is represented by one readable case card.
    const bestCaseByTitle = new Map();
    entries.forEach((entryItem) => entryItem.cases.forEach((caseItem) => {
      const key = normalizeTheorySourceText(caseItem.title);
      if (!key) return;
      const score = caseItem.lines.join('').length;
      const previous = bestCaseByTitle.get(key);
      if (!previous || score < previous.score) bestCaseByTitle.set(key, { caseItem, score });
    }));

    return {
      ...item,
      entries: entries.map((entryItem) => ({
        ...entryItem,
        cases: entryItem.cases.filter((caseItem) => bestCaseByTitle.get(normalizeTheorySourceText(caseItem.title))?.caseItem === caseItem)
      })).filter((entryItem) => isMeaningfulTheoryCardContent(
        [...entryItem.lines, ...entryItem.cases.flatMap((caseItem) => caseItem.lines || [])],
        entryItem.title,
        item.label
      ))
    };
  }).filter((item) => item.entries.length);
}

function groupTheoryClassroomCases(paragraphs, theoryName) {
  const lines = cleanTheorySourceParagraphs(paragraphs, theoryName)
    .map((line) => String(line || '').replace(/^p(?=(?:教师|理论解读))/, '').trim())
    .filter(Boolean);
  const groups = new Map();
  let currentCase = null;
  let mode = 'overview';
  const isQualityMarker = (line) => /优质(?:(?!常态).){0,40}(?:课堂|实践)/.test(line);
  const isImplicitQualityStart = (line) => {
    if (!currentCase || mode === 'interpretation' || mode === 'quality') return false;
    const text = String(line || '').trim();
    if (!text) return false;

    // A few source documents omit the bracketed quality-class heading. Their
    // first quality paragraph still carries a stable instructional signature.
    // Recognize that signature so the complete quality lesson stays together.
    const qualityLead = /^(?:教师(?:以|围绕|依据|通过|把|将|采用|设计|组织)[^。！？；;]{0,160}(?:核心育人目标|育人目标|教学设计|教学流程|任务|理论|教学目标)|分层预案|明确目标与底线|解释任务价值|适度放权|接纳多样化路径|效果评估|绩效期望(?:提升|的)|努力期望(?:降低|的)|社会影响增强|便利条件保障|调节变量精准识别|感知有用性(?:提升|的)|感知易用性(?:提升|的)|双维度协同驱动|区域教育管理部门依托|数据采集层|存储与计算层|建模与算法层|应用与可视化层|课前预备常规|课中行为常规|练习作答常规|整套常规体系)/.test(text.replace(/\s+/g, ''));
    // The source occasionally contains several normal-lesson paragraphs
    // before the quality lesson starts. Do not require a fixed paragraph
    // count here: line wrapping in the source can change that count.
    if (mode === 'overview') return qualityLead;
    return mode === 'normal' && qualityLead;
  };
  const ensureGroup = (subject) => {
    const definition = subject || { key: '通用', label: '通用课堂', icon: 'presentation' };
    if (!groups.has(definition.key)) groups.set(definition.key, { ...definition, cases: [] });
    return groups.get(definition.key);
  };
  lines.forEach((line) => {
    if (/^(?:课堂落地范本|课堂范本)(?:原文)?\s*[：:]?$/.test(line) || (/课堂落地范本/.test(line) && line.length <= 40)) return;
    const subjectHeading = getTheorySubjectDefinition(line, true);
    if (subjectHeading && stripTheoryEntryMarker(line).length <= 24) {
      ensureGroup(subjectHeading);
      currentCase = null;
      mode = 'overview';
      return;
    }
    const caseMatch = line.match(/^(?:[0-9０-９]+[\.．、]\s*)?案例\s*(\d+)?\s*[：:]\s*(.+)$/);
    if (caseMatch) {
      const subject = getTheorySubjectDefinition(caseMatch[2]) || null;
      const group = ensureGroup(subject);
      currentCase = { title: caseMatch[2], normal: [], quality: [], interpretation: [], overview: [] };
      group.cases.push(currentCase);
      mode = 'overview';
      return;
    }
    if (!currentCase) {
      // Ignore the source block's introductory prose until an actual case
      // marker appears. Otherwise the preface becomes a duplicate “课堂范本” card.
      return;
    }
    if (line.includes('常态') && line.includes('课堂')) { mode = 'normal'; return; }
    if (isQualityMarker(line)) { mode = 'quality'; return; }
    if (isImplicitQualityStart(line)) { mode = 'quality'; currentCase.quality.push(line); return; }
    if (/^理论解读\s*[：:]/.test(line)) {
      mode = 'interpretation';
      const inlineInterpretation = line.replace(/^理论解读\s*[：:]\s*/, '').trim();
      if (inlineInterpretation) currentCase[mode].push(inlineInterpretation);
      return;
    }
    if (/^理论解读\s*$/.test(line)) { mode = 'interpretation'; return; }
    currentCase[mode].push(line);
  });
  return [...groups.values()].map((group) => ({
    ...group,
    cases: group.cases.filter((caseItem) => {
      const content = [...caseItem.overview, ...caseItem.normal, ...caseItem.quality, ...caseItem.interpretation];
      return isMeaningfulTheoryCardContent(content, caseItem.title, group.label);
    })
  })).filter((group) => group.cases.length);
}

function renderTheorySubjectTabs(groups, activeKey, mode, suffix) {
  return `<div class="theory-v3-subject-tabs">${groups.map((group) => `<button type="button" class="${group.key === activeKey ? 'active' : ''}" data-theory-detail-subject="${escapeHtml(group.key)}" data-theory-detail-subject-mode="${mode}"><i data-lucide="${group.icon}"></i><span>${escapeHtml(group.label)}${suffix}</span>${mode === 'application' || mode === 'example' ? '' : `<small>${group.cases.length}</small>`}</button>`).join('')}</div>`;
}

const THEORY_APPLICATION_TITLE_SUFFIXES = [
  '课时教学设计顶层育人校准',
  '课堂教学行为精准价值纠偏',
  '课堂学情互动与学生品格培育',
  '评课、试讲反思、说课核心理论依据',
  '新课标素养、单元整体教学顶层落地指导',
  '课堂专属局限性提示'
];

function getTheoryApplicationTitles(subjectLabel) {
  return THEORY_APPLICATION_TITLE_SUFFIXES.map((suffix) => `${subjectLabel}${suffix}`);
}

function renderTheoryApplicationPanel(item, paragraphs, fallback) {
  const groups = groupTheoryApplications(paragraphs, item.name);
  if (!groups.length) groups.push({ key: '通用', label: '通用学科', icon: 'layout-grid', entries: [{ title: '学科应用建议', lines: [fallback.body || item.subject], cases: [] }] });
  if (!assistantState.theory.detailSubjects) assistantState.theory.detailSubjects = { application: '', example: '' };
  const activeKey = groups.some((group) => group.key === assistantState.theory.detailSubjects.application) ? assistantState.theory.detailSubjects.application : groups[0].key;
  assistantState.theory.detailSubjects.application = activeKey;
  const active = groups.find((group) => group.key === activeKey);
  const titles = getTheoryApplicationTitles(active.label);
  const fallbackLines = [
    item.subject,
    item.improvement,
    `围绕${item.name}记录学生的理解、表达、操作与协作表现，并据此调整课堂支持。`,
    `用课堂事实、学生作品和教师话语检验${item.name}是否真正进入教学决策。`,
    `把${item.name}转化为单元目标、学习任务和可观察证据，推动学科素养落地。`,
    `不能脱离具体课情、学生年龄和学习证据机械套用${item.name}。`
  ];
  const entries = titles.map((title, index) => {
    const source = active.entries[index] || { lines: [], cases: [] };
    const sourceLines = source.lines?.length ? source.lines : [fallbackLines[index]];
    return { ...source, title, lines: sourceLines };
  });
  return `<section class="theory-v3-panel theory-subject-panel"><header class="theory-v3-heading"><span><i data-lucide="graduation-cap"></i></span><div><p>SUBJECT APPLICATION</p><h3>学科应用</h3></div></header>${renderTheorySubjectTabs(groups, activeKey, 'application', '')}<div class="theory-subject-group"><header><div><p>当前学科</p><h4>${escapeHtml(active.label)}学科应用</h4></div></header><div class="theory-subject-applications">${entries.map((entry, index) => `<article class="${/局限|边界/.test(entry.title) ? 'limitation' : ''}"><header><span>${String(index + 1).padStart(2, '0')}</span><h4>${escapeHtml(entry.title)}</h4></header><div>${renderTheorySourceBody(entry.lines)}</div>${(entry.cases || []).map((caseItem) => `<section class="theory-v2-case"><header><i data-lucide="school"></i><strong>${escapeHtml(caseItem.title)}</strong></header>${renderTheorySourceBody(caseItem.lines)}</section>`).join('')}</article>`).join('')}</div></div></section>`;
}

function renderTheoryClassroomPanel(item, paragraphs, actors) {
  const groups = groupTheoryClassroomCases(paragraphs, item.name);
  if (!groups.length) groups.push({ key: '通用', label: '通用课堂', icon: 'presentation', cases: [{ title: '课堂范本', normal: [], quality: [item.example], interpretation: [], overview: [] }] });
  if (!assistantState.theory.detailSubjects) assistantState.theory.detailSubjects = { application: '', example: '' };
  const activeKey = groups.some((group) => group.key === assistantState.theory.detailSubjects.example) ? assistantState.theory.detailSubjects.example : groups[0].key;
  assistantState.theory.detailSubjects.example = activeKey;
  const active = groups.find((group) => group.key === activeKey);
  const caseCards = active.cases.map((caseItem, index) => {
    const normalBlock = caseItem.normal.length
      ? `<section class='normal'><header><i data-lucide='triangle-alert'></i><b>常态课堂</b></header>${renderTheorySourceBody(caseItem.normal)}</section>`
      : '';
    const qualityLines = caseItem.quality.length ? caseItem.quality : caseItem.overview;
    const qualityBlock = qualityLines.length
      ? `<section class='quality'><header><i data-lucide='badge-check'></i><b>优质落地课堂</b></header>${renderTheorySourceBody(qualityLines)}</section>`
      : '';
    const interpretationBlock = caseItem.interpretation.length
      ? `<section class='theory-classroom-interpretation'><header><i data-lucide='book-open-check'></i><b>理论解读</b></header><div>${renderTheorySourceBody(caseItem.interpretation)}</div></section>`
      : '';
    return `<article class='theory-classroom-case'><header><span>${String(index + 1).padStart(2, '0')}</span><div><p>${escapeHtml(active.label)}课堂范本</p><h4>${escapeHtml(caseItem.title)}</h4></div></header>${caseItem.overview.length ? `<div class='theory-case-overview'>${renderTheorySourceBody(caseItem.overview)}</div>` : ''}<div class='theory-classroom-contrast'>${normalBlock}${qualityBlock}</div>${interpretationBlock}</article>`;
  }).join('');
  return `<section class='theory-v3-panel theory-template-panel'><header class='theory-v3-heading'><span><i data-lucide='presentation'></i></span><div><p>CLASSROOM TEMPLATES</p><h3>课堂范本</h3></div></header>${renderTheorySubjectTabs(groups, activeKey, 'example', '课堂范本')}<div class='theory-classroom-cases'>${caseCards}</div></section>`;
}

function parseTheoryComparison(paragraphs, item) {
  const lines = (Array.isArray(paragraphs) ? paragraphs : []).map((line) => stripTheorySourceHeading(line, item.name)).map((line) => String(line || '').trim()).filter(Boolean);
  const comboLine = lines.find((line) => /对比组合\s*[：:]/.test(line));
  const participants = comboLine ? comboLine.replace(/^.*?对比组合\s*[：:]\s*/, '').split(/[、，,；;]/).map((value) => value.trim()).filter(Boolean) : [];
  const dimensionDefinitions = [
    { label: '核心界定', aliases: ['核心界定'] },
    { label: '关注焦点', aliases: ['关注焦点'] },
    { label: '适用场景', aliases: ['适用场景'] },
    { label: '课堂操作', aliases: ['课堂操作', '课堂操作方式'] },
    { label: '边界提醒', aliases: ['边界提醒'] }
  ];
  const dimensionLabels = dimensionDefinitions.map((definition) => definition.label);
  const isDimensionHeading = (line) => dimensionDefinitions.some((definition) => definition.aliases.some((alias) => line === alias || line.startsWith(`${alias}：`) || line.startsWith(`${alias}:`)));
  const dimensions = dimensionLabels.map((label) => {
    const definition = dimensionDefinitions.find((itemDefinition) => itemDefinition.label === label);
    const sourceLabel = definition?.aliases.find((alias) => lines.some((line) => line === alias || line.startsWith(`${alias}：`) || line.startsWith(`${alias}:`)));
    const start = sourceLabel ? lines.findIndex((line) => line === sourceLabel || line.startsWith(`${sourceLabel}：`) || line.startsWith(`${sourceLabel}:`)) : -1;
    if (start < 0) return null;
    const end = lines.findIndex((line, index) => index > start && (isDimensionHeading(line) || ['深度辨析总结'].some((marker) => line === marker || line.startsWith(`${marker}：`) || line.startsWith(`${marker}:`))));
    const first = lines[start].slice(sourceLabel.length).replace(/^[：:]?\s*/, '').trim();
    const values = [first, ...lines.slice(start + 1, end < 0 ? lines.length : end)].filter(Boolean);
    const count = Math.max(1, participants.length);
    const grouped = [];
    if (values.length > count && values.length % count === 0) {
      const size = values.length / count;
      for (let index = 0; index < count; index += 1) grouped.push(values.slice(index * size, (index + 1) * size).join('\n'));
    } else {
      for (let index = 0; index < count; index += 1) grouped.push(values[index] || '原文未单独说明。');
    }
    return { label: definition.label, values: grouped };
  }).filter(Boolean);
  const summaryIndex = lines.findIndex((line) => /深度辨析总结/.test(line));
  const summary = summaryIndex >= 0 ? [lines[summaryIndex].replace(/^.*?深度辨析总结\s*[：:]?\s*/, ''), ...lines.slice(summaryIndex + 1)].filter(Boolean).join(' ') : '';
  if (participants.length && dimensions.length) {
    if (!dimensions.some((dimension) => dimension.label === '课堂操作')) {
      const operation = {
        label: '课堂操作',
        values: participants.map((participant, index) => {
          if (index === 0) return item.improvement;
          const profile = typeof getTheoryProfileByName === 'function' ? getTheoryProfileByName(participant) : null;
          return profile?.improvement || ('结合' + participant + '的核心机制设计任务、支架和反馈，并用学生的表达、操作与作品证据检验教学。');
        })
      };
      const boundaryIndex = dimensions.findIndex((dimension) => dimension.label === '边界提醒');
      dimensions.splice(boundaryIndex < 0 ? dimensions.length : boundaryIndex, 0, operation);
    }
    return { participants, dimensions, summary };
  }
  const related = getTheoryRelatedItems(item).slice(0, 2);
  const fallbackParticipants = [item.name, ...related.map((profile) => profile.name), '常见误用'].slice(0, 4);
  return {
    participants: fallbackParticipants,
    dimensions: [
      { label: '核心界定', values: fallbackParticipants.map((name, index) => index === 0 ? item.core : index === fallbackParticipants.length - 1 ? `只使用“${item.tags[0]}”等术语，却没有对应课堂证据。` : `${name}从相邻机制补充解释课堂现象。`) },
      { label: '关注焦点', values: fallbackParticipants.map((name, index) => index === 0 ? item.mechanism : index === fallbackParticipants.length - 1 ? '形式标签与快速归因' : name) },
      { label: '适用场景', values: fallbackParticipants.map((name, index) => index === 0 ? item.subject : index === fallbackParticipants.length - 1 ? '不适合作为专业课堂判断' : '用于补充相邻解释视角') },
      { label: '课堂操作', values: fallbackParticipants.map((name, index) => index === 0 ? item.improvement : index === fallbackParticipants.length - 1 ? '先下结论，再寻找片段印证' : '结合真实证据进行交叉验证') },
      { label: '边界提醒', values: fallbackParticipants.map((name, index) => index === 0 ? item.risk : index === fallbackParticipants.length - 1 ? '缺少事实链与机制说明' : '不可替代当前理论的核心机制') }
    ],
    summary: `辨析时应先明确${item.name}的核心机制，再比较相近理论对同一课堂事实的解释边界，避免只凭术语相似就快速归类。`
  };
}

function renderTheoryComparisonPanel(item, paragraphs) {
  const data = parseTheoryComparison(paragraphs, item);
  if (!assistantState.theory.comparisonTargets) assistantState.theory.comparisonTargets = {};
  const availableTargets = data.participants.map((participant, index) => ({ participant, index })).filter(({ index }) => index > 0);
  const savedTarget = Number(assistantState.theory.comparisonTargets[item.id]);
  const targetIndex = availableTargets.some(({ index }) => index === savedTarget) ? savedTarget : (availableTargets[0]?.index || 0);
  assistantState.theory.comparisonTargets[item.id] = targetIndex;
  const visibleIndexes = targetIndex ? [0, targetIndex] : [0];
  const visibleParticipants = visibleIndexes.map((index) => data.participants[index]).filter(Boolean);
  return `<section class="theory-v3-panel theory-comparison-panel"><header class="theory-v3-heading"><span><i data-lucide="scale"></i></span><div><p>THEORY COMPARISON</p><h3>理论辨析</h3></div></header><article class="theory-comparison-group"><h4>${escapeHtml(item.name)}及相近观点辨析</h4>${availableTargets.length ? `<div class="theory-comparison-picker"><span>选择对比理论</span><div>${availableTargets.map(({ participant, index }) => `<button type="button" class="${index === targetIndex ? 'active' : ''}" data-theory-comparison-target="${index}">${escapeHtml(participant)}</button>`).join('')}</div></div>` : ''}<div class="theory-participant-tags">${visibleParticipants.map((participant, index) => `<span class="${index === 0 ? 'mapped' : 'comparison-target'}"><i data-lucide="${index === 0 ? 'circle-check' : 'git-compare'}"></i>${escapeHtml(participant)}<small>${index === 0 ? '当前理论' : '当前对比项'}</small></span>`).join('')}</div><div class="theory-comparison-table-wrap"><table><thead><tr><th>对比维度</th>${visibleParticipants.map((participant) => `<th>${escapeHtml(participant)}</th>`).join('')}</tr></thead><tbody>${data.dimensions.map((dimension) => `<tr><th>${escapeHtml(dimension.label)}</th>${visibleIndexes.map((index) => `<td>${escapeHtml(dimension.values[index] || '原文未单独说明。')}</td>`).join('')}</tr>`).join('')}</tbody></table></div><div class="theory-comparison-mobile">${data.dimensions.map((dimension) => `<section><h5>${escapeHtml(dimension.label)}</h5>${visibleIndexes.map((sourceIndex) => `<dl><dt>${escapeHtml(data.participants[sourceIndex] || '')}</dt><dd>${escapeHtml(dimension.values[sourceIndex] || '原文未单独说明。')}</dd></dl>`).join('')}</section>`).join('')}</div>${data.summary ? `<aside class="theory-comparison-summary"><i data-lucide="badge-info"></i><div><b>深度辨析总结</b><p>${escapeHtml(data.summary)}</p></div></aside>` : ''}</article></section>`;
}

function splitTheoryApplicationSource(paragraphs) {
  const parts = { application: [], example: [], training: [] };
  let mode = 'application';
  paragraphs.forEach((paragraph) => {
    const text = String(paragraph);
    if (/课堂范本|课堂案例|具体课例|优质落地课堂|案例\d*/.test(text)) mode = 'example';
    if (/情境训练|情境判断|情境辨析|训练题|备考易错/.test(text)) mode = 'training';
    if (/学科应用|学科具体应用|课堂落地方式|通用应用范围|适用范围/.test(text) && !/课堂范本|具体课例/.test(text)) mode = 'application';
    parts[mode].push(text);
  });
  return parts;
}

function getTheoryTrainingPrompt(paragraphs, theoryName = '') {
  const lines = Array.isArray(paragraphs) ? paragraphs : [];
  const questionIndex = lines.findIndex((paragraph) => /题目\s*[：:]/.test(String(paragraph)));
  if (questionIndex >= 0) {
    const inline = String(lines[questionIndex]).replace(/^.*?题目\s*[：:]\s*/, '').trim();
    return inline || String(lines[questionIndex + 1] || '').trim();
  }
  const first = lines.find((paragraph) => String(paragraph).trim().length > 30);
  return first ? String(first).trim() : (theoryName ? `围绕“${theoryName}”识别课堂中的关键证据。` : '请结合课堂事实判断理论依据。');
}

function renderTheorySourceParagraphs(paragraphs, extraClass = '') {
  return (Array.isArray(paragraphs) ? paragraphs : []).map((paragraph) => {
    const text = String(paragraph).trim();
    if (!text) return '';
    return `<p class="theory-source-line${extraClass ? ` ${extraClass}` : ''}">${escapeHtml(text)}</p>`;
  }).join('');
}

// The directory contains more entries than the curated dialogue profiles.
// Create a lightweight local profile for every directory entry so every card
// can open a detail view before the backend content is connected.
const directoryTheoryProfiles = new Map();

function createDirectoryTheoryId(name) {
  let hash = 2166136261;
  for (const character of String(name || "")) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return `directory-theory-${(hash >>> 0).toString(36)}`;
}

function getTheoryProfileById(id) {
  return learningTheoryProfiles.find((item) => item.id === id)
    || [...directoryTheoryProfiles.values()].find((item) => item.id === id)
    || null;
}

function getTheoryProfileByName(name) {
  return learningTheoryProfiles.find((item) => item.name === name)
    || [...directoryTheoryProfiles.values()].find((item) => item.name === name)
    || null;
}

// Condensed classroom-facing notes from 理论库汇总(1) for the 13 entries in
// 教育技术基础理论(现代教育技术与教学设计理论). The backend can replace
// these fields with the full knowledge-base record later.
const theoryDirectoryContentOverrides = {
  "系统化教学设计理论（ISD）": {
    core: "把学习者、目标、内容、媒体、活动与评价视为相互关联的系统，按分析、设计、开发、实施、评价形成可迭代的教学闭环。",
    tags: ["系统分析", "ADDIE闭环", "教学要素适配"],
    subject: "适合用于课前学情与任务分析、目标校准、资源开发、课堂实施和课后评价迭代。",
    example: "以小学数学图形面积课为例，先分析学生已有经验与转化困难，再设计操作探究、公式推导、分层练习和课后错题复盘。",
    improvement: "用分析—设计—实施—评价四个节点检查目标、活动、资源和评价是否真正对齐。"
  },
  "加涅九段教学事件": {
    core: "通过引起注意、告知目标、唤起先备知识、呈现内容、提供指导、引出表现、反馈、评价和促进保持迁移，组织一条完整的学习支持链。",
    tags: ["九段事件", "学习支持", "保持与迁移"],
    subject: "适合检查一节课是否既有有效导入，也有练习反馈和迁移任务。",
    example: "新课导入先用问题引起注意，明确学习目标，唤醒旧知，再通过示例、提示、练习和即时反馈帮助学生形成新知。",
    improvement: "把课堂流程逐段标注，重点补齐目标告知、反馈和迁移环节。"
  },
  "ARCS动机设计模型": {
    core: "从注意、相关性、自信和满意四个维度设计学习动机，让学生愿意进入任务、看见任务价值、相信自己能完成并获得真实成就感。",
    tags: ["注意", "相关性", "自信与满意"],
    subject: "适合用于诊断课堂导入、任务情境、难度梯度和成果反馈是否持续支持学习动机。",
    example: "把抽象知识放入学生熟悉的生活问题中，设置可完成的分层任务，并用过程性反馈让学生看到自己的进步。",
    improvement: "每个核心任务至少补充一个动机支点，并检查是否有可感知的完成反馈。"
  },
  "媒体选择理论": {
    core: "媒体不是越多越好，应根据教学目标、内容特征、学习者条件、环境资源和使用成本选择最能支持理解与表达的媒介。",
    tags: ["目标适配", "媒介选择", "资源成本"],
    subject: "适合用于判断课件、视频、实物、互动工具是否真正解决了课堂中的理解任务。",
    example: "需要观察运动轨迹时使用短视频或实物演示，需要比较关系时使用可操作图示，避免为装饰而叠加媒体。",
    improvement: "为每个媒体写清楚它解决的具体学习问题，并删除不能提供额外证据的装饰内容。"
  },
  "多媒体学习认知理论": {
    core: "学习者通过视觉和言语两个通道加工信息，但每个通道容量有限，教学应帮助学生主动选择、组织和整合关键信息。",
    tags: ["双通道", "认知加工", "信息整合"],
    subject: "适合用于检查课件的文字、图像、声音与讲解是否协同，避免冗余和无关信息增加认知负荷。",
    example: "用图示呈现结构关系，教师口头解释关键变化，同时删去与目标无关的装饰文字。",
    improvement: "对每页课件进行信号、分段和一致性检查，把学生注意力引向核心关系。"
  },
  "学习环境设计理论": {
    core: "学习环境由物理空间、数字资源、社会互动、任务和反馈共同构成，应围绕学习活动提供可进入、可操作、可协作的支持。",
    tags: ["学习环境", "任务支持", "协作反馈"],
    subject: "适合用于设计线上线下混合课堂、探究任务、小组协作和学习资源入口。",
    example: "在探究任务中同时提供材料、操作步骤、同伴讨论空间和阶段性反馈，让学生能够持续推进问题解决。",
    improvement: "把每个关键任务需要的资源、角色、空间和反馈节点补齐。"
  },
  "认知负荷理论（信息化视角）": {
    core: "学习资源应管理内在负荷、减少外在负荷并促进有益的生成性加工，让有限的工作记忆服务于理解和建构。",
    tags: ["内在负荷", "外在负荷", "生成性加工"],
    subject: "适合用于诊断课件拥挤、步骤跳跃、无关动画和一次性信息过多等课堂问题。",
    example: "将复杂任务分段呈现，先突出关键结构，再逐步增加变化条件，并为首次学习者提供必要提示。",
    improvement: "拆分过长指令，减少无关信息，为难点增加分步示范和可撤销的支架。"
  },
  "ADDIE 模型": {
    core: "以分析、设计、开发、实施、评价五个阶段组织教学设计，并根据评价结果回到前面阶段迭代优化。",
    tags: ["分析", "设计开发", "评价迭代"],
    subject: "适合用于课时设计、单元资源开发和课堂实施后的系统复盘。",
    example: "先分析学情和教学任务，再设计目标与流程，开发任务单和课件，实施课堂，最后用学习证据评价并改进。",
    improvement: "把当前教案按五个阶段检查，优先修正没有证据支撑的目标和活动。"
  },
  "ASSURE 模型": {
    core: "围绕学习者分析、目标陈述、方法媒体材料选择、资源使用、学习者参与和评价修订组织一节技术支持的课堂。",
    tags: ["学习者分析", "媒体使用", "参与评价"],
    subject: "适合用于检查数字资源是否从学习者特征出发，并真正转化为学生的参与行为。",
    example: "先分析班级差异，明确可观察目标，选择合适媒体，安排学生操作和讨论，再依据表现修订资源。",
    improvement: "在资源清单旁补充适用学情、学生操作方式和评价证据。"
  },
  "迪克 - 凯里信息化教学设计模型": {
    core: "以系统方法拆解教学目标、学习者与情境、任务分析、行为目标、评价工具、教学策略和教学材料，形成彼此对齐的系统设计。",
    tags: ["系统方法", "任务分析", "目标评价对齐"],
    subject: "适合用于复杂课题、单元教学和需要明确评价证据的教学设计。",
    example: "从终点能力反推任务和评价，再根据学习者已有能力设计教学策略、材料与练习序列。",
    improvement: "先确认最终表现和评价标准，再回填每个教学活动的必要性。"
  },
  "联通主义学习理论": {
    core: "学习发生在信息、工具、人与资源形成的网络连接中，重要的不只是记住知识，也包括发现信息、判断可靠性并持续更新连接的能力。",
    tags: ["网络连接", "信息判断", "持续更新"],
    subject: "适合用于网络资源探究、协作学习、开放任务和数字素养培养。",
    example: "让学生比较多个来源，建立主题资源图谱，在协作交流中说明选择依据并及时修正自己的判断。",
    improvement: "为开放任务增加资源筛选、来源标注和连接更新的学习要求。"
  },
  "多模态学习理论": {
    core: "学习者通过文字、图像、声音、动作和空间关系等多种模态理解意义，设计应让不同模态互相补充，而不是简单叠加。",
    tags: ["多模态", "意义建构", "模态互补"],
    subject: "适合用于语言、艺术、科学和数字化课堂中图文声动作的协同设计。",
    example: "在讲解概念时结合关键图示、口头说明、学生操作和作品表达，让学生用不同方式解释同一个关系。",
    improvement: "检查每一种模态承担的意义，删除重复呈现，增加学生主动表达和转换的机会。"
  },
  "视听传播理论": {
    core: "教学媒介是一种传播系统，信息需要经过编码、通道传递、学习者解码和反馈才能真正转化为理解，清晰的结构和适切的符号十分重要。",
    tags: ["视听传播", "符号编码", "反馈"],
    subject: "适合用于视频课件、微课、演示实验和课堂讲授中的信息组织与反馈设计。",
    example: "短视频先明确观看任务，画面突出关键变化，教师用语言补充因果关系，观看后用问题和作品检查理解。",
    improvement: "为每段视听材料补充观看目的、关键线索和观看后的反馈任务。"
  }
};

// The five detail tabs mirror the three source blocks in 理论库汇总(1):
// block 1 explains the theory, block 2 describes the teaching paradigm, and
// block 3 supplies subject application, classroom examples and practice.
const theoryDetailModules = {
  "教育本质论": {
    paradigm: [
      ["确认育人目的", "先判断课堂要促进学生怎样的发展，再决定知识、活动与技术工具的取舍。"],
      ["统整人的发展", "同时关注认知、情感、社会性与价值观，避免把课堂压缩成知识传递。"],
      ["联系文化传承", "把学科内容放进真实文化经验和共同生活中，让学习具有公共意义。"],
      ["回到教育价值", "用学生是否获得真实发展来检验活动效果，而不是只看效率或完成数量。"]
    ],
    evidence: "课程目标、学生作品、表达变化、参与关系与课后迁移记录。",
    actors: ["教师先说明活动所服务的育人目标，再选择内容和工具。", "学生能够说出学习内容与自身发展、共同生活的联系。", "观察目标是否从‘完成任务’落到可见的发展证据。"],
    training: "一节课加入了很多数字工具，但学生没有形成理解、表达或合作成果。应如何依据教育本质论重新判断？"
  },
  "建构主义学习理论": {
    paradigm: [
      ["激活已有经验", "从学生已有概念、经验和真实问题出发，先让学生表达当前解释。"],
      ["创设认知任务", "用问题、材料或反例形成需要解释的矛盾，推动学生主动探究。"],
      ["协作协商意义", "通过生生交流、证据比较和教师支架，让不同解释在互动中被检验。"],
      ["反思并结构化", "学生修正原有理解，教师帮助把探究结果概括为稳定的知识结构。"]
    ],
    evidence: "学生的初始解释、探究过程、同伴回应、修正后的作品或概念表达。",
    actors: ["教师提供问题情境和必要支架，不直接替代学生完成建构。", "学生基于经验提出假设、比较证据并解释自己的修正。", "观察学生是否经历了‘原有理解—证据冲突—概念重建’。"],
    training: "学生提出了不同解释，教师马上公布标准答案。如何调整课堂，才能让学生完成真正的意义建构？"
  },
  "人本主义学习理论": {
    paradigm: [
      ["建立安全关系", "用真诚、尊重和可预期的课堂规则，保证学生敢于表达和尝试。"],
      ["回应真实需要", "关注学生的情绪、兴趣、准备状态和困难，不把沉默简单判断为懒惰。"],
      ["提供适度选择", "在共同目标下提供任务难度、材料或表达方式的选择，支持学习自主性。"],
      ["促进自我评价", "用成长性、描述性的反馈帮助学生理解自己的进步和下一步方向。"]
    ],
    evidence: "学生的选择、情绪表达、自我评价、持续参与和成长性作品。",
    actors: ["教师表达期待并提供支持，同时保留学生合理选择的空间。", "学生能够说明自己的需要、选择和改进目标。", "观察尊重是否转化为学生真实的主体参与，而非无原则放任。"],
    training: "教师为了照顾学生感受取消了共同目标和必要要求。如何在尊重学生与保持教学方向之间取得平衡？"
  },
  "布鲁纳发现学习理论": {
    paradigm: [
      ["准备结构材料", "提供正例、变式和反例，让学生有机会观察关系而不是只接收结论。"],
      ["提出猜想", "要求学生比较、分类和描述规律，先形成自己的解释。"],
      ["验证适用范围", "用新案例检验猜想，发现哪些条件保持不变、哪些条件会改变结果。"],
      ["归纳知识结构", "由学生说明概念关系，教师在此基础上完成准确、简洁的结构化表达。"]
    ],
    evidence: "学生的分类标准、猜想记录、反例解释、新案例验证和归纳表达。",
    actors: ["教师控制材料梯度并提供必要提示，不预先说出规律。", "学生通过操作、比较和验证主动发现关系。", "观察学生是否能把发现迁移到材料之外的新例子。"],
    training: "教师通过连续提示让学生很快说出预设规律。怎样调整材料和提问，保留发现过程？"
  },
  "情境认知理论": {
    paradigm: [
      ["进入真实任务", "用学生能够理解的生活、职业或公共问题承载学习目标，而不只把情境当作导入。"],
      ["使用工具参与", "让学生在真实工具、材料和规则中完成观察、协作与决策。"],
      ["加入实践共同体", "通过角色分工、协作表达和共同成果，让知识在共同活动中被使用。"],
      ["迁移并反思", "回到真实任务检验方法是否有效，并说明知识如何支持行动和判断。"]
    ],
    evidence: "真实任务过程、工具使用、角色协作、公开成果与迁移决策。",
    actors: ["教师设计贯穿始终的真实任务，而不是只用故事包装知识。", "学生在任务中使用知识、工具和语言解决实际问题。", "观察情境是否持续支撑核心知识与成果，而非只制造热闹。"],
    training: "教师用生活故事导入后马上回到脱离情境的机械练习。如何让情境继续支撑后续学习？"
  },
  "教学对话理论（IRF）": {
    paradigm: [
      ["教师发起", "用开放问题、任务或追问启动学生的思考，而不是只要求复述标准答案。"],
      ["学生回应", "保留多种回答和解释的空间，关注学生如何说明理由、回应同伴。"],
      ["反馈推进", "教师反馈不止是判断对错，而是通过追问、复述和提示推动思维继续发展。"],
      ["形成多声对话", "在基本IRF链之外增加生生回应、同伴质疑和共同归纳，避免教师独占话语权。"]
    ],
    evidence: "教师发起、学生回应、反馈类型、话轮分布、生生对话和观点修正。",
    actors: ["教师暂缓立即评价，邀请复述、补充或质疑，并把反馈转为下一步问题。", "学生回应教师，也直接回应同伴的观点和证据。", "观察课堂是否从单一师问生答转向多向意义协商。"],
    training: "教师连续提问、学生简短回答、教师立即给出标准答案。哪些话语证据表明IRF链没有推动思维？"
  },
  "苏格拉底式问答法": {
    paradigm: [
      ["澄清概念", "先追问关键词和判断边界，确认学生到底在说什么。"],
      ["追问依据", "要求学生说明证据、理由和推理过程，而不是只重复结论。"],
      ["检验假设", "通过反例、条件变化和追问后果，检验原判断是否仍然成立。"],
      ["修正判断", "学生根据新证据修改解释，并说明自己为什么改变或坚持。"]
    ],
    evidence: "问题链、学生理由、反例回应、条件变化后的判断和自我修正。",
    actors: ["教师围绕概念、依据和条件设计递进追问，不把答案藏在问题里。", "学生用证据解释、质疑和修正自己的判断。", "观察追问是否促进推理，还是变成教师控制下的猜答案。"],
    training: "教师不断追问‘为什么’，但学生只是在猜教师想要的答案。如何提高追问的证据性和开放性？"
  },
  "等待时间理论": {
    paradigm: [
      ["提出开放问题", "问题需要有解释空间，不能只有一个快速回忆的短答案。"],
      ["保留思考时间", "提问后明确停顿，让学生独立思考、书写或组织理由。"],
      ["扩大回应范围", "先邀请不同准备状态的学生，再让学生相互回应，不只等待最快举手者。"],
      ["用反馈推进", "根据较完整的回答继续追问，让等待转化为更高质量的思考。"]
    ],
    evidence: "提问后的停顿时长、首个回答时间、回答长度、参与人数和同伴回应。",
    actors: ["教师提出问题后不抢答，用稳定停顿和书写提示保护思考时间。", "学生先形成个人判断，再用完整理由参与表达。", "观察等待是否带来更广参与和更复杂回答，而不是单纯拖延。"],
    training: "开放问题提出两秒后教师自己回答。怎样设计停顿、书写和回应顺序，扩大参与？"
  },
  "形成性评价理论": {
    paradigm: [
      ["明确学习目标", "先让教师和学生知道要形成什么理解、表现或作品，建立可判断的成功标准。"],
      ["收集学习证据", "通过提问、作品、操作、随堂任务和自评获取反映学习状态的证据。"],
      ["解释证据", "判断学生已经理解什么、在哪里卡住，以及证据与目标之间还差什么。"],
      ["反馈并调整", "给出具体、可执行的下一步，并据此调整教师支架和学生学习行动。"]
    ],
    evidence: "学习目标、课堂提问、学习作品、描述性反馈、教学调整和学生后续表现。",
    actors: ["教师把评价嵌入教学过程，反馈‘哪里有效、为什么、下一步怎样做’。", "学生依据标准自评、互评并修改自己的作品或解释。", "观察评价信息是否真的改变了后续教学和学习，而不是只留下分数。"],
    training: "教师对学生回答只说‘很好’并继续讲课。哪些证据表明这不是有效的形成性评价？"
  },
  "学习迁移理论": {
    paradigm: [
      ["识别共同结构", "帮助学生比较旧任务和新任务，发现两个问题背后的关系，而不是只看表面形式。"],
      ["建立方法映射", "让学生说明原方法中的哪些步骤、条件和理由可以迁移。"],
      ["进行变式应用", "改变条件、表征或问题方向，要求学生独立判断方法是否适用。"],
      ["解释迁移边界", "学生说明为什么能迁移、哪里需要调整，并用新情境检验理解。"]
    ],
    evidence: "旧新任务比较、策略选择、变式解答、迁移理由和新情境表现。",
    actors: ["教师提供结构比较和变式任务，不替学生直接指出迁移关系。", "学生独立判断、调整方法并解释适用条件。", "观察学生是否能在没有教师提示时识别共同结构。"],
    training: "学生在原题中表现很好，换一个情境后不会做。应优先补充哪类教学证据和任务？"
  },
  "社会互动学习理论": {
    paradigm: [
      ["建立积极互赖", "设置共同目标和互补资源，让成员需要通过合作才能完成任务。"],
      ["落实个体责任", "为每位学生分配明确角色和可追踪贡献，避免小组中的搭便车。"],
      ["促进高质量对话", "要求成员相互解释、比较观点、质疑理由并共同解决分歧。"],
      ["评价共同产出", "兼顾小组成果与个体贡献，让合作过程和最终成果都成为学习证据。"]
    ],
    evidence: "分组规则、角色责任、生生对话、分歧处理、共同成果和个体贡献。",
    actors: ["教师设计异质分组、角色和共同成果，并持续观察合作质量。", "学生承担个人责任，同时通过解释和协商完成共同任务。", "观察合作是否产生了新的共同理解，而不只是把任务分给不同人。"],
    training: "小组完成了作品，但只有一名学生发言，其余学生没有明确贡献。怎样判断并修正合作设计？"
  },
  "数学表征理论": {
    paradigm: [
      ["操作表征", "用实物、学具或动作呈现数量、空间和关系，让抽象概念先获得可感知经验。"],
      ["图形表征", "把操作过程画成图、线段图或结构图，显化数量关系和变化路径。"],
      ["符号表征", "把图示和语言转化为算式、公式或符号，并说明符号对应的意义。"],
      ["双向转换", "安排符号到图示、图示到操作的逆向任务，检验学生是否真正理解关系。"]
    ],
    evidence: "操作记录、图示、语言解释、算式或公式，以及不同表征之间的转换。",
    actors: ["教师引导学生在操作、图形、语言和符号之间往返转换。", "学生不仅给出算式，还能解释算式对应的操作和图形意义。", "观察学生是否会做形式转换，也能说明各表征之间的关系。"],
    training: "学生能根据图形写出算式，却说不清算式表示的操作过程。下一步应增加什么任务？"
  },
  "多媒体学习认知理论": {
    paradigm: [
      ["选择关键信息", "根据学习目标删去与理解无关的装饰、重复文字和无效动画。"],
      ["组织双通道材料", "让视觉图像与言语讲解承担互补功能，避免同一段文字同时拥挤在画面上。"],
      ["降低外在负荷", "分段、邻近、提示和同步呈现关键关系，减少学生寻找信息的无关加工。"],
      ["促进主动整合", "用预测、解释、标注和复述任务，让学生把新信息与已有知识连接起来。"]
    ],
    evidence: "课件信息量、图文关系、提示位置、学生解释质量和资源使用后的学习表现。",
    actors: ["教师围绕核心关系组织文字、图像、声音与节奏，不追求媒体数量。", "学生通过预测、标注、复述和解释主动加工信息。", "观察媒体是否帮助学生建立模型，而不是只增加观看和操作。"],
    training: "课件同时播放长段文字、配音和装饰动画，学生记不住重点。应从哪些设计原则入手修改？"
  }
};

// Source-aligned detail modules for the 13 theories in
// 理论库汇总(1)/第一块、第二块、第三块/教育技术理论.
// The UI keeps five tabs, while the content follows the three source blocks:
// explanation, paradigm, and application/example/training.
Object.assign(theoryDetailModules, {
  "系统化教学设计理论（ISD）": {
    explanation: "将教学视为一套完整、科学、可迭代的系统工程，把学习者、教学目标、内容、媒体、活动与评价作为相互关联的整体，依托分析、设计、开发、实施、评价形成闭环。",
    boundary: "流程标准化能够提升教评一致性，但完整执行的备课成本较高，不能用固定步骤替代课堂生成，也不能忽略学生的个体差异。",
    paradigm: [
      ["分析学习者与任务", "研判学情、教材重难点、教学环境和资源条件，明确学生的认知起点与真实任务。"],
      ["校准目标与活动", "把育人目标转写为可观察表现，并让教学活动、媒体资源和评价证据逐项对齐。"],
      ["开发并实施方案", "开发课件、任务单、习题等资源，按结构化流程实施，减少活动冗余和资源脱节。"],
      ["评价、复盘与迭代", "用过程性和结果性证据定位短板，回到前面的分析与设计环节持续修订。"]
    ],
    application: {
      body: "第三块以小学数学《平行四边形的面积》为例：分析学生已掌握长方形面积，但图形割补转化思维薄弱；据此设计“猜想—剪拼操作—对比分析—公式推导—分层运用”的完整流程，并用随堂检测和错题数据优化下一课。",
      improvement: "把当前教案按学情分析、目标设定、活动资源、课堂实施和评价迭代逐项核对，优先修正没有证据支撑的目标和活动。"
    },
    example: {
      body: "课堂范本：人教版小学数学五年级上册《平行四边形的面积》。教师先用校园菜地情境提出问题，再提供方格纸、剪刀和透明方格片，放手让学生剪拼探究，最后通过错题复盘补充“寻找对应底和高”的专项活动。",
      actors: ["教师先分析学情并搭建探究支架，按照猜想、操作、比较、归纳、迁移推进课堂。", "学生通过剪拼、表达和分层练习经历公式生成，而不是直接背诵结论。", "记录学生的操作过程、解释语言、公式运用和课后错题变化。"]
    },
    evidence: "学情诊断、素养目标、活动资源、学习作品、随堂检测和课后修订记录。",
    training: "一位教师直接讲公式、做例题、刷题，跳过学情分析与探究过程。请判断ISD闭环缺少哪些环节，并提出一项可执行的重构动作。"
  },
  "加涅九段教学事件": {
    explanation: "把课堂拆解为与认知加工规律相匹配的九个递进环节：引起注意、告知目标、唤起旧知、呈现新知、提供指导、促成练习、反馈纠错、学业评价、巩固迁移。",
    boundary: "九段事件是认知流程框架，不是每种课型都必须机械完整套用；复习课、短课时或生成性探究需要根据任务压缩和重排。",
    paradigm: [
      ["唤醒与定向", "用问题或情境引起注意，明确学习目标，并通过旧知回顾建立认知桥梁。"],
      ["呈现与支架", "分层呈现新知，提供示例、提示和学法指导，帮助学生形成可操作的理解路径。"],
      ["表现与反馈", "安排练习和任务输出，及时反馈纠错，让学生把新知转化为自己的表现。"],
      ["评价与迁移", "用当堂评价检验学习结果，再用新情境和拓展任务促进保持与迁移。"]
    ],
    application: {
      body: "第三块以小学数学《面积》大单元为例，用“校园花坛铺草皮”贯穿单元，按概念建构、规律探究和综合应用组织各课时，在每节课中补齐注意、目标、旧知、新知、练习、反馈与迁移链条。",
      improvement: "逐段标注现有课堂流程，优先补齐目标告知、旧知联结、反馈纠错和迁移任务，避免导入冗长、练习单一和学用脱节。"
    },
    example: {
      body: "课堂范本：部编版小学语文四年级上册《观潮》。以钱塘江大潮视频引起注意，明确品读目标，回顾景物描写方法，再按潮来前、潮来时、潮过后的顺序品析文本，最后用片段表达完成迁移。",
      actors: ["教师控制认知节奏，明确目标，分层呈现材料并在练习后及时反馈。", "学生先连接旧知，再通过品读、批注、表达和迁移任务形成完整学习表现。", "记录注意投入、目标理解、学生回应、练习结果与迁移表达。"]
    },
    evidence: "导入与目标告知、旧知回应、新知呈现、学习支架、练习反馈、评价结果和迁移作品。",
    training: "一节课直接讲新知并刷题，学生不知道目标，也没有反馈和迁移。请按九段事件指出最先要补上的认知环节。"
  },
  "ARCS动机设计模型": {
    explanation: "凯勒提出的ARCS模型从注意（Attention）、相关性（Relevance）、自信（Confidence）和满意（Satisfaction）四个维度设计并维持学习动机。",
    boundary: "ARCS主要解决学习动力和参与问题，不能替代知识结构、认知加工、技能训练与系统教学设计；新奇情境也不能等同于真实动机。",
    paradigm: [
      ["吸引并维持注意", "用问题悬念、真实现象和适度变化抓取注意，同时让注意服务于学习目标。"],
      ["建立任务相关性", "连接生活经验、旧知、学科价值和成长需要，让学生理解为什么要学。"],
      ["搭建成功通道", "提供分层任务、适切支架和可达成的挑战，让学生逐步形成自我效能感。"],
      ["形成真实满意感", "用描述性反馈、成果展示和进步证据，让学生看到努力与成长的关系。"]
    ],
    application: {
      body: "第三块以数学《20以内的进位加法》和《圆》单元为例：用生活情境激活注意，联系购物和车轮建立价值感，设置小棒操作与分层任务形成自信，再通过方法展示和项目成果给予满意反馈。",
      improvement: "围绕一个核心任务分别检查注意、相关性、自信、满意四个维度，避免只靠游戏导入却没有后续任务和成长证据。"
    },
    example: {
      body: "课堂范本：人教版小学数学一年级上册《20以内的进位加法》。教师用开火车口算和购物故事激趣，联系10以内加减法，提供小棒操作、凑十法和想加算减的分层支架，再通过思路展示和进步评价巩固动机。",
      actors: ["教师根据学情设计情境、梯度任务和正向反馈，而不是用外部奖惩维持纪律。", "学生选择适合自己的方法，表达思路并在成功体验中形成学习信心。", "记录注意持续时间、任务选择、尝试次数、表达质量和进步反馈。"]
    },
    evidence: "学生注意投入、任务价值表达、任务坚持、支架使用、成果展示和自我评价。",
    training: "课堂导入很热闹，但学生进入新知后迅速失去兴趣。请按ARCS四维度定位问题，并补充一个能维持动机的任务设计。"
  },
  "媒体选择理论": {
    explanation: "不存在脱离目标和场景的万能媒体。媒体选择必须适配学习目标、内容特征、学生条件、课堂环境与使用成本，服务于理解、表达和素养落地。",
    boundary: "媒体越丰富不等于学习效果越好；视频、动画或实物不能替代学生的观察、操作和思考，选择时还要考虑可见度、设备和课堂时间。",
    paradigm: [
      ["先明确教学目标", "先判断要促进概念理解、技能操作还是情感体验，再决定是否需要媒体。"],
      ["匹配内容属性", "抽象过程可用动态演示，实操技能需要真实示范，文本品读可用图文和音频，避免一物多用。"],
      ["检查学情与场景", "考虑年龄、先备知识、班额、设备可用性和课堂时长，建立目标—媒体匹配关系。"],
      ["验证使用效果", "观察媒体是否带来更好的理解或表达，删除只增加装饰和操作负担的内容。"]
    ],
    application: {
      body: "第三块强调媒体服务于学科任务：数学几何可用动态课件，科学危险实验可用演示视频，英语交际可用短情境视频，而核心探究和口语输出仍要回到学生操作与互动。",
      improvement: "为每个媒体写清楚它解决的学习问题、使用时机和学生输出，不能因为已有视频或课件就默认使用。"
    },
    example: {
      body: "课堂范本：小学科学《杠杆的科学》中，教师把核心探究还给学生，用杠杆尺和钩码获取数据，课件只在实验后汇总各组数据，帮助学生比较用力点与拉力的关系。",
      actors: ["教师根据目标选择实物、视频或图示，并控制媒体时长与使用节点。", "学生通过观察、操作和数据解释完成学习，而不是只观看媒体。", "记录媒体使用前后的任务表现、学生操作、讨论质量和理解证据。"]
    },
    evidence: "目标—媒体匹配说明、资源使用时机、学生操作与表达、任务结果和媒体删改记录。",
    training: "教师用动画替代科学实验，学生看懂了画面却不会操作。请判断媒体选择的偏差，并重新安排实物、课件和数据讨论。"
  },
  "多媒体学习认知理论": {
    explanation: "梅耶多媒体学习认知理论基于双通道、容量有限和主动加工三个假设：学习者要主动选择、组织并整合文字与图像信息，设计应减少无关加工。",
    boundary: "双通道不是把文字、图片、配音全部叠加；学习者先备知识和个体差异会改变效果，原则需要结合目标和学情使用。",
    paradigm: [
      ["筛选关键信息", "依据目标删去装饰、重复文字和无关动画，把注意力引向核心关系。"],
      ["组织图文声关系", "让图像与讲解互相补充，避免屏幕文字与配音逐字重复造成拥挤。"],
      ["降低外在负荷", "采用分段、预训练、信号、空间邻近和时间邻近等方式减少寻找信息的加工。"],
      ["促进主动整合", "用预测、标注、解释和复述，让学生把新材料与已有知识结构连接起来。"]
    ],
    application: {
      body: "第三块将理论用于数学、语文、英语和科学资源设计：复杂过程用分段动画，关键关系用信号和邻近标注，配音不再逐字重复屏幕文字，并为观看后安排预测、解释或操作任务。",
      improvement: "逐页检查课件的信息量、图文位置、配音重复和学生输出，优先删减无关内容，再补充能促进主动加工的任务。"
    },
    example: {
      body: "课堂范本：小学科学中讲解食物消化过程时，动态课件呈现食物经过口腔、食道、胃和肠道的路径，教师只用口头语言补充因果关系，并用简易肺部教具让学生动手体验。",
      actors: ["教师用切块、预训练、信号和邻近原则组织材料，不追求媒体数量。", "学生通过预测、标注、复述和操作主动加工信息。", "记录学生对关键关系的解释、课件信息搜索行为和任务后的理解表现。"]
    },
    evidence: "课件文字与图像关系、分段节点、提示位置、学生标注与解释、资源使用后的学习表现。",
    training: "课件同时播放长段文字、逐字配音和装饰动画，学生记不住重点。请指出至少三处认知负荷问题并提出修改。"
  },
  "学习环境设计理论": {
    explanation: "学习环境不只是教室或平台界面，而是由物理空间、数字资源、社会互动、任务与反馈共同构成的学习支持系统，应围绕学习活动提供可进入、可操作和可协作的条件。",
    boundary: "增加设备、资源和互动不等于环境变好；环境设计必须服务于核心任务，并兼顾可达性、认知负荷、角色分工和真实反馈。",
    paradigm: [
      ["围绕学习者设计", "分析学生的经验、需要和进入任务的障碍，提供适合的资源入口与支架。"],
      ["组织真实任务", "让知识、材料、工具和评价围绕一个有意义的问题或成果组织起来。"],
      ["形成协作共同体", "设计角色、规则、讨论和共同成果，让学习在互动中发生。"],
      ["嵌入反馈与反思", "在任务推进中提供阶段反馈和反思空间，帮助学生调整策略与作品。"]
    ],
    application: {
      body: "第三块适用于探究课、混合式课堂和小组协作：同时提供任务说明、材料工具、资源入口、同伴讨论空间和阶段反馈，让学生能够持续推进问题解决。",
      improvement: "围绕每个关键任务补齐资源、角色、空间、规则和反馈节点，避免平台功能很多但学生不知道下一步做什么。"
    },
    example: {
      body: "课堂范本：在科学探究任务中，教师安排材料区、记录区、讨论区和成果展示区，为小组提供操作步骤、数据记录模板和阶段检查点，学生用共同成果推进协作。",
      actors: ["教师设计空间、资源、角色和反馈节点，持续观察环境是否支持任务。", "学生使用材料、工具和同伴关系完成真实问题解决。", "记录资源使用、角色协作、任务推进和阶段反馈后的调整。"]
    },
    evidence: "任务入口、资源可及性、空间与工具使用、角色分工、协作话语、阶段反馈和最终成果。",
    training: "平台里有大量资源，但学生仍不知道如何开始探究。请从任务、资源入口、协作角色和反馈节点四方面重构学习环境。"
  },
  "认知负荷理论（信息化视角）": {
    explanation: "认知负荷理论区分内在负荷、外在负荷和生成性负荷：教学应管理任务本身的复杂度，减少无关呈现，并把有限的工作记忆用于理解、联系和建构。",
    boundary: "降低负荷不是把任务变简单，也不是永远提供完整提示；随着先备知识和熟练度变化，支架要逐步撤除，并警惕专家逆转效应。",
    paradigm: [
      ["拆解内在复杂度", "把复杂任务按先决关系和步骤分段，先帮助学生建立关键结构。"],
      ["减少外在干扰", "删除无关动画、装饰和重复指令，优化文字、图像、声音和操作路径。"],
      ["支持生成性加工", "用示范、自我解释、比较和练习，促使学生主动组织和整合信息。"],
      ["动态调整支架", "根据学生的先备知识和表现逐步增加变化、撤除提示，并检查是否真正理解。"]
    ],
    application: {
      body: "第三块把理论用于信息化课件、复杂任务和科学实验：先突出关键结构，再逐步增加条件；将过长指令、拥挤画面和无关动画拆分或删去，为首次学习者提供必要提示。",
      improvement: "把一项高负荷任务拆成可观察步骤，分别检查信息呈现、操作路径和学生解释，避免只靠降低题目难度解决问题。"
    },
    example: {
      body: "课堂范本：复杂图形或科学过程先用分步图示和口头讲解呈现结构，再让学生独立完成变式任务；课件只突出关键变化，避免一次性展示完整复杂流程。",
      actors: ["教师控制信息节奏，依据学情提供分步示范、提示和逐步撤架。", "学生通过比较、解释和操作把外部信息转化为自己的结构。", "记录任务完成时间、错误类型、提示使用和独立解决表现。"]
    },
    evidence: "课件拥挤点、指令长度、步骤跳跃、提示使用、学生错误类型和独立迁移表现。",
    training: "首次学习者面对同时出现的长文字、复杂图示和多个操作按钮而频繁出错。请区分内在负荷与外在负荷，并提出分步设计。"
  },
  "ADDIE 模型": {
    explanation: "ADDIE以分析（Analysis）、设计（Design）、开发（Development）、实施（Implementation）、评价（Evaluation）组织教学设计，并根据评价结果回到前面阶段迭代。",
    boundary: "ADDIE是可循环的设计框架，不是一次性线性流程；日常课时可以轻量化使用，不应为了填表而增加形式性环节。",
    paradigm: [
      ["分析", "分析学习者、学习任务、教学环境和资源条件，找到真实问题与起点。"],
      ["设计", "确定目标、内容结构、活动流程、媒体与评价证据，先画出整体方案。"],
      ["开发与实施", "制作课件、任务单和练习资源，并在真实课堂中按方案实施。"],
      ["评价与修订", "结合过程与结果证据判断效果，修订目标、活动、资源或实施条件。"]
    ],
    application: {
      body: "第三块将ADDIE用于数学、语文、英语和科学课时与单元设计：先诊断学情，再设定分层目标、开发资源、实施课堂，最后依据表现性评价和错题数据持续优化。",
      improvement: "把当前教学设计对应到五个阶段，优先修正分析不充分、目标不可观察、资源与活动不匹配或评价无法反馈的问题。"
    },
    example: {
      body: "课堂范本：小学英语《Colours》先通过前测发现词汇遗忘和句型运用困难，设计认读、问答、情景表达三级目标，开发情景动画和口语任务单，课堂实施后依据学生口语表现调整下一课。",
      actors: ["教师按五阶段组织备课、资源开发、课堂实施和课后修订。", "学生在目标清晰、资源适配的任务中完成可观察的语言或学科表现。", "记录前测、课堂参与、作品质量和评价后的方案变化。"]
    },
    evidence: "学情分析、目标表述、资源版本、课堂实施记录、评价数据和修订前后对照。",
    training: "教案只有活动清单，没有学情、目标和评价证据。请判断ADDIE缺失的阶段，并说明如何补齐。"
  },
  "ASSURE 模型": {
    explanation: "ASSURE围绕Analyze learners、State objectives、Select methods/media/materials、Utilize media/materials、Require learner participation、Evaluate and revise六步，强调技术资源必须转化为学生参与。",
    boundary: "ASSURE不是“使用媒体”的清单；如果目标不清、媒体过多或学生只是观看点击，就没有完成模型要求的主动参与和评价修订。",
    paradigm: [
      ["分析学习者", "判断年龄、学情、先备知识、兴趣和技术条件，明确学生需要什么支持。"],
      ["陈述目标并选择资源", "用可观察目标约束方法、媒体和材料选择，删去与目标无关的资源。"],
      ["运用媒体与组织参与", "提前试用媒体，安排预测、操作、讨论、角色扮演等学生主动参与任务。"],
      ["评价并修订", "评价学习结果和媒体使用效果，依据证据修改资源、流程和参与方式。"]
    ],
    application: {
      body: "第三块以小学英语《Colours》和《At the farm》为例：先分析口语基础和开口焦虑，控制情景动画时长，再安排问答、角色扮演和小组创编，课后根据学生开口率和句型正确率修订媒体使用。",
      improvement: "在每项数字资源旁写清适用学情、使用时机、学生操作和评价证据，避免动画游戏占满课堂而挤压语言输出。"
    },
    example: {
      body: "课堂范本：动画只用于英语农场情境导入和词汇呈现，播放不超过约两分钟，随后关闭屏幕，学生手持动物卡片进行双人问答、导游与游客角色扮演和小组对话创编。",
      actors: ["教师先分析学习者，再选择轻量媒体并为媒体后的学生任务留出主要时间。", "学生通过预测、问答、角色扮演和创编完成主动参与。", "记录媒体使用时长、学生开口率、句型正确率和课后修订。"]
    },
    evidence: "学习者分析、ABCD目标、媒体清单与时长、学生参与任务、学习结果和修订记录。",
    training: "英语课堂充满闯关动画，学生很兴奋却几乎没有口语输出。请用ASSURE六步重排这节课。"
  },
  "迪克 - 凯里信息化教学设计模型": {
    explanation: "迪克—凯里模型是ISD中更细化的系统设计模型，强调从教学目标、学习者与情境、任务分析、行为目标、评价工具、教学策略和材料开发逐步建立教—学—评对齐关系，并通过形成性评价循环修订。",
    boundary: "模型严谨、步骤多，适合复杂课程、教材和正式项目；日常课堂可以提取目标—任务—评价—修订主线，避免把复杂流程机械表格化。",
    paradigm: [
      ["确定终点能力", "先明确总目标和可观察行为目标，再分析完成目标所需的子技能层级。"],
      ["分析学习者与任务", "分析先备能力、学习情境、任务结构和常见错误，确定教学起点。"],
      ["对齐评价与策略", "为每个目标开发对应评价工具，再选择教学策略、活动和材料。"],
      ["形成性试用与修订", "通过一对一、小组和实地试用收集证据，反复修订教学材料和流程。"]
    ],
    application: {
      body: "第三块将模型用于教—学—评一体化的学科课例：先确定可观察目标和分层表现，再分析学生先备能力，开发口语或学科评价量表，课堂实施后依据数据调整教学策略。",
      improvement: "把每个教学活动追溯到一个目标和一条评价证据，优先解决目标不可观察、评价凭印象和活动无法支持结果的问题。"
    },
    example: {
      body: "课堂范本：小学英语《At the farm》先设定“能正确使用复数句型进行情景问答”的核心目标，分解为跟读、替换问答和自由创编三级表现，并配套记录句型正确率、词汇使用和发音清晰度。",
      actors: ["教师从终点能力反推任务、评价和策略，依据形成性数据调整资源。", "学生对照分层目标完成跟读、问答和创编，并能看到自己的达成层级。", "记录目标达成、错误类型、评价一致性和修订后的学习表现。"]
    },
    evidence: "目标—子技能图、行为目标、任务分析、评价量表、形成性试用数据和修订版本。",
    training: "教师凭印象评价学生“会不会”，教案中也没有清晰输出标准。请用迪克—凯里模型补齐目标、评价工具和形成性修订链。"
  },
  "联通主义学习理论": {
    explanation: "联通主义把学习理解为信息、工具、人与资源形成网络连接的过程，学习者需要发现节点、判断信息可靠性、建立连接并持续更新连接。",
    boundary: "资源越多、连接越多不等于学习越深；低龄学生需要教师筛选与结构化任务，开放网络学习也必须控制信息质量和认知负荷。",
    paradigm: [
      ["建立学习节点", "明确核心概念、问题、资源、同伴和工具，帮助学生知道从哪里开始连接。"],
      ["筛选与判断信息", "比较多个来源，标注出处和证据，训练学生识别可靠性与适切性。"],
      ["跨资源协作建构", "让学生在同伴交流、线上线下任务和多种资源之间迁移和协作。"],
      ["更新连接并反思", "根据新证据修正资源图谱和判断，说明连接如何改变自己的理解。"]
    ],
    application: {
      body: "第三块用于开放探究、英语真实交际和数字素养培养：把课本知识连接到生活场景、多媒体资源、同伴交流与课外任务，要求学生比较来源并说明选择依据。",
      improvement: "为开放任务增加资源筛选、来源标注、协作分工和连接更新要求，防止“自主搜索”变成无目标浏览。"
    },
    example: {
      body: "课堂范本：小学英语《Colours》中，学生以颜色词和句型为核心节点，连接教室实物、多媒体场景、英文绘本和家庭观察任务，在班级交流中分享发现并修正表达。",
      actors: ["教师搭建资源、人际和工具节点，提前筛选适合学段的材料。", "学生比较来源、建立资源图谱、协作表达并把课堂语言迁移到生活。", "记录来源选择、连接关系、同伴协作和课外迁移表现。"]
    },
    evidence: "资源来源、连接图谱、信息判断理由、线上线下协作、同伴回应和迁移任务。",
    training: "学生从网络复制多个答案，却说不清来源和依据。请用联通主义设计资源筛选、比较和连接更新任务。"
  },
  "多模态学习理论": {
    explanation: "多模态学习强调文字、图像、声音、动作、空间关系和互动共同参与意义建构，不是简单堆叠媒体，而是让不同模态在情境理解、模仿输入和表达输出中互相补充。",
    boundary: "模态越多不一定越有效；如果模态重复、互相冲突或没有学生输出，反而会增加负荷。设计要明确每种模态承担的意义。",
    paradigm: [
      ["明确模态功能", "先判断图文、声音、动作或空间关系各自要补充什么意义，避免重复呈现。"],
      ["协同输入理解", "用图像建立情境，用声音示范语言或过程，用动作和操作把理解外化。"],
      ["组织多模态互动", "安排指认、模仿、角色扮演、讨论和作品创作，让学生主动转换表征。"],
      ["整合与评价", "要求学生用另一种模态解释或表达同一关系，并检查模态协同是否促进理解。"]
    ],
    application: {
      body: "第三块把多模态用于英语、语文、科学和艺术课堂：图文建立表象，动画或音频提供情境和示范，动作与操作帮助理解，最终回到对话、作品或解释输出。",
      improvement: "给每种模态写清它承担的学习意义，删除重复信息，增加学生从图像到语言、从操作到解释的转换任务。"
    },
    example: {
      body: "课堂范本：小学英语《Colours》同时使用色彩图文卡片、生活情境动画、标准发音、学生指认和双人问答，按情境建立、模仿输入、动作参与、语言输出的顺序协同推进。",
      actors: ["教师安排图文、音频、动作和对话的先后关系，控制输入量并及时转入输出。", "学生观察、聆听、指认、表演和表达，在多通道体验中形成音形义场景联结。", "记录模态之间的情境协同性、学生输出质量和理解迁移。"]
    },
    evidence: "模态功能说明、图文声动作的协同关系、学生操作、口语或作品输出和迁移表现。",
    training: "教师只让学生反复听音频跟读，学生会模仿却不会在情境中使用。请补充视觉、动作和对话模态，并说明各自功能。"
  },
  "视听传播理论": {
    explanation: "视听传播理论把教学媒介看作信息编码、通道传递、学习者解码与反馈组成的传播系统，要求符号、结构、声音和画面清晰，并通过反馈确认信息是否真正被理解。",
    boundary: "清晰画面不等于清晰理解；视听材料需要观看目的、关键线索和后续任务，不能让画面感染力替代概念解释和学生表达。",
    paradigm: [
      ["编码教学信息", "围绕目标选择语言、图像、动作和声音，明确要突出哪一个关键关系。"],
      ["控制传播通道", "安排画面构图、声音节奏、字幕和播放时长，减少噪声、遮挡和无关信息。"],
      ["引导学生解码", "用观看任务、预测、暂停、标注和问题帮助学生从视听材料提取意义。"],
      ["通过反馈校验理解", "让学生复述、操作、解释或创作，用结果判断信息是否完成有效传播。"]
    ],
    application: {
      body: "第三块适合视频课件、微课、演示实验和视听资源：短视频先明确观看任务，画面突出关键变化，教师用语言补充因果关系，观看后用问题、操作或作品检查理解。",
      improvement: "为每段视听材料补充观看目的、关键线索和观看后的反馈任务，删去只增强氛围却不支持理解的镜头。"
    },
    example: {
      body: "课堂范本：科学演示视频先让学生预测现象，再播放关键片段并暂停标注变化，教师补充因果解释，最后让学生依据观察结果完成记录表并进行小组说明。",
      actors: ["教师负责信息编码、播放节奏和观看后追问，确保视听材料服务于核心概念。", "学生带着任务观看、预测、标注、复述和解释，而不是被动浏览。", "记录观看目标理解、关键线索识别、讨论回应和任务作品。"]
    },
    evidence: "观看任务、画面与声音结构、关键线索、学生解码表现、反馈话语和观看后作品。",
    training: "一段视频播放完后学生只记住画面，却说不清原理。请从编码、观看任务、暂停提示和反馈四个环节重构传播流程。"
  }
});

function getTheoryDetailModules(item) {
  const custom = theoryDetailModules[item.name] || {};
  const sourceRecord = getTheorySourceRecord(item);
  const explanationParagraphs = getTheorySourceParagraphs(sourceRecord, '第一块');
  const paradigmParagraphs = getTheorySourceParagraphs(sourceRecord, '第二块');
  const sourceApplicationParagraphs = getTheorySourceParagraphs(sourceRecord, '第三块');
  const secondParts = splitTheoryParadigmSource(paradigmParagraphs);
  const thirdParts = splitTheoryThirdSource(sourceApplicationParagraphs);
  const sourceBacked = explanationParagraphs.length > 0 || paradigmParagraphs.length > 0 || sourceApplicationParagraphs.length > 0;
  const steps = (item.mechanism || "课堂事实、理论解释、教学改进").split("、").filter(Boolean).slice(0, 4);
  const sourceCore = getTheorySourceField(explanationParagraphs, ['理论定位', '内涵', '理论说明']);
  const sourceBoundary = getTheorySourceField(explanationParagraphs, ['关键判定标准', '关键判断标准', '理论局限']);
  const sourceImprovement = getTheorySourceField(explanationParagraphs, ['课堂落地方式', '课堂观察指标']);
  const sourceTeacherTalk = getTheorySourceField(explanationParagraphs, ['课堂语言']);
  const sourceTrainingPrompt = getTheoryTrainingPrompt(thirdParts.training, item.name);
  const explanation = sourceBacked && sourceCore ? sourceCore : (custom.explanation || item.core);
  const boundary = sourceBacked && sourceBoundary ? sourceBoundary : (custom.boundary || item.risk);
  const application = sourceBacked ? {} : (custom.application || {});
  const example = sourceBacked ? {} : (custom.example && typeof custom.example === "object" ? custom.example : {});
  return {
    explanation: {
      source: "第一块 · 理论解释",
      body: explanation,
      boundary,
      paragraphs: explanationParagraphs
    },
    paradigm: {
      cards: custom.paradigm || steps.map((step) => [step, `围绕${step}组织课堂活动，并留下能够检验该环节的学习证据。`]),
      paragraphs: secondParts.paradigm
    },
    application: {
      source: "第二块 · 学科应用",
      body: application.body || [...secondParts.application, ...thirdParts.application].join(" ") || item.subject,
      improvement: application.improvement || sourceImprovement || item.improvement,
      evidence: custom.evidence || `重点记录与${item.name}相关的教师行为、学生表现和任务结果。`,
      teacherTalk: sourceTeacherTalk || item.teacherTalk,
      paragraphs: [...secondParts.application, ...thirdParts.application]
    },
    example: {
      source: "第三块 · 课堂范本",
      body: example.body || thirdParts.example.join(" ") || item.example,
      actors: example.actors || custom.actors || ["教师围绕理论机制设计任务并提供必要支持。", "学生在任务中表达、操作或协作，形成可观察表现。", "记录课堂话语、作品、操作和迁移表现作为观察证据。"],
      paragraphs: thirdParts.example
    },
    comparison: {
      source: "第三块 · 理论辨析",
      paragraphs: thirdParts.comparison
    },
    training: {
      source: "第三块 · 情境训练",
      prompt: sourceTrainingPrompt || custom.training || `课堂中出现了与“${item.name}”相关的现象。请先指出理论依据，再说明需要补充的课堂证据和改进动作。`,
      paragraphs: thirdParts.training
    }
  };
}

function ensureDirectoryTheoryProfile(record) {
  if (!record?.name) return null;
  const existing = getTheoryProfileByName(record.name);
  if (existing) return existing;
  const detail = theoryDirectoryContentOverrides[record.name] || {};
  const sourceRecord = getTheorySourceRecord(record);
  const sourceExplanation = getTheorySourceParagraphs(sourceRecord, '第一块');
  const sourceApplication = getTheorySourceParagraphs(sourceRecord, '第三块');
  const sourceCore = getTheorySourceField(sourceExplanation, ['理论定位', '内涵', '理论说明']);
  const sourceTags = getTheorySourceField(sourceExplanation, ['关键词', '次领域标签']);
  const sourceExample = sourceApplication.find((paragraph) => /具体课例|案例|课堂范本|优质落地课堂/.test(paragraph)) || '';
  const profile = {
    id: createDirectoryTheoryId(record.name),
    name: record.name,
    group: record.group?.name || record.section?.name || record.category?.name || "理论目录",
    english: "Theory Directory",
    core: detail.core || sourceCore || `${record.name} 已纳入 ${record.group?.name || record.section?.name || "理论知识库"}。进入详情后，可围绕课堂事实、教师行为与学生学习证据继续补充理论解释。`,
    tags: detail.tags || (sourceTags ? sourceTags.split(/[、,，]/).map((tag) => tag.trim()).filter(Boolean).slice(0, 8) : [record.section?.name || "理论学习", record.group?.name || "课堂应用", "教学证据"]),
    subject: detail.subject || `将${record.name}转化为学科教学中的观察角度、提问线索和课堂改进动作。`,
    example: detail.example || sourceExample || `从一条可观察的课堂事实开始，记录教师行为、学生反应与任务结果，再用${record.name}解释其中的关键关系。`,
    risk: detail.risk || "使用理论时仍需回到完整课堂证据，避免只凭单一现象快速下结论。",
    mechanism: detail.mechanism || `${record.name} · 课堂事实 · 教学改进`,
    improvement: detail.improvement || `围绕${record.name}设计一项可观察、可记录、可复盘的课堂改进动作。`,
    teacherTalk: detail.teacherTalk || "我会先说明判断依据，再用课堂证据检验这个理论解释。"
  };
  directoryTheoryProfiles.set(record.name, profile);
  return profile;
}

function countTheoryDirectoryNode(node) {
  if (Array.isArray(node?.theories)) return node.theories.length;
  if (Array.isArray(node?.groups)) return node.groups.reduce((sum, group) => sum + countTheoryDirectoryNode(group), 0);
  if (Array.isArray(node?.sections)) return node.sections.reduce((sum, section) => sum + countTheoryDirectoryNode(section), 0);
  return 0;
}

function getTheoryDirectorySelection() {
  const saved = Array.isArray(assistantState.theory.directoryPath) ? assistantState.theory.directoryPath : [0, 0, 0];
  const categoryIndex = Math.max(0, Math.min(theoryDirectoryData.categories.length - 1, Number(saved[0]) || 0));
  const category = theoryDirectoryData.categories[categoryIndex] || { name: "教育理论", sections: [] };
  const sectionIndex = Math.max(0, Math.min(category.sections.length - 1, Number(saved[1]) || 0));
  const section = category.sections[sectionIndex] || { name: category.name, groups: [] };
  const groupIndex = Math.max(0, Math.min(section.groups.length - 1, Number(saved[2]) || 0));
  const group = section.groups[groupIndex] || { name: section.name, theories: [] };
  assistantState.theory.directoryPath = [categoryIndex, sectionIndex, groupIndex];
  return { categoryIndex, sectionIndex, groupIndex, category, section, group };
}

function getAllTheoryDirectoryRecords() {
  return theoryDirectoryData.categories.flatMap((category, categoryIndex) =>
    category.sections.flatMap((section, sectionIndex) =>
      section.groups.flatMap((group, groupIndex) =>
        group.theories.map((name) => ({
          name,
          category,
          section,
          group,
          categoryIndex,
          sectionIndex,
          groupIndex
        }))
      )
    )
  );
}

function renderTheoryDirectoryNav(selection) {
  const nav = $("#theory-directory-nav");
  if (!nav) return;
  const collapsedDepth = Number(assistantState.theory.directoryCollapsedDepth) || 0;
  nav.innerHTML = theoryDirectoryData.categories.map((category, categoryIndex) => {
    const categoryActive = categoryIndex === selection.categoryIndex && collapsedDepth < 1;
    const sections = categoryActive ? `<div class="theory-directory-sections">${category.sections.map((section, sectionIndex) => {
      const sectionActive = sectionIndex === selection.sectionIndex && collapsedDepth < 2;
      const groups = sectionActive ? `<div class="theory-directory-groups">${section.groups.map((group, groupIndex) => `<button type="button" class="${groupIndex === selection.groupIndex ? "active" : ""}" data-theory-directory-category="${categoryIndex}" data-theory-directory-section="${sectionIndex}" data-theory-directory-group="${groupIndex}"><span>${escapeHtml(group.name)}</span><em>${group.theories.length}</em><i data-lucide="chevron-right"></i></button>`).join("")}</div>` : "";
      return `<section class="${sectionActive ? "open" : ""}"><button type="button" data-theory-directory-category="${categoryIndex}" data-theory-directory-section="${sectionIndex}" data-theory-directory-group="0"><span>${escapeHtml(section.name)}</span><em>${countTheoryDirectoryNode(section)}</em><i data-lucide="chevron-down"></i></button>${groups}</section>`;
    }).join("")}</div>` : "";
    return `<article class="${categoryActive ? "open" : ""}"><button type="button" data-theory-directory-category="${categoryIndex}" data-theory-directory-section="0" data-theory-directory-group="0"><span>${escapeHtml(category.name)}</span><em>${countTheoryDirectoryNode(category)}</em><i data-lucide="chevron-down"></i></button>${sections}</article>`;
  }).join("");
}

function getTheoryIcon(profile) {
  const groupIcons = {
    教育学基础理论类: "graduation-cap",
    心理学理论类: "brain-circuit",
    课堂与班级管理理论类: "users-round",
    学科教学理论类: "book-open-check",
    教育技术理论: "monitor-cog"
  };
  return groupIcons[profile?.group] || "book-open-check";
}

const theoryScenarios = [
  {
    stem: "教师给出三个算式，让学生先独立观察，再提出规律猜想；随后补充一个反例，要求学生修改原来的表述。",
    question: "最能解释这一教学设计的理论是？",
    options: ["形成性评价理论", "布鲁纳发现学习理论", "人本主义学习理论", "等待时间理论"],
    answer: 1,
    analysis: {
      knowledge: "布鲁纳发现学习理论强调让学生通过操作材料、比较案例、提出猜想和验证反例，自主发现知识关系并形成认知结构。",
      evidence: "题干完整呈现了“观察比较—形成猜想—反例检验—修正表述”的发现学习链条，学生不是接收教师给出的规律，而是在证据中主动建构规律。",
      distinction: "形成性评价也会使用反馈促进改进，但本题的主机制是学生发现知识结构；等待时间只解释思考停顿，人本主义则更关注需要、情感与自我实现。"
    }
  },
  {
    stem: "学生回答后，教师没有立即判断对错，而是说：‘谁能复述他的想法，再提出一个追问？’",
    question: "该做法主要改善了哪一种课堂机制？",
    options: ["学生间对话与反馈权", "知识的机械记忆", "教师讲授的完整性", "作业难度控制"],
    answer: 0,
    analysis: {
      knowledge: "教学对话理论强调多元、平等、双向话语，减少“教师提问—学生简答—教师评判”的单一 IRF 链，增加倾听、回应和生生交流。",
      evidence: "教师暂缓评价，把复述和追问交给同伴，使学生获得回应权与部分反馈权，课堂话语由师生单线问答转向学生之间的意义协商。",
      distinction: "该做法不是延长讲授，也不是记忆训练或作业控制；若教师最后仍立即给出唯一结论，生生对话就会再次退回表面形式。"
    }
  },
  {
    stem: "课堂使用校园节水问题贯穿资料调查、比例计算、方案设计和公开展示，学生最终向学校提交建议。",
    question: "这一设计最符合哪项理论判断？",
    options: ["情境认知理论", "等待时间理论", "认知负荷理论", "行为主义强化理论"],
    answer: 0,
    analysis: {
      knowledge: "情境认知理论认为知识与其产生、使用的真实情境不可分割，学习应在有意义的任务、工具使用和实践共同体中发生。",
      evidence: "校园节水是真实问题，调查、计算、设计、公开表达和提交建议构成持续的实践任务，数学知识直接服务真实决策与社会参与。",
      distinction: "仅用节水故事导入、随后回到脱离情境的机械练习，不足以体现情境认知；本题的情境贯穿了学习与成果应用全过程。"
    }
  },
  {
    stem: "教师评价学生说：‘你把两个量之间的关系说清楚了；下一步请补充一个反例，检验结论是否总成立。’",
    question: "这段反馈最突出体现了什么？",
    options: ["终结性排名", "形成性评价", "无条件赞美", "课堂纪律控制"],
    answer: 1,
    analysis: {
      knowledge: "形成性评价把评价嵌入教学过程，通过持续收集学习证据、解释当前差距、提供描述性反馈并调整下一步学习。",
      evidence: "教师先指出学生已经做到的“说清关系”，再提出可执行的改进任务“补充反例”，反馈同时包含当前证据和下一步方向。",
      distinction: "终结性评价侧重阶段结束后的结果判定；无条件赞美缺少证据和改进指向。只有“有效之处＋下一步行动”才构成促进学习的反馈闭环。"
    }
  }
];

function extractTheoryScenarioField(paragraphs, pattern) {
  const index = paragraphs.findIndex((paragraph) => pattern.test(String(paragraph)));
  if (index < 0) return '';
  const current = String(paragraphs[index]).replace(/^\s*(?:\d+[\.．、]|[一二三四五六七八九十]+[、\.．])\s*/, '').replace(pattern, '').replace(/^\s*[：:]\s*/, '').trim();
  return current || String(paragraphs[index + 1] || '').trim();
}

function getSelectedTheoryScenarioSet() {
  const selected = getSelectedLearningTheory();
  const source = getTheorySourceRecord(selected);
  const sourceParagraphs = getTheorySourceParagraphs(source, '第三块');
  const trainingStart = sourceParagraphs.findIndex((paragraph) => /情境判断训练|情境训练/.test(String(paragraph)));
  if (trainingStart >= 0) {
    const training = sourceParagraphs.slice(trainingStart);
    const stemIndex = training.findIndex((paragraph) => /题目\s*[：:]/.test(String(paragraph)));
    const answerIndex = training.findIndex((paragraph) => /标准答案/.test(String(paragraph)));
    const stem = stemIndex >= 0
      ? String(training[stemIndex + 1] || '').trim() || String(training[stemIndex]).replace(/^.*?题目\s*[：:]\s*/, '').trim()
      : '';
    const optionLines = training
      .slice(stemIndex >= 0 ? stemIndex + 1 : 0, answerIndex >= 0 ? answerIndex : training.length)
      .map((paragraph) => String(paragraph).trim())
      .filter((paragraph) => /^[A-DＡ-Ｄ]\s*[\.．、]?/.test(paragraph));
    const options = optionLines.map((paragraph) => paragraph.replace(/^[A-DＡ-Ｄ]\s*[\.．、]?\s*/, '').trim()).filter(Boolean);
    const answerLine = answerIndex >= 0 ? String(training[answerIndex]) : '';
    const answerLetter = answerLine.match(/[A-DＡ-Ｄ]/)?.[0] || '';
    const answer = answerLetter ? 'ＡＢＣＤ'.indexOf(answerLetter) >= 0 ? 'ＡＢＣＤ'.indexOf(answerLetter) : 'ABCD'.indexOf(answerLetter) : -1;
    const knowledge = extractTheoryScenarioField(training, /核心知识点\s*[：:]/);
    const evidence = extractTheoryScenarioField(training, /情境精准对应\s*[：:]/);
    const distinctionStart = training.findIndex((paragraph) => /错项精细排除|易错辨析|备考易错提醒/.test(String(paragraph)));
    const distinction = distinctionStart >= 0
      ? training.slice(distinctionStart).filter((paragraph) => !/^详细解析\s*$/.test(String(paragraph).trim())).join('\n')
      : '';
    if (stem && options.length >= 2 && answer >= 0 && answer < options.length) {
      return [{
        stem: `${selected.name} · 情境判断`,
        question: stem,
        options,
        answer,
        analysis: {
          knowledge: knowledge || `${selected.name}的核心机制：${selected.core}`,
          evidence: evidence || `题干中的课堂行为需要回到${selected.name}的理论条件、关键证据与适用边界进行判断。`,
          distinction: distinction || `请对照${selected.name}的核心判定标准，区分题干中的关键教学行为与相邻理论的解释范围。`
        }
      }];
    }
  }
  return [{
    stem: `课堂中出现一个需要用“${selected.name}”解释的教学现象。`,
    question: `下列哪项判断最符合${selected.name}的核心机制？`,
    options: [
      `${selected.name}：${selected.core}`,
      `只依据课堂结果，不需要回到教师行为和学生证据。`,
      `只要使用了活动或媒体，就可以直接判定为${selected.name}。`,
      `把其他理论的结论直接替代${selected.name}的适用边界。`
    ],
    answer: 0,
    analysis: {
      knowledge: selected.core,
      evidence: `题干判断应回到${selected.name}的核心概念、适用条件和可观察课堂证据。`,
      distinction: `不能只看课堂形式或结果，需要区分${selected.name}与相邻理论的解释对象，并说明为什么其他选项缺少理论依据。`
    }
  }];
}

function getTheoryScenarioSetForMode() {
  if (assistantState.theory.scenarioMode !== "random") return getSelectedTheoryScenarioSet();
  const pool = theoryScenarios.map((item) => ({ ...item, options: [...item.options] }));
  const offset = Math.floor(Date.now() / 3600000) % Math.max(1, pool.length);
  return pool.slice(offset).concat(pool.slice(0, offset));
}

const LOCAL_SCENARIO_BLUEPRINTS = Object.freeze([
  ["备课时，教师先罗列了许多活动，却没有说明学生应获得什么发展。", "依据{theory}，教师首先应当（ ）。", "goal"],
  ["课堂导入很热闹，但后续任务与本课核心目标没有建立联系。", "从{theory}看，最恰当的调整是（ ）。", "improvement"],
  ["教师只根据最后答案判断学习效果，没有记录学生的思考过程。", "运用{theory}诊断，最需要补充的是（ ）。", "evidence"],
  ["同一任务中，部分学生很快完成，另一些学生一直无法进入学习。", "若用{theory}改进，较合适的做法是（ ）。", "support"],
  ["小组活动结束后，各组只报告结论，没有说明观点如何形成。", "依据{theory}，教师应重点追问（ ）。", "evidence"],
  ["学生刚回答完，教师立即公布标准答案并转入下一题。", "按照{theory}，更有价值的处理是（ ）。", "dialogue"],
  ["学生出现错误后，教师直接替其改正，学生没有解释原来的想法。", "从{theory}出发，教师下一步宜（ ）。", "feedback"],
  ["学生会完成课本例题，但题目条件稍有变化就不知道如何处理。", "依据{theory}，后续任务应侧重（ ）。", "transfer"],
  ["教师为所有学生提供完全相同的材料、时间和表达方式。", "用{theory}审视，优先改进项是（ ）。", "support"],
  ["课堂评价只有分数和排名，学生不知道下一步怎样改进。", "符合{theory}的评价方式是（ ）。", "feedback"],
  ["课末教师独自总结全部结论，学生只负责抄写。", "依据{theory}，课末环节更适合（ ）。", "reflection"],
  ["作业只是重复课堂中的同类题，没有新的应用情境。", "从{theory}看，作业设计应增加（ ）。", "transfer"],
  ["听课记录写着“课堂效果很好”，却没有任何师生话语或作品依据。", "运用{theory}作出专业判断前，应先（ ）。", "evidence"],
  ["讨论中始终由教师评价每个答案，学生之间没有回应。", "依据{theory}，最应调整的课堂关系是（ ）。", "dialogue"],
  ["教师提供了完整步骤，学生能模仿操作，却说不清每一步的依据。", "若落实{theory}，教师应当（ ）。", "support"],
  ["单元内各课时彼此割裂，活动与评价也没有共同指向。", "用{theory}统整单元，关键是（ ）。", "goal"],
  ["研究者仅凭一次课堂印象，就断言某种教学方式普遍有效。", "依据{theory}，这一结论首先需要（ ）。", "evidence"],
  ["教师反思只写“学生不够认真”，没有检查自己的任务与支持。", "从{theory}看，更专业的反思方式是（ ）。", "reflection"],
  ["教师为了提高完成速度，取消了学生提出不同观点的机会。", "依据{theory}，课堂决策应优先保障（ ）。", "goal"],
  ["改进方案列出了十多项措施，却没有确定观察指标和复盘节点。", "若以{theory}推进改进，下一步应（ ）。", "reflection"]
]);

function compactScenarioText(value, fallback, maxLength = 74) {
  const text = String(value || fallback || "").replace(/\s+/g, " ").trim().replace(/[。！？!?；;]+$/u, "");
  return text.length > maxLength ? `${text.slice(0, maxLength).replace(/[，,；;、\s]+$/u, "")}……` : text;
}

function getScenarioTheoryProfile(theoryName = "") {
  const requested = String(theoryName || "").trim();
  if (!requested) return getSelectedLearningTheory();
  const existing = getTheoryProfileByName(requested);
  if (existing) return existing;
  const record = getAllTheoryDirectoryRecords().find((item) => item.name === requested);
  return record ? ensureDirectoryTheoryProfile(record) : null;
}

function buildLocalScenarioQuestion(profile, blueprintIndex, sequenceIndex) {
  const blueprint = LOCAL_SCENARIO_BLUEPRINTS[blueprintIndex % LOCAL_SCENARIO_BLUEPRINTS.length];
  const [situation, promptTemplate, focus] = blueprint;
  const theoryName = profile?.name || "相关教育理论";
  const core = compactScenarioText(profile?.core, `${theoryName}的核心概念与适用条件`);
  const improvement = compactScenarioText(profile?.improvement, `把${theoryName}转化为可观察、可复盘的教学行动`);
  const rawExample = String(profile?.example || "").trim();
  const example = compactScenarioText(/^(?:课堂范本|课堂案例|具体课例|案例)$/u.test(rawExample) ? "" : rawExample, `依据学生的课堂表现持续调整任务与支持`);
  const risk = compactScenarioText(profile?.risk, `只贴理论标签而不核对课堂事实与适用边界`);
  const tag = compactScenarioText(profile?.tags?.[sequenceIndex % Math.max(1, profile?.tags?.length || 1)], "关键学习证据", 24);
  const correctByFocus = {
    goal: `先用“${core}”校准目标、活动与评价的一致性`,
    improvement: `把“${improvement}”落实为贯穿课堂的任务链`,
    evidence: `收集能检验“${tag}”是否真实发生的过程证据`,
    support: `依据学生差异实施“${improvement}”，并观察支持后的变化`,
    dialogue: `围绕“${tag}”让学生解释、回应和修正观点`,
    feedback: `依据“${core}”给出有证据且指向下一步的反馈`,
    transfer: `设计条件变化的新任务，检验学生能否运用“${tag}”`,
    reflection: `对照“${core}”复盘事实、原因、行动和成效指标`
  };
  const distractors = [
    `以第${sequenceIndex + 1}项课堂活动是否热闹作为唯一判断依据`,
    `先统一增加练习数量，暂不分析学生的真实反应`,
    `直接套用其他理论的结论，不再核对${theoryName}的适用条件`
  ];
  if (focus === "evidence") distractors[1] = `只记录教师是否完成预设流程，不保留学生作品与话语`;
  if (focus === "support") distractors[0] = `继续要求所有学生以同一速度和同一方式完成任务`;
  if (focus === "dialogue") distractors[1] = `由教师代替学生概括全部观点，以缩短讨论时间`;
  if (focus === "feedback") distractors[0] = `只用“很好”或“错误”作出结果性评价`;
  if (focus === "transfer") distractors[1] = `重复原例题的数字和步骤，确保答案形式完全一致`;
  if (focus === "reflection") distractors[2] = `把问题全部归因于学生态度，不检查任务与支持设计`;
  const correct = correctByFocus[focus] || `依据“${example}”组织教学并收集学习证据`;
  const answer = sequenceIndex % 4;
  const options = [...distractors];
  options.splice(answer, 0, correct);
  return normalizeScenarioQuestion({
    id: `local-${createDirectoryTheoryId(theoryName)}-${sequenceIndex + 1}`,
    question_id: `local-${createDirectoryTheoryId(theoryName)}-${sequenceIndex + 1}`,
    theory_name: theoryName,
    stem: situation,
    question: promptTemplate.replace("{theory}", theoryName),
    options,
    answer,
    difficulty: sequenceIndex < 6 ? "基础" : sequenceIndex < 14 ? "进阶" : "综合",
    knowledge_excerpt: core,
    analysis: {
      knowledge: `${theoryName}的判断必须回到其核心命题：${core}`,
      evidence: `题干聚焦“${situation.replace(/[。！？!?]+$/u, "")}”。较优选项把理论转化为可观察行动；可参考：${example}`,
      distinction: `易错点是${risk}。其余选项分别把形式、数量或相邻理论当成充分依据，均没有建立完整证据链。`
    },
    sources: []
  }, sequenceIndex);
}

function buildLocalScenarioSet(mode, theoryName, count) {
  const total = Math.max(1, Math.min(20, Number(count) || 5));
  if (mode !== "random") {
    const profile = getScenarioTheoryProfile(theoryName);
    if (!profile) return [];
    return Array.from({ length: total }, (_, index) => buildLocalScenarioQuestion(profile, index, index));
  }
  const directoryProfiles = typeof getAllTheoryDirectoryRecords === "function"
    ? getAllTheoryDirectoryRecords().map(ensureDirectoryTheoryProfile).filter(Boolean)
    : [];
  const profileMap = new Map([...learningTheoryProfiles, ...directoryProfiles].map((profile) => [profile.name, profile]));
  const profiles = profileMap.size ? [...profileMap.values()] : [getSelectedLearningTheory()];
  const offset = Math.floor(Date.now() / 3600000) % profiles.length;
  // Walk the complete catalogue with a coprime stride so an offline random
  // round is not accidentally concentrated in one adjacent directory group.
  let stride = profiles.length > 1 ? 97 % profiles.length : 1;
  const gcd = (left, right) => {
    let a = Math.abs(left);
    let b = Math.abs(right);
    while (b) [a, b] = [b, a % b];
    return a;
  };
  while (profiles.length > 1 && gcd(stride, profiles.length) !== 1) stride = (stride + 1) % profiles.length || 1;
  return Array.from({ length: total }, (_, index) => {
    const profile = profiles[(offset + index * stride) % profiles.length];
    return buildLocalScenarioQuestion(profile, index, index);
  });
}

const sixArtsOfficialLink = "https://mp.weixin.qq.com/s/O3FYdpHm9trO-4At2_Pe4Q";
const sixArtsLinkData = window.SIX_ARTS_LINKS_DATA || { categories: [] };

function getSixArtsLinksForFilter(filter) {
  const category = (sixArtsLinkData.categories || []).find((item) => item.ui_label === filter);
  const links = (Array.isArray(category?.records) ? category.records : [])
    .map((record) => String(record?.url || "").trim())
    .filter((url) => /^https:\/\/mp\.weixin\.qq\.com\/s\//i.test(url));
  return [...new Set(links)];
}

const sixArtsDimensions = [
  { key: "说", icon: "mic-2", image: "speak.jpg", title: "语言与思想的建构", summary: "朗诵、说课、经典诵读与演讲，统一教师口语表达、课堂讲授和价值表达。", ability: "表达组织力", evidence: "观点清晰、证据充分、表达有序有情", activity: "角色朗诵、微型说课、观点演讲", link: sixArtsOfficialLink, resourceCards: [{ title: "六艺节之“赋艺寻辉”诗歌朗诵比赛", summary: "借助诗歌朗诵训练语音、节奏、情感和面向真实听众的表达。", image: "write.jpg" }, { title: "经典诵读与课堂表达", summary: "把诵读、说理和观点演讲转化为可观察的语言学习证据。", image: "draw.jpg" }] },
  { key: "唱", icon: "music-2", image: "sing.jpg", title: "声乐与情感的交融", summary: "以声传情、以歌育人，在合唱与主题歌曲中培养音乐素养和共同体意识。", ability: "审美协作力", evidence: "节奏准确、情感投入、团队配合", activity: "主题合唱、歌词改编、声音叙事", link: sixArtsOfficialLink, resourceCards: [{ title: "六艺节之“艺咏合情”合唱比赛", summary: "围绕主题合唱练习声音协同、情绪表达和团队责任。", image: "dance.jpg" }, { title: "主题歌曲的课堂转化", summary: "将歌词改编、轮唱和声音叙事嵌入学科情境，留下共同创作成果。", image: "play.jpg" }] },
  { key: "弹", icon: "piano", image: "play.jpg", title: "技术、情感与理解的统一", summary: "通过器乐演奏培养审美感知、艺术表现、专注坚持与身心协调。", ability: "艺术实操力", evidence: "节奏控制、表现完整、专注投入", activity: "器乐配景、节奏创编、声音实验", link: sixArtsOfficialLink, resourceCards: [{ title: "六艺节之器乐大赛", summary: "在器乐演奏中练习节奏控制、专注坚持与面向听众的艺术表现。", image: "sing.jpg" }, { title: "器乐配景与节奏创编", summary: "为文本、实验或课堂情境设计声音片段，记录创编过程与修改依据。", image: "draw.jpg" }] },
  { key: "舞", icon: "person-standing", image: "dance.jpg", title: "身体与精神的共舞", summary: "通过具身动作感知文化、节奏和空间，在身体表达中完成审美体验与文化传承。", ability: "具身表现力", evidence: "动作协调、空间表达、文化理解", activity: "情境定格、动作叙事、节奏律动", link: sixArtsOfficialLink, resourceCards: [{ title: "六艺之“韶舞菁华”舞蹈比赛", summary: "在舞蹈与情境表演中理解节奏、空间、文化意象和身体叙事。", image: "speak.jpg" }, { title: "动作叙事与情境定格", summary: "用连续动作或定格画面呈现知识过程，形成可回看、可解释的学习证据。", image: "play.jpg" }] },
  { key: "书", icon: "pen-tool", image: "write.jpg", title: "书写与心性修养", summary: "软硬笔书写既支撑板书、教案等教师基本功，也涵养静心修身的师德品格。", ability: "书写审美力", evidence: "结构规范、布局清晰、书写专注", activity: "关键词书写、板书设计、书法题签", link: sixArtsOfficialLink, resourceCards: [{ title: "“桑梓桃李”书画大赛", summary: "以书写、题签和版式设计呈现学习成果，连接文化表达与审美修养。", image: "draw.jpg" }, { title: "板书设计与关键词书写", summary: "把核心概念、推理过程和评价标准组织成清晰、可读的课堂视觉结构。", image: "speak.jpg" }] },
  { key: "画", icon: "brush", image: "draw.jpg", title: "视觉与思维的创生", summary: "把抽象思维转化为视觉形象，发展图像思维、空间想象、板书设计与创造表达。", ability: "视觉创生力", evidence: "信息可视化、构图逻辑、创意表达", activity: "概念图、简笔画、故事分镜", link: sixArtsOfficialLink, resourceCards: [{ title: "六艺节之“绘情画意”简笔画大赛", summary: "用简笔画、故事分镜和视觉符号把抽象内容转化为可理解的图像。", image: "sing.jpg" }, { title: "概念图与故事分镜", summary: "通过构图、标注和图像关系呈现知识结构，支持解释、交流与迁移。", image: "dance.jpg" }] }
];

const assistantState = {
  theory: { selectedId: "theory-1", filter: "全部", query: "", detailTab: "explanation", detailSubjects: { application: "", example: "" }, comparisonTargets: {}, plan: [], dialogue: [], dialogueSessions: [], activeDialogueSessionId: "", scenarioIndex: 0, scenarioScore: 0, scenarioAnswered: false, scenarioAnsweredCount: 0, scenarioMode: "specialized", scenarioTheoryName: "", scenarioQuestionCount: 5, scenarioSessionId: "", scenarioItems: [], scenarioHistory: [], scenarioHistoryOpen: false, scenarioStarted: false, scenarioLoading: false, scenarioAnswering: false, scenarioRequestId: 0, scenarioAnswerRequestId: 0, scenarioRemote: false, scenarioBlocked: false, scenarioBlockReason: "", scenarioAnswerMap: {}, previewCardVersion: 2, pending: false, requestId: 0, libraryView: "overview", libraryLens: "map", libraryPage: 1, libraryAbility: "explanation", librarySelectedTheoryId: "", directoryPath: [0, 0, 0], directoryCollapsedDepth: 0, directoryTheory: "", directoryQuery: "", libraryMapPath: [], libraryMapViewport: { x: 0, y: 0, scale: 1 } },
  sixarts: { selectedArts: ["说", "弹", "舞", "画"], activeResource: "全部", generated: false, mode: "complete", detailLevel: "detailed", pending: false, stageReady: { design: true, process: true, evaluate: true }, designDraft: [], designSections: [], designFieldDraft: {}, competencyDraft: {}, processDraft: [], processEvaluationTables: {}, evaluationDraft: [], teacherEvaluationDraft: [], selfAssessmentDraft: [], reflectionPromptsDraft: [], practiceDraft: [], referenceDraft: [], homeworkDraft: "", extensionDraft: "", fusionScore: 0, fusionBreakdown: [], versionDrafts: {}, scores: { 说: 4, 唱: 3, 弹: 3, 舞: 4, 书: 3, 画: 4 } }
};

function toast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  window.clearTimeout(toast.timer);
  toast.timer = window.setTimeout(() => els.toast.classList.remove("show"), 2200);
}

let iconRefreshFrame = 0;

function refreshIcons() {
  if (!window.lucide || iconRefreshFrame) return;
  iconRefreshFrame = window.requestAnimationFrame(() => {
    iconRefreshFrame = 0;
    if (!document.querySelector('[data-lucide]:not(svg)')) return;
    window.lucide.createIcons({ attrs: { "stroke-width": 1.8 } });
  });
}

function readStoredJson(storage, key) {
  try {
    return JSON.parse(storage.getItem(key) || "null");
  } catch {
    return null;
  }
}

function getStoredUser() {
  return readStoredJson(sessionStorage, AUTH_KEY) || readStoredJson(localStorage, AUTH_KEY);
}

function getStoredProfile() {
  return readStoredJson(localStorage, PROFILE_KEY);
}

function getLocalAccounts() {
  return readStoredJson(localStorage, ACCOUNTS_KEY) || {};
}

function initializeTheorySelector() {
  const savedCustom = readStoredJson(localStorage, CUSTOM_THEORIES_KEY) || [];
  savedCustom.forEach((rule) => {
    if (!theoryRules.some((item) => item.name === rule.name)) theoryRules.push(rule);
  });
  $("#theory-selector").innerHTML = theoryRules.map((rule) => `<label class="theory-option">
      <input type="checkbox" value="${escapeHtml(rule.name)}" checked />
      <span><i class="theory-choice-box" aria-hidden="true"><i data-lucide="check"></i></i><b>${escapeHtml(rule.name)}</b></span>
    </label>`).join("");
  $("#theory-count").textContent = "606";
  updateTheorySelectionSummary();
  updateObservationCaseMetrics();
  refreshIcons();
}

function updateTheorySelectionSummary() {
  const selected = $$("#theory-selector input:checked").length;
  const total = $$("#theory-selector input").length;
  if ($("#theory-selection-summary")) $("#theory-selection-summary").textContent = `已选择 ${selected} / ${total} 项`;
}

function addCustomTheory() {
  const name = $("#custom-theory-name").value.trim();
  const keys = $("#custom-theory-keywords").value.split(/[、,，;；]/).map((item) => item.trim()).filter(Boolean);
  if (name.length < 2) {
    toast("请填写至少 2 个字符的理论名称。")
    return;
  }
  if (!keys.length) {
    toast("请至少填写一个逐字稿证据关键词。")
    return;
  }
  if (theoryRules.some((rule) => rule.name === name)) {
    toast("该理论已经在理论库中。")
    return;
  }
  const rule = {
    name,
    category: "用户自定义理论库",
    keys,
    mechanisms: ["自定义解释机制"],
    insight: `根据用户设定的关键词，从逐字稿中识别与“${name}”相关的课堂证据。`,
    gap: "自定义理论需要继续补充理论定义、判断标准和反例边界。",
    improvement: "结合该理论的核心机制，将建议细化为可观察、可执行的课堂行为。",
    teacherTalk: "请结合当前课堂证据说明这一理论机制如何支持学生学习。",
    custom: true
  };
  theoryRules.push(rule);
  const customRules = theoryRules.filter((item) => item.custom);
  localStorage.setItem(CUSTOM_THEORIES_KEY, JSON.stringify(customRules));
  initializeTheorySelector();
  $("#custom-theory-name").value = "";
  $("#custom-theory-keywords").value = "";
  toast(`“${name}”已加入本地理论库。`)
}

function formatMediaTime(seconds) {
  const safeSeconds = Math.max(0, Math.floor(Number(seconds) || 0));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const rest = safeSeconds % 60;
  return [hours, minutes, rest].map((part) => String(part).padStart(2, "0")).join(":");
}

function handleMediaFile(file) {
  if (!file) return;
  if (!file.type.startsWith("audio/") && !file.type.startsWith("video/")) {
    toast("请选择有效的音频或视频文件。")
    return;
  }
  if (mediaState.url) URL.revokeObjectURL(mediaState.url);
  mediaState.url = URL.createObjectURL(file);
  mediaState.type = file.type.startsWith("video/") ? "video" : "audio";
  mediaState.name = file.name;
  mediaState.markers = [];
  const audio = $("#audio-player");
  const video = $("#video-player");
  audio.hidden = mediaState.type !== "audio";
  video.hidden = mediaState.type !== "video";
  const activePlayer = mediaState.type === "video" ? video : audio;
  activePlayer.src = mediaState.url;
  $("#media-player-wrap").hidden = false;
  $("#media-file-status").textContent = `${file.name} · 用于对照逐字稿核验，不自动转写`;
  $("#media-markers").innerHTML = "";
  toast(`已载入音视频：${file.name}`)
}

function captureMediaTime() {
  const player = mediaState.type === "video" ? $("#video-player") : $("#audio-player");
  if (!mediaState.url || !Number.isFinite(player.currentTime)) {
    toast("请先载入并播放课堂音视频。")
    return;
  }
  const marker = { time: formatMediaTime(player.currentTime), seconds: player.currentTime };
  mediaState.markers.push(marker);
  $("#media-markers").innerHTML = mediaState.markers.map((item, index) => `<button class="media-marker" type="button" data-media-seconds="${item.seconds}"><i data-lucide="bookmark"></i>证据 ${index + 1} · ${item.time}</button>`).join("");
  $$("[data-media-seconds]").forEach((button) => button.addEventListener("click", () => {
    player.currentTime = Number(button.dataset.mediaSeconds);
    player.play();
  }));
  refreshIcons();
  toast(`已记录音视频时间点 ${marker.time}`)
}

async function hashPassword(password) {
  if (window.crypto?.subtle) {
    const bytes = new TextEncoder().encode(`EduLink::${password}`);
    const digest = await window.crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  let hash = 2166136261;
  for (const char of `EduLink::${password}`) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return `fallback-${(hash >>> 0).toString(16)}`;
}

function setAvatarSources(source) {
  const avatar = source || DEFAULT_AVATAR;
  [$("#header-avatar"), $("#menu-avatar"), $("#login-avatar-preview")].forEach((image) => {
    if (image) image.src = avatar;
  });
}

function getAssistantMentorSource() {
  return authState.user?.gender === "male" ? MALE_GUIDE_MENTOR : FEMALE_GUIDE_MENTOR;
}

function renderAssistantMentor() {
  const source = getAssistantMentorSource();
  $$('[data-assistant-mentor-image]').forEach((image) => {
    if (image.src.endsWith(source.replace("./", ""))) return;
    image.src = source;
  });
}

function reflectionNavigationSection(sectionName) {
  if (REFLECTION_PATH_SECTIONS.includes(sectionName)) return "reflect-diagnosis";
  if (REFLECTION_HISTORY_SECTIONS.includes(sectionName)) return "reflect-trajectory";
  return sectionName;
}

function renderWorkspaceAssistantSwitcher(viewName = state.currentView, sectionName = state.currentSection) {
  const switcher = $("#assistant-switcher");
  if (!switcher) return;
  const items = workspaceAssistantSubnav[viewName] || [];
  const navigationSection = viewName === "reflect"
    ? reflectionNavigationSection(sectionName)
    : canonicalWorkspaceSection(sectionName);
  const isActive = (item) => item.section === navigationSection || (
    viewName === "sixarts" && item.section === "sixarts-design" && ["sixarts-process", "sixarts-evaluate"].includes(sectionName)
  );
  switcher.innerHTML = items.map((item) => `<button class="assistant-tab${isActive(item) ? " active" : ""}" type="button" data-workspace-section="${item.section}" title="${escapeHtml(item.label)}"><span class="assistant-tab-icon"><i data-lucide="${item.icon}"></i></span><span class="assistant-tab-label">${escapeHtml(item.label)}</span></button>`).join("");
  const hideSwitcher = viewName === "resources";
  switcher.hidden = hideSwitcher;
  switcher.closest(".page-heading-actions")?.toggleAttribute("hidden", hideSwitcher);
  switcher.dataset.assistantView = viewName;
  refreshIcons();
}

function renderUserAccount() {
  const user = authState.user;
  const account = $("#user-account");
  account.classList.toggle("logged-out", !user);
  $("#header-user-state").textContent = user ? "已登录" : "个人账户";
  $("#header-username").textContent = user?.username || "登录";
  $("#menu-username").textContent = user?.username || "未登录";
  $("#entry-login span").textContent = user ? "进入工作台" : "登录工作台";
  $("#entry-primary").childNodes[0].textContent = user ? "进入工作台 " : "登录并进入 ";
  setAvatarSources(user?.avatar || authState.draftAvatar || DEFAULT_AVATAR);
  renderAssistantMentor();
  refreshIcons();
}

function setAuthMode(mode = "login") {
  authState.mode = mode === "register" ? "register" : "login";
  const registering = authState.mode === "register";
  $("#auth-title").textContent = registering ? "创建你的工作台账户" : "登录你的工作台";
  $("#auth-description").textContent = registering ? "注册后可选择导航助手形象，设置会保存在当前浏览器" : "登录后进入你的个人学习与教学工作区";
  $("#auth-submit-label").textContent = registering ? "创建账户并进入" : "登录工作台";
  $("#auth-confirm-field").hidden = !registering;
  $("#auth-gender-field").hidden = !registering;
  $("#register-password-confirm").required = registering;
  $$('[data-auth-mode]').forEach((button) => {
    const active = button.dataset.authMode === authState.mode;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });
  if (!registering) $("#register-password-confirm").value = "";
  $("#auth-error").textContent = "";
  refreshIcons();
}

function openAuthModal(options = {}) {
  closeUserMenu();
  authState.enterAfterLogin = Boolean(options.enterWorkspace);
  authState.pendingWorkspaceSection = options.destination || "";
  setAuthMode(options.mode || "login");
  const profile = authState.user || getStoredProfile();
  const username = options.clear ? "" : profile?.username || "";
  const avatar = options.clear ? DEFAULT_AVATAR : profile?.avatar || DEFAULT_AVATAR;
  authState.draftAvatar = avatar;
  authState.draftAvatarChanged = false;
  $("#login-username").value = username;
  $("#login-password").value = "";
  $("#register-password-confirm").value = "";
  const gender = profile?.gender === "male" ? "male" : "female";
  const genderInput = document.querySelector(`input[name="auth-gender"][value="${gender}"]`);
  if (genderInput) genderInput.checked = true;
  $("#auth-error").textContent = "";
  $("#remember-login").checked = true;
  setAvatarSources(avatar);
  $("#auth-modal").classList.add("open");
  $("#auth-modal").setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  window.setTimeout(() => $(username ? "#login-password" : "#login-username").focus(), 120);
}

function closeAuthModal() {
  $("#auth-modal").classList.remove("open");
  $("#auth-modal").setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  if (authState.user) {
    authState.draftAvatar = authState.user.avatar || DEFAULT_AVATAR;
    authState.draftAvatarChanged = false;
    renderUserAccount();
  }
}

function closeUserMenu() {
  $("#user-menu").classList.remove("open");
  $("#user-entry").setAttribute("aria-expanded", "false");
}

function toggleUserMenu() {
  if (!authState.user) {
    openAuthModal();
    return;
  }
  const menu = $("#user-menu");
  const open = !menu.classList.contains("open");
  menu.classList.toggle("open", open);
  $("#user-entry").setAttribute("aria-expanded", String(open));
}

function persistUser(user, remember) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(user));
  localStorage.removeItem(AUTH_KEY);
  sessionStorage.removeItem(AUTH_KEY);
  const target = remember ? localStorage : sessionStorage;
  target.setItem(AUTH_KEY, JSON.stringify(user));
}

async function loginUser(event) {
  event.preventDefault();
  const username = $("#login-username").value.trim();
  const password = $("#login-password").value;
  if (username.length < 2) {
    $("#auth-error").textContent = "用户名至少需要 2 个字符。";
    $("#login-username").focus();
    return;
  }
  if (password.length < 4) {
    $("#auth-error").textContent = "密码至少需要 4 位。";
    $("#login-password").focus();
    return;
  }
  try {
    const accountKey = username.toLocaleLowerCase("zh-CN");
    const accounts = getLocalAccounts();
    const existingAccount = accounts[accountKey];
    const passwordHash = await hashPassword(password);
    if (existingAccount && existingAccount.passwordHash !== passwordHash) {
      $("#auth-error").textContent = "密码不正确，请重新输入。";
      $("#login-password").select();
      return;
    }
    const avatar = authState.draftAvatarChanged
      ? authState.draftAvatar
      : existingAccount?.avatar || authState.draftAvatar || DEFAULT_AVATAR;
    const user = {
      username: existingAccount?.username || username,
      avatar,
      gender: existingAccount?.gender === "male" ? "male" : "female",
      loggedInAt: new Date().toISOString()
    };
    accounts[accountKey] = {
      username: user.username,
      avatar,
      gender: user.gender,
      passwordHash,
      createdAt: existingAccount?.createdAt || new Date().toISOString()
    };
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    persistUser(user, $("#remember-login").checked);
    authState.user = user;
  } catch {
    $("#auth-error").textContent = "浏览器未允许保存账户状态，请检查隐私设置。";
    return;
  }
  renderUserAccount();
  closeAuthModal();
  if (authState.enterAfterLogin) {
    const destination = authState.pendingWorkspaceSection;
    authState.enterAfterLogin = false;
    authState.pendingWorkspaceSection = "";
    enterWorkspace({ destination });
  }
  toast(`欢迎回来，${authState.user.username}。`);
}

async function registerUser(event) {
  event.preventDefault();
  const username = $("#login-username").value.trim();
  const password = $("#login-password").value;
  const confirmation = $("#register-password-confirm").value;
  if (username.length < 2) {
    $("#auth-error").textContent = "用户名至少需要 2 个字符。";
    $("#login-username").focus();
    return;
  }
  if (password.length < 4) {
    $("#auth-error").textContent = "密码至少需要 4 位。";
    $("#login-password").focus();
    return;
  }
  if (password !== confirmation) {
    $("#auth-error").textContent = "两次输入的密码不一致。";
    $("#register-password-confirm").focus();
    return;
  }
  const accountKey = username.toLocaleLowerCase("zh-CN");
  const accounts = getLocalAccounts();
  if (accounts[accountKey]) {
    $("#auth-error").textContent = "这个用户名已经存在，请直接登录。";
    return;
  }
  try {
    const passwordHash = await hashPassword(password);
    const gender = document.querySelector('input[name="auth-gender"]:checked')?.value === "male" ? "male" : "female";
    const avatar = authState.draftAvatarChanged ? authState.draftAvatar : DEFAULT_AVATAR;
    const now = new Date().toISOString();
    const user = { username, avatar, gender, loggedInAt: now };
    accounts[accountKey] = { username, avatar, gender, passwordHash, createdAt: now };
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    persistUser(user, $("#remember-login").checked);
    authState.user = user;
  } catch {
    $("#auth-error").textContent = "浏览器未允许保存账户状态，请检查隐私设置。";
    return;
  }
  renderUserAccount();
  closeAuthModal();
  if (authState.enterAfterLogin) {
    const destination = authState.pendingWorkspaceSection;
    authState.enterAfterLogin = false;
    authState.pendingWorkspaceSection = "";
    enterWorkspace({ destination });
  }
  toast(`账户已创建，欢迎你，${authState.user.username}。`);
}

function logoutUser() {
  localStorage.removeItem(AUTH_KEY);
  sessionStorage.removeItem(AUTH_KEY);
  authState.user = null;
  authState.draftAvatar = DEFAULT_AVATAR;
  closeUserMenu();
  renderUserAccount();
  showLanding();
  toast("已退出登录。你的课堂工作区仍保存在本机。")
}

function resizeAvatar(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("请选择有效的图片文件。"));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      reject(new Error("头像图片不能超过 5 MB。"));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("头像读取失败，请重新选择。"));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("图片格式无法识别，请使用 JPG、PNG 或 WEBP。"));
      image.onload = () => {
        const size = Math.min(image.naturalWidth, image.naturalHeight);
        const sx = Math.max(0, (image.naturalWidth - size) / 2);
        const sy = Math.max(0, (image.naturalHeight - size) / 2);
        const canvas = document.createElement("canvas");
        canvas.width = 320;
        canvas.height = 320;
        const context = canvas.getContext("2d");
        context.drawImage(image, sx, sy, size, size, 0, 0, 320, 320);
        resolve(canvas.toDataURL("image/jpeg", 0.86));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

async function handleAvatarUpload(file, updateCurrentUser = false) {
  if (!file) return;
  try {
    const avatar = await resizeAvatar(file);
    authState.draftAvatar = avatar;
    authState.draftAvatarChanged = true;
    setAvatarSources(avatar);
    if (updateCurrentUser && authState.user) {
      authState.user = { ...authState.user, avatar };
      const accounts = getLocalAccounts();
      const accountKey = authState.user.username.toLocaleLowerCase("zh-CN");
      if (accounts[accountKey]) {
        accounts[accountKey].avatar = avatar;
        localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
      }
      const remembered = Boolean(localStorage.getItem(AUTH_KEY));
      persistUser(authState.user, remembered);
      renderUserAccount();
      closeUserMenu();
      toast("头像已更新。")
    } else {
      toast("头像已载入，登录后生效。")
    }
  } catch (error) {
    $("#auth-error").textContent = error.message;
    toast(error.message);
  }
}

let transcriptCountFrame = 0;

function updateTranscriptCount() {
  if (transcriptCountFrame) return;
  transcriptCountFrame = window.requestAnimationFrame(() => {
    transcriptCountFrame = 0;
    const text = els.transcript.value.trim();
    const count = text.replace(/\s/g, "").length;
    $("#transcript-count").textContent = `${count} 字`;
  });
}

function updateLessonContext() {
  const lesson = els.lessonTitle.value.trim() || "未命名课堂";
  const subject = els.subject.value.trim() || "待补充学科";
  const grade = els.grade.value.trim() || "待补充年级";
  const duration = els.duration.value.trim() || "待补充时长";
  $(".observe-banner h2").textContent = lesson;
  $(".observe-banner .banner-copy > p").textContent = `${grade} · ${subject} · ${duration}课堂实录`;
}

function refreshReportMetadata() {
  if (!els.report || !els.report.value.trim()) return false;
  const values = {
    "课题": els.lessonTitle.value.trim() || "待补充",
    "学科": els.subject.value.trim() || "待补充",
    "年级": els.grade.value.trim() || "待补充",
    "课堂时长": els.duration.value.trim() || "待补充"
  };
  let report = els.report.value;
  let changed = false;
  Object.entries(values).forEach(([label, value]) => {
    const pattern = new RegExp(`^${label}：.*$`, "m");
    if (!pattern.test(report)) return;
    report = report.replace(pattern, `${label}：${value}`);
    changed = true;
  });
  if (changed) {
    els.report.value = report;
    state.report = report;
  }
  return changed;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function applyWorkspacePerformanceMode() {
  const root = document.documentElement;
  const saved = localStorage.getItem(RENDER_QUALITY_KEY);
  const quality = ["low", "medium", "high"].includes(saved) ? saved : "medium";
  root.classList.toggle("workspace-perf-low", quality === "low");
  root.classList.toggle("workspace-perf-medium", quality === "medium");
  root.classList.toggle("workspace-perf-high", quality === "high");
  root.classList.toggle("workspace-perf-lite", quality === "low");
  root.dataset.workspacePerf = quality;
  const labels = { low: "低", medium: "中", high: "高" };
  const current = $("#render-quality-current");
  if (current) current.textContent = labels[quality];
  $$('[data-render-quality]').forEach((button) => {
    const active = button.dataset.renderQuality === quality;
    button.classList.toggle("active", active);
    button.setAttribute("aria-checked", String(active));
  });
  $$('[data-settings-render-quality]').forEach((button) => {
    const active = button.dataset.settingsRenderQuality === quality;
    button.classList.toggle("active", active);
    button.setAttribute("aria-checked", String(active));
  });
  return quality;
}

function canUseLiveGlassRefraction() {
  return document.documentElement.dataset.workspacePerf === "high"
    && isPointerGlassEnabled()
    && !prefersReducedMotion()
    && !window.matchMedia("(pointer: coarse)").matches;
}

function isPointerGlassEnabled() {
  return localStorage.getItem(POINTER_GLASS_KEY) !== "off";
}

function applyPointerGlassPreference() {
  const enabled = isPointerGlassEnabled();
  const root = document.documentElement;
  root.dataset.pointerGlass = enabled ? "on" : "off";
  root.classList.toggle("pointer-glass-enabled", enabled);
  root.classList.toggle("pointer-glass-disabled", !enabled);
  const input = $("#pointer-glass-enabled");
  const status = $("#pointer-glass-status");
  if (input) input.checked = enabled;
  if (status) status.textContent = enabled ? "已开启鼠标跟随效果" : "已关闭，使用静态玻璃效果";
  if (!enabled) {
    $$(".liquid-glass-lens").forEach((lens) => lens.classList.remove("active"));
    $$(".glass-reactive").forEach((element) => {
      element.style.setProperty("--glass-x", "-320px");
      element.style.setProperty("--glass-y", "-320px");
      element.style.setProperty("--glass-angle", "135deg");
    });
  }
  return enabled;
}

function getWorkspaceFontScale() {
  const raw = localStorage.getItem(WORKSPACE_FONT_SCALE_KEY);
  if (raw === null || raw === "") return WORKSPACE_FONT_PROFILE.defaultScale;
  const saved = Number(raw);
  return Number.isFinite(saved)
    ? Math.min(WORKSPACE_FONT_PROFILE.maxScale, Math.max(WORKSPACE_FONT_PROFILE.minScale, saved))
    : WORKSPACE_FONT_PROFILE.defaultScale;
}

function getActiveWorkspaceFontScale() {
  return workspaceFontScaleDraft ?? getWorkspaceFontScale();
}

function getWorkspaceTypographyNodes() {
  return $$("#workspace-app :is(h1, h2, h3, h4, h5, p, span, small, b, strong, em, label, button, input, textarea, select, option, th, td, li, dt, dd)");
}

function getWorkspaceBoxNodes() {
  return $$("#workspace-app :is(.workspace-banner, .card, .metric, .signal-stat, .learning-theory-card, .theory-stat, .theory-category-map > button, .theory-plan-action, .theory-library-preview, .theory-dialogue-aside, .theory-chat-shell, .theory-message > div, .sixarts-design-module, .sixarts-design-aside, .sixarts-resource-card, .sixarts-rubric-shell, .sixarts-pbl, .journey-node, .reflection-loop-flow .conversion-step, .reflection-signal-list button, .reflection-theory-ranks button, .diagnosis-item, .reflection-theory-option, .reflection-action-item)");
}

function applyWorkspaceFontScale(value = getActiveWorkspaceFontScale()) {
  const scale = Number.isFinite(Number(value))
    ? Math.min(WORKSPACE_FONT_PROFILE.maxScale, Math.max(WORKSPACE_FONT_PROFILE.minScale, Number(value)))
    : WORKSPACE_FONT_PROFILE.defaultScale;
  const root = document.documentElement;
  ensureWorkspaceEditableIds();
  root.style.setProperty("--workspace-font-scale", scale.toFixed(3));
  root.dataset.workspaceFontScale = scale.toFixed(3);

  const nav = $("#workspace-app .nav-link");
  if (nav && !nav.dataset.edulinkBaseFontSize) {
    const measuredNavFontSize = parseFloat(getComputedStyle(nav).fontSize);
    if (Number.isFinite(measuredNavFontSize) && measuredNavFontSize > 0) nav.dataset.edulinkBaseFontSize = String(measuredNavFontSize);
  }
  const navFontSize = nav ? Number(nav.dataset.edulinkBaseFontSize) : WORKSPACE_FONT_PROFILE.desktopFloorPx;
  const minimumScale = Math.max(1, scale);
  const screenFloor = window.innerWidth >= 3200
    ? WORKSPACE_FONT_PROFILE.fourKFloorPx
    : window.innerWidth >= 2000
      ? WORKSPACE_FONT_PROFILE.twoKFloorPx
      : WORKSPACE_FONT_PROFILE.desktopFloorPx;
  const fontFloor = Math.max(screenFloor, navFontSize || screenFloor) * minimumScale;
  root.style.setProperty("--workspace-font-floor", fontFloor.toFixed(2) + "px");

  getWorkspaceTypographyNodes().forEach((element) => {
    const hasLocalFontOverride = Boolean(
      element.dataset.edulinkLocalFontSize
      || element.dataset.edulinkLocalFontColor
      || element.dataset.edulinkLocalFontWeight
      || element.dataset.edulinkLocalLineHeight
      || element.dataset.edulinkLocalLetterSpacing
    );
    if (document.body.classList.contains("workspace-active") && !hasLocalFontOverride && element.dataset.edulinkWorkspaceBaseline !== "true") {
      element.style.removeProperty("font-size");
      delete element.dataset.edulinkBaseFontSize;
      element.dataset.edulinkWorkspaceBaseline = "true";
    }
    if (!element.dataset.edulinkBaseFontSize) {
      const measured = parseFloat(getComputedStyle(element).fontSize);
      if (Number.isFinite(measured) && measured > 0) element.dataset.edulinkBaseFontSize = String(measured);
    }
    const base = Number(element.dataset.edulinkBaseFontSize);
    if (!Number.isFinite(base)) return;
    const targetFontSize = Math.max(fontFloor, base * scale);
    element.style.fontSize = targetFontSize.toFixed(2) + "px";
    element.dataset.edulinkFontSize = targetFontSize.toFixed(2) + "px";
  });

  getWorkspaceBoxNodes().forEach((element) => {
    if (document.body.classList.contains("workspace-active") && element.dataset.edulinkWorkspaceBoxBaseline !== "true") {
      element.style.removeProperty("min-height");
      delete element.dataset.edulinkBaseMinHeight;
      element.dataset.edulinkWorkspaceBoxBaseline = "true";
    }
    if (!element.dataset.edulinkBaseMinHeight) {
      const measured = element.getBoundingClientRect().height;
      if (Number.isFinite(measured) && measured > 0) element.dataset.edulinkBaseMinHeight = String(measured);
    }
    const baseHeight = Number(element.dataset.edulinkBaseMinHeight);
    if (!Number.isFinite(baseHeight)) return;
    element.style.minHeight = Math.ceil(baseHeight * Math.max(1, scale)) + "px";
  });

  const input = $("#workspace-font-scale");
  const output = $("#workspace-font-size-value");
  const status = $("#workspace-font-size-status");
  if (input) input.value = String(Math.round(scale * 100));
  if (output) output.textContent = Math.round(scale * 100) + "%";
  if (status) {
    status.textContent = workspaceFontScaleDraft === null
      ? "已保存：最低字号 " + Math.round(fontFloor) + "px"
      : "预览中：最低字号 " + Math.round(fontFloor) + "px，点击保存后长期记忆";
  }
  if (typeof fitWorkspacePageTitle === "function") fitWorkspacePageTitle();
  return scale;
}

function setWorkspaceFontScale(value) {
  workspaceFontScaleDraft = applyWorkspaceFontScale(value);
  return workspaceFontScaleDraft;
}

function getWorkspaceLocalFontOverrides() {
  return readStoredJson(localStorage, WORKSPACE_LOCAL_FONT_KEY) || {};
}

function getWorkspaceLocalBoxOverrides() {
  return readStoredJson(localStorage, WORKSPACE_LOCAL_BOX_KEY) || {};
}

function getWorkspaceDeviceProfile() {
  const screenWidth = Number(window.screen?.width) || 0;
  const screenHeight = Number(window.screen?.height) || 0;
  const dpr = Number(window.devicePixelRatio) || 1;
  const visualViewport = window.visualViewport;
  return {
    screenWidth,
    screenHeight,
    availableWidth: Number(window.screen?.availWidth) || screenWidth,
    availableHeight: Number(window.screen?.availHeight) || screenHeight,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    visualViewportWidth: Math.round(Number(visualViewport?.width) || window.innerWidth),
    visualViewportHeight: Math.round(Number(visualViewport?.height) || window.innerHeight),
    outerWindowWidth: Number(window.outerWidth) || 0,
    outerWindowHeight: Number(window.outerHeight) || 0,
    devicePixelRatio: dpr,
    estimatedPhysicalPixelWidth: Math.round(screenWidth * dpr),
    estimatedPhysicalPixelHeight: Math.round(screenHeight * dpr),
    colorDepth: Number(window.screen?.colorDepth) || 0,
    pixelDepth: Number(window.screen?.pixelDepth) || 0,
    orientation: window.matchMedia("(orientation: portrait)").matches ? "portrait" : "landscape",
    browserZoomEstimate: dpr,
    userAgent: navigator.userAgent,
    platform: navigator.userAgentData?.platform || navigator.platform || "unknown",
    language: navigator.language,
    hardwareConcurrency: Number(navigator.hardwareConcurrency) || null,
    deviceMemoryGB: Number(navigator.deviceMemory) || null,
    capturedAt: new Date().toISOString()
  };
}

function saveWorkspaceDeviceProfile() {
  localStorage.setItem(WORKSPACE_DEVICE_KEY, JSON.stringify(getWorkspaceDeviceProfile()));
}

function normalizeColor(value, fallback = "#43384f") {
  if (!value) return fallback;
  const color = String(value).trim();
  if (/^#[0-9a-f]{6}$/i.test(color)) return color.toLowerCase();
  if (/^#[0-9a-f]{3}$/i.test(color)) {
    return "#" + color.slice(1).split("").map((char) => char + char).join("").toLowerCase();
  }
  const match = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (!match) return fallback;
  return "#" + [match[1], match[2], match[3]].map((part) => Number(part).toString(16).padStart(2, "0")).join("");
}

function hashWorkspaceEditSignature(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function getWorkspaceDirectText(element) {
  return Array.from(element.childNodes || [])
    .filter((node) => node.nodeType === Node.TEXT_NODE)
    .map((node) => node.nodeValue || "")
    .join(" ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 72);
}

function getWorkspaceTargetText(element) {
  if (!element) return "";
  if (["INPUT", "TEXTAREA", "SELECT"].includes(element.tagName)) {
    return String(element.value || element.placeholder || element.getAttribute("aria-label") || "").trim().replace(/\s+/g, " ").slice(0, 120);
  }
  return String(element.textContent || "").trim().replace(/\s+/g, " ").slice(0, 120);
}

function getWorkspaceEditSignature(element) {
  const classes = Array.from(element.classList || [])
    .filter((name) => !["active", "open", "is-active", "is-complete", "workspace-font-target", "workspace-box-target"].includes(name))
    .sort()
    .slice(0, 5)
    .join(".");
  const parent = element.parentElement;
  const parentIdentity = parent?.id || Array.from(parent?.classList || []).filter((name) => !name.startsWith("is-")).sort().slice(0, 2).join(".") || "root";
  const directText = getWorkspaceDirectText(element);
  return [element.tagName.toLowerCase(), classes, parentIdentity, directText].join("|");
}

function getWorkspaceLegacyEditId(element) {
  const signature = element.id ? "id|" + element.id : getWorkspaceEditSignature(element);
  const siblings = Array.from(element.parentElement?.children || []);
  const index = siblings.indexOf(element);
  const occurrence = siblings
    .slice(0, index + 1)
    .filter((sibling) => (sibling.id ? "id|" + sibling.id : getWorkspaceEditSignature(sibling)) === signature).length;
  return "ed-" + hashWorkspaceEditSignature(signature + "|" + occurrence);
}

function getWorkspaceStableIdentity(element) {
  const parts = [];
  let current = element;
  while (current && current.id !== "workspace-app") {
    const classes = Array.from(current.classList || [])
      .filter((name) => !name.startsWith("workspace-") && !["active", "open", "is-active", "is-complete"].includes(name))
      .sort()
      .slice(0, 4)
      .join(".");
    const identity = current.id
      ? "#" + current.id
      : current.tagName.toLowerCase() + "." + classes + "|" + getWorkspaceDirectText(current);
    parts.unshift(identity);
    current = current.parentElement;
  }
  return parts.join(">");
}

function getWorkspaceStableEditId(element, occurrence = 0) {
  return "ed-" + hashWorkspaceEditSignature(getWorkspaceStableIdentity(element) + "|" + occurrence);
}

function ensureWorkspaceEditableIds() {
  const workspace = $("#workspace-app");
  if (!workspace) return;
  if (workspace.dataset.edulinkEditIdsReady === "true") {
    const hasNewEditableElement = Array.from(workspace.querySelectorAll("*:not(#workspace-font-editor):not(#workspace-font-editor *)"))
      .some((element) => !element.dataset.edulinkEditId && !element.closest(".workspace-settings-layer, .workspace-guide-layer, .user-menu, .render-quality-menu"));
    if (!hasNewEditableElement) return;
  }
  const candidates = $$(`#workspace-app *`).filter((element) => {
    if (element.closest("#workspace-font-editor, .workspace-settings-layer, .workspace-guide-layer, .user-menu, .render-quality-menu")) return false;
    const rect = element.getBoundingClientRect();
    const hasText = Boolean(element.textContent?.trim());
    const isVisual = ["SVG", "CANVAS", "IMG", "VIDEO", "TABLE", "BUTTON", "SECTION", "ARTICLE", "ASIDE", "FIELDSET"].includes(element.tagName);
    // Give every visible surface a stable identity, including small floating controls and chart nodes.
    return hasText || isVisual || rect.width >= 8 && rect.height >= 8;
  });
  const identityOccurrences = new Map();
  candidates.forEach((element) => {
    const identity = getWorkspaceStableIdentity(element);
    const occurrence = identityOccurrences.get(identity) || 0;
    identityOccurrences.set(identity, occurrence + 1);
    if (element.dataset.edulinkEditId) return;
    element.dataset.edulinkLegacyEditId = getWorkspaceLegacyEditId(element);
    element.dataset.edulinkEditId = getWorkspaceStableEditId(element, occurrence);
  });
  workspace.dataset.edulinkEditIdsReady = "true";
}

function findWorkspaceElementByEditId(editId) {
  if (!editId) return null;
  return $$("#workspace-app [data-edulink-edit-id]").find((element) => (
    element.dataset.edulinkEditId === editId || element.dataset.edulinkLegacyEditId === editId
  )) || null;
}

function getWorkspaceSavedTarget(data, storageKey) {
  ensureWorkspaceEditableIds();
  const byId = findWorkspaceElementByEditId(data?.editId);
  if (byId) return byId;
  const bySelector = data?.selector || storageKey;
  if (bySelector) {
    try {
      const target = $(bySelector);
      if (target) {
        if (target.dataset.edulinkEditId) data.editId = target.dataset.edulinkEditId;
        return target;
      }
    } catch {
      // Old exports can contain a selector that is no longer valid CSS.
    }
  }
  const text = String(data?.text || "").trim();
  if (!text) return null;
  const matches = $$("#workspace-app *").filter((element) => {
    if (element.closest("#workspace-font-editor, .workspace-settings-layer, .workspace-guide-layer")) return false;
    const content = element.textContent?.trim().replace(/\s+/g, " ");
    return content === text || getWorkspaceDirectText(element) === text;
  });
  const target = matches.sort((a, b) => a.textContent.length - b.textContent.length)[0] || null;
  if (target?.dataset.edulinkEditId) data.editId = target.dataset.edulinkEditId;
  return target;
}

function buildWorkspaceElementPath(element) {
  const parts = [];
  let current = element;
  while (current && current.id !== "workspace-app") {
    if (current.id) {
      parts.unshift("#" + current.id);
      break;
    }
    let index = 1;
    let sibling = current.previousElementSibling;
    while (sibling) {
      if (sibling.tagName === current.tagName) index += 1;
      sibling = sibling.previousElementSibling;
    }
    parts.unshift(current.tagName.toLowerCase() + ":nth-of-type(" + index + ")");
    current = current.parentElement;
  }
  return "#workspace-app " + parts.join(" > ");
}

function getWorkspaceLocalTextTarget(node) {
  const element = node?.nodeType === Node.TEXT_NODE ? node.parentElement : node;
  if (!element || !element.closest("#workspace-app") || element.closest("#workspace-font-editor")) return null;
  const svgText = element.closest("svg text, svg tspan");
  if (svgText) return svgText;
  if (element.closest("svg, option, [contenteditable=\"true\"]")) return null;
  const formControl = element.closest("input, textarea, select");
  if (formControl && getWorkspaceTargetText(formControl)) return formControl;
  const known = element.closest("h1, h2, h3, h4, h5, p, span, small, b, strong, em, label, button, a, th, td, li, dt, dd, code, pre, blockquote, figcaption, time");
  if (known && getWorkspaceTargetText(known) && !known.closest(".workspace-settings-layer")) return known;
  let current = element;
  while (current && current.id !== "workspace-app") {
    const ownText = getWorkspaceDirectText(current);
    const isTextContainer = ["DIV", "SECTION", "ARTICLE", "ASIDE", "HEADER", "FOOTER", "CAPTION", "LEGEND"].includes(current.tagName);
    if (ownText && isTextContainer) return current;
    current = current.parentElement;
  }
  const fallbackRect = element.getBoundingClientRect();
  if (fallbackRect.width >= 8 && fallbackRect.height >= 8) return element;
  return null;
}

const WORKSPACE_LOCAL_BOX_SELECTOR = [
  ".main article",
  ".main .card",
  ".main .metric",
  ".main .signal-stat",
  ".main .learning-theory-card",
  ".main .theory-stat",
  ".main .theory-category-map > button",
  ".main .theory-plan-action",
  ".main .theory-library-preview",
  ".main .theory-dialogue-aside",
  ".main .theory-chat-shell",
  ".main .theory-message > div",
  ".main .sixarts-design-module",
  ".main .sixarts-design-aside",
  ".main .sixarts-resource-card",
  ".main .sixarts-rubric-shell",
  ".main .sixarts-pbl",
  ".main .journey-node",
  ".main .conversion-step",
  ".main .diagnosis-item",
  ".main .reflection-theory-option",
  ".main .reflection-action-item",
  ".main .workspace-banner",
  ".main [class*='-card']",
  ".main [class*='-module']",
  ".main [class*='-item']",
  ".main [class*='-option']",
  ".main [class*='-action']",
  ".main button",
  ".main table",
  ".main th",
  ".main td",
  ".rail .nav-link"
].join(", ");

function getWorkspaceLocalBoxTarget(node) {
  const element = node?.nodeType === Node.TEXT_NODE ? node.parentElement : node;
  if (!element || !element.closest("#workspace-app") || element.closest("#workspace-font-editor")) return null;
  if (element.closest(".workspace-settings-layer, .workspace-guide, .user-menu, .render-quality-menu")) return null;
  const visualRoot = element.closest("svg, canvas");
  if (visualRoot && visualRoot.closest("#workspace-app")) return visualRoot;
  let current = element;
  while (current && current.id !== "workspace-app") {
    const rect = current.getBoundingClientRect();
    const style = getComputedStyle(current);
    const isStructural = ["SECTION", "ARTICLE", "ASIDE", "BUTTON", "TABLE", "TR", "TD", "TH", "FIELDSET", "FORM", "SVG", "CANVAS", "IMG", "VIDEO"].includes(current.tagName);
    const hasVisualSurface = style.backgroundColor !== "rgba(0, 0, 0, 0)"
      || style.borderTopStyle !== "none"
      || style.boxShadow !== "none"
      || current.className?.toString().match(/card|banner|panel|module|item|option|node|preview|orbit|stat|chart|table|shell|action/i);
    if (rect.width >= 8 && rect.height >= 8 && (isStructural || hasVisualSurface)) return current;
    current = current.parentElement;
  }
  return null;
}

function getTextOccurrence(text, selectedText, charOffset) {
  let occurrence = 0;
  let searchFrom = 0;
  while (searchFrom < charOffset) {
    const index = text.indexOf(selectedText, searchFrom);
    if (index < 0 || index >= charOffset) break;
    occurrence += 1;
    searchFrom = index + Math.max(1, selectedText.length);
  }
  return occurrence;
}

function getWorkspaceTextOffset(root, targetNode, offset = 0) {
  let total = 0;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node && node !== targetNode) {
    total += node.nodeValue?.length || 0;
    node = walker.nextNode();
  }
  return total + Number(offset || 0);
}

function findTextNodeOccurrence(root, selectedText, occurrence) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue?.includes(selectedText)) return NodeFilter.FILTER_REJECT;
      if (node.parentElement?.closest(".workspace-local-font-fragment")) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  let seen = 0;
  let node = walker.nextNode();
  while (node) {
    let from = 0;
    let index = node.nodeValue.indexOf(selectedText, from);
    while (index >= 0) {
      if (seen === occurrence) return { node, index };
      seen += 1;
      from = index + Math.max(1, selectedText.length);
      index = node.nodeValue.indexOf(selectedText, from);
    }
    node = walker.nextNode();
  }
  return null;
}

function createWorkspaceLocalFragment(data, storageKey) {
  const existing = data.id ? $("[data-edulink-local-fragment-id=\"" + data.id + "\"]") : null;
  if (existing) return existing;
  const parent = findWorkspaceElementByEditId(data.parentEditId) || $(data.parentSelector);
  if (!parent || !data.text) return null;
  const match = findTextNodeOccurrence(parent, data.text, Number(data.occurrence) || 0);
  if (!match) return null;
  const range = document.createRange();
  range.setStart(match.node, match.index);
  range.setEnd(match.node, match.index + data.text.length);
  const span = document.createElement("span");
  span.className = "workspace-local-font-fragment";
  span.dataset.edulinkLocalFragmentId = data.id || "edulink-fragment-" + Date.now();
  span.dataset.edulinkLocalStorageKey = storageKey;
  range.surroundContents(span);
  return span;
}

function setWorkspaceLocalFontTarget(target, options = {}) {
  if (workspaceLocalFontState.target) workspaceLocalFontState.target.classList.remove("workspace-font-target");
  workspaceLocalFontState.target = target;
  workspaceLocalFontState.selector = target ? buildWorkspaceElementPath(target) : "";
  workspaceLocalFontState.storageKey = options.storageKey || workspaceLocalFontState.selector;
  workspaceLocalFontState.fragment = options.fragment || null;
  if (!target) return;

  target.classList.add("workspace-font-target");
  ensureWorkspaceEditableIds();
  workspaceLocalFontState.baseFontSize = Number(target.dataset.edulinkBaseFontSize) || parseFloat(getComputedStyle(target).fontSize) || 15;
  const currentSize = parseFloat(getComputedStyle(target).fontSize) || workspaceLocalFontState.baseFontSize;
  const computed = getComputedStyle(target);
  workspaceLocalFontState.textWeight = Number(target.dataset.edulinkLocalFontWeight || computed.fontWeight) || 400;
  workspaceLocalFontState.textLineHeight = Number(target.dataset.edulinkLocalLineHeight || (parseFloat(computed.lineHeight) / Math.max(1, currentSize) * 100)) || 140;
  workspaceLocalFontState.textLetterSpacing = Number(target.dataset.edulinkLocalLetterSpacing || parseFloat(computed.letterSpacing)) || 0;
  const range = $("#workspace-font-editor-range");
  const value = $("#workspace-font-editor-value");
  const colorInput = $("#workspace-font-editor-color");
  const colorValue = $("#workspace-font-editor-color-value");
  const targetLabel = $("#workspace-font-editor-target");
  if (range) {
    range.min = "8";
    range.max = "96";
    range.value = String(Math.min(96, Math.max(8, Math.round(currentSize))));
  }
  if (value) value.textContent = Math.round(currentSize) + "px";
  const weightRange = $("#workspace-font-editor-weight-range");
  const weightValue = $("#workspace-font-editor-weight-value");
  if (weightRange) weightRange.value = String(Math.min(800, Math.max(300, Math.round(workspaceLocalFontState.textWeight / 100) * 100)));
  if (weightValue) weightValue.textContent = weightRange?.value || "400";
  const lineHeightRange = $("#workspace-font-editor-line-height-range");
  const lineHeightValue = $("#workspace-font-editor-line-height-value");
  if (lineHeightRange) lineHeightRange.value = String(Math.min(220, Math.max(100, Math.round(workspaceLocalFontState.textLineHeight / 5) * 5)));
  if (lineHeightValue) lineHeightValue.textContent = (lineHeightRange?.value || "140") + "%";
  const letterRange = $("#workspace-font-editor-letter-spacing-range");
  const letterValue = $("#workspace-font-editor-letter-spacing-value");
  if (letterRange) letterRange.value = String(Math.min(6, Math.max(-1, workspaceLocalFontState.textLetterSpacing)));
  if (letterValue) letterValue.textContent = Number(letterRange?.value || 0).toFixed(1).replace(/\.0$/, "") + "px";
  const computedColor = getComputedStyle(target);
  const currentColor = normalizeColor(target.matches("text, tspan") ? computedColor.fill : computedColor.color);
  if (colorInput) colorInput.value = currentColor;
  if (colorValue) colorValue.textContent = currentColor.toUpperCase();
  if (targetLabel) {
    const text = getWorkspaceTargetText(target);
    targetLabel.textContent = text.length > 46 ? text.slice(0, 46) + "..." : text;
  }
  $("#workspace-font-editor-status")?.replaceChildren(document.createTextNode("已选中，可拖动字号"));
}

function applyWorkspaceLocalFontSize(target, fontSize) {
  if (!target) return;
  const baseFontSize = Number(target.dataset.edulinkBaseFontSize) || parseFloat(getComputedStyle(target).fontSize) || 15;
  const size = Math.min(96, Math.max(8, Number(fontSize) || baseFontSize));
  if (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) {
    target.style.fontSize = size + "px";
    target.dataset.edulinkLocalFontSize = size + "px";
    $("#workspace-font-editor-value").textContent = Math.round(size) + "px";
    return;
  }
  target.style.fontSize = size + "px";
  target.dataset.edulinkLocalFontSize = size + "px";
  $("#workspace-font-editor-value").textContent = Math.round(size) + "px";
}

function applyWorkspaceLocalTextWeight(target, weight) {
  if (!target) return;
  const value = Math.min(800, Math.max(300, Math.round(Number(weight) / 100) * 100 || 400));
  target.style.fontWeight = String(value);
  target.dataset.edulinkLocalFontWeight = String(value);
  $("#workspace-font-editor-weight-value").textContent = String(value);
}

function applyWorkspaceLocalTextLineHeight(target, percent) {
  if (!target) return;
  const value = Math.min(220, Math.max(100, Number(percent) || 140));
  target.style.lineHeight = (value / 100).toFixed(2);
  target.dataset.edulinkLocalLineHeight = String(value);
  $("#workspace-font-editor-line-height-value").textContent = Math.round(value) + "%";
}

function applyWorkspaceLocalTextLetterSpacing(target, spacing) {
  if (!target) return;
  const value = Math.min(6, Math.max(-1, Number(spacing) || 0));
  target.style.letterSpacing = value + "px";
  target.dataset.edulinkLocalLetterSpacing = String(value);
  $("#workspace-font-editor-letter-spacing-value").textContent = value.toFixed(1).replace(/\.0$/, "") + "px";
}

function applyWorkspaceLocalFontColor(target, color) {
  if (!target) return;
  const computed = getComputedStyle(target);
  const currentColor = target.matches("text, tspan") ? computed.fill : computed.color;
  const normalized = normalizeColor(color, normalizeColor(currentColor));
  target.style.color = normalized;
  if (target.matches("text, tspan")) target.style.fill = normalized;
  target.dataset.edulinkLocalFontColor = normalized;
  const input = $("#workspace-font-editor-color");
  const value = $("#workspace-font-editor-color-value");
  if (input) input.value = normalized;
  if (value) value.textContent = normalized.toUpperCase();
}

function applyWorkspaceLocalTypography() {
  const overrides = getWorkspaceLocalFontOverrides();
  Object.entries(overrides).forEach(([storageKey, data]) => {
    const target = data?.kind === "fragment"
      ? createWorkspaceLocalFragment(data, storageKey)
      : getWorkspaceSavedTarget(data, storageKey);
    if (!target) return;
    if (!data.editId && target.dataset.edulinkEditId) {
      data.editId = target.dataset.edulinkEditId;
    }
    if (Number.isFinite(Number(data?.fontSize))) applyWorkspaceLocalFontSize(target, data.fontSize);
    if (data?.color) applyWorkspaceLocalFontColor(target, data.color);
    if (Number.isFinite(Number(data?.fontWeight))) applyWorkspaceLocalTextWeight(target, data.fontWeight);
    if (Number.isFinite(Number(data?.lineHeight))) applyWorkspaceLocalTextLineHeight(target, data.lineHeight);
    if (Number.isFinite(Number(data?.letterSpacing))) applyWorkspaceLocalTextLetterSpacing(target, data.letterSpacing);
  });
  localStorage.setItem(WORKSPACE_LOCAL_FONT_KEY, JSON.stringify(overrides));
}

function saveWorkspaceLocalFontTarget(options = {}) {
  const target = workspaceLocalFontState.target;
  if (!target || !workspaceLocalFontState.storageKey) {
    if (!options.silent) toast("请先点击或拖选一个文字块。");
    return;
  }
  const overrides = getWorkspaceLocalFontOverrides();
  overrides[workspaceLocalFontState.storageKey] = {
    kind: workspaceLocalFontState.fragment ? "fragment" : "element",
    selector: workspaceLocalFontState.selector,
    editId: target.dataset.edulinkEditId || "",
    fontSize: parseFloat(target.dataset.edulinkLocalFontSize || getComputedStyle(target).fontSize),
    color: normalizeColor(target.dataset.edulinkLocalFontColor || (target.matches("text, tspan") ? getComputedStyle(target).fill : getComputedStyle(target).color)),
    fontWeight: Number(target.dataset.edulinkLocalFontWeight || getComputedStyle(target).fontWeight) || 400,
    lineHeight: Number(target.dataset.edulinkLocalLineHeight || 140),
    letterSpacing: Number(target.dataset.edulinkLocalLetterSpacing || parseFloat(getComputedStyle(target).letterSpacing) || 0),
    text: getWorkspaceTargetText(target),
    ...(workspaceLocalFontState.fragment || {})
  };
  localStorage.setItem(WORKSPACE_LOCAL_FONT_KEY, JSON.stringify(overrides));
  saveWorkspaceDeviceProfile();
  if (!options.silent) toast("当前文字的字号与颜色已保存。");
}

function resetWorkspaceLocalFontTarget() {
  const target = workspaceLocalFontState.target;
  if (!target) {
    toast("请先选择需要恢复的文字块。");
    return;
  }
  const overrides = getWorkspaceLocalFontOverrides();
  delete overrides[workspaceLocalFontState.storageKey];
  localStorage.setItem(WORKSPACE_LOCAL_FONT_KEY, JSON.stringify(overrides));
  const fragmentParent = target.classList.contains("workspace-local-font-fragment") ? target.parentNode : null;
  delete target.dataset.edulinkLocalFontSize;
  delete target.dataset.edulinkLocalFontColor;
  delete target.dataset.edulinkLocalFontWeight;
  delete target.dataset.edulinkLocalLineHeight;
  delete target.dataset.edulinkLocalLetterSpacing;
  target.style.fontSize = "";
  target.style.color = "";
  target.style.fontWeight = "";
  target.style.lineHeight = "";
  target.style.letterSpacing = "";
  if (target.matches("text, tspan")) target.style.fill = "";
  target.classList.remove("workspace-font-target");
  if (fragmentParent) {
    target.replaceWith(document.createTextNode(target.textContent));
    fragmentParent.normalize();
    workspaceLocalFontState.target = null;
    workspaceLocalFontState.selector = "";
    workspaceLocalFontState.storageKey = "";
    workspaceLocalFontState.fragment = null;
    $("#workspace-font-editor-target").textContent = "尚未选择文字";
    $("#workspace-font-editor-status").textContent = "点击文字块，或拖选一段文字";
    applyWorkspaceFontScale();
    toast("当前选中文字已恢复。");
    return;
  }
  applyWorkspaceFontScale();
  setWorkspaceLocalFontTarget(target);
  toast("当前文字已恢复为全局字号。");
}

function setWorkspaceVisualEditorMode(mode) {
  const nextMode = mode === "box" ? "box" : "text";
  workspaceLocalFontState.mode = nextMode;
  document.body.dataset.workspaceVisualEditorMode = nextMode;
  $$('[data-visual-editor-mode]').forEach((button) => {
    const active = button.dataset.visualEditorMode === nextMode;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });
  $$('[data-visual-editor-panel]').forEach((panel) => {
    const active = panel.dataset.visualEditorPanel === nextMode;
    panel.classList.toggle("active", active);
    panel.hidden = !active;
  });
  workspaceLocalFontState.target?.classList.toggle("workspace-font-target", nextMode === "text");
  workspaceLocalFontState.boxTarget?.classList.toggle("workspace-box-target", nextMode === "box");
  if (nextMode === "box") {
    $("#workspace-box-editor-status").textContent = "点击任意卡片、浮动模块、图表、按钮、表格或图片";
  }
  const selection = window.getSelection();
  if (selection && !selection.isCollapsed) selection.removeAllRanges();
  toast(nextMode === "box" ? "框体模式：点击卡片、按钮或表格进行调整。" : "文字模式：点击文字块，或拖选一段文字。");
}

function setWorkspaceLocalBoxTarget(target) {
  workspaceLocalFontState.boxTarget?.classList.remove("workspace-box-target");
  workspaceLocalFontState.boxTarget = target;
  workspaceLocalFontState.boxSelector = target ? buildWorkspaceElementPath(target) : "";
  workspaceLocalFontState.boxStorageKey = workspaceLocalFontState.boxSelector;
  if (!target) return;

  ensureWorkspaceEditableIds();
  target.classList.add("workspace-box-target");
  const rect = target.getBoundingClientRect();
  const saved = getWorkspaceLocalBoxOverrides()[workspaceLocalFontState.boxStorageKey] || {};
  if (!target.dataset.edulinkBoxBaseWidth && rect.width > 10) target.dataset.edulinkBoxBaseWidth = String(rect.width);
  if (!target.dataset.edulinkBoxBaseHeight && rect.height > 10) target.dataset.edulinkBoxBaseHeight = String(rect.height);
  rememberWorkspaceBoxOriginalStyle(target);
  const widthScale = Number(target.dataset.edulinkBoxWidthScale) || 1;
  const heightScale = Number(target.dataset.edulinkBoxHeightScale) || 1;
  const widthRange = $("#workspace-box-width-range");
  const heightRange = $("#workspace-box-height-range");
  if (widthRange) widthRange.value = String(Math.round(widthScale * 100));
  if (heightRange) heightRange.value = String(Math.round(heightScale * 100));
  $("#workspace-box-width-value").textContent = Math.round(widthScale * 100) + "%";
  $("#workspace-box-height-value").textContent = Math.round(heightScale * 100) + "%";
  workspaceLocalFontState.boxFill = normalizeColor(saved.fill || getComputedStyle(target).backgroundColor, "#ffffff");
  workspaceLocalFontState.boxBorder = normalizeColor(saved.border || getComputedStyle(target).borderTopColor, "#d9d2ef");
  workspaceLocalFontState.boxFillChanged = false;
  workspaceLocalFontState.boxBorderChanged = false;
  $("#workspace-box-fill-color").value = workspaceLocalFontState.boxFill;
  $("#workspace-box-fill-value").textContent = workspaceLocalFontState.boxFill.toUpperCase();
  $("#workspace-box-border-color").value = workspaceLocalFontState.boxBorder;
  $("#workspace-box-border-value").textContent = workspaceLocalFontState.boxBorder.toUpperCase();
  const computed = getComputedStyle(target);
  const radius = Number(saved.radius ?? parseFloat(computed.borderTopLeftRadius)) || 0;
  const opacity = Number(saved.opacity ?? (parseFloat(computed.opacity) * 100)) || 100;
  const borderWidth = Number(saved.borderWidth ?? parseFloat(computed.borderTopWidth)) || 0;
  const shadow = Number(saved.shadow ?? (computed.boxShadow === "none" ? 0 : 40));
  workspaceLocalFontState.boxRadius = Math.min(80, Math.max(0, radius));
  workspaceLocalFontState.boxOpacity = Math.min(100, Math.max(20, opacity));
  workspaceLocalFontState.boxBorderWidth = Math.min(6, Math.max(0, borderWidth));
  workspaceLocalFontState.boxShadow = Math.min(100, Math.max(0, shadow));
  workspaceLocalFontState.boxRadiusChanged = false;
  workspaceLocalFontState.boxOpacityChanged = false;
  workspaceLocalFontState.boxBorderWidthChanged = false;
  workspaceLocalFontState.boxShadowChanged = false;
  $("#workspace-box-radius-range").value = String(Math.round(workspaceLocalFontState.boxRadius));
  $("#workspace-box-radius-value").textContent = Math.round(workspaceLocalFontState.boxRadius) + "px";
  $("#workspace-box-opacity-range").value = String(Math.round(workspaceLocalFontState.boxOpacity));
  $("#workspace-box-opacity-value").textContent = Math.round(workspaceLocalFontState.boxOpacity) + "%";
  $("#workspace-box-border-width-range").value = String(Math.round(workspaceLocalFontState.boxBorderWidth));
  $("#workspace-box-border-width-value").textContent = Math.round(workspaceLocalFontState.boxBorderWidth) + "px";
  $("#workspace-box-shadow-range").value = String(Math.round(workspaceLocalFontState.boxShadow));
  $("#workspace-box-shadow-value").textContent = Math.round(workspaceLocalFontState.boxShadow) + "%";
  const text = getWorkspaceTargetText(target);
  const classLabel = Array.from(target.classList).filter((name) => !name.startsWith("workspace-")).slice(0, 2).join(".");
  $("#workspace-box-editor-target").textContent = text
    ? (text.length > 38 ? text.slice(0, 38) + "..." : text)
    : target.tagName.toLowerCase() + (classLabel ? "." + classLabel : "");
  $("#workspace-box-editor-status").textContent = "已选中框体，可分别调节宽度和高度";
}

function rememberWorkspaceBoxOriginalStyle(target) {
  if (!target) return;
  if (!target.dataset.edulinkBoxOriginalWidth) target.dataset.edulinkBoxOriginalWidth = target.style.width || "__empty__";
  if (!target.dataset.edulinkBoxOriginalHeight) target.dataset.edulinkBoxOriginalHeight = target.style.height || "__empty__";
  if (!target.dataset.edulinkBoxOriginalMinHeight) target.dataset.edulinkBoxOriginalMinHeight = target.style.minHeight || "__empty__";
  if (!target.dataset.edulinkBoxOriginalMaxWidth) target.dataset.edulinkBoxOriginalMaxWidth = target.style.maxWidth || "__empty__";
  if (!target.dataset.edulinkBoxOriginalFlexBasis) target.dataset.edulinkBoxOriginalFlexBasis = target.style.flexBasis || "__empty__";
  if (!target.dataset.edulinkBoxOriginalFlexShrink) target.dataset.edulinkBoxOriginalFlexShrink = target.style.flexShrink || "__empty__";
  if (!target.dataset.edulinkBoxOriginalBackground) target.dataset.edulinkBoxOriginalBackground = target.style.backgroundColor || "__empty__";
  if (!target.dataset.edulinkBoxOriginalBackgroundImage) target.dataset.edulinkBoxOriginalBackgroundImage = target.style.backgroundImage || "__empty__";
  if (!target.dataset.edulinkBoxOriginalBackgroundShorthand) target.dataset.edulinkBoxOriginalBackgroundShorthand = target.style.background || "__empty__";
  if (!target.dataset.edulinkBoxOriginalOpacity) target.dataset.edulinkBoxOriginalOpacity = target.style.opacity || "__empty__";
  if (!target.dataset.edulinkBoxOriginalRadius) target.dataset.edulinkBoxOriginalRadius = target.style.borderRadius || "__empty__";
  if (!target.dataset.edulinkBoxOriginalBorderColor) target.dataset.edulinkBoxOriginalBorderColor = target.style.borderColor || "__empty__";
  if (!target.dataset.edulinkBoxOriginalBorderStyle) target.dataset.edulinkBoxOriginalBorderStyle = target.style.borderStyle || "__empty__";
  if (!target.dataset.edulinkBoxOriginalBorderWidth) target.dataset.edulinkBoxOriginalBorderWidth = target.style.borderWidth || "__empty__";
  if (!target.dataset.edulinkBoxOriginalShadow) target.dataset.edulinkBoxOriginalShadow = target.style.boxShadow || "__empty__";
}

function applyWorkspaceLocalBoxSize(target, widthScaleValue, heightScaleValue) {
  if (!target) return;
  const rect = target.getBoundingClientRect();
  if (!target.dataset.edulinkBoxBaseWidth && rect.width > 10) target.dataset.edulinkBoxBaseWidth = String(rect.width);
  if (!target.dataset.edulinkBoxBaseHeight && rect.height > 10) target.dataset.edulinkBoxBaseHeight = String(rect.height);
  rememberWorkspaceBoxOriginalStyle(target);
  const widthScale = Math.min(1.8, Math.max(0.6, Number(widthScaleValue) || 1));
  const heightScale = Math.min(2.2, Math.max(0.6, Number(heightScaleValue) || 1));
  const baseWidth = Number(target.dataset.edulinkBoxBaseWidth) || rect.width || 0;
  const baseHeight = Number(target.dataset.edulinkBoxBaseHeight) || rect.height || 0;
  if (baseWidth <= 10 || baseHeight <= 0) return;
  const parentWidth = target.parentElement?.getBoundingClientRect().width || baseWidth * widthScale;
  const usableParentWidth = Math.max(1, parentWidth - 2);
  const width = Math.round(Math.min(baseWidth * widthScale, usableParentWidth));
  const height = Math.round(baseHeight * heightScale);
  target.style.width = width + "px";
  target.style.maxWidth = "100%";
  if (["SVG", "CANVAS", "IMG", "VIDEO"].includes(target.tagName)) {
    target.style.height = height + "px";
  } else {
    target.style.minHeight = height + "px";
  }
  if (getComputedStyle(target.parentElement || target).display.includes("flex")) {
    target.style.flexBasis = width + "px";
    target.style.flexShrink = "0";
  }
  target.dataset.edulinkBoxWidthScale = widthScale.toFixed(3);
  target.dataset.edulinkBoxHeightScale = heightScale.toFixed(3);
  $("#workspace-box-width-value").textContent = Math.round(widthScale * 100) + "%";
  $("#workspace-box-height-value").textContent = Math.round(heightScale * 100) + "%";
}

function applyWorkspaceLocalBoxShape(target, radius, opacity, borderWidth, shadow) {
  if (!target) return;
  const radiusValue = Math.min(80, Math.max(0, Number(radius) || 0));
  const opacityValue = Math.min(100, Math.max(20, Number(opacity) || 100));
  const borderWidthValue = Math.min(6, Math.max(0, Number(borderWidth) || 0));
  const shadowValue = Math.min(100, Math.max(0, Number(shadow) || 0));
  target.style.borderRadius = radiusValue + "px";
  target.style.opacity = (opacityValue / 100).toFixed(2);
  target.style.borderWidth = borderWidthValue + "px";
  if (borderWidthValue > 0 && getComputedStyle(target).borderStyle === "none") target.style.borderStyle = "solid";
  target.style.boxShadow = shadowValue > 0
    ? `0 18px 48px rgba(63, 48, 119, ${(0.04 + shadowValue / 100 * 0.24).toFixed(3)})`
    : "none";
  target.style.setProperty("--edulink-edit-radius", radiusValue + "px");
  target.style.setProperty("--edulink-edit-opacity", (opacityValue / 100).toFixed(2));
  target.style.setProperty("--edulink-edit-shadow-strength", String(shadowValue));
  target.dataset.edulinkBoxRadius = String(radiusValue);
  target.dataset.edulinkBoxOpacity = String(opacityValue);
  target.dataset.edulinkBoxBorderWidth = String(borderWidthValue);
  target.dataset.edulinkBoxShadow = String(shadowValue);
  $("#workspace-box-radius-value").textContent = Math.round(radiusValue) + "px";
  $("#workspace-box-opacity-value").textContent = Math.round(opacityValue) + "%";
  $("#workspace-box-border-width-value").textContent = Math.round(borderWidthValue) + "px";
  $("#workspace-box-shadow-value").textContent = Math.round(shadowValue) + "%";
}

function applyWorkspaceLocalBoxes() {
  const overrides = getWorkspaceLocalBoxOverrides();
  Object.entries(overrides).forEach(([storageKey, data]) => {
    const target = getWorkspaceSavedTarget(data, storageKey);
    if (!target) return;
    if (!target.dataset.edulinkBoxBaseWidth && Number(data.naturalWidthAtSave) > 10) target.dataset.edulinkBoxBaseWidth = String(data.naturalWidthAtSave);
    if (!target.dataset.edulinkBoxBaseHeight && Number(data.naturalHeightAtSave) > 0) target.dataset.edulinkBoxBaseHeight = String(data.naturalHeightAtSave);
    rememberWorkspaceBoxOriginalStyle(target);
    if (!data.editId && target.dataset.edulinkEditId) data.editId = target.dataset.edulinkEditId;
    applyWorkspaceLocalBoxSize(target, data.widthScale, data.heightScale);
    applyWorkspaceLocalBoxColors(target, data.fill, data.border);
    if (["radius", "opacity", "borderWidth", "shadow"].some((key) => Object.prototype.hasOwnProperty.call(data || {}, key))) {
      applyWorkspaceLocalBoxShape(target, data.radius, data.opacity, data.borderWidth, data.shadow);
    }
  });
  localStorage.setItem(WORKSPACE_LOCAL_BOX_KEY, JSON.stringify(overrides));
}

function applyWorkspaceLocalBoxColors(target, fill, border) {
  if (!target) return;
  if (fill) {
    target.style.background = fill;
    target.style.backgroundImage = "none";
    target.style.backgroundColor = fill;
    target.style.setProperty("--edulink-edit-fill", fill);
    target.style.setProperty("--edulink-chart-fill", fill);
    if (target.matches("svg, canvas")) target.style.backgroundColor = fill;
  }
  if (border) {
    target.style.borderColor = border;
    if (getComputedStyle(target).borderStyle === "none") {
      target.style.borderStyle = "solid";
      target.style.borderWidth = "1px";
    }
    target.style.setProperty("--edulink-edit-border", border);
    target.style.setProperty("--edulink-chart-accent", border);
    if (target.matches("svg, canvas")) target.style.color = border;
  }
}

function saveWorkspaceLocalBoxTarget(options = {}) {
  const target = workspaceLocalFontState.boxTarget;
  const storageKey = workspaceLocalFontState.boxStorageKey;
  if (!target || !storageKey) {
    if (!options.silent) toast("请先点击一个需要调整的框体。");
    return;
  }
  const overrides = getWorkspaceLocalBoxOverrides();
  const existing = overrides[storageKey] || {};
  overrides[storageKey] = {
    selector: workspaceLocalFontState.boxSelector,
    editId: target.dataset.edulinkEditId || "",
    widthScale: Number(target.dataset.edulinkBoxWidthScale) || 1,
    heightScale: Number(target.dataset.edulinkBoxHeightScale) || 1,
    naturalWidthAtSave: Math.round(Number(target.dataset.edulinkBoxBaseWidth) || target.getBoundingClientRect().width),
    naturalHeightAtSave: Math.round(Number(target.dataset.edulinkBoxBaseHeight) || target.getBoundingClientRect().height),
    fill: workspaceLocalFontState.boxFillChanged ? workspaceLocalFontState.boxFill : existing.fill,
    border: workspaceLocalFontState.boxBorderChanged ? workspaceLocalFontState.boxBorder : existing.border,
    ...(workspaceLocalFontState.boxRadiusChanged || Object.prototype.hasOwnProperty.call(existing, "radius")
      ? { radius: Number(target.dataset.edulinkBoxRadius || workspaceLocalFontState.boxRadius) || 0 } : {}),
    ...(workspaceLocalFontState.boxOpacityChanged || Object.prototype.hasOwnProperty.call(existing, "opacity")
      ? { opacity: Number(target.dataset.edulinkBoxOpacity || workspaceLocalFontState.boxOpacity) || 100 } : {}),
    ...(workspaceLocalFontState.boxBorderWidthChanged || Object.prototype.hasOwnProperty.call(existing, "borderWidth")
      ? { borderWidth: Number(target.dataset.edulinkBoxBorderWidth ?? workspaceLocalFontState.boxBorderWidth) || 0 } : {}),
    ...(workspaceLocalFontState.boxShadowChanged || Object.prototype.hasOwnProperty.call(existing, "shadow")
      ? { shadow: Number(target.dataset.edulinkBoxShadow ?? workspaceLocalFontState.boxShadow) || 0 } : {}),
    text: getWorkspaceTargetText(target)
  };
  if (!overrides[storageKey].fill) delete overrides[storageKey].fill;
  if (!overrides[storageKey].border) delete overrides[storageKey].border;
  localStorage.setItem(WORKSPACE_LOCAL_BOX_KEY, JSON.stringify(overrides));
  saveWorkspaceDeviceProfile();
   if (!options.silent) toast("当前框体的尺寸、颜色与视觉样式已保存。");
}

function resetWorkspaceLocalBoxTarget() {
  const target = workspaceLocalFontState.boxTarget;
  if (!target) {
    toast("请先选择需要恢复的框体。");
    return;
  }
  const overrides = getWorkspaceLocalBoxOverrides();
  delete overrides[workspaceLocalFontState.boxStorageKey];
  localStorage.setItem(WORKSPACE_LOCAL_BOX_KEY, JSON.stringify(overrides));
  target.style.width = target.dataset.edulinkBoxOriginalWidth === "__empty__" ? "" : (target.dataset.edulinkBoxOriginalWidth || "");
  target.style.height = target.dataset.edulinkBoxOriginalHeight === "__empty__" ? "" : (target.dataset.edulinkBoxOriginalHeight || "");
  target.style.minHeight = target.dataset.edulinkBoxOriginalMinHeight === "__empty__" ? "" : (target.dataset.edulinkBoxOriginalMinHeight || "");
  target.style.maxWidth = target.dataset.edulinkBoxOriginalMaxWidth === "__empty__" ? "" : (target.dataset.edulinkBoxOriginalMaxWidth || "");
  target.style.flexBasis = target.dataset.edulinkBoxOriginalFlexBasis === "__empty__" ? "" : (target.dataset.edulinkBoxOriginalFlexBasis || "");
  target.style.flexShrink = target.dataset.edulinkBoxOriginalFlexShrink === "__empty__" ? "" : (target.dataset.edulinkBoxOriginalFlexShrink || "");
  target.style.background = target.dataset.edulinkBoxOriginalBackgroundShorthand === "__empty__" ? "" : (target.dataset.edulinkBoxOriginalBackgroundShorthand || "");
  target.style.backgroundColor = target.dataset.edulinkBoxOriginalBackground === "__empty__" ? "" : (target.dataset.edulinkBoxOriginalBackground || "");
  target.style.backgroundImage = target.dataset.edulinkBoxOriginalBackgroundImage === "__empty__" ? "" : (target.dataset.edulinkBoxOriginalBackgroundImage || "");
  target.style.opacity = target.dataset.edulinkBoxOriginalOpacity === "__empty__" ? "" : (target.dataset.edulinkBoxOriginalOpacity || "");
  target.style.borderRadius = target.dataset.edulinkBoxOriginalRadius === "__empty__" ? "" : (target.dataset.edulinkBoxOriginalRadius || "");
  target.style.borderColor = target.dataset.edulinkBoxOriginalBorderColor === "__empty__" ? "" : (target.dataset.edulinkBoxOriginalBorderColor || "");
  target.style.borderStyle = target.dataset.edulinkBoxOriginalBorderStyle === "__empty__" ? "" : (target.dataset.edulinkBoxOriginalBorderStyle || "");
  target.style.borderWidth = target.dataset.edulinkBoxOriginalBorderWidth === "__empty__" ? "" : (target.dataset.edulinkBoxOriginalBorderWidth || "");
  target.style.boxShadow = target.dataset.edulinkBoxOriginalShadow === "__empty__" ? "" : (target.dataset.edulinkBoxOriginalShadow || "");
  target.style.removeProperty("--edulink-edit-fill");
  target.style.removeProperty("--edulink-edit-border");
  target.style.removeProperty("--edulink-chart-fill");
  target.style.removeProperty("--edulink-chart-accent");
  target.style.removeProperty("--edulink-edit-radius");
  target.style.removeProperty("--edulink-edit-opacity");
  target.style.removeProperty("--edulink-edit-shadow-strength");
  ["edulinkBoxWidthScale", "edulinkBoxHeightScale", "edulinkBoxBaseWidth", "edulinkBoxBaseHeight", "edulinkBoxOriginalWidth", "edulinkBoxOriginalHeight", "edulinkBoxOriginalMinHeight", "edulinkBoxOriginalMaxWidth", "edulinkBoxOriginalFlexBasis", "edulinkBoxOriginalFlexShrink", "edulinkBoxOriginalBackground", "edulinkBoxOriginalBackgroundImage", "edulinkBoxOriginalBackgroundShorthand", "edulinkBoxOriginalOpacity", "edulinkBoxOriginalRadius", "edulinkBoxOriginalBorderColor", "edulinkBoxOriginalBorderStyle", "edulinkBoxOriginalBorderWidth", "edulinkBoxOriginalShadow", "edulinkBoxRadius", "edulinkBoxOpacity", "edulinkBoxBorderWidth", "edulinkBoxShadow"].forEach((key) => delete target.dataset[key]);
  setWorkspaceLocalBoxTarget(target);
  toast("当前框体已恢复为自适应尺寸。");
}

function getWorkspaceEditorPosition() {
  return readStoredJson(localStorage, WORKSPACE_EDITOR_POSITION_KEY) || null;
}

function applyWorkspaceEditorPosition(position = getWorkspaceEditorPosition()) {
  const editor = $("#workspace-font-editor");
  if (!editor || !position || !Number.isFinite(Number(position.left)) || !Number.isFinite(Number(position.top))) return;
  const maxLeft = Math.max(12, window.innerWidth - editor.offsetWidth - 12);
  const maxTop = Math.max(12, window.innerHeight - editor.offsetHeight - 12);
  editor.style.right = "auto";
  editor.style.left = Math.min(maxLeft, Math.max(12, Number(position.left))) + "px";
  editor.style.top = Math.min(maxTop, Math.max(12, Number(position.top))) + "px";
}

function resetWorkspaceEditorPosition() {
  localStorage.removeItem(WORKSPACE_EDITOR_POSITION_KEY);
  const editor = $("#workspace-font-editor");
  if (editor) {
    editor.style.left = "";
    editor.style.top = "";
    editor.style.right = "26px";
  }
  toast("编辑面板已放回右上角。");
}

function initializeWorkspaceEditorDrag() {
  const editor = $("#workspace-font-editor");
  const handle = editor?.querySelector("[data-workspace-editor-drag-handle]");
  if (!editor || !handle || editor.dataset.dragReady === "true") return;
  editor.dataset.dragReady = "true";
  let drag = null;
  handle.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    const rect = editor.getBoundingClientRect();
    drag = { offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top };
    editor.style.right = "auto";
    handle.setPointerCapture?.(event.pointerId);
    document.body.classList.add("workspace-editor-dragging");
    event.preventDefault();
  });
  handle.addEventListener("pointermove", (event) => {
    if (!drag) return;
    const maxLeft = Math.max(12, window.innerWidth - editor.offsetWidth - 12);
    const maxTop = Math.max(12, window.innerHeight - editor.offsetHeight - 12);
    const left = Math.min(maxLeft, Math.max(12, event.clientX - drag.offsetX));
    const top = Math.min(maxTop, Math.max(12, event.clientY - drag.offsetY));
    editor.style.left = left + "px";
    editor.style.top = top + "px";
  });
  const finish = () => {
    if (!drag) return;
    const rect = editor.getBoundingClientRect();
    localStorage.setItem(WORKSPACE_EDITOR_POSITION_KEY, JSON.stringify({ left: Math.round(rect.left), top: Math.round(rect.top) }));
    drag = null;
    document.body.classList.remove("workspace-editor-dragging");
  };
  handle.addEventListener("pointerup", finish);
  handle.addEventListener("pointercancel", finish);
  window.addEventListener("resize", () => applyWorkspaceEditorPosition());
}

function openWorkspaceLocalFontEditor() {
  closeWorkspaceSettings({ restoreFocus: false });
  workspaceLocalFontState.active = true;
  document.body.classList.add("workspace-font-editor-open");
  const editor = $("#workspace-font-editor");
  if (editor) editor.hidden = false;
  applyWorkspaceEditorPosition();
  setWorkspaceVisualEditorMode(workspaceLocalFontState.mode);
  refreshIcons();
  toast("局部视觉调整已开启，可切换文字与框体模式。");
}

function closeWorkspaceLocalFontEditor() {
  workspaceLocalFontState.active = false;
  if (workspaceLocalFontState.target) workspaceLocalFontState.target.classList.remove("workspace-font-target");
  workspaceLocalFontState.target = null;
  workspaceLocalFontState.selector = "";
  workspaceLocalFontState.storageKey = "";
  workspaceLocalFontState.fragment = null;
  if (workspaceLocalFontState.boxTarget) workspaceLocalFontState.boxTarget.classList.remove("workspace-box-target");
  workspaceLocalFontState.boxTarget = null;
  workspaceLocalFontState.boxSelector = "";
  workspaceLocalFontState.boxStorageKey = "";
  document.body.classList.remove("workspace-font-editor-open");
  delete document.body.dataset.workspaceVisualEditorMode;
  const editor = $("#workspace-font-editor");
  if (editor) editor.hidden = true;
}

function handleWorkspaceLocalFontClick(event) {
  if (!workspaceLocalFontState.active) return;
  if (performance.now() < workspaceLocalFontState.suppressClickUntil) return;
  if (event.target.closest("#workspace-font-editor")) return;
  if (workspaceLocalFontState.mode === "box") {
    const boxTarget = getWorkspaceLocalBoxTarget(event.target);
    if (!boxTarget) return;
    event.preventDefault();
    event.stopPropagation();
    setWorkspaceLocalBoxTarget(boxTarget);
    return;
  }
  const target = getWorkspaceLocalTextTarget(event.target);
  if (!target) return;
  event.preventDefault();
  event.stopPropagation();
  if (target.classList.contains("workspace-local-font-fragment")) {
    const storageKey = target.dataset.edulinkLocalStorageKey;
    const data = getWorkspaceLocalFontOverrides()[storageKey] || null;
    setWorkspaceLocalFontTarget(target, { storageKey, fragment: data?.kind === "fragment" ? data : null });
  } else {
    setWorkspaceLocalFontTarget(target);
  }
}

function handleWorkspaceLocalFontSelection() {
  if (!workspaceLocalFontState.active || workspaceLocalFontState.mode !== "text") return;
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed || !selection.toString().trim()) return;
  const range = selection.getRangeAt(0);
  if (range.startContainer === range.endContainer && range.startContainer.nodeType === Node.TEXT_NODE) {
    const parentTarget = getWorkspaceLocalTextTarget(range.startContainer);
    if (parentTarget) {
      const selectedText = selection.toString();
      const parentText = parentTarget.textContent;
      const parentOffset = getWorkspaceTextOffset(parentTarget, range.startContainer, range.startOffset);
      const occurrence = getTextOccurrence(parentText, selectedText, parentOffset);
      ensureWorkspaceEditableIds();
      const parentSelector = buildWorkspaceElementPath(parentTarget);
      const id = "edulink-fragment-" + Date.now();
      const storageKey = "fragment::" + parentSelector + "::" + selectedText + "::" + occurrence;
      const span = document.createElement("span");
      span.className = "workspace-local-font-fragment";
      span.dataset.edulinkLocalFragmentId = id;
      span.dataset.edulinkLocalStorageKey = storageKey;
      try {
        range.surroundContents(span);
        selection.removeAllRanges();
        workspaceLocalFontState.suppressClickUntil = performance.now() + 350;
        setWorkspaceLocalFontTarget(span, {
          storageKey,
          fragment: { id, parentSelector, parentEditId: parentTarget.dataset.edulinkEditId || "", text: selectedText, occurrence }
        });
        $("#workspace-font-editor-status").textContent = "已选中局部文字，只会调整这几个字";
        return;
      } catch {
        // Fall through to block selection when the browser cannot wrap this range.
      }
    }
  }
  const common = range.commonAncestorContainer.nodeType === Node.TEXT_NODE
    ? range.commonAncestorContainer.parentElement
    : range.commonAncestorContainer;
  const selectedText = selection.toString();
  const commonTarget = getWorkspaceLocalTextTarget(common);
  if (commonTarget && selectedText && commonTarget.contains(range.startContainer) && commonTarget.contains(range.endContainer)) {
    ensureWorkspaceEditableIds();
    const parentSelector = buildWorkspaceElementPath(commonTarget);
    const occurrence = getTextOccurrence(
      commonTarget.textContent,
      selectedText,
      getWorkspaceTextOffset(commonTarget, range.startContainer, range.startOffset)
    );
    const id = "edulink-fragment-" + Date.now();
    const storageKey = "fragment::" + parentSelector + "::" + selectedText + "::" + occurrence;
    const span = document.createElement("span");
    span.className = "workspace-local-font-fragment";
    span.dataset.edulinkLocalFragmentId = id;
    span.dataset.edulinkLocalStorageKey = storageKey;
    try {
      const extracted = range.extractContents();
      span.append(extracted);
      range.insertNode(span);
      selection.removeAllRanges();
      workspaceLocalFontState.suppressClickUntil = performance.now() + 350;
      setWorkspaceLocalFontTarget(span, {
        storageKey,
        fragment: { id, parentSelector, parentEditId: commonTarget.dataset.edulinkEditId || "", text: selectedText, occurrence }
      });
      $("#workspace-font-editor-status").textContent = "已选中局部文字，只会调整这几个字";
      return;
    } catch {
      // Fall through to block selection when the browser cannot isolate this range.
    }
  }
  const target = getWorkspaceLocalTextTarget(common) || getWorkspaceLocalTextTarget(range.startContainer);
  if (target) setWorkspaceLocalFontTarget(target);
}

function exportWorkspaceFontSettings() {
  if (workspaceLocalFontState.target) saveWorkspaceLocalFontTarget({ silent: true });
  if (workspaceLocalFontState.boxTarget) saveWorkspaceLocalBoxTarget({ silent: true });
  saveWorkspaceDeviceProfile();
  const device = getWorkspaceDeviceProfile();
  const profile = {
    editorVersion: "visual-editor-v4",
    schemaVersion: 3,
    application: "EduLink 教育学智能工作台",
    exportedAt: new Date().toISOString(),
    device,
    note: "浏览器无法可靠读取显示器物理英寸；screen、viewport、DPR 与估算物理像素已完整记录。",
    page: {
      assistant: state.currentView,
      section: state.currentSection,
      url: window.location.href
    },
    globalTypography: {
      scale: getActiveWorkspaceFontScale(),
      savedScale: getWorkspaceFontScale(),
      draftScale: workspaceFontScaleDraft,
      fontFloorPx: parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--workspace-font-floor")) || WORKSPACE_FONT_PROFILE.desktopFloorPx,
      limits: WORKSPACE_FONT_PROFILE
    },
    localTextOverrides: getWorkspaceLocalFontOverrides(),
    localBoxOverrides: getWorkspaceLocalBoxOverrides(),
    editableElementCount: $$("#workspace-app [data-edulink-edit-id]").length,
    interfacePreferences: {
      renderQuality: localStorage.getItem(RENDER_QUALITY_KEY) || "medium",
      pointerGlass: localStorage.getItem(POINTER_GLASS_KEY) !== "off",
      automaticGuide: localStorage.getItem(WORKSPACE_GUIDE_AUTO_KEY) !== "off"
    }
  };
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  downloadText("edulink-visual-settings-" + stamp + ".json", JSON.stringify(profile, null, 2));
  toast("完整视觉配置已导出，包含文字、颜色、框体与屏幕信息。");
}

function saveAllWorkspaceVisualSettings() {
  ensureWorkspaceEditableIds();
  if (workspaceLocalFontState.target) saveWorkspaceLocalFontTarget({ silent: true });
  if (workspaceLocalFontState.boxTarget) saveWorkspaceLocalBoxTarget({ silent: true });
  applyWorkspaceLocalTypography();
  applyWorkspaceLocalBoxes();
  saveWorkspaceDeviceProfile();
  localStorage.setItem(WORKSPACE_LOCAL_FONT_KEY, JSON.stringify(getWorkspaceLocalFontOverrides()));
  localStorage.setItem(WORKSPACE_LOCAL_BOX_KEY, JSON.stringify(getWorkspaceLocalBoxOverrides()));
  toast("全部视觉调整已保存，刷新页面后会继续保留。");
}

function normalizeWorkspaceSettingsJson(raw) {
  const source = String(raw || "");
  let output = "";
  let inString = false;
  let escaped = false;
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (!inString) {
      output += character;
      if (character === '"') inString = true;
      continue;
    }
    if (escaped) {
      output += character;
      escaped = false;
      continue;
    }
    if (character === "\\") {
      output += character;
      escaped = true;
      continue;
    }
    if (character === '"') {
      output += character;
      inString = false;
      continue;
    }
    if (character === "\n" || character === "\r") {
      if (character === "\r" && source[index + 1] === "\n") index += 1;
      while (/\s/.test(source[index + 1] || "")) index += 1;
      continue;
    }
    output += character;
  }
  return output;
}

function parseWorkspaceSettingsJson(raw) {
  try {
    return JSON.parse(String(raw || ""));
  } catch (strictError) {
    const repaired = normalizeWorkspaceSettingsJson(raw);
    try {
      return JSON.parse(repaired);
    } catch {
      throw strictError;
    }
  }
}

function importWorkspaceVisualSettings(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const profile = parseWorkspaceSettingsJson(reader.result);
      const textOverrides = profile.localTextOverrides || profile.localOverrides;
      const boxOverrides = profile.localBoxOverrides || {};
      if (!textOverrides || typeof textOverrides !== "object") throw new Error("配置文件没有文字配置");
      localStorage.setItem(WORKSPACE_LOCAL_FONT_KEY, JSON.stringify(textOverrides));
      localStorage.setItem(WORKSPACE_LOCAL_BOX_KEY, JSON.stringify(boxOverrides));
      const scale = Number(profile.globalTypography?.savedScale ?? profile.globalTypography?.scale ?? profile.globalScale);
      if (Number.isFinite(scale)) localStorage.setItem(WORKSPACE_FONT_SCALE_KEY, String(scale));
      const preferences = profile.interfacePreferences || {};
      if (["low", "medium", "high"].includes(preferences.renderQuality)) localStorage.setItem(RENDER_QUALITY_KEY, preferences.renderQuality);
      if (typeof preferences.pointerGlass === "boolean") localStorage.setItem(POINTER_GLASS_KEY, preferences.pointerGlass ? "on" : "off");
      if (typeof preferences.automaticGuide === "boolean") localStorage.setItem(WORKSPACE_GUIDE_AUTO_KEY, preferences.automaticGuide ? "on" : "off");
      if (profile.device) localStorage.setItem(WORKSPACE_DEVICE_KEY, JSON.stringify(profile.device));
      workspaceFontScaleDraft = null;
      ensureWorkspaceEditableIds();
      applyWorkspaceFontScale();
      applyPointerGlassPreference();
      applyWorkspacePerformanceMode();
      syncWorkspaceSettings();
      refreshIcons();
      toast("视觉配置已导入并应用。");
    } catch (error) {
      toast("配置导入失败：" + (error?.message || "文件格式不正确"));
    }
  };
  reader.readAsText(file, "utf-8");
}

let workspaceLocalFontMutationFrame = 0;
function initializeWorkspaceLocalFontObserver() {
  const workspace = $("#workspace-app");
  if (!workspace || workspace.dataset.localFontObserved === "true") return;
  workspace.dataset.localFontObserved = "true";
  const observer = new MutationObserver((mutations) => {
    if (!mutations.some((mutation) => mutation.addedNodes.length || mutation.removedNodes.length)) return;
    window.cancelAnimationFrame(workspaceLocalFontMutationFrame);
    workspaceLocalFontMutationFrame = window.requestAnimationFrame(() => {
      workspaceLocalFontMutationFrame = 0;
      applyWorkspaceFontScale();
    });
  });
  observer.observe(workspace, { childList: true, subtree: true });
}

function saveWorkspaceFontScale() {
  const scale = workspaceFontScaleDraft ?? getWorkspaceFontScale();
  localStorage.setItem(WORKSPACE_FONT_SCALE_KEY, scale.toFixed(3));
  workspaceFontScaleDraft = null;
  applyWorkspaceFontScale(scale);
  saveWorkspaceDeviceProfile();
  toast("界面字号已保存，之后进入工作台会沿用该设置。");
  return scale;
}

function restoreWorkspaceFontScale() {
  workspaceFontScaleDraft = null;
  const scale = getWorkspaceFontScale();
  applyWorkspaceFontScale(scale);
  toast("已恢复上一次保存的字号。");
  return scale;
}

function getRecommendedWorkspaceFontScale() {
  const dpr = Math.max(1, Number(window.devicePixelRatio) || 1);
  const physicalWidth = Math.round((window.screen?.width || window.innerWidth) * dpr);
  const physicalHeight = Math.round((window.screen?.height || window.innerHeight) * dpr);
  const widthScale = physicalWidth <= 1366 ? 0.86
    : physicalWidth <= 1600 ? 0.92
      : physicalWidth <= 1920 ? 1
        : physicalWidth <= 2160 ? 1.08
          : physicalWidth <= 2560 ? 1.16
            : physicalWidth <= 3200 ? 1.25
              : 1.34;
  const heightScale = physicalHeight <= 900 ? 0.95 : physicalHeight >= 1800 ? 1.04 : 1;
  return {
    scale: Math.min(WORKSPACE_FONT_PROFILE.maxScale, Math.max(WORKSPACE_FONT_PROFILE.minScale, widthScale * heightScale)),
    width: physicalWidth,
    height: physicalHeight,
    dpr
  };
}

function adaptWorkspaceFontScaleToScreen() {
  const recommendation = getRecommendedWorkspaceFontScale();
  workspaceFontScaleDraft = applyWorkspaceFontScale(recommendation.scale);
  saveWorkspaceDeviceProfile();
  const status = $("#workspace-font-size-status");
  if (status) {
    status.textContent = "已按约 " + recommendation.width + " x " + recommendation.height
      + " 屏幕预览 " + Math.round(recommendation.scale * 100) + "%，确认后请点击保存";
  }
  toast("已按当前屏幕分辨率生成字号适配预览。");
  return recommendation;
}

function setPointerGlassEnabled(enabled) {
  localStorage.setItem(POINTER_GLASS_KEY, enabled ? "on" : "off");
  applyPointerGlassPreference();
  rebuildLiquidGlassSurfaceEffects();
  if (enabled && document.documentElement.dataset.workspacePerf === "high") initializeGlassHighlights();
  syncWorkspaceSettings();
  toast(enabled ? "已开启鼠标液态玻璃。" : "已关闭鼠标液态玻璃，静态玻璃效果继续保留。");
}

function closeRenderQualityMenu() {
  const menu = $("#render-quality-menu");
  if (!menu) return;
  menu.classList.remove("open");
  menu.setAttribute("aria-hidden", "true");
  $("#render-quality-trigger")?.setAttribute("aria-expanded", "false");
}

function toggleRenderQualityMenu() {
  const menu = $("#render-quality-menu");
  if (!menu) return;
  const open = !menu.classList.contains("open");
  closeUserMenu();
  menu.classList.toggle("open", open);
  menu.setAttribute("aria-hidden", String(!open));
  $("#render-quality-trigger")?.setAttribute("aria-expanded", String(open));
}

function setRenderQuality(quality) {
  if (!["low", "medium", "high"].includes(quality)) return;
  localStorage.setItem(RENDER_QUALITY_KEY, quality);
  applyWorkspacePerformanceMode();
  rebuildLiquidGlassSurfaceEffects();
  if (quality === "high") {
    initializeWorkspaceAtmosphere();
    initializeWorkspaceParallax();
    initializePointerMotion();
    initializeGlassHighlights();
  } else {
    initializeWorkspaceAtmosphere();
  }
  closeRenderQualityMenu();
  syncWorkspaceSettings();
  const labels = { low: "低画质 · 流畅优先", medium: "中画质 · 平衡", high: "高画质 · 视觉优先" };
  toast(`已切换为${labels[quality]}`);
}

function applyPortalMode(mode) {
  const landing = mode === "landing";
  if (landing && workspaceLocalFontState.active) closeWorkspaceLocalFontEditor();
  $("#entry-experience").hidden = !landing;
  $("#workspace-app").hidden = landing;
  document.body.classList.toggle("entry-active", landing);
  document.body.classList.toggle("workspace-active", !landing);
  applyWorkspacePerformanceMode();
  if (landing) stopWorkspaceAtmosphere();
  window.scrollTo({ top: 0, behavior: "auto" });
  window.dispatchEvent(new Event("edulink:portalchange"));
}

let portalTransitionSequence = 0;

function runPortalWipe(mode, update) {
  const portal = $("#portal-wipe");
  const accent = portal?.querySelector(".portal-wipe-accent");
  const underlay = portal?.querySelector(".portal-wipe-underlay");
  const panel = portal?.querySelector(".portal-wipe-panel");
  const mark = portal?.querySelector(".portal-wipe-mark");
  const track = portal?.querySelector(".portal-wipe-track i");
  if (!portal || !accent || !underlay || !panel || typeof panel.animate !== "function") {
    update();
    return null;
  }

  const sequence = ++portalTransitionSequence;
  const toWorkspace = mode === "workspace";
  const coverOrigin = toWorkspace ? "left center" : "right center";
  const revealOrigin = toWorkspace ? "right center" : "left center";
  const coverEase = "cubic-bezier(.895,.03,.685,.22)";
  const revealEase = "cubic-bezier(.165,.84,.44,1)";
  const layers = [accent, underlay, panel];
  const waitFor = (animation) => animation.finished.catch(() => {});

  portal.getAnimations({ subtree: true }).forEach((animation) => animation.cancel());
  layers.forEach((layer) => { layer.style.transformOrigin = coverOrigin; });
  $("#portal-wipe-label").textContent = toWorkspace ? "进入智能工作台" : "返回 EduLink 首页";
  portal.classList.toggle("to-workspace", toWorkspace);
  portal.classList.toggle("to-entry", !toWorkspace);
  portal.hidden = false;
  portal.setAttribute("aria-hidden", "false");
  document.body.classList.add("portal-locked");

  const cover = [
    accent.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { duration: 720, easing: coverEase, fill: "forwards" }),
    underlay.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { duration: 820, delay: 55, easing: coverEase, fill: "forwards" }),
    panel.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { duration: 900, delay: 105, easing: coverEase, fill: "forwards" })
  ];
  mark.animate(
    [{ opacity: 0, transform: "translate3d(-26px,-50%,0)" }, { opacity: 1, transform: "translate3d(0,-50%,0)" }],
    { duration: 420, delay: 680, easing: revealEase, fill: "forwards" }
  );
  track.animate(
    [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }],
    { duration: 460, delay: 620, easing: revealEase, fill: "forwards" }
  );

  const finished = Promise.all(cover.map(waitFor)).then(() => {
    if (sequence !== portalTransitionSequence) return;
    update();
    refreshIcons();
    layers.forEach((layer) => { layer.style.transformOrigin = revealOrigin; });
    mark.animate(
      [{ opacity: 1, transform: "translate3d(0,-50%,0)" }, { opacity: 0, transform: `translate3d(${toWorkspace ? 32 : -32}px,-50%,0)` }],
      { duration: 520, delay: 60, easing: coverEase, fill: "forwards" }
    );
    return Promise.all([
      waitFor(panel.animate([{ transform: "scaleX(1)" }, { transform: "scaleX(0)" }], { duration: 940, delay: 150, easing: revealEase, fill: "forwards" })),
      waitFor(underlay.animate([{ transform: "scaleX(1)" }, { transform: "scaleX(0)" }], { duration: 1010, delay: 220, easing: revealEase, fill: "forwards" })),
      waitFor(accent.animate([{ transform: "scaleX(1)" }, { transform: "scaleX(0)" }], { duration: 1080, delay: 285, easing: revealEase, fill: "forwards" }))
    ]);
  }).finally(() => {
    if (sequence !== portalTransitionSequence) return;
    portal.hidden = true;
    portal.setAttribute("aria-hidden", "true");
    portal.classList.remove("to-workspace", "to-entry");
    portal.getAnimations({ subtree: true }).forEach((animation) => animation.cancel());
    layers.forEach((layer) => { layer.style.transformOrigin = "left center"; });
    document.body.classList.remove("portal-locked");
  });

  return { finished };
}

function transitionPortal(mode, options = {}) {
  const landing = mode === "landing";
  const alreadyActive = landing ? !$("#entry-experience").hidden : !$("#workspace-app").hidden;
  const update = () => applyPortalMode(mode);
  const canTransition = !options.immediate && !alreadyActive && !prefersReducedMotion();
  if (!canTransition) {
    update();
    return null;
  }
  return runPortalWipe(mode, update);
}

function showLanding(options = {}) {
  transitionPortal("landing", options);
}

function enterWorkspace(options = {}) {
  if (!authState.user && !options.bypassAuth) {
    openAuthModal({ enterWorkspace: true, destination: options.destination || "" });
    return;
  }
  const transition = transitionPortal("workspace", options);
  const finish = () => {
    refreshIcons();
    applyWorkspaceFontScale();
    initializeEditorialWorkspaceMotion();
    if (authState.user && shouldAutoOpenWorkspaceGuide()) window.setTimeout(openWorkspaceGuide, 760);
    if (options.destination && workspaceSections[options.destination]) setWorkspaceSection(options.destination, { keepScroll: true, immediate: true });
  };
  if (transition) transition.finished.then(finish).catch(finish);
  else window.setTimeout(finish, 40);
}

function getPanelForTarget(target) {
  return target?.closest("[data-workspace-panel]")?.dataset.workspacePanel || "";
}

function updateWorkspaceContainers(view) {
  const layout = view.querySelector(".dashboard-layout, .reflection-layout");
  if (!layout) return;
  const columns = Array.from(layout.children);
  columns.forEach((column) => {
    const hasVisiblePanel = Array.from(column.querySelectorAll("[data-workspace-panel]")).some((panel) => !panel.hidden);
    column.hidden = !hasVisiblePanel;
  });
  const visibleColumns = columns.filter((column) => !column.hidden).length;
  layout.hidden = visibleColumns === 0;
  layout.classList.toggle("single-column", visibleColumns === 1);
}

function syncObservationReportHeight() {
  const report = $("#observe #report-panel");
  const rail = $("#workspace-app .rail");
  if (!report || !rail || window.innerWidth < 1061 || report.hidden) {
    report?.style.removeProperty("height");
    report?.style.removeProperty("min-height");
    return;
  }

  const reportTop = report.getBoundingClientRect().top;
  const railBottom = rail.getBoundingClientRect().bottom;
  const fillHeight = Math.max(520, Math.round(railBottom - reportTop));
  report.style.setProperty("height", `${fillHeight}px`, "important");
  report.style.setProperty("min-height", `${fillHeight}px`, "important");
}

function getCloudDriveItems() {
  const items = readStoredJson(localStorage, CLOUD_DRIVE_KEY);
  return Array.isArray(items) ? items : [];
}

function renderCloudDrive() {
  const list = $("#cloud-drive-file-list");
  if (!list) return;
  const items = getCloudDriveItems();
  $("#cloud-drive-file-count").textContent = String(items.length);
  $("#cloud-drive-download-count").textContent = String(items.filter((item) => item.kind === "download").length);
  list.innerHTML = items.length ? items.map((item) => `<article><span class="cloud-file-icon"><i data-lucide="${item.kind === "download" ? "file-down" : "file-text"}"></i></span><div><b>${escapeHtml(item.name)}</b><small>${escapeHtml(item.kind === "download" ? "生成成果" : "上传材料")} · ${escapeHtml(item.time)}</small></div><em>${escapeHtml(item.size || "本地记录")}</em></article>`).join("") : `<div class="cloud-drive-empty"><i data-lucide="cloud-off"></i><b>还没有文件记录</b><span>上传课堂材料后，文件会出现在这里。</span></div>`;
  refreshIcons();
}

function recordCloudDriveFiles(fileList) {
  const files = Array.from(fileList || []).filter(Boolean);
  if (!files.length) return;
  const current = getCloudDriveItems();
  const additions = files.map((file) => ({
    name: file.name,
    size: file.size > 1024 * 1024 ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(file.size / 1024))} KB`,
    kind: "upload",
    time: new Date().toLocaleString("zh-CN", { hour12: false })
  }));
  localStorage.setItem(CLOUD_DRIVE_KEY, JSON.stringify([...additions, ...current].slice(0, 60)));
  renderCloudDrive();
  toast(`已记录 ${files.length} 个文件，可在云盘中查看。`);
}

function updateWorkspacePageSequence(sectionName, config) {
  /* The current step moved into the dynamic assistant sub-navigation. */
  return { sectionName, config };
}

function fitWorkspacePageTitle() {
  const title = $("#page-title");
  const label = title?.querySelector("span");
  if (!title || !label || !document.body.classList.contains("workspace-active")) return;

  const preferred = Number.parseFloat(title.dataset.edulinkLocalFontSize)
    || Number.parseFloat(title.dataset.edulinkFontSize)
    || Number.parseFloat(getComputedStyle(title).fontSize)
    || 34;
  const minimum = window.innerWidth <= 760 ? 20 : 22;
  title.style.fontSize = `${preferred}px`;

  const range = document.createRange();
  range.selectNodeContents(label);
  const measuredWidth = range.getBoundingClientRect().width;
  const availableWidth = title.clientWidth;
  if (!measuredWidth || !availableWidth || measuredWidth <= availableWidth) return;

  const fitted = Math.max(minimum, preferred * (availableWidth / measuredWidth) * 0.985);
  title.style.fontSize = `${fitted.toFixed(2)}px`;
}

function syncReflectionPathNavigation(sectionName = state.currentSection) {
  const index = REFLECTION_PATH_SECTIONS.indexOf(sectionName);
  const active = index >= 0;
  const navigation = $("#reflection-path-navigation");
  const pager = $("#reflection-path-pager");
  if (navigation) navigation.hidden = !active;
  if (pager) pager.hidden = !active;
  if (!active) return;

  $$('[data-reflection-path-section]').forEach((button) => {
    const selected = button.dataset.reflectionPathSection === sectionName;
    button.classList.toggle("active", selected);
    if (selected) button.setAttribute("aria-current", "step");
    else button.removeAttribute("aria-current");
  });

  const previous = $("#reflection-path-previous");
  const next = $("#reflection-path-next");
  const previousSection = REFLECTION_PATH_SECTIONS[index - 1];
  const nextSection = REFLECTION_PATH_SECTIONS[index + 1];
  if (previous) {
    previous.disabled = !previousSection;
    previous.dataset.reflectionPathTarget = previousSection || "";
    previous.querySelector("b").textContent = previousSection ? REFLECTION_PATH_LABELS[previousSection] : "已是第一步";
  }
  if (next) {
    next.disabled = !nextSection;
    next.dataset.reflectionPathTarget = nextSection || "";
    next.querySelector("b").textContent = nextSection ? REFLECTION_PATH_LABELS[nextSection] : "路径已完成";
  }
  const position = $("#reflection-path-position");
  if (position) position.textContent = `${index + 1} / ${REFLECTION_PATH_SECTIONS.length}`;
}

async function navigateReflectionPath(targetSection) {
  if (!REFLECTION_PATH_SECTIONS.includes(targetSection)) return;
  if (state.currentSection === "reflect-theory" && targetSection === "reflect-action") {
    await confirmReflectionTheoriesAndContinue();
    return;
  }
  setWorkspaceSection(targetSection);
}

function navigateWorkspaceStep(offset) {
  const order = workspaceSectionOrder[state.currentView] || [];
  const currentSection = state.currentView === "reflect"
    ? reflectionNavigationSection(state.currentSection)
    : canonicalWorkspaceSection(state.currentSection);
  const current = Math.max(0, order.indexOf(currentSection));
  const target = order[current + offset];
  if (target) setWorkspaceSection(target);
}

function isDesktopAssistantFlyout() {
  return window.matchMedia("(min-width: 1061px)").matches;
}

function updateAssistantFlyoutGeometry(branch) {
  if (!branch || !isDesktopAssistantFlyout()) return;
  const trigger = branch.querySelector(".assistant-nav");
  const subtree = branch.querySelector(".nav-subtree");
  const buttons = Array.from(subtree?.querySelectorAll(".subnav-link") || []);
  if (!trigger || !subtree || !buttons.length) return;

  const step = buttons.length >= 8 ? 64 : 68;
  const middle = (buttons.length - 1) / 2;
  const span = Math.max(58, (buttons.length - 1) * step + 58);
  const triggerRect = trigger.getBoundingClientRect();
  const desiredCenter = triggerRect.top + triggerRect.height / 2;
  const safeCenter = clampWorkspaceTourValue(desiredCenter, span / 2 + 18, window.innerHeight - span / 2 - 18);

  subtree.style.setProperty("--fan-span", `${span}px`);
  subtree.style.setProperty("--fan-shift-y", `${safeCenter - desiredCenter}px`);
  buttons.forEach((button, index) => {
    const offset = index - middle;
    const edgeRatio = middle > 0 ? Math.abs(offset) / middle : 0;
    const x = 42 + (1 - edgeRatio) * 66;
    button.style.setProperty("--fan-x", `${Math.round(x)}px`);
    button.style.setProperty("--fan-y", `${Math.round(offset * step)}px`);
    button.style.setProperty("--fan-rotate", `${(offset * 1.8).toFixed(1)}deg`);
    button.style.setProperty("--fan-delay", `${index * 42}ms`);
    const label = button.querySelector("span")?.textContent?.trim() || "任务页面";
    const sequence = button.querySelector("b")?.textContent?.trim() || String(index + 1).padStart(2, "0");
    button.title = `${label} · 第 ${sequence} 步`;
    button.setAttribute("aria-label", `${label}，第 ${sequence} 步`);
  });
}

function cancelAssistantFlyoutClose() {
  window.clearTimeout(assistantFlyoutState.closeTimer);
  assistantFlyoutState.closeTimer = 0;
}

function cancelAssistantFlyoutOpen() {
  window.clearTimeout(assistantFlyoutState.openTimer);
  assistantFlyoutState.openTimer = 0;
}

function closeAssistantFlyout(branch = assistantFlyoutState.branch) {
  cancelAssistantFlyoutClose();
  if (!branch) return;
  branch.classList.remove("flyout-open");
  branch.querySelector(".assistant-nav")?.setAttribute("aria-expanded", "false");
  if (assistantFlyoutState.branch === branch) assistantFlyoutState.branch = null;
}

function closeAssistantFlyoutAfterDelay(branch, delay = 500) {
  cancelAssistantFlyoutClose();
  assistantFlyoutState.closeTimer = window.setTimeout(() => closeAssistantFlyout(branch), delay);
}

function openAssistantFlyout(branch) {
  if (!branch || !isDesktopAssistantFlyout()) return;
  cancelAssistantFlyoutOpen();
  cancelAssistantFlyoutClose();
  if (assistantFlyoutState.branch && assistantFlyoutState.branch !== branch) closeAssistantFlyout(assistantFlyoutState.branch);
  assistantFlyoutState.branch = branch;
  updateAssistantFlyoutGeometry(branch);
  branch.classList.add("flyout-open");
  branch.querySelector(".assistant-nav")?.setAttribute("aria-expanded", "true");
}

function toggleAssistantFlyout(branch) {
  if (!branch || !isDesktopAssistantFlyout()) return;
  cancelAssistantFlyoutOpen();
  if (branch.classList.contains("flyout-open")) closeAssistantFlyout(branch);
  else openAssistantFlyout(branch);
}

function openAssistantFlyoutAfterCurtain(branch, viewName, delay = 90) {
  cancelAssistantFlyoutOpen();
  if (!branch || !isDesktopAssistantFlyout()) return;
  assistantFlyoutState.openTimer = window.setTimeout(() => {
    assistantFlyoutState.openTimer = 0;
    if (state.currentView !== viewName || !branch.classList.contains("open")) return;
    openAssistantFlyout(branch);
    // Keep the handoff UI's fan reveal, but do not leave it covering the active workspace.
    closeAssistantFlyoutAfterDelay(branch, 1100);
  }, delay);
}

function initializeAssistantFlyouts() {
  $$(".assistant-branch").forEach((branch) => {
    updateAssistantFlyoutGeometry(branch);
    branch.addEventListener("pointerenter", () => {
      cancelAssistantFlyoutClose();
      if (branch.classList.contains("open") && !branch.classList.contains("flyout-open")) openAssistantFlyout(branch);
    });
    branch.addEventListener("pointerleave", () => {
      if (branch.classList.contains("flyout-open")) closeAssistantFlyoutAfterDelay(branch);
    });
    branch.addEventListener("focusin", () => {
      cancelAssistantFlyoutClose();
    });
    branch.addEventListener("focusout", (event) => {
      if (!branch.contains(event.relatedTarget) && branch.classList.contains("flyout-open")) closeAssistantFlyoutAfterDelay(branch);
    });
  });
  document.addEventListener("pointerdown", (event) => {
    const branch = assistantFlyoutState.branch;
    if (!branch?.classList.contains("flyout-open")) return;
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest(".assistant-branch") !== branch) closeAssistantFlyout(branch);
  }, { capture: true });
}

let railMentorLayoutFrame = 0;
let railMentorLayoutTimer = 0;
let railMentorResizeObserver = null;

function syncRailMentorPresentation() {
  const rail = $("#workspace-app .rail");
  const mentor = rail?.querySelector(".rail-mentor-card");
  const progress = rail?.querySelector(".rail-progress");
  if (!rail || !mentor || !progress) return;
  const compactSections = new Set([
    "theory-library",
    "sixarts-overview",
    "resource-navigation",
    "cloud-drive",
    "theory-scenario",
    "observe-overview",
    "observe-decoder",
    "observe-coding",
    "observe-events",
    "observe-insights"
  ]);
  const compact = compactSections.has(state.currentSection) || window.innerWidth < 640;
  rail.classList.toggle("rail-mentor-room", !compact);
  mentor.setAttribute("aria-label", compact ? "打开导航助手对话" : "导航助手小智，点击进入对话学习");
}

function scheduleRailMentorLayout() {
  window.cancelAnimationFrame(railMentorLayoutFrame);
  window.clearTimeout(railMentorLayoutTimer);
  railMentorLayoutFrame = window.requestAnimationFrame(() => {
    railMentorLayoutFrame = 0;
    syncRailMentorPresentation();
    syncObservationReportHeight();
    railMentorLayoutTimer = window.setTimeout(() => {
      railMentorLayoutTimer = 0;
      syncRailMentorPresentation();
      syncObservationReportHeight();
    }, 140);
  });
}

function initializeRailMentorObserver() {
  const rail = $("#workspace-app .rail");
  if (!rail || railMentorResizeObserver || !window.ResizeObserver) return;
  railMentorResizeObserver = new ResizeObserver(() => scheduleRailMentorLayout());
  [rail, rail.querySelector(".assistant-tree"), rail.querySelector(".secondary-nav"), rail.querySelector(".rail-mentor-card"), rail.querySelector(".rail-progress"), rail.querySelector(".rail-footer")]
    .filter(Boolean)
    .forEach((target) => railMentorResizeObserver.observe(target));
}

function isSixArtsSectionLocked(sectionName) {
  if (!assistantState.sixarts.generated || assistantState.sixarts.mode !== "steps") return false;
  if (sectionName === "sixarts-process") return !assistantState.sixarts.stageReady?.process;
  if (sectionName === "sixarts-evaluate") return !assistantState.sixarts.stageReady?.evaluate;
  return false;
}

function isWorkspaceGuideAutoEnabled() {
  return localStorage.getItem(WORKSPACE_GUIDE_AUTO_KEY) !== "off";
}

function shouldAutoOpenWorkspaceGuide() {
  return isWorkspaceGuideAutoEnabled() && !localStorage.getItem(WORKSPACE_GUIDE_SEEN_KEY);
}

function syncWorkspaceSettings() {
  const guideEnabled = isWorkspaceGuideAutoEnabled();
  const guideCompleted = Boolean(localStorage.getItem(WORKSPACE_GUIDE_SEEN_KEY));
  const guideToggle = $("#workspace-guide-enabled");
  const guideStatus = $("#workspace-guide-status");
  if (guideToggle) guideToggle.checked = guideEnabled;
  if (guideStatus) {
    guideStatus.textContent = guideCompleted
      ? `已完成 ${workspaceTourSteps.length} 步引导，可随时重新播放`
      : guideEnabled ? "尚未完成，进入工作台时会自动提示" : "已关闭自动引导";
  }
  applyPointerGlassPreference();
  applyWorkspaceFontScale();
  const quality = document.documentElement.dataset.workspacePerf
    || (["low", "medium", "high"].includes(localStorage.getItem(RENDER_QUALITY_KEY)) ? localStorage.getItem(RENDER_QUALITY_KEY) : "medium");
  $$('[data-settings-render-quality]').forEach((button) => {
    const active = button.dataset.settingsRenderQuality === quality;
    button.classList.toggle("active", active);
    button.setAttribute("aria-checked", String(active));
  });
}

function setWorkspaceGuideAutoEnabled(enabled) {
  localStorage.setItem(WORKSPACE_GUIDE_AUTO_KEY, enabled ? "on" : "off");
  syncWorkspaceSettings();
  toast(enabled ? "已开启新手引导提醒。" : "已关闭自动引导，之后进入工作台将不再自动出现。");
}

function resolveWorkspaceTourTarget(step) {
  for (const selector of step.targets || []) {
    const target = $(selector);
    if (!target) continue;
    const rect = target.getBoundingClientRect();
    if (rect.width > 8 && rect.height > 8) return target;
  }
  return null;
}

function scheduleWorkspaceTourLayout() {
  window.cancelAnimationFrame(workspaceTourState.layoutFrame);
  workspaceTourState.layoutFrame = window.requestAnimationFrame(positionWorkspaceTour);
}

function clampWorkspaceTourValue(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getWorkspaceTourPlacementOrder(preferred) {
  const orders = {
    left: ["left", "right", "below", "above"],
    right: ["right", "left", "below", "above"],
    below: ["below", "above", "right", "left"],
    "below-left": ["below", "left", "above", "right"],
    above: ["above", "below", "right", "left"]
  };
  return orders[preferred] || orders.below;
}

function getWorkspaceTourCandidate(side, size, targetBounds, viewport, gap) {
  const min = 12;
  const centerX = targetBounds.left + (targetBounds.right - targetBounds.left) / 2;
  const centerY = targetBounds.top + (targetBounds.bottom - targetBounds.top) / 2;
  const maxX = Math.max(min, viewport.width - size.width - min);
  const maxY = Math.max(min, viewport.height - size.height - min);
  let x = centerX - size.width / 2;
  let y = centerY - size.height / 2;

  if (side === "left") x = targetBounds.left - size.width - gap;
  if (side === "right") x = targetBounds.right + gap;
  if (side === "above") y = targetBounds.top - size.height - gap;
  if (side === "below") y = targetBounds.bottom + gap;

  x = clampWorkspaceTourValue(x, min, maxX);
  y = clampWorkspaceTourValue(y, min, maxY);
  const rect = { left: x, top: y, right: x + size.width, bottom: y + size.height };
  const overlapWidth = Math.max(0, Math.min(rect.right, targetBounds.right) - Math.max(rect.left, targetBounds.left));
  const overlapHeight = Math.max(0, Math.min(rect.bottom, targetBounds.bottom) - Math.max(rect.top, targetBounds.top));
  return { side, x, y, overlap: overlapWidth * overlapHeight };
}

function chooseWorkspaceTourPlacement(size, targetBounds, viewport, preferred, gap) {
  return getWorkspaceTourPlacementOrder(preferred)
    .map((side, index) => ({
      ...getWorkspaceTourCandidate(side, size, targetBounds, viewport, gap),
      preference: index
    }))
    .sort((a, b) => (a.overlap - b.overlap) || (a.preference - b.preference))[0];
}

function positionWorkspaceTour() {
  const layer = $("#workspace-guide-layer");
  const companion = $("#workspace-tour-companion");
  const spotlight = $("#workspace-tour-spotlight");
  if (!layer?.classList.contains("open") || !companion || !spotlight) return;

  const step = workspaceTourSteps[workspaceTourState.index];
  const target = resolveWorkspaceTourTarget(step);
  workspaceTourState.target = target;
  const welcome = !target || step.placement === "center";
  companion.classList.toggle("is-welcome", welcome);
  layer.classList.toggle("is-welcome", welcome);

  if (!target || step.placement === "center") {
    spotlight.classList.remove("active");
    companion.removeAttribute("data-placement");
    companion.style.removeProperty("left");
    companion.style.removeProperty("top");
    return;
  }

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const source = target.getBoundingClientRect();
  const padding = source.width > viewportWidth * .72 ? 6 : 10;
  const left = Math.max(10, source.left - padding);
  const top = Math.max(10, source.top - padding);
  const right = Math.min(viewportWidth - 10, source.right + padding);
  let bottom = Math.min(viewportHeight - 10, source.bottom + padding);
  const maxSpotlightHeight = viewportHeight * (viewportWidth <= 760 ? .36 : .5);
  if (bottom - top > maxSpotlightHeight) bottom = Math.min(viewportHeight - 10, top + maxSpotlightHeight);

  spotlight.classList.add("active");
  spotlight.style.left = `${left}px`;
  spotlight.style.top = `${top}px`;
  spotlight.style.width = `${Math.max(24, right - left)}px`;
  spotlight.style.height = `${Math.max(24, bottom - top)}px`;
  $("#workspace-tour-focus-label").textContent = step.focusLabel;

  const targetBounds = { left, top, right, bottom };
  const viewport = { width: viewportWidth, height: viewportHeight };
  const gap = viewportWidth <= 760 ? 12 : 20;

  const guideRect = companion.getBoundingClientRect();
  const guideSize = {
    width: Math.min(guideRect.width || 690, viewportWidth - 24),
    height: Math.min(guideRect.height || 430, viewportHeight - 24)
  };
  const placement = chooseWorkspaceTourPlacement(guideSize, targetBounds, viewport, step.placement, gap);

  companion.dataset.placement = placement.side;
  companion.style.left = `${placement.x}px`;
  companion.style.top = `${placement.y}px`;
}

function renderWorkspaceGuide() {
  if (!$("#workspace-guide-layer")?.classList.contains("open")) return;
  const step = workspaceTourSteps[workspaceTourState.index];
  if (!step || !$("#workspace-guide-progress")) return;
  if (step.section && state.currentSection !== step.section) {
    setWorkspaceSection(step.section, { keepScroll: true, immediate: true });
    return;
  }
  $("#workspace-guide-eyebrow").textContent = step.eyebrow;
  $("#workspace-guide-title").textContent = step.title;
  $("#workspace-guide-copy").textContent = step.copy;
  $("#workspace-guide-tip span").textContent = step.tip;
  $(".workspace-tour-stepmark").innerHTML = `<i id="workspace-guide-icon" data-lucide="${step.icon}"></i>`;
  $("#workspace-guide-current-index").textContent = String(workspaceTourState.index + 1).padStart(2, "0");
  $("#workspace-guide-total").textContent = String(workspaceTourSteps.length).padStart(2, "0");
  $("#workspace-guide-progress").innerHTML = workspaceTourSteps.map((item, index) => `<span class="${index === workspaceTourState.index ? "active" : ""} ${index < workspaceTourState.index ? "complete" : ""}" title="第 ${index + 1} 步：${item.title}" aria-hidden="true"></span>`).join("");
  $("#workspace-guide-prev").disabled = workspaceTourState.index === 0;
  const lastStep = workspaceTourState.index === workspaceTourSteps.length - 1;
  $("#workspace-guide-next").innerHTML = lastStep
    ? `开始使用<i data-lucide="check"></i>`
    : `下一步<i data-lucide="arrow-right"></i>`;
  refreshIcons();
  scheduleWorkspaceTourLayout();
}

function openWorkspaceGuide(options = {}) {
  if (!document.body.classList.contains("workspace-active")) return;
  closeWorkspaceSettings({ restoreFocus: false });
  workspaceTourState.returnFocus = document.activeElement;
  workspaceTourState.originView = state.currentView;
  workspaceTourState.originSection = state.currentSection;
  workspaceTourState.index = Math.max(0, Math.min(workspaceTourSteps.length - 1, Number(options.index) || 0));
  $("#workspace-guide-layer").classList.add("open");
  $("#workspace-guide-layer").setAttribute("aria-hidden", "false");
  document.body.classList.add("workspace-tour-open");
  renderWorkspaceGuide();
  window.setTimeout(() => $("#workspace-guide-next")?.focus(), 100);
}

function closeWorkspaceGuide(options = {}) {
  const layer = $("#workspace-guide-layer");
  if (!layer) return;
  const wasOpen = layer.classList.contains("open");
  layer.classList.remove("open");
  layer.classList.remove("is-welcome");
  layer.setAttribute("aria-hidden", "true");
  $("#workspace-tour-spotlight")?.classList.remove("active");
  document.body.classList.remove("workspace-tour-open");
  window.cancelAnimationFrame(workspaceTourState.layoutFrame);
  if (wasOpen && options.restoreWorkspace !== false && workspaceTourState.originSection && workspaceSections[workspaceTourState.originSection]) {
    setWorkspaceSection(workspaceTourState.originSection, { keepScroll: true, immediate: true });
  }
  if (options.restoreFocus !== false && workspaceTourState.returnFocus?.isConnected) workspaceTourState.returnFocus.focus();
  workspaceTourState.target = null;
  workspaceTourState.originSection = "";
  workspaceTourState.originView = "";
}

function skipWorkspaceGuide() {
  closeWorkspaceGuide();
  toast("已跳过本次引导。可在偏好设置中关闭后续自动提示。");
}

function finishWorkspaceGuide() {
  localStorage.setItem(WORKSPACE_GUIDE_SEEN_KEY, "1");
  closeWorkspaceGuide();
  syncWorkspaceSettings();
  toast(`${workspaceTourSteps.length} 步引导已完成。之后可从功能导航或偏好设置重新播放。`);
}

function moveWorkspaceGuide(offset) {
  const next = workspaceTourState.index + offset;
  if (next >= workspaceTourSteps.length) {
    finishWorkspaceGuide();
    return;
  }
  workspaceTourState.index = Math.max(0, next);
  renderWorkspaceGuide();
}

function openWorkspaceSettings() {
  closeUserMenu();
  closeRenderQualityMenu();
  closeWorkspaceGuide({ restoreFocus: false });
  workspaceFontScaleDraft = null;
  syncWorkspaceSettings();
  $("#workspace-settings-layer").classList.add("open");
  $("#workspace-settings-layer").setAttribute("aria-hidden", "false");
  document.body.classList.add("workspace-settings-open");
  window.setTimeout(() => $("#workspace-settings-close")?.focus(), 80);
}

function closeWorkspaceSettings(options = {}) {
  const layer = $("#workspace-settings-layer");
  if (!layer) return;
  layer.classList.remove("open");
  layer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("workspace-settings-open");
  if (options.restoreFocus !== false && $("#workspace-settings-open")) $("#workspace-settings-open").focus();
}

function applyWorkspaceSection(sectionName, options = {}) {
  const config = workspaceSections[sectionName];
  if (!config) return;
  const canonicalSection = canonicalWorkspaceSection(sectionName);
  if (sectionName !== "theory-library" && document.body.classList.contains("theory-map-workspace-expanded")) {
    setTheoryMapExpanded(false);
  }
  state.currentSection = sectionName;
  document.body.dataset.activeWorkspaceSection = canonicalSection;
  document.body.dataset.requestedWorkspaceSection = sectionName;

  if (state.currentView !== config.view) commitView(config.view, { preserveSection: true });
  renderWorkspaceAssistantSwitcher(config.view, sectionName);

  const view = $("#" + config.view);
  const navigationSection = config.view === "sixarts" && ["sixarts-process", "sixarts-evaluate"].includes(sectionName)
    ? "sixarts-design"
    : config.view === "reflect"
      ? reflectionNavigationSection(sectionName)
      : canonicalSection;
  const visiblePanelSections = config.view === "reflect" && REFLECTION_HISTORY_SECTIONS.includes(sectionName)
    ? new Set(REFLECTION_HISTORY_SECTIONS)
    : new Set([sectionName]);
  view.dataset.activePanel = config.view === "reflect" && REFLECTION_HISTORY_SECTIONS.includes(sectionName)
    ? "reflect-trajectory"
    : canonicalSection;
  view.querySelectorAll("[data-workspace-panel]").forEach((panel) => {
    const panelSection = panel.dataset.workspacePanel;
    const panelCanonical = canonicalWorkspaceSection(panelSection);
    const inDecoder = config.view === "observe"
      && canonicalSection === "observe-decoder"
      && (panel.dataset.workspaceGroup === "observe-decoder" || panelCanonical === "observe-decoder");
    panel.hidden = !(inDecoder || visiblePanelSections.has(panelSection) || panelCanonical === canonicalSection);
  });
  syncReflectionPathNavigation(sectionName);
  updateWorkspaceContainers(view);
  syncObservationReportHeight();

  $$('button[data-workspace-section]').forEach((button) => {
    button.classList.toggle("active", canonicalWorkspaceSection(button.dataset.workspaceSection) === navigationSection);
  });
  if (config.view === "observe") {
    const decoderTarget = observationDecoderTarget(sectionName);
    $$('[data-observe-decoder-target]').forEach((button) => {
      button.classList.toggle("active", canonicalSection === "observe-decoder" && button.dataset.observeDecoderTarget === decoderTarget);
    });
  }
  $$(".assistant-branch").forEach((branch) => {
    const open = branch.dataset.assistantBranch === config.view;
    branch.classList.toggle("open", open);
    const toggle = branch.querySelector("[data-view]");
    if (toggle) {
      toggle.setAttribute("aria-current", open ? "page" : "false");
      toggle.setAttribute("aria-expanded", String(branch.classList.contains("flyout-open")));
    }
  });
  scheduleRailMentorLayout();
  $("#page-eyebrow").innerHTML = `<span>${escapeHtml(config.eyebrow)}</span>`;
  $("#page-title").innerHTML = `<span>${escapeHtml(config.title)}</span>`;
  fitWorkspacePageTitle();
  $("#page-purpose").textContent = workspaceSectionGuides[sectionName]
    || workspaceSectionGuides[canonicalSection]
    || "进入当前任务页面完成对应工作。";
  updateWorkspacePageSequence(sectionName, config);
  const observationAction = config.view === "observe";
  $("#run-analysis").style.display = observationAction ? "inline-flex" : "none";
  $("#load-sample").style.display = observationAction ? "inline-flex" : "none";
  const analysisCompletion = state.analysis ? Math.min(98, 58 + state.analysis.theoryMatches.length * 4 + state.analysis.events.length) : 0;
  const reflectionReadiness = Number.parseInt($("#readiness-score")?.textContent || "0", 10) || 0;
  const workspaceCopy = {
    observe: { search: "检索逐字稿、理论或课堂事件", label: "本次分析", value: `${analysisCompletion}%`, progress: analysisCompletion, note: "材料、行为编码与理论证据已关联" },
    reflect: { search: "检索成果正文、研究框架或改进建议", label: "成果准备", value: `${reflectionReadiness}%`, progress: reflectionReadiness, note: "课堂证据正在转化为专业成果" },
    theory: { search: "检索理论、机制或课堂问题", label: "学习计划", value: `${assistantState.theory.plan.length}/12`, progress: Math.round((assistantState.theory.plan.length / 12) * 100), note: "理论解释、课堂范本与情境训练已关联" },
    sixarts: { search: "检索六艺维度、活动或学习证据", label: "融合维度", value: `${assistantState.sixarts.selectedArts.length}/6`, progress: Math.round((assistantState.sixarts.selectedArts.length / 6) * 100), note: "说、唱、弹、舞、书、画服务学科目标" },
    resources: { search: "检索文件、教育网站或资源名称", label: "资源中心", value: "本地", progress: 100, note: "上传记录与权威教育资源集中管理" }
  }[config.view];
  $("#workspace-search").placeholder = workspaceCopy.search;
  $(".rail-progress-head span").textContent = workspaceCopy.label;
  $("#rail-progress-value").textContent = workspaceCopy.value;
  $("#rail-progress-bar").style.width = `${workspaceCopy.progress}%`;
  $(".rail-progress p").textContent = workspaceCopy.note;
  renderWorkspaceGuide();
  if (config.view === "sixarts") renderSixArtsGenerationState();

  if (!options.keepScroll) window.scrollTo({ top: 0, behavior: options.smooth ? "smooth" : "auto" });
  refreshIcons();
}

function animateWorkspaceSection(sectionName) {
  if (prefersReducedMotion() || document.documentElement.classList.contains("workspace-perf-lite")) return;
  const config = workspaceSections[sectionName];
  const view = config && $("#" + config.view);
  if (!view) return;
  const headingTargets = [$("#page-eyebrow span"), $("#page-title span")].filter(Boolean);
  headingTargets.forEach((target, index) => target.animate([
    { opacity: 0, transform: "translateY(112%)" },
    { opacity: 1, transform: "translateY(0)" }
  ], {
    duration: index === 1 ? 920 : 760,
    delay: 80 + index * 75,
    easing: "cubic-bezier(.24,.43,.15,.97)",
    fill: "both"
  }));
  const panels = Array.from(view.querySelectorAll("[data-workspace-panel]:not([hidden])"));
  panels.forEach((panel, index) => panel.animate([
    { opacity: 0, transform: "translateY(30px)", clipPath: "inset(0 0 100% 0)" },
    { opacity: 1, transform: "translateY(0)", clipPath: "inset(0 0 0 0)" }
  ], {
    duration: 980,
    delay: 110 + Math.min(index * 90, 270),
    easing: "cubic-bezier(.24,.43,.15,.97)",
    fill: "both"
  }));
}

function prepareWorkspaceCurtain() {
  const strips = $("#workspace-curtain-strips");
  if (!strips) return;
  const quality = document.documentElement.dataset.workspacePerf || "medium";
  const count = quality === "low" ? 12 : quality === "medium" ? 18 : 24;
  strips.style.setProperty("--curtain-strip-count", String(count));
  if (strips.children.length !== count) {
    strips.innerHTML = Array.from(
      { length: count },
      (_, index) => `<i style="--strip:${index};--reverse-strip:${count - index - 1}"></i>`
    ).join("");
  }
}

function runWorkspaceAssistantTransition(sectionName, update) {
  const curtain = $("#workspace-motion-curtain");
  const config = workspaceSections[sectionName];
  if (!curtain || !config || prefersReducedMotion()) {
    update();
    animateWorkspaceSection(sectionName);
    openAssistantFlyoutAfterCurtain($(`.assistant-branch[data-assistant-branch="${config?.view}"]`), config?.view, 40);
    return;
  }
  if (workspaceMotionState.assistantTransitionActive) {
    if (workspaceMotionState.activeAssistantSection !== sectionName) {
      workspaceMotionState.pendingAssistantTransition = { sectionName, update };
    }
    return;
  }
  prepareWorkspaceCurtain();
  workspaceMotionState.assistantTransitionActive = true;
  workspaceMotionState.activeAssistantSection = sectionName;
  const token = ++workspaceMotionState.transitionToken;
  const meta = workspaceAssistantMeta[config.view];
  curtain.dataset.curtainView = config.view;
  $("#workspace-curtain-index").textContent = `${meta.index} / 04`;
  $("#workspace-curtain-title").textContent = meta.title;
  curtain.classList.remove("is-entering", "is-revealing");
  void curtain.offsetWidth;
  curtain.classList.add("is-entering");
  window.setTimeout(() => {
    if (token !== workspaceMotionState.transitionToken) return;
    update();
    curtain.classList.add("is-revealing");
  }, 610);
  window.setTimeout(() => {
    if (token !== workspaceMotionState.transitionToken) return;
    curtain.classList.remove("is-entering", "is-revealing");
    workspaceMotionState.assistantTransitionActive = false;
    workspaceMotionState.activeAssistantSection = "";
    const pending = workspaceMotionState.pendingAssistantTransition;
    workspaceMotionState.pendingAssistantTransition = null;
    if (pending && pending.sectionName !== state.currentSection) {
      window.setTimeout(() => runWorkspaceAssistantTransition(pending.sectionName, pending.update), 36);
      return;
    }
    const pendingSection = workspaceMotionState.pendingSectionAfterAssistant;
    workspaceMotionState.pendingSectionAfterAssistant = null;
    if (pendingSection && pendingSection.sectionName !== state.currentSection) {
      window.setTimeout(() => setWorkspaceSection(pendingSection.sectionName, pendingSection.options), 36);
      return;
    }
    openAssistantFlyoutAfterCurtain(
      $(`.assistant-branch[data-assistant-branch="${config.view}"]`),
      config.view
    );
  }, 1420);
}

function setWorkspaceSection(sectionName, options = {}) {
  const config = workspaceSections[sectionName];
  if (!config) return;
  if (isSixArtsSectionLocked(sectionName)) {
    toast(sectionName === "sixarts-process" ? "请先确认并生成教学设计，再进入教学过程。" : "请先确认教学过程，再进入评价与下载。")
    return;
  }
  const changed = state.currentSection !== sectionName || state.currentView !== config.view;
  if (changed && !options.fromHistory && !options.immediate && state.currentSection && workspaceSections[state.currentSection]) {
    workspaceHistoryState.back.push(state.currentSection);
    workspaceHistoryState.back = workspaceHistoryState.back.slice(-30);
    workspaceHistoryState.forward = [];
  }
  const update = () => applyWorkspaceSection(sectionName, options);
  const workspaceVisible = !$("#workspace-app").hidden;
  const assistantChanged = state.currentView !== config.view;
  if (changed && workspaceMotionState.assistantTransitionActive && !options.immediate) {
    workspaceMotionState.pendingSectionAfterAssistant = { sectionName, options };
    return;
  }
  if (changed && workspaceMotionState.sectionTransitionActive && !options.immediate) {
    workspaceMotionState.pendingSectionTransition = { sectionName, options };
    return;
  }
  if (changed && assistantChanged && !options.immediate && workspaceVisible && !prefersReducedMotion()) {
    runWorkspaceAssistantTransition(sectionName, update);
    return;
  }
  // The curtain is the single transition surface. Native View Transition plus
  // panel animations created a second opacity/scale pass and caused visible flashes.
  const canTransition = false;
  if (canTransition) {
    document.documentElement.classList.add("section-transition", "editorial-section-transition");
    workspaceMotionState.sectionTransitionActive = true;
    let transition;
    try {
      transition = document.startViewTransition(update);
    } catch (error) {
      workspaceMotionState.sectionTransitionActive = false;
      document.documentElement.classList.remove("section-transition", "editorial-section-transition");
      update();
      animateWorkspaceSection(sectionName);
      return;
    }
    transition.ready.catch(() => {});
    transition.updateCallbackDone.catch(() => {});
    transition.finished.then(() => animateWorkspaceSection(sectionName)).catch(() => {});
    transition.finished.finally(() => {
      document.documentElement.classList.remove("section-transition", "editorial-section-transition");
      workspaceMotionState.sectionTransitionActive = false;
      const pending = workspaceMotionState.pendingSectionTransition;
      workspaceMotionState.pendingSectionTransition = null;
      if (pending && pending.sectionName !== state.currentSection) {
        window.setTimeout(() => setWorkspaceSection(pending.sectionName, pending.options), 28);
      }
    }).catch(() => {});
    return;
  }
  update();
  syncWorkspaceHistoryControls();
  if (changed && workspaceVisible && !options.immediate) animateWorkspaceSection(sectionName);
}

function commitView(viewName, options = {}) {
  state.currentView = viewName;
  $$(".view").forEach((view) => view.classList.toggle("active", view.id === viewName));
  $$("[data-view]").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === viewName);
  });
  if (!options.preserveSection) setWorkspaceSection(defaultWorkspaceSections[viewName], { keepScroll: true, immediate: true });
  window.scrollTo({ top: 0, behavior: "auto" });
}

function animateActiveScene(viewName) {
  if (prefersReducedMotion() || document.documentElement.classList.contains("workspace-perf-lite")) return;
  const view = $("#" + viewName);
  const viewSelectors = {
    reflect: [".workspace-banner", ".reflection-overview > .card", ".reflection-layout > *"],
    theory: [".workspace-banner", ".theory-stat", ".theory-overview-layout > *", ".theory-assistant-panel > *"],
    sixarts: [".workspace-banner", ".sixarts-stat-grid > *", ".sixarts-dimension-grid > *", ".sixarts-assistant-panel > *"],
    observe: [".workspace-banner", ".metric", ".overview-ribbon > .card", ".dashboard-layout > *"]
  };
  const selectors = viewSelectors[viewName] || viewSelectors.observe;
  const targets = selectors.flatMap((selector) => Array.from(view.querySelectorAll(selector)));
  targets.forEach((target, index) => {
    target.animate([
      { opacity: 0.18, transform: "translateY(18px) scale(.982)", clipPath: "inset(0 0 16% 0 round 18px)" },
      { opacity: 1, transform: "translateY(0) scale(1)", clipPath: "inset(0 0 0 0 round 18px)" }
    ], {
      duration: 680,
      delay: Math.min(index * 65, 320),
      easing: "cubic-bezier(.22,.72,.2,1)",
      fill: "both"
    });
  });
}

function setView(viewName) {
  if (!$("#" + viewName)) return;
  setWorkspaceSection(defaultWorkspaceSections[viewName], { keepScroll: true });
}

function parseLines(text) {
  return text
    .split(/\r?\n/)
    .map((raw, index) => {
      const line = raw.trim();
      if (!line) return null;
      const timeMatch = line.match(/^(\d{1,2}:\d{2}(?::\d{2})?)\s*/);
      const time = timeMatch ? timeMatch[1] : `#${String(index + 1).padStart(2, "0")}`;
      const content = line.replace(/^(\d{1,2}:\d{2}(?::\d{2})?)\s*/, "");
      const speaker = /^[（(]?(师(?:引导|小结|追问|提问)?|教师|追问|提问|小结)[）)]?[：:]/.test(content)
        ? "teacher"
        : /^[（(]?(生|学生|全班|小组|生齐|齐答)/.test(content)
          ? "student"
          : "other";
      return { index, time, content, speaker, tags: [] };
    })
    .filter(Boolean);
}

function hasAny(text, keys) {
  return keys.some((key) => text.includes(key));
}

function tagLines(lines) {
  const questionWords = ["？", "?", "为什么", "怎么", "多少", "谁", "有没有", "能不能", "可不可以", "同意吗", "想一想", "你觉得"];
  const deepWords = ["为什么", "怎么来的", "有什么发现", "规律", "解释", "理由", "依据", "完整说", "还有什么", "如果", "究竟", "联系"];
  const feedbackWords = ["很好", "真棒", "关键", "对了", "不错", "完整", "再说", "谢谢", "纠正", "提醒", "有道理", "掌声"];
  const representationWords = ["圆片", "魔力板", "学具", "实物", "移动", "算式", "公式", "图", "画", "字母", "符号", "拼", "剪", "折", "摸", "摆"];
  const collaborationWords = ["小组", "同桌", "合作", "交流", "讨论", "互相", "汇报"];
  const waitWords = ["想一想", "静静思考", "不急", "等待", "停顿", "先思考", "分钟", "最后5秒"];

  return lines.map((line) => {
    const tags = [];
    if (line.speaker === "teacher" && hasAny(line.content, questionWords)) tags.push("teacher-question");
    if (line.speaker === "teacher" && hasAny(line.content, deepWords)) tags.push("deep-question");
    if (line.speaker === "student") tags.push("student-answer");
    if (line.speaker === "teacher" && hasAny(line.content, feedbackWords)) tags.push("feedback");
    if (hasAny(line.content, representationWords)) tags.push("theory");
    if (hasAny(line.content, collaborationWords)) tags.push("collaboration");
    if (hasAny(line.content, waitWords)) tags.push("wait-evidence");
    if (line.speaker === "student" && hasAny(line.content, ["为什么", "吗", "？", "?"])) tags.push("student-question");
    return { ...line, tags };
  });
}

function countTags(lines, tag) {
  return lines.filter((line) => line.tags.includes(tag)).length;
}

function countDialogueStructures(lines) {
  const openWords = ["为什么", "怎么", "有什么发现", "你觉得", "理由", "依据", "如果", "还能", "是否需要", "怎样", "联系"];
  const collectiveWords = ["齐", "全班", "一起", "生齐", "齐答"];
  const teacherLines = lines.filter((line) => line.speaker === "teacher");
  const studentLines = lines.filter((line) => line.speaker === "student");
  const openQuestions = teacherLines.filter((line) => line.tags.includes("teacher-question") && hasAny(line.content, openWords)).length;
  const closedQuestions = Math.max(0, countTags(lines, "teacher-question") - openQuestions);
  const collectiveAnswers = studentLines.filter((line) => hasAny(line.content, collectiveWords)).length;
  const individualAnswers = Math.max(0, studentLines.length - collectiveAnswers);
  const waitEvidence = countTags(lines, "wait-evidence");
  const collaboration = countTags(lines, "collaboration");
  let irfChains = 0;
  for (let index = 0; index < lines.length - 2; index += 1) {
    if (lines[index].speaker !== "teacher" || !lines[index].tags.includes("teacher-question")) continue;
    const responseIndex = lines.slice(index + 1, index + 4).findIndex((line) => line.speaker === "student");
    if (responseIndex < 0) continue;
    const absoluteResponse = index + 1 + responseIndex;
    const feedbackFound = lines.slice(absoluteResponse + 1, absoluteResponse + 4).some((line) => line.speaker === "teacher");
    if (feedbackFound) irfChains += 1;
  }
  return { openQuestions, closedQuestions, collectiveAnswers, individualAnswers, waitEvidence, collaboration, irfChains };
}

function getSelectedTheoryRules() {
  const selectedNames = $$("#theory-selector input:checked").map((input) => input.value);
  return theoryRules.filter((rule) => selectedNames.includes(rule.name));
}

function getTheoryRulesForSubject(subject, rules = getSelectedTheoryRules()) {
  const normalized = String(subject || "").trim();
  if (/数学/.test(normalized)) return rules;
  return rules.filter((rule) => !/数学学科|数学表征|变式教学/.test(`${rule.category || ""} ${rule.name || ""}`));
}

function analyzeTranscript({ silent = false } = {}) {
  const text = els.transcript.value.trim();
  if (!text) {
    toast("请先粘贴课堂逐字稿，或点击“载入示例课堂”。");
    return null;
  }

  const lines = tagLines(parseLines(text));
  const questions = countTags(lines, "teacher-question");
  const deep = countTags(lines, "deep-question");
  const answers = countTags(lines, "student-answer");
  const feedback = countTags(lines, "feedback");
  const studentQ = countTags(lines, "student-question");
  const structures = countDialogueStructures(lines);
  const selectedRules = getSelectedTheoryRules();
  const theoryMatches = matchTheories(text, lines, selectedRules);
  const events = buildEvents(lines, theoryMatches);
  const chains = buildAnalysisChains(events, lines, theoryMatches);
  const score = scoreLesson({ questions, deep, answers, feedback, studentQ, theoryMatches, structures });

  state.analysis = {
    lines,
    questions,
    deep,
    answers,
    feedback,
    studentQ,
    structures,
    theoryMatches,
    events,
    chains,
    score
  };

  renderAnalysis();
  state.report = buildReport();
  els.report.value = state.report;
  syncReflectionSources();
  updateLessonContext();
  updateTranscriptCount();
  if (!state.restoring) saveWorkspace(true);
  if (!silent && !state.restoring) toast("分析完成，已生成课堂观察报告。");
  return state.analysis;
}

function matchTheories(text, lines, rules = theoryRules) {
  return rules
    .map((rule) => {
      const hitKeys = rule.keys.filter((key) => text.includes(key));
      const evidence = lines
        .filter((line) => hasAny(line.content, rule.keys))
        .slice(0, 3)
        .map((line) => `${line.time} ${line.content}`);
      const mechanismHits = (rule.mechanisms || []).filter((key) => text.includes(key));
      const score = Math.min(98, Math.round((hitKeys.length / rule.keys.length) * 68 + evidence.length * 7 + mechanismHits.length * 5));
      return { ...rule, hitKeys, mechanismHits, evidence, score };
    })
    .filter((item) => item.hitKeys.length || item.evidence.length)
    .sort((a, b) => b.score - a.score);
}

function buildEvents(lines, matches) {
  const categories = [
    { title: "情境创设与问题引入", keys: ["游戏", "比赛", "生活", "土地", "数学王国", "情境", "不公平"] },
    { title: "学生自主探究与操作", keys: ["探究", "学具", "动手", "摆", "拼", "剪", "折", "摸", "移", "画"] },
    { title: "同伴协作与观点交流", keys: ["小组", "同桌", "合作", "交流", "讨论", "互相", "汇报", "补充"] },
    { title: "教师追问推动深层思考", keys: ["为什么", "依据", "理由", "怎么来的", "联系", "如果"] },
    { title: "规律归纳与结构发现", keys: ["观察", "发现", "规律", "归纳", "分类", "推理", "总结"] },
    { title: "表征转换与概念建构", keys: ["实物", "图", "算式", "公式", "字母", "符号", "转化"] },
    { title: "变式练习与方法迁移", keys: ["练习", "以后", "还能", "其他", "类似", "应用", "迁移", "验证"] },
    { title: "形成性反馈与认知修正", keys: ["很好", "关键", "纠正", "提醒", "有道理", "不同意", "疑惑"] }
  ];
  const events = categories
    .map((category) => {
      const evidenceLines = lines.filter((line) => hasAny(line.content, category.keys)).slice(0, 3);
      if (!evidenceLines.length) return null;
      const evidenceText = evidenceLines.map((line) => line.content).join(" ");
      const ranked = matches
        .map((match) => ({ ...match, eventHits: match.keys.filter((key) => evidenceText.includes(key)).length }))
        .filter((match) => match.eventHits > 0)
        .sort((a, b) => b.eventHits - a.eventHits || b.score - a.score);
      const mainTheory = ranked[0];
      const supportTheory = ranked.find((item) => item.name !== mainTheory?.name);
      return {
        title: category.title,
        time: evidenceLines[0].time,
        content: evidenceLines.map((line) => `${line.time} ${line.content}`).join("；"),
        evidenceLines,
        theory: mainTheory?.name || "证据不足",
        supportTheory: supportTheory?.name || "暂无辅助理论",
        matchScore: mainTheory ? Math.min(5, Math.max(1, Math.round((mainTheory.score + evidenceLines.length * 8) / 22))) : 0
      };
    })
    .filter(Boolean);
  return events.slice(0, 8);
}

function inferEventTitle(content) {
  if (content.includes("不公平")) return "认知冲突自然生成";
  if (content.includes("圆片") || content.includes("魔力板") || content.includes("移")) return "操作体验支撑概念建构";
  if (content.includes("为什么")) return "教师追问推动深层思考";
  if (content.includes("规律") || content.includes("发现")) return "数学规律归纳";
  if (content.includes("以后") || content.includes("还可以")) return "策略迁移提示";
  return "关键课堂行为";
}

function determineLanding(theory, evidenceCount, eventScore) {
  if (!theory || theory === "证据不足" || evidenceCount === 0) return { key: "insufficient", label: "证据不足" };
  const score = Number(eventScore || 0);
  if (score >= 5 && evidenceCount >= 3) return { key: "deep", label: "深度落地" };
  if (score >= 4 && evidenceCount >= 2) return { key: "sufficient", label: "较充分落地" };
  if (score >= 3 && evidenceCount >= 1) return { key: "partial", label: "部分落地" };
  return { key: "surface", label: "表层呈现" };
}

function behaviorForEvent(title) {
  if (title.includes("情境")) return "教师组织具有意义的问题情境，学生从真实矛盾或任务需要进入学习。";
  if (title.includes("操作")) return "教师提供操作材料或探究任务，学生通过动作、观察和表达形成关系认识。";
  if (title.includes("协作")) return "学生在同伴交流中公开想法、比较路径并形成共同结论。";
  if (title.includes("追问")) return "教师用理由、依据和假设类问题推动学生显化思维过程。";
  if (title.includes("规律")) return "学生通过比较案例、寻找联系和归纳规律形成知识结构。";
  if (title.includes("表征")) return "课堂组织实物、图形、语言与符号之间的转换。";
  if (title.includes("迁移")) return "教师安排变式或新情境，检验学生能否迁移方法。";
  return "教师通过即时反馈帮助学生确认有效思路并修正认识。";
}

function mechanismForEvent(title) {
  if (title.includes("情境")) return "激活已有经验并制造学习需要，使新知识成为解决问题的工具。";
  if (title.includes("操作")) return "把抽象关系外显为可观察、可操作的对象，再经语言和符号内化。";
  if (title.includes("协作")) return "通过语言外化和社会协商，让个体思路在同伴回应中被澄清。";
  if (title.includes("追问")) return "通过认知监控与理由解释，把结果性回答推进为关系性理解。";
  if (title.includes("规律")) return "通过比较、抽象和概括，识别多个实例背后的不变结构。";
  if (title.includes("表征")) return "建立动作、图形、语言和符号的对应，支持概念表征网络形成。";
  if (title.includes("迁移")) return "改变任务表面条件，检验学生能否识别并调用核心结构。";
  return "用反馈信息缩小当前表现与学习目标之间的差距。";
}

function buildAnalysisChains(events, lines, matches) {
  return events.map((event) => {
    const theory = matches.find((item) => item.name === event.theory);
    const landing = determineLanding(theory, event.evidenceLines.length, event.matchScore);
    return {
      ...event,
      fact: event.content,
      behavior: behaviorForEvent(event.title),
      mechanism: mechanismForEvent(event.title),
      theoryName: theory?.name || "证据不足",
      theoryCategory: theory?.category || "逐字稿不足以支持理论判断",
      landing,
      evidenceStrength: event.evidenceLines.length >= 3 ? "强" : event.evidenceLines.length === 2 ? "中" : "弱",
      advantage: theory ? `${theory.name}的核心机制已经在该课堂事件中出现。` : "当前只能确认课堂行为，尚不能可靠进行理论归因。",
      gap: theory?.gap || "需要补充更完整的师生对话、操作过程或时间证据。",
      improvement: theory?.improvement || "补充课堂证据后再生成有依据的教学改进建议。",
      teacherTalk: theory?.teacherTalk || "请补充该环节的完整逐字稿，再生成教师优化话术。"
    };
  });
}

function scoreLesson(data) {
  const participation = Math.min(25, data.answers * 1.4);
  const questionQuality = Math.min(25, data.questions * 0.9 + data.deep * 1.8);
  const feedbackQuality = Math.min(20, data.feedback * 3);
  const theory = Math.min(20, data.theoryMatches.length * 3.2);
  const studentAgency = Math.min(10, data.studentQ * 4 + data.structures.collaboration * 0.7);
  const score100 = participation + questionQuality + feedbackQuality + theory + studentAgency;
  return Math.max(5.8, Math.min(9.6, score100 / 10)).toFixed(1);
}

function getInteractionSeries(lines, bucketCount = 12) {
  const teacher = Array.from({ length: bucketCount }, () => 0);
  const student = Array.from({ length: bucketCount }, () => 0);
  lines.forEach((line, index) => {
    const bucket = Math.min(bucketCount - 1, Math.floor((index / Math.max(lines.length, 1)) * bucketCount));
    if (line.speaker === "teacher") teacher[bucket] += 1 + line.tags.length * 0.18;
    if (line.speaker === "student") student[bucket] += 1 + line.tags.length * 0.14;
  });
  return { teacher, student };
}

function createChartPath(values, maxValue, width = 540, height = 126) {
  const left = 10;
  const top = 12;
  const bottom = top + height;
  const step = width / Math.max(1, values.length - 1);
  const points = values.map((value, index) => ({
    x: left + index * step,
    y: bottom - (value / Math.max(1, maxValue)) * height
  }));
  const line = points.map((point, index) => `${index ? "L" : "M"}${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ");
  const area = `${line} L${points.at(-1).x.toFixed(1)},${bottom} L${points[0].x.toFixed(1)},${bottom} Z`;
  return { line, area, points };
}

function animateNumericValue(element, value, decimals = 0, suffix = "") {
  if (!element) return;
  const target = Number(value) || 0;
  if (prefersReducedMotion()) {
    element.textContent = `${target.toFixed(decimals)}${suffix}`;
    return;
  }
  const current = Number.parseFloat(element.textContent) || 0;
  const start = performance.now();
  const duration = 620;
  const tick = (now) => {
    const progress = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = `${(current + (target - current) * eased).toFixed(decimals)}${suffix}`;
    if (progress < 1) window.requestAnimationFrame(tick);
  };
  window.requestAnimationFrame(tick);
}

function animateChartLines() {
  const svg = $("#interaction-line-chart");
  if (!svg || prefersReducedMotion()) return;
  svg.querySelectorAll(".chart-line").forEach((path, index) => {
    const length = path.getTotalLength();
    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = `${length}`;
    path.animate([{ strokeDashoffset: length }, { strokeDashoffset: 0 }], {
      duration: 800,
      delay: index * 100,
      easing: "cubic-bezier(.22,.72,.2,1)",
      fill: "forwards"
    });
  });
}

function renderInteractionTrend(period = state.trendPeriod) {
  const data = state.analysis;
  if (!data) return;
  state.trendPeriod = period;
  const allLines = data.lines;
  const midpoint = Math.ceil(allLines.length / 2);
  const lines = period === "first" ? allLines.slice(0, midpoint) : period === "last" ? allLines.slice(midpoint) : allLines;
  const { teacher, student } = getInteractionSeries(lines);
  const maxValue = Math.max(2, ...teacher, ...student);
  const teacherPath = createChartPath(teacher, maxValue);
  const studentPath = createChartPath(student, maxValue);
  const gridLines = [12, 54, 96, 138].map((y) => `<line x1="10" y1="${y}" x2="550" y2="${y}" />`).join("");
  const teacherDots = teacherPath.points.map((point) => `<circle cx="${point.x}" cy="${point.y}" r="2.8" />`).join("");
  const studentDots = studentPath.points.map((point) => `<circle cx="${point.x}" cy="${point.y}" r="2.8" />`).join("");
  const chartMarkup = (prefix) => `
    <defs>
      <linearGradient id="${prefix}-teacher-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#77738d" stop-opacity=".22"/><stop offset="1" stop-color="#77738d" stop-opacity="0"/></linearGradient>
      <linearGradient id="${prefix}-student-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ee7da8" stop-opacity=".18"/><stop offset="1" stop-color="#ee7da8" stop-opacity="0"/></linearGradient>
    </defs>
    <g class="chart-grid">${gridLines}</g>
    <path class="chart-area teacher-area" fill="url(#${prefix}-teacher-area)" d="${teacherPath.area}" />
    <path class="chart-area student-area" fill="url(#${prefix}-student-area)" d="${studentPath.area}" />
    <path class="chart-line chart-teacher" d="${teacherPath.line}" />
    <path class="chart-line chart-student" d="${studentPath.line}" />
    <g class="chart-dots teacher-dots">${teacherDots}</g>
    <g class="chart-dots student-dots">${studentDots}</g>`;
  const charts = [[$("#interaction-line-chart"), "interaction"], [$("#overview-interaction-chart"), "overview"]];
  charts.forEach(([chart, prefix]) => {
    if (chart) chart.innerHTML = chartMarkup(prefix);
  });
  window.requestAnimationFrame(animateChartLines);

  const teacherCount = lines.filter((line) => line.speaker === "teacher").length;
  const studentCount = lines.filter((line) => line.speaker === "student").length;
  const periodName = period === "first" ? "课堂前段" : period === "last" ? "课堂后段" : "全课";
  $("#trend-total").textContent = `${lines.length} 条`;
  $("#trend-caption").textContent = `${periodName}逐字稿互动分布`;
  $("#trend-insight").textContent = studentCount >= teacherCount ? "学生话语参与较活跃" : `师生话语比 ${teacherCount}:${studentCount}`;
  $("#overview-pulse-total")?.replaceChildren(document.createTextNode(String(lines.length)));
  $("#overview-pulse-caption")?.replaceChildren(document.createTextNode(`${periodName}逐字稿互动分布`));
  $("#overview-pulse-insight")?.replaceChildren(document.createTextNode(studentCount >= teacherCount ? "学生话语参与较活跃" : `师生话语比 ${(teacherCount / Math.max(1, studentCount)).toFixed(1)}:1`));
  $$(".chart-periods button").forEach((button) => button.classList.toggle("active", button.dataset.period === period));
}

function getFocusItems(data) {
  const items = [];
  const openRatio = data.questions ? data.structures.openQuestions / data.questions : 0;
  if (data.studentQ === 0) items.push({ icon: "message-square-plus", level: "high", label: "优先", title: "释放学生发问权", desc: "逐字稿尚未记录学生主动提问。", target: "analysis-chain-panel" });
  if (openRatio < 0.36) items.push({ icon: "circle-help", level: "medium", label: "关注", title: "提高开放问题比例", desc: `当前开放性提问占比 ${Math.round(openRatio * 100)}%。`, target: "material-panel" });
  if (data.structures.waitEvidence === 0) items.push({ icon: "timer", level: "medium", label: "补证", title: "记录真实等待时间", desc: "文本中暂无明确停顿或等待证据。", target: "material-panel" });
  if (data.structures.collaboration === 0) items.push({ icon: "users-round", level: "medium", label: "设计", title: "增加同伴观点比较", desc: "未发现稳定的合作交流证据。", target: "analysis-chain-panel" });
  if (data.feedback >= Math.max(1, data.deep)) items.push({ icon: "badge-check", level: "good", label: "保持", title: "反馈链条较完整", desc: `已识别 ${data.feedback} 次反馈和 ${data.structures.irfChains} 个 IRF 链。`, target: "theory-panel" });
  if (data.theoryMatches.length >= 4) items.push({ icon: "library-big", level: "good", label: "优势", title: "理论证据覆盖充分", desc: `当前命中 ${data.theoryMatches.length} 类理论解释框架。`, target: "theory-panel" });
  return items.slice(0, 3);
}

function renderOverviewModules() {
  const data = state.analysis;
  if (!data) return;
  renderInteractionTrend();
  const teacherCount = data.lines.filter((line) => line.speaker === "teacher").length;
  const studentCount = data.lines.filter((line) => line.speaker === "student").length;
  const participation = Math.round((studentCount / Math.max(1, teacherCount + studentCount)) * 100);
  const feedbackSignals = data.deep + data.feedback;
  const confidence = Math.min(98, 60 + data.theoryMatches.length * 3 + data.chains.length * 2 + Math.min(10, Math.round(data.lines.length / 8)));
  $("#signal-theory").textContent = `${data.theoryMatches.length} 类`;
  $("#signal-theory-note").textContent = data.theoryMatches[0]?.name || "尚未匹配";
  $("#signal-participation").textContent = `${participation}%`;
  $("#signal-participation-note").textContent = `学生话语 ${studentCount} 条`;
  $("#signal-feedback").textContent = `${feedbackSignals} 次`;
  $("#signal-feedback-note").textContent = `高阶追问 ${data.deep} 次`;
  $("#signal-chains").textContent = `${data.chains.length} 条`;
  $("#signal-chain-note").textContent = data.chains.length ? "六层链已建立" : "待建立";
  $("#signal-confidence").textContent = `${confidence}%`;
  $("#focus-list").innerHTML = getFocusItems(data).map((item, index) => `<button class="focus-item" type="button" data-focus-target="${item.target}">
    <span class="focus-index">${String(index + 1).padStart(2, "0")}</span>
    <span class="focus-icon ${item.level}"><i data-lucide="${item.icon}"></i></span>
    <span class="focus-copy"><b>${item.title}</b><small>${item.desc}</small></span>
    <em class="focus-level ${item.level}">${item.label}</em>
  </button>`).join("");
}

const observationOverviewFilters = { stage: "小学", subject: "all" };
const observationCaseCatalogue = Array.isArray(window.OBSERVATION_CASE_DATA?.cases)
  ? window.OBSERVATION_CASE_DATA.cases
  : [];
const OBSERVATION_CASE_INITIAL_COUNT = 4;
const OBSERVATION_RECENT_INITIAL_COUNT = 4;
const OBSERVATION_RECENT_KEYS = Object.freeze([
  "chinese-hanhaoniao",
  "math-solid-shapes",
  "english-my-classroom",
  "science-daily-food",
  "chinese-langyashan",
  "math-multiplication-1-6",
  "english-what-time",
  "science-seed-germination"
]);
let observationCasesExpanded = false;
let observationRecentExpanded = false;

function observationSubjectIcon(subject) {
  return ({ 语文: "book-open-text", 数学: "sigma", 英语: "languages", 科学: "sprout" })[subject] || "book-open";
}

function observationCaseCardMarkup(item, index) {
  const deferred = index >= OBSERVATION_CASE_INITIAL_COUNT;
  const title = item.display_title || `《${item.title || "课堂案例"}》`;
  return `<article class="observe-case-card${deferred ? " observe-case-card-deferred" : ""}" data-stage="${escapeHtml(item.stage || "小学")}" data-subject="${escapeHtml(item.subject || "")}" data-observe-case-key="${escapeHtml(item.key || "")}"${deferred ? " hidden" : ""}><div class="observe-case-cover"><img src="${escapeHtml(item.image || "")}" alt="${escapeHtml(title)}教材内容截图" loading="lazy" decoding="async" /><span>小学</span><span>${escapeHtml(item.subject || "")}</span><i data-lucide="${observationSubjectIcon(item.subject)}"></i></div><div class="observe-case-copy"><b>${escapeHtml(title)}</b><small>${escapeHtml(item.grade || "小学")} · ${escapeHtml(item.duration || "40 分钟")}课堂实录</small><span><em><i data-lucide="messages-square"></i>师生互动 <strong data-observe-case-metric="interactions">--</strong> 条</em><em><i data-lucide="git-branch"></i>理论证据 <strong data-observe-case-metric="evidence">--</strong> 条</em></span><button type="button" data-observe-load-case="${escapeHtml(item.key || "")}">查看分析 <i data-lucide="arrow-right"></i></button></div></article>`;
}

function observationRecentMarkup(item, index) {
  const deferred = index >= OBSERVATION_RECENT_INITIAL_COUNT;
  const confidence = Math.max(88, 98 - index);
  const title = item.display_title || `《${item.title || "课堂案例"}》`;
  return `<button type="button" class="observe-recent-item${deferred ? " observe-recent-item-deferred" : ""}" data-observe-load-case="${escapeHtml(item.key || "")}"${deferred ? " hidden" : ""}><span class="recent-cover"><img src="${escapeHtml(item.image || "")}" alt="${escapeHtml(title)}教材内容截图" loading="lazy" decoding="async" /></span><span><em>小学 · ${escapeHtml(item.subject || "")}</em><b>${escapeHtml(title)}</b><small>${escapeHtml(item.duration || "40 分钟")} · 分析完成 <strong>${confidence}%</strong></small></span><i data-lucide="chevron-right"></i></button>`;
}

function renderObservationCaseCatalogue() {
  const grid = $("#observe-case-grid");
  const recent = $("#observe-recent-list");
  if (!grid || !recent || !observationCaseCatalogue.length) return;
  grid.innerHTML = observationCaseCatalogue.map(observationCaseCardMarkup).join("");
  const byKey = new Map(observationCaseCatalogue.map((item) => [item.key, item]));
  const recentCases = OBSERVATION_RECENT_KEYS.map((key) => byKey.get(key)).filter(Boolean);
  recent.innerHTML = recentCases.map(observationRecentMarkup).join("");
  applyObservationOverviewFilters();
  updateObservationRecentExpansion();
  updateObservationCaseMetrics();
  refreshIcons();
}

function updateObservationCaseExpansion() {
  const cards = [...document.querySelectorAll("#observe-case-grid .observe-case-card")];
  let matchingIndex = 0;
  let matchingCount = 0;
  cards.forEach((card) => {
    const stageMatch = observationOverviewFilters.stage === "all" || card.dataset.stage === observationOverviewFilters.stage;
    const subjectMatch = observationOverviewFilters.subject === "all" || card.dataset.subject === observationOverviewFilters.subject;
    const matches = stageMatch && subjectMatch;
    if (matches) matchingCount += 1;
    card.hidden = !matches || (!observationCasesExpanded && matchingIndex >= OBSERVATION_CASE_INITIAL_COUNT);
    if (matches) matchingIndex += 1;
  });
  const more = $('[data-observe-case-more]');
  if (more) {
    const canExpand = matchingCount > OBSERVATION_CASE_INITIAL_COUNT;
    more.hidden = !canExpand;
    more.setAttribute("aria-expanded", String(observationCasesExpanded));
    const label = more.querySelector("span");
    if (label) label.textContent = observationCasesExpanded ? "收起案例" : "查看更多案例";
  }
}

function updateObservationRecentExpansion() {
  const items = [...document.querySelectorAll("#observe-recent-list .observe-recent-item")];
  items.forEach((item, index) => { item.hidden = !observationRecentExpanded && index >= OBSERVATION_RECENT_INITIAL_COUNT; });
  const more = $('[data-observe-recent-more]');
  if (more) {
    more.hidden = items.length <= OBSERVATION_RECENT_INITIAL_COUNT;
    more.setAttribute("aria-expanded", String(observationRecentExpanded));
    const label = more.querySelector("span");
    if (label) label.textContent = observationRecentExpanded ? "收起" : "查看更多";
  }
}

function applyObservationOverviewFilters() {
  const grid = $("#observe-case-grid");
  if (!grid) return;
  updateObservationCaseExpansion();
  $$('[data-observe-filter]').forEach((button) => {
    const active = observationOverviewFilters[button.dataset.observeFilter] === button.dataset.value;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function focusObservationDecoderTarget(targetSection = "observe-coding") {
  const section = OBSERVATION_DECODER_SECTIONS.includes(targetSection) ? targetSection : "observe-coding";
  if (state.currentView !== "observe") setView("observe");
  const target = document.querySelector(`[data-workspace-panel="${section}"]`);
  if (state.currentSection !== "observe-decoder" && canonicalWorkspaceSection(state.currentSection) !== "observe-decoder") {
    setWorkspaceSection("observe-decoder", { keepScroll: true });
  }
  $$('[data-observe-decoder-target]').forEach((button) => button.classList.toggle("active", button.dataset.observeDecoderTarget === section));
  window.setTimeout(() => target?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" }), 90);
}

const LEGACY_OBSERVATION_CASE_LIBRARY = Object.freeze({
  horse: {
    title: "人教版二年级上册《小马过河》", subject: "小学语文", grade: "二年级", duration: "约 40 分钟",
    transcript: `00:01:10 师：小马要把半袋麦子送到磨坊，途中遇到一条小河。你觉得它能不能过河？
00:02:05 生1：我觉得能，因为小马已经长大了。
00:02:40 生2：我觉得不能，河水看起来很深。
00:04:12 师：同一条河，老牛和松鼠为什么会有不同的判断？请圈出课文里的依据。
00:06:08 生3：老牛个子高，河水只到膝盖；松鼠个子小，水会没过头顶。
00:08:30 师：小马听了两种意见就回家问妈妈，这样做说明它遇到了什么问题？
00:10:15 生4：它没有亲自试过，只听别人说，所以不知道自己的情况。
00:12:40 师：如果你是小马，过河前还要做哪些准备？和同桌说一说。
00:15:20 生5：先观察水流和深浅，再慢慢试探，遇到危险就退回来。
00:18:05 师：请用“因为……所以……”完整复述小马最后的决定，并说明你的证据。
00:21:30 生6：因为小马比老牛矮、比松鼠高，所以河水既没有没过头，也没有只到膝盖，它试着走过去了。`
  },
  nine: {
    title: "人教版一年级上册《9 加几》", subject: "小学数学", grade: "一年级", duration: "约 40 分钟",
    transcript: sampleTranscript
  },
  zoo: {
    title: "人教版三年级上册 Unit 3 At the zoo", subject: "小学英语", grade: "三年级", duration: "约 38 分钟",
    transcript: `00:01:15 师：Look at the picture. What animals can you see at the zoo? 请先观察图片，再说一说你的发现。
00:02:00 生1：I can see a giraffe and an elephant.
00:03:10 师：How tall is the giraffe? Use the picture and the word bank to make a sentence，并指出图片依据。
00:04:05 生2：It is tall and thin.
00:05:30 师：Listen to the two descriptions. 比较两种表达，Which one gives evidence from the picture? 为什么？
00:07:12 生3：The giraffe has a long neck, so it is tall. The elephant has a short tail.
00:09:40 师：Work in pairs，同桌合作。One student describes an animal and the other guesses it. Ask one follow-up question，并补充同伴的表达。
00:12:18 生4：Is it big? Does it have a long nose?
00:14:55 师：Please improve your sentence by adding a colour, a body part and a reason. 请根据同伴反馈修改答案。
00:17:20 生5：The elephant is big and grey. It has big ears, so it can keep cool.
00:20:08 师：Which words helped you understand the animal, and how did your partner's question help you revise? 请回顾合作过程和修改理由。`
  },
  sound: {
    title: "人教版四年级上册《声音是怎样产生的》", subject: "小学科学", grade: "四年级", duration: "约 42 分钟",
    transcript: `00:01:05 师：拨动尺子、敲击鼓面和拉动橡皮筋，观察并记录它们有什么共同变化。
00:02:30 生1：它们都在动，有的动得快，有的动得慢。
00:04:15 师：如果把手按住正在发声的鼓面，声音会怎样？先猜想，再设计验证方法。
00:06:42 生2：声音会变小，因为鼓面不能继续振动了。
00:08:10 师：小组选择一种材料，分工完成“发声—停止发声—再次发声”的实验记录。
00:11:25 生3：我们用橡皮筋，松开时能听到声音，按住中间后声音马上变小。
00:14:50 师：你们的证据能说明声音是由什么产生的吗？请用完整句子解释。
00:17:05 生4：声音是由物体振动产生的，停止振动，声音也会停止。
00:20:40 师：换一种材料还能得到同样的结论吗？请指出实验中需要保持不变的条件。
00:24:18 生5：可以换成尺子或鼓面，但要保持敲击力度和观察时间大致相同。`
  }
});

const OBSERVATION_CASE_LIBRARY = Object.freeze({
  ...LEGACY_OBSERVATION_CASE_LIBRARY,
  ...Object.fromEntries(observationCaseCatalogue.map((item, index) => {
    const title = item.display_title || `《${item.title || "课堂案例"}》`;
    const subject = `小学${item.subject || ""}`;
    const subjectTemplates = {
      小学语文: [
        `00:01:10 师：请先观察${title}教材画面，说说你看到了哪些人物、事物或关键信息。`,
        `00:02:35 生1：我注意到画面中的主要对象，也发现标题提示了本课要学习的内容。`,
        `00:04:20 师：请朗读或回看教材中的关键语句，找出能够支持你判断的词句。`,
        `00:06:15 生2：我找到了一处关键表达，它能说明人物、事物或情节发生了怎样的变化。`,
        `00:08:40 师：同桌交流两种理解的异同，并说明哪一种更符合文本证据。`,
        `00:11:05 生3：我们根据具体词句修正了原来的判断，也补充了理由。`,
        `00:14:20 师：请用完整的话概括${title}的主要内容，并说出你的依据。`,
        `00:17:10 生4：我能按照教材内容有顺序地概括，并用关键词句解释自己的观点。`
      ],
      小学数学: [
        `00:01:05 师：观察${title}中的教材情境，你能找到哪些数学信息？`,
        `00:02:30 生1：我看到了图形、数量或变化关系，可以先把已知信息整理出来。`,
        `00:04:10 师：请用学具、图示或算式表示你的想法，并说明每一步表示什么。`,
        `00:06:20 生2：我先用直观材料表示，再把操作过程写成数学表达。`,
        `00:08:35 师：比较两种方法，它们相同的依据是什么，哪里更简洁？`,
        `00:11:00 生3：两种方法都利用了题目中的数量或空间关系，但表达路径不同。`,
        `00:14:15 师：换一组数据或图形，刚才的方法是否仍然适用？请说明理由。`,
        `00:17:05 生4：我能迁移方法，并用计算、图示或操作结果检验。`
      ],
      小学英语: [
        `00:01:10 师：Look at ${title}. What can you see in the picture?`,
        `00:02:25 生1：I can see the people, objects and the main classroom situation.`,
        `00:04:15 师：Listen and point to the details that support your answer. Then make a complete sentence.`,
        `00:06:10 生2：I can use the target words and a complete sentence to describe the picture.`,
        `00:08:30 师：Work in pairs. Ask one question and respond with evidence from the material.`,
        `00:10:55 生3：We can ask and answer, then improve the sentence with more details.`,
        `00:13:40 师：Use the language in a new situation and explain what changed.`,
        `00:16:20 生4：I can transfer the sentence pattern and speak more clearly in context.`
      ],
      小学科学: [
        `00:01:05 师：观察${title}的教材材料，先提出一个可以通过观察或实验研究的问题。`,
        `00:02:40 生1：我提出了一个和现象有关的问题，并说明了自己的初步猜想。`,
        `00:04:20 师：小组讨论需要记录哪些证据，哪些条件要保持一致。`,
        `00:06:15 生2：我们确定了观察指标，也准备比较不同条件下的结果。`,
        `00:08:35 师：请报告观察结果，不只说结论，还要指出具体证据。`,
        `00:11:10 生3：我们的记录显示现象发生了变化，这些数据或特征支持当前判断。`,
        `00:14:00 师：有没有反例或不同结果？结论的适用范围是什么？`,
        `00:16:45 生4：我们需要继续验证，并把证据不足的部分保留为待研究问题。`
      ]
    };
    const transcript = (subjectTemplates[subject] || subjectTemplates.小学语文).join("\n");
    return [item.key, {
      title: title,
      subject,
      grade: item.grade || "小学",
      duration: `约 ${String(item.duration || "40 分钟").replace(/^约\s*/, "")}`,
      image: item.image || "",
      sourceImage: item.source_image || "",
      transcript,
      catalogueIndex: index
    }];
  }))
});

function buildObservationCaseAnalysis(caseKey) {
  const item = OBSERVATION_CASE_LIBRARY[caseKey];
  if (!item?.transcript) return null;
  return buildLocalObservationAnalysis(item.transcript, getTheoryRulesForSubject(item.subject));
}

function updateObservationCaseMetrics() {
  $$('[data-observe-case-key]').forEach((card) => {
    const analysis = buildObservationCaseAnalysis(card.dataset.observeCaseKey);
    if (!analysis) return;
    const interactions = analysis.lines.filter((line) => line.speaker === "teacher" || line.speaker === "student").length;
    const evidence = analysis.theoryMatches.length;
    const interactionNode = card.querySelector('[data-observe-case-metric="interactions"]');
    const evidenceNode = card.querySelector('[data-observe-case-metric="evidence"]');
    if (interactionNode) interactionNode.textContent = String(interactions);
    if (evidenceNode) evidenceNode.textContent = String(evidence);
    card.dataset.observationInteractions = String(interactions);
    card.dataset.observationEvidence = String(evidence);
  });
}

function loadObservationCase(caseKey) {
  const item = OBSERVATION_CASE_LIBRARY[caseKey];
  if (!item) return;
  els.lessonTitle.value = item.title;
  els.subject.value = item.subject;
  els.grade.value = item.grade;
  els.duration.value = item.duration;
  if (item.transcript) {
    els.transcript.value = item.transcript;
    setObservationSource(`case:${caseKey}`, { invalidate: true });
    state.observationAnalyzedTranscript = "";
    const refinement = $("#transcript-refinement");
    if (refinement) {
      refinement.hidden = true;
      refinement.textContent = "";
    }
    renderObservationExtras(null);
    analyzeTranscriptLocal({ silent: true });
    state.observationAnalyzedTranscript = els.transcript.value.trim();
  }
  updateLessonContext();
  scheduleWorkspaceSave();
  setWorkspaceSection("observe-decoder", { keepScroll: false });
  toast(`已载入并完成案例分析：${item.title}`);
}

function reflectionSourceText() {
  return $("#reflection-source")?.value.trim() || "";
}

function reflectionEvidenceSentence(source, pattern, fallback) {
  const sentences = source.split(/(?<=[。！？；\n])/).map((item) => item.trim()).filter(Boolean);
  return sentences.find((sentence) => pattern.test(sentence)) || fallback;
}

function buildReflectionDiagnoses(source) {
  const candidates = [
    {
      id: "pace",
      category: "课堂节奏",
      title: "核心探究与后续应用的时间配置失衡",
      pattern: /时间|耗时|压缩|前松后紧|节奏|来不及/,
      fallback: "探究环节耗时较长，导致后续练习或迁移任务时间被压缩。",
      theory: "教学过程最优化理论",
      priority: "高",
      status: "持续存在",
      interpretation: "课堂资源尚未完全围绕核心目标形成清晰优先级，重复汇报挤占了概念深化与迁移时间。",
      action: "为独立思考、小组讨论、代表汇报和教师归纳设置可见时间节点，只保留能够呈现差异观点的汇报。",
      indicator: "核心探究按计划完成；概念深化与迁移任务均获得完整实施时间。"
    },
    {
      id: "depth",
      category: "概念理解",
      title: "追问尚未充分推动概念本质的重构",
      pattern: /追问|误区|理解不够|不深入|代表性|虚拟性|敏感性/,
      fallback: "学生能够完成基本操作，但对概念本质及其适用边界的解释仍不充分。",
      theory: "认知冲突教学理论",
      priority: "高",
      status: "持续存在",
      interpretation: "课堂已经产生认知冲突，但缺少反例、比较和连续证据，部分学生仍停留在直觉判断。",
      action: "加入极端数据和反例，连续追问“能否代表、为什么、数据变化后怎样”，让学生用证据修正原有认识。",
      indicator: "学生能解释概念的核心含义、反例与适用边界，而不只是复述计算方法。"
    },
    {
      id: "participation",
      category: "学习机会",
      title: "课堂表达和展示机会仍集中于少数学生",
      pattern: /参与|内向|基础薄弱|学困|少数|展示机会|表达能力强/,
      fallback: "小组合作与全班汇报中，表达能力较强的学生承担了更多发言。",
      theory: "差异化教学理论",
      priority: "高",
      status: "持续存在",
      interpretation: "统一任务与自愿举手机制没有充分回应学生准备度和表达方式差异，学习机会分布不均。",
      action: "采用先写后说、分层问题和小组角色轮换，为不同基础学生配置可完成、可表达、可被看见的任务。",
      indicator: "不同层次学生均有可识别产出；同一学生不连续垄断汇报角色。"
    },
    {
      id: "authenticity",
      category: "知识迁移",
      title: "生活联结尚未转化为真实的数据决策",
      pattern: /生活|举例|真实|应用|联结|决策/,
      fallback: "生活应用主要停留在教师举例和素材展示，学生缺少亲自决策的过程。",
      theory: "RME现实数学教育",
      priority: "中",
      status: "新改进点",
      interpretation: "情境发挥了导入和说明作用，但学生尚未完整经历从现实问题到数学判断的过程。",
      action: "设计真实数据任务，让学生经历收集、比较、计算、解释和决策，并讨论统计量可能掩盖的信息。",
      indicator: "学生能使用数据支持真实判断，并说明结论的依据与局限。"
    },
    {
      id: "feedback",
      category: "评价反馈",
      title: "改进效果还缺少可持续验证的课堂证据",
      pattern: /评价|反馈|证据|效果|观察|判断/,
      fallback: "反思提出了改进方向，但尚未为下一轮实践配置明确观察指标。",
      theory: "形成性评价理论",
      priority: "中",
      status: "证据待补",
      interpretation: "改进建议只有转化为可观察指标，才能在下一轮课堂中判断策略是否真正有效。",
      action: "为每项策略设置学生行为、作品或互动数据指标，并在课后对照上一轮证据判断变化。",
      indicator: "每项行动至少对应一条学生学习证据和一个可判断的达成标准。"
    }
  ];
  const matched = candidates.filter((item) => item.pattern.test(source));
  const selected = matched.length >= 4 ? matched : candidates.slice(0, 4);
  return selected.map((item, index) => ({
    ...item,
    rank: index + 1,
    evidence: reflectionEvidenceSentence(source, item.pattern, item.fallback),
    confidence: Math.max(78, 95 - index * 4)
  }));
}

function renderReflectionDiagnosis() {
  const diagnoses = reflectionState.diagnoses;
  const source = reflectionSourceText();
  const strengths = [
    /情境|游戏|真实/.test(source) ? "情境创设" : "目标聚焦",
    /操作|动手|小组|探究/.test(source) ? "探究学习" : "过程复盘",
    /概念|本质|意义/.test(source) ? "概念本质" : "问题意识"
  ];
  const stats = [
    ["教学亮点", strengths.length, "sparkles", "good"],
    ["核心问题", diagnoses.length, "scan-search", "high"],
    ["高优先级", diagnoses.filter((item) => item.priority === "高").length, "badge-alert", "medium"],
    ["待补证据", diagnoses.filter((item) => /待补|缺证|未提供/.test(String(item.status || ""))).length, "file-question", "neutral"]
  ];
  $("#reflection-diagnostic-stats").innerHTML = stats.map(([label, value, icon, tone]) => `<article class="diagnosis-stat ${tone}"><i data-lucide="${icon}"></i><span><b>${value}</b><small>${label}</small></span></article>`).join("");
  $("#reflection-diagnosis-list").innerHTML = diagnoses.map((item) => `<article class="diagnosis-item" data-diagnosis-id="${item.id}">
    <span class="diagnosis-rank">${String(item.rank).padStart(2, "0")}</span>
    <div><div class="diagnosis-item-head"><b>${escapeHtml(item.title)}</b><em class="priority-${item.priority === "高" ? "high" : "medium"}">${escapeHtml(item.priority)}优先级</em></div><p>${escapeHtml(item.professional_judgment || item.interpretation || item.title)}</p><small><i data-lucide="quote"></i>${escapeHtml(item.evidence)}</small></div>
    <button class="icon-button subtle" type="button" data-workspace-section="reflect-theory" title="查看理论解释"><i data-lucide="arrow-up-right"></i></button>
  </article>`).join("");
  $("#reflection-evidence-matrix").innerHTML = `<div class="matrix-row matrix-head"><span>课堂事实</span><span>专业判断</span><span>状态</span></div>${diagnoses.map((item) => `<button class="matrix-row" type="button" data-reflection-theory-name="${escapeHtml(item.theory)}"><span>${escapeHtml(item.evidence)}</span><span>${escapeHtml(item.professional_judgment || item.interpretation || item.title)}</span><em>${escapeHtml(item.status)}</em></button>`).join("")}`;
}

function reflectionTheoryProfile(name) {
  return reflectionTheoryCatalog.find((item) => item.name === name) || reflectionTheoryCatalog[0];
}

function renderReflectionTheoryDetail(name = reflectionState.activeTheory) {
  const profile = reflectionTheoryProfile(name);
  const related = reflectionState.diagnoses.filter((item) => item.theory === profile.name);
  reflectionState.activeTheory = profile.name;
  $("#reflection-theory-detail").innerHTML = `<div class="theory-detail-top"><span><i data-lucide="book-open-check"></i></span><small>${profile.group}</small><h3>${profile.name}</h3><p>${profile.core}</p></div>
    <dl><div><dt>解释机制</dt><dd>${profile.mechanism}</dd></div><div><dt>对应问题</dt><dd>${related.map((item) => item.title).join("；") || "可作为辅助解释框架"}</dd></div><div><dt>行动转化</dt><dd>${profile.action}</dd></div></dl>`;
  $$(".reflection-theory-option").forEach((option) => option.classList.toggle("is-focused", option.dataset.reflectionTheoryName === profile.name));
}

function renderReflectionTheories() {
  const recommended = reflectionTheoryCatalog.slice(0, 6);
  $("#reflection-theory-list").innerHTML = recommended.map((profile, index) => {
    const selected = reflectionState.selectedTheories.includes(profile.name);
    const score = Math.max(76, profile.score - (reflectionState.diagnoses.some((item) => item.theory === profile.name) ? 0 : 5));
    return `<button class="reflection-theory-option ${selected ? "selected" : ""}" type="button" data-reflection-theory-name="${profile.name}" aria-pressed="${selected}">
      <span class="theory-option-index">${String(index + 1).padStart(2, "0")}</span><span class="theory-option-copy"><b>${profile.name}</b><small>${profile.group} · ${profile.mechanism}</small><i><em style="width:${score}%"></em></i></span><strong>${score}%</strong><span class="theory-check"><i data-lucide="check"></i></span>
    </button>`;
  }).join("");
  $("#reflection-mapping-table").innerHTML = `<div class="mapping-row mapping-row-head"><span>课堂问题</span><span>理论解释</span><span>下一步改进</span><span>匹配度</span></div>${reflectionState.diagnoses.map((item) => {
    const profile = reflectionTheoryProfile(item.theory);
    return `<button class="mapping-row" type="button" data-reflection-theory-name="${profile.name}"><span><b>${item.category}</b>${item.title}</span><span>${profile.mechanism}</span><span>${item.action}</span><strong>${item.confidence}%</strong></button>`;
  }).join("")}`;
  renderReflectionTheoryDetail();
}

function renderReflectionActions() {
  reflectionState.actions = reflectionState.diagnoses.map((item, index) => ({
    id: item.id,
    index: index + 1,
    title: item.action.split(/[，。；]/)[0],
    issue: item.title,
    theory: item.theory,
    action: item.action,
    talk: item.id === "pace" ? "接下来先独立思考两分钟，小组只汇报不同的方法和理由。" : item.id === "depth" ? "如果数据中出现一个极端值，你的结论还成立吗？请用证据说明。" : item.id === "participation" ? "每个人先写下一句话，再由解释员复述组内不同观点。" : item.id === "authenticity" ? "请根据这组真实数据作出选择，并说明平均数能告诉我们什么、不能告诉我们什么。" : "我们用哪一条课堂证据判断这次调整是否有效？",
    indicator: item.indicator
  }));
  $("#reflection-action-list").innerHTML = reflectionState.actions.map((item) => `<article class="reflection-action-item">
    <div class="action-number">${String(item.index).padStart(2, "0")}</div>
    <div class="action-main"><span class="action-source">回应：${item.issue}</span><h3>${item.title}</h3><p>${item.action}</p><div class="action-talk"><i data-lucide="message-circle-more"></i><span><small>可直接使用的课堂话术</small><b>“${item.talk}”</b></span></div></div>
    <aside><span><i data-lucide="library"></i>${item.theory}</span><p><b>验证指标</b>${item.indicator}</p><label><input type="checkbox" checked />纳入下一轮方案</label></aside>
  </article>`).join("");
  $("#reflection-indicators").innerHTML = reflectionState.actions.map((item) => `<label><input type="checkbox" checked /><span><i data-lucide="crosshair"></i><b>${item.issue}</b><small>${item.indicator}</small></span></label>`).join("");
  reflectionState.actionReady = reflectionState.actions.length > 0;
}

function renderReflectionTrajectory() {
  const activeRound = Number($("#reflection-round")?.value || 2);
  $("#reflection-round-switcher").innerHTML = reflectionState.rounds.map((item) => `<button class="${item.round === activeRound ? "active" : ""}" type="button" data-reflection-round="${item.round}"><span>第 ${item.round} 轮</span><small>${item.label}</small><em>${item.status}</em></button>`).join("");
  const previous = reflectionState.rounds[Math.max(0, activeRound - 2)] || reflectionState.rounds[0];
  const current = reflectionState.rounds[activeRound - 1] || reflectionState.rounds[1];
  const comparison = [
    ["已改善问题", activeRound > 1 ? "课堂时间配置" : "等待下一轮验证", "trending-up", "improved"],
    ["持续存在问题", current.problems[0] || "暂无", "repeat-2", "persistent"],
    ["新出现问题", activeRound > 1 ? current.problems.at(-1) : "暂无跨轮数据", "sparkles", "new"],
    ["暂无证据判断", current.score === null ? "等待下一轮课堂证据" : "真实迁移效果", "circle-dashed", "pending"]
  ];
  $("#reflection-round-comparison").innerHTML = comparison.map(([label, value, icon, tone]) => `<article class="round-compare-card ${tone}"><i data-lucide="${icon}"></i><span><small>${label}</small><b>${value}</b></span></article>`).join("");
  $("#reflection-timeline").innerHTML = reflectionState.rounds.map((item, index) => `<article class="timeline-round ${item.round === activeRound ? "active" : ""}">
    <div class="timeline-marker"><span>${String(item.round).padStart(2, "0")}</span><i></i></div>
    <div class="timeline-round-card"><header><span><small>${item.date}</small><h3>第 ${item.round} 轮 · ${item.label}</h3></span><em>${item.score === null ? "待验证" : `${item.score} 分`}</em></header><div class="timeline-round-grid"><div><b>核心问题</b><p>${item.problems.join("；")}</p></div><div><b>采取策略</b><p>${item.strategy}</p></div><div><b>证据结论</b><p>${item.result}</p></div></div><button type="button" data-reflection-round="${item.round}">查看本轮档案 <i data-lucide="arrow-right"></i></button></div>
  </article>`).join("");
  const delta = current.score !== null && previous.score !== null ? current.score - previous.score : 0;
  $("#conversion-export").textContent = delta > 0 ? `较上轮 +${delta} 分` : "持续追踪";
}

function radarPoint(centerX, centerY, radius, angle, value = 1) {
  const radians = (angle - 90) * Math.PI / 180;
  return `${(centerX + Math.cos(radians) * radius * value).toFixed(1)},${(centerY + Math.sin(radians) * radius * value).toFixed(1)}`;
}

function renderGrowthProfile() {
  const labels = ["课堂诊断", "理论解释", "行动设计", "证据评价", "持续研究", "成果表达"];
  const values = [0.82, 0.88, 0.78, 0.71, 0.68, 0.84];
  const center = { x: 180, y: 151 };
  const radius = 112;
  const angles = labels.map((_, index) => index * 60);
  const grids = [0.25, 0.5, 0.75, 1].map((scale) => `<polygon points="${angles.map((angle) => radarPoint(center.x, center.y, radius, angle, scale)).join(" ")}" />`).join("");
  const axes = angles.map((angle) => `<line x1="${center.x}" y1="${center.y}" x2="${radarPoint(center.x, center.y, radius, angle).split(",")[0]}" y2="${radarPoint(center.x, center.y, radius, angle).split(",")[1]}" />`).join("");
  const area = angles.map((angle, index) => radarPoint(center.x, center.y, radius, angle, values[index])).join(" ");
  const dots = angles.map((angle, index) => { const [x, y] = radarPoint(center.x, center.y, radius, angle, values[index]).split(","); return `<circle cx="${x}" cy="${y}" r="4" />`; }).join("");
  const text = angles.map((angle, index) => { const [x, y] = radarPoint(center.x, center.y, radius + 27, angle).split(","); return `<text x="${x}" y="${y}">${labels[index]}</text>`; }).join("");
  $("#growth-radar").innerHTML = `<g class="radar-grids">${grids}${axes}</g><polygon class="radar-area" points="${area}" /> <g class="radar-dots">${dots}</g><g class="radar-labels">${text}</g>`;
  const insights = [
    ["高频关注领域", "课堂提问 · 学生参与 · 概念理解", "scan-search", "purple"],
    ["长期改善方向", "理论解释正在从标签走向课堂证据", "trending-up", "green"],
    ["持续挑战问题", "差异化参与和真实迁移仍需多轮验证", "badge-alert", "orange"],
    ["理论使用特点", "偏重认知冲突、差异化与形成性评价", "library-big", "blue"],
    ["下一成长主题", "用可观察指标验证教学改进效果", "crosshair", "pink"]
  ];
  $("#growth-insight-grid").innerHTML = insights.map(([label, value, icon, tone]) => `<article class="growth-insight ${tone}"><span><i data-lucide="${icon}"></i></span><div><small>${label}</small><b>${value}</b></div></article>`).join("");
  $("#reflection-archive").innerHTML = [
    ["平均数课堂持续改进", "小学数学 · 3 轮实践", "进行中", "76%"],
    ["小马过河深度阅读课例", "小学语文 · 2 轮实践", "已沉淀案例", "84%"],
    ["课堂提问质量专项", "跨学科 · 6 次反思", "持续追踪", "71%"]
  ].map(([name, meta, status, progress]) => `<button type="button"><span class="archive-icon"><i data-lucide="folder-kanban"></i></span><span><b>${name}</b><small>${meta}</small></span><em>${status}</em><strong>${progress}</strong><i data-lucide="chevron-right"></i></button>`).join("");
}

function renderReflectionWorkspace() {
  if (!reflectionState.diagnoses.length) reflectionState.diagnoses = buildReflectionDiagnoses(reflectionSourceText());
  renderReflectionDiagnosis();
  renderReflectionTheories();
  renderReflectionActions();
  renderReflectionTrajectory();
  renderGrowthProfile();
  renderReflectionOverview();
  renderRubric();
  renderFramework();
  const sourceCount = reflectionSourceText().replace(/\s/g, "").length;
  if ($("#reflection-source-count")) $("#reflection-source-count").textContent = `${sourceCount} 字`;
  refreshIcons();
}

function analyzeReflectionSourceLocal({ silent = false, navigate = true } = {}) {
  const source = reflectionSourceText();
  if (source.length < 30) {
    toast("请先上传或输入较完整的教学反思。")
    return false;
  }
  reflectionState.diagnoses = buildReflectionDiagnoses(source);
  reflectionState.selectedTheories = Array.from(new Set(reflectionState.diagnoses.map((item) => item.theory).concat("形成性评价理论")));
  reflectionState.activeTheory = reflectionState.selectedTheories[0];
  reflectionState.diagnosticReady = true;
  renderReflectionWorkspace();
  scheduleWorkspaceSave();
  if (navigate) setWorkspaceSection("reflect-diagnosis");
  if (!silent) toast(`已识别 ${reflectionState.diagnoses.length} 个核心问题，并完成初步理论匹配。`);
  return true;
}

function renderReflectionOverview() {
  const data = state.analysis;
  const sourceLength = reflectionSourceText().replace(/\s/g, "").length;
  const reflectionLength = els.reflection.value.replace(/\s/g, "").length;
  const stages = [sourceLength > 30, reflectionState.diagnosticReady, reflectionState.selectedTheories.length > 0, reflectionState.actionReady, reflectionLength > 120, reflectionState.rounds.length > 1];
  const readiness = Math.round(stages.filter(Boolean).length / stages.length * 100);
  $("#conversion-evidence").textContent = reflectionState.fileName || `${sourceLength} 字原文`;
  $("#conversion-diagnosis").textContent = reflectionState.diagnosticReady ? `${reflectionState.diagnoses.length} 个核心问题` : "待运行诊断";
  $("#conversion-theory").textContent = `${reflectionState.selectedTheories.length} 类理论`;
  $("#conversion-action").textContent = reflectionState.actionReady ? `${reflectionState.actions.length} 项策略` : "待生成策略";
  $("#conversion-reflection").textContent = reflectionLength > 120 ? `${reflectionLength} 字成果` : "待生成成果";
  $$(".reflection-loop-flow .conversion-step").forEach((step, index) => {
    step.classList.toggle("is-done", stages[index]);
    step.classList.toggle("is-active", !stages[index] && stages.slice(0, index).every(Boolean));
  });
  $("#readiness-score").textContent = `${readiness}%`;
  $("#readiness-bar").style.width = `${readiness}%`;
  const items = [
    ["反思材料", stages[0], stages[0] ? `${sourceLength} 字` : "待导入"],
    ["问题诊断", stages[1], stages[1] ? `${reflectionState.diagnoses.length} 项` : "待运行"],
    ["理论解释", stages[2], `${reflectionState.selectedTheories.length} 类`],
    ["改进方案", stages[3], stages[3] ? `${reflectionState.actions.length} 项` : "待生成"],
    ["专业成果", stages[4], stages[4] ? "已生成" : "待生成"],
    ["跨轮追踪", stages[5], `${reflectionState.rounds.length} 轮`]
  ];
  $("#readiness-list").innerHTML = items.map(([label, ready, value]) => `<span class="${ready ? "ready" : "pending"}"><i data-lucide="${ready ? "circle-check" : "circle-dashed"}"></i><b>${label}</b><em>${value}</em></span>`).join("");
  $("#reflection-overview-signals").innerHTML = reflectionState.diagnoses.slice(0, 4).map((item) => `<button type="button" data-workspace-section="reflect-diagnosis"><span class="signal-priority ${item.priority === "高" ? "high" : "medium"}">${item.priority}</span><span><b>${item.title}</b><small>${item.category} · ${item.status}</small></span><i data-lucide="chevron-right"></i></button>`).join("");
  $("#reflection-overview-theories").innerHTML = reflectionTheoryCatalog.slice(0, 5).map((item, index) => `<button type="button" data-workspace-section="reflect-theory" data-reflection-theory-name="${item.name}"><span>${String(index + 1).padStart(2, "0")}</span><b>${item.name}</b><i><em style="width:${item.score}%"></em></i><strong>${item.score}%</strong></button>`).join("");
  if (data) $("#reflect-banner-copy").textContent = `已接入 ${data.lines.length} 条课堂话语、${data.theoryMatches.length} 类观察理论与 ${reflectionState.rounds.length} 轮改进档案`;
  refreshIcons();
}

function renderAnalysis() {
  const data = state.analysis;
  $("#analysis-status").innerHTML = '<i data-lucide="circle-check"></i> 分析已完成';
  animateNumericValue($("#m-questions"), data.questions);
  animateNumericValue($("#m-answers"), data.answers);
  animateNumericValue($("#m-feedback"), data.feedback);
  animateNumericValue($("#m-student-q"), data.studentQ);
  animateNumericValue($("#quality-score"), data.score, 1);
  $("#quality-text").textContent = makeQualityText(data);
  $("#event-count").textContent = `${data.events.length} 个事件`;
  const scorePercent = Math.round(Number(data.score) * 10);
  $("#score-ring").style.strokeDashoffset = String(308 - 308 * (scorePercent / 100));
  const completion = Math.min(98, 58 + data.theoryMatches.length * 4 + data.events.length);
  $("#rail-progress-value").textContent = `${completion}%`;
  $("#rail-progress-bar").style.width = `${completion}%`;
  renderBars(data.lines);
  renderCodedList();
  renderTheories();
  renderEvents();
  renderDialogueStructures();
  renderAnalysisChains();
  renderLandingMatrix();
  renderOverviewModules();
  renderReflectionOverview();
  refreshIcons();
}

function makeQualityText(data) {
  const agency = data.studentQ === 0 ? "但学生主动提问较少，主体性还可以进一步释放。" : "学生也出现了主动提问，主体性表现较好。";
  return `本课教师提问 ${data.questions} 次、学生应答 ${data.answers} 次、追问/反馈 ${data.deep + data.feedback} 次，理论证据较集中。${agency}`;
}

function renderBars(lines) {
  const chunkCount = 24;
  const chunks = Array.from({ length: chunkCount }, () => 12);
  lines.forEach((line, index) => {
    const bucket = Math.min(chunkCount - 1, Math.floor((index / Math.max(lines.length, 1)) * chunkCount));
    chunks[bucket] += line.speaker === "teacher" ? 10 : 7;
    chunks[bucket] += line.tags.length * 3;
  });
  $("#heat-bars").innerHTML = chunks
    .map((height) => `<span class="bar" style="height:${Math.min(112, height)}px"></span>`)
    .join("");
}

function renderCodedList() {
  const filter = $("#tag-filter").value;
  const query = state.search.toLowerCase();
  const lines = state.analysis.lines.filter((line) => {
    const matchesTag = filter === "all" || line.tags.includes(filter);
    const matchesQuery = !query || `${line.time} ${line.content} ${line.tags.map(tagName).join(" ")}`.toLowerCase().includes(query);
    return matchesTag && matchesQuery;
  });
  els.codedList.innerHTML = lines.length ? lines
    .slice(0, 80)
    .map((line) => {
      const tags = line.tags.length ? line.tags : ["risk"];
      return `<article class="coded-item" data-tags="${line.tags.join(",")}">
        <time>${line.time}</time>
        <div>
          <div class="coded-text">${escapeHtml(line.content)}</div>
          <div class="coded-tags">${tags.map((tag) => `<span class="tag ${tag}">${tagName(tag)}</span>`).join("")}</div>
        </div>
      </article>`;
    })
    .join("") : `<p class="empty">没有找到匹配的逐字稿记录。</p>`;
}

function renderTheories() {
  const query = state.search.toLowerCase();
  const matches = state.analysis.theoryMatches.filter((item) => {
    return !query || `${item.name} ${item.insight} ${item.hitKeys.join(" ")}`.toLowerCase().includes(query);
  });
  els.theoryList.innerHTML = matches.length
    ? matches
        .map(
          (item) => `<article class="theory-item">
            <span class="theory-score">${item.score}</span>
            <div>
              <h3>${item.name}<span class="theory-match-badge">${item.score}% 匹配度</span></h3>
              <p>${item.insight}</p>
              <div class="theory-meter"><span style="width:${item.score}%"></span></div>
              <div class="coded-tags">
                ${item.hitKeys.map((key) => `<span class="tag theory">${escapeHtml(key)}</span>`).join("")}
              </div>
            </div>
          </article>`
        )
        .join("")
    : `<p class="empty">暂未匹配到理论证据，请补充课堂材料。</p>`;
}

function renderEvents() {
  const query = state.search.toLowerCase();
  const events = state.analysis.events.filter((event) => {
    return !query || `${event.title} ${event.content} ${event.theory}`.toLowerCase().includes(query);
  });
  els.events.innerHTML = events.length ? events
    .map(
      (event, index) => `<article class="event-item" data-index="${String(index + 1).padStart(2, "0")}">
        <h3>${event.title} · ${event.time}</h3>
        <p>${escapeHtml(event.content)}</p>
        <div class="coded-tags"><span class="tag theory">${event.theory}</span></div>
      </article>`
    )
    .join("") : `<p class="empty">没有找到匹配的课堂事件。</p>`;
}

function renderDialogueStructures() {
  const s = state.analysis.structures;
  const stats = [
    ["开放性提问", `${s.openQuestions} 次`],
    ["封闭性提问", `${s.closedQuestions} 次`],
    ["IRF 互动链", `${s.irfChains} 个`],
    ["个人应答", `${s.individualAnswers} 次`],
    ["集体齐答", `${s.collectiveAnswers} 次`],
    ["合作交流证据", `${s.collaboration} 条`],
    ["等待时间证据", `${s.waitEvidence} 条`],
    ["学生主动提问", `${state.analysis.studentQ} 次`]
  ];
  $("#structure-stats").innerHTML = stats
    .map(([label, value]) => `<article class="structure-stat"><span>${label}</span><b>${value}</b></article>`)
    .join("");
  $("#evidence-notice").textContent = s.waitEvidence
    ? `逐字稿中发现 ${s.waitEvidence} 条等待或独立思考证据；具体秒数仅在原文有时间标记时才可判断。`
    : "逐字稿未记录明确停顿或等待时长，因此不能仅凭文本断言教师等待时间是否充足。";
}

function renderAnalysisChains() {
  const chains = state.analysis.chains;
  $("#chain-count").textContent = `${chains.length} 条证据链`;
  $("#analysis-chain").innerHTML = chains.length
    ? chains.map((chain, index) => `<article class="chain-item">
        <span class="chain-index">${String(index + 1).padStart(2, "0")}</span>
        <div>
          <div class="chain-title"><h3>${escapeHtml(chain.title)}</h3><span class="level ${chain.landing.key}">${chain.landing.label}</span></div>
          <div class="chain-layers">
            <div class="chain-layer"><b><em>L1</em><span>课堂事实</span></b><span>${escapeHtml(chain.fact)}</span></div>
            <div class="chain-layer"><b><em>L2</em><span>行为识别</span></b><span>${escapeHtml(chain.behavior)}</span></div>
            <div class="chain-layer"><b><em>L3</em><span>教学机制</span></b><span>${escapeHtml(chain.mechanism)}</span></div>
            <div class="chain-layer"><b><em>L4</em><span>理论匹配</span></b><span>${escapeHtml(chain.theoryName)}<br>${escapeHtml(chain.theoryCategory)}</span></div>
            <div class="chain-layer"><b><em>L5</em><span>理论落地</span></b><span>${chain.landing.label} · 证据强度${chain.evidenceStrength}</span></div>
            <div class="chain-layer"><b><em>L6</em><span>教学改进</span></b><span>${escapeHtml(chain.improvement)}</span></div>
          </div>
        </div>
      </article>`).join("")
    : '<p class="empty">当前逐字稿中尚未形成可分析的课堂事件链。</p>';
}

function renderLandingMatrix() {
  const chains = state.analysis.chains;
  $("#landing-table-body").innerHTML = chains.length
    ? chains.map((chain) => `<tr>
        <td>${escapeHtml(chain.title)}</td>
        <td>${escapeHtml(chain.theoryName)}</td>
        <td>${escapeHtml(chain.supportTheory)}</td>
        <td><span class="match-stars">${"★".repeat(chain.matchScore)}${"☆".repeat(5 - chain.matchScore)}</span></td>
        <td><span class="level ${chain.landing.key}">${chain.landing.label}</span></td>
      </tr>`).join("")
    : '<tr><td colspan="5">暂无足够证据生成理论匹配矩阵。</td></tr>';
  $("#landing-cards").innerHTML = chains.length
    ? chains.map((chain) => `<article class="landing-card">
        <div class="landing-card-head"><h3>${escapeHtml(chain.theoryName)}</h3><span class="level ${chain.landing.key}">${chain.landing.label}</span></div>
        <dl>
          <dt>理论库位置</dt><dd>${escapeHtml(chain.theoryCategory)}</dd>
          <dt>课堂位置</dt><dd>${escapeHtml(chain.title)} · ${escapeHtml(chain.time)}</dd>
          <dt>课堂证据</dt><dd>${escapeHtml(chain.fact)}</dd>
          <dt>教师行为</dt><dd>${escapeHtml(chain.behavior)}</dd>
          <dt>学生行为</dt><dd>${escapeHtml(inferStudentBehavior(chain))}</dd>
          <dt>教学机制</dt><dd>${escapeHtml(chain.mechanism)}</dd>
          <dt>证据强度</dt><dd>${chain.evidenceStrength}</dd>
          <dt>主要优势</dt><dd>${escapeHtml(chain.advantage)}</dd>
          <dt>理论缺口</dt><dd>${escapeHtml(chain.gap)}</dd>
          <dt>改进策略</dt><dd>${escapeHtml(chain.improvement)}</dd>
          <dt>优化话术</dt><dd>“${escapeHtml(chain.teacherTalk)}”</dd>
        </dl>
      </article>`).join("")
    : '<p class="empty">暂无理论落地卡。</p>';
}

function inferStudentBehavior(chain) {
  const evidence = chain.evidenceLines.filter((line) => line.speaker === "student").map((line) => line.content);
  if (evidence.length) return evidence.join("；");
  if (chain.title.includes("操作")) return "学生参与操作、观察或说明操作过程，具体表现以逐字稿证据为准。";
  if (chain.title.includes("协作")) return "学生参与同伴交流、汇报或观点补充。";
  if (chain.title.includes("追问")) return "学生回应教师追问并尝试解释理由或关系。";
  return "逐字稿未完整记录该事件中的学生行为，需补充课堂证据。";
}

function tagName(tag) {
  return {
    "teacher-question": "教师提问",
    "deep-question": "高阶追问",
    "student-answer": "学生应答",
    "student-question": "学生主动提问",
    feedback: "教师反馈",
    theory: "理论证据",
    collaboration: "合作交流",
    "wait-evidence": "等待证据",
    risk: "未分类"
  }[tag] || tag;
}

function buildReport() {
  const a = state.analysis;
  const lesson = els.lessonTitle.value || "未命名课堂";
  const subject = els.subject.value || "待补充";
  const grade = els.grade.value || "待补充";
  const duration = els.duration.value || "待补充";
  const teacher = els.teacherName.value || "待补充";
  const analysisDate = els.analysisDate.value || new Date().toLocaleDateString();
  const s = a.structures;
  const deepCount = a.chains.filter((chain) => chain.landing.key === "deep").length;
  const sufficientCount = a.chains.filter((chain) => chain.landing.key === "sufficient").length;
  const evidenceWarning = s.waitEvidence
    ? `逐字稿中发现 ${s.waitEvidence} 条等待或独立思考证据；只有原文带时间标记时才能计算具体等待秒数。`
    : "逐字稿未记录明确停顿或等待时长，因此本报告不对真实等待秒数作无证据推断。";

  return `# 课堂观察分析报告

课题：${lesson}
学科：${subject}
年级：${grade}
授课教师：${teacher}
课堂时长：${duration}
分析日期：${analysisDate}
分析依据：课堂逐字稿 + 已选教育理论库

## 一、课堂数据看板

| 指标 | 数据 | 说明 |
| --- | ---: | --- |
| 师生话语记录 | ${a.lines.length} 条 | 按逐字稿有效段落测算 |
| 教师提问 | ${a.questions} 次 | 含封闭式问题与开放性问题 |
| 开放性提问 | ${s.openQuestions} 次 | 含为什么、怎样、有什么发现、依据等问题 |
| 封闭性提问 | ${s.closedQuestions} 次 | 含事实确认、计算结果和对错判断 |
| 高阶追问 | ${a.deep} 次 | 含理由解释、关系发现、假设检验 |
| 学生应答 | ${a.answers} 次 | 个人应答 ${s.individualAnswers} 次，集体齐答 ${s.collectiveAnswers} 次 |
| IRF 互动链 | ${s.irfChains} 个 | 教师发起—学生回应—教师反馈的相邻结构 |
| 教师反馈 | ${a.feedback} 次 | 含肯定、描述性反馈、引导复述 |
| 学生主动提问 | ${a.studentQ} 次 | 衡量学生问题意识与主体性 |
| 合作交流证据 | ${s.collaboration} 条 | 含小组、同桌、讨论、汇报等记录 |
| 等待时间证据 | ${s.waitEvidence} 条 | ${evidenceWarning} |
| 理论匹配 | ${a.theoryMatches.length} 类 | 本地理论规则库自动匹配 |
| 综合评分 | ${a.score}/10 | 基于参与度、问题质量、反馈深度与理论证据 |

## 二、六层课堂分析链

${a.chains
  .map(
    (chain, index) => `### ${index + 1}. ${chain.title}

L1 课堂事实：${chain.fact}

L2 行为识别：${chain.behavior}

L3 教学机制：${chain.mechanism}

L4 理论匹配：${chain.theoryName}（${chain.theoryCategory}）

L5 理论落地：${chain.landing.label}；证据强度：${chain.evidenceStrength}

L6 教学改进：${chain.improvement}
`
  )
  .join("\n")}

## 三、课堂关键理论匹配总表

| 课堂事件 | 主要理论 | 辅助理论 | 匹配强度 | 落地判断 |
| --- | --- | --- | --- | --- |
${a.chains
  .map(
    (chain) => `| ${chain.title} | ${chain.theoryName} | ${chain.supportTheory} | ${"★".repeat(chain.matchScore)}${"☆".repeat(5 - chain.matchScore)} | ${chain.landing.label} |`
  )
  .join("\n")}

## 四、理论落地卡

${a.chains.map((chain, index) => `### ${index + 1}. ${chain.theoryName}

- 理论库位置：${chain.theoryCategory}
- 课堂位置：${chain.title} · ${chain.time}
- 课堂证据：${chain.fact}
- 教师行为：${chain.behavior}
- 学生行为：${inferStudentBehavior(chain)}
- 教学机制：${chain.mechanism}
- 理论落地程度：${chain.landing.label}
- 证据强度：${chain.evidenceStrength}
- 主要优势：${chain.advantage}
- 理论缺口：${chain.gap}
- 改进策略：${chain.improvement}
- 教师优化话术：“${chain.teacherTalk}”`).join("\n\n")}

## 五、综合诊断

本课综合评分为 ${a.score}/10，共识别 ${a.chains.length} 条课堂证据链，其中深度落地 ${deepCount} 项、较充分落地 ${sufficientCount} 项。课堂已经出现${a.theoryMatches.slice(0, 4).map((item) => item.name).join("、") || "可进一步分析的教学机制"}等理论证据。${a.studentQ === 0 ? "学生主动提问尚未被逐字稿记录，课堂发起权仍较集中于教师。" : `逐字稿记录到学生主动提问 ${a.studentQ} 次，可继续扩大由学生生成问题和评价同伴观点的机会。`}${s.collaboration === 0 ? "同时未发现明确的小组或同伴协作证据。" : `课堂出现 ${s.collaboration} 条合作交流证据，但仍需关注合作是否产生观点比较和共同产出。`}

证据边界：${evidenceWarning}

## 六、下一节课可执行改进

${a.chains.slice(0, 5).map((chain, index) => `${index + 1}. ${chain.improvement}
   可用话术：“${chain.teacherTalk}”`).join("\n")}

## 七、理论—课堂—改进闭环

理论是什么 → 课堂哪里体现 → 有什么逐字稿证据 → 理论是否真正落地 → 哪里做得好、哪里没有落地 → 下一节课具体怎么改。

报告生成说明：本报告仅依据当前导入的课堂逐字稿和已选择理论库进行规则化分析。所有理论判断均应回到原始课堂证据核验；音视频中的等待时长、语气、板书和非语言行为，若未转写则不在本报告中推断。`;
}

function generateReflectionLocal({ silent = false } = {}) {
  if (!reflectionState.diagnosticReady && !analyzeReflectionSourceLocal({ silent: true, navigate: false })) return;
  const type = $("#output-type").value;
  const style = $("#writing-style").value;
  const brief = $("#reflection-brief").value.trim();
  const lesson = $("#reflection-lesson").value.trim() || els.lessonTitle.value || "本节课";
  const project = $("#reflection-project").value.trim() || `${lesson}持续改进`;
  const diagnoses = reflectionState.diagnoses;
  const selectedProfiles = reflectionState.selectedTheories.map(reflectionTheoryProfile);
  const evidenceLines = diagnoses.map((item, index) => `${index + 1}. ${item.evidence}\n   专业判断：${item.title}`).join("\n");
  const theoryLines = selectedProfiles.map((item, index) => `${index + 1}. ${item.name}：${item.core}`).join("\n");
  const actionLines = reflectionState.actions.map((item, index) => `${index + 1}. ${item.action}\n   观察指标：${item.indicator}`).join("\n");
  const reflection = `# ${lesson}教学反思深化版

## 一、课堂现象与证据

本次反思以教师原始反思、课堂观察数据和教育理论库为依据。当前材料呈现出以下可核验事实：

${evidenceLines}

## 二、核心问题

${diagnoses.map((item, index) => `${index + 1}. **${item.title}**：${item.interpretation}`).join("\n")}

## 三、理论解释

${theoryLines}

理论匹配的目的不是为课堂行为附加标签，而是解释问题为何发生、通过什么学习机制影响学生，并据此形成下一步行动。

## 四、教师核心关注

${brief}

## 五、下一轮改进行动

${actionLines}

## 六、效果判断

下一轮实践需围绕上述观察指标收集学生回答、课堂时间、任务作品和参与分布等证据。若证据不足，应保留“暂无法判断”，避免用主观感受替代改进效果。`;
  const teachingCase = `# ${lesson}理论化教学案例

## 一、教学背景
本案例来源于“${project}”第 ${$("#reflection-round").value} 轮实践，聚焦${diagnoses.slice(0, 2).map((item) => item.title).join("与")}。

## 二、课堂实施与学生表现
${evidenceLines}

## 三、问题发现
${diagnoses.map((item) => `- ${item.title}：${item.interpretation}`).join("\n")}

## 四、理论依据与分析
${theoryLines}

## 五、改进后的教学设计
${actionLines}

## 六、教学启示
教学改进应从真实课堂证据出发，让理论解释、教学行动和效果指标形成可复核的闭环。`;
  const researchReport = `# ${lesson}一课一研教研报告

## 核心研究问题
${brief}

## 课堂证据
${evidenceLines}

## 理论解释
${theoryLines}

## 改进共识
${actionLines}

## 下一轮教研安排
1. 依据观察指标确定听课分工。\n2. 第 ${Number($("#reflection-round").value) + 1} 轮实践后对照本轮问题状态。\n3. 区分已改善、持续存在、新出现与证据不足的问题。\n4. 将验证结果继续沉淀为课例研究材料。`;
  const paper = `# 论文框架：基于课堂证据与理论介入的${lesson}教学改进研究

## 一、问题提出
从教师反思中发现${diagnoses.slice(0, 3).map((item) => item.title).join("、")}等实践问题。

## 二、理论视角
${theoryLines}

## 三、研究设计
采用课例研究与行动研究路径，以多轮课堂实践、教师反思、课堂观察记录和学生作品为证据来源。

## 四、分析维度
问题变化、理论应用、策略演进、课堂证据变化与成果沉淀。

## 五、实践过程
第1轮发现问题 → 理论介入 → 第2轮策略验证 → 证据比较 → 第3轮持续优化。

## 六、预期结论
讨论理论如何通过具体教学行为产生作用，以及不同策略对课堂节奏、概念理解、参与均衡和知识迁移的影响。`;
  const lessonStudy = `# ${lesson}课例研究方案

## 1. 课例研究主题
${brief}

## 2. 第一轮问题基线
${diagnoses.map((item) => `- ${item.title}（${item.status}）`).join("\n")}

## 3. 理论介入
${selectedProfiles.map((item) => `- ${item.name}：${item.mechanism}`).join("\n")}

## 4. 教学改进
${actionLines}

## 5. 再次实践与观察分工
围绕课堂时间、追问深度、学生参与、真实迁移和形成性评价分别收集证据。

## 6. 跨轮比较
逐项判断原问题是否改善、是否持续、是否产生新问题以及是否暂无证据判断。

## 7. 成果沉淀
形成课例叙事、证据附件、改进轨迹和可复用的教学策略。`;
  const experiment = `# ${lesson}教学改进方案

## 一、改进目标
${$("#reflection-experiment-goal").value.trim()}

## 二、理论依据
${selectedProfiles.map((item) => `- ${item.name}：${item.core}`).join("\n")}

## 三、实施策略
${$("#reflection-experiment-strategy").value.trim()}

## 四、课堂观察指标
${reflectionState.actions.map((item, index) => `${index + 1}. ${item.indicator}`).join("\n")}

## 五、效果判断方式
将下一轮课堂证据与本轮材料逐项对照，形成“已改善—持续存在—新出现—证据不足”四类判断。

## 六、成果预期
形成改进后的教学设计、课堂观察记录、学生学习证据与跨轮对比报告。`;
  const outputs = { reflection, case: teachingCase, research: researchReport, paper, lesson: lessonStudy, experiment };
  const prefix = style === "paper" ? "【论文式表达版本】\n\n" : style === "competition" ? "【教学比赛材料版本】\n\n" : "";
  state.reflection = prefix + (outputs[type] || reflection);
  els.reflection.value = state.reflection;
  renderRubric();
  renderFramework();
  renderReflectionOverview();
  if (!state.restoring) saveWorkspace(true);
  refreshIcons();
  if (!silent) toast("成果正文已生成，可继续编辑或导出。");
}

function buildFrameworkText() {
  const lesson = $("#reflection-lesson")?.value || els.lessonTitle.value || "课堂教学";
  const theories = reflectionState.selectedTheories.slice(0, 4);
  const dimensions = reflectionState.diagnoses.map((item) => item.category).slice(0, 6);
  return `研究主题：${lesson}的课堂问题与持续改进\n理论视角：${theories.join("、") || "待匹配"}\n证据材料：原始反思、课堂观察、学生表现与跨轮记录\n分析维度：${dimensions.join("、") || "课堂事实、理论解释、行动改进"}\n实践路径：问题识别 → 理论介入 → 教学调整 → 再次实践 → 证据比较`;
}

function renderRubric() {
  const a = state.analysis || { events: [], theoryMatches: [], deep: 0, score: 7.8 };
  const evidenceBonus = Math.min(10, reflectionState.diagnoses.length * 2);
  const items = [
    ["课堂证据捕捉", Math.min(96, 72 + a.events.length * 3 + evidenceBonus), "能否区分课堂事实与主观判断，并保留准确的原文证据。"],
    ["理论解释能力", Math.min(95, 72 + reflectionState.selectedTheories.length * 4), "能否说明理论为什么适配，以及它解释了哪一种课堂机制。"],
    ["行动转化质量", Math.min(94, 74 + reflectionState.actions.length * 4), "改进是否具体到课堂任务、教师话术、观察指标和判断标准。"],
    ["持续改进能力", Math.min(92, 68 + reflectionState.rounds.length * 7), "能否跨轮比较问题、策略和证据变化，并形成新的改进方向。"]
  ];
  $("#rubric-list").innerHTML = items
    .map(
      ([title, score, desc]) => `<article class="rubric-item">
        <div>
          <h3>${title}</h3>
          <p>${desc}</p>
        </div>
        <span class="rubric-score">${score}</span>
      </article>`
    )
    .join("");
}

function renderFramework() {
  const items = [
    ["研究主题", `${$("#reflection-lesson")?.value || els.lessonTitle.value || "课堂教学"}的证据化反思与持续改进。`],
    ["核心理论", reflectionState.selectedTheories.slice(0, 4).join("、") || "根据问题诊断匹配理论。"],
    ["证据材料", `原始反思 ${reflectionSourceText().replace(/\s/g, "").length} 字，${reflectionState.diagnoses.length} 个核心问题，${reflectionState.rounds.length} 轮课例档案。`],
    ["实践落点", reflectionState.actions.slice(0, 2).map((item) => item.action).join("；") || "依据问题与理论生成下一轮可验证行动。"]
  ];
  $("#framework").innerHTML = items
    .map(
      ([title, desc]) => `<article class="framework-item">
        <h3>${title}</h3>
        <p>${desc}</p>
      </article>`
    )
    .join("");
}

function syncReflectionSources() {
  const a = state.analysis;
  $("#source-metrics").innerHTML = `<i data-lucide="bar-chart-3"></i>课堂指标：提问 ${a.questions} / 应答 ${a.answers} / 评分 ${a.score}`;
  $("#source-theories").innerHTML = `<i data-lucide="library"></i>理论证据：${a.theoryMatches.length} 类`;
  $("#source-events").innerHTML = `<i data-lucide="bookmark"></i>关键事件：${a.events.length} 个`;
  const discourseCount = a.lines?.length || 21;
  const theoryCount = a.theoryMatches?.length || 10;
  const roundCount = Math.max(3, reflectionState.rounds?.length || 0);
  $("#reflect-banner-copy").textContent = `已接入 ${discourseCount} 条课堂话语、${theoryCount} 类观察理论与 ${roundCount} 轮改进档案`;
  refreshIcons();
}

function getWorkspaceData() {
  return {
    transcript: els.transcript.value,
    observationSource: state.observationSource,
    observationAnalyzedTranscript: state.observationAnalyzedTranscript,
    lessonTitle: els.lessonTitle.value,
    subject: els.subject.value,
    grade: els.grade.value,
    duration: els.duration.value,
    teacherName: els.teacherName.value,
    analysisDate: els.analysisDate.value,
    selectedTheories: getSelectedTheoryRules().map((rule) => rule.name),
    report: els.report.value,
    reflection: els.reflection.value,
    reflectionBrief: $("#reflection-brief").value,
    outputType: $("#output-type").value,
    writingStyle: $("#writing-style").value,
    reflectionSource: $("#reflection-source")?.value || "",
    reflectionProject: $("#reflection-project")?.value || "",
    reflectionLesson: $("#reflection-lesson")?.value || "",
    reflectionRound: $("#reflection-round")?.value || "1",
    reflectionSourceType: $("#reflection-source-type")?.value || "课后教学反思",
    reflectionExperimentGoal: $("#reflection-experiment-goal")?.value || "",
    reflectionExperimentStrategy: $("#reflection-experiment-strategy")?.value || "",
    reflectionAssistant: reflectionState,
    theoryAssistant: assistantState.theory,
    sixArtsAssistant: { ...assistantState.sixarts, form: getSixArtsFormData() },
    view: state.currentView,
    section: state.currentSection,
    savedAt: new Date().toISOString()
  };
}

function saveWorkspace(silent = false) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(getWorkspaceData()));
    $("#save-status").textContent = `已保存 ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    if (!silent) toast("当前工作区已保存到本机浏览器。");
    return true;
  } catch {
    if (!silent) toast("浏览器未允许本地保存，请检查隐私设置。");
    return false;
  }
}

function scheduleWorkspaceSave() {
  window.clearTimeout(scheduleWorkspaceSave.timer);
  $("#save-status").textContent = "正在记录更改...";
  scheduleWorkspaceSave.timer = window.setTimeout(() => saveWorkspace(true), 550);
}

function restoreWorkspace(silent = false) {
  let saved;
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  } catch {
    saved = null;
  }
  if (!saved) {
    if (!silent) toast("暂无已保存的工作区。");
    return false;
  }
  els.transcript.value = typeof saved.transcript === "string"
    ? saved.transcript.slice(0, OBSERVATION_MAX_TEXT_CHARS)
    : "";
  state.observationSource = ["user", "sample", "none"].includes(saved.observationSource)
    ? saved.observationSource
    : (els.transcript.value.trim() === sampleTranscript.trim() ? "sample" : els.transcript.value.trim() ? "user" : "none");
  state.observationAnalyzedTranscript = typeof saved.observationAnalyzedTranscript === "string" ? saved.observationAnalyzedTranscript : "";
  els.lessonTitle.value = saved.lessonTitle || els.lessonTitle.value;
  els.subject.value = saved.subject || els.subject.value;
  els.grade.value = saved.grade || els.grade.value;
  els.duration.value = saved.duration || els.duration.value;
  els.teacherName.value = saved.teacherName || "";
  els.analysisDate.value = saved.analysisDate || els.analysisDate.value;
  if (saved.selectedTheories?.length) {
    $$("#theory-selector input").forEach((input) => {
      input.checked = saved.selectedTheories.includes(input.value);
    });
  }
  updateTheorySelectionSummary();
  updateObservationCaseMetrics();
  $("#reflection-brief").value = saved.reflectionBrief || $("#reflection-brief").value;
  $("#output-type").value = saved.outputType || "reflection";
  $("#writing-style").value = saved.writingStyle || "teacher";
  if (saved.reflectionSource) $("#reflection-source").value = String(saved.reflectionSource).slice(0, REFLECTION_MAX_TEXT_CHARS);
  if (saved.reflectionProject) $("#reflection-project").value = saved.reflectionProject;
  if (saved.reflectionLesson) $("#reflection-lesson").value = saved.reflectionLesson;
  if (saved.reflectionRound) $("#reflection-round").value = saved.reflectionRound;
  if (saved.reflectionSourceType) $("#reflection-source-type").value = saved.reflectionSourceType;
  if (saved.reflectionExperimentGoal) $("#reflection-experiment-goal").value = saved.reflectionExperimentGoal;
  if (saved.reflectionExperimentStrategy) $("#reflection-experiment-strategy").value = saved.reflectionExperimentStrategy;
  if (saved.reflectionAssistant) Object.assign(reflectionState, saved.reflectionAssistant);
  reflectionState.pending = { diagnose: false, actions: false, outcome: false, profile: false };
  reflectionState.diagnosisController = null;
  reflectionState.actionsController = null;
  reflectionState.outcomeController = null;
  reflectionState.profileController = null;
  reflectionState.metadataTimer = null;
  reflectionState.metadataRequestId = Number(reflectionState.metadataRequestId || 0) + 1;
  if (saved.theoryAssistant) {
    Object.assign(assistantState.theory, saved.theoryAssistant);
    assistantState.theory.pending = false;
    assistantState.theory.requestId = Number(assistantState.theory.requestId || 0) + 1;
    assistantState.theory.scenarioLoading = false;
    assistantState.theory.scenarioAnswering = false;
    assistantState.theory.scenarioStarted = Boolean(
      saved.theoryAssistant.scenarioStarted
      && Array.isArray(assistantState.theory.scenarioItems)
      && assistantState.theory.scenarioItems.length
    );
    assistantState.theory.scenarioRequestId = Number(assistantState.theory.scenarioRequestId || 0) + 1;
    assistantState.theory.scenarioAnswerRequestId = Number(assistantState.theory.scenarioAnswerRequestId || 0) + 1;
    const recoverMessages = (messages) => {
      let lastQuestion = "";
      return (Array.isArray(messages) ? messages : []).map((message) => {
        if (message?.role === "user") lastQuestion = message.text || lastQuestion;
        if (!message?.streaming) return message;
        return {
          ...message,
          text: `${String(message.text || "").trimEnd()}\n\n**输出中断**：页面在回答完成前关闭，请重新尝试。`.trim(),
          streaming: false,
          requestFailed: true,
          retryQuestion: message.retryQuestion || lastQuestion
        };
      });
    };
    assistantState.theory.dialogue = recoverMessages(assistantState.theory.dialogue);
    (assistantState.theory.dialogueSessions || []).forEach((session) => { session.messages = recoverMessages(session.messages); });
    const legacyTheoryFilters = {
      教育学: "教育学基础理论类",
      教育心理学: "心理学理论类",
      课程与教学: "学科教学理论类",
      教育评价: "课堂与班级管理理论类",
      课堂管理: "课堂与班级管理理论类"
    };
    assistantState.theory.filter = legacyTheoryFilters[assistantState.theory.filter] || assistantState.theory.filter;
    if (Number(saved.theoryAssistant.previewCardVersion || 0) < 2) {
      assistantState.theory.selectedId = "theory-1";
      assistantState.theory.filter = "全部";
      assistantState.theory.previewCardVersion = 2;
    }
  }
  if (saved.sixArtsAssistant) {
    Object.assign(assistantState.sixarts, saved.sixArtsAssistant);
    assistantState.sixarts.pending = false;
    applySixArtsFormData(saved.sixArtsAssistant.form);
    ensureSixArtsSourceContent(saved.sixArtsAssistant.form);
  }
  state.restoring = true;
  try {
    analyzeTranscript({ silent: true, localOnly: true });
    state.observationAnalyzedTranscript = "";
    if (saved.report) {
      state.report = saved.report;
      els.report.value = saved.report;
    }
    if (saved.reflection) {
      state.reflection = saved.reflection;
      els.reflection.value = saved.reflection;
    } else {
      analyzeReflectionSourceLocal({ silent: true, navigate: false });
      generateReflectionLocal({ silent: true });
    }
  } finally {
    state.restoring = false;
  }
  updateTranscriptCount();
  updateLessonContext();
  initializeAssistantWorkspaces();
  renderReflectionWorkspace();
  state.currentView = saved.view || "observe";
  state.currentSection = saved.section || defaultWorkspaceSections[state.currentView] || "observe-overview";
  saveWorkspace(true);
  if (!silent) toast("已恢复上次保存的工作区。");
  return true;
}

function searchWorkspace(value) {
  state.search = value.trim();
  $("#search-clear").classList.toggle("visible", Boolean(state.search));
  if (state.currentView === "theory") {
    assistantState.theory.query = state.search;
    renderTheoryLibrary();
    if (state.search && state.currentSection !== "theory-library") setWorkspaceSection("theory-library", { keepScroll: true });
    return;
  }
  if (state.currentView === "sixarts") {
    assistantState.sixarts.activeResource = "全部";
    assistantState.sixarts.resourceQuery = state.search;
    renderSixArtsResources();
    if (state.search && state.currentSection !== "sixarts-library") setWorkspaceSection("sixarts-library", { keepScroll: true });
    return;
  }
  if (state.currentView === "reflect") {
    const query = state.search.toLowerCase();
    $$("#reflect [data-workspace-panel]:not([hidden]) article, #reflect [data-workspace-panel]:not([hidden]) button").forEach((item) => {
      if (!query || item.closest(".reflection-panel-head")) item.classList.remove("search-hidden");
      else item.classList.toggle("search-hidden", !item.textContent.toLowerCase().includes(query));
    });
    return;
  }
  if (!state.analysis) return;
  renderCodedList();
  renderTheories();
  renderEvents();
}

async function copyText(text, message) {
  if (!text) {
    toast("暂无内容可复制。");
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
    toast(message);
  } catch {
    const temp = document.createElement("textarea");
    temp.value = text;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand("copy");
    temp.remove();
    toast(message);
  }
}

function downloadText(filename, text) {
  if (!text) {
    toast("暂无内容可导出。");
    return;
  }
  const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  toast("文件已生成。");
}

function markdownToWordHtml(markdown) {
  const lines = markdown.split(/\r?\n/);
  let html = "";
  let inTable = false;
  let listType = "";
  const closeList = () => {
    if (!listType) return;
    html += `</${listType}>`;
    listType = "";
  };
  const closeTable = () => {
    if (!inTable) return;
    html += "</tbody></table>";
    inTable = false;
  };
  const inline = (text) => escapeHtml(text).replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  lines.forEach((line, index) => {
    if (/^\|.+\|$/.test(line.trim())) {
      closeList();
      const cells = line.trim().slice(1, -1).split("|").map((cell) => cell.trim());
      if (cells.every((cell) => /^:?-+:?$/.test(cell))) return;
      if (!inTable) {
        inTable = true;
        html += "<table><tbody>";
      }
      const cellTag = index > 0 && /^\|\s*---/.test(lines[index + 1] || "") ? "th" : "td";
      html += `<tr>${cells.map((cell) => `<${cellTag}>${inline(cell)}</${cellTag}>`).join("")}</tr>`;
      return;
    }
    closeTable();
    if (!line.trim()) {
      closeList();
      return;
    }
    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      closeList();
      const level = Math.min(4, heading[1].length);
      html += `<h${level}>${inline(heading[2])}</h${level}>`;
      return;
    }
    const ordered = line.match(/^\d+\.\s+(.+)$/);
    const unordered = line.match(/^[-*]\s+(.+)$/);
    if (ordered || unordered) {
      const nextType = ordered ? "ol" : "ul";
      if (listType !== nextType) {
        closeList();
        listType = nextType;
        html += `<${listType}>`;
      }
      html += `<li>${inline((ordered || unordered)[1])}</li>`;
      return;
    }
    closeList();
    html += `<p>${inline(line)}</p>`;
  });
  closeList();
  closeTable();
  return html;
}

function xmlEscape(text) {
  return String(text).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[char]);
}

function buildDocxParagraph(text, style = "Normal", options = {}) {
  const properties = style !== "Normal" ? `<w:pPr><w:pStyle w:val="${style}"/></w:pPr>` : "";
  const runProperties = options.bold ? "<w:rPr><w:b/></w:rPr>" : "";
  return `<w:p>${properties}<w:r>${runProperties}<w:t xml:space="preserve">${xmlEscape(text)}</w:t></w:r></w:p>`;
}

function buildDocxTable(rows) {
  const columns = Math.max(...rows.map((row) => row.length));
  const width = Math.floor(9000 / Math.max(columns, 1));
  const tableRows = rows.map((row, rowIndex) => `<w:tr>${row.map((cell) => `<w:tc><w:tcPr><w:tcW w:w="${width}" w:type="dxa"/><w:shd w:fill="${rowIndex === 0 ? "DCE6F1" : "FFFFFF"}"/></w:tcPr>${buildDocxParagraph(cell, "Normal", { bold: rowIndex === 0 })}</w:tc>`).join("")}</w:tr>`).join("");
  return `<w:tbl><w:tblPr><w:tblW w:w="9000" w:type="dxa"/><w:tblBorders><w:top w:val="single" w:sz="4" w:color="8798AD"/><w:left w:val="single" w:sz="4" w:color="8798AD"/><w:bottom w:val="single" w:sz="4" w:color="8798AD"/><w:right w:val="single" w:sz="4" w:color="8798AD"/><w:insideH w:val="single" w:sz="4" w:color="AAB5C2"/><w:insideV w:val="single" w:sz="4" w:color="AAB5C2"/></w:tblBorders></w:tblPr>${tableRows}</w:tbl>`;
}

function markdownToDocxBody(markdown, tableBuilder = buildDocxTable) {
  const lines = markdown.split(/\r?\n/);
  const body = [];
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line) continue;
    if (/^\|.+\|$/.test(line) && /^\|\s*:?-+/.test((lines[index + 1] || "").trim())) {
      const tableLines = [line];
      let cursor = index + 2;
      while (cursor < lines.length && /^\|.+\|$/.test(lines[cursor].trim())) {
        tableLines.push(lines[cursor]);
        cursor += 1;
      }
      const rows = tableLines.map((row) => row.trim().slice(1, -1).split("|").map((cell) => cell.trim()));
      body.push(tableBuilder(rows));
      index = cursor - 1;
      continue;
    }
    if (/^\|.+\|$/.test(line) || /^\|\s*:?-+/.test(line)) continue;
    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length === 1 ? "Title" : `Heading${Math.min(3, heading[1].length - 1)}`;
      body.push(buildDocxParagraph(heading[2], level));
      continue;
    }
    const list = line.match(/^(\d+\.|[-*])\s+(.+)$/);
    body.push(buildDocxParagraph(list ? `${list[1]} ${list[2]}` : line));
  }
  return body.join("");
}

async function downloadWordReport() {
  const report = els.report.value.trim();
  if (!report) {
    toast("请先生成课堂分析报告。")
    return;
  }
  if (!window.JSZip) {
    toast("Word 组件未加载，请刷新页面后重试。")
    return;
  }
  const zip = new window.JSZip();
  const now = new Date().toISOString();
  const body = markdownToDocxBody(report);
  zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>`);
  zip.folder("_rels").file(".rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>`);
  zip.folder("docProps").file("core.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${xmlEscape(els.lessonTitle.value)}课堂观察分析报告</dc:title><dc:creator>EduLink</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created></cp:coreProperties>`);
  zip.folder("docProps").file("app.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>EduLink</Application></Properties>`);
  const word = zip.folder("word");
  word.file("document.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"/></w:sectPr></w:body></w:document>`);
  word.file("styles.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:rPr><w:rFonts w:ascii="Microsoft YaHei" w:eastAsia="Microsoft YaHei"/><w:sz w:val="22"/></w:rPr><w:pPr><w:spacing w:after="100" w:line="360" w:lineRule="auto"/></w:pPr></w:style><w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:pPr><w:jc w:val="center"/><w:spacing w:after="320"/></w:pPr><w:rPr><w:b/><w:sz w:val="40"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:rPr><w:b/><w:color w:val="314F86"/><w:sz w:val="30"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:rPr><w:b/><w:sz w:val="26"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading3"><w:name w:val="heading 3"/><w:basedOn w:val="Normal"/><w:rPr><w:b/><w:sz w:val="23"/></w:rPr></w:style></w:styles>`);
  word.folder("_rels").file("document.xml.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`);
  const blob = await zip.generateAsync({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const safeLesson = (els.lessonTitle.value || "课堂").replace(/[\\/:*?"<>|《》]/g, "").slice(0, 30);
  link.download = `${safeLesson}-课堂观察分析报告.docx`;
  link.click();
  URL.revokeObjectURL(url);
  toast("Word 课堂分析报告已生成。")
}

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (char) => {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
  });
}

async function readDocxText(file) {
  if (window.JSZip) {
    const zip = await window.JSZip.loadAsync(file);
    const documentEntry = zip.file("word/document.xml") || Object.values(zip.files).find((entry) => entry.name.replace(/\\/g, "/") === "word/document.xml");
    const documentXml = await documentEntry?.async("string");
    if (documentXml) {
      const doc = new DOMParser().parseFromString(documentXml, "application/xml");
      const paragraphs = Array.from(doc.getElementsByTagNameNS("*", "p")).map((paragraph) =>
        Array.from(paragraph.getElementsByTagNameNS("*", "t"))
          .map((node) => node.textContent)
          .join("")
          .trim()
      );
      return paragraphs.filter(Boolean).join("\n");
    }
  }

  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  const text = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  const fragments = Array.from(text.matchAll(/<w:t[^>]*>(.*?)<\/w:t>/g)).map((match) =>
    match[1]
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
  );
  if (fragments.length) return fragments.join("");
  return "当前处于离线状态或 JSZip 未加载，浏览器无法直接解析 docx。请联网刷新后重试，或将 Word 内容复制为文本后粘贴到输入框。";
}

async function handleFile(file) {
  if (!file) return;
  const name = file.name.toLowerCase();
  let text = "";
  if (name.endsWith(".docx")) {
    text = await readDocxText(file);
  } else {
    text = await file.text();
  }
  els.transcript.value = text;
  setObservationSource("user");
  state.observationAnalyzedTranscript = "";
  inferMetadataFromFilename(file.name);
  updateTranscriptCount();
  if (text.startsWith("当前处于离线状态")) {
    toast("Word 文件解析失败，请将正文复制到逐字稿输入框。")
    return;
  }
  analyzeTranscript();
  toast(`已导入并分析：${file.name}`);
}

function setReflectionFileState(label, status = "ready") {
  const stateElement = $("#reflection-file-state");
  if (!stateElement) return;
  const icon = status === "ready" ? "file-check-2" : status === "pending" ? "clock-3" : "file-warning";
  stateElement.className = `reflection-file-state ${status}`;
  stateElement.innerHTML = `<i data-lucide="${icon}"></i><span>${escapeHtml(label)}</span>`;
  refreshIcons();
}

async function handleReflectionFile(file) {
  if (!file) return;
  reflectionState.fileName = file.name;
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) {
    setReflectionFileState(`${file.name} · 已接收，等待后端解析`, "pending");
    $("#reflection-source").value = "已接收 PDF 文件。当前前端保留原文件信息，正文抽取与版面解析将在后端接入后完成。你也可以先将 PDF 正文复制到下方编辑区进行本地诊断。";
    inferMetadataFromFilename(file.name);
    renderReflectionWorkspace();
    scheduleWorkspaceSave();
    toast("PDF 文件已接收；请将正文复制到编辑区后开始诊断。")
    return;
  }
  let text = name.endsWith(".docx") ? await readDocxText(file) : await file.text();
  if (text.startsWith("当前处于离线状态")) {
    setReflectionFileState(`${file.name} · 解析失败，请复制正文`, "error");
    toast("Word 文件解析失败，请将正文复制到反思原文框。")
    return;
  }
  $("#reflection-source").value = text.trim();
  inferMetadataFromFilename(file.name);
  $("#reflection-lesson").value = els.lessonTitle.value || $("#reflection-lesson").value;
  setReflectionFileState(`${file.name} · 已解析 ${text.replace(/\s/g, "").length} 字`, "ready");
  renderReflectionWorkspace();
  scheduleWorkspaceSave();
  toast(`已导入反思材料：${file.name}`);
}

function initializeReflectionWorkspace() {
  const dropzone = $("#reflection-dropzone");
  const input = $("#reflection-file-input");
  if (!dropzone || !input || dropzone.dataset.ready) return;
  dropzone.dataset.ready = "true";
  $("#choose-reflection-file").addEventListener("click", () => input.click());
  $("#run-reflection-analysis").addEventListener("click", () => analyzeReflectionSource());
  input.addEventListener("change", (event) => handleReflectionFile(event.target.files[0]));
  ["dragenter", "dragover"].forEach((eventName) => dropzone.addEventListener(eventName, (event) => { event.preventDefault(); dropzone.classList.add("dragging"); }));
  ["dragleave", "drop"].forEach((eventName) => dropzone.addEventListener(eventName, (event) => { event.preventDefault(); dropzone.classList.remove("dragging"); }));
  dropzone.addEventListener("drop", (event) => handleReflectionFile(event.dataTransfer.files[0]));
  dropzone.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); input.click(); } });
  $("#reflection-source").addEventListener("input", () => { $("#reflection-source-count").textContent = `${reflectionSourceText().replace(/\s/g, "").length} 字`; reflectionState.diagnosticReady = false; scheduleWorkspaceSave(); });
  $("#reflection-brief").addEventListener("input", scheduleWorkspaceSave);
  ["#reflection-project", "#reflection-lesson", "#reflection-round", "#reflection-source-type", "#reflection-experiment-goal", "#reflection-experiment-strategy"].forEach((selector) => $(selector)?.addEventListener("input", scheduleWorkspaceSave));
  $("#reflection-round")?.addEventListener("change", () => { renderReflectionTrajectory(); scheduleWorkspaceSave(); });
  $("#reflection-output-types")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-reflection-output]");
    if (!button) return;
    reflectionState.outputType = button.dataset.reflectionOutput;
    $("#output-type").value = reflectionState.outputType;
    $$("#reflection-output-types [data-reflection-output]").forEach((item) => item.classList.toggle("active", item === button));
    scheduleWorkspaceSave();
  });
  $("#reflection-theory-list")?.addEventListener("click", (event) => {
    const option = event.target.closest("[data-reflection-theory-name]");
    if (!option) return;
    const name = option.dataset.reflectionTheoryName;
    reflectionState.selectedTheories = reflectionState.selectedTheories.includes(name)
      ? reflectionState.selectedTheories.filter((item) => item !== name)
      : [...reflectionState.selectedTheories, name];
    reflectionState.activeTheory = name;
    renderReflectionTheories();
    scheduleWorkspaceSave();
  });
  $("#reflection-mapping-table")?.addEventListener("click", (event) => { const row = event.target.closest("[data-reflection-theory-name]"); if (row) renderReflectionTheoryDetail(row.dataset.reflectionTheoryName); });
  $("#reflection-evidence-matrix")?.addEventListener("click", (event) => { const row = event.target.closest("[data-reflection-theory-name]"); if (row) { renderReflectionTheoryDetail(row.dataset.reflectionTheoryName); setWorkspaceSection("reflect-theory"); } });
  $("#reflection-round-switcher")?.addEventListener("click", (event) => { const button = event.target.closest("[data-reflection-round]"); if (!button) return; $("#reflection-round").value = button.dataset.reflectionRound; renderReflectionTrajectory(); scheduleWorkspaceSave(); });
  $("#reflection-timeline")?.addEventListener("click", (event) => { const button = event.target.closest("[data-reflection-round]"); if (!button) return; $("#reflection-round").value = button.dataset.reflectionRound; renderReflectionTrajectory(); });
  $("#confirm-reflection-theories")?.addEventListener("click", () => { reflectionState.activeTheory = reflectionState.selectedTheories[0] || "教学过程最优化理论"; renderReflectionWorkspace(); setWorkspaceSection("reflect-action"); toast(`已确认 ${reflectionState.selectedTheories.length} 类理论，行动策略已更新。`); });
  $("#regenerate-reflection-actions")?.addEventListener("click", () => { renderReflectionActions(); renderReflectionOverview(); scheduleWorkspaceSave(); toast("已依据当前理论组合重新生成改进策略。") });
  $("#add-reflection-round")?.addEventListener("click", () => {
    const next = reflectionState.rounds.length + 1;
    reflectionState.rounds.push({ round: next, date: "待实施", label: "新一轮实践", score: null, status: "待验证", problems: ["等待本轮课堂证据"], strategy: $("#reflection-experiment-strategy").value.trim() || "待制定", result: "尚未开始" });
    const select = $("#reflection-round");
    if (select && !Array.from(select.options).some((option) => Number(option.value) === next)) select.insertAdjacentHTML("beforeend", `<option value="${next}">第 ${next} 轮 · 新一轮实践</option>`);
    select.value = String(next);
    renderReflectionTrajectory(); renderReflectionOverview(); scheduleWorkspaceSave(); setWorkspaceSection("reflect-trajectory"); toast(`已建立第 ${next} 轮改进档案。`);
  });
  $("#new-reflection-project")?.addEventListener("click", () => { $("#reflection-project").value = "新的课堂持续改进项目"; $("#reflection-source").value = ""; reflectionState.fileName = ""; reflectionState.diagnosticReady = false; setReflectionFileState("尚未选择文件", "pending"); renderReflectionWorkspace(); setWorkspaceSection("reflect-material"); toast("已建立新的反思项目。") });
  $("#export-growth-profile")?.addEventListener("click", () => downloadText("EduLink教师成长简报.md", `# 教师专业成长简报\n\n项目：${$("#reflection-project").value}\n\n高频关注：课堂提问、学生参与、概念理解\n\n长期改善：理论解释与行动指标逐步清晰\n\n持续挑战：差异化参与与真实迁移\n\n成长轨迹：${reflectionState.rounds.map((item) => `第${item.round}轮 ${item.label}`).join(" → ")}`));
}

function inferMetadataFromFilename(filename) {
  const cleanName = filename.replace(/\.(docx|txt|md|csv)$/i, "").replace(/[‌‍]/g, "").trim();
  if (cleanName) els.lessonTitle.value = cleanName;
  const gradeMatch = cleanName.match(/([一二三四五六七八九]年级)(上册|下册)?/);
  if (gradeMatch) els.grade.value = `${gradeMatch[1]}${gradeMatch[2] || ""}`;
  if (/数学/.test(cleanName) || /面积|周长|数与形|位置|加几|摆一摆/.test(cleanName)) els.subject.value = "小学数学";
  $("#reflection-brief").value = "请结合本节课的真实感受，重点反思课堂证据中显示的优势、理论落地程度与下一步改进方向。";
  updateLessonContext();
}

function glassSmoothStep(start, end, value) {
  const normalized = Math.max(0, Math.min(1, (value - start) / (end - start)));
  return normalized * normalized * (3 - 2 * normalized);
}

function createLiquidGlassMap(width = 192, height = 128) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) return "";
  const image = context.createImageData(width, height);
  const data = image.data;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const u = (x + 0.5) / width;
      const v = (y + 0.5) / height;
      const edgeDistance = Math.min(u, 1 - u, v, 1 - v);
      const edgeWeight = 1 - glassSmoothStep(0.012, 0.155, edgeDistance);
      const refraction = edgeWeight * edgeWeight * (3 - 2 * edgeWeight);
      const centerX = (0.5 - u) * 2;
      const centerY = (0.5 - v) * 2;
      const rippleX = Math.sin(v * Math.PI * 5.2) * 0.055 * refraction;
      const rippleY = Math.sin(u * Math.PI * 4.4) * 0.045 * refraction;
      const red = Math.round(127.5 + Math.max(-1, Math.min(1, centerX * refraction + rippleX)) * 127.5);
      const green = Math.round(127.5 + Math.max(-1, Math.min(1, centerY * refraction + rippleY)) * 127.5);
      const index = (y * width + x) * 4;
      data[index] = red;
      data[index + 1] = green;
      data[index + 2] = 128;
      data[index + 3] = 255;
    }
  }

  context.putImageData(image, 0, 0);
  return canvas.toDataURL("image/png");
}

function initializeLiquidGlassFilters() {
  const workspace = $("#workspace-app");
  if (!workspace || workspace.dataset.liquidGlassReady) return;
  workspace.dataset.liquidGlassReady = "true";
  const supportsBackdrop = CSS.supports("backdrop-filter", "blur(1px)")
    || CSS.supports("-webkit-backdrop-filter", "blur(1px)");
  const liveRefraction = supportsBackdrop && canUseLiveGlassRefraction();
  if (!liveRefraction) {
    const surfaces = [workspace.querySelector(".rail"), workspace.querySelector(".main")].filter(Boolean);
    surfaces.forEach((surface) => {
      surface.classList.add("liquid-glass-panel");
      const material = document.createElement("span");
      material.className = "liquid-glass-material";
      material.setAttribute("aria-hidden", "true");
      const rimScreen = document.createElement("span");
      rimScreen.className = "liquid-glass-rim rim-screen";
      rimScreen.setAttribute("aria-hidden", "true");
      const rimOverlay = document.createElement("span");
      rimOverlay.className = "liquid-glass-rim rim-overlay";
      rimOverlay.setAttribute("aria-hidden", "true");
      surface.append(material, rimScreen, rimOverlay);
    });
    document.documentElement.classList.toggle("liquid-glass-supported", supportsBackdrop);
    document.documentElement.classList.add("liquid-glass-static");
    return;
  }

  const namespace = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(namespace, "svg");
  const defs = document.createElementNS(namespace, "defs");
  svg.classList.add("liquid-glass-definitions");
  svg.setAttribute("aria-hidden", "true");
  svg.appendChild(defs);
  document.body.appendChild(svg);
  const mapUrl = createLiquidGlassMap();
  liquidGlassAbortController = new AbortController();
  const surfaces = [
    { element: workspace.querySelector(".rail"), width: 168, height: 118, strength: 22 },
    { element: workspace.querySelector(".main"), width: 210, height: 138, strength: 20 }
  ].filter((item) => item.element);

  surfaces.forEach((surface, index) => {
    surface.element.classList.add("liquid-glass-panel");
    const id = `edulink-liquid-glass-${index + 1}`;
    const filter = document.createElementNS(namespace, "filter");
    const image = document.createElementNS(namespace, "feImage");
    const displacement = document.createElementNS(namespace, "feDisplacementMap");
    filter.setAttribute("id", id);
    filter.setAttribute("filterUnits", "userSpaceOnUse");
    filter.setAttribute("color-interpolation-filters", "sRGB");
    filter.setAttribute("x", String(-surface.strength));
    filter.setAttribute("y", String(-surface.strength));
    filter.setAttribute("width", String(surface.width + surface.strength * 2));
    filter.setAttribute("height", String(surface.height + surface.strength * 2));
    image.setAttribute("href", mapUrl);
    image.setAttribute("preserveAspectRatio", "none");
    image.setAttribute("result", `${id}-map`);
    image.setAttribute("width", String(surface.width));
    image.setAttribute("height", String(surface.height));
    displacement.setAttribute("in", "SourceGraphic");
    displacement.setAttribute("in2", `${id}-map`);
    displacement.setAttribute("xChannelSelector", "R");
    displacement.setAttribute("yChannelSelector", "G");
    displacement.setAttribute("scale", String(surface.strength));
    filter.append(image, displacement);
    defs.appendChild(filter);
    const lens = document.createElement("span");
    lens.className = "liquid-glass-lens";
    lens.setAttribute("aria-hidden", "true");
    lens.style.width = `${surface.width}px`;
    lens.style.height = `${surface.height}px`;
    lens.style.setProperty("--liquid-glass-filter", `url(\"#${id}\")`);
    const isRail = surface.element.classList.contains("rail");
    lens.dataset.liquidGlassSurface = isRail ? "rail" : "main";
    const lensHost = isRail ? workspace.querySelector(".shell") || workspace : surface.element;
    lensHost.appendChild(lens);
    const material = document.createElement("span");
    material.className = "liquid-glass-material";
    material.setAttribute("aria-hidden", "true");
    const rimScreen = document.createElement("span");
    rimScreen.className = "liquid-glass-rim rim-screen";
    rimScreen.setAttribute("aria-hidden", "true");
    const rimOverlay = document.createElement("span");
    rimOverlay.className = "liquid-glass-rim rim-overlay";
    rimOverlay.setAttribute("aria-hidden", "true");
    surface.element.append(material, rimScreen, rimOverlay);

    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;
    const moveLens = () => {
      frame = 0;
      const rect = surface.element.getBoundingClientRect();
      const halfWidth = surface.width / 2;
      const halfHeight = surface.height / 2;
      // The rail lens only needs a short overlap at the edge; a full fan-width
      // lens washes out the first column of the workspace content.
      const maxX = rect.width + (isRail ? 32 : 0) - halfWidth;
      const x = Math.max(halfWidth, Math.min(maxX, pointerX - rect.left));
      const y = Math.max(halfHeight, Math.min(rect.height - halfHeight, pointerY - rect.top));
      const viewportX = rect.left + x - halfWidth;
      const viewportY = rect.top + y - halfHeight;
      if (isRail) {
        const hostRect = lensHost.getBoundingClientRect();
        lens.style.transform = `translate3d(${(viewportX - hostRect.left).toFixed(1)}px, ${(viewportY - hostRect.top).toFixed(1)}px, 0)`;
      } else {
        lens.style.transform = `translate3d(${(x - halfWidth).toFixed(1)}px, ${(y - halfHeight).toFixed(1)}px, 0)`;
      }
    };
    if (isRail) {
      document.addEventListener("pointermove", (event) => {
        const target = event.target instanceof Element ? event.target : null;
        if (!target?.closest(".nav-subtree")) {
          lens.classList.remove("active");
          return;
        }
        pointerX = event.clientX;
        pointerY = event.clientY;
        moveLens();
        lens.classList.add("active");
      }, { passive: true, signal: liquidGlassAbortController.signal });
    }
    surface.element.addEventListener("pointerenter", (event) => {
      if (window.matchMedia("(pointer: coarse)").matches) return;
      if (isRail && !event.target.closest(".nav-subtree")) return;
      pointerX = event.clientX;
      pointerY = event.clientY;
      moveLens();
      lens.classList.add("active");
    }, { passive: true, signal: liquidGlassAbortController.signal });
    surface.element.addEventListener("pointermove", (event) => {
      if (window.matchMedia("(pointer: coarse)").matches) return;
      if (isRail && !event.target.closest(".nav-subtree")) {
        lens.classList.remove("active");
        return;
      }
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (!frame) frame = window.requestAnimationFrame(moveLens);
    }, { passive: true, signal: liquidGlassAbortController.signal });
    surface.element.addEventListener("pointerleave", (event) => {
      if (isRail && document.elementFromPoint(event.clientX, event.clientY)?.closest(".nav-subtree")) return;
      lens.classList.remove("active");
    }, { passive: true, signal: liquidGlassAbortController.signal });
  });

  document.documentElement.classList.add("liquid-glass-supported");
}

function rebuildLiquidGlassSurfaceEffects() {
  const workspace = $("#workspace-app");
  if (!workspace) return;
  liquidGlassAbortController?.abort();
  liquidGlassAbortController = null;
  document.querySelectorAll(".liquid-glass-lens").forEach((element) => element.remove());
  workspace.querySelectorAll(".liquid-glass-material, .liquid-glass-rim").forEach((element) => element.remove());
  document.querySelectorAll(".liquid-glass-definitions").forEach((element) => element.remove());
  workspace.dataset.liquidGlassReady = "";
  document.documentElement.classList.remove("liquid-glass-static", "liquid-glass-supported");
  initializeLiquidGlassFilters();
}

function initializeGlassHighlights() {
  const root = document.documentElement;
  if (root.dataset.glassHighlightsReady || root.dataset.workspacePerf !== "high" || !isPointerGlassEnabled()) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce), (pointer: coarse)").matches) return;
  root.dataset.glassHighlightsReady = "true";
  const selector = ".assistant-switcher";
  $$(selector).forEach((element) => element.classList.add("glass-reactive"));
  let activeElement = null;
  let frame = 0;
  let pointerX = 0;
  let pointerY = 0;

  document.addEventListener("pointermove", (event) => {
    if (document.documentElement.dataset.workspacePerf !== "high" || root.dataset.pointerGlass !== "on") {
      activeElement?.style.setProperty("--glass-x", "-320px");
      activeElement?.style.setProperty("--glass-y", "-320px");
      activeElement = null;
      return;
    }
    const target = event.target.closest(selector);
    if (target !== activeElement) {
      activeElement?.style.setProperty("--glass-x", "-320px");
      activeElement?.style.setProperty("--glass-y", "-320px");
      activeElement?.style.setProperty("--glass-angle", "135deg");
      activeElement = target;
    }
    if (!activeElement) return;
    pointerX = event.clientX;
    pointerY = event.clientY;
    if (frame) return;
    frame = window.requestAnimationFrame(() => {
      frame = 0;
      if (!activeElement) return;
      const rect = activeElement.getBoundingClientRect();
      const localX = pointerX - rect.left;
      const localY = pointerY - rect.top;
      activeElement.style.setProperty("--glass-x", `${localX}px`);
      activeElement.style.setProperty("--glass-y", `${localY}px`);
      activeElement.style.setProperty("--glass-nx", (localX / Math.max(1, rect.width)).toFixed(3));
      activeElement.style.setProperty("--glass-ny", (localY / Math.max(1, rect.height)).toFixed(3));
      const angle = 135 + (localX / Math.max(1, rect.width) - 0.5) * 72 + (localY / Math.max(1, rect.height) - 0.5) * 18;
      activeElement.style.setProperty("--glass-angle", `${angle.toFixed(2)}deg`);
    });
  }, { passive: true });
}

function initializeInteractionEffects() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const selector = ".primary, .banner-button, .assistant-tab, .icon-button, .portfolio-download";
  document.addEventListener("pointerdown", (event) => {
    const button = event.target.closest(selector);
    if (!button || button.disabled) return;
    const rect = button.getBoundingClientRect();
    const ripple = document.createElement("span");
    ripple.className = "ui-ripple";
    ripple.style.left = `${event.clientX - rect.left}px`;
    ripple.style.top = `${event.clientY - rect.top}px`;
    button.appendChild(ripple);
    ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
    window.setTimeout(() => ripple.remove(), 700);
  });
}

function initializeScrollReveals() {
  if (prefersReducedMotion() || !("IntersectionObserver" in window)) return;
  const selector = [
    ".dashboard-main > .card",
    ".insight-column > .card",
    ".reflection-main > .card",
    ".reflection-aside > .card",
    ".overview-ribbon > .card",
    ".reflection-overview > .card"
  ].join(",");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-revealed");
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -9%", threshold: 0.08 });
  $$(selector).forEach((element, index) => {
    element.classList.add("reveal-stage");
    element.style.setProperty("--reveal-order", String(index % 4));
    observer.observe(element);
  });
}

function initializePointerMotion() {
  if (window.matchMedia("(prefers-reduced-motion: reduce), (pointer: coarse)").matches) return;
  const root = document.documentElement;
  if (root.dataset.pointerMotionReady || root.dataset.workspacePerf !== "high") return;
  root.dataset.pointerMotionReady = "true";
  const tiltTargets = $$(".metric, .signal-stat, .conversion-step, .assistant-tab");
  tiltTargets.forEach((target) => {
    target.classList.add("motion-surface");
    let frame = 0;
    target.addEventListener("pointermove", (event) => {
      if (document.documentElement.dataset.workspacePerf !== "high") return;
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const rect = target.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        target.style.setProperty("--tilt-x", `${(-y * 3.2).toFixed(2)}deg`);
        target.style.setProperty("--tilt-y", `${(x * 4.2).toFixed(2)}deg`);
        target.style.setProperty("--shine-x", `${((x + 0.5) * 100).toFixed(1)}%`);
        target.style.setProperty("--shine-y", `${((y + 0.5) * 100).toFixed(1)}%`);
      });
    }, { passive: true });
    target.addEventListener("pointerleave", () => {
      target.style.setProperty("--tilt-x", "0deg");
      target.style.setProperty("--tilt-y", "0deg");
      target.style.setProperty("--shine-x", "-100%");
      target.style.setProperty("--shine-y", "-100%");
    });
  });

  const magneticTargets = $$(".primary, .banner-button, .assistant-tab, .top-actions .icon-button");
  magneticTargets.forEach((button) => {
    button.classList.add("motion-magnetic");
    button.addEventListener("pointermove", (event) => {
      if (document.documentElement.dataset.workspacePerf !== "high") return;
      const rect = button.getBoundingClientRect();
      button.style.setProperty("--mag-x", `${((event.clientX - rect.left - rect.width / 2) * 0.1).toFixed(1)}px`);
      button.style.setProperty("--mag-y", `${((event.clientY - rect.top - rect.height / 2) * 0.1).toFixed(1)}px`);
    }, { passive: true });
    button.addEventListener("pointerleave", () => {
      button.style.setProperty("--mag-x", "0px");
      button.style.setProperty("--mag-y", "0px");
    });
  });
}

function initializeMotionSystem() {
  if (prefersReducedMotion()) return;
  document.documentElement.classList.add("motion-ready");
  initializeScrollReveals();
  initializePointerMotion();
}

function initializeWorkspaceAtmosphere() {
  const canvas = $("#workspace-atmosphere");
  if (!canvas) return;
  if (document.documentElement.dataset.workspacePerf !== "high") {
    canvas.style.display = "none";
    stopWorkspaceAtmosphere();
    return;
  }
  canvas.style.display = "block";
  if (canvas.dataset.ready) {
    if (!workspaceMotionState.canvasFrame && workspaceMotionState.canvasPaint && document.body.classList.contains("workspace-active")) {
      workspaceMotionState.canvasFrame = window.requestAnimationFrame(workspaceMotionState.canvasPaint);
    }
    return;
  }
  canvas.dataset.ready = "true";
  const context = canvas.getContext("2d", { alpha: true });
  if (!context) return;
  let width = 0;
  let height = 0;
  let ratio = 1;
  const resize = () => {
    if (window.innerWidth >= 3200) ratio = 0.5;
    else if (window.innerWidth >= 2200) ratio = 0.72;
    else ratio = Math.min(1.25, window.devicePixelRatio || 1);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  };
  resize();
  window.addEventListener("resize", resize, { passive: true });
  const colors = ["120,80,238", "0,132,255", "253,103,208"];
  const paint = (timestamp) => {
    if (document.hidden || !document.body.classList.contains("workspace-active")) {
      workspaceMotionState.canvasFrame = 0;
      return;
    }
    workspaceMotionState.canvasFrame = window.requestAnimationFrame(paint);
    if (timestamp - workspaceMotionState.lastCanvasPaint < 96) return;
    workspaceMotionState.lastCanvasPaint = timestamp;
    context.clearRect(0, 0, width, height);
    const time = timestamp * 0.00011;
    for (let index = 0; index < 9; index += 1) {
      const baseY = height * (0.08 + index * 0.115);
      const amplitude = 18 + index * 2.5;
      const drift = Math.sin(time * (1 + index * 0.04) + index * 0.76) * amplitude;
      context.beginPath();
      context.moveTo(-80, baseY + drift);
      context.bezierCurveTo(
        width * 0.26,
        baseY - amplitude * 1.7 + Math.cos(time + index) * 16,
        width * 0.68,
        baseY + amplitude * 1.5 + Math.sin(time * 1.3 + index) * 18,
        width + 80,
        baseY - drift * 0.45
      );
      context.strokeStyle = `rgba(${colors[index % colors.length]},${0.055 + (index % 3) * 0.012})`;
      context.lineWidth = index % 3 === 0 ? 1.2 : 0.7;
      context.setLineDash(index % 2 ? [7, 15] : []);
      context.lineDashOffset = -timestamp * (index % 2 ? 0.004 : 0.0015);
      context.stroke();
    }
    context.setLineDash([]);
  };
  workspaceMotionState.canvasPaint = paint;
  workspaceMotionState.canvasFrame = window.requestAnimationFrame(paint);
}

function stopWorkspaceAtmosphere() {
  if (workspaceMotionState.canvasFrame) window.cancelAnimationFrame(workspaceMotionState.canvasFrame);
  workspaceMotionState.canvasFrame = 0;
}

function initializeWorkspaceParallax() {
  const workspace = $("#workspace-app");
  if (!workspace || workspace.dataset.parallaxReady || document.documentElement.dataset.workspacePerf !== "high") return;
  if (prefersReducedMotion() || window.matchMedia("(pointer: coarse)").matches) return;
  workspace.dataset.parallaxReady = "true";
  $$("#workspace-app .workspace-banner, #workspace-app .sixarts-course-hero").forEach((banner) => {
    banner.addEventListener("pointermove", (event) => {
      if (document.documentElement.dataset.workspacePerf !== "high") return;
      const rect = banner.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      banner.style.setProperty("--scene-x", `${(x * 15).toFixed(1)}px`);
      banner.style.setProperty("--scene-y", `${(y * 11).toFixed(1)}px`);
      banner.style.setProperty("--scene-rotate", `${(x * 1.1).toFixed(2)}deg`);
      banner.style.setProperty("--light-x", `${((x + 0.5) * 100).toFixed(1)}%`);
      banner.style.setProperty("--light-y", `${((y + 0.5) * 100).toFixed(1)}%`);
    }, { passive: true });
    banner.addEventListener("pointerleave", () => {
      banner.style.setProperty("--scene-x", "0px");
      banner.style.setProperty("--scene-y", "0px");
      banner.style.setProperty("--scene-rotate", "0deg");
    });
  });
}

function initializeWorkspaceScrollMotion() {
  if ($("#workspace-scroll-progress").dataset.ready) return;
  $("#workspace-scroll-progress").dataset.ready = "true";
  let frame = 0;
  const update = () => {
    frame = 0;
    const total = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = Math.max(0, Math.min(1, window.scrollY / total));
    $("#workspace-scroll-progress").style.transform = `scaleX(${progress})`;
    if (!prefersReducedMotion() && document.body.classList.contains("workspace-active") && document.documentElement.dataset.workspacePerf === "high") {
      $$("#workspace-app .workspace-banner, #workspace-app .sixarts-course-hero, #workspace-app .sixarts-resource-image img, #workspace-app .method-media video").forEach((target) => {
        const rect = target.getBoundingClientRect();
        if (rect.bottom < -100 || rect.top > window.innerHeight + 100) return;
        const normalized = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
        target.style.setProperty("--scroll-y", `${Math.max(-14, Math.min(14, normalized * -18)).toFixed(1)}px`);
      });
    }
  };
  const requestUpdate = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(update);
  };
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate, { passive: true });
  requestUpdate();
}

function initializeEditorialWorkspaceMotion() {
  if (!document.body.classList.contains("workspace-active")) return;
  applyWorkspacePerformanceMode();
  prepareWorkspaceCurtain();
  initializeWorkspaceAtmosphere();
  initializeWorkspaceParallax();
  initializeWorkspaceScrollMotion();
}

function initializeEntryCurtainScroll() {
  const entry = $("#entry-experience");
  const sections = [$("#entry-method"), $("#entry-assistants")].filter(Boolean);
  if (!entry || !sections.length || entry.dataset.curtainReady) return;
  entry.dataset.curtainReady = "true";
  const desktopMotion = window.matchMedia("(min-width: 1181px) and (min-height: 700px) and (pointer: fine)");
  const sliceLayer = document.createElement("div");
  sliceLayer.className = "entry-scroll-slice-layer";
  sliceLayer.setAttribute("aria-hidden", "true");
  const sliceScenes = sections.map((section, index) => {
    const scene = document.createElement("div");
    scene.className = "entry-scroll-slice-scene";
    scene.dataset.sliceScene = String(index);
    const clone = section.cloneNode(true);
    clone.removeAttribute("id");
    clone.classList.add("entry-curtain-clone");
    clone.querySelectorAll("[id]").forEach((element) => element.removeAttribute("id"));
    clone.querySelectorAll("[data-method-video]").forEach((element) => element.removeAttribute("data-method-video"));
    clone.querySelectorAll("button, input, select, textarea, a, [tabindex]").forEach((element) => element.setAttribute("tabindex", "-1"));
    clone.querySelectorAll("video").forEach((video) => {
      if (video.dataset.src) {
        video.dataset.sliceSrc = video.dataset.src;
        video.removeAttribute("data-src");
      }
      video.preload = "none";
      video.muted = true;
      video.playsInline = true;
    });
    scene.appendChild(clone);
    sliceLayer.appendChild(scene);
    return scene;
  });
  entry.appendChild(sliceLayer);

  let frame = 0;
  let lastSliceProgress = -1;
  let lastSliceScene = -1;
  let sliceVideosReady = false;
  const quality = document.documentElement.dataset.workspacePerf || "medium";
  const stripeCount = quality === "low" ? 14 : quality === "medium" ? 22 : 32;
  let timelineOffsets = sections.map((section) => section.offsetTop);

  const measureTimeline = () => {
    const ready = document.body.classList.contains("entry-curtain-ready");
    if (ready) document.body.classList.remove("entry-curtain-ready");
    timelineOffsets = sections.map((section) => section.getBoundingClientRect().top + window.scrollY);
    if (ready) document.body.classList.add("entry-curtain-ready");
    lastSliceProgress = -1;
    lastSliceScene = -1;
  };

  const prepareSliceVideos = () => {
    if (sliceVideosReady) return;
    sliceVideosReady = true;
    sliceLayer.querySelectorAll("video[data-slice-src]").forEach((video) => {
      video.src = video.dataset.sliceSrc;
      video.removeAttribute("data-slice-src");
      video.preload = "metadata";
      video.load();
    });
  };

  const renderSliceMask = (progress, sceneIndex) => {
    if (sceneIndex === lastSliceScene && Math.abs(progress - lastSliceProgress) < 0.001) return;
    lastSliceScene = sceneIndex;
    lastSliceProgress = progress;
    const images = [];
    const positions = [];
    const band = window.innerHeight / stripeCount;
    for (let index = 0; index < stripeCount; index += 1) {
      const distanceFromBottom = (stripeCount - 1 - index) / (stripeCount - 1);
      const ripple = Math.sin((index + 1) * 0.86) * 0.018;
      const start = Math.max(0, Math.min(0.68, distanceFromBottom * 0.66 + ripple));
      const local = Math.max(0, Math.min(1, (progress - start) / 0.26));
      const eased = local * local * (3 - 2 * local);
      const visible = eased * 100;
      if (visible <= 0.02) {
        images.push("linear-gradient(180deg, transparent, transparent)");
      } else if (visible >= 99.98) {
        images.push("linear-gradient(180deg, #000, #000)");
      } else {
        const startEdge = (100 - visible) / 2;
        const endEdge = 100 - startEdge;
        const feather = Math.min(5, Math.max(0.8, visible * 0.22));
        const solidStart = Math.min(50, startEdge + feather);
        const solidEnd = Math.max(50, endEdge - feather);
        images.push(`linear-gradient(180deg, transparent 0%, transparent ${startEdge.toFixed(2)}%, rgba(0,0,0,.72) ${solidStart.toFixed(2)}%, #000 ${Math.min(50, solidStart + 1.2).toFixed(2)}%, #000 ${Math.max(50, solidEnd - 1.2).toFixed(2)}%, rgba(0,0,0,.72) ${solidEnd.toFixed(2)}%, transparent ${endEdge.toFixed(2)}%, transparent 100%)`);
      }
      positions.push(`0 ${(index * band).toFixed(2)}px`);
    }
    const maskImage = images.join(",");
    const maskPosition = positions.join(",");
    const maskSize = `100% ${(band + 0.7).toFixed(2)}px`;
    sliceLayer.style.maskImage = maskImage;
    sliceLayer.style.maskPosition = maskPosition;
    sliceLayer.style.maskSize = maskSize;
    sliceLayer.style.maskRepeat = "no-repeat";
    sliceLayer.style.webkitMaskImage = maskImage;
    sliceLayer.style.webkitMaskPosition = maskPosition;
    sliceLayer.style.webkitMaskSize = maskSize;
    sliceLayer.style.webkitMaskRepeat = "no-repeat";
  };

  const clearMotion = () => {
    document.body.classList.remove("entry-curtain-ready");
    sliceLayer.classList.remove("active");
    sliceLayer.style.removeProperty("opacity");
    sliceScenes.forEach((scene) => scene.classList.remove("active"));
    lastSliceProgress = -1;
    lastSliceScene = -1;
    [$(".entry-hero"), ...sections].filter(Boolean).forEach((section) => {
      section.style.removeProperty("--entry-curtain-progress");
      section.style.removeProperty("--entry-curtain-shift");
      section.style.removeProperty("--entry-curtain-content-shift");
      section.style.removeProperty("--entry-exit-progress");
      section.style.removeProperty("--entry-section-opacity");
    });
  };

  const update = () => {
    frame = 0;
    const enabled = document.body.classList.contains("entry-active") && desktopMotion.matches && !prefersReducedMotion();
    if (!enabled) {
      clearMotion();
      return;
    }
    document.body.classList.add("entry-curtain-ready");
    prepareSliceVideos();
    const viewport = Math.max(1, window.innerHeight);
    const previousSections = [$(".entry-hero"), $("#entry-method")];
    let activeScene = -1;
    let activeProgress = 0;
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - viewport);
    sections.forEach((section, index) => {
      const start = index === 0 ? 0 : timelineOffsets[index - 1];
      const end = Math.max(start + 1, Math.min(timelineOffsets[index], maxScroll));
      const progress = Math.max(0, Math.min(1, (window.scrollY - start) / (end - start)));
      const eased = progress * progress * (3 - 2 * progress);
      const handoff = Math.max(0, Math.min(1, (progress - 0.992) / 0.008));
      const handoffEased = handoff * handoff * (3 - 2 * handoff);
      const handoffOffset = progress >= 0.992 ? -((end - start) * (1 - progress)) : (1 - eased) * 34;
      section.style.setProperty("--entry-curtain-progress", eased.toFixed(4));
      section.style.setProperty("--entry-curtain-shift", `${handoffOffset.toFixed(2)}px`);
      section.style.setProperty("--entry-curtain-content-shift", `${((1 - eased) * 26).toFixed(2)}px`);
      section.style.setProperty("--entry-section-opacity", progress >= 0.992 ? "1" : "0");
      previousSections[index]?.style.setProperty("--entry-exit-progress", eased.toFixed(4));
      if (progress > 0.002 && progress < 1) {
        activeScene = index;
        activeProgress = progress;
        sliceLayer.style.opacity = (1 - handoffEased).toFixed(4);
      }
    });
    sliceLayer.classList.toggle("active", activeScene >= 0);
    sliceScenes.forEach((scene, index) => scene.classList.toggle("active", index === activeScene));
    if (activeScene >= 0) renderSliceMask(activeProgress, activeScene);
    else sliceLayer.style.opacity = "0";
  };

  const requestUpdate = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(update);
  };
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", () => {
    measureTimeline();
    requestUpdate();
  }, { passive: true });
  window.addEventListener("edulink:portalchange", requestUpdate);
  desktopMotion.addEventListener?.("change", requestUpdate);
  document.fonts?.ready.then(() => {
    measureTimeline();
    requestUpdate();
  }).catch(() => {});
  requestUpdate();
}

function initializeMethodVideos() {
  const cards = $$('[data-method-video]');
  if (!cards.length) return;
  const loadVideo = (video) => {
    if (video.src || !video.dataset.src) return;
    video.src = video.dataset.src;
    video.load();
  };
  const playCard = (card) => {
    const video = card.querySelector("video");
    loadVideo(video);
    card.classList.add("is-playing");
    const play = video.play();
    if (play?.catch) play.catch(() => card.classList.remove("is-playing"));
  };
  const pauseCard = (card) => {
    const video = card.querySelector("video");
    video.pause();
    card.classList.remove("is-playing");
  };
  const loader = "IntersectionObserver" in window
    ? new IntersectionObserver((entries, observer) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      loadVideo(entry.target.querySelector("video"));
      observer.unobserve(entry.target);
    }), { rootMargin: "220px 0px" })
    : null;
  cards.forEach((card) => {
    if (loader) loader.observe(card);
    else loadVideo(card.querySelector("video"));
    card.addEventListener("pointerenter", () => playCard(card));
    card.addEventListener("pointerleave", () => pauseCard(card));
    card.addEventListener("focusin", () => playCard(card));
    card.addEventListener("focusout", () => pauseCard(card));
    card.addEventListener("click", () => {
      if (window.matchMedia("(hover: none)").matches) {
        if (card.classList.contains("is-playing")) pauseCard(card);
        else playCard(card);
      }
    });
  });
}

function getSelectedLearningTheory() {
  return getTheoryProfileById(assistantState.theory.selectedId) || learningTheoryProfiles[0];
}

function renderTheoryOverview() {
  $("#theory-category-map").innerHTML = theoryCategories.map((category, index) => `<button type="button" data-theory-category="${category.name}" style="--category-index:${index}">
    <span><i data-lucide="${category.icon}"></i></span>
    <div><b>${category.name}</b><small>${category.note}</small></div>
    <em>${category.count}</em><i data-lucide="arrow-up-right"></i>
  </button>`).join("");
  const planned = assistantState.theory.plan.map((id) => getTheoryProfileById(id)).filter(Boolean);
  $("#theory-plan-list").innerHTML = planned.length ? planned.map((item, index) => `<button type="button" data-theory-id="${item.id}" data-theory-open="detail"><span>${String(index + 1).padStart(2, "0")}</span><div><b>${item.name}</b><small>${item.group} · ${item.tags[0]}</small></div><i data-lucide="chevron-right"></i></button>`).join("") : `<div class="theory-plan-empty"><i data-lucide="bookmark"></i><b>学习计划还是空的</b><p>从理论库中选择感兴趣的理论，建立自己的学习路径。</p><button type="button" data-workspace-section="theory-library">浏览理论库</button></div>`;
  $("#theory-plan-count").textContent = `${planned.length} 项`;
  $("#theory-learned-count").innerHTML = `${planned.length} <span class="theory-stat-unit">项</span>`;
  const answered = Number(assistantState.theory.scenarioAnsweredCount || 0);
  $("#theory-quiz-score").textContent = answered ? `${Math.round((assistantState.theory.scenarioScore / answered) * 100)}%` : "0%";
}

function renderTheoryLibraryLegacy() {
  const query = assistantState.theory.query.trim().toLowerCase();
  const selection = getTheoryDirectorySelection();
  renderTheoryDirectoryNav(selection);
  const allRecords = getAllTheoryDirectoryRecords();
  const records = query
    ? allRecords.filter((record) => `${record.name} ${record.category.name} ${record.section.name} ${record.group.name}`.toLowerCase().includes(query))
    : selection.group.theories.map((name) => ({ name, ...selection }));
  const selectedDirectoryTheory = assistantState.theory.directoryTheory || "";
  $("#learning-theory-grid").innerHTML = records.length ? records.map((record) => {
    const profile = getTheoryProfileByName(record.name) || ensureDirectoryTheoryProfile(record);
    const active = selectedDirectoryTheory === record.name || profile?.id === assistantState.theory.selectedId;
    const tags = profile?.tags || [record.group.name, record.section.name];
    return `<button type="button" class="theory-directory-card${active ? " active" : ""}" data-directory-theory="${escapeHtml(record.name)}" data-directory-category-index="${record.categoryIndex}" data-directory-section-index="${record.sectionIndex}" data-directory-group-index="${record.groupIndex}"${profile ? ` data-directory-profile-id="${profile.id}"` : ""}>
      <span class="theory-directory-card-icon"><i data-lucide="${getTheoryIcon(profile || { group: record.category.name })}"></i></span>
      <span class="theory-directory-card-copy"><b>${escapeHtml(record.name)}</b><small>${escapeHtml(record.category.name)} / ${escapeHtml(record.section.name)}</small><em>${tags.slice(0, 2).map((tag) => escapeHtml(tag)).join(" · ")}</em></span>
      <i data-lucide="arrow-right"></i>
    </button>`;
  }).join("") : `<div class="theory-library-empty"><i data-lucide="search-x"></i><h3>没有找到匹配理论</h3><p>请更换关键词或从左侧目录重新选择。</p></div>`;
  const title = query ? `“${assistantState.theory.query.trim()}”的搜索结果` : selection.group.name;
  const breadcrumb = query ? "跨目录检索" : `${selection.category.name} / ${selection.section.name}`;
  $("#theory-directory-level").textContent = query ? "全库搜索" : "三级专题";
  $("#theory-directory-title").textContent = title;
  $("#theory-directory-breadcrumb").textContent = breadcrumb;
  $("#theory-directory-count").textContent = `${records.length} 条理论`;
  $("#theory-directory-total").textContent = THEORY_INDEX_DISPLAY_TOTAL;
  if ($("#theory-library-query").value !== assistantState.theory.query) $("#theory-library-query").value = assistantState.theory.query;
  refreshIcons();
}

const theoryLibraryAbilities = [
  { key: "explanation", title: "理论解释", eyebrow: "读懂核心与边界", icon: "book-open", description: "从概念、核心观点与适用边界建立可引用的理论认识。", facts: ["理论定位", "核心观点", "适用边界"], target: "detail", tab: "explanation", action: "阅读理论" },
  { key: "paradigm", title: "教理范式", eyebrow: "形成实施框架", icon: "boxes", description: "把理论机制转化为教学步骤、教师支持和评价证据。", facts: ["实施步骤", "教师行为", "评价证据"], target: "detail", tab: "paradigm", action: "查看范式" },
  { key: "application", title: "学科应用", eyebrow: "连接学科任务", icon: "graduation-cap", description: "面向具体学科内容提炼理论的课堂落地方式。", facts: ["学科适配", "内容转译", "教学策略"], target: "detail", tab: "application", action: "查看应用" },
  { key: "example", title: "课堂范本", eyebrow: "看见实践样态", icon: "presentation", description: "通过课堂案例、师生行为与观察证据理解理论如何发生。", facts: ["课堂课例", "师生行为", "观察证据"], target: "detail", tab: "example", action: "查看范本" },
  { key: "comparison", title: "理论辨析", eyebrow: "澄清相近边界", icon: "scale", description: "在共同维度下比较理论异同，判断真正适用的教学情境。", facts: ["共同维度", "关键差异", "适用情境"], target: "detail", tab: "comparison", action: "开始辨析" },
  { key: "training", title: "专项训练", eyebrow: "练习证据判断", icon: "message-square-text", description: "进入真实课堂情境作出判断，并查看基于理论证据的完整解析。", facts: ["真实情境", "判断任务", "反馈解析"], target: "scenario", action: "进入训练" }
];

function getTheoryLibraryMetrics() {
  const categories = theoryDirectoryData.categories || [];
  const sectionCount = categories.reduce((sum, category) => sum + category.sections.length, 0);
  const groupCount = categories.reduce((sum, category) => sum + category.sections.reduce((inner, section) => inner + section.groups.length, 0), 0);
  const records = getAllTheoryDirectoryRecords();
  const uniqueTheoryCount = new Set(records.map((record) => record.name)).size;
  const theoryCount = THEORY_INDEX_DISPLAY_TOTAL;
  return {
    theoryCount,
    uniqueTheoryCount,
    categoryCount: categories.length,
    groupCount,
    nodeCount: 1 + categories.length + sectionCount + groupCount + theoryCount,
    relationCount: categories.length + sectionCount + groupCount + records.length
  };
}

function getTheoryLibraryContextRecord(selection = getTheoryDirectorySelection()) {
  const allRecords = getAllTheoryDirectoryRecords();
  const selectedProfile = getTheoryProfileById(assistantState.theory.librarySelectedTheoryId);
  return allRecords.find((record) => record.name === selectedProfile?.name)
    || allRecords.find((record) => record.name === assistantState.theory.directoryTheory)
    || allRecords.find((record) => record.name === getSelectedLearningTheory()?.name)
    || allRecords.find((record) => record.categoryIndex === selection.categoryIndex && record.sectionIndex === selection.sectionIndex && record.groupIndex === selection.groupIndex)
    || allRecords[0];
}

function getTheoryLibrarySearchText(record) {
  const profile = getTheoryProfileByName(record.name);
  return [record.name, record.category.name, record.section.name, record.group.name, profile?.english, profile?.mechanism, profile?.summary, ...(profile?.tags || [])]
    .filter(Boolean).join(" ").toLocaleLowerCase();
}

function renderTheoryLibraryMetrics() {
  const metrics = getTheoryLibraryMetrics();
  const cards = [
    ["book-open-check", metrics.theoryCount, "理论总量", "覆盖当前完整理论目录"],
    ["layers-3", metrics.categoryCount, "一级板块", "形成稳定知识入口"],
    ["folders", metrics.groupCount, "专题目录", "支持分层定位与检索"],
    ["network", metrics.nodeCount, "知识节点", "目录与理论协同关联"],
    ["git-branch", metrics.relationCount, "结构连接", "用于解释理论位置"]
  ];
  $("#theory-library-metrics").innerHTML = cards.map(([icon, value, title, note], index) => `<article style="--metric-index:${index}"><span><i data-lucide="${icon}"></i></span><div><strong>${value}</strong><b>${title}</b><small>${note}</small></div></article>`).join("");
  $("#theory-overview-directory-total").textContent = metrics.theoryCount;
}

function renderTheoryLibraryOverviewDirectoryLegacy(selection) {
  const nav = $("#theory-overview-directory-nav");
  if (!nav) return;
  const query = String(assistantState.theory.directoryQuery || "").trim().toLocaleLowerCase();
  nav.innerHTML = theoryDirectoryData.categories.map((category, categoryIndex) => {
    const categoryText = `${category.name} ${category.sections.flatMap((section) => [section.name, ...section.groups.flatMap((group) => [group.name, ...group.theories])]).join(" ")}`.toLocaleLowerCase();
    if (query && !categoryText.includes(query)) return "";
    const categoryActive = categoryIndex === selection.categoryIndex;
    const sectionRows = categoryActive || query ? category.sections.map((section, sectionIndex) => {
      const sectionText = `${section.name} ${section.groups.flatMap((group) => [group.name, ...group.theories]).join(" ")}`.toLocaleLowerCase();
      if (query && !sectionText.includes(query)) return "";
      const sectionActive = categoryActive && sectionIndex === selection.sectionIndex;
      const groupRows = sectionActive || query ? section.groups.map((group, groupIndex) => {
        const groupText = `${group.name} ${group.theories.join(" ")}`.toLocaleLowerCase();
        if (query && !groupText.includes(query)) return "";
        return `<button class="theory-overview-group${sectionActive && groupIndex === selection.groupIndex ? " active" : ""}" type="button" data-theory-overview-category="${categoryIndex}" data-theory-overview-section="${sectionIndex}" data-theory-overview-group="${groupIndex}"><span>${escapeHtml(group.name)}</span><em>${group.theories.length}</em></button>`;
      }).join("") : "";
      return `<section class="${sectionActive ? "open" : ""}"><button type="button" data-theory-overview-category="${categoryIndex}" data-theory-overview-section="${sectionIndex}" data-theory-overview-group="0"><i data-lucide="${sectionActive ? "folder-open" : "folder"}"></i><span>${escapeHtml(section.name)}</span><em>${countTheoryDirectoryNode(section)}</em></button>${groupRows ? `<div>${groupRows}</div>` : ""}</section>`;
    }).join("") : "";
    return `<article class="${categoryActive ? "open" : ""}"><button type="button" data-theory-overview-category="${categoryIndex}" data-theory-overview-section="0" data-theory-overview-group="0"><span>${String(categoryIndex + 1).padStart(2, "0")}</span><b>${escapeHtml(category.name)}</b><em>${countTheoryDirectoryNode(category)}</em><i data-lucide="chevron-down"></i></button>${sectionRows ? `<div class="theory-overview-sections">${sectionRows}</div>` : ""}</article>`;
  }).join("") || `<div class="theory-overview-directory-empty"><i data-lucide="search-x"></i><span>没有匹配的目录</span></div>`;
  const input = $("#theory-overview-directory-query");
  if (input && input.value !== assistantState.theory.directoryQuery) input.value = assistantState.theory.directoryQuery || "";
}

function renderTheoryLibraryLensLegacy(selection) {
  const stage = $("#theory-library-lens-stage");
  if (!stage) return;
  const lens = ["map", "structure", "index"].includes(assistantState.theory.libraryLens) ? assistantState.theory.libraryLens : "map";
  assistantState.theory.libraryLens = lens;
  $$("[data-theory-library-lens]").forEach((button) => button.classList.toggle("active", button.dataset.theoryLibraryLens === lens));
  if (lens === "map") {
    const positions = [[50, 9], [86, 36], [72, 82], [28, 82], [14, 36]];
    const lines = positions.map(([x, y]) => `<line x1="50" y1="50" x2="${x}" y2="${y}" />`).join("");
    const nodes = theoryDirectoryData.categories.map((category, index) => {
      const [x, y] = positions[index] || [50, 50];
      return `<button type="button" class="theory-map-node${index === selection.categoryIndex ? " active" : ""}" style="--node-x:${x}%;--node-y:${y}%" data-theory-overview-category="${index}" data-theory-overview-section="0" data-theory-overview-group="0"><span>${String(index + 1).padStart(2, "0")}</span><b>${escapeHtml(category.name)}</b><em>${countTheoryDirectoryNode(category)} 条</em></button>`;
    }).join("");
    stage.innerHTML = `<div class="theory-map-stage"><svg viewBox="0 0 100 100" aria-hidden="true">${lines}</svg><div class="theory-map-center"><i data-lucide="brain-circuit"></i><strong>教育理论</strong><span>${getTheoryLibraryMetrics().theoryCount} 条理论</span></div>${nodes}<small class="theory-map-hint"><i data-lucide="mouse-pointer-2"></i>选择知识节点查看对应理论范围</small></div>`;
  } else if (lens === "structure") {
    stage.innerHTML = `<div class="theory-structure-stage">${theoryDirectoryData.categories.map((category, categoryIndex) => `<article class="${categoryIndex === selection.categoryIndex ? "active" : ""}"><button type="button" data-theory-overview-depth="1" data-theory-overview-category="${categoryIndex}" data-theory-overview-section="0" data-theory-overview-group="0"><span>${String(categoryIndex + 1).padStart(2, "0")}</span><div><b>${escapeHtml(category.name)}</b><small>${category.sections.length} 个二级目录 · ${countTheoryDirectoryNode(category)} 条理论</small></div><i data-lucide="arrow-up-right"></i></button><div>${category.sections.slice(0, 5).map((section, sectionIndex) => `<button type="button" data-theory-overview-depth="2" data-theory-overview-category="${categoryIndex}" data-theory-overview-section="${sectionIndex}" data-theory-overview-group="0"><span>${escapeHtml(section.name)}</span><em>${countTheoryDirectoryNode(section)}</em></button>`).join("")}</div></article>`).join("")}</div>`;
  } else {
    const records = selection.group.theories.map((name) => ({ name, ...selection }));
    stage.innerHTML = `<div class="theory-index-head"><div><p>THEORY INDEX</p><h3>${escapeHtml(selection.group.name)}</h3><span>${escapeHtml(selection.category.name)} / ${escapeHtml(selection.section.name)}</span></div><b>${records.length}<small> 条理论</small></b></div><div class="theory-index-list">${records.map((record, index) => {
      const profile = getTheoryProfileByName(record.name) || ensureDirectoryTheoryProfile(record);
      return `<button type="button" data-directory-theory="${escapeHtml(record.name)}" data-directory-category-index="${record.categoryIndex}" data-directory-section-index="${record.sectionIndex}" data-directory-group-index="${record.groupIndex}" data-directory-profile-id="${profile.id}"><span>${String(index + 1).padStart(2, "0")}</span><b>${escapeHtml(record.name)}</b><i data-lucide="arrow-right"></i></button>`;
    }).join("")}</div>`;
  }
}

function renderTheoryLibraryAbilities(selection) {
  const ability = theoryLibraryAbilities.find((item) => item.key === assistantState.theory.libraryAbility) || theoryLibraryAbilities[0];
  assistantState.theory.libraryAbility = ability.key;
  const profile = getTheoryProfileById(assistantState.theory.librarySelectedTheoryId) || getTheoryProfileByName(getTheoryLibraryContextRecord(selection)?.name);
  const currentName = profile?.name || selection.group.name;
  const currentGroup = profile?.group || selection.group.name;
  const selectedCard = profile ? `<article class="theory-library-selected-card"><div><span><i data-lucide="${getTheoryIcon(profile)}"></i></span><section><small>当前选中理论</small><b>${escapeHtml(profile.name)}</b><em>${escapeHtml(currentGroup)}</em></section></div><div class="theory-library-selected-tags"><em>理论定位</em><em>核心观点</em><em>适用边界</em></div><button type="button" data-theory-library-selected-detail="${escapeHtml(profile.id)}">查看理论详情 <i data-lucide="arrow-right"></i></button></article>` : "";
  $("#theory-library-ability-detail").innerHTML = selectedCard || `<article class="theory-library-selected-card is-empty"><small>当前选中理论</small><b>${escapeHtml(currentName)}</b><span>点击地图或目录中的理论节点，在这里查看应用路径。</span></article>`;
  $("#theory-library-ability-list").innerHTML = `<div class="theory-library-path-label"><b>学习 / 应用路径</b><span>从当前理论进入阅读、应用与训练</span></div>${theoryLibraryAbilities.map((item, index) => `<button class="${item.key === ability.key ? "active" : ""}" type="button" data-theory-library-ability="${item.key}"><span><i data-lucide="${item.icon}"></i></span><div><b>${item.title}</b><small>${item.eyebrow}</small></div><i data-lucide="chevron-right"></i></button>`).join("")}<button class="theory-library-recommendation" type="button" data-theory-library-use="example"><span><i data-lucide="sparkles"></i></span><div><b>推荐下一步：课堂范本</b><small>把理论带入真实课例</small></div><i data-lucide="chevron-right"></i></button>`;
}

function renderTheoryLibraryPagination(page, pageCount) {
  const pagination = $("#theory-library-pagination");
  if (!pagination) return;
  if (pageCount <= 1) {
    pagination.innerHTML = "";
    pagination.hidden = true;
    return;
  }
  pagination.hidden = false;
  const pageNumbers = Array.from({ length: pageCount }, (_, index) => index + 1).filter((number) => number === 1 || number === pageCount || Math.abs(number - page) <= 1);
  let previous = 0;
  const buttons = pageNumbers.map((number) => {
    const gap = previous && number - previous > 1 ? `<span>...</span>` : "";
    previous = number;
    return `${gap}<button class="${number === page ? "active" : ""}" type="button" data-theory-library-page="${number}">${number}</button>`;
  }).join("");
  pagination.innerHTML = `<button type="button" data-theory-library-page="${page - 1}" ${page === 1 ? "disabled" : ""}><i data-lucide="chevron-left"></i><span>上一页</span></button>${buttons}<button type="button" data-theory-library-page="${page + 1}" ${page === pageCount ? "disabled" : ""}><span>下一页</span><i data-lucide="chevron-right"></i></button>`;
}

function renderTheoryLibraryOverviewDirectory(selection) {
  const source = $("#theory-directory-nav");
  const nav = $("#theory-overview-directory-nav");
  if (!source || !nav) return;
  nav.innerHTML = source.innerHTML;
  nav.classList.add("theory-overview-nav");
  const query = String(assistantState.theory.directoryQuery || "").trim().toLocaleLowerCase();
  nav.querySelectorAll("article").forEach((article) => {
    article.hidden = Boolean(query && !article.textContent.toLocaleLowerCase().includes(query));
  });
  const input = $("#theory-overview-directory-query");
  if (input && input.value !== assistantState.theory.directoryQuery) input.value = assistantState.theory.directoryQuery || "";
}

function renderTheoryLibraryLensRootMap(selection) {
  const lens = ["map", "structure", "index"].includes(assistantState.theory.libraryLens) ? assistantState.theory.libraryLens : "map";
  const stage = $("#theory-library-lens-stage");
  stage?.classList.toggle("is-friend-map", lens === "map");
  stage?.classList.toggle("is-structure", lens === "structure");
  stage?.classList.toggle("is-index", lens === "index");
  if (lens !== "map") {
    renderTheoryLibraryLensLegacy(selection);
    return;
  }
  if (!stage) return;
  assistantState.theory.libraryLens = lens;
  $$(`[data-theory-library-lens]`).forEach((button) => button.classList.toggle("active", button.dataset.theoryLibraryLens === lens));
  const width = 700;
  const height = 470;
  const center = { x: width / 2, y: height / 2 + 4 };
  const colors = ["#8060dc", "#4c9b8b", "#cf8d47", "#4e87b5", "#ba617e"];
  const positions = (theoryDirectoryData.categories || []).slice(0, 5).map((category, index, categories) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / Math.max(categories.length, 1);
    return { category, index, x: center.x + Math.cos(angle) * 188, y: center.y + Math.sin(angle) * 150, color: colors[index % colors.length] };
  });
  const edges = positions.map((position) => `<line class="theory-friend-map-edge" style="--map-index:${position.index}" x1="${center.x}" y1="${center.y}" x2="${position.x}" y2="${position.y}" stroke="${position.color}" />`).join("");
  const nodes = positions.map((position) => {
    const count = countTheoryDirectoryNode(position.category);
    const radius = Math.max(43, Math.min(58, 38 + Math.sqrt(count) * 1.05));
    const active = position.index === selection.categoryIndex;
    const label = position.category.name.length > 10 ? `${position.category.name.slice(0, 10)}…` : position.category.name;
    const satelliteAngle = Math.atan2(position.y - center.y, position.x - center.x);
    const satellites = position.category.sections.slice(0, 4).map((section, sectionIndex) => {
      const spread = (sectionIndex - 1.5) * .46;
      const childX = Math.max(14, Math.min(width - 14, position.x + Math.cos(satelliteAngle + spread) * (radius + 30)));
      const childY = Math.max(14, Math.min(height - 14, position.y + Math.sin(satelliteAngle + spread) * (radius + 30)));
      return `<g role="button" tabindex="0" class="theory-friend-map-satellite" data-theory-map-satellite="${position.index}:${sectionIndex}" data-map-x="${childX}" data-map-y="${childY}" data-theory-overview-category="${position.index}" data-theory-overview-section="${sectionIndex}" data-theory-overview-group="0" aria-label="${escapeHtml(section.name)}"><line x1="${position.x}" y1="${position.y}" x2="${childX}" y2="${childY}" stroke="${position.color}" /><circle cx="${childX}" cy="${childY}" r="5.5" fill="${position.color}" /><title>${escapeHtml(section.name)}</title></g>`;
    }).join("");
    return `<g role="button" tabindex="0" class="theory-friend-map-node${active ? " active" : ""}" style="--map-index:${position.index};--node-x:${position.x}px;--node-y:${position.y}px" data-theory-map-node="${position.index}" data-map-x="${position.x}" data-map-y="${position.y}" data-theory-overview-category="${position.index}" data-theory-overview-section="0" data-theory-overview-group="0" aria-label="${escapeHtml(position.category.name)}"><circle class="theory-friend-map-halo" cx="${position.x}" cy="${position.y + 6}" r="${radius}" fill="${position.color}" /><circle cx="${position.x}" cy="${position.y}" r="${radius}" fill="${position.color}" fill-opacity="${active ? ".22" : ".1"}" stroke="${position.color}" stroke-width="${active ? "2.5" : "1.3"}" /><text x="${position.x}" y="${position.y - 3}">${escapeHtml(label)}</text><text class="count" x="${position.x}" y="${position.y + 18}">${count}</text>${satellites}</g>`;
  }).join("");
  stage.innerHTML = `<div class="theory-friend-map-surface" data-theory-map-surface tabindex="0" aria-label="可交互的教育理论知识地图"><svg class="theory-friend-map-preview" viewBox="0 0 ${width} ${height}" role="img" aria-label="教育理论知识地图"><defs><radialGradient id="theoryFriendCenterGlow"><stop offset="0" stop-color="#9a7bea" stop-opacity=".98" /><stop offset="1" stop-color="#6545b2" /></radialGradient></defs><circle class="theory-friend-map-orbit outer" cx="${center.x}" cy="${center.y}" r="184" fill="none" stroke="rgba(117,83,187,.19)" stroke-dasharray="4 5" /><circle class="theory-friend-map-orbit inner" cx="${center.x}" cy="${center.y}" r="112" fill="none" stroke="rgba(117,83,187,.13)" />${edges}<g class="theory-friend-map-center"><circle class="theory-friend-map-center-halo" cx="${center.x}" cy="${center.y}" r="76" fill="#7857cb" /><circle cx="${center.x}" cy="${center.y}" r="64" fill="url(#theoryFriendCenterGlow)" /><text x="${center.x}" y="${center.y - 4}">教育理论体系</text><text class="count" x="${center.x}" y="${center.y + 19}">${getTheoryLibraryMetrics().theoryCount} 条理论</text></g>${nodes}</svg><div class="theory-friend-map-caption"><i data-lucide="move"></i><span>拖动感知理论之间的层级关系，点击节点聚焦目录</span></div><div class="theory-friend-map-controls" aria-label="知识地图缩放控制"><button type="button" data-theory-map-control="zoom-out" title="缩小"><i data-lucide="minus"></i></button><button type="button" data-theory-map-control="reset" title="重置地图"><i data-lucide="scan-line"></i></button><button type="button" data-theory-map-control="zoom-in" title="放大"><i data-lucide="plus"></i></button></div></div>`;
  dockTheoryMapChrome(stage);
  setTheoryMapViewport(assistantState.theory.libraryMapViewport, { save: false, animate: false });
  bindTheoryMapInteractions();
}

const theoryMapPalette = ["#8060dc", "#4c9b8b", "#cf8d47", "#4e87b5", "#ba617e"];

function dockTheoryMapChrome(stage) {
  if (!stage) return;
  const surface = stage.querySelector("[data-theory-map-surface]");
  if (!surface) return;
  [".theory-friend-map-breadcrumb", ".theory-friend-map-caption", ".theory-friend-map-controls"].forEach((selector) => {
    const element = surface.querySelector(selector);
    if (element) stage.append(element);
  });
}

function getTheoryMapPath() {
  const path = Array.isArray(assistantState.theory.libraryMapPath) ? assistantState.theory.libraryMapPath : [];
  const result = [];
  let nodes = theoryDirectoryData.categories || [];
  for (const rawIndex of path.slice(0, 3)) {
    const index = Number(rawIndex);
    if (!Number.isInteger(index) || index < 0 || index >= nodes.length) break;
    result.push(index);
    const node = nodes[index];
    nodes = result.length === 1 ? node.sections || [] : result.length === 2 ? node.groups || [] : [];
  }
  assistantState.theory.libraryMapPath = result;
  return result;
}

function getTheoryMapScene() {
  const path = getTheoryMapPath();
  const categories = theoryDirectoryData.categories || [];
  const category = categories[path[0]];
  const section = category?.sections?.[path[1]];
  const group = section?.groups?.[path[2]];
  const color = theoryMapPalette[(path[0] ?? 0) % theoryMapPalette.length];
  const breadcrumbs = [{ title: "全部理论", path: [] }];
  if (category) breadcrumbs.push({ title: category.name, path: [path[0]] });
  if (section) breadcrumbs.push({ title: section.name, path: [path[0], path[1]] });
  if (group) breadcrumbs.push({ title: group.name, path: [path[0], path[1], path[2]] });
  if (!path.length || !category) {
    return {
      path: [],
      color: theoryMapPalette[0],
      centerTitle: "教育理论体系",
      centerCount: getTheoryLibraryMetrics().theoryCount,
      breadcrumbs,
      entries: categories.map((node, categoryIndex) => ({ type: "node", title: node.name, count: countTheoryDirectoryNode(node), color: theoryMapPalette[categoryIndex % theoryMapPalette.length], path: [categoryIndex], node }))
    };
  }
  if (path.length === 1 || !section) {
    return {
      path: [path[0]],
      color,
      centerTitle: category.name,
      centerCount: countTheoryDirectoryNode(category),
      breadcrumbs,
      entries: (category.sections || []).map((node, sectionIndex) => ({ type: "node", title: node.name, count: countTheoryDirectoryNode(node), color, path: [path[0], sectionIndex], node }))
    };
  }
  if (path.length === 2 || !group) {
    return {
      path: [path[0], path[1]],
      color,
      centerTitle: section.name,
      centerCount: countTheoryDirectoryNode(section),
      breadcrumbs,
      entries: (section.groups || []).map((node, groupIndex) => ({ type: "node", title: node.name, count: countTheoryDirectoryNode(node), color, path: [path[0], path[1], groupIndex], node }))
    };
  }
  return {
    path: [path[0], path[1], path[2]],
    color,
    centerTitle: group.name,
    centerCount: group.theories.length,
    breadcrumbs,
    entries: group.theories.map((name) => {
      const profile = getTheoryProfileByName(name) || ensureDirectoryTheoryProfile({ name, category, section, group, categoryIndex: path[0], sectionIndex: path[1], groupIndex: path[2] });
      return { type: "theory", title: name, count: 1, color, path: [...path], profileId: profile.id };
    })
  };
}

function layoutTheoryMapEntries(entries, center) {
  const visible = entries.slice(0, 22);
  if (visible.length <= 9) {
    return visible.map((entry, index) => {
      const angle = -Math.PI / 2 + Math.PI * 2 * index / Math.max(visible.length, 1);
      return { ...entry, index, x: center.x + Math.cos(angle) * 192, y: center.y + Math.sin(angle) * 146, ring: 0 };
    });
  }
  const innerCount = Math.min(8, Math.ceil(visible.length * .4));
  return visible.map((entry, index) => {
    const inner = index < innerCount;
    const ringIndex = inner ? index : index - innerCount;
    const ringCount = inner ? innerCount : visible.length - innerCount;
    const angle = -Math.PI / 2 + (inner ? 0 : Math.PI / Math.max(ringCount, 1)) + Math.PI * 2 * ringIndex / Math.max(ringCount, 1);
    return { ...entry, index, x: center.x + Math.cos(angle) * (inner ? 137 : 220), y: center.y + Math.sin(angle) * (inner ? 105 : 169), ring: inner ? 0 : 1 };
  });
}

function shortTheoryMapTitle(value, length = 9) {
  const title = String(value || "").replace(/（[^）]*）|\([^)]*\)/g, "").trim();
  return title.length > length ? `${title.slice(0, length)}…` : title;
}

function renderTheoryLibraryLens(selection) {
  const lens = ["map", "structure", "index"].includes(assistantState.theory.libraryLens) ? assistantState.theory.libraryLens : "map";
  const stage = $("#theory-library-lens-stage");
  stage?.classList.toggle("is-friend-map", lens === "map");
  stage?.classList.toggle("is-structure", lens === "structure");
  stage?.classList.toggle("is-index", lens === "index");
  if (lens !== "map") {
    renderTheoryLibraryLensLegacy(selection);
    return;
  }
  if (!stage) return;
  assistantState.theory.libraryLens = lens;
  $$(`[data-theory-library-lens]`).forEach((button) => button.classList.toggle("active", button.dataset.theoryLibraryLens === lens));
  const width = 700;
  const height = 470;
  const center = { x: width / 2, y: height / 2 + 4 };
  const scene = getTheoryMapScene();
  const centerColor = "#8060dc";
  const positions = layoutTheoryMapEntries(scene.entries, center);
  const dense = positions.length > 12;
  const edges = positions.map((position) => `<line class="theory-friend-map-edge" style="--map-index:${position.index}" x1="${center.x}" y1="${center.y}" x2="${position.x}" y2="${position.y}" stroke="${position.color}" />`).join("");
  const nodes = positions.map((position) => {
    const radius = dense ? (position.ring ? 29 : 34) : Math.max(39, Math.min(54, 37 + Math.sqrt(position.count) * .9));
    const active = position.type === "theory"
      ? position.profileId === assistantState.theory.librarySelectedTheoryId
      : !scene.path.length && position.path?.[0] === selection.categoryIndex;
    const label = shortTheoryMapTitle(position.title, dense ? 7 : 9);
    const pathValue = (position.path || []).join("/");
    const theoryData = position.type === "theory" ? ` data-theory-map-theory="${escapeHtml(position.profileId)}"` : ` data-theory-map-path="${pathValue}"`;
    let satellites = "";
    if (!scene.path.length && position.node?.sections?.length) {
      const direction = Math.atan2(position.y - center.y, position.x - center.x);
      satellites = position.node.sections.slice(0, 4).map((sectionNode, sectionIndex) => {
        const spread = (sectionIndex - 1.5) * .43;
        const childX = Math.max(16, Math.min(width - 16, position.x + Math.cos(direction + spread) * (radius + 29)));
        const childY = Math.max(16, Math.min(height - 16, position.y + Math.sin(direction + spread) * (radius + 29)));
        return `<g role="button" tabindex="0" class="theory-friend-map-satellite" data-theory-map-satellite="${position.path[0]}:${sectionIndex}" data-theory-map-path="${position.path[0]}/${sectionIndex}" data-map-x="${childX}" data-map-y="${childY}" aria-label="${escapeHtml(sectionNode.name)}"><line x1="${position.x}" y1="${position.y}" x2="${childX}" y2="${childY}" stroke="${position.color}" /><circle cx="${childX}" cy="${childY}" r="5.5" fill="${position.color}" /><title>${escapeHtml(sectionNode.name)}</title></g>`;
      }).join("");
    }
    return `<g role="button" tabindex="0" class="theory-friend-map-node${active ? " active" : ""}${position.type === "theory" ? " is-theory-node" : ""}" style="--map-index:${position.index}" data-theory-map-node="${position.index}" data-map-x="${position.x}" data-map-y="${position.y}"${theoryData} aria-label="${escapeHtml(position.title)}"><circle class="theory-friend-map-halo" cx="${position.x}" cy="${position.y + 5}" r="${radius}" fill="${position.color}" /><circle cx="${position.x}" cy="${position.y}" r="${radius}" fill="${position.color}" fill-opacity="${active ? ".22" : ".1"}" stroke="${position.color}" stroke-width="${active ? "2.5" : "1.3"}" /><text x="${position.x}" y="${position.y - 3}">${escapeHtml(label)}</text><text class="count" x="${position.x}" y="${position.y + 17}">${position.type === "theory" ? "查看理论" : position.count}</text>${satellites}</g>`;
  }).join("");
  const breadcrumb = scene.breadcrumbs.map((item, index) => `<button type="button" class="${index === scene.breadcrumbs.length - 1 ? "active" : ""}" data-theory-map-breadcrumb="${item.path.join("/")}" ${index === scene.breadcrumbs.length - 1 ? "disabled" : ""}>${escapeHtml(shortTheoryMapTitle(item.title, 12))}</button>`).join(`<i data-lucide="chevron-right"></i>`);
  const spores = Array.from({ length: 18 }, (_, index) => `<circle class="theory-friend-map-spore" cx="${38 + (index * 113) % 626}" cy="${30 + (index * 71) % 405}" r="${1.5 + index % 3}" style="--spore-index:${index}" />`).join("");
  stage.innerHTML = `<div class="theory-friend-map-surface${dense ? " is-dense" : ""}" data-theory-map-surface tabindex="0" aria-label="可交互的教育理论知识地图"><div class="theory-friend-map-breadcrumb">${scene.path.length ? `<button type="button" class="back" data-theory-map-back title="返回上一层"><i data-lucide="arrow-left"></i></button>` : ""}<div>${breadcrumb}</div></div><svg class="theory-friend-map-preview" viewBox="0 0 ${width} ${height}" role="img" aria-label="教育理论知识地图"><defs><radialGradient id="theoryFriendCenterGlow"><stop offset="0" stop-color="${centerColor}" stop-opacity=".96" /><stop offset="1" stop-color="#6545b2" /></radialGradient></defs><g class="theory-friend-map-spores">${spores}</g><circle class="theory-friend-map-orbit outer" cx="${center.x}" cy="${center.y}" r="184" fill="none" stroke="rgba(117,83,187,.19)" stroke-dasharray="4 5" /><circle class="theory-friend-map-orbit inner" cx="${center.x}" cy="${center.y}" r="112" fill="none" stroke="rgba(117,83,187,.13)" />${edges}<g class="theory-friend-map-center" data-theory-map-center="true" role="button" tabindex="0" aria-label="返回上一级地图"><circle class="theory-friend-map-center-halo" cx="${center.x}" cy="${center.y}" r="76" fill="${centerColor}" /><circle cx="${center.x}" cy="${center.y}" r="64" fill="url(#theoryFriendCenterGlow)" /><text x="${center.x}" y="${center.y - 4}">${escapeHtml(shortTheoryMapTitle(scene.centerTitle, 11))}</text><text class="count" x="${center.x}" y="${center.y + 19}">${scene.centerCount} 条理论</text></g>${nodes}</svg><div class="theory-friend-map-caption"><i data-lucide="move"></i><span>拖动与缩放地图，点击节点逐层探索理论关系</span></div><div class="theory-friend-map-controls" aria-label="知识地图缩放控制"><button type="button" data-theory-map-control="zoom-out" title="缩小"><i data-lucide="minus"></i></button><button type="button" data-theory-map-control="reset" title="重置地图"><i data-lucide="scan-line"></i></button><button type="button" data-theory-map-control="zoom-in" title="放大"><i data-lucide="plus"></i></button></div></div>`;
  dockTheoryMapChrome(stage);
  renderTheoryMapExpandedInfo(scene);
  assistantState.theory.libraryMapViewport = { x: 0, y: 0, scale: 1 };
  setTheoryMapViewport(assistantState.theory.libraryMapViewport, { save: false, animate: false });
  bindTheoryMapInteractions();
}

function renderTheoryMapExpandedInfo(scene = getTheoryMapScene()) {
  const panel = $("#theory-map-expanded-info");
  if (!panel) return;
  const directDirectories = scene.entries.filter((entry) => entry.type !== "theory");
  const directTheories = scene.entries.filter((entry) => entry.type === "theory");
  const nextEntries = (directDirectories.length ? directDirectories : directTheories).slice(0, 5);
  const pathLabel = scene.breadcrumbs.map((item) => item.title).join(" / ");
  panel.innerHTML = `<header><span><i data-lucide="network"></i></span><div><p>当前知识范围</p><h3>${escapeHtml(scene.centerTitle)}</h3></div></header><p class="theory-map-expanded-path">${escapeHtml(pathLabel)}</p><div class="theory-map-expanded-metrics"><span><b>${directDirectories.length}</b><small>直接子目录</small></span><span><b>${directTheories.length}</b><small>当前理论</small></span><span><b>${scene.centerCount}</b><small>覆盖理论</small></span></div>${nextEntries.length ? `<section><b>${directDirectories.length ? "下级目录" : "当前理论"}</b><div>${nextEntries.map((entry) => entry.type === "theory" ? `<button type="button" data-theory-map-info-theory="${escapeHtml(entry.profileId)}"><span>${escapeHtml(entry.title)}</span><i data-lucide="arrow-up-right"></i></button>` : `<button type="button" data-theory-map-info-path="${entry.path.join("/")}"><span>${escapeHtml(entry.title)}</span><em>${entry.count}</em></button>`).join("")}</div></section>` : ""}`;
}

let theoryMapExpandedNaturalRailHeight = 0;

function updateTheoryMapExpandedBounds() {
  const card = $("#theory-library-lens-card");
  if (!card?.classList.contains("is-expanded")) return;
  const main = $("#workspace-app .main");
  const rail = $("#workspace-app .rail");
  const topbar = $("#workspace-app .topbar");
  const shell = $("#workspace-app .shell");
  const host = $("#theory-map-expanded-host");
  if (!main || !rail || !topbar || !host) return;
  const mainRect = main.getBoundingClientRect();
  const naturalRailRect = rail.getBoundingClientRect();
  const topbarRect = topbar.getBoundingClientRect();
  const mainStyle = getComputedStyle(main);
  const contentLeft = Number.parseFloat(mainStyle.paddingLeft) || 0;
  const contentRight = Number.parseFloat(mainStyle.paddingRight) || 0;
  // Capture the rail's intrinsic content height once. The document owns the
  // vertical scroll, so the rail can grow without becoming a nested scroller.
  if (!theoryMapExpandedNaturalRailHeight) {
    theoryMapExpandedNaturalRailHeight = Math.max(rail.getBoundingClientRect().height, rail.scrollHeight);
  }
  const expandedRailHeight = Math.max(620, Math.ceil(theoryMapExpandedNaturalRailHeight));
  document.documentElement.style.setProperty("--theory-map-expanded-rail-height", `${Math.round(expandedRailHeight)}px`);
  const railRect = rail.getBoundingClientRect();
  const railOffset = Math.max(0, railRect.top - mainRect.top);
  const mainHeight = Math.max(620, railRect.bottom - mainRect.top);
  const hostHeight = Math.max(520, railRect.bottom - topbarRect.bottom);
  document.documentElement.style.setProperty("--theory-map-expanded-content-left", `${Math.round(contentLeft)}px`);
  document.documentElement.style.setProperty("--theory-map-expanded-content-right", `${Math.round(contentRight)}px`);
  document.documentElement.style.setProperty("--theory-map-expanded-topbar-height", `${Math.round(topbarRect.height)}px`);
  document.documentElement.style.setProperty("--theory-map-expanded-main-height", `${Math.round(mainHeight)}px`);
  document.documentElement.style.setProperty("--theory-map-expanded-host-height", `${Math.round(hostHeight)}px`);
  document.documentElement.style.setProperty("--theory-map-expanded-rail-offset", `${Math.round(railOffset)}px`);
  main.scrollTo({ top: 0, left: 0, behavior: "auto" });
}

function setTheoryMapExpanded(expanded) {
  const card = $("#theory-library-lens-card");
  const button = $("#theory-library-expand");
  if (!card || !button) return;
  if (expanded) {
    theoryMapExpandedNaturalRailHeight = 0;
    const main = $("#workspace-app .main");
    const rail = $("#workspace-app .rail");
    const topbar = $("#workspace-app .topbar");
    if (main && rail && topbar) {
      const mainRect = main.getBoundingClientRect();
      const railRect = rail.getBoundingClientRect();
      const topbarRect = topbar.getBoundingClientRect();
      document.documentElement.style.setProperty("--theory-map-expanded-rail-offset", `${Math.round(Math.max(0, railRect.top - mainRect.top))}px`);
      document.documentElement.style.setProperty("--theory-map-expanded-main-height", `${Math.round(Math.max(620, railRect.bottom - mainRect.top))}px`);
      document.documentElement.style.setProperty("--theory-map-expanded-host-height", `${Math.round(Math.max(520, railRect.bottom - topbarRect.bottom))}px`);
    }
  }
  moveTheoryMapToExpandedHost(expanded);
  card.classList.toggle("is-expanded", expanded);
  document.body.classList.toggle("theory-map-workspace-expanded", expanded);
  document.documentElement.classList.toggle("theory-map-expanded-document", expanded);
  button.setAttribute("aria-pressed", String(expanded));
  button.innerHTML = `<i data-lucide="${expanded ? "minimize" : "expand"}"></i><span>${expanded ? "退出展开" : "展开查看"}</span>`;
  if (expanded) {
    window.scrollTo({ top: 0, behavior: "auto" });
    $("#workspace-app .main")?.scrollTo({ top: 0, left: 0, behavior: "auto" });
    renderTheoryMapExpandedInfo();
    const syncExpandedMap = () => {
      if (!document.body.classList.contains("theory-map-workspace-expanded")) return;
      updateTheoryMapExpandedBounds();
    };
    window.requestAnimationFrame(() => {
      syncExpandedMap();
      setTheoryMapViewport({ x: 0, y: 0, scale: 1 }, { animate: true, save: false });
    });
    [160, 480, 960].forEach((delay) => window.setTimeout(syncExpandedMap, delay));
  } else {
    theoryMapExpandedNaturalRailHeight = 0;
    document.documentElement.style.removeProperty("--theory-map-expanded-rail-height");
    document.documentElement.classList.remove("theory-map-expanded-document");
    $("#workspace-app .main")?.scrollTo({ top: 0, left: 0, behavior: "auto" });
    setTheoryMapViewport({ x: 0, y: 0, scale: 1 }, { animate: false, save: false });
  }
  refreshIcons();
}

window.addEventListener("resize", () => {
  if (!document.body.classList.contains("theory-map-workspace-expanded")) return;
  window.requestAnimationFrame(updateTheoryMapExpandedBounds);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && document.body.classList.contains("theory-map-workspace-expanded")) {
    event.preventDefault();
    setTheoryMapExpanded(false);
  }
});

function getTheoryMapViewport() {
  const value = assistantState.theory.libraryMapViewport || {};
  return {
    x: Number.isFinite(Number(value.x)) ? Number(value.x) : 0,
    y: Number.isFinite(Number(value.y)) ? Number(value.y) : 0,
    scale: Math.max(.72, Math.min(1.55, Number.isFinite(Number(value.scale)) ? Number(value.scale) : 1))
  };
}

let theoryMapViewportAnimation = null;

function setTheoryMapViewport(value, options = {}) {
  const next = {
    x: Number.isFinite(Number(value?.x)) ? Number(value.x) : 0,
    y: Number.isFinite(Number(value?.y)) ? Number(value.y) : 0,
    scale: Math.max(.72, Math.min(1.55, Number.isFinite(Number(value?.scale)) ? Number(value.scale) : 1))
  };
  assistantState.theory.libraryMapViewport = next;
  const svg = $("#theory-library-lens-stage .theory-friend-map-preview");
  if (!svg) return next;
  const targetTransform = `translate3d(${next.x}px, ${next.y}px, 0) scale(${next.scale})`;
  const shouldAnimate = options.animate !== false && !prefersReducedMotion() && typeof svg.animate === "function";
  if (theoryMapViewportAnimation) {
    theoryMapViewportAnimation.cancel();
    theoryMapViewportAnimation = null;
  }
  if (!shouldAnimate) {
    svg.classList.remove("is-map-waapi", "is-map-animating");
    svg.style.transform = targetTransform;
    return next;
  }
  const currentTransform = getComputedStyle(svg).transform === "none" ? "translate3d(0, 0, 0) scale(1)" : getComputedStyle(svg).transform;
  svg.classList.add("is-map-waapi", "is-map-animating");
  svg.style.transform = targetTransform;
  theoryMapViewportAnimation = svg.animate([
    { transform: currentTransform },
    { transform: targetTransform }
  ], {
    duration: Number(options.duration) || 880,
    easing: "cubic-bezier(.16, .82, .18, 1)",
    fill: "none"
  });
  const finish = () => {
    if (theoryMapViewportAnimation?.playState === "finished") theoryMapViewportAnimation = null;
    svg.classList.remove("is-map-waapi", "is-map-animating");
  };
  theoryMapViewportAnimation.addEventListener("finish", finish, { once: true });
  theoryMapViewportAnimation.addEventListener("cancel", () => svg.classList.remove("is-map-waapi"), { once: true });
  return next;
}

let theoryMapSuppressClickUntil = 0;
let theoryMapSceneTimer = 0;
let theoryMapOriginalParent = null;
let theoryMapOriginalNextSibling = null;

function moveTheoryMapToExpandedHost(expanded) {
  const card = $("#theory-library-lens-card");
  const host = $("#theory-map-expanded-host");
  if (!card || !host) return;
  if (expanded) {
    if (card.parentElement === host) return;
    theoryMapOriginalParent = card.parentElement;
    theoryMapOriginalNextSibling = card.nextSibling;
    host.append(card);
    return;
  }
  if (theoryMapOriginalParent) {
    theoryMapOriginalParent.insertBefore(card, theoryMapOriginalNextSibling && theoryMapOriginalNextSibling.parentNode === theoryMapOriginalParent ? theoryMapOriginalNextSibling : null);
  }
  theoryMapOriginalParent = null;
  theoryMapOriginalNextSibling = null;
}

function parseTheoryMapPath(value) {
  return String(value || "").split("/").filter(Boolean).map(Number).filter((item) => Number.isInteger(item) && item >= 0).slice(0, 3);
}

function enterTheoryMapScene(path, target) {
  if (!target || performance.now() < theoryMapSuppressClickUntil) return;
  const nextPath = parseTheoryMapPath(path);
  const stage = $("#theory-library-lens-stage");
  if (!stage || !nextPath.length) return;
  if (theoryMapSceneTimer) window.clearTimeout(theoryMapSceneTimer);
  stage.classList.add("is-map-scene-changing");
  target.classList.add("is-map-target");
  focusTheoryMapTarget(target, nextPath.length >= 3 ? 1.08 : 1.16);
  theoryMapSceneTimer = window.setTimeout(() => {
    assistantState.theory.libraryMapPath = nextPath;
    assistantState.theory.directoryPath = [nextPath[0] ?? 0, nextPath[1] ?? 0, nextPath[2] ?? 0];
    assistantState.theory.directoryTheory = "";
    assistantState.theory.directoryQuery = "";
    assistantState.theory.libraryPage = 1;
    assistantState.theory.libraryMapViewport = { x: 0, y: 0, scale: 1 };
    renderTheoryLibrary();
    window.requestAnimationFrame(() => stage.classList.remove("is-map-scene-changing"));
    scheduleWorkspaceSave();
    theoryMapSceneTimer = 0;
  }, prefersReducedMotion() ? 0 : 720);
}

function leaveTheoryMapScene(path) {
  const nextPath = parseTheoryMapPath(path);
  assistantState.theory.libraryMapPath = nextPath;
  assistantState.theory.directoryPath = [nextPath[0] ?? 0, nextPath[1] ?? 0, nextPath[2] ?? 0];
  assistantState.theory.directoryTheory = "";
  assistantState.theory.libraryMapViewport = { x: 0, y: 0, scale: 1 };
  renderTheoryLibrary();
  scheduleWorkspaceSave();
}

function focusTheoryMapTarget(node, scale = 1.16) {
  const svg = $("#theory-library-lens-stage .theory-friend-map-preview");
  if (!svg || !node) return;
  const x = Number(node.getAttribute("data-map-x"));
  const y = Number(node.getAttribute("data-map-y"));
  if (!Number.isFinite(x) || !Number.isFinite(y)) return;
  const unitX = svg.clientWidth / 700;
  const unitY = svg.clientHeight / 470;
  setTheoryMapViewport({ x: -(x - 350) * unitX * scale, y: -(y - 235) * unitY * scale, scale }, { animate: true });
}

function focusTheoryMapNode(categoryIndex) {
  const node = $(`#theory-library-lens-stage [data-theory-map-node="${categoryIndex}"]`);
  focusTheoryMapTarget(node);
}

function syncTheoryOverviewSelection(focusTarget = null) {
  const selection = getTheoryDirectorySelection();
  renderTheoryDirectoryNav(selection);
  renderTheoryLibraryOverviewDirectory(selection);
  renderTheoryLibraryAbilities(selection);
  $$("#theory-library-lens-stage [data-theory-map-node]").forEach((node) => {
    node.classList.toggle("active", Number(node.dataset.theoryMapNode) === selection.categoryIndex);
  });
  if (focusTarget) window.requestAnimationFrame(() => focusTheoryMapTarget(focusTarget));
  refreshIcons();
}

function zoomTheoryMapAtPoint(clientX, clientY, direction = 1) {
  const surface = $("#theory-library-lens-stage [data-theory-map-surface]");
  if (!surface) return;
  const rect = surface.getBoundingClientRect();
  const current = getTheoryMapViewport();
  const nextScale = Math.max(.72, Math.min(1.55, current.scale * (direction > 0 ? 1.12 : .89)));
  const pointerX = clientX - (rect.left + rect.width / 2);
  const pointerY = clientY - (rect.top + rect.height / 2);
  setTheoryMapViewport({
    scale: nextScale,
    x: pointerX - ((pointerX - current.x) / current.scale) * nextScale,
    y: pointerY - ((pointerY - current.y) / current.scale) * nextScale
  }, { animate: true, duration: 480 });
}

function bindTheoryMapInteractions() {
  const surface = $("#theory-library-lens-stage [data-theory-map-surface]");
  if (!surface || surface.dataset.mapBound === "true") return;
  surface.dataset.mapBound = "true";
  let drag = null;
  let inertiaFrame = 0;
  let moveFrame = 0;
  const cancelInertia = () => {
    if (inertiaFrame) window.cancelAnimationFrame(inertiaFrame);
    inertiaFrame = 0;
  };
    const isInteractiveNode = (target) => target?.closest?.("[data-theory-map-node], [data-theory-map-satellite], [data-theory-map-control], [data-theory-map-center], [data-theory-map-breadcrumb], [data-theory-map-back]");
  surface.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || isInteractiveNode(event.target)) return;
    cancelInertia();
    surface.setPointerCapture?.(event.pointerId);
    const current = getTheoryMapViewport();
    drag = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, lastX: event.clientX, lastY: event.clientY, lastTime: performance.now(), vx: 0, vy: 0, originX: current.x, originY: current.y, moved: false };
    surface.classList.add("is-dragging");
  });
  surface.addEventListener("pointermove", (event) => {
    if (!drag || drag.pointerId !== event.pointerId) return;
    const now = performance.now();
    const elapsed = Math.max(1, now - drag.lastTime);
    drag.vx = (event.clientX - drag.lastX) / elapsed * 16;
    drag.vy = (event.clientY - drag.lastY) / elapsed * 16;
    drag.lastX = event.clientX;
    drag.lastY = event.clientY;
    drag.lastTime = now;
    drag.moved ||= Math.hypot(event.clientX - drag.x, event.clientY - drag.y) > 5;
    const next = { ...getTheoryMapViewport(), x: drag.originX + event.clientX - drag.x, y: drag.originY + event.clientY - drag.y };
    if (moveFrame) window.cancelAnimationFrame(moveFrame);
    moveFrame = window.requestAnimationFrame(() => setTheoryMapViewport(next, { save: false, animate: false }));
  });
  const endDrag = (event) => {
    if (!drag || drag.pointerId !== event.pointerId) return;
    const activeDrag = drag;
    drag = null;
    surface.classList.remove("is-dragging");
    if (!activeDrag.moved) return;
    theoryMapSuppressClickUntil = performance.now() + 220;
    let vx = activeDrag.vx;
    let vy = activeDrag.vy;
    let current = { ...getTheoryMapViewport(), x: activeDrag.originX + event.clientX - activeDrag.x, y: activeDrag.originY + event.clientY - activeDrag.y };
    setTheoryMapViewport(current, { save: false, animate: false });
    if (prefersReducedMotion()) {
      scheduleWorkspaceSave();
      return;
    }
    const coast = () => {
      vx *= .88;
      vy *= .88;
      current = { ...current, x: current.x + vx, y: current.y + vy };
      setTheoryMapViewport(current, { save: false, animate: false });
      if (Math.hypot(vx, vy) > .35) inertiaFrame = window.requestAnimationFrame(coast);
      else {
        inertiaFrame = 0;
        scheduleWorkspaceSave();
      }
    };
    inertiaFrame = window.requestAnimationFrame(coast);
  };
  surface.addEventListener("pointerup", endDrag);
  surface.addEventListener("pointercancel", endDrag);
  surface.addEventListener("wheel", (event) => {
    if (document.body.classList.contains("theory-map-workspace-expanded") && !event.ctrlKey) {
      event.preventDefault();
      surface.scrollBy({ top: event.deltaY, left: event.deltaX, behavior: "auto" });
      return;
    }
    event.preventDefault();
    zoomTheoryMapAtPoint(event.clientX, event.clientY, event.deltaY < 0 ? 1 : -1);
  }, { passive: false });
  surface.addEventListener("dblclick", () => {
    setTheoryMapViewport({ x: 0, y: 0, scale: 1 }, { animate: true });
    scheduleWorkspaceSave();
  });
  surface.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
      const target = event.target.closest("[data-theory-map-node], [data-theory-map-satellite], [data-theory-map-control], [data-theory-map-center], [data-theory-map-breadcrumb], [data-theory-map-back]");
    if (!target) return;
    event.preventDefault();
    target.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
  });
}

function renderTheoryLibrary() {
  const query = String(assistantState.theory.query || "").trim().toLocaleLowerCase();
  const selection = getTheoryDirectorySelection();
  const requestedView = assistantState.theory.libraryView === "categories" ? "categories" : "overview";
  const effectiveView = query ? "categories" : requestedView;
  $("#theory-library-overview").hidden = effectiveView !== "overview";
  $("#theory-library-categories").hidden = effectiveView !== "categories";
  $("#theory-directory-mobile-trigger").hidden = effectiveView !== "categories";
  $$("[data-theory-library-view]").forEach((button) => button.classList.toggle("active", button.dataset.theoryLibraryView === effectiveView));
  renderTheoryLibraryMetrics();
  renderTheoryDirectoryNav(selection);
  renderTheoryLibraryOverviewDirectory(selection);
  renderTheoryLibraryLens(selection);
  renderTheoryLibraryAbilities(selection);
  const allRecords = getAllTheoryDirectoryRecords();
  const records = query ? allRecords.filter((record) => getTheoryLibrarySearchText(record).includes(query)) : selection.group.theories.map((name) => ({ name, ...selection }));
  const pageSize = 18;
  const pageCount = Math.max(1, Math.ceil(records.length / pageSize));
  const page = Math.max(1, Math.min(pageCount, Number(assistantState.theory.libraryPage) || 1));
  assistantState.theory.libraryPage = page;
  const visibleRecords = records.slice((page - 1) * pageSize, page * pageSize);
  const selectedDirectoryTheory = assistantState.theory.directoryTheory || "";
  $("#learning-theory-grid").innerHTML = visibleRecords.length ? visibleRecords.map((record) => {
    const profile = getTheoryProfileByName(record.name) || ensureDirectoryTheoryProfile(record);
    const active = selectedDirectoryTheory === record.name || profile?.id === assistantState.theory.selectedId;
    const tags = profile?.tags || [record.group.name, record.section.name];
    return `<button type="button" class="theory-directory-card${active ? " active" : ""}" data-directory-theory="${escapeHtml(record.name)}" data-directory-category-index="${record.categoryIndex}" data-directory-section-index="${record.sectionIndex}" data-directory-group-index="${record.groupIndex}" data-directory-profile-id="${profile.id}"><span class="theory-directory-card-icon"><i data-lucide="${getTheoryIcon(profile || { group: record.category.name })}"></i></span><span class="theory-directory-card-copy"><b>${escapeHtml(record.name)}</b><small>${escapeHtml(record.category.name)} / ${escapeHtml(record.section.name)}</small><em>${tags.slice(0, 2).map((tag) => escapeHtml(tag)).join(" · ")}</em></span><i data-lucide="arrow-right"></i></button>`;
  }).join("") : `<div class="theory-library-empty"><i data-lucide="search-x"></i><h3>没有找到匹配理论</h3><p>请更换关键词或从左侧目录重新选择。</p></div>`;
  const title = query ? `“${assistantState.theory.query.trim()}”的搜索结果` : selection.group.name;
  $("#theory-directory-level").textContent = query ? "全库搜索" : "三级专题";
  $("#theory-directory-title").textContent = title;
  $("#theory-directory-breadcrumb").textContent = query ? "跨目录检索" : `${selection.category.name} / ${selection.section.name}`;
  $("#theory-directory-count").textContent = `${records.length} 条理论`;
  $("#theory-directory-total").textContent = getTheoryLibraryMetrics().theoryCount;
  renderTheoryLibraryPagination(page, pageCount);
  const searchInput = $("#theory-library-query");
  if (searchInput.value !== assistantState.theory.query) searchInput.value = assistantState.theory.query;
  refreshIcons();
}

function selectTheoryFromMap(profileId) {
  const profile = getTheoryProfileById(profileId);
  if (!profile) return;
  assistantState.theory.librarySelectedTheoryId = profile.id;
  assistantState.theory.selectedId = profile.id;
  assistantState.theory.directoryTheory = profile.name;
  const record = getAllTheoryDirectoryRecords().find((item) => item.name === profile.name);
  if (record) {
    assistantState.theory.directoryPath = [record.categoryIndex, record.sectionIndex, record.groupIndex];
    assistantState.theory.libraryMapPath = [record.categoryIndex, record.sectionIndex, record.groupIndex];
    assistantState.theory.directoryCollapsedDepth = 0;
  }
  renderTheoryLibrary();
  toast(`已选中“${profile.name}”，可在右侧查看对应模块。`);
  scheduleWorkspaceSave();
}

function openTheoryLibraryAbility(key) {
  const ability = theoryLibraryAbilities.find((item) => item.key === key);
  const record = getTheoryLibraryContextRecord();
  if (!ability || !record) return;
  const profile = getTheoryProfileByName(record.name) || ensureDirectoryTheoryProfile(record);
  assistantState.theory.directoryTheory = record.name;
  assistantState.theory.selectedId = profile.id;
  if (ability.target === "detail") {
    assistantState.theory.detailTab = ability.tab;
    renderTheoryDetail();
    renderTheoryDialogueTopics();
    setWorkspaceSection("theory-detail");
  } else if (ability.target === "dialogue") {
    renderTheoryDetail();
    renderTheoryDialogueTopics();
    setWorkspaceSection("theory-dialogue");
    window.setTimeout(() => {
      const input = $("#theory-chat-input");
      input.value = `请比较“${profile.name}”与容易混淆的相近理论，说明核心差异、适用边界和课堂判断证据。`;
      input.focus();
    }, 260);
  } else {
    renderTheoryDetail();
    setWorkspaceSection("theory-scenario");
  }
  scheduleWorkspaceSave();
}

function setTheoryDirectoryMobileOpen(open) {
  const sidebar = $("#theory-library-categories .theory-directory-sidebar");
  const backdrop = $("#theory-directory-mobile-backdrop");
  sidebar?.classList.toggle("mobile-open", Boolean(open));
  if (backdrop) backdrop.hidden = !open;
  document.body.classList.toggle("theory-directory-mobile-open", Boolean(open));
}

function animateTheoryDirectorySwitch() {
  const content = $(".theory-directory-content");
  if (!content) return;
  content.classList.remove("is-directory-switching");
  void content.offsetWidth;
  content.classList.add("is-directory-switching");
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => content.classList.remove("is-directory-switching"));
  });
}

function selectLearningTheory(id, navigate = false) {
  if (!getTheoryProfileById(id)) return;
  if (assistantState.theory.pending) {
    toast("当前回答仍在生成，请稍候再切换理论。");
    return;
  }
  assistantState.theory.selectedId = id;
  const activeSession = assistantState.theory.dialogueSessions?.find((item) => item.id === assistantState.theory.activeDialogueSessionId);
  if (activeSession) activeSession.theoryId = id;
  renderTheoryLibrary();
  renderTheoryDetail();
  renderTheoryDialogueTopics();
  scheduleWorkspaceSave();
  if (navigate) setWorkspaceSection("theory-detail");
}

const THEORY_DETAIL_TAB_ORDER = [
  { key: "explanation", label: "理论解释" },
  { key: "paradigm", label: "教理范式" },
  { key: "application", label: "学科应用" },
  { key: "example", label: "课堂范本" },
  { key: "comparison", label: "理论辨析" },
  { key: "training", label: "专项训练" }
];

function renderTheoryDetailPager(activeKey) {
  const activeIndex = Math.max(0, THEORY_DETAIL_TAB_ORDER.findIndex((tab) => tab.key === activeKey));
  const previous = THEORY_DETAIL_TAB_ORDER[activeIndex - 1];
  const next = THEORY_DETAIL_TAB_ORDER[activeIndex + 1];
  return `<nav class="theory-detail-pager" aria-label="理论详情板块导航">
    <button type="button" class="theory-detail-pager-button is-previous" data-theory-detail-nav="${previous?.key || ""}" ${previous ? "" : "disabled"}>
      <i data-lucide="arrow-left"></i><span>上一板块</span>
    </button>
    <button type="button" class="theory-detail-pager-button is-next" data-theory-detail-nav="${next?.key || ""}" ${next ? "" : "disabled"}>
      <span>下一板块</span><i data-lucide="arrow-right"></i>
    </button>
  </nav>`;
}

function toggleTheoryPlan(id = assistantState.theory.selectedId) {
  const plan = assistantState.theory.plan;
  const index = plan.indexOf(id);
  if (index >= 0) plan.splice(index, 1);
  else plan.push(id);
  renderTheoryOverview();
  renderTheoryLibrary();
  renderTheoryDetail();
  scheduleWorkspaceSave();
  toast(index >= 0 ? "已从学习计划移除。" : "已加入学习计划。")
}

function renderTheoryDetail() {
  const item = getSelectedLearningTheory();
  $(".theory-detail-icon").innerHTML = `<i data-lucide="${getTheoryIcon(item)}"></i>`;
  $("#theory-detail-category").textContent = `${item.group} · ${item.english}`;
  $("#theory-detail-name").textContent = item.name;
  $("#theory-detail-tags").innerHTML = item.tags.map((tag) => `<span>${tag}</span>`).join("");
  const planned = assistantState.theory.plan.includes(item.id);
  $("#theory-plan-toggle").classList.toggle("active", planned);
  $("#theory-plan-toggle span").textContent = planned ? "已加入学习计划" : "加入学习计划";
  $$("#theory-detail-tabs [data-theory-tab]").forEach((button) => button.classList.toggle("active", button.dataset.theoryTab === assistantState.theory.detailTab));
  const modules = getTheoryDetailModules(item);
  const content = {
    explanation: renderTheoryExplanationReference(item, modules.explanation.paragraphs),
    paradigm: renderTheoryParadigmPanel(item, modules.paradigm.paragraphs, modules.paradigm.cards),
    application: renderTheoryApplicationPanel(item, modules.application.paragraphs, modules.application),
    example: renderTheoryClassroomPanel(item, modules.example.paragraphs, modules.example.actors),
    comparison: renderTheoryComparisonPanel(item, modules.comparison.paragraphs),
    training: `<section class="theory-training-entry"><div><p class="kicker">${modules.training.source}</p><h3>用课堂情境检验理论理解</h3><p>进入一组与当前理论绑定的课堂情境题，完成判断后查看完整解析、证据依据与易错提醒。</p><small>训练题会结合课堂事实、学生行为和教师反馈，要求先判断理论，再说明证据与改进动作。</small></div><button class="primary" type="button" data-workspace-section="theory-scenario">开始训练 <i data-lucide="arrow-right"></i></button></section>`
  };
  const activeTab = THEORY_DETAIL_TAB_ORDER.some((tab) => tab.key === assistantState.theory.detailTab)
    ? assistantState.theory.detailTab
    : "explanation";
  assistantState.theory.detailTab = activeTab;
  $("#theory-detail-content").innerHTML = `${content[activeTab] || content.explanation}${renderTheoryLiterature(item, activeTab)}${renderTheoryDetailPager(activeTab)}`;
  refreshIcons();
}

const THEORY_CHAT_HISTORY_STORAGE_KEY = "edulink_theory_chat_history_v1";
const THEORY_CHAT_CLIENT_ID_KEY = "edulink_theory_chat_client_v1";
let transientTheoryChatClientId = "";

function getTheoryChatClientId() {
  try {
    let value = localStorage.getItem(THEORY_CHAT_CLIENT_ID_KEY);
    if (!value) {
      value = window.crypto?.randomUUID?.() || `chat-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(THEORY_CHAT_CLIENT_ID_KEY, value);
    }
    return value;
  } catch {
    if (!transientTheoryChatClientId) transientTheoryChatClientId = window.crypto?.randomUUID?.() || `chat-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    return transientTheoryChatClientId;
  }
}

const localTheoryChatHistoryAdapter = {
  async list({ query = "" } = {}) {
    const sessions = JSON.parse(localStorage.getItem(THEORY_CHAT_HISTORY_STORAGE_KEY) || "[]");
    const keyword = query.trim().toLowerCase();
    return keyword ? sessions.filter((item) => `${item.title} ${item.preview || ""}`.toLowerCase().includes(keyword)) : sessions;
  },
  async get(id) {
    const sessions = await this.list();
    return sessions.find((item) => item.id === id) || null;
  },
  async save(session) {
    const sessions = await this.list();
    const index = sessions.findIndex((item) => item.id === session.id);
    const snapshot = JSON.parse(JSON.stringify(session));
    if (index >= 0) sessions[index] = snapshot;
    else sessions.unshift(snapshot);
    localStorage.setItem(THEORY_CHAT_HISTORY_STORAGE_KEY, JSON.stringify(sessions));
    return snapshot;
  },
  async remove(id) {
    const sessions = await this.list();
    localStorage.setItem(THEORY_CHAT_HISTORY_STORAGE_KEY, JSON.stringify(sessions.filter((item) => item.id !== id)));
  }
};

let theoryChatHistoryAdapter = localTheoryChatHistoryAdapter;

function createTheoryChatHttpAdapter(baseUrl = "/api") {
  const normalizedBase = baseUrl.replace(/\/$/, "");
  const root = `${normalizedBase.endsWith("/api") ? normalizedBase : `${normalizedBase}/api`}/theory-chat/sessions`;
  const clientId = getTheoryChatClientId();
  const withScope = (url) => `${url}${url.includes("?") ? "&" : "?"}client_id=${encodeURIComponent(clientId)}`;
  const request = async (url, options = {}) => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8000);
    const externalSignal = options.signal;
    const abortFromCaller = () => controller.abort();
    if (externalSignal) {
      if (externalSignal.aborted) controller.abort();
      else externalSignal.addEventListener("abort", abortFromCaller, { once: true });
    }
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...(EDULINK_RAG_CONFIG.token ? { Authorization: `Bearer ${EDULINK_RAG_CONFIG.token}` } : {}),
          "X-EduLink-Client": clientId,
          ...(options.headers || {})
        }
      });
      if (!response.ok) throw new Error(`Theory chat history request failed: ${response.status}`);
      return response.status === 204 ? null : response.json();
    } finally {
      window.clearTimeout(timeout);
      externalSignal?.removeEventListener("abort", abortFromCaller);
    }
  };
  return {
    list: ({ query = "" } = {}) => request(withScope(`${root}?q=${encodeURIComponent(query)}`)),
    get: (id) => request(withScope(`${root}/${encodeURIComponent(id)}`)),
    save: (session) => request(withScope(`${root}/${encodeURIComponent(session.id)}`), { method: "PUT", body: JSON.stringify({ ...session, client_id: clientId }) }),
    remove: (id) => request(withScope(`${root}/${encodeURIComponent(id)}`), { method: "DELETE" })
  };
}

function createSyncedTheoryChatAdapter(baseUrl = "/api") {
  const remote = createTheoryChatHttpAdapter(baseUrl);
  const local = localTheoryChatHistoryAdapter;
  let localMutationTail = Promise.resolve();
  const remoteMutationTails = new Map();
  const enqueueLocal = (operation) => {
    const next = localMutationTail.then(operation, operation);
    localMutationTail = next.catch(() => {});
    return next;
  };
  const enqueueRemote = (id, operation) => {
    const key = String(id || "");
    const previous = remoteMutationTails.get(key) || Promise.resolve();
    const next = previous.then(operation, operation);
    remoteMutationTails.set(key, next.catch(() => {}));
    return next;
  };
  const merge = (left = [], right = []) => {
    const items = new Map();
    [...left, ...right].forEach((item) => {
      if (!item?.id) return;
      const old = items.get(item.id);
      if (!old || (Date.parse(item.updatedAt || "") || 0) >= (Date.parse(old.updatedAt || "") || 0)) items.set(item.id, item);
    });
    return [...items.values()].sort((a, b) => (Date.parse(b.updatedAt || "") || 0) - (Date.parse(a.updatedAt || "") || 0));
  };
  return {
    async list(options = {}) {
      await localMutationTail.catch(() => {});
      const localSessions = await local.list(options).catch(() => []);
      try {
        const remoteSessions = await remote.list(options);
        const merged = merge(localSessions, remoteSessions);
        await enqueueLocal(async () => { for (const session of merged) await local.save(session); });
        if (!options.query) {
          const remoteIds = new Set((remoteSessions || []).map((item) => item.id));
          localSessions.filter((item) => !remoteIds.has(item.id)).slice(0, 20).forEach((session) => void enqueueRemote(session.id, () => remote.save(session)).catch(() => {}));
        }
        return merged;
      } catch { return localSessions; }
    },
    async get(id) {
      await localMutationTail.catch(() => {});
      try {
        const session = await remote.get(id);
        if (session) await enqueueLocal(() => local.save(session));
        return session;
      } catch { return local.get(id); }
    },
    async save(session) {
      const snapshot = await enqueueLocal(() => local.save(session));
      try { return await enqueueRemote(session?.id, () => remote.save(snapshot)); }
      catch { return snapshot; }
    },
    async remove(id) {
      await enqueueLocal(() => local.remove(id));
      try { await enqueueRemote(id, () => remote.remove(id)); } catch { /* local deletion remains available offline */ }
    }
  };
}

window.EduLinkTheoryChatHistory = {
  endpoints: {
    list: "GET /api/theory-chat/sessions?q=关键词",
    detail: "GET /api/theory-chat/sessions/:id",
    save: "PUT /api/theory-chat/sessions/:id",
    remove: "DELETE /api/theory-chat/sessions/:id"
  },
  createHttpAdapter: createTheoryChatHttpAdapter,
  setAdapter(adapter) {
    theoryChatHistoryAdapter = { ...localTheoryChatHistoryAdapter, ...adapter };
    return hydrateTheoryChatHistory();
  },
  useHttp(baseUrl = "/api") {
    return this.setAdapter(createSyncedTheoryChatAdapter(baseUrl));
  },
  refresh: () => hydrateTheoryChatHistory()
};

function theoryDialogueWelcome() {
  return { role: "assistant", html: "<b>今天想深入哪一个教育理论？</b><p>你可以问核心观点、课堂落实、具体案例或适用边界。我会把理论解释连接到可观察的课堂行为。</p>" };
}

function cloneTheoryMessages(messages) {
  return JSON.parse(JSON.stringify(messages || []));
}

function ensureTheoryDialogueSession() {
  if (!Array.isArray(assistantState.theory.dialogueSessions)) assistantState.theory.dialogueSessions = [];
  let session = assistantState.theory.dialogueSessions.find((item) => item.id === assistantState.theory.activeDialogueSessionId);
  if (!session && assistantState.theory.dialogueSessions.length) session = assistantState.theory.dialogueSessions[0];
  if (!session) {
    const messages = assistantState.theory.dialogue?.length ? cloneTheoryMessages(assistantState.theory.dialogue) : [theoryDialogueWelcome()];
    session = { id: `theory-chat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, title: "新对话", preview: "开始一次新的理论学习", theoryId: assistantState.theory.selectedId, messages, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    assistantState.theory.dialogueSessions.push(session);
  }
  assistantState.theory.activeDialogueSessionId = session.id;
  if (!Array.isArray(assistantState.theory.dialogue) || !assistantState.theory.dialogue.length) assistantState.theory.dialogue = cloneTheoryMessages(session.messages?.length ? session.messages : [theoryDialogueWelcome()]);
  return session;
}

function getActiveTheoryDialogueSession() {
  return ensureTheoryDialogueSession();
}

function getTheoryDialoguePreview(messages) {
  const last = [...(messages || [])].reverse().find((message) => message.role === "user");
  return (last?.text || "开始一次新的理论学习").slice(0, 56);
}

function persistActiveTheoryDialogueSession() {
  const session = getActiveTheoryDialogueSession();
  const firstQuestion = assistantState.theory.dialogue.find((message) => message.role === "user")?.text?.trim();
  Object.assign(session, {
    title: firstQuestion ? firstQuestion.slice(0, 22) : "新对话",
    preview: getTheoryDialoguePreview(assistantState.theory.dialogue),
    theoryId: assistantState.theory.selectedId,
    messages: cloneTheoryMessages(assistantState.theory.dialogue),
    updatedAt: new Date().toISOString()
  });
  theoryChatHistoryAdapter.save(session).catch(() => {});
  renderTheoryChatHistory();
  scheduleWorkspaceSave();
}

function createTheoryDialogueSession() {
  cancelActiveTheoryRequest();
  if (assistantState.theory.activeDialogueSessionId) persistActiveTheoryDialogueSession();
  const now = new Date().toISOString();
  const session = { id: `theory-chat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, title: "新对话", preview: "开始一次新的理论学习", theoryId: assistantState.theory.selectedId, messages: [theoryDialogueWelcome()], createdAt: now, updatedAt: now };
  assistantState.theory.dialogueSessions.unshift(session);
  assistantState.theory.activeDialogueSessionId = session.id;
  assistantState.theory.dialogue = cloneTheoryMessages(session.messages);
  theoryChatHistoryAdapter.save(session).catch(() => {});
  renderTheoryDialogue();
  scheduleWorkspaceSave();
}

async function openTheoryDialogueSession(id) {
  if (id === assistantState.theory.activeDialogueSessionId) return;
  cancelActiveTheoryRequest();
  let session = assistantState.theory.dialogueSessions.find((item) => item.id === id);
  if (!session) session = await theoryChatHistoryAdapter.get(id).catch(() => null);
  if (!session) return;
  if (!assistantState.theory.dialogueSessions.some((item) => item.id === session.id)) assistantState.theory.dialogueSessions.unshift(session);
  assistantState.theory.activeDialogueSessionId = session.id;
  assistantState.theory.selectedId = session.theoryId || assistantState.theory.selectedId;
  assistantState.theory.dialogue = cloneTheoryMessages(session.messages || [theoryDialogueWelcome()]);
  renderTheoryDialogue();
  renderTheoryDetail();
  scheduleWorkspaceSave();
}

async function removeTheoryDialogueSession(id) {
  if (id === assistantState.theory.activeDialogueSessionId) cancelActiveTheoryRequest();
  assistantState.theory.dialogueSessions = assistantState.theory.dialogueSessions.filter((item) => item.id !== id);
  await theoryChatHistoryAdapter.remove(id).catch(() => {});
  if (assistantState.theory.activeDialogueSessionId === id) {
    assistantState.theory.activeDialogueSessionId = "";
    assistantState.theory.dialogue = [];
    ensureTheoryDialogueSession();
    renderTheoryDialogue();
  } else renderTheoryChatHistory();
  scheduleWorkspaceSave();
}

function formatTheoryChatTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "刚刚";
  const today = new Date();
  return date.toDateString() === today.toDateString() ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : `${date.getMonth() + 1}/${date.getDate()}`;
}

function renderTheoryChatHistory() {
  const list = $("#theory-history-list");
  if (!list) return;
  const query = ($("#theory-history-query")?.value || "").trim().toLowerCase();
  const sessions = [...(assistantState.theory.dialogueSessions || [])].filter((item) => `${item.title} ${item.preview}`.toLowerCase().includes(query)).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  list.innerHTML = sessions.length ? sessions.map((item) => `<article class="${item.id === assistantState.theory.activeDialogueSessionId ? "active" : ""}"><button type="button" data-theory-history-open="${item.id}"><b>${escapeHtml(item.title)}</b><span>${escapeHtml(item.preview || "暂无内容")}</span><small>${formatTheoryChatTime(item.updatedAt)}</small></button><button type="button" data-theory-history-delete="${item.id}" title="删除对话"><i data-lucide="trash-2"></i></button></article>`).join("") : `<div class="theory-history-empty"><i data-lucide="messages-square"></i><span>暂无匹配的历史对话</span></div>`;
  refreshIcons();
}

function renderTheoryChatHistoryRail() {
  const list = $("#theory-chat-history-float-list");
  if (!list) return;
  const questions = (assistantState.theory.dialogue || [])
    .map((message, index) => ({ message, index }))
    .filter(({ message }) => message.role === "user" && theoryMessageText(message));
  const currentIndex = questions.length ? questions[questions.length - 1].index : -1;
  list.innerHTML = questions.length
    ? questions.map(({ message, index }) => {
      const question = theoryMessageText(message);
      return `<button type="button" class="${index === currentIndex ? "active" : ""}" data-theory-chat-jump="${index}" title="${escapeHtml(question)}"><i aria-hidden="true"></i><span>${escapeHtml(question)}</span></button>`;
    }).join("")
    : `<div class="theory-chat-history-float-empty"><i aria-hidden="true"></i></div>`;
}

function mergeTheoryChatSessions(localSessions = [], remoteSessions = []) {
  const merged = new Map();
  [...localSessions, ...remoteSessions].forEach((item) => {
    if (!item?.id) return;
    const previous = merged.get(item.id);
    if (!previous || (Date.parse(item.updatedAt || "") || 0) >= (Date.parse(previous.updatedAt || "") || 0)) merged.set(item.id, item);
  });
  return [...merged.values()].sort((a, b) => (Date.parse(b.updatedAt || "") || 0) - (Date.parse(a.updatedAt || "") || 0));
}

function setTheoryDialogueSidebar(tab) {
  $$('[data-dialogue-sidebar-tab]').forEach((button) => button.classList.toggle("active", button.dataset.dialogueSidebarTab === tab));
  $$('[data-dialogue-sidebar-panel]').forEach((panel) => { const active = panel.dataset.dialogueSidebarPanel === tab; panel.hidden = !active; panel.classList.toggle("active", active); });
  if (tab === "history") renderTheoryChatHistory();
}

async function hydrateTheoryChatHistory() {
  const sessions = await theoryChatHistoryAdapter.list().catch(() => []);
  if (!Array.isArray(sessions)) return;
  const current = assistantState.theory.dialogueSessions || [];
  const activeId = assistantState.theory.activeDialogueSessionId;
  const currentActive = current.find((item) => item.id === activeId);
  const merged = mergeTheoryChatSessions(current, sessions);
  assistantState.theory.dialogueSessions = merged;
  const hydratedActive = merged.find((item) => item.id === activeId);
  if (hydratedActive && !assistantState.theory.pending) {
    const remoteTime = Date.parse(hydratedActive.updatedAt || "") || 0;
    const localTime = Date.parse(currentActive?.updatedAt || "") || 0;
    if (!currentActive || remoteTime >= localTime) {
      assistantState.theory.dialogue = cloneTheoryMessages(hydratedActive.messages || [theoryDialogueWelcome()]);
      assistantState.theory.selectedId = hydratedActive.theoryId || assistantState.theory.selectedId;
    }
  }
  renderTheoryChatHistory();
  renderTheoryDialogue({ preserveScroll: true });
}

function renderTheoryDialogueTopics() {
  const current = getSelectedLearningTheory();
  $("#dialogue-topic-list").innerHTML = learningTheoryProfiles.slice(0, 7).map((item) => `<button type="button" data-theory-topic="${item.id}" class="${item.id === current.id ? "active" : ""}"><span aria-hidden="true"><i data-lucide="${getTheoryIcon(item)}"></i></span><div><b>${item.name}</b><small>${item.group}</small></div></button>`).join("");
  $("#theory-chat-context").textContent = current.name;
}

function formatRagInline(text) {
  return String(text || "")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([0-9]+)\]/g, '<span class="source-citation">[$1]</span>');
}

function renderRagMarkdown(markdown) {
  const safeText = escapeHtml(String(markdown || "")).replace(/\r\n?/g, "\n");
  const output = [];
  let listType = "";
  const closeList = () => {
    if (listType) output.push(`</${listType}>`);
    listType = "";
  };
  safeText.split("\n").forEach((line) => {
    const trimmed = line.trim();
    const heading = trimmed.match(/^(#{1,4})\s+(.+)$/);
    const unordered = trimmed.match(/^[-*]\s+(.+)$/);
    const ordered = trimmed.match(/^(\d+)[.)]\s+(.+)$/);
    const quote = trimmed.match(/^&gt;\s*(.+)$/);
    if (!trimmed) return;
    if (heading) {
      closeList();
      const level = Math.min(4, heading[1].length);
      output.push(`<h${level}>${formatRagInline(heading[2])}</h${level}>`);
      return;
    }
    if (unordered || ordered) {
      const nextType = unordered ? "ul" : "ol";
      if (listType !== nextType) {
        closeList();
        const start = ordered ? ` start="${Number(ordered[1]) || 1}"` : "";
        output.push(`<${nextType}${start}>`);
        listType = nextType;
      }
      output.push(`<li>${formatRagInline(unordered ? unordered[1] : ordered[2])}</li>`);
      return;
    }
    closeList();
    if (quote) output.push(`<blockquote>${formatRagInline(quote[1])}</blockquote>`);
    else output.push(`<p>${formatRagInline(trimmed)}</p>`);
  });
  closeList();
  return output.join("");
}

function renderRagSources(sources) {
  if (!Array.isArray(sources) || !sources.length) return "";
  const items = sources.slice(0, 12).map((source, index) => {
    const number = Number(source.number) || index + 1;
    const theory = escapeHtml(String(source.theory_name || "未命名理论"));
    const sourceType = escapeHtml(String(source.source_type || "知识库资料"));
    const title = escapeHtml(String(source.source_title || ""));
    const path = Array.isArray(source.category_path)
      ? escapeHtml(source.category_path.join(" / "))
      : "";
    const detail = [theory, sourceType, title].filter(Boolean).join(" · ");
    return `<li><b>[${number}] ${detail}</b>${path ? `<small>${path}</small>` : ""}</li>`;
  }).join("");
  return `<details class="theory-message-sources"><summary>知识库来源（${sources.length}）</summary><ol>${items}</ol></details>`;
}

function plainTextFromLegacyHtml(html) {
  if (!html) return "";
  const parsed = new DOMParser().parseFromString(String(html), "text/html");
  return (parsed.body.textContent || "").replace(/\s+/g, " ").trim();
}

function theoryMessageText(message) {
  if (typeof message?.text === "string") return message.text.trim();
  return typeof message?.html === "string" ? plainTextFromLegacyHtml(message.html) : "";
}

function recentTheoryHistory(dialogue = assistantState.theory.dialogue) {
  return (dialogue || [])
    .filter((message) => !message.intro && !message.streaming && !message.requestFailed)
    .map((message) => ({ role: message.role, content: theoryMessageText(message) }))
    .filter((message) => ["user", "assistant"].includes(message.role) && message.content)
    .slice(-8);
}

function ragResponseStatus(data) {
  const timing = data?.timing && typeof data.timing === "object" ? data.timing : {};
  const status = {};
  ["retrieval_used", "search_ms", "model_ms", "total_ms"].forEach((key) => {
    const value = data?.[key] ?? timing[key];
    if (value !== undefined && value !== null) status[key] = value;
  });
  return status;
}

function formatRagDuration(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return "";
  const safeValue = Math.max(0, numericValue);
  return safeValue >= 1000
    ? `${(safeValue / 1000).toLocaleString("zh-CN", { maximumFractionDigits: 1 })} 秒`
    : `${safeValue.toLocaleString("zh-CN", { maximumFractionDigits: 1 })} 毫秒`;
}

function renderRagStatus(status) {
  if (!status || typeof status !== "object") return "";
  const parts = [];
  if (Object.prototype.hasOwnProperty.call(status, "retrieval_used")) {
    parts.push(status.retrieval_used === true ? "已检索知识库" : "未检索知识库");
  }
  const labels = { search_ms: "检索", model_ms: "模型", total_ms: "总计" };
  ["search_ms", "model_ms", "total_ms"].forEach((key) => {
    if (!Object.prototype.hasOwnProperty.call(status, key)) return;
    const duration = formatRagDuration(status[key]);
    if (duration) parts.push(`${labels[key]} ${duration}`);
  });
  return parts.length
    ? `<div class="theory-response-status" aria-label="接口响应状态"><small>${parts.join(" · ")}</small></div>`
    : "";
}

function buildRagTrace(data, historyCount) {
  const steps = [historyCount
    ? `已读取最近 ${historyCount} 条对话，用于理解指代和连续追问。`
    : "已识别为新会话，本轮不读取旧对话。"];
  const sourceCount = Array.isArray(data?.sources) ? data.sources.length : 0;
  if (data?.retrieval_used === true) {
    steps.push(`知识库相关性判断通过，已选取 ${sourceCount} 个相关片段作为回答依据。`);
  } else {
    const decisions = {
      small_talk: "识别为日常对话，本轮跳过知识库检索。",
      no_domain_signal: "未发现明确的教育领域信号，本轮跳过知识库检索。",
      below_threshold: "候选片段未达到相关性阈值，本轮不引入知识库内容。"
    };
    steps.push(decisions[data?.retrieval_reason] || "本轮未使用知识库片段，直接生成回答。");
  }
  const modelDuration = formatRagDuration(data?.model_ms);
  steps.push(modelDuration ? `模型已完成回答生成，用时 ${modelDuration}。` : "模型已完成回答生成。");
  return { state: "complete", steps };
}

function buildFailedRagTrace(historyCount, failureReason) {
  return {
    state: "failed",
    steps: [
      historyCount ? `已读取最近 ${historyCount} 条对话。` : "本轮为新会话。",
      `${failureReason}，在线处理未完成。`,
      "本轮未生成回答，可稍后重新尝试。"
    ]
  };
}

function describeRagFailure(error) {
  const message = String(error?.message || "");
  const status = Number(error?.httpStatus || 0);
  if (error?.retryExhausted) return {
    reason: `模型流式回答连续 ${Number(error.theoryAttemptCount) || THEORY_STREAM_MAX_ATTEMPTS} 次未完成`,
    answer: "模型流式回答生成失败，请稍后重新尝试",
    toast: `模型回答未完成，已自动尝试 ${Number(error.theoryAttemptCount) || THEORY_STREAM_MAX_ATTEMPTS} 次。`
  };
  if (error?.name === "AbortError") return { reason: "在线请求超过等待时间", answer: "在线请求超过等待时间，本轮未生成回答。请稍后重新尝试。", toast: "在线请求超时，请稍后重试。" };
  if (status === 504 || /中转站.*(连接失败|超时)|relay.*unreachable/i.test(message)) return { reason: "模型中转站连接失败或响应超时", answer: "模型中转站当前没有响应，本轮未生成在线回答。请稍后重新尝试。", toast: "模型中转站暂时无响应。" };
  if (status === 502 || /中转站|鉴权|API Key/i.test(message)) return { reason: message || "模型中转站返回错误", answer: `${message || "模型中转站返回错误"}，本轮未生成回答。请检查中转站状态后重试。`, toast: "模型中转站返回错误。" };
  if (/流式(响应|回答|输出)/.test(message)) return { reason: message || "模型流式输出中断", answer: message || "模型流式输出中断，请重新尝试。", toast: "模型流式输出中断。" };
  if (status >= 500) return { reason: message || "后端服务处理失败", answer: `${message || "后端服务处理失败"}，本轮未生成回答。请稍后重新尝试。`, toast: "后端服务处理失败。" };
  return { reason: "无法连接到后端服务", answer: "无法连接到后端服务，请确认服务和公网隧道仍在运行后重新尝试。", toast: "无法连接到后端服务。" };
}

function renderRagTrace(trace) {
  const steps = Array.isArray(trace?.steps) ? trace.steps.filter(Boolean) : [];
  if (!steps.length) return "";
  const stateClass = trace?.state === "failed" ? " failed" : "";
  const items = steps.map((step, index) => `<li><span>${index + 1}</span><p>${escapeHtml(String(step))}</p></li>`).join("");
  return `<details class="theory-thinking-panel theory-thinking-complete${stateClass}"><summary><span class="theory-thinking-icon"><i data-lucide="workflow"></i></span><b>处理过程</b><small>${steps.length} 个步骤</small><i class="theory-thinking-chevron" data-lucide="chevron-down"></i></summary><ol>${items}</ol></details>`;
}

let activeTheoryProgressStop = null;
let activeTheoryRequestController = null;

function cancelActiveTheoryRequest() {
  if (activeTheoryRequestController) activeTheoryRequestController.abort();
  activeTheoryRequestController = null;
  if (activeTheoryProgressStop) activeTheoryProgressStop();
  activeTheoryProgressStop = null;
  if (assistantState.theory.pending) assistantState.theory.requestId = Number(assistantState.theory.requestId || 0) + 1;
  assistantState.theory.pending = false;
  const submitButton = $("#theory-chat-form button[type='submit']");
  if (submitButton) submitButton.disabled = false;
}

function startTheoryProgress(requestId, historyCount) {
  const shell = $("#theory-chat-messages");
  const contextStep = historyCount
    ? `读取最近 ${historyCount} 条对话，理解当前问题的上下文。`
    : "识别新会话并理解当前问题。";
  shell.insertAdjacentHTML("beforeend", `<article class="theory-message assistant thinking" data-theory-progress="${requestId}"><span><i data-lucide="sparkles"></i></span><div><details class="theory-thinking-panel theory-thinking-pending"><summary><span class="theory-progress-pulse" aria-hidden="true"></span><b data-progress-label>正在理解问题</b><small data-progress-elapsed>0 秒</small><i class="theory-thinking-chevron" data-lucide="chevron-down"></i></summary><ol aria-live="polite"><li data-progress-step="0"><span>1</span><p>${escapeHtml(contextStep)}</p></li><li data-progress-step="1"><span>2</span><p>评估问题与知识库的相关性，准备必要片段。</p></li><li data-progress-step="2"><span>3</span><p>等待模型组织并生成回答。</p></li></ol></details></div></article>`);
  shell.scrollTop = shell.scrollHeight;
  refreshIcons();
  const article = shell.querySelector(`[data-theory-progress="${requestId}"]`);
  const startedAt = performance.now();
  const labels = ["正在理解问题", "正在判断知识库相关性", "正在等待模型回答"];
  const update = () => {
    if (!article?.isConnected) return;
    const elapsedSeconds = Math.max(0, Math.floor((performance.now() - startedAt) / 1000));
    const activeStep = elapsedSeconds < 2 ? 0 : elapsedSeconds < 4 ? 1 : 2;
    const label = article.querySelector("[data-progress-label]");
    const elapsed = article.querySelector("[data-progress-elapsed]");
    if (label) label.textContent = article.dataset.progressLabel || labels[activeStep];
    if (elapsed) elapsed.textContent = `${elapsedSeconds} 秒`;
    article.querySelectorAll("[data-progress-step]").forEach((step, index) => {
      step.dataset.state = index < activeStep ? "done" : index === activeStep ? "active" : "pending";
    });
  };
  update();
  const timer = window.setInterval(update, 1000);
  return () => window.clearInterval(timer);
}

function updateTheoryStreamProgress(requestId, phase, data = {}) {
  const article = $("#theory-chat-messages").querySelector(`[data-theory-progress="${requestId}"]`);
  if (!article) return;
  if (phase === "meta") {
    article.dataset.progressLabel = data.retrieval_used ? "知识库召回完成，等待模型输出" : "问题分析完成，等待模型输出";
    article.querySelectorAll("[data-progress-step]").forEach((step, index) => {
      step.dataset.state = index < 2 ? "done" : index === 2 ? "active" : "pending";
    });
  } else if (phase === "delta") {
    article.dataset.progressLabel = "模型正在流式生成回答";
  }
  const label = article.querySelector("[data-progress-label]");
  if (label) label.textContent = article.dataset.progressLabel;
}

function updateTheoryRetryProgress(requestId, nextAttempt, delayMs) {
  const article = $("#theory-chat-messages")?.querySelector(`[data-theory-progress="${requestId}"]`);
  if (!article) return;
  const seconds = Math.max(1, Math.ceil(Number(delayMs || 0) / 1000));
  article.dataset.progressLabel = `连接暂时中断，${seconds} 秒后进行第 ${nextAttempt}/${THEORY_STREAM_MAX_ATTEMPTS} 次尝试`;
  const modelStep = article.querySelector('[data-progress-step="2"] p');
  if (modelStep) modelStep.textContent = `后台将自动重新请求模型（第 ${nextAttempt}/${THEORY_STREAM_MAX_ATTEMPTS} 次），无需重复点击发送。`;
  const label = article.querySelector("[data-progress-label]");
  if (label) label.textContent = article.dataset.progressLabel;
}

async function requestRagAnswer(question, history, responseMode = null, sessionContext = {}) {
  if (!EDULINK_RAG_CONFIG.baseUrl || !EDULINK_RAG_CONFIG.token) throw new Error("RAG API config is missing");
  const controller = new AbortController();
  activeTheoryRequestController = controller;
  const timeout = window.setTimeout(() => controller.abort(), EDULINK_RAG_CONFIG.timeoutMs);
  try {
    const response = await fetch(`${EDULINK_RAG_CONFIG.baseUrl}/api/chat`, {
      method: "POST",
      mode: "cors",
      cache: "no-store",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${EDULINK_RAG_CONFIG.token}` },
      body: JSON.stringify({
        question,
        top_k: EDULINK_RAG_CONFIG.topK,
        history: Array.isArray(history) ? history.slice(-8) : [],
        session_id: sessionContext.sessionId || null,
        context_theory: sessionContext.theoryName || getSelectedLearningTheory().name,
        response_mode: responseMode || null
      }),
      signal: controller.signal
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(typeof data.detail === "string" ? data.detail : `RAG request failed (${response.status})`);
      error.httpStatus = response.status;
      error.retryable = [408, 409, 425, 429].includes(response.status) || response.status >= 500;
      throw error;
    }
    if (!data.answer || typeof data.answer !== "string") throw new Error("RAG response has no answer");
    return data;
  } finally {
    window.clearTimeout(timeout);
    if (activeTheoryRequestController === controller) activeTheoryRequestController = null;
  }
}

function parseRagSseEvent(block) {
  const lines = String(block || "").split("\n");
  let eventType = "message";
  const dataLines = [];
  lines.forEach((line) => {
    if (line.startsWith("event:")) eventType = line.slice(6).trim() || "message";
    else if (line.startsWith("data:")) dataLines.push(line.slice(5).trimStart());
  });
  if (!dataLines.length) return null;
  const payload = JSON.parse(dataLines.join("\n"));
  if (!payload.type) payload.type = eventType;
  return payload;
}

function drainRagSseBuffer(buffer, dispatch, flush = false) {
  let pending = String(buffer || "").replace(/\r\n/g, "\n");
  let boundary = pending.indexOf("\n\n");
  while (boundary >= 0) {
    const block = pending.slice(0, boundary);
    pending = pending.slice(boundary + 2);
    if (block.trim() && !block.trimStart().startsWith(":")) dispatch(block);
    boundary = pending.indexOf("\n\n");
  }
  if (flush && pending.trim() && !pending.trimStart().startsWith(":")) {
    dispatch(pending);
    return "";
  }
  return pending;
}

function ragStreamError(payload) {
  const error = new Error(payload?.detail || "模型流式响应失败");
  const statusByCode = { relay_authentication_failed: 502, relay_connection_failed: 504, relay_status_error: 502, stream_generation_failed: 500 };
  error.httpStatus = statusByCode[payload?.code] || 500;
  error.retryable = payload?.retryable !== false;
  error.errorCode = String(payload?.code || "");
  return error;
}

async function requestRagAnswerStream(question, history, responseMode = null, sessionContext = {}, handlers = {}) {
  if (!EDULINK_RAG_CONFIG.baseUrl || !EDULINK_RAG_CONFIG.token) throw new Error("RAG API config is missing");
  const controller = new AbortController();
  activeTheoryRequestController = controller;
  let timeout = 0;
  const armIdleTimeout = () => {
    window.clearTimeout(timeout);
    timeout = window.setTimeout(() => controller.abort(), EDULINK_RAG_CONFIG.timeoutMs);
  };
  armIdleTimeout();
  try {
    const response = await fetch(`${EDULINK_RAG_CONFIG.baseUrl}/api/chat/stream`, {
      method: "POST",
      mode: "cors",
      cache: "no-store",
      headers: { "Content-Type": "application/json", Accept: "text/event-stream", Authorization: `Bearer ${EDULINK_RAG_CONFIG.token}` },
      body: JSON.stringify({
        question,
        top_k: EDULINK_RAG_CONFIG.topK,
        history: Array.isArray(history) ? history.slice(-8) : [],
        session_id: sessionContext.sessionId || null,
        context_theory: sessionContext.theoryName || getSelectedLearningTheory().name,
        response_mode: responseMode || null
      }),
      signal: controller.signal
    });
    if (response.status === 404) {
      const fallback = await requestRagAnswer(question, history, responseMode, sessionContext);
      handlers.onMeta?.(fallback);
      handlers.onDelta?.(fallback.answer, fallback);
      handlers.onDone?.(fallback);
      return fallback;
    }
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      const error = new Error(typeof data.detail === "string" ? data.detail : `RAG stream request failed (${response.status})`);
      error.httpStatus = response.status;
      error.retryable = [408, 409, 425, 429].includes(response.status) || response.status >= 500;
      throw error;
    }
    if (!response.body) throw new Error("浏览器没有收到可读取的流式响应");
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";
    let completed = null;
    const dispatch = (block) => {
      const event = parseRagSseEvent(block);
      if (!event) return;
      if (event.type === "error") throw ragStreamError(event);
      if (event.type === "meta") handlers.onMeta?.(event);
      else if (event.type === "delta") handlers.onDelta?.(String(event.delta || ""), event);
      else if (event.type === "done") {
        completed = event;
        handlers.onDone?.(event);
      }
    };
    try {
      while (true) {
        const chunk = await reader.read();
        if (chunk.value?.byteLength) armIdleTimeout();
        buffer += decoder.decode(chunk.value || new Uint8Array(), { stream: !chunk.done });
        buffer = drainRagSseBuffer(buffer, dispatch, chunk.done);
        if (chunk.done) break;
      }
    } catch (error) {
      await reader.cancel().catch(() => {});
      throw error;
    } finally {
      reader.releaseLock();
    }
    if (!completed) throw new Error("模型流式响应意外结束，请重新尝试");
    return completed;
  } finally {
    window.clearTimeout(timeout);
    if (activeTheoryRequestController === controller) activeTheoryRequestController = null;
  }
}

function shouldRetryTheoryStream(error) {
  if (error?.retryable === false) return false;
  const status = Number(error?.httpStatus || 0);
  if ([400, 401, 403, 404, 413, 422].includes(status)) return false;
  if (/config is missing|未配置/i.test(String(error?.message || ""))) return false;
  return true;
}

async function requestRagAnswerStreamWithRetry(question, history, responseMode, sessionContext, handlers = {}, isCurrent = () => true) {
  let lastError = null;
  for (let attempt = 1; attempt <= THEORY_STREAM_MAX_ATTEMPTS; attempt += 1) {
    try {
      return await requestRagAnswerStream(question, history, responseMode, sessionContext, handlers);
    } catch (error) {
      lastError = error;
      error.theoryAttemptCount = attempt;
      const retryable = shouldRetryTheoryStream(error);
      if (!isCurrent() || !retryable || attempt >= THEORY_STREAM_MAX_ATTEMPTS) {
        error.retryExhausted = retryable && attempt >= THEORY_STREAM_MAX_ATTEMPTS;
        throw error;
      }
      const delayMs = THEORY_STREAM_RETRY_DELAYS_MS[Math.min(attempt - 1, THEORY_STREAM_RETRY_DELAYS_MS.length - 1)];
      handlers.onRetry?.({ attempt, nextAttempt: attempt + 1, maxAttempts: THEORY_STREAM_MAX_ATTEMPTS, delayMs, error });
      await new Promise((resolve) => window.setTimeout(resolve, delayMs));
      if (!isCurrent()) throw error;
    }
  }
  throw lastError || new Error("模型流式回答生成失败，请稍后重新尝试");
}

function renderTheoryMessageMarkup(message, messageIndex) {
  const retry = message.retryQuestion
    ? `<button class="theory-retry-button" type="button" data-theory-retry="${messageIndex}"><i data-lucide="refresh-cw"></i>重新尝试</button>`
    : "";
  const streaming = message.streaming ? '<span class="theory-stream-caret" aria-label="正在生成"></span>' : "";
  const content = message.role === "user"
    ? `<p>${escapeHtml(String(message.text || ""))}</p>`
    : `${message.text ? renderRagMarkdown(message.text) : message.html || ""}${streaming}${retry}${renderRagTrace(message.trace)}${renderRagStatus(message.status)}${renderRagSources(message.sources)}`;
  const streamAttribute = message.streaming && message.streamRequestId
    ? ` data-theory-stream="${escapeHtml(String(message.streamRequestId))}"`
    : "";
  const messageIndexAttribute = Number.isInteger(messageIndex)
    ? ` data-theory-message-index="${messageIndex}"`
    : "";
  return `<article class="theory-message ${message.role}${message.streaming ? " streaming" : ""}"${streamAttribute}${messageIndexAttribute}><span>${message.role === "assistant" ? '<i data-lucide="sparkles"></i>' : "我"}</span><div aria-live="${message.streaming ? "polite" : "off"}">${content}</div></article>`;
}

function isTheoryChatNearBottom(shell = $("#theory-chat-messages")) {
  return !shell || shell.scrollHeight - shell.scrollTop - shell.clientHeight < 96;
}

function appendTheoryStreamingMessage(message, messageIndex) {
  const shell = $("#theory-chat-messages");
  const stickToBottom = isTheoryChatNearBottom(shell);
  shell.insertAdjacentHTML("beforeend", renderTheoryMessageMarkup(message, messageIndex));
  if (stickToBottom) shell.scrollTop = shell.scrollHeight;
  refreshIcons();
}

function updateTheoryStreamingMessage(message) {
  const shell = $("#theory-chat-messages");
  const article = shell.querySelector(`[data-theory-stream="${message.streamRequestId}"]`);
  if (!article) return;
  const stickToBottom = isTheoryChatNearBottom(shell);
  article.lastElementChild.innerHTML = `${renderRagMarkdown(message.text)}<span class="theory-stream-caret" aria-label="正在生成"></span>`;
  if (stickToBottom) shell.scrollTop = shell.scrollHeight;
}

function renderTheoryDialogue(options = {}) {
  renderTheoryDialogueTopics();
  ensureTheoryDialogueSession();
  const shell = $("#theory-chat-messages");
  const previousScrollTop = shell.scrollTop;
  shell.innerHTML = assistantState.theory.dialogue.map(renderTheoryMessageMarkup).join("");
  shell.scrollTop = options.preserveScroll ? previousScrollTop : shell.scrollHeight;
  renderTheoryChatHistory();
  renderTheoryChatHistoryRail();
  refreshIcons();
}

async function submitTheoryQuestion(question, responseMode = null) {
  const value = String(question || "").trim();
  if (!value || assistantState.theory.pending) return;
  const session = getActiveTheoryDialogueSession();
  const dialogue = assistantState.theory.dialogue;
  const history = recentTheoryHistory(dialogue);
  const theory = learningTheoryProfiles.find((item) => item.id === session.theoryId) || getSelectedLearningTheory();
  assistantState.theory.pending = true;
  const requestId = Number(assistantState.theory.requestId || 0) + 1;
  assistantState.theory.requestId = requestId;
  dialogue.push({ role: "user", text: value });
  persistActiveTheoryDialogueSession();
  renderTheoryDialogue();
  $("#theory-chat-input").value = "";
  const submitButton = $("#theory-chat-form button[type='submit']");
  if (submitButton) submitButton.disabled = true;
  const stopProgress = startTheoryProgress(requestId, history.length);
  activeTheoryProgressStop = stopProgress;
  let streamMessage = null;
  let streamMeta = null;
  let streamRenderFrame = 0;
  let streamStableText = "";
  let streamRetryBuffer = "";
  let streamRetrying = false;
  const requestIsCurrent = () => requestId === assistantState.theory.requestId && session.id === assistantState.theory.activeDialogueSessionId;
  const scheduleStreamRender = () => {
    if (streamRenderFrame || !streamMessage) return;
    streamRenderFrame = window.requestAnimationFrame(() => {
      streamRenderFrame = 0;
      if (requestIsCurrent() && streamMessage?.streaming) updateTheoryStreamingMessage(streamMessage);
    });
  };
  try {
    const data = await requestRagAnswerStreamWithRetry(
      value,
      history,
      responseMode,
      { sessionId: session.id, theoryName: theory.name },
      {
        onMeta: (event) => {
          if (!requestIsCurrent()) return;
          streamMeta = event;
          updateTheoryStreamProgress(requestId, "meta", event);
        },
        onDelta: (delta) => {
          if (!delta || !requestIsCurrent()) return;
          updateTheoryStreamProgress(requestId, "delta");
          if (!streamMessage) {
            streamMessage = { role: "assistant", text: "", streaming: true, streamRequestId: String(requestId) };
            dialogue.push(streamMessage);
            appendTheoryStreamingMessage(streamMessage, dialogue.length - 1);
          }
          if (streamRetrying) streamRetryBuffer += delta;
          else {
            streamMessage.text += delta;
            scheduleStreamRender();
          }
        },
        onRetry: ({ nextAttempt, delayMs }) => {
          if (!requestIsCurrent()) return;
          streamMeta = null;
          if (streamMessage) {
            if (!streamRetrying) streamStableText = streamMessage.text;
            streamRetryBuffer = "";
            streamRetrying = true;
            streamMessage.streaming = true;
            streamMessage.streamRequestId = String(requestId);
            updateTheoryStreamingMessage(streamMessage);
          }
          updateTheoryRetryProgress(requestId, nextAttempt, delayMs);
        }
      },
      requestIsCurrent
    );
    if (!requestIsCurrent()) return;
    if (!streamMessage) {
      streamMessage = { role: "assistant", text: data.answer || "" };
      dialogue.push(streamMessage);
    }
    streamMessage.text = data.answer || (streamRetryBuffer || streamMessage.text);
    streamRetrying = false;
    streamRetryBuffer = "";
    streamStableText = streamMessage.text;
    streamMessage.streaming = false;
    delete streamMessage.streamRequestId;
    streamMessage.sources = Array.isArray(data.sources) ? data.sources : [];
    streamMessage.model = data.model || "";
    streamMessage.status = ragResponseStatus(data);
    streamMessage.trace = buildRagTrace(data, history.length);
    persistActiveTheoryDialogueSession();
  } catch (error) {
    console.warn("RAG request failed.", error);
    if (!requestIsCurrent()) return;
    const failure = describeRagFailure(error);
    if (!streamMessage) {
      streamMessage = { role: "assistant", text: failure.answer };
      dialogue.push(streamMessage);
    } else if (streamMessage.text.trim()) {
      if (streamRetrying && streamRetryBuffer) {
        streamMessage.text = streamRetryBuffer.length > streamStableText.length ? streamRetryBuffer : streamStableText;
      }
      streamMessage.text = `${streamMessage.text.trimEnd()}\n\n**输出中断**：${failure.answer}`;
    } else streamMessage.text = failure.answer;
    streamMessage.streaming = false;
    delete streamMessage.streamRequestId;
    streamMessage.sources = Array.isArray(streamMeta?.sources) ? streamMeta.sources : [];
    streamMessage.retryQuestion = value;
    streamMessage.retryMode = responseMode;
    streamMessage.requestFailed = true;
    streamMessage.trace = buildFailedRagTrace(history.length, failure.reason);
    persistActiveTheoryDialogueSession();
    toast(failure.toast);
  } finally {
    if (streamRenderFrame) window.cancelAnimationFrame(streamRenderFrame);
    const preserveScroll = !isTheoryChatNearBottom();
    stopProgress();
    if (activeTheoryProgressStop === stopProgress) activeTheoryProgressStop = null;
    if (!requestIsCurrent()) return;
    assistantState.theory.pending = false;
    if (submitButton) submitButton.disabled = false;
    renderTheoryDialogue({ preserveScroll });
    renderTheoryDetail();
    scheduleWorkspaceSave();
  }
}

function renderTheoryScenario() {
  const scenarioSet = getTheoryScenarioSetForMode();
  const index = Math.min(assistantState.theory.scenarioIndex, scenarioSet.length - 1);
  const item = scenarioSet[index];
  const selectedTheoryName = getSelectedLearningTheory()?.name || "当前理论";
  $("#scenario-index").textContent = `第 ${index + 1} 题 / 共 ${scenarioSet.length} 题`;
  $("#scenario-difficulty").textContent = index < 2 ? "基础 · 课堂识别" : "进阶 · 理论应用";
  $("#scenario-stem").textContent = item.stem;
  $("#scenario-question").textContent = item.question;
  $("#scenario-theory-name").textContent = selectedTheoryName;
  if ($("#scenario-theory-input-field")) $("#scenario-theory-input-field").value = selectedTheoryName;
  $$('[data-scenario-mode]').forEach((button) => button.classList.toggle("active", button.dataset.scenarioMode === (assistantState.theory.scenarioMode || "specialized")));
  $("#scenario-options").innerHTML = item.options.map((option, optionIndex) => `<button type="button" data-scenario-option="${optionIndex}"><span>${String.fromCharCode(65 + optionIndex)}</span>${option}</button>`).join("");
  $("#scenario-feedback").hidden = true;
  $("#scenario-feedback").innerHTML = "";
  $("#scenario-next").disabled = true;
  $("#scenario-score-value").textContent = assistantState.theory.scenarioScore * 25;
  $("#scenario-progress-bar").style.width = `${((index + 1) / scenarioSet.length) * 100}%`;
  if ($("#scenario-recent-title")) $("#scenario-recent-title").textContent = `最近训练：${selectedTheoryName} · ${scenarioSet.length} 题`;
  if ($("#scenario-recent-meta")) $("#scenario-recent-meta").textContent = assistantState.theory.scenarioAnsweredCount ? `已完成 ${assistantState.theory.scenarioAnsweredCount} 题，继续练习并查看完整理论解析` : "从理论库进入专项训练，答题后会在这里保留进度";
  assistantState.theory.scenarioAnswered = false;
}

function answerTheoryScenario(optionIndex) {
  if (assistantState.theory.scenarioAnswered) return;
  assistantState.theory.scenarioAnswered = true;
  assistantState.theory.scenarioAnsweredCount = Number(assistantState.theory.scenarioAnsweredCount || 0) + 1;
  const scenarioSet = getTheoryScenarioSetForMode();
  const item = scenarioSet[Math.min(assistantState.theory.scenarioIndex, scenarioSet.length - 1)];
  const correct = optionIndex === item.answer;
  if (correct) assistantState.theory.scenarioScore += 1;
  $$("#scenario-options button").forEach((button, index) => {
    button.disabled = true;
    if (index === item.answer) button.classList.add("correct");
    if (index === optionIndex && !correct) button.classList.add("wrong");
  });
  const feedback = $("#scenario-feedback");
  feedback.hidden = false;
  feedback.className = `scenario-feedback ${correct ? "correct" : "wrong"}`;
  const analysis = item.analysis || { knowledge: item.explanation, evidence: item.explanation, distinction: "请结合理论核心机制继续辨析。" };
  feedback.innerHTML = `<span><i data-lucide="${correct ? "circle-check" : "circle-x"}"></i></span><div class="scenario-feedback-content"><header><b>${correct ? "判断正确" : "判断有误"}</b><em>正确答案：${String.fromCharCode(65 + item.answer)} · ${escapeHtml(item.options[item.answer])}</em></header><section><strong>核心知识点</strong><p>${escapeHtml(analysis.knowledge)}</p></section><section><strong>情境精准对应</strong><p>${escapeHtml(analysis.evidence)}</p></section><section><strong>易错辨析</strong><p>${escapeHtml(analysis.distinction)}</p></section></div>`;
  $("#scenario-next").disabled = false;
  $("#scenario-score-value").textContent = assistantState.theory.scenarioScore * 25;
  renderTheoryOverview();
  refreshIcons();
  scheduleWorkspaceSave();
}

function getSixArtsFormData() {
  return {
    stage: $("#sixarts-stage").value,
    grade: $("#sixarts-grade").value,
    subject: $("#sixarts-subject").value,
    edition: $("#sixarts-edition").value,
    term: $("#sixarts-term")?.value || "",
    title: ($("#sixarts-title").value.trim() || "未命名课题").slice(0, 120),
    lessons: Number($("#sixarts-lessons").value) || 1,
    duration: Number($("#sixarts-duration").value) || 40,
    summary: $("#sixarts-summary").value.trim().slice(0, 5000),
    requirement: $("#sixarts-requirement").value.trim().slice(0, 5000),
    studentAnalysis: ($("#sixarts-student-analysis")?.value.trim() || "").slice(0, 5000),
    materials: assistantState.sixarts.materials || []
  };
}

function ensureSixArtsSourceContent(context = null) {
  const currentContext = context || assistantState.sixarts.form || getSixArtsFormData();
  if (!/圆的认识/.test(String(currentContext.title || ""))) return currentContext;
  if (assistantState.sixarts.sourceContentRevision === SIXARTS_SOURCE_CONTENT_REVISION) return currentContext;

  // Older saved workspaces contain generated copies with the same module
  // names, so a title comparison cannot tell them apart from the new source.
  // Clear only lesson-plan drafts; login, theory, reflection and preferences
  // remain untouched.
  assistantState.sixarts.designDraft = [];
  assistantState.sixarts.designFieldDraft = {};
  assistantState.sixarts.competencyDraft = {};
  assistantState.sixarts.processDraft = [];
  assistantState.sixarts.evaluationDraft = [];
  assistantState.sixarts.evaluationResponses = {};
  assistantState.sixarts.teacherEvaluationDraft = [];
  assistantState.sixarts.selfAssessmentDraft = [];
  assistantState.sixarts.reflectionPromptsDraft = [];
  assistantState.sixarts.practiceDraft = [];
  assistantState.sixarts.referenceDraft = [];
  assistantState.sixarts.homeworkDraft = "";
  assistantState.sixarts.extensionDraft = "";
  assistantState.sixarts.versionDrafts = {};
  assistantState.sixarts.generated = false;
  assistantState.sixarts.sourceContentRevision = SIXARTS_SOURCE_CONTENT_REVISION;
  assistantState.sixarts.form = { ...currentContext };
  return assistantState.sixarts.form;
}

function applySixArtsFormData(data = {}) {
  const mapping = { stage: "#sixarts-stage", grade: "#sixarts-grade", subject: "#sixarts-subject", edition: "#sixarts-edition", term: "#sixarts-term", title: "#sixarts-title", lessons: "#sixarts-lessons", duration: "#sixarts-duration", summary: "#sixarts-summary", requirement: "#sixarts-requirement", studentAnalysis: "#sixarts-student-analysis", student_analysis: "#sixarts-student-analysis" };
  Object.entries(mapping).forEach(([key, selector]) => {
    if (data[key] !== undefined && $(selector)) $(selector).value = data[key];
  });
}

function renderSixArtsSelector() {
  $("#sixarts-selector").innerHTML = sixArtsDimensions.map((item) => {
    const selected = assistantState.sixarts.selectedArts.includes(item.key);
    return `<label class="${selected ? "is-selected" : ""}" aria-selected="${selected}"><input type="checkbox" value="${item.key}" ${selected ? "checked" : ""} /><span><i data-lucide="${item.icon}"></i><b>${item.key}</b><small>${item.ability}</small></span></label>`;
  }).join("");
  $$("[data-sixart]").forEach((button) => button.classList.toggle("active", assistantState.sixarts.selectedArts.includes(button.dataset.sixart)));
  refreshIcons();
}

function getSelectedSixArts() {
  return sixArtsDimensions.filter((item) => assistantState.sixarts.selectedArts.includes(item.key));
}

function getSixArtsMode() {
  return $("input[name='sixarts-mode']:checked")?.value || assistantState.sixarts.mode || "complete";
}

function getSixArtsDetailLevel() {
  return $("input[name='sixarts-detail-level']:checked")?.value || assistantState.sixarts.detailLevel || "detailed";
}

function syncSixArtsModeControls() {
  const mode = assistantState.sixarts.mode || "complete";
  $$("input[name='sixarts-mode']").forEach((input) => { input.checked = input.value === mode; });
  const detailLevel = assistantState.sixarts.detailLevel || "detailed";
  $$("input[name='sixarts-detail-level']").forEach((input) => { input.checked = input.value === detailLevel; });
  const label = $("#sixarts-generate span");
  if (label && !assistantState.sixarts.pending) label.textContent = mode === "steps" ? "开始分阶段生成" : "生成教案";
}

function getSixArtsCompetencyGoals(context) {
  const title = context.title || "本课内容";
  const generic = [
    ["说", `能清晰、有条理地描述${title}的核心概念、关键特征和思考过程，并能与同伴交流发现。`],
    ["唱", `能通过口诀、节奏或歌谣辅助记忆${title}的关键信息，并表达相应情感。`],
    ["弹", "能灵活、准确地操作本课所需工具或材料，体现手眼协调、节奏控制与专注投入。"],
    ["舞", `能用身体动作、空间变化或情境表演呈现${title}的关系、过程或意象，发展具身理解。`],
    ["书", "能规范书写本课关键词、符号与结论，工整记录探究过程、学习表格和反思。"],
    ["画", `能用图示、概念图或视觉作品准确呈现${title}的信息结构，并进行创造性表达。`]
  ];
  const isConcise = assistantState.sixarts.detailLevel === "concise";
  let defaults = generic;
  if (/圆的认识/.test(title)) {
    defaults = isConcise ? [
      ["说", "能条理清晰、用语规范地描述画圆方法和圆的各部分特征，参与小组思辨，并用“一中同长”解释车轮原理。"],
      ["弹", "能精准控制圆规、绳子和图钉等工具，手眼协调完成折圆、测量、记录与多元画圆操作。"],
      ["舞", "能用手臂旋转和空间站位表现圆的运动轨迹，以具身体验理解圆心居中、半径等长。"],
      ["画", "能规范绘制不同位置、大小的圆并准确标注圆心、半径和直径，完成简易圆形创意图案。"]
    ] : [
      ["说", "能清晰、有条理地描述画圆方法、圆各部分名称和特征，进行数学推理并与同伴交流发现。"],
      ["唱", "能创编或有节奏地朗诵圆规口诀，借助韵律准确记忆画圆要点与圆的关键知识。"],
      ["弹", "能灵活、准确地操作圆规、绳子等工具，体现手眼协调和精细动作控制。"],
      ["舞", "能用旋转、环绕或空间站位表现圆的运动轨迹，感受圆的对称、流畅与“一中同长”。"],
      ["书", "能规范书写圆心、半径、直径的字母符号，工整记录探究数据、表格与结论。"],
      ["画", "能独立画出大小、位置不同的圆并准确标注，运用圆的特征设计简单创意图案。"]
    ];
  } else if (/小马过河/.test(title)) {
    defaults = isConcise ? [
      ["说", "能主动发言，完整表达个人观点，准确演绎不同角色的对话语气，并借助提示通顺复述故事大意。"],
      ["舞", "能结合文本语境，用贴合角色的肢体动作表现小马开心、为难以及松鼠焦急的状态。"],
      ["书", "能规范标注自然段，按正确笔顺和结构工整书写重点生字，养成严谨认真的书写习惯。"]
    ] : [
      ["说", "能完整表达自己遇到困难时的做法，分角色朗读并借助提示说出故事大意。"],
      ["唱", "能跟读或吟唱生字识记童谣，在节奏诵读中感受语言韵律并巩固字音。"],
      ["弹", "能在适配文本的背景音乐中专注听读，感受故事情境并保持良好阅读状态。"],
      ["舞", "能用神态和身体动作表现小马开心、为难以及松鼠焦急的状态，深化角色理解。"],
      ["书", "能规范标注自然段，正确书写重点生字，做到笔顺准确、结构匀称、页面整洁。"],
      ["画", "能借助流程图、板贴或四格画梳理故事起因、经过和结果，形成清晰视觉表达。"]
    ];
  } else if (isConcise) {
    const selected = new Set(assistantState.sixarts.selectedArts || []);
    defaults = generic.filter(([key]) => selected.has(key));
  }
  if (isConcise && defaults.length < generic.length) {
    const conciseCopy = new Map(defaults);
    defaults = generic.map(([key, text]) => [key, conciseCopy.get(key) || text]);
  }
  const draft = assistantState.sixarts.competencyDraft || {};
  return defaults.map(([key, text]) => ({ key, text: draft[key] || text }));
}

function getSixArtsLessonBlueprint(context, arts) {
  const artNames = arts.map((item) => item.key).join("、") || "说、画";
  const title = String(context.title || "");
  if (/圆的认识/.test(title)) {
    return { modules: getDetailedSixArtsModules(context, arts), stages: getCircleDetailedStages(context) };
  }
  if (/圆的认识/.test(title)) {
    return {
      modules: [
        ["教材分析", "本课选自人教版六年级上册第五单元，是学生系统学习曲线图形的起始课。学生此前已经学习长方形、正方形等直线图形特征，本课将从直线图形跨越到曲线图形，是后续学习圆周长、圆面积和圆柱圆锥的基础。教材按照“圆的认识—圆的周长—圆的面积—扇形”由浅入深编排，本课核心任务是通过动手操作认识圆心、半径和直径，掌握规范画圆方法，理解圆“一中同长”的本质。"],
        ["六艺育人定位", `本课重点融入“${artNames}”。圆的本质“一中同长”蕴含对称美与和谐美，可与“舞”的律动、“画”的构图相通；圆规操作与“弹”的精细动作协调一致；数学语言的精确表达对应“说”；规律总结与“书”的规范记录相辅相成。六艺活动嵌入几何探究全流程，服务于数感、空间观念、推理意识和模型意识的形成。`],
        ["学情分析", "六年级学生在生活中已经接触过大量圆形物品，具备实物拓印、观察和简单推理经验，但空间观念和规范使用圆规的熟练度仍需支架。教学应从绳圈、圆规、圆片等直观操作出发，引导学生经历猜想、验证、解释和应用，逐步理解“一中同长”，避免只记结论。"],
        ["教学目标", "1. 能用圆规规范画圆，认识圆心、半径和直径，理解它们的概念及关系（d=2r）。\n2. 通过操作、测量和推理掌握圆的特征，理解“一中同长”的数学内涵。\n3. 在说理、操作、书写、律动和视觉表达中形成有据表达、合作探究和审美感知能力。"],
        ["教学重难点", "重点：认识圆心、半径、直径的名称、特征与数量关系，掌握圆规规范画圆的方法。\n难点：通过动手操作深度体会圆“一中同长”的本质，并运用圆的特征解释车轮为什么是圆形，实现知识迁移。"],
        ["教学方法与准备", "采用情境教学、操作探究、比较辨析和表现性评价。准备多媒体课件、圆规、绳子、图钉、不同大小的圆片、硬币、学习任务单和彩笔；用轻音乐、歌谣和体态律动降低曲线图形的理解门槛。"]
      ],
      stages: [
        { title: "新课导入", time: "5 分钟", art_key: "说", teacher: "播放与车轮和圆形生活物品相关的情境材料，追问“为什么车轮通常做成圆形”，引导学生大胆猜想并明确本课学习任务。", student: "观察材料，联系生活说出猜想，用手臂模仿车轮旋转的动作，提出想进一步研究的问题。", steps: ["观看生活情境材料，寻找圆形物品。", "说一说车轮做成圆形可能带来的便利。", "用动作表现圆的运动轨迹，形成探究期待。"], intention: "从生活问题进入数学问题，借助表达和身体感知激活已有经验。", evidence: "学生能提出与圆的形状或运动轨迹有关的猜想。", materials: "车轮图片或短视频、圆形物品、问题卡", expected_output: "一条关于车轮形状的猜想", question_chain: "车轮为什么不是正方形？圆形运动时有什么特点？" },
        { title: "对比导入", time: "4 分钟", art_key: "说", teacher: "组织学生回顾长方形、正方形等直线图形，比较直线边与曲线边的不同，帮助学生初步认识圆的独特之处。", student: "观察不同图形，描述边的特点，尝试用完整的数学语言说出圆与其他平面图形的区别。", steps: ["观察直线图形和圆形。", "从边和顶点两个角度进行比较。", "用一句完整的话描述圆的外形特点。"], intention: "通过对比辨析建立圆的图形认知，为后续研究圆的内部结构做好铺垫。", evidence: "学生能从曲线、封闭图形等特征进行准确描述。" },
        { title: "多元画圆", time: "6 分钟", art_key: "弹", teacher: "提供绳子、图钉、硬币和圆规等工具，先允许学生用喜欢的方法画圆，再组织展示、比较和归纳，明确定点、定长两个关键要素。", student: "选择工具尝试画圆，展示方法，观察不同作品并说明画圆时哪些条件不能改变。", steps: ["用不同工具独立画圆。", "展示并比较作品的大小、位置和完整度。", "归纳圆规画圆的定点、定长要点。"], intention: "通过动手、观察和说理，让学生自主感知规范画圆的核心方法。", evidence: "作品能体现固定圆心和保持半径不变，学生能解释操作依据。" },
        { title: "概念辨析", time: "6 分钟", art_key: "书", teacher: "引导学生自学并标注圆心、半径和直径，借助图示、符号和同伴互说澄清概念及数量关系。", student: "在任务单上规范书写O、r、d，同桌互相解释半径和直径，依据图形判断线段身份。", steps: ["在圆片上标出圆心。", "连接圆心与圆上任意一点，认识半径。", "观察经过圆心且两端在圆上的线段，认识直径。", "用图示和语言说明d=2r。"], intention: "把直观操作转化为数学符号和准确表达，夯实圆的核心概念。", evidence: "学生能指出圆心、半径和直径，并说清它们的关系。" },
        { title: "发现特征", time: "12 分钟", art_key: "画", teacher: "组织折一折、量一量、画一画的合作探究，指导学生记录同圆内半径和直径的数据并归纳“一中同长”。", student: "折叠圆片、测量线段、记录数据，比较不同位置的半径和直径，合作完成圆的特征图示。", steps: ["折圆片寻找圆心和对称关系。", "测量同圆内不同半径，记录并比较。", "寻找不同直径，发现每条直径都经过圆心。", "用图示、表格和数学语言归纳特征。"], intention: "让学生在充分证据中理解圆的本质，经历从操作到归纳的数学建模过程。", evidence: "记录表完整，学生能用“一中同长”解释数据并回应同伴质疑。", materials: "圆片、直尺、任务单、彩笔", expected_output: "圆的特征记录表和归纳图" },
        { title: "回归生活", time: "5 分钟", art_key: "舞", teacher: "设置车轮、井盖和圆桌等生活问题，引导学生用圆心、半径、直径和“一中同长”解释生活现象，组织同伴互评。", student: "选择一个生活实例完整解释，模拟车轮滚动并说明圆心运动的轨迹，修正自己的猜想。", steps: ["选择一个生活中的圆形物品。", "用本课概念解释它为什么适合做成圆形。", "以同伴提问回应证据并修改表达。"], intention: "把数学特征迁移到真实生活，检验学生能否从知识走向解释和应用。", evidence: "学生能用至少两个数学概念支撑生活解释。" },
        { title: "总结自评", time: "2 分钟", art_key: "书", teacher: "借助结构化板书带领学生回顾圆的概念、特征和画圆方法，组织学生完成六艺自评并明确课后拓展。", student: "用一句话复述本课收获，完成自评表，说明自己在表达、操作或书写方面的表现。", steps: ["回顾圆心、半径、直径和画圆关键。", "完成六艺表现自评。", "提出一个还想继续研究的圆形问题。"], intention: "把评价权交给学生，促进元认知并形成可持续的学习改进。", evidence: "学生能够用自己的话梳理核心知识并给出有依据的自评。" }
      ]
    };
  }
  if (/小马过河/.test(title)) {
    return {
      modules: [
        ["教材分析", "《小马过河》是统编版二年级下册第五单元的一篇精读童话。故事围绕小马驮麦子过河展开，通过小马与老牛、松鼠和老马的对话，传递遇事多动脑筋、亲身尝试、不盲从他人经验的道理。文本对话丰富、角色鲜明，适合分角色朗读、识字写字、绘画和情境表演。"],
        ["六艺育人定位", `本课重点融入“${artNames}”。“说”对应分角色朗读和完整表达，“唱”对应顺口溜识字，“弹”营造沉浸式朗读氛围，“舞”表现角色神态动作，“书”落实规范书写，“画”梳理故事起因、经过和结果，六艺活动共同服务于语言运用、思维发展和品格培育。`],
        ["学情分析", "二年级学生识字量有限，抽象理解能力较弱，依赖直观画面、情境和肢体活动理解文本；他们具备基础朗读、看图说话和简单书写能力，乐于游戏、表演和绘画。教学应搭配歌谣、背景音乐、角色动作和图示支架，动静结合帮助学生理解“为什么为难”和“要亲自试一试”。"],
        ["教学目标", "1. 认识“棚、驮、磨、坊、挡、伯”等生字，会写“愿、意、麦、伯”等生字。\n2. 能正确、流利地朗读课文，分角色读出不同人物的语气。\n3. 能用词语串、流程图或四格连环画梳理故事起因、经过和结果。\n4. 初步理解遇事要动脑筋、亲自尝试，养成敢于表达、认真书写和合作学习的习惯。"],
        ["教学重难点", "重点：认识生字、规范书写，分角色朗读对话并根据提示语读出恰当语气。\n难点：理解小马面对不同意见时的“为难”，并为后续借助词语串讲述故事做好铺垫。"],
        ["教学方法与准备", "采用情境教学、分角色朗读、识字游戏、图示梳理和表现性评价。准备小马、老马、小河、磨坊和麦子口袋等板贴，课文范读音频、生字动画、生字卡片、田字格板贴、轻柔背景音乐、拼音本和故事绘画任务单。"]
      ],
      stages: [
        { title: "谈话激趣", time: "2 分钟", art_key: "说", teacher: "从“帮妈妈做事时遇到困难怎么办”谈起，出示小马图片，邀请学生完整表达并引出课题。", student: "联系生活经验发言，观察图片，猜测小马可能遇到的问题。", intention: "用生活化谈话激活表达经验，贴合低年级学生的认知特点。", evidence: "学生能围绕困难和办法说出完整句子。" },
        { title: "初读感知", time: "3 分钟", art_key: "弹", teacher: "播放轻柔背景音乐和课文范读，引导学生借助拼音朗读，标出自然段序号并整体感知故事。", student: "安静听读，自己朗读课文，标注自然段并圈画不认识的字。", intention: "用音乐帮助学生静心读文，以书写标注培养自主阅读习惯。", evidence: "学生能标出自然段并说出主要人物。" },
        { title: "认读生字", time: "7 分钟", art_key: "说", teacher: "通过跟读、组词、小老师领读和生字卡片检查读音，及时纠正难读字。", student: "跟读、开火车读、组词，在同伴互助中准确认读生字。", intention: "通过多样认读充分调动主动性，夯实字音基础。", evidence: "学生能准确认读本课重点生字。" },
        { title: "巧记汉字", time: "2 分钟", art_key: "唱", teacher: "借助顺口溜和图片讲解“驮、叹、棚”等字的字形和字义，组织学生用节奏巩固记忆。", student: "观察字形、看图理解字义，跟着节奏读顺口溜并尝试编记忆方法。", intention: "用歌谣和图像降低识字难度，形成音形义联系。", evidence: "学生能说出字形特点或用词语解释字义。" },
        { title: "识字游戏", time: "2 分钟", art_key: "唱", teacher: "组织小组认读、找朋友和词语接龙游戏，快速检查当堂识字效果。", student: "在游戏中认读生字、词语，合作完成小组任务。", intention: "用节奏与合作避免机械识字，及时查漏补缺。", evidence: "学生能在新组合中读出生字并参与合作。" },
        { title: "梳理梗概", time: "4 分钟", art_key: "画", teacher: "借助小马送麦子的流程图和句式填空，引导学生抓取人物、地点、事情和结果。", student: "按顺序摆放图卡，用词语串和简短句子讲述故事主干。", intention: "培养抓取关键信息和简洁概括故事的能力。", evidence: "学生能按起因、经过、结果梳理故事。" },
        { title: "品读对话", time: "8 分钟", art_key: "说", teacher: "引导学生圈画老牛、松鼠和小马的语言，追问不同意见来自哪里，支持学生联系语气和动作理解人物。", student: "圈画关键语句，说明人物观点和心情，尝试用不同语气朗读。", intention: "通过文本取证和问答说理理解人物情感，渗透乐于助人的品质。", evidence: "学生能用文本语句说明人物为什么这样说。" },
        { title: "分角色朗读", time: "3 分钟", art_key: "说", teacher: "示范提示语、语气和停顿，分层组织老马、小马、老牛和松鼠的角色朗读。", student: "根据提示语调整语气、速度和动作，合作完成角色朗读。", intention: "把文字理解转化为声音表达，培养语感与共情能力。", evidence: "学生能根据人物身份读出基本语气差异。" },
        { title: "深入理解", time: "6 分钟", art_key: "舞", teacher: "引导学生用神态和动作表现小马为难、松鼠焦急的状态，比较不同角色意见并回到文本寻找依据。", student: "用动作表现人物状态，交流小马为什么为难，提出自己的判断。", intention: "用具身动作理解故事冲突，借助表达发展思辨能力。", evidence: "学生能说清小马面对的两种不同经验。" },
        { title: "规范书写", time: "8 分钟", art_key: "书", teacher: "示范“愿、意、麦、伯”的笔顺、结构和占格，组织练写、展示和同伴评价。", student: "保持正确姿势练写生字，对照标准评价字形并修改。", intention: "落实低年级写字目标，培养认真、细致和自我修正的习惯。", evidence: "书写结构基本正确、笔画规范、页面整洁。" },
        { title: "回顾梳理", time: "2 分钟", art_key: "书", teacher: "借助板书带领学生回顾人物、事件和本课收获，设置“亲自试一试”的悬念。", student: "用一句话复述故事主干，分享自己还想知道的问题。", intention: "巩固知识结构并为下一课时留下学习期待。", evidence: "学生能说出故事主线和一个关键道理。" },
        { title: "巩固检测", time: "3 分钟", art_key: "说", teacher: "安排词语朗读和填空练习，检查生字、人物和故事顺序的掌握情况。", student: "完成词语朗读和填空，依据同伴反馈修正答案。", intention: "兼顾口头表达与文本识记，及时查漏补缺。", evidence: "学生能正确读词并补全故事信息。" },
        { title: "作业布置", time: "2 分钟", art_key: "画", teacher: "布置分层作业：朗读或讲故事、练写生字，并鼓励用四格画表现故事。", student: "选择适合自己的表达方式完成课后任务，准备下一课时分享。", intention: "把课堂知识转化为课后表达和创作，延伸六艺学习。", evidence: "形成朗读录音、故事讲述、规范书写或四格画中的一种成果。" }
      ]
    };
  }
  return {
    modules: [
      ["教材分析", `${context.title}以“${context.summary || "学科核心内容"}”为学习主线。设计需要让六艺活动服务于概念理解、情感体验和表达迁移，而不是成为脱离文本的附加表演。`],
      ["六艺育人定位", `本课重点融入“${artNames}”。${arts.map((item) => `${item.key}对应${item.ability}`).join("；")}，共同指向“以美润教、以艺育德”的师生实践。`],
      ["学情分析", `${context.grade}学生具备基础经验和直观感受，但从感性体验走向有依据的学科表达仍需要结构化支架。可通过图像、声音、动作与语言降低理解门槛。`],
      ["教学目标", `1. 准确理解${context.title}的核心内容并建立知识联系。\n2. 在${artNames}活动中形成表达、审美与协作能力。\n3. 能依据作品、语言或行为证据完成自评与同伴评价。`],
      ["过程与方法目标", "经历“情境感知—证据研读—艺术表达—观点交流—迁移创作”的学习过程，学会用多种表征解释学科问题。"],
      ["情感态度与价值观目标", "在真实文化材料和艺术表达中形成尊重历史、珍视文化、主动创造与合作担当的价值体验。"],
      ["教学重点与难点", `重点：围绕学科核心目标组织${artNames}活动。\n难点：保证艺术表达有知识依据，并将感性体验转化为清晰、可评价的学习成果。`],
      ["教学方法与准备", `采用情境教学、任务驱动、合作探究和表现性评价。准备文本或教材、图像资料、学习单、展示材料，以及与${artNames}相关的简易工具。`]
    ],
    stages: null
  };
}

function getConciseSixArtsModules(context, arts) {
  const title = String(context.title || "");
  const artNames = arts.map((item) => item.key).join("、") || "说、画";
  if (/圆的认识/.test(title)) {
    return [
      ["设计理念", "立足2022版数学新课标跨学科主题学习和以美育人要求，以“动手探究、说理建模、审美创想、生活迁移”为主线，将说、唱、弹、舞、书、画六艺活动精准嵌入圆的概念建构与几何实操，落实“以艺启智、以美润数、以艺育德”。\n\n“说”服务于圆心、半径、直径和画圆步骤的数学表达，“唱”用圆规口诀和节奏诵读帮助学生记住定点、定长的操作要领；“弹”落实圆规、绳子、图钉等工具的精细操作，“舞”用旋转、环绕和圆圈站位让学生感受圆的运动与对称；“书”引导学生规范书写O、r、d并工整记录探究证据，“画”把圆的结构特征转化为图示、创意图案和生活模型。\n\n六艺不是附加的表演环节，而是支持数学理解的多种表征方式。课堂按照“情境感知—操作验证—语言解释—符号记录—创意应用—评价反思”推进，让学生在看得见、说得清、做得到、画得出的学习过程中理解“一中同长”，并把数学知识转化为可观察、可交流、可评价的学习成果。"],
      ["教材分析", "本课选自人教版六年级上册第五单元，是学生系统学习曲线图形的起始课。学生此前在三年级已学习长方形、正方形等直线图形特征，五年级掌握多边形面积计算，本节课是从直线图形跨越到曲线图形学习的转折点，研究思路与方法发生质的提升，是后续圆周长、面积、圆柱圆锥学习的基础，具备承前启后的核心作用。\n\n教材编排遵循“圆的认识—圆的周长—圆的面积—扇形”由浅入深、由具象到抽象的认知规律。本课的核心任务不是只记住圆心、半径和直径的名称，而是通过多元动手操作认识这些要素，掌握规范画圆的方法，理解圆“一中同长”的本质，并为后续研究圆周长和圆面积建立稳定的概念基础。\n\n本设计紧扣2022版新课标跨学科主题学习与以美育人要求，融合校本六艺体系“说、唱、弹、舞、书、画”，秉持“以艺育德、以美润教”，将六艺活动嵌入几何探究全流程，同步发展数感、空间观念、推理意识和模型意识。"],
      ["学情分析", "小学阶段学生整体空间观念偏弱，动手操作的熟练度也存在差异。学生在生活中随处可见圆形物品，已经拥有实物拓印、观察车轮和初步画圆的直观前置经验；但规范使用圆规画圆，以及从“看起来像圆”走向解释圆的结构特征，仍需要清晰的操作支架。理解圆“一中同长”的本质特征，是本节课学习的核心生长点。\n\n六年级学生已经具备一定的观察、动手操作与简单推理能力，只要教师根据学情安排适切的任务，就能引导学生自主投入画圆方法和圆特征的探究。本课将数学说理、规范书写和几何建模等高阶任务，与歌谣吟唱、体态律动、情境配乐和创意绘画等低门槛美育活动结合，动静相济地化解曲线图形抽象难懂、空间想象薄弱的学习难点，调动学生持续参与课堂的积极性。"],
      ["核心六艺融合", "说：清晰描述圆心、半径、直径的概念，完整介绍画圆步骤，并用“一中同长”解释车轮原理。\n弹：准确操作圆规、绳子、图钉等工具，完成画圆、折圆、测量与数据记录，练习“指、握、旋”的精细动作。\n舞：用手臂旋转、环绕和空间站位表现圆的运动轨迹，站成圆圈感受半径相等和圆的对称流畅。\n书：规范书写O、r、d等字母符号，工整填写探究表格，形成结构化的数学记录。\n画：绘制大小、位置不同的圆，准确标注圆心、半径和直径，并用圆设计花瓣、车轮等创意图案。\n唱：创编并节奏诵读“圆规画圆很简单，定点定长记心间；半径决定大和小，圆心就把位置安”，辅助记忆画圆要点和核心知识。"],
      ["教学目标", "认识圆的圆心、半径、直径，掌握三者的定义、特征及数量关系（d=2r），理解圆“一中同长”的数学本质。\n熟练掌握圆规规范画圆的方法，明确“定点定长”的画圆核心要素，能独立完成标准作图。\n能运用圆的特征解释生活中的圆形应用现象，实现知识迁移与学以致用。"],
      ["教学重难点与准备", "重点：认识圆心、半径、直径的名称、特征与数量关系；掌握圆规规范画圆方法，理解画圆“定点、定长”两大核心要素。\n难点：动手操作深度体会圆“一中同长”本质；运用圆的特征解释车轮为圆形的生活原理，实现知识迁移应用。\n准备：教师准备多媒体课件、车轮动画、几何画板、圆规、绳子、图钉、不同大小的圆片、硬币和示范板书；学生准备圆形纸片、圆规、直尺、学习任务单、彩笔以及六艺评价自评表。"]
    ];
  }
  if (/小马过河/.test(title)) {
    return [
      ["设计理念", "精选“说、书、舞”三项核心六艺，对接识字写字、角色朗读、文本感悟和口语表达，构建学、练、评一体化课堂，避免六艺泛化渗透。"],
      ["教材分析", "《小马过河》是统编版二年级下册第五单元哲理童话。文本对话鲜活、情境性强，蕴含遇事动脑、亲身尝试、不盲从他人的道理，适合开展角色表达、体态体验与规范书写。"],
      ["学情分析", "二年级学生以具象思维为主，乐于表达和模仿，但深层文本感悟与持续专注仍需支架。通过口语输出、角色体态演绎和规范书写提升课堂实效。"],
      ["核心六艺融合", "说：谈话表达、生字认读、角色朗读与故事复述；舞：演绎小马开心、为难和松鼠焦急的状态；书：标注自然段、描红练写与规范书写重点生字。"],
      ["教学目标", "1. 认识本课13个生字，会写“愿、意、麦、伯”4个生字。\n2. 正确流利朗读课文，分角色读出人物语气并借助提示梳理故事。\n3. 体会小马“为难”的心理，初步感受遇事多动脑筋的道理。"],
      ["教学重难点与准备", "重点：识字写字及有语气的角色朗读。\n难点：结合情境理解小马“为难”的心理状态。\n准备：课件、生字卡片、情境板贴、田字格板书、范读音频、课本与书写用具。"]
    ];
  }
  return [
    ["教材与学情", `${context.title}围绕“${context.summary || "学科核心内容"}”展开。${context.grade}学生需要借助直观材料、任务支架和同伴交流，把已有经验转化为有依据的学科理解。`],
    ["六艺育人定位", `本课重点融入“${artNames}”，每项活动都直接服务于学科目标，并留下语言、行为或作品证据。`],
    ["教学目标", `1. 理解${context.title}的核心内容。\n2. 在${artNames}活动中形成表达、审美与协作能力。\n3. 能依据课堂证据完成自评与改进。`],
    ["重难点与准备", `重点：围绕核心目标组织${artNames}活动。\n难点：把感性体验转化为准确表达。\n准备：教材、学习单、展示材料及对应六艺工具。`]
  ];
}

function getDetailedSixArtsModules(context, arts) {
  const title = String(context.title || "");
  if (/圆的认识/.test(title)) {
    return [
      ["教材分析", "本设计紧扣 2022 版新课标跨学科主题学习、以美育人要求，融合校本六艺体系（说、唱、弹、舞、书、画），秉持 “以艺育德・以美润教”，落实 “一人一艺” 培养目标，将六艺活动嵌入几何探究全流程，同步发展数感、空间观念、推理意识、模型意识等数学核心素养。"],
      ["六艺育人定位", "圆的“一中同长”蕴含对称美与和谐美：“说”用于概念口述和数学说理；“唱”用于圆规口诀与节奏记忆；“弹”用于圆规、绳子、图钉等工具的精细操作；“舞”用于旋转和空间站位；“书”用于O、r、d及探究记录；“画”用于规范作图与创意构图。"],
      ["学情分析", "小学阶段学生整体空间观念偏弱，动手操作熟练度不足。学生在生活中随处可见圆形物品，拥有实物拓印画圆的直观前置经验，规范使用圆规画圆是本节课学习起点，而理解圆“一中同长”的本质特征，是深入学习圆相关知识的核心生长点。\n\n六年级学生已经具备一定观察、动手操作与简单推理能力，只要教师适配学情设计教学活动，就能引导学生自主投入画圆方法、圆特征的探究。结合校本六艺教学体系适配设计：六年级学生能够完成数学说理、规范书写、几何建模等高阶学习任务，同时搭配歌谣吟唱、体态律动、情境配乐等低门槛美育活动，动静结合化解曲线图形抽象难懂、空间想象薄弱的学习难点，充分调动课堂参与积极性。"],
      ["教学目标", "1. 能用圆规规范画圆，认识圆心、半径、直径并理解d=2r。\n2. 通过折叠、测量、比较和推理掌握圆的特征，理解“一中同长”。\n3. 能说明“定点、定长”是画圆的关键，并根据图形正确判断圆心、半径和直径。\n4. 能规范书写O、r、d等数学符号，工整记录测量数据、探究过程与结论。\n5. 能运用圆的特征解释车轮、井盖、圆桌等生活现象，完成从数学知识到真实情境的迁移。\n6. 在说、唱、弹、舞、书、画活动中发展数感、空间观念、推理意识、精细操作、审美创造与合作表达能力。"],
      ["教师三学会目标", "践行师德：以专业、自信和有感染力的语言传递数学文化价值。\n学会教学：准确讲授概念，整合美术、科学与信息技术，运用多种方法突破重难点。\n学会育人：有序组织学具与具身探究活动。\n学会发展：融入墨子“一中同长”，有效组织合作并依据证据反思。"],
      ["教学重难点", "重点：认识圆心、半径、直径的名称、特征与数量关系；掌握圆规规范画圆方法，理解画圆“定点、定长”两大核心要素。\n难点：动手操作深度体会圆“一中同长”本质；运用圆的特征解释车轮为圆形的生活原理，实现知识迁移应用。"],
      ["教学方法与策略", "采用自主探究、合作交流、实验探究和艺术融入：学生独立画圆、自学概念；小组折圆、测量、互评互说；通过口诀、律动与创意绘画完成多表征学习。"],
      ["教学准备", "教具：多媒体课件、车轮动画、几何画板、圆规、绳子、图钉、圆片、硬币。\n学具：每人一张圆形纸片、圆规、直尺、学习任务单、彩笔和六艺评价自评表。"]
    ];
  }
  if (/小马过河/.test(title)) {
    return [
      ["教材分析", "《小马过河》是统编版二年级下册第五单元精读童话。故事围绕小马驮麦子过河展开，通过小马与老牛、松鼠、老马的对话，传递遇事多动脑、亲身尝试、不盲从他人经验的道理，适合识字写字、角色朗读、绘画与情境表演。"],
      ["六艺育人定位", "“说”用于谈话表达、角色朗读和故事复述；“唱”用于生字童谣与节奏诵读；“弹”用于配乐营造阅读情境；“舞”用于表现人物神态动作；“书”用于段落标注和规范写字；“画”用于板贴、流程图与四格画梳理故事。"],
      ["学情分析", "二年级学生以具象思维为主，识字量和抽象理解能力有限，但乐于游戏、表演、朗读和绘画。教学以板贴、歌谣、音乐、角色动作和图示支架帮助学生理解人物观点与小马“为难”的心理。"],
      ["教学目标", "1. 认识“棚、驮、磨、坊”等13个生字，会写“愿、意、麦、伯”等重点字。\n2. 正确、流利朗读课文，分角色读出人物语气。\n3. 借助词语串、流程图或四格画梳理故事。\n4. 初步理解遇事要动脑筋、亲自尝试。"],
      ["教师三学会目标", "践行师德：教态亲切自然，以有感染力的语言激发阅读兴趣。\n学会教学：保证识字、朗读与书写指导准确，合理整合音乐、美术和表演。\n学会育人：组织有序的朗读、书写与合作活动。\n学会发展：渗透勤劳、懂事、独立思考等价值并开展课后反思。"],
      ["教学重难点", "重点：识字写字、正确流利朗读，并根据提示语分角色读出恰当语气。\n难点：理解小马面对不同意见时的“为难”，借助文本证据形成自己的判断。"],
      ["教学方法与策略", "采用情境教学、朗读指导、识字游戏、合作学习和艺术融入。通过生活谈话、配乐听读、节奏识字、角色表演、规范书写和图示梳理，让语言训练与六艺体验相互支撑。"],
      ["教学准备", "教具：小马、老马、小河、磨坊、麦袋等板贴，课文范读音频、生字动画、生字卡片、田字格板贴和轻柔背景音乐。\n学具：课本、拼音本、铅笔、橡皮、故事绘画任务单和角色头饰。"]
    ];
  }
  return getSixArtsLessonBlueprint(context, arts).modules;
}

function getCircleConciseStages() {
  const row = (step, teacher, indicator, student, arts) => ({ step, teacher, indicator, student, arts });
  return [
    {
      title: "情境激趣，设问导入", time: "5分钟", art_key: "说",
      teacher: "播放兵马俑古车轮复原动画，结合历史素材创设问题情境，提出“为什么车轮必须是圆形”的问题。",
      student: "观看视频，联系生活经验大胆猜想，明确本课学习任务。",
      penetration: "说：大胆表达猜想；舞：用手臂模拟车轮旋转轨迹。",
      intention: "以趣味历史情境激趣，打破几何课堂的枯燥感，通过设问引发认知冲突，借助肢体律动和自由发言让学生带着问题进入探究。",
      evidence: "学生能结合生活经验说出车轮形状的初步猜想，并表达自己的理由。",
      teacher_indicator: "职业认同；专业信念",
      rows: [
        row("情境创设", "播放兵马俑古车轮复原动画，结合历史素材创设问题情境，唤醒学生生活圆形认知。", "职业认同；专业信念", "认真观看动画，结合生活经验回忆圆形特点，进入课堂情境。", "无"),
        row("核心设问", "抛出核心问题“为什么车轮必须是圆形？正方形、三角形车轮可行吗？”，引导学生大胆猜想、耐心倾听，鼓励自由发言。", "职业认同；专业信念", "积极思考，大胆表达个人猜想与观点，主动参与课堂问答。", "说（大胆表达猜想与观点）"),
        row("肢体感知", "引导学生舒展手臂模拟车轮旋转轨迹，指导学生用肢体直观感受圆的流畅曲线运动特征。", "职业认同；专业信念", "跟随教师指令舒展手臂、模拟旋转动作，体感感知圆的曲线特征。", "舞（肢体模拟旋转轨迹，感知圆的运动特征）"),
        row("揭示课题", "板书课题《圆的认识》，清晰点明本节课探究目标与学习重点。", "职业认同；专业信念", "倾听课堂目标，明确本节课学习任务。", "无")
      ]
    },
    {
      title: "实操探究，建构新知", time: "25分钟", art_key: "弹",
      teacher: "组织对比辨析、多元作图、自学概念、折量验证和巩固作图，示范“定点、定长”，引导学生用数据归纳圆的特征。",
      student: "经历图形对比、工具作图、概念辨析、折叠测量、规范标注和创意设计，形成可交流的探究证据。",
      penetration: "说：概念辨析与规律归纳；弹：工具操作与测量；舞：站圆体验；画：作图与创意设计。",
      intention: "通过新旧知识对比、自主操作、合作交流和数据验证，让学生亲历从操作、记录到推理建模的知识生成过程。",
      evidence: "规范圆形作品、概念检测结果、测量记录表和“一中同长”口头解释。",
      teacher_indicator: "专业学科；主教学科；发展指导；活动育人；合作技能；课程整合；艺术素养",
      rows: [
        row("旧知回顾", "引导学生回忆长方形、正方形、三角形等直线图形，启发学生口述图形特征。", "专业学科；主教学科", "主动回忆旧知，精准口述各类直线图形的核心特征。", "说（精准口述旧知图形特征）"),
        row("对比观察", "出示直线图形与圆形对比教具、课件，引导学生观察形态、构图差异。", "专业学科；主教学科", "认真观察对比，感知直线图形与曲线图形的视觉差异。", "画（感知图形构图差异与曲线美）"),
        row("思辨总结", "鼓励学生自主表达两类图形区别，教师规范总结定义，明确圆的曲线图形属性。", "专业学科；主教学科", "主动辨析差异，大胆表达观点，倾听规范数学定义。", "说（辨析图形差异，规范表达观点）"),
        row("自主作图", "布置自主作图任务，让学生选取硬币、绳子、圆规等工具自由画圆，巡视观察学生实操情况。", "主教学科；班级常规", "自主选取工具尝试画圆，动手实操，积累作图经验。", "弹（手指精细化操作工具）；画（自主绘制圆形）"),
        row("展示对比", "邀请学生上台展示画法，引导学生口述操作流程，组织全班对比辨析画法优劣。", "主教学科；合作技能", "上台展示画法，清晰口述作图步骤，参与全班对比辨析。", "说（口述作图步骤与方法优势）；弹；画"),
        row("示范讲解", "规范演示圆规操作流程，重点讲解“针尖定点、笔尖定长、旋转一周”要点，针对性纠错指导。", "主教学科；班级常规", "认真观察示范，同步模仿动作，修正自身不规范作图手法。", "弹、画（对标规范修正作图动作）"),
        row("自主自学", "布置自学任务，指导学生阅读课本、勾画重点概念，巡视学生自学状态。", "主教学科", "自主阅读文本，勾画圆心、半径、直径定义重点，标注关键术语。", "画（勾画重点、标注核心术语）"),
        row("概念检测", "出示辨析习题，组织同桌互助核对、口述概念，巡查小组交流情况。", "主教学科；合作技能", "完成习题辨析，同桌之间相互口述概念、核对答案、互助纠错。", "说（同桌互述概念、辨析定义）；画"),
        row("规范认知", "结合学生反馈精准梳理概念，强调“圆心、圆上、两端过圆心”等限定条件，规范数学表述。", "主教学科；合作技能", "认真倾听规范表述，修正自身认知与口语表达误区。", "说（倾听规范表述、修正自身表达）"),
        row("折纸探究", "指导学生多次对折圆形纸片，引导观察折痕交汇与分布特点。", "活动育人；发展指导", "动手反复对折圆片，观察折痕规律，初步感知圆心、半径特征。", "弹（精细化折纸操作）"),
        row("测量验证", "引导学生用直尺测量半径、直径，指导记录数据、对比规律。", "活动育人；发展指导", "精准测量、认真记录数据，对比分析半径、直径长度规律。", "弹（精准测量、数据记录）"),
        row("归纳总结", "启发学生结合数据自主归纳规律，引导推导直径与半径数量关系。", "活动育人；发展指导", "结合实验数据归纳结论，口头表述圆的特征，推导 d、r 关系。", "说（归纳规律、梳理结论）"),
        row("文化渗透", "引入墨子“圆，一中同长也”古文，结合实操解读圆的数学本质，渗透数学文化。", "文明底蕴；活动育人", "跟读理解古文含义，结合实操经验解读圆的本质特征。", "说（解读古文内涵、对接数学知识）"),
        row("体感体验", "组织学生手拉手站成圆圈，引导学生体感“一中同长”的核心特征。", "发展指导；活动育人", "有序站位成圆，肢体体验圆心居中、四周等距的圆的特点。", "舞（肢体站位、体感感知）"),
        row("精准作图", "布置规范作图任务，要求学生画指定半径的圆并规范标注，巡视纠错。", "主教学科；课程整合", "使用圆规规范画圆，工整标注圆心、半径、直径。", "弹（精准控规）；画（规范作图标注）"),
        row("创意延伸", "启发学生结合圆形对称美自主设计创意图案，鼓励审美创作。", "课程整合；艺术素养", "发挥创意，结合圆的特征设计简易圆形美育图案。", "画（创意设计、审美创作）"),
        row("原理升华", "引导学生集体梳理各类画圆方法的共性，总结“定点、定长”核心原理。", "主教学科；艺术素养", "跟随引导梳理思路，口头总结画圆核心原理。", "说（梳理总结核心原理）")
      ]
    },
    {
      title: "学以致用，拓展延伸", time: "5分钟", art_key: "说",
      teacher: "引导学生运用“一中同长”解释车轮、井盖等生活现象，演示不同形状车轮的运动轨迹。",
      student: "用完整数学语言解释生活原理，观察动态演示并列举新的圆形应用。",
      penetration: "说：逻辑化解释生活原理；舞：用手势模拟车轮运动轨迹。",
      intention: "实现知识从课堂到生活的迁移，培养学生用数学眼光观察世界、用数学思维解释现象的能力。",
      evidence: "学生能用圆心、半径或“一中同长”支撑车轮等生活现象的解释。",
      teacher_indicator: "支持学科；专业信念",
      rows: [
        row("原理应用", "引导学生运用“一中同长”原理，有条理解释“车轮为什么是圆形”，指导规范数学说理。", "支持学科；专业信念", "结合所学原理，完整、条理地口头解释生活现象。", "说（逻辑化数学说理、解释生活原理）"),
        row("直观演示", "运用几何画板演示不同形状车轮运动轨迹，引导学生手势模拟运动状态。", "支持学科；专业信念", "观察动态演示，用手势模拟车轮运动轨迹，体感平稳差异。", "舞（手势模拟车轮运动轨迹）"),
        row("生活拓展", "引导学生列举生活中的圆形应用实例，带领学生分析背后数学原理。", "支持学科；专业信念", "主动分享生活实例，尝试分析圆的应用原理。", "说（分享生活实例、辨析应用原理）")
      ]
    },
    {
      title: "课堂总结，自评提升", time: "5分钟", art_key: "画",
      teacher: "串联本节课核心知识点，组织学生完成六艺自评，邀请学生分享收获并布置分层作业。",
      student: "复述核心知识，完成六艺星级自评，分享收获，记录课后练习、思维导图或创意设计任务。",
      penetration: "说：复述与分享；画：思维导图和创意设计；四维六艺综合自评。",
      intention: "系统梳理课堂知识，通过学生自评实现自我反思与自主成长，分层作业兼顾知识巩固与美育拓展。",
      evidence: "六艺自评表、课堂收获表达和分层作业选择。",
      teacher_indicator: "主教学科；课程整合；合作意愿",
      rows: [
        row("知识梳理", "串联本节课核心知识点，梳理圆的特征、作图方法、数量关系，搭建知识框架。", "主教学科；合作意愿", "跟随教师思路回顾知识，主动参与课堂梳理、复述要点。", "说（参与梳理、复述核心知识）"),
        row("素养自评", "引导学生对照六艺评价标准，从说、弹、舞、画四维开展课堂自评。", "合作意愿；主教学科", "客观复盘课堂表现，完成六艺素养星级自评。", "说、弹、舞、画综合渗透"),
        row("收获分享", "随机点名邀请学生分享课堂收获，进行针对性点评并鼓励表达。", "合作意愿；主教学科", "主动分享知识收获、实操感悟与素养成长。", "说（总结分享、表达感悟）"),
        row("分层作业", "布置基础习题、思维导图、圆形创意设计等分层作业，明确课后巩固方向。", "主教学科；课程整合", "清晰记录作业要求，明确课后练习与创作任务。", "画（思维导图、创意设计）")
      ]
    }
  ];
}

function getCircleDetailedStages() {
  const row = (step, teacher, student, arts, indicator) => ({ step, teacher, student, arts, indicator });
  return [
    {
      title: "巧设疑问，激发兴趣", time: "约5分钟", art_key: "说",
      teacher: "播放兵马俑车轮复原动画，结合历史素材创设问题情境，提出“为什么车轮一定是圆形”的问题。",
      student: "观看视频，进入情境，自由发言并大胆猜测。",
      penetration: "说：鼓励学生大胆表达自己的猜测；舞：用手臂模仿车轮旋转的动作。",
      intention: "立足生活与数学文化创设情境，借助历史文物趣味视频激趣，将生活问题引入课堂；通过肢体动作激活舞的感知，通过层层设问引导学生大胆猜想、完整表达观点，为后续理解“一中同长”埋下伏笔。",
      evidence: "学生能结合生活经验表达车轮形状猜想，并说明自己的初步依据。",
      teacher_indicator: "职业认同；专业信念",
      rows: [
        row("1.播放视频", "播放兵马俑车轮复原动画，引出问题。", "观看视频，进入情境。", "无", "职业认同；专业信念"),
        row("2.设疑", "提出“为什么车轮一定是圆形的？其他形状行不行？”，鼓励学生大胆表达。", "自由发言，大胆猜测。", "说（大胆表达猜测）", "职业认同；专业信念"),
        row("3.揭示课题", "板书《圆的认识》，清晰点明本节课探究目标与学习重点。", "倾听课堂目标，明确学习内容。", "舞（手臂模拟旋转）", "职业认同；专业信念")
      ]
    },
    {
      title: "动手操作，自主探究", time: "约25分钟", art_key: "弹",
      teacher: "组织圆与其他图形的对比、多元画圆、自学概念、画不同大小和位置的圆、折叠测量发现特征，以及多元画圆深化原理。",
      student: "经历回顾、作图、展示、自学、辨析、折叠、测量、记录、创编和归纳，逐步理解圆心、半径、直径与“一中同长”。",
      penetration: "说、唱、弹、舞、书、画：用口述、口诀、工具操作、体感、符号记录和图示创作支持概念建构。",
      intention: "依托六艺的多通道活动，把学生从“看起来像圆”推进到“能够画圆、辨析概念、用数据解释圆的特征”，让数学知识、操作证据与美育体验相互支撑。",
      evidence: "多种画圆作品、概念检测结果、折叠测量记录、d=2r 数据归纳、规范标注和创意图案。",
      teacher_indicator: "专业学科；主教学科；发展指导；活动育人；合作技能；课程整合；艺术素养",
      rows: [
        row("（一）对比导入·1.回顾旧知", "提问认识圆之前学过哪些平面图形，出示长方形、正方形和三角形图片。", "回顾并说出已学过的平面图形名称。", "说（准确表达图形名称）", "主教学科"),
        row("（一）对比导入·2.总结直线图形特征", "出示直线图形与圆形图片，播放轻柔纯音乐，营造思考氛围。", "观察图片，初步感知圆与其他图形的不同。", "画（感受直线与曲线的视觉差异）", "专业学科"),
        row("（一）对比导入·3.对比说理", "追问圆和以前学过的图形有什么不同，肯定学生的多样表达。", "口述直线图形与圆的区别。", "说（用自己的语言描述区别）", "职业认同"),
        row("（一）对比导入·4.总结圆的定义", "归纳直线图形与圆的定义并完成板书。", "理解并识记圆的定义，在任务单上记录。", "书（规范记录定义）", "主教学科"),
        row("（二）用喜欢的方法画圆·1.布置任务", "要求学生选择身边的工具画一个圆。", "选择硬币、杯子、绳子或圆规画圆。", "画（画出自己的第一个圆）", "主教学科"),
        row("（二）用喜欢的方法画圆·2.展示交流", "请不同方法的学生上台演示并介绍画法。", "展示作品，介绍自己的画法。", "说（介绍作图方法）", "合作技能"),
        row("（二）用喜欢的方法画圆·3.引导对比", "追问为什么用圆规画的圆最标准，引导学生观察方法差异。", "观察对比，发现圆规画圆的优势。", "说、画（比较作品）", "主教学科"),
        row("（二）用喜欢的方法画圆·4.讲解圆规用法", "讲解固定一点、旋转一周，强调针尖固定是定点、笔尖旋转形成定长轨迹。", "模仿操作，初步体验规范画圆。", "弹（手眼协调操作）；画（规范作图）", "主教学科；班级常规"),
        row("（三）自学概念·1.布置自学", "要求自学课本关于圆心、半径、直径的定义。", "阅读课本，勾画重点。", "书（规范书写 O、r、d）", "主教学科"),
        row("（三）自学概念·2.完成检测", "分发概念检测题，组织学生判断线段身份。", "判断哪些线段是半径或直径。", "说（同桌互述概念）", "主教学科"),
        row("（三）自学概念·3.组织交流", "请学生说明判断理由，针对错误进行辨析。", "同桌互述概念，全班交流。", "说、书（概念辨析与记录）", "合作技能"),
        row("（四）画两个不同的圆·1.布置任务", "出示自行车学习单，请学生给车架画上大小、位置不同的车轮。", "独立完成画圆任务。", "画（控制定点与定长）", "主教学科"),
        row("（四）画两个不同的圆·2.展示作品", "选取典型作品投影展示，引导学生观察。", "观察不同作品的差异。", "说（解释作品差异）", "职业认同"),
        row("（四）画两个不同的圆·3.引导发现", "追问两个圆有什么不同，引出圆心决定位置、半径决定大小。", "发现位置不同、大小不同。", "说、画（依据图形说理）", "支持学科"),
        row("（四）画两个不同的圆·4.总结概念", "总结直径定义，辨析“圆上”“圆心”等限定条件。", "理解圆心和半径的作用，标注 O、r、d。", "书（符号标注）", "主教学科"),
        row("（五）折一折、量一量·1.布置任务", "要求将圆形纸片对折多次，观察折痕交汇与分布特点。", "折圆片，观察折痕交于一点。", "弹（精细化折纸）", "活动育人"),
        row("（五）折一折、量一量·2.引导测量", "指导测量多条半径和直径并填写表格。", "测量并填写表格。", "弹、书（测量与规范记录）", "发展指导"),
        row("（五）折一折、量一量·3.组织归纳", "追问“你有什么发现”，引导归纳 r 相等、d 相等、d=2r。", "归纳圆的特征和数量关系。", "说（用数学术语表达）", "主教学科"),
        row("（五）折一折、量一量·4.文化渗透", "介绍墨子“圆，一中同长也”，结合实操解读数学本质。", "齐读并理解“一中同长”。", "唱、说（节奏诵读与解释）", "文明底蕴"),
        row("（五）折一折、量一量·5.身体体验", "组织学生站成圆圈手拉手，体感半径相等。", "感受半径等长，体会“一中同长”。", "舞（站圆体感）", "发展指导；活动育人"),
        row("（六）多元画圆·1.挑战任务", "要求用硬币、绳子加图钉、圆规等不同工具画圆。", "分组尝试不同画圆方法。", "弹、画（工具与创作）", "课程整合"),
        row("（六）多元画圆·2.画指定圆", "要求用圆规画半径4cm的圆并标出 O、r、d。", "独立完成规范作图。", "书、画（标注与表达）", "主教学科"),
        row("（六）多元画圆·3.引导创编", "引导学生创编圆规口诀。", "齐读口诀，感受节奏韵律。", "唱（口诀创编与诵读）", "艺术素养"),
        row("（六）多元画圆·4.总结原理", "追问不同画圆方法的共同点，引导抽象出定点、定长。", "发现各种方法都需要定点和定长。", "说（归纳共同原理）", "主教学科")
      ]
    },
    {
      title: "回归生活，应用拓展", time: "约5分钟", art_key: "说",
      teacher: "引导学生用“一中同长”解释车轮为什么是圆形，用几何画板演示不同形状车轮的运动轨迹，并拓展生活应用。",
      student: "完整解释车轮原理，观察演示，列举井盖、风扇、瓶盖等生活实例。",
      penetration: "说：完整解释生活原理；舞：模拟车轮滚动和圆心轨迹。",
      intention: "把课堂中的图形特征与真实生活建立联系，实现知识从概念理解到应用解释的迁移。",
      evidence: "生活实例清单、完整数学解释和不同运动轨迹的观察记录。",
      teacher_indicator: "学科育人；支持学科；专业信念",
      rows: [
        row("1.解释车轮", "要求学生用“一中同长”解释车轮为什么是圆形。", "完整解释车轮原理。", "说（逻辑化数学说理）", "学科育人"),
        row("2.几何演示", "用几何画板演示不同形状车轮的运动轨迹。", "观察并思考不同轨迹的平稳差异。", "舞（手势模拟运动轨迹）", "支持学科"),
        row("3.生活拓展", "追问生活中还有哪些现象使用了“一中同长”。", "列举井盖、风扇、瓶盖等实例。", "说（分享生活实例）", "专业信念")
      ]
    },
    {
      title: "总结回顾，六艺自评", time: "约4分钟", art_key: "书",
      teacher: "梳理圆的特征、作图方法和数量关系，发放六艺自评表，组织分享并布置分层作业。",
      student: "共同总结知识点，对照六项素养打星自评，分享收获并记录课后任务。",
      penetration: "书：完成自评表；说：分享收获与自评理由；画：完成创意作业。",
      intention: "结合结构化板书和六艺自评引导学生回顾新知，通过分层作业兼顾基础巩固、思维整理和美育拓展，形成课后改进闭环。",
      evidence: "六艺自评表、课堂收获分享、分层作业记录与圆形创意作品计划。",
      teacher_indicator: "教育科研；合作意愿；主教学科",
      rows: [
        row("1.知识梳理", "追问“今天我们学习了什么”，师生共同总结知识点。", "师生共同总结知识点。", "书（结构化记录）", "主教学科"),
        row("2.六艺自评", "发放六艺自评表，引导学生对照六项素养进行自评。", "对照六项素养打星自评。", "书（完成自评表）", "教育科研"),
        row("3.分享交流与分层作业", "邀请学生分享收获与自评理由，布置基础、巩固和跨学科实践作业。", "分享收获并记录课后任务。", "说（分享理由）；画（创意作业）", "合作意愿；主教学科")
      ]
    }
  ];
}

function getDefaultSixArtsModules(context, arts) {
  return assistantState.sixarts.detailLevel === "concise"
    ? getConciseSixArtsModules(context, arts)
    : getDetailedSixArtsModules(context, arts);
}

function getSixArtsStructuredDesign() {
  const sections = Array.isArray(assistantState.sixarts.designSections)
    ? assistantState.sixarts.designSections
    : [];
  const blocks = sections.flatMap((section) => Array.isArray(section?.blocks) && section.blocks.length
    ? section.blocks
    : [section]);
  const findBlock = (...names) => blocks.find((block) => names.includes(String(block?.key || block?.title || "").replace(/[（(].*?[）)]/g, "").trim()));
  const rowValue = (row, columns, aliases, fallbackIndex = 0) => {
    if (Array.isArray(row)) return String(row[fallbackIndex] ?? "").trim();
    for (const key of aliases) {
      if (row?.[key] !== undefined && row[key] !== null) return String(row[key]).trim();
    }
    const column = columns[fallbackIndex];
    return column && row?.[column] !== undefined ? String(row[column]).trim() : "";
  };
  const tableRows = (block, mapper) => {
    const columns = Array.isArray(block?.columns) ? block.columns.map(String) : [];
    return (Array.isArray(block?.rows) ? block.rows : []).map((row) => mapper(row, columns)).filter(Boolean);
  };
  const splitItems = (value) => String(value || "")
    .split(/\r?\n+/)
    .map((item) => item.replace(/^\s*(?:\d+[.、)]|[（(][一二三四五六七八九十0-9]+[）)])\s*/, "").trim())
    .filter(Boolean);
  const textbook = findBlock("教材分析");
  const student = findBlock("学情分析");
  const fusion = findBlock("核心六艺融合点");
  const subjectGoals = findBlock("学科知识与技能", "学科知识与技能指向学生");
  const competencies = findBlock("六艺素养目标", "六艺素养目标指向学生");
  const values = findBlock("情感态度价值观", "情感态度价值观指向学生");
  const teacherGoals = findBlock("教师教学目标", "教师教学目标指向“践行三学会”毕业要求");
  const difficulty = findBlock("教学重点与难点", "教学重难点");
  const methods = findBlock("教学方法与六艺活动策略");
  const prep = findBlock("教学准备");
  const difficultyText = String(difficulty?.content || "").trim();
  const keyMatch = difficultyText.match(/(?:^|\n)\s*重点[：:]\s*([\s\S]*?)(?=\n\s*难点[：:]|$)/);
  const difficultMatch = difficultyText.match(/(?:^|\n)\s*难点[：:]\s*([\s\S]*)$/);
  return {
    textbook: String(textbook?.content || "").trim(),
    student: String(student?.content || "").trim(),
    fusion: tableRows(fusion, (row, columns) => {
      const key = rowValue(row, columns, ["六艺维度", "dimension", "key"], 0);
      const content = rowValue(row, columns, ["本课融合点", "课堂精准融合落点", "fusion_point", "text"], 1);
      return key && content ? [key, content] : null;
    }),
    subjectGoals: splitItems(subjectGoals?.content),
    competencies: tableRows(competencies, (row, columns) => {
      const key = rowValue(row, columns, ["六艺维度", "key", "dimension"], 0);
      const text = rowValue(row, columns, ["具体表现", "text", "content"], 1);
      return key && text ? { key, text } : null;
    }),
    values: splitItems(values?.content).map((content, index) => [index === 0 ? "育人目标" : `目标${index + 1}`, content]),
    teacherRows: tableRows(teacherGoals, (row, columns) => [
      rowValue(row, columns, ["一级指标", "level_one"], 0),
      rowValue(row, columns, ["二级指标", "level_two"], 1),
      rowValue(row, columns, ["三级指标", "level_three", "key"], 2),
      rowValue(row, columns, ["本课达成目标", "target", "observable"], 3)
    ]),
    methods: tableRows(methods, (row, columns) => [
      rowValue(row, columns, ["教学方法", "method"], 0),
      rowValue(row, columns, ["六艺侧重（学生）", "六艺侧重", "arts"], 1),
      rowValue(row, columns, ["对应教师三学会指标", "teacher_indicator", "indicator"], 2)
    ]),
    key: keyMatch?.[1]?.trim() || "",
    difficult: difficultMatch?.[1]?.trim() || "",
    prep: String(prep?.content || "").trim()
  };
}

function getSixArtsDesignDocument(context, selectedArts) {
  const title = String(context.title || "");
  const concise = assistantState.sixarts.detailLevel === "concise";
  const isCircle = /圆的认识/.test(title);
  const isHorse = /小马过河/.test(title);
  const defaults = getDefaultSixArtsModules(context, selectedArts);
  const legacy = assistantState.sixarts.designDraft || [];
  const modules = new Map(defaults.map(([key, value]) => [key, value]));
  legacy.forEach((item) => {
    const content = String(item?.content || "").trim();
    const baseline = String(modules.get(item?.title) || "").trim();
    const isCircleCore = /圆的认识/.test(title) && ["设计理念", "教材分析", "学情分析", "教学目标", "教学重难点", "教学重难点与准备"].includes(item?.title);
    const isStaleCircleCopy = isCircleCore && baseline.length > 0 && content.length < baseline.length * .72;
    const isIncompleteCircleConcept = isCircleCore && item?.title === "设计理念" && ["说", "唱", "弹", "舞", "书", "画"].some((art) => !content.includes(art));
    const isCircleSourceField = isCircleCore && ["教材分析", "学情分析", "教学目标", "教学重难点"].includes(item?.title);
    if (item?.title && content && !isCircleSourceField && !isStaleCircleCopy && !isIncompleteCircleConcept) modules.set(item.title, item.content);
  });
  const module = (...keys) => keys.map((key) => modules.get(key)).find(Boolean) || "";
  const labelPart = (text, label, nextLabels = []) => {
    const stop = nextLabels.length ? `(?=${nextLabels.map((item) => `${item}：`).join("|")}|$)` : "$";
    return String(text || "").match(new RegExp(`${label}：([\\s\\S]*?)${stop}`))?.[1]?.trim() || "";
  };
  const combined = module("教学重难点与准备", "重难点与准备", "教学重难点");
  const effectiveArts = concise
    ? (isHorse ? ["说", "舞", "书"] : isCircle ? ["说", "弹", "舞", "画"] : selectedArts.map((item) => item.key))
    : sixArtsDimensions.map((item) => item.key);
  const artObjects = effectiveArts.map((key) => sixArtsDimensions.find((item) => item.key === key)).filter(Boolean);
  const circleFusion = {
    说: "口述圆心、半径、直径概念与画圆步骤，用“一中同长”解释生活中的圆，开展数学说理。",
    唱: "创编并节奏诵读圆规口诀，以韵律辅助记忆画圆要点与圆的关键知识。",
    弹: "精准操作圆规、绳子、图钉等工具，完成画圆、折圆、测量与数据记录。",
    舞: "用手臂旋转与空间站位表现圆的运动轨迹，以具身体验感知“一中同长”。",
    书: "规范书写 O、r、d，工整填写探究表格，准确记录发现与结论。",
    画: "绘制并标注大小、位置不同的圆，运用圆的特征设计创意图案。"
  };
  const horseFusion = {
    说: "课堂谈话、生字组词、角色朗读、故事复述与观点表达，落实语言运用和思辨表达。",
    唱: "跟读生字童谣、节奏诵读重点句、小组接龙吟唱，感受语言节奏韵律。",
    弹: "在轻柔背景音乐中专注听读与朗读，营造沉浸式共情情境。",
    舞: "用动作演绎小马开心、为难、犹豫和松鼠焦急等角色状态，深化文本理解。",
    书: "规范标注自然段、生字描红练写、工整书写词句，培养认真严谨的书写习惯。",
    画: "运用故事思维导图、四格连环画和角色形象配图梳理起因、经过与结果。"
  };
  const genericFusion = Object.fromEntries(sixArtsDimensions.map((item) => [item.key, `${item.activity}，形成${item.evidence}等可观察的学习证据。`]));
  const fusionSource = isCircle ? circleFusion : isHorse ? horseFusion : genericFusion;
  const conciseCircleSubjectGoals = [
    "认识圆的圆心、半径、直径，掌握三者的定义、特征及数量关系（d=2r），理解圆“一中同长”的数学本质。",
    "熟练掌握圆规规范画圆的方法，明确“定点定长”的画圆核心要素，能独立完成标准作图。",
    "能运用圆的特征解释生活中的圆形应用现象，实现知识迁移与学以致用。"
  ];
  const detailedCircleSubjectGoals = [
    "学生能用圆规规范画圆，认识圆心、半径、直径，理解其概念及关系（d=2r）。",
    "通过操作、测量、推理，掌握圆的特征，理解“一中同长”的数学内涵。"
  ];
  const subjectGoals = isCircle
    ? (concise ? conciseCircleSubjectGoals : detailedCircleSubjectGoals)
    : module("教学目标").split(/\n+/).map((item) => item.replace(/^\d+[.、]\s*/, "").trim()).filter(Boolean);
  // The concise view still needs a complete six-arts map. Focused dimensions
  // are highlighted in the UI while the other dimensions remain available as
  // optional classroom extensions instead of disappearing from the plan.
  const competencies = getSixArtsCompetencyGoals(context);
  const teacherRows = isCircle ? [
    ["践行师德", "师德规范", "1.2 职业认同", "展现数学教师的专业自信与教学热情，用语得体、教态大方。"],
    ["践行师德", "教育情怀", "2.2 专业信念", "传递数学文化价值，激发学生对数学之美的感受。"],
    ["学会教学", "学科素养", "3.1 专业学科", "准确讲授圆的各部分名称、特征及“一中同长”的本质。"],
    ["学会教学", "学科素养", "3.2 支持学科", "整合美术、科学等学科知识辅助圆的教学。"],
    ["学会教学", "教学能力", "4.1 主教学科", "运用多种教学方法突破重难点，教学语言精准。"],
    ["学会教学", "课程整合", "5.1 课程整合", "设计画图案、联系生活等跨学科任务。"],
    ["学会教学", "艺术素养", "10.1 艺术素养", "将口诀、律动、绘画等艺术形式融入数学教学。"],
    ["学会育人", "班级指导", "6.1 班级常规", "有序组织学具取放，培养学生良好课堂习惯。"],
    ["学会育人", "班级指导", "6.2 发展指导", "设计具身活动促进学生认知与身心协调发展。"],
    ["学会育人", "综合育人", "7.2 活动育人", "通过操作活动让学生在体验中建构知识。"],
    ["学会发展", "学会反思", "8.1 文明底蕴", "融入墨子“一中同长”等中华数学文化。"],
    ["学会发展", "沟通合作", "9.2 合作技能", "有效组织小组合作学习并适时引导。"]
  ] : [
    ["践行师德", "师德规范", "1.2 职业认同", "展现语文教师的语言魅力与专业自信，教态亲切自然。"],
    ["践行师德", "教育情怀", "2.2 专业信念", "传递童话文学价值，激发学生对阅读和表达的热爱。"],
    ["学会教学", "学科素养", "3.1 专业学科", "准确讲授识字方法和朗读技巧，无知识性错误。"],
    ["学会教学", "教学能力", "4.1 主教学科", "教学目标明确，识字、朗读、书写环节设计科学合理。"],
    ["学会教学", "艺术素养", "10.1 艺术素养", "将配乐、童谣、肢体律动自然融入语文教学。"],
    ["学会育人", "班级指导", "6.1 班级常规", "有序组织课堂活动，培养学生良好学习习惯。"],
    ["学会育人", "班级指导", "6.2 发展指导", "通过肢体律动促进学生身心协调发展。"],
    ["学会育人", "综合育人", "7.2 活动育人", "通过角色扮演和游戏让学生在体验中学习。"],
    ["学会发展", "学会反思", "8.1 文明底蕴", "渗透勤劳、懂事、独立思考等中华传统美德。"],
    ["学会发展", "沟通合作", "9.2 合作技能", "有效组织同桌合作与小组合作学习。"]
  ];
  const methods = isCircle
    ? [["自主探究法", "画、书", "4.1 主教学科"], ["合作交流法", "说、弹", "9.2 合作技能"], ["实验探究法", "弹、舞", "6.2 发展指导；7.2 活动育人"], ["艺术融入法", "唱、舞", "10.1 艺术素养"]]
    : [["情境教学法", "说、画", "4.1 主教学科"], ["朗读指导法", "说、弹", "3.1 专业学科；10.1 艺术素养"], ["随文识字法", "唱、说", "4.1 主教学科"], ["示范书写法", "书", "4.1 主教学科"], ["体态律动法", "舞", "6.2 发展指导；7.2 活动育人"]];
  const teacherBrief = isCircle ? [
    ["践行师德", "师德规范 / 教育情怀", "1.2 职业认同；2.2 专业信念", "教态大方、用语专业，传递数学美育价值，激发学生探究兴趣。"],
    ["学会教学", "学科素养 / 教学能力", "3.1 专业学科；3.2 支持学科；4.1 主教学科；5.1 课程整合；10.1 艺术素养", "精准讲授学科知识，整合美术、科学与信息技术，用六艺活动突破重难点。"],
    ["学会育人", "班级指导 / 综合育人", "6.1 班级常规；6.2 发展指导；7.2 活动育人", "规范课堂实操秩序，通过具身与探究活动促进学生认知和身心协调发展。"],
    ["学会发展", "学会反思 / 沟通合作", "8.1 文明底蕴；9.2 合作技能", "融入中华数学文化，有效组织小组合作探究并依据学习证据反思。"]
  ] : teacherRows;
  const structured = getSixArtsStructuredDesign();
  return {
    concise, isCircle, isHorse, artObjects,
    concept: module("设计理念") || (isCircle ? "立足2022版数学新课标跨学科育人要求，以动手探究、说理建模、审美创想为主线，将六艺活动精准嵌入圆的概念建构与几何实操。" : "以校本新六艺核心素养为依托，精选重点维度融合课堂，构建学、练、评一体化闭环课堂。"),
    distinction: isCircle ? "六艺素养聚焦学生表达、操作、体感与创作表现；三学会指标评价教师课堂教学行为。两类评价独立对标、互不混淆。" : "六艺素养聚焦学生说、书、舞等课堂表现；三学会指标评价教师课堂教学行为。两类评价独立对标、互不混淆。",
    textbook: structured.textbook || module("教材分析", "教材与学情"),
    student: structured.student || module("学情分析", "教材与学情"),
    fusion: structured.fusion.length ? structured.fusion : sixArtsDimensions.map((item) => [item.key, fusionSource[item.key]]),
    subjectGoals: structured.subjectGoals.length ? structured.subjectGoals : subjectGoals,
    competencies: structured.competencies.length ? structured.competencies : competencies,
    teacherRows: structured.teacherRows.length ? structured.teacherRows : teacherRows,
    methods: structured.methods.length ? structured.methods : methods,
    values: structured.values.length ? structured.values : (isCircle ? [["美育", "感知圆的对称、均衡与和谐，体会数学形式之美。"], ["德育", "在合作探究与耐心操作中形成认真、负责的学习品质。"], ["素养", "发展空间观念、推理意识、模型意识与创意实践能力。"]] : [["美育", "借助朗读、绘画、律动和歌谣感受童话美感。"], ["德育", "体会小马主动做事的品质，初步感知遇事多动脑筋的道理。"], ["素养", "养成认真书写、敢于表达、乐于合作的习惯。"]]),
    teacherBrief: structured.teacherRows.length ? structured.teacherRows : teacherBrief,
    key: structured.key || labelPart(combined, "重点", ["难点", "准备"]) || combined,
    difficult: structured.difficult || labelPart(combined, "难点", ["准备"]) || (isCircle ? "通过实操体悟“一中同长”，并运用圆的特征解释生活现象。" : "结合文本情境，理解小马“为难”的心理状态。"),
    prep: structured.prep || labelPart(combined, "准备") || module("教学准备", "教学方法与准备")
  };
}

function getSixArtsDesignField(key, fallback, aliases = []) {
  const direct = assistantState.sixarts.designFieldDraft?.[key];
  const title = String(assistantState.sixarts.form?.title || "");
  const circleCoreField = /圆的认识/.test(title) && (["concept", "textbook", "student", "key", "difficult"].includes(key) || /^(subject|teacher-brief)-\d+$/.test(key));
  const circleSourceField = circleCoreField && (["textbook", "student", "key", "difficult"].includes(key) || /^subject-\d+$/.test(key));
  const directText = String(direct || "").trim();
  const incompleteConcept = circleCoreField && key === "concept" && ["说", "唱", "弹", "舞", "书", "画"].some((art) => !directText.includes(art));
  if (!circleSourceField && direct !== undefined && directText && !(circleCoreField && String(fallback || "").length > directText.length * 1.35) && !incompleteConcept) return direct;
  const legacy = (assistantState.sixarts.designDraft || []).find((item) => [key, ...aliases].includes(item.title));
  const legacyText = String(legacy?.content || "").trim();
  const legacyIncompleteConcept = circleCoreField && key === "concept" && ["说", "唱", "弹", "舞", "书", "画"].some((art) => !legacyText.includes(art));
  return !circleSourceField && legacyText && !(circleCoreField && String(fallback || "").length > legacyText.length * 1.35) && !legacyIncompleteConcept ? legacy.content : fallback;
}

function renderSixArtsDesignField(key, fallback, className = "", aliases = []) {
  return `<div class="sixarts-design-field ${className}" contenteditable="true" spellcheck="false" data-sixarts-field="${escapeHtml(key)}">${escapeHtml(String(getSixArtsDesignField(key, fallback, aliases) || "")).replace(/\n/g, "<br>")}</div>`;
}

function renderSixArtsDesignArtChips(arts, focusedKeys = arts.map((item) => item.key)) {
  const focused = new Set(focusedKeys);
  return `<div class="sixarts-design-art-chips">${arts.map((item) => `<span class="art-chip art-${item.key} ${focused.has(item.key) ? "is-focus" : "is-support"}" title="${focused.has(item.key) ? "本课重点融合" : "可作为拓展融合"}"><i data-lucide="${item.icon}"></i><b>${item.key}</b><small>${escapeHtml(item.ability)}</small></span>`).join("")}</div>`;
}

function renderSixArtsFusionRows(rows, table = false, focusedKeys = rows.map(([key]) => key), fieldPrefix = "fusion") {
  const focused = new Set(focusedKeys);
  const className = table ? "sixarts-design-fusion-table" : "sixarts-design-fusion-list";
  return `<div class="${className}">${table ? '<div class="fusion-table-head"><b>六艺维度</b><b>本课融合点</b></div>' : ""}${rows.map(([key, content]) => `<div class="fusion-table-row art-${key} ${focused.has(key) ? "is-focus" : "is-support"}"><span><i data-lucide="${sixArtsDimensions.find((item) => item.key === key)?.icon || "sparkles"}"></i><b>${key}</b></span>${renderSixArtsDesignField(`${fieldPrefix}-${key}`, content)}</div>`).join("")}</div>`;
}

function renderSixArtsObjectiveItems(items, key) {
  return `<div class="sixarts-objective-items">${items.map((content, index) => `<article><span>${index + 1}</span>${renderSixArtsDesignField(`${key}-${index + 1}`, content)}</article>`).join("")}</div>`;
}

function getSixArtsConciseTeacherGoals(rows) {
  const preferredOrder = ["践行师德", "学会教学", "学会育人", "学会发展"];
  const grouped = new Map();
  (Array.isArray(rows) ? rows : []).forEach((row, index) => {
    const label = String(Array.isArray(row) ? row[0] : row?.level_one || row?.dimension || `教师目标${index + 1}`).trim();
    const content = String(Array.isArray(row) ? row[3] : row?.target || row?.observable || row?.content || "").trim();
    if (!label || !content) return;
    const targets = grouped.get(label) || [];
    if (!targets.includes(content)) targets.push(content);
    grouped.set(label, targets);
  });
  return [...grouped.entries()]
    .sort(([left], [right]) => {
      const leftIndex = preferredOrder.indexOf(left);
      const rightIndex = preferredOrder.indexOf(right);
      return (leftIndex < 0 ? preferredOrder.length : leftIndex) - (rightIndex < 0 ? preferredOrder.length : rightIndex);
    })
    .map(([label, targets]) => [label, targets.join("；")]);
}

function renderSixArtsConciseTeacherGoals(rows) {
  const goals = getSixArtsConciseTeacherGoals(rows);
  return `<div class="sixarts-concise-teacher-goals">${goals.map(([label, content], index) => `<article><b>${escapeHtml(label)}</b>${renderSixArtsDesignField(`teacher-brief-${index + 1}`, content)}</article>`).join("")}</div>`;
}

function cleanTeacherIndicatorText(value) {
  return String(value || "")
    .replace(/(^|[；;，,、])\s*\d+(?:\.\d+)?\s*/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function renderSixArtsTeacherTable(rows) {
  return `<div class="sixarts-teacher-table"><div class="teacher-table-head"><b>一级指标</b><b>二级指标</b><b>三级指标</b><b>本课达成目标</b></div>${rows.map((row, index) => `<div class="teacher-table-row"><span>${escapeHtml(row[0])}</span><span>${escapeHtml(row[1])}</span><span>${escapeHtml(cleanTeacherIndicatorText(row[2]))}</span>${renderSixArtsDesignField(`teacher-${index + 1}`, row[3])}</div>`).join("")}</div>`;
}

function renderSixArtsMethodsTable(rows) {
  return `<div class="sixarts-method-table"><div class="method-table-head"><b>教学方法</b><b>六艺侧重（学生）</b><b>对应教师三学会指标</b></div>${rows.map((row, index) => `<div class="method-table-row"><span>${escapeHtml(row[0])}</span><span>${escapeHtml(row[1])}</span>${renderSixArtsDesignField(`method-${index + 1}`, cleanTeacherIndicatorText(row[2]))}</div>`).join("")}</div>`;
}

function renderSixArtsConciseDesign(data) {
  return `<div class="sixarts-design-document is-concise">
    <article class="sixarts-design-lead-card"><div class="design-card-heading"><span>DESIGN CONCEPT</span><b>设计理念</b></div>${renderSixArtsDesignField("concept", data.concept, "design-lead-copy", ["设计理念"])}${renderSixArtsDesignArtChips(sixArtsDimensions, data.artObjects.map((item) => item.key))}<p class="sixarts-design-focus-note">重点融合：${data.artObjects.map((item) => item.key).join("、") || "待选择"}。其余维度作为可选拓展资源保留，教师可根据课情继续补充。</p></article>
    <article class="sixarts-design-distinction-card"><div class="design-card-heading"><i data-lucide="book-open-check"></i><b>评价区分说明</b></div>${renderSixArtsDesignField("distinction", data.distinction, "design-distinction-copy")}<div class="distinction-bars"><span><b>六艺素养</b><small>聚焦学生课堂核心表现</small></span><span><b>三学会指标</b><small>评价教师课堂教学行为</small></span></div><strong>两类评价独立对标、互不混淆。</strong></article>
    <h3 class="sixarts-design-section-title">一、课前设计</h3>
    <div class="sixarts-design-two-col"><article class="design-info-card"><div class="design-card-heading"><i data-lucide="book-open"></i><b>教材分析</b></div>${renderSixArtsDesignField("textbook", data.textbook, "design-body-copy", ["教材分析"])} </article><article class="design-info-card"><div class="design-card-heading"><i data-lucide="users-round"></i><b>学情分析</b></div>${renderSixArtsDesignField("student", data.student, "design-body-copy", ["学情分析"])} </article></div>
    <article class="design-wide-card"><div class="design-card-heading"><i data-lucide="sparkles"></i><b>核心六艺融合点</b><span>重点 ${data.artObjects.length} 项 · 完整六艺视图</span></div>${renderSixArtsFusionRows(data.fusion, false, data.artObjects.map((item) => item.key), "fusion-point")}</article>
    <article class="design-wide-card sixarts-concise-goal-board"><div class="design-card-heading"><i data-lucide="target"></i><b>教学目标</b></div><div class="sixarts-concise-goal-layout"><div class="sixarts-concise-goal-stack"><section class="sixarts-concise-goal-card is-subject"><h4>（一）学科知识与技能 <small>指向学生</small></h4>${renderSixArtsObjectiveItems(data.subjectGoals, "subject")}</section><section class="sixarts-concise-goal-card is-values"><h4>（三）情感态度价值观 <small>指向学生</small></h4>${data.values.map(([key, content], index) => `<div class="value-item value-${index + 1}"><b>${escapeHtml(key)}</b>${renderSixArtsDesignField(`value-${index + 1}`, content)}</div>`).join("")}</section></div><section class="sixarts-concise-goal-card is-sixarts"><h4>（二）六艺素养目标 <small>指向学生</small></h4>${renderSixArtsFusionRows(data.competencies.map((item) => [item.key, item.text]), false, data.artObjects.map((item) => item.key), "competency")}</section></div><section class="sixarts-concise-goal-card is-teacher"><h4>（四）教师教学目标 <small>指向“践行三学会”毕业要求</small></h4>${renderSixArtsConciseTeacherGoals(data.teacherBrief)}</section></article>
    <div class="sixarts-design-two-col design-footer-grid"><article class="design-info-card compact"><div class="design-card-heading"><i data-lucide="star"></i><b>教学重难点</b></div><div class="design-emphasis"><b>重点</b>${renderSixArtsDesignField("key", data.key)}<b>难点</b>${renderSixArtsDesignField("difficult", data.difficult)}</div></article><article class="design-info-card compact"><div class="design-card-heading"><i data-lucide="briefcase-business"></i><b>教学准备</b></div>${renderSixArtsDesignField("prep", data.prep, "design-body-copy", ["教学准备"])} </article></div>
  </div>`;
}

function renderSixArtsLegacyDetailedDesign(data) {
  return `<div class="sixarts-design-document is-detailed">
    <div class="sixarts-design-detailed-lead"><article class="sixarts-design-lead-card"><div class="design-card-heading"><span>DESIGN CONCEPT</span><b>设计理念</b></div>${renderSixArtsDesignField("concept", data.concept, "design-lead-copy", ["设计理念"])}${renderSixArtsDesignArtChips(data.artObjects)}</article><article class="sixarts-design-distinction-card"><div class="design-card-heading"><i data-lucide="book-open-check"></i><b>评价区分说明</b></div>${renderSixArtsDesignField("distinction", data.distinction, "design-distinction-copy")}<div class="distinction-bars"><span><b>六艺素养</b><small>评价学生课堂表现</small></span><span><b>三学会指标</b><small>评价教师教学行为</small></span></div></article></div>
    <h3 class="sixarts-design-section-title">一、教材与学情分析</h3>
    <div class="sixarts-analysis-grid"><article class="design-info-card"><div class="design-card-heading"><span>（一）</span><b>教材分析</b></div>${renderSixArtsDesignField("textbook", data.textbook, "design-body-copy", ["教材分析"])} </article><article class="design-info-card"><div class="design-card-heading"><span>（二）</span><b>学情分析</b></div>${renderSixArtsDesignField("student", data.student, "design-body-copy", ["学情分析"])} </article><article class="design-info-card fusion-card"><div class="design-card-heading"><span>（三）</span><b>六艺融合点</b></div>${renderSixArtsFusionRows(data.fusion, true, data.artObjects.map((item) => item.key), "fusion-point")}</article></div>
    <h3 class="sixarts-design-section-title">二、教学目标</h3>
    <section class="sixarts-goal-shell"><div class="sixarts-goal-columns"><article><h4>（一）学科知识与技能 <small>指向学生</small></h4>${renderSixArtsObjectiveItems(data.subjectGoals, "subject")}</article><article><h4>（二）六艺素养目标 <small>指向学生</small></h4>${renderSixArtsFusionRows(data.competencies.map((item) => [item.key, item.text]), false, data.artObjects.map((item) => item.key), "competency")}</article><article><h4>（三）情感态度价值观 <small>指向学生</small></h4>${data.values.map(([key, content], index) => `<div class="value-item value-${index + 1}"><b>${key}</b>${renderSixArtsDesignField(`value-${index + 1}`, content)}</div>`).join("")}</article></div><article class="design-teacher-card"><h4>（四）教师教学目标 <small>指向“践行三学会”毕业要求</small></h4>${renderSixArtsTeacherTable(data.teacherRows)}</article></section>
    <div class="sixarts-design-bottom-grid"><article class="design-info-card"><h3 class="sixarts-design-section-title">三、教学重难点</h3><div class="design-emphasis"><b>重点</b>${renderSixArtsDesignField("key", data.key)}<b>难点</b>${renderSixArtsDesignField("difficult", data.difficult)}</div></article><article class="design-info-card"><h3 class="sixarts-design-section-title">四、教学方法与六艺活动策略</h3>${renderSixArtsMethodsTable(data.methods)}</article></div>
    <article class="design-wide-card design-prep-card"><div class="design-card-heading"><i data-lucide="briefcase-business"></i><b>五、教学准备</b></div>${renderSixArtsDesignField("prep", data.prep, "design-body-copy", ["教学准备"])} </article>
  </div>`;
}

function renderSixArtsLegacyDetailedProcess(context, stages) {
  const stageNav = stages.map((stage, index) => `<button type="button" class="sixarts-detailed-stage-tab ${index === 0 ? "active" : ""}" data-sixarts-process-anchor="${index}"><b>${String(index + 1).padStart(2, "0")}</b><span>${escapeHtml(String(stage.title || "教学环节"))}</span><small>${escapeHtml(String(stage.time || ""))}</small></button>`).join("");
  const stageCards = stages.map((stage, index) => {
    const art = sixArtsDimensions.find((item) => item.key === stage.art_key) || sixArtsDimensions[index % sixArtsDimensions.length];
    const artLabel = stage.art_label || art.key;
    const artActivity = stage.art_activity || art.activity;
    const steps = Array.isArray(stage.steps) && stage.steps.length ? stage.steps : [stage.title || "完成本环节核心任务"];
    const evidence = stage.evidence || art.evidence;
    const indicator = stage.teacher_indicator || "依据课堂证据进行反馈与调整";
    const intention = stage.intention || `围绕“${stage.title || "本环节"}”组织证据提取、表达交流与学习评价，使${artLabel}活动服务于${context.title || "本课"}的核心目标。`;
    const sourceRows = Array.isArray(stage.rows) && stage.rows.length
      ? stage.rows
      : steps.map((step, rowIndex) => ({
        step,
        teacher: rowIndex === 0 ? stage.teacher : `围绕“${step}”巡视指导，追问学生的依据，及时记录共性问题并提供分层支持。`,
        student: rowIndex === 0 ? stage.student : `完成“${step}”，与同伴交流过程发现，根据教师反馈调整自己的表达、操作或作品。`,
        arts: rowIndex === 0 ? (stage.penetration || `${artLabel}：通过${artActivity}形成与${context.title || "本课"}目标直接相关的表现证据。`) : `${artLabel}：把“${step}”转化为可观察的语言、行为或作品证据。`,
        indicator
      }));
    const rowMarkup = sourceRows.map((row, rowIndex) => {
      const step = Array.isArray(row) ? row[0] : row.step;
      const teacher = Array.isArray(row) ? row[1] : row.teacher;
      const student = Array.isArray(row) ? row[2] : row.student;
      const penetration = Array.isArray(row) ? row[3] : (row.arts || row.penetration || stage.penetration);
      const rowIndicator = Array.isArray(row) ? row[4] : (row.indicator || indicator);
      return `<div class="sixarts-detailed-process-row"><div class="process-step-cell"><span>${rowIndex + 1}</span><b contenteditable="true" spellcheck="false" data-stage-field="step">${escapeHtml(String(step || ""))}</b></div><p contenteditable="true" spellcheck="false" data-stage-field="teacher">${escapeHtml(String(teacher || ""))}</p><p contenteditable="true" spellcheck="false" data-stage-field="student">${escapeHtml(String(student || ""))}</p><p contenteditable="true" spellcheck="false" data-stage-field="penetration">${escapeHtml(String(penetration || ""))}</p><p contenteditable="true" spellcheck="false" data-stage-field="teacher_indicator">${escapeHtml(String(rowIndicator || ""))}</p></div>`;
    }).join("");
    return `<article class="sixarts-detailed-process-card" id="sixarts-process-stage-${index + 1}" data-sixarts-stage="${escapeHtml(String(stage.title || "教学环节"))}" data-sixarts-art-key="${escapeHtml(String(art.key))}" data-sixarts-art-label="${escapeHtml(String(artLabel))}" data-sixarts-art-activity="${escapeHtml(String(artActivity))}" data-sixarts-penetration="${escapeHtml(String(stage.penetration || ""))}"><aside class="sixarts-detailed-process-rail"><b>${String(index + 1).padStart(2, "0")}</b><strong>${escapeHtml(String(stage.title || "教学环节"))}</strong><span data-stage-time>${escapeHtml(String(stage.time || ""))}</span></aside><div class="sixarts-detailed-process-content"><header><div><p>教学环节 ${String(index + 1).padStart(2, "0")}</p><h3>${escapeHtml(String(stage.title || "教学环节"))}</h3></div><div class="sixarts-detailed-core-art"><span>核心六艺：</span><b class="art-${art.key}"><i data-lucide="${art.icon}"></i>${escapeHtml(String(artLabel))}</b></div></header><div class="sixarts-detailed-process-table"><div class="sixarts-detailed-process-head"><b>教学步骤</b><b>教师行为</b><b>学生活动</b><b>学生六艺渗透</b><b>教师行为对应三学会指标</b></div>${rowMarkup}</div><div class="sixarts-detailed-intention"><i data-lucide="lightbulb"></i><b>设计意图</b><p contenteditable="true" spellcheck="false" data-stage-field="intention">${escapeHtml(String(intention))}</p></div><div class="sixarts-detailed-process-meta"><span><b>学习证据</b><em contenteditable="true" spellcheck="false" data-stage-field="evidence">${escapeHtml(String(evidence))}</em></span><span><b>材料与资源</b><em contenteditable="true" spellcheck="false" data-stage-field="materials">${escapeHtml(String(stage.materials || `${context.edition || "教材"}、学习单与${artLabel}活动材料`))}</em></span><span><b>学生产出</b><em contenteditable="true" spellcheck="false" data-stage-field="expected_output">${escapeHtml(String(stage.expected_output || evidence))}</em></span></div></div></article>`;
  }).join("");
  return `<div class="sixarts-detailed-process"><nav class="sixarts-detailed-stage-nav" aria-label="详案教学环节导航">${stageNav}</nav><div class="sixarts-detailed-process-list">${stageCards}</div></div>`;
}


function renderSixArtsDetailedEvaluation(context, rows, evaluationDefaults, designData) {
  return renderSixArtsEditableEvaluation(context, rows, evaluationDefaults, designData);
}

function captureSixArtsDesignDraft() {
  const modules = $$("#sixarts-design-output [data-sixarts-module]");
  if (modules.length) assistantState.sixarts.designDraft = modules.map((module) => ({ title: module.dataset.sixartsModule, content: module.querySelector("[data-sixarts-edit]")?.innerText.trim() || "" }));
  const fields = {};
  $$("#sixarts-design-output [data-sixarts-field]").forEach((field) => { fields[field.dataset.sixartsField] = field.innerText.trim(); });
  if (Object.keys(fields).length) assistantState.sixarts.designFieldDraft = fields;
  const competency = {};
  $$("#sixarts-design-output [data-sixarts-competency]").forEach((cell) => { competency[cell.dataset.sixartsCompetency] = cell.innerText.trim(); });
  if (Object.keys(competency).length) assistantState.sixarts.competencyDraft = competency;
}

function saveSixArtsVersionDraft() {
  const key = assistantState.sixarts.detailLevel || "detailed";
  assistantState.sixarts.versionDrafts = assistantState.sixarts.versionDrafts || {};
  assistantState.sixarts.versionDrafts[key] = {
    designSections: assistantState.sixarts.designSections || [],
    designDraft: assistantState.sixarts.designDraft || [],
    designFieldDraft: assistantState.sixarts.designFieldDraft || {},
    competencyDraft: assistantState.sixarts.competencyDraft || {},
    processDraft: assistantState.sixarts.processDraft || [],
    processEvaluationTables: assistantState.sixarts.processEvaluationTables || {},
    evaluationResponses: { ...(assistantState.sixarts.evaluationResponses || {}) },
    evaluationDraft: assistantState.sixarts.evaluationDraft || [],
    teacherEvaluationDraft: assistantState.sixarts.teacherEvaluationDraft || [],
    selfAssessmentDraft: assistantState.sixarts.selfAssessmentDraft || [],
    reflectionPromptsDraft: assistantState.sixarts.reflectionPromptsDraft || [],
    practiceDraft: assistantState.sixarts.practiceDraft || [],
    referenceDraft: assistantState.sixarts.referenceDraft || [],
    homeworkDraft: assistantState.sixarts.homeworkDraft || "",
    extensionDraft: assistantState.sixarts.extensionDraft || "",
    fusionScore: assistantState.sixarts.fusionScore || 0,
    fusionBreakdown: assistantState.sixarts.fusionBreakdown || [],
    stageReady: { ...(assistantState.sixarts.stageReady || {}) },
    generated: Boolean(assistantState.sixarts.generated)
  };
}

function loadSixArtsVersionDraft() {
  const saved = (assistantState.sixarts.versionDrafts || {})[assistantState.sixarts.detailLevel || "detailed"];
  assistantState.sixarts.designSections = saved?.designSections || [];
  assistantState.sixarts.designDraft = saved?.designDraft || [];
  assistantState.sixarts.designFieldDraft = saved?.designFieldDraft || {};
  assistantState.sixarts.competencyDraft = saved?.competencyDraft || {};
  assistantState.sixarts.processDraft = saved?.processDraft || [];
  assistantState.sixarts.processEvaluationTables = saved?.processEvaluationTables || {};
  assistantState.sixarts.evaluationResponses = { ...(saved?.evaluationResponses || {}) };
  assistantState.sixarts.evaluationDraft = saved?.evaluationDraft || [];
  assistantState.sixarts.teacherEvaluationDraft = saved?.teacherEvaluationDraft || [];
  assistantState.sixarts.selfAssessmentDraft = saved?.selfAssessmentDraft || [];
  assistantState.sixarts.reflectionPromptsDraft = saved?.reflectionPromptsDraft || [];
  assistantState.sixarts.practiceDraft = saved?.practiceDraft || [];
  assistantState.sixarts.referenceDraft = saved?.referenceDraft || [];
  assistantState.sixarts.homeworkDraft = saved?.homeworkDraft || "";
  assistantState.sixarts.extensionDraft = saved?.extensionDraft || "";
  assistantState.sixarts.fusionScore = Number(saved?.fusionScore) || 0;
  assistantState.sixarts.fusionBreakdown = saved?.fusionBreakdown || [];
  assistantState.sixarts.stageReady = saved?.stageReady || { design: true, process: true, evaluate: true };
  assistantState.sixarts.generated = Boolean(saved?.generated);
}

function renderSixArtsGenerationState() {
  const mode = assistantState.sixarts.mode || "complete";
  if (!assistantState.sixarts.stageReady) assistantState.sixarts.stageReady = { design: true, process: true, evaluate: true };
  const ready = assistantState.sixarts.stageReady;
  const current = state.currentSection;
  const versionLabel = assistantState.sixarts.detailLevel === "detailed" ? "详案版" : "简案版";
  document.body.dataset.sixartsDetail = assistantState.sixarts.detailLevel || "detailed";
  const stages = [["sixarts-design", "教学设计", ready.design], ["sixarts-process", "教学过程", ready.process], ["sixarts-evaluate", "评价与下载", ready.evaluate]];
  $$('[data-sixarts-progress]').forEach((container) => {
    container.innerHTML = `<div class="sixarts-progress-copy"><span class="generation-mode-chip"><i data-lucide="${mode === "steps" ? "list-checks" : "zap"}"></i>${mode === "steps" ? "分阶段生成" : "一键生成"} · ${versionLabel}</span><p>${mode === "steps" ? "正文可直接修改，确认后再生成下一阶段。" : "完整教案已生成，可自由修改并下载 Word。"}</p></div><div class="sixarts-progress-tools"><div class="sixarts-version-switch" role="group" aria-label="切换教案版本"><span>版本</span><button type="button" data-sixarts-detail-switch="concise" class="${assistantState.sixarts.detailLevel === "concise" ? "active" : ""}">简案版</button><button type="button" data-sixarts-detail-switch="detailed" class="${assistantState.sixarts.detailLevel === "detailed" ? "active" : ""}">详案版</button></div><nav>${stages.map(([section, label, done], index) => `<button type="button" data-sixarts-stage-target="${section}" class="${current === section ? "active" : ""} ${done ? "done" : "locked"}" ${done ? "" : "aria-disabled=\"true\""}><span>${index + 1}</span><b>${label}</b><i data-lucide="${done ? "check" : "lock-keyhole"}"></i></button>`).join("")}</nav></div>`;
  });
  $$('[data-sixarts-detail-switch]').forEach((button) => {
    button.classList.toggle("active", button.dataset.sixartsDetailSwitch === assistantState.sixarts.detailLevel);
    button.setAttribute("aria-pressed", String(button.classList.contains("active")));
    button.disabled = Boolean(assistantState.sixarts.pending);
  });
  const finalReady = mode === "complete" || ready.evaluate;
  [$("#sixarts-download-word-design"), $("#sixarts-download-word")].filter(Boolean).forEach((button) => {
    button.disabled = !finalReady;
    button.title = finalReady ? "下载当前完整 Word 教案" : "完成教学过程与评价后即可下载 Word";
  });
  [["sixarts-process", ready.process], ["sixarts-evaluate", ready.evaluate]].forEach(([section, available]) => {
    $$(`.subnav-link[data-workspace-section="${section}"]`).forEach((button) => {
      button.classList.toggle("locked", mode === "steps" && !available);
      button.setAttribute("aria-disabled", String(mode === "steps" && !available));
    });
  });
  $("#sixarts-design-next").innerHTML = `${mode === "steps" && !ready.process ? "确认设计并生成教学过程" : "查看教学过程"} <i data-lucide="arrow-right"></i>`;
  $("#sixarts-process-next").innerHTML = `${mode === "steps" && !ready.evaluate ? "确认过程并生成评价" : "进入评价"} <i data-lucide="arrow-right"></i>`;
  syncSixArtsModeControls();
  renderWorkspaceGuide();
  refreshIcons();
}

async function switchSixArtsDetailLevel(level) {
  if (!['concise', 'detailed'].includes(level) || level === assistantState.sixarts.detailLevel || assistantState.sixarts.pending) return;
  const previousLevel = assistantState.sixarts.detailLevel || "detailed";
  captureSixArtsDesignDraft();
  captureSixArtsProcessDraft();
  saveSixArtsVersionDraft();
  const savedTarget = (assistantState.sixarts.versionDrafts || {})[level];
  assistantState.sixarts.detailLevel = level;
  if (savedTarget) {
    loadSixArtsVersionDraft();
    renderSixArtsDesign();
    renderSixArtsProcess();
    renderSixArtsRubric();
    syncSixArtsModeControls();
    toast(`已切换为${level === "detailed" ? "详案版" : "简案版"}`);
    scheduleWorkspaceSave();
    return;
  }

  if (!assistantState.sixarts.generated) {
    loadSixArtsVersionDraft();
    assistantState.sixarts.stageReady = { design: true, process: true, evaluate: true };
    renderSixArtsDesign();
    renderSixArtsProcess();
    renderSixArtsRubric();
    syncSixArtsModeControls();
    scheduleWorkspaceSave();
    return;
  }

  const preservedDrafts = { ...(assistantState.sixarts.versionDrafts || {}) };
  const context = assistantState.sixarts.form || getSixArtsFormData();
  assistantState.sixarts.pending = true;
  renderSixArtsGenerationState();
  toast(`正在生成${level === "detailed" ? "详案版" : "简案版"}，请稍候…`);
  try {
    const data = await requestSixArtsLessonPlan(context, getSelectedSixArts(), level);
    applyGeneratedSixArtsPlan(data.plan, { preserveVersionDrafts: true });
    toast(data.warning
      ? data.warning
      : (data.used_fallback ? "模型暂不可用，已依据教材与备课资料生成对应版本。" : `已生成并切换为${level === "detailed" ? "详案版" : "简案版"}。`));
  } catch (error) {
    console.warn("Six-arts version generation failed.", error);
    assistantState.sixarts.versionDrafts = preservedDrafts;
    assistantState.sixarts.detailLevel = previousLevel;
    loadSixArtsVersionDraft();
    renderSixArtsDesign();
    renderSixArtsProcess();
    renderSixArtsRubric();
    const reason = error?.name === "AbortError"
      ? "请求超时"
      : (String(error?.message || "接口未连接").slice(0, 80) || "接口未连接");
    toast(`对应版本生成失败：${reason}。已保留当前教案。`);
  } finally {
    assistantState.sixarts.pending = false;
    renderSixArtsGenerationState();
    syncSixArtsModeControls();
    scheduleWorkspaceSave();
  }
}

function renderSixArtsDesign() {
  const context = ensureSixArtsSourceContent(assistantState.sixarts.form || getSixArtsFormData());
  const arts = getSelectedSixArts();
  const version = assistantState.sixarts.detailLevel === "detailed" ? "详案版" : "简案版";
  const courseTitle = String(context.title || "未命名课题").replace(/教学设计/g, "").trim();
  $("#sixarts-design-course-title").textContent = `${courseTitle}教学设计（六艺素养融合版 · ${version}）`;
  $("#sixarts-design-meta").textContent = `${context.edition} · ${context.grade} · ${context.subject} · ${context.lessons} 课时（${context.duration} 分钟）`;
  const documentData = getSixArtsDesignDocument(context, arts);
  $("#sixarts-design-output").innerHTML = documentData.concise
    ? renderSixArtsConciseDesign(documentData)
    : renderSixArtsDetailedDesign(documentData);
  const score = Number(assistantState.sixarts.fusionScore) || Math.min(96, 66 + arts.length * 6 + (context.requirement ? 4 : 0));
  $("#sixarts-fusion-score").textContent = score;
  const breakdown = Array.isArray(assistantState.sixarts.fusionBreakdown) && assistantState.sixarts.fusionBreakdown.length
    ? assistantState.sixarts.fusionBreakdown.map((item) => [item.label, Number(item.value)])
    : [["目标一致性", Math.min(96, score + 4)], ["活动可实施", score - 2], ["学生参与度", Math.min(95, score + 1)], ["育人价值", Math.min(98, score + 5)]];
  $("#sixarts-fusion-breakdown").innerHTML = breakdown.map(([label, value]) => {
    const safeValue = Math.max(0, Math.min(100, Number(value) || 0));
    return `<div><span>${escapeHtml(String(label || "融合质量"))}<b>${safeValue}%</b></span><i><em style="width:${safeValue}%"></em></i></div>`;
  }).join("");
  renderSixArtsGenerationState();
  refreshIcons();
}

function getConciseSixArtsStages(context) {
  const title = String(context.title || "");
  if (/圆的认识/.test(title)) return getCircleConciseStages();
  if (/圆的认识/.test(title)) {
    return [
      { title: "情境激趣", time: "5 分钟", art_key: "说", teacher: "播放兵马俑古车轮复原动画，追问车轮为什么必须是圆形，组织学生猜想并用动作感知圆的旋转轨迹。", student: "观看情境材料，联系生活大胆表达猜想，用手臂模拟车轮旋转并明确探究任务。", penetration: "说：完整表达猜想；舞：用肢体模拟圆的运动轨迹。", intention: "以生活问题制造认知冲突，为理解“一中同长”埋下伏笔。", evidence: "能提出与圆的形状或运动有关的合理猜想。", teacher_indicator: "1.2职业认同；2.2专业信念" },
      { title: "实操探究", time: "25 分钟", art_key: "弹", teacher: "依次组织图形对比、多元画圆、概念自学、折量验证和指定作图，示范圆规“定点、定长、旋转一周”，引导归纳圆心、半径、直径及d=2r。", student: "比较直线图形与圆；用硬币、绳子、圆规画圆；标注O、r、d；折圆、测量并记录数据；用证据归纳“一中同长”。", steps: ["对比辨析直线图形与曲线图形。", "多元作图，归纳定点、定长。", "自学并辨析圆心、半径、直径。", "折一折、量一量，验证圆的特征。", "规范作图并完成创意圆形设计。"], penetration: "说：概念辨析与规律归纳；弹：工具操作与测量；舞：站圆体验；画：作图与创意设计。", intention: "让学生亲历从操作、记录到推理建模的知识生成过程。", evidence: "规范圆形作品、测量记录表和“一中同长”口头解释。", teacher_indicator: "3.1专业学科；4.1主教学科；6.2发展指导；7.2活动育人；9.2合作技能" },
      { title: "应用拓展", time: "5 分钟", art_key: "说", teacher: "引导学生运用“一中同长”解释车轮、井盖等生活现象，并用几何画板呈现不同形状车轮的运动轨迹。", student: "用完整数学语言解释生活原理，观察动态演示并列举新的圆形应用。", penetration: "说：逻辑化解释生活原理；舞：用手势模拟车轮运动轨迹。", intention: "实现圆的知识从课堂概念到真实生活的迁移。", evidence: "能用圆心、半径或“一中同长”支撑生活解释。", teacher_indicator: "3.2支持学科；2.2专业信念" },
      { title: "总结自评", time: "5 分钟", art_key: "画", teacher: "串联圆的特征、画圆方法和数量关系，组织学生完成说、弹、舞、画四维自评并布置分层作业。", student: "复述核心知识，完成六艺星级自评，分享收获，记录基础练习、思维导图或创意圆形设计任务。", penetration: "说：复述与分享；画：思维导图和创意设计；四维六艺综合自评。", intention: "通过自评和分层作业形成知识、能力与素养的闭环。", evidence: "自评表、课堂收获表达和分层作业选择。", teacher_indicator: "4.1主教学科；5.1课程整合；9.1合作意愿" }
    ];
  }
  if (/小马过河/.test(title)) {
    return [
      { title: "谈话激趣", time: "2 分钟", art_key: "说", teacher: "从生活中遇到困难怎么办谈起，创设小马送麦子却被小河拦住的悬念并揭示课题。", student: "联系生活完整发言，齐读课题并进入故事情境。", penetration: "说：生活化发言与齐读课题。", intention: "以生活谈话快速集中注意力并激活表达。", teacher_indicator: "1.2职业认同；2.2专业信念" },
      { title: "初读课文", time: "3 分钟", art_key: "书", teacher: "布置读准字音、读通句子和标注自然段任务，巡视指导并集体校对。", student: "借助拼音自由朗读，规范标注自然段并核对段落结构。", penetration: "说：朗读输出；书：规范标注段落。", intention: "落实低段阅读常规，整体把握文本结构。", teacher_indicator: "4.1主教学科；6.1班级常规" },
      { title: "多元识字", time: "11 分钟", art_key: "说", teacher: "通过领读、开火车组词、小老师领读、口诀记字和“小马过河”游戏完成13个生字的认读与正音。", student: "观察字形，参与跟读、组词、领读和小组接龙，在游戏中巩固生字。", penetration: "说：跟读、组词和领读；书：观察字形与识记结构。", intention: "用多层口语实践和游戏突破识字重难点。", teacher_indicator: "3.1专业学科；4.1主教学科；9.2合作技能" },
      { title: "梳理梗概", time: "4 分钟", art_key: "说", teacher: "出示故事梗概填空支架，引导学生抓取人物、任务、困难和不同意见并板书关键词。", student: "借助支架完整口头填空，串联故事起因和主要冲突。", penetration: "说：抓取信息并通顺表达故事梗概。", intention: "用句式支架提升低段文本概括与口语表达。", teacher_indicator: "4.1主教学科；9.2合作技能" },
      { title: "品读体悟", time: "8 分钟", art_key: "舞", teacher: "指导朗读1—2自然段，圈画“连蹦带跳”等词句，示范老马与小马的语气并组织分角色朗读。", student: "品读关键词句，用动作表现小马开心的状态，合作读出角色语气。", penetration: "说：品读与角色朗读；舞：用体态表现角色情绪。", intention: "以声音和身体动作把抽象情感转化为可体验的理解。", teacher_indicator: "4.1主教学科；6.2发展指导；7.2活动育人" },
      { title: "深读文本", time: "6 分钟", art_key: "舞", teacher: "引导研读3—6自然段，比较老牛和松鼠的不同说法，组织动作演绎小马为难、松鼠焦急的状态。", student: "提取文本信息，表达人物观点，用神态和动作体会故事冲突。", penetration: "说：思辨问答；舞：体态演绎并理解小马的为难。", intention: "依托文本证据和具身体验突破故事冲突难点。", teacher_indicator: "4.1主教学科；6.2发展指导；7.2活动育人" },
      { title: "规范书写", time: "8 分钟", art_key: "书", teacher: "示范“愿、意、麦、伯”的结构、笔顺与占格，巡视纠正姿势并组织作品互评。", student: "观察字形、书空、描红和独立练写，对照标准修改。", penetration: "书：规范笔顺、结构与姿势；说：口述结构并参与互评。", intention: "通过示范、练写、评议形成完整的写字学习闭环。", teacher_indicator: "4.1主教学科；6.1班级常规；8.1文明底蕴" },
      { title: "总结作业", time: "2 分钟", art_key: "说", teacher: "结合板书回顾识字写字、故事脉络和小马的为难，布置角色朗读、重点字练写及向家人讲故事的分层任务。", student: "回顾课堂收获，记录作业并形成持续探究期待。", penetration: "说：复述与课后讲述；书：规范书写巩固。", intention: "极简复盘课堂重点，让课堂学习与课后巩固闭环衔接。", teacher_indicator: "2.2专业信念；4.1主教学科" }
    ];
  }
  return [
    { title: "情境导入", time: "5 分钟", teacher: `以与${context.title}相关的图像、声音或关键词创设问题情境。`, student: "观察材料，分享已有经验并提出问题。" },
    { title: "核心探究", time: "20 分钟", teacher: "提供任务支架，组织证据提取、操作探究与同伴交流。", student: "完成资料分析或实践任务，用六艺方式形成学习成果。" },
    { title: "迁移应用", time: "10 分钟", teacher: "提供真实或变式任务，依据学习证据进行反馈。", student: "独立应用并展示成果，根据标准自评、互评。" },
    { title: "总结评价", time: "5 分钟", teacher: "梳理知识并布置分层拓展任务。", student: "复述核心结论，完成自评并明确课后任务。" }
  ];
}

function getDefaultSixArtsStages(context) {
  if (assistantState.sixarts.detailLevel === "concise") return getConciseSixArtsStages(context);
  const blueprint = getSixArtsLessonBlueprint(context, getSelectedSixArts());
  if (Array.isArray(blueprint.stages) && blueprint.stages.length) {
    return blueprint.stages.map((stage) => ({
      ...stage,
      teacher_indicator: stage.teacher_indicator || (/圆的认识/.test(String(context.title || ""))
        ? "依据践行三学会指标观察教学准确性、活动组织与反馈质量"
        : "依据践行三学会指标观察语言示范、活动组织与育人表现")
    }));
  }
  return getConciseSixArtsStages(context);
}

function captureSixArtsProcessDraft() {
  const stages = $$("#sixarts-process-output [data-sixarts-stage]");
  if (!stages.length) return;
  const previous = assistantState.sixarts.processDraft || [];
  assistantState.sixarts.processDraft = stages.map((stage, index) => ({
    ...(previous[index] || {}),
    title: stage.dataset.sixartsStage || previous[index]?.title || "教学环节",
    art_key: stage.dataset.sixartsArtKey || previous[index]?.art_key || "",
    art_label: stage.dataset.sixartsArtLabel || previous[index]?.art_label || "",
    art_activity: stage.dataset.sixartsArtActivity || previous[index]?.art_activity || "",
    time: stage.querySelector("[data-stage-time]")?.textContent || previous[index]?.time || "",
    teacher: stage.querySelector('[data-stage-field="teacher"]')?.innerText.trim() || previous[index]?.teacher || "",
    student: stage.querySelector('[data-stage-field="student"]')?.innerText.trim() || previous[index]?.student || "",
    penetration: stage.querySelector('[data-stage-field="penetration"]')?.innerText.trim() || stage.dataset.sixartsPenetration || previous[index]?.penetration || "",
    materials: stage.querySelector('[data-stage-field="materials"]')?.innerText.trim() || previous[index]?.materials || "",
    expected_output: stage.querySelector('[data-stage-field="expected_output"]')?.innerText.trim() || previous[index]?.expected_output || "",
    question_chain: stage.querySelector('[data-stage-field="question_chain"]')?.innerText.trim() || previous[index]?.question_chain || "",
    intention: stage.querySelector('[data-stage-field="intention"]')?.innerText.trim() || previous[index]?.intention || "",
    evidence: stage.querySelector('[data-stage-field="evidence"]')?.innerText.trim() || previous[index]?.evidence || "",
    teacher_indicator: stage.querySelector('[data-stage-field="teacher_indicator"]')?.innerText.trim() || previous[index]?.teacher_indicator || "",
    steps: Array.from(stage.querySelectorAll('[data-stage-field="step"]')).map((step) => step.innerText.trim()).filter(Boolean).length
      ? Array.from(stage.querySelectorAll('[data-stage-field="step"]')).map((step) => step.innerText.trim()).filter(Boolean)
      : (previous[index]?.steps || []),
    ...captureSixArtsDetailedRows(stage, previous[index])
  }));
}

function renderSixArtsProcess() {
  const context = ensureSixArtsSourceContent(assistantState.sixarts.form || getSixArtsFormData());
  const arts = getSelectedSixArts();
  const fallback = sixArtsDimensions.slice(0, 3);
  const activeArts = arts.length ? arts : fallback;
  const defaults = getDefaultSixArtsStages(context);
  const draft = assistantState.sixarts.processDraft || [];
  // The circle lesson is backed by the supplied Word lesson plan. Older
  // browser drafts often kept the same stage titles while containing the old
  // generated copy, so title-based migration could not distinguish them.
  // Start this source-backed lesson from the exact table content instead.
  const sourceStages = /圆的认识/.test(String(context.title || "")) && assistantState.sixarts.detailLevel !== "detailed" ? defaults : (draft.length ? draft : defaults);
  const stages = sourceStages.map((stage, index) => ({ ...(defaults[index] || {}), ...stage }));
  $("#sixarts-process-output").innerHTML = stages.map((stage, index) => {
    const art = sixArtsDimensions.find((item) => item.key === stage.art_key) || activeArts[index % activeArts.length];
    const artLabel = stage.art_label || art.key;
    const artActivity = stage.art_activity || art.activity;
    const penetration = stage.penetration || `${artLabel}不是装饰性活动，应通过“${artActivity}”留下与学科目标直接相关的学生表现证据。`;
    const penetrationBlock = `<aside class="student-sixarts-penetration"><i data-lucide="sparkles"></i><p><b>学生六艺渗透</b><span contenteditable="true" spellcheck="false" data-stage-field="penetration">${escapeHtml(String(penetration))}</span></p></aside>`;
    const stepsBlock = Array.isArray(stage.steps) && stage.steps.length
      ? `<section class="sixarts-stage-detail"><b>教学步骤</b><ol class="sixarts-stage-steps">${stage.steps.map((step) => `<li data-stage-field="step">${escapeHtml(String(step))}</li>`).join("")}</ol></section>`
      : "";
    const sourceRowsBlock = Array.isArray(stage.rows) && stage.rows.length
      ? `<section class="sixarts-source-process-table"><div class="sixarts-source-process-head"><b>教学步骤</b><b>教师行为</b><b>教师三学会指标</b><b>学生行为</b><b>学生六艺渗透</b></div>${stage.rows.map((row) => `<div class="sixarts-source-process-row"><span>${escapeHtml(String(row.step || ""))}</span><p>${escapeHtml(String(row.teacher || ""))}</p><p>${escapeHtml(String(row.indicator || ""))}</p><p>${escapeHtml(String(row.student || ""))}</p><p>${escapeHtml(String(row.arts || ""))}</p></div>`).join("")}</section>`
      : "";
    const intentionBlock = stage.intention ? `<p class="sixarts-stage-intention"><b>设计意图</b><span data-stage-field="intention">${escapeHtml(String(stage.intention))}</span></p>` : "";
    const evidenceBlock = stage.evidence || stage.teacher_indicator
      ? `<div class="sixarts-stage-evidence"><span><b>学习证据</b><em data-stage-field="evidence">${escapeHtml(String(stage.evidence || art.evidence))}</em></span><span><b>教师指标</b><em data-stage-field="teacher_indicator">${escapeHtml(String(stage.teacher_indicator || "依据课堂证据进行反馈与调整"))}</em></span></div>`
      : "";
    const materials = stage.materials || `${context.edition}教材、学习单与${artLabel}活动材料`;
    const output = stage.expected_output || stage.evidence || art.evidence;
    const questionChain = stage.question_chain || `依据是什么？如何把${artLabel}活动结果连接回${context.title}？`;
    return `<article class="sixarts-process-stage" data-sixarts-stage="${escapeHtml(String(stage.title || "教学环节"))}" data-sixarts-art-key="${escapeHtml(String(art.key))}" data-sixarts-art-label="${escapeHtml(String(artLabel))}" data-sixarts-art-activity="${escapeHtml(String(artActivity))}" data-sixarts-penetration="${escapeHtml(String(penetration))}"><div class="stage-index"><b>${String(index + 1).padStart(2, "0")}</b><span>${escapeHtml(String(stage.title || "教学环节"))}</span></div><div class="stage-body"><header><h3 data-stage-time>${escapeHtml(String(stage.time || ""))}</h3><span><i data-lucide="${art.icon}"></i>${escapeHtml(String(artLabel))} · ${escapeHtml(String(artActivity))}</span></header><div class="stage-activity-grid"><section><b>教师活动</b><p contenteditable="true" spellcheck="false" data-stage-field="teacher">${escapeHtml(String(stage.teacher || ""))}</p></section><section><b>学生活动</b><p contenteditable="true" spellcheck="false" data-stage-field="student">${escapeHtml(String(stage.student || ""))}</p></section></div>${sourceRowsBlock}${stepsBlock}${intentionBlock}${evidenceBlock}<div class="stage-support"><span><b>材料</b><span contenteditable="true" spellcheck="false" data-stage-field="materials">${escapeHtml(String(materials))}</span></span><span><b>学生产出</b><span contenteditable="true" spellcheck="false" data-stage-field="expected_output">${escapeHtml(String(output))}</span></span><span><b>追问链</b><span contenteditable="true" spellcheck="false" data-stage-field="question_chain">${escapeHtml(String(questionChain))}</span></span></div>${penetrationBlock}</div></article>`;
  }).join("");
  if (assistantState.sixarts.detailLevel === "detailed") {
    $("#sixarts-process-output").innerHTML = renderSixArtsDetailedProcess(context, stages);
  } else {
    $("#sixarts-process-output").innerHTML = renderSixArtsConciseProcess(context, stages);
  }
  renderSixArtsBoard();
  renderSixArtsGenerationState();
  refreshIcons();
}

function getDefaultSixArtsEvaluationRows(context) {
  const title = String(context.title || "");
  if (/圆的认识/.test(title)) {
    return {
      说: { dimension: "数学表达", observable: "能用完整、准确的语言解释圆心、半径、直径及其关系。", evidence: "口头说理、同伴互评记录", target: "重点达成" },
      唱: { dimension: "韵律记忆", observable: "能用口诀或节奏准确复述画圆要点和核心特征。", evidence: "口诀诵读与课堂回应", target: "拓展关注" },
      弹: { dimension: "精细操作", observable: "能规范使用圆规、绳子等工具，保持定点和定长。", evidence: "画圆作品与操作观察", target: "重点达成" },
      舞: { dimension: "具身感知", observable: "能用动作表现圆的旋转轨迹，并联系半径相等进行解释。", evidence: "动作展示与口头说明", target: "重点达成" },
      书: { dimension: "规范记录", observable: "能工整记录O、r、d及测量数据，完成自评表。", evidence: "任务单、特征记录表", target: "重点达成" },
      画: { dimension: "视觉建模", observable: "能用图示呈现圆心、半径、直径和“一中同长”的关系。", evidence: "圆的特征图示或作品", target: "重点达成" }
    };
  }
  if (/小马过河/.test(title)) {
    return {
      说: { dimension: "朗读表达", observable: "能根据提示语分角色朗读，清楚表达人物观点和心情。", evidence: "角色朗读、故事讲述", target: "重点达成" },
      唱: { dimension: "韵律识字", observable: "能借助顺口溜和节奏准确认读重点生字。", evidence: "识字游戏与词语朗读", target: "拓展关注" },
      弹: { dimension: "沉浸阅读", observable: "能在背景音乐和安静阅读中保持专注，完成自然段标注。", evidence: "初读标注与阅读观察", target: "拓展关注" },
      舞: { dimension: "角色表现", observable: "能用神态、动作表现小马为难和松鼠焦急的状态。", evidence: "情境表演与同伴反馈", target: "拓展关注" },
      书: { dimension: "规范书写", observable: "能按笔顺和占格要求写好愿、意、麦、伯等生字。", evidence: "生字练写与作品评价", target: "重点达成" },
      画: { dimension: "故事建模", observable: "能用流程图或四格画梳理故事起因、经过和结果。", evidence: "故事流程图或四格连环画", target: "重点达成" }
    };
  }
  return {};
}

function getDefaultSixArtsEvaluationBundle(context) {
  const title = String(context.title || "");
  const concise = assistantState.sixarts.detailLevel === "concise";
  if (/圆的认识/.test(title)) {
    return concise ? {
      teacherRows: [
        { key: "践行师德", dimension: "职业认同与专业信念", observable: "教态大方、语言专业，能以车轮情境和数学文化激发学生探究兴趣。" },
        { key: "学会教学", dimension: "学科与教学能力", observable: "概念、作图示范准确，六艺活动紧扣圆的特征与画圆方法。" },
        { key: "学会育人", dimension: "活动育人", observable: "有序组织圆规、折圆、测量与站圆活动，关注全体学生参与。" },
        { key: "学会发展", dimension: "文化与合作", observable: "自然融入墨子“一中同长”，有效组织合作说理并依据证据反思。" }
      ],
      selfAssessment: ["我能用规范数学语言说清圆的概念和画圆方法。", "我能准确操作圆规、折圆和测量并留下记录。", "我能用动作体会“一中同长”，并用图示或作品表达圆的美。"],
      reflectionPrompts: ["四项核心六艺是否都直接服务于圆的知识建构？", "学生能否依据操作和测量证据解释“一中同长”？", "下一课时需要重点改进哪一项教师行为？"],
      practice: ["基础：规范画指定半径的圆并标注O、r、d。", "巩固：绘制圆的知识思维导图。", "拓展：设计圆形对称纹样并说明其中的数学原理。"],
      homework: "完成圆的基础习题和规范作图；选择绘制知识思维导图或圆形对称纹样。",
      extension: "寻找车轮、井盖、风扇或瓶盖等圆形实例，用“一中同长”形成一份图文解释卡。"
    } : {
      teacherRows: [
        { key: "1.2", dimension: "职业认同", observable: "展现数学教师的专业自信，用语得体、教态大方并营造安全表达氛围。" },
        { key: "2.2", dimension: "专业信念", observable: "传递数学的生活价值与文化价值，激发学生探究欲。" },
        { key: "3.1", dimension: "专业学科", observable: "圆心、半径、直径及“一中同长”的讲解准确，无科学性错误。" },
        { key: "4.1", dimension: "主教学科", observable: "目标、环节和重难点清晰，追问与反馈能推动学生由操作走向推理。" },
        { key: "5.1 / 10.1", dimension: "课程整合与艺术素养", observable: "自然整合口诀、律动、绘画与信息技术，不让艺术活动脱离数学目标。" },
        { key: "6.1 / 6.2", dimension: "班级与发展指导", observable: "学具收放有序，具身活动兼顾认知发展与身心协调。" },
        { key: "7.2", dimension: "活动育人", observable: "折圆、测量和多元画圆使学生在亲身体验中建构概念。" },
        { key: "8.1 / 9.2", dimension: "文化与合作", observable: "融入“一中同长”文化，合理组织小组分工并及时介入指导。" }
      ],
      selfAssessment: ["我能用数学语言说出圆心、半径、直径及其关系。", "我能有节奏地朗读或创编圆规口诀。", "我能熟练使用圆规、绳子等工具画圆。", "我能用动作表现圆的旋转与半径等长。", "我能规范书写O、r、d并记录探究数据。", "我能规范画圆、准确标注并完成创意图案。"],
      reflectionPrompts: ["六艺活动中哪些产生了可观察的学生学习证据？", "学生是否真正从测量数据归纳出d=2r和“一中同长”？", "教师三学会指标中达成最好与最需改进的分别是什么？", "下节课需要重点关注哪些学生及哪一种操作困难？"],
      practice: ["基础：规范书写定义并完成圆心、半径、直径判断。", "巩固：绘制圆知识思维导图并标注数量关系。", "跨学科：设计圆形对称纹样，附上数学特征说明。"],
      homework: "完成基础练习、圆知识思维导图与规范作图，依据个人学习情况选择一项重点改进。",
      extension: "围绕生活中的圆开展微型调查，提交实物照片、结构标注、原理解释和个人反思。"
    };
  }
  if (/小马过河/.test(title)) {
    return concise ? {
      teacherRows: [
        { key: "1.2 / 2.2", dimension: "职业认同与专业信念", observable: "教态亲切、语言富有童趣，营造轻松安全的朗读与表达氛围。" },
        { key: "3.1 / 4.1", dimension: "学科与教学能力", observable: "识字、朗读和写字指导准确，环节清晰，六艺活动精准服务文本目标。" },
        { key: "6.1 / 7.2", dimension: "班级与活动育人", observable: "有序组织朗读、书写和体态活动，让学生在实践中理解故事冲突。" },
        { key: "8.1 / 9.2", dimension: "文化与合作", observable: "渗透勤劳与独立思考品质，有效组织同桌、小组合作表达。" }
      ],
      selfAssessment: ["我能大胆发言并读好不同角色的对话。", "我能用动作表现小马开心、为难和松鼠焦急的状态。", "我能规范标注段落并工整书写重点生字。"],
      reflectionPrompts: ["说、书、舞三项活动是否聚焦本课核心目标？", "学生能否结合文本解释小马为什么为难？", "下节课要重点改进哪一项朗读或写字指导？"],
      practice: ["分角色朗读课文并读出人物语气。", "规范书写重点生字。", "向家人完整讲述小马过河的故事。"],
      homework: "分角色朗读课文，规范书写重点生字，并向家人简要讲述故事。",
      extension: "用动作和语言重现一个关键场景，说明小马为什么会感到为难。"
    } : {
      teacherRows: [
        { key: "1.2", dimension: "职业认同", observable: "语言富有感染力、教态亲切自然，积极肯定学生表达。" },
        { key: "2.2", dimension: "专业信念", observable: "通过生动语言、配乐与故事冲突传递童话阅读价值。" },
        { key: "3.1", dimension: "专业学科", observable: "生字读音、字形、笔顺和朗读指导准确，无知识性错误。" },
        { key: "4.1", dimension: "主教学科", observable: "教学流程清晰，能用支架突破识字、朗读与文本理解难点。" },
        { key: "10.1", dimension: "艺术素养", observable: "音乐、歌谣、动作与绘画自然融入语文学习。" },
        { key: "6.1 / 6.2", dimension: "班级与发展指导", observable: "朗读、书写和表演组织有序，关注低段学生身心特点。" },
        { key: "7.2", dimension: "活动育人", observable: "通过角色朗读、识字游戏和体态体验促进学生主动建构。" },
        { key: "8.1 / 9.2", dimension: "文化与合作", observable: "渗透勤劳、懂事、独立思考品质并有效组织合作学习。" }
      ],
      selfAssessment: ["我能完整表达遇到困难时的做法。", "我能分角色读出小马、老马、老牛和松鼠的语气。", "我能跟读识字童谣并准确认读重点字。", "我能用动作表现人物的心情。", "我能规范标注自然段并写好重点生字。", "我能用流程图或四格画梳理故事。"],
      reflectionPrompts: ["哪些六艺活动真正改善了识字、朗读或文本理解？", "学生是否能依据词句说明人物观点和小马的心理？", "教师三学会指标中达成最好与最需改进的是什么？", "下一课时需要重点关注哪些学生及哪类表达困难？"],
      practice: ["认读“棚、驮、磨、坊”等词语。", "完成故事梗概填空并分角色朗读。", "规范练写“愿、意、麦、伯”。"],
      homework: "朗读课文三遍，读好角色语言；规范练写重点生字；选择讲故事或绘制四格画。",
      extension: "制作《小马过河》角色观点卡，记录老牛、松鼠和小马的说法、依据与自己的判断。"
    };
  }
  return { teacherRows: [], selfAssessment: [], reflectionPrompts: [], practice: [], homework: "整理本课关键词或核心结论，并用重点六艺完成一份可展示作品。", extension: "面向真实受众形成可展示成果，保留过程记录、作品与学生反思作为学习证据。" };
}

function renderSixArtsRubric() {
  const context = ensureSixArtsSourceContent(assistantState.sixarts.form || getSixArtsFormData());
  const evaluationDefaults = getDefaultSixArtsEvaluationBundle(context);
  const sourceDefaults = getDefaultSixArtsEvaluationRows(context);
  const generatedRows = Array.isArray(assistantState.sixarts.evaluationDraft) ? assistantState.sixarts.evaluationDraft : [];
  const rubricDimensions = sixArtsDimensions;
  const rows = rubricDimensions.map((item) => generatedRows.find((row) => row.key === item.key) || sourceDefaults[item.key] || {
    key: item.key,
    dimension: item.ability,
    observable: item.evidence,
    evidence: `${item.activity}的过程记录或作品`,
    target: assistantState.sixarts.selectedArts.includes(item.key) ? "重点达成" : "拓展关注"
  });
  $("#sixarts-rubric-body").innerHTML = rows.map((row) => {
    const item = sixArtsDimensions.find((candidate) => candidate.key === row.key) || sixArtsDimensions[0];
    return `<tr data-rubric-art="${escapeHtml(String(item.key))}" class="${assistantState.sixarts.selectedArts.includes(item.key) ? "selected" : ""}"><td><span class="rubric-art"><i data-lucide="${item.icon}"></i><b>${item.key}</b></span></td><td>${escapeHtml(String(row.dimension || item.ability))}</td><td>${escapeHtml(String(row.observable || item.evidence))}</td><td>${escapeHtml(String(row.evidence || `${item.activity}的过程记录或作品`))}</td><td><span class="rubric-target">${escapeHtml(String(row.target || "达成课堂目标"))}</span><select data-sixarts-score="${item.key}" aria-label="${item.key}维度目标"><option value="1">1 · 初步体验</option><option value="2">2 · 能够参与</option><option value="3">3 · 基本达成</option><option value="4">4 · 熟练表达</option><option value="5">5 · 创造迁移</option></select></td></tr>`;
  }).join("");
  $$('[data-sixarts-score]').forEach((select) => select.value = String(assistantState.sixarts.scores[select.dataset.sixartsScore] || 3));
  const referencePanel = $("#sixarts-reference-list");
  const references = Array.isArray(assistantState.sixarts.referenceDraft) ? assistantState.sixarts.referenceDraft : [];
  if (referencePanel) {
    referencePanel.innerHTML = references.length
      ? `<details><summary><i data-lucide="book-marked"></i>本次生成依据（${references.length}）</summary><ul>${references.map((reference) => {
          const location = [reference.edition, reference.grade, reference.term, reference.pdf_page ? `PDF 第 ${reference.pdf_page} 页` : ""].filter(Boolean).join(" · ");
          const meta = [reference.type || reference.source_type || "依据资料", location].filter(Boolean).join(" · ");
          return `<li><b>${escapeHtml(String(reference.title || reference.source_title || "未命名资料"))}</b><small>${escapeHtml(meta)}</small></li>`;
        }).join("")}</ul></details>`
      : "";
  }
  const detailsPanel = $("#sixarts-evaluation-details");
  const homework = assistantState.sixarts.homeworkDraft || evaluationDefaults.homework;
  const extension = assistantState.sixarts.extensionDraft || evaluationDefaults.extension;
  if (detailsPanel) {
    const designData = getSixArtsDesignDocument(context, getSelectedSixArts());
    detailsPanel.className = "sixarts-evaluation-details is-detailed-evaluation";
    detailsPanel.innerHTML = renderSixArtsDetailedEvaluation(context, rows, evaluationDefaults, designData);
    $$('[data-sixarts-score]').forEach((select) => select.value = String(assistantState.sixarts.scores[select.dataset.sixartsScore] || 3));
  }
  const pbl = $("#sixarts-pbl");
  if (pbl) {
    const context = assistantState.sixarts.form || getSixArtsFormData();
    const title = context.title || "本课";
    const arts = getSelectedSixArts().map((item) => item.key).join("、") || "六艺";
    const headingCopy = pbl.querySelector(":scope > div:first-child > span");
    const cards = pbl.querySelectorAll(".sixarts-pbl-grid article p");
    if (headingCopy) headingCopy.textContent = `围绕“${title}”用${arts}形成可展示、可核查的真实成果。`;
    if (cards[0]) cards[0].textContent = homework;
    if (cards[1]) cards[1].textContent = extension;
    if (cards[2]) cards[2].textContent = `提交“${title}”相关的最终作品、过程记录与学习反思。`;
  }
  renderSixArtsGenerationState();
  refreshIcons();
}

function renderSixArtsResources() {
  const active = assistantState.sixarts.activeResource;
  $("#sixarts-resource-filter").innerHTML = ["全部", ...sixArtsDimensions.map((item) => item.key)].map((key) => `<button type="button" data-sixarts-resource="${key}" class="${key === active ? "active" : ""}">${key}</button>`).join("");
  const query = String(assistantState.sixarts.resourceQuery || "").toLowerCase();
  const dimensions = active === "全部" ? sixArtsDimensions : sixArtsDimensions.filter((item) => item.key === active);
  const resourceLinks = getSixArtsLinksForFilter(active);
  const records = dimensions.flatMap((item, dimensionIndex) => {
    const primaryLinkIndex = active === "全部" ? dimensionIndex : 0;
    const primary = { ...item, resourceTitle: item.title, resourceSummary: item.summary, resourceImage: item.image, link: resourceLinks[primaryLinkIndex] || item.link || sixArtsOfficialLink };
    if (active === "全部") return [primary];
    return [primary, ...(item.resourceCards || []).map((card, cardIndex) => ({
      ...item,
      ...card,
      resourceTitle: card.title,
      resourceSummary: card.summary,
      resourceImage: card.image || item.image,
      link: resourceLinks[cardIndex + 1] || item.link || sixArtsOfficialLink
    }))];
  }).filter((item) => !query || `${item.key} ${item.resourceTitle} ${item.resourceSummary} ${item.activity} ${item.ability}`.toLowerCase().includes(query));
  $("#sixarts-resource-grid").innerHTML = records.length ? records.map((item) => `<article class="sixarts-resource-card"><div class="sixarts-resource-image"><img src="./assets/sixarts/${item.resourceImage || item.image}" alt="六艺${escapeHtml(item.key)}类活动" /><span><i data-lucide="${item.icon}"></i>${escapeHtml(item.key)}</span></div><div><p>${escapeHtml(item.ability)}</p><h3>${escapeHtml(item.resourceTitle)}</h3><span>${escapeHtml(item.resourceSummary)}</span><dl><dt>课堂形式</dt><dd>${escapeHtml(item.activity)}</dd><dt>学习证据</dt><dd>${escapeHtml(item.evidence)}</dd></dl><a href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer">查看真实活动案例 <i data-lucide="arrow-up-right"></i></a></div></article>`).join("") : `<div class="sixarts-resource-empty"><i data-lucide="search-x"></i><h3>没有找到匹配资源</h3><p>请换一个关键词或清除顶部搜索条件。</p></div>`;
  refreshIcons();
}

function buildSixArtsPlanText() {
  captureSixArtsDesignDraft();
  captureSixArtsProcessDraft();
  const context = ensureSixArtsSourceContent(assistantState.sixarts.form || getSixArtsFormData());
  if (assistantState.sixarts.detailLevel === "detailed") return buildSixArtsDetailedPlanMarkdown(context);
  const evaluationDefaults = getDefaultSixArtsEvaluationBundle(context);
  const arts = getSelectedSixArts();
  const modules = assistantState.sixarts.designDraft?.length
    ? assistantState.sixarts.designDraft
    : getDefaultSixArtsModules(context, arts).map(([title, content]) => ({ title, content }));
  const competencies = getSixArtsCompetencyGoals(context);
  const stages = assistantState.sixarts.processDraft?.length ? assistantState.sixarts.processDraft : getDefaultSixArtsStages(context);
  const visibleDesignText = $("#sixarts-design-output")?.innerText.trim();
  const moduleText = visibleDesignText
    ? `## 教学设计正文\n${visibleDesignText}`
    : modules.map((item) => `## ${item.title}\n${item.content}`).join("\n\n");
  const competencyTable = `| 六艺维度 | 具体表现 |\n| --- | --- |\n${competencies.map((item) => `| ${item.key} | ${item.text.replace(/\|/g, "｜")} |`).join("\n")}`;
  const processText = stages.map((stage, index) => `### ${index + 1}. ${stage.title}（${stage.time}）\n- 教师活动：${stage.teacher}\n- 学生活动：${stage.student}${stage.penetration ? `\n- 学生六艺渗透：${stage.penetration}` : ""}${stage.steps?.length ? `\n- 教学步骤：\n${stage.steps.map((step) => `  - ${step}`).join("\n")}` : ""}${stage.intention ? `\n- 设计意图：${stage.intention}` : ""}${stage.evidence ? `\n- 学习证据：${stage.evidence}` : ""}${stage.teacher_indicator ? `\n- 教师指标：${stage.teacher_indicator}` : ""}${stage.materials ? `\n- 材料：${stage.materials}` : ""}${stage.expected_output ? `\n- 学生产出：${stage.expected_output}` : ""}${stage.question_chain ? `\n- 追问链：${stage.question_chain}` : ""}`).join("\n\n");
  const evaluationText = buildSixArtsEvaluationMarkdown(context);
  const practice = Array.isArray(assistantState.sixarts.practiceDraft) && assistantState.sixarts.practiceDraft.length ? assistantState.sixarts.practiceDraft : evaluationDefaults.practice;
  const practiceText = practice.length ? `\n\n## 课堂练习与课后巩固\n${practice.map((item) => `- ${typeof item === "string" ? item : JSON.stringify(item)}`).join("\n")}` : "";
  const references = (assistantState.sixarts.referenceDraft || []).map((item) => `- ${item.title || item.source_title || "未命名资料"}（${item.type || item.source_type || "依据资料"}）`).join("\n");
  const homework = assistantState.sixarts.homeworkDraft || evaluationDefaults.homework;
  const extension = assistantState.sixarts.extensionDraft || evaluationDefaults.extension;
  return `# ${context.title}六艺融合教学设计\n\n版本：${assistantState.sixarts.detailLevel === "detailed" ? "详案版" : "简案版"}\n学段年级：${context.stage} ${context.grade}\n学科教材：${context.subject} · ${context.edition}\n课时安排：${context.lessons} 课时 / ${context.duration} 分钟\n重点融合：${arts.map((item) => item.key).join("、")}\n生成方式：${assistantState.sixarts.mode === "steps" ? "分阶段生成并经教师修改" : "一键生成完整教案"}\n\n## 教学内容\n${context.summary}\n\n## 核心要求\n${context.requirement}\n\n${moduleText}\n\n## 六艺素养目标（指向学生）\n${competencyTable}\n\n## 教学过程\n${processText}\n\n${evaluationText}${practiceText}\n\n## 课后项目式拓展\n课后任务：${homework}\n\n项目拓展：${extension}\n\n## 生成依据\n${references || "- 新六艺内置参考模板"}`;
}

function advanceSixArtsFromDesign() {
  captureSixArtsDesignDraft();
  if (assistantState.sixarts.mode === "steps") assistantState.sixarts.stageReady.process = true;
  renderSixArtsProcess();
  renderSixArtsGenerationState();
  scheduleWorkspaceSave();
  setWorkspaceSection("sixarts-process");
  toast(assistantState.sixarts.mode === "steps" ? "教学设计已保存，教学过程已生成。" : "已进入教学过程。")
}

function advanceSixArtsFromProcess() {
  captureSixArtsProcessDraft();
  if (assistantState.sixarts.mode === "steps") assistantState.sixarts.stageReady.evaluate = true;
  renderSixArtsRubric();
  renderSixArtsGenerationState();
  scheduleWorkspaceSave();
  setWorkspaceSection("sixarts-evaluate");
  toast(assistantState.sixarts.mode === "steps" ? "教学过程已保存，可以完成评价并下载 Word。" : "已进入评价与下载。")
}

async function downloadSixArtsWord() {
  const ready = assistantState.sixarts.mode === "complete" || assistantState.sixarts.stageReady?.evaluate;
  if (!ready) {
    toast("请完成教学设计和教学过程后再下载最终 Word 教案。")
    return;
  }
  if (!window.JSZip) {
    toast("Word 组件未加载，请刷新页面后重试。")
    return;
  }
  const content = buildSixArtsPlanText();
  let assets;
  try { assets = await collectSixArtsVisualAssets(); }
  catch (error) { toast(`图片导出失败：${error.message}。请重新获取图片后再试。`); return; }
  const context = assistantState.sixarts.form || getSixArtsFormData();
  const title = (context.title || "六艺融合教学设计").replace(/[\\/:*?"<>|《》]/g, "").slice(0, 30);
  const zip = new window.JSZip();
  const now = new Date().toISOString();
  const visuals = sixArtsDocxVisuals(zip, assets);
  zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="png" ContentType="image/png"/><Default Extension="jpg" ContentType="image/jpeg"/><Default Extension="webp" ContentType="image/webp"/><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>`);
  zip.folder("_rels").file(".rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>`);
  zip.folder("docProps").file("core.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${xmlEscape(title)}六艺融合教学设计</dc:title><dc:creator>EduLink</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created></cp:coreProperties>`);
  const word = zip.folder("word");
  word.file("document.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${sixArtsPlanDocxBody(content)}${visuals.body}${markdownToDocxBody(sixArtsVisualExportNotice())}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"/></w:sectPr></w:body></w:document>`);
  word.file("styles.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:rPr><w:rFonts w:ascii="Microsoft YaHei" w:eastAsia="Microsoft YaHei"/><w:sz w:val="24"/></w:rPr><w:pPr><w:spacing w:after="120" w:line="380" w:lineRule="auto"/></w:pPr></w:style><w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:pPr><w:jc w:val="center"/></w:pPr><w:rPr><w:b/><w:sz w:val="40"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:rPr><w:b/><w:color w:val="6749C8"/><w:sz w:val="30"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:rPr><w:b/><w:sz w:val="27"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading3"><w:name w:val="heading 3"/><w:basedOn w:val="Normal"/><w:rPr><w:b/><w:sz w:val="24"/></w:rPr></w:style></w:styles>`);
  word.folder("_rels").file("document.xml.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>${visuals.relationships}</Relationships>`);
  const blob = await zip.generateAsync({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${title}-六艺融合教学设计.docx`;
  link.click();
  URL.revokeObjectURL(url);
  toast("Word 教案已生成，包含完整核心素养目标与教学过程。")
}

function applyGeneratedSixArtsPlan(plan, { preserveVersionDrafts = false } = {}) {
  const previousVersionDrafts = preserveVersionDrafts
    ? { ...(assistantState.sixarts.versionDrafts || {}) }
    : {};
  const originalForm = assistantState.sixarts.form || getSixArtsFormData();
  const context = plan?.context || originalForm;
  const design = plan?.design || {};
  const process = plan?.process || {};
  const evaluation = plan?.evaluation || {};
  const normalizedForm = {
    ...originalForm,
    stage: context.stage || originalForm.stage,
    grade: context.grade || originalForm.grade,
    subject: context.subject || originalForm.subject,
    edition: context.edition || originalForm.edition,
    term: context.term ?? originalForm.term ?? "",
    title: context.title || originalForm.title,
    lessons: context.lessons || originalForm.lessons,
    duration: context.duration || originalForm.duration
  };
  applySixArtsFormData(normalizedForm);
  assistantState.sixarts.form = getSixArtsFormData();
  assistantState.sixarts.detailLevel = plan?.version === "concise" ? "concise" : "detailed";
  assistantState.sixarts.selectedArts = Array.isArray(context.arts) && context.arts.length
    ? context.arts.filter((key) => sixArtsDimensions.some((item) => item.key === key))
    : assistantState.sixarts.selectedArts;
  assistantState.sixarts.designSections = Array.isArray(design.sections) ? design.sections : [];
  assistantState.sixarts.designDraft = Array.isArray(design.modules)
    ? design.modules.map((item) => ({ title: item.title || "教学设计", content: item.content || "" }))
    : [];
  assistantState.sixarts.designFieldDraft = {};
  assistantState.sixarts.competencyDraft = Object.fromEntries(
    (Array.isArray(design.competencies) ? design.competencies : [])
      .filter((item) => item.key)
      .map((item) => [item.key, item.text || ""])
  );
  assistantState.sixarts.processDraft = Array.isArray(process.stages)
    ? process.stages.map((stage) => {
      const table = stage?.table && typeof stage.table === "object" ? stage.table : {};
      const columns = Array.isArray(table.columns) ? table.columns.map(String) : [];
      const valueAt = (row, aliases, index) => {
        if (Array.isArray(row)) return String(row[index] ?? "");
        for (const key of aliases) {
          if (row?.[key] !== undefined && row[key] !== null) return String(row[key]);
        }
        return columns[index] && row?.[columns[index]] !== undefined ? String(row[columns[index]]) : "";
      };
      const rows = (Array.isArray(table.rows) ? table.rows : []).map((row) => ({
        step: valueAt(row, ["教学步骤", "步骤", "step"], 0),
        teacher: valueAt(row, ["教师行为", "教师活动", "teacher"], 1),
        student: valueAt(row, ["学生活动", "学生行为", "student"], 2),
        arts: valueAt(row, ["学生六艺聚焦", "学生六艺渗透", "arts", "penetration"], 3),
        indicator: valueAt(row, ["教师行为对应三学会指标", "教师指标", "teacher_indicator", "indicator"], 4)
      }));
      return {
        ...stage,
        title: stage.heading || stage.title || "教学环节",
        time: stage.time || "5 分钟",
        rows: rows.length ? rows : (Array.isArray(stage.rows) ? stage.rows : [])
      };
    })
    : [];
  assistantState.sixarts.processEvaluationTables = process.evaluation_tables && typeof process.evaluation_tables === "object"
    ? process.evaluation_tables
    : {
      teacher_dimensions: Array.isArray(evaluation.teacher_dimensions) ? evaluation.teacher_dimensions : [],
      teacher_summary: evaluation.teacher_summary || null,
      student_rubric: evaluation.student_rubric || null
    };
  assistantState.sixarts.evaluationDraft = Array.isArray(evaluation.rows) ? evaluation.rows : [];
  assistantState.sixarts.teacherEvaluationDraft = Array.isArray(evaluation.teacher_rows) ? evaluation.teacher_rows : [];
  assistantState.sixarts.selfAssessmentDraft = Array.isArray(evaluation.self_assessment) ? evaluation.self_assessment : [];
  assistantState.sixarts.reflectionPromptsDraft = Array.isArray(evaluation.reflection_prompts) ? evaluation.reflection_prompts : [];
  assistantState.sixarts.practiceDraft = Array.isArray(evaluation.practice) ? evaluation.practice : [];
  assistantState.sixarts.referenceDraft = Array.isArray(plan?.references) ? [...plan.references] : [];
  if (plan?.warning) assistantState.sixarts.referenceDraft.unshift({ title: "生成边界提示", type: plan.warning });
  assistantState.sixarts.homeworkDraft = evaluation.homework || "";
  assistantState.sixarts.extensionDraft = evaluation.extension || "";
  assistantState.sixarts.fusionScore = Number(design.fusion_score) || 82;
  assistantState.sixarts.fusionBreakdown = Array.isArray(design.fusion_breakdown) ? design.fusion_breakdown : [];
  assistantState.sixarts.versionDrafts = previousVersionDrafts;
  assistantState.sixarts.evaluationResponses = {};
  assistantState.sixarts.generated = true;
  if (!preserveVersionDrafts) assistantState.sixarts.lessonVisuals = null;
  assistantState.sixarts.stageReady = assistantState.sixarts.mode === "steps"
    ? { design: true, process: false, evaluate: false }
    : { design: true, process: true, evaluate: true };
  renderSixArtsSelector();
  renderSixArtsDesign();
  renderSixArtsProcess();
  renderSixArtsRubric();
  saveSixArtsVersionDraft();
}

async function requestSixArtsLessonPlan(context, arts, detailLevel) {
  if (!EDULINK_RAG_CONFIG.baseUrl || !EDULINK_RAG_CONFIG.token) throw new Error("六艺教案 API 配置缺失");
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), EDULINK_RAG_CONFIG.timeoutMs);
  try {
    const response = await fetch(`${EDULINK_RAG_CONFIG.baseUrl}/api/sixarts/lesson-plan`, {
      method: "POST",
      mode: "cors",
      cache: "no-store",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${EDULINK_RAG_CONFIG.token}` },
      body: JSON.stringify({
        stage: context.stage,
        grade: context.grade,
        subject: context.subject,
        edition: context.edition,
        term: context.term || "",
        title: String(context.title || "未命名课题").slice(0, 120),
        lessons: Number(context.lessons) || 1,
        duration: Number(context.duration) || 40,
        summary: String(context.summary || "").slice(0, 5000),
        requirement: String(context.requirement || "").slice(0, 5000),
        student_analysis: String(context.studentAnalysis || "").slice(0, 5000),
        arts: arts.map((item) => item.key),
        detail_level: detailLevel
      }),
      signal: controller.signal
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(typeof data.detail === "string" ? data.detail : `教案生成请求失败（${response.status}）`);
      error.httpStatus = response.status;
      throw error;
    }
    if (!data.plan || typeof data.plan !== "object") throw new Error("教案接口没有返回结构化内容");
    return data;
  } finally {
    window.clearTimeout(timeout);
  }
}

async function generateSixArtsPlan() {
  if (assistantState.sixarts.pending) return;
  const selected = $$("#sixarts-selector input:checked").map((input) => input.value);
  if (!selected.length) {
    toast("请至少选择一项六艺融合维度。");
    return;
  }
  assistantState.sixarts.selectedArts = selected;
  assistantState.sixarts.form = getSixArtsFormData();
  assistantState.sixarts.mode = getSixArtsMode();
  assistantState.sixarts.detailLevel = getSixArtsDetailLevel();
  assistantState.sixarts.pending = true;
  const button = $("#sixarts-generate");
  if (button) {
    button.disabled = true;
    button.querySelector("span").textContent = "正在生成教案…";
  }
  try {
    const data = await requestSixArtsLessonPlan(assistantState.sixarts.form, getSelectedSixArts(), assistantState.sixarts.detailLevel);
    applyGeneratedSixArtsPlan(data.plan);
    scheduleWorkspaceSave();
    setWorkspaceSection("sixarts-design");
    toast(data.warning
      ? data.warning
      : (data.used_fallback ? "模型暂不可用，已依据教材与备课资料生成教案。" : `${assistantState.sixarts.detailLevel === "detailed" ? "详案版" : "简案版"}教案已生成。`));
  } catch (error) {
    console.warn("Six-arts lesson plan API failed.", error);
    const reason = error?.name === "AbortError"
      ? "请求超时"
      : (String(error?.message || "接口未连接").slice(0, 80) || "接口未连接");
    toast(`在线教案生成失败：${reason}。请确认后端服务后重试。`);
  } finally {
    assistantState.sixarts.pending = false;
    if (button) {
      button.disabled = false;
      button.querySelector("span").textContent = assistantState.sixarts.mode === "steps" ? "开始分阶段生成" : "生成教案";
    }
    syncSixArtsModeControls();
    scheduleWorkspaceSave();
  }
}

const localObservationHotwordLexicon = {
  teacher: ["追问", "为什么", "理由", "依据", "发现", "规律", "观察", "比较", "补充", "验证", "说一说", "想一想"],
  student: ["因为", "所以", "我觉得", "我发现", "不公平", "凑十", "规律", "答案", "为什么", "对", "不对"],
  other: ["课堂", "学习", "观察", "发现", "规律", "问题", "为什么", "因为", "所以", "回答", "练习"]
};

function buildLocalObservationHotwords(lines, speaker) {
  const selected = lines.filter((line) => line.speaker === speaker);
  const vocabulary = localObservationHotwordLexicon[speaker] || [];
  return vocabulary
    .map((word) => ({ word, count: selected.reduce((sum, line) => sum + (line.content.match(new RegExp(word, "g")) || []).length, 0) }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word, "zh-CN"))
    .slice(0, 10)
    .map((item, index) => ({ ...item, rank: index + 1 }));
}

function buildLocalObservationDimensions({ lines, questions, deep, studentQ, structures }) {
  const totalQuestions = Math.max(1, questions);
  const openRatio = structures.openQuestions / totalQuestions;
  const contextKeys = ["比赛", "游戏", "生活", "情境", "真实", "不公平", "问题"];
  const operationKeys = ["学具", "实物", "圆片", "操作", "移", "摆", "拼", "画", "算式", "符号"];
  const transferKeys = ["以后", "还能", "应用", "类似", "其他", "继续", "新问题", "解决"];
  const patternKeys = ["发现", "规律", "观察", "比较", "归纳", "总结", "猜想", "验证"];
  const hitCount = (keys) => lines.filter((line) => hasAny(line.content, keys)).length;
  const answerCount = Math.max(1, structures.individualAnswers + structures.collectiveAnswers);
  const simulatedOnly = lines.some((line) => line.speaker === "student" && line.simulated)
    && !lines.some((line) => line.speaker === "student" && !line.simulated);
  let answerScore = Math.min(20, 9 + Math.min(4, structures.waitEvidence * 2)
    + Math.min(5, structures.individualAnswers / answerCount * 6)
    - Math.min(4, structures.collectiveAnswers / answerCount * 4));
  if (simulatedOnly) answerScore = Math.min(15, answerScore);
  const dimensions = [
    ["情境与问题设计", Math.min(20, 10 + Math.min(7, hitCount(contextKeys) * 2) + Math.min(3, studentQ)), "看课堂是否用真实情境或认知冲突提出可探究问题。"],
    ["师生互动与思维引导", Math.min(20, 9 + openRatio * 7 + Math.min(4, deep * 0.8)), `开放性提问 ${structures.openQuestions} 次、高阶追问 ${deep} 次，并考察 IRF 反馈质量。`],
    ["操作体验与概念建构", Math.min(20, 9 + Math.min(8, hitCount(operationKeys) * 2) + Math.min(3, structures.collaboration)), "看操作、语言、图示和符号是否形成从具体到抽象的证据链。"],
    ["等待时间与应答覆盖", answerScore, simulatedOnly ? "当前学生话语来自试讲中的模拟回答，本项只评价应答设计完整度。" : "看开放问题后的思考时间以及个别应答与齐答的平衡。"],
    ["规律发现与迁移应用", Math.min(20, 9 + Math.min(6, hitCount(patternKeys) * 1.5) + Math.min(5, hitCount(transferKeys) * 2)), "看学生是否归纳不变结构，并在条件变化的新任务中验证方法。"]
  ];
  return dimensions.map(([dimension, score, reason]) => ({
    dimension,
    score: Math.max(1, Math.min(20, Math.round(score))),
    max_score: 20,
    reason
  }));
}

function buildLocalObservationAnalysis(text, selectedRules = getSelectedTheoryRules()) {
  const lines = tagLines(parseLines(text));
  const questions = countTags(lines, "teacher-question");
  const deep = countTags(lines, "deep-question");
  const answers = countTags(lines, "student-answer");
  const feedback = countTags(lines, "feedback");
  const studentQ = countTags(lines, "student-question");
  const structures = countDialogueStructures(lines);
  const theoryMatches = matchTheories(text, lines, selectedRules);
  const events = buildEvents(lines, theoryMatches);
  const chains = buildAnalysisChains(events, lines, theoryMatches);
  const score = scoreLesson({ questions, deep, answers, feedback, studentQ, theoryMatches, structures });

  return {
    lines,
    questions,
    deep,
    answers,
    feedback,
    studentQ,
    structures,
    theoryMatches,
    events,
    chains,
    score,
    hotwords: {
      teacher: buildLocalObservationHotwords(lines, "teacher"),
      student: buildLocalObservationHotwords(lines, "student"),
      other: buildLocalObservationHotwords(lines, "other")
    },
    dimensions: buildLocalObservationDimensions({ lines, questions, deep, studentQ, structures }),
    evidenceNotice: "当前为本地规则分析；热词与五维分数依据逐字稿中已标注的话轮计算，在线分析后将补充理论库与模型解释。"
  };
}

function analyzeTranscriptLocal({ silent = false } = {}) {
  const text = els.transcript.value.trim();
  if (!text) {
    renderObservationExtras(null);
    toast("请先粘贴课堂逐字稿，或点击“载入示例课堂”。");
    return null;
  }

  state.analysis = buildLocalObservationAnalysis(text, getTheoryRulesForSubject(els.subject?.value));

  renderAnalysis();
  renderObservationExtras(state.analysis);
  state.report = buildReport();
  els.report.value = state.report;
  syncReflectionSources();
  updateLessonContext();
  updateTranscriptCount();
  if (!state.restoring) saveWorkspace(true);
  if (!silent && !state.restoring) toast("分析完成，已生成课堂观察报告。");
  return state.analysis;
}

function mediaFileIdentity(file) {
  if (!file) return "";
  return [file.name || "", file.size || 0, file.lastModified || 0, file.type || ""].join("::");
}

function mediaPlayerFor(file = mediaState.file) {
  if (!file || mediaState.file !== file) return null;
  return mediaState.type === "video" ? $("#video-player") : $("#audio-player");
}

function formatDetectedDuration(seconds) {
  const value = Number(seconds);
  if (!Number.isFinite(value) || value <= 0) return "";
  const totalSeconds = Math.max(1, Math.round(value));
  const minutes = Math.floor(totalSeconds / 60);
  const restSeconds = totalSeconds % 60;
  if (!minutes) return `约 ${restSeconds} 秒`;
  if (!restSeconds) return `约 ${minutes} 分钟`;
  return `约 ${minutes} 分 ${restSeconds} 秒`;
}

function applyMediaMetadataField(field, value, identity = mediaState.metadataIdentity) {
  if (!identity || identity !== mediaState.metadataIdentity || mediaState.metadataTouched[field]) return false;
  const input = { title: els.lessonTitle, subject: els.subject, grade: els.grade, duration: els.duration }[field];
  const normalized = String(value || "").trim();
  if (!input || !normalized) return false;
  if (input.value.trim() !== normalized) input.value = normalized;
  mediaState.metadataAutoValues[field] = normalized;
  return true;
}

function waitForMediaMetadata(file, identity, timeoutMs = 8000) {
  const player = mediaPlayerFor(file);
  if (!player || Number.isFinite(player.duration) && player.duration > 0) return Promise.resolve();
  return new Promise((resolve) => {
    let timer = null;
    const finish = () => {
      if (timer) window.clearTimeout(timer);
      player.removeEventListener("loadedmetadata", finish);
      resolve();
    };
    if (mediaState.file !== file || mediaState.metadataIdentity !== identity) {
      resolve();
      return;
    }
    player.addEventListener("loadedmetadata", finish, { once: true });
    timer = window.setTimeout(finish, timeoutMs);
  });
}

async function syncMediaMetadata(file = mediaState.file, { waitForDuration = false } = {}) {
  const identity = mediaFileIdentity(file);
  if (!file || !identity || mediaState.file !== file || mediaState.metadataIdentity !== identity) return false;
  if (waitForDuration) await waitForMediaMetadata(file, identity);
  if (mediaState.file !== file || mediaState.metadataIdentity !== identity) return false;

  let changed = inferMetadataFromFilename(file.name, { media: true, mediaIdentity: identity });
  const player = mediaPlayerFor(file);
  const duration = Number(player?.duration);
  if (Number.isFinite(duration) && duration > 0) {
    mediaState.durationSeconds = duration;
    changed = applyMediaMetadataField("duration", formatDetectedDuration(duration), identity) || changed;
  }
  updateLessonContext();
  changed = refreshReportMetadata() || changed;
  if (changed) {
    scheduleWorkspaceSave();
    if (!state.restoring) saveWorkspace(true);
  }
  return changed;
}


function inferMetadataFromFilename(filename, { media = false, mediaIdentity = "" } = {}) {
  const baseName = String(filename || "")
    .replace(/\.(docx|txt|md|csv|pdf|mp3|wav|m4a|aac|flac|ogg|wma|amr|mp4|mov|avi|mkv|webm|mpeg|mpg)$/i, "")
    .replace(/[‌‍]/g, "")
    .trim();
  if (!baseName) return false;

  const gradeMatch = baseName.match(/([一二三四五六七八九1-9]年级)(上册|下册)?/);
  const quotedTitle = baseName.match(/[《〈](.{1,80}?)[》〉]/)?.[1]?.trim() || "";
  const strippedTitle = baseName
    .replace(/[《》〈〉]/g, " ")
    .replace(/(?:人教|统编|部编|苏教|北师大|浙教|教科|外研|沪教|华师大|青岛|冀教|西师|鄂教)版/g, " ")
    .replace(/(?:小学|初中|高中)?[一二三四五六七八九1-9]年级(?:上册|下册)?/g, " ")
    .replace(/(?:小学|初中|高中)?(?:语文|数学|英语|科学|道德与法治|美术|音乐|体育)/g, " ")
    .replace(/(?:教师)?(?:模拟)?试讲(?:录音转文字稿|转文字稿|录音|音频|视频)?/g, " ")
    .replace(/(?:课堂)?(?:录音转文字稿|转文字稿|录音|音频|视频|逐字稿|文字稿|实录)/g, " ")
    .replace(/完整|(?:未标注|已标注|标注)版|课堂观察|教学设计|教学片段|教案/g, " ")
    .replace(/^[\s._\-—（）()【】\[\]]+|[\s._\-—（）()【】\[\]]+$/g, "")
    .replace(/[\s._\-—]+/g, " ")
    .trim();
  const inferredTitle = media ? (quotedTitle || strippedTitle || baseName) : baseName;
  const inferredGrade = gradeMatch ? `${gradeMatch[1]}${gradeMatch[2] || ""}` : "";
  let inferredSubject = "";
  if (/数学|面积|周长|数与形|位置|加几|摆一摆|倒数|分数|小数|乘法|除法|几何/.test(baseName)) inferredSubject = "小学数学";
  else if (/语文|统编版|部编版|课文|古诗|寓言|阅读|写作|司马光|小蝌蚪找妈妈|乌鸦喝水/.test(baseName)) inferredSubject = "小学语文";
  else if (/人教版/.test(baseName)) inferredSubject = "小学数学";
  else if (/英语/.test(baseName)) inferredSubject = "小学英语";
  else if (/道德与法治/.test(baseName)) inferredSubject = "道德与法治";
  else if (/科学/.test(baseName)) inferredSubject = "小学科学";

  let changed = false;
  if (media) {
    const identity = mediaIdentity || mediaState.metadataIdentity;
    changed = applyMediaMetadataField("title", inferredTitle, identity) || changed;
    changed = applyMediaMetadataField("grade", inferredGrade, identity) || changed;
    changed = applyMediaMetadataField("subject", inferredSubject, identity) || changed;
  } else {
    if (inferredTitle) { els.lessonTitle.value = inferredTitle; changed = true; }
    if (inferredGrade) { els.grade.value = inferredGrade; changed = true; }
    if (inferredSubject) { els.subject.value = inferredSubject; changed = true; }
    $("#reflection-brief").value = "请结合本节课的真实感受，重点反思课堂证据中显示的优势、理论落地程度与下一步改进方向。";
  }
  updateLessonContext();
  return changed;
}

function eduLinkApiError(data, status, fallback = "请求失败") {
  const detail = Array.isArray(data?.detail)
    ? data.detail.map((item) => item?.msg || item?.message || String(item)).join("；")
    : data?.detail;
  const error = new Error(typeof detail === "string" && detail.trim() ? detail : `${fallback}（${status}）`);
  error.httpStatus = status;
  error.payload = data;
  return error;
}

async function eduLinkRequest(path, { method = "POST", json, formData, timeoutMs = EDULINK_RAG_CONFIG.timeoutMs, signal } = {}) {
  if (!EDULINK_RAG_CONFIG.baseUrl || !EDULINK_RAG_CONFIG.token) throw new Error("EduLink 后端地址或访问令牌未配置");
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  const onAbort = () => controller.abort();
  if (signal?.aborted) controller.abort();
  else if (signal) signal.addEventListener("abort", onAbort, { once: true });
  const headers = { Authorization: `Bearer ${EDULINK_RAG_CONFIG.token}` };
  const init = { method, mode: "cors", cache: "no-store", headers, signal: controller.signal };
  if (formData) {
    init.body = formData;
  } else if (json !== undefined && method !== "GET") {
    headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(json);
  }
  try {
    const response = await fetch(`${EDULINK_RAG_CONFIG.baseUrl}${path}`, init);
    const raw = await response.text();
    let data = {};
    try { data = raw ? JSON.parse(raw) : {}; } catch { data = { detail: raw }; }
    if (!response.ok) throw eduLinkApiError(data, response.status, "后端请求失败");
    return data;
  } finally {
    window.clearTimeout(timeout);
    if (signal) signal.removeEventListener("abort", onAbort);
  }
}

/* -------------------------------------------------------------------------
 * Theory practice and reflection adapters.
 * These adapters keep the existing local demo usable when the relay is down,
 * while preferring the evidence-backed API whenever it is configured.
 * ------------------------------------------------------------------------- */
function getTrainingClientId() {
  try {
    let value = localStorage.getItem(TRAINING_CLIENT_ID_KEY);
    if (!value) {
      value = (window.crypto && typeof window.crypto.randomUUID === "function")
        ? window.crypto.randomUUID()
        : `web-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(TRAINING_CLIENT_ID_KEY, value);
    }
    return value;
  } catch {
    return "";
  }
}

const SCENARIO_OPTION_FALLBACKS = Object.freeze([
  "只凭课堂形式是否新颖作出判断，不核对学生的学习证据",
  "统一增加练习数量，用完成速度替代理论适切性分析",
  "直接套用相邻理论的结论，忽略该理论的适用条件",
  "只看最终结果，不分析教师支持与学生反应之间的关系",
  "把课堂气氛是否活跃作为判断教学有效性的唯一标准",
  "沿用原有安排，不再根据学生的实际表现调整教学"
]);

function normalizeScenarioOptions(item, index = 0) {
  const rawOptions = Array.isArray(item?.options)
    ? item.options.map((value) => String(value || "").replace(/^\s*[A-DＡ-Ｄ]\s*[.．、:：)）]\s*/u, "").trim()).filter(Boolean)
    : [];
  if (!rawOptions.length) return { options: [], answer: 0 };
  let answer = scenarioAnswerIndex(item?.answer ?? item?.correct_answer ?? item?.correctAnswer, 0, rawOptions.length);
  let options = rawOptions.slice();
  if (options.length > 4) {
    const correct = options[answer];
    if (answer < 4) options = options.slice(0, 4);
    else {
      options = options.filter((_option, optionIndex) => optionIndex !== answer).slice(0, 3);
      options.push(correct);
      answer = 3;
    }
  }
  let fallbackOffset = Math.max(0, Number(index) || 0) % SCENARIO_OPTION_FALLBACKS.length;
  while (options.length < 4) {
    const candidate = SCENARIO_OPTION_FALLBACKS[fallbackOffset % SCENARIO_OPTION_FALLBACKS.length];
    fallbackOffset += 1;
    if (!options.includes(candidate)) options.push(candidate);
  }
  return { options, answer: Math.max(0, Math.min(3, answer)) };
}

function normalizeScenarioQuestion(item, index = 0) {
  const normalizedOptions = normalizeScenarioOptions(item, index);
  const options = normalizedOptions.options;
  const answer = normalizedOptions.answer;
  const stem = String(item?.stem || item?.context || "课堂情境判断");
  const question = String(item?.question || "");
  const genericQuestion = /^(?:以下哪项理论最能解释上述课堂情境|请选择最符合理论的判断|针对上述课堂做法，最符合该理论要求的判断是)[？?。.!！\s（()）]*$/u.test(question.trim());
  const rawDisplayStem = String(item?.display_stem || item?.displayStem || "").trim()
    || (!genericQuestion && question.trim() ? question.trim() : stem);
  const displayStem = sanitizeScenarioDisplayStem(stem, rawDisplayStem, question, index);
  return {
    ...item,
    question_id: String(item?.question_id || item?.id || `scenario-${index + 1}`),
    id: String(item?.id || item?.question_id || `scenario-${index + 1}`),
    theory_name: String(item?.theory_name || ""),
    stem,
    display_stem: displayStem,
    question: question || displayStem || "请选择最符合理论的判断。",
    options,
    answer,
    difficulty: String(item?.difficulty || "基础"),
    knowledge_excerpt: String(item?.knowledge_excerpt || item?.knowledgeExcerpt || item?.analysis?.knowledge || ""),
    analysis: {
      knowledge: String(item?.analysis?.knowledge || item?.analysis?.core || "请回到理论的核心概念与机制。"),
      evidence: String(item?.analysis?.evidence || item?.analysis?.distinction || "结合题干中的教师行为、学生证据和任务结果判断。"),
      distinction: String(item?.analysis?.distinction || "注意区分相邻理论的解释对象、适用条件和证据边界。")
    },
    sources: Array.isArray(item?.sources) ? item.sources : []
  };
}

function sanitizeScenarioDisplayStem(stem, display, question = "", index = 0) {
  let source = String(stem || display || "").replace(/\s+/g, " ").trim();
  let visible = String(display || "").replace(/\s+/g, " ").trim();
  const explanationMarkers = /(核心适用逻辑|通用应用范围|理论在课堂中的|理论主张|该理论认为|以下为绑定|适配备课|理论解读|相似理论对比)/u;
  const caseStart = /(?:一位教师|某教师|教师在|教师认为|班主任|某课堂|课堂中|执教《|某研究|研究团队|一项研究|研究显示|学生在课堂)/u;
  const requestCue = /(请判断|请分析|下列哪项|该观点属于|这一结论说明|主要违背哪)/u;
  const firstMeta = source.search(explanationMarkers);
  if (firstMeta >= 0) source = source.slice(0, firstMeta).trim();
  const requestAt = source.search(requestCue);
  let caseText = requestAt > 0 ? source.slice(0, requestAt).trim() : source;
  const caseMatch = caseText.match(caseStart);
  if (caseMatch) caseText = caseText.slice(caseMatch.index).trim();
  // An old cache may contain only theory prose or a single interrogative such
  // as “是否搭建了学习支架？”. Never render that prose as the question card.
  if (explanationMarkers.test(caseText) || caseText.length > 520) {
    caseText = caseText.split(/(?=核心适用逻辑|通用应用范围|理论解读)/u)[0].trim();
  }
  const hasObservableCase = caseText.length >= 18 && (caseStart.test(caseText) || /学生|教师|课堂|研究|数据|结论/u.test(caseText));
  let request = String(question || "").replace(/\s+/g, " ").trim() || visible;
  if (requestCue.test(request)) request = request.slice(request.search(requestCue)).trim();
  const danglingReference = /(?:上述|前述)(?:课堂|课堂做法|课堂行为|做法|案例|现象)|该课堂现象(?:是否|与|首先|主要|最需要)/u.test(request);
  if (!hasObservableCase && danglingReference) request = "";
  request = request
    .replace(/上述课堂做法|前述课堂做法/g, "题干中的教学做法")
    .replace(/上述课堂行为|前述课堂行为/g, "题干中的课堂行为")
    .replace(/上述课堂现象|前述课堂现象|该课堂现象/g, "题干中的课堂现象")
    .replace(/上述课堂|前述课堂/g, "题干中的课堂")
    .replace(/上述做法|前述做法/g, "题干中的做法")
    .replace(/上述案例|前述案例/g, "题干中的案例")
    .replace(/^针对题干中的(?:课堂|教学做法|课堂行为|做法|案例)[，,：:、 ]*/u, "")
    .trim();
  if (!request || request.length > 180 || /是否根据学生的已有经验搭建了适切的学习支架/u.test(request)) {
    const variants = [
      "这项教学安排最需要优先校准的是（ ）。",
      "若依据相关理论改进，教师下一步应当（ ）。",
      "对这一教学现象的专业判断，最恰当的是（ ）。",
      "该教学做法主要体现哪一理论要求（ ）。",
      "下列分析中，最符合题干事实的是（ ）。",
      "题干中的教师行为主要反映了（ ）。",
      "要改善学生的学习表现，教师应优先（ ）。",
      "该案例最能说明哪一教育原理？"
    ];
    request = variants[Math.max(0, Number(index) || 0) % variants.length];
  }
  request = request.replace(/[（(]\s*[）)]/g, "（ ）");
  const hasBlank = /（\s*）/.test(request);
  if (hasBlank) {
    const pieces = request.split(/（\s*）/);
    request = `${pieces.join("").replace(/[？?]+/g, "，").replace(/，+/g, "，").replace(/[。.!！?？；;，,\s]+$/u, "")}（ ）。`;
  } else {
    request = `${request.replace(/[？?]+/g, "，").replace(/，+/g, "，").replace(/[。.!！?？；;，,\s]+$/u, "")}？`;
  }
  if (hasObservableCase) {
    const cleanCase = caseText
      .replace(/[（(]\s*[）)]/g, "")
      .replace(/[？?]+/g, "。")
      .replace(/。{2,}/g, "。")
      .replace(/[。！？!?\s]+$/u, "");
    return `${cleanCase}。${request}`;
  }
  // If no case survived parsing, show a short standalone request rather than
  // a dangling anaphor or the catalogue's theory explanation.
  return request || "请结合题干事实作出判断。";
}

function scenarioAnswerIndex(value, fallback, optionCount) {
  const count = Math.max(0, Number(optionCount) || 0);
  let candidate = value;
  if (typeof candidate === "string") {
    const token = candidate.trim().toUpperCase();
    const letters = "ABCD";
    const fullWidthLetters = "ＡＢＣＤ";
    const letterIndex = letters.indexOf(token) >= 0
      ? letters.indexOf(token)
      : fullWidthLetters.indexOf(token) >= 0 ? fullWidthLetters.indexOf(token) : -1;
    candidate = letterIndex >= 0 ? letterIndex : Number(token);
  }
  if (!Number.isFinite(Number(candidate))) candidate = fallback;
  candidate = Number(candidate);
  // Older clients occasionally sent one-based option indices.
  if (count > 0 && candidate === count) candidate -= 1;
  const safeFallback = Number.isFinite(Number(fallback)) ? Number(fallback) : 0;
  return Math.max(0, Math.min(Math.max(0, count - 1), Number.isFinite(candidate) ? candidate : safeFallback));
}

function normalizeScenarioAnswerResult(item, optionIndex, result = {}) {
  const source = result && typeof result === "object" ? result : {};
  const optionCount = Array.isArray(item?.options) ? item.options.length : 0;
  const selectedAnswer = scenarioAnswerIndex(
    source.selected_answer ?? source.selectedAnswer ?? source.choice ?? optionIndex,
    optionIndex,
    optionCount
  );
  const correctAnswer = scenarioAnswerIndex(
    source.correct_answer ?? source.correctAnswer ?? source.answer ?? item?.answer,
    item?.answer ?? 0,
    optionCount
  );
  const hasCorrect = source.correct !== undefined && source.correct !== null;
  const correct = hasCorrect
    ? (typeof source.correct === "boolean" ? source.correct : /^(true|1|yes|correct|正确)$/i.test(String(source.correct).trim()))
    : selectedAnswer === correctAnswer;
  const analysis = source.analysis && typeof source.analysis === "object" ? source.analysis : {};
  return {
    ...source,
    question_id: String(source.question_id || item?.question_id || item?.id || ""),
    selected_answer: selectedAnswer,
    correct_answer: correctAnswer,
    correctAnswer,
    answer: correctAnswer,
    correct,
    analysis: {
      knowledge: String(analysis.knowledge || analysis.core || item?.analysis?.knowledge || "请回到理论的核心概念与机制。"),
      evidence: String(analysis.evidence || item?.analysis?.evidence || "结合题干中的教师行为、学生证据和任务结果判断。"),
      distinction: String(analysis.distinction || item?.analysis?.distinction || "注意区分相邻理论的解释对象、适用条件和证据边界。")
    },
    theory_name: String(source.theory_name || item?.theory_name || ""),
    options: Array.isArray(source.options) && source.options.length ? source.options : item?.options || [],
    sources: Array.isArray(source.sources) ? source.sources : (Array.isArray(item?.sources) ? item.sources : [])
  };
}

function invalidateScenarioRequests() {
  const theory = assistantState.theory;
  theory.scenarioRequestId = Number(theory.scenarioRequestId || 0) + 1;
  theory.scenarioAnswerRequestId = Number(theory.scenarioAnswerRequestId || 0) + 1;
  theory.scenarioLoading = false;
  theory.scenarioAnswering = false;
}

function resetScenarioRound({ clearItems = true, preserveStarted = false } = {}) {
  const theory = assistantState.theory;
  invalidateScenarioRequests();
  theory.scenarioIndex = 0;
  theory.scenarioScore = 0;
  theory.scenarioAnswered = false;
  theory.scenarioAnswerMap = {};
  if (!preserveStarted) theory.scenarioStarted = false;
  if (clearItems) {
    theory.scenarioItems = [];
    theory.scenarioSessionId = "";
    theory.scenarioRemote = false;
    theory.scenarioBlocked = false;
    theory.scenarioBlockReason = "";
  }
}

function setScenarioControlsDisabled(disabled) {
  $$('[data-scenario-mode], [data-scenario-theory-suggestion]').forEach((control) => { control.disabled = Boolean(disabled); });
  ["#scenario-theory-input-field", "#scenario-theory-clear", "#scenario-question-count", "#scenario-start", "#scenario-retry", "#scenario-next"].forEach((selector) => {
    const control = $(selector);
    if (control) control.disabled = Boolean(disabled);
  });
}

function scenarioItems() {
  if (assistantState.theory.scenarioBlocked) return [];
  if (!assistantState.theory.scenarioStarted) return [];
  const remote = assistantState.theory.scenarioItems;
  return Array.isArray(remote) && remote.length ? remote : getTheoryScenarioSetForMode();
}

function scenarioCurrentItem() {
  const items = scenarioItems();
  if (!items.length) return null;
  return items[Math.max(0, Math.min(Number(assistantState.theory.scenarioIndex) || 0, items.length - 1))];
}

function normalizeScenarioHistorySession(item, index = 0) {
  const source = item && typeof item === "object" ? item : {};
  const sessionId = String(source.session_id || source.id || `history-${index + 1}`);
  const answerMap = source.answer_map && typeof source.answer_map === "object" ? source.answer_map : {};
  const attempts = Array.isArray(source.attempts) ? source.attempts.filter((attempt) => attempt && typeof attempt === "object") : [];
  const questions = (Array.isArray(source.questions) ? source.questions : []).map((question, questionIndex) => {
    const normalized = normalizeScenarioQuestion(question, questionIndex);
    const questionId = normalized.question_id;
    const attempt = question.answer_record
      || answerMap[questionId]
      || attempts.find((record) => String(record.question_id || "") === questionId)
      || ((question.selected_answer ?? question.selectedAnswer) !== undefined ? question : null);
    return {
      ...normalized,
      answer_record: attempt
        ? normalizeScenarioAnswerResult(normalized, attempt.selected_answer ?? attempt.selectedAnswer ?? normalized.answer, attempt)
        : null
    };
  });
  const completedFromQuestions = questions.filter((question) => question.answer_record).length;
  const completed = Math.max(0, Number(source.completed_count ?? source.answered_count ?? completedFromQuestions ?? source.total) || 0);
  const score = Math.max(0, Number(source.score ?? source.correct ?? questions.filter((question) => question.answer_record?.correct).length) || 0);
  const questionCount = Math.max(questions.length, Number(source.question_count ?? source.total_questions ?? source.total ?? completed) || 0);
  const accuracyValue = source.accuracy !== undefined && source.accuracy !== null
    ? String(source.accuracy).replace(/%%+$/u, "%")
    : `${Math.round(score / Math.max(1, completed) * 100)}%`;
  return {
    ...source,
    session_id: sessionId,
    mode: source.mode === "random" ? "random" : "specialized",
    theory_name: String(source.theory_name || ""),
    questions,
    question_count: questionCount,
    completed_count: completed,
    score,
    accuracy: /%$/u.test(accuracyValue) ? accuracyValue : `${accuracyValue}%`,
    current_index: Math.max(0, Number(source.current_index ?? source.next_question_index) || 0),
    finished_at: String(source.finished_at || source.last_answered_at || source.updated_at || source.created_at || "")
  };
}

function mergeScenarioHistorySessions(incoming = [], existing = assistantState.theory.scenarioHistory || []) {
  const merged = new Map();
  [...existing, ...incoming].forEach((entry, index) => {
    const normalized = normalizeScenarioHistorySession(entry, index);
    const previous = merged.get(normalized.session_id);
    if (!previous) {
      merged.set(normalized.session_id, normalized);
      return;
    }
    const preferredQuestions = normalized.questions.length >= previous.questions.length ? normalized.questions : previous.questions;
    merged.set(normalized.session_id, normalizeScenarioHistorySession({
      ...previous,
      ...normalized,
      questions: preferredQuestions,
      current_index: normalized.current_index || previous.current_index || 0,
      resumable: Boolean(normalized.resumable || previous.resumable)
    }, index));
  });
  return [...merged.values()]
    .sort((left, right) => String(right.finished_at || "").localeCompare(String(left.finished_at || "")))
    .slice(0, 20);
}

function upsertCurrentScenarioHistory() {
  const theory = assistantState.theory;
  if (!theory.scenarioStarted || !Array.isArray(theory.scenarioItems) || !theory.scenarioItems.length) return null;
  if (!theory.scenarioSessionId) theory.scenarioSessionId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const questions = theory.scenarioItems.map((question, index) => {
    const normalized = normalizeScenarioQuestion(question, index);
    return { ...normalized, answer_record: theory.scenarioAnswerMap?.[normalized.question_id] || null };
  });
  const completed = questions.filter((question) => question.answer_record).length;
  const score = questions.filter((question) => question.answer_record?.correct).length;
  const snapshot = normalizeScenarioHistorySession({
    session_id: theory.scenarioSessionId,
    mode: theory.scenarioMode,
    theory_name: theory.scenarioMode === "random" ? "" : theory.scenarioTheoryName,
    questions,
    question_count: questions.length,
    completed_count: completed,
    score,
    current_index: theory.scenarioIndex,
    accuracy: `${Math.round(score / Math.max(1, completed) * 100)}%`,
    updated_at: new Date().toISOString(),
    resumable: Boolean(theory.scenarioRemote)
  });
  theory.scenarioHistory = mergeScenarioHistorySessions([snapshot], theory.scenarioHistory);
  return snapshot;
}

function renderScenarioHistory(history = assistantState.theory.scenarioHistory || []) {
  const list = $("#scenario-history-list");
  const toggle = $("#scenario-history-toggle");
  if (!list || !toggle) return;
  const normalizedHistory = mergeScenarioHistorySessions([], history);
  assistantState.theory.scenarioHistory = normalizedHistory;
  const open = Boolean(assistantState.theory.scenarioHistoryOpen);
  toggle.setAttribute("aria-expanded", String(open));
  const toggleLabel = toggle.querySelector("span");
  if (toggleLabel) toggleLabel.textContent = open ? "收起历史" : "查看历史";
  list.hidden = !open;
  if (!open) return;
  if (!normalizedHistory.length) {
    list.innerHTML = '<div class="scenario-history-empty"><i data-lucide="archive"></i><span>完成一次训练后，可在这里查看题目并继续作答。</span></div>';
    refreshIcons();
    return;
  }
  list.innerHTML = `<small class="scenario-history-heading">最近训练记录</small>${normalizedHistory.slice(0, 8).map((item) => {
    const label = item.mode === "random" ? "随机训练" : (item.theory_name || "专项训练");
    const date = item.finished_at ? item.finished_at.slice(0, 16).replace("T", " ") : "刚刚更新";
    const progress = `${Math.min(item.completed_count, item.question_count || item.completed_count)} / ${item.question_count || item.completed_count} 题`;
    const questions = item.questions.length
      ? `<ol>${item.questions.map((question, questionIndex) => {
          const status = question.answer_record ? (question.answer_record.correct ? "正确" : "待复习") : "未作答";
          return `<li><button type="button" data-scenario-history-question="${questionIndex}" data-scenario-history-session="${escapeHtml(item.session_id)}"><span>${questionIndex + 1}</span><b>${escapeHtml(question.display_stem || question.question || question.stem)}</b><em class="${question.answer_record?.correct ? "is-correct" : question.answer_record ? "is-wrong" : ""}">${status}</em></button></li>`;
        }).join("")}</ol>`
      : '<p class="scenario-history-no-questions">这条旧记录暂无可展示的题目正文。</p>';
    return `<details class="scenario-history-session"><summary><span><b>${escapeHtml(label)}</b><small>${escapeHtml(date)} · ${progress}</small></span><em>${escapeHtml(item.accuracy)}</em><i data-lucide="chevron-down"></i></summary>${questions}<button class="scenario-history-continue" type="button" data-scenario-history-continue="${escapeHtml(item.session_id)}"><i data-lucide="play"></i>${item.completed_count < item.question_count ? "继续训练" : "查看本轮"}</button></details>`;
  }).join("")}`;
  refreshIcons();
}

async function loadTheoryTrainingHistory({ silent = true } = {}) {
  if (!EDULINK_RAG_CONFIG.baseUrl) {
    renderScenarioHistory();
    return assistantState.theory.scenarioHistory || [];
  }
  try {
    const params = new URLSearchParams({ limit: "30", client_id: getTrainingClientId() });
    const data = await eduLinkRequest(`/api/theory-training/history?${params.toString()}`, { method: "GET", timeoutMs: 30000 });
    const incoming = Array.isArray(data.sessions) && data.sessions.length
      ? data.sessions
      : (Array.isArray(data.history) ? data.history : (Array.isArray(data.items) ? data.items : []));
    assistantState.theory.scenarioHistory = mergeScenarioHistorySessions(incoming, assistantState.theory.scenarioHistory);
    renderScenarioHistory(assistantState.theory.scenarioHistory);
    return assistantState.theory.scenarioHistory;
  } catch (error) {
    if (!silent) toast(`训练历史暂不可用：${error.message || "请检查服务"}`);
    return [];
  }
}

function resumeScenarioHistorySession(sessionId, requestedIndex = null) {
  const history = assistantState.theory.scenarioHistory || [];
  const session = history.find((entry) => String(entry.session_id || entry.id || "") === String(sessionId || ""));
  const normalized = session ? normalizeScenarioHistorySession(session) : null;
  if (!normalized?.questions.length) {
    toast("这条旧记录暂无题目正文，请开始一轮新训练。");
    return false;
  }
  const theory = assistantState.theory;
  theory.scenarioMode = normalized.mode;
  theory.scenarioTheoryName = normalized.theory_name;
  theory.scenarioQuestionCount = normalized.questions.length;
  theory.scenarioSessionId = normalized.session_id;
  theory.scenarioItems = normalized.questions.map(({ answer_record: _answerRecord, ...question }) => normalizeScenarioQuestion(question));
  theory.scenarioAnswerMap = Object.fromEntries(normalized.questions
    .filter((question) => question.answer_record)
    .map((question) => [question.question_id, question.answer_record]));
  theory.scenarioScore = normalized.questions.filter((question) => question.answer_record?.correct).length;
  theory.scenarioAnsweredCount = Object.keys(theory.scenarioAnswerMap).length;
  const firstUnanswered = normalized.questions.findIndex((question) => !question.answer_record);
  theory.scenarioIndex = requestedIndex === null
    ? (firstUnanswered >= 0 ? firstUnanswered : Math.min(normalized.current_index, normalized.questions.length - 1))
    : Math.max(0, Math.min(normalized.questions.length - 1, Number(requestedIndex) || 0));
  theory.scenarioAnswered = Boolean(theory.scenarioAnswerMap[theory.scenarioItems[theory.scenarioIndex]?.question_id]);
  theory.scenarioStarted = true;
  theory.scenarioLoading = false;
  theory.scenarioAnswering = false;
  theory.scenarioBlocked = false;
  theory.scenarioRemote = Boolean(normalized.resumable);
  const profile = getTheoryProfileByName(normalized.theory_name);
  if (profile && normalized.mode === "specialized") theory.selectedId = profile.id;
  renderTheoryScenario();
  window.setTimeout(() => $("#scenario-options")?.closest(".scenario-card")?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" }), 40);
  scheduleWorkspaceSave();
  toast(firstUnanswered >= 0 && requestedIndex === null ? "已恢复到本轮首道未答题。" : "已打开历史训练题目。");
  return true;
}

function continueCurrentScenarioTraining() {
  const current = Array.isArray(assistantState.theory.scenarioItems) ? assistantState.theory.scenarioItems : [];
  if (!assistantState.theory.scenarioStarted || !current.length) {
    const latest = (assistantState.theory.scenarioHistory || []).find((session) => Array.isArray(session.questions) && session.questions.length);
    if (latest) return resumeScenarioHistorySession(latest.session_id);
    toast("暂无可继续的训练，请先点击“开始训练”。");
    return false;
  }
  const firstUnanswered = current.findIndex((question) => !assistantState.theory.scenarioAnswerMap?.[question.question_id]);
  if (firstUnanswered >= 0) assistantState.theory.scenarioIndex = firstUnanswered;
  renderTheoryScenario();
  window.setTimeout(() => $("#scenario-options")?.closest(".scenario-card")?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" }), 40);
  return true;
}

async function loadTheoryScenarioTraining({ refresh = false, silent = false } = {}) {
  const theory = assistantState.theory;
  // A section can be mounted more than once during the animated workspace
  // transition. Ignore duplicate loads while the current request is active.
  if (theory.scenarioLoading) return false;
  theory.scenarioStarted = true;
  const mode = theory.scenarioMode === "random" ? "random" : "specialized";
  const input = $("#scenario-theory-input-field");
  const theoryName = mode === "specialized" ? String(input?.value || theory.scenarioTheoryName || getSelectedLearningTheory()?.name || "").trim() : null;
  const count = Math.max(1, Math.min(20, Number($("#scenario-question-count")?.value || theory.scenarioQuestionCount) || 5));
  theory.scenarioTheoryName = theoryName || "";
  theory.scenarioQuestionCount = count;
  theory.scenarioIndex = 0;
  theory.scenarioScore = 0;
  theory.scenarioAnswered = false;
  theory.scenarioAnswering = false;
  theory.scenarioAnswerMap = {};
  theory.scenarioBlocked = false;
  theory.scenarioBlockReason = "";
  theory.scenarioAnswerRequestId = Number(theory.scenarioAnswerRequestId || 0) + 1;
  const requestId = Number(theory.scenarioRequestId || 0) + 1;
  theory.scenarioRequestId = requestId;
  if (!EDULINK_RAG_CONFIG.baseUrl || !EDULINK_RAG_CONFIG.token) {
    const localQuestions = buildLocalScenarioSet(mode, theoryName, count);
    theory.scenarioRemote = false;
    theory.scenarioItems = localQuestions;
    theory.scenarioSessionId = localQuestions.length ? `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` : "";
    theory.scenarioLoading = false;
    theory.scenarioBlocked = mode === "specialized" && Boolean(theoryName) && !localQuestions.length;
    theory.scenarioBlockReason = theory.scenarioBlocked
      ? `知识库中未找到“${theoryName}”，请从理论库选择已有理论。`
      : "";
    upsertCurrentScenarioHistory();
    renderTheoryScenario();
    if (!silent) toast(theory.scenarioBlocked
      ? theory.scenarioBlockReason
      : `当前未连接在线服务，已准备 ${localQuestions.length} 道本地训练题。`);
    return localQuestions.length === count;
  }
  theory.scenarioLoading = true;
  renderTheoryScenario();
  try {
    const data = await eduLinkRequest("/api/theory-training/questions", {
      json: {
        mode,
        theory_name: theoryName || null,
        count,
        refresh: Boolean(refresh),
        session_id: refresh ? null : (theory.scenarioSessionId || null),
        client_id: getTrainingClientId()
      },
      timeoutMs: Math.max(EDULINK_RAG_CONFIG.timeoutMs, 180000)
    });
    // The user may have changed mode/theory while the request was in flight.
    if (requestId !== Number(theory.scenarioRequestId || 0)) return false;
    const questions = Array.isArray(data.questions) ? data.questions.map(normalizeScenarioQuestion).filter((item) => item.options.length === 4).slice(0, count) : [];
    if (!questions.length) throw new Error("后端没有返回训练题目");
    if (questions.length !== count) throw new Error(`训练题数量不一致：请求 ${count} 道，后端返回 ${questions.length} 道`);
    theory.scenarioItems = questions;
    theory.scenarioSessionId = String(data.session_id || "");
    theory.scenarioTheoryName = String(data.theory_name || theoryName || "");
    theory.scenarioRemote = true;
    theory.scenarioLoading = false;
    upsertCurrentScenarioHistory();
    renderTheoryScenario();
    void loadTheoryTrainingHistory({ silent: true });
    if (!silent) toast(`${mode === "random" ? "随机" : "专项"}训练已准备 ${questions.length} 道题。`);
    scheduleWorkspaceSave();
    return true;
  } catch (error) {
    if (requestId !== Number(theory.scenarioRequestId || 0)) return false;
    console.warn("Theory training API failed.", error);
    theory.scenarioRemote = false;
    theory.scenarioItems = [];
    theory.scenarioSessionId = "";
    theory.scenarioLoading = false;
    // An explicitly requested theory must never silently fall back to a
    // generic question.  Generic local practice is useful only for transport
    // outages when the selected theory is known and evidence-backed.
    const unknownTheory = mode === "specialized" && Boolean(theoryName)
      && Number(error?.httpStatus || 0) === 422
      && /未找到理论|知识库中未找到|理论/.test(String(error?.message || ""));
    theory.scenarioBlocked = unknownTheory;
    theory.scenarioBlockReason = unknownTheory
      ? `知识库中未找到“${theoryName}”，请从理论库选择已有理论。`
      : "";
    if (!unknownTheory) {
      theory.scenarioItems = buildLocalScenarioSet(mode, theoryName, count);
      theory.scenarioSessionId = theory.scenarioItems.length ? `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` : "";
      upsertCurrentScenarioHistory();
    }
    renderTheoryScenario();
    if (!silent) toast(unknownTheory
      ? theory.scenarioBlockReason
      : `在线训练题暂不可用，已切换为 ${theory.scenarioItems.length} 道本地题目：${error.message || "接口未连接"}`);
    return !unknownTheory && theory.scenarioItems.length === count;
  }
}

function renderScenarioFeedback(item, optionIndex, result = {}) {
  const normalized = normalizeScenarioAnswerResult(item, optionIndex, result);
  const correctAnswer = normalized.correct_answer;
  const selectedAnswer = normalized.selected_answer;
  const correct = normalized.correct;
  const analysis = normalized.analysis || item.analysis || {};
  $$("#scenario-options button").forEach((button, index) => {
    button.disabled = true;
    button.classList.toggle("correct", index === correctAnswer);
    button.classList.toggle("wrong", index === selectedAnswer && !correct);
  });
  const feedback = $("#scenario-feedback");
  if (!feedback) return correct;
  feedback.hidden = false;
  feedback.className = `scenario-feedback ${correct ? "correct" : "wrong"}`;
  feedback.innerHTML = `<span><i data-lucide="${correct ? "circle-check" : "circle-x"}"></i></span><div class="scenario-feedback-content"><header><b>${correct ? "判断正确" : "判断有误"}</b><em>正确答案：${String.fromCharCode(65 + correctAnswer)} · ${escapeHtml(item.options[correctAnswer] || "")}</em></header><section><strong>核心知识点</strong><p>${escapeHtml(String(analysis.knowledge || ""))}</p></section><section><strong>情境精准对应</strong><p>${escapeHtml(String(analysis.evidence || ""))}</p></section><section><strong>易错辨析</strong><p>${escapeHtml(String(analysis.distinction || ""))}</p></section></div>`;
  const next = $("#scenario-next");
  if (next) next.disabled = false;
  refreshIcons();
  return correct;
}

async function answerTheoryScenario(optionIndex) {
  const theory = assistantState.theory;
  if (theory.scenarioAnswered || theory.scenarioLoading || theory.scenarioAnswering) return;
  const item = scenarioCurrentItem();
  if (!item) return;
  const questionId = String(item.question_id || item.id || "");
  const answerRequestId = Number(theory.scenarioAnswerRequestId || 0) + 1;
  theory.scenarioAnswerRequestId = answerRequestId;
  theory.scenarioAnswered = true;
  theory.scenarioAnswering = true;
  theory.scenarioAnsweredCount = Number(theory.scenarioAnsweredCount || 0) + 1;
  renderTheoryScenario();
  let result = null;
  if (theory.scenarioRemote && theory.scenarioSessionId && questionId) {
    try {
      result = await eduLinkRequest("/api/theory-training/answer", {
        json: { session_id: theory.scenarioSessionId, question_id: questionId, selected_answer: optionIndex, client_id: getTrainingClientId() },
        timeoutMs: Math.max(EDULINK_RAG_CONFIG.timeoutMs, 60000)
      });
    } catch (error) {
      console.warn("Theory training answer API failed.", error);
      toast(`在线判分失败，已使用本地判分：${error.message || "接口未连接"}`);
    }
  }
  if (answerRequestId !== Number(theory.scenarioAnswerRequestId || 0) || questionId !== String(scenarioCurrentItem()?.question_id || "")) return;
  const normalized = normalizeScenarioAnswerResult(item, optionIndex, result || {});
  theory.scenarioAnswerMap[questionId] = normalized;
  if (normalized.correct) theory.scenarioScore += 1;
  theory.scenarioAnswering = false;
  upsertCurrentScenarioHistory();
  renderTheoryScenario();
  renderTheoryOverview();
  if (theory.scenarioRemote) loadTheoryTrainingHistory({ silent: true });
  scheduleWorkspaceSave();
}



function reflectionDiagnosisPayload() {
  const base = reflectionState.diagnosisData && typeof reflectionState.diagnosisData === "object"
    ? reflectionState.diagnosisData
    : {};
  return {
    ...base,
    project_name: $("#reflection-project")?.value.trim() || base.project_name || "",
    lesson_name: $("#reflection-lesson")?.value.trim() || base.lesson_name || "",
    diagnoses: reflectionState.diagnoses,
    recommended_theories: reflectionState.recommendedTheories,
    selected_theories: reflectionState.selectedTheories
  };
}

function normalizeRemoteReflection(data = {}) {
  const diagnoses = Array.isArray(data.diagnoses) ? data.diagnoses.map((item, index) => ({
    ...item,
    id: String(item.id || `diagnosis-${index + 1}`),
    rank: Number(item.rank || index + 1),
    category: String(item.category || "课堂问题"),
    title: String(item.title || "待进一步确认的课堂问题"),
    interpretation: String(item.professional_judgment || item.theory_explanation || item.interpretation || ""),
    professional_judgment: String(item.professional_judgment || item.interpretation || ""),
    evidence: String(item.evidence || "原文未提供足够事实证据"),
    status: String(item.status || "证据待补"),
    theory: String(item.theory || ""),
    theory_explanation: String(item.theory_explanation || item.professional_judgment || ""),
    action: String(item.action || ""),
    talk: String(item.talk || ""),
    indicator: String(item.indicator || ""),
    priority: ["高", "中", "低"].includes(item.priority) ? item.priority : "中",
    confidence: Math.max(0, Math.min(100, Number(item.confidence || 0))),
    sources: Array.isArray(item.sources) ? item.sources : []
  })) : [];
  const recommended = Array.isArray(data.recommended_theories) ? data.recommended_theories.map((item, index) => ({
    ...item,
    name: String(item.name || `推荐理论 ${index + 1}`),
    group: String(item.group || "教育理论库"),
    score: Math.max(0, Math.min(100, Number(item.score || 0))),
    core: String(item.core || item.mechanism || ""),
    mechanism: String(item.mechanism || item.core || ""),
    action: String(item.action || ""),
    selected: Boolean(item.selected),
    sources: Array.isArray(item.sources) ? item.sources : []
  })) : [];
  const selected = (Array.isArray(data.selected_theories) ? data.selected_theories : []).map(String).filter(Boolean);
  return { ...data, diagnoses, recommended_theories: recommended, selected_theories: selected };
}

function applyRemoteReflectionDiagnosis(data) {
  const normalized = normalizeRemoteReflection(data);
  reflectionState.diagnosisData = normalized;
  reflectionState.diagnoses = normalized.diagnoses;
  reflectionState.recommendedTheories = normalized.recommended_theories;
  reflectionState.selectedTheoryProfiles = normalized.recommended_theories;
  reflectionState.selectedTheories = normalized.selected_theories.length
    ? normalized.selected_theories
    : normalized.recommended_theories.filter((item) => item.selected).slice(0, 4).map((item) => item.name);
  if (!reflectionState.selectedTheories.length) reflectionState.selectedTheories = normalized.diagnoses.map((item) => item.theory).filter(Boolean).slice(0, 4);
  reflectionState.activeTheory = reflectionState.selectedTheories[0] || reflectionState.recommendedTheories[0]?.name || "教学过程最优化理论";
  reflectionState.references = Array.isArray(normalized.references) ? normalized.references : [];
  reflectionState.usedModel = Boolean(normalized.used_model);
  reflectionState.warning = String(normalized.warning || "");
  reflectionState.actionsData = null;
  reflectionState.actionReady = false;
  const project = String(normalized.project_name || "").trim();
  const lesson = String(normalized.lesson_name || "").trim();
  if (project && $("#reflection-project") && !reflectionState.metadataProjectTouched) $("#reflection-project").value = project;
  if (lesson && $("#reflection-lesson") && !reflectionState.metadataLessonTouched) $("#reflection-lesson").value = lesson;
  if (project) reflectionState.lastAutoProject = project;
  if (lesson) reflectionState.lastAutoLesson = lesson;
}

function normalizeRemoteActions(data = {}) {
  const actions = Array.isArray(data.actions) ? data.actions.map((item, index) => ({
    ...item,
    id: String(item.id || `action-${index + 1}`),
    index: Number(item.index || index + 1),
    title: String(item.title || item.action || "下一轮教学调整").split(/[，。；]/)[0],
    issue: String(item.issue || "课堂问题"),
    theory: String(item.theory || ""),
    action: String(item.action || ""),
    talk: String(item.talk || ""),
    indicator: String(item.indicator || item.success_criteria || ""),
    success_criteria: String(item.success_criteria || item.indicator || ""),
    evidence_to_collect: String(item.evidence_to_collect || "记录学生话语、作品或互动数据。")
  })) : [];
  return { ...data, actions, next_round: data.next_round || {} };
}

async function requestReflectionMetadata({ silent = true } = {}) {
  const source = reflectionSourceText();
  if (!source || !EDULINK_RAG_CONFIG.baseUrl) return null;
  const requestId = Number(reflectionState.metadataRequestId || 0) + 1;
  reflectionState.metadataRequestId = requestId;
  try {
    const data = await eduLinkRequest("/api/teaching-reflection/metadata", {
      json: { source_text: source.slice(0, REFLECTION_MAX_TEXT_CHARS), filename: reflectionState.fileName || "" },
      timeoutMs: 30000
    });
    if (requestId !== reflectionState.metadataRequestId) return data;
    const projectInput = $("#reflection-project");
    const lessonInput = $("#reflection-lesson");
    if (data.project_name && projectInput && !reflectionState.metadataProjectTouched) projectInput.value = data.project_name;
    if (data.lesson_name && lessonInput && !reflectionState.metadataLessonTouched) lessonInput.value = data.lesson_name;
    reflectionState.lastAutoProject = String(data.project_name || "");
    reflectionState.lastAutoLesson = String(data.lesson_name || "");
    updateLessonContext();
    scheduleWorkspaceSave();
    return data;
  } catch (error) {
    if (!silent) toast(`项目与课例名称识别失败：${error.message || "请检查服务"}`);
    return null;
  }
}

async function requestReflectionActions({ silent = false } = {}) {
  if (!reflectionState.diagnosticReady) {
    const ready = await analyzeReflectionSource({ silent: true, navigate: false });
    if (!ready) return false;
  }
  const selected = reflectionState.selectedTheories.filter(Boolean).slice(0, 10);
  if (!selected.length) {
    toast("请至少选择一项理论后再生成改进行动。");
    return false;
  }
  if (!EDULINK_RAG_CONFIG.baseUrl || !EDULINK_RAG_CONFIG.token) {
    renderReflectionActions();
    if (!silent) toast("在线服务未配置，已保留本地改进行动。");
    return true;
  }
  if (reflectionState.pending.actions) return false;
  const requestId = Number(reflectionState.actionsRequestId || 0) + 1;
  reflectionState.actionsRequestId = requestId;
  if (typeof reflectionState.actionsController?.abort === "function") reflectionState.actionsController.abort();
  const controller = new AbortController();
  reflectionState.actionsController = controller;
  reflectionState.pending.actions = true;
  try {
    const data = await eduLinkRequest("/api/teaching-reflection/actions", {
      json: { source_text: reflectionSourceText().slice(0, REFLECTION_MAX_TEXT_CHARS), diagnosis: reflectionDiagnosisPayload(), selected_theories: selected, use_model: true },
      timeoutMs: Math.max(EDULINK_RAG_CONFIG.timeoutMs, 120000),
      signal: controller.signal
    });
    if (controller.signal.aborted || requestId !== reflectionState.actionsRequestId) return false;
    reflectionState.actionsData = normalizeRemoteActions(data);
    reflectionState.actions = reflectionState.actionsData.actions;
    reflectionState.actionReady = reflectionState.actions.length > 0;
    reflectionState.warning = String(data.warning || "");
    renderReflectionActions();
    renderReflectionOverview();
    renderGrowthProfile();
    scheduleWorkspaceSave();
    if (!silent) toast(data.warning || (data.used_model ? "已依据理论组合生成改进行动。" : "已生成证据化改进行动。"));
    return true;
  } catch (error) {
    console.warn("Reflection actions API failed.", error);
    if (error?.name === "AbortError" || requestId !== reflectionState.actionsRequestId) return false;
    reflectionState.pending.actions = false;
    reflectionState.actionsData = null;
    renderReflectionActions();
    if (!silent) toast(`在线行动生成失败，已使用本地策略：${error.message || "接口未连接"}`);
    return false;
  } finally {
    if (reflectionState.actionsRequestId === requestId) {
      reflectionState.pending.actions = false;
      reflectionState.actionsController = null;
    }
  }
}

async function requestReflectionProfile({ silent = true } = {}) {
  if (!reflectionState.diagnosticReady || !EDULINK_RAG_CONFIG.baseUrl) return null;
  if (reflectionState.pending.profile) return null;
  const requestId = Number(reflectionState.profileRequestId || 0) + 1;
  reflectionState.profileRequestId = requestId;
  if (typeof reflectionState.profileController?.abort === "function") reflectionState.profileController.abort();
  const controller = new AbortController();
  reflectionState.profileController = controller;
  reflectionState.pending.profile = true;
  try {
    const data = await eduLinkRequest("/api/teaching-reflection/profile", {
      json: { diagnosis: reflectionDiagnosisPayload(), actions_data: reflectionState.actionsData || { actions: reflectionState.actions }, rounds: reflectionState.rounds, outcome_content: state.reflection || els.reflection?.value || "" },
      timeoutMs: 30000,
      signal: controller.signal
    });
    if (controller.signal.aborted || requestId !== reflectionState.profileRequestId) return null;
    reflectionState.profileData = data;
    reflectionState.growthProfile = data;
    renderGrowthProfile();
    scheduleWorkspaceSave();
    return data;
  } catch (error) {
    if (error?.name === "AbortError" || requestId !== reflectionState.profileRequestId) return null;
    if (!silent) toast(`成长画像暂不可用：${error.message || "请检查服务"}`);
    return null;
  } finally {
    if (reflectionState.profileRequestId === requestId) {
      reflectionState.pending.profile = false;
      reflectionState.profileController = null;
    }
  }
}


function setObservationSource(source, { invalidate = true } = {}) {
  state.observationSource = source || "none";
  if (invalidate && typeof invalidateReflectionForObservationChange === "function") invalidateReflectionForObservationChange();
}

function hasCurrentUserObservationAnalysis() {
  const text = els.transcript?.value.trim() || "";
  return Boolean(text && state.analysis && state.observationSource === "user" && state.observationAnalyzedTranscript === text);
}

function currentReflectionObservationTranscript() {
  return $("#reflection-use-observation")?.checked && hasCurrentUserObservationAnalysis() ? els.transcript.value.trim() : "";
}

function invalidateReflectionForObservationChange() {
  if (!reflectionState?.diagnosticReady) return;
  const desired = currentReflectionObservationTranscript();
  if (String(reflectionState.diagnosedObservationTranscript || "") !== desired) {
    resetReflectionAnalysisState({ clearOutcome: true });
    renderReflectionWorkspace();
  }
}

function observationMetadata() {
  return {
    title: els.lessonTitle?.value.trim() || "",
    subject: els.subject?.value.trim() || "",
    grade: els.grade?.value.trim() || "",
    duration: els.duration?.value.trim() || "",
    teacher: els.teacherName?.value.trim() || "",
    analysis_date: els.analysisDate?.value || new Date().toISOString().slice(0, 10),
    transcript: (els.transcript?.value.trim() || "").slice(0, OBSERVATION_MAX_TEXT_CHARS),
    theory_names: getSelectedTheoryRules().map((rule) => rule.name).slice(0, 20),
    use_model: true
  };
}

function normalizeObservationConfidence(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(100, number <= 1 ? number * 100 : number));
}

function remoteObservationToState(remote, fallback = null) {
  const stats = remote?.transcript_stats || {};
  const sourceLines = Array.isArray(remote?.lines) ? remote.lines : [];
  const lines = sourceLines.length
    ? tagLines(sourceLines.map((line, index) => {
      const tags = Array.isArray(line.tags) ? line.tags.map(String) : [];
      const parsed = { index: Number(line.index ?? index), time: String(line.time || `#${String(index + 1).padStart(2, "0")}`), content: String(line.content || ""), speaker: String(line.speaker || "other"), simulated: Boolean(line.simulated), roleLabel: String(line.role_label || ""), tags };
      const auto = tagLines([parsed])[0];
      return { ...parsed, tags: Array.from(new Set([...(parsed.tags || []), ...(auto?.tags || [])])) };
    }))
    : (fallback?.lines || []);
  const mappings = Array.isArray(remote?.theory_mapping) ? remote.theory_mapping : [];
  const theoryMatches = mappings.reduce((result, mapping) => {
    const name = String(mapping?.theory_name || "证据不足");
    if (!name || name === "证据不足" || result.some((item) => item.name === name)) return result;
    const source = Array.isArray(mapping.sources) ? mapping.sources[0] || {} : {};
    result.push({
      name,
      category: Array.isArray(source.category_path) ? source.category_path.join(" → ") : "教育理论库",
      hitKeys: [],
      mechanismHits: [],
      insight: String(mapping.how_applied || mapping.mechanism || ""),
      evidence: Array.isArray(mapping.evidence) ? mapping.evidence.map(String) : [],
      score: Math.round(normalizeObservationConfidence(mapping.confidence)),
      gap: "理论判断仅覆盖逐字稿中可核验的行为，需结合学生作品和后续表现复核。",
      improvement: "把理论机制转化为下一轮课堂中的具体任务、反馈和学习证据。",
      teacherTalk: "请说明你的判断依据，再用一个新例子检验这个结论。",
      sources: Array.isArray(mapping.sources) ? mapping.sources : []
    });
    return result;
  }, []);
  const chains = mappings.map((mapping) => {
    const evidence = Array.isArray(mapping?.evidence) ? mapping.evidence.map(String) : [];
    const evidenceLines = lines.filter((line) => evidence.some((item) => item.includes(line.content) || line.content.includes(item))).slice(0, 3);
    const fallbackEvidence = evidenceLines.length ? evidenceLines : evidence.map((content, index) => ({ index, time: String(mapping?.time || `#${index + 1}`), content, speaker: "other", simulated: false, tags: [] }));
    const confidence = normalizeObservationConfidence(mapping?.confidence);
    const theory = String(mapping?.theory_name || "证据不足");
    const source = Array.isArray(mapping?.sources) ? mapping.sources[0] || {} : {};
    const landing = confidence >= 80 ? { key: "deep", label: "深度落地" } : confidence >= 60 ? { key: "sufficient", label: "较充分落地" } : confidence >= 40 ? { key: "partial", label: "部分落地" } : { key: "surface", label: "表层呈现" };
    return {
      title: String(mapping?.event || "关键课堂行为"),
      time: String(mapping?.time || fallbackEvidence[0]?.time || ""),
      content: fallbackEvidence.map((line) => `${line.time || ""} ${line.content || ""}`).join("；"),
      evidenceLines: fallbackEvidence,
      theory,
      theoryName: theory,
      supportTheory: Array.isArray(mapping?.sources) && mapping.sources[1] ? String(mapping.sources[1].theory_name || "暂无辅助理论") : "暂无辅助理论",
      matchScore: Math.max(1, Math.min(5, Math.round(confidence / 20))),
      fact: fallbackEvidence.map((line) => line.content).join("；"),
      behavior: "逐字稿记录了该课堂行为，具体表现应回到原始话语和学习任务核验。",
      mechanism: String(mapping?.how_applied || mapping?.mechanism || ""),
      theoryCategory: Array.isArray(source.category_path) ? source.category_path.join(" / ") : "教育理论库",
      landing,
      evidenceStrength: fallbackEvidence.length >= 3 ? "强" : fallbackEvidence.length === 2 ? "中" : "弱",
      advantage: String(mapping?.how_applied || "理论机制与课堂行为存在可核验联系。"),
      gap: "逐字稿未记录的语气、板书、等待秒数和全班覆盖情况不作推断。",
      improvement: String(mapping?.recommendation || "在该环节增加学生独立表达、同伴回应或变式验证，并记录可观察学习证据。"),
      teacherTalk: "先说清楚你的证据，再比较另一种可能的解释。"
    };
  });
  const local = fallback || {};
  const dimensions = Array.isArray(remote?.dimensions) ? remote.dimensions : (local.dimensions || []);
  const score = Number.isFinite(Number(remote?.total_score)) ? (Number(remote.total_score) / 10).toFixed(1) : (local.score || "0.0");
  return {
    lines,
    questions: Number(stats.questions ?? local.questions ?? 0),
    deep: Number(stats.deep_questions ?? local.deep ?? 0),
    answers: Number(stats.answers ?? local.answers ?? 0),
    feedback: Number(stats.feedback ?? local.feedback ?? 0),
    studentQ: Number(stats.student_questions ?? local.studentQ ?? 0),
    structures: {
      openQuestions: Number(stats.open_questions ?? 0), closedQuestions: Number(stats.closed_questions ?? 0),
      collectiveAnswers: Number(stats.collective_answers ?? 0), individualAnswers: Number(stats.individual_answers ?? 0),
      observedAnswers: Number(stats.observed_student_lines ?? 0), simulatedAnswers: Number(stats.simulated_student_lines ?? 0),
      waitEvidence: Number(stats.wait_evidence ?? 0), collaboration: Number(stats.collaboration ?? 0), irfChains: Number(stats.irf_chains ?? 0)
    },
    theoryMatches: theoryMatches.length ? theoryMatches : (local.theoryMatches || []),
    events: chains.length ? chains.map((chain) => ({ title: chain.title, time: chain.time, content: chain.content, evidenceLines: chain.evidenceLines, theory: chain.theory, supportTheory: chain.supportTheory, matchScore: chain.matchScore })) : (local.events || []),
    chains: chains.length ? chains : (local.chains || []),
    score,
    dimensions,
    hotwords: remote?.hotwords || {},
    diagnoses: Array.isArray(remote?.diagnoses) ? remote.diagnoses : [],
    recommendations: Array.isArray(remote?.recommendations) ? remote.recommendations : [],
    remote,
    evidenceMode: String(remote?.evidence_mode || local.evidenceMode || "classroom_observation"),
    evidenceNotice: String(remote?.evidence_notice || local.evidenceNotice || "")
  };
}

async function requestClassroomObservation(payload, signal) {
  return eduLinkRequest("/api/classroom-observation/analyze", {
    json: payload,
    timeoutMs: Math.max(EDULINK_RAG_CONFIG.timeoutMs, 900000),
    signal
  });
}

function renderObservationHotwords(data = state.analysis) {
  const host = $("#observation-hotwords");
  if (!host) return;
  const groups = [["教师", data?.hotwords?.teacher], ["学生", data?.hotwords?.student], ["其他", data?.hotwords?.other]];
  host.innerHTML = groups.map(([label, words]) => {
    const list = Array.isArray(words) ? words.slice(0, 10) : [];
    return `<div class="observation-hotword-group"><b>${label}</b><div class="observation-hotword-list">${list.length ? list.map((item) => `<span class="observation-hotword">${escapeHtml(String(item.word || ""))}<em>×${Number(item.count || 0)}</em></span>`).join("") : "<span class=\"empty\">暂无</span>"}</div></div>`;
  }).join("");
}

function renderObservationRadar(data = state.analysis) {
  const svg = $("#observation-radar-chart");
  if (!svg) return;
  const dimensions = Array.isArray(data?.dimensions) ? data.dimensions.slice(0, 5) : [];
  if (!dimensions.length) { svg.innerHTML = "<text x=\"180\" y=\"150\">完成课堂分析后显示五维评价</text>"; return; }
  const center = { x: 180, y: 150 }, radius = 100;
  const angles = dimensions.map((_, index) => index * 360 / dimensions.length);
  const point = (angle, value = 1, extra = 0) => {
    const rad = (angle - 90) * Math.PI / 180;
    return `${(center.x + Math.cos(rad) * (radius + extra) * value).toFixed(1)},${(center.y + Math.sin(rad) * (radius + extra) * value).toFixed(1)}`;
  };
  const grids = [0.25, 0.5, 0.75, 1].map((scale) => `<polygon class="radar-grid" points="${angles.map((angle) => point(angle, scale)).join(" ")}"/>`).join("");
  const axes = angles.map((angle) => { const [x, y] = point(angle).split(","); return `<line class="radar-axis" x1="${center.x}" y1="${center.y}" x2="${x}" y2="${y}"/>`; }).join("");
  const values = dimensions.map((item) => Math.max(0, Math.min(1, Number(item.score || 0) / Number(item.max_score || 20))));
  const area = `<polygon class="radar-area" points="${angles.map((angle, index) => point(angle, values[index])).join(" ")}"/>`;
  const dots = angles.map((angle, index) => { const [x, y] = point(angle, values[index]).split(","); return `<circle class="radar-dot" cx="${x}" cy="${y}" r="4"/>`; }).join("");
  const labels = angles.map((angle, index) => { const [x, y] = point(angle, 1, 24).split(","); return `<text x="${x}" y="${y}">${escapeHtml(String(dimensions[index].dimension || "维度"))}</text>`; }).join("");
  svg.innerHTML = `${grids}${axes}${area}${dots}${labels}`;
}

function renderObservationExtras(data = state.analysis) {
  const panel = $("#observation-extras");
  if (!panel) return;
  panel.hidden = !data;
  if (!data) return;
  renderObservationHotwords(data);
  renderObservationRadar(data);
  const notice = $("#observation-evidence-notice");
  if (notice) notice.textContent = data.evidenceNotice || (data.remote?.warning ? String(data.remote.warning) : "");
  refreshIcons();
}

function updateTranscriptionStatus(message, tone = "") {
  const node = $("#transcription-status");
  if (!node) return;
  node.hidden = !message;
  node.className = `transcription-inline-status observation-transcription-status ${tone} ${tone === "error" ? "is-error" : ""}`.trim();
  node.innerHTML = `<i data-lucide="${tone === "error" ? "triangle-alert" : tone === "busy" ? "loader-circle" : "mic"}"></i><span>${escapeHtml(String(message || ""))}</span>`;
  refreshIcons();
}

function renderTranscriptRefinement(result) {
  const panel = $("#transcript-refinement");
  if (!panel || !result) return;
  const stats = result.stats || {};
  const mode = result.processing_mode || (result.used_model ? "llm" : "fallback");
  panel.hidden = false;
  panel.innerHTML = `<b>逐字稿后处理：${escapeHtml(mode)}</b> · 教师 ${Number(stats.teacher_turns || 0)} 轮 · 模拟学生 ${Number(stats.simulated_student_turns || 0)} 轮 · 无法确定 ${Number(stats.uncertain_turns || 0)} 轮<br><span>${escapeHtml(String(result.evidence_notice || result.warning || "已保留原始稿，可在输入框继续编辑。"))}</span>`;
}

function applyTranscriptRefinement(result) {
  if (!result) return;
  const text = String(result.text || result.raw_text || "").trim();
  if (text) {
    els.transcript.value = text;
    setObservationSource("user", { invalidate: true });
    state.observationAnalyzedTranscript = "";
    updateTranscriptCount();
  }
  renderTranscriptRefinement(result.refinement || result);
  scheduleWorkspaceSave();
}

async function refineCurrentTranscript() {
  const transcript = els.transcript?.value.trim() || "";
  if (!transcript) { toast("请先输入或导入逐字稿。"); return null; }
  if (refineCurrentTranscript.pending) return null;
  refineCurrentTranscript.pending = true;
  const button = $("#refine-transcript");
  if (button) { button.disabled = true; button.classList.add("is-loading"); }
  updateTranscriptionStatus("正在用模型纠正文字并标注模拟学生话轮…", "busy");
  try {
    const result = await eduLinkRequest("/api/classroom-observation/refine-transcript", {
      json: { transcript: transcript.slice(0, OBSERVATION_MAX_TEXT_CHARS), title: els.lessonTitle.value.trim(), subject: els.subject.value.trim(), grade: els.grade.value.trim(), use_model: true },
      timeoutMs: Math.max(EDULINK_RAG_CONFIG.timeoutMs, 900000)
    });
    applyTranscriptRefinement(result);
    updateTranscriptionStatus("逐字稿已优化，请核对标注后重新分析。", "ready");
    toast(result.warning || "逐字稿优化完成。" );
    return result;
  } catch (error) {
    updateTranscriptionStatus(`逐字稿优化失败：${error.message || "请检查后端服务"}`, "error");
    toast(`逐字稿优化失败：${error.message || "请检查后端服务"}`);
    return null;
  } finally {
    refineCurrentTranscript.pending = false;
    if (button) { button.disabled = false; button.classList.remove("is-loading"); }
  }
}


let activeTranscriptionController = null;
let activeTranscriptionPromise = null;
let activeTranscriptionFile = null;
let mediaAutoTranscriptionTimer = null;

function makeAbortError(message = "请求已取消") {
  const error = new Error(message);
  error.name = "AbortError";
  return error;
}

async function pollTranscriptionJob(jobId, signal) {
  if (!jobId) throw new Error("后端未返回音频转写任务编号");
  const started = Date.now();
  while (Date.now() - started < 20 * 60 * 1000) {
    if (signal?.aborted) throw makeAbortError();
    const data = await eduLinkRequest(`/api/classroom-observation/transcribe/status/${encodeURIComponent(jobId)}`, { method: "GET", timeoutMs: 30000, signal });
    if (data.status === "completed") return data.result || data;
    if (data.status === "failed") throw new Error(String(data.error || "音频转写失败"));
    const percent = Number(data.progress || 0);
    updateTranscriptionStatus(`${data.phase === "refinement" ? "正在优化逐字稿" : data.phase === "asr_complete" ? "语音识别完成，准备后处理" : "正在识别音频"}… ${percent}%`, "busy");
    await new Promise((resolve, reject) => {
      let timer = null;
      const cancel = () => {
        if (timer) window.clearTimeout(timer);
        signal?.removeEventListener("abort", cancel);
        reject(makeAbortError());
      };
      if (signal?.aborted) {
        cancel();
        return;
      }
      timer = window.setTimeout(() => {
        signal?.removeEventListener("abort", cancel);
        resolve();
      }, 1800);
      signal?.addEventListener("abort", cancel, { once: true });
    });
  }
  throw new Error("音频转写超时，请稍后重试");
}

async function transcribeMediaFile(file = mediaState.file) {
  if (!file) { toast("请先载入音频或视频文件。"); return null; }
  if (activeTranscriptionPromise) {
    if (activeTranscriptionFile === file) return activeTranscriptionPromise;
    activeTranscriptionController?.abort();
  }
  const controller = new AbortController();
  activeTranscriptionController = controller;
  activeTranscriptionFile = file;
  const button = $("#transcribe-media");
  if (button) button.disabled = true;
  updateTranscriptionStatus("正在提交音频转写任务…", "busy");
  const form = new FormData();
  form.append("audio", file, file.name);
  form.append("title", els.lessonTitle.value.trim());
  form.append("subject", els.subject.value.trim());
  form.append("grade", els.grade.value.trim());
  form.append("postprocess", "true");
  const run = (async () => {
    const queued = await eduLinkRequest("/api/classroom-observation/transcribe/start", { formData: form, timeoutMs: 30000, signal: controller.signal });
    const result = await pollTranscriptionJob(queued.job_id, controller.signal);
    if (controller.signal.aborted || mediaState.file !== file) throw makeAbortError();
    applyTranscriptRefinement(result);
    // The browser may finish reading duration after ASR. Wait briefly and
    // synchronize metadata before either local or remote analysis snapshots it.
    await syncMediaMetadata(file, { waitForDuration: true });
    updateTranscriptionStatus("音频已转成逐字稿，正在生成课堂分析…", "ready");
    await analyzeTranscript();
    toast(result.notice || "音频转写和课堂分析已完成。" );
    return result;
  })();
  activeTranscriptionPromise = run;
  try {
    return await run;
  } catch (error) {
    if (error?.name !== "AbortError") {
      updateTranscriptionStatus(`音频转写失败：${error.message || "请检查后端服务"}`, "error");
      toast(`音频转写失败：${error.message || "请检查后端服务"}`);
    }
    return null;
  } finally {
    if (activeTranscriptionPromise === run) {
      activeTranscriptionPromise = null;
      activeTranscriptionController = null;
      activeTranscriptionFile = null;
      if (button) button.disabled = !mediaState.file;
    }
  }
}

async function analyzeTranscript({ silent = false, localOnly = false } = {}) {
  const text = els.transcript?.value.trim() || "";
  if (!text) return analyzeTranscriptLocal({ silent });
  if (state.observationSource === "none") setObservationSource(text === sampleTranscript.trim() ? "sample" : "user", { invalidate: false });
  const local = analyzeTranscriptLocal({ silent: true });
  if (!local || localOnly || !EDULINK_RAG_CONFIG.baseUrl) {
    if (!silent && local) { setWorkspaceSection("observe-decoder", { keepScroll: false }); toast("已完成本地课堂编码分析（在线服务未配置）。"); }
    return local;
  }
  const requestId = Number(state.observationAnalysisRequestId || 0) + 1;
  state.observationAnalysisRequestId = requestId;
  state.observationAnalysisController?.abort();
  const controller = new AbortController();
  state.observationAnalysisController = controller;
  const status = $("#analysis-status");
  if (status) status.innerHTML = '<i data-lucide="loader-circle"></i> 正在召回理论并生成报告';
  refreshIcons();
  try {
    const remote = await requestClassroomObservation(observationMetadata(), controller.signal);
    if (controller.signal.aborted || requestId !== state.observationAnalysisRequestId) return state.analysis || local;
    state.analysis = remoteObservationToState(remote, local);
    state.observationAnalyzedTranscript = text;
    state.report = String(remote.report || local.report || "");
    els.report.value = state.report;
    renderAnalysis();
    renderObservationExtras(state.analysis);
    syncReflectionSources();
    invalidateReflectionForObservationChange();
    if (!silent && !state.restoring) setWorkspaceSection("observe-decoder", { keepScroll: false });
    if (remote.warning) toast(String(remote.warning));
    else if (!silent) toast(remote.used_model ? "课堂观察报告已由理论库与模型生成。" : "课堂观察报告已生成。" );
    if (!state.restoring) saveWorkspace(true);
    return state.analysis;
  } catch (error) {
    if (error?.name === "AbortError" || requestId !== state.observationAnalysisRequestId) return state.analysis || local;
    if (status) status.innerHTML = '<i data-lucide="triangle-alert"></i> 在线分析不可用，保留本地编码';
    refreshIcons();
    state.observationAnalyzedTranscript = text;
    renderObservationExtras(local);
    if (!silent) { setWorkspaceSection("observe-decoder", { keepScroll: false }); toast(`在线课堂观察暂不可用：${error.message || "请检查服务"}`); }
    return local;
  } finally {
    if (state.observationAnalysisRequestId === requestId) state.observationAnalysisController = null;
  }
}

function handleMediaFile(file) {
  if (!file) return;
  if (!String(file.type || "").startsWith("audio/") && !String(file.type || "").startsWith("video/")) { toast("请选择有效的音频或视频文件。"); return; }
  if (mediaAutoTranscriptionTimer) {
    window.clearTimeout(mediaAutoTranscriptionTimer);
    mediaAutoTranscriptionTimer = null;
  }
  if (activeTranscriptionController) activeTranscriptionController.abort();
  if (mediaState.url) URL.revokeObjectURL(mediaState.url);
  mediaState.file = file;
  mediaState.metadataIdentity = mediaFileIdentity(file);
  mediaState.metadataTouched = { title: false, subject: false, grade: false, duration: false };
  mediaState.metadataAutoValues = { title: "", subject: "", grade: "", duration: "" };
  mediaState.durationSeconds = null;
  mediaState.url = URL.createObjectURL(file);
  mediaState.type = file.type.startsWith("video/") ? "video" : "audio";
  mediaState.name = file.name;
  mediaState.markers = [];
  const audio = $("#audio-player"), video = $("#video-player");
  audio.hidden = mediaState.type !== "audio"; video.hidden = mediaState.type !== "video";
  const activePlayer = mediaState.type === "video" ? video : audio;
  // Infer the topic/subject/grade immediately, then repeat on loadedmetadata
  // to capture duration. Both calls are guarded by the selected file identity.
  inferMetadataFromFilename(file.name, { media: true, mediaIdentity: mediaState.metadataIdentity });
  activePlayer.src = mediaState.url;
  $("#media-player-wrap").hidden = false;
  $("#media-file-status").textContent = `${file.name} · 已载入，等待转写`;
  $("#media-markers").innerHTML = "";
  const transcribeButton = $("#transcribe-media");
  if (transcribeButton) transcribeButton.disabled = false;
  void syncMediaMetadata(file);
  updateLessonContext();
  scheduleWorkspaceSave();
  if (!state.restoring) saveWorkspace(true);
  toast(`已载入音视频：${file.name}`);
  if (EDULINK_RAG_CONFIG.baseUrl && EDULINK_RAG_CONFIG.token) {
    mediaAutoTranscriptionTimer = window.setTimeout(() => {
      mediaAutoTranscriptionTimer = null;
      if (mediaState.file === file && !activeTranscriptionPromise) void transcribeMediaFile(file);
    }, 80);
  } else {
    updateTranscriptionStatus("后端服务未配置；可先粘贴逐字稿，或启动服务后点击转为逐字稿。", "error");
  }
}


async function analyzeReflectionSource({ silent = false, navigate = true } = {}) {
  const source = reflectionSourceText();
  if (source.length < 30) {
    return analyzeReflectionSourceLocal({ silent, navigate });
  }
  if (!EDULINK_RAG_CONFIG.baseUrl || !EDULINK_RAG_CONFIG.token) {
    return analyzeReflectionSourceLocal({ silent, navigate });
  }
  if (reflectionState.pending.diagnose) return false;
  const requestId = Number(reflectionState.diagnosisRequestId || 0) + 1;
  reflectionState.diagnosisRequestId = requestId;
  if (typeof reflectionState.diagnosisController?.abort === "function") reflectionState.diagnosisController.abort();
  const controller = new AbortController();
  reflectionState.diagnosisController = controller;
  reflectionState.pending.diagnose = true;
  const button = $("#run-reflection-analysis");
  if (button) button.disabled = true;
  const observation = currentReflectionObservationTranscript();
  try {
    await requestReflectionMetadata({ silent: true });
    const observationSummary = observation && state.analysis
      ? { summary: state.analysis.summary || "", score: state.analysis.score || 0, questions: state.analysis.questions || 0, answers: state.analysis.answers || 0, theory_count: state.analysis.theoryMatches?.length || 0 }
      : null;
    const data = await eduLinkRequest("/api/teaching-reflection/diagnose", {
      json: {
        source_text: source.slice(0, REFLECTION_MAX_TEXT_CHARS),
        filename: reflectionState.fileName || "",
        project_name: $("#reflection-project")?.value.trim() || "",
        lesson_name: $("#reflection-lesson")?.value.trim() || "",
        source_type: $("#reflection-source-type")?.value || "课后教学反思",
        teacher_focus: $("#reflection-brief")?.value.trim() || "",
        include_observation: Boolean(observation),
        observation_summary: observationSummary,
        use_model: true
      },
      timeoutMs: Math.max(EDULINK_RAG_CONFIG.timeoutMs, 180000),
      signal: controller.signal
    });
    if (controller.signal.aborted || requestId !== reflectionState.diagnosisRequestId) return false;
    applyRemoteReflectionDiagnosis(data);
    reflectionState.diagnosedObservationTranscript = observation;
    if (!reflectionState.diagnoses.length) {
      const fallbackWarning = String(data.warning || "在线诊断未返回有效问题，已切换本地证据诊断。");
      const fallbackReady = analyzeReflectionSourceLocal({ silent: true, navigate: false });
      reflectionState.warning = fallbackWarning;
      reflectionState.diagnosedObservationTranscript = observation;
      reflectionState.diagnosticReady = Boolean(fallbackReady);
    } else {
      reflectionState.diagnosticReady = true;
    }
    reflectionState.actionReady = false;
    renderReflectionWorkspace();
    if (navigate) setWorkspaceSection("reflect-diagnosis");
    if (!silent) toast(data.warning || (data.used_model ? "已结合理论库完成教学反思诊断。" : "已完成证据化教学反思诊断。"));
    scheduleWorkspaceSave();
    return reflectionState.diagnosticReady;
  } catch (error) {
    console.warn("Reflection diagnosis API failed.", error);
    if (error?.name === "AbortError" || requestId !== reflectionState.diagnosisRequestId) return false;
    const result = analyzeReflectionSourceLocal({ silent: true, navigate });
    reflectionState.warning = String(error?.message || "");
    reflectionState.diagnosedObservationTranscript = observation;
    if (!silent) toast(`在线诊断暂不可用，已使用本地证据诊断：${error.message || "接口未连接"}`);
    return result;
  } finally {
    if (reflectionState.diagnosisRequestId === requestId) {
      reflectionState.pending.diagnose = false;
      reflectionState.diagnosisController = null;
    }
    if (button) button.disabled = false;
  }
}


async function generateReflection({ silent = false } = {}) {
  if (!reflectionState.diagnosticReady) {
    const ready = await analyzeReflectionSource({ silent: true, navigate: false });
    if (!ready) return false;
  }
  if (!reflectionState.actionReady) await requestReflectionActions({ silent: true });
  const requestedType = $("#output-type")?.value || reflectionState.outputType || "reflection";
  const type = ["reflection", "case", "research", "paper", "lesson", "experiment"].includes(requestedType) ? requestedType : "reflection";
  const requestedStyle = $("#writing-style")?.value || "teacher";
  const style = ["teacher", "student", "paper", "competition"].includes(requestedStyle) ? requestedStyle : "teacher";
  const selected = reflectionState.selectedTheories.filter(Boolean).slice(0, 10);
  if (!selected.length) {
    generateReflectionLocal({ silent });
    return true;
  }
  if (!EDULINK_RAG_CONFIG.baseUrl || !EDULINK_RAG_CONFIG.token) {
    generateReflectionLocal({ silent });
    return true;
  }
  if (reflectionState.pending.outcome) return false;
  const requestId = Number(reflectionState.outcomeRequestId || 0) + 1;
  reflectionState.outcomeRequestId = requestId;
  if (typeof reflectionState.outcomeController?.abort === "function") reflectionState.outcomeController.abort();
  const controller = new AbortController();
  reflectionState.outcomeController = controller;
  reflectionState.pending.outcome = true;
  const button = $("#generate-reflection");
  if (button) button.disabled = true;
  try {
    const data = await eduLinkRequest("/api/teaching-reflection/outcome", {
      json: {
        source_text: reflectionSourceText().slice(0, REFLECTION_MAX_TEXT_CHARS),
        project_name: $("#reflection-project")?.value.trim() || "",
        lesson_name: $("#reflection-lesson")?.value.trim() || "",
        output_type: type,
        writing_style: style,
        diagnosis: reflectionDiagnosisPayload(),
        actions_data: reflectionState.actionsData || { actions: reflectionState.actions },
        selected_theories: selected,
        teacher_focus: $("#reflection-brief")?.value.trim() || "",
        use_model: true
      },
      timeoutMs: Math.max(EDULINK_RAG_CONFIG.timeoutMs, 240000),
      signal: controller.signal
    });
    if (controller.signal.aborted || requestId !== reflectionState.outcomeRequestId) return false;
    const content = String(data.content || "").trim();
    if (!content) throw new Error("后端没有返回成果正文");
    state.reflection = content;
    if (els.reflection) els.reflection.value = content;
    reflectionState.warning = String(data.warning || "");
    reflectionState.usedModel = Boolean(data.used_model);
    renderRubric();
    renderFramework();
    renderReflectionOverview();
    await requestReflectionProfile({ silent: true });
    if (!silent) toast(data.warning || (data.used_model ? "已由模型结合理论生成教学成果。" : "已生成证据化教学成果。"));
    if (!state.restoring) saveWorkspace(true);
    return true;
  } catch (error) {
    console.warn("Reflection outcome API failed.", error);
    if (error?.name === "AbortError" || requestId !== reflectionState.outcomeRequestId) return false;
    generateReflectionLocal({ silent: true });
    if (!silent) toast(`在线成果生成失败，已使用本地结构化版本：${error.message || "接口未连接"}`);
    return true;
  } finally {
    if (reflectionState.outcomeRequestId === requestId) {
      reflectionState.pending.outcome = false;
      reflectionState.outcomeController = null;
      if (button) button.disabled = false;
    }
  }
}


async function handleReflectionFile(file) {
  if (!file) return;
  reflectionState.fileName = file.name;
  if (EDULINK_RAG_CONFIG.baseUrl && EDULINK_RAG_CONFIG.token) {
    setReflectionFileState(`${file.name} · 正在由后端提取正文`, "pending");
    const form = new FormData();
    form.append("file", file, file.name);
    try {
      const data = await eduLinkRequest("/api/teaching-reflection/extract", { formData: form, timeoutMs: Math.max(EDULINK_RAG_CONFIG.timeoutMs, 120000) });
      const text = String(data.text || "").trim();
      if (text.length < 1) throw new Error("后端未提取到正文");
      $("#reflection-source").value = text;
      if (data.project_name && $("#reflection-project")) $("#reflection-project").value = data.project_name;
      if (data.lesson_name && $("#reflection-lesson")) $("#reflection-lesson").value = data.lesson_name;
      reflectionState.metadataProjectTouched = false;
      reflectionState.metadataLessonTouched = false;
      reflectionState.lastAutoProject = String(data.project_name || "");
      reflectionState.lastAutoLesson = String(data.lesson_name || "");
      setReflectionFileState(`${file.name} · 已解析 ${text.replace(/\s/g, "").length} 字`, "ready");
      resetReflectionAnalysisState({ clearOutcome: true });
      renderReflectionWorkspace();
      scheduleWorkspaceSave();
      toast(`已导入反思材料：${file.name}`);
      return;
    } catch (error) {
      console.warn("Reflection document extraction API failed.", error);
      setReflectionFileState(`${file.name} · 后端解析失败，尝试浏览器解析`, "pending");
    }
  }
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) {
    setReflectionFileState(`${file.name} · 已接收，等待后端解析`, "pending");
    resetReflectionAnalysisState({ clearOutcome: true });
    reflectionState.metadataProjectTouched = false;
    reflectionState.metadataLessonTouched = false;
    reflectionState.lastAutoProject = "";
    reflectionState.lastAutoLesson = "";
    $("#reflection-source").value = "";
    inferMetadataFromFilename(file.name);
    renderReflectionWorkspace();
    scheduleWorkspaceSave();
    toast("PDF 文件已接收；请将正文复制到编辑区后开始诊断。")
    return;
  }
  let text = name.endsWith(".docx") ? await readDocxText(file) : await file.text();
  if (text.startsWith("当前处于离线状态")) {
    setReflectionFileState(`${file.name} · 解析失败，请复制正文`, "error");
    toast("Word 文件解析失败，请将正文复制到反思原文框。")
    return;
  }
  resetReflectionAnalysisState({ clearOutcome: true });
  reflectionState.metadataProjectTouched = false;
  reflectionState.metadataLessonTouched = false;
  reflectionState.lastAutoProject = "";
  reflectionState.lastAutoLesson = "";
  $("#reflection-source").value = text.trim();
  inferMetadataFromFilename(file.name);
  $("#reflection-lesson").value = els.lessonTitle.value || $("#reflection-lesson").value;
  setReflectionFileState(`${file.name} · 已解析 ${text.replace(/\s/g, "").length} 字`, "ready");
  renderReflectionWorkspace();
  scheduleWorkspaceSave();
  toast(`已导入反思材料：${file.name}`);
}

async function confirmReflectionTheoriesAndContinue() {
  reflectionState.activeTheory = reflectionState.selectedTheories[0] || "教学过程最优化理论";
  const ok = await requestReflectionActions({ silent: false });
  renderReflectionWorkspace();
  setWorkspaceSection("reflect-action");
  if (ok) toast("已确认理论组合，并生成下一步改进行动。");
  return ok;
}


function initializeReflectionWorkspace() {
  const dropzone = $("#reflection-dropzone");
  const input = $("#reflection-file-input");
  if (!dropzone || !input || dropzone.dataset.ready) return;
  dropzone.dataset.ready = "true";
  $("#choose-reflection-file").addEventListener("click", () => input.click());
  $("#run-reflection-analysis").addEventListener("click", () => analyzeReflectionSource());
  input.addEventListener("change", (event) => handleReflectionFile(event.target.files[0]));
  ["dragenter", "dragover"].forEach((eventName) => dropzone.addEventListener(eventName, (event) => { event.preventDefault(); dropzone.classList.add("dragging"); }));
  ["dragleave", "drop"].forEach((eventName) => dropzone.addEventListener(eventName, (event) => { event.preventDefault(); dropzone.classList.remove("dragging"); }));
  dropzone.addEventListener("drop", (event) => handleReflectionFile(event.dataTransfer.files[0]));
  dropzone.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); input.click(); } });
  $("#reflection-source").addEventListener("input", () => {
    $("#reflection-source-count").textContent = `${reflectionSourceText().replace(/\s/g, "").length} 字`;
    resetReflectionAnalysisState({ clearOutcome: true });
    renderReflectionDiagnosis();
    renderReflectionTheories();
    renderReflectionActions();
    renderReflectionOverview();
    window.clearTimeout(reflectionState.metadataTimer);
    reflectionState.metadataTimer = window.setTimeout(() => requestReflectionMetadata({ silent: true }), 650);
    scheduleWorkspaceSave();
  });
  $("#reflection-brief").addEventListener("input", scheduleWorkspaceSave);
  $("#reflection-use-observation")?.addEventListener("change", () => {
    invalidateReflectionForObservationChange();
    renderReflectionWorkspace();
    scheduleWorkspaceSave();
  });
  ["#reflection-project", "#reflection-lesson", "#reflection-round", "#reflection-source-type", "#reflection-experiment-goal", "#reflection-experiment-strategy"].forEach((selector) => $(selector)?.addEventListener("input", () => {
    if (selector === "#reflection-project") reflectionState.metadataProjectTouched = true;
    if (selector === "#reflection-lesson") reflectionState.metadataLessonTouched = true;
    scheduleWorkspaceSave();
  }));
  $("#reflection-round")?.addEventListener("change", () => { renderReflectionTrajectory(); scheduleWorkspaceSave(); });
  $("#reflection-output-types")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-reflection-output]");
    if (!button) return;
    reflectionState.outputType = button.dataset.reflectionOutput;
    $("#output-type").value = reflectionState.outputType;
    $$("#reflection-output-types [data-reflection-output]").forEach((item) => item.classList.toggle("active", item === button));
    scheduleWorkspaceSave();
  });
  $("#reflection-theory-list")?.addEventListener("click", (event) => {
    const option = event.target.closest("[data-reflection-theory-name]");
    if (!option) return;
    const name = option.dataset.reflectionTheoryName;
    reflectionState.selectedTheories = reflectionState.selectedTheories.includes(name)
      ? reflectionState.selectedTheories.filter((item) => item !== name)
      : [...reflectionState.selectedTheories, name];
    reflectionState.actionsData = null;
    reflectionState.actionReady = false;
    reflectionState.activeTheory = name;
    renderReflectionTheories();
    scheduleWorkspaceSave();
  });
  $("#reflection-mapping-table")?.addEventListener("click", (event) => { const row = event.target.closest("[data-reflection-theory-name]"); if (row) renderReflectionTheoryDetail(row.dataset.reflectionTheoryName); });
  $("#reflection-evidence-matrix")?.addEventListener("click", (event) => { const row = event.target.closest("[data-reflection-theory-name]"); if (row) { renderReflectionTheoryDetail(row.dataset.reflectionTheoryName); setWorkspaceSection("reflect-theory"); } });
  $("#reflection-round-switcher")?.addEventListener("click", (event) => { const button = event.target.closest("[data-reflection-round]"); if (!button) return; $("#reflection-round").value = button.dataset.reflectionRound; renderReflectionTrajectory(); scheduleWorkspaceSave(); });
  $("#reflection-timeline")?.addEventListener("click", (event) => { const button = event.target.closest("[data-reflection-round]"); if (!button) return; $("#reflection-round").value = button.dataset.reflectionRound; renderReflectionTrajectory(); });
  $("#reflection-path-navigation")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-reflection-path-section]");
    if (button) void navigateReflectionPath(button.dataset.reflectionPathSection);
  });
  $("#reflection-path-pager")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-reflection-path-target]");
    if (button && !button.disabled) void navigateReflectionPath(button.dataset.reflectionPathTarget);
  });
  $("#confirm-reflection-theories")?.addEventListener("click", () => {
    void confirmReflectionTheoriesAndContinue();
  });
  $("#regenerate-reflection-actions")?.addEventListener("click", async () => {
    await requestReflectionActions({ silent: false });
    renderReflectionActions();
    renderReflectionOverview();
    scheduleWorkspaceSave();
  });
  $("#add-reflection-round")?.addEventListener("click", () => {
    const next = reflectionState.rounds.length + 1;
    reflectionState.rounds.push({ round: next, date: "待实施", label: "新一轮实践", score: null, status: "待验证", problems: ["等待本轮课堂证据"], strategy: $("#reflection-experiment-strategy").value.trim() || "待制定", result: "尚未开始" });
    const select = $("#reflection-round");
    if (select && !Array.from(select.options).some((option) => Number(option.value) === next)) select.insertAdjacentHTML("beforeend", `<option value="${next}">第 ${next} 轮 · 新一轮实践</option>`);
    select.value = String(next);
    renderReflectionTrajectory(); renderReflectionOverview(); scheduleWorkspaceSave(); setWorkspaceSection("reflect-trajectory"); toast(`已建立第 ${next} 轮改进档案。`);
  });
  $("#new-reflection-project")?.addEventListener("click", () => {
    $("#reflection-project").value = "新的课堂持续改进项目";
    $("#reflection-source").value = "";
    reflectionState.fileName = "";
    resetReflectionAnalysisState({ clearOutcome: true });
    reflectionState.metadataProjectTouched = false;
    reflectionState.metadataLessonTouched = false;
    reflectionState.lastAutoProject = "";
    reflectionState.lastAutoLesson = "";
    setReflectionFileState("尚未选择文件", "pending");
    renderReflectionWorkspace();
    setWorkspaceSection("reflect-material");
    toast("已建立新的反思项目。");
  });
  $("#export-growth-profile")?.addEventListener("click", () => downloadText("EduLink教师成长简报.md", `# 教师专业成长简报\n\n项目：${$("#reflection-project").value}\n\n高频关注：课堂提问、学生参与、概念理解\n\n长期改善：理论解释与行动指标逐步清晰\n\n持续挑战：差异化参与与真实迁移\n\n成长轨迹：${reflectionState.rounds.map((item) => `第${item.round}轮 ${item.label}`).join(" → ")}`));
  if (reflectionSourceText() && EDULINK_RAG_CONFIG.baseUrl) requestReflectionMetadata({ silent: true });
}


function renderTheoryScenario() {
  const theory = assistantState.theory;
  if (!theory.scenarioAnswerMap || typeof theory.scenarioAnswerMap !== "object") theory.scenarioAnswerMap = {};
  const loading = Boolean(theory.scenarioLoading);
  const answering = Boolean(theory.scenarioAnswering);
  const busy = loading || answering;
  const mode = theory.scenarioMode === "random" ? "random" : "specialized";
  const configuredTheoryName = theory.scenarioTheoryName || getSelectedLearningTheory()?.name || "当前理论";
  const optionsElement = $("#scenario-options");
  const feedback = $("#scenario-feedback");
  const next = $("#scenario-next");
  const start = $("#scenario-start");
  const countControl = $("#scenario-question-count");
  const configuredCount = Math.max(1, Math.min(20, Number(theory.scenarioQuestionCount) || 5));
  theory.scenarioQuestionCount = configuredCount;
  if (countControl) countControl.value = String(configuredCount);
  $$('[data-scenario-mode]').forEach((button) => button.classList.toggle("active", button.dataset.scenarioMode === mode));
  $("#scenario-theory-name").textContent = mode === "random" ? "不限理论范围" : configuredTheoryName;
  if (start) start.innerHTML = loading
    ? '<i data-lucide="loader-circle"></i>正在生成题目…'
    : '<i data-lucide="play"></i>开始训练';
  if (loading) {
    $("#scenario-index").textContent = "正在加载题目…";
    $("#scenario-difficulty").textContent = "请稍候";
    $("#scenario-stem").textContent = "正在从理论库生成情境训练题";
    $("#scenario-question").textContent = "题目生成后会显示在这里。";
    if (optionsElement) optionsElement.innerHTML = '<div class="scenario-loading-state" role="status" aria-live="polite"><i data-lucide="loader-circle"></i><span>正在生成训练题，请稍候…</span></div>';
    if (feedback) { feedback.hidden = true; feedback.innerHTML = ""; }
    if (next) next.disabled = true;
    $("#scenario-progress-bar").style.width = "0%";
    setScenarioControlsDisabled(true);
    if ($("#scenario-recent-meta")) $("#scenario-recent-meta").textContent = "正在从理论库生成训练题…";
    refreshIcons();
    renderScenarioHistory();
    return;
  }
  const scenarioSet = scenarioItems();
  if (!scenarioSet.length) {
    $("#scenario-index").textContent = "暂无题目";
    $("#scenario-difficulty").textContent = theory.scenarioBlocked ? "理论未找到" : "请先开始训练";
    $("#scenario-stem").textContent = theory.scenarioBlocked
      ? theory.scenarioBlockReason
      : "选择训练范围并点击“开始训练”。";
    $("#scenario-question").textContent = "";
    if (optionsElement) optionsElement.innerHTML = "";
    if (feedback) { feedback.hidden = true; feedback.innerHTML = ""; }
    if (next) next.disabled = true;
    $("#scenario-score-value").textContent = "0";
    $("#scenario-progress-bar").style.width = "0%";
    setScenarioControlsDisabled(false);
    if ($("#scenario-recent-meta")) $("#scenario-recent-meta").textContent = theory.scenarioBlocked
      ? theory.scenarioBlockReason
      : "选择训练范围后，点击“开始训练”生成题目";
    refreshIcons();
    renderScenarioHistory();
    return;
  }
  const index = Math.max(0, Math.min(Number(assistantState.theory.scenarioIndex) || 0, scenarioSet.length - 1));
  assistantState.theory.scenarioIndex = index;
  const item = normalizeScenarioQuestion(scenarioSet[index], index);
  const selectedTheoryName = assistantState.theory.scenarioMode === "random"
    ? (item.theory_name || "随机训练")
    : (assistantState.theory.scenarioTheoryName || getSelectedLearningTheory()?.name || item.theory_name || "当前理论");
  $("#scenario-index").textContent = `第 ${index + 1} 题 / 共 ${scenarioSet.length} 题`;
  // Training cards show only the learner-facing question and options.
  // Theory evidence remains in the answer response so the feedback panel can
  // explain the choice after submission without overwhelming the question;
  // knowledge_excerpt and analysis.knowledge are deliberately not rendered
  // in the pre-answer card.
  const evidenceForFeedback = item.knowledge_excerpt || item.analysis?.knowledge || "";
  if ($("#scenario-difficulty")) $("#scenario-difficulty").textContent = "专项判断";
  $("#scenario-stem").textContent = "";
  $("#scenario-question").textContent = item.display_stem || item.question || item.stem;
  $("#scenario-theory-name").textContent = selectedTheoryName;
  if ($("#scenario-theory-input-field") && assistantState.theory.scenarioMode !== "random" && !assistantState.theory.scenarioLoading) $("#scenario-theory-input-field").value = assistantState.theory.scenarioTheoryName || selectedTheoryName;
  const rawAnswerRecord = theory.scenarioAnswerMap?.[item.question_id];
  const answerRecord = rawAnswerRecord
    ? normalizeScenarioAnswerResult(item, rawAnswerRecord.selected_answer ?? rawAnswerRecord.selectedAnswer ?? item.answer, rawAnswerRecord)
    : null;
  if (answerRecord) theory.scenarioAnswerMap[item.question_id] = answerRecord;
  if (optionsElement) optionsElement.innerHTML = item.options.map((option, optionIndex) => `<button type="button" data-scenario-option="${optionIndex}" ${busy || answerRecord ? "disabled" : ""} class="${answerRecord && optionIndex === Number(answerRecord.correct_answer ?? item.answer) ? "correct" : ""}${answerRecord && optionIndex === Number(answerRecord.selected_answer) && !answerRecord.correct ? " wrong" : ""}"><span>${String.fromCharCode(65 + optionIndex)}</span>${escapeHtml(option)}</button>`).join("");
  if (answering && feedback) {
    feedback.hidden = false;
    feedback.className = "scenario-feedback pending";
    feedback.innerHTML = '<span><i data-lucide="loader-circle"></i></span><div class="scenario-feedback-content"><b>正在提交答案并生成解析…</b></div>';
  } else if (answerRecord) renderScenarioFeedback(item, Number(answerRecord.selected_answer), answerRecord);
  else if (feedback) { feedback.hidden = true; feedback.innerHTML = ""; }
  setScenarioControlsDisabled(busy);
  if (next) next.disabled = busy || !answerRecord;
  const score = Math.round(Number(assistantState.theory.scenarioScore || 0) / Math.max(1, scenarioSet.length) * 100);
  $("#scenario-score-value").textContent = score;
  $("#scenario-progress-bar").style.width = `${((index + 1) / scenarioSet.length) * 100}%`;
  if ($("#scenario-recent-title")) $("#scenario-recent-title").textContent = `最近训练：${assistantState.theory.scenarioMode === "random" ? "随机训练" : selectedTheoryName} · ${scenarioSet.length} 题`;
  if ($("#scenario-recent-meta")) $("#scenario-recent-meta").textContent = answering ? "正在提交答案并生成解析…" : assistantState.theory.scenarioAnsweredCount ? `已完成 ${assistantState.theory.scenarioAnsweredCount} 题，继续练习并查看完整理论解析` : "从理论库进入专项训练，答题后会在这里保留进度";
  renderScenarioHistory();
}

function answerTheoryScenarioLocal(optionIndex) {
  const theory = assistantState.theory;
  if (theory.scenarioAnswered || theory.scenarioAnswering) return;
  const item = scenarioCurrentItem();
  if (!item) return;
  theory.scenarioAnswered = true;
  theory.scenarioAnsweredCount = Number(theory.scenarioAnsweredCount || 0) + 1;
  const normalized = normalizeScenarioAnswerResult(item, optionIndex, {});
  if (normalized.correct) theory.scenarioScore += 1;
  theory.scenarioAnswerMap[normalized.question_id] = normalized;
  theory.scenarioAnswering = false;
  upsertCurrentScenarioHistory();
  renderTheoryScenario();
  renderTheoryOverview();
  scheduleWorkspaceSave();
}


function initializeAssistantWorkspaces() {
  renderObservationCaseCatalogue();
  ensureSixArtsSourceContent(assistantState.sixarts.form || getSixArtsFormData());
  renderTheoryOverview();
  renderTheoryLibrary();
  renderTheoryDetail();
  renderTheoryDialogue();
  renderTheoryScenario();
  renderSixArtsSelector();
  renderSixArtsDesign();
  renderSixArtsProcess();
  renderSixArtsRubric();
  renderSixArtsResources();
  renderReflectionWorkspace();
  updateObservationCaseMetrics();
  applyObservationOverviewFilters();
  if (EDULINK_RAG_CONFIG.baseUrl) loadTheoryTrainingHistory({ silent: true });
}

function initialize() {
  saveWorkspaceDeviceProfile();
  authState.user = getStoredUser();
  authState.draftAvatar = authState.user?.avatar || getStoredProfile()?.avatar || DEFAULT_AVATAR;
  renderUserAccount();
  initializeTheorySelector();
  initializeAssistantWorkspaces();
  initializeReflectionWorkspace();
  if (!els.analysisDate.value) els.analysisDate.value = new Date().toISOString().slice(0, 10);
  const restored = restoreWorkspace(true);
  if (!restored) {
    els.transcript.value = sampleTranscript;
    analyzeTranscript({ silent: true, localOnly: true });
    analyzeReflectionSourceLocal({ silent: true, navigate: false });
    generateReflectionLocal({ silent: true });
  }
  if (state.analysis) {
    renderRubric();
    renderFramework();
    renderReflectionOverview();
    renderObservationExtras(state.analysis);
  }

  const params = new URLSearchParams(window.location.search);
  const requestedSectionParam = params.get("section");
  const view = params.get("view") || window.location.hash.replace("#", "") || requestedSectionParam || state.currentView;
  const normalizedView = view === "reflection" ? "reflect" : workspaceSections[view]?.view || view || "observe";
  const requestedSection = params.get("section") || (workspaceSections[view] ? view : "") || state.currentSection || defaultWorkspaceSections[normalizedView];
  const initialView = defaultWorkspaceSections[normalizedView] ? normalizedView : "observe";
  commitView(initialView, { preserveSection: true });
  const section = workspaceSections[requestedSection]?.view === state.currentView
    ? requestedSection
    : defaultWorkspaceSections[state.currentView];
  setWorkspaceSection(section, { keepScroll: true, immediate: true });
  const localPreview = params.get("preview") === "1" && ["127.0.0.1", "localhost"].includes(window.location.hostname);
  if (params.get("workspace") === "1") enterWorkspace({ bypassAuth: localPreview });
  else showLanding({ immediate: true });
  updateTranscriptCount();
  updateLessonContext();
  applyWorkspacePerformanceMode();
  applyPointerGlassPreference();
  syncWorkspaceSettings();
  refreshIcons();
  initializeLiquidGlassFilters();
  initializeGlassHighlights();
  initializeInteractionEffects();
  initializeAssistantFlyouts();
  initializeRailMentorObserver();
  scheduleRailMentorLayout();
  window.setTimeout(scheduleRailMentorLayout, 900);
  initializeMotionSystem();
  initializeEditorialWorkspaceMotion();
  initializeEntryCurtainScroll();
  initializeMethodVideos();
  initializeWorkspaceLocalFontObserver();
}

$$("[data-view]").forEach((button) => button.addEventListener("click", () => {
  const branch = button.closest(".assistant-branch");
  const viewName = button.dataset.view;
  const assistantChanged = state.currentView !== viewName;
  if (assistantChanged) {
    cancelAssistantFlyoutOpen();
    if (assistantFlyoutState.branch) closeAssistantFlyout(assistantFlyoutState.branch);
    setView(viewName);
    return;
  }
  setView(viewName);
  toggleAssistantFlyout(branch);
}));
$$("button[data-workspace-section]").forEach((button) => {
  button.dataset.workspaceBound = "true";
  button.addEventListener("click", () => {
    setWorkspaceSection(button.dataset.workspaceSection);
    const branch = button.closest(".assistant-branch");
    if (branch?.classList.contains("flyout-open")) window.setTimeout(() => closeAssistantFlyout(branch), 220);
  });
});
$$("[data-entry-scroll]").forEach((button) => button.addEventListener("click", () => {
  const target = $("#" + button.dataset.entryScroll);
  target?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
}));
[$("#entry-login"), $("#entry-primary"), $("#entry-open-workspace")].forEach((button) => button.addEventListener("click", () => {
  if (authState.user) enterWorkspace();
  else openAuthModal({ enterWorkspace: true });
}));
$("#workspace-exit").addEventListener("click", showLanding);
document.addEventListener("click", (event) => {
  const decoderTarget = event.target.closest("[data-observe-decoder-target]");
  if (decoderTarget) {
    focusObservationDecoderTarget(decoderTarget.dataset.observeDecoderTarget);
    return;
  }
  const overviewFilter = event.target.closest("[data-observe-filter]");
  if (overviewFilter) {
    const kind = overviewFilter.dataset.observeFilter;
    if (kind in observationOverviewFilters) {
      observationOverviewFilters[kind] = overviewFilter.dataset.value || "all";
      observationCasesExpanded = false;
      applyObservationOverviewFilters();
    }
    return;
  }
  const caseButton = event.target.closest("[data-observe-load-case]");
  if (caseButton) {
    loadObservationCase(caseButton.dataset.observeLoadCase);
    return;
  }
  if (event.target.closest("[data-observe-case-more]")) {
    observationCasesExpanded = !observationCasesExpanded;
    updateObservationCaseExpansion();
    refreshIcons();
    toast(observationCasesExpanded ? "已展开全部课堂观察案例。" : "已收起扩展案例。");
    return;
  }
  if (event.target.closest("[data-observe-recent-more]")) {
    observationRecentExpanded = !observationRecentExpanded;
    updateObservationRecentExpansion();
    refreshIcons();
    return;
  }
  const libraryView = event.target.closest("[data-theory-library-view]");
  if (libraryView) {
    assistantState.theory.libraryView = libraryView.dataset.theoryLibraryView === "categories" ? "categories" : "overview";
    assistantState.theory.libraryPage = 1;
    if (assistantState.theory.libraryView === "overview") assistantState.theory.query = "";
    setTheoryDirectoryMobileOpen(false);
    renderTheoryLibrary();
    scheduleWorkspaceSave();
    return;
  }
  const libraryLens = event.target.closest("[data-theory-library-lens]");
  if (libraryLens) {
    assistantState.theory.libraryLens = libraryLens.dataset.theoryLibraryLens;
    renderTheoryLibraryLens(getTheoryDirectorySelection());
    refreshIcons();
    scheduleWorkspaceSave();
    return;
  }
  const mapControl = event.target.closest("[data-theory-map-control]");
  if (mapControl) {
    const action = mapControl.dataset.theoryMapControl;
    if (action === "reset") setTheoryMapViewport({ x: 0, y: 0, scale: 1 }, { animate: true });
    else {
      const surface = $("#theory-library-lens-stage [data-theory-map-surface]");
      const rect = surface?.getBoundingClientRect();
      if (rect) zoomTheoryMapAtPoint(rect.left + rect.width / 2, rect.top + rect.height / 2, action === "zoom-in" ? 1 : -1);
    }
    scheduleWorkspaceSave();
    return;
  }
  const mapBreadcrumb = event.target.closest("[data-theory-map-breadcrumb]");
  if (mapBreadcrumb && !mapBreadcrumb.disabled) {
    leaveTheoryMapScene(mapBreadcrumb.dataset.theoryMapBreadcrumb);
    return;
  }
  if (event.target.closest("[data-theory-map-back]")) {
    const path = getTheoryMapPath();
    leaveTheoryMapScene(path.slice(0, -1).join("/"));
    return;
  }
  const mapCenter = event.target.closest("[data-theory-map-center]");
  if (mapCenter) {
    const path = getTheoryMapPath();
    if (path.length) leaveTheoryMapScene(path.slice(0, -1).join("/"));
    return;
  }
  const mapInfoPath = event.target.closest("[data-theory-map-info-path]");
  if (mapInfoPath) {
    enterTheoryMapScene(mapInfoPath.dataset.theoryMapInfoPath, mapInfoPath);
    return;
  }
  const mapInfoTheory = event.target.closest("[data-theory-map-info-theory]");
  if (mapInfoTheory) {
    selectTheoryFromMap(mapInfoTheory.dataset.theoryMapInfoTheory);
    return;
  }
  const mapTheory = event.target.closest("[data-theory-map-theory]");
  if (mapTheory && performance.now() >= theoryMapSuppressClickUntil) {
    const profileId = mapTheory.dataset.theoryMapTheory;
    if (profileId) selectTheoryFromMap(profileId);
    return;
  }
  const mapSatellite = event.target.closest("[data-theory-map-satellite]");
  if (mapSatellite && performance.now() >= theoryMapSuppressClickUntil) {
    enterTheoryMapScene(mapSatellite.dataset.theoryMapPath, mapSatellite);
    scheduleWorkspaceSave();
    return;
  }
  const mapNode = event.target.closest("[data-theory-map-node]");
  if (mapNode && performance.now() >= theoryMapSuppressClickUntil) {
    if (mapNode.dataset.theoryMapPath) enterTheoryMapScene(mapNode.dataset.theoryMapPath, mapNode);
    scheduleWorkspaceSave();
    return;
  }
  const overviewDirectory = event.target.closest("[data-theory-overview-category]");
  if (overviewDirectory) {
    const categoryIndex = Number(overviewDirectory.dataset.theoryOverviewCategory || 0);
    const nextDirectoryPath = [
      categoryIndex,
      Number(overviewDirectory.dataset.theoryOverviewSection || 0),
      Number(overviewDirectory.dataset.theoryOverviewGroup || 0)
    ];
    const structureView = overviewDirectory.closest(".theory-structure-stage");
    const overviewDepth = structureView
      ? Math.min(3, Math.max(1, Number(overviewDirectory.dataset.theoryOverviewDepth) || 1))
      : overviewDirectory.closest(".theory-overview-group, .theory-directory-groups") ? 3 : overviewDirectory.closest(".theory-overview-sections, .theory-directory-sections") ? 2 : 1;
    const nextMapPath = nextDirectoryPath.slice(0, overviewDepth);
    assistantState.theory.directoryPath = nextDirectoryPath;
    assistantState.theory.directoryCollapsedDepth = 0;
    assistantState.theory.libraryMapPath = nextMapPath;
    assistantState.theory.libraryMapViewport = { x: 0, y: 0, scale: 1 };
    assistantState.theory.directoryTheory = "";
    assistantState.theory.librarySelectedTheoryId = "";
    if (structureView) {
      assistantState.theory.libraryView = "overview";
      assistantState.theory.libraryLens = "index";
    } else if (overviewDirectory.closest("#theory-overview-directory-nav") && overviewDepth === 1) {
      assistantState.theory.libraryView = "categories";
    }
    assistantState.theory.librarySelectedTheoryId = "";
    assistantState.theory.libraryPage = 1;
    animateTheoryDirectorySwitch();
    renderTheoryLibrary();
    scheduleWorkspaceSave();
    return;
  }
  const libraryAbility = event.target.closest("[data-theory-library-ability]");
  if (libraryAbility) {
    assistantState.theory.libraryAbility = libraryAbility.dataset.theoryLibraryAbility;
    if (assistantState.theory.librarySelectedTheoryId) {
      openTheoryLibraryAbility(assistantState.theory.libraryAbility);
      return;
    }
    renderTheoryLibraryAbilities(getTheoryDirectorySelection());
    refreshIcons();
    scheduleWorkspaceSave();
    return;
  }
  const libraryUse = event.target.closest("[data-theory-library-use]");
  if (libraryUse) {
    openTheoryLibraryAbility(libraryUse.dataset.theoryLibraryUse);
    return;
  }
  const selectedTheoryDetail = event.target.closest("[data-theory-library-selected-detail]");
  if (selectedTheoryDetail) {
    const profile = getTheoryProfileById(selectedTheoryDetail.dataset.theoryLibrarySelectedDetail);
    if (profile) {
      assistantState.theory.librarySelectedTheoryId = profile.id;
      assistantState.theory.selectedId = profile.id;
      assistantState.theory.directoryTheory = profile.name;
      assistantState.theory.detailTab = "explanation";
      renderTheoryDetail();
      setWorkspaceSection("theory-detail");
      scheduleWorkspaceSave();
    }
    return;
  }
  const libraryPage = event.target.closest("[data-theory-library-page]");
  if (libraryPage && !libraryPage.disabled) {
    assistantState.theory.libraryPage = Number(libraryPage.dataset.theoryLibraryPage) || 1;
    animateTheoryDirectorySwitch();
    renderTheoryLibrary();
    $("#theory-library-categories")?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
    scheduleWorkspaceSave();
    return;
  }
  if (event.target.closest("#theory-library-expand")) {
    const lensCard = $("#theory-library-lens-card");
    setTheoryMapExpanded(!lensCard.classList.contains("is-expanded"));
    return;
  }
  if (event.target.closest("#theory-directory-mobile-trigger")) {
    setTheoryDirectoryMobileOpen(true);
    return;
  }
  if (event.target.closest("#theory-directory-mobile-close, #theory-directory-mobile-backdrop")) {
    setTheoryDirectoryMobileOpen(false);
    return;
  }
  const sixArtsStage = event.target.closest("[data-sixarts-stage-target]");
  if (sixArtsStage) {
    if (sixArtsStage.getAttribute("aria-disabled") === "true") toast("该阶段尚未生成，请先完成上一步。")
    else setWorkspaceSection(sixArtsStage.dataset.sixartsStageTarget);
    return;
  }
  const sixArtsProcessAnchor = event.target.closest("[data-sixarts-process-anchor]");
  if (sixArtsProcessAnchor) {
    const target = document.querySelector(`#sixarts-process-stage-${Number(sixArtsProcessAnchor.dataset.sixartsProcessAnchor) + 1}`);
    if (target) {
      $$("[data-sixarts-process-anchor]").forEach((button) => button.classList.toggle("active", button === sixArtsProcessAnchor));
      target.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
    }
    return;
  }
  const sixArtsDetailSwitch = event.target.closest("[data-sixarts-detail-switch]");
  if (sixArtsDetailSwitch) {
    switchSixArtsDetailLevel(sixArtsDetailSwitch.dataset.sixartsDetailSwitch);
    return;
  }
  const sectionButton = event.target.closest("button[data-workspace-section]");
  if (sectionButton && !sectionButton.dataset.workspaceBound) setWorkspaceSection(sectionButton.dataset.workspaceSection);

  const reflectionTheoryTarget = event.target.closest("[data-reflection-theory-name]");
  if (reflectionTheoryTarget && !reflectionTheoryTarget.closest("#reflection-theory-list")) {
    reflectionState.activeTheory = reflectionTheoryTarget.dataset.reflectionTheoryName;
    renderReflectionTheoryDetail(reflectionState.activeTheory);
  }

  const category = event.target.closest("[data-theory-category]");
  if (category) {
    assistantState.theory.filter = category.dataset.theoryCategory;
    assistantState.theory.query = "";
    assistantState.theory.librarySelectedTheoryId = "";
    animateTheoryDirectorySwitch();
    renderTheoryLibrary();
    setWorkspaceSection("theory-library");
  }
  const directoryBranch = event.target.closest("[data-theory-directory-category]");
  if (directoryBranch) {
    const categoryIndex = Number(directoryBranch.dataset.theoryDirectoryCategory || 0);
    const sectionIndex = Number(directoryBranch.dataset.theoryDirectorySection || 0);
    const groupIndex = Number(directoryBranch.dataset.theoryDirectoryGroup || 0);
    const directoryDepth = directoryBranch.closest(".theory-directory-groups") ? 3 : directoryBranch.closest(".theory-directory-sections") ? 2 : 1;
    const mapPath = [categoryIndex, sectionIndex, groupIndex].slice(0, directoryDepth);
    const currentPath = assistantState.theory.directoryPath || [];
    const branchPath = [categoryIndex, sectionIndex, groupIndex];
    const samePath = currentPath.slice(0, directoryDepth).every((value, index) => value === branchPath[index]);
    const isFold = samePath && Number(assistantState.theory.directoryCollapsedDepth || 0) < directoryDepth;
    const nextPath = [categoryIndex, sectionIndex, groupIndex];
    assistantState.theory.directoryPath = nextPath;
    /* A second click on the open branch folds that level back to its parent. */
    assistantState.theory.directoryCollapsedDepth = isFold ? directoryDepth : 0;
    const collapsedMapPath = nextPath.slice(0, isFold ? directoryDepth - 1 : directoryDepth);
    assistantState.theory.directoryTheory = "";
    assistantState.theory.librarySelectedTheoryId = "";
    if (directoryBranch.closest("#theory-overview-directory-nav") && directoryDepth === 1 && !isFold) {
      assistantState.theory.libraryView = "categories";
    }
    assistantState.theory.query = "";
    assistantState.theory.libraryPage = 1;
    setTheoryDirectoryMobileOpen(false);
    animateTheoryDirectorySwitch();
    assistantState.theory.libraryMapPath = isFold ? collapsedMapPath : mapPath;
    assistantState.theory.libraryMapViewport = { x: 0, y: 0, scale: 1 };
    renderTheoryLibrary();
    scheduleWorkspaceSave();
    return;
  }
  const directoryTheory = event.target.closest("[data-directory-theory]");
  if (directoryTheory) {
    assistantState.theory.directoryTheory = directoryTheory.dataset.directoryTheory;
    const selectedPath = [
      directoryTheory.dataset.directoryCategoryIndex,
      directoryTheory.dataset.directorySectionIndex,
      directoryTheory.dataset.directoryGroupIndex
    ].map(Number);
    if (selectedPath.every((index) => Number.isInteger(index) && index >= 0)) {
      assistantState.theory.directoryPath = selectedPath;
      assistantState.theory.libraryMapPath = selectedPath;
      assistantState.theory.directoryCollapsedDepth = 0;
    }
    const profileId = directoryTheory.dataset.directoryProfileId;
    assistantState.theory.librarySelectedTheoryId = profileId || "";
    animateTheoryDirectorySwitch();
    if (profileId) selectLearningTheory(profileId, true);
    else {
      renderTheoryLibrary();
      scheduleWorkspaceSave();
    }
    return;
  }
  const filter = event.target.closest("[data-theory-filter]");
  if (filter) {
    assistantState.theory.filter = filter.dataset.theoryFilter;
    renderTheoryLibrary();
    scheduleWorkspaceSave();
  }
  const planButton = event.target.closest("[data-theory-plan]");
  if (planButton) {
    event.stopPropagation();
    toggleTheoryPlan(planButton.dataset.theoryPlan);
  }
  const theoryTarget = event.target.closest("[data-theory-id]");
  if (theoryTarget && !planButton) selectLearningTheory(theoryTarget.dataset.theoryId, Boolean(event.target.closest("[data-theory-open='detail']") || theoryTarget.dataset.theoryOpen === "detail"));

  const detailTab = event.target.closest("[data-theory-tab]");
  if (detailTab) {
    assistantState.theory.detailTab = detailTab.dataset.theoryTab;
    renderTheoryDetail();
    scheduleWorkspaceSave();
    return;
  }
  const detailPager = event.target.closest("[data-theory-detail-nav]");
  if (detailPager && !detailPager.disabled && detailPager.dataset.theoryDetailNav) {
    assistantState.theory.detailTab = detailPager.dataset.theoryDetailNav;
    renderTheoryDetail();
    $("#theory-detail-content")?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
    scheduleWorkspaceSave();
    return;
  }
  const detailSubject = event.target.closest("[data-theory-detail-subject]");
  if (detailSubject) {
    if (!assistantState.theory.detailSubjects) assistantState.theory.detailSubjects = { application: "", example: "" };
    assistantState.theory.detailSubjects[detailSubject.dataset.theoryDetailSubjectMode] = detailSubject.dataset.theoryDetailSubject;
    renderTheoryDetail();
    scheduleWorkspaceSave();
  }
  const comparisonTarget = event.target.closest("[data-theory-comparison-target]");
  if (comparisonTarget) {
    const item = getSelectedLearningTheory();
    if (!assistantState.theory.comparisonTargets) assistantState.theory.comparisonTargets = {};
    assistantState.theory.comparisonTargets[item.id] = Number(comparisonTarget.dataset.theoryComparisonTarget) || 0;
    renderTheoryDetail();
    scheduleWorkspaceSave();
    return;
  }
  const topic = event.target.closest("[data-theory-topic]");
  if (topic) selectLearningTheory(topic.dataset.theoryTopic);
  const prompt = event.target.closest("[data-theory-prompt]");
  if (prompt) submitTheoryQuestion(prompt.dataset.theoryPrompt, prompt.dataset.theoryMode || null);
  const scenarioOption = event.target.closest("[data-scenario-option]");
  if (scenarioOption) answerTheoryScenario(Number(scenarioOption.dataset.scenarioOption));

  const artCard = event.target.closest("[data-sixart]");
  if (artCard) {
    assistantState.sixarts.activeResource = artCard.dataset.sixart;
    renderSixArtsResources();
    setWorkspaceSection("sixarts-library");
  }
  const resourceFilter = event.target.closest("[data-sixarts-resource]");
  if (resourceFilter) {
    assistantState.sixarts.activeResource = resourceFilter.dataset.sixartsResource;
    renderSixArtsResources();
    scheduleWorkspaceSave();
  }
  const moduleCopy = event.target.closest("[data-copy-module]");
  if (moduleCopy) {
    const module = moduleCopy.closest(".sixarts-design-module");
    copyText(module?.innerText || "", "教学设计模块已复制。")
  }
});

$("#theory-library-query").addEventListener("input", (event) => {
  assistantState.theory.query = event.target.value;
  assistantState.theory.libraryPage = 1;
  renderTheoryLibrary();
  scheduleWorkspaceSave();
});
$("#theory-overview-directory-query")?.addEventListener("input", (event) => {
  assistantState.theory.directoryQuery = event.target.value;
  renderTheoryLibraryOverviewDirectory(getTheoryDirectorySelection());
  renderTheoryLibraryLens(getTheoryDirectorySelection());
  refreshIcons();
  scheduleWorkspaceSave();
});
$("#theory-plan-toggle").addEventListener("click", () => toggleTheoryPlan());
$("#theory-start-scenario").addEventListener("click", () => setWorkspaceSection("theory-library"));
$$('[data-scenario-mode]').forEach((button) => button.addEventListener("click", () => {
  const mode = button.dataset.scenarioMode === "random" ? "random" : "specialized";
  assistantState.theory.scenarioMode = mode;
  if (mode === "specialized") {
    assistantState.theory.scenarioTheoryName = $("#scenario-theory-input-field")?.value.trim()
      || assistantState.theory.scenarioTheoryName
      || getSelectedLearningTheory()?.name
      || "";
  }
  resetScenarioRound();
  $$('[data-scenario-mode]').forEach((item) => item.classList.toggle("active", item.dataset.scenarioMode === mode));
  renderTheoryScenario();
  scheduleWorkspaceSave();
}));
$$('[data-scenario-theory-suggestion]').forEach((button) => button.addEventListener("click", () => {
  const name = button.dataset.scenarioTheorySuggestion || "";
  const input = $("#scenario-theory-input-field");
  if (input) input.value = name;
  const profile = getTheoryProfileByName(name);
  if (profile) {
    assistantState.theory.selectedId = profile.id;
    assistantState.theory.librarySelectedTheoryId = profile.id;
  }
  assistantState.theory.scenarioMode = "specialized";
  assistantState.theory.scenarioTheoryName = name;
  resetScenarioRound();
  renderTheoryScenario();
  renderTheoryOverview();
  scheduleWorkspaceSave();
}));
$("#scenario-theory-input-field")?.addEventListener("input", (event) => {
  assistantState.theory.scenarioTheoryName = String(event.target.value || "").trim();
  if (assistantState.theory.scenarioStarted) {
    resetScenarioRound();
    renderTheoryScenario();
  }
  scheduleWorkspaceSave();
});
$("#scenario-theory-input-field")?.addEventListener("change", (event) => {
  const value = event.target.value.trim();
  const profile = getTheoryProfileByName(value);
  if (profile) {
    assistantState.theory.selectedId = profile.id;
    assistantState.theory.librarySelectedTheoryId = profile.id;
  }
  assistantState.theory.scenarioTheoryName = value;
  resetScenarioRound();
  renderTheoryScenario();
  renderTheoryOverview();
  scheduleWorkspaceSave();
});
$("#scenario-theory-clear")?.addEventListener("click", () => {
  const input = $("#scenario-theory-input-field");
  if (input) {
    input.value = "";
    assistantState.theory.scenarioTheoryName = "";
    resetScenarioRound();
    input.focus();
    renderTheoryScenario();
    scheduleWorkspaceSave();
  }
});
$("#scenario-question-count")?.addEventListener("change", (event) => {
  assistantState.theory.scenarioQuestionCount = Math.max(1, Math.min(20, Number(event.target.value) || 5));
  resetScenarioRound();
  renderTheoryScenario();
  scheduleWorkspaceSave();
});
$("#scenario-start")?.addEventListener("click", async () => {
  if (assistantState.theory.scenarioLoading) return;
  const input = $("#scenario-theory-input-field");
  const requestedTheory = input?.value.trim() || "";
  const profile = getTheoryProfileByName(requestedTheory);
  if (profile) {
    assistantState.theory.selectedId = profile.id;
    assistantState.theory.librarySelectedTheoryId = profile.id;
  }
  assistantState.theory.scenarioTheoryName = requestedTheory || getSelectedLearningTheory()?.name || "";
  resetScenarioRound();
  assistantState.theory.scenarioStarted = true;
  renderTheoryScenario();
  await loadTheoryScenarioTraining({ refresh: true, silent: false });
  if (scenarioItems().length) window.setTimeout(() => {
    const card = $("#scenario-options")?.closest(".scenario-card");
    card?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
    card?.querySelector("[data-scenario-option]:not(:disabled)")?.focus({ preventScroll: true });
  }, 60);
  scheduleWorkspaceSave();
});
$("#scenario-history-toggle")?.addEventListener("click", () => {
  assistantState.theory.scenarioHistoryOpen = !assistantState.theory.scenarioHistoryOpen;
  renderScenarioHistory();
  scheduleWorkspaceSave();
});
$("#scenario-history-list")?.addEventListener("click", (event) => {
  const question = event.target.closest("[data-scenario-history-question]");
  if (question) {
    resumeScenarioHistorySession(question.dataset.scenarioHistorySession, Number(question.dataset.scenarioHistoryQuestion));
    return;
  }
  const resume = event.target.closest("[data-scenario-history-continue]");
  if (resume) resumeScenarioHistorySession(resume.dataset.scenarioHistoryContinue);
});
$("#scenario-recent-continue")?.addEventListener("click", continueCurrentScenarioTraining);
$("#theory-chat-form").addEventListener("submit", (event) => {
  event.preventDefault();
  submitTheoryQuestion($("#theory-chat-input").value);
});
$("#theory-chat-input")?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" || event.shiftKey || event.isComposing || event.defaultPrevented) return;
  event.preventDefault();
  const form = $("#theory-chat-form");
  if (form?.requestSubmit) form.requestSubmit();
  else form?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
});
$("#theory-chat-messages").addEventListener("click", (event) => {
  const retryButton = event.target.closest("[data-theory-retry]");
  if (!retryButton || assistantState.theory.pending) return;
  const messageIndex = Number(retryButton.dataset.theoryRetry);
  const message = assistantState.theory.dialogue[messageIndex];
  if (!message?.retryQuestion) return;
  const retryQuestion = message.retryQuestion;
  const retryMode = message.retryMode || null;
  assistantState.theory.dialogue.splice(messageIndex, 1);
  const precedingMessage = assistantState.theory.dialogue[messageIndex - 1];
  if (precedingMessage?.role === "user" && precedingMessage.text === retryQuestion) {
    assistantState.theory.dialogue.splice(messageIndex - 1, 1);
  }
  persistActiveTheoryDialogueSession();
  renderTheoryDialogue();
  submitTheoryQuestion(retryQuestion, retryMode);
});
$("#clear-theory-dialogue").addEventListener("click", () => {
  createTheoryDialogueSession();
});
$("#new-theory-dialogue-history")?.addEventListener("click", createTheoryDialogueSession);
$("#theory-history-toggle")?.addEventListener("click", () => setTheoryDialogueSidebar("history"));
$$('[data-dialogue-sidebar-tab]').forEach((button) => button.addEventListener("click", () => setTheoryDialogueSidebar(button.dataset.dialogueSidebarTab)));
$("#theory-history-query")?.addEventListener("input", renderTheoryChatHistory);
$("#theory-history-list")?.addEventListener("click", (event) => {
  const remove = event.target.closest("[data-theory-history-delete]");
  if (remove) { removeTheoryDialogueSession(remove.dataset.theoryHistoryDelete); return; }
  const open = event.target.closest("[data-theory-history-open]");
  if (open) openTheoryDialogueSession(open.dataset.theoryHistoryOpen);
});
$("#theory-chat-history-float-list")?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-theory-chat-jump]");
  const messages = $("#theory-chat-messages");
  if (!button || !messages) return;
  const messageIndex = Number(button.dataset.theoryChatJump);
  const target = Array.from(messages.querySelectorAll(".theory-message"))
    .find((node) => Number(node.dataset.theoryMessageIndex) === messageIndex);
  if (!target) return;
  target.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "center" });
  target.classList.remove("history-focus");
  void target.offsetWidth;
  target.classList.add("history-focus");
  window.setTimeout(() => target.classList.remove("history-focus"), 1150);
});
$("#scenario-next").addEventListener("click", () => {
  if (assistantState.theory.scenarioLoading || assistantState.theory.scenarioAnswering) return;
  assistantState.theory.scenarioIndex = (assistantState.theory.scenarioIndex + 1) % Math.max(1, scenarioItems().length);
  assistantState.theory.scenarioAnswered = false;
  assistantState.theory.scenarioAnswerRequestId = Number(assistantState.theory.scenarioAnswerRequestId || 0) + 1;
  upsertCurrentScenarioHistory();
  renderTheoryScenario();
  scheduleWorkspaceSave();
});
$("#scenario-retry").addEventListener("click", () => {
  if (assistantState.theory.scenarioLoading || assistantState.theory.scenarioAnswering) return;
  resetScenarioRound({ clearItems: Boolean(assistantState.theory.scenarioRemote || EDULINK_RAG_CONFIG.baseUrl), preserveStarted: true });
  assistantState.theory.scenarioStarted = true;
  assistantState.theory.scenarioAnsweredCount = 0;
  if (assistantState.theory.scenarioRemote || EDULINK_RAG_CONFIG.baseUrl) loadTheoryScenarioTraining({ refresh: true, silent: false });
  else renderTheoryScenario();
  renderTheoryOverview();
  scheduleWorkspaceSave();
});

$("#sixarts-course-form").addEventListener("submit", (event) => {
  event.preventDefault();
  generateSixArtsPlan();
});
$("#sixarts-subject").addEventListener("change", (event) => {
  const edition = $("#sixarts-edition");
  if (event.target.value === "小学语文") edition.value = "统编版";
  if (event.target.value === "小学数学") edition.value = "人教版";
  scheduleWorkspaceSave();
});
$$('input[name="sixarts-mode"]').forEach((input) => input.addEventListener("change", () => {
  assistantState.sixarts.mode = getSixArtsMode();
  syncSixArtsModeControls();
  scheduleWorkspaceSave();
}));
$$('input[name="sixarts-detail-level"]').forEach((input) => input.addEventListener("change", () => {
  switchSixArtsDetailLevel(getSixArtsDetailLevel());
}));
$("#sixarts-selector").addEventListener("change", () => {
  assistantState.sixarts.selectedArts = $$("#sixarts-selector input:checked").map((input) => input.value);
  // Keep the existing controls in place. Rebuilding six labels here caused a
  // short layout reflow that looked like the whole page zoomed on each click.
  $$("#sixarts-selector label").forEach((label) => {
    const input = label.querySelector("input");
    const selected = Boolean(input?.checked);
    label.classList.toggle("is-selected", selected);
    label.setAttribute("aria-selected", String(selected));
  });
  scheduleWorkspaceSave();
});
$("#sixarts-course-form").addEventListener("input", scheduleWorkspaceSave);
function updateSixArtsMaterialFiles(files) {
  const incoming = Array.from(files || []).map((file) => ({ name: file.name, size: file.size, type: file.type || "文件" }));
  assistantState.sixarts.materials = incoming;
  const list = $("#sixarts-material-list");
  if (list) list.innerHTML = incoming.map((file) => `<span><i data-lucide="file-check-2"></i><b>${escapeHtml(file.name)}</b><small>${Math.max(1, Math.round(file.size / 1024))} KB</small></span>`).join("");
  refreshIcons();
  scheduleWorkspaceSave();
}
$("#sixarts-material-input")?.addEventListener("change", (event) => updateSixArtsMaterialFiles(event.target.files));
$("#sixarts-material-dropzone")?.addEventListener("dragover", (event) => { event.preventDefault(); event.currentTarget.classList.add("dragging"); });
$("#sixarts-material-dropzone")?.addEventListener("dragleave", (event) => event.currentTarget.classList.remove("dragging"));
$("#sixarts-material-dropzone")?.addEventListener("drop", (event) => { event.preventDefault(); event.currentTarget.classList.remove("dragging"); updateSixArtsMaterialFiles(event.dataTransfer.files); });
$("#sixarts-save-draft")?.addEventListener("click", () => {
  assistantState.sixarts.form = getSixArtsFormData();
  saveWorkspace(true);
  toast("课情草稿已保存到本机浏览器。");
});
$("#sixarts-design-output").addEventListener("input", () => { captureSixArtsDesignDraft(); scheduleWorkspaceSave(); });
$("#sixarts-process-output").addEventListener("input", () => { captureSixArtsProcessDraft(); scheduleWorkspaceSave(); });
$("#sixarts-copy-design").addEventListener("click", () => copyText(buildSixArtsPlanText(), "六艺教学设计已复制。"));
$("#sixarts-copy-process").addEventListener("click", () => copyText($("#sixarts-process-output").innerText, "教学过程已复制。"));
$("#sixarts-export-plan").addEventListener("click", exportSixArtsMarkdownWithImages);
$("#sixarts-design-next").addEventListener("click", advanceSixArtsFromDesign);
$("#sixarts-process-next").addEventListener("click", advanceSixArtsFromProcess);
$("#sixarts-download-word-design").addEventListener("click", downloadSixArtsWord);
$("#sixarts-download-word").addEventListener("click", downloadSixArtsWord);
$("#sixarts-rubric-body").addEventListener("change", (event) => {
  const select = event.target.closest("[data-sixarts-score]");
  if (!select) return;
  assistantState.sixarts.scores[select.dataset.sixartsScore] = Number(select.value);
  scheduleWorkspaceSave();
  toast(`${select.dataset.sixartsScore}维度目标已更新。`)
});
$("#load-sample").addEventListener("click", () => {
  state.observationAnalysisController?.abort();
  state.observationAnalysisRequestId = Number(state.observationAnalysisRequestId || 0) + 1;
  state.observationAnalysisController = null;
  els.transcript.value = sampleTranscript;
  setObservationSource("sample", { invalidate: true });
  state.observationAnalyzedTranscript = "";
  analyzeTranscript();
});
$("#run-analysis").addEventListener("click", analyzeTranscript);
$("#analyze-bottom").addEventListener("click", analyzeTranscript);
$("#regenerate-report").addEventListener("click", analyzeTranscript);
$("#clear-transcript").addEventListener("click", () => {
  state.observationAnalysisController?.abort();
  state.observationAnalysisRequestId = Number(state.observationAnalysisRequestId || 0) + 1;
  state.observationAnalysisController = null;
  state.observationAnalyzedTranscript = "";
  setObservationSource("none");
  els.transcript.value = "";
  renderObservationExtras(null);
  updateTranscriptCount();
  toast("输入框已清空。");
});
els.transcript.addEventListener("input", () => {
  state.observationAnalysisController?.abort();
  state.observationAnalysisRequestId = Number(state.observationAnalysisRequestId || 0) + 1;
  state.observationAnalysisController = null;
  state.observationAnalyzedTranscript = "";
  if (state.observationSource === "sample") state.observationSource = "user";
  renderObservationExtras(null);
  updateTranscriptCount();
});
[els.transcript, els.report, els.reflection, $("#reflection-brief")].forEach((input) => input.addEventListener("input", scheduleWorkspaceSave));
[els.report, els.reflection].forEach((input) => input.addEventListener("input", () => {
  if (state.analysis) renderReflectionOverview();
}));
[els.lessonTitle, els.subject, els.grade, els.duration, els.teacherName, els.analysisDate].forEach((input) => input.addEventListener("input", () => {
  updateLessonContext();
  refreshReportMetadata();
  scheduleWorkspaceSave();
}));
[[els.lessonTitle, "title"], [els.subject, "subject"], [els.grade, "grade"], [els.duration, "duration"]].forEach(([input, field]) => input.addEventListener("input", () => {
  if (mediaState.file && mediaState.metadataIdentity && !state.restoring) mediaState.metadataTouched[field] = true;
}));
[$("#output-type"), $("#writing-style")].forEach((select) => select.addEventListener("change", scheduleWorkspaceSave));
$("#tag-filter").addEventListener("change", () => state.analysis && renderCodedList());
$("#file-input").addEventListener("change", (event) => handleFile(event.target.files[0]));
$("#media-input").addEventListener("change", (event) => handleMediaFile(event.target.files[0]));
[$("#audio-player"), $("#video-player")].forEach((player) => player?.addEventListener("loadedmetadata", () => {
  if (mediaState.file) void syncMediaMetadata(mediaState.file);
}));
$("#transcribe-media")?.addEventListener("click", () => { void transcribeMediaFile(); });
$("#refine-transcript")?.addEventListener("click", () => { void refineCurrentTranscript(); });
$("#capture-media-time").addEventListener("click", captureMediaTime);
$("#add-custom-theory").addEventListener("click", addCustomTheory);
$("#theory-selector").addEventListener("change", () => {
  updateTheorySelectionSummary();
  updateObservationCaseMetrics();
  scheduleWorkspaceSave();
  if (state.analysis) analyzeTranscript();
});
$("#copy-report").addEventListener("click", () => copyText(els.report.value, "报告已复制。"));
$("#copy-theory").addEventListener("click", () => {
  const text = state.analysis?.theoryMatches
    .map((item) => `${item.name}：${item.insight}\n证据：${item.evidence.join("；")}`)
    .join("\n\n");
  copyText(text, "理论证据链已复制。");
});
$("#download-report").addEventListener("click", downloadWordReport);
$("#download-word").addEventListener("click", downloadWordReport);
$("#copy-landing-cards").addEventListener("click", () => {
  const text = state.analysis?.chains.map((chain) => `${chain.theoryName}｜${chain.landing.label}\n课堂证据：${chain.fact}\n教学机制：${chain.mechanism}\n改进策略：${chain.improvement}\n优化话术：${chain.teacherTalk}`).join("\n\n");
  copyText(text, "理论落地卡已复制。")
});
$("#generate-reflection").addEventListener("click", generateReflection);
$("#copy-reflection").addEventListener("click", () => copyText(els.reflection.value, "成果正文已复制。"));
$("#download-reflection").addEventListener("click", () => downloadText("教学反思与成果转化.md", els.reflection.value));

async function downloadReflectionWord() {
  const content = els.reflection.value.trim();
  if (!content) {
    toast("请先生成专业成果。")
    return;
  }
  if (!window.JSZip) {
    toast("Word 组件未加载，请刷新页面后重试。")
    return;
  }
  const zip = new window.JSZip();
  const lesson = ($("#reflection-lesson").value || "教学反思").replace(/[\\/:*?"<>|《》]/g, "").slice(0, 30);
  const now = new Date().toISOString();
  zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>`);
  zip.folder("_rels").file(".rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>`);
  zip.folder("docProps").file("core.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${xmlEscape(lesson)}教学反思与成果转化</dc:title><dc:creator>EduLink</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created></cp:coreProperties>`);
  const word = zip.folder("word");
  word.file("document.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${markdownToDocxBody(content)}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"/></w:sectPr></w:body></w:document>`);
  word.file("styles.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:rPr><w:rFonts w:ascii="Microsoft YaHei" w:eastAsia="Microsoft YaHei"/><w:sz w:val="22"/></w:rPr><w:pPr><w:spacing w:after="100" w:line="360" w:lineRule="auto"/></w:pPr></w:style><w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:pPr><w:jc w:val="center"/></w:pPr><w:rPr><w:b/><w:sz w:val="40"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:rPr><w:b/><w:color w:val="5D4CCF"/><w:sz w:val="30"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:rPr><w:b/><w:sz w:val="26"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading3"><w:name w:val="heading 3"/><w:basedOn w:val="Normal"/><w:rPr><w:b/><w:sz w:val="23"/></w:rPr></w:style></w:styles>`);
  word.folder("_rels").file("document.xml.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`);
  const blob = await zip.generateAsync({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${lesson}-教学反思与成果转化.docx`;
  link.click();
  URL.revokeObjectURL(url);
  toast("Word 成果文档已生成。")
}

$("#download-reflection-word").addEventListener("click", downloadReflectionWord);

function downloadPortfolio() {
  const selected = $$(".portfolio input:checked").map((input) => input.nextElementSibling.textContent.trim());
  if (!selected.length) {
    toast("请至少选择一项成果包组件。");
    return;
  }
  const a = state.analysis || { lines: [], events: [], questions: 0, answers: 0, theoryMatches: [], deep: 0, feedback: 0, studentQ: 0, score: 0 };
  const lesson = $("#reflection-lesson").value || els.lessonTitle.value;
  const sections = [`# EduLink 反思与成果转化包\n\n课例：${lesson}\n项目：${$("#reflection-project").value}\n生成时间：${new Date().toLocaleString()}\n包含组件：${selected.join("、")}`];
  if (selected.some((name) => name.includes("原始反思"))) {
    sections.push(`## 原始反思与课堂证据\n\n${reflectionSourceText()}\n\n课堂观察补充：${a.lines.length} 条话语、${a.events.length} 个关键事件。`);
  }
  if (selected.some((name) => name.includes("理论映射"))) {
    sections.push(`## 理论映射证据链\n\n${reflectionState.diagnoses.map((item) => `- ${item.title} → ${item.theory}\n  课堂证据：${item.evidence}\n  理论解释：${item.interpretation}`).join("\n")}`);
  }
  if (selected.some((name) => name.includes("理论化反思"))) {
    sections.push(`## 理论化教学反思\n\n${els.reflection.value || state.reflection || "待生成"}`);
  }
  if (selected.some((name) => name.includes("下一轮改进"))) {
    sections.push(`## 下一轮改进方案\n\n${reflectionState.actions.map((item, index) => `${index + 1}. ${item.action}\n   观察指标：${item.indicator}`).join("\n")}`);
  }
  if (selected.some((name) => name.includes("改进轨迹"))) {
    sections.push(`## 改进轨迹对比\n\n${reflectionState.rounds.map((item) => `### 第 ${item.round} 轮 · ${item.label}\n- 问题：${item.problems.join("；")}\n- 策略：${item.strategy}\n- 结果：${item.result}`).join("\n\n")}`);
  }
  if (selected.some((name) => name.includes("成长画像"))) {
    const scores = $$(".rubric-item").map((item) => `- ${item.querySelector("h3").textContent}：${item.querySelector(".rubric-score").textContent}`).join("\n");
    sections.push(`## 教师专业成长画像\n\n${scores}\n\n高频关注：课堂提问、学生参与、概念理解。\n持续挑战：差异化参与与真实迁移。`);
  }
  downloadText("EduLink反思与成果转化包.md", sections.join("\n\n---\n\n"));
}
$("#download-portfolio").addEventListener("click", downloadPortfolio);
$("#download-portfolio-secondary").addEventListener("click", downloadPortfolio);
$("#save-session").addEventListener("click", () => saveWorkspace(false));
$("#workspace-history-back").addEventListener("click", () => navigateWorkspaceHistory("back"));
$("#workspace-history-forward").addEventListener("click", () => navigateWorkspaceHistory("forward"));
$("#workspace-page-refresh").addEventListener("click", () => {
  const section = state.currentSection;
  if (section && workspaceSections[section]) {
    applyWorkspaceSection(section, { keepScroll: true, immediate: true });
    renderCloudDrive();
    toast("当前工作页面已刷新。保存的数据不会丢失。");
  }
});
$("#workspace-guide-open").addEventListener("click", openWorkspaceGuide);
$("#workspace-guide-open-sidebar")?.addEventListener("click", openWorkspaceGuide);
$("#workspace-guide-skip").addEventListener("click", skipWorkspaceGuide);
$("#workspace-guide-prev").addEventListener("click", () => moveWorkspaceGuide(-1));
$("#workspace-guide-next").addEventListener("click", () => moveWorkspaceGuide(1));
$("#render-quality-trigger").addEventListener("click", toggleRenderQualityMenu);
$("#render-quality-menu").addEventListener("click", (event) => {
  const option = event.target.closest("[data-render-quality]");
  if (option) setRenderQuality(option.dataset.renderQuality);
});
$("#workspace-settings-open").addEventListener("click", openWorkspaceSettings);
$("#workspace-settings-close").addEventListener("click", closeWorkspaceSettings);
$("#workspace-settings-backdrop").addEventListener("click", closeWorkspaceSettings);
$("#workspace-settings-done").addEventListener("click", () => {
  closeWorkspaceSettings();
});
$("#workspace-guide-replay").addEventListener("click", () => {
  closeWorkspaceSettings({ restoreFocus: false });
  openWorkspaceGuide({ index: 0 });
});
$("#workspace-guide-enabled").addEventListener("change", (event) => setWorkspaceGuideAutoEnabled(event.target.checked));
$("#pointer-glass-enabled").addEventListener("change", (event) => setPointerGlassEnabled(event.target.checked));
$("#workspace-settings-quality").addEventListener("click", (event) => {
  const option = event.target.closest("[data-settings-render-quality]");
  if (option) setRenderQuality(option.dataset.settingsRenderQuality);
});
let searchTimer = 0;
$("#workspace-search").addEventListener("input", (event) => {
  window.clearTimeout(searchTimer);
  searchTimer = window.setTimeout(() => searchWorkspace(event.target.value), 110);
});
$("#search-clear").addEventListener("click", () => {
  $("#workspace-search").value = "";
  searchWorkspace("");
  $("#workspace-search").focus();
});
$$('[data-scroll-target]').forEach((button) => button.addEventListener("click", () => {
  const target = $("#" + button.dataset.scrollTarget);
  if (!target) return;
  const panel = getPanelForTarget(target);
  if (panel) setWorkspaceSection(panel);
  window.setTimeout(() => target.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
}));
$$(".chart-periods").forEach((container) => container.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-period]");
  if (button) renderInteractionTrend(button.dataset.period);
}));
$("#focus-list").addEventListener("click", (event) => {
  const item = event.target.closest("[data-focus-target]");
  const target = item && $("#" + item.dataset.focusTarget);
  if (!target) return;
  const panel = getPanelForTarget(target);
  if (panel) setWorkspaceSection(panel);
  window.setTimeout(() => target.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
});
$("#user-entry").addEventListener("click", toggleUserMenu);
$("#auth-close").addEventListener("click", closeAuthModal);
$("#auth-backdrop").addEventListener("click", closeAuthModal);
$("#login-form").addEventListener("submit", (event) => authState.mode === "register" ? registerUser(event) : loginUser(event));
$$('[data-auth-mode]').forEach((button) => button.addEventListener("click", () => setAuthMode(button.dataset.authMode)));
$("#login-avatar-input").addEventListener("change", (event) => handleAvatarUpload(event.target.files[0], false));
$("#menu-avatar-input").addEventListener("change", (event) => handleAvatarUpload(event.target.files[0], true));
$("#reset-avatar").addEventListener("click", () => {
  authState.draftAvatar = DEFAULT_AVATAR;
  authState.draftAvatarChanged = true;
  setAvatarSources(DEFAULT_AVATAR);
  $("#auth-error").textContent = "";
  toast("已恢复默认头像。")
});
$("#password-toggle").addEventListener("click", () => {
  const input = $("#login-password");
  const showing = input.type === "text";
  input.type = showing ? "password" : "text";
  $("#password-toggle").title = showing ? "显示密码" : "隐藏密码";
  $("#password-toggle").innerHTML = `<i data-lucide="${showing ? "eye" : "eye-off"}"></i>`;
  refreshIcons();
});
$("#switch-account").addEventListener("click", () => openAuthModal({ clear: true }));
$("#logout-user").addEventListener("click", logoutUser);
$("#cloud-drive-upload")?.addEventListener("click", () => $("#cloud-drive-input")?.click());
$("#cloud-drive-input")?.addEventListener("change", (event) => {
  recordCloudDriveFiles(event.target.files);
  event.target.value = "";
});
$("#cloud-drive-dropzone")?.addEventListener("click", (event) => {
  if (!event.target.closest("button")) $("#cloud-drive-input")?.click();
});
$("#cloud-drive-dropzone")?.addEventListener("dragover", (event) => {
  event.preventDefault();
  event.currentTarget.classList.add("is-dragging");
});
$("#cloud-drive-dropzone")?.addEventListener("dragleave", (event) => {
  if (event.currentTarget.contains(event.relatedTarget)) return;
  event.currentTarget.classList.remove("is-dragging");
});
$("#cloud-drive-dropzone")?.addEventListener("drop", (event) => {
  event.preventDefault();
  event.currentTarget.classList.remove("is-dragging");
  recordCloudDriveFiles(event.dataTransfer.files);
});
$("#cloud-drive-dropzone button")?.addEventListener("click", () => $("#cloud-drive-input")?.click());
renderCloudDrive();
window.addEventListener("resize", () => {
  fitWorkspacePageTitle();
  scheduleRailMentorLayout();
  window.requestAnimationFrame(syncObservationReportHeight);
  if ($("#workspace-guide-layer").classList.contains("open")) scheduleWorkspaceTourLayout();
  if (assistantFlyoutState.branch) {
    if (isDesktopAssistantFlyout()) updateAssistantFlyoutGeometry(assistantFlyoutState.branch);
    else closeAssistantFlyout(assistantFlyoutState.branch);
  }
}, { passive: true });
document.addEventListener("scroll", () => {
  if ($("#workspace-guide-layer").classList.contains("open")) scheduleWorkspaceTourLayout();
}, { passive: true, capture: true });
document.addEventListener("click", (event) => {
  if (!$("#user-account").contains(event.target)) closeUserMenu();
  if (!$("#render-quality-control").contains(event.target)) closeRenderQualityMenu();
});

function openEntryDestination(sectionName) {
  if (!workspaceSections[sectionName]) return;
  if (authState.user) enterWorkspace({ destination: sectionName });
  else openAuthModal({ enterWorkspace: true, destination: sectionName });
}

document.addEventListener("click", (event) => {
  const entry = event.target.closest("[data-entry-destination]");
  if (!entry) return;
  event.preventDefault();
  openEntryDestination(entry.dataset.entryDestination);
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const entry = event.target.closest?.("[data-entry-destination]");
  if (!entry) return;
  event.preventDefault();
  openEntryDestination(entry.dataset.entryDestination);
});
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if ($("#workspace-guide-layer").classList.contains("open")) return;
  if ($("#workspace-settings-layer").classList.contains("open")) closeWorkspaceSettings();
  else if ($("#auth-modal").classList.contains("open")) closeAuthModal();
  else if ($("#render-quality-menu").classList.contains("open")) closeRenderQualityMenu();
  else if (assistantFlyoutState.branch) closeAssistantFlyout(assistantFlyoutState.branch);
  else closeUserMenu();
});

function enhanceSixArtsCompetencyMarks() {
  const output = $("#sixarts-design-output");
  if (!output) return;
  let changed = false;
  $$("#sixarts-design-output .competency-row:not(.competency-head) > b").forEach((mark) => {
    if (mark.dataset.iconized === "true") return;
    const key = mark.textContent.trim();
    const item = sixArtsDimensions.find((dimension) => dimension.key === key);
    mark.dataset.iconized = "true";
    mark.setAttribute("aria-label", key);
    mark.innerHTML = `<i data-lucide="${item?.icon || "sparkles"}"></i><span>${escapeHtml(key)}</span>`;
    changed = true;
  });
  if (changed) refreshIcons();
}

const sixArtsDesignObserverTarget = $("#sixarts-design-output");
if (sixArtsDesignObserverTarget && window.MutationObserver) {
  const sixArtsCompetencyObserver = new MutationObserver(enhanceSixArtsCompetencyMarks);
  sixArtsCompetencyObserver.observe(sixArtsDesignObserverTarget, { childList: true, subtree: true });
  enhanceSixArtsCompetencyMarks();
}

if (EDULINK_RAG_CONFIG.baseUrl && EDULINK_RAG_CONFIG.token) {
  theoryChatHistoryAdapter = createSyncedTheoryChatAdapter(EDULINK_RAG_CONFIG.baseUrl);
}
initialize();
hydrateTheoryChatHistory();
