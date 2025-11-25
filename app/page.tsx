'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import GiftCard from '../components/GiftCard';
import NameSelectModal from '../components/NameSelectModal';
import BackToTop from '../components/BackToTop';
import CountdownTimer from '../components/CountdownTimer';
import wishlist from '../data/wishlist.json';

// Party date: Saturday November 29, 2025 at 16:00
const PARTY_DATE = new Date('2025-11-29T16:00:00');

function HomeContent() {
  const searchParams = useSearchParams();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [openedGifts, setOpenedGifts] = useState<number[]>([]);
  const [claimedGifts, setClaimedGifts] = useState<Record<number, { claimedBy: string }>>({});
  const [users, setUsers] = useState<string[]>([]);
  const [userName, setUserName] = useState<string>('');
  const [showNameSelect, setShowNameSelect] = useState(false);

  // Default settings (hardcoded)
  const settings = {
    animationSpeed: 'medium' as const,
    sparkles: 'subtle' as const,
    soundEnabled: true,
  };

  // Check token and load data
  useEffect(() => {
    const checkAuth = async () => {
      // First check localStorage for saved token
      const savedToken = localStorage.getItem('accessToken');
      const savedName = localStorage.getItem('userName');
      const urlToken = searchParams.get('token');

      // Use URL token if provided, otherwise use saved token
      const token = urlToken || savedToken;

      if (!token) {
        setIsAuthorized(false);
        return;
      }

      try {
        const response = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        if (response.ok) {
          setIsAuthorized(true);
          // Save token to localStorage
          localStorage.setItem('accessToken', token);

          // If we have a saved name, use it
          if (savedName) {
            setUserName(savedName);
          } else {
            // Show name selection
            setShowNameSelect(true);
          }

          // Fetch claims and users
          await fetchClaims();
        } else {
          setIsAuthorized(false);
          // Clear invalid token
          localStorage.removeItem('accessToken');
        }
      } catch (error) {
        console.error('Auth error:', error);
        setIsAuthorized(false);
      }
    };

    checkAuth();
  }, [searchParams]);

  const fetchClaims = async () => {
    try {
      const response = await fetch('/api/claims');
      const data = await response.json();
      setClaimedGifts(data.claims || {});
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching claims:', error);
    }
  };

  const handleOpen = (id: number) => {
    if (!openedGifts.includes(id)) {
      setOpenedGifts([...openedGifts, id]);
    }
  };

  const handleClaim = async (id: number) => {
    try {
      const response = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ giftId: id, claimedBy: userName }),
      });

      if (response.ok) {
        await fetchClaims();
      } else {
        const data = await response.json();
        alert(data.error || 'Dit cadeau is al geclaimd door iemand anders!');
      }
    } catch (error) {
      console.error('Error claiming gift:', error);
      alert('Er ging iets mis. Probeer het opnieuw.');
    }
  };

  const handleUnclaim = async (id: number) => {
    try {
      const response = await fetch('/api/claims', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ giftId: id }),
      });

      if (response.ok) {
        await fetchClaims();
      } else {
        alert('Er ging iets mis bij het annuleren.');
      }
    } catch (error) {
      console.error('Error unclaiming gift:', error);
      alert('Er ging iets mis. Probeer het opnieuw.');
    }
  };

  const handleNameSelect = async (name: string) => {
    setUserName(name);
    localStorage.setItem('userName', name);
    setShowNameSelect(false);

    // Register user in backend (for new users)
    try {
      await fetch('/api/claims', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName: name }),
      });
      // Refresh users list
      await fetchClaims();
    } catch (error) {
      console.error('Error registering user:', error);
    }
  };

  // Loading state
  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-2xl text-gray-600">⏳ Laden...</div>
      </div>
    );
  }

  // Unauthorized state
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold mb-4">Geen toegang</h1>
          <p className="text-gray-600">
            Je hebt een speciale link nodig om deze pagina te bekijken.
          </p>
        </div>
      </div>
    );
  }

  // Name selection modal
  if (showNameSelect) {
    return <NameSelectModal users={users} onSelect={handleNameSelect} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 text-gray-800 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl sm:text-6xl font-bold mb-4">
            Hans z'n verlanglijstje 🎁
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-6">
            Wat zou Hans willen? Ontdek het en claim 'm!
          </p>

          {/* Uitnodiging sectie */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 max-w-lg mx-auto shadow-lg mb-6">
            <h2 className="text-2xl font-bold mb-2">🎉 Je bent uitgenodigd! 🎉</h2>
            <p className="text-gray-600 mb-4">Hans wordt weer een jaartje wijzer en dat moet gevierd worden!</p>

            <div className="bg-purple-50 rounded-xl p-4 mb-4 text-left">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl">📅</span>
                <span className="font-medium">Zaterdag 29 november</span>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl">🕓</span>
                <span className="font-medium">Vanaf 16:00</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl">📍</span>
                <span className="font-medium">Je weet waar 😉</span>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-4">
              Uiteraard kun je niet met lege handen aankomen... <br />
              Gelukkig heb je nu deze handige lijst! 👇
            </p>

            {/* Countdown Timer */}
            <CountdownTimer targetDate={PARTY_DATE} />
          </div>

          {userName && (
            <p className="text-sm text-gray-500">
              Ingelogd als: <span className="font-semibold">{userName}</span>
              <button
                onClick={() => setShowNameSelect(true)}
                className="ml-2 text-purple-600 hover:text-purple-800 underline"
              >
                wijzig
              </button>
            </p>
          )}
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((item) => (
            <GiftCard
              key={item.id}
              {...item}
              onOpen={() => handleOpen(item.id)}
              settings={settings}
              isClaimed={!!claimedGifts[item.id]}
              claimedBy={claimedGifts[item.id]?.claimedBy}
              currentUser={userName}
              onClaim={() => handleClaim(item.id)}
              onUnclaim={() => handleUnclaim(item.id)}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12 pb-8"
        >
          <p className="text-sm text-gray-500">
            Gemaakt met ❤️ door Hans
          </p>
        </motion.div>
      </div>

      {/* Back to Top Button */}
      <BackToTop />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-2xl text-gray-600">⏳ Laden...</div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
