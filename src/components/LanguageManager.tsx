import React, { useState, useEffect } from 'react';
import { SUPPORTED_LANGUAGES, LanguageOption, detectDefaultLanguage, TRANSLATIONS } from '../utils/i18n';
import { Globe, Check, MapPin, Sparkles, Navigation } from 'lucide-react';

interface LanguageManagerProps {
  selectedLanguage: string;
  onSelectLanguage: (langCode: string) => void;
}

export const LanguageManager: React.FC<LanguageManagerProps> = ({
  selectedLanguage,
  onSelectLanguage,
}) => {
  const [detectedLocation, setDetectedLocation] = useState<string>('Detecting location...');

  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Browser Default';
      if (tz.includes('Lagos') || tz.includes('Africa/')) {
        setDetectedLocation('Nigeria (West Africa)');
      } else if (tz.includes('New_York') || tz.includes('America/')) {
        setDetectedLocation('North America / USA');
      } else if (tz.includes('Europe/London') || tz.includes('Europe/Paris') || tz.includes('Europe/')) {
        setDetectedLocation('Europe');
      } else if (tz.includes('Tokyo') || tz.includes('Asia/')) {
        setDetectedLocation('Asia / Pacific');
      } else {
        setDetectedLocation(tz);
      }
    } catch (e) {
      setDetectedLocation('Global Client Browser');
    }
  }, []);

  const handleAutoDetect = () => {
    const lang = detectDefaultLanguage();
    onSelectLanguage(lang);
  };

  return (
    <div className="space-y-6 pb-24 md:pb-12 text-slate-900">
      {/* Banner */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-white p-6 sm:p-8 border border-slate-800 shadow-lg rounded-3xl">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-mono uppercase tracking-wider font-bold mb-3 rounded-full">
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            Location & Multilingual Contracts
          </span>
          <h2 className="text-xl sm:text-3xl font-serif font-normal text-white">
            Country Location & Language Switcher
          </h2>
          <p className="text-xs sm:text-sm font-sans text-slate-300 leading-relaxed mt-2">
            Switch contract UI, legal terms, and execution portals into English, Spanish (Español), French (Français), Yoruba, Hausa, Igbo, Japanese (日本語), German (Deutsch), Chinese (中文), Arabic (العربية), Portuguese (Português), Swahili (Kiswahili), or Hindi (हिन्दी)!
          </p>
        </div>
      </div>

      {/* Detected Location Card */}
      <div className="bg-white border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-sans uppercase font-bold text-slate-400 tracking-wider">Detected Country / Location:</span>
            <p className="text-base font-serif font-bold text-slate-900">{detectedLocation}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAutoDetect}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-sans font-bold uppercase tracking-wider transition-all cursor-pointer rounded-xl active:scale-98 shadow-xs"
        >
          <Navigation className="w-3.5 h-3.5 text-white" />
          <span>Auto-Switch Language to Match Location</span>
        </button>
      </div>

      {/* Grid of Languages */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {SUPPORTED_LANGUAGES.map((lang) => {
          const isSelected = lang.code.toLowerCase() === selectedLanguage.toLowerCase();

          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => onSelectLanguage(lang.code)}
              className={`p-4 sm:p-5 border text-left transition-all cursor-pointer flex items-center justify-between rounded-2xl ${
                isSelected
                  ? 'bg-blue-50/80 border-blue-500 shadow-md ring-2 ring-blue-500/30'
                  : 'bg-white border-slate-200 hover:border-slate-400 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{lang.flag}</span>
                <div>
                  <span className="font-serif font-bold text-sm text-slate-900">{lang.nativeName}</span>
                  <p className="text-[11px] font-sans text-slate-500">{lang.name} ({lang.code.toUpperCase()})</p>
                </div>
              </div>

              {isSelected && (
                <span className="p-1 bg-blue-600 text-white rounded-full">
                  <Check className="w-3.5 h-3.5" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
