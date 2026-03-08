import React, {useEffect} from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import Icon from '../common/Icon';

type Tab = {
  label: string;
  active: boolean;
  onClick: () => void;
};

type SideDrawerProps = {
  open: boolean;
  tabs: Tab[];
  onClose: () => void;
};

const SideDrawer: React.FC<SideDrawerProps> = ({open, tabs, onClose}) => {
  const { t } = useLocalization();
  
  // Блокируем скролл при открытом drawer
  useEffect(() => {
    if (open) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';

      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [open]);

  // Иконки для табов (можно кастомизировать)
  const getTabIcon = (label: string) => {
    const iconMap: Record<string, string | React.ReactElement> = {
      [t('navigation.welcome')]: <Icon type="home" size={20} className="text-blue-500" />,
      [t('navigation.profile')]: <Icon type="user" size={20} className="text-purple-500" />,
      [t('navigation.balance')]: <Icon type="coins" size={20} className="text-yellow-500" />,
      [t('navigation.tasks')]: <Icon type="clipboard" size={20} className="text-green-500" />,
      [t('navigation.topics')]: <Icon type="target" size={20} className="text-orange-500" />
    };
    return iconMap[label] || <Icon type="home" size={20} className="text-blue-500" />;
  };

  return (
      <>
        {/* Backdrop */}
        <div
            className={`fixed inset-0 overlay-backdrop-soft z-[1000] transition-all duration-300 ${
                open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
            onClick={onClose}
        />

        {/* Side Drawer */}
        <nav
            className={`fixed top-0 left-0 w-[85vw] max-w-[360px] h-full bg-white/95 backdrop-blur-xl shadow-2xl border-r border-white/20 z-[1001] flex flex-col transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                open ? 'translate-x-0' : '-translate-x-full'
            } overflow-hidden`}
        >
          {/* Decorative background elements */}
          <div
              className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 rounded-full blur-3xl -translate-y-8 translate-x-8"></div>
          <div
              className="absolute bottom-20 left-0 w-32 h-32 bg-gradient-to-tr from-pink-400/10 to-orange-400/10 rounded-full blur-2xl translate-y-4 -translate-x-4"></div>

          {/* Header */}
          <div className="relative z-10 pt-16 pb-8 px-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                {t('navigation.title')}
              </h2>
              <button
                  onClick={onClose}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100/50 backdrop-blur-sm hover:bg-gray-200/50 transition-all duration-200 hover:scale-110 group"
              >
                <svg className="w-5 h-5 text-gray-500 group-hover:text-gray-700 transition-colors"
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div
                className="w-16 h-1 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"></div>
          </div>

          {/* Navigation Items */}
          <div className="relative z-10 flex-1 px-4 pb-8 space-y-3 overflow-y-auto">
            {tabs.map((tab, index) => (
                <button
                    key={tab.label}
                    className={`group relative w-full p-4 text-left rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
                        tab.active
                            ? 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 backdrop-blur-sm border border-emerald-200/30 shadow-lg text-gray-800'
                            : 'bg-white/40 backdrop-blur-sm hover:bg-white/60 border border-transparent hover:border-white/30 text-gray-600 hover:text-gray-800'
                    }`}
                    onClick={tab.onClick}
                    style={{
                      animationDelay: `${index * 50}ms`,
                    }}
                >
                  {/* Active indicator */}
                  {tab.active && (
                      <div
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-r-full"></div>
                  )}

                  <div className="flex items-center space-x-4">
                    {/* Icon */}
                    <div className={`text-2xl transition-transform duration-200 ${
                        tab.active ? 'scale-110' : 'group-hover:scale-110'
                    }`}>
                      {getTabIcon(tab.label)}
                    </div>

                    {/* Label */}
                    <div className="flex-1">
                      <div className={`font-semibold transition-colors duration-200 ${
                          tab.active ? 'text-gray-800' : 'text-gray-600 group-hover:text-gray-800'
                      }`}>
                        {tab.label}
                      </div>
                      {tab.active && (
                          <div className="text-xs text-blue-500 font-medium mt-1">
                            {t('common.active')}
                          </div>
                      )}
                    </div>

                    {/* Arrow indicator */}
                    <div className={`transition-all duration-200 ${
                        tab.active ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 group-hover:opacity-60 group-hover:translate-x-0'
                    }`}>
                      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor"
                           viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M9 5l7 7-7 7"/>
                      </svg>
                    </div>
                  </div>

                  {/* Glow effect for active tab */}
                  {tab.active && (
                      <div
                          className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 rounded-2xl blur-xl scale-105 -z-10"></div>
                  )}
                </button>
            ))}
          </div>
        </nav>
      </>
  );
};

export default SideDrawer;