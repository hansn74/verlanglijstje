'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export interface Settings {
  animationSpeed: 'slow' | 'medium' | 'fast';
  theme: 'gradient' | 'minimal' | 'playful' | 'dark';
  sparkles: 'none' | 'subtle' | 'maximum';
  soundEnabled: boolean;
}

interface SettingsPanelProps {
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
}

export default function SettingsPanel({ settings, onSettingsChange }: SettingsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <>
      {/* Settings Button */}
      <motion.button
        className="fixed bottom-6 right-6 bg-gray-800 text-white p-4 rounded-full shadow-lg z-50 hover:bg-gray-700"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="text-2xl">⚙️</span>
      </motion.button>

      {/* Settings Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 overflow-y-auto"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold">A/B Test Settings</h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                {/* Animation Speed */}
                <div className="mb-8">
                  <h3 className="font-semibold text-gray-800 mb-3">⚡ Animatie Snelheid</h3>
                  <div className="space-y-2">
                    {(['slow', 'medium', 'fast'] as const).map((speed) => (
                      <button
                        key={speed}
                        onClick={() => updateSetting('animationSpeed', speed)}
                        className={`w-full p-3 rounded-lg text-left transition-colors ${
                          settings.animationSpeed === speed
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {speed === 'slow' && '🐌 Langzaam (1.0s)'}
                        {speed === 'medium' && '⚡ Normaal (0.7s)'}
                        {speed === 'fast' && '🚀 Snel (0.4s)'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Theme */}
                <div className="mb-8">
                  <h3 className="font-semibold text-gray-800 mb-3">🎨 Kleurthema</h3>
                  <div className="space-y-2">
                    {(['gradient', 'minimal', 'playful', 'dark'] as const).map((theme) => (
                      <button
                        key={theme}
                        onClick={() => updateSetting('theme', theme)}
                        className={`w-full p-3 rounded-lg text-left transition-colors ${
                          settings.theme === theme
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {theme === 'gradient' && '🌈 Gradient (blauw/roze)'}
                        {theme === 'minimal' && '⚪ Minimaal (wit)'}
                        {theme === 'playful' && '🎉 Speels (colors!)'}
                        {theme === 'dark' && '🌙 Donker'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sparkles */}
                <div className="mb-8">
                  <h3 className="font-semibold text-gray-800 mb-3">✨ Sparkle Level</h3>
                  <div className="space-y-2">
                    {(['none', 'subtle', 'maximum'] as const).map((level) => (
                      <button
                        key={level}
                        onClick={() => updateSetting('sparkles', level)}
                        className={`w-full p-3 rounded-lg text-left transition-colors ${
                          settings.sparkles === level
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {level === 'none' && '⭕ Geen sparkles'}
                        {level === 'subtle' && '✨ Subtiel (5-8)'}
                        {level === 'maximum' && '💫 Maximum (20+)'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sound Toggle */}
                <div className="mb-8">
                  <h3 className="font-semibold text-gray-800 mb-3">🔊 Geluid</h3>
                  <button
                    onClick={() => updateSetting('soundEnabled', !settings.soundEnabled)}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      settings.soundEnabled
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {settings.soundEnabled ? '🔊 Aan' : '🔇 Uit'}
                  </button>
                </div>

                {/* Info */}
                <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
                  <p className="font-semibold mb-1">💡 Test Modus</p>
                  <p>
                    Gebruik dit panel om verschillende varianten te testen en te zien wat het
                    lekkerst voelt!
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
