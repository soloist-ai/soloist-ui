import React from 'react';
import { useLocalization } from '../../hooks/useLocalization';

interface ResetFiltersButtonProps {
  onClick: () => void;
  className?: string;
}

const ResetFiltersButton: React.FC<ResetFiltersButtonProps> = ({ onClick, className = '' }) => {
  const { t } = useLocalization();

  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center px-4 py-3 rounded-xl font-tech font-semibold text-xs md:text-sm transition-all duration-300 hover:scale-[1.01] active:scale-95 whitespace-nowrap flex-shrink-0 ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.15) 0%, rgba(185, 28, 28, 0.08) 100%)',
        border: '1px solid rgba(220, 38, 38, 0.4)',
        color: '#e8f4f8',
        boxShadow: '0 0 10px rgba(220, 38, 38, 0.2)',
        textShadow: '0 0 4px rgba(220, 38, 38, 0.2)'
      }}
    >
      {t('common.resetFilters')}
    </button>
  );
};

export default ResetFiltersButton;

