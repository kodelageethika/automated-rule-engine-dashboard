import React, { useState } from 'react';
import { NationalMaterial, RawMaterialRecord } from '../types';
import { GitFork, Layers, Database, ShieldCheck, ArrowRight, Tag, Bookmark } from 'lucide-react';

interface LineageGraphViewProps {
  catalog: NationalMaterial[];
  rawRecords: RawMaterialRecord[];
}

export const LineageGraphView: React.FC<LineageGraphViewProps> = ({ catalog, rawRecords }) => {
  // Find multi-CPSE items by default
  const multiCpseItems = catalog.filter(i => i.mapped_cpse_records.length > 1);
  const [selectedCode, setSelectedCode] = useState<string>(
    multiCpseItems[0]?.national_material_code || catalog[0]?.national_material_code || ''
  );

  const currentItem = catalog.find(i => i.national_material_code === selectedCode) || catalog[0];

  return (
    <div className="space-y-6">
      {/* Selector & Intro */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <GitFork className="w-5 h-5 text-blue-400" />
            Cross-CPSE Master Material Lineage & Knowledge Graph
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Visualizing deterministic bidirectional links from Common National Material Codes to original CPSE legacy codes, standards, and metallurgical specifications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 whitespace-nowrap">Select Material:</label>
          <select
            value={selectedCode}
            onChange={(e) => setSelectedCode(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:border-blue-500 font-mono"
          >
            {catalog.map(item => (
              <option key={item.national_material_code} value={item.national_material_code}>
                {item.national_material_code} ({item.mapped_cpse_records.length} CPSEs)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Visual Relationship Diagram */}
      {currentItem && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-8">
          {/* Top: National Harmonized Master Node */}
          <div className="flex flex-col items-center">
            <div className="bg-gradient-to-r from-blue-900/60 via-indigo-900/60 to-blue-900/60 border-2 border-blue-500/60 rounded-xl p-5 text-center max-w-xl shadow-xl">
              <span className="text-[10px] font-bold tracking-widest uppercase text-blue-300 bg-blue-950 px-2 py-0.5 rounded border border-blue-800 mb-1 inline-block">
                Common National Material Code (Golden Master)
              </span>
              <h3 className="text-lg font-mono font-bold text-white mt-1">
                {currentItem.national_material_code}
              </h3>
              <p className="text-xs text-slate-200 font-medium mt-1">
                {currentItem.canonical_description}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-3 pt-3 border-t border-blue-800/40 text-xs">
                <span className="px-2 py-0.5 rounded bg-slate-950/80 text-slate-300 border border-slate-800">
                  Category: <strong>{currentItem.category_family}</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-950/80 text-slate-300 border border-slate-800">
                  Grade: <strong>{currentItem.grade}</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-950/80 text-slate-300 border border-slate-800">
                  Standard: <strong>{currentItem.standard}</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-950/80 text-emerald-400 border border-emerald-800/60">
                  Canonical UOM: <strong>{currentItem.canonical_uom}</strong>
                </span>
              </div>
            </div>

            {/* Connecting Vertical Line */}
            <div className="w-0.5 h-10 bg-gradient-to-b from-blue-500 to-slate-700 my-1" />
            <div className="px-3 py-1 bg-slate-950 rounded-full border border-slate-800 text-[11px] text-slate-400 font-mono">
              Deterministic Mappings ({currentItem.mapped_cpse_records.length} CPSE Enterprises)
            </div>
            <div className="w-0.5 h-10 bg-slate-700 my-1" />
          </div>

          {/* Bottom: Connected Legacy CPSE Nodes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {currentItem.mapped_cpse_records.map((rec) => {
              const raw = rawRecords.find(
                r => r.cpse === rec.cpse && r.material_code === rec.material_code
              );

              return (
                <div
                  key={rec.cpse + rec.material_code}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2.5 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-950 text-blue-300 border border-blue-800">
                      {rec.cpse} Legacy Source
                    </span>
                    <span className="font-mono text-xs font-semibold text-emerald-400">
                      100% Match
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Legacy Code</span>
                    <span className="font-mono text-xs font-bold text-slate-200">
                      {rec.material_code}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Original Description</span>
                    <p className="font-mono text-xs text-slate-300 bg-slate-900 p-2 rounded">
                      {rec.source_description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                    <div>
                      Legacy UOM: <strong className="text-slate-200">{raw?.uom || 'N/A'}</strong>
                    </div>
                    <div>
                      Unit Cost: <strong className="text-amber-400">₹{raw?.unit_price_inr || 0}</strong>
                    </div>
                    <div>
                      System: <strong className="text-slate-200">{raw?.source_system || 'ERP'}</strong>
                    </div>
                    <div>
                      Annual Vol: <strong className="text-slate-200">{raw?.annual_procurement_quantity?.toLocaleString() || 'N/A'}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Technical Lineage Footer */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between text-xs text-slate-400 gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Full Audit Trail Preserved • Zero Loss of Legacy CPSE Material Codes</span>
            </div>
            <span className="font-mono text-[11px]">
              National ID: {currentItem.national_id}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
