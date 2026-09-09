import { NormalizationTraceItem, RawMaterialRecord } from '../types';

export const ABBREVIATIONS_MAP: Record<string, string> = {
  'SS': 'Stainless Steel',
  'MS': 'Mild Steel',
  'M.S.': 'Mild Steel',
  'CS': 'Carbon Steel',
  'CU': 'Copper',
  'AL': 'Aluminium',
  'PLT': 'Plate',
  'HD': 'Hexagonal Head',
  'MECH': 'Mechanical',
  'HYD': 'Hydraulic',
  'CENT': 'Centrifugal',
  'THK': 'Thickness',
  'CUM/HR': 'm3/hr',
  'CUM': 'm3',
  'SQ MM': 'sq mm',
  'MM2': 'sq mm',
  'SQMM': 'sq mm',
  'LTR': 'L',
  '150#': 'Class 150',
  '300#': 'Class 300',
  '150 LB': 'Class 150',
  'DEG C': '°C',
  'DEG': '°',
};

export const UOM_MAP: Record<string, { canonical: string; converted: boolean }> = {
  'EA': { canonical: 'EA', converted: false },
  'NOS': { canonical: 'EA', converted: true },
  'PCS': { canonical: 'EA', converted: true },
  'EACH': { canonical: 'EA', converted: true },
  'KG': { canonical: 'KG', converted: false },
  'KGS': { canonical: 'KG', converted: true },
  'M': { canonical: 'M', converted: false },
  'MTR': { canonical: 'M', converted: true },
  'METRE': { canonical: 'M', converted: true },
  'L': { canonical: 'L', converted: false },
  'LTR': { canonical: 'L', converted: true },
  'PAIR': { canonical: 'PAIR', converted: false },
};

export const STANDARD_NORMALIZATION_MAP: Record<string, string> = {
  'IS1367': 'IS 1367',
  'IS 1367': 'IS 1367',
  'IS2062': 'IS 2062',
  'IS 2062': 'IS 2062',
  'ASTM A106': 'ASTM A106',
  'ASTMA106': 'ASTM A106',
  'ASTM A312': 'ASTM A312',
  'ASTMA312': 'ASTM A312',
  'API600': 'API 600',
  'API 600': 'API 600',
  'API623': 'API 623',
  'API 623': 'API 623',
  'API608': 'API 608',
  'API 608': 'API 608',
  'IS2016': 'IS 2016',
  'IS 2016': 'IS 2016',
  'IS3063': 'IS 3063',
  'IS 3063': 'IS 3063',
  'AWS A5.1': 'AWS A5.1',
  'ASME B16.21': 'ASME B16.21',
  'ASME B16.20': 'ASME B16.20',
  'ASME B16.9': 'ASME B16.9',
  'IS7098': 'IS 7098',
  'IS 7098': 'IS 7098',
  'IS8309': 'IS 8309',
  'IS 8309': 'IS 8309',
  'IEC60947-2': 'IEC 60947-2',
  'IEC 60947-2': 'IEC 60947-2',
  'IEC60947-4-1': 'IEC 60947-4-1',
  'IEC 60947-4-1': 'IEC 60947-4-1',
  'ISO15': 'ISO 15',
  'ISO 15': 'ISO 15',
  'API682': 'API 682',
  'API 682': 'API 682',
  'ISO3601': 'ISO 3601',
  'ISO 3601': 'ISO 3601',
  'SAE100R2': 'SAE 100R2',
  'SAE 100R2': 'SAE 100R2',
  'ISO16890': 'ISO 16890',
  'ISO 16890': 'ISO 16890',
  'ISO16889': 'ISO 16889',
  'ISO 16889': 'ISO 16889',
  'EN837-1': 'EN 837-1',
  'EN 837-1': 'EN 837-1',
  'EN13190': 'EN 13190',
  'EN 13190': 'EN 13190',
  'IEC60751': 'IEC 60751',
  'IEC 60751': 'IEC 60751',
  'IEC60584': 'IEC 60584',
  'IEC 60584': 'IEC 60584',
  'IEC60034': 'IEC 60034',
  'IEC 60034': 'IEC 60034',
  'API610': 'API 610',
  'API 610': 'API 610',
  'IS2925': 'IS 2925',
  'IS 2925': 'IS 2925',
  'IS15298': 'IS 15298',
  'IS 15298': 'IS 15298',
  'IS15683': 'IS 15683',
  'IS 15683': 'IS 15683',
  'ISO3448': 'ISO 3448',
  'ISO 3448': 'ISO 3448',
  'IEC60296': 'IEC 60296',
  'IEC 60296': 'IEC 60296',
  'NLGI': 'NLGI'
};

export const CATEGORY_FAMILY_MAP: Record<string, string> = {
  'Fasteners': 'FASTENERS',
  'Fastener': 'FASTENERS',
  'Bolts': 'FASTENERS',
  'Washers': 'FASTENERS',
  'Plates': 'STRUCTURAL_STEEL',
  'Steel Plate': 'STRUCTURAL_STEEL',
  'Steel Plates': 'STRUCTURAL_STEEL',
  'Pipes': 'PIPING',
  'Piping': 'PIPING',
  'Valves': 'VALVES',
  'Welding Consumables': 'WELDING',
  'Welding Rods': 'WELDING',
  'Gaskets': 'GASKETS',
  'Pipe Fittings': 'PIPE_FITTINGS',
  'Fittings': 'PIPE_FITTINGS',
  'Cables': 'ELECTRICAL_CABLES',
  'Electrical Cable': 'ELECTRICAL_CABLES',
  'Power Cables': 'ELECTRICAL_CABLES',
  'Cable Lugs': 'ELECTRICAL_ACCESSORIES',
  'Electrical Accessories': 'ELECTRICAL_ACCESSORIES',
  'Switchgear': 'SWITCHGEAR',
  'Circuit Breakers': 'SWITCHGEAR',
  'Contactors': 'SWITCHGEAR',
  'Bearings': 'BEARINGS',
  'Mechanical Seals': 'SEALS',
  'Seals': 'SEALS',
  'O-Rings': 'SEALS',
  'Hoses': 'HOSES',
  'Hydraulic Hoses': 'HOSES',
  'Filters': 'FILTERS',
  'Instrumentation': 'INSTRUMENTATION',
  'Gauges': 'INSTRUMENTATION',
  'Temperature Gauges': 'INSTRUMENTATION',
  'Sensors': 'INSTRUMENTATION',
  'Temperature Sensors': 'INSTRUMENTATION',
  'Motors': 'MOTORS',
  'Electric Motors': 'MOTORS',
  'Pumps': 'PUMPS',
  'Centrifugal Pumps': 'PUMPS',
  'PPE': 'SAFETY_PPE',
  'Safety PPE': 'SAFETY_PPE',
  'Safety Shoes': 'SAFETY_PPE',
  'Fire Protection': 'SAFETY_FIRE',
  'Fire Extinguishers': 'SAFETY_FIRE',
  'Lubricants': 'LUBRICANTS',
  'Grease': 'LUBRICANTS',
  'Transformer Oil': 'TRANSFORMER_OIL',
  'Insulating Oil': 'TRANSFORMER_OIL'
};

export function normalizeStandard(rawStandard: string | null | undefined): string {
  if (!rawStandard) return '';
  const trimmed = rawStandard.trim();
  const cleaned = trimmed.replace(/\s+/g, ' ');
  return STANDARD_NORMALIZATION_MAP[cleaned] || STANDARD_NORMALIZATION_MAP[cleaned.replace(/\s/g, '')] || cleaned;
}

export function normalizeCategory(rawCategory: string | null | undefined): string {
  if (!rawCategory) return 'GENERAL';
  const trimmed = rawCategory.trim();
  return CATEGORY_FAMILY_MAP[trimmed] || 'GENERAL';
}

export function normalizeUOM(rawUOM: string | null | undefined): { canonical: string; converted: boolean } {
  if (!rawUOM) return { canonical: 'EA', converted: false };
  const upper = rawUOM.trim().toUpperCase();
  return UOM_MAP[upper] || { canonical: upper, converted: false };
}

export function normalizeDescription(rawDesc: string): { canonical: string; trace: NormalizationTraceItem[]; quality_issues: string[] } {
  const trace: NormalizationTraceItem[] = [];
  const quality_issues: string[] = [];

  let text = rawDesc.trim();
  const original = text;

  // Check initial quality issues
  if (text !== text.trim()) {
    quality_issues.push('LEADING_TRAILING_WHITESPACE');
  }
  if (/[a-z]/.test(text) && /[A-Z]/.test(text)) {
    // Mixed case is normal, but all lowercase or all uppercase might indicate unstructured input
  }

  // Symbol cleanup: replacement of multiplication and degree symbols
  if (text.includes('×') || text.includes('°')) {
    const before = text;
    text = text.replace(/×/g, ' x ').replace(/°/g, ' DEG ');
    trace.push({
      field: 'raw_description',
      before,
      after: text,
      rule_id: 'SYM_NORM_01',
      method: 'deterministic',
      confidence: 1.0,
    });
  }

  // Standardize "2M X 1M" to "2000 x 1000 mm"
  if (/\b2M\s*X\s*1M\b/i.test(text)) {
    const before = text;
    text = text.replace(/\b2M\s*X\s*1M\b/gi, '2000 x 1000 mm');
    trace.push({
      field: 'raw_description',
      before,
      after: text,
      rule_id: 'DIM_M_TO_MM',
      method: 'regex',
      confidence: 1.0,
    });
  }

  // Spacing between number and units: "10 MM" -> "10mm" or "50 NB"
  const spacingRegex = /(\d+)\s*(MM|NB|KG|KV|KA|KW|M|L|PSI|BAR|A|P|V)\b/gi;
  if (spacingRegex.test(text)) {
    const before = text;
    text = text.replace(/(\d+)\s+(MM)\b/gi, '$1mm')
               .replace(/(\d+)\s+(NB)\b/gi, '$1 NB')
               .replace(/(\d+)\s+(KG)\b/gi, '$1 kg')
               .replace(/(\d+)\s+(KV)\b/gi, '$1 kV')
               .replace(/(\d+)\s+(KA)\b/gi, '$1 kA')
               .replace(/(\d+)\s+(KW)\b/gi, '$1 kW')
               .replace(/(\d+)\s+(PSI)\b/gi, '$1 PSI');
    if (before !== text) {
      trace.push({
        field: 'raw_description',
        before,
        after: text,
        rule_id: 'UNIT_SPACING_NORM',
        method: 'regex',
        confidence: 0.98,
      });
    }
  }

  // Grade formatting: "SS 304" -> "SS304", "SS 316" -> "SS316"
  if (/\bSS\s+(304|316)\b/i.test(text)) {
    const before = text;
    text = text.replace(/\bSS\s+(304|316)\b/gi, 'SS$1');
    trace.push({
      field: 'raw_description',
      before,
      after: text,
      rule_id: 'GRADE_CONCAT_NORM',
      method: 'regex',
      confidence: 1.0,
    });
  }

  // Expand standard acronyms
  for (const [abbr, expanded] of Object.entries(ABBREVIATIONS_MAP)) {
    const pattern = new RegExp(`\\b${abbr.replace('.', '\\.')}\\b`, 'i');
    if (pattern.test(text)) {
      const before = text;
      // Don't replace if it's already part of the word
      text = text.replace(pattern, expanded);
      trace.push({
        field: 'raw_description',
        before,
        after: text,
        rule_id: `ABBR_${abbr}`,
        method: 'dictionary',
        confidence: 0.99,
      });
      quality_issues.push(`ABBREVIATION_${abbr}`);
    }
  }

  // Canonicalize whitespaces
  text = text.replace(/\s+/g, ' ').trim();

  return {
    canonical: text,
    trace,
    quality_issues: Array.from(new Set(quality_issues)),
  };
}
