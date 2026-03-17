import React, { useState, useEffect } from 'react';
import { useSettings } from '../../hooks/useSettings';
import { useLocalization } from '../../hooks/useLocalization';
import type { User } from '../../graphql/generated';
import SettingsDialog from '../dialogs/SettingsDialog';
import Icon from '../common/Icon';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';

type ProfileViewProps = {
  user: User | null;
  loading: boolean;
  isOwnProfile?: boolean;
  onUserUpdate?: (user: User) => void;
};

const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  loading,
  isOwnProfile = true,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [contentLoaded, setContentLoaded] = useState(false);
  const { isLoaded } = useSettings();
  const { t } = useLocalization();

  useEffect(() => {
    if (!loading && user) {
      setTimeout(() => setContentLoaded(true), 50);
    }
  }, [loading, user]);

  if (loading || !user || !isLoaded) {
    return <ProfileSkeleton />;
  }

  const blockStyle = {
    background: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '1rem',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)',
  };

  return (
    <>
      <div
        className={`profile-view tab-page-wrapper fixed inset-0 overflow-hidden flex flex-col ${contentLoaded ? 'tab-content-enter-active' : ''}`}
        style={{
          boxSizing: 'border-box',
          opacity: contentLoaded ? 1 : 0,
          transform: contentLoaded ? 'translateY(0)' : 'translateY(10px)',
          transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
        }}
      >
        <div className="tab-inner-content relative z-10 flex-1 min-h-0 flex flex-col pt-16 md:pt-20 px-4 md:px-6 pb-24 overflow-hidden">
          <div className="w-full max-w-md mx-auto flex-1 min-h-0 flex flex-col justify-center overflow-hidden gap-6">

            {/* Settings — only for own profile */}
            {isOwnProfile && (
              <button
                onClick={() => setShowSettings(true)}
                className="absolute top-20 right-4 md:top-24 md:right-6 z-20 p-2 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: 'rgba(220, 235, 245, 0.9)',
                }}
                title={t('profile.settings.title')}
              >
                <Icon type="settings" size={22} />
              </button>
            )}

            {/* Hero: avatar, name */}
            <div className="flex flex-col items-center text-center pt-2 pb-4 flex-shrink-0">
              <div className="relative flex-shrink-0 mb-4">
                <Avatar
                  className="relative w-28 h-28 md:w-32 md:h-32 border-2"
                  style={{
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 0 32px rgba(180, 220, 240, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <AvatarImage src={user.photoUrl || ''} alt="" />
                  <AvatarFallback
                    className="font-tech text-2xl"
                    style={{ background: 'rgba(18, 18, 22, 0.9)', color: '#e8f4f8' }}
                  >
                    {(user.firstName?.[0] || '') + (user.lastName?.[0] || '')}
                  </AvatarFallback>
                </Avatar>
              </div>
              <h1
                className="text-2xl md:text-3xl font-tech font-bold mb-1 px-2"
                style={{ color: '#e8f4f8', textShadow: '0 0 12px rgba(180, 220, 240, 0.2)' }}
              >
                {user.firstName || ''} {user.lastName || ''}
              </h1>
              {isOwnProfile && user.username && (
                <p className="text-sm font-tech mb-2" style={{ color: 'rgba(220, 235, 245, 0.65)' }}>
                  @{user.username}
                </p>
              )}
            </div>

            {/* Language / Settings shortcut block — own profile only */}
            {isOwnProfile && (
              <div className="rounded-2xl p-4 md:p-5 flex-shrink-0" style={blockStyle}>
                <button
                  onClick={() => setShowSettings(true)}
                  className="w-full flex items-center gap-3 transition-opacity hover:opacity-80"
                >
                  <span
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: 'rgba(180, 220, 240, 0.1)',
                      border: '1px solid rgba(180, 220, 240, 0.2)',
                      color: 'rgba(180, 220, 240, 0.85)',
                    }}
                  >
                    <Icon type="settings" size={18} />
                  </span>
                  <span className="font-tech font-medium text-sm" style={{ color: '#e8f4f8' }}>
                    {t('profile.settings.title')}
                  </span>
                  <span className="ml-auto" style={{ color: 'rgba(220, 235, 245, 0.4)' }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                      <path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isOwnProfile && (
        <SettingsDialog isOpen={showSettings} onClose={() => setShowSettings(false)} />
      )}
    </>
  );
};

export const ProfileSkeleton: React.FC = () => (
  <div className="profile-view tab-page-wrapper fixed inset-0 overflow-hidden flex flex-col">
    <div className="tab-inner-content relative z-10 flex-1 min-h-0 flex flex-col pt-16 md:pt-20 px-4 md:px-6 pb-24 overflow-hidden">
      <div className="w-full max-w-md mx-auto flex-1 min-h-0 flex flex-col justify-center gap-6 animate-pulse">
        <div className="flex flex-col items-center text-center pt-2 pb-4">
          <div
            className="w-28 h-28 md:w-32 md:h-32 rounded-full mb-4"
            style={{ background: 'rgba(255, 255, 255, 0.08)' }}
          />
          <div className="h-7 w-48 mb-1 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.08)' }} />
          <div className="h-4 w-24 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.08)' }} />
        </div>
        <div
          className="rounded-2xl p-4 md:p-5"
          style={{ background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
        >
          <div className="h-4 w-32 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.08)' }} />
        </div>
      </div>
    </div>
  </div>
);

export default ProfileView;
