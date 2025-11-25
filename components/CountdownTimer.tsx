'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CountdownTimerProps {
  targetDate: Date;
}

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isPartyTime, setIsPartyTime] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime();

      if (difference <= 0) {
        setIsPartyTime(true);
        return null;
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (isPartyTime) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 text-white text-center"
      >
        <span className="text-2xl font-bold">🎉 Het is feest! 🎉</span>
      </motion.div>
    );
  }

  if (!timeLeft) {
    return null;
  }

  const timeUnits = [
    { value: timeLeft.days, label: 'dagen' },
    { value: timeLeft.hours, label: 'uur' },
    { value: timeLeft.minutes, label: 'min' },
    { value: timeLeft.seconds, label: 'sec' },
  ];

  return (
    <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4">
      <p className="text-sm text-purple-700 text-center mb-3 font-medium">
        Nog te gaan tot het feest:
      </p>
      <div className="flex justify-center gap-3">
        {timeUnits.map((unit, index) => (
          <motion.div
            key={unit.label}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="flex flex-col items-center"
          >
            <div className="bg-white rounded-lg w-14 h-14 flex items-center justify-center shadow-md">
              <span className="text-2xl font-bold text-purple-600">
                {unit.value.toString().padStart(2, '0')}
              </span>
            </div>
            <span className="text-xs text-purple-600 mt-1">{unit.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
