import React from 'react';
import PredictionPanel from './PredictionPanel';
import { Brain } from 'lucide-react';

const PredictionsPage = ({ city, currentAQI }) => {
  return (
    <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
      <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-800 m-0 mb-2 flex items-center gap-3">
            <Brain size={36} className="text-indigo-600" />
            AQI Predictions
          </h1>
          <p className="text-slate-500 font-medium">
            Advanced forecasting air quality for major Indian cities.
          </p>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="w-full max-w-xl">
          <PredictionPanel initialCity={city} liveAQI={currentAQI} />
        </div>
      </div>
    </div>
  );
};

export default PredictionsPage;
