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
   * Handles responses with or without markdown code blocks
   */
  export function parseClaudeResponse<T = any>(response: ClaudeResponse): T {
    try {
      // Extract text from content array
      const textContent = response.content
        .filter(item => item.type === 'text')
        .map(item => item.text)
        .join('\n');
  
      if (!textContent) {
        throw new Error('No text content found in response');
      }
  
      // Clean the text - remove markdown code blocks and extra whitespace
      const cleanedText = textContent
        .replace(/```json\n?/g, '')  // Remove ```json
        .replace(/```\n?/g, '')       // Remove ```
        .trim();
  
      // Parse JSON
      const parsed = JSON.parse(cleanedText);
      
      return parsed as T;
    } catch (error) {
      console.error('Failed to parse Claude response:', error);
      console.error('Raw content:', response.content);
      throw new Error(`Failed to parse Claude response: ${error.message}`);
    }
  }