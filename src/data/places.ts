import {
  placeSlug,
  type Place,
  type PlaceSlug,
  type Source,
} from "@/lib/domain";
import { L } from "@/lib/locale";

const none: Source[] = [];

const nuaaStay: Source = {
  url: "https://cie.nuaa.edu.cn/_t1029/2022/0330/c16517a278945/page.htm",
  checkedOn: "2026-09-16",
  kind: "university",
};

const nuaaResidence: Source = {
  url: "https://cie.nuaa.edu.cn/2022/0401/c2738a279148/page.htm",
  checkedOn: "2026-09-17",
  kind: "university",
};

const nuaaRegister: Source = {
  url: "https://cie.nuaa.edu.cn/16515/list.htm",
  checkedOn: "2026-09-17",
  kind: "university",
};

const nuaaArrive: Source = {
  url: "https://cie.nuaa.edu.cn/_t1029/2019/1129/c11041a186448/page.htm",
  checkedOn: "2026-09-17",
  kind: "university",
};

const nuaaMedical: Source = {
  url: "https://cie.nuaa.edu.cn/16537/list.htm",
  checkedOn: "2026-09-17",
  kind: "university",
};

const nuaaDining: Source = {
  url: "https://ifs.nuaa.edu.cn/2022/1124/c16173a299077/page.htm",
  checkedOn: "2026-09-17",
  kind: "university",
};

const nuaaDorms: Source = {
  url: "https://ifs.nuaa.edu.cn/2022/1122/c16173a298815/page.htm",
  checkedOn: "2026-09-17",
  kind: "university",
};

const nuaaPhones: Source = {
  url: "https://jjlxq.nuaa.edu.cn/11283/list.htm",
  checkedOn: "2026-09-17",
  kind: "university",
};

const nuaaCard: Source = {
  url: "https://xxhc.nuaa.edu.cn/14171/list.htm",
  checkedOn: "2026-09-17",
  kind: "university",
};

const nuaaCardHall: Source = {
  url: "https://service.nuaa.edu.cn/2019/1116/c11349a183280/page.htm",
  checkedOn: "2026-09-17",
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
  nuaa: { lat: 31.9368, lng: 118.7908, address: "南京市江宁区将军大道 29 号" },
} as const;

function around(
  slug: string,
  campus: (typeof CAMPUS)[keyof typeof CAMPUS],
  name: ReturnType<typeof L>,
  where: ReturnType<typeof L>,
): Place {
  return place(slug, {
    name,
    address: `${campus.address} · ${where.zh}`,
    lat: campus.lat,
    lng: campus.lng,
    sources: none,
  });
}

const LIST: readonly Place[] = [
  place("jiangsu-ithc", {
    name: L("江苏国际旅行卫生保健中心（南京海关口岸门诊部）", "Jiangsu International Travel Healthcare Center"),
    address: "南京市建邺区创智路 39 号",
    lat: 32.0264,
    lng: 118.7281,
    hours: L("周一至周五 上午 8:30-11:30 体检，下午 12:20-14:40 取报告"),
    note: L("必须先在微信公众号「江苏国际旅行卫生保健中心」预约：业务办理 → 业务预约 → 出入境人员体检。没有预约号现场不受理。当天空腹。"),
    phone: "025-52345700",
    appointment: true,
    sources: [
      { url: "https://www.ithc.cn/js/contactus.html", checkedOn: "2026-09-16", kind: "official" },
      { url: "https://sie.jmi.edu.cn/3213/list.htm", checkedOn: "2026-09-16", kind: "university" },
      nuaaResidence,
    ],
  }),
  place("nanjing-exit-entry-hexi", {
    name: L("南京市公安局出入境管理支队（河西接待大厅）", "Nanjing Exit-Entry Administration, Hexi hall"),
    address: "南京市建邺区江东中路 265 号",
    lat: 32.0142,
    lng: 118.7286,
    hours: L("周一至周五 9:00-17:30（河西接待大厅，法定节假日除外）"),
    note: L("南京有多个出入境受理点，去哪一个取决于学校和住址，不要默认是这一个。办理前用「我的南京」App 查号源并预约。"),
    phone: "025-68505529",
    appointment: true,
    sources: [
      nuaaStay,
      { url: "https://nj.bendibao.com/live/201563/53889.shtm", checkedOn: "2026-09-16", kind: "secondary" },
      { url: "http://jsnews.jschina.com.cn/24hour/201808/t20180809_1825477.shtml", checkedOn: "2026-09-16", kind: "secondary" },
    ],
  }),
  place("nanjing-exit-entry-baixia", {
    name: L("南京市公安局出入境办证服务中心", "Nanjing Exit-Entry permit centre, Baixia Road"),
    address: "南京市秦淮区白下路 173 号",
    lat: 32.0318,
    lng: 118.7946,
    note: L("南航把学生带到这个厅。当日办公时间官方页面未列出。"),
    sources: [nuaaResidence],
  }),
  place("jiangning-admin-service", {
    name: L("江宁行政服务中心出入境窗口", "Jiangning Administrative Service Centre, Exit-Entry"),
    address: "南京市江宁区杨家圩路 2 号",
    lat: 31.9529,
    lng: 118.8498,
    note: L("江宁校区的学生可能走这里，出发前问国际处。当日办公时间官方页面未列出。"),
    sources: [nuaaResidence],
  }),
  place("xianlin-exit-entry", {
    name: L("仙林大学城出入境受理点", "Xianlin university-town Exit-Entry office"),
    address: "地址待核实（仙林大学城内）",
    lat: CAMPUS.nju.lat,
    lng: CAMPUS.nju.lng,
    note: L("公开来源只写仙林大学城内另有受理点，没有门牌。出发前问国际处。"),
    sources: none,
  }),
  place("jiangning-dev-police", {
    name: L("江宁开发区派出所", "Jiangning Development Zone police station"),
    address: "南京市通淮街 99 号",
    lat: 31.9298,
    lng: 118.8207,
    note: L(
      "南航将军路校区国际学生的住宿登记点。办公时间与是否预约未列出。网上办理与现场同等效力。",
      "Residence registration point for NUAA Jiangjun Road international students. Hours and appointment rules are not on the page. Online filing has the same effect as walking in.",
    ),
    sources: [nuaaStay],
  }),
  place("nuaa-jiangning-cie", {
    name: L("南航国际教育学院", "NUAA College of International Education"),
    address: "南京市江宁区将军大道 29 号",
    lat: CAMPUS.nuaa.lat,
    lng: CAMPUS.nuaa.lng,
    phone: "025-84893912",
    note: L(
      "报到页落款是外专楼，居留页落款是学工楼二层。到达南航页写从北门沿红线走到教育超市二楼。出发前问学院当天窗口。办公时间未列出。",
      "The registration page signs off at the Foreign Experts Building. The residence page signs off at Student Affairs Building 2F. Arrive at NUAA says follow the red line from the north gate to the education supermarket, second floor. Ask CIE which window is open that day. Hours are not listed.",
    ),
    sources: [nuaaRegister, nuaaStay, nuaaArrive],
  }),
  place("nuaa-jiangning-its", {
    name: L("将军路校区师生服务大厅（校园卡）", "Jiangjun Road faculty-student service hall (campus card)"),
    address: "南京市江宁区将军大道 29 号师生服务大厅 2 楼",
    lat: CAMPUS.nuaa.lat,
    lng: CAMPUS.nuaa.lng,
    phone: "025-52118720",
    note: L(
      "校园卡人工窗口在 2 楼 1、2 号。信息化中心页也写过 1 号楼 5 楼，以大厅窗口为准。校园网可网上办理。收费金额未列出。",
      "Card windows are 1 and 2 on the 2nd floor. The IT page also mentions Building 1, 5F. Use the hall window. Campus network can be opened online. The fee is not listed.",
    ),
    sources: [nuaaCard, nuaaCardHall],
  }),
  place("nuaa-jiangning-hospital", {
    name: L("南航将军路校区校医院", "NUAA Jiangjun Road campus hospital"),
    address: "南京市江宁区将军大道 29 号校区北门西侧",
    lat: CAMPUS.nuaa.lat,
    lng: CAMPUS.nuaa.lng,
    phone: "025-52119829",
    note: L(
      "就医指南写校医院在北门西侧。门诊 52119829，急诊 52119819。当日是否排队未列出。",
      "The medical guide puts the hospital west of the north gate. Outpatient 52119829, emergency 52119819. Queue rules are not listed.",
    ),
    sources: [nuaaMedical, nuaaPhones],
  }),
  place("nuaa-jiangning-heyuan-canteen", {
    name: L("和园餐厅", "Heyuan canteen"),
    address: "南京市江宁区将军大道 29 号东区 35 栋（航天学院旁）",
    lat: CAMPUS.nuaa.lat,
    lng: CAMPUS.nuaa.lng,
    note: L(
      "后勤饮食篇 2022 年的名单。一层有深夜食堂 19:30-23:00。人均价格未列出。",
      "Named on the 2022 catering page. Floor 1 has a late canteen 19:30-23:00. Per-person prices are not listed.",
    ),
    sources: [nuaaDining],
  }),
  place("nuaa-jiangning-xinyuan-canteen", {
    name: L("馨园书香餐厅", "Xinyuan Shuxiang canteen"),
    address: "南京市江宁区将军大道 29 号东区体育馆对面",
    lat: CAMPUS.nuaa.lat,
    lng: CAMPUS.nuaa.lng,
    note: L("后勤饮食篇写在馨园一层。人均价格未列出。", "The catering page puts this on Xinyuan floor 1. Per-person prices are not listed."),
    sources: [nuaaDining],
  }),
  place("nuaa-jiangning-minzu-canteen", {
    name: L("馨园民族餐厅", "Xinyuan Minzu canteen"),
    address: "南京市江宁区将军大道 29 号东区体育馆对面馨园二层",
    lat: CAMPUS.nuaa.lat,
    lng: CAMPUS.nuaa.lng,
    note: L(
      "饮食篇写云贵民族风格档口。页面没有清真认证，不能当成已认证清真餐厅。",
      "The catering page describes Yunnan-Guizhou themed stalls. It does not state halal certification.",
    ),
    sources: [nuaaDining],
  }),
  place("nuaa-jiangning-halal-canteen", {
    name: L("将军路校区清真食堂", "Jiangjun Road halal canteen"),
    address: "南京市江宁区将军大道 29 号（门牌未列出）",
    lat: CAMPUS.nuaa.lat,
    lng: CAMPUS.nuaa.lng,
    phone: "025-52836618",
    note: L(
      "将军路校区办公电话表有「清真食堂」和电话。具体楼号与营业时间未列出。",
      "The Jiangjun Road phone list names a halal canteen and a number. Building number and hours are not listed.",
    ),
    sources: [nuaaPhones],
  }),
  place("nuaa-jiangning-huiyuan-canteen", {
    name: L("慧园餐厅", "Huiyuan canteen"),
    address: "南京市江宁区将军大道 29 号西区樱花广场东面（综合楼旁）",
    lat: CAMPUS.nuaa.lat,
    lng: CAMPUS.nuaa.lng,
    sources: [nuaaDining],
  }),
  place("nuaa-jiangning-library", {
    name: L("将军路校区东区图书馆", "Jiangjun Road east library"),
    address: "南京市江宁区将军大道 29 号东区（馨园旁）",
    lat: CAMPUS.nuaa.lat,
    lng: CAMPUS.nuaa.lng,
    note: L("宿舍篇写馨园临着东区图书馆。开放时段未列出。", "The dorm page puts the east library next to Xinyuan. Opening hours are not listed."),
    sources: [nuaaDorms],
  }),
  place("nuaa-jiangning-gym", {
    name: L("将军路校区东区体育馆", "Jiangjun Road east gymnasium"),
    address: "南京市江宁区将军大道 29 号东区体育馆",
    lat: CAMPUS.nuaa.lat,
    lng: CAMPUS.nuaa.lng,
    phone: "025-52110682",
    sources: [nuaaDining, nuaaPhones],
  }),
  place("nuaa-jiangning-laundry", {
    name: L("慧园宿舍楼层洗衣机", "Huiyuan floor laundry"),
    address: "南京市江宁区将军大道 29 号慧园（宿舍楼 1-5 幢）",
    lat: CAMPUS.nuaa.lat,
    lng: CAMPUS.nuaa.lng,
    note: L("宿舍篇写慧园每层有洗衣机。收费未列出。", "The dorm page says each Huiyuan floor has washing machines. The fee is not listed."),
    sources: [nuaaDorms],
  }),
  place("nuaa-jiangning-cainiao", {
    name: L("将军路校区菜鸟驿站", "Jiangjun Road Cainiao station"),
    address: "南京市江宁区将军大道 29 号西区（怡园附近）",
    lat: CAMPUS.nuaa.lat,
    lng: CAMPUS.nuaa.lng,
    phone: "18094223726",
    note: L(
      "宿舍篇写怡园距菜鸟驿站很近。电话表有驿站号码。是否仍开、当日时段只能实地确认。",
      "The dorm page puts Cainiao near Yiyuan. The phone list has a number. Whether it still operates, and hours, need a field check.",
    ),
    sources: [nuaaDorms, nuaaPhones],
  }),
  place("nuaa-jiangning-supermarket", {
    name: L("将军路校区教育超市", "Jiangjun Road education supermarket"),
    address: "南京市江宁区将军大道 29 号",
    lat: CAMPUS.nuaa.lat,
    lng: CAMPUS.nuaa.lng,
    phone: "025-52119878",
    note: L(
      "到达南航页写国际教育学院在教育超市二楼。电话表有教育超市号码。",
      "Arrive at NUAA puts CIE on the second floor of the education supermarket. The phone list has a number.",
    ),
    sources: [nuaaArrive, nuaaPhones],
  }),
  place("nuaa-jiangning-suqi-cafe", {
    name: L("苏柒咖啡（馨园民族餐厅）", "Suqi Coffee, Xinyuan Minzu"),
    address: "南京市江宁区将军大道 29 号馨园二层",
    lat: CAMPUS.nuaa.lat,
    lng: CAMPUS.nuaa.lng,
    note: L(
      "饮食篇写馨园民族餐厅内有苏柒咖啡创业小店。价格与是否仍开未核实。",
      "The catering page names Suqi Coffee inside Xinyuan Minzu. Price and whether it still operates are unverified.",
    ),
    sources: [nuaaDining],
  }),
  place("nuaa-jiangning-western", {
    name: L("和园附近西餐店", "Western restaurants near Heyuan"),
    address: "南京市江宁区将军大道 29 号和园宿舍区附近",
    lat: CAMPUS.nuaa.lat,
    lng: CAMPUS.nuaa.lng,
    note: L(
      "宿舍篇写和园附近有西餐店，没有店名。具体哪一家还在开只能实地采集。",
      "The dorm page says there are Western restaurants near Heyuan and does not name them. Which shops still run is field-only.",
    ),
    sources: [nuaaDorms],
  }),
  place("nju-xianlin-office", {
    name: L("南京大学海外教育学院", "NJU Institute for International Students"),
    address: CAMPUS.nju.address,
    lat: CAMPUS.nju.lat,
    lng: CAMPUS.nju.lng,
    hours: L("周一至周五 8:30-11:30, 14:00-17:00"),
    note: L("报到、校园卡和保险窗口都在这个地址，具体窗口以当天指示为准。"),
    sources: none,
  }),
  place("seu-jiulonghu-office", {
    name: L("东南大学国际教育学院", "SEU School of International Education"),
    address: CAMPUS.seu.address,
    lat: CAMPUS.seu.lat,
    lng: CAMPUS.seu.lng,
    hours: L("周一至周五 8:30-11:30, 14:00-17:00"),
    note: L("报到、校园卡和保险窗口都在这个地址，具体窗口以当天指示为准。"),
    sources: none,
  }),
  place("nnu-suiyuan-office", {
    name: L("南京师范大学国际文化教育学院", "NNU International College for Chinese Studies"),
    address: CAMPUS.nnu.address,
    lat: CAMPUS.nnu.lat,
    lng: CAMPUS.nnu.lng,
    hours: L("周一至周五 8:30-11:30, 14:00-17:00"),
    note: L("报到、校园卡和保险窗口都在这个地址，具体窗口以当天指示为准。"),
    sources: none,
  }),
  place("hhu-jiangning-office", {
    name: L("河海大学国际教育学院", "Hohai University College of International Education"),
    address: CAMPUS.hhu.address,
    lat: CAMPUS.hhu.lat,
    lng: CAMPUS.hhu.lng,
    hours: L("周一至周五 8:30-11:30, 14:00-17:00"),
    note: L("报到、校园卡和保险窗口都在这个地址，具体窗口以当天指示为准。"),
    sources: none,
  }),
  place("njust-xiaolingwei-office", {
    name: L("南京理工大学国际教育学院", "NJUST School of International Education"),
    address: CAMPUS.njust.address,
    lat: CAMPUS.njust.lat,
    lng: CAMPUS.njust.lng,
    hours: L("周一至周五 8:30-11:30, 14:00-17:00"),
    note: L("报到、校园卡和保险窗口都在这个地址，具体窗口以当天指示为准。"),
    sources: none,
  }),
  place("njmu-jiangning-office", {
    name: L("南京医科大学国际教育学院", "NJMU School of International Education"),
    address: CAMPUS.njmu.address,
    lat: CAMPUS.njmu.lat,
    lng: CAMPUS.njmu.lng,
    hours: L("周一至周五 8:30-11:30, 14:00-17:00"),
    note: L("报到、校园卡和保险窗口都在这个地址，具体窗口以当天指示为准。"),
    sources: none,
  }),
  place("xianlin-police", {
    name: L("仙林派出所", "Xianlin police station"),
    address: "南京市栖霞区仙林大道附近（以宿管给的地址为准）",
    lat: CAMPUS.nju.lat,
    lng: CAMPUS.nju.lng,
    sources: none,
  }),
  place("ninghai-police", {
    name: L("宁海路派出所", "Ninghai Road police station"),
    address: "南京市鼓楼区（以学院给的地址为准）",
    lat: CAMPUS.nnu.lat,
    lng: CAMPUS.nnu.lng,
    sources: none,
  }),
  place("hhu-jiangning-police", {
    name: L("江宁大学城属地派出所", "Jiangning university-town police station"),
    address: "南京市江宁区（以宿管给的地址为准）",
    lat: CAMPUS.hhu.lat,
    lng: CAMPUS.hhu.lng,
    sources: none,
  }),
  place("xiaolingwei-police", {
    name: L("孝陵卫派出所", "Xiaolingwei police station"),
    address: "南京市玄武区（以宿管给的地址为准）",
    lat: CAMPUS.njust.lat,
    lng: CAMPUS.njust.lng,
    sources: none,
  }),
  place("njmu-jiangning-police", {
    name: L("江宁区属地派出所", "Jiangning district police station"),
    address: "南京市江宁区（以宿管给的地址为准）",
    lat: CAMPUS.njmu.lat,
    lng: CAMPUS.njmu.lng,
    sources: none,
  }),
  place("boc-xianlin", {
    name: L("中国银行南京仙林大学城支行", "Bank of China, Xianlin University Town"),
    address: "南京市栖霞区文苑路附近",
    lat: CAMPUS.nju.lat,
    lng: CAMPUS.nju.lng,
    hours: L("周一至周五 9:00-17:00"),
    note: L("中国银行和工商银行对留学生最熟练，先问同学哪家支行常办。"),
    sources: none,
  }),
  place("boc-jiangning", {
    name: L("中国银行南京江宁支行", "Bank of China, Jiangning"),
    address: "南京市江宁区双龙大道附近",
    lat: CAMPUS.seu.lat,
    lng: CAMPUS.seu.lng,
    hours: L("周一至周五 9:00-17:00"),
    note: L("中国银行和工商银行对留学生最熟练，先问同学哪家支行常办。"),
    sources: none,
  }),
  place("boc-ninghai", {
    name: L("中国银行（宁海路沿线支行）", "Bank of China, Ninghai Road"),
    address: "南京市鼓楼区宁海路沿线，以学院推荐的支行为准",
    lat: CAMPUS.nnu.lat,
    lng: CAMPUS.nnu.lng,
    hours: L("周一至周五 9:00-17:00"),
    sources: none,
  }),
  place("boc-hhu", {
    name: L("中国银行（江宁校区周边支行）", "Bank of China near Hohai Jiangning"),
    address: "南京市江宁区佛城西路附近，以国际教育学院指定的支行为准",
    lat: CAMPUS.hhu.lat,
    lng: CAMPUS.hhu.lng,
    hours: L("周一至周五 9:00-17:00"),
    sources: none,
  }),
  place("boc-njust", {
    name: L("中国银行（孝陵卫地铁站周边支行）", "Bank of China near Xiaolingwei"),
    address: "南京市玄武区孝陵卫街附近，以国际教育学院推荐的支行为准",
    lat: CAMPUS.njust.lat,
    lng: CAMPUS.njust.lng,
    hours: L("周一至周五 9:00-17:00"),
    sources: none,
  }),
  place("boc-njmu", {
    name: L("中国银行（江宁校区周边支行）", "Bank of China near NJMU Jiangning"),
    address: "南京市江宁区龙眠大道附近，以国际教育学院指定的支行为准",
    lat: CAMPUS.njmu.lat,
    lng: CAMPUS.njmu.lng,
    hours: L("周一至周五 9:00-17:00"),
    sources: none,
  }),
  place("china-mobile-shop", {
    name: L("中国移动营业厅", "China Mobile shop"),
    address: "校门口或最近的地铁站商业体内均有",
    lat: 32.0603,
    lng: 118.7969,
    hours: L("9:00-18:00", "9:00-18:00"),
    note: L("认准「营业厅」，路边摊卖的卡实名信息不是你的，后面绑不了支付宝。"),
    sources: none,
  }),
  place("alipay-wechat", {
    name: L("在手机上完成", "On your phone"),
    address: "支付宝 / 微信 App 内",
    lat: 32.0603,
    lng: 118.7969,
    note: L("支付宝和微信都支持外国护照实名，姓名要和护照拼写完全一致。"),
    sources: none,
  }),
  around("nju-xianlin-canteen", CAMPUS.nju, L("第二食堂二楼", "Canteen No.2, 2F"), L("校区中部")),
  around("nju-xianlin-halal", CAMPUS.nju, L("新疆餐厅", "Xinjiang restaurant"), L("南门外美食街")),
  around("nju-xianlin-western", CAMPUS.nju, L("仙林金鹰 B1", "Golden Eagle B1"), L("地铁 2 号线羊山公园站")),
  around("nju-xianlin-grocery", CAMPUS.nju, L("盒马鲜生仙林店", "Hema Fresh"), L("金鹰购物中心内")),
  around("nju-xianlin-cafe", CAMPUS.nju, L("校内星巴克", "Starbucks on campus"), L("图书馆旁")),
  around("nju-xianlin-study", CAMPUS.nju, L("杜厦图书馆", "Du Xia Library"), L("校区中轴线")),
  around("nju-xianlin-gym", CAMPUS.nju, L("仙Ⅱ体育馆", "Xian-2 Gymnasium"), L("东侧运动区")),
  around("nju-xianlin-clinic", CAMPUS.nju, L("校医院", "Campus clinic"), L("北门附近")),
  around("nju-xianlin-barber", CAMPUS.nju, L("文鼎广场理发店", "Wending Plaza barber"), L("南门外")),
  around("nju-xianlin-courier", CAMPUS.nju, L("菜鸟驿站", "Cainiao station"), L("各宿舍区楼下")),
  around("seu-jiulonghu-canteen", CAMPUS.seu, L("桃园食堂", "Taoyuan Canteen"), L("生活区中心")),
  around("seu-jiulonghu-halal", CAMPUS.seu, L("兰州牛肉面", "Lanzhou beef noodles"), L("东门外")),
  around("seu-jiulonghu-grocery", CAMPUS.seu, L("苏果超市", "Suguo supermarket"), L("生活区门口")),
  around("seu-jiulonghu-cafe", CAMPUS.seu, L("图书馆咖啡角", "Library cafe"), L("李文正图书馆一楼")),
  around("seu-jiulonghu-study", CAMPUS.seu, L("李文正图书馆", "Li Wenzheng Library"), L("校区中轴")),
  around("seu-jiulonghu-gym", CAMPUS.seu, L("九龙湖体育馆", "Jiulonghu Gymnasium"), L("南侧")),
  around("seu-jiulonghu-clinic", CAMPUS.seu, L("九龙湖校医院", "Campus clinic"), L("生活区北")),
  around("seu-jiulonghu-bar", CAMPUS.seu, L("百家湖酒吧街", "Baijiahu bars"), L("地铁 1 号线百家湖站")),
  around("nnu-suiyuan-canteen", CAMPUS.nnu, L("随园食堂", "Suiyuan canteen"), L("校区北侧生活区")),
  around("nnu-suiyuan-halal", CAMPUS.nnu, L("宁海路兰州拉面", "Lanzhou noodles on Ninghai Rd"), L("宁海路校门外沿街")),
  around("nnu-suiyuan-cafe", CAMPUS.nnu, L("上海路咖啡馆", "Shanghai Road cafes"), L("出校门往东，上海路沿线")),
  around("nnu-suiyuan-study", CAMPUS.nnu, L("先锋书店五台山店", "Librairie Avant-Garde, Wutaishan"), L("广州路，地下车库改的书店")),
  around("nnu-suiyuan-western", CAMPUS.nnu, L("上海路 / 汉口路西餐小店", "Bistros around Shanghai Rd"), L("上海路与汉口路交叉口一带")),
  around("nnu-suiyuan-grocery", CAMPUS.nnu, L("苏果超市（宁海路）", "Suguo supermarket"), L("宁海路沿线")),
  around("nnu-suiyuan-bar", CAMPUS.nnu, L("上海路小酒馆", "Shanghai Road bars"), L("上海路沿线")),
  around("nnu-suiyuan-gym", CAMPUS.nnu, L("随园操场", "Suiyuan sports ground"), L("校区西侧")),
  around("nnu-suiyuan-clinic", CAMPUS.nnu, L("南京鼓楼医院", "Nanjing Drum Tower Hospital"), L("中山路，地铁 1 号线鼓楼站")),
  around("nnu-suiyuan-courier", CAMPUS.nnu, L("校内快递驿站", "Campus parcel station"), L("生活区楼下")),
  around("hhu-jiangning-canteen", CAMPUS.hhu, L("食堂清真窗口", "Halal window, main canteen"), L("生活区食堂")),
  around("hhu-jiangning-halal", CAMPUS.hhu, L("佛城西路清真餐馆", "Halal restaurants on Focheng West Rd"), L("校门口沿佛城西路")),
  around("hhu-jiangning-grocery", CAMPUS.hhu, L("校内教育超市", "Campus supermarket"), L("生活区")),
  around("hhu-jiangning-cafe", CAMPUS.hhu, L("校门口瑞幸", "Luckin Coffee at the gate"), L("校门口商业街")),
  around("hhu-jiangning-study", CAMPUS.hhu, L("江宁校区图书馆", "Jiangning campus library"), L("校区中轴")),
  around("hhu-jiangning-gym", CAMPUS.hhu, L("田径场与体育馆", "Athletics track & gym"), L("校区南侧")),
  around("hhu-jiangning-clinic", CAMPUS.hhu, L("江宁校区校医院", "Campus clinic"), L("生活区旁")),
  around("hhu-jiangning-courier", CAMPUS.hhu, L("菜鸟驿站", "Cainiao station"), L("宿舍区楼下")),
  around("hhu-jiangning-laundry", CAMPUS.hhu, L("宿舍楼自助洗衣机", "Dorm laundry machines"), L("每栋宿舍一楼")),
  around("njust-xiaolingwei-canteen", CAMPUS.njust, L("校内食堂", "Campus canteens"), L("生活区，几栋食堂挨着")),
  around("njust-xiaolingwei-halal", CAMPUS.njust, L("钟灵街清真面馆", "Halal noodle shop, Zhongling St"), L("校外钟灵街一带")),
  around("njust-xiaolingwei-cafe", CAMPUS.njust, L("孝陵卫地铁站的瑞幸和星巴克", "Luckin & Starbucks at Xiaolingwei station"), L("地铁站出口商业体")),
  around("njust-xiaolingwei-grocery", CAMPUS.njust, L("孝陵卫苏果超市", "Suguo supermarket, Xiaolingwei"), L("孝陵卫街沿线")),
  around("njust-xiaolingwei-study", CAMPUS.njust, L("校图书馆", "NJUST Library"), L("校区中部")),
  around("njust-xiaolingwei-gym", CAMPUS.njust, L("体育中心", "Sports centre"), L("校区南侧运动区")),
  around("njust-xiaolingwei-clinic", CAMPUS.njust, L("校医院", "Campus clinic"), L("生活区旁")),
  around("njust-xiaolingwei-barber", CAMPUS.njust, L("钟灵街理发店", "Zhongling Street barbers"), L("校外钟灵街")),
  around("njust-xiaolingwei-courier", CAMPUS.njust, L("菜鸟驿站", "Cainiao station"), L("宿舍区楼下")),
  around("njust-xiaolingwei-bar", CAMPUS.njust, L("1912 街区", "1912 Bar Street"), L("地铁 2 号线大行宫站")),
  around("njmu-jiangning-canteen", CAMPUS.njmu, L("学生食堂", "Student canteen"), L("生活区")),
  around("njmu-jiangning-halal", CAMPUS.njmu, L("校外的印巴餐厅", "Indian & Pakistani restaurants"), L("校门外沿街")),
  around("njmu-jiangning-grocery", CAMPUS.njmu, L("校内超市", "Campus supermarket"), L("生活区")),
  around("njmu-jiangning-study", CAMPUS.njmu, L("江宁校区图书馆", "Jiangning campus library"), L("校区中轴")),
  around("njmu-jiangning-clinic", CAMPUS.njmu, L("附属逸夫医院", "Sir Run Run Hospital (NJMU affiliated)"), L("校区隔壁，龙眠大道上")),
  around("njmu-jiangning-gym", CAMPUS.njmu, L("体育馆与田径场", "Gymnasium & track"), L("校区南侧")),
  around("njmu-jiangning-cafe", CAMPUS.njmu, L("图书馆一楼咖啡角", "Library cafe corner"), L("图书馆一楼")),
  around("njmu-jiangning-courier", CAMPUS.njmu, L("菜鸟驿站", "Cainiao station"), L("宿舍区楼下")),
  around("njmu-jiangning-barber", CAMPUS.njmu, L("校门口理发店", "Barbers at the gate"), L("校门外沿街")),
  around("njmu-jiangning-laundry", CAMPUS.njmu, L("宿舍自助洗衣", "Dorm laundry"), L("每栋宿舍一楼")),
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
