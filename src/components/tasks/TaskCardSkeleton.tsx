import React from 'react';

const TaskCardSkeleton: React.FC = () => (
  <div 
    className="group relative overflow-hidden cursor-default animate-fadeIn"
    style={{
      background: 'rgba(255, 255, 255, 0.06)',
      backdropFilter: 'blur(20px)',
      border: '2px solid rgba(220, 235, 245, 0.2)',
      borderRadius: '24px',
      boxShadow: `
        0 0 20px rgba(180, 220, 240, 0.15),
        inset 0 0 20px rgba(200, 230, 245, 0.03)
      `,
    }}
  >
    {/* Glowing orbs */}
    <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-xl opacity-10 animate-float" style={{
      background: 'rgba(180, 216, 232, 0.8)'
    }}></div>
    <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full blur-lg opacity-10 animate-float-delayed" style={{
      background: 'rgba(200, 230, 245, 0.6)'
    }}></div>
    
    <div className="relative z-10 p-6 min-h-[280px] flex flex-col">
      {/* Rarity indicator skeleton */}
      <div 
        className="absolute top-6 right-6 w-6 h-6 rounded-full animate-pulse"
        style={{
          background: 'rgba(220, 235, 245, 0.1)'
        }}
      ></div>

      {/* Header skeleton */}
      <div className="mb-6">
        <div 
          className="h-7 rounded-xl mb-3 w-4/5 animate-pulse"
          style={{
            background: 'rgba(220, 235, 245, 0.1)'
          }}
        ></div>
        <div className="space-y-2">
          <div 
            className="h-4 rounded-lg w-full animate-pulse"
            style={{
              background: 'rgba(220, 235, 245, 0.1)'
            }}
          ></div>
          <div 
            className="h-4 rounded-lg w-5/6 animate-pulse"
            style={{
              background: 'rgba(220, 235, 245, 0.1)'
            }}
          ></div>
          <div 
            className="h-4 rounded-lg w-3/4 animate-pulse"
            style={{
              background: 'rgba(220, 235, 245, 0.1)'
            }}
          ></div>
        </div>
      </div>

      {/* Topics skeleton */}
      <div className="flex flex-wrap gap-2 mb-6">
        <div 
          className="h-7 rounded-full w-24 animate-pulse"
          style={{
            background: 'rgba(220, 235, 245, 0.1)',
            border: '1px solid rgba(220, 235, 245, 0.2)',
          }}
        ></div>
        <div 
          className="h-7 rounded-full w-20 animate-pulse"
          style={{
            background: 'rgba(220, 235, 245, 0.1)',
            border: '1px solid rgba(220, 235, 245, 0.2)',
          }}
        ></div>
      </div>

      {/* Status skeleton */}
      <div className="flex items-center justify-between mt-auto">
        <div 
          className="h-1 w-full rounded-full animate-pulse"
          style={{
            background: 'rgba(220, 235, 245, 0.1)'
          }}
        ></div>
      </div>
    </div>
  </div>
);

export default TaskCardSkeleton; 