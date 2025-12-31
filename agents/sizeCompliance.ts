import useAnthropic from "../lib/anthropic";
import { buildSizeCompliancePrompt } from "@/lib/prompts/sizeCompliance";
import { getImageMetadata } from '@/lib/imageMetadata';


const sizeComplianceAgent = async (imagePath:string, prompt:string, channel: string) => {

    const metadata = await getImageMetadata(imagePath);
    const { width, height, format } = metadata;

    const userPrompt = buildSizeCompliancePrompt({ width, height, format }, prompt,channel);

    console.log(metadata)
    console.log("\n", prompt);
    console.log("\n", channel);


    const result = await useAnthropic([
        {
          role: "user",
          content: [
            { type: "text", text: userPrompt }
          ]
        }
    ]);


    return result;
}


export default sizeComplianceAgent;