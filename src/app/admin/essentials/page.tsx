"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowSquareOut,
  ArrowUp,
  CheckCircle,
  LinkSimple,
  PlusCircle,
  Sparkle,
  Trash,
  WarningCircle,
} from "@phosphor-icons/react";
import {
  ESSENTIAL_STAGES,
  ESSENTIAL_CATEGORIES,
  type WeddingEssentialItem,
  type EssentialCategory,
} from "@/domain/essentials-types";

export default function AdminEssentialsPage() {
  const [items, setItems] = useState<WeddingEssentialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"single" | "batch">("single");

  // Single item form state
  const [urlInput, setUrlInput] = useState("");
  const [scraping, setScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState("");
  const [formData, setFormData] = useState<Partial<WeddingEssentialItem>>({
    name: "",
    brand: "",
    priceText: "",
    thumbnailUrl: "",
    affiliateUrl: "",
    platform: "naver",
    stages: ["studio_snap"],
    category: "innerwear",
    editorNote: "",
    tips: "",
    tags: [],
    isAffiliate: true,
    isMustHave: false,
  });
  const [tagsInput, setTagsInput] = useState("");

  // Batch item form state
  const [batchUrls, setBatchUrls] = useState("");
  const [batchScraping, setBatchScraping] = useState(false);
  const [batchResults, setBatchResults] = useState<Partial<WeddingEssentialItem>[]>([]);
  const [batchStages, setBatchStages] = useState<string[]>(["studio_snap"]);
  const [batchCategory, setBatchCategory] = useState<EssentialCategory>("innerwear");
  const [batchIsAffiliate, setBatchIsAffiliate] = useState(true);

  // Load items on mount
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/essentials");
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

  // Single URL Scrape
  const handleScrapeSingle = async () => {
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
        setScrapeError(json.error || "메타데이터를 가져오지 못했습니다. 직접 입력해주세요.");
      }
    } catch (e: unknown) {
      setScrapeError(e instanceof Error ? e.message : "스크래핑 중 오류가 발생했습니다.");
    } finally {
      setScraping(false);
    }
  };

  // Single Item Submit
  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.affiliateUrl) {
      alert("상품명과 URL은 필수입니다.");
      return;
    }

    const tags = tagsInput
      ? tagsInput.split(",").map((t) => t.trim().startsWith("#") ? t.trim() : `#${t.trim()}`).filter(Boolean)
      : formData.tags || [];

    try {
      const res = await fetch("/api/admin/essentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          tags,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setItems(json.data);
        // Reset form
        setUrlInput("");
        setFormData({
          name: "",
          brand: "",
          priceText: "",
          thumbnailUrl: "",
          affiliateUrl: "",
          platform: "naver",
          stages: ["studio_snap"],
          category: "innerwear",
          editorNote: "",
          tips: "",
          tags: [],
          isAffiliate: true,
          isMustHave: false,
        });
        setTagsInput("");
        alert("✅ 상품이 성공적으로 등록되었습니다!");
      }
    } catch (err) {
      console.error(err);
      alert("등록 실패: 네트워크 오류");
    }
  };

  // Batch URLs Scrape
  const handleBatchScrape = async () => {
    const lines = batchUrls
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.startsWith("http://") || l.startsWith("https://"));

    if (lines.length === 0) {
      alert("유효한 http/https 링크를 최소 1개 이상 입력해주세요.");
      return;
    }

    setBatchScraping(true);
    const results: Partial<WeddingEssentialItem>[] = [];

    for (const url of lines) {
      try {
        const res = await fetch("/api/admin/scrape-og", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
        const json = await res.json();
        if (json.success && json.data) {
          results.push({
            name: json.data.title || "상품명 미확인",
            thumbnailUrl: json.data.imageUrl || "/viewdding-hero-v48.png",
            affiliateUrl: json.data.finalUrl || url,
            platform: json.data.platform || "other",
            editorNote: json.data.description || "추천 필수 준비물입니다.",
            stages: batchStages,
            category: batchCategory,
            isAffiliate: batchIsAffiliate,
            tags: ["#결혼준비", "#필수템"],
          });
        } else {
          results.push({
            name: "상품명 직접 입력 필요",
            thumbnailUrl: "/viewdding-hero-v48.png",
            affiliateUrl: url,
            platform: "other",
            editorNote: "추천 필수 준비물입니다.",
            stages: batchStages,
            category: batchCategory,
            isAffiliate: batchIsAffiliate,
            tags: ["#결혼준비"],
          });
        }
      } catch {
        results.push({
          name: "오류 발생 URL",
          thumbnailUrl: "/viewdding-hero-v48.png",
          affiliateUrl: url,
          platform: "other",
          editorNote: "추천 준비물입니다.",
          stages: batchStages,
          category: batchCategory,
          isAffiliate: batchIsAffiliate,
          tags: ["#결혼준비"],
        });
      }
    }

    setBatchResults(results);
    setBatchScraping(false);
  };

  // Batch Submit
  const handleBatchSubmit = async () => {
    if (batchResults.length === 0) return;
    try {
      const res = await fetch("/api/admin/essentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: batchResults }),
      });
      const json = await res.json();
      if (json.success) {
        setItems(json.data);
        setBatchUrls("");
        setBatchResults([]);
        alert(`✅ 총 ${json.addedCount}개 상품이 일괄 등록되었습니다!`);
      }
    } catch (err) {
      console.error(err);
      alert("일괄 등록 실패");
    }
  };

  // Reorder items
  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;

    const copy = [...items];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;

    setItems(copy);
    await fetch("/api/admin/essentials", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: copy }),
    });
  };

  // Delete item
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`'${name}' 상품을 정말 삭제하시겠습니까?`)) return;
    try {
      const res = await fetch(`/api/admin/essentials?id=${id}`, {
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

  // Toggle stage selection for single item
  const handleToggleStage = (stageId: string) => {
    setFormData((prev) => {
      const current = prev.stages || [];
      const next = current.includes(stageId)
        ? current.filter((s) => s !== stageId)
        : [...current, stageId];
      return { ...prev, stages: next };
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="admin-overview-header">
        <div>
          <h1 className="admin-title-main">결혼 준비물(Essentials) 관리</h1>
          <p className="admin-subtitle">
            URL을 입력하면 상품 사진과 제목을 1초 만에 자동 수집하여 등록합니다. (단건 & 대량 일괄 등록 지원)
          </p>
        </div>
        <div className="admin-actions-group">
          <Link href="/essentials" target="_blank" className="admin-btn admin-btn-secondary">
            <span>실제 사용자 화면 보기</span>
            <ArrowSquareOut size={16} />
          </Link>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        <button
          type="button"
          className={`admin-btn ${mode === "single" ? "admin-btn-primary" : "admin-btn-secondary"}`}
          onClick={() => setMode("single")}
        >
          <PlusCircle size={16} weight="bold" />
          <span>단건 빠른 등록 (URL 자동 완성)</span>
        </button>
        <button
          type="button"
          className={`admin-btn ${mode === "batch" ? "admin-btn-primary" : "admin-btn-secondary"}`}
          onClick={() => setMode("batch")}
        >
          <Sparkle size={16} weight="bold" />
          <span>대량 일괄 등록 (Batch Mode)</span>
        </button>
      </div>

      {/* 1. Single Item Registration Form */}
      {mode === "single" && (
        <div className="admin-card" style={{ marginBottom: "32px" }}>
          <h2 className="admin-card-title">
            <span>새 준비물 아이템 등록</span>
          </h2>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 700, marginBottom: "6px" }}>
              📎 구매 / 제휴 링크 (URL) 입력
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="예: https://brand.naver.com/anvely/products/... 또는 https://naver.me/..."
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
                onClick={handleScrapeSingle}
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

          <form onSubmit={handleSingleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: "24px", marginBottom: "20px" }}>
              {/* Thumbnail Preview */}
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

              {/* Text Fields */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>
                    상품명 *
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
                    브랜드 / 판매처
                  </label>
                  <input
                    type="text"
                    value={formData.brand || ""}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="예: 도로시와, 앙블리, 유니클로"
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
                    가격 (선택)
                  </label>
                  <input
                    type="text"
                    value={formData.priceText || ""}
                    onChange={(e) => setFormData({ ...formData, priceText: e.target.value })}
                    placeholder="예: 19,800원, 2만원대"
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
                    에디터 추천 이유 (인포크 카드 2줄 노출) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.editorNote || ""}
                    onChange={(e) => setFormData({ ...formData, editorNote: e.target.value })}
                    placeholder="예: 머메이드 드레스 라인을 완벽하게 정리해주는 필수 속바지"
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
                    실전 활용 팁 (선택)
                  </label>
                  <input
                    type="text"
                    value={formData.tips || ""}
                    onChange={(e) => setFormData({ ...formData, tips: e.target.value })}
                    placeholder="예: 촬영 전날 착용해보고 핏을 미리 체크해두면 당일 편해요."
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
                    품목 카테고리
                  </label>
                  <select
                    value={formData.category || "innerwear"}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as EssentialCategory })}
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
                    {ESSENTIAL_CATEGORIES.filter((c) => c.id !== "all").map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>
                    태그 (쉼표로 구분)
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="예: #골반볼륨, #머메이드, #심리스"
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

            {/* Stages Checkboxes & Options */}
            <div
              style={{
                background: "#f4f1eb",
                padding: "16px",
                borderRadius: "12px",
                marginBottom: "20px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              <div>
                <span style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "8px" }}>
                  적용 결혼 단계 (복수 선택 가능)
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {ESSENTIAL_STAGES.filter((s) => s.id !== "all").map((stage) => {
                    const isChecked = formData.stages?.includes(stage.id);
                    return (
                      <button
                        key={stage.id}
                        type="button"
                        onClick={() => handleToggleStage(stage.id)}
                        className={`admin-btn ${isChecked ? "admin-btn-primary" : "admin-btn-secondary"}`}
                        style={{ fontSize: "12px", padding: "6px 12px" }}
                      >
                        {isChecked ? "✓ " : ""}{stage.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <span style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "8px" }}>
                  수익화 및 뱃지 설정
                </span>
                <div style={{ display: "flex", gap: "16px", alignItems: "center", marginTop: "6px" }}>
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
                      checked={formData.isMustHave ?? false}
                      onChange={(e) => setFormData({ ...formData, isMustHave: e.target.checked })}
                    />
                    <span>🔥 필수 준비물 뱃지</span>
                  </label>
                </div>
              </div>
            </div>

            <button type="submit" className="admin-btn admin-btn-primary" style={{ width: "100%", height: "46px" }}>
              <PlusCircle size={18} weight="bold" />
              <span>준비물 상품 등록하기</span>
            </button>
          </form>
        </div>
      )}

      {/* 2. Batch Registration Form */}
      {mode === "batch" && (
        <div className="admin-card" style={{ marginBottom: "32px" }}>
          <h2 className="admin-card-title">
            <span>대량 일괄 등록 (Batch Mode)</span>
          </h2>
          <p style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "14px" }}>
            여러 쇼핑몰 링크를 한 줄에 하나씩 붙여넣으면 한꺼번에 스크래핑하여 검토 후 등록할 수 있습니다.
          </p>

          <textarea
            rows={5}
            value={batchUrls}
            onChange={(e) => setBatchUrls(e.target.value)}
            placeholder="https://brand.naver.com/...&#10;https://dorosiwa.co.kr/...&#10;https://www.uniqlo.com/..."
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid var(--line)",
              fontSize: "13px",
              boxSizing: "border-box",
              marginBottom: "14px",
            }}
          />

          <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "16px", flexWrap: "wrap" }}>
            <label style={{ fontSize: "12px", fontWeight: 700 }}>공통 카테고리:</label>
            <select
              value={batchCategory}
              onChange={(e) => setBatchCategory(e.target.value as EssentialCategory)}
              style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid var(--line)" }}
            >
              {ESSENTIAL_CATEGORIES.filter((c) => c.id !== "all").map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>

            <button
              type="button"
              className="admin-btn admin-btn-primary"
              onClick={handleBatchScrape}
              disabled={batchScraping || !batchUrls.trim()}
            >
              <Sparkle size={16} weight="bold" />
              <span>{batchScraping ? "대량 스크래핑 진행 중..." : "🔍 링크 일괄 정보 수집"}</span>
            </button>
          </div>

          {/* Batch Results Preview Table */}
          {batchResults.length > 0 && (
            <div style={{ marginTop: "20px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "10px" }}>
                수집 결과 검토 ({batchResults.length}개)
              </h3>
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>썸네일</th>
                      <th>상품명</th>
                      <th>플랫폼</th>
                      <th>추천 코멘트</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batchResults.map((res, idx) => (
                      <tr key={idx}>
                        <td>
                          <img
                            src={res.thumbnailUrl || "/viewdding-hero-v48.png"}
                            alt=""
                            style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "6px" }}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={res.name || ""}
                            onChange={(e) => {
                              const copy = [...batchResults];
                              copy[idx].name = e.target.value;
                              setBatchResults(copy);
                            }}
                            style={{ width: "100%", padding: "4px 8px", fontSize: "12px" }}
                          />
                        </td>
                        <td>{res.platform}</td>
                        <td>
                          <input
                            type="text"
                            value={res.editorNote || ""}
                            onChange={(e) => {
                              const copy = [...batchResults];
                              copy[idx].editorNote = e.target.value;
                              setBatchResults(copy);
                            }}
                            style={{ width: "100%", padding: "4px 8px", fontSize: "12px" }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                type="button"
                className="admin-btn admin-btn-primary"
                onClick={handleBatchSubmit}
                style={{ marginTop: "16px", width: "100%", height: "44px" }}
              >
                <CheckCircle size={18} weight="bold" />
                <span>선택된 {batchResults.length}개 상품 일괄 저장하기</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3. Existing Items Management Table */}
      <div className="admin-card">
        <div className="admin-card-title">
          <span>등록된 준비물 목록 (총 {items.length}개)</span>
          <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
            위/아래 버튼으로 사용자 화면의 노출 순서를 변경할 수 있습니다.
          </span>
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
                  <th>상품명 / 브랜드</th>
                  <th>카테고리</th>
                  <th>단계</th>
                  <th>유형</th>
                  <th style={{ width: "120px" }}>관리</th>
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
                      <span className="sponsored-pill" style={{ background: "#4f5e50" }}>
                        {ESSENTIAL_CATEGORIES.find((c) => c.id === item.category)?.label || item.category}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                        {item.stages?.map((s) => (
                          <span key={s} style={{ fontSize: "10.5px", background: "#eeece6", padding: "2px 5px", borderRadius: "4px" }}>
                            {ESSENTIAL_STAGES.find((st) => st.id === s)?.label || s}
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
