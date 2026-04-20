// Reserved Observatory names.
// Case-insensitive match after trim. Pure function, no side effects.

export const RESERVED_NAMES: readonly string[] = [
  'admin',
  'api',
  'www',
  'rai',
  'app',
  'help',
  'support',
  'login',
  'signup',
  'me',
  'explore',
  'settings',
  'dashboard',
  'create',
  'about',
  'static',
  'assets',
  'public',
  'private',
  'observatory',
  'publication',
  'terms',
  'privacy',
  'search',
  'billing',
  'pricing',
  'docs',
  'blog',
  'system',
  'domain',
];

export function isReserved(name: string): boolean {
  const normalized = name.trim().toLowerCase();
  return RESERVED_NAMES.includes(normalized);
}
