import React, { useState, useCallback, useMemo } from 'react';
import BaseFilter from './BaseFilter';
import { useLocalization } from '../../hooks/useLocalization';

interface FilterOption {
  name: string;
  localization: string;
}

interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  className?: string;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  options,
  selectedValues,
  onSelectionChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLocalization();

  const handleOptionClick = useCallback((e: React.MouseEvent, optionName: string) => {
    e.stopPropagation(); // Предотвращаем всплытие события
    e.preventDefault(); // Предотвращаем стандартное поведение
    const isSelected = selectedValues.includes(optionName);
    const newValues = isSelected
      ? selectedValues.filter(v => v !== optionName)
      : [...selectedValues, optionName];
    onSelectionChange(newValues);
  }, [selectedValues, onSelectionChange]);
  
  const handleOptionMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Предотвращаем всплытие mousedown события
  }, []);

  const displayText = useMemo(() => {
    if (selectedValues.length === 0) {
      return label;
    }
    if (selectedValues.length === 1) {
      const option = options.find(opt => opt.name === selectedValues[0]);
      return option?.localization || selectedValues[0];
    }
    return `${selectedValues.length} ${t('balance.filters.selected')}`;
  }, [selectedValues, options, label, t]);

  const hasValue = useMemo(() => selectedValues.length > 0, [selectedValues.length]);

  const handleClear = useCallback(() => {
    onSelectionChange([]);
  }, [onSelectionChange]);

  const handleToggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <BaseFilter
      label={label}
      displayText={displayText}
      isOpen={isOpen}
      onToggle={handleToggle}
      onClose={handleClose}
      className={className}
      hasValue={hasValue}
      onClear={handleClear}
    >
      <div 
        className="space-y-2 p-2"
        onClick={(e) => e.stopPropagation()} // Предотвращаем всплытие всех кликов внутри контейнера
        onMouseDown={(e) => e.stopPropagation()} // Предотвращаем всплытие mousedown событий
      >
        {options.map((option, index) => {
          const isSelected = selectedValues.includes(option.name);
          return (
            <button
              key={option.name}
              onClick={(e) => handleOptionClick(e, option.name)}
              onMouseDown={handleOptionMouseDown}
              className="w-full flex items-center justify-between px-4 py-3 text-left rounded-xl transition-all duration-300 select-none group hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: isSelected
                  ? 'linear-gradient(135deg, rgba(180, 220, 240, 0.2) 0%, rgba(160, 210, 235, 0.1) 100%)'
                  : 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: isSelected
                  ? '2px solid rgba(180, 220, 240, 0.4)'
                  : '2px solid rgba(220, 235, 245, 0.2)',
                boxShadow: isSelected
                  ? '0 0 15px rgba(180, 220, 240, 0.2)'
                  : 'none'
              }}
            >
              <span 
                className="text-sm md:text-base font-tech font-medium select-text transition-colors duration-200" 
                data-text="true"
                style={{
                  color: isSelected ? '#e8f4f8' : 'rgba(220, 235, 245, 0.8)',
                  textShadow: isSelected ? '0 0 4px rgba(180, 220, 240, 0.3)' : 'none'
                }}
              >
                {option.localization}
              </span>
              {isSelected && (
                <div 
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'rgba(10, 14, 39, 1)',
                    border: '1px solid rgba(34, 197, 94, 0.8)',
                    boxShadow: '0 0 8px rgba(34, 197, 94, 0.5), inset 0 0 8px rgba(34, 197, 94, 0.2)'
                  }}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ 
                    color: 'rgba(34, 197, 94, 0.9)',
                    filter: 'drop-shadow(0 0 4px rgba(34, 197, 94, 0.8))'
                  }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </BaseFilter>
  );
};

// Мемоизируем компонент для предотвращения лишних ре-рендеров
export default React.memo(FilterDropdown);
