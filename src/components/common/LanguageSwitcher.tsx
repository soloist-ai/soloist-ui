import React from 'react';
import { useSettings } from '../../hooks/useSettings';
import { useLocalization } from '../../hooks/useLocalization';

interface LanguageSwitcherProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  className = '', 
  size = 'md' 
}) => {
  const { setLanguage } = useSettings();
  const { t, currentLanguage } = useLocalization();

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
  };

  const handleLanguageChange = (language: 'ru' | 'en') => {
    setLanguage(language);
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <button
        onClick={() => handleLanguageChange('ru')}
        className={`relative rounded-full transition-all duration-200 hover:scale-110 ${
          currentLanguage === 'ru'
            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
            : 'bg-white/60 backdrop-blur-sm text-gray-600 hover:bg-white/80 hover:text-gray-800'
        } ${sizeClasses[size]} flex items-center justify-center font-semibold`}
        title={t('profile.settings.language.russian')}
      >
        🇷🇺
        {currentLanguage === 'ru' && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-green-500"></div>
        )}
      </button>

      <button
        onClick={() => handleLanguageChange('en')}
        className={`relative rounded-full transition-all duration-200 hover:scale-110 ${
          currentLanguage === 'en'
            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
            : 'bg-white/60 backdrop-blur-sm text-gray-600 hover:bg-white/80 hover:text-gray-800'
        } ${sizeClasses[size]} flex items-center justify-center font-semibold`}
        title={t('profile.settings.language.english')}
      >
        🇺🇸
        {currentLanguage === 'en' && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-green-500"></div>
        )}
      </button>
    </div>
  );
};
