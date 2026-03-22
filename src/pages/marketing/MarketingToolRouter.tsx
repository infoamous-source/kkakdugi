import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { marketingTools } from '../../data/marketing/modules';
import { useVisibility } from '../../contexts/VisibilityContext';

// 툴 페이지 import
import GlossaryTool from './tools/GlossaryTool';
import PersonaMakerTool from './tools/PersonaMakerTool';
import USPFinderTool from './tools/USPFinderTool';
import ColorPickerTool from './tools/ColorPickerTool';
import HashtagGeneratorTool from './tools/HashtagGeneratorTool';
import ROICalculatorTool from './tools/ROICalculatorTool';
import KCopywriterTool from './tools/KCopywriterTool';
import SNSAdMakerTool from './tools/SNSAdMakerTool';

const toolComponents: Record<string, React.ComponentType> = {
  'glossary': GlossaryTool,
  'persona-maker': PersonaMakerTool,
  'usp-finder': USPFinderTool,
  'color-picker': ColorPickerTool,
  'hashtag-generator': HashtagGeneratorTool,
  'roi-calculator': ROICalculatorTool,
  'k-copywriter': KCopywriterTool,
  'sns-ad-maker': SNSAdMakerTool,
};

export default function MarketingToolRouter() {
  const { toolId } = useParams<{ toolId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const { isToolVisible } = useVisibility();

  const tool = marketingTools.find((tl) => tl.id === toolId);

  // OFF된 툴에 직접 접근 시 리다이렉트
  if (tool && !isToolVisible('marketing', tool.id)) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500 text-lg">{t('admin.contentManager.toolDisabled', '이 도구는 현재 사용할 수 없습니다.')}</p>
        <button
          onClick={() => navigate('/marketing')}
          className="mt-4 text-blue-600 hover:underline"
        >
          {t('marketing.moduleDetail.backToMarketing', '마케팅 홈으로 돌아가기')}
        </button>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500 text-lg">도구를 찾을 수 없습니다.</p>
        <button
          onClick={() => navigate('/marketing')}
          className="mt-4 text-blue-600 hover:underline"
        >
          마케팅 홈으로 돌아가기
        </button>
      </div>
    );
  }

  const ToolComponent = toolComponents[toolId || ''];
  if (ToolComponent) return <ToolComponent />;

  // 혹시 매핑 안 된 툴이 있을 경우
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-center">
      <p className="text-gray-500 text-lg">이 도구는 아직 준비 중이에요.</p>
      <button
        onClick={() => navigate('/marketing')}
        className="mt-4 text-blue-600 hover:underline"
      >
        마케팅 홈으로 돌아가기
      </button>
    </div>
  );
}
