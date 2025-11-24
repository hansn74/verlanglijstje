import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

// Data structure: { giftId: { claimedBy: string, claimedAt: timestamp } }

// GET - Get all claims
export async function GET() {
  try {
    const claims = await kv.hgetall('wishlist:claims') || {};
    return NextResponse.json({ claims });
  } catch (error) {
    console.error('Error fetching claims:', error);
    return NextResponse.json({ error: 'Failed to fetch claims' }, { status: 500 });
  }
}

// POST - Claim a gift
export async function POST(request: Request) {
  try {
    const { giftId, claimedBy } = await request.json();

    if (!giftId || !claimedBy) {
      return NextResponse.json({ error: 'Missing giftId or claimedBy' }, { status: 400 });
    }

    // Check if already claimed
    const existingClaim = await kv.hget('wishlist:claims', giftId.toString());
    if (existingClaim) {
      return NextResponse.json({ error: 'Gift already claimed' }, { status: 409 });
    }

    // Save claim
    await kv.hset('wishlist:claims', {
      [giftId]: {
        claimedBy,
        claimedAt: new Date().toISOString(),
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error claiming gift:', error);
    return NextResponse.json({ error: 'Failed to claim gift' }, { status: 500 });
  }
}

// DELETE - Unclaim a gift
export async function DELETE(request: Request) {
  try {
    const { giftId } = await request.json();

    if (!giftId) {
      return NextResponse.json({ error: 'Missing giftId' }, { status: 400 });
    }

    await kv.hdel('wishlist:claims', giftId.toString());

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error unclaiming gift:', error);
    return NextResponse.json({ error: 'Failed to unclaim gift' }, { status: 500 });
  }
}
