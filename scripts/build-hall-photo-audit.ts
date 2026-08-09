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
  "H-REG-X2-20260809-001": {
    url: "https://raonweddinghall.com/uploads/20260320_170227_home_slider_1_932a49.jpg",
    sourceUrl: "https://raonweddinghall.com/",
    note: "라온웨딩홀 공식 홈의 단독홀 웨딩 슬라이드에서 버진로드와 예식 좌석이 함께 보이는 실제 홀 전경을 확인함.",
    verificationMethod: "official_named_gallery",
  },
  "H-REG-X2-20260809-002": {
    url: "https://weddingcrowd.kr/data/hall/2406/thumb-933fd2493c0ca4c9022f5485e1e801a3_900x600.jpg",
    sourceUrl: "https://weddingcrowd.kr/hall/view.php?idx=1316",
    note: "공개 웨딩홀 상세 페이지에서 단독홀 예식 공간 사진과 업체명을 함께 확인함.",
    sourceType: "public_listing",
    usageStatus: "public_source_linked",
    verificationMethod: "public_named_listing",
  },
  "H-REG-X2-20260809-003": {
    url: "https://www.iwedding.co.kr/center/website/ihall_img/1441607763/1441607763_img_4942_0_1531881392.png",
    sourceUrl: "https://www.iwedding.co.kr/enterprise/info/1441607763",
    note: "아이웨딩 디엘웨딩홀 상세 페이지에서 마이아홀 예식 공간으로 구분된 사진을 확인함.",
    sourceType: "public_listing",
    usageStatus: "public_source_linked",
    verificationMethod: "public_named_listing",
  },
  "H-REG-X2-20260809-005": {
    url: "https://www.iwedding.co.kr/center/website/ihall_img/1400807956/1400807956_img_3736_0_1434952370.jpg",
    sourceUrl: "https://www.iwedding.co.kr/enterprise/info/1400807956",
    note: "아이웨딩 우리컨벤션 상세 페이지에서 단독 예식 공간 사진을 확인함.",
    sourceType: "public_listing",
    usageStatus: "public_source_linked",
    verificationMethod: "public_named_listing",
  },
  "H-REG-X2-20260809-006": {
    url: "https://www.iwedding.co.kr/center/website/ihall_img/1441604351/1441604351_img_4130_0_1445907892.jpg",
    sourceUrl: "https://www.iwedding.co.kr/enterprise/info/1441604351",
    note: "아이웨딩 국제신문 K웨딩홀 상세 페이지에서 K7홀 예식 공간으로 구분된 사진을 확인함.",
    sourceType: "public_listing",
    usageStatus: "public_source_linked",
    verificationMethod: "public_named_listing",
  },
  "H-REG-X2-20260809-007": {
    url: "https://blog.kakaocdn.net/dn/cvtGfG/btrXtSEHQMA/Gos6RNqDMLYj46qZz9Ak01/img.jpg",
    sourceUrl: "https://mate-info.com/%EB%B6%80%EC%82%B0-%EA%B5%AD%EC%A0%9C%EC%8B%A0%EB%AC%B8-k%EC%9B%A8%EB%94%A9%ED%99%80-%EA%B0%80%EA%B2%A9-%EB%B0%8F-%EC%9E%A5%EB%8B%A8%EC%A0%90-%EA%B4%91%EA%B3%A0x-%EA%B2%AC%EC%A0%81%EA%B3%B5%EA%B0%9C/",
    note: "공개 방문 후기에서 국제신문 K웨딩홀의 K홀 예식 공간으로 명시된 사진을 확인함.",
    sourceType: "public_listing",
    usageStatus: "public_source_linked",
    verificationMethod: "public_named_listing",
  },
  "H-REG-X2-20260809-013": {
    url: "https://www.busanparadisehotel.co.kr/upload/202606/1780639019631.jpg",
    sourceUrl: "https://www.busanparadisehotel.co.kr/front/facility/sweddingroom?F_CATE2=SWEDDING&F_CATE3=GRAND_BALLROOM",
    note: "파라다이스 호텔 부산 공식 그랜드볼룸 상세 페이지의 첫 번째 홀 갤러리 사진을 확인함. 자동 선택된 프로모션 배너를 교체함.",
    verificationMethod: "official_hall_page",
  },
  "H-REG-X2-20260809-014": {
    url: "https://www.hdc-hotel.com/files/tinymce_upload/Park_Hyatt_Busan_-_Winter_Wedding_Promotion.jpg",
    sourceUrl: "https://www.hdc-hotel.com/specialoffer/parkHyattBusan?Ctg=2&bbs_section=view&idx=339&key=&keyfield=&mode=&page=",
    note: "HDC호텔 공식 파크 하얏트 부산 웨딩 페이지에서 볼룸 예식 세팅 사진을 확인함.",
    verificationMethod: "official_hall_page",
  },
  "H-REG-X2-20260809-017": {
    url: "https://fruiterie.co.kr/photos/wedding.jpg",
    sourceUrl: "https://fruiterie.co.kr/rental",
    note: "프루터리포레스트 공식 대관 페이지의 포레스트 웨딩 세팅 사진을 확인함.",
    verificationMethod: "official_hall_page",
  },
  "H-REG-X2-20260809-021": {
    url: "https://www.rivieraconvention.com/images/sub/gall020201_img23.jpg?ver=2",
    sourceUrl: "https://www.rivieraconvention.com/bbs/content.php?co_id=02_02_01",
    note: "리베라컨벤션 공식 그랜드볼룸 상세 갤러리의 홀 전경 사진을 확인함.",
    verificationMethod: "official_hall_page",
  },
  "H-REG-X2-20260809-022": {
    url: "https://www.rivieraconvention.com/images/sub/gall020202_img08.jpg?ver=2",
    sourceUrl: "https://www.rivieraconvention.com/bbs/content.php?co_id=02_02_02",
    note: "리베라컨벤션 공식 루벤스홀 상세 갤러리의 홀 전경 사진을 확인함.",
    verificationMethod: "official_hall_page",
  },
  "H-REG-X2-20260809-023": {
    url: "https://www.rivieraconvention.com/images/sub/gall020203_img01.jpg?ver=251001",
    sourceUrl: "https://www.rivieraconvention.com/bbs/content.php?co_id=02_02_03",
    note: "리베라컨벤션 공식 아르덴하우스 상세 갤러리의 예식 공간 사진을 확인함.",
    verificationMethod: "official_hall_page",
  },
  "H-REG-X2-20260809-024": {
    url: "https://www.ambatel.com/RES/PRODUCT/201904/grand1_20190425144807.jpg",
    sourceUrl: "https://www.ambatel.com/grandmercure/changwon/en/weddingView.do?wedding_contents_seq=64",
    note: "앰배서더 공식 그랜드 머큐어 창원 그랜드볼룸 웨딩 페이지의 홀 사진을 확인함.",
    verificationMethod: "official_hall_page",
  },
  "H-REG-X2-20260809-025": {
    url: "https://www.ambatel.com/RES/PRODUCT/202103/1_20210309095712.jpg",
    sourceUrl: "https://www.ambatel.com/grandmercure/changwon/en/weddingView.do?wedding_contents_seq=66",
    note: "앰배서더 공식 그랜드 머큐어 창원 가든하우스 웨딩 페이지의 공간 사진을 확인함.",
    verificationMethod: "official_hall_page",
  },
  "H-REG-X2-20260809-026": {
    url: "https://www.ambatel.com/RES/PRODUCT/202505/pc-6_20250515150355.jpg",
    sourceUrl: "https://www.ambatel.com/grandmercure/changwon/en/weddingView.do?wedding_contents_seq=65",
    note: "앰배서더 공식 그랜드 머큐어 창원 빌라드룸 웨딩 페이지의 공간 사진을 확인함.",
    verificationMethod: "official_hall_page",
  },
  "H-REG-X2-20260809-030": {
    url: "https://static.wixstatic.com/media/ed2677_06ef4c90c6ad4396b153ae76c0813f6b~mv2.jpg",
    sourceUrl: "https://www.iccwedding.kr/%EA%B7%B8%EB%9E%9C%EB%93%9C%EB%B3%BC%EB%A3%B8%ED%99%80",
    note: "호텔ICC 공식 그랜드볼룸홀 페이지에서 홀명과 해당 갤러리 사진을 확인함.",
    verificationMethod: "official_hall_page",
  },
  "H-REG-X2-20260809-031": {
    url: "https://static.wixstatic.com/media/ed2677_cef187c00da846af8c53d05b56904e7c~mv2.jpg",
    sourceUrl: "https://www.iccwedding.kr/weddinghall",
    note: "호텔ICC 공식 웨딩홀 페이지에서 크리스탈볼룸 명칭과 해당 갤러리 사진을 확인함.",
    verificationMethod: "official_named_gallery",
  },
  "H-REG-X2-20260809-032": {
    url: "https://images.weserv.nl/?url=http%3A%2F%2Flvdj.co.kr%2Fimg%2Fsub02%2Fimg-05.jpg",
    sourceUrl: "https://lvdj.co.kr/sub02/sub02_01.html",
    note: "루이비스컨벤션 대전점 공식 웨딩홀 페이지에서 아모리스 탭과 해당 홀 갤러리의 첫 번째 사진을 함께 확인함.",
    verificationMethod: "official_hall_page",
  },
  "H-REG-X2-20260809-033": {
    url: "https://images.weserv.nl/?url=http%3A%2F%2Flvdj.co.kr%2Fimg%2Fsub02%2Fimg-01.jpg",
    sourceUrl: "https://lvdj.co.kr/sub02/sub02_01_02.html",
    note: "루이비스컨벤션 대전점 공식 웨딩홀 페이지에서 그레이스 탭과 해당 홀 갤러리의 첫 번째 사진을 함께 확인함.",
    verificationMethod: "official_hall_page",
  },
  "H-REG-X2-20260809-034": {
    url: "https://weddingcrowd.kr/data/hall/2407/thumb-20240730012151_512533_4_900x600.png",
    sourceUrl: "https://weddingcrowd.kr/hall/view.php?idx=1657",
    note: "공개 웨딩홀 상세 페이지에서 라포르테홀 예식 공간 사진과 홀명을 함께 확인함.",
    sourceType: "public_listing",
    usageStatus: "public_source_linked",
    verificationMethod: "public_named_listing",
  },
  "H-REG-X2-20260809-035": {
    url: "https://weddingcrowd.kr/data/hall/2406/20220929173247_%EB%B9%8C%EB%9D%BC%EB%93%9C5.jpg",
    sourceUrl: "https://weddingcrowd.kr/hall/view.php?idx=1065",
    note: "공개 웨딩홀 상세 페이지에서 빌라드알티오라 단독 예식 공간 사진을 확인함.",
    sourceType: "public_listing",
    usageStatus: "public_source_linked",
    verificationMethod: "public_named_listing",
  },
  "H-REG-X2-20260809-037": {
    url: "https://weddingcrowd.kr/data/hall/2407/thumb-20240730012916_418005_1_900x600.png",
    sourceUrl: "https://weddingcrowd.kr/hall/view.php?idx=1658",
    note: "공개 웨딩홀 상세 페이지에서 S가든 단독 예식 공간 사진을 확인함.",
    sourceType: "public_listing",
    usageStatus: "public_source_linked",
    verificationMethod: "public_named_listing",
  },
  "H-REG-X2-20260809-041": {
    url: "https://weddingcrowd.kr/data/hall/2407/20240730020244_725217_%EC%8D%B8%EB%84%A4%EC%9D%BC.jpg",
    sourceUrl: "https://weddingcrowd.kr/hall/view.php?idx=1660",
    note: "공개 웨딩홀 상세 페이지에서 마리드엘 단독홀 예식 공간 사진을 확인함.",
    sourceType: "public_listing",
    usageStatus: "public_source_linked",
    verificationMethod: "public_named_listing",
  },
  "H-REG-X2-20260809-042": {
    url: "https://cache.marriott.com/is/image/marriotts7prod/cy-cjjcy-grand-ballroom-wedding-13295%3APano-Hor",
    sourceUrl: "https://www.marriott.com/offers/make-your-wedding-even-more-special-OFF-157455/CJJCY-cjjcy-courtyard-sejong",
    note: "메리어트 공식 코트야드 세종 웨딩 페이지에서 그랜드볼룸 웨딩 세팅 사진을 확인함.",
    verificationMethod: "official_hall_page",
  },
  "H-REG-X2-20260809-043": {
    url: "https://images.weserv.nl/?url=http%3A%2F%2Fwww.awhotel.co.kr%2Fimages%2Fhall2_1.jpg",
    sourceUrl: "https://www.awhotel.co.kr/sub3_1.php",
    note: "AW호텔 공식 오스카홀 상세 페이지의 첫 번째 홀 갤러리 사진을 확인함.",
    verificationMethod: "official_hall_page",
  },
  "H-REG-X2-20260809-044": {
    url: "https://images.weserv.nl/?url=http%3A%2F%2Fwww.awhotel.co.kr%2Fimages%2Fhall3_1.jpg",
    sourceUrl: "https://www.awhotel.co.kr/sub3_2.php",
    note: "AW호텔 공식 앨리스홀 상세 페이지의 첫 번째 홀 갤러리 사진을 확인함.",
    verificationMethod: "official_hall_page",
  },
  "H-REG-X2-20260809-045": {
    url: "https://images.weserv.nl/?url=http%3A%2F%2Fwww.awhotel.co.kr%2Fimages%2Fhall1_1.jpg",
    sourceUrl: "https://www.awhotel.co.kr/sub3.php",
    note: "AW호텔 공식 베아트리체홀 상세 페이지의 첫 번째 홀 갤러리 사진을 확인함.",
    verificationMethod: "official_hall_page",
  },
  "H-REG-X2-20260809-046": {
    url: "https://images.weserv.nl/?url=http%3A%2F%2Fwww.mstarhouse.co.kr%2Fimages%2Fmain%2Fsec1_img2_250812.jpg",
    sourceUrl: "https://www.mstarhouse.co.kr/",
    note: "M스타하우스 공식 홈의 WEDDING HALL 목록에서 모닝스타 순서와 해당 이미지를 함께 확인함.",
    verificationMethod: "official_named_gallery",
  },
  "H-REG-X2-20260809-047": {
    url: "https://images.weserv.nl/?url=http%3A%2F%2Fwww.mstarhouse.co.kr%2Fimages%2Fmain%2Fsec1_img3_250812.jpg",
    sourceUrl: "https://www.mstarhouse.co.kr/",
    note: "M스타하우스 공식 홈의 WEDDING HALL 목록에서 화이트스타 순서와 해당 이미지를 함께 확인함.",
    verificationMethod: "official_named_gallery",
  },
  "H-REG-X2-20260809-048": {
    url: "https://images.weserv.nl/?url=http%3A%2F%2Fwww.mstarhouse.co.kr%2Fimages%2Fmain%2Fsec1_img1_250812.jpg",
    sourceUrl: "https://www.mstarhouse.co.kr/",
    note: "M스타하우스 공식 홈의 WEDDING HALL 목록에서 블루스타 순서와 해당 이미지를 함께 확인함.",
    verificationMethod: "official_named_gallery",
  },
  "H-REG-X2-20260809-054": {
    url: "https://cdn.imweb.me/thumbnail/20250417/231d8c1c1cb7a.jpg",
    sourceUrl: "https://hotellaonzena.com/weddinghall",
    note: "호텔 라온제나 공식 CLAIR HALL 페이지의 대표 홀 사진을 확인함.",
    verificationMethod: "official_hall_page",
  },
  "H-REG-X2-20260809-055": {
    url: "https://cdn.imweb.me/thumbnail/20250904/c5655783baafd.png",
    sourceUrl: "https://hotellaonzena.com/convention",
    note: "호텔 라온제나 공식 CONVENTION HALL 페이지의 갤러리에서 버진로드와 좌석이 보이는 실제 예식 세팅 사진을 확인함.",
    verificationMethod: "official_hall_page",
  },
  "H-REG-X2-20260809-064": {
    url: "https://images.weserv.nl/?url=http%3A%2F%2Fm.ibhotel.com%2Fimg%2FOutside_slide2604_0.jpg",
    sourceUrl: "https://m.ibhotel.com/convention/wedding/outside.php",
    note: "호텔 인터불고 엑스코 공식 그랑파티오 상세 페이지의 2026 웨딩 슬라이드 사진을 확인함.",
    verificationMethod: "official_hall_page",
  },
  "H-REG-X2-20260809-067": {
    url: "https://images.weserv.nl/?url=http%3A%2F%2Fwww.paradisewedding.co.kr%2Fimage%2F2026_hall2%2F1.jpg",
    sourceUrl: "https://www.paradisewedding.co.kr/sub_lastella_hall.html",
    note: "대구 파라다이스웨딩 공식 스텔라홀 상세 페이지의 2026 홀 갤러리 첫 번째 사진을 확인함.",
    verificationMethod: "official_hall_page",
  },
  "H-REG-X2-20260809-068": {
    url: "https://images.weserv.nl/?url=http%3A%2F%2Fwww.paradisewedding.co.kr%2Fimage%2F2026_hall1%2F1.jpg",
    sourceUrl: "https://www.paradisewedding.co.kr/sub_grandlavita_hall.html",
    note: "대구 파라다이스웨딩 공식 그랜드볼룸 상세 페이지의 2026 홀 갤러리 첫 번째 사진을 확인함.",
    verificationMethod: "official_hall_page",
  },
  "H-REG-X2-20260809-004": {
    url: "https://images.weserv.nl/?url=http%3A%2F%2Fblogfiles.naver.net%2FMjAxOTA3MjNfMjIg%2FMDAxNTYzODEzMzI2NDI5.E62tQY_BR533De9QCEe45UHWjb7vZceywZGuT_HOtp0g.iUT74SoKrb-K-pOuJpcC73kT8-4KVLc92JxY3ulLo5Ig.JPEG.rhdmspretty%2F20190601_162205.jpg",
    sourceUrl: "https://blog.naver.com/rhdmspretty/221593133270",
    note: "디엘웨딩홀 아모르홀로 명시된 공개 홀투어에서 인물 없는 홀 전경을 확인함. 최신 빈 홀 사진이 없어 홀 식별이 분명한 기존 전경을 사용함.",
    sourceType: "public_listing",
    usageStatus: "public_source_linked",
    verificationMethod: "public_named_listing",
  },
  "H-REG-X2-20260809-008": {
    url: "https://images.weserv.nl/?url=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNDA3MjlfMjMx%2FMDAxNzIyMjU4OTI5NDk3.GZDrEkMnEuoKD6dyzCZFgw1dsvEnOuVyD-oWLg6Y1DYg.8Vgktf6H5p--WJgdu_Z5HaoMpETqOwM3poCQGIhwXlcg.JPEG%2F20240721%25A3%25DF140847.jpg",
    sourceUrl: "https://blog.naver.com/dlfvl777/223569558590",
    note: "2025년 아시아드시티 르느아르홀 계약 후기에서 홀명이 명시된 빈 홀 전경을 확인함.",
    sourceType: "public_listing",
    usageStatus: "public_source_linked",
    verificationMethod: "public_named_listing",
  },
  "H-REG-X2-20260809-009": {
    url: "https://images.weserv.nl/?url=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNTEyMDVfMjg1%2FMDAxNzY0OTM3NDgxMTcw.YG9RO40z8tC0qO-n1tsWzwa9GvKgcfR2ZxZ-9D8nrDIg.XrfjExQbPF7tn-Bz4JzjPRBKIVJb9ZAUJ15vN2UD0BAg.JPEG%2FIMG%25A3%25DF2097.jpg",
    sourceUrl: "https://blog.naver.com/monthlykaya/224099703984",
    note: "2025년 아시아드시티 마그리트홀 계약 후기에서 홀명이 명시된 실제 홀 전경을 확인함.",
    sourceType: "public_listing",
    usageStatus: "public_source_linked",
    verificationMethod: "public_named_listing",
  },
  "H-REG-X2-20260809-010": {
    url: "https://images.weserv.nl/?url=http%3A%2F%2Fimage.nmv.naver.net%2Fblog_2024_04_03_355%2Ff88b7bf5-f1a6-11ee-96da-b4055dcfbc09_01.jpg",
    sourceUrl: "https://blog.naver.com/songchae0/223407844109",
    note: "아시아드시티 고흐홀 계약·홀투어 후기에서 고흐홀로 명시된 실제 홀 전경을 확인함.",
    sourceType: "public_listing",
    usageStatus: "public_source_linked",
    verificationMethod: "public_named_listing",
  },
  "H-REG-X2-20260809-011": {
    url: "https://images.weserv.nl/?url=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNDA4MzFfMTUz%2FMDAxNzI1MDc5NzQxNDUz.PIq6J7vm-O_8sPhZRst80sNy5i1cKuKg8hxJZsKURiAg.FJixkSFRyn8fhg1t-0zR64KG4mWmjt_iWqg0kCtcS1Yg.JPEG%2FKakaoTalk_Photo_2024-08-31-13-25-42_014jpeg.jpeg",
    sourceUrl: "https://blog.naver.com/szyoonsz/223567339477",
    note: "한화리조트 해운대 베르나차홀로 명시된 최근 홀투어에서 인물 없는 예식 세팅 전경을 확인함.",
    sourceType: "public_listing",
    usageStatus: "public_source_linked",
    verificationMethod: "public_named_listing",
  },
  "H-REG-X2-20260809-012": {
    url: "https://images.weserv.nl/?url=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzAyMThfMjYw%2FMDAxNjc2NzMxMDc3NTg0.4am6BbGC3TDxW57gQKYHl9ZRpd6H28wPi7ztyGlbfP8g.M_GhPgDwRcb9SbgUmqzYJeHMrlApg77J8b7NhbP1JQQg.JPEG.yoon940520%2Foutput_3737653093.jpg",
    sourceUrl: "https://blog.naver.com/yoon940520/223020359035",
    note: "한화리조트 해운대 몬테로소홀 후기에서 홀명이 명시된 인물 없는 홀 전경을 확인함.",
    sourceType: "public_listing",
    usageStatus: "public_source_linked",
    verificationMethod: "public_named_listing",
  },
  "H-REG-X2-20260809-016": {
    url: "https://images.weserv.nl/?url=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzAxMjJfMjQ4%2FMDAxNjc0MzkwODk2ODg3.egRZT2Y4uqj3tu2_i8SVTH0EwFPgN3vj_ehYXcgZ_w4g.1gDbJ1iSrWYdNu_aCMbY_73q2AW62mBtqHQcXQPMwv8g.JPEG.skaskanf%2FIMG_6429.jpg",
    sourceUrl: "https://blog.naver.com/skaskanf/222991158753",
    note: "아바니 센트럴 부산 5층 단독 아바니홀 계약 후기에서 빈 홀 예식 세팅 전경을 확인함.",
    sourceType: "public_listing",
    usageStatus: "public_source_linked",
    verificationMethod: "public_named_listing",
  },
  "H-REG-X2-20260809-018": {
    url: "https://images.weserv.nl/?url=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNTEwMTVfNzgg%2FMDAxNzYwNDkyNzg5Nzkx.wwEIpN_Y9zYI5IfqnrBNgiBdW-ec2JhOCqNGpUyItmkg.hSp3N_9TI00AzlUCTkjDIwbyp-RSEGJCaTdlS035rt0g.JPEG%2FIMG%25A3%25DF1888.jpg",
    sourceUrl: "https://blog.naver.com/or_zl_ni/224042013713",
    note: "미래웨딩캐슬 오페라홀 최근 홀투어에서 홀명이 명시된 빈 홀 전경을 확인함.",
    sourceType: "public_listing",
    usageStatus: "public_source_linked",
    verificationMethod: "public_named_listing",
  },
  "H-REG-X2-20260809-019": {
    url: "https://images.weserv.nl/?url=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNTEyMjRfNDIg%2FMDAxNzY2NTU0MjM0NjQz.B_zC56eEYNVl3Lv4TM8-6gqYCUrtv4Xey3UqhfEbnuAg.OcghxhLv0DGKJAt3oeMCrqOpao1N3filkFGNFRZ74dgg.JPEG%2F%25B9%25CC%25B7%25A1_vip.jpg",
    sourceUrl: "https://blog.naver.com/ramdal754/224121266017",
    note: "2025년 미래웨딩캐슬 홀투어에서 VIP홀로 구분된 빈 홀 전경을 확인함.",
    sourceType: "public_listing",
    usageStatus: "public_source_linked",
    verificationMethod: "public_named_listing",
  },
  "H-REG-X2-20260809-020": {
    url: "https://images.weserv.nl/?url=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNjA2MDdfNDUg%2FMDAxNzgwODEyNjU5OTEw._5FcSrHePkixJQKY2pjW0hliQSgEiw0aXp3TKHu-g84g.75YyiLDT5LX7xor1gBG3tlIrd8CPZo6tX9erfqJ3RVsg.JPEG%2F900_20260606_085241.jpg",
    sourceUrl: "https://blog.naver.com/loglling/224323323868",
    note: "2026년 미래웨딩캐슬 하모니홀 후기에서 인물 없는 실제 홀 전경을 확인함.",
    sourceType: "public_listing",
    usageStatus: "public_source_linked",
    verificationMethod: "public_named_listing",
  },
  "H-REG-X2-20260809-027": {
    url: "https://images.weserv.nl/?url=http%3A%2F%2Fblogfiles.naver.net%2F20141021_183%2Fthebmk_1413881287902fJ96A_JPEG%2F20140613__03.jpg",
    sourceUrl: "https://blog.naver.com/thebmk/220157493254",
    note: "BMK 공식 블로그의 하모니볼룸홀 소개에서 홀명이 연결된 빈 홀 전경을 확인함. 최근 공식 빈 홀 사진이 없어 기존 공식 사진을 사용함.",
    sourceType: "official_website",
    usageStatus: "official_source_linked",
    verificationMethod: "official_named_gallery",
  },
  "H-REG-X2-20260809-028": {
    url: "https://images.weserv.nl/?url=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNTAzMjFfMTg4%2FMDAxNzQyNTU0Njk1Mjc2.kGOZovETudxLyclc2oGSSJDylwAb-I0sCyn3xnR3n-Ug.JwtF4MU532Tf447_xB_YyUDRwXowHRNa93XrB06_ciEg.JPEG%2FKakaoTalk_20250321_184346929_01.jpg",
    sourceUrl: "https://blog.naver.com/p_solgis_q/223805397856",
    note: "2025년 BMK 아스틴홀 후기에서 홀명이 명시된 인물 없는 실제 홀 전경을 확인함.",
    sourceType: "public_listing",
    usageStatus: "public_source_linked",
    verificationMethod: "public_named_listing",
  },
  "H-REG-X2-20260809-029": {
    url: "https://images.weserv.nl/?url=http%3A%2F%2Fblogfiles.naver.net%2FMjAxOTA3MzFfMTMy%2FMDAxNTY0NTYwNzg3NDMz.3He-atkrMOE7eGDc9w_Lz-vvwapk4xu1UNaC0-9zY-Ig.Sj4qiTCrKVF9ogX67t8u3G4XA3DylHVwhV7pEWPaU2Ug.JPEG.bmkhall%2F2_%25281%2529.jpg",
    sourceUrl: "https://blog.naver.com/bmkhall/221601231484",
    note: "BMK 웨딩홀 운영 블로그의 앰버홀 소개에서 홀명이 연결된 빈 예식 공간 전경을 확인함.",
    sourceType: "official_website",
    usageStatus: "official_source_linked",
    verificationMethod: "official_named_gallery",
  },
  "H-REG-X2-20260809-036": {
    url: "https://images.weserv.nl/?url=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA5MTlfMjUz%2FMDAxNjk1MDg4MzgxNDE2.EefZu6nqmpRB3CtbYyBKYWYJbRVVrFLiZAhAcVq3GK4g.a4AygNe__jImUeh_IPcVaMLCxmfInOm_dagkV4IkuzIg.PNG.capitalwd2330%2F01.png",
    sourceUrl: "https://blog.naver.com/d_maisondebonheur/223215534914",
    note: "메종드보네르 운영 블로그의 보네르홀 소개에서 홀명과 빈 홀 전경을 함께 확인함.",
    sourceType: "official_website",
    usageStatus: "official_source_linked",
    verificationMethod: "official_named_gallery",
  },
  "H-REG-X2-20260809-038": {
    url: "https://images.weserv.nl/?url=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNjAxMjlfNTYg%2FMDAxNzY5NjczMTQ2NjQ0.vv67lT4mQXv-haNZy1eW3G873T-x4KO1nBkiZovHsVIg.ICDZUjNriZ-hhx4M0rwO8GTgwSFGt6vrbjHW_FuuTTwg.JPEG%2FIMG%25A3%25DF9029.jpg",
    sourceUrl: "https://blog.naver.com/wed_0917/224176296650",
    note: "2026년 호텔선샤인앤파라다이스 그랜드볼룸 홀투어에서 홀명이 명시된 빈 홀 전경을 확인함.",
    sourceType: "public_listing",
    usageStatus: "public_source_linked",
    verificationMethod: "public_named_listing",
  },
  "H-REG-X2-20260809-039": {
    url: "https://images.weserv.nl/?url=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMTA3MTNfMjI5%2FMDAxNjI2MTc3MDI3NDc5.l4UbVA-QRdLCFOXCr2c5F0Q_ZCMxKO_hQc9XPtz0my4g.5TF4ii6WsmyEc2By8BUb2q3kjuAnCoIJx85cpPW9EDUg.JPEG.yoohm95%2FIMG_3675.jpg",
    sourceUrl: "https://blog.naver.com/yoohm95/222430484728",
    note: "호텔선샤인앤파라다이스 파라다이스홀로 명시된 홀투어에서 빈 홀 전경을 확인함. 최신 빈 홀 사진이 없어 식별 가능한 기존 전경을 사용함.",
    sourceType: "public_listing",
    usageStatus: "public_source_linked",
    verificationMethod: "public_named_listing",
  },
  "H-REG-X2-20260809-040": {
    url: "https://images.weserv.nl/?url=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNDAxMzFfNzEg%2FMDAxNzA2NjM2ODg0ODAx.faxDSDOb46U2VJBIrjQi6TNzka_p3SOECe2QtfyssVwg.nXYZ-6GFZfFQ-mbsueTGHv9FePidu442TKd62X-2wcAg.JPEG.skffk09%2FIMG_3919.JPG",
    sourceUrl: "https://blog.naver.com/h_iary__/223339241769",
    note: "호텔선샤인앤파라다이스 씨엘드포레로 명시된 방문 후기에서 인물 없는 밝은 홀 전경을 확인함.",
    sourceType: "public_listing",
    usageStatus: "public_source_linked",
    verificationMethod: "public_named_listing",
  },
  "H-REG-X2-20260809-049": {
    url: "https://images.weserv.nl/?url=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNjAyMjZfNTcg%2FMDAxNzcyMTEzMTY5MjE4.xr4IaEVKJFGM7Jyvh7wMD7dWWJsWJ-feWqeylCNXFs4g.XEGQK7c5ol3yFexW_15GawvM5ktZpjVBtppKDiwxNIEg.JPEG%2FKakaoTalk_20260226_223316250_22.jpg",
    sourceUrl: "https://blog.naver.com/cherry_joo/224197303510",
    note: "2026년 노비아갈라 전자관점 보타닉가든 예식 후기에서 홀명이 명시된 빈 홀 전경을 확인함.",
    sourceType: "public_listing",
    usageStatus: "public_source_linked",
    verificationMethod: "public_named_listing",
  },
  "H-REG-X2-20260809-050": {
    url: "https://images.weserv.nl/?url=http%3A%2F%2Fimage.nmv.naver.net%2Fblog_2023_02_06_3110%2F11ee8c33-a61a-11ed-ac11-a0369ffb35c4_01.jpg",
    sourceUrl: "https://blog.naver.com/dlwngml5351/223007963415",
    note: "노비아갈라 전자관점 벨라지오·보타닉가든 홀투어에서 벨라지오로 구분된 빈 홀 전경을 확인함. 2026년 운영은 별도 최근 계약 자료로 교차 확인함.",
    sourceType: "public_listing",
    usageStatus: "public_source_linked",
    verificationMethod: "public_named_listing",
  },
  "H-REG-X2-20260809-051": {
    url: "https://images.weserv.nl/?url=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNTEyMDFfMTY3%2FMDAxNzY0NTYxMTMyNTcw.eAQtc-cSEE-ryQMk4z29fuIFBKOB6fvXj76K9rFLqYwg.UTGDlIRv2ebD2BuFtoWU6rVZaZqv1k9TsnPgaBsXaZ4g.JPEG%2F1764561131836.jpg",
    sourceUrl: "https://blog.naver.com/wedding261122/224094082185",
    note: "2026년 하반기 노비아갈라 동촌점 포레아홀 계약 후기에서 홀명이 명시된 실제 예식 공간을 확인함.",
    sourceType: "public_listing",
    usageStatus: "public_source_linked",
    verificationMethod: "public_named_listing",
  },
  "H-REG-X2-20260809-052": {
    url: "https://images.weserv.nl/?url=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNjAzMzBfMjky%2FMDAxNzc0ODc0NzQzOTU1.onz_fUS5QpcKjNcaN5CrgIlyL-N1MWA8YojzwCt_SqMg.dgwMzcxJ9BGsZAFNMhlgDvEyuDOZGK14EzZP2-meSp8g.JPEG%2FIMG%25A3%25DF0849.jpg",
    sourceUrl: "https://blog.naver.com/eunsim015/224235019902",
    note: "2027년 상담이 진행 중인 노비아갈라 동촌점 시그니아홀 홀투어에서 홀명이 명시된 실제 홀 전경을 확인함.",
    sourceType: "public_listing",
    usageStatus: "public_source_linked",
    verificationMethod: "public_named_listing",
  },
  "H-REG-X2-20260809-056": {
    url: "https://cdn.imweb.me/thumbnail/20251027/4655cbd1e775f.jpg",
    sourceUrl: "https://colordium.co.kr/viola",
    note: "웨딩칼라디움 공식 비올라홀 페이지의 2026 리뉴얼 갤러리에서 인물 없는 홀 전경을 확인함.",
    verificationMethod: "official_hall_page",
  },
  "H-REG-X2-20260809-057": {
    url: "https://cdn.imweb.me/thumbnail/20251027/e9d3b0941b18e.jpg",
    sourceUrl: "https://colordium.co.kr/concerthall",
    note: "웨딩칼라디움 공식 콘서트홀 페이지의 2026 리뉴얼 갤러리에서 인물 없는 홀 전경을 확인함.",
    verificationMethod: "official_hall_page",
  },
  "H-REG-X2-20260809-059": {
    url: "https://images.weserv.nl/?url=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzAyMDNfNDMg%2FMDAxNjc1MzkzODYwNjY4.xd9cADGk2fZxgZ18x9JfYIDrn5FPhM086nD-lVgDQ0Ig.Y9sN7sxEaVIHD1hhc57WVtKcesNeMrPHjM0a27MFPrQg.JPEG.nahee049%2FIMG_4265.jpg",
    sourceUrl: "https://blog.naver.com/nahee049/223003977508",
    note: "웨딩비엔나 비엔나홀·하우스홀·컨벤션홀 비교 후기에서 비엔나홀로 구분된 빈 홀 전경을 확인함. 최근 운영은 2026년 상담 자료로 별도 교차 확인함.",
    sourceType: "public_listing",
    usageStatus: "public_source_linked",
    verificationMethod: "public_named_listing",
  },
  "H-REG-X2-20260809-060": {
    url: "https://images.weserv.nl/?url=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNjA0MTlfODkg%2FMDAxNzc2NTgzMjgwMjgy.R9O1-6QdbCeg7MxWruIyR8oSx2j_KZX501xQNj1YZzsg.rVOiSWCb70LnGlTe8AIZprOckRKJfdFg79ioevUktyMg.JPEG%2FKakaoTalk_20260417_134450195_07.jpg",
    sourceUrl: "https://blog.naver.com/yunjiypl/224257799385",
    note: "2026년 웨딩비엔나 하우스홀 리모델링 후기에서 홀명이 명시된 빈 홀 전경을 확인함.",
    sourceType: "public_listing",
    usageStatus: "public_source_linked",
    verificationMethod: "public_named_listing",
  },
  "H-REG-X2-20260809-061": {
    url: "https://images.weserv.nl/?url=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNTEwMTBfMTUw%2FMDAxNzYwMDg2OTYzOTM0.olaS_u_AOmO0u2oqOkg1Vw59ihV6V8PRkkOIf5O2v4gg.WbXCY30vosQJdB3FDaa48qAjScv397pB5gxhAkTj688g.JPEG%2FKakaoTalk_20251004_164500645_13.jpg",
    sourceUrl: "https://blog.naver.com/plansiyeon/224037645536",
    note: "2025년 웨딩비엔나 컨벤션홀 리모델링 후기에서 홀명이 명시된 빈 홀 전경을 확인함.",
    sourceType: "public_listing",
    usageStatus: "public_source_linked",
    verificationMethod: "public_named_listing",
  },
  "H-REG-X2-20260809-062": {
    url: "https://cdn.prod.website-files.com/66a1eeaa00f1c86c3dbae974/66e00235d899f3fe4b716fac_1701932057_img_6021_0_1702012049.avif",
    sourceUrl: "https://www.directwedding.co.kr/weddinghall/hall0106",
    note: "현행 웨딩 판매 페이지의 피오니홀 상세 영역에서 홀명과 해당 빈 홀 전경을 함께 확인함.",
    sourceType: "public_listing",
    usageStatus: "public_source_linked",
    verificationMethod: "public_named_listing",
  },
  "H-REG-X2-20260809-063": {
    url: "https://cdn.prod.website-files.com/66a1eeaa00f1c86c3dbae974/66e00232d899f3fe4b716dd9_1701932057_img_6023_0_1702012064.avif",
    sourceUrl: "https://www.directwedding.co.kr/weddinghall/hall0106",
    note: "현행 웨딩 판매 페이지의 블레스홀 상세 영역에서 홀명과 해당 빈 홀 전경을 함께 확인함.",
    sourceType: "public_listing",
    usageStatus: "public_source_linked",
    verificationMethod: "public_named_listing",
  },
  "H-REG-X2-20260809-065": {
    url: "https://images.weserv.nl/?url=http%3A%2F%2Fm.ibhotel.com%2Fimg%2FHera_slide0.jpg",
    sourceUrl: "https://m.ibhotel.com/convention/wedding/hera.php",
    note: "호텔 인터불고 엑스코 공식 그랜드볼룸 상세 페이지의 홀 갤러리에서 실제 웨딩 세팅 전경을 확인함.",
    verificationMethod: "official_hall_page",
  },
  "H-REG-X2-20260809-066": {
    url: "https://images.weserv.nl/?url=http%3A%2F%2Fm.ibhotel.com%2Fimg%2FRhea_slide_2604_0.jpg",
    sourceUrl: "https://m.ibhotel.com/convention/wedding/rhea.php",
    note: "호텔 인터불고 엑스코 공식 크리스탈볼룸 상세 페이지의 2026 홀 갤러리에서 실제 웨딩 세팅 전경을 확인함.",
    verificationMethod: "official_hall_page",
  },
  "H-REG-X2-20260809-069": {
    url: "https://images.weserv.nl/?url=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNjAzMjBfMTc1%2FMDAxNzczOTc2NTkwOTA0.ZbeknUIo_kaTKbEHycGkd-XHwHfT7lvTI1QAtoYJ3HQg.X6onOfe9MbYW93d7mpaQtIQxZePeM0xd9qqF05352sog.JPEG%2Foutput%25A3%25DF720490025.jpg",
    sourceUrl: "https://blog.naver.com/b_gyuri/224223346363",
    note: "2026년 3월 공사 완료 후 호텔수성 아이비홀 방문 후기에서 홀명이 명시된 빈 홀 전경을 확인함.",
    sourceType: "public_listing",
    usageStatus: "public_source_linked",
    verificationMethod: "public_named_listing",
  },
  "H-REG-X2-20260809-070": {
    url: "https://images.weserv.nl/?url=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNTA2MzBfMzEg%2FMDAxNzUxMjU5ODkxMjQy.AygCsyZOsh3XxWnuARlQU4BG07l58Dl8YFppjrqWbeIg.9owxBdimck3K0kGSZUR-3tE_czasqaOv0p0QCWhLtikg.JPEG%2FYEON_0062.jpg",
    sourceUrl: "https://blog.naver.com/susunghotel/223916593532",
    note: "호텔수성 공식 블로그의 라포레수성 소개에서 야외 웨딩 좌석과 공간 전경을 확인함.",
    sourceType: "official_website",
    usageStatus: "official_source_linked",
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
