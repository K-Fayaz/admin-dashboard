export function buildBrandCompliancePrompt(
    userPrompt: string,
    brandData: {
      brandName: string;
      brandDescription?: string;
      style?: string;
      brandVision?: string;
      brandVoice?: string;
      colors?: string;
    }
  ): string {
    return `You are an expert brand compliance evaluator. Analyze if the image/video aligns with the brand guidelines and identity.
  
  **User's Creative Prompt:**
  "${userPrompt}"
  
  **Brand Information:**
  - **Brand Name:** ${brandData.brandName}
  - **Brand Description:** ${brandData.brandDescription || 'Not provided'}
  - **Brand Style:** ${brandData.style || 'Not provided'}
  - **Brand Vision:** ${brandData.brandVision || 'Not provided'}
  - **Brand Voice:** ${brandData.brandVoice || 'Not provided'}
  - **Brand Colors:** ${brandData.colors || 'Not provided'}
  
  **Your Task:**
  Evaluate how well the image/video matches the brand's identity, style, and guidelines.
  
  **Evaluation Criteria:**
  
  1. **Visual Style Alignment (30%):**
     - Does the visual style match the brand's aesthetic?
     - Is the composition, lighting, and treatment appropriate?
     - Does it feel like it belongs to this brand?
  
  2. **Color Palette Compliance (25%):**
     - Are the brand colors present or complementary?
     - Does the color scheme align with brand guidelines?
     - If brand colors aren't specified, does it have cohesive color harmony?
  
  3. **Brand Voice & Tone (25%):**
     - Does the visual convey the brand's personality?
     - Is the mood/atmosphere consistent with brand voice (professional, playful, serious, creative)?
     - Does it communicate the right emotional message?
  
  4. **Brand Vision Alignment (20%):**
     - Does this support the brand's mission and vision?
     - Is it on-brand messaging?
     - Would this make sense in the brand's content portfolio?
  
  **Scoring Guidelines (0-10):**
  - **9-10:** Perfect brand alignment, could be used in official brand materials
  - **7-8:** Strong alignment with minor adjustments needed
  - **5-6:** Acceptable but missing key brand elements
  - **3-4:** Weak alignment, significant brand mismatch
  - **0-2:** Does not represent the brand, off-brand content
  
  **Consider:**
  - Some creative interpretation is acceptable if it serves the brand vision
  - Not every element needs to be literal brand colors/style if the overall feel is right
  - Context matters - social media content can be more flexible than formal brand materials
  
  **Response Format (JSON only):**
  {
    "score": <number 0-10>,
    "styleAlignment": <number 0-10>,
    "colorCompliance": <number 0-10>,
    "voiceConsistency": <number 0-10>,
    "visionAlignment": <number 0-10>,
    "reasoning": "<detailed explanation of the score>",
    "strengths": "<what works well for the brand>",
    "improvements": "<what could be more on-brand>"
  }
  
  Analyze the provided image/video and provide ONLY the JSON response, no additional text.`;
}