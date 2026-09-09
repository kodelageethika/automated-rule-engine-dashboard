import { EvidenceItem, MatchEvaluation, NormalizedMaterial, TechnicalRule } from '../types';
import { evaluateTechnicalRules, INITIAL_TECHNICAL_RULES } from './technicalRules';

/**
 * Computes cosine token & n-gram similarity between two material canonical descriptions
 */
export function computeSemanticSimilarity(descA: string, descB: string): number {
  const cleanA = descA.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
  const cleanB = descB.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);

  if (!cleanA.length || !cleanB.length) return 0;

  const setA = new Set(cleanA);
  const setB = new Set(cleanB);

  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) {
      intersection++;
    }
  }

  // Jaccard token score
  const union = new Set([...cleanA, ...cleanB]).size;
  const tokenJaccard = union > 0 ? intersection / union : 0;

  // Character tri-gram overlap for catching spelling/abbreviation similarities
  const ngrams = (str: string, n = 3) => {
    const s = `  ${str.toLowerCase()}  `;
    const grams = new Map<string, number>();
    for (let i = 0; i < s.length - n + 1; i++) {
      const g = s.slice(i, i + n);
      grams.set(g, (grams.get(g) || 0) + 1);
    }
    return grams;
  };

  const gA = ngrams(descA);
  const gB = ngrams(descB);

  let dotProduct = 0;
  let magA = 0;
  let magB = 0;

  for (const count of gA.values()) magA += count * count;
  for (const count of gB.values()) magB += count * count;

  for (const [gram, countA] of gA.entries()) {
    const countB = gB.get(gram) || 0;
    dotProduct += countA * countB;
  }

  const ngramCosine = (magA > 0 && magB > 0) ? dotProduct / (Math.sqrt(magA) * Math.sqrt(magB)) : 0;

  // Weighted blend of token semantics & morphological similarity
  const blended = 0.45 * tokenJaccard + 0.55 * ngramCosine;
  return Math.min(0.9999, Math.max(0.05, blended));
}

/**
 * Compares structured attributes between source and candidate
 */
export function computeAttributeSimilarity(
  source: NormalizedMaterial,
  candidate: NormalizedMaterial
): { score: number; evidence: EvidenceItem[] } {
  const evidence: EvidenceItem[] = [];
  let matchedPoints = 0;
  let totalPoints = 0;

  const sFp = source.fingerprint;
  const cFp = candidate.fingerprint;

  // 1. Category Family
  totalPoints += 2;
  if (sFp.category_family === cFp.category_family) {
    matchedPoints += 2;
    evidence.push({
      attribute: 'category_family',
      source_val: sFp.category_family,
      target_val: cFp.category_family,
      status: 'MATCH',
      severity: 'LOW',
      message: `Both materials belong to identical ${sFp.category_family} family.`
    });
  } else {
    evidence.push({
      attribute: 'category_family',
      source_val: sFp.category_family,
      target_val: cFp.category_family,
      status: 'MISMATCH',
      severity: 'HIGH',
      message: `Disparate category families (${sFp.category_family} vs ${cFp.category_family}).`
    });
  }

  // 2. Material Type
  totalPoints += 2;
  if (sFp.material_type.toLowerCase() === cFp.material_type.toLowerCase()) {
    matchedPoints += 2;
    evidence.push({
      attribute: 'material_type',
      source_val: sFp.material_type,
      target_val: cFp.material_type,
      status: 'MATCH',
      severity: 'LOW',
      message: `Identical material component type (${sFp.material_type}).`
    });
  } else {
    evidence.push({
      attribute: 'material_type',
      source_val: sFp.material_type,
      target_val: cFp.material_type,
      status: 'MISMATCH',
      severity: 'MEDIUM',
      message: `Different component classifications (${sFp.material_type} vs ${cFp.material_type}).`
    });
  }

  // 3. Base Material
  totalPoints += 2;
  if (sFp.base_material && cFp.base_material) {
    if (sFp.base_material.toLowerCase() === cFp.base_material.toLowerCase()) {
      matchedPoints += 2;
      evidence.push({
        attribute: 'base_material',
        source_val: sFp.base_material,
        target_val: cFp.base_material,
        status: 'MATCH',
        severity: 'LOW',
        message: `Identical base metallurgy (${sFp.base_material}).`
      });
    } else {
      evidence.push({
        attribute: 'base_material',
        source_val: sFp.base_material,
        target_val: cFp.base_material,
        status: 'CRITICAL_MISMATCH',
        severity: 'CRITICAL',
        message: `Base metallurgy conflict: ${sFp.base_material} vs ${cFp.base_material}.`
      });
    }
  }

  // 4. Grade
  totalPoints += 3;
  if (sFp.grade && cFp.grade) {
    const sG = sFp.grade.toUpperCase().replace(/\s/g, '');
    const cG = cFp.grade.toUpperCase().replace(/\s/g, '');
    if (sG === cG) {
      matchedPoints += 3;
      evidence.push({
        attribute: 'grade',
        source_val: sFp.grade,
        target_val: cFp.grade,
        status: 'MATCH',
        severity: 'LOW',
        message: `Exact technical grade match (${sFp.grade}).`
      });
    } else {
      evidence.push({
        attribute: 'grade',
        source_val: sFp.grade,
        target_val: cFp.grade,
        status: 'CRITICAL_MISMATCH',
        severity: 'CRITICAL',
        message: `Grade discrepancy: ${sFp.grade} vs ${cFp.grade}.`
      });
    }
  } else if (!sFp.grade && !cFp.grade) {
    matchedPoints += 1;
    totalPoints += 1;
  } else {
    evidence.push({
      attribute: 'grade',
      source_val: sFp.grade || 'UNSPECIFIED',
      target_val: cFp.grade || 'UNSPECIFIED',
      status: 'UNKNOWN',
      severity: 'MEDIUM',
      message: 'Grade specification omitted in one or both records.'
    });
  }

  // 5. Dimensions (Diameter, Length, NB, Plate)
  if (sFp.dimensions.diameter_mm !== undefined || cFp.dimensions.diameter_mm !== undefined) {
    totalPoints += 2;
    if (sFp.dimensions.diameter_mm === cFp.dimensions.diameter_mm && sFp.dimensions.diameter_mm !== undefined) {
      matchedPoints += 2;
      evidence.push({
        attribute: 'diameter_mm',
        source_val: `M${sFp.dimensions.diameter_mm}`,
        target_val: `M${cFp.dimensions.diameter_mm}`,
        status: 'MATCH',
        severity: 'LOW',
        message: `Identical nominal diameter (M${sFp.dimensions.diameter_mm}).`
      });
    } else {
      evidence.push({
        attribute: 'diameter_mm',
        source_val: `M${sFp.dimensions.diameter_mm ?? 'N/A'}`,
        target_val: `M${cFp.dimensions.diameter_mm ?? 'N/A'}`,
        status: 'MISMATCH',
        severity: 'CRITICAL',
        message: `Diameter mismatch: M${sFp.dimensions.diameter_mm} vs M${cFp.dimensions.diameter_mm}.`
      });
    }
  }

  if (sFp.dimensions.length_mm !== undefined || cFp.dimensions.length_mm !== undefined) {
    totalPoints += 1;
    if (sFp.dimensions.length_mm === cFp.dimensions.length_mm && sFp.dimensions.length_mm !== undefined) {
      matchedPoints += 1;
      evidence.push({
        attribute: 'length_mm',
        source_val: `${sFp.dimensions.length_mm} mm`,
        target_val: `${cFp.dimensions.length_mm} mm`,
        status: 'MATCH',
        severity: 'LOW',
        message: `Identical length (${sFp.dimensions.length_mm} mm).`
      });
    } else {
      evidence.push({
        attribute: 'length_mm',
        source_val: `${sFp.dimensions.length_mm ?? 'N/A'} mm`,
        target_val: `${cFp.dimensions.length_mm ?? 'N/A'} mm`,
        status: 'MISMATCH',
        severity: 'HIGH',
        message: `Length variation: ${sFp.dimensions.length_mm} mm vs ${cFp.dimensions.length_mm} mm.`
      });
    }
  }

  // 6. Standard
  totalPoints += 1;
  if (sFp.standard && cFp.standard) {
    if (sFp.standard === cFp.standard) {
      matchedPoints += 1;
      evidence.push({
        attribute: 'standard',
        source_val: sFp.standard,
        target_val: cFp.standard,
        status: 'MATCH',
        severity: 'LOW',
        message: `Compliance with identical engineering standard (${sFp.standard}).`
      });
    } else {
      evidence.push({
        attribute: 'standard',
        source_val: sFp.standard,
        target_val: cFp.standard,
        status: 'MISMATCH',
        severity: 'MEDIUM',
        message: `Different governing standards (${sFp.standard} vs ${cFp.standard}).`
      });
    }
  }

  // 7. Normalized UOM
  totalPoints += 1;
  if (source.canonical_uom === candidate.canonical_uom) {
    matchedPoints += 1;
    evidence.push({
      attribute: 'uom',
      source_val: `${source.raw_record.uom} -> ${source.canonical_uom}`,
      target_val: `${candidate.raw_record.uom} -> ${candidate.canonical_uom}`,
      status: 'NORMALIZED_MATCH',
      severity: 'LOW',
      message: `UOM normalized to canonical ${source.canonical_uom} (from original ${source.raw_record.uom} and ${candidate.raw_record.uom}).`
    });
  } else {
    evidence.push({
      attribute: 'uom',
      source_val: source.canonical_uom,
      target_val: candidate.canonical_uom,
      status: 'MISMATCH',
      severity: 'HIGH',
      message: `Incompatible Unit of Measurement (${source.canonical_uom} vs ${candidate.canonical_uom}).`
    });
  }

  const score = totalPoints > 0 ? matchedPoints / totalPoints : 0;
  return { score, evidence };
}

/**
 * Main Risk-Aware Equivalence Engine
 */
export function evaluateEquivalence(
  source: NormalizedMaterial,
  candidate: NormalizedMaterial,
  activeRules: TechnicalRule[] = INITIAL_TECHNICAL_RULES
): MatchEvaluation {
  const semanticSimilarity = computeSemanticSimilarity(
    source.canonical_description,
    candidate.canonical_description
  );

  const { score: attributeSimilarity, evidence } = computeAttributeSimilarity(source, candidate);

  // Run deterministic technical rules
  const { violations, compatibilityStatus } = evaluateTechnicalRules(source, candidate, activeRules);

  // Merge rule violations into evidence
  for (const v of violations) {
    evidence.push({
      attribute: v.attribute,
      source_val: String(v.source_value ?? 'N/A'),
      target_val: String(v.candidate_value ?? 'N/A'),
      status: v.severity === 'CRITICAL' ? 'CRITICAL_MISMATCH' : 'MISMATCH',
      severity: v.severity,
      rule_triggered: v.rule_id,
      message: v.technical_explanation,
    });
  }

  const hasCritical = violations.some(v => v.severity === 'CRITICAL');
  const hasHigh = violations.some(v => v.severity === 'HIGH');

  let recommendation: MatchEvaluation['ai_recommendation'];
  let riskLevel: MatchEvaluation['risk_level'];
  let confidence: number;
  let narrative: string;

  // ABSOLUTE RULE PRECEDENCE:
  // Critical technical conflict strictly vetoes high semantic similarity!
  if (hasCritical) {
    recommendation = 'NOT_EQUIVALENT';
    riskLevel = 'CRITICAL';
    confidence = Math.max(0.95, 1 - (1 - semanticSimilarity) * 0.1);
    const criticalRule = violations.find(v => v.severity === 'CRITICAL')!;
    narrative = `CRITICAL TECHNICAL MISMATCH: Despite a high semantic similarity of ${(semanticSimilarity * 100).toFixed(1)}%, Rule ${criticalRule.rule_id} was triggered for attribute "${criticalRule.attribute}" (${criticalRule.source_value} vs ${criticalRule.candidate_value}). Automatic merge is strictly FORBIDDEN. ${criticalRule.technical_explanation}`;
  } else if (hasHigh) {
    recommendation = 'EXPERT_REVIEW';
    riskLevel = 'HIGH';
    confidence = 0.78;
    const highRule = violations.find(v => v.severity === 'HIGH')!;
    narrative = `ENGINEERING REVIEW REQUIRED: High-severity condition triggered by Rule ${highRule.rule_id} on "${highRule.attribute}" (${highRule.source_value} vs ${highRule.candidate_value}). Semantic similarity is ${(semanticSimilarity * 100).toFixed(1)}%, but human validation is required before merging.`;
  } else if (compatibilityStatus === 'PASS' && semanticSimilarity >= 0.88 && attributeSimilarity >= 0.85) {
    recommendation = 'SAME_MATERIAL';
    riskLevel = 'LOW';
    confidence = (semanticSimilarity * 0.35 + attributeSimilarity * 0.65);
    narrative = `VALIDATED IDENTICAL MATERIAL: High semantic correlation (${(semanticSimilarity * 100).toFixed(1)}%), full attribute concordance (${(attributeSimilarity * 100).toFixed(1)}%), zero technical rule violations, and canonicalized UOM. Safe for common national code assignment.`;
  } else if (compatibilityStatus === 'PASS' && semanticSimilarity >= 0.80 && attributeSimilarity >= 0.75) {
    recommendation = 'NEAR_DUPLICATE';
    riskLevel = 'LOW';
    confidence = (semanticSimilarity * 0.4 + attributeSimilarity * 0.6);
    narrative = `NEAR DUPLICATE IDENTIFIED: Strong semantic and technical alignment (${(semanticSimilarity * 100).toFixed(1)}%) with minor non-critical specification or naming variations. Safe for rationalization.`;
  } else if (compatibilityStatus === 'PASS' && semanticSimilarity >= 0.68 && attributeSimilarity >= 0.65) {
    recommendation = 'FUNCTIONALLY_EQUIVALENT';
    riskLevel = 'MEDIUM';
    confidence = (semanticSimilarity * 0.4 + attributeSimilarity * 0.6);
    narrative = `FUNCTIONALLY EQUIVALENT: Common operational role and compatible engineering parameters with minor variation in standard or manufacturer specifics.`;
  } else if (semanticSimilarity >= 0.72) {
    recommendation = 'EXPERT_REVIEW';
    riskLevel = 'MEDIUM';
    confidence = 0.70;
    narrative = `AMBIGUOUS MATCH: Moderate semantic similarity (${(semanticSimilarity * 100).toFixed(1)}%) without explicit rule failure, but insufficient structured evidence to declare automatic equivalence. Routed to Expert Queue.`;
  } else {
    recommendation = 'NOT_EQUIVALENT';
    riskLevel = 'LOW';
    confidence = 0.92;
    narrative = `DISTINCT MATERIALS: Low semantic and attribute correlation. Different engineering components.`;
  }

  return {
    evaluation_id: `EVAL-${source.raw_record.record_id}-${candidate.raw_record.record_id}`,
    source_material_id: source.material_id,
    candidate_material_id: candidate.material_id,
    source_material: source,
    candidate_material: candidate,
    semantic_similarity: parseFloat(semanticSimilarity.toFixed(4)),
    attribute_similarity: parseFloat(attributeSimilarity.toFixed(4)),
    technical_compatibility: compatibilityStatus,
    triggered_rules: violations,
    ai_recommendation: recommendation,
    confidence_score: parseFloat(confidence.toFixed(4)),
    risk_level: riskLevel,
    evidence,
    reasoning_narrative: narrative,
    status: 'PENDING',
    created_at: new Date().toISOString(),
  };
}
