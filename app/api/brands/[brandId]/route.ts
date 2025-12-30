import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Brand } from '@/models/brand';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ brandId: string }> | { brandId: string } }
) {
  try {
    await connectDB();
    
    const resolvedParams = params instanceof Promise ? await params : params;
    const { brandId } = resolvedParams;
    
    const brand = await Brand.findOne({ brandId }).lean();
    
    if (!brand) {
      return NextResponse.json(
        { success: false, error: 'Brand not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: true, data: brand },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching brand:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch brand' 
      },
      { status: 500 }
    );
  }
}

