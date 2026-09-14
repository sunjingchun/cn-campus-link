import { CAMPUSES } from "@/data";
import { hashPassword } from "@/lib/auth";
import { getDb } from "@/lib/db";
import {
  campusRoom,
  campusSlug,
  cityRoom,
  citySlug,
  type DegreeLevel,
  type MemberStatus,
  type PostCategory,
  type RoomId,
} from "@/lib/domain";
import {
  createMessage,
  createPost,
  createReply,
  createUser,
  findMemberByUsername,
  updateProfile,
} from "@/lib/store";

/**
 * A fresh clone should not open onto an empty community. Everything below is
 * demo content and every demo account shares the password `nihaocampus`, which
 * the README says out loud.
 */

export const DEMO_PASSWORD = "nihaocampus";

const ROOM = {
  njuXianlin: campusRoom(campusSlug("nju-xianlin")),
  seuJiulonghu: campusRoom(campusSlug("seu-jiulonghu")),
  nanjing: cityRoom(citySlug("nanjing")),
};

type SeedMember = {
  username: string;
  displayName: string;
  country: string;
  campus: string | null;
  status: MemberStatus;
  arrivalYear: number | null;
  program: string;
  level: DegreeLevel | null;
  languages: string[];
  interests: string[];
  bio: string;
  wechat?: string;
  instagram?: string;
};

const MEMBERS: SeedMember[] = [
  {
    username: "amina_k",
    displayName: "Amina Karimova",
    country: "KZ",
    campus: "nju-xianlin",
    status: "current",
    arrivalYear: 2023,
    program: "国际经济与贸易",
    level: "bachelor",
    languages: ["Kazakh", "Russian", "中文 HSK5", "English"],
    interests: ["羽毛球", "做饭", "citywalk"],
    bio: "在仙林第三年了。刚来的时候一个字不会说，现在能自己去菜场砍价。有关居留许可和银行卡的问题尽管问我，我全踩过坑。",
    wechat: "amina_nju",
  },
  {
    username: "jihun",
    displayName: "박지훈 Jihun Park",
    country: "KR",
    campus: "nju-xianlin",
    status: "current",
    arrivalYear: 2024,
    program: "汉语言文学",
    level: "bachelor",
    languages: ["한국어", "中文 HSK6", "English"],
    interests: ["咖啡", "摄影", "篮球"],
    bio: "南京的咖啡店我基本喝遍了。周末常在图书馆或者先锋书店，想找人一起练口语随时叫我。",
    instagram: "jihun.in.nanjing",
  },
  {
    username: "adnan_r",
    displayName: "Adnan Rahman",
    country: "PK",
    campus: "njmu-jiangning",
    status: "current",
    arrivalYear: 2022,
    program: "MBBS 临床医学",
    level: "bachelor",
    languages: ["Urdu", "English", "中文 HSK4"],
    interests: ["板球", "清真美食地图", "解剖学笔记"],
    bio: "MBBS 第三年，已经开始在附属医院轮转。江宁附近哪家清真店靠谱我最清楚，新生找我要地图。",
    wechat: "adnan_njmu",
  },
  {
    username: "lucie_m",
    displayName: "Lucie Morel",
    country: "FR",
    campus: "seu-jiulonghu",
    status: "current",
    arrivalYear: 2024,
    program: "建筑学（全英文硕士）",
    level: "master",
    languages: ["Français", "English", "中文 HSK3"],
    interests: ["建筑测绘", "骑行", "黑胶"],
    bio: "在东大读建筑。九龙湖是真的安静，但骑车环湖那一圈值回票价。找人周末去老城区写生的话算我一个。",
  },
  {
    username: "tunde_a",
    displayName: "Tunde Adebayo",
    country: "NG",
    campus: "hhu-jiangning",
    status: "current",
    arrivalYear: 2023,
    program: "水利水电工程",
    level: "master",
    languages: ["English", "Yoruba", "中文 HSK4"],
    interests: ["足球", "跑步", "做饭"],
    bio: "河海的水利专业真的很硬核。CSC 奖学金相关的申请材料我整理过一份清单，需要的私信。",
    wechat: "tunde_hhu",
  },
  {
    username: "natcha",
    displayName: "ณัฐชา Natcha S.",
    country: "TH",
    campus: "nnu-suiyuan",
    status: "current",
    arrivalYear: 2025,
    program: "汉语进修",
    level: "language",
    languages: ["ไทย", "English", "中文 HSK4"],
    interests: ["奶茶测评", "汉服", "画画"],
    bio: "随园真的太好看了，每天上课像在拍电影。语言班一年，明年打算考南师的本科。",
    instagram: "natcha.nanjing",
  },
  {
    username: "dmitri_v",
    displayName: "Dmitri Volkov",
    country: "RU",
    campus: "njust-xiaolingwei",
    status: "current",
    arrivalYear: 2022,
    program: "机械工程",
    level: "phd",
    languages: ["Русский", "English", "中文 HSK5"],
    interests: ["越野跑", "机械键盘", "围棋"],
    bio: "在南理工读博第三年。二月兰开的时候整个校区都是紫的，那两周欢迎来找我拍照。",
  },
  {
    username: "siti_n",
    displayName: "Siti Nurhaliza",
    country: "ID",
    campus: "nju-xianlin",
    status: "current",
    arrivalYear: 2024,
    program: "国际关系",
    level: "master",
    languages: ["Bahasa Indonesia", "English", "中文 HSK5"],
    interests: ["清真餐厅", "辩论", "徒步"],
    bio: "仙林周边所有清真选项我做过一份表格，新来的穆斯林同学可以直接找我要。",
    wechat: "siti_nju",
  },
  {
    username: "marco_b",
    displayName: "Marco Bianchi",
    country: "IT",
    campus: "seu-jiulonghu",
    status: "alum",
    arrivalYear: 2019,
    program: "土木工程",
    level: "master",
    languages: ["Italiano", "English", "中文 HSK5"],
    interests: ["意大利面", "桥梁", "骑行"],
    bio: "2019 到 2023 在东大，现在在上海工作。想了解毕业后留在中国工作签证怎么转的，可以问我。",
  },
  {
    username: "fatima_e",
    displayName: "Fatima El Amrani",
    country: "MA",
    campus: "njmu-jiangning",
    status: "incoming",
    arrivalYear: 2026,
    program: "MBBS 临床医学",
    level: "bachelor",
    languages: ["العربية", "Français", "English"],
    interests: ["医学英语", "烘焙", "羽毛球"],
    bio: "九月入学，现在在疯狂查资料。已经被这个网站的落地清单救了一次，谢谢大家。",
  },
  {
    username: "nguyen_ha",
    displayName: "Nguyễn Hà",
    country: "VN",
    campus: "nnu-suiyuan",
    status: "current",
    arrivalYear: 2023,
    program: "汉语国际教育",
    level: "master",
    languages: ["Tiếng Việt", "中文 HSK6", "English"],
    interests: ["书法", "徒步", "越南菜"],
    bio: "在南师读汉硕。想练中文口语的欢迎找我，我也想练英语，互相帮忙。",
  },
  {
    username: "kwame_o",
    displayName: "Kwame Osei",
    country: "GH",
    campus: "hhu-jiangning",
    status: "current",
    arrivalYear: 2025,
    program: "环境工程",
    level: "master",
    languages: ["English", "Twi", "中文 HSK3"],
    interests: ["篮球", "电子音乐", "摄影"],
    bio: "刚来半年，还在适应江宁的安静。周末想组球局的话喊我。",
  },
  {
    username: "hana_t",
    displayName: "田中はな Hana Tanaka",
    country: "JP",
    campus: null,
    status: "exploring",
    arrivalYear: null,
    program: "还在比较学校",
    level: null,
    languages: ["日本語", "English", "中文 HSK4"],
    interests: ["书店", "茶", "民国建筑"],
    bio: "在南京、杭州和西安之间纠结。有人能说说冬天没有暖气到底有多难熬吗？",
  },
  {
    username: "ahmed_s",
    displayName: "Ahmed Saleh",
    country: "EG",
    campus: "njust-xiaolingwei",
    status: "current",
    arrivalYear: 2024,
    program: "光学工程",
    level: "phd",
    languages: ["العربية", "English", "中文 HSK4"],
    interests: ["实验室", "足球", "阿拉伯咖啡"],
    bio: "南理工读博。实验室的国际网络和文献下载相关问题我比较熟，可以问。",
  },
];

type SeedPost = {
  room: RoomId;
  author: string;
  category: PostCategory;
  title: string;
  body: string;
  replies: { author: string; body: string }[];
};

const POSTS: SeedPost[] = [
  {
    room: ROOM.njuXianlin,
    author: "amina_k",
    category: "tip",
    title: "居留许可统一办理那几天，护照会被收走 7-10 天",
    body: "提醒一下九月刚来的同学：国际处统一办居留许可期间护照在出入境手里，这段时间你买不了高铁票也上不了飞机。我第一年不知道，订好的上海周末游直接作废。现在我都把十月的行程排在拿回护照之后。",
    replies: [
      { author: "jihun", body: "对，我去年也是这样。而且拿回护照那天要本人去，别让室友代领。" },
      { author: "siti_n", body: "补充一句：这期间可以用居留许可受理回执坐地铁和住酒店，但高铁和飞机真的不行。" },
    ],
  },
  {
    room: ROOM.njuXianlin,
    author: "siti_n",
    category: "question",
    title: "仙林有没有靠谱的清真外卖？食堂窗口周末不开",
    body: "周末食堂清真窗口关门，美团上搜到的几家不太确定。有没有人长期在点、可以推荐的？最好是能送到宿舍楼下的。",
    replies: [
      { author: "adnan_r", body: "南门外那家新疆餐厅美团上有店，拌面和大盘鸡稳定。老板是回族，可以直接问他。" },
      { author: "amina_k", body: "我一般买盒马的牛羊肉自己做，宿舍楼下有公共厨房。长期算下来比外卖便宜一半。" },
    ],
  },
  {
    room: ROOM.njuXianlin,
    author: "jihun",
    category: "meetup",
    title: "周六下午玄武湖骑车，凑四个人",
    body: "周六两点在地铁 2 号线新街口站集合，骑共享单车绕玄武湖一圈，大概两小时，之后去湖南路吃饭。中英文都行，不用有压力。",
    replies: [{ author: "natcha", body: "我来！可以带朋友吗，她也是南师的。" }],
  },
  {
    room: ROOM.seuJiulonghu,
    author: "lucie_m",
    category: "housing",
    title: "百家湖一居室转租，12 月起，2400/月",
    body: "因为要去上海实习半年，房子转租。百家湖地铁站走路 8 分钟，一居室带阳台，家具家电齐全，房东人很好，愿意配合做住宿登记。有意私信。",
    replies: [{ author: "kwame_o", body: "住宿登记那块具体怎么弄？我现在住宿舍没办过。" }],
  },
  {
    room: ROOM.seuJiulonghu,
    author: "marco_b",
    category: "tip",
    title: "毕业后想留在中国工作，这几步要提前一年想",
    body: "我 2023 从东大毕业，现在在上海。硕士毕业直接申请工作许可是可以的，但用人单位要有资质，而且学历认证要走教育部那一套。最好在最后一个学期就开始问 HR，别等毕业证到手才开始。",
    replies: [
      { author: "lucie_m", body: "太有用了。学历认证大概要多久？" },
      { author: "marco_b", body: "我那次走了三周，材料齐的话不算慢。关键是毕业证原件要等，所以时间卡得紧。" },
    ],
  },
  {
    room: ROOM.nanjing,
    author: "hana_t",
    category: "question",
    title: "冬天没有暖气，宿舍到底有多冷？",
    body: "在南京和西安之间选。看到很多人说南京冬天没有集中供暖，实际住下来是什么体验？空调够用吗？",
    replies: [
      { author: "dmitri_v", body: "俄罗斯人说一句：南京的冷是湿冷，零度体感比莫斯科零下十度还难受。但宿舍空调够用，买个电热毯就没问题了。" },
      { author: "nguyen_ha", body: "我第一年买了小太阳和加湿器，第二年就习惯了。真正难受的是教室，多穿一层。" },
      { author: "amina_k", body: "反过来说夏天更要命，七八月是真的热。" },
    ],
  },
  {
    room: ROOM.nanjing,
    author: "tunde_a",
    category: "tip",
    title: "CSC 奖学金材料清单（我自己踩坑整理的）",
    body: "申请材料里最容易出问题的三样：一是无犯罪记录证明要做双认证，二是推荐信必须是教授亲笔签名加联系方式，三是学习计划要写到具体研究方向，写泛了基本会被刷。时间线上，三月截止的话一月就要开始准备认证。",
    replies: [{ author: "fatima_e", body: "正好在准备，这条帮大忙了。学习计划写多少字比较合适？" }],
  },
  {
    room: ROOM.nanjing,
    author: "natcha",
    category: "market",
    title: "出一辆捷安特自行车，300，仙林自提",
    body: "骑了一年，刹车和车胎都刚换过。我明年搬去随园，用不上了。300 带锁，仙林大学城自提。",
    replies: [],
  },
];

type SeedMessage = { room: RoomId; author: string; body: string };

const MESSAGES: SeedMessage[] = [
  { room: ROOM.njuXianlin, author: "jihun", body: "早上图书馆三楼还有位置吗？" },
  { room: ROOM.njuXianlin, author: "amina_k", body: "十点半去基本没了，靠窗那排八点就满" },
  { room: ROOM.njuXianlin, author: "siti_n", body: "今天南门外新开了一家土耳其烤肉，人均 35，味道意外地正" },
  { room: ROOM.njuXianlin, author: "jihun", body: "存了，明天去试试" },
  { room: ROOM.njuXianlin, author: "amina_k", body: "顺便说一下，一卡通今天下午系统维护，食堂只能用支付宝" },
  { room: ROOM.njuXianlin, author: "siti_n", body: "多谢，差点白跑一趟" },
  { room: ROOM.seuJiulonghu, author: "lucie_m", body: "有人这周六去南京博物院吗？" },
  { room: ROOM.seuJiulonghu, author: "kwame_o", body: "我可以，几点？" },
  { room: ROOM.seuJiulonghu, author: "lucie_m", body: "十点在地铁 2 号线明故宫站见？周末要提前一天预约门票" },
  { room: ROOM.seuJiulonghu, author: "kwame_o", body: "已约，到时候见" },
  { room: ROOM.nanjing, author: "dmitri_v", body: "今天鸡鸣寺的樱花开了，人山人海，想去的早上七点前到" },
  { room: ROOM.nanjing, author: "natcha", body: "拍到照片了吗" },
  { room: ROOM.nanjing, author: "dmitri_v", body: "拍到了，但一半是人头" },
  { room: ROOM.nanjing, author: "nguyen_ha", body: "哈哈哈，这就是南京春天" },
  { room: ROOM.nanjing, author: "fatima_e", body: "九月才到，先收藏了。请问从禄口机场到市区最晚的地铁是几点？" },
  { room: ROOM.nanjing, author: "amina_k", body: "S1 号线末班大概 22:00，晚于这个时间就只能打车，140 左右" },
];

let seeded = false;

export async function ensureSeed(): Promise<void> {
  if (seeded) return;
  seeded = true;

  const db = getDb();
  const existing = db.prepare<[], { n: number }>(`SELECT COUNT(*) AS n FROM users`).get()!.n;
  if (existing > 0) return;

  const knownCampuses = new Set(CAMPUSES.map((campus) => campus.slug as string));
  const passwordHash = await hashPassword(DEMO_PASSWORD);

  for (const seed of MEMBERS) {
    const campus = seed.campus && knownCampuses.has(seed.campus) ? campusSlug(seed.campus) : null;
    const member = createUser({
      username: seed.username,
      email: `${seed.username}@demo.nihaocampus.cn`,
      passwordHash,
      displayName: seed.displayName,
      country: seed.country,
      campus,
      status: seed.status,
    });
    updateProfile(member.id, {
      displayName: seed.displayName,
      country: seed.country,
      campus,
      status: seed.status,
      arrivalYear: seed.arrivalYear,
      program: seed.program,
      level: seed.level,
      languages: seed.languages,
      interests: seed.interests,
      bio: seed.bio,
      links: {
        wechat: seed.wechat ?? null,
        instagram: seed.instagram ?? null,
        email: null,
      },
    });
  }

  const idFor = (username: string) => findMemberByUsername(username, false)?.id ?? null;

  for (const seed of POSTS) {
    const authorId = idFor(seed.author);
    if (!authorId) continue;
    const postId = createPost({
      room: seed.room,
      userId: authorId,
      category: seed.category,
      title: seed.title,
      body: seed.body,
    });
    for (const reply of seed.replies) {
      const replyAuthor = idFor(reply.author);
      if (replyAuthor) createReply({ postId, userId: replyAuthor, body: reply.body });
    }
  }

  for (const seed of MESSAGES) {
    const authorId = idFor(seed.author);
    if (authorId) createMessage({ room: seed.room, userId: authorId, body: seed.body });
  }
}

