// Core API Service
// - Global Environmental Network: Primary AQI data
// - Station Feedback System: Secondary pollutant data source

const PRIMARY_API_KEY = import.meta.env.VITE_AIRVISUAL_KEY;
const SECONDARY_API_TOKEN = import.meta.env.VITE_WAQI_TOKEN;

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getStatus = (aqi) => {
  if (aqi <= 50)  return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 200) return 'Poor';
  return 'Severe';
};

const getPollutantName = (code) => {
  const mapping = {
    'p2': 'PM2.5',
    'p1': 'PM10',
    'n2': 'Nitrogen Dioxide (NO2)',
    's2': 'Sulfur Dioxide (SO2)',
    'o3': 'Ozone (O3)',
    'co': 'Carbon Monoxide (CO)'
  };
  return mapping[code] || code;
};

// Returns true if a monitor's timestamp is within the last 24 hours
const isRecent = (stime) => {
  if (!stime) return false;
  const stationTime = new Date(stime).getTime();
  const now         = Date.now();
  return (now - stationTime) < 24 * 60 * 60 * 1000; // 24h in ms
};

// ─── Primary Source: Fetch current AQI ────────────────────────────────────────
const fetchCurrentData = async (city) => {
  const url = `https://api.airvisual.com/v2/city?city=${encodeURIComponent(city)}&state=Maharashtra&country=India&key=${PRIMARY_API_KEY}`;
  const res  = await fetch(url);
  const json = await res.json();
  if (json.status !== 'success') throw new Error(json.data?.message || 'Primary source failed');
  const { city: c, state, country, current } = json.data;
  return {
    aqi:      current.pollution.aqius,
    mainPollutant: getPollutantName(current.pollution.mainus),
    cityName: `${c}, ${state}, ${country}`,
  };
};

// ─── Secondary Source: Find freshest live monitor and return pollutants ───
const fetchSpecificPollutants = async (city) => {
  // Fix: Only use the city name for WAQI search to avoid confusion with full strings
  const simpleCity = city.split(',')[0].trim();
  const searchUrl = `https://api.waqi.info/search/?token=${SECONDARY_API_TOKEN}&keyword=${encodeURIComponent(simpleCity)}`;
  const searchRes  = await fetch(searchUrl);
  const searchJson = await searchRes.json();

  if (searchJson.status !== 'ok' || !searchJson.data?.length) {
    throw new Error('Secondary search returned no data');
  }

  const liveStations = searchJson.data
    .filter(s => isRecent(s.time?.stime))
    .sort((a, b) => new Date(b.time.stime) - new Date(a.time.stime));

  if (!liveStations.length) {
    throw new Error(`No live monitoring found for "${simpleCity}"`);
  }

  const best = liveStations[0];
  console.log(`[Monitoring] Using station: "${best.station?.name}" — updated: ${best.time?.stime}`);

  const feedUrl  = `https://api.waqi.info/feed/@${best.uid}/?token=${SECONDARY_API_TOKEN}`;
  const feedRes  = await fetch(feedUrl);
  const feedJson = await feedRes.json();

  if (feedJson.status !== 'ok') throw new Error('Station data retrieval failed');

  const { iaqi } = feedJson.data;
  const stationName = feedJson.data.city?.name || best.station?.name;
  
  return {
    PM25: iaqi?.pm25?.v ?? null,
    PM10: iaqi?.pm10?.v ?? null,
    NO2:  iaqi?.no2?.v  ?? null,
    SO2:  iaqi?.so2?.v  ?? null,
    CO:   iaqi?.co?.v   ?? null,
    O3:   iaqi?.o3?.v   ?? null,
    stationName
  };
};

// ─── Historical: Fetch historical data for a specific pollutant ───────────────
export const fetchHistoricalAQI = async (city = 'Pune', parameter = 'pm25') => {
  try {
    const url = `http://localhost:5000/history?city=${encodeURIComponent(city)}&parameter=${parameter}`;
    const res = await fetch(url);

    if (!res.ok) {
      const errorJson = await res.json();
      throw new Error(errorJson.error || 'Failed to fetch historical data');
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error(`[History] Error (${parameter}):`, error);
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Monitoring Service Offline. Please restart the application.');
    }
    throw error;
  }
};

export const fetchYearlyAQI = async (city = 'Delhi') => {
  try {
    const url = `http://localhost:5000/yearly?city=${encodeURIComponent(city)}`;
    const res = await fetch(url);
    if (!res.ok) {
      const errorJson = await res.json();
      throw new Error(errorJson.error || 'Failed to fetch trend data');
    }
    return await res.json();
  } catch (error) {
    console.error('[Trend API] Error:', error);
    throw error;
  }
};

// ─── Predictions: Fetch next day forecast ─────────────────────────────────────
export const fetchPredictedAQI = async (city = 'Pune', currentAQI = null) => {
  try {
    // Tier 1: Try AI Prophet Model
    const predictUrl = `http://localhost:5000/predict?city=${encodeURIComponent(city)}`;
    const aiRes = await fetch(predictUrl);
    
    if (aiRes.ok) {
      const aiData = await aiRes.json();
      if (aiData.forecast && aiData.forecast.length > 0) {
        const tomorrow = aiData.forecast[0];
        return {
          aqi: Math.round(tomorrow.aqi),
          status: getStatus(Math.round(tomorrow.aqi))
        };
      }
    }
  } catch {
    console.log('[Prediction] AI Service unavailable, falling back to Trend Analysis');
  }

  // Tier 2: 48h Trend Anchoring (Solves API Discrepancy Gap)
  try {
    const historyData = await fetchHistoricalAQI(city);
    if (!historyData || !historyData.data || historyData.data.length < 2) {
      throw new Error('Insufficient history for trend analysis');
    }

    const data = historyData.data;
    const baseAQI = currentAQI || (data.length > 0 ? data[data.length - 1].aqi : 100);
    
    // Calculate the internal drift in OpenAQ data
    const oaqToday = data[data.length - 1].aqi;
    const oaqYest = data.length > 1 ? data[data.length - 2].aqi : oaqToday;
    const oaqPrev = data.length > 2 ? data[data.length - 3].aqi : oaqYest;

    // Relative Trend Percentage: How much is the air quality shifting?
    // We compare with the average of the last 2 days to get a stable trend
    const oaqRecentAvg = (oaqYest + oaqPrev) / 2;
    const trendMultiplier = oaqToday / oaqRecentAvg;

    // Apply that trend multiplier to the LIVE IQAir value
    let anchoredPrediction = baseAQI * trendMultiplier;
    
    // Sanity check: cap the drift at +/- 20% per day to avoid wild swings
    anchoredPrediction = Math.max(baseAQI * 0.8, Math.min(baseAQI * 1.2, anchoredPrediction));

    const finalAQI = Math.round(anchoredPrediction);

    return {
      aqi: finalAQI,
      status: getStatus(finalAQI)
    };
  } catch (error) {
    console.error('[Prediction] Fallback failed:', error);
    return null;
  }
};

// ─── Main Export ─────────────────────────────────────────────────────────────
export const fetchAQIData = async (city = 'Pune') => {
  try {
    const [primaryResult, secondaryResult] = await Promise.allSettled([
      fetchCurrentData(city),
      fetchSpecificPollutants(city),
    ]);

    let currentAQI = null;
    let cityName   = city;

    if (primaryResult.status === 'fulfilled') {
      currentAQI = primaryResult.value.aqi;
      cityName   = primaryResult.value.cityName;
      console.log(`[Primary Source] AQI: ${currentAQI} for ${cityName}`);
    } else {
      console.warn(`[Primary Source] Failed: ${primaryResult.reason?.message}`);
    }

    let pollutants = { PM25: 0, PM10: 0, NO2: 0, SO2: 0, CO: 0, O3: 0 };
    let secondaryStationName = null;

    if (secondaryResult.status === 'fulfilled') {
      pollutants = secondaryResult.value;
      secondaryStationName = secondaryResult.value.stationName;
      console.log(`[Secondary Source] Using station: ${secondaryStationName}`);
    } else {
      console.warn(`[Secondary Source] Unavailable: ${secondaryResult.reason?.message}`);
    }

    if (currentAQI === null) {
      console.error('[API] Global service offline — no data available');
      return null;
    }

    return {
      currentAQI,
      status: getStatus(currentAQI),
      mainPollutant: primaryResult.status === 'fulfilled' ? primaryResult.value.mainPollutant : 'N/A',
      pollutants,
      cityName,
      secondaryStationName
    };
  } catch (error) {
    console.error('[API] Unexpected error:', error);
    return null;
  }
};
