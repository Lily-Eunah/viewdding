import Link from "next/link";

export default function NotFound() { return <div className="empty-state"><h1>홀 정보를 찾을 수 없어요.</h1><p>주소가 바뀌었거나 공개 대상에서 제외된 홀일 수 있습니다.</p><Link className="primary-link" href="/search/">웨딩홀 찾기로 돌아가기</Link></div>; }
