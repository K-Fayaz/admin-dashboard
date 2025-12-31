import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Prompt } from '@/models/prompts';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const auth = requireAdmin(request);
    if (auth instanceof NextResponse) return auth;

    await connectDB();
    
    const prompts = await Prompt.find({}).sort({ timestamp: -1 }).lean();
    
    return NextResponse.json(
      { 
        success: true, 
        data: prompts,
        count: prompts.length 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching prompts:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch prompts' 
      },
      { status: 500 }
    );
  }
}

