import React from 'react';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Globe,
  AlertCircle,
  CheckCircle2,
  Users,
  Building2,
  Bookmark,
  Layers,
  MapPin,
  Calendar,
} from 'lucide-react';
import { BusinessLeadItem } from '../types/lead';
import { ALL_BUSINESS_CATEGORIES } from '../utils/categoryTemplates';

interface AnalyticsViewProps {
  leads: BusinessLeadItem[];
  savedLeads: BusinessLeadItem[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  leads,
  savedLeads,
}) => {
  const total = leads.length;

  // Website Status Breakdown
  const noWebsiteCount = leads.filter((l) => l.websiteStatus === 'No Website Found').length;
  const websiteFoundCount = leads.filter((l) => l.websiteStatus === 'Website Found').length;
  const noWebsitePct = total > 0 ? Math.round((noWebsiteCount / total) * 100) : 0;
  const websiteFoundPct = total > 0 ? Math.round((websiteFoundCount / total) * 100) : 0;

  // Lead Pipeline Breakdown
  const statusCounts = {
    New: leads.filter((l) => !l.leadStatus || l.leadStatus === 'New').length,
    Contacted: leads.filter((l) => l.leadStatus === 'Contacted').length,
    Interested: leads.filter((l) => l.leadStatus === 'Interested').length,
    'Follow-up': leads.filter((l) => l.leadStatus === 'Follow-up').length,
    Sold: leads.filter((l) => l.leadStatus === 'Sold').length,
  };

  // Category Distribution
  const categoryCounts = ALL_BUSINESS_CATEGORIES.map((cat) => {
    const count = leads.filter((l) => {
      const c = l.category ? l.category.toLowerCase() : '';
      return c.includes(cat.toLowerCase());
    }).length;
    return { category: cat, count };
  }).sort((a, b) => b.count - a.count);

  // City Breakdown
  const cityMap: Record<string, number> = {};
  leads.forEach((l) => {
    const city = (l.location || 'Unknown').split(',')[0].trim();
    if (city) {
      cityMap[city] = (cityMap[city] || 0) + 1;
    }
  });
  const topCities = Object.entries(cityMap)
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // Saved shortlists
  const savedCount = savedLeads.length;
  const outreachEngagementRate =
    total > 0
      ? Math.round(
          ((statusCounts.Contacted +
            statusCounts.Interested +
            statusCounts['Follow-up'] +
            statusCounts.Sold) /
            total) *
            100
        )
      : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-800 text-white rounded-2xl p-6 border border-stone-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-500/30">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Outreach & Market Intelligence</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Lead Analytics & Pipeline Metrics
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 max-w-2xl">
            Real-time breakdown of website opportunity ratios, CRM pipeline velocity, and category density.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-stone-950/70 border border-stone-800 px-4 py-2.5 rounded-xl text-center">
            <span className="block text-[10px] text-stone-400 uppercase font-bold">Engagement Rate</span>
            <span className="text-base font-black text-amber-400">{outreachEngagementRate}%</span>
          </div>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-stone-500 uppercase">Total Leads</span>
          <p className="text-2xl font-black text-stone-900">{total}</p>
          <span className="text-[11px] text-stone-500">Across all searched territories</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-amber-200 bg-amber-50/20 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-amber-800 uppercase">No Website (High Opportunity)</span>
          <p className="text-2xl font-black text-amber-900">{noWebsiteCount}</p>
          <span className="text-[11px] text-amber-700 font-semibold">{noWebsitePct}% total opportunity ratio</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-stone-500 uppercase">Saved in CRM</span>
          <p className="text-2xl font-black text-stone-900">{savedCount}</p>
          <span className="text-[11px] text-stone-500">Targeted for custom pitch</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-stone-500 uppercase">Deals Converted (Sold)</span>
          <p className="text-2xl font-black text-emerald-700">{statusCounts.Sold}</p>
          <span className="text-[11px] text-stone-500">Closed business websites</span>
        </div>
      </div>

      {/* Charts / Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card 1: Website Opportunity Ratio */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-600" />
              <span>Website Presence vs Opportunity</span>
            </h2>
            <span className="text-xs font-bold text-stone-500">{total} leads analyzed</span>
          </div>

          {/* Visual Bar Ratio */}
          <div className="space-y-2">
            <div className="h-4 w-full bg-stone-100 rounded-full overflow-hidden flex shadow-inner">
              <div
                style={{ width: `${noWebsitePct}%` }}
                className="bg-amber-500 transition-all duration-500 flex items-center justify-center text-[10px] font-bold text-stone-950"
                title={`No Website: ${noWebsiteCount} (${noWebsitePct}%)`}
              />
              <div
                style={{ width: `${websiteFoundPct}%` }}
                className="bg-emerald-500 transition-all duration-500 flex items-center justify-center text-[10px] font-bold text-white"
                title={`Website Found: ${websiteFoundCount} (${websiteFoundPct}%)`}
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-amber-500" />
                <span className="font-bold text-stone-800">No Website ({noWebsiteCount})</span>
                <span className="text-stone-500 text-[11px]">({noWebsitePct}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-emerald-500" />
                <span className="font-bold text-stone-800">Has Website ({websiteFoundCount})</span>
                <span className="text-stone-500 text-[11px]">({websiteFoundPct}%)</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-amber-700" />
              <span>Outreach Opportunity Insight</span>
            </p>
            <p className="text-[11px] text-amber-900/90 leading-relaxed">
              <strong>{noWebsiteCount} businesses</strong> have confirmed offline operations and ratings but lack an online website, making them prime candidates for cold WhatsApp website pitches.
            </p>
          </div>
        </div>

        {/* Card 2: CRM Pipeline Stages */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>CRM Lead Pipeline Stages</span>
            </h2>
            <span className="text-xs font-bold text-stone-500">Active tracking</span>
          </div>

          <div className="space-y-3">
            {[
              { label: 'New / Uncontacted', count: statusCounts.New, color: 'bg-stone-400' },
              { label: 'Contacted', count: statusCounts.Contacted, color: 'bg-blue-500' },
              { label: 'Interested', count: statusCounts.Interested, color: 'bg-purple-500' },
              { label: 'Follow-up', count: statusCounts['Follow-up'], color: 'bg-amber-500' },
              { label: 'Converted / Sold', count: statusCounts.Sold, color: 'bg-emerald-600' },
            ].map((stage) => {
              const pct = total > 0 ? Math.round((stage.count / total) * 100) : 0;
              return (
                <div key={stage.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-700">{stage.label}</span>
                    <span className="font-mono font-bold text-stone-900">
                      {stage.count} <span className="text-stone-400 font-normal">({pct}%)</span>
                    </span>
                  </div>
                  <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className={`h-full ${stage.color} rounded-full transition-all duration-500`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card 3: Top Categories */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-600" />
              <span>Category Distribution</span>
            </h2>
            <span className="text-xs text-stone-500">12 categories</span>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {categoryCounts.map((item) => {
              const maxCount = Math.max(...categoryCounts.map((c) => c.count), 1);
              const barWidth = Math.round((item.count / maxCount) * 100);
              return (
                <div key={item.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-800">{item.category}</span>
                    <span className="font-mono font-bold text-stone-700">{item.count} leads</span>
                  </div>
                  <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${barWidth}%` }}
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card 4: Top Territory / City Concentration */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-500" />
              <span>Geographic Concentration</span>
            </h2>
            <span className="text-xs text-stone-500">Top target cities</span>
          </div>

          <div className="space-y-3">
            {topCities.length === 0 ? (
              <p className="text-xs text-stone-500 py-6 text-center">No city data available yet.</p>
            ) : (
              topCities.map((c, idx) => (
                <div
                  key={c.city}
                  className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-150"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-stone-200 text-stone-800 flex items-center justify-center text-xs font-bold font-mono">
                      #{idx + 1}
                    </span>
                    <span className="text-xs font-bold text-stone-900">{c.city}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-amber-100 text-amber-900">
                    {c.count} leads
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
