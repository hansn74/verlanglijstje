'use client';

import { useState, useEffect } from 'react';
import wishlist from '../../data/wishlist.json';

interface Claim {
  claimedBy: string;
  claimedAt: string;
}

export default function AdminPage() {
  const [claims, setClaims] = useState<Record<number, Claim>>({});
  const [users, setUsers] = useState<string[]>([]);
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/claims');
      const data = await response.json();
      setClaims(data.claims || {});
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple password protection - in production use proper auth
    if (password === 'hans2024') {
      setIsAuthenticated(true);
      localStorage.setItem('adminAuth', 'true');
    } else {
      alert('Verkeerd wachtwoord!');
    }
  };

  const handleUnclaim = async (giftId: number) => {
    if (!confirm('Weet je zeker dat je dit wilt unclaimen?')) return;

    try {
      const response = await fetch('/api/claims', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ giftId }),
      });

      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Error unclaiming:', error);
    }
  };

  const handleResetAllClaims = async () => {
    if (!confirm('Weet je zeker dat je ALLE claims wilt resetten? Dit kan niet ongedaan worden!')) return;
    if (!confirm('Echt zeker? Alle claims worden verwijderd!')) return;

    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resetClaims' }),
      });

      if (response.ok) {
        await fetchData();
        alert('Alle claims zijn gereset!');
      }
    } catch (error) {
      console.error('Error resetting claims:', error);
    }
  };

  const handleDeleteUser = async (userName: string) => {
    if (!confirm(`Weet je zeker dat je "${userName}" wilt verwijderen?`)) return;

    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deleteUser', userName }),
      });

      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleResetAllUsers = async () => {
    if (!confirm('Weet je zeker dat je ALLE gebruikers wilt verwijderen?')) return;

    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resetUsers' }),
      });

      if (response.ok) {
        await fetchData();
        alert('Alle gebruikers zijn verwijderd!');
      }
    } catch (error) {
      console.error('Error resetting users:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
          <h1 className="text-3xl font-bold mb-6">Admin Login</h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Wachtwoord..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg mb-4 focus:border-blue-500 focus:outline-none"
              autoFocus
            />
            <button
              type="submit"
              className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Overzicht van alle geclaimde cadeaus</p>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl mb-6">
          <h2 className="text-xl font-bold mb-4">Stats</h2>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">{wishlist.length}</div>
              <div className="text-gray-600">Totaal items</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">{Object.keys(claims).length}</div>
              <div className="text-gray-600">Geclaimd</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600">
                {wishlist.length - Object.keys(claims).length}
              </div>
              <div className="text-gray-600">Beschikbaar</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">{users.length}</div>
              <div className="text-gray-600">Gebruikers</div>
            </div>
          </div>
        </div>

        {/* Gebruikers beheer */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Gebruikers</h2>
            {users.length > 0 && (
              <button
                onClick={handleResetAllUsers}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-semibold"
              >
                Alle verwijderen
              </button>
            )}
          </div>
          {users.length === 0 ? (
            <p className="text-gray-500">Geen gebruikers geregistreerd</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {users.map((user) => (
                <div
                  key={user}
                  className="flex items-center gap-2 bg-purple-100 px-3 py-2 rounded-lg"
                >
                  <span className="font-medium">{user}</span>
                  <button
                    onClick={() => handleDeleteUser(user)}
                    className="text-red-500 hover:text-red-700 font-bold"
                    title="Verwijderen"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Danger zone */}
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 sm:p-8 mb-6">
          <h2 className="text-xl font-bold text-red-800 mb-4">⚠️ Danger Zone</h2>
          <div className="flex gap-4">
            <button
              onClick={handleResetAllClaims}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
            >
              Reset alle claims
            </button>
          </div>
          <p className="text-red-600 text-sm mt-2">
            Let op: deze actie kan niet ongedaan worden gemaakt!
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl">
          <h2 className="text-xl font-bold mb-4">Alle Items</h2>
          <div className="space-y-3">
            {wishlist.map((item) => {
              const claim = claims[item.id];
              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-lg border-2 ${
                    claim
                      ? 'bg-green-50 border-green-300'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.image}</span>
                      <div>
                        <div className="font-semibold">{item.title}</div>
                        {claim ? (
                          <div className="text-sm text-green-700">
                            Geclaimd door: <span className="font-bold">{claim.claimedBy}</span>
                            {' • '}
                            {new Date(claim.claimedAt).toLocaleDateString('nl-NL')}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">Nog beschikbaar</div>
                        )}
                      </div>
                    </div>
                    {claim && (
                      <button
                        onClick={() => handleUnclaim(item.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-semibold"
                      >
                        Unclaim
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
