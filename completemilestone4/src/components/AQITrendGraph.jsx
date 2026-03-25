import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

// Generate DATE-WISE data for the trend graph
const generateDatewiseData = () => {
  const data = [];
  let baseAQI = 60;

  // Generate data for the last 7 days
  for (let i = 7; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    // Add some random walk for daily averages
    baseAQI += Math.floor(Math.random() * 25) - 12;
    baseAQI = Math.max(20, Math.min(250, baseAQI)); // clamp between 20 and 250

    data.push({
      // Use just month and day (e.g. "Oct 12")
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      aqi: baseAQI,
    });
  }
  return data;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md border border-slate-200 p-3 rounded-xl shadow-lg">
        <p className="text-slate-500 text-xs mb-1 font-medium">{label}</p>
        <p className="text-blue-600 font-bold m-0">
          Daily Avg AQI: <span className="text-slate-800">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

const AQITrendGraph = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    setData(generateDatewiseData());
  }, []);

  return (
    <div className="glass-panel lg:col-span-2 col-span-1 border border-slate-200 bg-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-slate-800 m-0">AQI Trend (Last 7 Days)</h2>
        <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold tracking-wider">HISTORICAL</span>
      </div>

      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorAqiLight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#64748b"
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              minTickGap={40} // Avoid overlapping dates
            />
            <YAxis
              stroke="#64748b"
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="aqi"
              stroke="#3b82f6"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorAqiLight)"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AQITrendGraph;
