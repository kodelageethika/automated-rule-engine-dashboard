import React from 'react';
import { ShieldCheck, RefreshCw, Download, Database, Layers, Sparkles } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onRefreshPipeline: () => void;
  onExportCatalog: () => void;
  totalRecords: number;
  totalUnified: number;
  isProcessing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onRefreshPipeline,
  onExportCatalog,
  totalRecords,
  totalUnified,
  isProcessing,
}) => {
  const tabs = [
    { id: 'catalog', label: 'National Catalog' },
    { id: 'equivalence', label: 'Equivalence & Matching' },
    { id: 'safety', label: 'Safety Veto Suite' },
    { id: 'rules', label: 'Technical Rules' },
    { id: 'traceability', label: 'Ingestion & Normalization' },
    { id: 'analytics', label: 'Procurement Analytics' },
    { id: 'lineage', label: 'Master Lineage' },
    { id: 'audit', label: 'Audit & Governance' },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40">
      {/* Top Banner with Ministry Branding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800/60">
                Government of India • Ministry of Heavy Industries
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Deterministic CPSE Master Harmonization
              </span>
            </div>
          </div>
        </div>

        {/* Global Action Bar */}
        <div className="flex items-center space-x-2.5">
          <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 bg-slate-800/80 rounded-lg border border-slate-700/60 text-xs">
            <div>
              <span className="text-slate-400">Ingested CPSEs: </span>
              <span className="font-semibold text-slate-200">3 Enterprises</span>
            </div>
            <span className="text-slate-600">|</span>
            <div>
              <span className="text-slate-400">Raw Records: </span>
              <span className="font-semibold text-blue-300">{totalRecords}</span>
            </div>
            <span className="text-slate-600">|</span>
            <div>
              <span className="text-slate-400">Unified Codes: </span>
              <span className="font-semibold text-emerald-400">{totalUnified}</span>
            </div>
          </div>

          <button
            id="btn-refresh-pipeline"
            onClick={onRefreshPipeline}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition shadow-sm"
            title="Re-run Normalization, Extraction & Rule Evaluation"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
            <span>{isProcessing ? 'Evaluating...' : 'Re-Run Pipeline'}</span>
          </button>

          <button
            id="btn-export-catalog"
            onClick={onExportCatalog}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition border border-slate-700"
            title="Export National Master Catalog"
          >
            <Download className="w-3.5 h-3.5 text-slate-300" />
            <span className="hidden sm:inline">Export Master</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800 overflow-x-auto scrollbar-none">
        <nav className="flex space-x-1 py-1.5">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-btn-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
