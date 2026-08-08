import { writeFile } from "node:fs/promises";
import path from "node:path";
import hallsJson from "../src/data/halls.generated.json";
import existingAuditJson from "../src/data/hall-photo-audit.generated.json";
import existingReplacementsJson from "../src/data/hall-photo-replacements.generated.json";
import existingVerificationsJson from "../src/data/hall-photo-verification.generated.json";
import { hallPhotosByHallId } from "../src/data/hall-photos";
import { isRejectedHallPhotoAsset } from "../src/domain/hall-photo-audit";
import type {
  HallPhoto,
  HallPhotoVerificationMethod,
} from "../src/domain/types";

const ROOT = process.cwd();
const CHECKED_AT = new Date().toISOString().slice(0, 10);
const TARGET_HALL_PREFIX = process.env.PHOTO_AUDIT_HALL_PREFIX ?? "H-SEO-";
const EXPLICIT_TARGET_HALL_IDS = new Set(
  (process.env.PHOTO_AUDIT_HALL_IDS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean),
);
const FORCED_RECHECK_HALL_IDS = new Set([
  "H-SEO-20260728-026",
  "H-SEO-20260728-067",
  "H-SEO-20260728-075",
  "H-SEO-20260729-189",
]);
const MANUAL_PHOTO_SUPPRESSIONS: Readonly<Record<string, string>> = {
  "H-SEO-20260728-026":
    "공식 운영 페이지와 공식 협력업체 페이지에서 SETEC 컨벤션홀의 실제 예식 세팅 사진을 확인하지 못해 일반 강당 사진을 공개하지 않음.",
};
const VENUE_SOURCE_URL_OVERRIDES: Readonly<Record<string, readonly string[]>> = {
  "V-SEO-20260728-045": [
    "https://www.hyatt.com/andaz/en-US/selaz-andaz-seoul-gangnam/weddings",
  ],
  "V-SEO-20260729-001": ["https://kdwedding.co.kr/hall/"],
  "V-SEO-20260729-013": ["https://mayfield.co.kr/wedding/wedding_list.html"],
  "V-SEO-20260729-025": ["https://app.walkerhill.com/convention/Wedding"],
  "V-SEO-20260729-099": [
    "https://samcheonggak.or.kr/wedding/",
    "https://samcheonggak.or.kr/tour/cheongcheondang/",
    "https://samcheonggak.or.kr/tour/yuhajeong/",
  ],
  "V-SEO-20260729-035": ["https://www.thelinkseoul.com/index.php"],
  "V-SEO-20260729-039": ["https://sindorim.thebennevis.co.kr/"],
  "V-SEO-20260729-067": [
    "https://www.swissgrand.co.kr/ko/wedding-banquet/",
  ],
  "V-SEO-20260729-074": ["https://thewhiteveil.co.kr/"],
  "V-SEO-20260729-105": ["https://songpa.theconvention.co.kr/"],
  "V-SEO-20260729-163": ["https://www.hwcc.co.kr/"],
};
const HALL_SOURCE_URL_OVERRIDES: Readonly<Record<string, readonly string[]>> = {
  "H-GG-GP-20260808-003": ["https://www.kwanseivista.com/"],
  "H-GG-GP-20260808-008": [
    "https://www.lavieenlumi.co.kr/HouseWedding",
  ],
  "H-GG-GP-20260808-012": [
    "https://wedding.firstgarden.co.kr/36",
  ],
  "H-GG-PA-20260808-016": ["https://jhouse.co.kr/"],
  "H-GG-REST-20260808-050": [
    "https://anyangvilladegd.com/GalleriaHall",
  ],
  "H-GG-REST-20260808-051": [
    "https://anyangvilladegd.com/CrystalCastleHall",
  ],
  "H-GG-REST-20260808-059": [
    "https://gdconvention.com/grandballroomHall",
  ],
  "H-GG-REST-20260808-060": [
    "https://gdconvention.com/GrandConventionHall",
  ],
  "H-GG-REST-20260808-061": [
    "https://gdconvention.com/gracekellyhall",
  ],
  "H-GG-SUW-20260808-002": [
    "https://www.wiconvention.co.kr/Whall",
  ],
  "H-GG-SUW-20260808-003": [
    "https://www.wiconvention.co.kr/Ihall",
  ],
  "H-GG-SUW-20260808-010": [
    "https://www.ramadaplazasuwon.com/view/viewLink.do?page=homepage%2FKOR%2Fwedding%2Fgrand",
  ],
  "H-GG-SUW-20260808-011": [
    "https://www.ramadaplazasuwon.com/view/viewLink.do?page=homepage%2FKOR%2Fwedding%2Fprivate",
  ],
  "H-GG-YON-20260808-004": ["https://www.lavidahouse.com/42"],
  "H-SEO-20260729-152": [
    "https://www.thelinkseoul.com/bbs/page.php?hid=m02_02",
  ],
  "H-SEO-20260729-307": [
    "https://www.thelinkseoul.com/bbs/page.php?hid=m02_03",
  ],
  "H-SEO-20260729-308": [
    "https://www.thelinkseoul.com/bbs/page.php?hid=m02_04",
  ],
  "H-SEO-20260729-309": [
    "https://www.thelinkseoul.com/bbs/page.php?hid=m02_05",
  ],
  "H-SEO-20260729-310": [
    "https://www.thelinkseoul.com/bbs/page.php?hid=m02_06",
  ],
  "H-SEO-20260729-127": ["https://mayfield.co.kr/wedding/grand.html"],
  "H-SEO-20260729-303": ["https://mayfield.co.kr/wedding/belltower.html"],
  "H-SEO-20260729-304": ["https://mayfield.co.kr/wedding/atrium.html"],
  "H-SEO-20260729-295": ["https://www.hwcc.co.kr/wedding/grand/"],
  "H-SEO-20260729-337": ["https://www.hwcc.co.kr/wedding/emerald/"],
  "H-SEO-20260729-338": ["https://www.hwcc.co.kr/wedding/crystal/"],
};
interface ManualPhotoOverride {
  url: string;
  sourceUrl: string;
  note: string;
  sourceType?: HallPhoto["sourceType"];
  usageStatus?: HallPhoto["usageStatus"];
  photoKind?: HallPhoto["photoKind"];
  verificationMethod?: HallPhotoVerificationMethod;
}

const MANUAL_PHOTO_OVERRIDES: Readonly<Record<string, ManualPhotoOverride>> = {
  "H-SEO-20260728-004": {
    url: "https://www.hotelnaruseoul.com/wp-content/uploads/sites/18/2024/12/%EC%9B%A8%EB%94%A9_%EB%A7%88%EC%9D%B4%ED%81%AC%EB%A1%9C%EC%82%AC%EC%9D%B4%ED%8A%B8_%EB%8C%80%EC%A7%80-1-%EC%82%AC%EB%B3%B8.jpg",
    sourceUrl: "https://www.hotelnaruseoul.com/meetings-events/wedding-family-party/",
    note: "호텔 나루 공식 웨딩 페이지에서 나루 볼룸의 버진로드·단상·하객석이 함께 보이는 예식 세팅 사진을 확인함.",
    verificationMethod: "official_hall_page",
  },
  "H-SEO-20260728-040": {
    url: "https://cache.marriott.com/is/image/marriotts7prod/fp-selfg-selfg-wedding-1-27447:Wide-Hor?wid=1336&fit=constrain",
    sourceUrl: "https://www.marriott.com/ko/hotels/selfg-four-points-seoul-gangnam/photos/",
    note: "메리어트 공식 갤러리에서 미팅룸 1 웨딩으로 명명된 버진로드·단상·하객석 예식 세팅 사진을 확인함.",
    verificationMethod: "official_named_gallery",
  },
  "H-SEO-20260729-136": {
    url: "https://www.snufacultyclub.com/uploads/rolling/1777018960_93fc7ad51bd8c5acba91.jpg",
    sourceUrl: "https://www.snufacultyclub.com/",
    note: "서울대학교 교수회관 공식 홈페이지의 웨딩 섹션에서 컨벤션홀 버진로드와 단상이 보이는 예식 세팅 사진을 확인함.",
    verificationMethod: "official_named_gallery",
  },
  "H-GG-GP-20260808-004": {
    url: "https://u.kyusoodang.co.kr/attachList/upload/hall/c20240310120548190/p20240310142542450/img20260629161739447.jpg",
    sourceUrl: "https://u.kyusoodang.co.kr/",
    note: "규수당 운정점 공식 홈페이지의 베일리홀 갤러리에서 버진로드·단상·하객석이 함께 보이는 예식 세팅 사진을 확인함.",
    verificationMethod: "official_named_gallery",
  },
  "H-GG-REST-20260808-044": {
    url: "https://www.pharosconvention.co.kr/attachList/upload/hall/c20240506173438310/p20240506173533937/img20240924194340310.jpg",
    sourceUrl: "https://www.pharosconvention.co.kr/",
    note: "파로스컨벤션 공식 홀 갤러리에서 버진로드·단상·하객석이 함께 보이는 예식 세팅 사진을 확인함.",
    verificationMethod: "official_named_gallery",
  },
  "H-GG-GP-20260808-003": {
    url: "https://lh3.googleusercontent.com/-8f3h0Jk3ak-hBVFHZhD76FlIi_Sq6mbeGTsyec9towjEDYGx4NVEeu_WrR1NrG8Di4R9hZW7VNMDTXoayA0OuaO15-fkReg584LA_cEHUZ7683ZzGGb=s0",
    sourceUrl: "https://www.kwanseivista.com/",
    note: "관세비스타 공식 페이지의 잔디정원 섹션에 배치된 공간 사진으로 확인함.",
  },
  "H-GG-HO-20260808-001": {
    url: "https://www.laviedor.com/wedding/images/photo01_s.jpg",
    sourceUrl: "https://www.laviedor.com/wedding/sub03.htm",
    note: "라비돌 공식 웨딩 페이지의 야외가든 섹션 사진으로 확인함.",
  },
  "H-GG-HO-20260808-002": {
    url: "https://www.laviedor.com/wedding/images/wedding_img02_sm.jpg",
    sourceUrl: "https://www.laviedor.com/wedding/sub03.htm",
    note: "라비돌 공식 웨딩 페이지의 로비홀 섹션 사진으로 확인함.",
  },
  "H-GG-HO-20260808-003": {
    url: "https://www.laviedor.com/wedding/images/wedding_img03_sm.jpg",
    sourceUrl: "https://www.laviedor.com/wedding/sub03.htm",
    note: "라비돌 공식 웨딩 페이지의 그랜드볼룸 섹션 사진으로 확인함.",
  },
  "H-GG-PA-20260808-016": {
    url: "https://jhouse.co.kr/images/main/mv2.jpg",
    sourceUrl: "https://jhouse.co.kr/",
    note: "제이하우스 공식 홈페이지의 단독 J House Hall 전경 사진으로 확인함.",
  },
  "H-GG-SHG-20260808-001": {
    url: "https://w-square.kr/images/chapel-hall.webp",
    sourceUrl: "https://w-square.kr/facilities#chapel-hall",
    note: "W스퀘어 공식 시설 페이지의 채플홀 대표 사진으로 확인함.",
  },
  "H-GG-SHG-20260808-002": {
    url: "https://w-square.kr/images/grace-hall.webp",
    sourceUrl: "https://w-square.kr/facilities#grace-hall",
    note: "W스퀘어 공식 시설 페이지의 그레이스홀 대표 사진으로 확인함.",
  },
  "H-GG-REST-20260808-050": {
    url: "https://cdn.imweb.me/thumbnail/20250407/928a437170963.jpg",
    sourceUrl: "https://anyangvilladegd.com/GalleriaHall",
    note: "빌라드지디 안양 공식 갤러리아홀 페이지의 홀 사진으로 확인함.",
  },
  "H-GG-REST-20260808-051": {
    url: "https://cdn.imweb.me/thumbnail/20250307/af2405f52be5a.jpg",
    sourceUrl: "https://anyangvilladegd.com/CrystalCastleHall",
    note: "빌라드지디 안양 공식 크리스탈캐슬홀 페이지의 홀 사진으로 확인함.",
  },
  "H-GG-REST-20260808-059": {
    url: "https://cdn.imweb.me/thumbnail/20250904/3961b8c436ffb.jpg",
    sourceUrl: "https://gdconvention.com/grandballroomHall",
    note: "빌라드지디 안산 공식 그랜드볼룸홀 페이지의 홀 사진으로 확인함.",
  },
  "H-GG-REST-20260808-060": {
    url: "https://cdn.imweb.me/thumbnail/20250904/bcce99d47ac66.jpg",
    sourceUrl: "https://gdconvention.com/GrandConventionHall",
    note: "빌라드지디 안산 공식 그랜드컨벤션홀 페이지의 홀 사진으로 확인함.",
  },
  "H-GG-REST-20260808-061": {
    url: "https://cdn.imweb.me/thumbnail/20250904/092375feea8b0.jpg",
    sourceUrl: "https://gdconvention.com/gracekellyhall",
    note: "빌라드지디 안산 공식 그레이스켈리홀 페이지의 홀 사진으로 확인함.",
  },
  "H-GG-SUW-20260808-002": {
    url: "https://cdn.imweb.me/thumbnail/20230808/1c0703ac91a6b.jpg",
    sourceUrl: "https://www.wiconvention.co.kr/Whall",
    note: "WI컨벤션 공식 W홀 페이지의 홀 사진으로 확인함.",
  },
  "H-GG-SUW-20260808-003": {
    url: "https://cdn.imweb.me/thumbnail/20230808/2f8d6d82f9846.jpg",
    sourceUrl: "https://www.wiconvention.co.kr/Ihall",
    note: "WI컨벤션 공식 I홀 페이지의 홀 사진으로 확인함.",
  },
  "H-GG-SUW-20260808-010": {
    url: "https://www.ramadaplazasuwon.com/RamadaPlazaSuwon_common/images/homepage/wedding/grand_21.jpg",
    sourceUrl:
      "https://www.ramadaplazasuwon.com/view/viewLink.do?page=homepage%2FKOR%2Fwedding%2Fgrand",
    note: "라마다프라자수원 공식 웨딩 그랜드볼룸 페이지의 홀 사진으로 확인함.",
  },
  "H-GG-SUW-20260808-011": {
    url: "https://www.ramadaplazasuwon.com/RamadaPlazaSuwon_common/images/homepage/wedding/private_06.jpg",
    sourceUrl:
      "https://www.ramadaplazasuwon.com/view/viewLink.do?page=homepage%2FKOR%2Fwedding%2Fprivate",
    note: "라마다프라자수원 공식 프라이빗 웨딩 페이지에서 토파즈홀 사진으로 확인함.",
  },
  "H-GG-YON-20260808-004": {
    url: "https://cdn.imweb.me/thumbnail/20240531/32bc29d28b439.png",
    sourceUrl: "https://www.lavidahouse.com/42",
    note: "하우스오브라비다 공식 네이처홀 페이지의 홀 전경 사진으로 확인함.",
  },
  "H-GG-YON-20260808-005": {
    url: "https://cdn.imweb.me/thumbnail/20241223/cbf280a9549b4.jpg",
    sourceUrl: "https://www.riumhouse.com/35",
    note: "리움하우스 공식 페이지의 SPRING HALL 섹션 사진으로 확인함.",
  },
  "H-GG-YON-20260808-006": {
    url: "https://cdn.imweb.me/thumbnail/20241215/43caa890001b4.jpg",
    sourceUrl: "https://www.riumhouse.com/35",
    note: "리움하우스 공식 페이지의 SOUNDS HALL 섹션 사진으로 확인함.",
  },
  "H-SEO-20260728-081": {
    url: "https://cache.marriott.com/is/image/marriotts7prod/cy-selsn-hanyang-room-wedding-11919:Wide-Hor?wid=1336&fit=constrain",
    sourceUrl:
      "https://www.marriott.com/ko/hotels/selsn-courtyard-seoul-myeongdong/photos/",
    note: "메리어트 공식 갤러리에서 한양룸 웨딩 세팅 사진과 홀명을 확인함.",
  },
  "H-SEO-20260729-308": {
    url: "https://www.thelinkseoul.com/data/apms/background/plaza%20hall.jpg",
    sourceUrl: "https://www.thelinkseoul.com/bbs/page.php?hid=m02_04",
    note: "더링크호텔 공식 플라자홀 상세 페이지의 대표 사진으로 확인함.",
  },
  "H-SEO-20260729-309": {
    url: "https://www.thelinkseoul.com/data/apms/background/garden%20hall_1018.jpg",
    sourceUrl: "https://www.thelinkseoul.com/bbs/page.php?hid=m02_05",
    note: "더링크호텔 공식 가든홀 상세 페이지의 대표 사진으로 확인함.",
  },
  "H-SEO-20260729-140": {
    url: "https://app.walkerhill.com/assets/grandwalkerhillseoul/global/images/etc/pic_grandW02.jpg",
    sourceUrl: "https://app.walkerhill.com/convention/Wedding",
    note: "공식 웨딩 페이지의 그랜드홀 사진 대체 텍스트와 섹션에서 홀명을 확인함.",
  },
  "H-SEO-20260729-320": {
    url: "https://samcheonggak.or.kr/attachList/upload/hall/c20220424170637373/p20220425073750723/img20220425075201783.jpg",
    sourceUrl: "https://samcheonggak.or.kr/tour/cheongcheondang/",
    note: "삼청각 공식 청천당 상세 페이지의 대표 공간 사진으로 확인함.",
  },
  "H-SEO-20260729-321": {
    url: "https://samcheonggak.or.kr/attachList/upload/hall/c20220424170637373/p20220425105500080/img20220425110127677.jpg",
    sourceUrl: "https://samcheonggak.or.kr/tour/yuhajeong/",
    note: "삼청각 공식 유하정 상세 페이지의 대표 공간 사진으로 확인함.",
  },
  "H-SEO-20260808-001": {
    url: "https://www.bellaluceseoul.co.kr/attachList/upload/hall/c20240314181727390/p20240619164104287/pop20240619164317657.jpg",
    sourceUrl: "https://www.bellaluceseoul.co.kr/view/floce",
    note: "벨라루체 서울점 공식 홀 안내에서 3층 루체홀 명칭과 해당 공간 사진을 함께 확인함.",
    verificationMethod: "official_hall_page",
  },
  "H-SEO-20260808-002": {
    url: "https://www.bellaluceseoul.co.kr/attachList/upload/hall/c20240314181727390/p20240314181807943/pop20240721140201807.jpg",
    sourceUrl: "https://www.bellaluceseoul.co.kr/view/floce",
    note: "벨라루체 서울점 공식 홀 안내에서 7층 플로체홀 명칭과 해당 공간 사진을 함께 확인함.",
    verificationMethod: "official_hall_page",
  },
  "H-SEO-20260808-003": {
    url: "https://cdn.imweb.me/upload/S20240204aca494e0b4938/f2ed60678d8e3.png",
    sourceUrl: "https://yozmwedding.co.kr/venue/?bmode=view&idx=18336064",
    note: "공개 웨딩 정보 페이지의 SAINT Hall 세인트홀 섹션에서 내부 전경 메인 이미지로 명시된 사진을 확인함.",
    sourceType: "public_listing",
    usageStatus: "public_source_linked",
    verificationMethod: "public_named_listing",
  },
  "H-SEO-20260808-004": {
    url: "https://cdn.imweb.me/upload/S20240204aca494e0b4938/d67970895d811.jpg",
    sourceUrl: "https://yozmwedding.co.kr/venue/?bmode=view&idx=18410968",
    note: "공개 웨딩 정보 페이지의 PARK - Wedding Hall 갤러리에서 파크홀 공간 사진으로 구분된 첫 이미지를 확인함.",
    sourceType: "public_listing",
    usageStatus: "public_source_linked",
    verificationMethod: "public_named_listing",
  },
  "H-SEO-20260808-005": {
    url: "https://cache.marriott.com/is/image/marriotts7prod/ar-selag-outdoor-wedding-30222:Wide-Hor?wid=1336&fit=constrain",
    sourceUrl: "https://www.marriott.com/ko/hotels/selag-ac-hotel-seoul-gangnam/photos/",
    note: "메리어트 공식 사진 갤러리에서 클라우드(Kloud) - 야외 결혼식으로 명명된 사진을 확인함.",
    verificationMethod: "official_named_gallery",
  },
  "H-SEO-20260808-006": {
    url: "https://shinsegae-prd-data.s3.ap-northeast-2.amazonaws.com/wp-content/uploads/2025/08/westin-chosun-seoul-wedding-concept_2.png",
    sourceUrl: "https://www.shinsegaegroupnewsroom.com/westin-chosun-seoul-wedding-concept/",
    note: "신세계그룹 공식 뉴스룸의 웨스틴 조선 서울 라일락홀 전용 웨딩 콘셉트 기사에서 홀 사진을 확인함.",
    verificationMethod: "official_hall_page",
  },
  "H-SEO-20260808-007": {
    url: "https://www.homehmc.com/upfiles/article/20240815025327_456399000.png",
    sourceUrl: "https://www.homehmc.com/ko/oakwood-seoul-coex/banquets-and-events/weddings/",
    note: "오크우드 공식 웨딩 페이지에서 프리미어 룸 명칭과 해당 공간 사진을 함께 확인함.",
    verificationMethod: "official_named_gallery",
  },
  "H-SEO-20260808-008": {
    url: "https://www.homehmc.com/upfiles/article/20240815022505_677527400.jpg",
    sourceUrl: "https://www.homehmc.com/ko/oakwood-seoul-coex/banquets-and-events/weddings/",
    note: "오크우드 공식 웨딩 페이지에서 오크 룸 명칭과 해당 공간 사진을 함께 확인함.",
    verificationMethod: "official_named_gallery",
  },
};
const HALL_NAME_ALIASES: Readonly<Record<string, readonly string[]>> = {
  "H-SEO-20260728-057": ["Beyond the Glass"],
  "H-SEO-20260728-081": ["Hanyang Room"],
  "H-SEO-20260729-107": ["Andaz Studio III"],
  "H-SEO-20260729-108": ["Andaz Studio I"],
  "H-SEO-20260729-109": ["Gangnam Penthouse"],
  "H-SEO-20260729-110": ["Sky Terrace Suite"],
  "H-SEO-20260729-115": ["MIDAS HALL"],
  "H-SEO-20260729-300": ["BLACKSTONE HALL"],
  "H-SEO-20260729-258": ["Junior Ballroom"],
};
const PUBLIC_HOSTS = [
  "yozmwedding.co.kr",
  "thewedd.com",
  "weddingcrowd.kr",
  "directwedding.co.kr",
  "weddingfriendz.com",
  "myweddingfriendz.com",
  "iwedding.co.kr",
  "weddingbook.com",
  "weddex.co.kr",
  "weddingnote.co.kr",
  "jobkorea.co.kr",
  "choicehalls.com",
  "simplyspecial.kr",
  "leehye.co.kr",
  "s-wed.co.kr",
];
const DISCOVERY_EXCLUDED_HOSTS = [
  ...PUBLIC_HOSTS,
  "google.com",
  "naver.com",
  "blog.naver.com",
  "tistory.com",
  "youtube.com",
  "facebook.com",
  "threads.net",
  "x.com",
  "brunch.co.kr",
];
const IMAGE_KEYWORDS = [
  "웨딩홀",
  "예식홀",
  "메인 전경",
  "내부 전경",
  "홀 전경",
  "버진로드",
  "단상",
  "무대 전경",
  "wedding hall",
  "ballroom",
  "chapel",
  "garden",
];
const EXCLUDED_IMAGE_KEYWORDS = [
  "예약 상담",
  "신부대기실",
  "브라이덜룸",
  "폐백실",
  "연회장",
  "뷔페",
  "음식",
  "로비",
  "외관",
  "주차",
  "지도",
  "logo",
  "로고",
  "icon",
];

type Hall = (typeof hallsJson)[number];
const isInTargetScope = (hallId: string) =>
  EXPLICIT_TARGET_HALL_IDS.size > 0
    ? EXPLICIT_TARGET_HALL_IDS.has(hallId)
    : hallId.startsWith(TARGET_HALL_PREFIX);
const existingAuditHallIds = new Set(
  (existingAuditJson as AuditResult[]).map((entry) => entry.hallId),
);
const queuedHallIds = new Set([
  ...(existingAuditJson as AuditResult[])
    .filter(
      (entry) =>
        isInTargetScope(entry.hallId) &&
        (EXPLICIT_TARGET_HALL_IDS.size > 0 ||
          entry.result === "needs_review" ||
          FORCED_RECHECK_HALL_IDS.has(entry.hallId) ||
          process.env.PHOTO_AUDIT_RECHECK_ALL === "1" ||
          (process.env.PHOTO_AUDIT_RECHECK_CONFIRMED === "1" &&
            [
              "공개 웨딩 정보 페이지에서 사진 인접 문구와 개별 홀명을 함께 확인함.",
              "공식 사이트의 홀별 상세 페이지에서 홀명과 공간 사진을 함께 확인함.",
              "공식 사이트에서 홀명과 공간 사진의 직접 연결을 확인함.",
            ].includes(entry.reason))),
    )
    .map((entry) => entry.hallId),
  ...hallsJson
    .filter(
      (hall) =>
        isInTargetScope(hall.id) &&
        !existingAuditHallIds.has(hall.id),
    )
    .map((hall) => hall.id),
]);
const targetHalls = hallsJson.filter((hall) => queuedHallIds.has(hall.id));

interface ImageCandidate {
  url: string;
  alt: string;
  context: string;
}

interface PageCandidate {
  url: string;
  hallSpecific: boolean;
}

interface ReplacementSeed {
  hallId: string;
  url: string;
  sourceUrl: string;
  sourceType: HallPhoto["sourceType"];
  usageStatus: HallPhoto["usageStatus"];
  photoKind: HallPhoto["photoKind"];
  checkedAt: string;
}

interface VerificationEntry {
  identityStatus: "hall_confirmed";
  verificationMethod: HallPhotoVerificationMethod;
  verificationNote: string;
}

interface AuditResult {
  hallId: string;
  venueId: string;
  venueName: string;
  hallName: string;
  result: "confirmed" | "needs_review";
  sourceUrl: string | null;
  photoUrl: string | null;
  reason: string;
}

const venueCounts = new Map<string, number>();
for (const hall of hallsJson) {
  venueCounts.set(hall.venueId, (venueCounts.get(hall.venueId) ?? 0) + 1);
}

function normalize(value: string): string {
  return value
    .toLocaleLowerCase("ko")
    .replace(/&(?:nbsp|amp|quot|#39);/g, "")
    .replace(/[^0-9a-z가-힣]/g, "")
    .replace(/웨딩홀|예식홀/g, "")
    .trim();
}

function decodeHtml(value: string): string {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&nbsp;", " ");
}

function stripHtml(value: string): string {
  return decodeHtml(
    value
      .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " "),
  ).trim();
}

function attr(tag: string, name: string): string | null {
  const match = tag.match(new RegExp(`${name}=["']([^"']+)["']`, "i"));
  return match ? decodeHtml(match[1]) : null;
}

function extractImages(html: string, pageUrl: string): ImageCandidate[] {
  const candidates: ImageCandidate[] = [];
  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = match[0];
    const rawUrl =
      attr(tag, "data-original") ??
      attr(tag, "data-breeze") ??
      attr(tag, "data-lazy-src") ??
      attr(tag, "data-src") ??
      attr(tag, "src");
    if (!rawUrl || rawUrl.startsWith("data:")) continue;

    let url: string;
    try {
      url = new URL(rawUrl, pageUrl).href;
    } catch {
      continue;
    }
    if (!/^https:\/\//.test(url) || !/\.(?:avif|jpe?g|png|webp)(?:\?|$)/i.test(url)) {
      continue;
    }

    const start = Math.max(0, (match.index ?? 0) - 1_500);
    candidates.push({
      url,
      alt: attr(tag, "alt") ?? "",
      context: stripHtml(html.slice(start, (match.index ?? 0) + tag.length)),
    });
  }
  const pageTitle = stripHtml(
    html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "",
  );
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    const tag = match[0];
    const property = attr(tag, "property") ?? attr(tag, "name") ?? "";
    if (!/^(?:og:image|twitter:image)$/i.test(property)) continue;
    const rawUrl = attr(tag, "content");
    if (!rawUrl) continue;
    try {
      const url = new URL(rawUrl, pageUrl).href;
      if (/^https:\/\//.test(url) && /\.(?:avif|jpe?g|png|webp)(?:\?|$)/i.test(url)) {
        candidates.push({ url, alt: pageTitle, context: pageTitle });
      }
    } catch {
      // Ignore malformed metadata URLs.
    }
  }

  for (const match of html.matchAll(/url\(\s*["']?([^"')]+\.(?:avif|jpe?g|png|webp)(?:\?[^"')]*)?)["']?\s*\)/gi)) {
    const rawUrl = decodeHtml(match[1]).replaceAll("\\/", "/");
    if (rawUrl.startsWith("data:")) continue;
    try {
      const url = new URL(rawUrl, pageUrl).href;
      if (!/^https:\/\//.test(url)) continue;
      const start = Math.max(0, (match.index ?? 0) - 1_000);
      const end = Math.min(html.length, (match.index ?? 0) + match[0].length + 500);
      candidates.push({
        url,
        alt: "",
        context: stripHtml(html.slice(start, end)),
      });
    } catch {
      // Ignore malformed CSS image URLs.
    }
  }

  for (const match of html.matchAll(/"contentUrl"\s*:\s*"(https:\/\/[^"\\]+)"/gi)) {
    const url = decodeHtml(match[1]).replaceAll("\\/", "/");
    const start = Math.max(0, (match.index ?? 0) - 500);
    const end = Math.min(html.length, (match.index ?? 0) + match[0].length + 800);
    candidates.push({
      url,
      alt: "",
      context: stripHtml(html.slice(start, end)),
    });
  }

  return [...new Map(candidates.map((candidate) => [candidate.url, candidate])).values()];
}

function hallAliases(hallId: string, hallName: string): string[] {
  const normalized = normalize(hallName);
  const withoutHall = normalized.endsWith("홀")
    ? normalized.slice(0, -1)
    : normalized;
  return [
    ...new Set(
      [
        normalized,
        withoutHall,
        ...(HALL_NAME_ALIASES[hallId] ?? []).map(normalize),
      ].filter((value) => value.length >= 2),
    ),
  ];
}

function mentionsHall(value: string, hall: Hall): boolean {
  const normalizedValue = normalize(value);
  return hallAliases(hall.id, hall.hallName).some((alias) =>
    normalizedValue.includes(alias),
  );
}

function safeDecodeUrl(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function scoreCandidate(
  candidate: ImageCandidate,
  hall: Hall,
  isMultiHall: boolean,
  hallSpecificPage: boolean,
): number {
  const decodedUrl = safeDecodeUrl(candidate.url);
  if (isRejectedHallPhotoAsset(candidate)) {
    return Number.NEGATIVE_INFINITY;
  }
  if (
    /\/(?:txt|logos?|icons?)\/|(?:^|\/)(?:txt_|slide[_-]?arr|arrow|btn[_-]|sprite)|_btn_|partner|quick|logo|default[_-]?profile|lobby|exterior|notice|ogimage|share[_-]?img|banner|guestroom|dining|restaurant|food|menu|buffet|cuisine/i.test(
      decodedUrl,
    ) ||
    /로고|아이콘|배너|공지|로비|외관|객실|레스토랑/.test(
      decodedUrl,
    )
  ) {
    return Number.NEGATIVE_INFINITY;
  }

  const combined = `${candidate.alt} ${candidate.context}`;
  if (/lobby|exterior|notice|banner|guest\s*room|dining|restaurant|로비|외관|공지|배너|객실|레스토랑/i.test(candidate.alt)) {
    return Number.NEGATIVE_INFINITY;
  }
  const exactAlt = mentionsHall(candidate.alt, hall);
  const exactContext = mentionsHall(candidate.context, hall);
  const exactUrl = mentionsHall(decodedUrl, hall);
  if (isMultiHall && !hallSpecificPage && !exactAlt && !exactContext && !exactUrl) {
    return Number.NEGATIVE_INFINITY;
  }

  let score = exactAlt ? 140 : exactUrl ? 120 : exactContext ? 80 : 0;
  if (hallSpecificPage) score += 70;
  if (normalize(candidate.alt).includes(normalize(hall.venueName))) score += 20;
  if (IMAGE_KEYWORDS.some((keyword) => combined.toLocaleLowerCase("ko").includes(keyword))) {
    score += 30;
  }
  if (
    EXCLUDED_IMAGE_KEYWORDS.some((keyword) =>
      candidate.alt.toLocaleLowerCase("ko").includes(keyword),
    )
  ) {
    score -= 120;
  }
  if (/thumbnail|thumb|logo|icon/i.test(candidate.url)) score -= 25;
  if (/(?:^|\/)t_(?:img|image)/i.test(candidate.url)) score -= 40;
  return score;
}

function candidateInternalLinks(html: string, pageUrl: string, hall: Hall): PageCandidate[] {
  const baseHost = new URL(pageUrl).hostname.replace(/^www\./, "");
  const candidates: Array<PageCandidate & { score: number }> = [];
  for (const match of html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const rawUrl = decodeHtml(match[1]);
    if (/^(?:#|javascript:|mailto:|tel:)/i.test(rawUrl)) continue;
    let url: URL;
    try {
      url = new URL(rawUrl, pageUrl);
    } catch {
      continue;
    }
    if (url.protocol !== "https:" && url.protocol !== "http:") continue;
    if (url.hostname.replace(/^www\./, "") !== baseHost) continue;
    if (/\.(?:pdf|zip|hwp|docx?|xlsx?)(?:\?|$)/i.test(url.pathname)) continue;
    url.hash = "";
    const label = stripHtml(match[2]);
    const combined = `${label} ${safeDecodeUrl(url.pathname)}`;
    const hallSpecific = mentionsHall(combined, hall);
    let score = hallSpecific ? 160 : 0;
    if (/wedding|hall|venue|banquet|ballroom|chapel|garden|event|space|room|gallery|photo|웨딩|예식|홀|연회|공간|갤러리/i.test(combined)) {
      score += 35;
    }
    if (/privacy|policy|terms|login|join|notice|news|reservation|booking/i.test(combined)) {
      score -= 80;
    }
    if (score >= 35) candidates.push({ url: url.href, hallSpecific, score });
  }

  return [
    ...new Map(
      candidates
        .sort((a, b) => b.score - a.score)
        .map(({ url, hallSpecific }) => [url, { url, hallSpecific }]),
    ).values(),
  ].slice(0, 6);
}

function isPublicHost(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    return PUBLIC_HOSTS.some((host) => hostname === host || hostname.endsWith(`.${host}`));
  } catch {
    return true;
  }
}

function isExcludedDiscoveryHost(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    return DISCOVERY_EXCLUDED_HOSTS.some(
      (host) => hostname === host || hostname.endsWith(`.${host}`),
    );
  } catch {
    return true;
  }
}

async function discoverOfficialSourceUrls(hall: Hall): Promise<string[]> {
  if (process.env.PHOTO_AUDIT_SEARCH_WEB !== "1") return [];
  const query = `"${hall.venueName}" "${hall.hallName}" 웨딩 공식`;
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  const page = await fetchPage(searchUrl);
  if (!page) return [];

  const venueName = normalize(hall.venueName);
  const results: Array<{ url: string; score: number }> = [];
  for (const match of page.html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    let rawUrl = decodeHtml(match[1]);
    if (rawUrl.startsWith("/url?q=")) {
      rawUrl = rawUrl.slice(7).split("&")[0];
      try {
        rawUrl = decodeURIComponent(rawUrl);
      } catch {
        continue;
      }
    }
    if (!/^https?:\/\//i.test(rawUrl) || isExcludedDiscoveryHost(rawUrl)) continue;
    const label = stripHtml(match[2]);
    const combined = `${label} ${safeDecodeUrl(rawUrl)}`;
    const normalizedCombined = normalize(combined);
    const venueMatch = venueName.length >= 4 && normalizedCombined.includes(venueName);
    const hallMatch = mentionsHall(combined, hall);
    if (!venueMatch && !hallMatch) continue;
    let score = venueMatch ? 100 : 0;
    if (hallMatch) score += 120;
    if (/wedding|hall|venue|banquet|ballroom|chapel|garden|웨딩|예식|홀|연회/i.test(combined)) {
      score += 30;
    }
    results.push({ url: rawUrl, score });
  }

  return [
    ...new Map(
      results
        .sort((a, b) => b.score - a.score)
        .map(({ url }) => [url, url]),
    ).values(),
  ].slice(0, 4);
}

async function discoverSeoulPublicWeddingUrl(hall: Hall): Promise<string[]> {
  const knownUrls = [hall.website, hall.sourceUrl, hallPhotosByHallId[hall.id]?.[0]?.sourceUrl];
  if (
    !knownUrls.some((url) =>
      url?.includes("wedding.seoulwomen.or.kr"),
    )
  ) {
    return [];
  }

  const venueName = normalize(hall.venueName);
  const hallName = normalize(hall.hallName);
  const indexUrls = [
    "https://wedding.seoulwomen.or.kr/facilities",
    ...Array.from(
      { length: 5 },
      (_, index) =>
        `https://wedding.seoulwomen.or.kr/facilities/page/${index + 2}`,
    ),
  ];
  const pages = await Promise.all(indexUrls.map((url) => cachedPage(url)));

  for (const page of pages) {
    if (!page) continue;
    for (const match of page.html.matchAll(
      /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
    )) {
      let url: URL;
      try {
        url = new URL(decodeHtml(match[1]), page.url);
      } catch {
        continue;
      }
      if (!/^\/facilities\/\d+\/?$/.test(url.pathname)) continue;
      const label = normalize(stripHtml(match[2]));
      const venueMatch =
        venueName.length >= 4 &&
        (label.includes(venueName) || venueName.includes(label));
      const hallMatch =
        hallName.length >= 4 &&
        (label.includes(hallName) || hallName.includes(label));
      if (venueMatch || hallMatch) return [url.href];
    }
  }

  return [];
}

async function candidateSourceUrls(
  hall: Hall,
  existingPhoto: HallPhoto | undefined,
): Promise<string[]> {
  const [discoveredUrls, publicWeddingUrls] = await Promise.all([
    discoverOfficialSourceUrls(hall),
    discoverSeoulPublicWeddingUrl(hall),
  ]);
  return [
    ...new Set([
      ...(HALL_SOURCE_URL_OVERRIDES[hall.id] ?? []),
      ...(VENUE_SOURCE_URL_OVERRIDES[hall.venueId] ?? []),
      ...publicWeddingUrls,
      hall.website,
      hall.sourceUrl,
      existingPhoto?.sourceUrl,
      ...discoveredUrls,
    ]),
  ]
    .filter((url): url is string => Boolean(url && /^https:\/\//.test(url)))
    .sort((a, b) => Number(isPublicHost(a)) - Number(isPublicHost(b)));
}

async function fetchPage(url: string): Promise<{ html: string; url: string } | null> {
  try {
    const response = await fetch(url, {
      headers: { "user-agent": "Mozilla/5.0 (compatible; ViewddingPhotoAudit/1.0)" },
      redirect: "follow",
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) return null;
    return { html: await response.text(), url: response.url };
  } catch {
    return null;
  }
}

const pageCache = new Map<string, Promise<{ html: string; url: string } | null>>();
function cachedPage(url: string) {
  const cached = pageCache.get(url);
  if (cached) return cached;
  const request = fetchPage(url);
  pageCache.set(url, request);
  return request;
}

async function auditHall(hall: Hall): Promise<{
  replacement: ReplacementSeed | null;
  verification: VerificationEntry | null;
  audit: AuditResult;
}> {
  const existingPhoto = hallPhotosByHallId[hall.id]?.[0];
  const isMultiHall = (venueCounts.get(hall.venueId) ?? 0) > 1;
  const manualOverride = MANUAL_PHOTO_OVERRIDES[hall.id];
  const manualSuppression = MANUAL_PHOTO_SUPPRESSIONS[hall.id];

  if (manualSuppression) {
    return {
      replacement: null,
      verification: null,
      audit: {
        hallId: hall.id,
        venueId: hall.venueId,
        venueName: hall.venueName,
        hallName: hall.hallName,
        result: "needs_review",
        sourceUrl: "https://wedding.seoulwomen.or.kr/facilities/372",
        photoUrl: null,
        reason: manualSuppression,
      },
    };
  }

  if (manualOverride && isRejectedHallPhotoAsset(manualOverride)) {
    return {
      replacement: null,
      verification: null,
      audit: {
        hallId: hall.id,
        venueId: hall.venueId,
        venueName: hall.venueName,
        hallName: hall.hallName,
        result: "needs_review",
        sourceUrl: manualOverride.sourceUrl,
        photoUrl: null,
        reason:
          "수동 지정 사진이 비예식 이미지 자동 차단 규칙에 해당해 공개하지 않음.",
      },
    };
  }

  if (/미확인/.test(hall.hallName)) {
    return {
      replacement: null,
      verification: null,
      audit: {
        hallId: hall.id,
        venueId: hall.venueId,
        venueName: hall.venueName,
        hallName: hall.hallName,
        result: "needs_review",
        sourceUrl: null,
        photoUrl: existingPhoto?.url ?? null,
        reason: "공식 홀명이 확정되지 않아 사진을 개별 홀에 연결하지 않음.",
      },
    };
  }

  if (manualOverride) {
    return {
      replacement: {
        hallId: hall.id,
        url: manualOverride.url,
        sourceUrl: manualOverride.sourceUrl,
        sourceType: manualOverride.sourceType ?? "official_website",
        usageStatus: manualOverride.usageStatus ?? "official_source_linked",
        photoKind: manualOverride.photoKind ?? "wedding_setup",
        checkedAt: CHECKED_AT,
      },
      verification: {
        identityStatus: "hall_confirmed",
        verificationMethod:
          manualOverride.verificationMethod ?? "official_hall_page",
        verificationNote: manualOverride.note,
      },
      audit: {
        hallId: hall.id,
        venueId: hall.venueId,
        venueName: hall.venueName,
        hallName: hall.hallName,
        result: "confirmed",
        sourceUrl: manualOverride.sourceUrl,
        photoUrl: manualOverride.url,
        reason: manualOverride.note,
      },
    };
  }

  const scoredCandidates: Array<{
    candidate: ImageCandidate;
    pageUrl: string;
    publicSource: boolean;
    hallSpecificPage: boolean;
    score: number;
  }> = [];
  const visitedPages = new Set<string>();

  for (const sourceUrl of await candidateSourceUrls(hall, existingPhoto)) {
    const rootPage = await cachedPage(sourceUrl);
    if (!rootPage) continue;
    const publicRoot = isPublicHost(rootPage.url);
    const explicitHallSource = (HALL_SOURCE_URL_OVERRIDES[hall.id] ?? []).some(
      (url) => url === sourceUrl || url === rootPage.url,
    );
    const rootTitle = stripHtml(
      rootPage.html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "",
    );
    const rootHallSpecific =
      explicitHallSource ||
      mentionsHall(`${rootPage.url} ${rootTitle}`, hall) ||
      (!isMultiHall &&
        !publicRoot &&
        /wedding|웨딩|예식|marriage|ceremony/i.test(rootPage.url));
    const pages: Array<{ html: string; url: string; hallSpecific: boolean }> = [
      { ...rootPage, hallSpecific: rootHallSpecific },
    ];

    if (!publicRoot && !/\.pdf(?:\?|$)/i.test(rootPage.url)) {
      const linkedPages = await Promise.all(
        candidateInternalLinks(rootPage.html, rootPage.url, hall).map(
          async ({ url, hallSpecific }) => {
            const page = await cachedPage(url);
            return page ? { ...page, hallSpecific } : null;
          },
        ),
      );
      pages.push(
        ...linkedPages.filter(
          (page): page is { html: string; url: string; hallSpecific: boolean } =>
            page !== null,
        ),
      );
    }

    for (const page of pages) {
      if (visitedPages.has(page.url)) continue;
      visitedPages.add(page.url);
      const publicSource = isPublicHost(page.url);
      if (publicSource) continue;
      for (const candidate of extractImages(page.html, page.url)) {
        const score =
          scoreCandidate(candidate, hall, isMultiHall, page.hallSpecific) +
          (publicSource ? 0 : 20);
        if (!Number.isFinite(score) || score < (isMultiHall ? 70 : 45)) continue;
        scoredCandidates.push({
          candidate,
          pageUrl: page.url,
          publicSource,
          hallSpecificPage: page.hallSpecific,
          score,
        });
      }
    }
  }

  const chosen = scoredCandidates.sort((a, b) => b.score - a.score)[0];
  if (chosen) {
    const method: HallPhotoVerificationMethod = chosen.publicSource
      ? "public_named_listing"
      : chosen.hallSpecificPage
        ? "official_hall_page"
        : isMultiHall
          ? "official_named_gallery"
          : "official_single_hall_venue";
    const note = chosen.publicSource
      ? "공개 웨딩 정보 페이지에서 사진 인접 문구와 개별 홀명을 함께 확인함."
      : chosen.hallSpecificPage
        ? "공식 사이트의 홀별 상세 페이지에서 홀명과 공간 사진을 함께 확인함."
        : "공식 사이트에서 홀명과 공간 사진의 직접 연결을 확인함.";
    return {
      replacement: {
        hallId: hall.id,
        url: chosen.candidate.url,
        sourceUrl: chosen.pageUrl,
        sourceType: chosen.publicSource ? "public_listing" : "official_website",
        usageStatus: chosen.publicSource
          ? "public_source_linked"
          : "official_source_linked",
        photoKind: "wedding_setup",
        checkedAt: CHECKED_AT,
      },
      verification: {
        identityStatus: "hall_confirmed",
        verificationMethod: method,
        verificationNote: note,
      },
      audit: {
        hallId: hall.id,
        venueId: hall.venueId,
        venueName: hall.venueName,
        hallName: hall.hallName,
        result: "confirmed",
        sourceUrl: chosen.pageUrl,
        photoUrl: chosen.candidate.url,
        reason: note,
      },
    };
  }

  return {
    replacement: null,
    verification: null,
    audit: {
      hallId: hall.id,
      venueId: hall.venueId,
      venueName: hall.venueName,
      hallName: hall.hallName,
      result: "needs_review",
      sourceUrl: null,
      photoUrl: existingPhoto?.url ?? null,
      reason: existingPhoto
        ? "공개 페이지에서 사진과 개별 홀명을 연결하는 근거를 자동 확인하지 못함."
        : "확인 가능한 홀 사진을 자동 발견하지 못함.",
    },
  };
}

const results: Awaited<ReturnType<typeof auditHall>>[] = [];
const queue = [...targetHalls];
const workerCount = process.env.PHOTO_AUDIT_SEARCH_WEB === "1" ? 3 : 8;
const workers = Array.from({ length: workerCount }, async () => {
  while (queue.length > 0) {
    const hall = queue.shift();
    if (!hall) return;
    results.push(await auditHall(hall));
  }
});
await Promise.all(workers);

const resultByHallId = new Map(results.map((result) => [result.audit.hallId, result]));
const hallIdsByFinalPhotoUrl = new Map<string, string[]>();
for (const hall of hallsJson) {
  const result = resultByHallId.get(hall.id);
  const finalUrl =
    result?.replacement?.url ?? hallPhotosByHallId[hall.id]?.[0]?.url ?? null;
  if (!finalUrl) continue;
  const hallIds = hallIdsByFinalPhotoUrl.get(finalUrl) ?? [];
  hallIds.push(hall.id);
  hallIdsByFinalPhotoUrl.set(finalUrl, hallIds);
}
const duplicatedPhotoUrls = new Set(
  [...hallIdsByFinalPhotoUrl.entries()]
    .filter(([, hallIds]) => hallIds.length > 1)
    .map(([url]) => url),
);
for (const result of results) {
  if (!result.replacement || !duplicatedPhotoUrls.has(result.replacement.url)) continue;
  const duplicatedUrl = result.replacement.url;
  result.replacement = null;
  result.verification = null;
  result.audit.result = "needs_review";
  result.audit.photoUrl = duplicatedUrl;
  result.audit.reason =
    "동일한 이미지 URL이 둘 이상의 홀에 연결되어 개별 홀 사진으로 확정하지 않음.";
}

const targetReplacements = results
  .map((result) => result.replacement)
  .filter((value): value is ReplacementSeed => value !== null)
  .sort((a, b) => a.hallId.localeCompare(b.hallId));
const replacements = [
  ...(existingReplacementsJson as ReplacementSeed[]).filter(
    (entry) => !queuedHallIds.has(entry.hallId),
  ),
  ...targetReplacements,
].sort((a, b) => a.hallId.localeCompare(b.hallId));
const targetVerifications = Object.fromEntries(
  results
    .filter((result) => result.verification !== null)
    .sort((a, b) => a.audit.hallId.localeCompare(b.audit.hallId))
    .map((result) => [result.audit.hallId, result.verification]),
);
const verifications = {
  ...Object.fromEntries(
    Object.entries(existingVerificationsJson).filter(
      ([hallId]) => !queuedHallIds.has(hallId),
    ),
  ),
  ...targetVerifications,
};
const targetAudit = results
  .map((result) => result.audit)
  .sort((a, b) => a.hallId.localeCompare(b.hallId));
const audit = [
  ...(existingAuditJson as AuditResult[]).filter(
    (entry) => !queuedHallIds.has(entry.hallId),
  ),
  ...targetAudit,
].sort((a, b) => a.hallId.localeCompare(b.hallId));

await writeFile(
  path.join(ROOT, "src/data/hall-photo-replacements.generated.json"),
  `${JSON.stringify(replacements, null, 2)}\n`,
  "utf8",
);
await writeFile(
  path.join(ROOT, "src/data/hall-photo-verification.generated.json"),
  `${JSON.stringify(verifications, null, 2)}\n`,
  "utf8",
);
await writeFile(
  path.join(ROOT, "src/data/hall-photo-audit.generated.json"),
  `${JSON.stringify(audit, null, 2)}\n`,
  "utf8",
);

const confirmed = targetAudit.filter((entry) => entry.result === "confirmed").length;
console.log(
  JSON.stringify(
    {
      checkedAt: CHECKED_AT,
      hallPrefix: TARGET_HALL_PREFIX,
      explicitHallIds: [...EXPLICIT_TARGET_HALL_IDS],
      halls: targetHalls.length,
      confirmed,
      needsReview: targetAudit.length - confirmed,
      sourcePagesFetched: pageCache.size,
    },
    null,
    2,
  ),
);
