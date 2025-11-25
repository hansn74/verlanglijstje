import { NextResponse } from 'next/server';

// GitHub Gist configuration
const GIST_ID = process.env.GIST_ID!;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;
const GIST_FILENAME = 'wishlist-claims.json';

interface ClaimData {
  claimedBy: string;
  claimedAt: string;
}

interface GistData {
  claims: {
    [giftId: string]: ClaimData;
  };
  users: string[];
}

// Helper function to fetch Gist data
async function fetchGistData(): Promise<GistData> {
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
      return { claims: {}, users: [] };
    }

    const gist = await response.json();
    const content = gist.files[GIST_FILENAME]?.content;
    if (content) {
      const data = JSON.parse(content);
      // Support old format (just claims object) and new format (with users)
      if (data.claims) {
        return { claims: data.claims, users: data.users || [] };
      } else {
        // Old format: data is the claims object directly
        return { claims: data, users: [] };
      }
    }
    return { claims: {}, users: [] };
  } catch (error) {
    console.error('Error fetching Gist data:', error);
    return { claims: {}, users: [] };
  }
}

// Helper function to update Gist data
async function updateGistData(data: GistData): Promise<boolean> {
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
            content: JSON.stringify(data, null, 2),
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

// GET - Get all claims and users
export async function GET() {
  try {
    const data = await fetchGistData();
    return NextResponse.json({ claims: data.claims, users: data.users });
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

    // Fetch current data
    const data = await fetchGistData();

    // Check if already claimed
    if (data.claims[giftId]) {
      return NextResponse.json({ error: 'Gift already claimed' }, { status: 409 });
    }

    // Add new claim
    data.claims[giftId] = {
      claimedBy,
      claimedAt: new Date().toISOString(),
    };

    // Add user to users list if not already there
    if (!data.users.includes(claimedBy)) {
      data.users.push(claimedBy);
    }

    // Save to Gist
    const success = await updateGistData(data);

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

    // Fetch current data
    const data = await fetchGistData();

    // Remove claim
    delete data.claims[giftId];

    // Save to Gist
    const success = await updateGistData(data);

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
