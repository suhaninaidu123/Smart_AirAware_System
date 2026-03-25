import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const data = [
  { day: 'Mon', aqi: 45 },
  { day: 'Tue', aqi: 82 },
  { day: 'Wed', aqi: 110 },
  { day: 'Thu', aqi: 156 },
  { day: 'Fri', aqi: 90 },
  { day: 'Sat', aqi: 65 },
  { day: 'Sun', aqi: 42 },
];

const getColor = (aqi) => {
  if (aqi <= 50) return '#10b981'; // emerald-500
  if (aqi <= 100) return '#f59e0b'; // amber-500
  if (aqi <= 200) return '#ef4444'; // red-500
  return '#8b5cf6'; // violet-500
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    return (
      <div className="bg-white/90 backdrop-blur-md border border-slate-200 p-2 px-3 rounded-lg shadow-lg">
        <p className="text-slate-500 text-xs mb-1 font-medium m-0">{label}</p>
        <p className="font-bold m-0" style={{ color: getColor(val) }}>
          AQI: {val}
        </p>
      </div>
    );
  }
  return null;
};

const WeeklyForecast = () => {
  return (
    <div className="glass-panel col-span-1 md:col-span-2 lg:col-span-3 border border-slate-200 bg-white">
      <h2 className="text-xl font-semibold text-slate-800 m-0">Weekly AQI Forecast</h2>
      
      <div className="w-full h-[250px] mt-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            barSize={40}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis 
              dataKey="day" 
              stroke="#64748b" 
              tick={{ fill: '#64748b', fontSize: 13 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#64748b" 
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(226,232,240,0.5)' }} />
            <Bar dataKey="aqi" radius={[6, 6, 0, 0]} animationDuration={1500}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.aqi)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WeeklyForecast;
