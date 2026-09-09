import React, { useState } from 'react';
import { NormalizedMaterial } from '../types';
import { normalizeDescription, normalizeUOM } from '../engine/normalization';
import { extractAttributesAndFingerprint } from '../engine/extractor';
import { computeFingerprintHash } from '../engine/fingerprint';
import { FileCode, Search, Sparkles, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, Play } from 'lucide-react';

interface IngestionTraceabilityViewProps {
  normalizedMaterials: NormalizedMaterial[];
}

export const IngestionTraceabilityView: React.FC<IngestionTraceabilityViewProps> = ({
  normalizedMaterials,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState<NormalizedMaterial | null>(
    normalizedMaterials[0] || null
  );

  // Live sandbox tester
  const [sandboxText, setSandboxText] = useState('HEX HD BLT 10 MM X 50 MM SS 304');
  const [sandboxUOM, setSandboxUOM] = useState('NOS');
  const [sandboxResult, setSandboxResult] = useState<any>(null);

  const filteredMaterials = normalizedMaterials.filter(m => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      m.raw_record.material_code.toLowerCase().includes(q) ||
      m.raw_record.raw_description.toLowerCase().includes(q) ||
      m.canonical_description.toLowerCase().includes(q) ||
      m.raw_record.cpse.toLowerCase().includes(q)
    );
  });

  const runSandboxTest = () => {
    const { canonical, trace, quality_issues } = normalizeDescription(sandboxText);
    const { canonical: uomCanonical, converted } = normalizeUOM(sandboxUOM);
    const mockRaw: any = {
      record_id: 999,
      cpse: 'TEST-CPSE',
      material_code: 'TEST-001',
      raw_description: sandboxText,
      uom: sandboxUOM,
      category: 'Fasteners',
      standard: 'IS 1367',
      material: 'SS',
      grade: '304',
      size: '10mm',
      specification: '',
      application: 'General machinery',
      source_system: 'ERP',
      legacy_status: 'ACTIVE',
      description_language: 'EN',
      data_quality_flag: '',
    };
    const { attributes, fingerprint } = extractAttributesAndFingerprint(mockRaw, canonical);
    const hash = computeFingerprintHash(fingerprint);

    setSandboxResult({
      canonical,
      uomCanonical,
      converted,
      trace,
      quality_issues,
      attributes,
      fingerprint,
      hash,
    });
  };

  return (
    <div className="space-y-6">
      {/* Live Interactive Ingestion Sandbox */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold text-white">
              Live Ingestion & Normalization Sandbox (Deterministic Transformation)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Zero LLM Hallucination • Full Traceability Guarantee
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-8">
            <label className="text-xs text-slate-400 block mb-1">
              Test Messy CPSE Unstructured Material Description:
            </label>
            <input
              type="text"
              value={sandboxText}
              onChange={(e) => setSandboxText(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-blue-500"
              placeholder="Enter raw CPSE description e.g. HEX HD BLT 10 MM X 50 MM SS 304..."
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs text-slate-400 block mb-1">Raw UOM:</label>
            <input
              type="text"
              value={sandboxUOM}
              onChange={(e) => setSandboxUOM(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-blue-500"
              placeholder="NOS / PCS / KGS"
            />
          </div>

          <div className="md:col-span-2">
            <button
              onClick={runSandboxTest}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run Pipeline</span>
            </button>
          </div>
        </div>

        {sandboxResult && (
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div>
                <span className="text-slate-400 block text-[10px]">Canonical Golden Description:</span>
                <span className="text-sm font-semibold text-emerald-400 font-mono">
                  {sandboxResult.canonical}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px]">Canonical UOM:</span>
                <span className="text-sm font-bold text-blue-400 font-mono">
                  {sandboxResult.uomCanonical} {sandboxResult.converted ? '(Converted from ' + sandboxUOM + ')' : ''}
                </span>
              </div>
            </div>

            {/* Trace Steps */}
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase block mb-1.5">
                Transformation Steps Recorded ({sandboxResult.trace.length} Applied):
              </span>
              <div className="space-y-1">
                {sandboxResult.trace.map((t: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 text-[11px] bg-slate-900 p-1.5 rounded font-mono">
                    <span className="text-blue-400">{t.rule_id}</span>
                    <span className="text-slate-500">|</span>
                    <span className="text-rose-400 line-through truncate max-w-xs">{t.before}</span>
                    <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="text-emerald-400 truncate max-w-xs">{t.after}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fingerprint Hash */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">SHA-256 Fingerprint:</span>
              <span className="font-mono text-[10px] text-slate-300 bg-slate-900 px-2 py-0.5 rounded">
                {sandboxResult.hash}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Records Traceability Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Materials List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search CPSE records..."
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredMaterials.map((m) => {
              const isSelected = selectedMaterial?.material_id === m.material_id;
              return (
                <div
                  key={m.material_id}
                  onClick={() => setSelectedMaterial(m)}
                  className={`p-3 rounded-lg border transition cursor-pointer text-xs ${
                    isSelected
                      ? 'bg-slate-850 border-blue-500 shadow-sm'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-900/60 text-blue-300">
                        {m.raw_record.cpse}
                      </span>
                      <span className="font-mono text-slate-400">{m.raw_record.material_code}</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400">
                      {m.normalization_trace.length} traces
                    </span>
                  </div>
                  <p className="text-slate-200 font-medium truncate">{m.raw_record.raw_description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Material Detailed Lineage */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
          {selectedMaterial ? (
            <>
              <div className="border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-900/80 text-blue-300">
                    {selectedMaterial.raw_record.cpse}
                  </span>
                  <span className="font-mono text-xs text-slate-400">
                    {selectedMaterial.raw_record.material_code}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white">
                  Deterministic Normalization & Ingestion Trace
                </h4>
              </div>

              {/* Transformation Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                    Original CPSE Raw String
                  </span>
                  <p className="font-mono text-slate-300">{selectedMaterial.raw_record.raw_description}</p>
                  <div className="pt-2 text-[11px] text-slate-400">
                    Original UOM: <strong className="text-slate-200">{selectedMaterial.raw_record.uom}</strong>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-emerald-900/40 space-y-1">
                  <span className="text-[10px] text-emerald-400 uppercase font-semibold block">
                    Canonical Golden Output
                  </span>
                  <p className="font-mono text-emerald-300 font-medium">
                    {selectedMaterial.canonical_description}
                  </p>
                  <div className="pt-2 text-[11px] text-slate-400">
                    Canonical UOM:{' '}
                    <strong className="text-emerald-400">{selectedMaterial.canonical_uom}</strong>{' '}
                    {selectedMaterial.uom_conversion_applied && '(Auto-Normalized)'}
                  </div>
                </div>
              </div>

              {/* Transformation Trace Log */}
              <div>
                <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Transformation Rules Applied ({selectedMaterial.normalization_trace.length})
                </h5>
                {selectedMaterial.normalization_trace.length > 0 ? (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {selectedMaterial.normalization_trace.map((trace, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-950 p-2.5 rounded border border-slate-800 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between font-mono text-[11px]">
                          <span className="text-blue-400 font-semibold">{trace.rule_id}</span>
                          <span className="text-slate-500">Method: {trace.method}</span>
                        </div>
                        <div className="flex items-center gap-2 font-mono text-[11px]">
                          <span className="text-rose-400 line-through">{trace.before}</span>
                          <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="text-emerald-400">{trace.after}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    Raw description conformed directly to canonical standards without modifications.
                  </p>
                )}
              </div>

              {/* Extracted Technical Attributes */}
              <div>
                <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Extracted Technical Attributes
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs bg-slate-950 p-3 rounded-lg border border-slate-800">
                  {Object.entries(selectedMaterial.extracted_attributes).map(([k, v]) => (
                    <div key={k}>
                      <span className="text-slate-500 block text-[10px] uppercase">{k.replace('_', ' ')}:</span>
                      <span className="font-semibold text-slate-200">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fingerprint Hash */}
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block">SHA-256 Fingerprint Hash:</span>
                  <span className="font-mono text-slate-300">{selectedMaterial.fingerprint_hash}</span>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs">
              Select a material to inspect its normalization journey.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
