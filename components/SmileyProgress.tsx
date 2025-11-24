'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { playTink } from '@/lib/sounds';

interface SmileyProgressProps {
  openedCount: number;
  totalCount: number;
  soundEnabled?: boolean;
}

export default function SmileyProgress({ openedCount, totalCount, soundEnabled = false }: SmileyProgressProps) {
  const [prevSmiley, setPrevSmiley] = useState('');

  // Calculate which smiley to show based on progress
  const getSmiley = (count: number, total: number): string => {
    const percentage = (count / total) * 100;

    if (percentage === 0) return '😊';
    if (percentage < 33) return '😀';
    if (percentage < 66) return '😄';
    if (percentage < 100) return '😁';
    return '🤩';
  };

  const currentSmiley = getSmiley(openedCount, totalCount);
  const hasUpgraded = prevSmiley !== '' && prevSmiley !== currentSmiley;

  useEffect(() => {
    if (hasUpgraded && soundEnabled) {
      // Play tink sound on smiley upgrade (only if sound is enabled)
      playTink();
    }
    setPrevSmiley(currentSmiley);
  }, [currentSmiley, hasUpgraded, soundEnabled]);

  return (
    <div className="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl shadow-lg">
      {/* Smiley */}
      <motion.div
        key={currentSmiley}
        className="text-7xl"
        initial={{ scale: 1 }}
        animate={hasUpgraded ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        {currentSmiley}
      </motion.div>

      {/* Message */}
      <div className="text-center">
        <p className="text-gray-700 font-medium text-lg">
          {openedCount === 0 && 'Begin met cadeautjes openen!'}
          {openedCount > 0 && openedCount < totalCount && 'Hans wordt blijer! 😊'}
          {openedCount === totalCount && 'Hans is super blij! 🎉'}
        </p>
      </div>
    </div>
  );
}
