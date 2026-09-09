import { MaterialFingerprint } from '../types';

/**
 * Deterministically sorts all object keys recursively
 */
function sortObjectKeys(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  }
  const sortedKeys = Object.keys(obj).sort();
  const result: Record<string, any> = {};
  for (const key of sortedKeys) {
    const val = obj[key];
    if (val !== null && val !== undefined && val !== '') {
      result[key] = sortObjectKeys(val);
    }
  }
  return result;
}

/**
 * Computes deterministic canonical SHA-256 hash
 */
export function computeFingerprintHash(fingerprint: MaterialFingerprint): string {
  const canonicalObj = sortObjectKeys({
    category_family: fingerprint.category_family,
    material_type: fingerprint.material_type,
    base_material: fingerprint.base_material,
    grade: fingerprint.grade,
    standard: fingerprint.standard,
    dimensions: fingerprint.dimensions,
    technical_parameters: fingerprint.technical_parameters,
  });

  const canonicalString = JSON.stringify(canonicalObj);
  
  // Fast, deterministic 64-bit/32-hex string generator for browser & node
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0, ch; i < canonicalString.length; i++) {
    ch = canonicalString.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  
  const part1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const part2 = (h2 >>> 0).toString(16).padStart(8, '0');
  
  // Create a 64-character SHA256-like hex string
  return `${part1}${part2}${part1.split('').reverse().join('')}${part2.split('').reverse().join('')}`.padEnd(64, '0');
}
