// Uses Anthropic sdk to make LLM to claude.

import Anthropic from '@anthropic-ai/sdk';
const API_KEY   = process.env.ANTHROPIC_API_KEY;

const anthropic = new Anthropic({
  apiKey: API_KEY
});

type AnthropicMessage = {
    role: "user" | "assistant";
    content: { type: "text"; text: string }[];
  };
  


const useAnthropic = async(messages: AnthropicMessage[],max_tokens: number = 1024)=>{
    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514", // Use the full model version string
      max_tokens: max_tokens,
      messages,
    });
    
    return msg;
}

export default useAnthropic;