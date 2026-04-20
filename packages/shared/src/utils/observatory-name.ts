// Observatory name normalization and format validation.
// Pure functions — no DB, no network, no side effects.

export function normalizeObservatoryName(input: string): string {
  return input.trim().toLowerCase();
}

export type ObservatoryNameFormatReason = 'invalid_format' | 'invalid_length';

export function validateObservatoryNameFormat(
  name: string,
): { valid: true } | { valid: false; reason: ObservatoryNameFormatReason } {
  if (name.length < 3 || name.length > 30) {
    return { valid: false, reason: 'invalid_length' };
  }
  // Lowercase alphanumeric segments separated by single hyphens.
  // Rejects leading/trailing hyphens and consecutive hyphens.
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) {
    return { valid: false, reason: 'invalid_format' };
  }
  return { valid: true };
}
