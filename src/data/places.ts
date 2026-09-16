import {
  placeSlug,
  type Place,
  type PlaceSlug,
  type Source,
} from "@/lib/domain";

const none: Source[] = [];

const nuaaStay: Source = {
  url: "https://cie.nuaa.edu.cn/_t1029/2022/0330/c16517a278945/page.htm",
  checkedOn: "2026-09-16",
  kind: "university",
};

const nuaaResidence: Source = {
  url: "https://cie.nuaa.edu.cn/2022/0401/c2738a279148/page.htm",
  checkedOn: "2026-09-16",
  kind: "university",
};

function place(slug: string, rest: Omit<Place, "slug">): Place {
  return { slug: placeSlug(slug), ...rest };
}

/**
 * Campus pins are approximate, taken from the campus street address already in
 * the city file. They are not surveyed coordinates. Sourced halls use the
 * published street address; the pin still needs an operator check.
 */
const CAMPUS = {
  nju: { lat: 32.1187, lng: 118.9588, address: "南京市栖霞区仙林大道 163 号" },
  seu: { lat: 31.8886, lng: 118.8174, address: "南京市江宁区东南大学路 2 号" },
  nnu: { lat: 32.0565, lng: 118.7665, address: "南京市鼓楼区宁海路 122 号" },
  hhu: { lat: 31.9163, lng: 118.7905, address: "南京市江宁区佛城西路 8 号" },
  njust: { lat: 32.0289, lng: 118.8558, address: "南京市玄武区孝陵卫 200 号" },
  njmu: { lat: 31.9416, lng: 118.8884, address: "南京市江宁区龙眠大道 101 号" },
} as const;

function around(
  slug: string,
  campus: (typeof CAMPUS)[keyof typeof CAMPUS],
  name: string,
  nameEn: string,
  where: string,
): Place {
  return place(slug, {
    name,
    nameEn,
    address: `${campus.address} · ${where}`,
    lat: campus.lat,
    lng: campus.lng,
    sources: none,
  });
}

const LIST: readonly Place[] = [
  place("jiangsu-ithc", {
    name: "江苏国际旅行卫生保健中心（南京海关口岸门诊部）",
    nameEn: "Jiangsu International Travel Healthcare Center",
    address: "南京市建邺区创智路 39 号",
    lat: 32.0264,
    lng: 118.7281,
    hours: "周一至周五 上午 8:30-11:30 体检，下午 12:20-14:40 取报告",
    note: "必须先在微信公众号「江苏国际旅行卫生保健中心」预约：业务办理 → 业务预约 → 出入境人员体检。没有预约号现场不受理。当天空腹。",
    phone: "025-52345700",
    appointment: true,
    sources: [
      { url: "https://www.ithc.cn/js/contactus.html", checkedOn: "2026-09-16", kind: "official" },
      { url: "https://sie.jmi.edu.cn/3213/list.htm", checkedOn: "2026-09-16", kind: "university" },
      nuaaResidence,
    ],
  }),
  place("nanjing-exit-entry-hexi", {
    name: "南京市公安局出入境管理支队（河西接待大厅）",
    nameEn: "Nanjing Exit-Entry Administration, Hexi hall",
    address: "南京市建邺区江东中路 265 号",
    lat: 32.0142,
    lng: 118.7286,
    hours: "周一至周五 9:00-17:30（河西接待大厅，法定节假日除外）",
    note: "南京有多个出入境受理点，去哪一个取决于学校和住址，不要默认是这一个。办理前用「我的南京」App 查号源并预约。",
    phone: "025-68505529",
    appointment: true,
    sources: [
      nuaaStay,
      { url: "https://nj.bendibao.com/live/201563/53889.shtm", checkedOn: "2026-09-16", kind: "secondary" },
      { url: "http://jsnews.jschina.com.cn/24hour/201808/t20180809_1825477.shtml", checkedOn: "2026-09-16", kind: "secondary" },
    ],
  }),
  place("nanjing-exit-entry-baixia", {
    name: "南京市公安局出入境办证服务中心",
    nameEn: "Nanjing Exit-Entry permit centre, Baixia Road",
    address: "南京市秦淮区白下路 173 号",
    lat: 32.0318,
    lng: 118.7946,
    note: "南航把学生带到这个厅。当日办公时间官方页面未列出。",
    sources: [nuaaResidence],
  }),
  place("jiangning-admin-service", {
    name: "江宁行政服务中心出入境窗口",
    nameEn: "Jiangning Administrative Service Centre, Exit-Entry",
    address: "南京市江宁区杨家圩路 2 号",
    lat: 31.9529,
    lng: 118.8498,
    note: "江宁校区的学生可能走这里，出发前问国际处。当日办公时间官方页面未列出。",
    sources: [nuaaResidence],
  }),
  place("xianlin-exit-entry", {
    name: "仙林大学城出入境受理点",
    nameEn: "Xianlin university-town Exit-Entry office",
    address: "地址待核实（仙林大学城内）",
    lat: CAMPUS.nju.lat,
    lng: CAMPUS.nju.lng,
    note: "公开来源只写仙林大学城内另有受理点，没有门牌。出发前问国际处。",
    sources: none,
  }),
  place("jiangning-dev-police", {
    name: "江宁开发区派出所",
    nameEn: "Jiangning Development Zone police station",
    address: "南京市通淮街 99 号",
    lat: 31.9298,
    lng: 118.8207,
    note: "南航将军路校区的住宿登记点。办公时间与是否预约未列出。网上办理与现场同等效力。",
    sources: [nuaaStay],
  }),
  place("nju-xianlin-office", {
    name: "南京大学海外教育学院",
    nameEn: "NJU Institute for International Students",
    address: CAMPUS.nju.address,
    lat: CAMPUS.nju.lat,
    lng: CAMPUS.nju.lng,
    hours: "周一至周五 8:30-11:30, 14:00-17:00",
    note: "报到、校园卡和保险窗口都在这个地址，具体窗口以当天指示为准。",
    sources: none,
  }),
  place("seu-jiulonghu-office", {
    name: "东南大学国际教育学院",
    nameEn: "SEU School of International Education",
    address: CAMPUS.seu.address,
    lat: CAMPUS.seu.lat,
    lng: CAMPUS.seu.lng,
    hours: "周一至周五 8:30-11:30, 14:00-17:00",
    note: "报到、校园卡和保险窗口都在这个地址，具体窗口以当天指示为准。",
    sources: none,
  }),
  place("nnu-suiyuan-office", {
    name: "南京师范大学国际文化教育学院",
    nameEn: "NNU International College for Chinese Studies",
    address: CAMPUS.nnu.address,
    lat: CAMPUS.nnu.lat,
    lng: CAMPUS.nnu.lng,
    hours: "周一至周五 8:30-11:30, 14:00-17:00",
    note: "报到、校园卡和保险窗口都在这个地址，具体窗口以当天指示为准。",
    sources: none,
  }),
  place("hhu-jiangning-office", {
    name: "河海大学国际教育学院",
    nameEn: "Hohai University College of International Education",
    address: CAMPUS.hhu.address,
    lat: CAMPUS.hhu.lat,
    lng: CAMPUS.hhu.lng,
    hours: "周一至周五 8:30-11:30, 14:00-17:00",
    note: "报到、校园卡和保险窗口都在这个地址，具体窗口以当天指示为准。",
    sources: none,
  }),
  place("njust-xiaolingwei-office", {
    name: "南京理工大学国际教育学院",
    nameEn: "NJUST School of International Education",
    address: CAMPUS.njust.address,
    lat: CAMPUS.njust.lat,
    lng: CAMPUS.njust.lng,
    hours: "周一至周五 8:30-11:30, 14:00-17:00",
    note: "报到、校园卡和保险窗口都在这个地址，具体窗口以当天指示为准。",
    sources: none,
  }),
  place("njmu-jiangning-office", {
    name: "南京医科大学国际教育学院",
    nameEn: "NJMU School of International Education",
    address: CAMPUS.njmu.address,
    lat: CAMPUS.njmu.lat,
    lng: CAMPUS.njmu.lng,
    hours: "周一至周五 8:30-11:30, 14:00-17:00",
    note: "报到、校园卡和保险窗口都在这个地址，具体窗口以当天指示为准。",
    sources: none,
  }),
  place("xianlin-police", {
    name: "仙林派出所",
    nameEn: "Xianlin police station",
    address: "南京市栖霞区仙林大道附近（以宿管给的地址为准）",
    lat: CAMPUS.nju.lat,
    lng: CAMPUS.nju.lng,
    sources: none,
  }),
  place("ninghai-police", {
    name: "宁海路派出所",
    nameEn: "Ninghai Road police station",
    address: "南京市鼓楼区（以学院给的地址为准）",
    lat: CAMPUS.nnu.lat,
    lng: CAMPUS.nnu.lng,
    sources: none,
  }),
  place("hhu-jiangning-police", {
    name: "江宁大学城属地派出所",
    nameEn: "Jiangning university-town police station",
    address: "南京市江宁区（以宿管给的地址为准）",
    lat: CAMPUS.hhu.lat,
    lng: CAMPUS.hhu.lng,
    sources: none,
  }),
  place("xiaolingwei-police", {
    name: "孝陵卫派出所",
    nameEn: "Xiaolingwei police station",
    address: "南京市玄武区（以宿管给的地址为准）",
    lat: CAMPUS.njust.lat,
    lng: CAMPUS.njust.lng,
    sources: none,
  }),
  place("njmu-jiangning-police", {
    name: "江宁区属地派出所",
    nameEn: "Jiangning district police station",
    address: "南京市江宁区（以宿管给的地址为准）",
    lat: CAMPUS.njmu.lat,
    lng: CAMPUS.njmu.lng,
    sources: none,
  }),
  place("boc-xianlin", {
    name: "中国银行南京仙林大学城支行",
    nameEn: "Bank of China, Xianlin University Town",
    address: "南京市栖霞区文苑路附近",
    lat: CAMPUS.nju.lat,
    lng: CAMPUS.nju.lng,
    hours: "周一至周五 9:00-17:00",
    note: "中国银行和工商银行对留学生最熟练，先问同学哪家支行常办。",
    sources: none,
  }),
  place("boc-jiangning", {
    name: "中国银行南京江宁支行",
    nameEn: "Bank of China, Jiangning",
    address: "南京市江宁区双龙大道附近",
    lat: CAMPUS.seu.lat,
    lng: CAMPUS.seu.lng,
    hours: "周一至周五 9:00-17:00",
    note: "中国银行和工商银行对留学生最熟练，先问同学哪家支行常办。",
    sources: none,
  }),
  place("boc-ninghai", {
    name: "中国银行（宁海路沿线支行）",
    nameEn: "Bank of China, Ninghai Road",
    address: "南京市鼓楼区宁海路沿线，以学院推荐的支行为准",
    lat: CAMPUS.nnu.lat,
    lng: CAMPUS.nnu.lng,
    hours: "周一至周五 9:00-17:00",
    sources: none,
  }),
  place("boc-hhu", {
    name: "中国银行（江宁校区周边支行）",
    nameEn: "Bank of China near Hohai Jiangning",
    address: "南京市江宁区佛城西路附近，以国际教育学院指定的支行为准",
    lat: CAMPUS.hhu.lat,
    lng: CAMPUS.hhu.lng,
    hours: "周一至周五 9:00-17:00",
    sources: none,
  }),
  place("boc-njust", {
    name: "中国银行（孝陵卫地铁站周边支行）",
    nameEn: "Bank of China near Xiaolingwei",
    address: "南京市玄武区孝陵卫街附近，以国际教育学院推荐的支行为准",
    lat: CAMPUS.njust.lat,
    lng: CAMPUS.njust.lng,
    hours: "周一至周五 9:00-17:00",
    sources: none,
  }),
  place("boc-njmu", {
    name: "中国银行（江宁校区周边支行）",
    nameEn: "Bank of China near NJMU Jiangning",
    address: "南京市江宁区龙眠大道附近，以国际教育学院指定的支行为准",
    lat: CAMPUS.njmu.lat,
    lng: CAMPUS.njmu.lng,
    hours: "周一至周五 9:00-17:00",
    sources: none,
  }),
  place("china-mobile-shop", {
    name: "中国移动营业厅",
    nameEn: "China Mobile shop",
    address: "校门口或最近的地铁站商业体内均有",
    lat: 32.0603,
    lng: 118.7969,
    hours: "9:00-18:00",
    note: "认准「营业厅」，路边摊卖的卡实名信息不是你的，后面绑不了支付宝。",
    sources: none,
  }),
  place("alipay-wechat", {
    name: "在手机上完成",
    nameEn: "On your phone",
    address: "支付宝 / 微信 App 内",
    lat: 32.0603,
    lng: 118.7969,
    note: "支付宝和微信都支持外国护照实名，姓名要和护照拼写完全一致。",
    sources: none,
  }),
  around("nju-xianlin-canteen", CAMPUS.nju, "第二食堂二楼", "Canteen No.2, 2F", "校区中部"),
  around("nju-xianlin-halal", CAMPUS.nju, "新疆餐厅", "Xinjiang restaurant", "南门外美食街"),
  around("nju-xianlin-western", CAMPUS.nju, "仙林金鹰 B1", "Golden Eagle B1", "地铁 2 号线羊山公园站"),
  around("nju-xianlin-grocery", CAMPUS.nju, "盒马鲜生仙林店", "Hema Fresh", "金鹰购物中心内"),
  around("nju-xianlin-cafe", CAMPUS.nju, "校内星巴克", "Starbucks on campus", "图书馆旁"),
  around("nju-xianlin-study", CAMPUS.nju, "杜厦图书馆", "Du Xia Library", "校区中轴线"),
  around("nju-xianlin-gym", CAMPUS.nju, "仙Ⅱ体育馆", "Xian-2 Gymnasium", "东侧运动区"),
  around("nju-xianlin-clinic", CAMPUS.nju, "校医院", "Campus clinic", "北门附近"),
  around("nju-xianlin-barber", CAMPUS.nju, "文鼎广场理发店", "Wending Plaza barber", "南门外"),
  around("nju-xianlin-courier", CAMPUS.nju, "菜鸟驿站", "Cainiao station", "各宿舍区楼下"),
  around("seu-jiulonghu-canteen", CAMPUS.seu, "桃园食堂", "Taoyuan Canteen", "生活区中心"),
  around("seu-jiulonghu-halal", CAMPUS.seu, "兰州牛肉面", "Lanzhou beef noodles", "东门外"),
  around("seu-jiulonghu-grocery", CAMPUS.seu, "苏果超市", "Suguo supermarket", "生活区门口"),
  around("seu-jiulonghu-cafe", CAMPUS.seu, "图书馆咖啡角", "Library cafe", "李文正图书馆一楼"),
  around("seu-jiulonghu-study", CAMPUS.seu, "李文正图书馆", "Li Wenzheng Library", "校区中轴"),
  around("seu-jiulonghu-gym", CAMPUS.seu, "九龙湖体育馆", "Jiulonghu Gymnasium", "南侧"),
  around("seu-jiulonghu-clinic", CAMPUS.seu, "九龙湖校医院", "Campus clinic", "生活区北"),
  around("seu-jiulonghu-bar", CAMPUS.seu, "百家湖酒吧街", "Baijiahu bars", "地铁 1 号线百家湖站"),
  around("nnu-suiyuan-canteen", CAMPUS.nnu, "随园食堂", "Suiyuan canteen", "校区北侧生活区"),
  around("nnu-suiyuan-halal", CAMPUS.nnu, "宁海路兰州拉面", "Lanzhou noodles on Ninghai Rd", "宁海路校门外沿街"),
  around("nnu-suiyuan-cafe", CAMPUS.nnu, "上海路咖啡馆", "Shanghai Road cafes", "出校门往东，上海路沿线"),
  around("nnu-suiyuan-study", CAMPUS.nnu, "先锋书店五台山店", "Librairie Avant-Garde, Wutaishan", "广州路，地下车库改的书店"),
  around("nnu-suiyuan-western", CAMPUS.nnu, "上海路 / 汉口路西餐小店", "Bistros around Shanghai Rd", "上海路与汉口路交叉口一带"),
  around("nnu-suiyuan-grocery", CAMPUS.nnu, "苏果超市（宁海路）", "Suguo supermarket", "宁海路沿线"),
  around("nnu-suiyuan-bar", CAMPUS.nnu, "上海路小酒馆", "Shanghai Road bars", "上海路沿线"),
  around("nnu-suiyuan-gym", CAMPUS.nnu, "随园操场", "Suiyuan sports ground", "校区西侧"),
  around("nnu-suiyuan-clinic", CAMPUS.nnu, "南京鼓楼医院", "Nanjing Drum Tower Hospital", "中山路，地铁 1 号线鼓楼站"),
  around("nnu-suiyuan-courier", CAMPUS.nnu, "校内快递驿站", "Campus parcel station", "生活区楼下"),
  around("hhu-jiangning-canteen", CAMPUS.hhu, "食堂清真窗口", "Halal window, main canteen", "生活区食堂"),
  around("hhu-jiangning-halal", CAMPUS.hhu, "佛城西路清真餐馆", "Halal restaurants on Focheng West Rd", "校门口沿佛城西路"),
  around("hhu-jiangning-grocery", CAMPUS.hhu, "校内教育超市", "Campus supermarket", "生活区"),
  around("hhu-jiangning-cafe", CAMPUS.hhu, "校门口瑞幸", "Luckin Coffee at the gate", "校门口商业街"),
  around("hhu-jiangning-study", CAMPUS.hhu, "江宁校区图书馆", "Jiangning campus library", "校区中轴"),
  around("hhu-jiangning-gym", CAMPUS.hhu, "田径场与体育馆", "Athletics track & gym", "校区南侧"),
  around("hhu-jiangning-clinic", CAMPUS.hhu, "江宁校区校医院", "Campus clinic", "生活区旁"),
  around("hhu-jiangning-courier", CAMPUS.hhu, "菜鸟驿站", "Cainiao station", "宿舍区楼下"),
  around("hhu-jiangning-laundry", CAMPUS.hhu, "宿舍楼自助洗衣机", "Dorm laundry machines", "每栋宿舍一楼"),
  around("njust-xiaolingwei-canteen", CAMPUS.njust, "校内食堂", "Campus canteens", "生活区，几栋食堂挨着"),
  around("njust-xiaolingwei-halal", CAMPUS.njust, "钟灵街清真面馆", "Halal noodle shop, Zhongling St", "校外钟灵街一带"),
  around("njust-xiaolingwei-cafe", CAMPUS.njust, "孝陵卫地铁站的瑞幸和星巴克", "Luckin & Starbucks at Xiaolingwei station", "地铁站出口商业体"),
  around("njust-xiaolingwei-grocery", CAMPUS.njust, "孝陵卫苏果超市", "Suguo supermarket, Xiaolingwei", "孝陵卫街沿线"),
  around("njust-xiaolingwei-study", CAMPUS.njust, "校图书馆", "NJUST Library", "校区中部"),
  around("njust-xiaolingwei-gym", CAMPUS.njust, "体育中心", "Sports centre", "校区南侧运动区"),
  around("njust-xiaolingwei-clinic", CAMPUS.njust, "校医院", "Campus clinic", "生活区旁"),
  around("njust-xiaolingwei-barber", CAMPUS.njust, "钟灵街理发店", "Zhongling Street barbers", "校外钟灵街"),
  around("njust-xiaolingwei-courier", CAMPUS.njust, "菜鸟驿站", "Cainiao station", "宿舍区楼下"),
  around("njust-xiaolingwei-bar", CAMPUS.njust, "1912 街区", "1912 Bar Street", "地铁 2 号线大行宫站"),
  around("njmu-jiangning-canteen", CAMPUS.njmu, "学生食堂", "Student canteen", "生活区"),
  around("njmu-jiangning-halal", CAMPUS.njmu, "校外的印巴餐厅", "Indian & Pakistani restaurants", "校门外沿街"),
  around("njmu-jiangning-grocery", CAMPUS.njmu, "校内超市", "Campus supermarket", "生活区"),
  around("njmu-jiangning-study", CAMPUS.njmu, "江宁校区图书馆", "Jiangning campus library", "校区中轴"),
  around("njmu-jiangning-clinic", CAMPUS.njmu, "附属逸夫医院", "Sir Run Run Hospital (NJMU affiliated)", "校区隔壁，龙眠大道上"),
  around("njmu-jiangning-gym", CAMPUS.njmu, "体育馆与田径场", "Gymnasium & track", "校区南侧"),
  around("njmu-jiangning-cafe", CAMPUS.njmu, "图书馆一楼咖啡角", "Library cafe corner", "图书馆一楼"),
  around("njmu-jiangning-courier", CAMPUS.njmu, "菜鸟驿站", "Cainiao station", "宿舍区楼下"),
  around("njmu-jiangning-barber", CAMPUS.njmu, "校门口理发店", "Barbers at the gate", "校门外沿街"),
  around("njmu-jiangning-laundry", CAMPUS.njmu, "宿舍自助洗衣", "Dorm laundry", "每栋宿舍一楼"),
];

const bySlug = new Map<string, Place>(LIST.map((item) => [item.slug, item]));

if (bySlug.size !== LIST.length) {
  throw new Error("Duplicate place slug in src/data/places.ts");
}

export const PLACES: Readonly<Record<string, Place>> = Object.fromEntries(
  LIST.map((item) => [item.slug, item]),
);

export const PLACE_LIST: readonly Place[] = LIST;

export const NANJING_VISA_HALLS: readonly PlaceSlug[] = [
  placeSlug("nanjing-exit-entry-hexi"),
  placeSlug("nanjing-exit-entry-baixia"),
  placeSlug("jiangning-admin-service"),
  placeSlug("xianlin-exit-entry"),
];

export function getPlace(slug: string): Place | undefined {
  return bySlug.get(slug);
}

export function requirePlace(slug: PlaceSlug): Place {
  const found = bySlug.get(slug);
  if (!found) throw new Error(`Unknown place slug: ${slug}`);
  return found;
}
