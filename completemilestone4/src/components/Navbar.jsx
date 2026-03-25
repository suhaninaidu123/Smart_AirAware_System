import React from 'react';
import { Wind, LayoutGrid, History, Brain, HeartPulse, Bell, Settings, Search } from 'lucide-react';

const Navbar = ({ onSearch, searchInput, setSearchInput, onBackToHome, activeTab, setActiveTab }) => {
  return (
    <nav className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm px-6 py-4 flex flex-col lg:flex-row items-center justify-between gap-6 mb-8 animate-slide-up">
      {/* Left Section: Logo & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-8">
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => { setActiveTab('dashboard'); onBackToHome && onBackToHome(); }}
        >
          <Wind size={40} className="text-blue-500 group-hover:rotate-12 transition-transform" />
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent m-0 pb-1">
              AirAware
            </h1>
            <p className="text-slate-500 text-[10px] font-medium uppercase tracking-tighter m-0">
              Smart AQI Monitoring
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={onSearch} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 w-64 shadow-sm focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <input
            type="text"
            placeholder="Search city..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="outline-none px-2 py-0.5 text-sm flex-grow bg-transparent text-slate-700 placeholder:text-slate-400"
          />
          <button
            type="submit"
            className="text-blue-500 hover:text-blue-600 transition p-1"
          >
            <Search size={18} />
          </button>
        </form>
      </div>

      {/* Right Section: Nav Items & Actions */}
      <div className="flex flex-wrap items-center justify-center lg:justify-end gap-8 flex-grow">
        <div className="flex items-center gap-6">
          <NavItem
            icon={<LayoutGrid size={18} />}
            label="Dashboard"
            active={activeTab === 'dashboard'}
            onClick={() => setActiveTab('dashboard')}
          />
          <NavItem
            icon={<History size={18} />}
            label="History"
            active={activeTab === 'history'}
            onClick={() => setActiveTab('history')}
          />
          <NavItem
            icon={<Brain size={18} />}
            label="Predictions"
            active={activeTab === 'predictions'}
            onClick={() => setActiveTab('predictions')}
          />
          <NavItem
            icon={<Wind size={18} />}
            label="Pollutant Analysis"
            active={activeTab === 'pollutants'}
            onClick={() => setActiveTab('pollutants')}
          />
          <NavItem
            icon={<HeartPulse size={18} />}
            label="Health Advisory"
            active={activeTab === 'health'}
            onClick={() => setActiveTab('health')}
          />
        </div>

        <div className="hidden xl:block h-6 w-[1px] bg-slate-200"></div>

        <div className="flex items-center gap-1">
          <IconButton icon={<Bell size={18} />} />
          <IconButton icon={<Settings size={18} />} />
        </div>
      </div>
    </nav>
  );
};

const NavItem = ({ icon, label, active = false, onClick }) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95 ${active ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-blue-500 font-medium'}`}
  >
    <span className={`${active ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-500'}`}>{icon}</span>
    <span className="text-sm whitespace-nowrap">{label}</span>
  </div>
);

const IconButton = ({ icon }) => (
  <button className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-blue-500 transition-all active:scale-90">
    {icon}
  </button>
);

export default Navbar;
