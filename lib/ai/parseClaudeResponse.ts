interface ClaudeResponse {
    model: string;
    id: string;
    type: string;
    role: string;
    content: Array<{ type: string; text: string }>;
    stop_reason: string;
    stop_sequence: string | null;
    usage: any;
}
  
  /**
   * Extracts and parses JSON from Claude's response
   * - Tries direct parse first
   * - Extracts JSON from code fences or balanced braces if necessary
   * - Strips trailing commas that often break JSON
   */
  export function parseClaudeResponse<T = any>(response: ClaudeResponse): T {
    const extractJsonFromCodeFence = (text: string): string | null => {
      // Prefer ```json blocks
      const jsonFence = /```json\s*([\s\S]*?)\s*```/i.exec(text);
      if (jsonFence && jsonFence[1]) return jsonFence[1].trim();
      // Fallback to any code fence
      const anyFence = /```\s*([\s\S]*?)\s*```/.exec(text);
      if (anyFence && anyFence[1]) return anyFence[1].trim();
      return null;
    };
  
    const findBalancedJson = (text: string): string | null => {
      // Find first { or [ and try to find matching close
      const startIdx = Math.min(
        ...['{','[']
          .map(ch => {
            const idx = text.indexOf(ch);
            return idx === -1 ? Number.MAX_SAFE_INTEGER : idx;
          })
      );
      if (startIdx === Number.MAX_SAFE_INTEGER) return null;

      let stack: string[] = [];
      for (let i = startIdx; i < text.length; i++) {
        const ch = text[i];
        if (ch === '{' || ch === '[') stack.push(ch);
        else if (ch === '}' || ch === ']') {
          const last = stack[stack.length - 1];
          if ((ch === '}' && last === '{') || (ch === ']' && last === '[')) {
            stack.pop();
            if (stack.length === 0) {
              return text.slice(startIdx, i + 1);
            }
          } else {
            // mismatched, abort
            return null;
          }
        }
      }
      return null;
    };
  
    const stripTrailingCommas = (s: string) => s.replace(/,\s*(?=[}\]])/g, '');

    const tryParse = (s: string) => {
      try {
        return JSON.parse(s);
      } catch (e) {
        return null;
      }
    };
  
    try {
      // Gather plain text content
      const textContent = response.content
        .filter(item => item.type === 'text')
        .map(item => item.text)
        .join('\n')
        .trim();
  
      if (!textContent) {
        throw new Error('No text content found in response');
      }
  
      // 1) Try direct parse
      let parsed = tryParse(textContent);
      if (parsed) return parsed as T;
  
      // 2) Try extracting from code fences
      const fromFence = extractJsonFromCodeFence(textContent);
      if (fromFence) {
        const cleaned = stripTrailingCommas(fromFence).trim();
        parsed = tryParse(cleaned);
        if (parsed) return parsed as T;
      }
  
      // 3) Try extracting first balanced JSON object/array
      const candidate = findBalancedJson(textContent);
      if (candidate) {
        const cleaned = stripTrailingCommas(candidate).trim();
        parsed = tryParse(cleaned);
        if (parsed) return parsed as T;
      }
  
      // 4) Final attempt: remove trailing commas globally and try to parse the whole text
      const relaxed = stripTrailingCommas(textContent);
      parsed = tryParse(relaxed);
      if (parsed) return parsed as T;
  
      // If we reach here, we couldn't parse
      console.error('Failed to parse candidate JSON snippets. Full text:', textContent);
      throw new Error('Unable to extract valid JSON from Claude response');
    } catch (error) {
      console.error('Failed to parse Claude response:', error);
      console.error('Raw content:', response.content);
      throw new Error(`Failed to parse Claude response: ${error instanceof Error ? error.message : String(error)}`);
    }
  }