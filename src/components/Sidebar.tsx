import React from 'react';
import {
  LayoutDashboard,
  Users,
  MessageSquareCode,
  BarChart3,
  Settings,
  Bookmark,
  X,
} from 'lucide-react';

export type NavPage = 'dashboard' | 'leads' | 'menu' | 'analytics' | 'settings';

interface SidebarProps {
  activePage: NavPage;
  onSelectPage: (page: NavPage) => void;
  savedLeadsCount: number;
  onOpenSavedDrawer: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  totalLeadsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onSelectPage,
  savedLeadsCount,
  onOpenSavedDrawer,
  isMobileOpen,
  onCloseMobile,
  totalLeadsCount,
}) => {
  const navItems: { id: NavPage; label: string; icon: React.FC<{ className?: string }>; badge?: string | number }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard / Home',
      icon: LayoutDashboard,
    },
    {
      id: 'leads',
      label: 'Leads',
      icon: Users,
      badge: totalLeadsCount > 0 ? totalLeadsCount : undefined,
    },
    {
      id: 'menu',
      label: 'Menu',
      icon: MessageSquareCode,
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  const handleNavClick = (page: NavPage) => {
    onSelectPage(page);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-stone-900 text-stone-200 border-r border-stone-800">
      {/* Brand Header */}
      <div className="p-5 border-b border-stone-800/90 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-400 text-stone-950 flex items-center justify-center font-black text-sm shadow-md shadow-amber-500/20">
            ANX
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-base tracking-tight text-white">ANX Leads</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-400 text-stone-950 uppercase">
                PRO CRM
              </span>
            </div>
            <p className="text-[11px] text-stone-400 font-medium">B2B Outreach & Discovery</p>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          type="button"
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-stone-500">
          Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer group ${
                isActive
                  ? 'bg-amber-500 text-stone-950 shadow-sm font-bold'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-stone-950' : 'text-stone-400 group-hover:text-amber-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    isActive
                      ? 'bg-stone-950/20 text-stone-950'
                      : 'bg-stone-800 text-stone-400 group-hover:text-stone-200 border border-stone-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Saved CRM Quick Access */}
        <div className="pt-4 mt-4 border-t border-stone-800/80 space-y-1.5">
          <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-stone-500">
            Shortlist
          </div>
          <button
            type="button"
            onClick={() => {
              onOpenSavedDrawer();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-stone-300 hover:text-white hover:bg-stone-800/80 transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Bookmark className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <span>Saved Shortlist</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {savedLeadsCount}
            </span>
          </button>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="p-4 border-t border-stone-800/90 text-[11px] text-stone-500 space-y-1">
        <div className="flex items-center justify-between font-semibold text-stone-400">
          <span>ANX Leads</span>
          <span className="text-amber-400 font-mono">v3.0</span>
        </div>
        <p className="text-[10px] text-stone-500 leading-tight">
          Local business lead generation & WhatsApp outreach engine
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 shrink-0 select-none z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Backdrop & Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
