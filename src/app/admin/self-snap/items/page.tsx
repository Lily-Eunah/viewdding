"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowSquareOut,
  ArrowUp,
  LinkSimple,
  PlusCircle,
  Sparkle,
  Trash,
  WarningCircle,
} from "@phosphor-icons/react";
import {
  SELF_SNAP_ITEM_CATEGORIES,
  type SelfSnapItem,
  type SelfSnapItemCategory,
} from "@/domain/self-snap-types";

export default function AdminSelfSnapItemsPage() {
  const [items, setItems] = useState<SelfSnapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [urlInput, setUrlInput] = useState("");
  const [scraping, setScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState("");

  const [formData, setFormData] = useState<Partial<SelfSnapItem>>({
    name: "",
    brand: "",
    priceText: "",
    category: "props",
    thumbnailUrl: "",
    affiliateUrl: "",
    platform: "other",
    editorNote: "",
    tips: "",
    moodTags: ["#셀프스냅"],
    isAffiliate: true,
    isPopular: false,
  });
  const [tagsInput, setTagsInput] = useState("");

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/self-snap/items");
      const json = await res.json();
      if (json.success) {
        setItems(json.data);
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
        const { title, imageUrl, description, platform, finalUrl } = json.data;
        setFormData((prev) => ({
          ...prev,
          name: title || prev.name,
          thumbnailUrl: imageUrl || prev.thumbnailUrl,
          affiliateUrl: finalUrl || urlInput.trim(),
          platform: platform || prev.platform,
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
    if (!formData.name || !formData.affiliateUrl) {
      alert("소품명과 URL은 필수입니다.");
      return;
    }

    const moodTags = tagsInput
      ? tagsInput.split(",").map((t) => t.trim().startsWith("#") ? t.trim() : `#${t.trim()}`).filter(Boolean)
      : formData.moodTags || ["#셀프스냅"];

    try {
      const res = await fetch("/api/admin/self-snap/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          moodTags,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setItems(json.data);
        setUrlInput("");
        setFormData({
          name: "",
          brand: "",
          priceText: "",
          category: "props",
          thumbnailUrl: "",
          affiliateUrl: "",
          platform: "other",
          editorNote: "",
          tips: "",
          moodTags: ["#셀프스냅"],
          isAffiliate: true,
          isPopular: false,
        });
        setTagsInput("");
        alert("✅ 셀프스냅 소품이 등록되었습니다!");
      }
    } catch (err) {
      console.error(err);
      alert("등록 실패");
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;

    const copy = [...items];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;

    setItems(copy);
    await fetch("/api/admin/self-snap/items", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: copy }),
    });
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`'${name}' 소품을 삭제하시겠습니까?`)) return;
    try {
      const res = await fetch(`/api/admin/self-snap/items?id=${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setItems(json.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="admin-overview-header">
        <div>
          <h1 className="admin-title-main">셀프스냅 의상 & 소품 관리</h1>
          <p className="admin-subtitle">
            셀프웨딩 드레스, 베일, 부케, 촬영소품, 셋업 수트 등의 상품을 URL 자동 완성으로 등록합니다.
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
          <span>새 셀프스냅 의상/소품 등록</span>
        </h2>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", fontSize: "13px", fontWeight: 700, marginBottom: "6px" }}>
            📎 쇼핑몰 / 제휴 링크 (URL) 입력
          </label>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="예: https://a-bly.com/... 또는 https://smartstore.naver.com/..."
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
                썸네일 미리보기
              </label>
              <div
                style={{
                  width: "180px",
                  height: "180px",
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
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>
                  소품 / 의상 이름 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: "100%",
                    height: "40px",
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
                  카테고리 *
                </label>
                <select
                  value={formData.category || "props"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value as SelfSnapItem["category"],
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
                  {SELF_SNAP_ITEM_CATEGORIES.filter((c) => c.id !== "all").map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>
                  가격 (선택)
                </label>
                <input
                  type="text"
                  value={formData.priceText || ""}
                  onChange={(e) => setFormData({ ...formData, priceText: e.target.value })}
                  placeholder="예: 45,000원, 10만원대"
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
                  에디터 추천 이유 & 스타일링 팁 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.editorNote || ""}
                  onChange={(e) => setFormData({ ...formData, editorNote: e.target.value })}
                  placeholder="예: 바람에 흩날리는 고급스러운 실크 텍스처로 야외 스냅 인생샷 보장"
                  style={{
                    width: "100%",
                    height: "40px",
                    padding: "0 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--line)",
                    fontSize: "13px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>
                  무드 태그 (쉼표 구분)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="예: #제주스냅, #빈티지드레스, #숏베일"
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
                checked={formData.isAffiliate ?? true}
                onChange={(e) => setFormData({ ...formData, isAffiliate: e.target.checked })}
              />
              <span>💰 어필리에이트 제휴 수익 링크</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={formData.isPopular ?? false}
                onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
              />
              <span>✨ 인기 소품 뱃지</span>
            </label>
          </div>

          <button type="submit" className="admin-btn admin-btn-primary" style={{ width: "100%", height: "46px" }}>
            <PlusCircle size={18} weight="bold" />
            <span>셀프스냅 소품 등록하기</span>
          </button>
        </form>
      </div>

      {/* Items Table */}
      <div className="admin-card">
        <div className="admin-card-title">
          <span>등록된 셀프스냅 소품 목록 (총 {items.length}개)</span>
        </div>

        {loading ? (
          <p>로딩 중...</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: "60px" }}>순서</th>
                  <th style={{ width: "70px" }}>사진</th>
                  <th>소품명 / 브랜드</th>
                  <th>카테고리</th>
                  <th>태그</th>
                  <th>유형</th>
                  <th style={{ width: "100px" }}>관리</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={item.id}>
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
                          disabled={idx === items.length - 1}
                          style={{
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                            opacity: idx === items.length - 1 ? 0.3 : 1,
                          }}
                        >
                          <ArrowDown size={14} />
                        </button>
                      </div>
                    </td>
                    <td>
                      <img
                        src={item.thumbnailUrl || "/viewdding-hero-v48.png"}
                        alt=""
                        referrerPolicy="no-referrer"
                        style={{ width: "48px", height: "48px", objectFit: "cover", borderRadius: "8px" }}
                      />
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: "var(--ink)" }}>{item.name}</div>
                      <div style={{ fontSize: "11.5px", color: "var(--muted)" }}>
                        {item.brand} {item.priceText && `· ${item.priceText}`}
                      </div>
                    </td>
                    <td>
                      <span className="sponsored-pill" style={{ background: "#9b7050" }}>
                        {SELF_SNAP_ITEM_CATEGORIES.find((c) => c.id === item.category)?.label || item.category}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                        {item.moodTags?.slice(0, 3).map((tag, i) => (
                          <span key={i} style={{ fontSize: "10.5px", background: "#eeece6", padding: "2px 5px", borderRadius: "4px" }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      {item.isAffiliate ? (
                        <span style={{ fontSize: "11px", color: "#2f684a", fontWeight: 700 }}>💰 제휴</span>
                      ) : (
                        <span style={{ fontSize: "11px", color: "var(--muted)" }}>🫶 큐레이션</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <a
                          href={item.affiliateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="pitch-btn"
                          title="구매처 열기"
                        >
                          <ArrowSquareOut size={13} />
                        </a>
                        <button
                          type="button"
                          className="pitch-btn"
                          style={{ color: "#b8543f" }}
                          onClick={() => handleDelete(item.id, item.name)}
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
