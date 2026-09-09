import React, { useState, useMemo } from 'react';
import { EquivalenceClass, MatchEvaluation, RiskLevel } from '../types';
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, XCircle, ChevronRight, Scale, Check, X, FileText, ArrowRight } from 'lucide-react';

interface EquivalenceMatrixViewProps {
  evaluations: MatchEvaluation[];
  onApproveMatch: (evaluationId: string, notes: string) => void;
  onRejectMatch: (evaluationId: string, notes: string) => void;
}

export const EquivalenceMatrixView: React.FC<EquivalenceMatrixViewProps> = ({
  evaluations,
  onApproveMatch,
  onRejectMatch,
}) => {
  const [filterClass, setFilterClass] = useState<string>('ALL');
  const [filterRisk, setFilterRisk] = useState<string>('ALL');
  const [selectedEvaluation, setSelectedEvaluation] = useState<MatchEvaluation | null>(null);
  const [decisionNotes, setDecisionNotes] = useState('');

  // Filter evaluations
  const filteredEvaluations = useMemo(() => {
    return evaluations.filter((ev) => {
      if (filterClass !== 'ALL' && ev.ai_recommendation !== filterClass) {
        return false;
      }
      if (filterRisk !== 'ALL' && ev.risk_level !== filterRisk) {
        return false;
      }
      return true;
    });
  }, [evaluations, filterClass, filterRisk]);

  // Set default selected evaluation if none selected
  React.useEffect(() => {
    if (!selectedEvaluation && filteredEvaluations.length > 0) {
      setSelectedEvaluation(filteredEvaluations[0]);
    }
  }, [filteredEvaluations, selectedEvaluation]);

  const getRecommendationBadge = (rec: EquivalenceClass) => {
    switch (rec) {
      case 'SAME_MATERIAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            SAME MATERIAL
          </span>
        );
      case 'NEAR_DUPLICATE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-950 text-blue-300 border border-blue-800">
            <Check className="w-3 h-3" />
            NEAR DUPLICATE
          </span>
        );
      case 'FUNCTIONALLY_EQUIVALENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800">
            <Scale className="w-3 h-3" />
            FUNCTIONAL EQUIV
          </span>
        );
      case 'EXPERT_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950 text-amber-300 border border-amber-800">
            <AlertTriangle className="w-3 h-3" />
            EXPERT REVIEW
          </span>
        );
      case 'NOT_EQUIVALENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-950 text-rose-300 border border-rose-800">
            <XCircle className="w-3 h-3" />
            NOT EQUIVALENT
          </span>
        );
    }
  };

  const getRiskBadge = (risk: RiskLevel) => {
    switch (risk) {
      case 'LOW':
        return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">LOW RISK</span>;
      case 'MEDIUM':
        return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">MED RISK</span>;
      case 'HIGH':
        return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-950 text-orange-400 border border-orange-800">HIGH RISK</span>;
      case 'CRITICAL':
        return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800">CRITICAL VETO</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-400">Class:</span>
          {['ALL', 'SAME_MATERIAL', 'NEAR_DUPLICATE', 'FUNCTIONALLY_EQUIVALENT', 'EXPERT_REVIEW', 'NOT_EQUIVALENT'].map((c) => (
            <button
              key={c}
              onClick={() => setFilterClass(c)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                filterClass === c
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {c === 'ALL' ? 'All Classes' : c.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400">Risk:</span>
          {['ALL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((r) => (
            <button
              key={r}
              onClick={() => setFilterRisk(r)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                filterRisk === r
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Main Two-Column Layout: Evaluations List on Left, Deep Inspector on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Evaluations Queue */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>
              Evaluations: <strong className="text-slate-200">{filteredEvaluations.length}</strong> pairs
            </span>
            <span className="text-emerald-400 font-medium">Explainable Machine Evidence</span>
          </div>

          <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
            {filteredEvaluations.map((ev) => {
              const isSelected = selectedEvaluation?.evaluation_id === ev.evaluation_id;
              const hasRuleTriggered = ev.triggered_rules.length > 0;

              return (
                <div
                  key={ev.evaluation_id}
                  onClick={() => setSelectedEvaluation(ev)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-850 border-blue-500 shadow-md shadow-blue-500/5'
                      : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      {getRecommendationBadge(ev.ai_recommendation)}
                      {getRiskBadge(ev.risk_level)}
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      Conf: {(ev.confidence_score * 100).toFixed(0)}%
                    </span>
                  </div>

                  {/* Material A vs Material B Codes */}
                  <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                    <div className="bg-slate-950 p-2 rounded border border-slate-800/80">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-[10px] font-bold px-1 rounded bg-blue-900/60 text-blue-300">
                          {ev.source_material.raw_record.cpse}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400 truncate">
                          {ev.source_material.raw_record.material_code}
                        </span>
                      </div>
                      <p className="text-slate-200 font-medium line-clamp-1">
                        {ev.source_material.raw_record.raw_description}
                      </p>
                    </div>

                    <div className="bg-slate-950 p-2 rounded border border-slate-800/80">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-[10px] font-bold px-1 rounded bg-indigo-900/60 text-indigo-300">
                          {ev.candidate_material.raw_record.cpse}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400 truncate">
                          {ev.candidate_material.raw_record.material_code}
                        </span>
                      </div>
                      <p className="text-slate-200 font-medium line-clamp-1">
                        {ev.candidate_material.raw_record.raw_description}
                      </p>
                    </div>
                  </div>

                  {/* Similarity Metrics & Rules Alert */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/50">
                    <div className="flex items-center gap-3">
                      <span>Semantic: <strong className="text-slate-200">{(ev.semantic_similarity * 100).toFixed(1)}%</strong></span>
                      <span>Attributes: <strong className="text-slate-200">{(ev.attribute_similarity * 100).toFixed(1)}%</strong></span>
                    </div>

                    {hasRuleTriggered && (
                      <span className="text-rose-400 font-semibold flex items-center gap-0.5">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        {ev.triggered_rules.length} Veto Rule{ev.triggered_rules.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Deep Inspection Workbench */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 sticky top-24 space-y-6">
          {selectedEvaluation ? (
            <>
              {/* Inspection Header */}
              <div className="border-b border-slate-800 pb-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {getRecommendationBadge(selectedEvaluation.ai_recommendation)}
                    {getRiskBadge(selectedEvaluation.risk_level)}
                    <span className="text-xs font-mono text-slate-400">
                      ID: {selectedEvaluation.evaluation_id}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Confidence: <strong className="text-emerald-400">{(selectedEvaluation.confidence_score * 100).toFixed(1)}%</strong>
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-slate-200">
                  Pairwise Technical Equivalence Evaluation
                </h3>
              </div>

              {/* Side-by-Side Comparison */}
              <div className="grid grid-cols-2 gap-4">
                {/* Source Record */}
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-900/80 text-blue-300">
                      SOURCE: {selectedEvaluation.source_material.raw_record.cpse}
                    </span>
                    <span className="font-mono text-xs text-slate-400">
                      {selectedEvaluation.source_material.raw_record.material_code}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Raw CPSE Description</span>
                    <p className="text-xs font-mono text-slate-200 bg-slate-900 p-1.5 rounded">
                      {selectedEvaluation.source_material.raw_record.raw_description}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                    <div>Base: <strong>{selectedEvaluation.source_material.fingerprint.base_material}</strong></div>
                    <div>Grade: <strong>{selectedEvaluation.source_material.fingerprint.grade || 'N/A'}</strong></div>
                    <div>UOM: <strong>{selectedEvaluation.source_material.raw_record.uom}</strong></div>
                    <div>Standard: <strong>{selectedEvaluation.source_material.fingerprint.standard || 'None'}</strong></div>
                  </div>
                </div>

                {/* Candidate Record */}
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-900/80 text-indigo-300">
                      CANDIDATE: {selectedEvaluation.candidate_material.raw_record.cpse}
                    </span>
                    <span className="font-mono text-xs text-slate-400">
                      {selectedEvaluation.candidate_material.raw_record.material_code}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Raw CPSE Description</span>
                    <p className="text-xs font-mono text-slate-200 bg-slate-900 p-1.5 rounded">
                      {selectedEvaluation.candidate_material.raw_record.raw_description}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                    <div>Base: <strong>{selectedEvaluation.candidate_material.fingerprint.base_material}</strong></div>
                    <div>Grade: <strong>{selectedEvaluation.candidate_material.fingerprint.grade || 'N/A'}</strong></div>
                    <div>UOM: <strong>{selectedEvaluation.candidate_material.raw_record.uom}</strong></div>
                    <div>Standard: <strong>{selectedEvaluation.candidate_material.fingerprint.standard || 'None'}</strong></div>
                  </div>
                </div>
              </div>

              {/* Similarity Scores Progress Bars */}
              <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800 space-y-2.5 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">Semantic Vector Similarity</span>
                    <span className="font-mono text-slate-200">{(selectedEvaluation.semantic_similarity * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${selectedEvaluation.semantic_similarity * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">Structured Attribute Concordance</span>
                    <span className="font-mono text-slate-200">{(selectedEvaluation.attribute_similarity * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${selectedEvaluation.attribute_similarity * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Triggered Rule Violations (Vetoes) */}
              {selectedEvaluation.triggered_rules.length > 0 && (
                <div className="p-4 bg-rose-950/30 border border-rose-900/60 rounded-lg space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>DETERMINISTIC SAFETY VETO TRIGGERED</span>
                  </div>
                  <div className="space-y-2">
                    {selectedEvaluation.triggered_rules.map((rule, idx) => (
                      <div key={idx} className="bg-slate-950/90 p-2.5 rounded border border-rose-900/40 text-xs">
                        <div className="flex items-center justify-between font-mono text-[11px] text-rose-300 mb-1">
                          <span>Rule ID: {rule.rule_id}</span>
                          <span className="px-1.5 py-0.2 rounded bg-rose-950 text-rose-400 font-bold">
                            {rule.severity} REJECT
                          </span>
                        </div>
                        <p className="text-slate-300 font-medium mb-1">
                          {rule.description}
                        </p>
                        <p className="text-slate-400 text-[11px]">
                          {rule.technical_explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Machine Evidence Ledger */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Machine Evidence Ledger ({selectedEvaluation.evidence.length} Parameters Evaluated)
                </h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {selectedEvaluation.evidence.map((item, idx) => {
                    const isMatch = item.status === 'MATCH' || item.status === 'NORMALIZED_MATCH';
                    const isCritical = item.status === 'CRITICAL_MISMATCH';

                    return (
                      <div
                        key={idx}
                        className={`flex items-start gap-2 p-2 rounded text-xs border ${
                          isCritical
                            ? 'bg-rose-950/20 border-rose-900/40 text-rose-300'
                            : isMatch
                            ? 'bg-emerald-950/20 border-emerald-900/30 text-slate-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        {isMatch ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-200 uppercase text-[10px]">
                              {item.attribute}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {item.source_val} ↔ {item.target_val}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 mt-0.5">{item.message}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* AI Narrative */}
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs">
                <span className="text-[10px] font-semibold text-slate-400 uppercase block mb-1">
                  Explainability Narrative
                </span>
                <p className="text-slate-300 leading-relaxed font-sans">
                  {selectedEvaluation.reasoning_narrative}
                </p>
              </div>

              {/* Expert Reviewer Actions */}
              <div className="pt-2 border-t border-slate-800 space-y-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Auditor Decision Notes / Committee Rationalization:
                  </label>
                  <input
                    type="text"
                    value={decisionNotes}
                    onChange={(e) => setDecisionNotes(e.target.value)}
                    placeholder="Enter audit rationale (e.g. Approved per IS 1367 fastener standard equivalence)..."
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5">
                  <button
                    onClick={() => {
                      onRejectMatch(selectedEvaluation.evaluation_id, decisionNotes || 'Rejected by Expert');
                      setDecisionNotes('');
                    }}
                    className="px-3.5 py-1.5 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/80 rounded-lg text-xs font-semibold transition"
                  >
                    Confirm Mismatch / Reject
                  </button>

                  <button
                    onClick={() => {
                      onApproveMatch(selectedEvaluation.evaluation_id, decisionNotes || 'Approved by Expert');
                      setDecisionNotes('');
                    }}
                    className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold transition shadow-sm"
                  >
                    Approve Equivalence & Merge
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs">
              Select an evaluation from the list to inspect machine evidence.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
