'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface NameSelectModalProps {
  users: string[];
  onSelect: (name: string) => void;
}

export default function NameSelectModal({ users, onSelect }: NameSelectModalProps) {
  const [customName, setCustomName] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customName.trim()) {
      onSelect(customName.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
      >
        <h2 className="text-2xl font-bold mb-2 text-center">Wie ben je? 👋</h2>
        <p className="text-gray-600 mb-6 text-center">
          Kies je naam om te zien welke cadeaus je hebt geclaimd
        </p>

        {/* User buttons */}
        {users.length > 0 && !showCustomInput && (
          <div className="flex flex-wrap gap-3 justify-center mb-6">
            {users.map((user) => (
              <button
                key={user}
                onClick={() => onSelect(user)}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-md"
              >
                {user}
              </button>
            ))}
          </div>
        )}

        {/* Divider */}
        {users.length > 0 && !showCustomInput && (
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-gray-400 text-sm">of</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>
        )}

        {/* Custom name input */}
        {!showCustomInput ? (
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-2">Nieuw hier?</p>
            <button
              onClick={() => setShowCustomInput(true)}
              className="w-full px-4 py-3 border-2 border-dashed border-gray-300 text-gray-600 rounded-xl hover:border-purple-400 hover:text-purple-600 transition-colors"
            >
              + Voeg je naam toe
            </button>
          </div>
        ) : (
          <form onSubmit={handleCustomSubmit}>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Je naam..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl mb-4 focus:border-purple-500 focus:outline-none text-lg"
              autoFocus
            />
            <div className="flex gap-3">
              {users.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomInput(false);
                    setCustomName('');
                  }}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
                >
                  Terug
                </button>
              )}
              <button
                type="submit"
                disabled={!customName.trim()}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Doorgaan
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
