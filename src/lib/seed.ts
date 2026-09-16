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
  createPost,
  createReply,
  createUser,
  findMemberByUsername,
  updateProfile,
} from "@/lib/store";

/**
 * Demo members and threads. Production never sets NIHAOCAMPUS_SEED_DEMO, so
 * these accounts stay out of the live users table. There is no is_demo column.
 */

export const DEMO_PASSWORD = "nihaocampus";

export function seedDemoEnabled(): boolean {
  return process.env.NIHAOCAMPUS_SEED_DEMO === "1";
}

const ROOM = {
  njuXianlin: campusRoom(campusSlug("nju-xianlin")),
  seuJiulonghu: campusRoom(campusSlug("seu-jiulonghu")),
  blcu: campusRoom(campusSlug("blcu")),
  scuWangjiang: campusRoom(campusSlug("scu-wangjiang")),
  nanjing: cityRoom(citySlug("nanjing")),
  shanghai: cityRoom(citySlug("shanghai")),
  beijing: cityRoom(citySlug("beijing")),
  chengdu: cityRoom(citySlug("chengdu")),
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
  {
    username: "yerlan_b",
    displayName: "Yerlan Bekov",
    country: "KZ",
    campus: "blcu",
    status: "current",
    arrivalYear: 2025,
    program: "汉语进修",
    level: "language",
    languages: ["Қазақша", "Русский", "中文 HSK3", "English"],
    interests: ["滑板", "说唱", "火锅"],
    bio: "北语真的像个小联合国，我们班十二个人来自十一个国家。语言班的教材和分班考试我可以讲讲。",
    wechat: "yerlan_blcu",
  },
  {
    username: "mei_lin",
    displayName: "Mei Lin Tan",
    country: "MY",
    campus: "blcu",
    status: "current",
    arrivalYear: 2024,
    program: "汉语国际教育",
    level: "bachelor",
    languages: ["Bahasa Melayu", "English", "中文 HSK6"],
    interests: ["书法", "咖啡", "骑车"],
    bio: "在北语第二年。五道口这一片吃的太多了，想要清真和素食清单的找我。",
  },
  {
    username: "elena_r",
    displayName: "Elena Rossi",
    country: "IT",
    campus: "pku-yanyuan",
    status: "current",
    arrivalYear: 2023,
    program: "中国政治与国际关系",
    level: "master",
    languages: ["Italiano", "English", "中文 HSK5"],
    interests: ["未名湖跑步", "档案馆", "话剧"],
    bio: "燕园两年。北大的图书馆和讲座资源是真的顶，但宿舍条件要有心理准备。",
  },
  {
    username: "daniel_o",
    displayName: "Daniel Okafor",
    country: "NG",
    campus: "fudan-handan",
    status: "current",
    arrivalYear: 2024,
    program: "公共卫生",
    level: "master",
    languages: ["English", "Igbo", "中文 HSK3"],
    interests: ["篮球", "创业", "爵士"],
    bio: "复旦邯郸校区。上海贵是真的贵，但实习和工作机会也是真的多。想聊求职随时。",
    instagram: "danielinshanghai",
  },
  {
    username: "yuki_s",
    displayName: "佐藤ゆき Yuki Sato",
    country: "JP",
    campus: "sjtu-minhang",
    status: "current",
    arrivalYear: 2025,
    program: "计算机科学（全英文硕士）",
    level: "master",
    languages: ["日本語", "English", "中文 HSK4"],
    interests: ["算法", "拉面", "摄影"],
    bio: "闵行校区很大也很安静，适合写代码。周末进市区来回两小时，要有准备。",
  },
  {
    username: "aigerim",
    displayName: "Aigerim Tulegenova",
    country: "UZ",
    campus: "zju-zijingang",
    status: "current",
    arrivalYear: 2023,
    program: "生物医学工程",
    level: "phd",
    languages: ["Oʻzbekcha", "Русский", "English", "中文 HSK4"],
    interests: ["实验室", "西湖徒步", "烘焙"],
    bio: "浙大紫金港读博。杭州的生活质量在这个价位很难被打败，缺点是六月的梅雨。",
    wechat: "aigerim_zju",
  },
  {
    username: "carlos_m",
    displayName: "Carlos Mendoza",
    country: "MX",
    campus: "scu-wangjiang",
    status: "current",
    arrivalYear: 2024,
    program: "汉语言",
    level: "bachelor",
    languages: ["Español", "English", "中文 HSK4"],
    interests: ["火锅", "熊猫", "吉他"],
    bio: "成都是我去过最舒服的中国城市，物价低、人友好、吃的能吃一年不重样。望江校区就在锦江边上。",
    instagram: "carlos.en.chengdu",
  },
  {
    username: "farhan_i",
    displayName: "Farhan Iqbal",
    country: "PK",
    campus: "uestc-qingshuihe",
    status: "current",
    arrivalYear: 2022,
    program: "电子信息工程",
    level: "phd",
    languages: ["Urdu", "English", "中文 HSK4"],
    interests: ["硬件", "板球", "清真餐厅"],
    bio: "电子科大清水河，工科氛围很浓。清水河这边清真选择少，我一般自己做饭。",
  },
  {
    username: "sofia_g",
    displayName: "Sofía García",
    country: "ES",
    campus: "xjtu-xingqing",
    status: "current",
    arrivalYear: 2024,
    program: "国际贸易",
    level: "bachelor",
    languages: ["Español", "English", "中文 HSK4"],
    interests: ["城墙骑行", "肉夹馍", "西班牙语角"],
    bio: "西安是性价比之王，一个月三千块能过得很舒服。冬天有暖气这一点对我来说是决定性的。",
  },
  {
    username: "batbold",
    displayName: "Batbold Ganbaatar",
    country: "MN",
    campus: "nwpu-changan",
    status: "current",
    arrivalYear: 2023,
    program: "航空航天工程",
    level: "master",
    languages: ["Монгол", "中文 HSK5", "English"],
    interests: ["模型飞机", "摔跤", "羊肉"],
    bio: "西工大长安校区，离市区确实远，但学费和生活费加起来是我比较过的学校里最低的。",
  },
  {
    username: "lin_zhe",
    displayName: "Chayada P.",
    country: "TH",
    campus: "hznu-cangqian",
    status: "incoming",
    arrivalYear: 2026,
    program: "对外汉语",
    level: "bachelor",
    languages: ["ไทย", "English", "中文 HSK3"],
    interests: ["奶茶", "vlog", "阿里巴巴园区"],
    bio: "九月去杭师大仓前。听说旁边就是阿里，有点好奇是什么体验。",
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
  {
    room: ROOM.blcu,
    author: "yerlan_b",
    category: "tip",
    title: "北语分班考试别故意考低，真的会后悔",
    body: "很多人觉得分到低一级轻松，其实一年下来差距很大。分班考试按真实水平考，跟不上可以申请降级，反过来往上跳就很难了。另外口语课比精读课更能决定你半年后能不能自己去医院。",
    replies: [
      { author: "mei_lin", body: "同意。我第一年就是被分低了，整整浪费半个学期。" },
      { author: "carlos_m", body: "川大这边也一样，考试那天别摆烂。" },
    ],
  },
  {
    room: ROOM.blcu,
    author: "mei_lin",
    category: "meetup",
    title: "每周三晚上五道口语言交换，中英文各一半",
    body: "在学校东门外的咖啡店，七点到九点。前一小时只说中文，后一小时只说英语，规则很严格所以进步很快。现在固定来的有六七个人，随时可以加入。",
    replies: [{ author: "yerlan_b", body: "这周我带两个同学来。" }],
  },
  {
    room: ROOM.scuWangjiang,
    author: "carlos_m",
    category: "tip",
    title: "成都看病：华西的国际门诊比想象中好用",
    body: "华西第二住院楼有国际医疗部，能说英语，挂号比普通门诊贵但不用排四小时。留学生商业保险大部分能报，记得留发票原件和病历复印件，报销要一起交。",
    replies: [
      { author: "farhan_i", body: "存了。普通门诊我上次排了三个半小时。" },
      { author: "adnan_r", body: "医学生补充一句：急诊任何时候都别犹豫，直接去。" },
    ],
  },
  {
    room: ROOM.shanghai,
    author: "daniel_o",
    category: "housing",
    title: "上海租房，中介费和押金的规矩要提前搞清楚",
    body: "标准是押一付三，中介费一般是一个月房租，这两项加起来第一次要拿出四五个月的钱。签合同前一定要确认房东能配合做住宿登记，不然你办不了居留许可。我第一次就踩了这个坑，房东在外地，拖了两周。",
    replies: [
      { author: "yuki_s", body: "补一句：一定要看房产证原件，二房东转租的坑很多。" },
      { author: "marco_b", body: "上海这块我熟，需要的话可以帮忙看合同。" },
    ],
  },
  {
    room: ROOM.beijing,
    author: "elena_r",
    category: "question",
    title: "北京冬天到底要买多厚的羽绒服？",
    body: "来自意大利南部，没见过零下十度。看攻略说北京室内有暖气很热，室外很冷，所以到底该怎么穿？",
    replies: [
      { author: "batbold", body: "蒙古人的建议：里面穿薄，外面一件够厚的长款羽绒服，因为你一直在进出暖气房。" },
      { author: "yerlan_b", body: "加一双防滑的鞋，一月份路面会结冰。" },
      { author: "dmitri_v", body: "北京是干冷，比南京的湿冷好受多了，别太担心。" },
    ],
  },
  {
    room: ROOM.chengdu,
    author: "sofia_g",
    category: "question",
    title: "成都和西安，哪个更适合预算紧的本科生？",
    body: "我在西安，朋友在成都，我们一直在比。成都吃的确实多，但西安冬天有暖气而且房租更低。有没有两边都待过的人说说？",
    replies: [
      { author: "carlos_m", body: "成都的生活成本比西安高一点点，但选择多很多。看你是想省钱还是想玩。" },
      { author: "farhan_i", body: "清真餐厅的话西安完胜，回民街那一片是全国最方便的。" },
    ],
  },
];

let seeded = false;

function userCount(): number {
  return getDb().prepare<[], { n: number }>(`SELECT COUNT(*) AS n FROM users`).get()!.n;
}

export async function ensureSeed(): Promise<void> {
  if (!seedDemoEnabled()) return;
  if (seeded || userCount() > 0) {
    seeded = true;
    return;
  }

  const knownCampuses = new Set(CAMPUSES.map((campus) => campus.slug as string));
  const passwordHash = await hashPassword(DEMO_PASSWORD);
  const db = getDb();

  try {
    db.exec("BEGIN IMMEDIATE");
  } catch {
    seeded = true;
    return;
  }

  let open = true;
  try {
    if (userCount() > 0) {
      seeded = true;
      return;
    }

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

    seeded = true;
  } catch (error) {
    db.exec("ROLLBACK");
    open = false;
    if (userCount() > 0) {
      seeded = true;
      return;
    }
    throw error;
  } finally {
    if (open) db.exec("COMMIT");
  }
}

