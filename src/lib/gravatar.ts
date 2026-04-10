/**
 * Gravatar integration helper.
 *
 * Generates a Gravatar URL from an email address using the Web Crypto API
 * (available in all modern browsers and Node 18+).
 *
 * Falls back to deterministic identicon when no Gravatar profile exists.
 */

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export type GravatarDefault = "identicon" | "monsterid" | "wavatar" | "retro" | "robohash" | "mp";

/**
 * Build a Gravatar URL for the given email address.
 *
 * @param email   - User email (will be trimmed + lowercased per Gravatar spec)
 * @param size    - Image size in pixels (default 80)
 * @param fallback - Default image style when no Gravatar exists (default "identicon")
 * @returns Gravatar image URL
 */
export async function getGravatarUrl(
  email: string,
  size = 80,
  fallback: GravatarDefault = "identicon"
): Promise<string> {
  const normalized = email.trim().toLowerCase();
  const hash = await sha256Hex(normalized);
  return `https://gravatar.com/avatar/${hash}?s=${size}&d=${fallback}`;
}

/**
 * Synchronous placeholder that uses a predictable hash prefix.
 * Use this for SSR / initial render; replace with async result on client.
 */
export function getGravatarPlaceholder(
  email: string,
  size = 80,
  fallback: GravatarDefault = "identicon"
): string {
  // Simple hash for initial render — will be replaced by real hash on mount
  const normalized = email.trim().toLowerCase();
  let simpleHash = 0;
  for (let i = 0; i < normalized.length; i++) {
    simpleHash = ((simpleHash << 5) - simpleHash + normalized.charCodeAt(i)) | 0;
  }
  const hex = Math.abs(simpleHash).toString(16).padStart(8, "0");
  return `https://gravatar.com/avatar/${hex}?s=${size}&d=${fallback}`;
}
