import { NormalizedMaterial, RuleSeverity, RuleViolation, TechnicalRule } from '../types';

export const INITIAL_TECHNICAL_RULES: TechnicalRule[] = [
  {
    rule_id: 'R-FAST-01',
    category_family: 'FASTENERS',
    attribute_name: 'grade',
    severity: 'CRITICAL',
    action: 'REJECT',
    description: 'Fastener Grade Metallurgy Compatibility (e.g., SS304 vs SS316)',
    parameters: { forbidden_pairs: [['SS304', 'SS316']] },
    is_active: true,
  },
  {
    rule_id: 'R-FAST-02',
    category_family: 'FASTENERS',
    attribute_name: 'diameter_mm',
    severity: 'CRITICAL',
    action: 'REJECT',
    description: 'Fastener Nominal Thread Diameter Exact Equality',
    parameters: { tolerance_mm: 0 },
    is_active: true,
  },
  {
    rule_id: 'R-FAST-03',
    category_family: 'FASTENERS',
    attribute_name: 'length_mm',
    severity: 'HIGH',
    action: 'EXPERT_REVIEW',
    description: 'Fastener Length Tolerance Check',
    parameters: { tolerance_percent: 5 },
    is_active: true,
  },
  {
    rule_id: 'R-PIPE-01',
    category_family: 'PIPING',
    attribute_name: 'schedule',
    severity: 'CRITICAL',
    action: 'REJECT',
    description: 'Pipe Wall Thickness Schedule Compatibility (Sch 40 vs Sch 80)',
    parameters: { strict_match: true },
    is_active: true,
  },
  {
    rule_id: 'R-PIPE-02',
    category_family: 'PIPING',
    attribute_name: 'nominal_bore_nb',
    severity: 'CRITICAL',
    action: 'REJECT',
    description: 'Pipe Nominal Bore Equality (50 NB vs 25 NB)',
    parameters: { strict_match: true },
    is_active: true,
  },
  {
    rule_id: 'R-PIPE-03',
    category_family: 'PIPING',
    attribute_name: 'base_material',
    severity: 'CRITICAL',
    action: 'REJECT',
    description: 'Piping Metallurgy Class (Carbon Steel vs Stainless Steel)',
    parameters: { strict_match: true },
    is_active: true,
  },
  {
    rule_id: 'R-VALVE-01',
    category_family: 'VALVES',
    attribute_name: 'pressure_rating',
    severity: 'CRITICAL',
    action: 'REJECT',
    description: 'Valve ANSI Pressure Class Compatibility (Class 150 vs Class 300)',
    parameters: { strict_match: true },
    is_active: true,
  },
  {
    rule_id: 'R-ELEC-01',
    category_family: 'ELECTRICAL_CABLES',
    attribute_name: 'voltage_v',
    severity: 'CRITICAL',
    action: 'REJECT',
    description: 'Electrical Rated Voltage Insulation Threshold (1 kV vs 11 kV)',
    parameters: { tolerance_percent: 10 },
    is_active: true,
  },
  {
    rule_id: 'R-ELEC-02',
    category_family: 'SWITCHGEAR',
    attribute_name: 'breaking_capacity_ka',
    severity: 'CRITICAL',
    action: 'REJECT',
    description: 'Short-Circuit Breaking Capacity (25 kA vs 36 kA arc hazard)',
    parameters: { strict_match: true },
    is_active: true,
  },
  {
    rule_id: 'R-ELEC-03',
    category_family: 'ELECTRICAL_CABLES',
    attribute_name: 'base_material',
    severity: 'CRITICAL',
    action: 'REJECT',
    description: 'Conductor Metallurgy Current Carrying Capacity (Copper vs Aluminium)',
    parameters: { strict_match: true },
    is_active: true,
  },
  {
    rule_id: 'R-ELEC-04',
    category_family: 'SWITCHGEAR',
    attribute_name: 'pole_count',
    severity: 'CRITICAL',
    action: 'REJECT',
    description: 'Switchgear/Contactor Pole Configuration (3 Pole vs 4 Pole neutral protection)',
    parameters: { strict_match: true },
    is_active: true,
  },
  {
    rule_id: 'R-SEAL-01',
    category_family: 'SEALS',
    attribute_name: 'base_material',
    severity: 'CRITICAL',
    action: 'REJECT',
    description: 'Elastomer Chemical & Temperature Resistance (NBR vs Viton/FKM)',
    parameters: { strict_match: true },
    is_active: true,
  },
  {
    rule_id: 'R-HOSE-01',
    category_family: 'HOSES',
    attribute_name: 'pressure_rating',
    severity: 'CRITICAL',
    action: 'REJECT',
    description: 'Hydraulic Hose Working Pressure Rating (3000 PSI vs 5000 PSI burst hazard)',
    parameters: { strict_match: true },
    is_active: true,
  },
  {
    rule_id: 'R-MOTOR-01',
    category_family: 'MOTORS',
    attribute_name: 'pole_count',
    severity: 'CRITICAL',
    action: 'REJECT',
    description: 'Motor Pole Configuration / Synchronous Speed (4-Pole 1500 RPM vs 2-Pole 3000 RPM)',
    parameters: { strict_match: true },
    is_active: true,
  },
  {
    rule_id: 'R-PUMP-01',
    category_family: 'PUMPS',
    attribute_name: 'capacity_flow',
    severity: 'HIGH',
    action: 'EXPERT_REVIEW',
    description: 'Pump Volumetric Flow Rate Compatibility (50 m3/hr vs 60 m3/hr)',
    parameters: { tolerance_percent: 0 },
    is_active: true,
  },
  {
    rule_id: 'R-BEAR-01',
    category_family: 'BEARINGS',
    attribute_name: 'seal_type',
    severity: 'HIGH',
    action: 'EXPERT_REVIEW',
    description: 'Bearing Ingress Protection (2RS Rubber Contact Seal vs ZZ Steel Shield)',
    parameters: { strict_match: true },
    is_active: true,
  },
  {
    rule_id: 'R-WELD-01',
    category_family: 'WELDING',
    attribute_name: 'grade',
    severity: 'CRITICAL',
    action: 'REJECT',
    description: 'Welding Flux / Hydrogen Embrittlement Class (E7018 Low-Hydrogen vs E6013 Rutile)',
    parameters: { strict_match: true },
    is_active: true,
  }
];

export function evaluateTechnicalRules(
  source: NormalizedMaterial,
  candidate: NormalizedMaterial,
  activeRules: TechnicalRule[] = INITIAL_TECHNICAL_RULES
): { violations: RuleViolation[]; compatibilityStatus: 'PASS' | 'CONDITIONAL' | 'FAIL' } {
  const violations: RuleViolation[] = [];

  const sFp = source.fingerprint;
  const cFp = candidate.fingerprint;

  for (const rule of activeRules) {
    if (!rule.is_active) continue;

    // Apply rule only if applicable to category or ALL
    if (rule.category_family !== 'ALL' && rule.category_family !== sFp.category_family && rule.category_family !== cFp.category_family) {
      continue;
    }

    // 1. Grade Metallurgy Rule (R-FAST-01, R-WELD-01, etc.)
    if (rule.attribute_name === 'grade') {
      const sGrade = (sFp.grade || '').toUpperCase().replace(/\s/g, '');
      const cGrade = (cFp.grade || '').toUpperCase().replace(/\s/g, '');

      if (sGrade && cGrade && sGrade !== cGrade) {
        // Critical SS304 vs SS316
        if ((sGrade.includes('304') && cGrade.includes('316')) || (sGrade.includes('316') && cGrade.includes('304'))) {
          violations.push({
            rule_id: rule.rule_id,
            attribute: 'grade',
            source_value: sFp.grade,
            candidate_value: cFp.grade,
            severity: 'CRITICAL',
            action: 'REJECT',
            description: rule.description,
            technical_explanation: 'Metallurgy mismatch: SS316 contains 2-3% Molybdenum for pitting resistance in acidic/marine environments, absent in SS304. Direct substitution risks severe chemical degradation.'
          });
        } else if ((sGrade.includes('7018') && cGrade.includes('6013')) || (sGrade.includes('6013') && cGrade.includes('7018'))) {
          violations.push({
            rule_id: rule.rule_id,
            attribute: 'grade',
            source_value: sFp.grade,
            candidate_value: cFp.grade,
            severity: 'CRITICAL',
            action: 'REJECT',
            description: rule.description,
            technical_explanation: 'Electrode mismatch: E7018 is an iron powder low-hydrogen electrode for high tensile structural steel, whereas E6013 is high-titania rutile for general thin-sheet steel.'
          });
        } else if ((sGrade.includes('E250') && cGrade.includes('E350')) || (sGrade.includes('E350') && cGrade.includes('E250'))) {
          violations.push({
            rule_id: rule.rule_id,
            attribute: 'grade',
            source_value: sFp.grade,
            candidate_value: cFp.grade,
            severity: 'HIGH',
            action: 'EXPERT_REVIEW',
            description: rule.description,
            technical_explanation: 'Yield strength mismatch: E350 offers minimum yield strength of 350 MPa compared to 250 MPa for E250. Down-grading in load-bearing structures could compromise structural integrity.'
          });
        }
      }
    }

    // 2. Schedule Rule (R-PIPE-01)
    if (rule.attribute_name === 'schedule') {
      const sSch = sFp.technical_parameters.schedule;
      const cSch = cFp.technical_parameters.schedule;
      if (sSch && cSch && sSch !== cSch) {
        violations.push({
          rule_id: rule.rule_id,
          attribute: 'schedule',
          source_value: sSch,
          candidate_value: cSch,
          severity: 'CRITICAL',
          action: 'REJECT',
          description: rule.description,
          technical_explanation: `Pipe schedule mismatch (${sSch} vs ${cSch}). Schedule 80 has a substantially greater wall thickness and burst pressure than Schedule 40.`
        });
      }
    }

    // 3. Diameter mm (R-FAST-02)
    if (rule.attribute_name === 'diameter_mm') {
      const sDia = sFp.dimensions.diameter_mm;
      const cDia = cFp.dimensions.diameter_mm;
      if (sDia !== undefined && cDia !== undefined && Math.abs(sDia - cDia) > 0.01) {
        violations.push({
          rule_id: rule.rule_id,
          attribute: 'diameter_mm',
          source_value: `${sDia}mm`,
          candidate_value: `${cDia}mm`,
          severity: 'CRITICAL',
          action: 'REJECT',
          description: rule.description,
          technical_explanation: `Nominal thread diameter mismatch: M${sDia} cannot engage with M${cDia} threaded bores or mating nuts.`
        });
      }
    }

    // 4. Nominal Bore (R-PIPE-02)
    if (rule.attribute_name === 'nominal_bore_nb') {
      const sNb = sFp.dimensions.nominal_bore_nb;
      const cNb = cFp.dimensions.nominal_bore_nb;
      if (sNb !== undefined && cNb !== undefined && sNb !== cNb) {
        violations.push({
          rule_id: rule.rule_id,
          attribute: 'nominal_bore_nb',
          source_value: `${sNb} NB`,
          candidate_value: `${cNb} NB`,
          severity: 'CRITICAL',
          action: 'REJECT',
          description: rule.description,
          technical_explanation: `Nominal bore mismatch: ${sNb} NB does not align with ${cNb} NB piping joints without an intermediate reducer.`
        });
      }
    }

    // 5. Breaking Capacity kA (R-ELEC-02)
    if (rule.attribute_name === 'breaking_capacity_ka') {
      const sKa = sFp.technical_parameters.breaking_capacity_ka;
      const cKa = cFp.technical_parameters.breaking_capacity_ka;
      if (sKa !== undefined && cKa !== undefined && sKa !== cKa) {
        violations.push({
          rule_id: rule.rule_id,
          attribute: 'breaking_capacity_ka',
          source_value: `${sKa} kA`,
          candidate_value: `${cKa} kA`,
          severity: 'CRITICAL',
          action: 'REJECT',
          description: rule.description,
          technical_explanation: `Breaking capacity mismatch (${sKa} kA vs ${cKa} kA). Installing a lower kA breaker in a substation with higher prospective fault current creates an explosive arc flash danger.`
        });
      }
    }

    // 6. Base Material (Copper vs Aluminium or NBR vs Viton)
    if (rule.attribute_name === 'base_material') {
      const sMat = (sFp.base_material || '').toLowerCase();
      const cMat = (cFp.base_material || '').toLowerCase();
      if (sMat && cMat && sMat !== cMat) {
        if ((sMat.includes('copper') && cMat.includes('aluminium')) || (sMat.includes('aluminium') && cMat.includes('copper'))) {
          violations.push({
            rule_id: rule.rule_id,
            attribute: 'base_material',
            source_value: sFp.base_material,
            candidate_value: cFp.base_material,
            severity: 'CRITICAL',
            action: 'REJECT',
            description: rule.description,
            technical_explanation: 'Conductor metallurgy conflict: Copper has 60% higher conductivity than Aluminium. Substituting Aluminium without upsizing conductor cross-section causes severe thermal overload.'
          });
        } else if ((sMat.includes('nitrile') && cMat.includes('viton')) || (sMat.includes('viton') && cMat.includes('nitrile'))) {
          violations.push({
            rule_id: rule.rule_id,
            attribute: 'base_material',
            source_value: sFp.base_material,
            candidate_value: cFp.base_material,
            severity: 'CRITICAL',
            action: 'REJECT',
            description: rule.description,
            technical_explanation: 'Elastomer chemical incompatibility: NBR (Nitrile) degrades rapidly in temperatures above 100°C and aggressive chemicals, whereas FKM (Viton) handles up to 200°C.'
          });
        }
      }
    }

    // 7. Motor Pole Count / Speed (R-MOTOR-01)
    if (rule.attribute_name === 'pole_count' && (sFp.category_family === 'MOTORS' || cFp.category_family === 'MOTORS')) {
      const sPole = sFp.technical_parameters.pole_count;
      const cPole = cFp.technical_parameters.pole_count;
      if (sPole !== undefined && cPole !== undefined && sPole !== cPole) {
        violations.push({
          rule_id: rule.rule_id,
          attribute: 'pole_count',
          source_value: `${sPole}P`,
          candidate_value: `${cPole}P`,
          severity: 'CRITICAL',
          action: 'REJECT',
          description: rule.description,
          technical_explanation: `Motor pole mismatch (${sPole}-Pole vs ${cPole}-Pole). Operates at incompatible synchronous speeds (1500 RPM vs 3000 RPM at 50 Hz), causing catastrophic pump/fan impeller overspeed or torque deficit.`
        });
      }
    }

    // 8. Voltage rating (R-ELEC-01)
    if (rule.attribute_name === 'voltage_v') {
      const sV = sFp.technical_parameters.voltage_v;
      const cV = cFp.technical_parameters.voltage_v;
      if (sV !== undefined && cV !== undefined && Math.abs(sV - cV) > 500) {
        violations.push({
          rule_id: rule.rule_id,
          attribute: 'voltage_v',
          source_value: `${sV} V`,
          candidate_value: `${cV} V`,
          severity: 'CRITICAL',
          action: 'REJECT',
          description: rule.description,
          technical_explanation: `Insulation voltage rating disparity (${sV} V vs ${cV} V). Connecting a low-voltage cable to medium-voltage lines guarantees dielectric breakdown.`
        });
      }
    }

    // 9. Pressure rating (R-VALVE-01, R-HOSE-01)
    if (rule.attribute_name === 'pressure_rating') {
      const sPr = sFp.technical_parameters.pressure_rating;
      const cPr = cFp.technical_parameters.pressure_rating;
      if (sPr && cPr && sPr !== cPr) {
        violations.push({
          rule_id: rule.rule_id,
          attribute: 'pressure_rating',
          source_value: sPr,
          candidate_value: cPr,
          severity: 'CRITICAL',
          action: 'REJECT',
          description: rule.description,
          technical_explanation: `Pressure rating incompatibility (${sPr} vs ${cPr}). Equipment rated for lower pressure will fail under higher operating pressures.`
        });
      }
    }

    // 10. Bearing Seal vs Shield (R-BEAR-01)
    if (rule.attribute_name === 'seal_type') {
      const sSeal = sFp.technical_parameters.seal_type;
      const cSeal = cFp.technical_parameters.seal_type;
      if (sSeal && cSeal && sSeal !== cSeal) {
        violations.push({
          rule_id: rule.rule_id,
          attribute: 'seal_type',
          source_value: sSeal,
          candidate_value: cSeal,
          severity: 'HIGH',
          action: 'EXPERT_REVIEW',
          description: rule.description,
          technical_explanation: 'Bearing closure mismatch (2RS rubber contact seal vs ZZ steel non-contact shield). 2RS prevents water ingress in wet environments; ZZ cannot exclude liquids.'
        });
      }
    }
  }

  // Determine overall status
  const hasCritical = violations.some(v => v.severity === 'CRITICAL');
  const hasHigh = violations.some(v => v.severity === 'HIGH');

  let compatibilityStatus: 'PASS' | 'CONDITIONAL' | 'FAIL' = 'PASS';
  if (hasCritical) compatibilityStatus = 'FAIL';
  else if (hasHigh) compatibilityStatus = 'CONDITIONAL';

  return { violations, compatibilityStatus };
}
