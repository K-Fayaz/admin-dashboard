import useAnthropic from "../lib/anthropic";
import { buildSizeCompliancePrompt } from "@/lib/prompts/sizeCompliance";
import { getImageMetadata } from '@/lib/imageMetadata';
import { parseClaudeResponse } from "@/lib/ai/parseClaudeResponse";


const sizeComplianceAgent = async (imagePath:string, prompt:string, channel: string) => {

    const metadata = await getImageMetadata(imagePath);
    const { width, height, format } = metadata;

    const userPrompt = buildSizeCompliancePrompt({ width, height, format }, prompt,channel);

    console.log(metadata)
    console.log("\n", prompt);
    console.log("\n", channel);


    let result = await useAnthropic([
        {
          role: "user",
          content: [
            { type: "text", text: userPrompt }
          ]
        }
    ]);

    result = parseClaudeResponse(result);
    return result;
}


export default sizeComplianceAgent;