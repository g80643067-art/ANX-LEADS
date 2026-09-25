import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Check,
  RotateCcw,
  Eye,
  Info,
  Layers,
  Copy,
  CheckCheck,
  Smartphone,
  Tag,
  ChevronRight,
  Plus,
} from 'lucide-react';
import {
  BusinessCategoryKey,
  ALL_BUSINESS_CATEGORIES,
  DEFAULT_CATEGORY_WHATSAPP_TEMPLATES,
  getStoredCategoryTemplates,
  saveCategoryTemplate,
  resetCategoryTemplate,
  renderCategoryTemplate,
} from '../utils/categoryTemplates';

interface MenuTemplatesViewProps {
  onTemplateSaved?: (category: BusinessCategoryKey) => void;
}

export const MenuTemplatesView: React.FC<MenuTemplatesViewProps> = ({
  onTemplateSaved,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<BusinessCategoryKey>('Restaurant');
  const [templates, setTemplates] = useState<Record<BusinessCategoryKey, string>>(() =>
    getStoredCategoryTemplates()
  );
  const [editorText, setEditorText] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetNotice, setResetNotice] = useState(false);
  const [copiedPreview, setCopiedPreview] = useState(false);

  // Sync editor text when category or templates change
  useEffect(() => {
    const current = templates[selectedCategory] || DEFAULT_CATEGORY_WHATSAPP_TEMPLATES[selectedCategory];
    setEditorText(current);
    setSaveSuccess(false);
    setResetNotice(false);
  }, [selectedCategory, templates]);

  const handleSelectCategory = (cat: BusinessCategoryKey) => {
    setSelectedCategory(cat);
  };

  const handleInsertVariable = (variable: string) => {
    setEditorText((prev) => `${prev} ${variable}`);
  };

  const handleSave = () => {
    const trimmed = editorText.trim();
    if (!trimmed) return;

    const updated = saveCategoryTemplate(selectedCategory, trimmed);
    setTemplates({ ...updated });
    setResetNotice(false);
    setSaveSuccess(true);
    if (onTemplateSaved) {
      onTemplateSaved(selectedCategory);
    }
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  const handleReset = () => {
    const updated = resetCategoryTemplate(selectedCategory);
    setTemplates({ ...updated });
    setEditorText(DEFAULT_CATEGORY_WHATSAPP_TEMPLATES[selectedCategory]);
    setSaveSuccess(false);
    setResetNotice(true);
    setTimeout(() => {
      setResetNotice(false);
    }, 3000);
  };

  // Sample lead for live preview
  const sampleLead = {
    name: `Royal ${selectedCategory}`,
    category: selectedCategory,
  };

  const renderedPreview = renderCategoryTemplate(editorText, sampleLead);

  const handleCopyPreview = () => {
    navigator.clipboard.writeText(renderedPreview);
    setCopiedPreview(true);
    setTimeout(() => setCopiedPreview(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-800 text-white rounded-2xl p-6 border border-stone-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Category-Wise WhatsApp Templates</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Pitch Message Manager
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 max-w-2xl">
            Configure custom pre-written outreach messages for each business category. When you click WhatsApp on any lead, its category template is loaded automatically with variables replaced.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-stone-400 bg-stone-950/60 px-3.5 py-2 rounded-xl border border-stone-800">
          <span className="font-mono text-amber-400">{'{business_name}'}</span>
          <span className="text-stone-600">|</span>
          <span className="font-mono text-amber-400">{'{category}'}</span>
        </div>
      </div>

      {/* Main Workspace Layout (Category Sidebar/Pills + Editor & Preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: 12 Categories List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <span className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-600" />
                <span>Categories (12)</span>
              </span>
              <span className="text-[11px] text-stone-500 font-medium">Click [+] or select</span>
            </div>

            <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
              {ALL_BUSINESS_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat;
                const isCustom =
                  templates[cat] &&
                  templates[cat] !== DEFAULT_CATEGORY_WHATSAPP_TEMPLATES[cat];

                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleSelectCategory(cat)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                      isSelected
                        ? 'bg-amber-500 text-stone-950 shadow-xs font-bold'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-700 hover:text-stone-950 border border-stone-200/80'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="truncate">{cat}</span>
                      {isCustom && (
                        <span
                          className={`px-1.5 py-0.2 text-[9px] rounded font-bold ${
                            isSelected
                              ? 'bg-stone-950/20 text-stone-950'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          Custom
                        </span>
                      )}
                    </div>

                    <span
                      className={`px-1.5 py-0.5 rounded font-mono font-bold text-[11px] transition-colors ${
                        isSelected
                          ? 'bg-stone-950/20 text-stone-950'
                          : 'bg-white text-stone-700 border border-stone-300 group-hover:border-amber-500 group-hover:text-amber-800'
                      }`}
                      title={`Edit template for ${cat}`}
                    >
                      +
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tips Card */}
          <div className="bg-stone-900 text-stone-300 rounded-2xl p-4 border border-stone-800 text-xs space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <Tag className="w-3.5 h-3.5" />
              <span>Dynamic Field Replacement</span>
            </div>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              Use <code className="text-amber-300 font-mono">{'{business_name}'}</code> to dynamically populate the business name and <code className="text-amber-300 font-mono">{'{category}'}</code> for category name.
            </p>
          </div>
        </div>

        {/* Right Column: Template Editor + Live WhatsApp Preview */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Editor Box */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
            {/* Editor Header */}
            <div className="p-4 sm:p-5 border-b border-stone-100 bg-stone-50/50 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wider text-amber-600 font-bold">
                      Editing Category
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-stone-200 text-stone-800 font-mono font-bold">
                      {selectedCategory}
                    </span>
                  </div>
                  <h2 className="text-sm sm:text-base font-bold text-stone-900">
                    {selectedCategory} WhatsApp Message Template
                  </h2>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-700 hover:text-stone-950 bg-white hover:bg-stone-100 border border-stone-300 transition-colors shadow-2xs cursor-pointer"
                  title="Reset to default pre-written message"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
                  <span>Refresh / Reset</span>
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-xs cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Save</span>
                </button>
              </div>
            </div>

            {/* Notifications */}
            {saveSuccess && (
              <div className="mx-5 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center justify-between animate-in fade-in">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-bold">Saved successfully!</span>
                  <span>Active template updated for <strong>{selectedCategory}</strong>.</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold">
                  Persisted
                </span>
              </div>
            )}

            {resetNotice && (
              <div className="mx-5 mt-4 p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs flex items-center gap-2 animate-in fade-in">
                <RotateCcw className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Restored original default message for <strong>{selectedCategory}</strong>.</span>
              </div>
            )}

            {/* Textarea & Toolbar */}
            <div className="p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-bold text-stone-700">
                  Message Content:
                </label>

                {/* Tag insertion chips */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-stone-500">Insert Tag:</span>
                  <button
                    type="button"
                    onClick={() => handleInsertVariable('{business_name}')}
                    className="px-2 py-1 rounded-md bg-stone-100 hover:bg-amber-100 text-stone-800 hover:text-amber-950 border border-stone-300 text-xs font-mono font-medium transition-colors cursor-pointer"
                  >
                    +{'{business_name}'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertVariable('{category}')}
                    className="px-2 py-1 rounded-md bg-stone-100 hover:bg-amber-100 text-stone-800 hover:text-amber-950 border border-stone-300 text-xs font-mono font-medium transition-colors cursor-pointer"
                  >
                    +{'{category}'}
                  </button>
                </div>
              </div>

              <textarea
                value={editorText}
                onChange={(e) => {
                  setEditorText(e.target.value);
                  setSaveSuccess(false);
                  setResetNotice(false);
                }}
                rows={9}
                placeholder="Enter your category-specific WhatsApp pitch message..."
                className="w-full p-3.5 font-sans text-xs sm:text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed bg-white text-stone-900 shadow-2xs resize-y"
              />
            </div>
          </div>

          {/* Live Smartphone / WhatsApp Preview */}
          <div className="bg-stone-900 text-stone-100 rounded-2xl border border-stone-800 p-5 shadow-2xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Live WhatsApp Message Preview
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-stone-400">
                  Simulated Lead: <strong className="text-stone-200">{sampleLead.name}</strong>
                </span>

                <button
                  type="button"
                  onClick={handleCopyPreview}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700 transition-colors cursor-pointer"
                  title="Copy preview message text"
                >
                  {copiedPreview ? (
                    <>
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Chat Bubble simulation */}
            <div className="bg-stone-950 p-4 rounded-xl border border-stone-800/80">
              <div className="max-w-md ml-auto bg-emerald-800 text-emerald-50 p-3.5 rounded-2xl rounded-tr-xs shadow-md space-y-1 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans">
                <p>{renderedPreview}</p>
                <div className="text-right text-[10px] text-emerald-300/80 flex items-center justify-end gap-1 pt-1 font-mono">
                  <span>10:42 AM</span>
                  <CheckCheck className="w-3 h-3 text-emerald-300" />
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
