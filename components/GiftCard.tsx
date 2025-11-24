'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import type { Settings } from './SettingsPanel';
import { playPlop, playTap } from '@/lib/sounds';

interface GiftCardProps {
  id: number;
  title: string;
  image: string;
  reveal: string;
  onOpen: () => void;
  settings: Settings;
  isClaimed?: boolean;
  onClaim?: () => void;
}

export default function GiftCard({
  id,
  title,
  image,
  reveal,
  onOpen,
  settings,
  isClaimed = false,
  onClaim
}: GiftCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showClaimConfirm, setShowClaimConfirm] = useState(false);

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

  const handleClaim = () => {
    if (onClaim) {
      onClaim();
      setShowClaimConfirm(false);
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
        <div className="absolute -top-3 -right-3 z-10 bg-purple-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
          🎯 Gereserveerd
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
          <div className="text-7xl mb-4">🎁</div>
          <div className="text-white/80 text-sm mt-2">Tap om te openen!</div>
        </motion.div>
      )}

      {/* Open State - Revealed Content */}
      {isOpen && (
        <motion.div
          className="bg-white rounded-2xl p-8 shadow-xl h-[340px] relative flex flex-col"
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

          {/* Checkmark Badge */}
          <motion.div
            className="absolute -top-3 -right-3 bg-green-500 rounded-full w-8 h-8 flex items-center justify-center shadow-lg"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ delay: animDuration * 0.4, duration: animDuration * 0.4 }}
          >
            <span className="text-white text-lg">✓</span>
          </motion.div>

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
            className="text-gray-600 text-center text-lg leading-relaxed whitespace-pre-line flex-grow"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: animDuration * 0.5, duration: animDuration * 0.4 }}
          >
            {reveal}
          </motion.div>

          {/* Claim Button */}
          {!isClaimed && onClaim && (
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

          {/* Claimed Message */}
          {isClaimed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-purple-100 text-purple-800 p-3 rounded-lg text-center text-sm mt-auto"
            >
              ✅ Dit cadeau is al gereserveerd door iemand anders!
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
