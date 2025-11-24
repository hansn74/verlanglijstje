'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GiftCard from '../components/GiftCard';
import SmileyProgress from '../components/SmileyProgress';
import SettingsPanel, { Settings } from '../components/SettingsPanel';
import wishlist from '../data/wishlist.json';

export default function Home() {
  const [openedGifts, setOpenedGifts] = useState<number[]>([]);
  const [claimedGifts, setClaimedGifts] = useState<Record<number, { claimedBy: string }>>({});
  const [userName, setUserName] = useState<string>('');
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    animationSpeed: 'medium',
    theme: 'gradient',
    sparkles: 'subtle',
    soundEnabled: true,
  });

  // Load user name and claims from server
  useEffect(() => {
    // Get or set user name
    const savedName = localStorage.getItem('userName');
    if (savedName) {
      setUserName(savedName);
    }

    // Fetch all claims from server
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      const response = await fetch('/api/claims');
      const data = await response.json();
      setClaimedGifts(data.claims || {});
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
    // Ask for name if not set
    if (!userName) {
      setShowNamePrompt(true);
      return;
    }

    try {
      const response = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ giftId: id, claimedBy: userName }),
      });

      if (response.ok) {
        // Refresh claims
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

  const saveName = (name: string) => {
    setUserName(name);
    localStorage.setItem('userName', name);
    setShowNamePrompt(false);
  };

  const handleShare = async () => {
    const shareData = {
      title: "Hans z'n Verlanglijstje",
      text: 'Bekijk mijn verlanglijstje!',
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link gekopieerd naar klembord!');
    }
  };

  const themeClasses = {
    gradient: 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50',
    minimal: 'bg-gray-50',
    playful: 'bg-gradient-to-br from-yellow-50 via-green-50 to-blue-50',
    dark: 'bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900',
  };

  const textColorClasses = {
    gradient: 'text-gray-800',
    minimal: 'text-gray-800',
    playful: 'text-gray-800',
    dark: 'text-white',
  };

  return (
    <div className={`min-h-screen ${themeClasses[settings.theme]} ${textColorClasses[settings.theme]} p-4 sm:p-8`}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl sm:text-6xl font-bold mb-4">
            Hans z&apos;n Verlanglijstje 🎁
          </h1>
          <p className={`text-lg sm:text-xl mb-6 ${settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Tap op een cadeau om te ontdekken wat Hans graag wil!
          </p>

          <div className="flex gap-4 justify-center items-center flex-wrap">
            <SmileyProgress
              openedCount={openedGifts.length}
              totalCount={wishlist.length}
              soundEnabled={settings.soundEnabled}
            />

            <button
              onClick={handleShare}
              className="px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors font-semibold shadow-lg hover:shadow-xl"
            >
              📤 Deel dit lijstje
            </button>
          </div>

          {/* Stats Dashboard */}
          <div className={`mt-6 p-4 rounded-xl ${settings.theme === 'dark' ? 'bg-white/10' : 'bg-white/60'} backdrop-blur-sm inline-block`}>
            <div className="flex gap-8 text-sm">
              <div>
                <div className="font-bold text-2xl">{openedGifts.length}</div>
                <div className={settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Bekeken</div>
              </div>
              <div>
                <div className="font-bold text-2xl">{Object.keys(claimedGifts).length}</div>
                <div className={settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Geclaimd</div>
              </div>
              <div>
                <div className="font-bold text-2xl">{wishlist.length - Object.keys(claimedGifts).length}</div>
                <div className={settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Beschikbaar</div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((item, index) => (
            <GiftCard
              key={item.id}
              {...item}
              onOpen={() => handleOpen(item.id)}
              settings={settings}
              isClaimed={!!claimedGifts[item.id]}
              onClaim={() => handleClaim(item.id)}
            />
          ))}
        </div>

        {/* Name Prompt Modal */}
        {showNamePrompt && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <h2 className="text-2xl font-bold mb-4">Hoe heet je?</h2>
              <p className="text-gray-600 mb-6">
                Vul je naam in zodat Hans weet wie wat geeft!
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const input = e.currentTarget.elements.namedItem('name') as HTMLInputElement;
                  if (input.value.trim()) {
                    saveName(input.value.trim());
                  }
                }}
              >
                <input
                  type="text"
                  name="name"
                  placeholder="Je naam..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg mb-4 focus:border-blue-500 focus:outline-none"
                  autoFocus
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowNamePrompt(false)}
                    className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                  >
                    Annuleren
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
                  >
                    Opslaan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12 pb-8"
        >
          <p className={`text-sm ${settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Gemaakt met ❤️ voor Hans • {wishlist.length} items
          </p>
        </motion.div>
      </div>

      <SettingsPanel settings={settings} onSettingsChange={setSettings} />
    </div>
  );
}
