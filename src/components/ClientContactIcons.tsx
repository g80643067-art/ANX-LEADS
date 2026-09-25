import React from 'react';
import { BusinessLeadItem } from '../types/lead';
import {
  hasClientRealPhone,
  hasClientRealEmail,
  hasClientRealInstagram,
} from '../utils/contactUtils';

interface ClientContactIconsProps {
  lead: BusinessLeadItem;
  onAction: (lead: BusinessLeadItem, channel: 'whatsapp' | 'email' | 'instagram') => void;
  size?: 'sm' | 'md';
}

export const ClientContactIcons: React.FC<ClientContactIconsProps> = ({
  lead,
  onAction,
  size = 'sm',
}) => {
  const hasPhone = hasClientRealPhone(lead.contactNumber);
  const hasEmail = hasClientRealEmail(lead.email);
  const hasInstagram = hasClientRealInstagram(lead.instagramUrl);

  const iconClasses = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm';
  const svgClasses = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  return (
    <div className="inline-flex items-center gap-1.5">
      {/* WhatsApp Icon */}
      {hasPhone ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAction(lead, 'whatsapp');
          }}
          className={`${iconClasses} inline-flex items-center justify-center rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs hover:scale-105 active:scale-95 transition-all duration-150 cursor-pointer`}
          title={`Open WhatsApp for ${lead.name} (${lead.contactNumber})`}
          aria-label={`WhatsApp ${lead.name}`}
        >
          <svg className={svgClasses} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.586-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.297.144.35.491 1.198.534 1.285.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.073.043.419-.101.824z" />
          </svg>
        </button>
      ) : (
        <button
          type="button"
          disabled
          className={`${iconClasses} inline-flex items-center justify-center rounded-lg bg-stone-200 text-stone-400 cursor-not-allowed opacity-50`}
          title="No WhatsApp number available."
          aria-label="No WhatsApp number available."
        >
          <svg className={svgClasses} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.586-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.297.144.35.491 1.198.534 1.285.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.073.043.419-.101.824z" />
          </svg>
        </button>
      )}

      {/* Email Icon */}
      {hasEmail && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAction(lead, 'email');
          }}
          className={`${iconClasses} inline-flex items-center justify-center rounded-lg bg-sky-600 hover:bg-sky-700 text-white shadow-xs hover:scale-105 active:scale-95 transition-all duration-150 cursor-pointer`}
          title={`Send Email to ${lead.email}`}
          aria-label={`Send Email to ${lead.name}`}
        >
          <svg className={svgClasses} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        </button>
      )}

      {/* Instagram Icon */}
      {hasInstagram && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAction(lead, 'instagram');
          }}
          className={`${iconClasses} inline-flex items-center justify-center rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 hover:opacity-95 text-white shadow-xs hover:scale-105 active:scale-95 transition-all duration-150 cursor-pointer`}
          title={`Instagram DM to ${lead.name}`}
          aria-label={`Instagram DM to ${lead.name}`}
        >
          <svg className={svgClasses} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
          </svg>
        </button>
      )}
    </div>
  );
};
