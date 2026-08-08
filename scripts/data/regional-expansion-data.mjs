export const checkedAt = "2026-08-09";

const direct = (id) => `https://www.directwedding.co.kr/weddinghall/${id}`;

export const venues = [
  // 부산
  { name: "라온웨딩홀", area: "부산", type: "전문웨딩홀", address: "부산광역시 부산진구 중앙대로 640 ABL부산타워 23층", phone: "051-631-2121", url: "https://raonweddinghall.com/", grade: "A", sourceType: "공식 홈페이지", evidence: "공식 홈페이지가 2026년 상담과 단독 웨딩홀의 좌석·수용 인원을 현재 안내함." },
  { name: "더펄웨딩홀", area: "부산", type: "전문웨딩홀", address: "부산광역시 부산진구 황령대로 24", url: direct("hall0233"), grade: "B", sourceType: "현행 웨딩 판매 채널", evidence: "현행 상담 채널이 2층 단독홀의 인원과 180분 예식 간격을 안내함." },
  { name: "디엘웨딩홀", area: "부산", type: "전문웨딩홀", address: "부산광역시 동구 조방로 14", url: direct("hall0234"), grade: "B", sourceType: "현행 웨딩 판매 채널", evidence: "마이아홀과 아모르홀을 별도 판매하며 홀별 인원과 예식 간격을 제공함." },
  { name: "우리컨벤션웨딩홀", area: "부산", type: "컨벤션", address: "부산광역시 동구 중앙대로361번길 14", url: direct("hall0248"), grade: "B", sourceType: "현행 웨딩 판매 채널", evidence: "현행 상담 채널이 19층 단독홀의 인원과 90분 예식 간격을 안내함." },
  { name: "국제신문 K웨딩홀", area: "부산", type: "전문웨딩홀", address: "부산광역시 연제구 중앙대로 1217", url: direct("hall0228"), grade: "B", sourceType: "현행 웨딩 판매 채널", evidence: "K7홀과 K홀을 분리해 홀별 인원과 90분 예식 간격을 안내함." },
  { name: "아시아드시티웨딩홀", area: "부산", type: "전문웨딩홀", address: "부산광역시 연제구 월드컵대로 344", url: direct("hall0244"), grade: "B", sourceType: "공식 홈페이지·현행 웨딩 판매 채널", evidence: "현재 상담 채널과 공식 홈페이지가 르느아르·마그리트·고흐홀을 각각 안내함." },
  { name: "한화리조트 해운대", area: "부산", type: "호텔", address: "부산광역시 해운대구 마린시티3로 52", url: direct("hall0253"), grade: "B", sourceType: "현행 웨딩 판매 채널", evidence: "베르나차홀과 몬테로소홀을 별도 판매하고 홀별 인원과 90분 예식 간격을 안내함." },
  { name: "파라다이스 호텔 부산", area: "부산", type: "호텔", address: "부산광역시 해운대구 해운대해변로 296", url: "https://www.busanparadisehotel.co.kr/front/facility/sweddingroom?F_CATE2=SWEDDING&F_CATE3=GRAND_BALLROOM", grade: "A", sourceType: "공식 호텔 웨딩 페이지", evidence: "공식 호텔 사이트가 그랜드볼룸 웨딩과 현재 문의 채널을 제공함." },
  { name: "파크 하얏트 부산", area: "부산", type: "호텔", address: "부산광역시 해운대구 마린시티1로 51", url: "https://www.hyatt.com/park-hyatt/ko-KR/busph-park-hyatt-busan/weddings", grade: "A", sourceType: "공식 호텔 웨딩 페이지", evidence: "공식 웨딩 페이지가 볼룸을 최대 230명 규모의 웨딩 공간으로 안내함." },
  { name: "롯데호텔 부산", area: "부산", type: "호텔", address: "부산광역시 부산진구 가야대로 772", url: "https://www.lottehotel.com/prerendered/busan-hotel/ko/wedding-convention/hotel-wedding/pearl-room/index.html", grade: "A", sourceType: "공식 호텔 웨딩 페이지", evidence: "롯데호텔 공식 페이지가 펄룸의 호텔 웨딩을 현재 안내함." },
  { name: "아바니 센트럴 부산", area: "부산", type: "호텔", address: "부산광역시 남구 전포대로 133", url: "https://www.avanihotels.com/uploads/minor/avani/documents/vbif/hotel-info/2025_avani_fact-sheet_leaflet_kor.pdf", grade: "A", sourceType: "공식 호텔 자료", evidence: "공식 호텔 자료가 5층 아바니홀의 웨딩·연회 운영을 안내함." },
  { name: "프루터리포레스트", area: "부산", type: "하우스웨딩홀", address: "부산광역시 해운대구 달맞이길 491", url: "https://fruiterie.co.kr/rental", grade: "A", sourceType: "공식 대관 페이지", evidence: "공식 대관 페이지가 포레스트·루프탑 웨딩과 현재 상담을 제공함." },

  // 경남
  { name: "미래웨딩캐슬", area: "경남", type: "전문웨딩홀", address: "경상남도 창원시 의창구 창원대로363번길 22-57", url: direct("hall0447"), grade: "B", sourceType: "현행 웨딩 판매 채널", evidence: "오페라·VIP·하모니홀을 별도 판매하고 2026년 상담을 제공함." },
  { name: "리베라컨벤션", area: "경남", type: "컨벤션", address: "경상남도 창원시 성산구 중앙대로100번길 9", url: direct("hall0446"), grade: "B", sourceType: "현행 웨딩 판매 채널", evidence: "그랜드볼룸·루벤스홀·아르덴하우스를 별도 판매하고 홀별 인원을 안내함." },
  { name: "그랜드 머큐어 앰배서더 창원", area: "경남", type: "호텔", address: "경상남도 창원시 성산구 원이대로 332", phone: "055-600-0800", url: "https://www.ambatel.com/grandmercure/changwon/en/weddingList.do", grade: "A", sourceType: "공식 호텔 웨딩 페이지", evidence: "공식 웨딩 페이지가 그랜드볼룸·가든하우스·빌라드룸의 규모와 상담 채널을 현재 제공함." },

  // 대전·세종
  { name: "BMK컨벤션", area: "대전", type: "컨벤션", address: "대전광역시 중구 서문로 133", url: direct("hall0108"), grade: "B", sourceType: "현행 웨딩 판매 채널", evidence: "하모니볼룸·아스틴홀·앰버홀을 분리해 홀별 인원과 간격을 안내함." },
  { name: "호텔ICC", area: "대전", type: "호텔", address: "대전광역시 유성구 엑스포로123번길 55", url: direct("hall0117"), grade: "B", sourceType: "공식 호텔·현행 웨딩 판매 채널", evidence: "현재 상담 채널이 그랜드볼룸과 크리스탈볼룸을 각각 안내함." },
  { name: "루이비스컨벤션 대전점", area: "대전", type: "컨벤션", address: "대전광역시 유성구 테크노중앙로 161", url: direct("hall0191"), grade: "B", sourceType: "현행 웨딩 판매 채널", evidence: "아모리스홀과 그레이스홀을 별도 판매하며 2026년 하반기 상담 후기가 확인됨." },
  { name: "라포르테", area: "대전", type: "전문웨딩홀", address: "대전광역시 서구 문정로 40", url: direct("hall0110"), grade: "B", sourceType: "현행 웨딩 판매 채널", evidence: "현행 상담 채널이 단독홀의 인원과 70분 예식 간격을 안내함." },
  { name: "빌라드알티오라", area: "대전", type: "하우스웨딩홀", address: "대전광역시 서구 한밭대로 809", url: direct("hall0113"), grade: "B", sourceType: "현행 웨딩 판매 채널", evidence: "현행 상담 채널이 단독 하우스웨딩홀의 인원과 예식 간격을 안내함." },
  { name: "메종드보네르", area: "대전", type: "하우스웨딩홀", address: "대전광역시 서구 한밭대로 797", url: direct("hall0112"), grade: "B", sourceType: "현행 웨딩 판매 채널", evidence: "현행 상담 채널이 보네르홀의 인원과 80분 예식 간격을 안내함." },
  { name: "S가든웨딩홀", area: "대전", type: "하우스웨딩홀", address: "대전광역시 서구 월드컵대로484번안길 10", url: direct("hall0109"), grade: "B", sourceType: "현행 웨딩 판매 채널", evidence: "오픈형 돔 단독 하우스웨딩홀의 현재 상담과 홀별 인원을 안내함." },
  { name: "호텔선샤인앤파라다이스", area: "대전", type: "호텔", address: "대전광역시 동구 동서대로 1700", url: direct("hall0118"), grade: "B", sourceType: "현행 웨딩 판매 채널", evidence: "그랜드볼룸·파라다이스·씨엘드포레를 독립 상품으로 현재 판매함." },
  { name: "마리드엘", area: "대전", type: "전문웨딩홀", address: "대전광역시 서구 만년로 69", url: direct("hall0111"), grade: "B", sourceType: "현행 웨딩 판매 채널", evidence: "마리드홀의 현재 상담과 홀별 인원·60분 간격을 안내함." },
  { name: "코트야드 바이 메리어트 세종", area: "세종", type: "호텔", address: "세종특별자치시 다솜3로 6", phone: "044-251-4000", url: "https://www.marriott.com/offers/make-your-wedding-even-more-special-OFF-157455/CJJCY-courtyard-sejong", grade: "A", sourceType: "공식 호텔 웨딩 상품", evidence: "메리어트 공식 페이지가 2026년 12월까지 그랜드볼룸 웨딩 상품과 문의 채널을 제공함." },

  // 대구
  { name: "AW호텔", area: "대구", type: "호텔", address: "대구광역시 달서구 성서로 413", url: direct("hall0089"), grade: "B", sourceType: "공식 홈페이지·현행 웨딩 판매 채널", evidence: "오스카·앨리스·베아트리체홀을 현재 별도 판매함." },
  { name: "M스타하우스", area: "대구", type: "전문웨딩홀", address: "대구광역시 동구 동촌로 316", url: direct("hall0091"), grade: "B", sourceType: "현행 웨딩 판매 채널", evidence: "모닝스타·화이트스타·블루스타홀의 현재 상담과 홀별 정보를 제공함." },
  { name: "노비아갈라 전자관점", area: "대구", type: "전문웨딩홀", address: "대구광역시 북구 유통단지로 45", url: direct("hall0094"), grade: "B", sourceType: "현행 웨딩 판매 채널", evidence: "보타닉가든과 벨라지오홀을 독립 상품으로 현재 판매함." },
  { name: "노비아갈라 동촌점", area: "대구", type: "전문웨딩홀", address: "대구광역시 동구 동촌로 87", url: direct("hall0093"), grade: "B", sourceType: "현행 웨딩 판매 채널", evidence: "노비아그랜드·갈라판타지아·발렌티홀을 현재 별도 판매함." },
  { name: "라온제나", area: "대구", type: "전문웨딩홀", address: "대구광역시 수성구 범어천로 73", url: direct("hall0095"), grade: "B", sourceType: "현행 웨딩 판매 채널", evidence: "끌레르홀과 컨벤션홀을 현재 별도 판매함." },
  { name: "웨딩칼라디움", area: "대구", type: "전문웨딩홀", address: "대구광역시 동구 신서동 495", url: direct("hall0103"), grade: "B", sourceType: "현행 웨딩 판매 채널", evidence: "비올라·콘서트·시크릿가든홀을 홀별 인원과 함께 현재 판매함." },
  { name: "웨딩비엔나", area: "대구", type: "전문웨딩홀", address: "대구광역시 달서구 달구벌대로 1846", url: direct("hall0101"), grade: "B", sourceType: "현행 웨딩 판매 채널", evidence: "비엔나·하우스·컨벤션홀을 독립 상품으로 현재 판매함." },
  { name: "호텔수성", area: "대구", type: "호텔", address: "대구광역시 수성구 용학로 106-7", url: direct("hall0106"), grade: "B", sourceType: "현행 웨딩 판매 채널", evidence: "피오니홀과 블레스홀을 현재 별도 판매함." },
  { name: "호텔 인터불고 엑스코", area: "대구", type: "호텔", address: "대구광역시 북구 유통단지로 80", url: direct("hall0107"), grade: "B", sourceType: "현행 웨딩 판매 채널", evidence: "그랑파티오·헤라·레아홀을 현재 독립 상품으로 판매함." },
  { name: "파라다이스웨딩", area: "대구", type: "전문웨딩홀", address: "대구광역시 달서구 구마로 52", url: direct("hall0105"), grade: "B", sourceType: "현행 웨딩 판매 채널", evidence: "스텔라홀과 그랜드볼룸을 현재 별도 판매함." },
];

const hall = (venue, name, values = {}) => ({ venue, name, ceremony: "분리예식", io: "실내", ...values });

export const halls = [
  hall("라온웨딩홀", "라온홀", { light: "밝음", daylight: "Y", house: "Y", seats: 170, capacity: 400, interval: 90, tags: "23층|단독홀|자연광", reason: "공식 홈페이지가 한 층 단독 사용, 170석과 최대 400명을 안내함.", confidence: "A" }),
  hall("더펄웨딩홀", "단독홀", { light: "어두움", seats: 180, capacity: 350, guarantee: 150, interval: 180, tags: "2층|단독홀|블랙톤", reason: "현행 판매 채널이 2층 단독홀과 180석·180분 간격을 명시함." }),
  hall("디엘웨딩홀", "마이아홀", { light: "밝음", seats: 160, capacity: 300, guarantee: 150, interval: 60 }),
  hall("디엘웨딩홀", "아모르홀", { light: "어두움", seats: 170, capacity: 300, guarantee: 150, interval: 60 }),
  hall("우리컨벤션웨딩홀", "단독홀", { light: "어두움", daylight: "부분", seats: 150, capacity: 350, guarantee: 150, interval: 90, tags: "19층|단독홀|도심 전망" }),
  hall("국제신문 K웨딩홀", "K7홀", { light: "어두움", seats: 250, capacity: 300, guarantee: 150, interval: 90 }),
  hall("국제신문 K웨딩홀", "K홀", { light: "어두움", seats: 250, capacity: 250, guarantee: 250, interval: 90 }),
  hall("아시아드시티웨딩홀", "르느아르홀", { light: "밝음", chapel: "Y", seats: 170, capacity: 1000, guarantee: 150, interval: 80 }),
  hall("아시아드시티웨딩홀", "마그리트홀", { light: "밝음", seats: 200, capacity: 1000, guarantee: 150, interval: 80 }),
  hall("아시아드시티웨딩홀", "고흐홀", { light: "어두움", seats: 280, capacity: 1000, guarantee: 150, interval: 80 }),
  hall("한화리조트 해운대", "베르나차홀", { light: "밝음", daylight: "Y", seats: 150, capacity: 300, guarantee: 120, interval: 90, ceremony: "동시예식", tags: "오션뷰|자연광" }),
  hall("한화리조트 해운대", "몬테로소홀", { light: "어두움", seats: 180, capacity: 300, guarantee: 120, interval: 90, ceremony: "동시예식" }),
  hall("파라다이스 호텔 부산", "그랜드볼룸", { light: "어두움", ceremony: "동시예식", tags: "호텔 웨딩|그랜드볼룸", confidence: "A" }),
  hall("파크 하얏트 부산", "볼룸", { light: "어두움", ceremony: "동시예식", capacity: 230, tags: "호텔 웨딩|최대 230명", confidence: "A" }),
  hall("롯데호텔 부산", "펄룸", { light: "미확인", ceremony: "동시예식", tags: "호텔 웨딩|스몰웨딩", confidence: "A" }),
  hall("아바니 센트럴 부산", "아바니홀", { light: "미확인", ceremony: "동시예식", tags: "5층|호텔 웨딩", confidence: "A" }),
  hall("프루터리포레스트", "포레스트 웨딩", { light: "밝음", daylight: "Y", house: "Y", io: "야외", ceremony: "동시예식", capacity: 200, tags: "숲|야외 웨딩|목적지형", confidence: "A" }),

  hall("미래웨딩캐슬", "오페라홀", { light: "밝음", daylight: "부분", seats: 180, capacity: 300, guarantee: 100, interval: 60, tags: "야외 웨딩 무드" }),
  hall("미래웨딩캐슬", "VIP홀", { light: "어두움", seats: 180, capacity: 300, guarantee: 100, interval: 60 }),
  hall("미래웨딩캐슬", "하모니홀", { light: "어두움", seats: 180, capacity: 300, guarantee: 100, interval: 60 }),
  hall("리베라컨벤션", "그랜드볼룸", { light: "어두움", chapel: "Y", seats: 250, capacity: 700, guarantee: 250, interval: 60, ceiling: "8m" }),
  hall("리베라컨벤션", "루벤스홀", { light: "어두움", seats: 240, capacity: 700, guarantee: 200, interval: 60 }),
  hall("리베라컨벤션", "아르덴하우스", { light: "밝음", daylight: "Y", house: "Y", seats: 160, capacity: 700, guarantee: 180, interval: 60 }),
  hall("그랜드 머큐어 앰배서더 창원", "그랜드볼룸", { light: "어두움", ceremony: "선택", seats: 400, capacity: 600, ceiling: "8m", tags: "2층|900㎡|호텔 웨딩", confidence: "A" }),
  hall("그랜드 머큐어 앰배서더 창원", "가든하우스", { light: "밝음", daylight: "Y", house: "Y", io: "야외", ceremony: "동시예식", seats: 160, tags: "5층|정원 웨딩", confidence: "A" }),
  hall("그랜드 머큐어 앰배서더 창원", "빌라드룸", { light: "밝음", house: "Y", ceremony: "동시예식", seats: 100, capacity: 250, tags: "2층|프라이빗|코스 다이닝", confidence: "A" }),

  hall("BMK컨벤션", "하모니볼룸", { light: "어두움", seats: 160, capacity: 800, guarantee: 350, interval: 60 }),
  hall("BMK컨벤션", "아스틴홀", { light: "어두움", seats: 160, capacity: 800, guarantee: 300, interval: 60 }),
  hall("BMK컨벤션", "앰버홀", { light: "밝음", house: "Y", seats: 100, capacity: 120, guarantee: 70, interval: 60 }),
  hall("호텔ICC", "그랜드볼룸", { light: "어두움", seats: 400, capacity: 600, guarantee: 300, interval: 60, aisle: "30m", ceiling: "10m" }),
  hall("호텔ICC", "크리스탈볼룸", { light: "어두움", seats: 400, capacity: 600, guarantee: 300, interval: 60, aisle: "30m", ceiling: "10m" }),
  hall("루이비스컨벤션 대전점", "아모리스홀", { light: "어두움", seats: 200, capacity: 500, guarantee: 300, interval: 80 }),
  hall("루이비스컨벤션 대전점", "그레이스홀", { light: "어두움", seats: 200, capacity: 500, guarantee: 300, interval: 70 }),
  hall("라포르테", "라포르테홀", { light: "밝음", daylight: "Y", house: "Y", seats: 200, capacity: 400, guarantee: 300, interval: 70 }),
  hall("빌라드알티오라", "빌라드알티오라홀", { light: "밝음", daylight: "부분", house: "Y", seats: 150, capacity: 1000, guarantee: 150, interval: 60 }),
  hall("메종드보네르", "보네르홀", { light: "밝음", daylight: "부분", house: "Y", seats: 170, capacity: 550, guarantee: 200, interval: 80 }),
  hall("S가든웨딩홀", "S가든홀", { light: "밝음", daylight: "Y", house: "Y", io: "both", seats: 200, capacity: 600, guarantee: 250, interval: 60, tags: "개폐형 돔|가든 웨딩" }),
  hall("호텔선샤인앤파라다이스", "그랜드볼룸", { light: "어두움", seats: 180, capacity: 400, guarantee: 200, interval: 60 }),
  hall("호텔선샤인앤파라다이스", "파라다이스", { light: "어두움", seats: 120, capacity: 1170, guarantee: 200 }),
  hall("호텔선샤인앤파라다이스", "씨엘드포레", { light: "밝음", daylight: "Y", house: "Y", seats: 100, capacity: 1000, guarantee: 100 }),
  hall("마리드엘", "마리드홀", { light: "어두움", seats: 150, capacity: 450, guarantee: 200, interval: 60 }),
  hall("코트야드 바이 메리어트 세종", "그랜드볼룸", { light: "어두움", ceremony: "동시예식", seats: 200, capacity: 250, ceiling: "4.6m", tags: "호텔 웨딩|365.7㎡", confidence: "A" }),

  hall("AW호텔", "오스카홀", { light: "어두움", chapel: "Y", seats: 180, capacity: 750, guarantee: 250, interval: 60 }),
  hall("AW호텔", "앨리스홀", { light: "밝음", seats: 140, capacity: 750, guarantee: 200, interval: 60 }),
  hall("AW호텔", "베아트리체홀", { light: "밝음", seats: 110, capacity: 750, guarantee: 150, interval: 60 }),
  hall("M스타하우스", "모닝스타", { light: "밝음", seats: 220, capacity: 750, guarantee: 250, interval: 70 }),
  hall("M스타하우스", "화이트스타", { light: "밝음", seats: 120, capacity: 750, guarantee: 200, interval: 70 }),
  hall("M스타하우스", "블루스타", { light: "어두움", seats: 200, capacity: 750, guarantee: 250, interval: 70 }),
  hall("노비아갈라 전자관점", "보타닉가든", { light: "밝음", daylight: "부분", house: "Y", seats: 150, capacity: 500, guarantee: 200, interval: 60 }),
  hall("노비아갈라 전자관점", "벨라지오", { light: "어두움", seats: 150, capacity: 500, guarantee: 200, interval: 60 }),
  hall("노비아갈라 동촌점", "노비아그랜드", { light: "어두움", seats: 300, capacity: 1500, guarantee: 300, interval: 60 }),
  hall("노비아갈라 동촌점", "갈라판타지아", { light: "어두움", seats: 250, capacity: 1500, guarantee: 250, interval: 60 }),
  hall("노비아갈라 동촌점", "발렌티", { light: "밝음", seats: 250, capacity: 1500, guarantee: 250, interval: 60 }),
  hall("라온제나", "끌레르홀", { light: "밝음", seats: 130, capacity: 600, guarantee: 200, interval: 70 }),
  hall("라온제나", "컨벤션홀", { light: "어두움", seats: 200, capacity: 600, guarantee: 250, interval: 70 }),
  hall("웨딩칼라디움", "비올라", { light: "밝음", seats: 140, capacity: 550, guarantee: 200, interval: 60, ceiling: "12m" }),
  hall("웨딩칼라디움", "콘서트", { light: "어두움", seats: 220, capacity: 550, guarantee: 200, interval: 60, ceiling: "12m" }),
  hall("웨딩칼라디움", "시크릿가든", { light: "밝음", daylight: "부분", house: "Y", seats: 140, capacity: 550, guarantee: 200, interval: 60 }),
  hall("웨딩비엔나", "비엔나", { light: "어두움", seats: 110, capacity: 1700, guarantee: 200, interval: 60 }),
  hall("웨딩비엔나", "하우스", { light: "밝음", house: "Y", seats: 100, capacity: 1700, guarantee: 200, interval: 60 }),
  hall("웨딩비엔나", "컨벤션", { light: "어두움", seats: 160, capacity: 1700, guarantee: 250, interval: 60 }),
  hall("호텔수성", "피오니홀", { light: "밝음", daylight: "부분", seats: 200, capacity: 700, guarantee: 300, interval: 70 }),
  hall("호텔수성", "블레스홀", { light: "어두움", seats: 200, capacity: 700, guarantee: 300, interval: 70 }),
  hall("호텔 인터불고 엑스코", "그랑파티오", { light: "밝음", daylight: "Y", house: "Y", io: "야외", seats: 200, capacity: 500, guarantee: 200, interval: 90 }),
  hall("호텔 인터불고 엑스코", "헤라", { light: "어두움", seats: 200, capacity: 500, guarantee: 200, interval: 70 }),
  hall("호텔 인터불고 엑스코", "레아", { light: "밝음", seats: 200, capacity: 500, guarantee: 200, interval: 70 }),
  hall("파라다이스웨딩", "스텔라홀", { light: "밝음", seats: 200, capacity: 500, guarantee: 220, interval: 60 }),
  hall("파라다이스웨딩", "그랜드볼룸", { light: "어두움", seats: 200, capacity: 500, guarantee: 250, interval: 60 }),
];

export const inquiryCandidates = [
  { area: "부산", name: "그랜드블랑", status: "문의필요", note: "현행 판매 흔적은 확인했으나 공식 홀 목록과 판매 채널의 홀 구성이 완전히 일치하는지 재확인 필요" },
  { area: "경남", name: "호텔 아이스퀘어", status: "문의필요", note: "그랜드볼룸·콘서트홀·클래식홀 연회 구조는 확인했으나 2026년 일반 웨딩 판매 여부를 공식 채널에서 확정하지 못함" },
  { area: "경남", name: "MBC컨벤션진주", status: "문의필요", note: "2026 웨딩페어와 최근 예식은 확인했으나 홀 고유명·좌석 구조가 웹에서 불충분함" },
  { area: "경남", name: "스탠포드 호텔앤리조트 통영", status: "문의필요", note: "호텔·연회 운영은 확인했으나 현재 웨딩 상품과 독립 판매 홀 구조를 확정하지 못함" },
  { area: "세종", name: "베어트리파크", status: "문의필요", note: "목적지형 예식 후보지만 2026년 일반 웨딩 상품과 홀 구조 확인 필요" },
  { area: "대구", name: "퀸벨호텔", status: "문의필요", note: "현행 상담 흔적은 있으나 현재 판매 홀명과 리모델링 반영 상태를 공식 채널로 재확인 필요" },
];

function districtFromAddress(address) {
  const province = address.match(/^경상남도\s+([가-힣]+시)(?:\s+([가-힣]+구))?/);
  if (province) return [province[1], province[2]].filter(Boolean).join(" ");
  if (address.startsWith("세종특별자치시")) return "세종시";
  return address.match(/^(?:부산광역시|대전광역시|대구광역시)\s+([가-힣]+(?:구|군))/)?.[1] ?? "지역 확인 필요";
}

function categoryFor(hall) {
  if (hall.io === "야외") return "야외웨딩홀";
  if (hall.house === "Y") return "하우스웨딩홀";
  if (hall.chapel === "Y") return "채플 홀";
  if (hall.light === "밝음") return "밝은 홀";
  if (hall.light === "어두움") return "어두운 홀";
  return "호텔 홀";
}

export default {
  regionName: "부산·경남 → 대전·세종 → 대구",
  regionCode: "REG-X2",
  date: checkedAt,
  venueNote: "공식 웨딩 페이지와 2026년 현재 상담 가능한 판매 채널을 우선했습니다. 운영·홀 구조가 불명확한 후보는 문의 큐에만 남겼습니다.",
  dashboardNote: "부산·경남, 대전·세종, 대구 순으로 조사했습니다. 사이트에는 운영과 독립 판매 홀 구조가 확인된 장소만 반영하고, 김해·진주·통영 등 경남의 추가 후보와 세종 목적지형 후보는 업체 문의 후 공개합니다.",
  officialInfoNames: venues.filter((venue) => venue.grade === "A").map((venue) => venue.name),
  easySplitVenueNames: venues.map((venue) => venue.name),
  venues: [
    ...venues.map((venue) => ({
      ...venue,
      district: districtFromAddress(venue.address),
      status: "운영확인",
      review: "완료",
      sourceGrade: venue.grade,
    })),
    ...inquiryCandidates.map((candidate) => ({
      name: candidate.name,
      type: "미확인",
      status: "운영추정",
      review: "문의필요",
      address: `${candidate.area} 상세주소 확인 필요`,
      district: candidate.area,
      sourceGrade: "C",
      sourceType: "검색 후보",
      evidence: candidate.note,
    })),
  ],
  halls: [
    ...halls.map((item) => ({
      ...item,
      category: categoryFor(item),
      io: item.io === "both" ? "실내·야외 병행" : item.io,
      ceremony: item.ceremony === "선택" ? "동시·분리 선택" : item.ceremony,
      reason: item.reason ?? `${item.name}이 독립 판매 홀로 확인되며 현행 상담 채널에서 홀별 정보를 제공함.`,
      confidence: item.confidence ?? "B-strong",
      publish: true,
    })),
    ...inquiryCandidates.map((candidate) => ({
      venue: candidate.name,
      name: "홀 구조 미확인",
      category: "검토필요",
      reason: candidate.note,
      confidence: "C",
      publish: false,
    })),
  ],
};
