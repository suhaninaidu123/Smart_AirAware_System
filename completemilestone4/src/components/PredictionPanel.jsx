import React, { useEffect, useState } from 'react';
import { Clock, Search, Calendar } from 'lucide-react';

const FORECAST_CACHE_TTL_MS = 30 * 60 * 1000;

const getAQICategory = (aqi) => {
  if (!Number.isFinite(aqi)) return { label: 'Unknown', textClass: 'text-slate-500' };

  if (aqi <= 50) return { label: 'Good', textClass: 'text-emerald-600' };
  if (aqi <= 100) return { label: 'Moderate', textClass: 'text-yellow-600' };
  if (aqi <= 150) return { label: 'Unhealthy for Sensitive Groups', textClass: 'text-orange-700' };
  if (aqi <= 200) return { label: 'Unhealthy', textClass: 'text-red-600' };
  if (aqi <= 300) return { label: 'Very Unhealthy', textClass: 'text-purple-600' };
  return { label: 'Hazardous', textClass: 'text-rose-900' };
};

const PredictionPanel = ({ initialCity = '', liveAQI = null }) => {
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [loading, setLoading] = useState(false);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState(null);

  const normalizeSevenDayForecast = (rawForecast) => {
    if (!Array.isArray(rawForecast)) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const normalized = rawForecast
      .map((item) => {
        const rawDate = item.date ?? item.ds;
        const rawAqi = item.aqi ?? item.yhat;
        const dateObj = new Date(rawDate);
        return {
          date: rawDate,
          aqi: Number(rawAqi),
          dateObj
        };
      })
      .filter((item) => Number.isFinite(item.aqi) && !Number.isNaN(item.dateObj.getTime()))
      .filter((item) => {
        const d = new Date(item.dateObj);
        d.setHours(0, 0, 0, 0);
        return d > today;
      })
      .sort((a, b) => a.dateObj - b.dateObj)
      .slice(0, 7)
      .map(({ date, aqi }) => ({ date, aqi }));

    return normalized;
  };

  const calibrateWithLiveAQI = (normalizedForecast, currentAqi) => {
    if (!Array.isArray(normalizedForecast) || normalizedForecast.length === 0) return [];
    if (!Number.isFinite(currentAqi)) return normalizedForecast;

    const base = Math.max(0, Math.min(500, Math.round(currentAqi)));
    const firstPredicted = normalizedForecast[0].aqi;

    return normalizedForecast.map((day) => {
      const relativeDelta = day.aqi - firstPredicted;
      const anchoredAqi = Math.max(0, Math.min(500, Math.round(base + relativeDelta)));
      return { ...day, aqi: anchoredAqi };
    });
  };

  const getCachedForecast = (cityName) => {
    const key = `forecast_cache_${cityName.toLowerCase()}`;
    const cachedRaw = sessionStorage.getItem(key);
    if (!cachedRaw) return null;

    try {
      const parsed = JSON.parse(cachedRaw);
      if (!parsed.timestamp || !Array.isArray(parsed.forecast)) return null;
      const age = Date.now() - parsed.timestamp;
      if (age > FORECAST_CACHE_TTL_MS) {
        sessionStorage.removeItem(key);
        return null;
      }
      return parsed.forecast;
    } catch {
      sessionStorage.removeItem(key);
      return null;
    }
  };

  const setCachedForecast = (cityName, nextForecast) => {
    const key = `forecast_cache_${cityName.toLowerCase()}`;
    sessionStorage.setItem(key, JSON.stringify({
      timestamp: Date.now(),
      forecast: nextForecast
    }));
  };

  const fetchPrediction = async (cityName, preferCache = true) => {
    if (!cityName) return;

    const normalizedCity = cityName.trim();
    if (preferCache) {
      const cached = getCachedForecast(normalizedCity);
      if (cached && cached.length >= 7) {
        setForecast(cached);
        setError(null);
        return;
      }
    }

    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({ city: normalizedCity });
      if (Number.isFinite(liveAQI)) {
        query.set('base_aqi', String(Math.round(liveAQI)));
      }

      const response = await fetch(`http://localhost:5000/predict?${query.toString()}`);
      const data = await response.json();
      if (response.ok) {
        const normalizedForecast = normalizeSevenDayForecast(data.forecast);
        const sevenDayForecast = calibrateWithLiveAQI(normalizedForecast, liveAQI);
        if (sevenDayForecast.length < 7) {
          setError('Forecast service returned fewer than 7 future days. Please try again shortly.');
          setForecast([]);
          return;
        }
        setForecast(sevenDayForecast);
        setCachedForecast(normalizedCity, sevenDayForecast);
      } else {
        setError(data.error || 'Failed to fetch prediction');
        setForecast([]);
      }
    } catch (err) {
      setError('Connection refused. Please ensure the Python server (api/app.py) is running on port 5000.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const city = (initialCity || '').trim();
    setSelectedCity(city);
    if (city) {
      fetchPrediction(city);
    } else {
      setForecast([]);
      setError(null);
    }
  }, [initialCity]);

  const handleCityChange = (e) => {
    setSelectedCity(e.target.value);
    if (!e.target.value.trim()) {
      setForecast([]);
      setError(null);
    }
  };

  const handleSearch = () => {
    const city = selectedCity.trim();
    if (!city) {
      setError('Please enter a city name.');
      setForecast([]);
      return;
    }
    fetchPrediction(city, false);
  };

  return (
    <div className="glass-panel col-span-1 flex flex-col border border-slate-200 min-h-[500px]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-slate-800 m-0"> AQI Forecast</h2>
        
      </div>

      {/* City Search */}
      <div className="mb-6 flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all shadow-sm font-medium text-slate-700"
            placeholder="Enter any city name..."
            value={selectedCity}
            onChange={handleCityChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch();
            }}
          />
          <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
        </div>
        <button
          onClick={handleSearch}
          className="px-4 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm"
        >
          Search
        </button>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <p className="text-sm font-medium animate-pulse">Computing forecast...</p>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4 bg-red-50/30 rounded-2xl border border-dashed border-red-200">
            <div className="p-3 bg-red-100 text-red-600 rounded-full mb-3">
              <Clock size={24} />
            </div>
            <p className="text-red-600 text-sm font-semibold mb-1">Wait, something went wrong</p>
            <p className="text-slate-500 text-xs max-w-[200px]">{error}</p>
          </div>
        ) : forecast.length > 0 ? (
          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
            <div className="space-y-2">
              <div className="grid grid-cols-[minmax(0,1.6fr)_110px_minmax(0,1fr)] items-center gap-4 px-4 pb-2 border-b border-slate-100">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 m-0">Date</p>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 m-0 text-center">Predicted AQI</p>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 m-0 text-right">Category</p>
              </div>

              {forecast.map((day, idx) => {
                const category = getAQICategory(day.aqi);
                return (
                <div key={idx} className="grid grid-cols-[minmax(0,1.6fr)_110px_minmax(0,1fr)] items-center gap-4 px-4 py-3.5 bg-white rounded-xl border border-slate-100 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md group">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 bg-slate-50 text-slate-400 rounded-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <Calendar size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-slate-700 m-0">
                        {new Date(day.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric' })}
                      </p>
                      <p className="text-[10px] text-slate-400 m-0 uppercase font-semibold tracking-wider">
                        {new Date(day.date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className={`text-xl font-black m-0 leading-none tabular-nums ${category.textClass}`}>
                      {Math.round(day.aqi)}
                    </p>
                  </div>

                  <div className="text-right min-w-0">
                    <p className={`text-[11px] font-bold m-0 leading-none ${category.textClass} truncate`}>
                      {category.label}
                    </p>
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-center px-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 transition-transform hover:scale-110">
                <Clock size={32} className="opacity-20" />
            </div>
            <p className="text-sm font-semibold text-slate-500 m-0">No City Selected</p>
            <p className="text-xs text-slate-400 mt-1">Type any city name above to view the 7-day forecast</p>
            
            <div className="mt-8 grid grid-cols-2 gap-2 w-full">
                {['Delhi', 'Mumbai', 'Bengaluru', 'Chennai'].map(c => (
                    <button 
                        key={c}
                        onClick={() => { setSelectedCity(c); fetchPrediction(c); }}
                        className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-[11px] text-slate-500 font-medium hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all font-bold"
                    >
                        {c}
                    </button>
                ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default PredictionPanel;
