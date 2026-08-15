"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowSquareOut,
  ArrowUp,
  LinkSimple,
  PlusCircle,
  Trash,
  WarningCircle,
} from "@phosphor-icons/react";
import {
  SELF_SNAP_VENUE_CATEGORIES,
  SELF_SNAP_REGIONS,
  type SelfSnapVenue,
  type SelfSnapVenueCategory,
  type SelfSnapRegion,
} from "@/domain/self-snap-types";

export default function AdminSelfSnapVenuesPage() {
  const [venues, setVenues] = useState<SelfSnapVenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [urlInput, setUrlInput] = useState("");
  const [scraping, setScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState("");

  const [formData, setFormData] = useState<Partial<SelfSnapVenue>>({
    name: "",
    category: "studio",
    region: "seoul_east",
    regionLabel: "서울 성수/한남",
    address: "",
    thumbnailUrl: "",
    features: ["자연광", "주차 가능"],
    priceInfo: "",
    bestTimeTip: "",
    editorNote: "",
    bookingUrl: "",
    mapUrl: "",
    isAffiliate: false,
  });
  const [featuresInput, setFeaturesInput] = useState("자연광, 화이트 호리존, 소품 완비");

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/self-snap/venues");
      const json = await res.json();
      if (json.success) {
        setVenues(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleScrape = async () => {
    if (!urlInput.trim()) return;
    try {
      setScraping(true);
      setScrapeError("");
      const res = await fetch("/api/admin/scrape-og", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput.trim() }),
      });
      const json = await res.json();

      if (json.success && json.data) {
        const { title, imageUrl, description, finalUrl } = json.data;
        setFormData((prev) => ({
          ...prev,
          name: title || prev.name,
          thumbnailUrl: imageUrl || prev.thumbnailUrl,
          bookingUrl: finalUrl || urlInput.trim(),
          editorNote: prev.editorNote || description || "",
        }));
      } else {
        setScrapeError(json.error || "메타데이터를 가져오지 못했습니다.");
      }
    } catch (e: unknown) {
      setScrapeError(e instanceof Error ? e.message : "오류 발생");
    } finally {
      setScraping(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert("장소명은 필수입니다.");
      return;
    }

    const features = featuresInput
      ? featuresInput.split(",").map((f) => f.trim()).filter(Boolean)
      : formData.features || [];

    const regDef = SELF_SNAP_REGIONS.find((r) => r.id === formData.region);
    const regionLabel = regDef ? regDef.label : "서울";

    try {
      const res = await fetch("/api/admin/self-snap/venues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          features,
          regionLabel,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setVenues(json.data);
        setUrlInput("");
        setFormData({
          name: "",
          category: "studio",
          region: "seoul_east",
          regionLabel: "서울 성수/한남",
          address: "",
          thumbnailUrl: "",
          features: ["자연광", "주차 가능"],
          priceInfo: "",
          bestTimeTip: "",
          editorNote: "",
          bookingUrl: "",
          mapUrl: "",
          isAffiliate: false,
        });
        setFeaturesInput("자연광, 화이트 호리존, 소품 완비");
        alert("✅ 셀프스냅 장소가 등록되었습니다!");
      }
    } catch (err) {
      console.error(err);
      alert("등록 실패");
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= venues.length) return;

    const copy = [...venues];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;

    setVenues(copy);
    await fetch("/api/admin/self-snap/venues", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: copy }),
    });
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`'${name}' 장소를 삭제하시겠습니까?`)) return;
    try {
      const res = await fetch(`/api/admin/self-snap/venues?id=${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setVenues(json.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="admin-overview-header">
        <div>
          <h1 className="admin-title-main">셀프스냅 스튜디오 & 장소 관리</h1>
          <p className="admin-subtitle">
            자연광 렌탈 스튜디오, 호텔, 야외 노을 인생샷 명소를 등록하고 관리합니다.
          </p>
        </div>
        <div className="admin-actions-group">
          <Link href="/self-snap" target="_blank" className="admin-btn admin-btn-secondary">
            <span>사용자 화면 보기</span>
            <ArrowSquareOut size={16} />
          </Link>
        </div>
      </div>

      {/* Single Add Form */}
      <div className="admin-card" style={{ marginBottom: "32px" }}>
        <h2 className="admin-card-title">
          <span>새 스튜디오 / 장소 등록</span>
        </h2>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", fontSize: "13px", fontWeight: 700, marginBottom: "6px" }}>
            📎 장소 웹사이트 / 예약 페이지 / 플레이스 URL 입력 (선택)
          </label>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="예: https://spacecloud.kr/... 또는 스튜디오 웹사이트"
              style={{
                flex: 1,
                height: "44px",
                padding: "0 14px",
                borderRadius: "10px",
                border: "1px solid var(--line)",
                background: "#ffffff",
                fontSize: "13px",
              }}
            />
            <button
              type="button"
              className="admin-btn admin-btn-primary"
              onClick={handleScrape}
              disabled={scraping || !urlInput.trim()}
            >
              <LinkSimple size={16} weight="bold" />
              <span>{scraping ? "정보 수집 중..." : "링크 정보 가져오기"}</span>
            </button>
          </div>
          {scrapeError && (
            <p style={{ color: "#b8543f", fontSize: "12px", marginTop: "6px" }}>
              <WarningCircle size={14} style={{ display: "inline", verticalAlign: "middle" }} /> {scrapeError}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: "24px", marginBottom: "20px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>
                대표 사진 미리보기
              </label>
              <div
                style={{
                  width: "180px",
                  height: "120px",
                  borderRadius: "12px",
                  background: "#e8e4dc",
                  overflow: "hidden",
                  border: "1px solid var(--line)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {formData.thumbnailUrl ? (
                  <img
                    src={formData.thumbnailUrl}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <span style={{ fontSize: "11px", color: "var(--muted)" }}>사진 없음</span>
                )}
              </div>
              <input
                type="text"
                placeholder="이미지 URL 직접 입력"
                value={formData.thumbnailUrl || ""}
                onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                style={{
                  width: "100%",
                  height: "32px",
                  padding: "0 8px",
                  borderRadius: "6px",
                  border: "1px solid var(--line)",
                  fontSize: "11px",
                  marginTop: "6px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>
                  장소명 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="예: 스튜디오 르블랑 성수점"
                  style={{
                    width: "100%",
                    height: "38px",
                    padding: "0 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--line)",
                    fontSize: "13px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>
                  장소 분류 *
                </label>
                <select
                  value={formData.category || "studio"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value as SelfSnapVenue["category"],
                    })
                  }
                  style={{
                    width: "100%",
                    height: "38px",
                    padding: "0 10px",
                    borderRadius: "8px",
                    border: "1px solid var(--line)",
                    fontSize: "12px",
                    background: "#ffffff",
                  }}
                >
                  {SELF_SNAP_VENUE_CATEGORIES.filter((c) => c.id !== "all").map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>
                  지역 선택 *
                </label>
                <select
                  value={formData.region || "seoul_east"}
                  onChange={(e) =>
                    setFormData({ ...formData, region: e.target.value as SelfSnapRegion })
                  }
                  style={{
                    width: "100%",
                    height: "38px",
                    padding: "0 10px",
                    borderRadius: "8px",
                    border: "1px solid var(--line)",
                    fontSize: "12px",
                    background: "#ffffff",
                  }}
                >
                  {SELF_SNAP_REGIONS.filter((r) => r.id !== "all").map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>
                  대관료 / 비용 안내 (선택)
                </label>
                <input
                  type="text"
                  value={formData.priceInfo || ""}
                  onChange={(e) => setFormData({ ...formData, priceInfo: e.target.value })}
                  placeholder="예: 시간당 40,000원, 무료 대관"
                  style={{
                    width: "100%",
                    height: "38px",
                    padding: "0 10px",
                    borderRadius: "8px",
                    border: "1px solid var(--line)",
                    fontSize: "12px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>
                  에디터 추천 코멘트 & 공간 특징 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.editorNote || ""}
                  onChange={(e) => setFormData({ ...formData, editorNote: e.target.value })}
                  placeholder="예: 통창 자연광과 감각적인 앤틱 가구의 조화로 셀프스냅에 최적화된 공간"
                  style={{
                    width: "100%",
                    height: "38px",
                    padding: "0 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--line)",
                    fontSize: "12px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>
                  추천 시간대 & 꿀팁 (선택)
                </label>
                <input
                  type="text"
                  value={formData.bestTimeTip || ""}
                  onChange={(e) => setFormData({ ...formData, bestTimeTip: e.target.value })}
                  placeholder="예: 오후 2~5시 자연광이 가장 예뻐요."
                  style={{
                    width: "100%",
                    height: "38px",
                    padding: "0 10px",
                    borderRadius: "8px",
                    border: "1px solid var(--line)",
                    fontSize: "12px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>
                  특징 태그 (쉼표 구분)
                </label>
                <input
                  type="text"
                  value={featuresInput}
                  onChange={(e) => setFeaturesInput(e.target.value)}
                  placeholder="자연광, 호리존, 주차 가능, 소품 완비"
                  style={{
                    width: "100%",
                    height: "38px",
                    padding: "0 10px",
                    borderRadius: "8px",
                    border: "1px solid var(--line)",
                    fontSize: "12px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>
                  예약 / 대관 링크 (선택)
                </label>
                <input
                  type="text"
                  value={formData.bookingUrl || ""}
                  onChange={(e) => setFormData({ ...formData, bookingUrl: e.target.value })}
                  placeholder="https://..."
                  style={{
                    width: "100%",
                    height: "38px",
                    padding: "0 10px",
                    borderRadius: "8px",
                    border: "1px solid var(--line)",
                    fontSize: "12px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>
                  지도 길찾기 링크 (선택)
                </label>
                <input
                  type="text"
                  value={formData.mapUrl || ""}
                  onChange={(e) => setFormData({ ...formData, mapUrl: e.target.value })}
                  placeholder="https://map.naver.com/..."
                  style={{
                    width: "100%",
                    height: "38px",
                    padding: "0 10px",
                    borderRadius: "8px",
                    border: "1px solid var(--line)",
                    fontSize: "12px",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "20px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={formData.isAffiliate ?? false}
                onChange={(e) => setFormData({ ...formData, isAffiliate: e.target.checked })}
              />
              <span>💰 예약 어필리에이트 제휴 링크</span>
            </label>
          </div>

          <button type="submit" className="admin-btn admin-btn-primary" style={{ width: "100%", height: "46px" }}>
            <PlusCircle size={18} weight="bold" />
            <span>스튜디오 / 장소 등록하기</span>
          </button>
        </form>
      </div>

      {/* Venues Table */}
      <div className="admin-card">
        <div className="admin-card-title">
          <span>등록된 스튜디오 & 장소 목록 (총 {venues.length}개)</span>
        </div>

        {loading ? (
          <p>로딩 중...</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: "60px" }}>순서</th>
                  <th style={{ width: "80px" }}>사진</th>
                  <th>장소명 / 분류</th>
                  <th>지역</th>
                  <th>대관료 / 비용</th>
                  <th>특징</th>
                  <th style={{ width: "100px" }}>관리</th>
                </tr>
              </thead>
              <tbody>
                {venues.map((venue, idx) => (
                  <tr key={venue.id}>
                    <td>
                      <div style={{ display: "flex", gap: "2px" }}>
                        <button
                          type="button"
                          onClick={() => handleMove(idx, "up")}
                          disabled={idx === 0}
                          style={{ border: "none", background: "none", cursor: "pointer", opacity: idx === 0 ? 0.3 : 1 }}
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMove(idx, "down")}
                          disabled={idx === venues.length - 1}
                          style={{
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                            opacity: idx === venues.length - 1 ? 0.3 : 1,
                          }}
                        >
                          <ArrowDown size={14} />
                        </button>
                      </div>
                    </td>
                    <td>
                      <img
                        src={venue.thumbnailUrl || "/viewdding-hero-v48.png"}
                        alt=""
                        referrerPolicy="no-referrer"
                        style={{ width: "64px", height: "40px", objectFit: "cover", borderRadius: "6px" }}
                      />
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: "var(--ink)" }}>{venue.name}</div>
                      <span className="sponsored-pill" style={{ background: "#4f5e50", marginTop: "4px" }}>
                        {SELF_SNAP_VENUE_CATEGORIES.find((c) => c.id === venue.category)?.label || venue.category}
                      </span>
                    </td>
                    <td>{venue.regionLabel}</td>
                    <td>{venue.priceInfo || "정보 없음"}</td>
                    <td>
                      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                        {venue.features?.slice(0, 2).map((feat, i) => (
                          <span key={i} style={{ fontSize: "10.5px", background: "#eeece6", padding: "2px 5px", borderRadius: "4px" }}>
                            {feat}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "6px" }}>
                        {venue.bookingUrl && (
                          <a
                            href={venue.bookingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="pitch-btn"
                            title="예약처 열기"
                          >
                            <ArrowSquareOut size={13} />
                          </a>
                        )}
                        <button
                          type="button"
                          className="pitch-btn"
                          style={{ color: "#b8543f" }}
                          onClick={() => handleDelete(venue.id, venue.name)}
                          title="삭제"
                        >
                          <Trash size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
