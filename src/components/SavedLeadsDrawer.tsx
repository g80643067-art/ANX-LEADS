import React from 'react';
import {
  X,
  Download,
  Printer,
  Trash2,
  Bookmark,
  ExternalLink,
  Phone,
  MapPin,
  FileSpreadsheet,
  AlertCircle,
} from 'lucide-react';
import { BusinessProfile } from '../types/business';
import { exportBusinessesToCsv, exportBusinessesToJson } from '../utils/storage';

interface SavedLeadsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedBusinesses: BusinessProfile[];
  onRemoveLead: (id: string) => void;
  onClearAll: () => void;
  onSelectBusiness: (biz: BusinessProfile) => void;
  onOpenPrintSheet?: () => void;
}

export const SavedLeadsDrawer: React.FC<SavedLeadsDrawerProps> = ({
  isOpen,
  onClose,
  savedBusinesses,
  onRemoveLead,
  onClearAll,
  onSelectBusiness,
  onOpenPrintSheet,
}) => {
  if (!isOpen) return null;

  const noWebsiteCount = savedBusinesses.filter((b) => !b.hasWebsite).length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-950/60 backdrop-blur-xs">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-5 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Bookmark className="w-4 h-4 fill-amber-400" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Saved Lead Pipeline</h2>
                <p className="text-xs text-stone-400">
                  <span className="font-mono tabular-nums font-semibold text-amber-300">
                    {savedBusinesses.length}
                  </span>{' '}
                  businesses shortlisted for outreach
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Metrics Bar */}
          {savedBusinesses.length > 0 && (
            <div className="bg-amber-50/70 px-5 py-2.5 border-b border-amber-200/60 flex items-center justify-between text-xs text-amber-900">
              <span className="font-medium">
                🎯 <strong className="font-mono">{noWebsiteCount}</strong> offline targets (No website)
              </span>
              <button
                onClick={onClearAll}
                className="text-stone-500 hover:text-rose-600 font-medium underline flex items-center gap-1"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Action Toolbar for Exporting */}
          {savedBusinesses.length > 0 && (
            <div className="p-4 bg-stone-50 border-b border-stone-200 grid grid-cols-3 gap-2 text-xs">
              <button
                onClick={() => exportBusinessesToCsv(savedBusinesses)}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 rounded-lg font-semibold shadow-xs transition-colors"
                title="Export leads to formatted CSV for Excel / Google Sheets"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>CSV</span>
              </button>

              <button
                onClick={() => exportBusinessesToJson(savedBusinesses)}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 rounded-lg font-semibold shadow-xs transition-colors"
                title="Export leads in JSON format"
              >
                <Download className="w-4 h-4 text-blue-600" />
                <span>JSON</span>
              </button>

              <button
                onClick={onOpenPrintSheet}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-semibold shadow-xs transition-colors"
                title="Printable field canvassing sheet"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>Print Sheet</span>
              </button>
            </div>
          )}

          {/* Leads List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {savedBusinesses.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-500 space-y-3">
                <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                  <Bookmark className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-800">No Leads Saved Yet</h3>
                  <p className="text-xs text-stone-500 mt-1 max-w-xs">
                    Click the bookmark icon on any business card to save leads to this list for bulk CSV export or canvassing.
                  </p>
                </div>
              </div>
            ) : (
              savedBusinesses.map((biz) => (
                <div
                  key={biz.id}
                  className="p-3.5 bg-white rounded-xl border border-stone-200 hover:border-stone-300 shadow-xs flex flex-col justify-between space-y-2.5 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">
                        {biz.category}
                      </div>
                      <h4
                        onClick={() => onSelectBusiness(biz)}
                        className="text-sm font-bold text-stone-900 hover:text-amber-700 cursor-pointer line-clamp-1"
                      >
                        {biz.name}
                      </h4>
                    </div>

                    <button
                      onClick={() => onRemoveLead(biz.id)}
                      className="text-stone-400 hover:text-rose-600 p-1 transition-colors"
                      title="Remove lead from saved list"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Metadata line */}
                  <div className="text-xs text-stone-500 space-y-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate">
                        {biz.address}, {biz.city}, {biz.country || 'India'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 font-mono">
                      <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>{biz.phone}</span>
                    </div>
                  </div>

                  {/* Status & view button */}
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                    {!biz.hasWebsite ? (
                      <span className="font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Offline Target
                      </span>
                    ) : (
                      <span className="text-stone-500">Has Website</span>
                    )}

                    <button
                      onClick={() => onSelectBusiness(biz)}
                      className="text-stone-900 font-semibold hover:text-amber-700 flex items-center gap-1"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
