import React from 'react';
import BrainIcon from '../../assets/icons/brain.svg?react';
import CoinsIcon from '../../assets/icons/coins.svg?react';
import CheckIcon from '../../assets/icons/check.svg?react';
import StarIcon from '../../assets/icons/star.svg?react';
import SettingsIcon from '../../assets/icons/settings.svg?react';
import TargetIcon from '../../assets/icons/target.svg?react';
import WrenchIcon from '../../assets/icons/wrench.svg?react';
import SwordIcon from '../../assets/icons/sword.svg?react';
import CalendarIcon from '../../assets/icons/calendar.svg?react';
import HomeIcon from '../../assets/icons/home.svg?react';
import UserIcon from '../../assets/icons/user.svg?react';
import ClipboardIcon from '../../assets/icons/clipboard.svg?react';
import PlusIcon from '../../assets/icons/plus.svg?react';
import MinusIcon from '../../assets/icons/minus.svg?react';
import SearchIcon from '../../assets/icons/search.svg?react';
import UsersIcon from '../../assets/icons/users.svg?react';
import TrophyIcon from '../../assets/icons/trophy.svg?react';
import CloudLightningIcon from '../../assets/icons/cloud-lightning.svg?react';
import TrendingUpIcon from '../../assets/icons/trending-up.svg?react';
import AwardIcon from '../../assets/icons/award.svg?react';
import DumbbellIcon from '../../assets/icons/dumbbell.svg?react';
import ZapIcon from '../../assets/icons/zap.svg?react';
import SparklesIcon from '../../assets/icons/sparkles.svg?react';
import GlobeIcon from '../../assets/icons/globe.svg?react';
import ArrowLeftRightIcon from '../../assets/icons/arrow-left-right.svg?react';
import GiftIcon from '../../assets/icons/gift.svg?react';
import BagIcon from '../../assets/icons/bag.svg?react';
import Gamepad2Icon from '../../assets/icons/gamepad-2.svg?react';
import ArrowUpIcon from '../../assets/icons/arrow-up.svg?react';
import ArrowDownIcon from '../../assets/icons/arrow-down.svg?react';
import UsersGroupIcon from '../../assets/icons/users-group.svg?react';
import CastleIcon from '../../assets/icons/castle.svg?react';
import DungeonIcon from '../../assets/icons/dungeon-door.svg?react';
import ActiveFireIcon from '../../assets/icons/active-fire.svg?react';
import MenuIcon from '../../assets/icons/menu.svg?react';

export type IconType = 
  | 'brain' 
  | 'coins' 
  | 'check' 
  | 'star' 
  | 'settings' 
  | 'target' 
  | 'wrench' 
  | 'sword' 
  | 'calendar'
  | 'home'
  | 'user'
  | 'clipboard'
  | 'plus'
  | 'minus'
  | 'search'
  | 'users'
  | 'trophy'
  | 'cloud-lightning'
  | 'trending-up'
  | 'award'
  | 'dumbbell'
  | 'zap'
  | 'sparkles'
  | 'clock'
  | 'globe'
  | 'arrow-left-right'
  | 'gift'
  | 'bag'
  | 'gamepad-2'
  | 'arrow-up'
  | 'arrow-down'
  | 'users-group'
  | 'castle'
  | 'dungeon'
  | 'fire'
  | 'menu';

interface IconProps {
  type: IconType;
  className?: string;
  size?: number;
  /** Для type="fire": false — неактивная (серая), true — активная (оранжевая). По умолчанию true. */
  active?: boolean;
}

const Icon: React.FC<IconProps> = ({ type, className = '', size = 24, active = true }) => {
  const iconProps = {
    className,
    style: { width: size, height: size }
  };

  switch (type) {
    case 'brain':
      return <BrainIcon {...iconProps} />;
    case 'coins':
      return <CoinsIcon {...iconProps} />;
    case 'check':
      return <CheckIcon {...iconProps} />;
    case 'star':
      return <StarIcon {...iconProps} />;
    case 'settings':
      return <SettingsIcon {...iconProps} />;
    case 'target':
      return <TargetIcon {...iconProps} />;
    case 'wrench':
      return <WrenchIcon {...iconProps} />;
    case 'sword':
      return <SwordIcon {...iconProps} />;
    case 'calendar':
      return <CalendarIcon {...iconProps} />;
    case 'home':
      return <HomeIcon {...iconProps} />;
    case 'user':
      return <UserIcon {...iconProps} />;
    case 'clipboard':
      return <ClipboardIcon {...iconProps} />;
    case 'plus':
      return <PlusIcon {...iconProps} />;
    case 'minus':
      return <MinusIcon {...iconProps} />;
    case 'search':
      return <SearchIcon {...iconProps} />;
    case 'users':
      return <UsersIcon {...iconProps} />;
    case 'trophy':
      return <TrophyIcon {...iconProps} />;
    case 'cloud-lightning':
      return <CloudLightningIcon {...iconProps} />;
    case 'trending-up':
      return <TrendingUpIcon {...iconProps} />;
    case 'award':
      return <AwardIcon {...iconProps} />;
    case 'dumbbell':
      return <DumbbellIcon {...iconProps} />;
    case 'zap':
      return <ZapIcon {...iconProps} />;
    case 'sparkles':
      return <SparklesIcon {...iconProps} />;
    case 'clock':
      return <CalendarIcon {...iconProps} />;
    case 'globe':
      return <GlobeIcon {...iconProps} />;
    case 'arrow-left-right':
      return <ArrowLeftRightIcon {...iconProps} />;
    case 'gift':
      return <GiftIcon {...iconProps} />;
    case 'bag':
      return <BagIcon {...iconProps} />;
    case 'gamepad-2':
      return <Gamepad2Icon {...iconProps} />;
    case 'arrow-up':
      return <ArrowUpIcon {...iconProps} />;
    case 'arrow-down':
      return <ArrowDownIcon {...iconProps} />;
    case 'users-group':
      return <UsersGroupIcon {...iconProps} />;
    case 'castle':
      return <CastleIcon {...iconProps} />;
    case 'dungeon':
      return <DungeonIcon {...iconProps} />;
    case 'fire': {
      const fireStyle = active
        ? undefined
        : { opacity: 0.7, filter: 'grayscale(1)' };
      return (
        <span style={{ display: 'inline-flex', ...fireStyle }}>
          <ActiveFireIcon {...iconProps} />
        </span>
      );
    }
    case 'menu':
      return <MenuIcon {...iconProps} />;
    default:
      return <div className={className} style={{ width: size, height: size }}>❓</div>;
  }
};

export default Icon;
