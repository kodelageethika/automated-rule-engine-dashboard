import React, { useState } from 'react';
import { AuditLogEntry } from '../types';
import { ShieldCheck, History, UserCheck, Filter, Search, Clock } from 'lucide-react';

interface AuditTrailViewProps {
  auditLogs: AuditLogEntry[];
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({ auditLogs }) => {
  const [filterAction, setFilterAction] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Sample initial audit logs if none passed
  const initialLogs: AuditLogEntry[] = [
    {
      audit_id: 'AUD-001',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      actor: 'INGESTION_ENGINE',
      actor_role: 'AUTOMATED_SYSTEM',
      action_type: 'INGESTION',
      entity_type: 'RAW_DATASET',
      entity_id: 'BATCH_2026_CPSE_105',
      details: 'Ingested 105 synthetic material records across CPSE-A, CPSE-B, and CPSE-C.',
    },
    {
      audit_id: 'AUD-002',
      timestamp: new Date(Date.now() - 3600000 * 1.8).toISOString(),
      actor: 'NORMALIZATION_PIPELINE',
      actor_role: 'AUTOMATED_SYSTEM',
      action_type: 'MATCH_EVALUATION',
      entity_type: 'NORMALIZATION',
      entity_id: 'ALL_RECORDS',
      details: 'Normalized UOM, expanded abbreviations, and generated SHA-256 fingerprint hashes.',
    },
    {
      audit_id: 'AUD-003',
      timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
      actor: 'TECHNICAL_RULE_ENGINE',
      actor_role: 'RULE_VETO_SYSTEM',
      action_type: 'MATCH_EVALUATION',
      entity_type: 'SAFETY_VETO',
      entity_id: 'R-FAST-01',
      details: 'Enforced veto on SS304 vs SS316 pair MAT-A-0001 and MAT-B-0003 despite 97.4% semantic similarity.',
    },
    {
      audit_id: 'AUD-004',
      timestamp: new Date(Date.now() - 3600000 * 1.2).toISOString(),
      actor: 'TECHNICAL_RULE_ENGINE',
      actor_role: 'RULE_VETO_SYSTEM',
      action_type: 'MATCH_EVALUATION',
      entity_type: 'SAFETY_VETO',
      entity_id: 'R-PIPE-01',
      details: 'Enforced veto on Sch 40 vs Sch 80 pipe pair MAT-A-0009 and MAT-B-0010 (pressure burst hazard).',
    },
    {
      audit_id: 'AUD-005',
      timestamp: new Date(Date.now() - 3600000 * 0.8).toISOString(),
      actor: 'NATIONAL_CODE_GOVERNOR',
      actor_role: 'CODE_ASSIGNER',
      action_type: 'CODE_GENERATION',
      entity_type: 'NATIONAL_MATERIAL',
      entity_id: 'NM-FAST-SS304-M10X50-001',
      details: 'Assigned deterministic national code to unified fastener master cluster (CPSE-A, CPSE-B, CPSE-C).',
    },
  ];

  const allLogs = [...auditLogs, ...initialLogs];

  const filteredLogs = allLogs.filter(log => {
    if (filterAction !== 'ALL' && log.action_type !== filterAction) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        log.actor.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.entity_id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-blue-400" />
            Immutable Audit Trail & CPSE Governance Ledger
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Every AI recommendation, technical rule override, expert approval, and national code assignment is permanently recorded with full actor traceability.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search audit trail..."
              className="pl-9 pr-4 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Actions</option>
            <option value="INGESTION">Ingestion</option>
            <option value="MATCH_EVALUATION">Match Evaluation</option>
            <option value="EXPERT_APPROVAL">Expert Approval</option>
            <option value="EXPERT_REJECTION">Expert Rejection</option>
            <option value="CODE_GENERATION">Code Generation</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Audit ID & Timestamp</th>
              <th className="py-3 px-4">Actor & Role</th>
              <th className="py-3 px-4">Action Type</th>
              <th className="py-3 px-4">Target Entity</th>
              <th className="py-3 px-4">Audit Event Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredLogs.map((log, idx) => (
              <tr key={log.audit_id + idx} className="hover:bg-slate-800/30 transition">
                <td className="py-3 px-4 whitespace-nowrap">
                  <span className="font-mono font-bold text-blue-400 block">{log.audit_id}</span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {new Date(log.timestamp).toLocaleTimeString()} • {new Date(log.timestamp).toLocaleDateString()}
                  </span>
                </td>

                <td className="py-3 px-4 whitespace-nowrap">
                  <span className="font-semibold text-slate-200 block">{log.actor}</span>
                  <span className="text-[10px] text-slate-400">{log.actor_role}</span>
                </td>

                <td className="py-3 px-4 whitespace-nowrap">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-950 text-slate-300 border border-slate-800">
                    {log.action_type}
                  </span>
                </td>

                <td className="py-3 px-4 font-mono text-slate-300 whitespace-nowrap">
                  <span className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 text-[11px]">
                    {log.entity_id}
                  </span>
                </td>

                <td className="py-3 px-4 text-slate-300">
                  {log.details}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
