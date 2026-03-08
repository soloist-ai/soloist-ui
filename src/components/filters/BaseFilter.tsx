import React, { useRef, useEffect } from 'react';
import BottomSheet from '../layout/BottomSheet';

interface BaseFilterProps {
  label: string;
  displayText: string;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  hasValue?: boolean;
  onClear?: () => void;
}

const BaseFilter: React.FC<BaseFilterProps> = ({
  label,
  displayText,
  isOpen,
  onToggle,
  onClose,
  children,
  className = '',
  hasValue = false,
  onClear
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Закрытие при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleIconClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasValue && onClear) {
      onClear();
    } else {
      onToggle();
    }
  };

  return (
    <div className={`relative flex-shrink-0 ${className}`} ref={dropdownRef}>
      <button
        onClick={onToggle}
        className="w-full max-w-fit flex items-center px-4 py-3 rounded-xl font-tech font-semibold text-xs md:text-sm transition-all duration-300 hover:scale-[1.01] active:scale-95 select-none"
         style={{
           background: hasValue
             ? 'linear-gradient(135deg, rgba(180, 220, 240, 0.15) 0%, rgba(160, 210, 235, 0.08) 100%)'
             : 'rgba(255, 255, 255, 0.06)',
           backdropFilter: 'blur(20px)',
           border: hasValue
             ? '2px solid rgba(180, 220, 240, 0.4)'
             : '2px solid rgba(220, 235, 245, 0.2)',
           boxShadow: hasValue
             ? '0 0 10px rgba(180, 220, 240, 0.2)'
             : '0 0 10px rgba(180, 220, 240, 0.1)',
           color: '#e8f4f8',
           textShadow: '0 0 4px rgba(180, 220, 240, 0.2)'
         }}
       >
         <span className="truncate select-none" data-text="true">
           {displayText}
         </span>
         <div className="ml-2 flex-shrink-0">
           {hasValue ? (
             <button
               onClick={handleIconClick}
               className="w-4 h-4 flex items-center justify-center rounded-full transition-colors duration-200"
               style={{
                 background: 'rgba(220, 38, 38, 0.2)',
                 border: '1px solid rgba(220, 38, 38, 0.4)'
               }}
             >
               <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'rgba(220, 38, 38, 0.9)' }}>
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
               </svg>
             </button>
           ) : (
             <svg 
               className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
               fill="none" 
               stroke="currentColor" 
               viewBox="0 0 24 24"
               style={{ color: 'rgba(220, 235, 245, 0.8)' }}
             >
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
             </svg>
           )}
         </div>
       </button>

      {/* Всплывающее окно */}
      <BottomSheet
        isOpen={isOpen}
        onClose={onClose}
        title={label}
      >
        {children}
      </BottomSheet>
    </div>
  );
};

export default BaseFilter;
