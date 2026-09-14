/** ISO 3166-1 alpha-2 code to display names. Flags are computed, not stored. */
export const COUNTRIES: Readonly<Record<string, { zh: string; en: string }>> = {
  KR: { zh: "韩国", en: "South Korea" },
  TH: { zh: "泰国", en: "Thailand" },
  PK: { zh: "巴基斯坦", en: "Pakistan" },
  IN: { zh: "印度", en: "India" },
  US: { zh: "美国", en: "United States" },
  RU: { zh: "俄罗斯", en: "Russia" },
  ID: { zh: "印度尼西亚", en: "Indonesia" },
  LA: { zh: "老挝", en: "Laos" },
  JP: { zh: "日本", en: "Japan" },
  KZ: { zh: "哈萨克斯坦", en: "Kazakhstan" },
  VN: { zh: "越南", en: "Vietnam" },
  BD: { zh: "孟加拉国", en: "Bangladesh" },
  FR: { zh: "法国", en: "France" },
  MN: { zh: "蒙古", en: "Mongolia" },
  MY: { zh: "马来西亚", en: "Malaysia" },
  NP: { zh: "尼泊尔", en: "Nepal" },
  DE: { zh: "德国", en: "Germany" },
  MM: { zh: "缅甸", en: "Myanmar" },
  IT: { zh: "意大利", en: "Italy" },
  GB: { zh: "英国", en: "United Kingdom" },
  SG: { zh: "新加坡", en: "Singapore" },
  PH: { zh: "菲律宾", en: "Philippines" },
  CA: { zh: "加拿大", en: "Canada" },
  AU: { zh: "澳大利亚", en: "Australia" },
  NG: { zh: "尼日利亚", en: "Nigeria" },
  GH: { zh: "加纳", en: "Ghana" },
  KE: { zh: "肯尼亚", en: "Kenya" },
  TZ: { zh: "坦桑尼亚", en: "Tanzania" },
  ZA: { zh: "南非", en: "South Africa" },
  EG: { zh: "埃及", en: "Egypt" },
  MA: { zh: "摩洛哥", en: "Morocco" },
  DZ: { zh: "阿尔及利亚", en: "Algeria" },
  SD: { zh: "苏丹", en: "Sudan" },
  ET: { zh: "埃塞俄比亚", en: "Ethiopia" },
  ZM: { zh: "赞比亚", en: "Zambia" },
  ZW: { zh: "津巴布韦", en: "Zimbabwe" },
  UG: { zh: "乌干达", en: "Uganda" },
  CM: { zh: "喀麦隆", en: "Cameroon" },
  BR: { zh: "巴西", en: "Brazil" },
  MX: { zh: "墨西哥", en: "Mexico" },
  CO: { zh: "哥伦比亚", en: "Colombia" },
  PE: { zh: "秘鲁", en: "Peru" },
  AR: { zh: "阿根廷", en: "Argentina" },
  CL: { zh: "智利", en: "Chile" },
  EC: { zh: "厄瓜多尔", en: "Ecuador" },
  VE: { zh: "委内瑞拉", en: "Venezuela" },
  ES: { zh: "西班牙", en: "Spain" },
  PT: { zh: "葡萄牙", en: "Portugal" },
  NL: { zh: "荷兰", en: "Netherlands" },
  BE: { zh: "比利时", en: "Belgium" },
  PL: { zh: "波兰", en: "Poland" },
  UA: { zh: "乌克兰", en: "Ukraine" },
  BY: { zh: "白俄罗斯", en: "Belarus" },
  UZ: { zh: "乌兹别克斯坦", en: "Uzbekistan" },
  KG: { zh: "吉尔吉斯斯坦", en: "Kyrgyzstan" },
  TJ: { zh: "塔吉克斯坦", en: "Tajikistan" },
  TM: { zh: "土库曼斯坦", en: "Turkmenistan" },
  TR: { zh: "土耳其", en: "Türkiye" },
  IR: { zh: "伊朗", en: "Iran" },
  IQ: { zh: "伊拉克", en: "Iraq" },
  SA: { zh: "沙特阿拉伯", en: "Saudi Arabia" },
  AE: { zh: "阿联酋", en: "United Arab Emirates" },
  JO: { zh: "约旦", en: "Jordan" },
  LB: { zh: "黎巴嫩", en: "Lebanon" },
  SY: { zh: "叙利亚", en: "Syria" },
  YE: { zh: "也门", en: "Yemen" },
  AF: { zh: "阿富汗", en: "Afghanistan" },
  LK: { zh: "斯里兰卡", en: "Sri Lanka" },
  MV: { zh: "马尔代夫", en: "Maldives" },
  KH: { zh: "柬埔寨", en: "Cambodia" },
  SE: { zh: "瑞典", en: "Sweden" },
  NO: { zh: "挪威", en: "Norway" },
  FI: { zh: "芬兰", en: "Finland" },
  DK: { zh: "丹麦", en: "Denmark" },
  CH: { zh: "瑞士", en: "Switzerland" },
  AT: { zh: "奥地利", en: "Austria" },
  CZ: { zh: "捷克", en: "Czechia" },
  HU: { zh: "匈牙利", en: "Hungary" },
  RO: { zh: "罗马尼亚", en: "Romania" },
  GR: { zh: "希腊", en: "Greece" },
  IE: { zh: "爱尔兰", en: "Ireland" },
  NZ: { zh: "新西兰", en: "New Zealand" },
  IL: { zh: "以色列", en: "Israel" },
};

export const COUNTRY_CODES = Object.keys(COUNTRIES).sort((a, b) =>
  COUNTRIES[a].en.localeCompare(COUNTRIES[b].en),
);

const FLAG_OFFSET = 0x1f1e6 - "A".charCodeAt(0);

export function flagOf(code: string): string {
  if (!/^[A-Za-z]{2}$/.test(code)) return "🌍";
  return String.fromCodePoint(
    ...[...code.toUpperCase()].map((letter) => letter.charCodeAt(0) + FLAG_OFFSET),
  );
}

export function countryLabel(code: string): string {
  const entry = COUNTRIES[code.toUpperCase()];
  return entry ? `${entry.zh} ${entry.en}` : code;
}

export function countryZh(code: string): string {
  return COUNTRIES[code.toUpperCase()]?.zh ?? code;
}
