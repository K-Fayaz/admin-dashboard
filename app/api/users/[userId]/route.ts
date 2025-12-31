import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User } from '@/models/user';
import { requireAdmin } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> | { userId: string } }
) {
  try {
    const auth = requireAdmin(request);
    if (auth instanceof NextResponse) return auth;

    await connectDB();
    
    const resolvedParams = params instanceof Promise ? await params : params;
    const { userId } = resolvedParams;
    
    const user = await User.findOne({ userId }).lean();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: true, data: user },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch user' 
      },
      { status: 500 }
    );
  }
}

