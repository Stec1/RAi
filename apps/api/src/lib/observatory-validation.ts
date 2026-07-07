// Shared observatory field validators (PATCH-PIVOT-06, DL-47).
//
// Extracted from the PATCH-PIVOT-04 create route so the create (POST) and
// the dashboard update (PATCH) paths validate base fields identically.
// Pure functions only — DB-dependent checks (name uniqueness, active
// domain existence) stay in the routes where the Prisma client lives.

export const OBSERVATORY_TYPES = ['individual', 'studio', 'product'] as const;
export type ObservatoryTypeInput = (typeof OBSERVATORY_TYPES)[number];

export const SOCIAL_KEYS = [
  'github',
  'x',
  'telegram',
  'linkedin',
  'email',
  'website',
] as const;

const AMBIENT_EFFECTS = ['glow', 'pulse', 'static', 'drift'];
const SURFACE_STYLES = ['smooth', 'grain', 'mesh', 'void'];
const NODE_STYLES = ['point', 'ring', 'pulse', 'cross'];
const HEX_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// Validates the VisualSignature shape (mirrors @rai/shared
// types/visual-signature.ts). Returns an error string or null.
export function validateVisualSignature(value: unknown): string | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return 'visualSignature must be an object';
  }
  const sig = value as Record<string, unknown>;
  for (const key of ['primaryColor', 'secondaryColor', 'accentColor']) {
    if (typeof sig[key] !== 'string' || !HEX_COLOR.test(sig[key] as string)) {
      return `visualSignature.${key} must be a hex color`;
    }
  }
  const angle = sig.gradientAngle;
  if (typeof angle !== 'number' || !Number.isFinite(angle) || angle < 0 || angle > 360) {
    return 'visualSignature.gradientAngle must be a number between 0 and 360';
  }
  const intensity = sig.effectIntensity;
  if (
    typeof intensity !== 'number' ||
    !Number.isFinite(intensity) ||
    intensity < 0 ||
    intensity > 1
  ) {
    return 'visualSignature.effectIntensity must be a number between 0 and 1';
  }
  if (typeof sig.ambientEffect !== 'string' || !AMBIENT_EFFECTS.includes(sig.ambientEffect)) {
    return 'visualSignature.ambientEffect is invalid';
  }
  if (typeof sig.surfaceStyle !== 'string' || !SURFACE_STYLES.includes(sig.surfaceStyle)) {
    return 'visualSignature.surfaceStyle is invalid';
  }
  if (typeof sig.nodeStyle !== 'string' || !NODE_STYLES.includes(sig.nodeStyle)) {
    return 'visualSignature.nodeStyle is invalid';
  }
  return null;
}

export function isPrismaUniqueViolation(err: unknown): { target: string } | null {
  if (typeof err !== 'object' || err === null) return null;
  const maybe = err as { code?: unknown; meta?: { target?: unknown } };
  if (maybe.code !== 'P2002') return null;
  const target = maybe.meta?.target;
  if (Array.isArray(target)) return { target: target.join(',') };
  if (typeof target === 'string') return { target };
  return { target: '' };
}

// Validates a socialLinks object: known keys only, url/email shape.
// Returns the normalized links (empty values dropped) or an error string.
export function validateSocialLinks(
  value: unknown,
): { links: Record<string, string> } | { error: string } {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return { error: 'socialLinks must be an object' };
  }
  const links: Record<string, string> = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (!(SOCIAL_KEYS as readonly string[]).includes(key)) {
      return { error: `Unknown social link: ${key}` };
    }
    if (typeof raw !== 'string' || raw.length === 0) continue;
    if (key === 'email') {
      if (!EMAIL_SHAPE.test(raw)) return { error: 'socialLinks.email must be an email' };
    } else if (!isValidHttpUrl(raw)) {
      return { error: `socialLinks.${key} must be a URL` };
    }
    links[key] = raw;
  }
  return { links };
}
