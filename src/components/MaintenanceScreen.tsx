import React from 'react';
import { useTranslation } from 'react-i18next';
import LogoIcon from '../assets/icons/logo.svg?react';

const MaintenanceScreen: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center min-h-screen"
      style={{
        background: '#000000',
      }}
    >
      {/* Aura effect — в стиле AuthLoadingScreen */}
      <div
        className="absolute top-1/2 left-1/2 rounded-full blur-3xl pointer-events-none"
        style={{
          width: '600px',
          height: '600px',
          transform: 'translate(-50%, -50%)',
          background:
            'radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, rgba(200, 230, 245, 0.05) 30%, transparent 70%)',
          animation: 'maintenanceAura 2s ease-in-out infinite',
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 rounded-full blur-3xl pointer-events-none"
        style={{
          width: '800px',
          height: '800px',
          transform: 'translate(-50%, -50%)',
          background:
            'radial-gradient(circle, rgba(255, 255, 255, 0.04) 0%, rgba(180, 216, 232, 0.03) 40%, transparent 80%)',
          animation: 'maintenanceAura 2.5s ease-in-out infinite',
          animationDelay: '0.3s',
        }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center px-6 max-w-md text-center">
        {/* Логотип с подсветкой в стиле проекта */}
        <div className="relative mb-8" style={{ width: '180px', height: '180px' }}>
          <div
            className="absolute inset-0 rounded-full blur-2xl pointer-events-none opacity-60"
            style={{
              background:
                'radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, rgba(0, 212, 255, 0.08) 50%, transparent 100%)',
              transform: 'scale(1.5)',
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <LogoIcon
              className="maintenance-logo"
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        </div>

        <h1
          className="text-xl font-semibold text-[#e0e7ff] mb-3"
          style={{
            fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
            textShadow: '0 0 20px rgba(0, 212, 255, 0.3)',
          }}
        >
          {t('maintenance.title')}
        </h1>
        <p
          className="text-sm text-[#a0aec0] leading-relaxed"
          style={{ fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}
        >
          {t('maintenance.description')}
        </p>

        {/* Акцентная линия в стиле neon */}
        <div
          className="mt-6 h-px w-24 rounded-full"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.6), transparent)',
            boxShadow: '0 0 12px rgba(0, 212, 255, 0.4)',
          }}
        />
      </div>

      <style>{`
        @keyframes maintenanceAura {
          0%, 100% {
            opacity: 0.3;
            transform: translate(-50%, -50%) scale(0.9);
          }
          50% {
            opacity: 0.7;
            transform: translate(-50%, -50%) scale(1.1);
          }
        }
        .maintenance-logo {
          filter: drop-shadow(0 0 12px rgba(255, 255, 255, 0.4)) drop-shadow(0 0 24px rgba(0, 212, 255, 0.2));
        }
        .maintenance-logo path {
          fill: #e8e8e8;
        }
      `}</style>
    </div>
  );
};

export default MaintenanceScreen;
