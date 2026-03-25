import React from 'react';

const CurrentAQI = ({ data }) => {
  const { currentAQI, status, cityName } = data;

  // Determine color based on status
  let baseColor = '#10b981'; // Green
  let bgGradient = 'bg-emerald-50';
  let hoverClasses = 'hover:!bg-emerald-100/40 hover:border-emerald-300 hover:shadow-emerald-500/10';
  
  if (status === 'Moderate') {
    baseColor = '#f59e0b'; // Amber
    bgGradient = 'bg-amber-50';
    hoverClasses = 'hover:!bg-amber-100/40 hover:border-amber-300 hover:shadow-amber-500/10';
  } else if (status === 'Poor') {
    baseColor = '#ef4444'; // Red
    bgGradient = 'bg-red-50';
    hoverClasses = 'hover:!bg-red-100/40 hover:border-red-300 hover:shadow-red-500/10';
  } else if (status === 'Severe') {
    baseColor = '#8b5cf6'; // Purple
    bgGradient = 'bg-violet-50';
    hoverClasses = 'hover:!bg-violet-100/40 hover:border-violet-300 hover:shadow-violet-500/10';
  }

  // Calculate percentage for circular progress (assuming max 500)
  const percentage = Math.min((currentAQI / 500) * 100, 100);
  const strokeDasharray = `${percentage} 100`;

  return (
    <div className={`glass-panel col-span-1 border border-slate-200 ${bgGradient} ${hoverClasses} transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden`}>
      <div>
        <h2 className="text-xl font-semibold text-slate-800 m-0">Current AQI</h2>
        {cityName && cityName !== 'Loading...' && (
          <p className="text-slate-500 text-sm m-0 mt-1 truncate" title={cityName}>
            {cityName}
          </p>
        )}
      </div>
      
      <div className="flex items-center justify-center flex-col my-8 relative z-10">
        <div className="relative w-[200px] h-[200px]">
          {/* Circular SVG Gauge */}
          <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
            {/* Background track (light grey for light theme) */}
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="3"
            />
            {/* Value track */}
            <path
              strokeDasharray={strokeDasharray}
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke={baseColor}
              strokeWidth="3"
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
              style={{
                filter: `drop-shadow(0 0 6px ${baseColor}60)`
              }}
            />
          </svg>
          
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="text-5xl font-bold text-slate-800 leading-none">
              {currentAQI}
            </div>
            <div 
              className="font-semibold mt-1 uppercase tracking-wider text-sm"
              style={{ color: baseColor }}
            >
              {status}
            </div>
          </div>
        </div>
      </div>
      
      <p className="text-slate-500 text-sm text-center mt-4">
        Last updated just now
      </p>

      {/* Decorative gradient blur in background */}
      <div 
        className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-20 z-0 pointer-events-none"
        style={{ backgroundColor: baseColor }}
      />
    </div>
  );
};

export default CurrentAQI;
