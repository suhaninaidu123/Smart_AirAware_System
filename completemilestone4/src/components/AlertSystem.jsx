import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

const AlertSystem = ({ aqi }) => {
  const getAlertConfig = (aqiValue) => {
    if (aqiValue > 300) return {
      level: 'hazardous',
      message: 'Health warning of emergency conditions. Entire population is affected.',
      bgClass: 'bg-rose-950',
      borderClass: 'border-rose-900',
      textClass: 'text-rose-100',
      iconClass: 'text-rose-500',
      shadowClass: 'shadow-xl shadow-rose-900/40',
      animationClass: 'animate-pulse-critical'
    };
    if (aqiValue > 200) return {
      level: 'very_unhealthy',
      message: 'Health alert: everyone may experience more serious health effects.',
      bgClass: 'bg-purple-50',
      borderClass: 'border-purple-500',
      textClass: 'text-purple-700',
      iconClass: 'text-purple-600',
      shadowClass: 'shadow-lg shadow-purple-100',
      animationClass: 'animate-slide-up'
    };
    if (aqiValue > 150) return {
      level: 'unhealthy',
      message: 'Everyone may begin to experience health effects.',
      bgClass: 'bg-red-50',
      borderClass: 'border-red-500',
      textClass: 'text-red-700',
      iconClass: 'text-red-600',
      shadowClass: 'shadow-lg shadow-red-100',
      animationClass: 'animate-slide-up'
    };
    if (aqiValue > 100) return {
      level: 'sensitive',
      message: 'Members of sensitive groups may experience health effects.',
      bgClass: 'bg-orange-50',
      borderClass: 'border-orange-500',
      textClass: 'text-orange-700',
      iconClass: 'text-orange-600',
      shadowClass: 'shadow-lg shadow-orange-100',
      animationClass: 'animate-slide-up'
    };
    if (aqiValue > 50) return {
      level: 'moderate',
      message: 'Air quality is acceptable. Some pollutants may concern very sensitive individuals.',
      bgClass: 'bg-amber-50',
      borderClass: 'border-amber-400',
      textClass: 'text-amber-700',
      iconClass: 'text-amber-600',
      shadowClass: 'shadow-md shadow-amber-50',
      animationClass: 'animate-slide-up'
    };
    if (aqiValue > 0) return {
      level: 'good',
      message: 'Air quality is satisfactory and poses little or no risk.',
      bgClass: 'bg-emerald-50',
      borderClass: 'border-emerald-500',
      textClass: 'text-emerald-700',
      iconClass: 'text-emerald-600',
      shadowClass: 'shadow-md shadow-emerald-50',
      animationClass: 'animate-slide-up'
    };
    return null;
  };

  const alert = getAlertConfig(aqi);

  return (
    <div 
      className={`flex items-center gap-3 p-3 px-5 border rounded-xl max-w-[500px] ${alert.bgClass} ${alert.borderClass} ${alert.shadowClass} ${alert.animationClass}`}
    >
      <div className={alert.iconClass}>
        {['hazardous', 'very_unhealthy', 'unhealthy'].includes(alert.level) ? <AlertTriangle size={24} /> : 
         ['sensitive', 'moderate'].includes(alert.level) ? <Info size={24} /> : 
         <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center animate-bounce">
           <div className="w-2 h-2 rounded-full bg-white"></div>
         </div>}
      </div>
      <div className="flex-1">
        <h4 className={`m-0 mb-1 text-sm font-bold ${alert.iconClass}`}>
          {alert.level === 'hazardous' ? 'HAZARDOUS' : 
           alert.level === 'very_unhealthy' ? 'VERY UNHEALTHY' : 
           alert.level === 'unhealthy' ? 'UNHEALTHY' : 
           alert.level === 'sensitive' ? 'UNHEALTHY FOR SENSITIVE GROUPS' : 
           alert.level === 'moderate' ? 'MODERATE' : 'HEALTH STATUS: GOOD'}
        </h4>
        <p className={`m-0 text-xs leading-relaxed font-medium ${alert.textClass}`}>
          {alert.message}
        </p>
      </div>
    </div>
  );
};

export default AlertSystem;
