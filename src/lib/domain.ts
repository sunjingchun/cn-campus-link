/**
 * The content model for NihaoCampus.
 *
 * Everything a city or campus page renders is derived from these types. The
 * registries below (SCORE_META, LANDING_STEP_META, SPOT_META, MOTIF) are keyed
 * by literal unions, so adding a key is a compile error everywhere it must be
 * handled rather than a silently missing bar or label.
 */

export type CitySlug = string & { readonly __tag: "CitySlug" };
export type CampusSlug = string & { readonly __tag: "CampusSlug" };

export function citySlug(raw: string): CitySlug {
  return raw as CitySlug;
}

export function campusSlug(raw: string): CampusSlug {
  return raw as CampusSlug;
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

export const SCORE_META: Readonly<
  Record<ScoreKey, { zh: string; en: string; hint: string }>
> = {
  cost: { zh: "生活成本", en: "Affordable", hint: "分数越高越省钱" },
  english: { zh: "英语友好", en: "English OK", hint: "行政、医院、餐厅能用英语的程度" },
  community: { zh: "国际生氛围", en: "Intl. community", hint: "留学生数量与活跃度" },
  internet: { zh: "网络", en: "Internet", hint: "校园网速度与国际线路稳定性" },
  safety: { zh: "安全", en: "Safety", hint: "深夜独自回宿舍的安心程度" },
  food: { zh: "吃饭选择", en: "Food", hint: "清真、素食、西餐的可得性" },
  transit: { zh: "交通", en: "Transit", hint: "地铁、公交、共享单车覆盖" },
  social: { zh: "社交夜生活", en: "Nightlife", hint: "酒吧、livehouse、周末去处" },
  admin: { zh: "办事顺畅", en: "Paperwork", hint: "签证、居留、报到流程的折磨程度" },
  campus: { zh: "校园本身", en: "Campus", hint: "宿舍、图书馆、运动场的水准" },
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

export const BUDGET_META: Readonly<
  Record<BudgetTier, { zh: string; en: string; hint: string }>
> = {
  frugal: { zh: "省钱型", en: "Frugal", hint: "住宿舍、吃食堂、几乎不打车" },
  comfortable: { zh: "舒适型", en: "Comfortable", hint: "偶尔外卖和下馆子，周末出去玩" },
  generous: { zh: "宽松型", en: "Generous", hint: "校外合租、健身房、常旅行" },
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

export const COST_META: Readonly<
  Record<CostItem, { zh: string; en: string; unit: string }>
> = {
  dormShared: { zh: "双人宿舍", en: "Shared dorm", unit: "每月" },
  dormSingle: { zh: "单人宿舍", en: "Single dorm", unit: "每月" },
  rentStudio: { zh: "校外一居室", en: "Studio off campus", unit: "每月" },
  canteenMeal: { zh: "食堂一餐", en: "Canteen meal", unit: "每餐" },
  deliveryMeal: { zh: "外卖一单", en: "Delivery order", unit: "每单" },
  coffee: { zh: "一杯咖啡", en: "Coffee", unit: "每杯" },
  beer: { zh: "便利店啤酒", en: "Beer", unit: "每瓶" },
  simPlan: { zh: "手机套餐", en: "Phone plan", unit: "每月" },
  metroRide: { zh: "地铁单程", en: "Metro ride", unit: "每次" },
  bikeShareMonth: { zh: "共享单车月卡", en: "Bike share", unit: "每月" },
  gymMonth: { zh: "健身房", en: "Gym", unit: "每月" },
  haircut: { zh: "理发", en: "Haircut", unit: "每次" },
};

/** Rough conversion used for the secondary USD label on price tags. */
export const CNY_PER_USD = 7.1;

/* -------------------------------------------------------------------------- */
/* Places                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * A physical place. `name` and `address` stay in Chinese on purpose: the whole
 * point is that a student can show them to a taxi driver or a clerk.
 */
export type Place = {
  name: string;
  nameEn: string;
  address: string;
  hours?: string;
  note?: string;
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

export const LANDING_STEP_META: Readonly<
  Record<LandingStepId, { zh: string; en: string; why: string }>
> = {
  registration: { zh: "学校报到", en: "Enrol at the university", why: "拿到学生证和录取材料原件，后面每一步都要用" },
  tempResidence: { zh: "住宿登记", en: "Police residence registration", why: "法律要求，到中国 24 小时内（校外住宿）完成，缺了它办不了居留许可" },
  healthCheck: { zh: "境外人员体检", en: "Health check", why: "居留许可的前置材料，出报告要几天，越早越好" },
  residencePermit: { zh: "居留许可", en: "Residence permit", why: "把入境签证换成可多次出入境的居留许可" },
  simCard: { zh: "办手机卡", en: "Get a SIM card", why: "没有中国手机号就注册不了支付宝、微信支付和几乎所有 App" },
  bankAccount: { zh: "开银行卡", en: "Open a bank account", why: "收奖学金、绑定支付、交学费都靠它" },
  mobilePay: { zh: "绑定移动支付", en: "Set up mobile payment", why: "食堂、地铁、买菜、看医生都在手机里" },
  campusCard: { zh: "校园卡与校园网", en: "Campus card & network", why: "食堂、图书馆、宿舍门禁、上网都是这张卡" },
  insurance: { zh: "购买商业医保", en: "Buy health insurance", why: "教育部规定的必买项，没有保单不给注册" },
};

export type LandingStep = {
  id: LandingStepId;
  /** 何时做，例如 "抵达后 24 小时内". */
  deadline: string;
  place: Place;
  /** 需要带的材料. */
  bring: string[];
  feeCny: number | null;
  /** 现场大概要花的时间，分钟. */
  minutes: number | null;
  tips: string[];
  warning?: string;
};

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

export const ENGLISH_LEVELS = ["none", "some", "good"] as const;
export type EnglishLevel = (typeof ENGLISH_LEVELS)[number];

export const ENGLISH_LEVEL_META: Readonly<Record<EnglishLevel, { zh: string; en: string }>> = {
  none: { zh: "只能说中文", en: "Chinese only" },
  some: { zh: "连蒙带猜能沟通", en: "A little English" },
  good: { zh: "英语没问题", en: "English fine" },
};

export type Spot = {
  category: SpotCategory;
  name: string;
  nameEn: string;
  /** 相对校园的位置，例如 "南门外过马路 200m". */
  where: string;
  walkMinutes: number;
  /** 人均或单次价格，CNY. */
  priceCny: number | null;
  english: EnglishLevel;
  /** 一句话点评，学生口吻. */
  blurb: string;
};

export type Neighborhood = {
  name: string;
  nameEn: string;
  vibe: string;
  /** 一居室月租区间，CNY. */
  rentCny: readonly [number, number];
  commute: string;
  goodFor: string[];
  watchOut?: string;
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
  to: string;
  toEn: string;
  mode: TransportMode;
  minutes: number;
  cny: number;
  note?: string;
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

export const MONTH_LABELS = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"] as const;

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
  name: string;
  nameEn: string;
  pinyin: string;
  province: string;
  tagline: string;
  taglineEn: string;
  summary: string;
  art: CardArt;
  populationMillions: number;
  metroLines: number;
  scores: Scorecard;
  budget: MonthlyBudget;
  climate: MonthWeather[];
  highlights: string[];
  /** 出入境管理局，办居留许可的地方. */
  visaOffice: Place;
  arrivals: TransportLeg[];
};

export type CampusFacts = {
  university: string;
  universityEn: string;
  campusName: string;
  campusNameEn: string;
  foundedYear: number;
  internationalStudents: number;
  countries: number;
  teachingLanguages: ("zh" | "en")[];
  tuitionCnyPerYear: readonly [number, number];
  dormGuaranteed: boolean;
  offCampusAllowed: boolean;
  scholarshipNote: string;
  applicationWindow: string;
  website: string;
};

export type Campus = {
  slug: CampusSlug;
  facts: CampusFacts;
  tagline: string;
  taglineEn: string;
  summary: string;
  art: CardArt;
  scores: Scorecard;
  budget: MonthlyBudget;
  costs: Partial<Record<CostItem, number>>;
  landing: LandingStep[];
  neighborhoods: Neighborhood[];
  spots: Spot[];
  transport: TransportLeg[];
  pros: string[];
  cons: string[];
  faq: { q: string; a: string }[];
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
/* Formatting                                                                 */
/* -------------------------------------------------------------------------- */

export function cny(amount: number): string {
  return `¥${amount.toLocaleString("zh-CN")}`;
}

export function usd(amountCny: number): string {
  return `$${Math.round(amountCny / CNY_PER_USD).toLocaleString("en-US")}`;
}
