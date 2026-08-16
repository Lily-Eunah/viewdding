"use client";

import { useState } from "react";
import { ArrowSquareOut, Check, Heart } from "@phosphor-icons/react";
import { trackOutboundClick } from "@/lib/analytics-client";

export interface CurationCardProps {
  id: string;
  name: string;
  brand: string;
  priceText?: string;
  thumbnailUrl: string;
  affiliateUrl: string;
  platform?: string;
  editorNote: string;
  tips?: string;
  tags?: string[];
  isAffiliate?: boolean;
  isMustHave?: boolean;
  isPopular?: boolean;
  showCheckbox?: boolean;
  isChecked?: boolean;
  onToggleCheck?: (id: string) => void;
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
  categoryLabel?: string;
}

function getPlatformName(platform?: string, url?: string): string {
  if (platform === "naver") return "네이버";
  if (platform === "coupang") return "쿠팡";
  if (platform === "oliveyoung") return "올리브영";
  if (platform === "dorosiwa") return "도로시와";
  if (platform === "uniqlo") return "유니클로";
  if (platform === "ably") return "에이블리";
  if (platform === "zigzag") return "지그재그";
  if (platform === "brand") return "공식몰";
  if (url?.includes("naver.com") || url?.includes("naver.me")) return "네이버";
  if (url?.includes("coupang.com")) return "쿠팡";
  if (url?.includes("oliveyoung.co.kr")) return "올리브영";
  return "구매처";
}

export function CurationCard({
  id,
  name,
  brand,
  priceText,
  thumbnailUrl,
  affiliateUrl,
  platform,
  editorNote,
  tips,
  tags,
  isAffiliate = true,
  isMustHave = false,
  isPopular = false,
  showCheckbox = false,
  isChecked = false,
  onToggleCheck,
  isSaved = false,
  onToggleSave,
  categoryLabel,
}: CurationCardProps) {
  const [imgError, setImgError] = useState(false);
  const [saved, setSaved] = useState(isSaved);
  const platformLabel = getPlatformName(platform, affiliateUrl);

  const handleClickLink = () => {
    trackOutboundClick({
      vendorId: id,
      vendorName: name,
      targetType: "website",
      targetUrl: affiliateUrl,
      category: "essentials",
    });
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextSaved = !saved;
    setSaved(nextSaved);
    if (onToggleSave) {
      onToggleSave(id);
    }
  };

  const handleCheckClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleCheck) {
      onToggleCheck(id);
    }
  };

  return (
    <article className={`inpock-curation-card ${isChecked ? "is-checked" : ""}`}>
      {/* 썸네일 이미지 & 상단 뱃지 */}
      <div className="inpock-card-image-wrap">
        <img
          src={
            imgError || !thumbnailUrl
              ? "/viewdding-hero-v48.png"
              : thumbnailUrl
          }
          alt={name}
          className="inpock-card-image"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
        />

        {/* 상단 뱃지 영역 */}
        <div className="inpock-card-badges">
          {isMustHave && <span className="inpock-badge must-have">필수템</span>}
          {isPopular && <span className="inpock-badge popular">인기</span>}
          {categoryLabel && <span className="inpock-badge category">{categoryLabel}</span>}
        </div>

        {/* 체크리스트 모드 체크 버튼 */}
        {showCheckbox && (
          <button
            type="button"
            className={`inpock-check-btn ${isChecked ? "checked" : ""}`}
            onClick={handleCheckClick}
            aria-label={isChecked ? "준비 완료 취소" : "준비 완료 체크"}
          >
            <Check size={16} weight="bold" />
          </button>
        )}

        {/* 찜하기 버튼 */}
        <button
          type="button"
          className={`inpock-heart-btn ${saved ? "saved" : ""}`}
          onClick={handleSaveClick}
          aria-label={saved ? "저장 해제" : "저장하기"}
        >
          <Heart size={18} weight={saved ? "fill" : "regular"} />
        </button>
      </div>

      {/* 카드 텍스트 콘텐츠 */}
      <div className="inpock-card-content">
        <div className="inpock-brand-row">
          <span className="inpock-brand-name">{brand}</span>
          {priceText && <span className="inpock-price">{priceText}</span>}
        </div>

        <h3 className="inpock-item-title" title={name}>
          {name}
        </h3>

        <p className="inpock-editor-note">{editorNote}</p>

        {tips && (
          <div className="inpock-tip-box">
            <span className="inpock-tip-icon">💡</span>
            <span className="inpock-tip-text">{tips}</span>
          </div>
        )}

        {tags && tags.length > 0 && (
          <div className="inpock-tag-row">
            {tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="inpock-tag">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* 구매 / 상품 보러가기 버튼 */}
        <div className="inpock-action-row">
          <a
            href={affiliateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inpock-link-btn"
            onClick={handleClickLink}
          >
            <span className="platform-tag">{platformLabel}</span>
            <span className="btn-label">상품 보러가기</span>
            <ArrowSquareOut size={15} weight="bold" />
          </a>
        </div>
      </div>
    </article>
  );
}
