import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (username === 'manova@admin' && password === 'admin@manova') {
      return NextResponse.json({
        success: true,
        authenticated: true,
        message: 'Admin authorization granted'
      });
    }

    return NextResponse.json(
      { success: false, authenticated: false, message: 'Invalid Admin Credentials' },
      { status: 401 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: 'Authentication processing failure' }, { status: 500 });
  }
}
