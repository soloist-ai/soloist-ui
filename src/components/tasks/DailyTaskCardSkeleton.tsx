import React from 'react';

const YELLOW_BORDER = 'rgba(251, 191, 36, 0.2)';
const YELLOW_BG = 'linear-gradient(135deg, rgba(251, 191, 36, 0.06) 0%, rgba(234, 179, 8, 0.04) 100%)';

const DailyTaskCardSkeleton: React.FC = () => (
  <div
    className="relative overflow-hidden h-full flex flex-col rounded-2xl animate-pulse"
    style={{
      background: YELLOW_BG,
      border: `2px solid ${YELLOW_BORDER}`,
      boxShadow: '0 0 12px rgba(251, 191, 36, 0.1)',
    }}
  >
    <div className="relative z-10 p-4 min-h-[155px] h-full flex flex-col">
      <div className="mb-3 flex-grow">
        {/* Title skeleton */}
        <div
          className="h-6 rounded-lg w-4/5 mb-2"
          style={{ background: 'rgba(251, 191, 36, 0.12)' }}
        />
        <div
          className="h-5 rounded-lg w-3/4"
          style={{ background: 'rgba(251, 191, 36, 0.1)' }}
        />
      </div>

      {/* Progress row skeleton */}
      <div className="mt-auto pt-2 space-y-1.5">
        <div className="flex items-center justify-between">
          <div
            className="h-4 rounded w-16"
            style={{ background: 'rgba(251, 191, 36, 0.12)' }}
          />
        </div>
        <div
          className="h-2 w-full rounded-full"
          style={{
            background: 'rgba(251, 191, 36, 0.12)',
            border: '1px solid rgba(251, 191, 36, 0.15)',
          }}
        />
      </div>
    </div>
  </div>
);

export default React.memo(DailyTaskCardSkeleton);
