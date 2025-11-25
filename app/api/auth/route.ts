import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    const validToken = process.env.ACCESS_TOKEN;

    if (!validToken) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (token === validToken) {
      return NextResponse.json({ valid: true });
    } else {
      return NextResponse.json({ valid: false }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
