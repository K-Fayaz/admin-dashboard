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
  
export function buildAggregatorPrompt(agentAResult: AgentAResult,agentBResult: AgentBResult): string {
    return `
    
    You are an expert evaluator tasked with aggregating multiple quality assessments into a single, final score.
  
    You will receive evaluation results from two different agents:
    
    **AGENT A - SIZE COMPLIANCE:**
    - Score: ${agentAResult.score}/10
    - Is Optimal: ${agentAResult.isOptimal}
    - Reasoning: ${agentAResult.reasoning}
    
    **AGENT B - BRAND & CONTENT ALIGNMENT:**
    - Overall Score: ${agentBResult.score}/10
    - Style Alignment: ${agentBResult.styleAlignment}/10
    - Color Compliance: ${agentBResult.colorCompliance}/10
    - Voice Consistency: ${agentBResult.voiceConsistency}/10
    - Vision Alignment: ${agentBResult.visionAlignment}/10
    - Reasoning: ${agentBResult.reasoning}
    - Strengths: ${agentBResult.strengths}
    - Improvements: ${agentBResult.improvements}
    
    **YOUR TASK:**
    Calculate a single final score from 0-10 that represents the overall quality of this content.
    
    **SCORING GUIDELINES:**
    - Agent A (Size Compliance): 20% weight
    - Agent B (Brand Alignment): 80% weight (this is more critical for brand consistency)
    - Consider that size issues can be fixed easily, but brand misalignment is a fundamental problem
    - A score of 0-3 = Poor/Unusable
    - A score of 4-6 = Needs significant improvement
    - A score of 7-8 = Good with minor issues
    - A score of 9-10 = Excellent/Ready to use
    
    **IMPORTANT:**
    - Be strict: Low scores in brand alignment should heavily impact the final score
    - If Agent B scores below 3, the final score should not exceed 4, regardless of size compliance
    - Round to 1 decimal place
    
    Respond ONLY with valid JSON in this exact format:
    {
        "endScore": <number from 0-10 with 1 decimal>,
        "summary": "<2-3 sentence explanation of the final score>"
    }`;
}