import React, { useState, useEffect, useCallback } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { History, Calendar, Info, RefreshCw } from 'lucide-react';
import { fetchHistoricalAQI, fetchYearlyAQI } from '../services/api';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md border border-slate-200 p-4 rounded-2xl shadow-xl animate-scale-in">
        <p className="text-slate-500 text-xs mb-2 font-medium flex items-center gap-2">
          <Calendar className="w-3 h-3" />
          {payload[0].payload.fullDate || label}
        </p>
        <div className="space-y-1">
          <p className="text-blue-600 font-bold text-lg m-0">
            AQI: <span className="text-slate-800">{payload[0].value}</span>
          </p>
          <p className="text-slate-500 text-xs font-medium">
            PM2.5: <span className="text-slate-700">{payload[0].payload.pm25} µg/m³</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const HistoryPage = ({ city, liveData, cache, yearlyCache, onHistoryUpdate, onYearlyUpdate }) => {
  const [historyState, setHistoryState] = useState({
    data: { 
      weekly: cache?.data?.weekly || [], 
      monthly: cache?.data?.monthly || [], 
      yearly: yearlyCache['Delhi']?.data || [] 
    },
    stationInfo: cache?.stationInfo || { name: '', isStale: false },
    isLoading: !cache,
    error: null,
    selectedYearlyCity: 'Delhi',
    csvCities: yearlyCache['Delhi']?.cities || [],
    isYearlyLoading: false
  });

  // Sync state if cache changes (e.g. from props)
  useEffect(() => {
    if (cache) {
      setHistoryState(prev => ({
        ...prev,
        data: { ...prev.data, weekly: cache.data.weekly, monthly: cache.data.monthly },
        stationInfo: cache.stationInfo,
        isLoading: false
      }));
    }
  }, [cache]);

  useEffect(() => {
    if (yearlyCache[historyState.selectedYearlyCity]) {
      setHistoryState(prev => ({
        ...prev,
        data: { ...prev.data, yearly: yearlyCache[prev.selectedYearlyCity].data },
        csvCities: yearlyCache[prev.selectedYearlyCity].cities
      }));
    }
  }, [historyState.selectedYearlyCity, yearlyCache]);

  const loadHistory = useCallback(async () => {
    // Only fetch if not in cache or if it's a manual refresh
    setHistoryState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await fetchHistoricalAQI(city);
      if (response && response.data && response.data.length > 0) {
        let historyData = response.data;
        
        if (liveData && liveData.currentAQI > 0) {
          const todayLabel = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          const lastPoint = historyData[historyData.length - 1];
          
          if (lastPoint && lastPoint.date === todayLabel) {
            lastPoint.aqi = liveData.currentAQI;
            lastPoint.pm25 = liveData.pollutants.PM25;
            lastPoint.isLive = true;
          } else {
            historyData.push({
              date: todayLabel,
              fullDate: `Today (Live)`,
              timestamp: Date.now() / 1000,
              aqi: liveData.currentAQI,
              pm25: liveData.pollutants.PM25,
              isLive: true
            });
          }
        }
        
        const monthly = historyData.slice(-30);
        const weekly = historyData.slice(-7);
        
        onHistoryUpdate({ weekly, monthly }, {
          name: response.station || 'Unknown Station',
          isStale: response.isStale || false
        });
      } else {
        setHistoryState(prev => ({ ...prev, error: "No historical data found for this location." }));
      }
    } catch (err) {
      setHistoryState(prev => ({ ...prev, error: err.message || "Failed to load historical data." }));
    } finally {
      setHistoryState(prev => ({ ...prev, isLoading: false }));
    }
  }, [city, liveData, onHistoryUpdate]);

  const loadYearlyData = useCallback(async (cityName) => {
    if (yearlyCache[cityName]) return; // Skip if already cached
    
    setHistoryState(prev => ({ ...prev, isYearlyLoading: true }));
    try {
      const response = await fetchYearlyAQI(cityName);
      if (response && response.data) {
        onYearlyUpdate(cityName, response.data, response.cities);
      }
    } catch (err) {
      console.error("Failed to load yearly data:", err);
    } finally {
      setHistoryState(prev => ({ ...prev, isYearlyLoading: false }));
    }
  }, [yearlyCache, onYearlyUpdate]);


  useEffect(() => {
    if (!cache) loadHistory();
  }, [cache, loadHistory]);

  useEffect(() => {
    loadYearlyData(historyState.selectedYearlyCity);
  }, [historyState.selectedYearlyCity, loadYearlyData]);


  // Helper for unique year labels
  // We'll show the year only at the approximate middle of that year's block or first occurrence
  const renderYearTick = (tickProps) => {
    const { x, y, payload } = tickProps;
    const item = historyState.data.yearly[payload.index];
    if (!item) return null;
    
    // Check if this is the first point of this year in the dataset
    const firstIndex = historyState.data.yearly.findIndex(d => d.year === item.year);

    if (payload.index !== firstIndex) return null;

    return (
      <text x={x} y={y + 15} fill="#64748b" textAnchor="middle" fontSize={10} fontWeight={600}>
        {item.year}
      </text>
    );
  };

  if (historyState.isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-100 border-t-blue-500"></div>
          <RefreshCw className="w-6 h-6 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <p className="mt-6 text-slate-500 font-medium animate-pulse text-lg">Fetching history for {city}...</p>
      </div>
    );
  }

  if (historyState.error) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center px-4 min-h-[400px]">
        <div className="bg-red-50 p-6 rounded-3xl mb-6 ring-1 ring-red-100">
          <Info className="w-10 h-10 text-red-500" />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-2">Data Unavailable</h3>
        <p className="text-slate-500 max-w-md mb-8 leading-relaxed">{historyState.error}</p>
        <button
          onClick={loadHistory}
          className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all font-bold shadow-xl shadow-blue-200 hover:-translate-y-0.5"
        >
          <RefreshCw className="w-5 h-5" />
          Retry Fetching
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="glass-panel p-8 border border-slate-200 bg-white shadow-sm overflow-hidden relative">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -mr-32 -mt-32 -z-10"></div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100/50 rounded-xl">
                <History className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Historical AQI Trends</h2>
            </div>
            <div className="space-y-1">
              <p className="text-slate-500 text-sm font-medium">
                City: <span className="text-slate-800 font-bold uppercase">{city}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {historyState.stationInfo.isStale ? (
              <span className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-2xl text-xs font-bold ring-1 ring-amber-100">
                <Info className="w-3.5 h-3.5" />
                HISTORICAL CONTEXT ONLY
              </span>
            ) : (
              <span className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-2xl text-xs font-bold ring-1 ring-green-100">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                LIVE TRENDS
              </span>
            )}
            <button
              onClick={loadHistory}
              className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-slate-100 hover:border-blue-100"
              title="Refresh Data"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {historyState.stationInfo.isStale && (
          <div className="mb-8 p-4 bg-amber-50/50 border border-amber-100 rounded-2xl flex items-start gap-3">

            <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-amber-800 text-sm leading-relaxed">
              <span className="font-bold">Note:</span> No recent data found for {city} in the last 30 days. Displaying the most recent historical data available from this station to provide long-term context.
            </p>
          </div>
        )}

        {/* Weekly Chart */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <h3 className="text-lg font-bold text-slate-700">7-Day Weekly Trend</h3>
          </div>
          <div className="w-full h-[300px] mt-2 group">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={historyState.data.weekly}

                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorAqiWeekly" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 'auto']}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area
                  type="monotone"
                  dataKey="aqi"
                  stroke="#3b82f6"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorAqiWeekly)"
                  animationDuration={1500}
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6', className: 'animate-pulse' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Chart */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <h3 className="text-lg font-bold text-slate-700">30-Day Monthly Trend</h3>
          </div>
          <div className="w-full h-[300px] mt-2 group">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={historyState.data.monthly}

                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorAqiMonthly" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={30}
                />
                <YAxis
                  stroke="#94a3b8"
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 'auto']}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area
                  type="monotone"
                  dataKey="aqi"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorAqiMonthly)"
                  animationDuration={2000}
                  activeDot={{ r: 5, strokeWidth: 0, fill: '#3b82f6' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Yearly Chart Section */}
        <div className="mt-16 pt-10 border-t border-slate-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <h3 className="text-lg font-bold text-slate-700">Yearly Historical Trend</h3>
            </div>

            <div className="w-full md:w-auto">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">
                Select City
              </label>
              <select
                value={historyState.selectedYearlyCity}
                onChange={(e) => setHistoryState(prev => ({ ...prev, selectedYearlyCity: e.target.value }))}
                className="w-full md:w-64 bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3 transition-all outline-none hover:bg-white cursor-pointer"
              >
                {historyState.csvCities.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

            </div>
          </div>

          <div className="w-full h-[300px] mt-2 group relative">
            {historyState.isYearlyLoading && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-20 flex items-center justify-center rounded-2xl">
                <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            )}
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={historyState.data.yearly}

                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorAqiYearly" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="year"
                  stroke="#94a3b8"
                  tick={renderYearTick}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                />
                <YAxis
                  stroke="#94a3b8"
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 'auto']}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area
                  type="monotone"
                  dataKey="aqi"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorAqiYearly)"
                  animationDuration={2500}
                  activeDot={{ r: 5, strokeWidth: 0, fill: '#3b82f6' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HistoryPage;
