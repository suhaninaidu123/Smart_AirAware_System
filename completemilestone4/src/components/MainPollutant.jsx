import React from 'react';
import { Shield, Droplets, Wind, Zap } from 'lucide-react';

const MainPollutant = ({ data }) => {
  const { status, mainPollutant } = data;

  // Determine hover color and hover effects based on status
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

  return (
    <div className={`glass-panel col-span-1 border border-slate-200 ${bgGradient} ${hoverClasses} transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden flex flex-col items-center justify-center p-8`}>
      <div className="absolute top-4 left-6">
        <h2 className="text-xl font-semibold text-slate-800 m-0">Main Pollutant</h2>
      </div>

      <div className="my-8 flex flex-col items-center relative z-10">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-lg"
          style={{ backgroundColor: `${baseColor}20`, border: `2px solid ${baseColor}40` }}
        >
          <Zap size={40} style={{ color: baseColor }} />
        </div>

        <div className="text-center">
          <div className="text-4xl font-bold text-slate-800 leading-none mb-2">
            {mainPollutant || 'N/A'}
          </div>
          <p className="text-slate-500 font-medium text-sm">
            Current Dominant Factor
          </p>
        </div>
      </div>


      {/* Decorative background element */}
      <div
        className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full blur-3xl opacity-20 z-0 pointer-events-none"
        style={{ backgroundColor: baseColor }}
      />
    </div>
  );
};

export default MainPollutant;
