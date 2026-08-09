import base from "./national-followup-expansion-data.mjs";

export const checkedAt = "2026-08-09";

const baseVenues = base.venues.map((venue, index) => ({
  ...venue,
  id: `V-${base.regionCode}-${base.date.replaceAll("-", "")}-${String(index + 1).padStart(3, "0")}`,
}));

const baseHalls = base.halls.map((hall, index) => ({
  ...hall,
  id: `H-${base.regionCode}-${base.date.replaceAll("-", "")}-${String(index + 1).padStart(3, "0")}`,
}));

const source = (url, sourceGrade, sourceType, evidence) => ({ url, sourceGrade, sourceType, evidence });

export const addedVenues = [
  // 광주
  { name: "까사디루체", area: "광주", type: "전문웨딩홀", address: "광주광역시 북구 동문대로 287", ...source("https://thebestwedding.kr/casadiluce", "A", "공식 웨딩홀 페이지", "공식·현행 판매 채널에서 루체홀과 안젤로홀, 2026년 예식 운영을 교차 확인."), status: "운영확인", review: "완료" },
  { name: "메종드엘", area: "광주", type: "하우스웨딩", address: "광주광역시 서구 시청로 67 3층", ...source("https://theplanner.co.kr/place/detail/69356ac21f73d824cd055d10", "B", "현행 웨딩 판매 채널", "현행 판매 페이지에서 단독홀과 금·토·일 예식 상담을 확인."), status: "운영확인", review: "완료" },
  { name: "홀리데이인 광주호텔 웨딩", area: "광주", type: "호텔", address: "광주광역시 서구 상무누리로 55", ...source("https://www.weddingbook.com/weddinghall/a899772e-dbda-11eb-9a98-0ab3aefe6e38", "B", "현행 웨딩 판매 채널·최근 포트폴리오", "현행 상담 페이지와 2026년 로즈홀·라벤더홀 예식 포트폴리오를 확인."), status: "운영확인", review: "완료" },

  // 울산
  { name: "JW컨벤션 울산", area: "울산", type: "컨벤션", address: "울산광역시 북구 진장유통로 35", ...source("https://www.8mber.co.kr/products/listdetail?ReturnUrl=%2Fproducts%2Flist&index=14", "B", "현행 웨딩 판매 채널", "현행 판매 페이지에서 그랜드볼룸과 마제스틱홀을 분리 확인."), status: "운영확인", review: "완료" },
  { name: "르엘컨벤션", area: "울산", type: "호텔", address: "울산광역시 남구 삼산로 282 롯데호텔 울산", ...source("https://le-elconvention.com/42", "A", "공식 웨딩 페이지·현행 행사", "공식 페이지와 2026년 예식·채용 자료에서 롯데호텔 울산 내 운영을 확인."), status: "운영확인", review: "완료" },
  { name: "연암웨딩홀", area: "울산", type: "전문웨딩홀", address: "울산광역시 북구 산업로 1020", phone: "052-288-7766", ...source("https://yeon-am.co.kr/3-1", "A", "공식 홈페이지·최근 예식 공지", "공식 홈페이지와 최근 예식 공지에서 2층 로터스홀 운영을 확인."), status: "운영확인", review: "완료" },
  { name: "벨마르하우스", area: "울산", type: "하우스웨딩", address: "울산광역시 울주군 서생면 해맞이로 1386", ...source("https://www.8mber.co.kr/products/listdetail?index=28", "B", "현행 웨딩 판매 채널·공식 카카오채널", "현행 판매 페이지와 공식 채널에서 프라이빗 단독 웨딩 운영을 확인."), status: "운영확인", review: "완료" },

  // 천안·아산
  { name: "베리웨딩", area: "천안·아산", type: "컨벤션", address: "충청남도 천안시 동남구 해솔1길 27", ...source("https://www.directwedding.co.kr/weddinghall/hall0452", "B", "현행 웨딩 판매 채널", "현행 판매 페이지에서 피에스타홀과 라벤더홀을 분리 확인."), status: "운영확인", review: "완료" },
  { name: "셀레네하우스", area: "천안·아산", type: "하우스웨딩", address: "충청남도 천안시 동남구 배울1길 35", ...source("https://www.directwedding.co.kr/weddinghall/hall0451", "B", "현행 웨딩 판매 채널", "현행 판매 페이지에서 그레이스K홀의 240분 단독 하우스웨딩 운영을 확인."), status: "운영확인", review: "완료" },
  { name: "더포레 천안", area: "천안·아산", type: "하우스웨딩", address: "충청남도 천안시 동남구 다가말2길 104", ...source("https://www.weddingvenue.co.kr/news/articleView.html?idxno=288", "B", "업체 인터뷰·2026년 운영 자료", "단독 베일리홀 구조와 2026년 예약·연회 채용을 교차 확인."), status: "운영확인", review: "완료" },
  { name: "아일랜드유", area: "천안·아산", type: "하우스웨딩", address: "충청남도 천안시 서북구 부대3길 26", ...source("https://www.weddingbook.com/review/193317?reviewType=WEDDINGBOOK_REVIEW", "B", "최근 상담 후기·2026년 박람회", "자연광 단독홀 구조와 2026년 현장 상담 행사를 확인."), status: "운영확인", review: "완료" },
  { name: "아산터미널웨딩홀", area: "천안·아산", type: "전문웨딩홀", address: "충청남도 아산시 번영로 225", phone: "041-544-9881", ...source("https://www.data.go.kr/data/15129248/fileData.do?recommendDataYn=Y", "A", "아산시 공공데이터·최근 장소 업데이트", "아산시 2025-09 운영 현황과 2026년 장소 업데이트에서 영업을 확인."), status: "운영확인", review: "완료" },
  { name: "호서웨딩프라자", area: "천안·아산", type: "컨벤션", address: "충청남도 아산시 배방읍 온천대로 2230", phone: "0507-1487-2237", ...source("https://www.data.go.kr/data/15129248/fileData.do?recommendDataYn=Y", "A", "아산시 공공데이터·최근 예식 공지", "아산시 운영 현황과 2026년 5층 컨벤션홀 예식 공지를 교차 확인."), status: "운영확인", review: "완료" },
  { name: "빌라드70", area: "천안·아산", type: "하우스웨딩", address: "충청남도 아산시 염치읍 송곡남길 70", ...source("https://marketbz.com/companyDetail/5243301202", "B", "현행 사업자 정보·웨딩 판매 채널", "2026년 현행 사업자 정보와 단독 실내·야외 웨딩 판매를 확인."), status: "운영확인", review: "완료" },
  { name: "모나밸리", area: "천안·아산", type: "복합문화공간", address: "충청남도 아산시 순천향로 624", ...source("https://www.monavalley.co.kr/", "A", "공식 홈페이지·현행 웨딩 판매 채널", "공식 홈페이지와 2026년 예약 채널에서 아레나홀 웨딩 운영을 확인."), status: "운영확인", review: "완료" },
  { name: "디바인밸리", area: "천안·아산", type: "야외웨딩", address: "충청남도 아산시 순천향로 623", ...source("https://www.monavalley.co.kr/sub.php?Page=sub2-2", "A", "공식 홈페이지·최근 행사", "공식 페이지에서 별도 주소의 가든 웨딩 공간과 최근 행사를 확인."), status: "운영확인", review: "완료" },

  // 청주
  { name: "벨리스웨딩", area: "청주", type: "하우스웨딩", address: "충청북도 청주시 서원구 남이면 청남로 1759", alias: "마리앙스웨딩컨벤션", phone: "043-283-2000", ...source("https://bellis-wedding.com/main", "A", "공식 홈페이지", "공식 홈페이지에서 구 마리앙스 주소의 실내정원형 단독 웨딩홀 운영을 확인."), status: "운영확인", review: "완료" },
  { name: "엔포드호텔 청주", area: "청주", type: "호텔", address: "충청북도 청주시 청원구 충청대로 114", ...source("https://enfordhotels.com/convention/wedding/?lang=kor", "A", "공식 호텔 웨딩 페이지", "공식 웨딩 페이지에서 직지홀 예식과 주성홀 피로연 구성을 확인."), status: "운영확인", review: "완료" },

  // 제주
  { name: "WE호텔 제주", area: "제주", type: "호텔", address: "제주특별자치도 서귀포시 1100로 453-95", phone: "064-730-1200", ...source("https://wehotel.co.kr/wedding/", "A", "공식 호텔 웨딩 페이지", "공식 사이트맵과 웨딩 페이지에서 4개 가든과 2개 연회장 웨딩을 확인."), status: "운영확인", review: "완료" },
  { name: "롯데호텔 제주", area: "제주", type: "호텔", address: "제주특별자치도 서귀포시 중문관광로72번길 35", phone: "064-731-1000", ...source("https://www.lottehotel.com/prerendered/jeju-hotel/ko/wedding-convention/convention/crystal-ballroom/index.html", "A", "공식 호텔 웨딩·컨벤션 페이지", "공식 페이지에서 크리스탈볼룸과 현재 웨딩 문의 채널을 확인."), status: "운영확인", review: "완료" },

  // 전주
  { name: "엔타워컨벤션", area: "전주", type: "컨벤션", address: "전북특별자치도 전주시 완산구 쑥고개로 242", phone: "063-253-9000", ...source("https://ntower.my.canva.site/ntower", "A", "공식 웨딩 페이지·공식 카카오채널", "공식 채널에서 2026년 운영과 베일리·카시오페아·아이리스홀을 확인."), status: "운영확인", review: "완료" },
  { name: "더 웨스틴헤라 컨벤션", area: "전주", type: "컨벤션", address: "전북특별자치도 전주시 완산구 원효자길 27", ...source("https://jweddinghall.com/", "B", "현행 지역 웨딩 판매 채널·2026년 채용", "2025년 개장 후 2026년 조리부 채용과 2개 홀의 현행 판매를 확인."), status: "운영확인", review: "완료" },
  { name: "그랜드힐스턴 호텔", area: "전주", type: "호텔", address: "전북특별자치도 전주시 완산구 온고을로 211", ...source("https://jweddinghall.com/", "B", "현행 지역 웨딩 판매 채널·최근 포트폴리오", "현행 판매 페이지와 2025~2026 포트폴리오에서 3개 홀을 확인."), status: "운영확인", review: "완료" },
  { name: "아름다운컨벤션웨딩", area: "전주", type: "컨벤션", address: "전북특별자치도 전주시 덕진구 온고을로 291", ...source("https://www.data.go.kr/data/15129195/fileData.do?recommendDataYn=Y", "A", "전주시 공공데이터·현행 웨딩 판매 채널", "전주시 예식장 현황과 현행 판매 페이지에서 운영 및 4개 홀 구조를 확인."), status: "운영확인", review: "완료" },
  { name: "더케이웨딩홀 전주", area: "전주", type: "전문웨딩홀", address: "전북특별자치도 전주시 완산구 온고을로 1 한국교직원공제회관 4층", ...source("https://www.jbnu.ac.kr/web/Board/186296/detailView.do", "A", "공공기관 게시판·현행 지역 웨딩 판매 채널", "2026년 예식 인력 모집과 오페라 단독홀 현행 판매를 확인."), status: "운영확인", review: "완료" },
  { name: "왕의지밀웨딩", area: "전주", type: "한옥·야외웨딩", address: "전북특별자치도 전주시 완산구 춘향로 5218-7", ...source("https://pf.kakao.com/_csHtb/108810247", "B", "공식 카카오채널·최근 예식 포트폴리오", "공식 채널의 웨딩 안내와 최근 야외 예식 포트폴리오를 확인."), status: "운영확인", review: "완료" },
].map((venue, index) => ({ ...venue, id: `V-${base.regionCode}-${base.date.replaceAll("-", "")}-${String(baseVenues.length + index + 1).padStart(3, "0")}`, district: districtFromAddress(venue.address) }));

const hall = (venue, name, values = {}) => ({ venue, name, ceremony: "분리예식", io: "실내", confidence: "B-강", publish: true, ...values });

export const addedHalls = [
  hall("까사디루체", "루체홀", { light: "밝음", daylight: "Y", seats: 180, guarantee: 300, interval: 60, tags: "1층·높은 천고" }),
  hall("까사디루체", "안젤로홀", { light: "밝음", daylight: "Y", seats: 180, guarantee: 300, interval: 60, tags: "3층·자연광" }),
  hall("메종드엘", "메종드엘 단독홀", { light: "밝음", house: "Y", exclusive: "Y", guarantee: 150, tags: "하우스웨딩·단독홀" }),
  hall("홀리데이인 광주호텔 웨딩", "로즈홀", { light: "어두움", tags: "호텔 웨딩" }),
  hall("홀리데이인 광주호텔 웨딩", "라벤더홀", { light: "밝음", tags: "호텔 웨딩" }),

  hall("JW컨벤션 울산", "그랜드볼룸", { light: "어두움", guarantee: 250, tags: "컨벤션·대형홀" }),
  hall("JW컨벤션 울산", "마제스틱홀", { light: "밝음", guarantee: 250, tags: "컨벤션" }),
  hall("르엘컨벤션", "그랜드볼룸", { light: "어두움", tags: "롯데호텔 울산 내" }),
  hall("르엘컨벤션", "크리스탈볼룸", { light: "밝음", tags: "롯데호텔 울산 내" }),
  hall("연암웨딩홀", "로터스홀", { light: "밝음", tags: "2층" }),
  hall("벨마르하우스", "벨마르 단독홀", { light: "밝음", daylight: "Y", house: "Y", exclusive: "Y", tags: "오션뷰·프라이빗" }),

  hall("베리웨딩", "피에스타홀", { light: "밝음", tags: "컨벤션" }),
  hall("베리웨딩", "라벤더홀", { light: "어두움", tags: "컨벤션" }),
  hall("셀레네하우스", "그레이스K홀", { light: "밝음", daylight: "Y", house: "Y", exclusive: "Y", seats: 200, guarantee: 100, interval: 240, tags: "독채 하우스웨딩" }),
  hall("더포레 천안", "베일리홀", { light: "밝음", daylight: "Y", house: "Y", exclusive: "Y", tags: "개폐형 돔천장·단독홀" }),
  hall("아일랜드유", "이담원 단독홀", { light: "밝음", daylight: "Y", house: "Y", exclusive: "Y", tags: "테라스·자연광" }),
  hall("아산터미널웨딩홀", "아산터미널 단독홀", { light: "미확인", exclusive: "Y", seats: 300, tags: "터미널 접근" }),
  hall("호서웨딩프라자", "컨벤션홀", { light: "미확인", tags: "5층" }),
  hall("빌라드70", "빌라드70 단독홀", { light: "밝음", daylight: "Y", house: "Y", exclusive: "Y", io: "실내·야외 병행", tags: "하우스·가든" }),
  hall("모나밸리", "아레나홀", { light: "밝음", daylight: "Y", house: "Y", tags: "복합문화공간" }),
  hall("디바인밸리", "디바인밸리 가든", { light: "밝음", daylight: "Y", house: "Y", io: "야외", exclusive: "Y", tags: "가든웨딩" }),

  hall("벨리스웨딩", "벨리스 단독홀", { light: "밝음", daylight: "Y", house: "Y", exclusive: "Y", tags: "실내정원형·구 마리앙스" }),
  hall("엔포드호텔 청주", "직지홀", { light: "어두움", tags: "호텔 웨딩·주성홀 피로연" }),

  hall("WE호텔 제주", "금호가든", { light: "밝음", daylight: "Y", house: "Y", io: "야외", tags: "호텔 가든웨딩", confidence: "A" }),
  hall("WE호텔 제주", "아잘리아가든", { light: "밝음", daylight: "Y", house: "Y", io: "야외", tags: "호텔 가든웨딩", confidence: "A" }),
  hall("WE호텔 제주", "메가와티가든", { light: "밝음", daylight: "Y", house: "Y", io: "야외", tags: "호텔 가든웨딩", confidence: "A" }),
  hall("WE호텔 제주", "샬레가든", { light: "밝음", daylight: "Y", house: "Y", io: "야외", tags: "호텔 가든웨딩", confidence: "A" }),
  hall("WE호텔 제주", "에메랄드룸", { light: "밝음", tags: "호텔 연회장 웨딩", confidence: "A" }),
  hall("WE호텔 제주", "제이드룸", { light: "밝음", tags: "호텔 연회장 웨딩", confidence: "A" }),
  hall("롯데호텔 제주", "크리스탈볼룸", { light: "어두움", tags: "호텔 볼룸", confidence: "A" }),

  hall("엔타워컨벤션", "베일리홀", { light: "밝음", daylight: "Y", house: "Y", tags: "하우스웨딩" }),
  hall("엔타워컨벤션", "카시오페아홀", { light: "어두움", tags: "LED·호텔형 컨벤션" }),
  hall("엔타워컨벤션", "아이리스홀", { light: "밝음", tags: "호텔형 컨벤션" }),
  hall("더 웨스틴헤라 컨벤션", "그랜드볼룸홀", { light: "어두움", tags: "2층·대형 전광판" }),
  hall("더 웨스틴헤라 컨벤션", "로얄그레이스 가든홀", { light: "밝음", daylight: "Y", house: "Y", tags: "3층·투명 천장" }),
  hall("그랜드힐스턴 호텔", "더채플홀", { light: "밝음", chapel: "Y", seats: 160, tags: "2층·호텔" }),
  hall("그랜드힐스턴 호텔", "세인트홀", { light: "어두움", seats: 180, tags: "3층·호텔" }),
  hall("그랜드힐스턴 호텔", "그레이스홀", { light: "밝음", seats: 180, tags: "5층·호텔" }),
  hall("아름다운컨벤션웨딩", "비스타홀", { light: "어두움", seats: 125, tags: "호텔형" }),
  hall("아름다운컨벤션웨딩", "펠리스타홀", { light: "밝음", chapel: "Y", seats: 125, tags: "채플형" }),
  hall("아름다운컨벤션웨딩", "피에스타홀", { light: "밝음", daylight: "Y", house: "Y", seats: 150, tags: "가든형" }),
  hall("아름다운컨벤션웨딩", "컨벤션홀", { light: "어두움", seats: 150, tags: "대형 스크린" }),
  hall("더케이웨딩홀 전주", "오페라홀", { light: "어두움", exclusive: "Y", seats: 150, tags: "4층·단독홀" }),
  hall("왕의지밀웨딩", "왕의지밀 야외웨딩", { light: "밝음", daylight: "Y", house: "Y", io: "야외", exclusive: "Y", tags: "한옥·목적지형" }),
].map((item, index) => ({ ...item, id: `H-${base.regionCode}-${base.date.replaceAll("-", "")}-${String(baseHalls.length + index + 1).padStart(3, "0")}` }));

export const candidates = [
  ["광주", "라붐웨딩홀", "운영확인", "홀명·홀 수 공식 확인 필요"], ["광주", "JS웨딩컨벤션", "운영확인", "홀명·홀 수 공식 확인 필요"], ["광주", "시크릿가든", "운영확인", "독립 베뉴 여부·홀명 확인 필요"], ["광주", "라부쏠라", "운영확인", "홀 구조 확인 필요"], ["광주", "더시그너스", "운영확인", "홀 구조 확인 필요"], ["광주", "하우스오브드메르", "운영확인", "드메르와 별도 사업장·홀 구조 확인 필요"], ["광주", "메리포엠", "운영확인", "홀 구조 확인 필요"], ["광주", "센트럴호텔웨딩홀", "미확인", "최근 예식 상품 확인 필요"], ["광주", "광주무역센터웨딩홀", "미확인", "최근 운영·홀 구조 확인 필요"], ["광주", "라마다플라자 광주호텔", "미확인", "현재 웨딩 상품 확인 필요"], ["광주", "데일리웨딩컨벤션", "운영확인", "비스타·라비아 외 현행 홀 구성 확인 필요"], ["광주", "운림제", "운영확인", "목적지형 야외 예식 상시 판매 여부 확인 필요"],
  ["울산", "더엠컨벤션", "운영확인", "현행 홀명·홀 수 확인 필요"], ["울산", "타니베이호텔 웨딩", "운영확인", "현행 웨딩 상품·홀명 확인 필요"], ["울산", "보람컨벤션", "운영확인", "홀명·홀 수 확인 필요"],
  ["천안·아산", "S컨벤션 천안", "운영확인", "현행 홀명과 야외홀 분리 확인 필요"], ["천안·아산", "나비스퀘어", "운영예정", "2026-09 개장 후 운영 확인 필요"], ["천안·아산", "J&J아트컨벤션", "미확인", "지역·현행 운영 확인 필요"], ["천안·아산", "엔팰리스컨벤션", "미확인", "천안·아산 소재 및 운영 확인 필요"], ["천안·아산", "드마레웨딩컨벤션", "미확인", "지역·현행 운영 확인 필요"], ["천안·아산", "벨르웨딩파티", "폐업", "아산시 공공데이터 폐업 — 공개 제외"],
  ["청주", "S컨벤션 청주", "운영확인", "공식 홀명·홀 수 확인 필요"], ["청주", "에스가든 청주", "운영확인", "웨딩홀과 에덴아트홀 명칭 관계 확인 필요"], ["청주", "그랜드플라자 청주호텔", "미확인", "현재 웨딩 전용 상품 확인 필요"], ["청주", "아름다운웨딩홀 청주", "운영확인", "홀 구조·공식 홈페이지 확인 필요"],
  ["제주", "메종글래드 제주", "미확인", "연회장 외 현재 웨딩 상품 확인 필요"], ["제주", "제주신라호텔", "미확인", "현재 웨딩 상품 확인 필요"], ["제주", "해비치 호텔앤드리조트 제주", "미확인", "현재 웨딩 상품 확인 필요"], ["제주", "파르나스호텔 제주", "미확인", "현재 웨딩 상품 확인 필요"], ["제주", "그랜드하얏트 제주", "미확인", "현재 웨딩 상품 확인 필요"], ["제주", "씨에스호텔", "미확인", "목적지형 웨딩 상시 판매 확인 필요"],
  ["전주", "알펜시아웨딩컨벤션", "미확인", "2024 공공데이터 이후 최근 운영·홀 구조 확인 필요"], ["전주", "웨딩팰리스", "미확인", "최근 예식 증거 부족·상호 변경 여부 확인 필요"],
].map(([area, name, status, action], index) => ({ candidate_id: `C-X3-${String(index + 1).padStart(3, "0")}`, area, name, status, action }));

export const coverage = [
  ["광주", "동구·서구·남구·북구·광산구", 2, 0, "포화"],
  ["울산", "중구·남구·동구·북구·울주군", 2, 0, "포화"],
  ["천안·아산", "천안 동남구·서북구·아산시", 2, 0, "포화"],
  ["청주", "상당구·서원구·흥덕구·청원구", 2, 0, "포화"],
  ["제주", "제주시·서귀포시", 2, 0, "포화"],
  ["전주", "완산구·덕진구", 2, 0, "포화"],
].map(([area, units, zeroPasses, newCandidates, result]) => ({ area, units, zeroPasses, newCandidates, result, checkedAt }));

export const searchLog = [
  ["광주", "광주광역시 예식장·웨딩홀 5개 구, 박람회 제휴처, 신규·폐업·호텔·야외", "공식 홈페이지·JA웨딩·다이렉트·웨딩북", 0],
  ["울산", "울산 5개 구군 웨딩홀, 박람회 제휴처, 신규·폐업·호텔·야외", "공식 홈페이지·현행 판매 채널·최근 채용", 0],
  ["천안·아산", "천안 2개 구·아산시 예식장, 공공데이터, 신규·폐업·하우스", "아산시 공공데이터·공식 홈페이지·현행 판매 채널", 0],
  ["청주", "청주 4개 구 웨딩홀, 신규·폐업·호텔·컨벤션", "공식 홈페이지·다이렉트·웨딩북·최근 채용", 0],
  ["제주", "제주시·서귀포시 예식장, 호텔 웨딩, 가든·목적지형", "공식 호텔 웨딩 페이지·현행 판매 채널", 0],
  ["전주", "완산구·덕진구 예식장, 지자체 현황, 신규·폐업·호텔·한옥", "전주시 공공데이터·공식 채널·현행 판매 채널", 0],
].map(([area, query, channels, newCandidates], index) => ({ log_id: `L-X3-${String(index + 1).padStart(3, "0")}`, area, pass: "최종 독립 확인", query, channels, newCandidates, checkedAt }));

export const aliases = [
  { canonical: "벨리스웨딩", alias: "마리앙스웨딩컨벤션", note: "동일 주소의 현행 상호" },
  { canonical: "모나밸리", alias: "모나무르", note: "현행 브랜드명 변경" },
  { canonical: "홀리데이인 광주호텔 웨딩", alias: "광주웨딩시대(홀리데이인호텔 내)", note: "판매 채널 표기" },
  { canonical: "더케이웨딩홀 전주", alias: "더케이웨딩홀 전주N", note: "장소 플랫폼 표기" },
];

function districtFromAddress(address) {
  const match = address.match(/^(?:광주광역시|울산광역시)\s+([^\s]+)|^(?:충청남도|충청북도|제주특별자치도|전북특별자치도)\s+([^\s]+(?:\s+[^\s]+구)?)/);
  return match?.[1] ?? match?.[2] ?? "지역 확인 필요";
}

function categoryFor(item) {
  if (item.io === "야외") return "야외홀";
  if (item.house === "Y") return "하우스웨딩홀";
  if (item.chapel === "Y") return "채플홀";
  if (item.light === "밝음") return "밝은홀";
  if (item.light === "어두움") return "어두운홀";
  return "호텔홀";
}

export const venues = [...baseVenues, ...addedVenues];
export const halls = [...baseHalls, ...addedHalls].map((item) => ({
  ...item,
  category: categoryFor(item),
  reason: item.reason ?? `${item.name}은 현행 공식 또는 판매 채널에서 독립 예식 공간으로 확인됨.`,
  confidence: item.confidence === "B-strong" ? "B-강" : (item.confidence ?? "B-강"),
  publish: item.publish ?? true,
}));

export default {
  regionName: "광주 → 울산 → 천안·아산 → 청주 → 제주 → 전주",
  regionCode: base.regionCode,
  date: checkedAt,
  venues,
  halls,
  candidates,
  coverage,
  searchLog,
  aliases,
};
