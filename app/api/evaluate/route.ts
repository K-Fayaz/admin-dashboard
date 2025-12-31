import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Prompt } from '@/models/prompts';
import { Brand } from '@/models/brand';
import sizeComplianceAgent from '@/agents/sizeCompliance';
import brandComplianceAgent from "@/agents/brandCompliance";
import aggregatorAgent from '@/agents/aggregator';

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
    const brand = await Brand.findOne({brandId: prompt.brandId}).lean();

    let brandDetails = {
      brandName: brand.brandName,
      brandDescription: brand.brandDescription,
      style: brand.style,
      brandVision: brand.brandVision,
      brandVoice: brand.brandVoice,
      colors: brand.colors,
    }
    
    if (!prompt) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Prompt not found' 
        },
        { status: 404 }
      );
    }

    // Log prompt details to console

    const [sizeResult, brandResult] = await Promise.all([
      sizeComplianceAgent(prompt.imagePath, prompt.prompt, prompt.channel),
      brandComplianceAgent(prompt.imagePath, prompt.prompt, brandDetails),
    ]);

    const finalResult = await aggregatorAgent(sizeResult, brandResult);

    console.log(sizeResult);
    console.log("\n\n",brandResult);
    console.log("\n\n",finalResult);
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Prompt evaluated successfully'
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

