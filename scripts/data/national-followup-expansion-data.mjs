export const checkedAt = "2026-08-09";

const direct = (id) => `https://www.directwedding.co.kr/weddinghall/${id}`;

export const venues = [
  // 광주
  { name: "광주 위더스웨딩홀", area: "광주", type: "전문웨딩홀", address: "광주광역시 서구 죽봉대로 153", phone: "062-364-1234", url: "https://m.withusgj.co.kr/", sourceGrade: "A", sourceType: "공식 홈페이지·현행 웨딩 판매 채널", evidence: "공식 홈페이지가 4개 홀과 현재 예약 채널을 운영하고 현행 판매 페이지에 2026년 상담 후기가 확인됨." },
  { name: "드메르웨딩홀", area: "광주", type: "전문웨딩홀", address: "광주광역시 광산구 임방울대로 549", url: direct("hall0046"), sourceGrade: "B", sourceType: "현행 웨딩 판매 채널", evidence: "현행 상담 페이지가 4개 홀을 분리해 안내하고 2026년 예식 후기를 제공함." },
  { name: "제이아트웨딩컨벤션", area: "광주", type: "컨벤션", address: "광주광역시 서구 풍서좌로 269", url: direct("hall0050"), sourceGrade: "B", sourceType: "현행 웨딩 판매 채널", evidence: "현행 상담 페이지가 3개 홀의 층·좌석·예식 간격을 구분해 제공함." },

  // 천안·아산
  { name: "비렌티웨딩", area: "천안·아산", type: "전문웨딩홀", address: "충청남도 천안시 서북구 천안대로 1198-30", url: direct("hall0450"), sourceGrade: "B", sourceType: "현행 웨딩 판매 채널", evidence: "2026년 상담 후기와 함께 베르테·루체오·피오렐라홀을 독립 상품으로 안내함." },
  { name: "T웨딩 천안", area: "천안·아산", type: "전문웨딩홀", address: "충청남도 천안시 동남구 목천읍 응원3길 29", url: "https://twed.co.kr/main/", sourceGrade: "A", sourceType: "공식 홈페이지·현행 웨딩 판매 채널", evidence: "공식 홈페이지가 2025년 리뉴얼 소식과 3개 홀을 안내하고 현행 판매 페이지가 홀별 인원을 제공함." },
  { name: "CA웨딩컨벤션", area: "천안·아산", type: "컨벤션", address: "충청남도 아산시 배방읍 희망로 100", url: direct("hall0337"), sourceGrade: "B", sourceType: "현행 웨딩 판매 채널", evidence: "천안아산역 2층의 블리스홀·루체홀을 현재 분리 판매하며 홀별 인원과 80분 간격을 안내함." },

  // 울산
  { name: "문수컨벤션웨딩홀", area: "울산", type: "컨벤션", address: "울산광역시 남구 문수로 44", url: direct("hall0387"), sourceGrade: "B", sourceType: "현행 웨딩 판매 채널", evidence: "현행 상담 페이지와 2025년 하반기 예식 후기가 3개 홀의 운영을 확인함." },
  { name: "W시티컨벤션 울산", area: "울산", type: "컨벤션", address: "울산광역시 북구 진장17길 7", url: direct("hall0385"), sourceGrade: "B", sourceType: "현행 웨딩 판매 채널", evidence: "그랜드홀과 하우스가든홀을 별도 판매하며 홀별 인원과 60분 간격을 제공함." },
  { name: "MH컨벤션웨딩", area: "울산", type: "컨벤션", address: "울산광역시 남구 삼산로 226", url: direct("hall0384"), sourceGrade: "B", sourceType: "현행 웨딩 판매 채널", evidence: "체리티·그랜드·토파즈홀을 층별로 구분해 현재 상담하고 있음." },

  // 청주
  { name: "아모르아트웨딩컨벤션", area: "청주", type: "컨벤션", address: "충청북도 청주시 흥덕구 남석로 579", url: direct("hall0456"), sourceGrade: "B", sourceType: "현행 웨딩 판매 채널", evidence: "3개 홀의 층·착석·인원·60분 간격과 2026년 예식 후기가 확인됨." },
  { name: "메리다웨딩컨벤션", area: "청주", type: "컨벤션", address: "충청북도 청주시 청원구 내수읍 충청대로 400", url: direct("hall0455"), sourceGrade: "B", sourceType: "현행 웨딩 판매 채널", evidence: "달리아·가드니아·이베리스홀의 현재 상담과 2025년 예식 후기가 확인됨." },
  { name: "더빈웨딩홀", area: "청주", type: "전문웨딩홀", address: "충청북도 청주시 흥덕구 강내면 학천길 5", url: direct("hall0453"), sourceGrade: "B", sourceType: "현행 웨딩 판매 채널", evidence: "파티오하우스·가드니아·그랜드볼룸을 분리해 홀별 인원과 60분 간격을 제공함." },

  // 제주
  { name: "휘닉스 아일랜드 제주", area: "제주", type: "호텔", address: "제주특별자치도 서귀포시 성산읍 섭지코지로 107", phone: "064-731-7000", url: "https://phoenixhnr.co.kr/static/jeju/party/wedding-mint", sourceGrade: "A", sourceType: "공식 호텔 웨딩 페이지", evidence: "공식 사이트가 플로이스트와 아일랜드 볼룸의 현재 웨딩 문의, 위치와 좌석을 안내함." },
  { name: "호텔 더본 제주", area: "제주", type: "호텔", address: "제주특별자치도 서귀포시 색달로 18", phone: "064-766-8905", url: "https://hoteltheborn.com/banquet/wedding_hall/", sourceGrade: "A", sourceType: "공식 호텔 웨딩 페이지", evidence: "공식 웨딩 페이지가 지하 1층 웨딩홀의 현재 문의 채널과 120석 정보를 제공함." },

  // 전주
  { name: "더메이호텔", area: "전주", type: "호텔", address: "전북특별자치도 전주시 덕진구 기린대로 800", url: direct("hall0431"), sourceGrade: "B", sourceType: "현행 웨딩 판매 채널", evidence: "더메이·그랜드볼룸·마제스틱볼룸을 분리해 현재 판매함." },
  { name: "웨딩의전당", area: "전주", type: "전문웨딩홀", address: "전북특별자치도 전주시 덕진구 백제대로 832", url: direct("hall0435"), sourceGrade: "B", sourceType: "현행 웨딩 판매 채널", evidence: "소노·펠리체·하늘정원을 분리해 안내하고 2025년 야외 예식 후기가 확인됨." },
  { name: "라한호텔 전주", area: "전주", type: "호텔", address: "전북특별자치도 전주시 완산구 기린대로 85", url: direct("hall0432"), sourceGrade: "B", sourceType: "공식 호텔·현행 웨딩 판매 채널", evidence: "온고을홀의 현재 상담, 250석과 90분 예식 간격을 안내함." },
];

const hall = (venue, name, values = {}) => ({ venue, name, ceremony: "분리예식", io: "실내", ...values });

export const halls = [
  hall("광주 위더스웨딩홀", "메리엘홀", { light: "어두움", seats: 130, interval: 60, tags: "1층|높은 천고" }),
  hall("광주 위더스웨딩홀", "펠리체홀", { light: "어두움", seats: 130, guarantee: 250, interval: 60, tags: "3층" }),
  hall("광주 위더스웨딩홀", "아모르홀", { light: "밝음", seats: 130, guarantee: 300, interval: 60, tags: "3층" }),
  hall("광주 위더스웨딩홀", "엘린홀", { light: "밝음", seats: 120, guarantee: 250, interval: 60, tags: "5층" }),
  hall("드메르웨딩홀", "르씨엘홀", { light: "어두움", chapel: "Y", seats: 180, guarantee: 200, interval: 60, tags: "1층|채플 무드" }),
  hall("드메르웨딩홀", "CN홀", { light: "어두움", seats: 250, capacity: 500, guarantee: 200, interval: 60, tags: "2층|호텔 무드" }),
  hall("드메르웨딩홀", "베일리홀", { light: "전환형", seats: 180, capacity: 500, guarantee: 230, interval: 60, tags: "2층|화이트·그린" }),
  hall("드메르웨딩홀", "라비엔홀", { light: "어두움", seats: 250, capacity: 500, guarantee: 230, interval: 60, tags: "4층" }),
  hall("제이아트웨딩컨벤션", "아모레홀", { light: "어두움", seats: 160, guarantee: 250, interval: 60, tags: "1층|단독홀" }),
  hall("제이아트웨딩컨벤션", "알루체홀", { light: "밝음", seats: 130, guarantee: 250, interval: 60, tags: "3층|핑크 무드" }),
  hall("제이아트웨딩컨벤션", "페디스홀", { light: "어두움", seats: 200, capacity: 600, guarantee: 150, interval: 60, tags: "3층" }),

  hall("비렌티웨딩", "베르테홀", { light: "어두움", seats: 200, guarantee: 250, interval: 60, tags: "3층" }),
  hall("비렌티웨딩", "루체오홀", { light: "밝음", seats: 200, guarantee: 250, interval: 60, tags: "2층|화이트톤" }),
  hall("비렌티웨딩", "피오렐라홀", { light: "밝음", house: "Y", seats: 100, guarantee: 150, interval: 60, tags: "별관 3층|하우스 무드" }),
  hall("T웨딩 천안", "투데이홀", { light: "어두움", ceremony: "동시예식", seats: 200, capacity: 500, guarantee: 15, interval: 90, tags: "1층|샹들리에 연출" }),
  hall("T웨딩 천안", "그레이스홀", { light: "어두움", seats: 150, capacity: 600, guarantee: 200, interval: 60, tags: "1층|앤티크" }),
  hall("T웨딩 천안", "투게더홀", { light: "어두움", seats: 150, capacity: 600, guarantee: 200, interval: 60, tags: "1층|샹들리에" }),
  hall("CA웨딩컨벤션", "블리스홀", { light: "어두움", seats: 150, guarantee: 250, interval: 80, tags: "천안아산역 2층|호텔 무드" }),
  hall("CA웨딩컨벤션", "루체홀", { light: "밝음", seats: 150, guarantee: 250, interval: 80, tags: "천안아산역 2층|화사한 무드" }),

  hall("문수컨벤션웨딩홀", "블루밍하우스", { light: "밝음", house: "Y", seats: 150, guarantee: 200, tags: "1층|하우스 무드" }),
  hall("문수컨벤션웨딩홀", "아비뇽", { light: "어두움", seats: 250, guarantee: 200, tags: "지하 1층" }),
  hall("문수컨벤션웨딩홀", "줄리엣테라스", { light: "밝음", daylight: "Y", house: "Y", io: "실내·야외 병행", seats: 120, guarantee: 200, tags: "1층|테라스" }),
  hall("W시티컨벤션 울산", "그랜드홀", { light: "어두움", seats: 120, capacity: 500, guarantee: 150, interval: 60, tags: "7층|블랙홀" }),
  hall("W시티컨벤션 울산", "하우스가든홀", { light: "밝음", house: "Y", seats: 120, capacity: 500, guarantee: 150, interval: 60, tags: "7층|가든 무드" }),
  hall("MH컨벤션웨딩", "체리티홀", { light: "밝음", seats: 160, guarantee: 150, interval: 60, tags: "4층" }),
  hall("MH컨벤션웨딩", "그랜드홀", { light: "어두움", seats: 150, guarantee: 160, interval: 60, tags: "1층" }),
  hall("MH컨벤션웨딩", "토파즈홀", { light: "어두움", seats: 150, guarantee: 150, interval: 60, tags: "3층" }),

  hall("아모르아트웨딩컨벤션", "아트홀", { light: "전환형", seats: 200, capacity: 700, guarantee: 250, interval: 60, ceiling: "10m 이상" }),
  hall("아모르아트웨딩컨벤션", "아모르홀", { light: "밝음", chapel: "Y", seats: 150, capacity: 600, guarantee: 250, interval: 60, tags: "4층|채플 스타일" }),
  hall("아모르아트웨딩컨벤션", "그랜드홀", { light: "어두움", seats: 150, capacity: 700, guarantee: 250, interval: 60, ceiling: "10m 이상" }),
  hall("메리다웨딩컨벤션", "달리아홀", { light: "어두움", seats: 210, guarantee: 250, interval: 60, tags: "1층" }),
  hall("메리다웨딩컨벤션", "가드니아홀", { light: "밝음", house: "Y", seats: 70, guarantee: 100, interval: 60, tags: "3층|소규모 하우스" }),
  hall("메리다웨딩컨벤션", "이베리스홀", { light: "밝음", seats: 100, guarantee: 250, interval: 60, tags: "1층" }),
  hall("더빈웨딩홀", "파티오하우스", { light: "밝음", house: "Y", seats: 120, guarantee: 150, interval: 60, tags: "3층|하우스 무드" }),
  hall("더빈웨딩홀", "가드니아홀", { light: "밝음", seats: 150, guarantee: 200, interval: 60, tags: "3층" }),
  hall("더빈웨딩홀", "그랜드볼룸", { light: "어두움", seats: 200, guarantee: 200, interval: 60, ceiling: "9m", tags: "4층" }),

  hall("휘닉스 아일랜드 제주", "플로이스트 웨딩", { light: "밝음", daylight: "Y", house: "Y", ceremony: "동시예식", seats: 40, capacity: 40, guarantee: 15, tags: "글라스하우스 2층|오션뷰|목적지형", confidence: "A" }),
  hall("휘닉스 아일랜드 제주", "아일랜드 볼룸", { light: "밝음", ceremony: "동시예식", seats: 300, guarantee: 100, tags: "B동 2층|호텔 웨딩", confidence: "A" }),
  hall("호텔 더본 제주", "웨딩홀", { light: "밝음", ceremony: "동시예식", seats: 120, capacity: 120, tags: "지하 1층|호텔 웨딩", confidence: "A" }),

  hall("더메이호텔", "더메이홀", { light: "밝음", house: "Y", seats: 150, capacity: 250, guarantee: 200, interval: 120, tags: "4층|프라이빗" }),
  hall("더메이호텔", "그랜드볼룸", { light: "어두움", seats: 250, capacity: 400, guarantee: 200, interval: 70, tags: "2층" }),
  hall("더메이호텔", "마제스틱볼룸", { light: "어두움", seats: 250, capacity: 400, guarantee: 200, interval: 70, tags: "2층" }),
  hall("웨딩의전당", "소노홀", { light: "어두움", seats: 150, guarantee: 150, interval: 60, tags: "1층" }),
  hall("웨딩의전당", "펠리체홀", { light: "밝음", seats: 150, guarantee: 150, interval: 60, tags: "2층" }),
  hall("웨딩의전당", "하늘정원", { light: "밝음", daylight: "Y", house: "Y", io: "야외", guarantee: 150, tags: "5층|야외 웨딩" }),
  hall("라한호텔 전주", "온고을홀", { light: "어두움", ceremony: "동시·분리 선택", seats: 250, capacity: 500, guarantee: 200, interval: 90, tags: "1층|호텔 웨딩" }),
];

function districtFromAddress(address) {
  const province = address.match(/^(?:충청남도|충청북도|제주특별자치도|전북특별자치도)\s+([가-힣]+시)(?:\s+([가-힣]+구))?/);
  if (province) return [province[1], province[2]].filter(Boolean).join(" ");
  return address.match(/^(?:광주광역시|울산광역시)\s+([가-힣]+(?:구|군))/)?.[1] ?? "지역 확인 필요";
}

function categoryFor(item) {
  if (item.io === "야외") return "야외웨딩홀";
  if (item.house === "Y") return "하우스웨딩홀";
  if (item.chapel === "Y") return "채플 홀";
  if (item.light === "밝음") return "밝은 홀";
  if (item.light === "어두움") return "어두운 홀";
  if (item.light === "전환형") return "전환형 홀";
  return "호텔 홀";
}

export default {
  regionName: "광주 → 천안·아산 → 울산 → 청주 → 제주 → 전주",
  regionCode: "REG-X3",
  date: checkedAt,
  venues: venues.map((venue) => ({ ...venue, district: districtFromAddress(venue.address), status: "운영확인", review: "완료" })),
  halls: halls.map((item) => ({
    ...item,
    category: categoryFor(item),
    reason: item.reason ?? `${item.name}이 현행 공식 또는 판매 채널에서 독립 웨딩 공간으로 확인됨.`,
    confidence: item.confidence ?? "B-strong",
    publish: true,
  })),
};
