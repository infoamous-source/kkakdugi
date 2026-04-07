import type { ViralCardSlide } from '../../../../../types/school';

interface Props {
  slide: ViralCardSlide;
  index: number; // 0~3
  productName: string;
  imageUrl: string | null;
  fallbackGradient: string; // e.g. 'linear-gradient(135deg,#FF6B35,#F7931E)'
}

const STEP_BADGE_COLOR = '#FF6B35';

/**
 * 4교시 바이럴카드 — 5가지 레이아웃 템플릿 (A~E)
 * mockup: docs/mockups/viral-card.html AFTER 컬럼
 * - A: 상단 흰 박스 + 하단 이미지
 * - B: 풀이미지 + 하단 검은 그라데이션
 * - C: 풀이미지 + 가운데 큰 글씨 + 브랜드 노출
 * - D: 좌측 컬러박스 + 우측 이미지 + 브랜드 노출
 * - E: 상하 분할 (fallback)
 */
export function ViralCardTemplate({ slide, index, productName, imageUrl, fallbackGradient }: Props) {
  const copyLines = slide.copyText.split('\n');

  const renderCopy = (color: string, fontSize: number) => (
    <div
      style={{
        fontSize,
        fontWeight: 900,
        color,
        lineHeight: 1.1,
        letterSpacing: '-0.5px',
        fontFamily: "'Black Han Sans','Pretendard',sans-serif",
      }}
    >
      {copyLines.map((line, i) => {
        const hi = slide.highlightWord;
        if (hi && line.includes(hi)) {
          const [before, ...rest] = line.split(hi);
          return (
            <div key={i}>
              {before}
              <span style={{ color: '#FBBF24' }}>{hi}</span>
              {rest.join(hi)}
            </div>
          );
        }
        return <div key={i}>{line}</div>;
      })}
    </div>
  );

  const stepBadge = (
    <div
      style={{
        position: 'absolute',
        top: 8,
        left: 8,
        background: STEP_BADGE_COLOR,
        color: '#fff',
        padding: '3px 10px',
        borderRadius: 6,
        fontSize: 10,
        fontWeight: 700,
        zIndex: 2,
      }}
    >
      {index + 1} · {slide.stepKoLabel}
      {slide.showBrand && <span style={{ opacity: 0.7 }}> · 브랜드 ON</span>}
    </div>
  );

  const pexelsCredit = imageUrl && (
    <div
      style={{
        position: 'absolute',
        bottom: 4,
        right: 8,
        fontSize: 8,
        color: 'rgba(255,255,255,.7)',
      }}
    >
      📷 Pexels
    </div>
  );

  const bgImage = imageUrl
    ? { background: `url('${imageUrl}') center/cover` }
    : { background: fallbackGradient };

  // ─── Template A: 상단 흰 박스 + 하단 이미지 ───
  if (slide.template === 'A') {
    return (
      <div
        style={{
          position: 'relative',
          borderRadius: 12,
          overflow: 'hidden',
          aspectRatio: '1',
          background: '#fff',
          border: '1px solid #e5e7eb',
        }}
      >
        {stepBadge}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '55%',
            background: '#fff7ed',
            padding: '18px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          {renderCopy('#7c2d12', 22)}
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '45%',
            ...bgImage,
          }}
        />
        {pexelsCredit}
      </div>
    );
  }

  // ─── Template B: 풀이미지 + 하단 검은 그라데이션 ───
  if (slide.template === 'B') {
    return (
      <div
        style={{
          position: 'relative',
          borderRadius: 12,
          overflow: 'hidden',
          aspectRatio: '1',
          ...bgImage,
        }}
      >
        {stepBadge}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: '55%',
            background: 'linear-gradient(180deg,transparent,rgba(0,0,0,.92))',
            display: 'flex',
            alignItems: 'flex-end',
            padding: 14,
          }}
        >
          <div style={{ textShadow: '0 2px 12px rgba(0,0,0,.6)' }}>
            {renderCopy('#fff', 22)}
          </div>
        </div>
        {pexelsCredit}
      </div>
    );
  }

  // ─── Template C: 풀이미지 + 가운데 큰 글씨 + 브랜드 ───
  if (slide.template === 'C') {
    return (
      <div
        style={{
          position: 'relative',
          borderRadius: 12,
          overflow: 'hidden',
          aspectRatio: '1',
          ...bgImage,
        }}
      >
        {stepBadge}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,.45)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 14,
            textAlign: 'center',
          }}
        >
          {slide.showBrand && (
            <div
              style={{
                background: '#FBBF24',
                color: '#7c2d12',
                padding: '3px 10px',
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 900,
                marginBottom: 8,
                letterSpacing: '0.5px',
              }}
            >
              {productName}
            </div>
          )}
          <div style={{ textShadow: '0 4px 16px rgba(0,0,0,.7)' }}>
            {renderCopy('#fff', 26)}
          </div>
        </div>
        {pexelsCredit}
      </div>
    );
  }

  // ─── Template D: 좌측 컬러박스 + 우측 이미지 + 브랜드 ───
  if (slide.template === 'D') {
    return (
      <div
        style={{
          position: 'relative',
          borderRadius: 12,
          overflow: 'hidden',
          aspectRatio: '1',
          display: 'flex',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 8,
            left: 8,
            background: '#0a0a0a',
            color: '#fff',
            padding: '3px 10px',
            borderRadius: 6,
            fontSize: 10,
            fontWeight: 700,
            zIndex: 3,
          }}
        >
          {index + 1} · {slide.stepKoLabel}
          {slide.showBrand && <span style={{ opacity: 0.7 }}> · 브랜드 ON</span>}
        </div>
        <div
          style={{
            width: '55%',
            background: 'linear-gradient(135deg,#FF6B35,#F7931E)',
            padding: 14,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          {slide.showBrand && (
            <div
              style={{
                background: '#fff',
                color: '#FF6B35',
                display: 'inline-block',
                padding: '3px 8px',
                borderRadius: 5,
                fontSize: 10,
                fontWeight: 800,
                marginBottom: 6,
                width: 'fit-content',
              }}
            >
              {productName}
            </div>
          )}
          {renderCopy('#fff', 20)}
        </div>
        <div
          style={{
            width: '45%',
            ...bgImage,
          }}
        />
        {pexelsCredit}
      </div>
    );
  }

  // ─── Template E: 상하 분할 (fallback) ───
  return (
    <div
      style={{
        position: 'relative',
        borderRadius: 12,
        overflow: 'hidden',
        aspectRatio: '1',
        background: '#fff',
        border: '1px solid #e5e7eb',
      }}
    >
      {stepBadge}
      <div
        style={{
          height: '50%',
          ...bgImage,
        }}
      />
      <div
        style={{
          height: '50%',
          padding: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        {renderCopy('#111', 22)}
      </div>
      {pexelsCredit}
    </div>
  );
}
