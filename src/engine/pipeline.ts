import {
  AuditLogEntry,
  MatchEvaluation,
  NationalMaterial,
  NormalizedMaterial,
  RawMaterialRecord,
  TechnicalRule
} from '../types';
import { extractAttributesAndFingerprint } from './extractor';
import { computeFingerprintHash } from './fingerprint';
import { generateNationalMaterialCode, generateStandardizedDescription } from './nationalCode';
import { normalizeCategory, normalizeDescription, normalizeStandard, normalizeUOM } from './normalization';
import { evaluateEquivalence } from './equivalenceEngine';
import { INITIAL_TECHNICAL_RULES } from './technicalRules';

export interface PipelineResult {
  normalizedMaterials: NormalizedMaterial[];
  nationalCatalog: NationalMaterial[];
  matchEvaluations: MatchEvaluation[];
  auditLogs: AuditLogEntry[];
  stats: {
    totalRawRecords: number;
    totalUnifiedCodes: number;
    identicalDuplicatesFound: number;
    nearDuplicatesFound: number;
    functionallyEquivalentFound: number;
    criticalMismatchesPrevented: number;
    pendingExpertReviews: number;
    potentialSavingsInrLakhs: number;
    cpseDistribution: Record<string, number>;
  };
}

export function runUnifiedPipeline(
  rawRecords: RawMaterialRecord[],
  activeRules: TechnicalRule[] = INITIAL_TECHNICAL_RULES
): PipelineResult {
  const auditLogs: AuditLogEntry[] = [];
  const normalizedMaterials: NormalizedMaterial[] = [];

  // Step 1: Normalization & Extraction
  rawRecords.forEach((raw) => {
    const { canonical, trace, quality_issues } = normalizeDescription(raw.raw_description);
    const { canonical: canonicalUOM, converted: uomConverted } = normalizeUOM(raw.uom);
    const { attributes, fingerprint } = extractAttributesAndFingerprint(raw, canonical);
    const fingerprintHash = computeFingerprintHash(fingerprint);

    const norm: NormalizedMaterial = {
      material_id: `NORM-${raw.cpse}-${raw.material_code}`,
      raw_record: raw,
      canonical_description: canonical,
      canonical_uom: canonicalUOM,
      uom_conversion_applied: uomConverted,
      category_family: normalizeCategory(raw.category),
      canonical_material: fingerprint.base_material,
      canonical_grade: fingerprint.grade || 'STANDARD',
      standard_normalized: normalizeStandard(raw.standard),
      quality_issues,
      normalization_trace: trace,
      extracted_attributes: attributes,
      fingerprint,
      fingerprint_hash: fingerprintHash,
      created_at: new Date().toISOString(),
    };

    normalizedMaterials.push(norm);
  });

  // Step 2: Fingerprint Hash Blocking (O(1) exact cluster discovery)
  const hashClusters = new Map<string, NormalizedMaterial[]>();
  normalizedMaterials.forEach(m => {
    const group = hashClusters.get(m.fingerprint_hash) || [];
    group.push(m);
    hashClusters.set(m.fingerprint_hash, group);
  });

  // Step 3: Candidate Pair Matching across CPSEs
  const matchEvaluations: MatchEvaluation[] = [];
  const processedPairs = new Set<string>();

  for (let i = 0; i < normalizedMaterials.length; i++) {
    for (let j = i + 1; j < normalizedMaterials.length; j++) {
      const matA = normalizedMaterials[i];
      const matB = normalizedMaterials[j];

      if (matA.raw_record.cpse === matB.raw_record.cpse && matA.raw_record.material_code === matB.raw_record.material_code) {
        continue;
      }

      const sameCategory = matA.fingerprint.category_family === matB.fingerprint.category_family;
      const sameHash = matA.fingerprint_hash === matB.fingerprint_hash;

      if (sameCategory || sameHash) {
        const pairKey = [matA.material_id, matB.material_id].sort().join('___');
        if (!processedPairs.has(pairKey)) {
          processedPairs.add(pairKey);
          const evalResult = evaluateEquivalence(matA, matB, activeRules);
          matchEvaluations.push(evalResult);
        }
      }
    }
  }

  // Step 4: Build National Catalog with CPSE Mappings
  const nationalCatalog: NationalMaterial[] = [];
  const assignedMaterials = new Set<string>();
  let sequence = 1;

  // First pass: clusters with multiple items or exact hash match
  hashClusters.forEach((materials) => {
    if (materials.length === 0) return;

    const rep = materials[0];
    const stdDesc = generateStandardizedDescription(rep.fingerprint, rep.canonical_description);
    const natCode = generateNationalMaterialCode(rep.fingerprint, sequence++);

    const mappedCpse = materials.map(m => {
      assignedMaterials.add(m.material_id);
      return {
        cpse: m.raw_record.cpse,
        material_code: m.raw_record.material_code,
        source_description: m.raw_record.raw_description,
        mapped_at: new Date().toISOString(),
        status: 'ACTIVE' as const,
      };
    });

    const totalDemand = materials.reduce((sum, m) => sum + (m.raw_record.annual_procurement_quantity || 100), 0);
    const prices = materials.map(m => m.raw_record.unit_price_inr).filter((p): p is number => p !== undefined && p > 0);
    const avgPrice = prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : 150;
    const totalSpend = materials.reduce((sum, m) => sum + (m.raw_record.unit_price_inr || 150) * (m.raw_record.annual_procurement_quantity || 100), 0);

    nationalCatalog.push({
      national_id: `NAT-${natCode}`,
      national_material_code: natCode,
      canonical_description: stdDesc,
      category_family: rep.fingerprint.category_family,
      base_material: rep.fingerprint.base_material,
      grade: rep.fingerprint.grade || 'STANDARD',
      standard: rep.fingerprint.standard || 'STANDARD',
      canonical_uom: rep.canonical_uom,
      fingerprint: rep.fingerprint,
      mapped_cpse_records: mappedCpse,
      aggregated_demand: totalDemand,
      average_unit_cost_inr: Math.round(avgPrice),
      total_spend_inr: Math.round(totalSpend),
      created_at: new Date().toISOString(),
    });
  });

  // Second pass: single items
  normalizedMaterials.forEach(m => {
    if (!assignedMaterials.has(m.material_id)) {
      assignedMaterials.add(m.material_id);
      const stdDesc = generateStandardizedDescription(m.fingerprint, m.canonical_description);
      const natCode = generateNationalMaterialCode(m.fingerprint, sequence++);

      const unitPrice = m.raw_record.unit_price_inr || 200;
      const demand = m.raw_record.annual_procurement_quantity || 100;

      nationalCatalog.push({
        national_id: `NAT-${natCode}`,
        national_material_code: natCode,
        canonical_description: stdDesc,
        category_family: m.fingerprint.category_family,
        base_material: m.fingerprint.base_material,
        grade: m.fingerprint.grade || 'STANDARD',
        standard: m.fingerprint.standard || 'STANDARD',
        canonical_uom: m.canonical_uom,
        fingerprint: m.fingerprint,
        mapped_cpse_records: [{
          cpse: m.raw_record.cpse,
          material_code: m.raw_record.material_code,
          source_description: m.raw_record.raw_description,
          mapped_at: new Date().toISOString(),
          status: 'ACTIVE',
        }],
        aggregated_demand: demand,
        average_unit_cost_inr: unitPrice,
        total_spend_inr: unitPrice * demand,
        created_at: new Date().toISOString(),
      });
    }
  });

  // Calculate statistics
  let identicalCount = 0;
  let nearDupCount = 0;
  let funcEqCount = 0;
  let criticalPreventedCount = 0;
  let pendingReviewsCount = 0;

  matchEvaluations.forEach(ev => {
    if (ev.ai_recommendation === 'SAME_MATERIAL') identicalCount++;
    else if (ev.ai_recommendation === 'NEAR_DUPLICATE') nearDupCount++;
    else if (ev.ai_recommendation === 'FUNCTIONALLY_EQUIVALENT') funcEqCount++;
    else if (ev.ai_recommendation === 'EXPERT_REVIEW') pendingReviewsCount++;

    if (ev.risk_level === 'CRITICAL' && ev.semantic_similarity > 0.65) {
      criticalPreventedCount++;
    }
  });

  // Calculate savings potential: items with multiple CPSEs having price variations
  let potentialSavingsInr = 0;
  nationalCatalog.forEach(item => {
    if (item.mapped_cpse_records.length > 1) {
      const records = item.mapped_cpse_records;
      const prices = records.map(r => {
        const found = rawRecords.find(x => x.cpse === r.cpse && x.material_code === r.material_code);
        return {
          price: found?.unit_price_inr || item.average_unit_cost_inr,
          qty: found?.annual_procurement_quantity || 100,
        };
      });
      const minPrice = Math.min(...prices.map(p => p.price));
      const totalSpend = prices.reduce((sum, p) => sum + p.price * p.qty, 0);
      const optimizedSpend = prices.reduce((sum, p) => sum + minPrice * p.qty, 0);
      potentialSavingsInr += Math.max(0, totalSpend - optimizedSpend);
    }
  });

  const cpseDistribution: Record<string, number> = {};
  rawRecords.forEach(r => {
    cpseDistribution[r.cpse] = (cpseDistribution[r.cpse] || 0) + 1;
  });

  return {
    normalizedMaterials,
    nationalCatalog,
    matchEvaluations,
    auditLogs,
    stats: {
      totalRawRecords: rawRecords.length,
      totalUnifiedCodes: nationalCatalog.length,
      identicalDuplicatesFound: identicalCount,
      nearDuplicatesFound: nearDupCount,
      functionallyEquivalentFound: funcEqCount,
      criticalMismatchesPrevented: criticalPreventedCount,
      pendingExpertReviews: pendingReviewsCount,
      potentialSavingsInrLakhs: parseFloat((potentialSavingsInr / 100000).toFixed(2)),
      cpseDistribution,
    }
  };
}
