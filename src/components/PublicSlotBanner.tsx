import React from 'react';
import { Sparkles, Users, Lock, CheckCircle2, ArrowRight, ShieldCheck, Flame } from 'lucide-react';
import { SlotsStatusResponse } from '../types/admin';

interface PublicSlotBannerProps {
  slotsStatus: SlotsStatusResponse | null;
  onOpenRegistration: () => void;
  isLoading?: boolean;
}

export const PublicSlotBanner: React.FC<PublicSlotBannerProps> = ({
  slotsStatus,
  onOpenRegistration,
  isLoading,
}) => {
  const availableSlots = slotsStatus?.availableSlots ?? 2;
  const totalSlots = slotsStatus?.totalSlots ?? 2;
  const occupiedSlots = slotsStatus?.occupiedSlots ?? 0;

  const isFull = availableSlots === 0;
  const isOneLeft = availableSlots === 1;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border border-amber-500/30 p-4 sm:p-5 text-white shadow-lg">
      {/* Background glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left Info */}
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                isFull
                  ? 'bg-red-500/20 text-red-300 border-red-500/40'
                  : isOneLeft
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isFull ? 'bg-red-400' : isOneLeft ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
              />
              <span>
                {isFull
                  ? '0 / 2 Slots Available'
                  : isOneLeft
                  ? '⚡ 1 Urgent Slot Left'
                  : '🟢 2 of 2 Free Consultation Slots Open'}
              </span>
            </span>

            <span className="text-[11px] text-stone-400 flex items-center gap-1 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Backend Verified</span>
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Exclusive Local Business Digital Registration
          </h3>

          <p className="text-xs text-stone-300 leading-relaxed">
            {isFull
              ? 'All 2 registration slots are currently occupied. Admin regularly reviews and reopens slots.'
              : 'Claim one of the two exclusive consultation slots today. Submissions are saved directly to our secure database.'}
          </p>
        </div>

        {/* Right Slots Counter & Action Button */}
        <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
          {/* Visual 2 Slots Indicator */}
          <div className="flex items-center gap-1.5 bg-stone-950/80 p-1.5 rounded-xl border border-stone-800">
            {/* Slot 1 */}
            <div
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold flex items-center gap-1 ${
                slotsStatus?.slots[0]?.isOccupied
                  ? 'bg-stone-800 text-stone-400 line-through'
                  : 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
              }`}
              title={slotsStatus?.slots[0]?.isOccupied ? 'Slot 1: Claimed' : 'Slot 1: Available'}
            >
              <span>#1</span>
              <span>{slotsStatus?.slots[0]?.isOccupied ? 'Occupied' : 'Open'}</span>
            </div>

            {/* Slot 2 */}
            <div
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold flex items-center gap-1 ${
                slotsStatus?.slots[1]?.isOccupied
                  ? 'bg-stone-800 text-stone-400 line-through'
                  : 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
              }`}
              title={slotsStatus?.slots[1]?.isOccupied ? 'Slot 2: Claimed' : 'Slot 2: Available'}
            >
              <span>#2</span>
              <span>{slotsStatus?.slots[1]?.isOccupied ? 'Occupied' : 'Open'}</span>
            </div>
          </div>

          {/* Action Trigger */}
          <button
            type="button"
            onClick={onOpenRegistration}
            disabled={isFull || isLoading}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer ${
              isFull
                ? 'bg-stone-800 text-stone-400 cursor-not-allowed border border-stone-700'
                : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-amber-500/20'
            }`}
          >
            {isFull ? (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Slots Full</span>
              </>
            ) : (
              <>
                <span>Claim Open Slot</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
