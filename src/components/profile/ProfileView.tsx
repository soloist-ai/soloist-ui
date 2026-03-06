import React, { useState, useEffect, useMemo } from 'react';
import { useSettings } from '../../hooks/useSettings';
import { useLocalization } from '../../hooks/useLocalization';
import type { User } from '../../api';
import SettingsDialog from '../dialogs/SettingsDialog';
import Icon from '../common/Icon';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { ExperienceProgressBar } from '../ui/experience-progress-bar';

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

  const level = useMemo(() => user?.player?.level?.level || 1, [user?.player?.level?.level]);
  const currentExp = useMemo(() => user?.player?.level?.currentExperience || 0, [user?.player?.level?.currentExperience]);
  const maxExp = useMemo(() => user?.player?.level?.experienceToNextLevel || 100, [user?.player?.level?.experienceToNextLevel]);
  const assessment = useMemo(() => user?.player?.level?.assessment || 'F', [user?.player?.level?.assessment]);

  const strength = useMemo(() => user?.player?.strength || 0, [user?.player?.strength]);
  const agility = useMemo(() => user?.player?.agility || 0, [user?.player?.agility]);
  const intelligence = useMemo(() => user?.player?.intelligence || 0, [user?.player?.intelligence]);

  const getAssessmentColor = (a: string) => {
    const map: Record<string, { bg: string; border: string; text: string }> = {
      S: { bg: 'rgba(220, 38, 38, 0.15)', border: 'rgba(220, 38, 38, 0.4)', text: '#e8f4f8' },
      A: { bg: 'rgba(249, 115, 22, 0.15)', border: 'rgba(249, 115, 22, 0.4)', text: '#e8f4f8' },
      B: { bg: 'rgba(234, 179, 8, 0.15)', border: 'rgba(234, 179, 8, 0.4)', text: '#e8f4f8' },
      C: { bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.4)', text: '#e8f4f8' },
      D: { bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.4)', text: '#e8f4f8' },
      E: { bg: 'rgba(148, 163, 184, 0.15)', border: 'rgba(148, 163, 184, 0.4)', text: '#e8f4f8' },
    };
    return map[a] || map.E;
  };

  const assessmentStyle = useMemo(() => getAssessmentColor(assessment), [assessment]);

  if (loading || !user || !isLoaded) {
    return <ProfileSkeleton />;
  }

  const blockStyle = {
    background: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '1rem',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)',
  };

  const sectionTitleStyle = {
    color: '#e8f4f8',
    textShadow: '0 0 8px rgba(180, 220, 240, 0.25)',
  };

  return (
    <>
      <style>{`
        .profile-view .profile-icon-wrapper svg {
          color: inherit;
          fill: none;
          stroke: currentColor;
        }
      `}</style>
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
          <div className="w-full max-w-md mx-auto flex-1 min-h-0 flex flex-col justify-center overflow-hidden profile-content-dense gap-6">

            {/* Settings — только для своего профиля */}
            {isOwnProfile && (
              <button
                onClick={() => setShowSettings(true)}
                className="profile-settings-btn absolute top-20 right-4 md:top-24 md:right-6 z-20 p-2 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
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

            {/* Hero: аватар, уровень, имя, класс */}
            <div className="flex flex-col items-center text-center pt-2 pb-4 md:pb-4 flex-shrink-0 profile-hero">
              <div className="relative flex-shrink-0 mb-4 profile-avatar-wrap">
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
                <div
                  className="absolute -bottom-1 -right-1 rounded-full flex items-center justify-center font-tech font-bold border-2 min-w-[2.25rem] min-h-[2.25rem] w-9 h-9 text-sm"
                  style={{
                    background: 'rgba(18, 18, 22, 0.95)',
                    borderColor: 'rgba(180, 220, 240, 0.35)',
                    color: '#e8f4f8',
                    boxShadow: '0 0 12px rgba(180, 220, 240, 0.2)',
                  }}
                >
                  {level}
                </div>
              </div>
              <h1
                className="text-2xl md:text-3xl font-tech font-bold mb-1 px-2"
                style={{ color: '#e8f4f8', textShadow: '0 0 12px rgba(180, 220, 240, 0.2)' }}
              >
                {user.firstName || ''} {user.lastName || ''}
              </h1>
              {isOwnProfile && user.username && (
                <p className="text-sm font-tech mb-2 md:mb-3 profile-username" style={{ color: 'rgba(220, 235, 245, 0.65)' }}>
                  @{user.username}
                </p>
              )}
              <span
                className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-tech font-bold border-2"
                style={{
                  background: assessmentStyle.bg,
                  borderColor: assessmentStyle.border,
                  color: assessmentStyle.text,
                }}
              >
                {t('profile.stats.class')} {assessment}
              </span>
            </div>

            {/* Блок: Прогресс */}
            <div className="rounded-2xl p-4 md:p-5 flex-shrink-0 profile-block" style={blockStyle}>
              <h2
                className="text-sm font-tech font-bold flex items-center mb-3 profile-block-title"
                style={sectionTitleStyle}
              >
                <span className="mr-2 inline-flex" style={{ color: 'rgba(180, 220, 240, 0.85)' }}><Icon type="star" size={18} /></span>
                {t('profile.stats.progress')}
              </h2>
              <div className="flex justify-between items-center mb-2 profile-block-xp">
                <span className="text-xs font-tech" style={{ color: 'rgba(220, 235, 245, 0.7)' }}>
                  {currentExp} / {maxExp} XP
                </span>
              </div>
              <ExperienceProgressBar
                currentExp={currentExp}
                maxExp={maxExp}
                accentColor="rgba(180, 220, 240, 0.85)"
                height="h-3"
                showPulseGlow={true}
                className="rounded-full"
              />
            </div>

            {/* Блок: Характеристики */}
            <div className="rounded-2xl p-4 md:p-5 flex-shrink-0 profile-block" style={blockStyle}>
              <h2
                className="text-sm font-tech font-bold flex items-center mb-4 profile-block-title"
                style={sectionTitleStyle}
              >
                <span className="mr-2 inline-flex" style={{ color: 'rgba(180, 220, 240, 0.85)' }}><Icon type="target" size={18} /></span>
                {t('profile.stats.characteristics')}
              </h2>
              <div className="grid grid-cols-3 gap-3 profile-chars-grid">
                <div
                  className="rounded-xl p-4 text-center border transition-transform duration-200 hover:scale-[1.02] profile-char-card"
                  style={{
                    background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.08) 0%, rgba(185, 28, 28, 0.04) 100%)',
                    border: '1px solid rgba(220, 38, 38, 0.25)',
                  }}
                >
                  <div className="profile-icon-wrapper flex justify-center mb-2" style={{ color: '#e8f4f8' }}>
                    <Icon type="dumbbell" size={26} />
                  </div>
                  <div className="text-xl font-tech font-bold" style={{ color: '#e8f4f8' }}>
                    {strength}
                  </div>
                  <div className="text-[10px] md:text-xs font-tech mt-0.5" style={{ color: 'rgba(220, 235, 245, 0.7)' }}>
                    {t('profile.stats.strength')}
                  </div>
                </div>
                <div
                  className="rounded-xl p-2 md:p-4 text-center border transition-transform duration-200 hover:scale-[1.02]"
                  style={{
                    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(22, 163, 74, 0.04) 100%)',
                    border: '1px solid rgba(34, 197, 94, 0.25)',
                  }}
                >
                  <div className="profile-icon-wrapper flex justify-center mb-2" style={{ color: '#e8f4f8' }}>
                    <Icon type="zap" size={26} />
                  </div>
                  <div className="text-xl font-tech font-bold" style={{ color: '#e8f4f8' }}>
                    {agility}
                  </div>
                  <div className="text-[10px] md:text-xs font-tech mt-0.5" style={{ color: 'rgba(220, 235, 245, 0.7)' }}>
                    {t('profile.stats.agility')}
                  </div>
                </div>
                <div
                  className="rounded-xl p-2 md:p-4 text-center border transition-transform duration-200 hover:scale-[1.02]"
                  style={{
                    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(147, 51, 234, 0.04) 100%)',
                    border: '1px solid rgba(168, 85, 247, 0.25)',
                  }}
                >
                  <div className="profile-icon-wrapper flex justify-center mb-2" style={{ color: '#e8f4f8' }}>
                    <Icon type="brain" size={26} />
                  </div>
                  <div className="text-xl font-tech font-bold" style={{ color: '#e8f4f8' }}>
                    {intelligence}
                  </div>
                  <div className="text-[10px] md:text-xs font-tech mt-0.5" style={{ color: 'rgba(220, 235, 245, 0.7)' }}>
                    {t('profile.stats.intelligence')}
                  </div>
                </div>
              </div>
            </div>
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
      <div className="w-full max-w-md mx-auto flex-1 min-h-0 flex flex-col justify-center overflow-hidden profile-content-dense gap-6">
        <div className="flex flex-col items-center text-center pt-2 pb-4 profile-hero animate-pulse">
          <div className="relative flex-shrink-0 mb-4 profile-avatar-wrap">
            <div
              className="w-28 h-28 md:w-32 md:h-32 rounded-full"
              style={{ background: 'rgba(255, 255, 255, 0.08)' }}
            />
          </div>
          <div className="h-7 w-48 mb-1" style={{ background: 'rgba(255, 255, 255, 0.08)' }} />
          <div className="h-4 w-24 mb-3" style={{ background: 'rgba(255, 255, 255, 0.08)' }} />
          <div className="h-6 w-16 rounded-full" style={{ background: 'rgba(255, 255, 255, 0.08)' }} />
        </div>

        <div
          className="rounded-2xl p-4 md:p-5 flex-shrink-0 profile-block"
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div className="h-4 w-24 mb-3" style={{ background: 'rgba(255, 255, 255, 0.08)' }} />
          <div className="h-3 w-full rounded-full" style={{ background: 'rgba(255, 255, 255, 0.08)' }} />
        </div>

        <div
          className="rounded-2xl p-4 md:p-5 flex-shrink-0 profile-block"
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div className="h-4 w-32 mb-4" style={{ background: 'rgba(255, 255, 255, 0.08)' }} />
          <div className="grid grid-cols-3 gap-3 profile-chars-grid">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl p-4 text-center profile-char-card">
                <div className="w-8 h-8 mx-auto mb-2 rounded" style={{ background: 'rgba(255, 255, 255, 0.08)' }} />
                <div className="h-5 w-8 mx-auto mb-1" style={{ background: 'rgba(255, 255, 255, 0.08)' }} />
                <div className="h-3 w-12 mx-auto" style={{ background: 'rgba(255, 255, 255, 0.08)' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default ProfileView;
