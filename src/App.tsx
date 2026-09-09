import React, { useState, useMemo, useCallback } from 'react';
import { RAW_SYNTHETIC_DATASET } from './data/syntheticData';
import { INITIAL_TECHNICAL_RULES } from './engine/technicalRules';
import { runUnifiedPipeline, PipelineResult } from './engine/pipeline';
import { AuditLogEntry, RawMaterialRecord, RuleSeverity, TechnicalRule } from './types';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { NationalCatalogView } from './components/NationalCatalogView';
import { EquivalenceMatrixView } from './components/EquivalenceMatrixView';
import { SafetyVetoShowcase } from './components/SafetyVetoShowcase';
import { TechnicalRulesView } from './components/TechnicalRulesView';
import { IngestionTraceabilityView } from './components/IngestionTraceabilityView';
import { ProcurementAnalyticsView } from './components/ProcurementAnalyticsView';
import { LineageGraphView } from './components/LineageGraphView';
import { AuditTrailView } from './components/AuditTrailView';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('catalog');
  const [rawRecords, setRawRecords] = useState<RawMaterialRecord[]>(RAW_SYNTHETIC_DATASET);
  const [rules, setRules] = useState<TechnicalRule[]>(INITIAL_TECHNICAL_RULES);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Run pipeline computation
  const pipelineResult: PipelineResult = useMemo(() => {
    return runUnifiedPipeline(rawRecords, rules);
  }, [rawRecords, rules]);

  // Handle re-running the entire pipeline
  const handleRefreshPipeline = useCallback(() => {
    setIsProcessing(true);
    setTimeout(() => {
      // Re-run pipeline and add audit log
      const newAudit: AuditLogEntry = {
        audit_id: `AUD-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toISOString(),
        actor: 'SR_MATERIALS_ENGINEER',
        actor_role: 'CPSE_ADMINISTRATOR',
        action_type: 'MATCH_EVALUATION',
        entity_type: 'PIPELINE',
        entity_id: 'GLOBAL_RUN',
        details: 'Manually re-triggered normalization and cross-CPSE equivalence evaluation.',
      };
      setAuditLogs(prev => [newAudit, ...prev]);
      setIsProcessing(false);
    }, 400);
  }, []);

  // Handle exporting catalog as CSV
  const handleExportCatalog = useCallback(() => {
    const headers = [
      'National_Material_Code',
      'Standardized_Description',
      'Category_Family',
      'Base_Material',
      'Grade',
      'Standard',
      'Canonical_UOM',
      'Mapped_CPSE_Count',
      'Avg_Unit_Cost_INR',
      'Total_Annual_Spend_INR',
    ];

    const rows = pipelineResult.nationalCatalog.map(item => [
      `"${item.national_material_code}"`,
      `"${item.canonical_description.replace(/"/g, '""')}"`,
      `"${item.category_family}"`,
      `"${item.base_material}"`,
      `"${item.grade}"`,
      `"${item.standard}"`,
      `"${item.canonical_uom}"`,
      item.mapped_cpse_records.length,
      item.average_unit_cost_inr,
      item.total_spend_inr,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `National_Unified_Material_Master_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    const exportAudit: AuditLogEntry = {
      audit_id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      actor: 'SR_MATERIALS_ENGINEER',
      actor_role: 'CPSE_ADMINISTRATOR',
      action_type: 'CODE_GENERATION',
      entity_type: 'EXPORT',
      entity_id: 'CSV_CATALOG',
      details: `Exported ${pipelineResult.nationalCatalog.length} harmonized National Material codes to CSV.`,
    };
    setAuditLogs(prev => [exportAudit, ...prev]);
  }, [pipelineResult.nationalCatalog]);

  // Handle human approving an equivalence match
  const handleApproveMatch = useCallback((evaluationId: string, notes: string) => {
    const audit: AuditLogEntry = {
      audit_id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      actor: 'SR_MATERIALS_ENGINEER',
      actor_role: 'EXPERT_COMMITTEE_CHAIR',
      action_type: 'EXPERT_APPROVAL',
      entity_type: 'MATCH_EVALUATION',
      entity_id: evaluationId,
      details: `Expert approved equivalence match: ${notes}`,
    };
    setAuditLogs(prev => [audit, ...prev]);
  }, []);

  // Handle human rejecting an equivalence match
  const handleRejectMatch = useCallback((evaluationId: string, notes: string) => {
    const audit: AuditLogEntry = {
      audit_id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      actor: 'SR_MATERIALS_ENGINEER',
      actor_role: 'EXPERT_COMMITTEE_CHAIR',
      action_type: 'EXPERT_REJECTION',
      entity_type: 'MATCH_EVALUATION',
      entity_id: evaluationId,
      details: `Expert rejected equivalence match: ${notes}`,
    };
    setAuditLogs(prev => [audit, ...prev]);
  }, []);

  // Toggle a technical rule
  const handleToggleRule = useCallback((ruleId: string) => {
    setRules(prev => prev.map(r => r.rule_id === ruleId ? { ...r, is_active: !r.is_active } : r));
    const audit: AuditLogEntry = {
      audit_id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      actor: 'TECHNICAL_BOARD',
      actor_role: 'RULE_ADMINISTRATOR',
      action_type: 'RULE_CHANGE',
      entity_type: 'TECHNICAL_RULE',
      entity_id: ruleId,
      details: `Toggled active state for engineering rule ${ruleId}`,
    };
    setAuditLogs(prev => [audit, ...prev]);
  }, []);

  // Change severity of a technical rule
  const handleChangeSeverity = useCallback((ruleId: string, severity: RuleSeverity) => {
    setRules(prev => prev.map(r => r.rule_id === ruleId ? { ...r, severity, action: severity === 'CRITICAL' ? 'REJECT' : 'EXPERT_REVIEW' } : r));
    const audit: AuditLogEntry = {
      audit_id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      actor: 'TECHNICAL_BOARD',
      actor_role: 'RULE_ADMINISTRATOR',
      action_type: 'RULE_CHANGE',
      entity_type: 'TECHNICAL_RULE',
      entity_id: ruleId,
      details: `Updated severity of rule ${ruleId} to ${severity}`,
    };
    setAuditLogs(prev => [audit, ...prev]);
  }, []);

  // Add new technical rule
  const handleAddRule = useCallback((newRule: TechnicalRule) => {
    setRules(prev => [newRule, ...prev]);
    const audit: AuditLogEntry = {
      audit_id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      actor: 'TECHNICAL_BOARD',
      actor_role: 'RULE_ADMINISTRATOR',
      action_type: 'RULE_CHANGE',
      entity_type: 'TECHNICAL_RULE',
      entity_id: newRule.rule_id,
      details: `Created new technical rule ${newRule.rule_id} for ${newRule.category_family} (${newRule.attribute_name})`,
    };
    setAuditLogs(prev => [audit, ...prev]);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Header Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRefreshPipeline={handleRefreshPipeline}
        onExportCatalog={handleExportCatalog}
        totalRecords={pipelineResult.stats.totalRawRecords}
        totalUnified={pipelineResult.stats.totalUnifiedCodes}
        isProcessing={isProcessing}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* KPI Metric Summary Strip */}
        <MetricCards stats={pipelineResult.stats} />

        {/* Tab Views */}
        <div className="mt-6">
          {activeTab === 'catalog' && (
            <NationalCatalogView
              catalog={pipelineResult.nationalCatalog}
              rawRecords={rawRecords}
            />
          )}

          {activeTab === 'equivalence' && (
            <EquivalenceMatrixView
              evaluations={pipelineResult.matchEvaluations}
              onApproveMatch={handleApproveMatch}
              onRejectMatch={handleRejectMatch}
            />
          )}

          {activeTab === 'safety' && (
            <SafetyVetoShowcase />
          )}

          {activeTab === 'rules' && (
            <TechnicalRulesView
              rules={rules}
              onToggleRule={handleToggleRule}
              onChangeSeverity={handleChangeSeverity}
              onAddRule={handleAddRule}
              onReevaluate={handleRefreshPipeline}
            />
          )}

          {activeTab === 'traceability' && (
            <IngestionTraceabilityView
              normalizedMaterials={pipelineResult.normalizedMaterials}
            />
          )}

          {activeTab === 'analytics' && (
            <ProcurementAnalyticsView
              catalog={pipelineResult.nationalCatalog}
              rawRecords={rawRecords}
            />
          )}

          {activeTab === 'lineage' && (
            <LineageGraphView
              catalog={pipelineResult.nationalCatalog}
              rawRecords={rawRecords}
            />
          )}

          {activeTab === 'audit' && (
            <AuditTrailView
              auditLogs={auditLogs}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900 py-5 text-center text-xs text-slate-400 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            National Unified Material Master Framework • CPSE Rationalization Platform
          </span>
          <span className="text-slate-400">
            CPSE-A (Oil & Gas) • CPSE-B (Power & Grid) • CPSE-C (Steel & Heavy Eng)
          </span>
        </div>
      </footer>
    </div>
  );
}
