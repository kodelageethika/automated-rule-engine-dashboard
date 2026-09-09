import { MaterialFingerprint, NormalizedMaterial } from '../types';

const CATEGORY_CODE_PREFIX: Record<string, string> = {
  'FASTENERS': 'FAST',
  'STRUCTURAL_STEEL': 'PLAT',
  'PIPING': 'PIPE',
  'VALVES': 'VALV',
  'WELDING': 'WELD',
  'GASKETS': 'GASK',
  'PIPE_FITTINGS': 'FITG',
  'ELECTRICAL_CABLES': 'CABL',
  'ELECTRICAL_ACCESSORIES': 'ELAC',
  'SWITCHGEAR': 'SWGR',
  'BEARINGS': 'BEAR',
  'SEALS': 'SEAL',
  'HOSES': 'HOSE',
  'FILTERS': 'FILT',
  'INSTRUMENTATION': 'INST',
  'MOTORS': 'MOTR',
  'PUMPS': 'PUMP',
  'SAFETY_PPE': 'SAFE',
  'SAFETY_FIRE': 'FIRE',
  'LUBRICANTS': 'LUBE',
  'TRANSFORMER_OIL': 'OIL',
  'GENERAL': 'GENR',
};

export function generateStandardizedDescription(fingerprint: MaterialFingerprint, originalDesc: string): string {
  const parts: string[] = [];

  // 1. Component Type
  parts.push(fingerprint.material_type.toUpperCase());

  // 2. Base Material & Grade
  if (fingerprint.grade && fingerprint.base_material) {
    if (fingerprint.grade.toLowerCase().includes(fingerprint.base_material.toLowerCase())) {
      parts.push(fingerprint.grade.toUpperCase());
    } else {
      parts.push(`${fingerprint.base_material.toUpperCase()} ${fingerprint.grade.toUpperCase()}`);
    }
  } else if (fingerprint.grade) {
    parts.push(fingerprint.grade.toUpperCase());
  } else if (fingerprint.base_material) {
    parts.push(fingerprint.base_material.toUpperCase());
  }

  // 3. Dimensions
  const dims = fingerprint.dimensions;
  if (dims.nominal_bore_nb) {
    parts.push(`${dims.nominal_bore_nb} NB`);
  }
  if (dims.diameter_mm && dims.length_mm) {
    parts.push(`M${dims.diameter_mm} X ${dims.length_mm} MM`);
  } else if (dims.diameter_mm) {
    parts.push(`M${dims.diameter_mm}`);
  }
  if (dims.thickness_mm) {
    parts.push(`${dims.thickness_mm} MM THK`);
  }
  if (dims.length_mm && dims.width_mm && !dims.diameter_mm) {
    parts.push(`${dims.length_mm} X ${dims.width_mm} MM`);
  }

  // 4. Technical parameters
  const params = fingerprint.technical_parameters;
  if (params.schedule) parts.push(params.schedule.toUpperCase());
  if (params.pressure_rating) parts.push(params.pressure_rating.toUpperCase());
  if (params.voltage_v) parts.push(params.voltage_v >= 1000 ? `${params.voltage_v / 1000} KV` : `${params.voltage_v} V`);
  if (params.breaking_capacity_ka) parts.push(`${params.breaking_capacity_ka} KA`);
  if (params.power_kw) parts.push(`${params.power_kw} KW`);
  if (params.pole_count) parts.push(`${params.pole_count}P`);
  if (params.seal_type) parts.push(params.seal_type.toUpperCase());
  if (params.capacity_flow) parts.push(params.capacity_flow.toUpperCase());
  if (params.head_m) parts.push(`${params.head_m} M HEAD`);

  // 5. Standard
  if (fingerprint.standard) {
    parts.push(fingerprint.standard.toUpperCase());
  }

  return parts.filter(Boolean).join(', ');
}

export function generateNationalMaterialCode(
  fingerprint: MaterialFingerprint,
  sequenceNumber: number = 1
): string {
  const catCode = CATEGORY_CODE_PREFIX[fingerprint.category_family] || 'GENR';

  let matSegment = 'STD';
  if (fingerprint.grade) {
    matSegment = fingerprint.grade.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase();
  } else if (fingerprint.base_material) {
    matSegment = fingerprint.base_material.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase();
  }

  let paramSegment = 'GEN';
  const dims = fingerprint.dimensions;
  const params = fingerprint.technical_parameters;

  if (dims.diameter_mm && dims.length_mm) {
    paramSegment = `M${dims.diameter_mm}X${dims.length_mm}`;
  } else if (dims.nominal_bore_nb && params.schedule) {
    paramSegment = `${dims.nominal_bore_nb}NB-${params.schedule.replace(/\s/g, '')}`;
  } else if (dims.nominal_bore_nb && params.pressure_rating) {
    paramSegment = `${dims.nominal_bore_nb}NB-${params.pressure_rating.replace(/[^a-zA-Z0-9]/g, '')}`;
  } else if (dims.thickness_mm) {
    paramSegment = `${dims.thickness_mm}MM`;
  } else if (params.breaking_capacity_ka) {
    paramSegment = `${params.breaking_capacity_ka}KA`;
  } else if (params.power_kw && params.pole_count) {
    paramSegment = `${params.power_kw}KW-${params.pole_count}P`;
  } else if (params.seal_type) {
    paramSegment = params.seal_type.split(' ')[0];
  } else if (dims.diameter_mm) {
    paramSegment = `M${dims.diameter_mm}`;
  }

  const seqStr = String(sequenceNumber).padStart(3, '0');
  return `NM-${catCode}-${matSegment}-${paramSegment}-${seqStr}`.toUpperCase();
}
