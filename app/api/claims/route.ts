import { NextResponse } from 'next/server';

// GitHub Gist configuration
const GIST_ID = process.env.GIST_ID!;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;
const GIST_FILENAME = 'wishlist-claims.json';

interface Claims {
  [giftId: string]: {
    claimedBy: string;
    claimedAt: string;
  };
}

// Helper function to fetch Gist data
async function fetchGistData(): Promise<Claims> {
  try {
    const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Failed to fetch Gist:', response.status);
      return {};
    }

    const gist = await response.json();
    const content = gist.files[GIST_FILENAME]?.content;
    return content ? JSON.parse(content) : {};
  } catch (error) {
    console.error('Error fetching Gist data:', error);
    return {};
  }
}

// Helper function to update Gist data
async function updateGistData(claims: Claims): Promise<boolean> {
  try {
    const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        files: {
          [GIST_FILENAME]: {
            content: JSON.stringify(claims, null, 2),
          },
        },
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Error updating Gist data:', error);
    return false;
  }
}

// GET - Get all claims
export async function GET() {
  try {
    const claims = await fetchGistData();
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

    // Fetch current claims
    const claims = await fetchGistData();

    // Check if already claimed
    if (claims[giftId]) {
      return NextResponse.json({ error: 'Gift already claimed' }, { status: 409 });
    }

    // Add new claim
    claims[giftId] = {
      claimedBy,
      claimedAt: new Date().toISOString(),
    };

    // Save to Gist
    const success = await updateGistData(claims);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Failed to save claim' }, { status: 500 });
    }
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

    // Fetch current claims
    const claims = await fetchGistData();

    // Remove claim
    delete claims[giftId];

    // Save to Gist
    const success = await updateGistData(claims);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Failed to unclaim gift' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error unclaiming gift:', error);
    return NextResponse.json({ error: 'Failed to unclaim gift' }, { status: 500 });
  }
}
