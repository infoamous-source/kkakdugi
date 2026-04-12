/**
 * PDF 내보내기 유틸
 *
 * html2canvas + jsPDF 조합으로 DOM 요소를 PDF로 변환한다.
 * 한국어 폰트 문제를 회피하기 위해 html2canvas로 이미지를 먼저 캡처한 뒤
 * jsPDF에 이미지로 삽입하는 방식을 사용한다.
 *
 * 사용 예:
 *   const ref = useRef<HTMLDivElement>(null);
 *   exportToPdf(ref.current!, '자기소개서_삼성전자.pdf');
 */

export async function exportToPdf(
  element: HTMLElement,
  filename: string,
  options?: {
    /** 배경색 (기본: 흰색) */
    backgroundColor?: string;
    /** 스케일 (기본: 2, 레티나 대응) */
    scale?: number;
    /** A4 페이지 여백 mm (기본: 10) */
    margin?: number;
  },
): Promise<void> {
  const { default: html2canvas } = await import('html2canvas');
  const { jsPDF } = await import('jspdf');

  const {
    backgroundColor = '#ffffff',
    scale = 2,
    margin = 10,
  } = options ?? {};

  // 1. DOM → 캔버스
  const canvas = await html2canvas(element, {
    scale,
    backgroundColor,
    useCORS: true,
    logging: false,
  });

  // 2. 캔버스 → 이미지
  const imgData = canvas.toDataURL('image/png');
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;

  // 3. A4 사이즈 계산 (mm)
  const a4Width = 210;
  const a4Height = 297;
  const printWidth = a4Width - margin * 2;
  const printHeight = (imgHeight * printWidth) / imgWidth;

  // 4. jsPDF 생성 (필요 시 여러 페이지)
  const doc = new jsPDF({
    orientation: printHeight > a4Height ? 'portrait' : 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  let remainingHeight = printHeight;
  let sourceY = 0;
  let pageNum = 0;

  while (remainingHeight > 0) {
    if (pageNum > 0) doc.addPage();

    const pageHeight = a4Height - margin * 2;
    const sliceHeight = Math.min(remainingHeight, pageHeight);

    // 원본 이미지에서 해당 페이지 영역 자르기
    const sliceCanvas = document.createElement('canvas');
    sliceCanvas.width = imgWidth;
    sliceCanvas.height = Math.ceil((sliceHeight / printWidth) * imgWidth);

    const ctx = sliceCanvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(
        canvas,
        0,
        sourceY,
        imgWidth,
        sliceCanvas.height,
        0,
        0,
        imgWidth,
        sliceCanvas.height,
      );
    }

    const sliceImg = sliceCanvas.toDataURL('image/png');
    doc.addImage(sliceImg, 'PNG', margin, margin, printWidth, sliceHeight);

    sourceY += sliceCanvas.height;
    remainingHeight -= sliceHeight;
    pageNum++;

    // 무한루프 방지
    if (pageNum > 20) break;
  }

  doc.save(filename);
}
