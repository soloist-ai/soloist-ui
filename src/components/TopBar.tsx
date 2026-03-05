import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../contexts/AppDataContext';
import Icon from './Icon';

const TopBar: React.FC = () => {
  const navigate = useNavigate();
  const { me } = useAppData();
  const photoUrl = me?.photoUrl ?? undefined;
  const dayStreak = me?.player?.dayStreak ?? null;

  const handlePhotoClick = () => {
    navigate('/profile');
  };

  const handleStreakClick = () => {
    navigate('/streak');
  };

  return (
    <>
      <div
        className="app-topbar sticky top-0 left-0 right-0 z-40 flex items-center justify-between h-14 px-4 md:px-6"
        style={{
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(220, 235, 245, 0.12)',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.3)',
        }}
      >
        <button
          type="button"
          onClick={handlePhotoClick}
          className="flex-shrink-0 w-9 h-9 rounded-full overflow-hidden border-2 border-transparent hover:border-[rgba(180,220,240,0.4)] focus:border-[rgba(180,220,240,0.5)] transition-colors focus:outline-none flex items-center justify-center cursor-pointer"
          style={{
            boxShadow: '0 0 12px rgba(180, 220, 240, 0.15)',
          }}
          aria-label="Профиль"
        >
          {photoUrl ? (
            <img
              src={photoUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: 'rgba(220, 235, 245, 0.1)', color: '#8ca3b8' }}
            >
              <Icon type="user" size={22} />
            </div>
          )}
        </button>

        <button
          type="button"
          onClick={handleStreakClick}
          className="flex items-center gap-2 py-2 px-3 rounded-xl border border-transparent hover:border-[rgba(251,146,60,0.4)] focus:border-[rgba(251,146,60,0.5)] transition-colors focus:outline-none cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.12) 0%, rgba(234, 88, 12, 0.08) 100%)',
            boxShadow: '0 0 12px rgba(251, 146, 60, 0.1)',
          }}
          aria-label="Ежедневный стрик"
        >
          <Icon
            type="fire"
            size={22}
            active={dayStreak?.isExtendedToday ?? false}
          />
          <span
            className="text-sm font-tech font-semibold tabular-nums"
            style={{
              color: '#fb923c',
              textShadow: '0 0 6px rgba(251, 146, 60, 0.3)',
            }}
          >
            {dayStreak?.current ?? 0}
          </span>
        </button>
      </div>
    </>
  );
};

export default React.memo(TopBar);
