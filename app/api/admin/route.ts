import { NextResponse } from 'next/server';

// GitHub Gist configuration
const GIST_ID = process.env.GIST_ID!;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;
const GIST_FILENAME = 'wishlist-claims.json';

interface GistData {
  claims: {
    [giftId: string]: {
      claimedBy: string;
      claimedAt: string;
    };
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
      return { claims: {}, users: [] };
    }

    const gist = await response.json();
    const content = gist.files[GIST_FILENAME]?.content;
    if (content) {
      const data = JSON.parse(content);
      if (data.claims) {
        return { claims: data.claims, users: data.users || [] };
      } else {
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

export async function POST(request: Request) {
  try {
    const { action, userName } = await request.json();

    const data = await fetchGistData();

    switch (action) {
      case 'resetClaims':
        data.claims = {};
        break;

      case 'resetUsers':
        data.users = [];
        break;

      case 'deleteUser':
        if (userName) {
          data.users = data.users.filter((u) => u !== userName);
        }
        break;

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

    const success = await updateGistData(data);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Failed to update data' }, { status: 500 });
    }
  } catch (error) {
    console.error('Admin action error:', error);
    return NextResponse.json({ error: 'Failed to perform action' }, { status: 500 });
  }
}
