export function buildSizeCompliancePrompt(
    metadata: { width: number; height: number; format: string },
    userPrompt: string,
    channel: string
  ): string {
    return `
    
  You are an expert image quality evaluator specializing in size compliance analysis.
  
  **Your task:** Evaluate if the image dimensions are appropriate based on the prompt and platform requirements.
  
  **Image Metadata:**
  - Width: ${metadata.width}px
  - Height: ${metadata.height}px
  - Format: ${metadata.format}
  - Aspect Ratio: ${(metadata.width / metadata.height).toFixed(2)}
  
  **User Prompt:** 
  "${userPrompt}"
  
  **Target Channel/Platform:** 
  ${channel}
  
  **Evaluation Guidelines:**
  
  1. **Check if size/dimensions are mentioned in the prompt:**
     - If prompt specifies dimensions (e.g., "1080x1080", "square", "portrait", "landscape", "wide"), prioritize that requirement
     - If prompt mentions orientation (vertical/horizontal/square), verify the aspect ratio matches
  
  2. **If NO size mentioned in prompt, use platform standards:**
     
     **Instagram:**
     - Feed Post (Square): 1080x1080 (1:1)
     - Feed Post (Portrait): 1080x1350 (4:5)
     - Feed Post (Landscape): 1080x566 (1.91:1)
     - Stories: 1080x1920 (9:16)
     - Reels: 1080x1920 (9:16)
     
     **Facebook:**
     - Feed Post: 1200x630 (1.91:1) or 1080x1080 (1:1)
     - Stories: 1080x1920 (9:16)
     
     **TikTok:**
     - Video: 1080x1920 (9:16)
     
     **YouTube:**
     - Thumbnail: 1280x720 (16:9)
     - Video: 1920x1080 (16:9)
     
     **Twitter/X:**
     - Post Image: 1200x675 (16:9) or 1080x1080 (1:1)
     
     **LinkedIn:**
     - Post Image: 1200x627 (1.91:1)
  
  3. **Scoring Criteria (0-10):**
     - **10/10:** Perfect match to specified dimensions or ideal platform size
     - **8-9/10:** Close match (within 10% tolerance) or acceptable platform alternative
     - **6-7/10:** Correct aspect ratio but non-optimal resolution
     - **4-5/10:** Wrong aspect ratio but usable with cropping
     - **0-3/10:** Completely inappropriate dimensions for the use case
  
  4. **Consider context from prompt:**
     - "Banner", "header", "cover" = expect wide/landscape
     - "Portrait", "profile", "vertical" = expect tall orientation
     - "Story", "reel" = expect 9:16 ratio
     - "Post", "feed" = depends on platform
  
  **Response Format (JSON only):**
  {
    "score": <number 0-10>,
    "reasoning": "<brief explanation of why this score>",
    "isOptimal": <boolean // true if exact size match>,
  }
  
  Provide ONLY the JSON response, no additional text.`;
  }