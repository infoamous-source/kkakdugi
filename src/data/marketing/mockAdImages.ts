// SNS 광고 메이커 Mock 이미지 데이터 (Gemini Image API 연동 전 사용)

// Mock 이미지는 SVG data URI로 생성 (외부 이미지 없이 동작)
export function getMockAdImage(subject: string, style: string): string {
  const colors = getStyleColors(style);

  // SVG로 간단한 Mock 이미지 생성
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.bg1}" />
          <stop offset="100%" style="stop-color:${colors.bg2}" />
        </linearGradient>
      </defs>
      <rect width="1080" height="1080" fill="url(#bg)" />
      <text x="540" y="480" font-family="Arial, sans-serif" font-size="48" fill="${colors.text}" text-anchor="middle" font-weight="bold">
        ${escapeXml(subject || 'Your Product')}
      </text>
      <text x="540" y="560" font-family="Arial, sans-serif" font-size="28" fill="${colors.subtext}" text-anchor="middle">
        AI Generated Image Preview
      </text>
      <text x="540" y="620" font-family="Arial, sans-serif" font-size="22" fill="${colors.subtext}" text-anchor="middle" opacity="0.6">
        (Gemini API 연동 시 실제 이미지가 생성됩니다)
      </text>
      <rect x="390" y="700" width="300" height="60" rx="30" fill="${colors.accent}" opacity="0.8" />
      <text x="540" y="738" font-family="Arial, sans-serif" font-size="22" fill="white" text-anchor="middle">
        ${style.toUpperCase()} Style
      </text>
    </svg>
  `.trim();

  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function getStyleColors(style: string): {
  bg1: string;
  bg2: string;
  text: string;
  subtext: string;
  accent: string;
} {
  switch (style) {
    case 'realistic':
      return {
        bg1: '#1a1a2e',
        bg2: '#16213e',
        text: '#ffffff',
        subtext: '#a0aec0',
        accent: '#e2725b',
      };
    case 'illustration':
      return {
        bg1: '#ffecd2',
        bg2: '#fcb69f',
        text: '#2d3748',
        subtext: '#4a5568',
        accent: '#e53e3e',
      };
    case '3d':
      return {
        bg1: '#667eea',
        bg2: '#764ba2',
        text: '#ffffff',
        subtext: '#e2e8f0',
        accent: '#f6e05e',
      };
    case 'popart':
      return {
        bg1: '#ff6b6b',
        bg2: '#feca57',
        text: '#2d3748',
        subtext: '#4a5568',
        accent: '#48dbfb',
      };
    default:
      return {
        bg1: '#e2e8f0',
        bg2: '#cbd5e0',
        text: '#2d3748',
        subtext: '#4a5568',
        accent: '#4299e1',
      };
  }
}
