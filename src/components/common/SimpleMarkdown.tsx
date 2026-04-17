import React from 'react';

interface SimpleMarkdownProps {
  content: string;
  className?: string;
  reportStyle?: boolean;
}

type Block =
  | { type: 'paragraph'; text: string }
  | { type: 'ol'; items: string[] }
  | { type: 'ul'; items: string[] };

function parseBold(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function renderInline(text: string): React.ReactNode[] {
  return parseBold(text);
}

function renderLineBreaks(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const result: React.ReactNode[] = [];
  lines.forEach((line, i) => {
    if (line.startsWith('[EN] ')) {
      result.push(
        <span key={`en-${i}`} className="block text-xs text-gray-400 mt-0.5">
          {line.slice(5)}
        </span>
      );
    } else {
      result.push(...renderInline(line));
      if (i < lines.length - 1 && !lines[i + 1]?.startsWith('[EN] ')) {
        result.push(<br key={`br-${i}`} />);
      }
    }
  });
  return result;
}

function parseBlocks(content: string): Block[] {
  const paragraphs = content.split(/\n\n+/);
  const blocks: Block[] = [];

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;

    const lines = trimmed.split('\n');

    const isOl = lines.every((l) => /^\d+\.\s/.test(l.trim()));
    if (isOl && lines.length > 0) {
      blocks.push({
        type: 'ol',
        items: lines.map((l) => l.trim().replace(/^\d+\.\s/, '')),
      });
      continue;
    }

    const isUl = lines.every((l) => /^[-•]\s/.test(l.trim()));
    if (isUl && lines.length > 0) {
      blocks.push({
        type: 'ul',
        items: lines.map((l) => l.trim().replace(/^[-•]\s/, '')),
      });
      continue;
    }

    blocks.push({ type: 'paragraph', text: trimmed });
  }

  return blocks;
}

export function SimpleMarkdown({ content, className, reportStyle }: SimpleMarkdownProps) {
  if (!content) return null;

  const blocks = parseBlocks(content);

  if (reportStyle) {
    return (
      <div className={`space-y-2 ${className ?? ''}`}>
        {blocks.map((block, i) => {
          switch (block.type) {
            case 'ol':
              return (
                <div key={i} className="bg-white rounded-xl border border-gray-100 px-4 py-3">
                  <ol className="space-y-2">
                    {block.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-kk-red text-white text-xs flex items-center justify-center font-bold mt-0.5">
                          {j + 1}
                        </span>
                        <span>{renderLineBreaks(item)}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              );
            case 'ul':
              return (
                <div key={i} className="bg-white rounded-xl border border-gray-100 px-4 py-3">
                  <ul className="space-y-1.5">
                    {block.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
                        <span className="flex-shrink-0 text-kk-red mt-1">•</span>
                        <span>{renderLineBreaks(item)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            case 'paragraph':
            default: {
              const text = block.text;
              // 볼드로 시작하거나 짧은 요약 줄이면 헤더 스타일
              const isSummaryLine = /^\*\*[^*]+\*\*/.test(text) || (text.length < 60 && !text.includes('\n'));
              return isSummaryLine ? (
                <div key={i} className="bg-kk-cream rounded-xl px-4 py-2.5">
                  <p className="text-sm font-semibold text-kk-brown leading-relaxed">
                    {renderLineBreaks(text)}
                  </p>
                </div>
              ) : (
                <div key={i} className="pl-2 border-l-2 border-gray-200">
                  <p className="text-sm text-gray-600 leading-relaxed">{renderLineBreaks(text)}</p>
                </div>
              );
            }
          }
        })}
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className ?? ''}`}>
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'ol':
            return (
              <ol key={i} className="list-decimal list-inside space-y-1">
                {block.items.map((item, j) => (
                  <li key={j}>{renderInline(item)}</li>
                ))}
              </ol>
            );
          case 'ul':
            return (
              <ul key={i} className="list-disc list-inside space-y-1">
                {block.items.map((item, j) => (
                  <li key={j}>{renderInline(item)}</li>
                ))}
              </ul>
            );
          case 'paragraph':
          default:
            return <p key={i}>{renderLineBreaks(block.text)}</p>;
        }
      })}
    </div>
  );
}
