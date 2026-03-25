import React from 'react';
import { Wind, Shield, BarChart3, Bell, Globe, Brain, ArrowRight, Zap, History } from 'lucide-react';

const LandingPage = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen text-slate-900 font-sans selection:bg-blue-100">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-6 border-b border-white/30 backdrop-blur-md sticky top-0 z-50 bg-white/20">
        <div className="flex items-center gap-3 cursor-pointer group">
          <Wind size={40} className="text-blue-500 group-hover:rotate-12 transition-transform" />
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent m-0 pb-1 leading-none">
              AirAware
            </h1>
            <p className="text-slate-500 text-[10px] font-medium uppercase tracking-tighter m-0">
              Smart AQI Monitoring
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500">
          <a href="#about" className="hover:text-blue-600 transition-colors">About</a>
          <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
          <button
            onClick={onGetStarted}
            className="bg-blue-500 text-white px-5 py-2.5 rounded-full font-bold flex items-center gap-2 hover:bg-blue-600 hover:scale-105 transition-all active:scale-95 shadow-lg shadow-blue-500/20"
          >
            Get Started <ArrowRight size={18} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="px-6 pt-20 pb-32 text-center max-w-5xl mx-auto relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] -z-10"></div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 animate-slide-up text-slate-900 leading-[1.1]">
          Breathe Smarter with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">Smart AirAware</span> Insights
        </h1>

        <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto mb-12 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          AirAware combines real-time sensor data with machine learning to deliver accurate air quality predictions!
        </p>

        <button
          onClick={onGetStarted}
          className="bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-bold flex items-center gap-3 mx-auto hover:bg-blue-700 hover:scale-105 transition-all active:scale-95 shadow-xl shadow-blue-500/25 animate-slide-up"
          style={{ animationDelay: '0.2s' }}
        >
          Get Started Now <ArrowRight size={20} />
        </button>
      </header>

      {/* About Section */}
      <section id="about" className="px-6 py-24 bg-white/30 backdrop-blur-md border-y border-white/50">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6 text-slate-900">About <span className="text-blue-500">AirAware</span></h2>
            <div className="space-y-6 text-slate-600 text-lg">
              <p>
                AirAware is a next-generation air quality monitoring platform built to help communities understand and respond to air pollution in real time.
              </p>
              <p>
                Using machine learning models, we predict pollution levels ahead — empowering individuals and  healthcare providers to make informed decisions that protect public health.
              </p>
            </div>
          </div>

          <div className="glass-panel border-white/50 p-8 rounded-3xl bg-blue-50/40 hover:!bg-blue-100/90 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 relative overflow-hidden group shadow-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/10 transition-colors"></div>
            <h3 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-3">
              <Shield className="text-blue-500" /> Our Mission
            </h3>
            <p className="text-slate-600 mb-8 leading-relaxed text-lg">
              To make air quality data accessible, understandable, and actionable for everyone — because clean air is a fundamental right, not a luxury.
            </p>

          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-32 max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">Powerful <span className="text-blue-500">Features</span></h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={<BarChart3 size={24} className="text-blue-500" />}
            title="Real-Time AQI"
            description="Live air quality index monitoring with data refreshed every 5 minutes from multiple stations."
          />
          <FeatureCard
            icon={<Brain size={24} className="text-blue-500" />}
            title="AI Predictions"
            description="ML-powered forecasts using neural networks trained on historical pollution data."
          />
          <FeatureCard
            icon={<History size={24} className="text-blue-500" />}
            title="Historical Trends"
            description="Access years of historical AQI data across multiple cities for long-term pattern analysis."
          />
          <FeatureCard
            icon={<Shield size={24} className="text-blue-500" />}
            title="Health Guidance"
            description="Activity recommendations tailored to current air quality and health impact categories."
          />
          <FeatureCard
            icon={<Globe size={24} className="text-blue-500" />}
            title="Pollutant Analysis"
            description="Detailed breakdown of PM2.5, PM10, and other key pollutants."
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="max-w-2xl mx-auto bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-10 md:p-12 text-center relative overflow-hidden shadow-2xl shadow-blue-500/30">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Ready to Monitor Your Air?</h2>
          <p className="text-blue-50/80 text-base mb-8 max-w-md mx-auto">
            Start tracking air quality in your area with real-time data and smart predictions.
          </p>

          <button
            onClick={onGetStarted}
            className="bg-white text-blue-600 px-8 py-3.5 rounded-full text-base font-bold flex items-center gap-3 mx-auto hover:scale-105 transition-all active:scale-95 shadow-lg"
          >
            Get Started Now <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-slate-200 text-center text-slate-400 text-sm">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Wind size={32} className="text-blue-500" />
          <div className="text-left">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent block leading-tight">AirAware</span>
            <span className="text-[8px] text-slate-400 uppercase tracking-widest block -mt-1 font-bold">Smart AQI Monitoring</span>
          </div>
        </div>
        <p>&copy; 2026 AirAware System. All rights reserved.</p>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="group p-8 rounded-3xl glass-panel border-white/50 hover:!bg-blue-100/90 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300">
    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-6 group-hover:bg-blue-100 group-hover:scale-110 transition-all">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-4 text-slate-800">{title}</h3>
    <p className="text-slate-500 leading-relaxed">{description}</p>
  </div>
);

export default LandingPage;
