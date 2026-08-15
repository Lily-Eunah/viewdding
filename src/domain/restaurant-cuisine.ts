export const RESTAURANT_CUISINE_CATEGORIES = [
  "한식",
  "일식",
  "중식",
  "양식",
  "아시아 음식",
  "세계 음식",
  "카페·디저트",
  "기타",
] as const;

export type RestaurantCuisineCategory = typeof RESTAURANT_CUISINE_CATEGORIES[number];

const CATEGORY_RULES: Array<{
  category: Exclude<RestaurantCuisineCategory, "기타">;
  pattern: RegExp;
}> = [
  {
    category: "한식",
    pattern: /한식|한우|한정식|갈비|삼겹|돼지|목살|소고기|고기|곱창|막창|족발|보쌈|국밥|곰탕|냉면|수육|전골|닭갈비|백숙|삼계탕|육개장|비빔밥|솥밥|코다리|아구찜|해장국|흑염소|쌈밥|낙곱새|낙지볶음|편백찜|전통주|막걸리|보리굴비|남도|제철회|숙성회|해산물|간장게장|고깃집/,
  },
  {
    category: "일식",
    pattern: /일식|일본|이자카야|스시|사시미|초밥|오마카세|야키니쿠|스키야키|샤브샤브|돈카츠|우동|소바|카이센|후토마끼|참치|회|장어|나베|덮밥|호루몬/,
  },
  {
    category: "중식",
    pattern: /중식|중국|딤섬|마라|훠궈|탕수육|짜장|광동|광둥|홍콩|누룽지탕/,
  },
  {
    category: "양식",
    pattern: /양식|이탈리|파스타|피자|스테이크|프렌치|브런치|유러피안|비스트로|리소토|리조또|리조토|뇨끼|샐러드|샌드위치|아메리칸|미국식|와인|필라프|치킨스테이크/,
  },
  {
    category: "아시아 음식",
    pattern: /태국|베트남|인도|아시안|월남쌈/,
  },
  {
    category: "세계 음식",
    pattern: /멕시|스페인|브라질|체코|쿠바|지중해|슈하스코|타파스/,
  },
  {
    category: "카페·디저트",
    pattern: /카페|디저트|베이커리/,
  },
];

export function isRestaurantCuisineCategory(value: string): value is RestaurantCuisineCategory {
  return RESTAURANT_CUISINE_CATEGORIES.some((category) => category === value);
}

export function categorizeRestaurantCuisines(cuisines: string[]): RestaurantCuisineCategory[] {
  const source = cuisines.join(" ");
  const categories = CATEGORY_RULES
    .filter(({ pattern }) => pattern.test(source))
    .map(({ category }) => category);
  return categories.length > 0 ? categories : ["기타"];
}
