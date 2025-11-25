'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { playPlop, playTap } from '@/lib/sounds';
import confetti from 'canvas-confetti';

interface MoreInfoLink {
  label: string;
  url: string;
}

interface MoreInfo {
  description?: string;
  links?: MoreInfoLink[];
  images?: string[];
}

interface GiftCardProps {
  id: number;
  title: string;
  image: string;
  reveal: string;
  moreInfo?: MoreInfo;
  onOpen: () => void;
  settings: {
    animationSpeed: 'slow' | 'medium' | 'fast';
    sparkles: 'none' | 'subtle' | 'maximum';
    soundEnabled: boolean;
  };
  isClaimed?: boolean;
  claimedBy?: string;
  currentUser?: string;
  onClaim?: () => Promise<void> | void;
  onUnclaim?: () => Promise<void> | void;
}

export default function GiftCard({
  id,
  title,
  image,
  reveal,
  moreInfo,
  onOpen,
  settings,
  isClaimed = false,
  claimedBy,
  currentUser,
  onClaim,
  onUnclaim
}: GiftCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showClaimConfirm, setShowClaimConfirm] = useState(false);
  const [showUnclaimConfirm, setShowUnclaimConfirm] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isUnclaiming, setIsUnclaiming] = useState(false);
  const [showMoreInfo, setShowMoreInfo] = useState(false);

  // Reset claiming/unclaiming state when isClaimed changes
  useEffect(() => {
    setIsClaiming(false);
    setIsUnclaiming(false);
    setShowClaimConfirm(false);
    setShowUnclaimConfirm(false);
  }, [isClaimed]);

  // Animation speed mapping
  const speedMap = {
    slow: 1.0,
    medium: 0.7,
    fast: 0.4,
  };
  const animDuration = speedMap[settings.animationSpeed];

  // Sparkle count mapping
  const sparkleCountMap = {
    none: 0,
    subtle: 6,
    maximum: 20,
  };
  const sparkleCount = sparkleCountMap[settings.sparkles];

  const handleTap = () => {
    if (!isOpen) {
      // Haptic feedback on tap
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }

      // Play tap sound first
      if (settings.soundEnabled) {
        playTap();
      }

      setIsOpen(true);
      onOpen();

      // Play plop sound on reveal
      if (settings.soundEnabled) {
        setTimeout(() => {
          playPlop();
        }, animDuration * 200); // Delay for reveal timing
      }
    }
  };

  const handleClaim = async () => {
    if (onClaim) {
      setIsClaiming(true);
      await onClaim();

      // Fire confetti!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#ec4899', '#f472b6', '#c084fc']
      });
    }
  };

  const handleUnclaim = async () => {
    if (onUnclaim) {
      setIsUnclaiming(true);
      await onUnclaim();
    }
  };

  // Generate sparkles
  const sparkles = Array.from({ length: sparkleCount }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 100,
    y: Math.random() * -40 - 10,
    delay: Math.random() * 0.2,
  }));

  return (
    <motion.div
      className="relative w-full max-w-sm mx-auto cursor-pointer"
      onClick={!isOpen ? handleTap : undefined}
      whileTap={!isOpen ? { scale: 0.96 } : {}}
    >
      {/* Claimed Badge */}
      {isClaimed && !isOpen && (
        <div className={`absolute -top-3 -right-3 z-10 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg ${
          claimedBy && currentUser && claimedBy === currentUser
            ? 'bg-green-500'
            : 'bg-purple-500'
        }`}>
          {claimedBy && currentUser && claimedBy === currentUser
            ? '✅ Jij geeft dit!'
            : '🎁 Gereserveerd'}
        </div>
      )}

      {/* Closed State - Gift Box */}
      {!isOpen && (
        <motion.div
          className="bg-gradient-to-br from-red-400 to-red-500 rounded-2xl p-8 shadow-lg h-[340px] flex flex-col items-center justify-center"
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <div className="text-7xl mb-4">{image}</div>
          <div className="text-white/80 text-sm mt-2">Tap om te openen!</div>
        </motion.div>
      )}

      {/* Open State - Revealed Content */}
      {isOpen && (
        <motion.div
          className="bg-white rounded-2xl p-8 shadow-xl min-h-[340px] relative flex flex-col"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 20,
            duration: animDuration,
          }}
        >
          {/* Sparkles */}
          {sparkles.map((sparkle) => (
            <motion.div
              key={sparkle.id}
              className="absolute -top-4 left-1/2 pointer-events-none"
              style={{ transform: `translateX(${sparkle.x}%)` }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: [0, 1, 0], y: [10, sparkle.y, sparkle.y - 10] }}
              transition={{ duration: animDuration * 0.8, delay: sparkle.delay }}
            >
              <span className="text-2xl">✨</span>
            </motion.div>
          ))}

          {/* Image/Emoji */}
          <motion.div
            className="text-6xl mb-4 text-center"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: animDuration * 0.3, duration: animDuration * 0.4 }}
          >
            {image}
          </motion.div>

          {/* Title */}
          <motion.h3
            className="text-2xl font-bold text-gray-800 text-center mb-4"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: animDuration * 0.35, duration: animDuration * 0.4 }}
          >
            {title}
          </motion.h3>

          {/* Reveal Text */}
          <motion.div
            className="text-gray-600 text-center text-lg leading-relaxed whitespace-pre-line"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: animDuration * 0.5, duration: animDuration * 0.4 }}
          >
            {reveal}
          </motion.div>

          {/* More Info Section */}
          {moreInfo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: animDuration * 0.6 }}
              className="mt-3"
            >
              {!showMoreInfo ? (
                <button
                  onClick={() => setShowMoreInfo(true)}
                  className="text-purple-500 hover:text-purple-700 text-sm flex items-center gap-1 mx-auto"
                >
                  <span>ℹ️</span>
                  <span className="underline">Meer info</span>
                </button>
              ) : (
                <div className="bg-gray-50 rounded-lg p-3 text-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-gray-700">Details:</span>
                    <button
                      onClick={() => setShowMoreInfo(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>

                  {moreInfo.description && (
                    <p className="text-gray-600 mb-2">{moreInfo.description}</p>
                  )}

                  {moreInfo.links && moreInfo.links.length > 0 && (
                    <div className="space-y-1">
                      {moreInfo.links.map((link, index) => (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:text-purple-800 flex items-center gap-1"
                        >
                          <span>🔗</span>
                          <span className="underline">{link.label}</span>
                        </a>
                      ))}
                    </div>
                  )}

                  {moreInfo.images && moreInfo.images.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {moreInfo.images.map((img, index) => (
                        <a
                          key={index}
                          href={img}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:text-purple-800 flex items-center gap-1"
                        >
                          <span>🖼️</span>
                          <span className="underline">Afbeelding {index + 1}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          <div className="flex-grow" />

          {/* Claim Button */}
          {!isClaimed && !isClaiming && onClaim && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: animDuration * 0.7 }}
              className="mt-auto pt-4"
            >
              {!showClaimConfirm ? (
                <button
                  onClick={() => setShowClaimConfirm(true)}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
                >
                  🎯 Dit ga ik geven!
                </button>
              ) : (
                <div className="bg-purple-50 p-4 rounded-xl">
                  <p className="text-sm text-purple-800 mb-3 text-center">
                    Weet je zeker dat je dit wilt claimen?
                    <br />
                    Hans zal niet weten dat JIJ het geeft! 🤫
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleClaim}
                      className="flex-1 bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600"
                    >
                      Ja, claimen!
                    </button>
                    <button
                      onClick={() => setShowClaimConfirm(false)}
                      className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                    >
                      Annuleer
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Claiming in progress */}
          {isClaiming && (
            <div className="mt-auto pt-4 text-center text-purple-600 font-semibold">
              ⏳ Even geduld...
            </div>
          )}

          {/* Claimed Message */}
          {isClaimed && !isUnclaiming && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-auto"
            >
              {claimedBy && currentUser && claimedBy === currentUser ? (
                // Own claim - show unclaim option
                !showUnclaimConfirm ? (
                  <div className="bg-green-100 p-3 rounded-lg">
                    <p className="text-green-800 text-sm text-center mb-2">✅ Jij geeft dit cadeau!</p>
                    <button
                      onClick={() => setShowUnclaimConfirm(true)}
                      className="w-full text-green-600 text-xs hover:text-green-800 underline"
                    >
                      Toch niet geven?
                    </button>
                  </div>
                ) : (
                  <div className="bg-red-50 p-3 rounded-lg">
                    <p className="text-sm text-red-800 mb-3 text-center">
                      Weet je het zeker?
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleUnclaim}
                        className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 text-sm"
                      >
                        Ja, annuleren
                      </button>
                      <button
                        onClick={() => setShowUnclaimConfirm(false)}
                        className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 text-sm"
                      >
                        Nee, behouden
                      </button>
                    </div>
                  </div>
                )
              ) : (
                // Someone else's claim
                <div className="bg-amber-100 text-amber-800 p-3 rounded-lg text-center text-sm">
                  🎁 Dit cadeau is al gereserveerd
                </div>
              )}
            </motion.div>
          )}

          {/* Unclaiming in progress */}
          {isUnclaiming && (
            <div className="mt-auto pt-4 text-center text-red-600 font-semibold">
              ⏳ Even geduld...
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
