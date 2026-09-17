/**
 * The content model for NihaoCampus.
 *
 * Everything a city or campus page renders is derived from these types. The
 * registries below (SCORE_META, LANDING_STEP_META, SPOT_META, MOTIF) are keyed
 * by literal unions, so adding a key is a compile error everywhere it must be
 * handled rather than a silently missing bar or label.
 */

import type { Localized } from "./locale";

export type { Locale, Localized } from "./locale";

export type CitySlug = string & { readonly __tag: "CitySlug" };
export type CampusSlug = string & { readonly __tag: "CampusSlug" };
export type PlaceSlug = string & { readonly __tag: "PlaceSlug" };

export function citySlug(raw: string): CitySlug {
  return raw as CitySlug;
}

export function campusSlug(raw: string): CampusSlug {
  return raw as CampusSlug;
}

export function placeSlug(raw: string): PlaceSlug {
  return raw as PlaceSlug;
}

/* -------------------------------------------------------------------------- */
/* Rooms                                                                      */
/* -------------------------------------------------------------------------- */

/** A board + chat room. Always built through the constructors below. */
export type RoomId = string & { readonly __tag: "RoomId" };

export type Room =
  | { kind: "city"; city: CitySlug }
  | { kind: "campus"; campus: CampusSlug };

export function campusRoom(slug: CampusSlug): RoomId {
  return `campus:${slug}` as RoomId;
}

export function cityRoom(slug: CitySlug): RoomId {
  return `city:${slug}` as RoomId;
}

/** Parses an untrusted room id from a URL or request body. */
export function parseRoom(raw: string): Room | null {
  const [kind, rest] = [raw.slice(0, raw.indexOf(":")), raw.slice(raw.indexOf(":") + 1)];
  if (!rest) return null;
  if (kind === "city") return { kind: "city", city: citySlug(rest) };
  if (kind === "campus") return { kind: "campus", campus: campusSlug(rest) };
  return null;
}

export function roomId(room: Room): RoomId {
  return room.kind === "city" ? cityRoom(room.city) : campusRoom(room.campus);
}

/* -------------------------------------------------------------------------- */
/* Scores                                                                     */
/* -------------------------------------------------------------------------- */

export const SCORE_KEYS = [
  "cost",
  "english",
  "community",
  "internet",
  "safety",
  "food",
  "transit",
  "social",
  "admin",
  "campus",
] as const;

export type ScoreKey = (typeof SCORE_KEYS)[number];

/** 1 = 很差, 5 = 很好. Never a raw number, so a typo cannot render a broken bar. */
export type Score = 1 | 2 | 3 | 4 | 5;

export type Scorecard = Readonly<Record<ScoreKey, Score>>;

export const SCORE_META: Readonly<Record<ScoreKey, Localized & { hint: Localized }>> = {
  cost: { zh: "生活成本", en: "Affordable", hint: { zh: "分数越高越省钱", en: "Higher is cheaper" } },
  english: {
    zh: "英语友好",
    en: "English OK",
    hint: { zh: "行政、医院、餐厅能用英语的程度", en: "How far English gets you in offices, hospitals, and restaurants" },
  },
  community: {
    zh: "国际生氛围",
    en: "Intl. community",
    hint: { zh: "留学生数量与活跃度", en: "How many international students there are, and how active they are" },
  },
  internet: {
    zh: "网络",
    en: "Internet",
    hint: { zh: "校园网速度与国际线路稳定性", en: "Campus wifi speed and how stable the international route is" },
  },
  safety: {
    zh: "安全",
    en: "Safety",
    hint: { zh: "深夜独自回宿舍的安心程度", en: "How it feels to walk back to the dorm alone at night" },
  },
  food: {
    zh: "吃饭选择",
    en: "Food",
    hint: { zh: "清真、素食、西餐的可得性", en: "Halal, vegetarian, and Western food within reach" },
  },
  transit: {
    zh: "交通",
    en: "Transit",
    hint: { zh: "地铁、公交、共享单车覆盖", en: "Metro, bus, and bike-share coverage" },
  },
  social: {
    zh: "社交夜生活",
    en: "Nightlife",
    hint: { zh: "酒吧、livehouse、周末去处", en: "Bars, livehouses, and weekend places to go" },
  },
  admin: {
    zh: "办事顺畅",
    en: "Paperwork",
    hint: { zh: "签证、居留、报到流程的折磨程度", en: "How painful visas, residence permits, and enrolment are" },
  },
  campus: {
    zh: "校园本身",
    en: "Campus",
    hint: { zh: "宿舍、图书馆、运动场的水准", en: "Dorms, libraries, and sports facilities" },
  },
};

export function overallScore(scores: Scorecard): number {
  const total = SCORE_KEYS.reduce((sum, key) => sum + scores[key], 0);
  return Math.round((total / SCORE_KEYS.length) * 20);
}

/* -------------------------------------------------------------------------- */
/* Money                                                                      */
/* -------------------------------------------------------------------------- */

export const BUDGET_TIERS = ["frugal", "comfortable", "generous"] as const;
export type BudgetTier = (typeof BUDGET_TIERS)[number];

/** CNY per month, excluding tuition. */
export type MonthlyBudget = Readonly<Record<BudgetTier, number>>;

export const BUDGET_META: Readonly<Record<BudgetTier, Localized & { hint: Localized }>> = {
  frugal: {
    zh: "省钱型",
    en: "Frugal",
    hint: { zh: "住宿舍、吃食堂、几乎不打车", en: "Dorm, canteen, almost no taxis" },
  },
  comfortable: {
    zh: "舒适型",
    en: "Comfortable",
    hint: { zh: "偶尔外卖和下馆子，周末出去玩", en: "Delivery and restaurants now and then, weekends out" },
  },
  generous: {
    zh: "宽松型",
    en: "Generous",
    hint: { zh: "校外合租、健身房、常旅行", en: "Off-campus flat, gym, regular trips" },
  },
};

export const COST_ITEMS = [
  "dormShared",
  "dormSingle",
  "rentStudio",
  "canteenMeal",
  "deliveryMeal",
  "coffee",
  "beer",
  "simPlan",
  "metroRide",
  "bikeShareMonth",
  "gymMonth",
  "haircut",
] as const;

export type CostItem = (typeof COST_ITEMS)[number];

export const COST_META: Readonly<Record<CostItem, Localized & { unit: Localized }>> = {
  dormShared: { zh: "双人宿舍", en: "Shared dorm", unit: { zh: "每月", en: "/ mo" } },
  dormSingle: { zh: "单人宿舍", en: "Single dorm", unit: { zh: "每月", en: "/ mo" } },
  rentStudio: { zh: "校外一居室", en: "Studio off campus", unit: { zh: "每月", en: "/ mo" } },
  canteenMeal: { zh: "食堂一餐", en: "Canteen meal", unit: { zh: "每餐", en: "/ meal" } },
  deliveryMeal: { zh: "外卖一单", en: "Delivery order", unit: { zh: "每单", en: "/ order" } },
  coffee: { zh: "一杯咖啡", en: "Coffee", unit: { zh: "每杯", en: "/ cup" } },
  beer: { zh: "便利店啤酒", en: "Beer", unit: { zh: "每瓶", en: "/ bottle" } },
  simPlan: { zh: "手机套餐", en: "Phone plan", unit: { zh: "每月", en: "/ mo" } },
  metroRide: { zh: "地铁单程", en: "Metro ride", unit: { zh: "每次", en: "/ ride" } },
  bikeShareMonth: { zh: "共享单车月卡", en: "Bike share", unit: { zh: "每月", en: "/ mo" } },
  gymMonth: { zh: "健身房", en: "Gym", unit: { zh: "每月", en: "/ mo" } },
  haircut: { zh: "理发", en: "Haircut", unit: { zh: "每次", en: "/ cut" } },
};

/** Rough conversion used for the secondary USD label on price tags. */
export const CNY_PER_USD = 7.1;

/* -------------------------------------------------------------------------- */
/* Places                                                                     */
/* -------------------------------------------------------------------------- */

/** 一条断言的出处。缺失即没有人核实过，这是未经查证内容的诚实默认值。 */
export type Source = {
  url: string;
  /** 读到这个 URL 的日期。政策、费用、办公时间都会过期。 */
  checkedOn: string;
  /** 页面的性质，让读者自己判断权重。 */
  kind: "official" | "university" | "secondary";
};

export const SOURCE_KIND_META: Readonly<
  Record<Source["kind"], { zh: string; en: string; className: string }>
> = {
  official: { zh: "官方来源", en: "Official", className: "text-jade dark:text-jade" },
  university: { zh: "高校国际处", en: "University", className: "text-primary" },
  secondary: { zh: "第三方整理", en: "Secondary", className: "text-sky-700 dark:text-sky-400" },
};

/**
 * A physical place. `name` is bilingual so a page can show English to the
 * student. `address` stays a bare Chinese string: a student shows it to a taxi
 * driver or a clerk, and translating it would make that job worse.
 *
 * `sources` must be present so omitting the field is a type error. An empty
 * array is allowed and means unverified. `lat` and `lng` feed map deeplinks.
 */
export type Place = {
  slug: PlaceSlug;
  name: Localized;
  address: string;
  lat: number;
  lng: number;
  sources: Source[];
  hours?: Localized;
  note?: Localized;
  phone?: string;
  appointment?: boolean;
};

/* -------------------------------------------------------------------------- */
/* Landing checklist                                                          */
/* -------------------------------------------------------------------------- */

export const LANDING_STEPS = [
  "registration",
  "tempResidence",
  "healthCheck",
  "residencePermit",
  "simCard",
  "bankAccount",
  "mobilePay",
  "campusCard",
  "insurance",
] as const;

export type LandingStepId = (typeof LANDING_STEPS)[number];

export const LANDING_STEP_META: Readonly<Record<LandingStepId, Localized & { why: Localized }>> = {
  registration: {
    zh: "学校报到",
    en: "Enrol at the university",
    why: { zh: "拿到学生证和录取材料原件，后面每一步都要用", en: "You need the student card and original admission papers for every later step" },
  },
  tempResidence: {
    zh: "住宿登记",
    en: "Police residence registration",
    why: {
      zh: "法律要求，入住后 24 小时内完成，缺了它办不了居留许可",
      en: "The law wants this within 24 hours of moving in. Without it you cannot apply for a residence permit",
    },
  },
  healthCheck: {
    zh: "境外人员体检",
    en: "Health check",
    why: { zh: "居留许可的前置材料，出报告要几天，越早越好", en: "A residence-permit prerequisite. The report takes a few days, so go early" },
  },
  residencePermit: {
    zh: "居留许可",
    en: "Residence permit",
    why: { zh: "把入境签证换成可多次出入境的居留许可", en: "Swap the entry visa for a residence permit you can exit and re-enter on" },
  },
  simCard: {
    zh: "办手机卡",
    en: "Get a SIM card",
    why: {
      zh: "没有中国手机号就注册不了支付宝、微信支付和几乎所有 App",
      en: "Without a Chinese number you cannot register Alipay, WeChat Pay, or almost any app",
    },
  },
  bankAccount: {
    zh: "开银行卡",
    en: "Open a bank account",
    why: { zh: "收奖学金、绑定支付、交学费都靠它", en: "Scholarships, mobile pay, and tuition all go through this card" },
  },
  mobilePay: {
    zh: "绑定移动支付",
    en: "Set up mobile payment",
    why: { zh: "食堂、地铁、买菜、看医生都在手机里", en: "Canteen, metro, groceries, and clinics all run on the phone" },
  },
  campusCard: {
    zh: "校园卡与校园网",
    en: "Campus card & network",
    why: { zh: "食堂、图书馆、宿舍门禁、上网都是这张卡", en: "Canteen, library, dorm doors, and wifi all use this card" },
  },
  insurance: {
    zh: "购买商业医保",
    en: "Buy health insurance",
    why: { zh: "教育部规定的必买项，没有保单不给注册", en: "The education ministry requires it. No policy, no enrolment" },
  },
};

export type LandingStep = {
  deadline: Localized;
  place: PlaceSlug;
  bring: Localized[];
  feeCny: number | null;
  minutes: number | null;
  tips: Localized[];
  warning?: Localized;
  sources?: Source[];
};

/** Keyed so a campus cannot ship with a step missing. Render in LANDING_STEPS order. */
export type LandingChecklist = Readonly<Record<LandingStepId, LandingStep>>;

/* -------------------------------------------------------------------------- */
/* Around campus                                                              */
/* -------------------------------------------------------------------------- */

export const SPOT_CATEGORIES = [
  "canteen",
  "halal",
  "western",
  "grocery",
  "cafe",
  "bar",
  "gym",
  "clinic",
  "barber",
  "laundry",
  "courier",
  "study",
] as const;

export type SpotCategory = (typeof SPOT_CATEGORIES)[number];

export const SPOT_META: Readonly<
  Record<SpotCategory, { zh: string; en: string; emoji: string }>
> = {
  canteen: { zh: "食堂", en: "Canteen", emoji: "🍚" },
  halal: { zh: "清真/穆斯林友好", en: "Halal", emoji: "🥙" },
  western: { zh: "西餐与外国菜", en: "Western", emoji: "🍕" },
  grocery: { zh: "超市与菜场", en: "Groceries", emoji: "🧺" },
  cafe: { zh: "咖啡", en: "Cafe", emoji: "☕" },
  bar: { zh: "酒吧与夜场", en: "Bar", emoji: "🍻" },
  gym: { zh: "运动健身", en: "Gym", emoji: "🏸" },
  clinic: { zh: "看病", en: "Clinic", emoji: "🏥" },
  barber: { zh: "理发", en: "Barber", emoji: "💈" },
  laundry: { zh: "洗衣", en: "Laundry", emoji: "🧺" },
  courier: { zh: "快递与打印", en: "Courier", emoji: "📦" },
  study: { zh: "自习与图书馆", en: "Study", emoji: "📚" },
};

export const SPOT_SITUATIONS = ["errands", "eat", "live", "daily"] as const;
export type SpotSituation = (typeof SPOT_SITUATIONS)[number];

export const SPOT_SITUATION_META: Readonly<Record<SpotSituation, Localized>> = {
  errands: { zh: "今天要办事", en: "Errands today" },
  eat: { zh: "今天要吃饭", en: "Eat today" },
  live: { zh: "要住哪儿", en: "Where to sleep" },
  daily: { zh: "日常", en: "Daily life" },
};

export const SPOT_SITUATION_CATEGORIES: Readonly<
  Record<SpotSituation, readonly SpotCategory[]>
> = {
  errands: ["clinic", "courier"],
  eat: ["canteen", "halal", "western", "grocery", "cafe"],
  live: ["laundry", "barber", "grocery"],
  daily: ["gym", "study", "bar"],
};

export const GATE_SIDES = ["north", "east", "south", "west"] as const;
export type GateSide = (typeof GATE_SIDES)[number];

export type CampusGate = {
  side: GateSide;
  name: Localized;
  note: Localized;
  walkMinutes: number | null;
};

export type CampusOrientation = {
  address: Localized;
  gates: readonly [CampusGate, CampusGate, CampusGate, CampusGate];
};

export const ENGLISH_LEVELS = ["none", "some", "good"] as const;
export type EnglishLevel = (typeof ENGLISH_LEVELS)[number];

export const ENGLISH_LEVEL_META: Readonly<Record<EnglishLevel, { zh: string; en: string }>> = {
  none: { zh: "只能说中文", en: "Chinese only" },
  some: { zh: "连蒙带猜能沟通", en: "A little English" },
  good: { zh: "英语没问题", en: "English fine" },
};

export type Spot = {
  category: SpotCategory;
  place: PlaceSlug;
  where: Localized;
  walkMinutes: number;
  priceCny: number | null;
  english: EnglishLevel;
  blurb: Localized;
};

export type Neighborhood = {
  name: Localized;
  vibe: Localized;
  rentCny: readonly [number, number];
  /** Yearly dorm fees from a brochure, not monthly studio rent. */
  rentUnit?: "month" | "year";
  commute: Localized;
  goodFor: Localized[];
  watchOut?: Localized;
};

export const TRANSPORT_MODES = ["metro", "bus", "taxi", "bike", "rail", "walk"] as const;
export type TransportMode = (typeof TRANSPORT_MODES)[number];

export const TRANSPORT_META: Readonly<Record<TransportMode, { zh: string; en: string }>> = {
  metro: { zh: "地铁", en: "Metro" },
  bus: { zh: "公交", en: "Bus" },
  taxi: { zh: "打车", en: "Taxi" },
  bike: { zh: "骑车", en: "Bike" },
  rail: { zh: "高铁", en: "Train" },
  walk: { zh: "步行", en: "Walk" },
};

export type TransportLeg = {
  to: Localized;
  mode: TransportMode;
  minutes: number | null;
  cny: number | null;
  note?: Localized;
};

/* -------------------------------------------------------------------------- */
/* Weather                                                                    */
/* -------------------------------------------------------------------------- */

export type MonthWeather = {
  /** 1-12 */
  month: number;
  highC: number;
  lowC: number;
  rainDays: number;
  aqi: number;
};

export const MONTH_LABELS: readonly Localized[] = [
  { zh: "1月", en: "Jan" },
  { zh: "2月", en: "Feb" },
  { zh: "3月", en: "Mar" },
  { zh: "4月", en: "Apr" },
  { zh: "5月", en: "May" },
  { zh: "6月", en: "Jun" },
  { zh: "7月", en: "Jul" },
  { zh: "8月", en: "Aug" },
  { zh: "9月", en: "Sep" },
  { zh: "10月", en: "Oct" },
  { zh: "11月", en: "Nov" },
  { zh: "12月", en: "Dec" },
];

/** Exactly twelve entries, January first, so the climate strip can never gap. */
export type Climate = readonly [
  MonthWeather,
  MonthWeather,
  MonthWeather,
  MonthWeather,
  MonthWeather,
  MonthWeather,
  MonthWeather,
  MonthWeather,
  MonthWeather,
  MonthWeather,
  MonthWeather,
  MonthWeather,
];

/* -------------------------------------------------------------------------- */
/* Card art                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Cards are drawn, not photographed. A motif plus three gradient stops is
 * enough to make every card feel distinct without shipping image assets or
 * depending on a CDN at runtime.
 */
export const MOTIFS = [
  "pagoda",
  "cityWall",
  "bridge",
  "tower",
  "lake",
  "gate",
  "skyline",
  "temple",
  "mountain",
  "harbour",
] as const;

export type Motif = (typeof MOTIFS)[number];

export type CardArt = {
  motif: Motif;
  /** CSS colours, darkest last. Used for the animated mesh behind the motif. */
  from: string;
  via: string;
  to: string;
};

/* -------------------------------------------------------------------------- */
/* Cities and campuses                                                        */
/* -------------------------------------------------------------------------- */

export type City = {
  slug: CitySlug;
  name: Localized;
  pinyin: string;
  province: Localized;
  tagline: Localized;
  summary: Localized;
  art: CardArt;
  populationMillions: number;
  metroLines: number;
  scores: Scorecard;
  budget: MonthlyBudget;
  climate: Climate;
  highlights: Localized[];
  arrivals: TransportLeg[];
};

export type CampusFacts = {
  university: Localized;
  campusName: Localized;
  foundedYear: number;
  internationalStudents: number;
  countries: number;
  /** How the two headcount fields were counted, if that is not "students now". */
  statNote?: Localized;
  teachingLanguages: ("zh" | "en")[];
  tuitionCnyPerYear: readonly [number, number];
  dormGuaranteed: boolean;
  offCampusAllowed: boolean;
  scholarshipNote: Localized;
  applicationWindow: Localized;
  website: string;
};

export type Campus = {
  slug: CampusSlug;
  visaOffice: PlaceSlug;
  facts: CampusFacts;
  tagline: Localized;
  summary: Localized;
  art: CardArt;
  scores: Scorecard;
  budget: MonthlyBudget;
  costs: Partial<Record<CostItem, number>>;
  landing: LandingChecklist;
  orientation?: CampusOrientation;
  neighborhoods: Neighborhood[];
  spots: Spot[];
  transport: TransportLeg[];
  pros: Localized[];
  cons: Localized[];
  faq: { q: Localized; a: Localized }[];
};

/** What a city or campus module exports. */
export type CityPack = {
  city: City;
  campuses: Campus[];
};

/* -------------------------------------------------------------------------- */
/* Member profiles                                                            */
/* -------------------------------------------------------------------------- */

export const MEMBER_STATUSES = ["current", "incoming", "alum", "exploring"] as const;
export type MemberStatus = (typeof MEMBER_STATUSES)[number];

export const MEMBER_STATUS_META: Readonly<
  Record<MemberStatus, { zh: string; en: string; tone: string }>
> = {
  current: { zh: "在读", en: "On campus", tone: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  incoming: { zh: "即将入学", en: "Arriving soon", tone: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
  alum: { zh: "已毕业", en: "Alum", tone: "bg-sky-500/15 text-sky-700 dark:text-sky-300" },
  exploring: { zh: "还在选校", en: "Still deciding", tone: "bg-violet-500/15 text-violet-700 dark:text-violet-300" },
};

export const DEGREE_LEVELS = ["language", "bachelor", "master", "phd", "exchange"] as const;
export type DegreeLevel = (typeof DEGREE_LEVELS)[number];

export const DEGREE_LEVEL_META: Readonly<Record<DegreeLevel, { zh: string; en: string }>> = {
  language: { zh: "语言生", en: "Language" },
  bachelor: { zh: "本科", en: "Bachelor" },
  master: { zh: "硕士", en: "Master" },
  phd: { zh: "博士", en: "PhD" },
  exchange: { zh: "交换生", en: "Exchange" },
};

/* -------------------------------------------------------------------------- */
/* Board                                                                      */
/* -------------------------------------------------------------------------- */

export const POST_CATEGORIES = ["question", "tip", "housing", "meetup", "market"] as const;
export type PostCategory = (typeof POST_CATEGORIES)[number];

export const POST_CATEGORY_META: Readonly<
  Record<PostCategory, { zh: string; en: string; emoji: string }>
> = {
  question: { zh: "提问", en: "Question", emoji: "❓" },
  tip: { zh: "经验", en: "Tip", emoji: "💡" },
  housing: { zh: "租房", en: "Housing", emoji: "🏠" },
  meetup: { zh: "约人", en: "Meetup", emoji: "🎉" },
  market: { zh: "二手", en: "Market", emoji: "🛒" },
};

/* -------------------------------------------------------------------------- */
/* Events                                                                     */
/* -------------------------------------------------------------------------- */

export const EVENT_NAMES = [
  "page_view",
  "campus_view",
  "place_view",
  "step_open",
  "step_mark",
  "step_done",
  "copy_address",
  "map_deeplink",
  "locale_switch",
  "source_click",
  "note_read",
  "note_write",
  "register_start",
  "register_done",
] as const;

export type EventName = (typeof EVENT_NAMES)[number];

export const EVENT_META: Readonly<Record<EventName, Localized & { why: Localized }>> = {
  page_view: { zh: "页面浏览", en: "Page view", why: { zh: "有没有流量", en: "Is anyone coming" } },
  campus_view: { zh: "打开校区页", en: "Campus view", why: { zh: "首页有没有讲清这是什么", en: "Did the home page explain what this is" } },
  place_view: { zh: "打开地点页", en: "Place view", why: { zh: "地点页有没有被打开", en: "Did anyone open a place page" } },
  step_open: { zh: "打开落地步骤", en: "Open a landing step", why: { zh: "落地清单是不是他要的东西", en: "Is the checklist the thing they came for" } },
  step_mark: { zh: "标一下", en: "Mark a step", why: { zh: "清单够不够具体到能照着做", en: "Is the checklist concrete enough to follow" } },
  step_done: { zh: "标完成", en: "Mark a step done", why: { zh: "计划了有没有真的办完", en: "Did they actually finish what they planned" } },
  copy_address: { zh: "复制地址", en: "Copy address", why: { zh: "他是不是打算去", en: "Are they about to go" } },
  map_deeplink: { zh: "打开地图", en: "Open a map link", why: { zh: "他是不是打算去", en: "Are they about to go" } },
  locale_switch: { zh: "切换语言", en: "Switch locale", why: { zh: "语言是不是挡路", en: "Is language in the way" } },
  source_click: { zh: "点开来源", en: "Open a source", why: { zh: "他核不核验事实", en: "Do they check the sources" } },
  note_read: { zh: "读经验", en: "Read a note", why: { zh: "供给侧有没有被消费", en: "Are notes being read" } },
  note_write: { zh: "写经验", en: "Write a note", why: { zh: "办完的人有没有留下经验", en: "Do people who finished leave a note" } },
  register_start: { zh: "开始注册", en: "Start registration", why: { zh: "漏斗在注册前断在哪", en: "Where the funnel dies before sign-up" } },
  register_done: { zh: "注册完成", en: "Finish registration", why: { zh: "有多少人真的注册了", en: "How many people actually register" } },
};

/** Ordered prefix of Appendix F's main funnel. The 7-day return is derived, not an event. */
export const FUNNEL_EVENT_NAMES = [
  "campus_view",
  "step_open",
  "step_mark",
  "step_done",
] as const satisfies readonly EventName[];

export const INTENT_EVENT_NAMES = ["copy_address", "map_deeplink"] as const satisfies readonly EventName[];

/* -------------------------------------------------------------------------- */
/* Formatting                                                                 */
/* -------------------------------------------------------------------------- */

export function cny(amount: number): string {
  return `¥${amount.toLocaleString("zh-CN")}`;
}

export function usd(amountCny: number): string {
  return `$${Math.round(amountCny / CNY_PER_USD).toLocaleString("en-US")}`;
}
