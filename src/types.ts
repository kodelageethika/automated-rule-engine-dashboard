export type CPSEId = 'CPSE-A' | 'CPSE-B' | 'CPSE-C';

export type EquivalenceClass = 
  | 'SAME_MATERIAL'
  | 'NEAR_DUPLICATE'
  | 'FUNCTIONALLY_EQUIVALENT'
  | 'NOT_EQUIVALENT'
  | 'EXPERT_REVIEW';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type RuleSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RuleAction = 'ALLOW' | 'FLAG' | 'EXPERT_REVIEW' | 'REJECT';

export interface RawMaterialRecord {
  record_id: number;
  cpse: CPSEId;
  material_code: string;
  raw_description: string;
  uom: string;
  category: string;
  standard: string;
  material: string;
  grade: string;
  size: string;
  specification: string;
  application: string;
  source_system: string;
  legacy_status: string;
  description_language: string;
  data_quality_flag: string;
  expected_demo_label?: string;
  annual_procurement_quantity?: number;
  unit_price_inr?: number;
}

export interface NormalizationTraceItem {
  field: string;
  before: string;
  after: string;
  rule_id: string;
  method: 'deterministic' | 'regex' | 'dictionary';
  confidence: number;
}

export interface NormalizedMaterial {
  material_id: string; // uuid or cpse:code
  raw_record: RawMaterialRecord;
  canonical_description: string;
  canonical_uom: string;
  uom_conversion_applied: boolean;
  category_family: string;
  canonical_material: string;
  canonical_grade: string;
  standard_normalized: string;
  quality_issues: string[];
  normalization_trace: NormalizationTraceItem[];
  extracted_attributes: Record<string, any>;
  fingerprint: MaterialFingerprint;
  fingerprint_hash: string;
  embedding?: number[];
  created_at?: string;
}

export interface MaterialFingerprint {
  category_family: string;
  material_type: string;
  base_material: string;
  grade: string | null;
  standard: string | null;
  application: string | null;
  dimensions: {
    diameter_mm?: number;
    length_mm?: number;
    width_mm?: number;
    thickness_mm?: number;
    nominal_bore_nb?: number;
    size_label?: string;
  };
  technical_parameters: {
    schedule?: string;
    pressure_rating?: string;
    voltage_v?: number;
    breaking_capacity_ka?: number;
    power_kw?: number;
    pole_count?: number;
    conductor_material?: string;
    temperature_range?: string;
    capacity_flow?: string;
    head_m?: number;
    seal_type?: string;
  };
}

export interface TechnicalRule {
  rule_id: string;
  category_family: string;
  attribute_name: string;
  severity: RuleSeverity;
  action: RuleAction;
  description: string;
  parameters?: Record<string, any>;
  is_active: boolean;
}

export interface RuleViolation {
  rule_id: string;
  attribute: string;
  source_value: any;
  candidate_value: any;
  severity: RuleSeverity;
  action: RuleAction;
  description: string;
  technical_explanation: string;
}

export interface EvidenceItem {
  attribute: string;
  source_val: string;
  target_val: string;
  status: 'MATCH' | 'NORMALIZED_MATCH' | 'MISMATCH' | 'CRITICAL_MISMATCH' | 'UNKNOWN';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  rule_triggered?: string;
  message: string;
}

export interface MatchEvaluation {
  evaluation_id: string;
  source_material_id: string;
  candidate_material_id: string;
  source_material: NormalizedMaterial;
  candidate_material: NormalizedMaterial;
  semantic_similarity: number;
  attribute_similarity: number;
  technical_compatibility: 'PASS' | 'CONDITIONAL' | 'FAIL';
  triggered_rules: RuleViolation[];
  ai_recommendation: EquivalenceClass;
  confidence_score: number;
  risk_level: RiskLevel;
  evidence: EvidenceItem[];
  reasoning_narrative: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'MODIFIED';
  created_at: string;
}

export interface NationalMaterial {
  national_id: string;
  national_material_code: string;
  canonical_description: string;
  category_family: string;
  base_material: string;
  grade: string;
  standard: string;
  canonical_uom: string;
  fingerprint: MaterialFingerprint;
  mapped_cpse_records: {
    cpse: CPSEId;
    material_code: string;
    source_description: string;
    mapped_at: string;
    status: 'ACTIVE' | 'MIGRATED' | 'REPLACED';
  }[];
  aggregated_demand: number;
  average_unit_cost_inr: number;
  total_spend_inr: number;
  created_at: string;
}

export interface ExpertReviewDecision {
  evaluation_id: string;
  reviewer_id: string;
  reviewer_role: string;
  decision: 'APPROVE' | 'REJECT' | 'MODIFY';
  assigned_national_code?: string;
  modified_attributes?: Record<string, any>;
  rationale: string;
  timestamp: string;
}

export interface AuditLogEntry {
  audit_id: string;
  timestamp: string;
  actor: string;
  actor_role: string;
  action_type: 'INGESTION' | 'MATCH_EVALUATION' | 'EXPERT_APPROVAL' | 'EXPERT_REJECTION' | 'EXPERT_MODIFICATION' | 'RULE_CHANGE' | 'CODE_GENERATION';
  entity_type: string;
  entity_id: string;
  details: string;
  old_state?: any;
  new_state?: any;
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'NATIONAL_MATERIAL' | 'CPSE_MATERIAL' | 'GRADE' | 'STANDARD' | 'APPLICATION' | 'SUPPLIER' | 'CPSE';
  properties: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: 'MAPPED_TO' | 'BELONGS_TO' | 'HAS_GRADE' | 'COMPLIES_WITH' | 'USED_FOR' | 'EQUIVALENT_TO';
}

export interface ProcurementInsight {
  total_spend_inr: number;
  duplicate_inventory_count: number;
  consolidation_opportunities_count: number;
  estimated_consolidation_savings_inr: number;
  savings_label: 'DEMO ESTIMATE (SYNTHETIC DATA)';
  top_consolidated_categories: {
    category: string;
    national_materials_count: number;
    cpse_duplicate_codes: number;
    total_spend_inr: number;
    potential_savings_inr: number;
  }[];
}

export interface BenchmarkMetrics {
  total_records: number;
  total_candidate_pairs: number;
  known_groups_count: number;
  candidate_retrieval_rate: number;
  precision: number;
  recall: number;
  f1_score: number;
  false_merge_count: number;
  false_merge_rate: number;
  critical_traps_evaluated: number;
  critical_mismatches_intercepted: number;
  expert_review_queue_count: number;
}
