"use client";

import { useState } from "react";

export function PitchDeckSimulator({
  currentLeads,
  defaultFee = 300000,
}: {
  currentLeads: number;
  defaultFee?: number;
}) {
  const [adFee, setAdFee] = useState(defaultFee);
  const [multiplier, setMultiplier] = useState(3.5);

  const projectedLeads = Math.round(currentLeads * multiplier);
  const effectiveCpc = projectedLeads > 0 ? Math.round(adFee / projectedLeads) : 0;
  const marketValue = projectedLeads * 1200; // Average Instagram sponsored click value (1,200 KRW)
  const savings = Math.max(0, marketValue - adFee);

  return (
    <div className="pitch-simulation-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#34d399", display: "flex", alignItems: "center", gap: "8px" }}>
          <span>✨</span> 최상단 스폰서십(광고) 집행 시 예상 ROI 시뮬레이션
        </h3>
        <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>상단 1~3위 고정 노출 기준</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "20px" }}>
        <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: "16px", borderRadius: "10px" }}>
          <p style={{ margin: "0 0 6px 0", fontSize: "0.8rem", color: "#94a3b8" }}>현재 일반 노출 유입</p>
          <p style={{ margin: 0, fontSize: "1.4rem", fontWeight: 800, color: "#cbd5e1" }}>
            월 {currentLeads.toLocaleString()} <span style={{ fontSize: "0.9rem" }}>명</span>
          </p>
        </div>

        <div style={{ background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(52, 211, 153, 0.4)", padding: "16px", borderRadius: "10px" }}>
          <p style={{ margin: "0 0 6px 0", fontSize: "0.8rem", color: "#6ee7b7" }}>스폰서십 집행 시 예상 유입</p>
          <p style={{ margin: 0, fontSize: "1.6rem", fontWeight: 900, color: "#34d399" }}>
            월 {projectedLeads.toLocaleString()} <span style={{ fontSize: "0.9rem" }}>명 (약 {multiplier}배 ↑)</span>
          </p>
        </div>

        <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: "16px", borderRadius: "10px" }}>
          <p style={{ margin: "0 0 6px 0", fontSize: "0.8rem", color: "#94a3b8" }}>예상 유효 고객 획득단가 (eCPC)</p>
          <p style={{ margin: 0, fontSize: "1.4rem", fontWeight: 800, color: "#38bdf8" }}>
            건당 {effectiveCpc.toLocaleString()} <span style={{ fontSize: "0.9rem" }}>원</span>
          </p>
        </div>
      </div>

      <div style={{ background: "rgba(0, 0, 0, 0.3)", padding: "14px 18px", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <span style={{ fontSize: "0.85rem", color: "#cbd5e1" }}>
            인스타그램 스폰서 광고(건당 1,200원 기준) 대비 <strong>월 {savings.toLocaleString()}원 상당의 마케팅 비용 절감 효과</strong>
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>예상 광고비:</span>
          <strong style={{ fontSize: "1.1rem", color: "#f8fafc" }}>{(adFee / 10000).toLocaleString()}만 원/월</strong>
        </div>
      </div>
    </div>
  );
}

export function PrintReportButton() {
  return (
    <button
      type="button"
      className="admin-btn admin-btn-primary no-print"
      onClick={() => window.print()}
    >
      🖨️ PDF 저장 / 인쇄하기
    </button>
  );
}
