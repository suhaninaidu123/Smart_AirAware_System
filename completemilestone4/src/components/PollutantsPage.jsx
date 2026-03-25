import React, { useState, useEffect } from 'react';
import {
  Wind, Factory, Car, FlaskConical, Thermometer,
  ShieldAlert, Info
} from 'lucide-react';
import {
  AreaChart, Area, ResponsiveContainer, YAxis, Tooltip, XAxis
} from 'recharts';
import { fetchHistoricalAQI } from '../services/api';

const PollutantTrendCard = ({ item, city, liveValue }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const shouldShowGraph = item.name === 'PM2.5' || item.name === 'PM10';

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      try {
        const paramMap = {
          'PM2.5': 'pm25',
          'PM10': 'pm10',
          'O3': 'o3',
          'NO2': 'no2',
          'SO2': 'so2',
          'CO': 'co'
        };
        const res = await fetchHistoricalAQI(city, paramMap[item.name] || 'pm25');
        if (res && res.data) {
          setHistory(res.data.slice(-7));
        }
      } catch (err) {
        console.error(`Error loading history for ${item.name}:`, err);
      } finally {
        setLoading(false);
      }
    };

    if (city) loadHistory();
  }, [city, item.name]);

  return (
    <div className={`glass-panel bg-white border-slate-200 p-6 transition-all duration-300 hover:shadow-2xl flex flex-col group relative overflow-hidden mb-6`}>
      {/* Light Hover Shade Background */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${item.color.replace('/50', '/20')}`} />

      <div className="flex items-center justify-between mb-2 relative z-10">
        <div className="flex items-center gap-4">
          <div className={`p-3 bg-white rounded-xl shadow-sm border border-slate-100 group-hover:scale-110 transition-transform`}>
            {React.cloneElement(item.icon, { size: 28 })}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 m-0">{item.name}</h2>
            <div className="text-slate-500 font-bold text-[10px] tracking-wider uppercase">{item.fullName}</div>
          </div>
        </div>
        <div className="text-right flex items-center gap-6">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Current</div>
            <div className="flex items-center gap-2 justify-end">
              <span className="text-3xl font-black text-slate-800 font-mono">{liveValue}</span>
              <span className="text-sm text-slate-500 font-bold">{item.unit}</span>
            </div>
          </div>
        </div>
      </div>

      {shouldShowGraph && (
        <div className="h-48 w-full mt-4 relative z-10 rounded-xl overflow-hidden border border-slate-100 bg-slate-50/50 p-2">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading History</span>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id={`color-${item.name}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={item.hexColor} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={item.hexColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  dy={5}
                  minTickGap={30}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                />
                <Tooltip
                  cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-800 backdrop-blur-md border border-slate-700 p-3 rounded-xl shadow-2xl text-white">
                          <p className="font-bold text-lg m-0 flex items-center gap-2">
                            {payload[0].value} <span className="text-xs text-slate-400 font-normal">{item.unit}</span>
                          </p>
                          <p className="text-slate-300 text-xs m-0 mt-1">{payload[0].payload.date}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="aqi"
                  stroke={item.hexColor}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill={`url(#color-${item.name})`}
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      )}
    </div>
  );
};

const PollutantsPage = ({ data }) => {
  const currentCity = data?.cityName || 'Pune';

  const pollutants = [
    {
      name: 'PM2.5',
      fullName: 'Particulate Matter < 2.5µm',
      icon: <Wind className="text-blue-500" />,
      unit: 'µg/m³',
      hexColor: '#3b82f6',
      description: 'Fine particles that can penetrate deep into lungs and bloodstream.',
      color: 'bg-blue-50/50',
    },
    {
      name: 'PM10',
      fullName: 'Particulate Matter < 10µm',
      icon: <Wind className="text-cyan-500" />,
      unit: 'µg/m³',
      hexColor: '#06b6d4',
      description: 'Coarser particles that can irritate eyes, nose, and throat.',
      color: 'bg-cyan-50/50',
    },
    {
      name: 'O3',
      fullName: 'Ground-level Ozone',
      icon: <Thermometer className="text-orange-500" />,
      unit: 'ppb',
      hexColor: '#f97316',
      description: 'Created by chemical reactions between NOx and VOC in sunlight.',
      color: 'bg-orange-50/50',
    },
    {
      name: 'NO2',
      fullName: 'Nitrogen Dioxide',
      icon: <Car className="text-red-500" />,
      unit: 'ppb',
      hexColor: '#ef4444',
      description: 'Highly reactive gas primarily formed through fuel burning.',
      color: 'bg-red-50/50',
    },
    {
      name: 'CO',
      fullName: 'Carbon Monoxide',
      icon: <Factory className="text-slate-500" />,
      unit: 'ppm',
      hexColor: '#64748b',
      description: 'Odorless, colorless gas harmful when inhaled in large amounts.',
      color: 'bg-slate-50/50',
    },
    {
      name: 'SO2',
      fullName: 'Sulfur Dioxide',
      icon: <FlaskConical className="text-purple-500" />,
      unit: 'ppb',
      hexColor: '#8b5cf6',
      description: 'Pungent gas released by burning fossil fuels containing sulfur.',
      color: 'bg-purple-50/50',
    }
  ];

  const availablePollutants = pollutants
    .map(p => ({
      ...p,
      liveValue: data?.pollutants?.[p.name.replace('.', '')] ?? 'N/A'
    }))
    .filter(p => p.liveValue !== 'N/A' && p.liveValue !== null);

  const trendPollutants = availablePollutants.filter(
    p => p.name === 'PM2.5' || p.name === 'PM10'
  );

  const currentOnlyPollutants = availablePollutants.filter(
    p => p.name === 'O3' || p.name === 'NO2' || p.name === 'SO2' || p.name === 'CO'
  );

  return (
    <div className="animate-slide-up pb-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500 text-white rounded-2xl shadow-lg shadow-blue-100">
            <Wind size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-slate-800 m-0">Pollutant Trends</h1>
            <p className="text-slate-500 font-medium">Real-time concentrations and 7-day movement for {currentCity}.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col max-w-5xl mx-auto">
        {trendPollutants.map((p, idx) => (
            <PollutantTrendCard
              key={idx}
              item={p}
              city={currentCity}
              liveValue={p.liveValue}
            />
          ))}

        {currentOnlyPollutants.length > 0 && (
          <div className="grid grid-cols-4 gap-4">
            {currentOnlyPollutants.map((p, idx) => (
              <div
                key={idx}
                className="aspect-square rounded-2xl border border-blue-100 bg-violet-50 p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center"
              >
                <div className={`p-3 rounded-xl ${p.color} mb-2.5`}>
                  {React.cloneElement(p.icon, { size: 22 })}
                </div>
                <h3 className="text-lg font-bold text-slate-800 m-0">{p.name}</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1 mb-2.5">{p.fullName}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-[1.65rem] font-black text-slate-800 font-mono leading-none">{p.liveValue}</span>
                  <span className="text-sm font-bold text-slate-500">{p.unit}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State Fallback */}
        {availablePollutants.length === 0 && (
          <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
            <h3 className="text-xl font-bold text-slate-600 mb-2">No Pollutant Data Available</h3>
            <p className="text-slate-500">The current monitoring station is not reporting individual pollutant breakdowns.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default PollutantsPage;

// export default PollutantsPage;
