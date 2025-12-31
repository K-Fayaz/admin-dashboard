import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User } from '@/models/user';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ success: false, error: 'username and password required' }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ userName: username }).lean();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    // Note: passwords are stored in plaintext in this project; replace with hashing for production
    if (user.password !== password) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET || 'dev_secret';
    const token = jwt.sign(
      { sub: user.userId, role: user.userRole },
      secret,
      { expiresIn: '8h' }
    );

    return NextResponse.json({ success: true, token, role: user.userRole }, { status: 200 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
