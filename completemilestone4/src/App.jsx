import { useState, useEffect, useCallback } from 'react';
import { Wind, Search } from 'lucide-react';
import './App.css';

// Component imports
import CurrentAQI from './components/CurrentAQI';
import MainPollutant from './components/MainPollutant';
import AQITrendGraph from './components/AQITrendGraph';
import PredictionPanel from './components/PredictionPanel';
import PollutantAnalysis from './components/PollutantAnalysis';
import AlertSystem from './components/AlertSystem';
import WeeklyForecast from './components/WeeklyForecast';
import LandingPage from './components/LandingPage';
import Navbar from './components/Navbar';
import PredictionsPage from './components/PredictionsPage';
import HealthAdvisory from './components/HealthAdvisory';
import PollutantsPage from './components/PollutantsPage';
import HistoryPage from './components/HistoryPage';
import { fetchAQIData, fetchPredictedAQI } from './services/api';


function App() {
  const [showDashboard, setShowDashboard] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("pune");

  const [historicalCache, setHistoricalCache] = useState({});
  const [yearlyCache, setYearlyCache] = useState({});
  
  const handleHistoryUpdate = (city, data, stationInfo) => {
    setHistoricalCache(prev => ({ ...prev, [city]: { data, stationInfo } }));
  };

  const handleYearlyUpdate = (city, data, cities) => {
    setYearlyCache(prev => ({ ...prev, [city]: { data, cities } }));
  };

  const [aqiData, setAqiData] = useState({
    currentAQI: 0,
    status: 'Loading...',
    pollutants: { PM25: 0, PM10: 0, NO2: 0, SO2: 0, CO: 0, O3: 0 },
    cityName: 'Loading...'
  });

  const [isLoading, setIsLoading] = useState(true);

  const getAQIData = useCallback(async () => {
    setIsLoading(true);
    const data = await fetchAQIData(searchQuery);
    if (data) {
      setAqiData(data);
    }
    setIsLoading(false);
  }, [searchQuery]);


  useEffect(() => {
    if (showDashboard) {
      getAQIData();

      // refresh every 5 minutes
      const interval = setInterval(getAQIData, 5 * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [showDashboard, getAQIData]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchQuery(searchInput.trim());
    }
  };

  if (!showDashboard) {
    return <LandingPage onGetStarted={() => setShowDashboard(true)} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'predictions':
        return <PredictionsPage city={searchQuery} currentAQI={aqiData.currentAQI} />;
      case 'history':
        return (
          <HistoryPage 
            city={searchQuery} 
            liveData={aqiData}
            cache={historicalCache[searchQuery]}
            yearlyCache={yearlyCache}
            onHistoryUpdate={(data, info) => handleHistoryUpdate(searchQuery, data, info)}
            onYearlyUpdate={handleYearlyUpdate}
          />
        );
      case 'health':
        return <HealthAdvisory />;
      case 'pollutants':
        return <PollutantsPage data={aqiData} />;
      case 'dashboard':
      default:
        return (
          <main
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up"
            style={{ animationDelay: '0.2s' }}
          >
            {/* Top Section - AQI Overview & Main Pollutant Grid */}
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full">
              <CurrentAQI data={aqiData} />
              <MainPollutant data={aqiData} />
            </div>

            {/* Health Status / Alert Section - Centered */}

            <div className="lg:col-span-3 flex justify-center">
              <AlertSystem aqi={aqiData.currentAQI} />
            </div>
          </main>
        );
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      <Navbar
        onSearch={handleSearch}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        onBackToHome={() => setShowDashboard(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {renderContent()}
    </div>
  );
}

export default App;
