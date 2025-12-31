import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Prompt } from '@/models/prompts';
import sizeComplianceAgent from '@/agents/sizeCompliance';

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

    // Log prompt details to console

    const [sizeResult] = await Promise.all([
      sizeComplianceAgent(prompt.imagePath, prompt.prompt, prompt.channel)
    ]);

    console.log(sizeResult);
    
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

