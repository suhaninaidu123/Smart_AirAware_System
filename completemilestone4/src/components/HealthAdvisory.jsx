import React from 'react';
import {
  HeartPulse, ShieldCheck, Home, Droplets, Apple,
  Dumbbell, Activity, Baby, UserRound, Heart, Wind, Info
} from 'lucide-react';

const HealthAdvisory = () => {
  const categories = [
    {
      range: '0-50',
      label: 'Good',
      color: 'bg-emerald-500',
      text: 'text-emerald-600',
      impact: 'Air quality is satisfactory and poses little or no risk.'
    },
    {
      range: '51-100',
      label: 'Moderate',
      color: 'bg-amber-400',
      text: 'text-amber-600',
      impact: 'Air quality is acceptable. Some pollutants may concern very sensitive individuals.'
    },
    {
      range: '101-150',
      label: 'Unhealthy for Sensitive Groups',
      color: 'bg-orange-500',
      text: 'text-orange-600',
      impact: 'Members of sensitive groups may experience health effects.'
    },
    {
      range: '151-200',
      label: 'Unhealthy',
      color: 'bg-red-500',
      text: 'text-red-600',
      impact: 'Everyone may begin to experience health effects.'
    },
    {
      range: '201-300',
      label: 'Very Unhealthy',
      color: 'bg-purple-600',
      text: 'text-purple-600',
      impact: 'Health alert: everyone may experience more serious health effects.'
    },
    {
      range: '301-500',
      label: 'Hazardous',
      color: 'bg-rose-900',
      text: 'text-rose-900',
      impact: 'Health warning of emergency conditions. Entire population is affected.'
    }
  ];

  const measures = [
    {
      icon: <Home size={20} />,
      title: 'Stay Indoors',
      desc: 'Keep windows closed during high AQI. Use air purifiers to maintain indoor air quality.'
    },
    {
      icon: <ShieldCheck size={20} />,
      title: 'Wear N95 Masks',
      desc: 'Use certified N95/KN95 masks when AQI exceeds 150.'
    },
    {
      icon: <Droplets size={20} />,
      title: 'Stay Hydrated',
      desc: 'Drink plenty of water and warm fluids. Hydration helps your body flush out inhaled toxins.'
    },
    {
      icon: <Apple size={20} />,
      title: 'Antioxidant-Rich Diet',
      desc: 'Consume foods high in Vitamin C, E, and omega-3 fatty acids to combat oxidative stress from pollutants.'
    },
    {
      icon: <Dumbbell size={20} />,
      title: 'Avoid Outdoor Exercise',
      desc: 'Shift workouts indoors when AQI is above 100. Exercise increases respiration rate and pollutant intake.'
    },
    {
      icon: <Activity size={20} />,
      title: 'Regular Health Checkups',
      desc: 'Get periodic lung function tests, especially if you live in high-pollution areas.'
    }
  ];

  const groups = [
    { icon: <Baby size={24} />, title: 'Children', desc: 'Developing lungs are more susceptible. Keep children indoors during poor AQI days.' },
    { icon: <UserRound size={24} />, title: 'Elderly', desc: 'Weakened immune systems increase risk. Monitor for coughing, wheezing, or chest discomfort.' },
    { icon: <Heart size={24} />, title: 'Heart Patients', desc: 'Air pollution can trigger cardiovascular events. Carry medications and avoid exertion.' },
    { icon: <Wind size={24} />, title: 'Asthma/COPD', desc: 'High AQI can cause severe flare-ups. Always carry inhalers and follow action plans.' }
  ];

  return (
    <div className="animate-slide-up pb-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-50">
          <HeartPulse size={32} />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-slate-800 m-0">Health Advisory</h1>
          <p className="text-slate-500 font-medium">Understand AQI categories, health risks and preventive measures to protect yourself and your family!.</p>
        </div>
      </div>

      {/* Categories Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Info className="text-blue-500" size={24} />
          AQI Categories & Health Impact
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, idx) => (
            <div key={idx} className={`glass-panel bg-rose-50/50 border-rose-100/50 p-6 transition-all hover:scale-[1.05] flex flex-col items-center text-center group cursor-default shadow-sm hover:shadow-xl hover:shadow-rose-200/20`}>
              <div className="flex flex-col items-center mb-4">
                <div className={`w-5 h-5 rounded-full ${cat.color} shadow-lg mb-3 group-hover:scale-110 transition-transform`}></div>
                <span className={`font-bold ${cat.text} text-xl leading-tight`}>{cat.label}</span>
                <div className="text-slate-400 font-bold text-xs tracking-widest uppercase mt-2">AQI {cat.range}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Preventive Measures Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <ShieldCheck className="text-emerald-500" size={24} />
          Preventive Measures
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {measures.map((m, idx) => (
            <div key={idx} className="glass-panel bg-rose-50/50 border-rose-100/50 p-6 hover:border-emerald-300 hover:!bg-emerald-100 transition-all group cursor-default shadow-sm hover:shadow-lg">
              <div className="flex gap-4">
                <div className="p-4 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors shrink-0 h-fit">
                  {m.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">{m.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed m-0 font-medium">{m.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Vulnerable Groups Section */}
      <section>
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Heart className="text-rose-500" size={24} />
          Vulnerable Groups
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {groups.map((g, idx) => (
            <div key={idx} className="glass-panel bg-rose-50/50 border-rose-100/50 p-6 text-center hover:border-rose-300 hover:!bg-rose-100 transition-all group cursor-default shadow-sm hover:shadow-lg">
              <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-rose-50 group-hover:text-rose-500 transition-colors">
                {g.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">{g.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed m-0 font-medium">{g.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HealthAdvisory;
