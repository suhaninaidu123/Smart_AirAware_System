import React from 'react';
import { Wind, Activity } from 'lucide-react';

const PollutantAnalysis = ({ data }) => {
  const pollutantList = [
    { label: 'PM2.5', value: data?.PM25 || 0, unit: 'µg/m³', color: 'text-blue-500' },
    { label: 'PM10', value: data?.PM10 || 0, unit: 'µg/m³', color: 'text-cyan-500' },
    { label: 'NO2', value: data?.NO2 || 0, unit: 'ppb', color: 'text-orange-500' },
    { label: 'SO2', value: data?.SO2 || 0, unit: 'ppb', color: 'text-purple-500' },
    { label: 'CO', value: data?.CO || 0, unit: 'ppm', color: 'text-red-500' },
    { label: 'O3', value: data?.O3 || 0, unit: 'ppb', color: 'text-emerald-500' }
  ];

  return (
    <div className="glass-panel lg:col-span-2 bg-white/70">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
            <Activity size={20} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Pollutant Analysis</h3>
        </div>
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-1 rounded-md">Live Data</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {pollutantList.map((item, idx) => (
          <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-100 transition-all group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500">{item.label}</span>
              <Wind size={14} className="text-slate-300 group-hover:text-blue-400 transition-colors" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-xl font-black ${item.color}`}>{item.value}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">{item.unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PollutantAnalysis;
