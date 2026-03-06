import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TextType from '../components/common/TextType';
import { useLocalization } from '../hooks/useLocalization';
import { cn } from '../utils';

type WelcomeTabProps = {
  canStartAnimation?: boolean;
};

const WelcomeTab: React.FC<WelcomeTabProps> = ({ canStartAnimation = true }) => {
  const navigate = useNavigate();
  const { t } = useLocalization();
  const [contentVisible, setContentVisible] = useState(false);

  // Показываем контент и монтируем TextType только после закрытия экрана загрузки + 1 кадр
  useEffect(() => {
    if (!canStartAnimation) return;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setContentVisible(true);
      });
    });
    return () => cancelAnimationFrame(id);
  }, [canStartAnimation]);

  const handleStartGame = () => {
    navigate('/tasks');
  };

  return (
    <div
      className="tab-page-wrapper fixed inset-0 flex flex-col items-center justify-center overflow-hidden px-4"
      style={{ boxSizing: 'border-box', zIndex: 1 }}
    >
      {/* Центр: только анимированный заголовок + подзаголовок + кнопка, без рамки */}
      <div
        className={cn(
          'relative w-full max-w-2xl flex flex-col items-center text-center transition-all duration-700 ease-out',
          contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        )}
      >
        <div className="welcome-hero-title min-h-[3rem] sm:min-h-[4rem] md:min-h-[4.5rem] flex items-center justify-center mb-4 md:mb-6">
          {contentVisible ? (
            <TextType
              key="welcome-title-animated"
              text={[t('welcome.title')]}
              typingSpeed={80}
              initialDelay={200}
              pauseDuration={2000}
              showCursor={true}
              cursorCharacter="_"
              loop={false}
              className="font-tech font-bold uppercase tracking-[0.12em] md:tracking-[0.18em] !whitespace-nowrap text-3xl sm:text-4xl md:text-5xl lg:text-6xl"
              textColors={['#e8f4f8']}
            />
          ) : (
            <span className="font-tech font-bold uppercase tracking-[0.12em] md:tracking-[0.18em] whitespace-nowrap text-3xl sm:text-4xl md:text-5xl lg:text-6xl opacity-0" style={{ color: '#e8f4f8' }} aria-hidden>
              _
            </span>
          )}
        </div>
        <style>{`
          .welcome-hero-title span {
            color: #e8f4f8 !important;
            letter-spacing: 0.08em;
            white-space: nowrap !important;
          }
        `}</style>

        <p
          className="font-tech text-sm md:text-base tracking-wide leading-relaxed text-balance max-w-md mb-8 md:mb-10"
          style={{ color: 'rgba(220, 235, 245, 0.8)' }}
        >
          {t('welcome.subtitle')}
        </p>

        <button
          type="button"
          onClick={handleStartGame}
          className="w-full max-w-xs py-3 px-6 rounded-xl font-tech font-semibold text-sm tracking-[0.15em] uppercase transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(180,220,240,0.15)] active:scale-[0.98]"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(180, 220, 240, 0.3)',
            color: '#e8f4f8',
            boxShadow: '0 0 16px rgba(180, 220, 240, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
          }}
        >
          {t('welcome.startButton')}
        </button>
      </div>

      <p
        className={cn(
          'absolute bottom-8 left-4 right-4 text-center font-tech text-[10px] md:text-xs tracking-wide transition-opacity duration-500',
          contentVisible ? 'opacity-100' : 'opacity-0'
        )}
        style={{ color: 'rgba(220, 235, 245, 0.4)' }}
      >
        {t('welcome.feedback.text')}{' '}
        <span className="font-mono font-semibold" style={{ color: 'rgba(180, 220, 240, 0.55)' }}>
          {t('welcome.feedback.command')}
        </span>
      </p>
    </div>
  );
};

export default WelcomeTab;
