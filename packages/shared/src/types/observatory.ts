import type { VisualSignature } from './visual-signature.js';

export type ObservatoryType = 'individual' | 'studio' | 'product';

// GENESIS R-01 (R-DL-05): the owner's single publishing control.
//   unpublished — owner only; not reachable, not on the graph
//   private     — anyone with the URL; not on the graph
//   public      — URL + a node on the universe graph
export type ObservatoryVisibility = 'unpublished' | 'private' | 'public';

// World content — the ordered block list persisted server-side as JSONB
// (R-DL-06). Image blocks carry NO binary until media lands (R-02): they
// persist as `{ type: 'image', caption, pendingMedia: true }`.
// The API validates: ≤100 blocks, ≤200KB total JSON, per-string caps,
// unknown keys stripped (see apps/api observatory-validation).
export type ContentBlockType = 'heading' | 'text' | 'image' | 'note' | 'link';

export type ContentBlock = {
  id: string;
  type: ContentBlockType;
  /** Main text for heading / text / note blocks. */
  text?: string;
  /** Quiet secondary line under any block. */
  caption?: string;
  /** Link target (link blocks). */
  href?: string;
  /** Link label (link blocks). */
  label?: string;
  /** Optional presentational hint, e.g. 'quote' | 'fact'. */
  variant?: string;
  /** Optional image hint. */
  fullBleed?: boolean;
  /** Image block placeholder until media support ships (R-02). */
  pendingMedia?: boolean;
};

export type Observatory = {
  id: string;
  userId: string;
  name: string;
  displayName: string;
  type: ObservatoryType;
  visibility: ObservatoryVisibility;
  content: ContentBlock[] | null;
  visualSignature: VisualSignature | null;
  bio: string | null;
  socialLinks: Record<string, string> | null;
  reputationScore: number;
  publicationsCount: number;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};
