import React from 'react';
import {
  LayoutDashboard,
  Users,
  MessageSquareCode,
  BarChart3,
  Settings,
  Bookmark,
  X,
  ExternalLink,
  ShieldCheck,
  Lock,
  ChevronRight,
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
  onOpenAdmin?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onSelectPage,
  savedLeadsCount,
  onOpenSavedDrawer,
  isMobileOpen,
  onCloseMobile,
  totalLeadsCount,
  onOpenAdmin,
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
          className="lg:hidden p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
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
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
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
            Shortlist & Admin
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

          {/* Secure Admin Portal Link */}
          {onOpenAdmin && (
            <button
              type="button"
              onClick={() => {
                onOpenAdmin();
                onCloseMobile();
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-stone-300 hover:text-white hover:bg-stone-800/80 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Lock className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>Admin Portal</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                /admin
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Footer Info Box */}
      <div className="p-3.5 m-3 rounded-xl bg-stone-950/70 border border-stone-800 text-stone-400 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-stone-300 font-bold text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Outreach Engine Active</span>
          </div>
        </div>
        <p className="text-[11px] text-stone-500 leading-relaxed">
          Category WhatsApp templates & real business discovery pipeline.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 shrink-0 z-30 shadow-xl">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />

          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl z-50 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
