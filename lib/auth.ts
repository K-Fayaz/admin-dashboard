import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

export function requireAdmin(request: Request) {
  const auth = request.headers.get('authorization') || '';
  if (!auth.startsWith('Bearer ')) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const token = auth.slice(7);
  try {
    const secret = process.env.JWT_SECRET || 'dev_secret';
    const payload = jwt.verify(token, secret) as any;

    if (payload?.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    return { payload };
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
  }
}
