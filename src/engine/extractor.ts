import { MaterialFingerprint, RawMaterialRecord } from '../types';
import { normalizeCategory, normalizeStandard, normalizeUOM } from './normalization';

export function extractAttributesAndFingerprint(
  raw: RawMaterialRecord,
  canonicalDesc: string
): { attributes: Record<string, any>; fingerprint: MaterialFingerprint } {
  const text = `${canonicalDesc} ${raw.raw_description} ${raw.specification || ''}`.toUpperCase();
  const categoryFamily = normalizeCategory(raw.category);
  const normalizedStandard = normalizeStandard(raw.standard);
  const normalizedUOM = normalizeUOM(raw.uom);

  const attributes: Record<string, any> = {
    source_cpse: raw.cpse,
    source_code: raw.material_code,
    uom: normalizedUOM.canonical,
    standard: normalizedStandard,
  };

  // Base Material canonicalization
  let baseMaterial = raw.material?.trim() || '';
  if (/STAINLESS\s*STEEL|\bSS\b|\bSS304\b|\bSS316\b/i.test(text)) {
    baseMaterial = 'Stainless Steel';
  } else if (/CARBON\s*STEEL|\bCS\b|\bWCB\b|\bWPB\b|\bA106\b/i.test(text)) {
    baseMaterial = 'Carbon Steel';
  } else if (/MILD\s*STEEL|\bMS\b|\bE250\b|\bE350\b|\bIS2062\b/i.test(text)) {
    baseMaterial = 'Mild Steel';
  } else if (/COPPER|\bCU\b/i.test(text)) {
    baseMaterial = 'Copper';
  } else if (/ALUMINIUM|\bAL\b/i.test(text)) {
    baseMaterial = 'Aluminium';
  } else if (/PTFE/i.test(text)) {
    baseMaterial = 'PTFE';
  } else if (/NITRILE|\bNBR\b/i.test(text)) {
    baseMaterial = 'Nitrile (NBR)';
  } else if (/VITON|\bFKM\b/i.test(text)) {
    baseMaterial = 'Viton (FKM)';
  } else if (/BEARING\s*STEEL/i.test(text)) {
    baseMaterial = 'Bearing Steel';
  }
  attributes['base_material'] = baseMaterial;

  // Grade extraction
  let grade = raw.grade?.trim() || '';
  if (!grade || grade === '304' || grade === 'SS') {
    if (/\bSS\s*304\b|\b304\b/i.test(text) && !/\b316\b/i.test(text)) grade = 'SS304';
    else if (/\bSS\s*316\b|\b316\b/i.test(text)) grade = 'SS316';
  }
  if (!grade) {
    if (/\bE250\b/i.test(text)) grade = 'E250';
    else if (/\bE350\b/i.test(text)) grade = 'E350';
    else if (/\bE7018\b/i.test(text)) grade = 'E7018';
    else if (/\bE6013\b/i.test(text)) grade = 'E6013';
    else if (/\bGRADE\s*B\b|\bGR\.?\s*B\b/i.test(text)) grade = 'Grade B';
    else if (/\bTP304\b/i.test(text)) grade = 'TP304';
    else if (/\bWP316\b/i.test(text)) grade = 'WP316';
    else if (/\bWCB\b/i.test(text)) grade = 'A216 WCB';
    else if (/\bWPB\b/i.test(text)) grade = 'A234 WPB';
    else if (/\bIE3\b/i.test(text)) grade = 'IE3';
    else if (/\bC3\b/i.test(text)) grade = 'C3';
    else if (/\bC4\b/i.test(text)) grade = 'C4';
    else if (/\bPT100\b/i.test(text)) grade = 'PT100';
    else if (/TYPE\s*K/i.test(text)) grade = 'Type K';
    else if (/ISO\s*VG\s*68|VG\s*68/i.test(text)) grade = 'ISO VG 68';
    else if (/ISO\s*VG\s*46|VG\s*46/i.test(text)) grade = 'ISO VG 46';
    else if (/EP2/i.test(text)) grade = 'EP2';
    else if (/EP3/i.test(text)) grade = 'EP3';
  }
  attributes['grade'] = grade;

  // Material Type detection
  let materialType = raw.category;
  if (/HEX.*BOLT/i.test(text)) materialType = 'Hex Bolt';
  else if (/HEX.*NUT/i.test(text)) materialType = 'Hex Nut';
  else if (/FLAT\s*WASHER|PLAIN\s*WASHER/i.test(text)) materialType = 'Plain Washer';
  else if (/SPRING\s*WASHER/i.test(text)) materialType = 'Spring Washer';
  else if (/PLATE|PLT/i.test(text)) materialType = 'Steel Plate';
  else if (/PIPE/i.test(text)) materialType = 'Seamless Pipe';
  else if (/GATE\s*VALVE/i.test(text)) materialType = 'Gate Valve';
  else if (/GLOBE\s*VALVE/i.test(text)) materialType = 'Globe Valve';
  else if (/BALL\s*VALVE/i.test(text)) materialType = 'Ball Valve';
  else if (/WELDING.*(?:ELECTRODE|ROD)/i.test(text)) materialType = 'Welding Electrode';
  else if (/SPIRAL\s*WOUND.*GASKET/i.test(text)) materialType = 'Spiral Wound Gasket';
  else if (/GASKET/i.test(text)) materialType = 'Flange Gasket';
  else if (/ELBOW/i.test(text)) materialType = '90° Elbow';
  else if (/REDUCER/i.test(text)) materialType = 'Concentric Reducer';
  else if (/CABLE/i.test(text)) materialType = 'Power Cable';
  else if (/LUG/i.test(text)) materialType = 'Cable Lug';
  else if (/MCCB|CIRCUIT\s*BREAKER/i.test(text)) materialType = 'MCCB';
  else if (/CONTACTOR/i.test(text)) materialType = 'AC Contactor';
  else if (/BEARING/i.test(text)) materialType = 'Deep Groove Ball Bearing';
  else if (/MECH.*SEAL/i.test(text)) materialType = 'Mechanical Seal';
  else if (/O-?RING/i.test(text)) materialType = 'O-Ring';
  else if (/HOSE/i.test(text)) materialType = 'Hydraulic Hose';
  else if (/FILTER/i.test(text)) materialType = 'Filter Element';
  else if (/PRESSURE\s*GAUGE/i.test(text)) materialType = 'Pressure Gauge';
  else if (/TEMP.*GAUGE/i.test(text)) materialType = 'Temperature Gauge';
  else if (/RTD|PT100/i.test(text)) materialType = 'RTD Temperature Sensor';
  else if (/THERMOCOUPLE/i.test(text)) materialType = 'Thermocouple';
  else if (/MOTOR/i.test(text)) materialType = 'Induction Motor';
  else if (/PUMP/i.test(text)) materialType = 'Centrifugal Pump';
  else if (/HELMET/i.test(text)) materialType = 'Safety Helmet';
  else if (/SHOE/i.test(text)) materialType = 'Safety Shoe';
  else if (/FIRE\s*EXTINGUISHER/i.test(text)) materialType = 'Fire Extinguisher';
  else if (/LUBE\s*OIL|LUBRICATING\s*OIL/i.test(text)) materialType = 'Lubricating Oil';
  else if (/GREASE/i.test(text)) materialType = 'Industrial Grease';
  else if (/TRANSFORMER\s*OIL/i.test(text)) materialType = 'Transformer Insulating Oil';
  attributes['material_type'] = materialType;

  // Dimensions
  const dimensions: MaterialFingerprint['dimensions'] = {};

  // Diameter
  const diaMatch = text.match(/\bM\s*(\d+)\b/i) || text.match(/(\d+)\s*MM\b/i);
  if (diaMatch && (categoryFamily === 'FASTENERS' || categoryFamily === 'ELECTRICAL_ACCESSORIES')) {
    dimensions.diameter_mm = parseFloat(diaMatch[1]);
    attributes['diameter_mm'] = dimensions.diameter_mm;
  }

  // Length
  const lenMatch = text.match(/\bX\s*(\d+)\s*(?:MM)?\b/i) || text.match(/\b50\s*MM\b/i) || text.match(/\b50\b(?!\s*NB)/);
  if (lenMatch && categoryFamily === 'FASTENERS' && materialType.includes('Bolt')) {
    dimensions.length_mm = parseFloat(lenMatch[1] || '50');
    attributes['length_mm'] = dimensions.length_mm;
  }

  // Plate dimensions (e.g. 10mm 2000 x 1000)
  const plateMatch = text.match(/(\d+)\s*MM.*?(?:(\d+)\s*(?:MM)?\s*X\s*(\d+)\s*(?:MM)?)/i);
  if (plateMatch && categoryFamily === 'STRUCTURAL_STEEL') {
    dimensions.thickness_mm = parseFloat(plateMatch[1]);
    dimensions.length_mm = parseFloat(plateMatch[2]);
    dimensions.width_mm = parseFloat(plateMatch[3]);
    attributes['thickness_mm'] = dimensions.thickness_mm;
    attributes['dimensions_mm'] = `${dimensions.length_mm} x ${dimensions.width_mm} mm`;
  }

  // Nominal Bore (NB)
  const nbMatch = text.match(/(\d+)\s*NB\b/i) || text.match(/DN\s*(\d+)\b/i);
  if (nbMatch) {
    dimensions.nominal_bore_nb = parseInt(nbMatch[1], 10);
    attributes['nominal_bore_nb'] = dimensions.nominal_bore_nb;
  } else {
    // 2 inch = 50 NB, 1 inch = 25 NB
    if (/\b2\s*(?:INCH|IN)\b/i.test(text)) {
      dimensions.nominal_bore_nb = 50;
      attributes['nominal_bore_nb'] = 50;
    } else if (/\b1\s*(?:INCH|IN)\b/i.test(text)) {
      dimensions.nominal_bore_nb = 25;
      attributes['nominal_bore_nb'] = 25;
    } else if (/\b1\/2\s*(?:INCH|IN)\b/i.test(text)) {
      dimensions.nominal_bore_nb = 15;
      attributes['nominal_bore_nb'] = 15;
    }
  }

  // Technical Parameters
  const technicalParameters: MaterialFingerprint['technical_parameters'] = {};

  // Schedule
  if (/SCH\s*80|SCHEDULE\s*80/i.test(text)) {
    technicalParameters.schedule = 'Sch 80';
    attributes['schedule'] = 'Sch 80';
  } else if (/SCH\s*40|SCHEDULE\s*40/i.test(text)) {
    technicalParameters.schedule = 'Sch 40';
    attributes['schedule'] = 'Sch 40';
  }

  // Pressure rating
  if (/CLASS\s*300|300#/i.test(text)) {
    technicalParameters.pressure_rating = 'Class 300';
    attributes['pressure_rating'] = 'Class 300';
  } else if (/CLASS\s*150|150#|150\s*LB/i.test(text)) {
    technicalParameters.pressure_rating = 'Class 150';
    attributes['pressure_rating'] = 'Class 150';
  } else if (/5000\s*PSI/i.test(text)) {
    technicalParameters.pressure_rating = '5000 PSI';
    attributes['pressure_rating'] = '5000 PSI';
  } else if (/3000\s*PSI/i.test(text)) {
    technicalParameters.pressure_rating = '3000 PSI';
    attributes['pressure_rating'] = '3000 PSI';
  }

  // Voltage
  if (/11\s*KV/i.test(text)) {
    technicalParameters.voltage_v = 11000;
    attributes['voltage_v'] = 11000;
  } else if (/1\.1\s*KV/i.test(text)) {
    technicalParameters.voltage_v = 1100;
    attributes['voltage_v'] = 1100;
  } else if (/1\s*KV/i.test(text)) {
    technicalParameters.voltage_v = 1000;
    attributes['voltage_v'] = 1000;
  } else if (/415\s*V/i.test(text)) {
    technicalParameters.voltage_v = 415;
    attributes['voltage_v'] = 415;
  } else if (/230\s*V/i.test(text)) {
    technicalParameters.voltage_v = 230;
    attributes['voltage_v'] = 230;
  }

  // Breaking capacity (kA)
  if (/36\s*KA/i.test(text)) {
    technicalParameters.breaking_capacity_ka = 36;
    attributes['breaking_capacity_ka'] = 36;
  } else if (/25\s*KA/i.test(text)) {
    technicalParameters.breaking_capacity_ka = 25;
    attributes['breaking_capacity_ka'] = 25;
  }

  // Motor power and poles
  if (/15\s*KW/i.test(text)) {
    technicalParameters.power_kw = 15;
    attributes['power_kw'] = 15;
  }
  if (/4\s*P(?:OLE)?\b/i.test(text)) {
    technicalParameters.pole_count = 4;
    attributes['pole_count'] = 4;
  } else if (/2\s*P(?:OLE)?\b/i.test(text)) {
    technicalParameters.pole_count = 2;
    attributes['pole_count'] = 2;
  } else if (/3\s*P(?:OLE)?\b/i.test(text)) {
    technicalParameters.pole_count = 3;
    attributes['pole_count'] = 3;
  }

  // Bearing Seal vs Shield
  if (/2RS/i.test(text)) {
    technicalParameters.seal_type = '2RS (Rubber Contact Seal)';
    attributes['seal_type'] = '2RS';
  } else if (/ZZ/i.test(text)) {
    technicalParameters.seal_type = 'ZZ (Steel Shield)';
    attributes['seal_type'] = 'ZZ';
  }

  // Pump Flow & Head
  if (/60\s*(?:M3\/HR|CUM\/HR)/i.test(text)) {
    technicalParameters.capacity_flow = '60 m3/hr';
    attributes['flow_capacity'] = '60 m3/hr';
  } else if (/50\s*(?:M3\/HR|CUM\/HR)/i.test(text)) {
    technicalParameters.capacity_flow = '50 m3/hr';
    attributes['flow_capacity'] = '50 m3/hr';
  }
  if (/40\s*M\s*HEAD|40M\s*HEAD|40\s*M\b/i.test(text) && categoryFamily === 'PUMPS') {
    technicalParameters.head_m = 40;
    attributes['head_m'] = 40;
  }

  const fingerprint: MaterialFingerprint = {
    category_family: categoryFamily,
    material_type: materialType,
    base_material: baseMaterial,
    grade: grade || null,
    standard: normalizedStandard || null,
    application: raw.application || null,
    dimensions,
    technical_parameters: technicalParameters,
  };

  return { attributes, fingerprint };
}
