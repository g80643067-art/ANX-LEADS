import React from 'react';
import { Compass, Bookmark, ShieldCheck, MapPin, Plus, Globe, FileSpreadsheet } from 'lucide-react';

interface HeaderProps {
  activeTab: 'directory' | 'lead_finder' | 'map' | 'admin' | 'international';
  setActiveTab: (tab: 'directory' | 'lead_finder' | 'map' | 'admin' | 'international') => void;
  savedLeadsCount: number;
  onOpenSavedDrawer: () => void;
  onOpenAddModal: () => void;
  internationalCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  savedLeadsCount,
  onOpenSavedDrawer,
  onOpenAddModal,
  internationalCount = 6,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-stone-900 text-stone-100 border-b border-stone-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Single Wordmark Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('directory')}
            className="flex items-center gap-2.5 text-left focus:outline-none group"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-stone-950 font-bold text-base shadow-sm group-hover:bg-amber-400 transition-colors">
              <Compass className="w-5 h-5 text-stone-950" />
            </div>
            <span className="text-xl font-bold tracking-tight text-stone-100 group-hover:text-amber-400 transition-colors">
              ANX Leads
            </span>
          </button>
          <span className="hidden lg:inline-block text-xs text-stone-400 border-l border-stone-800 pl-3">
            Offline Business & Lead Discovery (No-Website Profiles)
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('lead_finder')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${
              activeTab === 'lead_finder'
                ? 'bg-amber-500 text-stone-950 shadow-xs'
                : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
            }`}
            title="Google Business Lead Finder & Spreadsheet"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Lead Finder</span>
            <span className="text-[10px] bg-stone-950/40 text-amber-300 px-1.5 py-0.2 rounded font-mono font-bold">
              Sheet
            </span>
          </button>

          <button
            onClick={() => setActiveTab('directory')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'directory'
                ? 'bg-stone-800 text-amber-400'
                : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
            }`}
          >
            Local Leads
          </button>

          <button
            onClick={() => setActiveTab('international')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'international'
                ? 'bg-amber-500 text-stone-950 font-semibold'
                : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
            }`}
            title="International Businesses without Websites"
          >
            <Globe className="w-4 h-4" />
            <span>International</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
              activeTab === 'international'
                ? 'bg-stone-950 text-amber-400'
                : 'bg-stone-800 text-amber-300 border border-amber-500/30'
            }`}>
              {internationalCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'map'
                ? 'bg-stone-800 text-amber-400'
                : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span className="hidden sm:inline">Map</span>
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'admin'
                ? 'bg-stone-800 text-amber-400'
                : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="hidden sm:inline">Admin</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenSavedDrawer}
            className="relative inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-stone-200 bg-stone-800 hover:bg-stone-700 hover:text-white border border-stone-700 rounded-lg transition-colors"
            title="View Bookmarked Leads for Export"
          >
            <Bookmark className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Saved Leads</span>
            <span className="font-mono text-xs tabular-nums bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-semibold border border-amber-500/30">
              {savedLeadsCount}
            </span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Business</span>
          </button>
        </div>
      </div>
    </header>
  );
};
