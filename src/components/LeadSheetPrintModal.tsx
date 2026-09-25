import React from 'react';
import { X, Printer } from 'lucide-react';
import { BusinessProfile } from '../types/business';

interface LeadSheetPrintModalProps {
  businesses: BusinessProfile[];
  onClose: () => void;
}

export const LeadSheetPrintModal: React.FC<LeadSheetPrintModalProps> = ({ businesses, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 print:p-0 print:bg-white">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden print:border-none print:shadow-none print:rounded-none">
        {/* Modal Controls (Hidden in print) */}
        <div className="p-4 bg-stone-900 text-white flex items-center justify-between print:hidden">
          <div>
            <h3 className="text-sm font-bold">Field Canvassing & Lead Sheet</h3>
            <p className="text-xs text-stone-400">Formatted for print & offline field visits</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 rounded-lg text-xs font-bold transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print Sheet</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 space-y-6 text-stone-900 font-sans">
          {/* Header */}
          <div className="border-b-2 border-stone-900 pb-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-stone-900">
                ANX Leads · Field Prospecting Sheet
              </h1>
              <p className="text-xs text-stone-600 mt-0.5">
                Target List: Verified Brick-and-Mortar Businesses Without Digital Web Presence
              </p>
            </div>
            <div className="text-right text-xs text-stone-500 font-mono">
              <div>Generated: {new Date().toLocaleDateString()}</div>
              <div>{businesses.length} Lead Records</div>
            </div>
          </div>

          {/* Table */}
          <table className="w-full text-left text-xs border-collapse border border-stone-300">
            <thead>
              <tr className="bg-stone-100 text-stone-800 uppercase font-bold text-[10px] tracking-wider border-b border-stone-300">
                <th className="p-2 border-r border-stone-300">#</th>
                <th className="p-2 border-r border-stone-300">Business & Owner</th>
                <th className="p-2 border-r border-stone-300">Category</th>
                <th className="p-2 border-r border-stone-300">Address & Phone</th>
                <th className="p-2 border-r border-stone-300">Status</th>
                <th className="p-2">Outreach Notes / Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-300">
              {businesses.map((biz, idx) => (
                <tr key={biz.id} className="align-top">
                  <td className="p-2 border-r border-stone-300 font-mono text-[11px] text-stone-500">
                    {idx + 1}
                  </td>
                  <td className="p-2 border-r border-stone-300">
                    <div className="font-bold text-stone-900">{biz.name}</div>
                    <div className="text-[11px] text-stone-600">
                      Owner: {biz.ownerName || 'Unknown / Inquire'}
                    </div>
                  </td>
                  <td className="p-2 border-r border-stone-300 text-[11px] font-medium text-stone-800">
                    {biz.category}
                  </td>
                  <td className="p-2 border-r border-stone-300">
                    <div className="text-[11px]">{biz.address}, {biz.city}</div>
                    <div className="text-[10px] text-stone-500">{biz.country || 'India'}</div>
                    <div className="font-mono text-[11px] text-stone-600">{biz.phone}</div>
                  </td>
                  <td className="p-2 border-r border-stone-300">
                    {!biz.hasWebsite ? (
                      <span className="font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded text-[10px]">
                        NO WEBSITE
                      </span>
                    ) : (
                      <span className="text-[10px] text-stone-500">Has Website</span>
                    )}
                  </td>
                  <td className="p-2 h-16 min-w-[140px] text-stone-400 italic text-[11px]">
                    [ ] Spoke with owner<br />
                    [ ] Left brochure<br />
                    [ ] Follow-up date: ______
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer Notes */}
          <div className="pt-4 border-t border-stone-300 flex items-center justify-between text-[11px] text-stone-500">
            <span>Prepared with ANX Leads Local Business Lead Finder</span>
            <span>Confidential Sales Canvassing Document</span>
          </div>
        </div>
      </div>
    </div>
  );
};
