interface Props {
  label: string;
  color: string;
  onChange: (color: string) => void;
  /** 읽기 전용 */
  readOnly?: boolean;
}

/** 컬러 스와치 + 피커 조합 */
export default function ColorPickerInput({ label, color, onChange, readOnly }: Props) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-8 h-8 rounded-lg border-2 border-gray-200 flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      {!readOnly ? (
        <input
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer border-0 p-0"
          title={`${label} 색상 변경`}
        />
      ) : null}
      <div className="flex-1 min-w-0">
        <div className="text-xs text-gray-600 truncate">{label}</div>
        <div className="text-[11px] text-gray-400 font-mono">{color}</div>
      </div>
    </div>
  );
}
