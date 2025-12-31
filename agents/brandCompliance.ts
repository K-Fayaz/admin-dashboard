import useAnthropic from "../lib/anthropic";
import { buildBrandCompliancePrompt } from "@/lib/prompts/brandCompliance";

interface Brand {
    brandName: string;
    brandDescription?: string;
    style?: string;
    brandVision?: string;
    brandVoice?: string;
    colors?: string;
}

const normalizeMediaType = (mimeType: string): string => {
    const type = mimeType.toLowerCase();
    
    // Handle image types
    if (type.includes('jpeg') || type.includes('jpg')) return 'image/jpeg';
    if (type.includes('png')) return 'image/png';
    if (type.includes('gif')) return 'image/gif';
    if (type.includes('webp')) return 'image/webp';
    
    // Handle video types
    if (type.includes('mp4')) return 'video/mp4';
    if (type.includes('mov') || type.includes('quicktime')) return 'video/quicktime';
    if (type.includes('avi')) return 'video/x-msvideo';
    if (type.includes('webm')) return 'video/webm';
    
    // Default fallback
    return 'image/jpeg';
};

const brandComplianceAgent = async (imagePath: string, prompt: string, brandDetails: Brand) => {
    const response = await fetch(imagePath);
    const buffer = await response.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString("base64");

    // Determine media type from the image path/response
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const mediaType = normalizeMediaType(contentType);

    let result = await useAnthropic([
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: base64Image
              }
            },
            { 
              type: "text", 
              text: buildBrandCompliancePrompt(prompt, brandDetails) 
            }
          ]
        }
    ]);

    return result;
}

export default brandComplianceAgent;