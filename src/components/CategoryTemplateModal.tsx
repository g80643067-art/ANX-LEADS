import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  RotateCcw,
  MessageSquare,
  Eye,
} from 'lucide-react';
import {
  BusinessCategoryKey,
  DEFAULT_CATEGORY_WHATSAPP_TEMPLATES,
  renderCategoryTemplate,
  saveCategoryTemplate,
  resetCategoryTemplate,
} from '../utils/categoryTemplates';

interface CategoryTemplateModalProps {
  category: BusinessCategoryKey | null;
  currentTemplate: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: BusinessCategoryKey, updatedTemplate: string) => void;
  onResetToDefault: (category: BusinessCategoryKey) => void;
}

export const CategoryTemplateModal: React.FC<CategoryTemplateModalProps> = ({
  category,
  currentTemplate,
  isOpen,
  onClose,
  onSave,
  onResetToDefault,
}) => {
  const [templateText, setTemplateText] = useState(currentTemplate);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetNotice, setResetNotice] = useState(false);

  // Sync internal text state when category or modal open state changes
  useEffect(() => {
    if (category) {
      setTemplateText(currentTemplate);
      setSaveSuccess(false);
      setResetNotice(false);
    }
  }, [category, currentTemplate, isOpen]);

  if (!isOpen || !category) return null;

  const handleInsertVariable = (variable: string) => {
    setTemplateText((prev) => `${prev} ${variable}`);
  };

  const handleSave = () => {
    const trimmed = templateText.trim();
    if (!trimmed) return;

    // 1. Persist directly to localStorage
    saveCategoryTemplate(category, trimmed);

    // 2. Notify parent state
    onSave(category, trimmed);

    // 3. Show "Saved successfully" confirmation
    setResetNotice(false);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  const handleReset = () => {
    const defaultTemplate = DEFAULT_CATEGORY_WHATSAPP_TEMPLATES[category];
    
    // 1. Reset in localStorage
    resetCategoryTemplate(category);

    // 2. Notify parent
    onResetToDefault(category);

    // 3. Update editor text
    setTemplateText(defaultTemplate);

    // 4. Show notice
    setSaveSuccess(false);
    setResetNotice(true);
    setTimeout(() => {
      setResetNotice(false);
    }, 3000);
  };

  // Sample lead for live preview
  const sampleLead = {
    name: `Royal ${category}`,
    category: category,
  };

  const previewText = renderCategoryTemplate(templateText, sampleLead);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-stone-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-xs">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.586-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.297.144.35.491 1.198.534 1.285.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.073.043.419-.101.824z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-amber-400 font-bold">
                  WhatsApp Template Editor
                </span>
                <span className="px-2 py-0.2 rounded-full text-[10px] bg-stone-800 text-stone-300 font-mono border border-stone-700">
                  {category}
                </span>
              </div>
              <h2 className="text-base font-bold text-white">
                {category} Template
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Saved Successfully Confirmation Banner */}
          {saveSuccess && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-3.5 py-2.5 rounded-xl text-xs flex items-center justify-between gap-2 animate-in fade-in">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold">Saved successfully!</span>
                <span className="text-emerald-700">Active template updated for {category}.</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">
                Persisted
              </span>
            </div>
          )}

          {resetNotice && (
            <div className="bg-amber-50 border border-amber-300 text-amber-950 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
              <RotateCcw className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Restored original default message for <strong>{category}</strong>.</span>
            </div>
          )}

          {/* Template Info / Variables Bar */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>Message Editor:</span>
              </label>

              {/* Variable Chips */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-stone-500">Insert variable:</span>
                <button
                  type="button"
                  onClick={() => handleInsertVariable('{business_name}')}
                  className="px-2 py-0.5 rounded bg-stone-100 hover:bg-amber-100 text-stone-800 hover:text-amber-900 border border-stone-300 text-[11px] font-mono transition-colors"
                  title="Insert business name variable"
                >
                  +{'{business_name}'}
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertVariable('{category}')}
                  className="px-2 py-0.5 rounded bg-stone-100 hover:bg-amber-100 text-stone-800 hover:text-amber-900 border border-stone-300 text-[11px] font-mono transition-colors"
                  title="Insert category variable"
                >
                  +{'{category}'}
                </button>
              </div>
            </div>

            {/* Textarea Editor */}
            <textarea
              value={templateText}
              onChange={(e) => {
                setTemplateText(e.target.value);
                setSaveSuccess(false);
                setResetNotice(false);
              }}
              rows={7}
              placeholder="Enter your WhatsApp message template here..."
              className="w-full p-3 font-sans text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed bg-white text-stone-900 shadow-2xs"
            />
          </div>

          {/* Live Preview Box */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-stone-500" />
                <span>Live Preview (as received by lead):</span>
              </span>
              <span className="text-[10px] text-stone-500 font-mono">
                Sample Lead: {sampleLead.name}
              </span>
            </div>

            <div className="bg-white p-3 rounded-lg border border-stone-200 text-xs text-stone-800 leading-relaxed whitespace-pre-wrap font-sans shadow-2xs">
              {previewText}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-stone-100 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-stone-700 hover:text-stone-950 bg-white hover:bg-stone-50 border border-stone-300 transition-colors"
            title="Reset this category to its original default message"
          >
            <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
            <span>Refresh / Reset</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold text-stone-600 hover:bg-stone-200 transition-colors"
            >
              Close
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>Save</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
