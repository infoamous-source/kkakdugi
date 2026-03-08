/**
 * Extract JSON from AI response text (handles ```json blocks)
 */
export function extractJSON(text: string): string {
  const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlock) return codeBlock[1].trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) return jsonMatch[0];
  return text;
}

/**
 * Robustly parse JSON from AI responses, handling unescaped characters
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function safeParseJSON(text: string): any {
  const raw = extractJSON(text);
  try { return JSON.parse(raw); } catch { /* continue */ }
  const fixed = raw.replace(
    /"([^"]*)"(\s*[:,\]}])/g,
    (_match, content: string, after: string) => {
      const escaped = content
        .replace(/\\/g, '\\\\')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t');
      return `"${escaped}"${after}`;
    },
  );
  try { return JSON.parse(fixed); } catch { /* continue */ }
  const aggressive = raw.replace(/(?<=":)\s*"([\s\S]*?)"(?=\s*[,}])/g, (_m, val: string) => {
    return `"${val.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/\r/g, '').replace(/\t/g, '\\t').replace(/"/g, '\\"')}"`;
  });
  return JSON.parse(aggressive);
}
