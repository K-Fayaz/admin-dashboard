import useAnthropic from "../lib/anthropic";
import { buildAggregatorPrompt } from "@/lib/prompts/aggregator";
import { parseClaudeResponse } from "@/lib/ai/parseClaudeResponse";

interface AgentAResult {
    score: number;
    reasoning: string;
    isOptimal: boolean;
}
  
interface AgentBResult {
    score: number;
    styleAlignment: number;
    colorCompliance: number;
    voiceConsistency: number;
    visionAlignment: number;
    reasoning: string;
    strengths: string;
    improvements: string;
}

const aggregatorAgent = async (agentA:AgentAResult, agentB: AgentBResult) => {

    const userPrompt = buildAggregatorPrompt(agentA, agentB);


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


export default aggregatorAgent;