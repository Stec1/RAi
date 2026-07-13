// Shared observatory field validators (PATCH-PIVOT-06, DL-47; extended at
// GENESIS R-01 with visibility + content-block validation).
//
// The create (POST) and update (PATCH) paths validate identically. Pure
// functions only — DB-dependent checks (name uniqueness) stay in the
// routes where the Prisma client lives.

export const OBSERVATORY_TYPES = ['individual', 'studio', 'product'] as const;
export type ObservatoryTypeInput = (typeof OBSERVATORY_TYPES)[number];

export const OBSERVATORY_VISIBILITIES = ['unpublished', 'private', 'public'] as const;
export type ObservatoryVisibilityInput = (typeof OBSERVATORY_VISIBILITIES)[number];

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

// ── World content validation (GENESIS R-01, R-DL-06) ──
//
// The content column is the ordered block list. Server-side caps: ≤100
// blocks, ≤200KB total JSON, per-string caps, unknown keys STRIPPED (the
// cleaned array is what gets persisted). Image blocks carry no binary
// until R-02 — they persist as { type:'image', caption?, pendingMedia:true }.

export const CONTENT_BLOCK_TYPES = ['heading', 'text', 'image', 'note', 'link'] as const;
export type ContentBlockTypeInput = (typeof CONTENT_BLOCK_TYPES)[number];

export interface CleanContentBlock {
  id: string;
  type: ContentBlockTypeInput;
  text?: string;
  caption?: string;
  href?: string;
  label?: string;
  variant?: string;
  fullBleed?: boolean;
  pendingMedia?: boolean;
}

const MAX_BLOCKS = 100;
const MAX_CONTENT_BYTES = 200 * 1024;
const MAX_TEXT_CHARS = 5000;
const MAX_ID_CHARS = 64;
const MAX_VARIANT_CHARS = 64;

function cleanString(
  value: unknown,
  max: number,
): { ok: true; value?: string } | { ok: false } {
  if (value === undefined || value === null) return { ok: true };
  if (typeof value !== 'string') return { ok: false };
  if (value.length > max) return { ok: false };
  if (value.length === 0) return { ok: true }; // empty → omitted
  return { ok: true, value };
}

// Validates and CLEANS a content block list. Returns the cleaned blocks
// (unknown keys stripped, empty strings dropped) or an error string.
export function validateContent(
  value: unknown,
): { blocks: CleanContentBlock[] } | { error: string } {
  if (!Array.isArray(value)) {
    return { error: 'content must be an array of blocks' };
  }
  if (value.length > MAX_BLOCKS) {
    return { error: `content must have at most ${MAX_BLOCKS} blocks` };
  }
  const blocks: CleanContentBlock[] = [];
  for (let i = 0; i < value.length; i += 1) {
    const raw = value[i];
    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
      return { error: `content[${i}] must be an object` };
    }
    const b = raw as Record<string, unknown>;
    if (
      typeof b.id !== 'string' ||
      b.id.length === 0 ||
      b.id.length > MAX_ID_CHARS
    ) {
      return { error: `content[${i}].id must be a short string` };
    }
    if (
      typeof b.type !== 'string' ||
      !(CONTENT_BLOCK_TYPES as readonly string[]).includes(b.type)
    ) {
      return { error: `content[${i}].type is invalid` };
    }
    const clean: CleanContentBlock = {
      id: b.id,
      type: b.type as ContentBlockTypeInput,
    };
    for (const key of ['text', 'caption', 'href', 'label'] as const) {
      const res = cleanString(b[key], MAX_TEXT_CHARS);
      if (!res.ok) {
        return { error: `content[${i}].${key} must be a string of at most ${MAX_TEXT_CHARS} characters` };
      }
      if (res.value !== undefined) clean[key] = res.value;
    }
    const variantRes = cleanString(b.variant, MAX_VARIANT_CHARS);
    if (!variantRes.ok) {
      return { error: `content[${i}].variant must be a short string` };
    }
    if (variantRes.value !== undefined) clean.variant = variantRes.value;
    for (const key of ['fullBleed', 'pendingMedia'] as const) {
      const v = b[key];
      if (v === undefined || v === null) continue;
      if (typeof v !== 'boolean') {
        return { error: `content[${i}].${key} must be a boolean` };
      }
      if (v) clean[key] = true;
    }
    blocks.push(clean);
  }
  const bytes = Buffer.byteLength(JSON.stringify(blocks), 'utf8');
  if (bytes > MAX_CONTENT_BYTES) {
    return { error: 'content is too large (200KB max)' };
  }
  return { blocks };
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
