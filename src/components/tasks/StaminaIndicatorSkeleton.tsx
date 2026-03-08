import React from 'react';

const StaminaIndicatorSkeleton: React.FC = () => (
  <div
    className="relative rounded-xl px-4 pt-4 pb-3 backdrop-blur-md animate-pulse"
    style={{
      background: 'rgba(220, 235, 245, 0.08)',
      border: '1px solid rgba(220, 235, 245, 0.12)',
    }}
  >
    {/* Header skeleton */}
    <div className="flex items-center gap-3 mb-3">
      <div className="flex items-center gap-2">
        <div
          className="w-5 h-5 rounded"
          style={{
            background: 'rgba(220, 235, 245, 0.1)'
          }}
        ></div>
        <div
          className="h-4 w-20 rounded"
          style={{
            background: 'rgba(220, 235, 245, 0.1)'
          }}
        ></div>
      </div>
      <div className="flex-1"></div>
      <div
        className="h-4 w-16 rounded"
        style={{
          background: 'rgba(220, 235, 245, 0.1)'
        }}
      ></div>
    </div>

    {/* Progress bar skeleton */}
    <div className="relative mb-3">
      <div
        className="w-full h-4 rounded-full"
        style={{
          background: 'rgba(220, 235, 245, 0.1)',
        }}
      ></div>
    </div>

    {/* Next regeneration skeleton */}
    <div className="flex items-center justify-between">
      <div
        className="h-3 w-32 rounded"
        style={{
          background: 'rgba(220, 235, 245, 0.1)'
        }}
      ></div>
      <div
        className="h-3 w-16 rounded"
        style={{
          background: 'rgba(220, 235, 245, 0.1)'
        }}
      ></div>
    </div>
  </div>
);

export default StaminaIndicatorSkeleton;
