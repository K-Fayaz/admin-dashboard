import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Prompt } from '@/models/prompts';
import { Brand } from '@/models/brand';
import { Evaluation } from '@/models/evaluation';
import sizeComplianceAgent from '@/agents/sizeCompliance';
import brandComplianceAgent from "@/agents/brandCompliance";
import aggregatorAgent from '@/agents/aggregator';
import mongoose from 'mongoose';

interface SizeComplianceResult {
  score: number;
  reasoning: string;
  isOptimal: boolean;
}

interface BrandComplianceResult {
  score: number;
  styleAlignment: number;
  colorCompliance: number;
  voiceConsistency: number;
  visionAlignment: number;
  reasoning: string;
  strengths: string;
  improvements: string;
}

interface AggregatorResult {
  endScore: number;
  summary: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Prompt ID is required' 
        },
        { status: 400 }
      );
    }

    await connectDB();
    
    const prompt = await Prompt.findById(id).lean();
    
    if (!prompt) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Prompt not found' 
        },
        { status: 404 }
      );
    }

    const brand = await Brand.findOne({brandId: prompt.brandId}).lean();

    if (!brand) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Brand not found' 
        },
        { status: 404 }
      );
    }

    let brandDetails = {
      brandName: brand.brandName,
      brandDescription: brand.brandDescription,
      style: brand.style,
      brandVision: brand.brandVision,
      brandVoice: brand.brandVoice,
      colors: brand.colors,
    }

    // Log prompt details to console

    const [sizeResultRaw, brandResultRaw] = await Promise.all([
      sizeComplianceAgent(prompt.imagePath, prompt.prompt, prompt.channel),
      brandComplianceAgent(prompt.imagePath, prompt.prompt, brandDetails),
    ]);

    // Type assertions: agents return parsed JSON but TypeScript infers Message type
    const sizeResult = sizeResultRaw as any as SizeComplianceResult;
    const brandResult = brandResultRaw as any as BrandComplianceResult;

    // @ts-ignore - aggregatorAgent expects typed results but receives Message type from TypeScript's perspective
    const finalResultRaw = await aggregatorAgent(sizeResult, brandResult);
    const finalResult = finalResultRaw as any as AggregatorResult;

    console.log(sizeResult);
    console.log("\n\n",brandResult);
    console.log("\n\n",finalResult);

    // Create or update evaluation
    const promptObjectId = new mongoose.Types.ObjectId(id);
    // @ts-ignore - Agent results are correctly typed at runtime via parseClaudeResponse
    const evaluationData = {
      promptId: promptObjectId,
      score: finalResult.endScore,
      summary: finalResult.summary,
      sizeCompliance: {
        score: sizeResult.score,
        reasoning: sizeResult.reasoning,
        isOptimal: sizeResult.isOptimal
      },
      brandCompliance: {
        score: brandResult.score,
        styleAlignment: brandResult.styleAlignment,
        colorCompliance: brandResult.colorCompliance,
        voiceConsistency: brandResult.voiceConsistency,
        visionAlignment: brandResult.visionAlignment,
        reasoning: brandResult.reasoning,
        strengths: brandResult.strengths,
        improvements: brandResult.improvements
      }
    };

    let evaluation;
    if (prompt.evaluation) {
      // Update existing evaluation
      evaluation = await Evaluation.findByIdAndUpdate(
        prompt.evaluation,
        evaluationData,
        { new: true, runValidators: true }
      );
    } else {
      // Create new evaluation
      evaluation = await Evaluation.create(evaluationData);
      
      // Update prompt to reference the evaluation
      await Prompt.findByIdAndUpdate(id, {
        evaluation: evaluation._id
      });
    }
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Prompt evaluated successfully',
        evaluation: evaluation
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error evaluating prompt:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to evaluate prompt' 
      },
      { status: 500 }
    );
  }
}

