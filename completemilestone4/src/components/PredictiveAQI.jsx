import React from 'react';
import { Sparkles, Info } from 'lucide-react';

const PredictiveAQI = ({ data }) => {
  if (!data) return null;
  const { aqi, status, source, confidence } = data;

  // Determine color based on status (matching CurrentAQI but slightly desaturated/lighter for "future" feel)
  let baseColor = '#10b981'; // Green
  let bgGradient = 'bg-emerald-50/40';
  
  if (status === 'Moderate') {
    baseColor = '#f59e0b'; // Amber
    bgGradient = 'bg-amber-50/40';
  } else if (status === 'Poor') {
    baseColor = '#ef4444'; // Red
    bgGradient = 'bg-red-50/40';
  } else if (status === 'Severe') {
    baseColor = '#8b5cf6'; // Purple
    bgGradient = 'bg-violet-50/40';
  }

  // Calculate percentage for circular progress (assuming max 500)
  const percentage = Math.min((aqi / 500) * 100, 100);
  const strokeDasharray = `${percentage} 100`;

  return (
    <div className={`glass-panel col-span-1 border border-dashed border-slate-300 ${bgGradient} relative overflow-hidden`}>
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold text-slate-700 m-0 flex items-center gap-2">
            Tomorrow's Forecast
            <Sparkles size={16} className="text-indigo-500 animate-pulse" />
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="bg-slate-200/50 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
              {source}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-center flex-col my-8 relative z-10">
        <div className="relative w-[180px] h-[180px]">
          {/* Circular SVG Gauge - Dotted version for "Predicted" */}
          <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="2.5"
              strokeDasharray="2, 1"
            />
            <path
              strokeDasharray={strokeDasharray}
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke={baseColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
              style={{
                filter: `drop-shadow(0 0 4px ${baseColor}40)`
              }}
            />
          </svg>
          
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="text-4xl font-bold text-slate-700 leading-none">
              ~{aqi}
            </div>
            <div 
              className="font-semibold mt-1 uppercase tracking-wider text-[11px]"
              style={{ color: baseColor }}
            >
              {status}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-center gap-2 bg-white/50 py-2 px-3 rounded-lg border border-slate-100">
        <Info size={14} className="text-slate-400" />
        <p className="text-slate-500 text-xs m-0 font-medium">
          {confidence}
        </p>
      </div>

      {/* Subtle indicator of future-ness */}
      <div 
        className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full blur-3xl opacity-10 z-0 pointer-events-none bg-indigo-500"
      />
    </div>
  );
};

export default PredictiveAQI;
