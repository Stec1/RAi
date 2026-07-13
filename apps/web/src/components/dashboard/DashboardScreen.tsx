'use client';

// DashboardScreen — the owner's world management surface (DL-47; adapted
// at GENESIS R-01). Identity card + "as a node" preview + editable
// identity form (PATCH /api/v1/me/observatory) + the world's visibility
// control + a story section. `name` is immutable (shown read-only).
//
// R-01 model:
//   • Visibility is the single publishing control — a 3-state choice
//     (unpublished / private / public) PATCHed to the API; publishedAt is
//     stamped server-side on the first transition to public.
//   • The world URL rai.app/@name is shown with copy + view actions.
//   • "Save story to your world" uploads the local board draft as server
//     `content` (image blocks → pendingMedia placeholders until R-02).
// The domain pills and the domain-colored node preview died with the
// domain layer (R-DL-02); the node preview is now the world's own
// signature (R-DL-10). This screen is simplified further at R-08.

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';
import { NodePreview } from '../studio/NodePreview';
import { useAuth } from '../../hooks/useAuth';
import type {
  ContentBlock,
  ObservatoryVisibility,
  VisualSignature,
} from '../../lib/topology-types';
import {
  draftBoardToContent,
  type DraftBoardBlock,
} from '../../lib/universe-observatories';
import styles from './DashboardScreen.module.css';

export interface OwnerObservatory {
  id: string;
  name: string;
  displayName: string;
  type: 'individual' | 'studio' | 'product';
  visibility: ObservatoryVisibility;
  content: ContentBlock[] | null;
  bio: string | null;
  socialLinks: Record<string, string> | null;
  visualSignature: VisualSignature | null;
  reputationScore: number;
  publicationsCount: number;
  publishedAt: string | null;
}

const SOCIAL_KEYS = ['github', 'x', 'telegram', 'linkedin', 'email', 'website'] as const;
const TYPES = ['individual', 'studio', 'product'] as const;
const AMBIENTS = ['glow', 'pulse', 'static', 'drift'] as const;
const NODE_STYLES = ['point', 'ring', 'pulse', 'cross'] as const;
const DRAFT_KEY = 'rai-observatory-draft';

const VISIBILITIES: Array<{
  value: ObservatoryVisibility;
  label: string;
  blurb: string;
}> = [
  { value: 'unpublished', label: 'Unpublished', blurb: 'Only you can see it.' },
  { value: 'private', label: 'Private', blurb: 'Anyone with the link.' },
  { value: 'public', label: 'Public', blurb: 'On the universe graph.' },
];

const DEFAULT_SIGNATURE: VisualSignature = {
  primaryColor: '#4a7dbf',
  secondaryColor: '#22304a',
  accentColor: '#bcd8ff',
  gradientAngle: 210,
  ambientEffect: 'glow',
  effectIntensity: 0.5,
  surfaceStyle: 'smooth',
  nodeStyle: 'point',
};

type Form = {
  displayName: string;
  bio: string;
  type: OwnerObservatory['type'];
  socialLinks: Record<string, string>;
  visibility: ObservatoryVisibility;
  signature: VisualSignature;
};

function toForm(o: OwnerObservatory): Form {
  return {
    displayName: o.displayName,
    bio: o.bio ?? '',
    type: o.type,
    socialLinks: { ...(o.socialLinks ?? {}) },
    visibility: o.visibility,
    signature: o.visualSignature ?? DEFAULT_SIGNATURE,
  };
}

// The local board draft: the studio's current draft, or the board stashed
// by a v1 create (`rai-observatory-board-{name}`), whichever holds blocks.
function readBoardDraft(name: string): DraftBoardBlock[] {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { board?: DraftBoardBlock[] };
      if (Array.isArray(parsed.board) && parsed.board.length > 0) {
        return parsed.board;
      }
    }
    const legacy = localStorage.getItem(`rai-observatory-board-${name}`);
    if (legacy) {
      const parsed = JSON.parse(legacy) as DraftBoardBlock[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    return [];
  } catch {
    return [];
  }
}

export function DashboardScreen({ initial }: { initial: OwnerObservatory }) {
  const router = useRouter();
  const { signOut } = useAuth();
  const [current, setCurrent] = useState<OwnerObservatory>(initial);
  const [form, setForm] = useState<Form>(() => toForm(initial));
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<
    { kind: 'success' } | { kind: 'error'; message: string } | null
  >(null);
  const [copied, setCopied] = useState(false);
  const [storySaving, setStorySaving] = useState(false);
  const [storyStatus, setStoryStatus] = useState<
    { kind: 'success' } | { kind: 'error'; message: string } | null
  >(null);
  // Read once per mount; re-read after a successful story save.
  const [boardDraft, setBoardDraft] = useState<DraftBoardBlock[]>(() =>
    typeof window === 'undefined' ? [] : readBoardDraft(initial.name),
  );

  const patch = (p: Partial<Form>) => setForm((f) => ({ ...f, ...p }));

  const worldUrl = `rai.app/@${current.name}`;
  const savedBlocks = Array.isArray(current.content) ? current.content.length : 0;

  const dirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(toForm(current)),
    [form, current],
  );

  async function patchObservatory(
    body: Record<string, unknown>,
  ): Promise<{ ok: true; observatory: OwnerObservatory } | { ok: false; message: string }> {
    try {
      const res = await fetch('/api/v1/me/observatory', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.status === 401) {
        router.replace('/login');
        return { ok: false, message: 'Signed out.' };
      }
      if (res.status === 404) {
        router.replace('/create');
        return { ok: false, message: 'No world yet.' };
      }
      const data = (await res.json().catch(() => null)) as
        | { observatory?: OwnerObservatory; error?: string }
        | null;
      if (res.ok && data?.observatory) {
        return { ok: true, observatory: data.observatory };
      }
      return { ok: false, message: data?.error ?? 'Could not save. Try again.' };
    } catch {
      return { ok: false, message: 'Network error. Try again.' };
    }
  }

  async function save() {
    if (saving) return;
    setSaving(true);
    setStatus(null);
    const socialLinks = Object.fromEntries(
      Object.entries(form.socialLinks).filter(([, v]) => v.trim().length > 0),
    );
    const result = await patchObservatory({
      displayName: form.displayName.trim(),
      bio: form.bio.trim() || null,
      type: form.type,
      socialLinks,
      visibility: form.visibility,
      visualSignature: form.signature,
    });
    if (result.ok) {
      setCurrent(result.observatory);
      setForm(toForm(result.observatory));
      setStatus({ kind: 'success' });
    } else {
      setStatus({ kind: 'error', message: result.message });
    }
    setSaving(false);
  }

  // "Save story to your world" (R-01): the local draft board becomes the
  // world's server content. Image blocks upload as pendingMedia
  // placeholders — real images arrive with media support (R-02).
  async function saveStory() {
    if (storySaving || boardDraft.length === 0) return;
    setStorySaving(true);
    setStoryStatus(null);
    const result = await patchObservatory({
      content: draftBoardToContent(boardDraft),
    });
    if (result.ok) {
      setCurrent(result.observatory);
      setForm(toForm(result.observatory));
      setStoryStatus({ kind: 'success' });
      setBoardDraft(readBoardDraft(result.observatory.name));
    } else {
      setStoryStatus({ kind: 'error', message: result.message });
    }
    setStorySaving(false);
  }

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(`https://${worldUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable — the URL is visible to select manually */
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
    } finally {
      router.replace('/');
    }
  }

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Dashboard</p>
          <h1 className={styles.title}>{current.displayName}</h1>
          <p className={styles.addr}>{worldUrl}</p>
        </div>
        <div className={styles.headerNav}>
          <Link href="/explore" className={styles.navLink}>
            See yourself in the universe
          </Link>
          <button type="button" className={styles.navLink} onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      </header>

      <div className={styles.grid}>
        {/* Identity card */}
        <GlassCard className={styles.card}>
          <p className={styles.cardLabel}>Your world</p>
          <dl className={styles.identity}>
            <div className={styles.row}>
              <dt>Address</dt>
              <dd className={styles.mono}>{worldUrl}</dd>
            </div>
            <div className={styles.row}>
              <dt>Display name</dt>
              <dd>{current.displayName}</dd>
            </div>
            <div className={styles.row}>
              <dt>Type</dt>
              <dd className={styles.badge}>{current.type}</dd>
            </div>
            <div className={styles.row}>
              <dt>Visibility</dt>
              <dd className={styles.badge}>{current.visibility}</dd>
            </div>
          </dl>
          {current.bio ? <p className={styles.bio}>{current.bio}</p> : null}
          <div className={styles.pills}>
            <button type="button" className={styles.pill} onClick={copyUrl}>
              {copied ? 'Copied' : 'Copy link'}
            </button>
            <Link href={`/@${current.name}`} className={styles.pill}>
              View world
            </Link>
          </div>
          <dl className={styles.stats}>
            <div>
              <dt>Story blocks</dt>
              <dd className={styles.mono}>{savedBlocks}</dd>
            </div>
            <div>
              <dt>Reputation</dt>
              <dd className={styles.mono}>{current.reputationScore}</dd>
            </div>
          </dl>
        </GlassCard>

        {/* As a node */}
        <GlassCard className={`${styles.card} ${styles.nodeCard}`}>
          <p className={styles.cardLabel}>As a node</p>
          <NodePreview signature={form.signature} />
          <p className={styles.muted}>
            How your world reads in the universe — colored by your visual
            signature.
            {current.visibility !== 'public'
              ? ' It appears on the graph once the world is public.'
              : ''}
          </p>
        </GlassCard>

        {/* Edit identity + visibility */}
        <GlassCard className={`${styles.card} ${styles.editCard}`}>
          <p className={styles.cardLabel}>Edit</p>

          <p className={styles.fieldLabel}>Visibility</p>
          <div className={styles.pills}>
            {VISIBILITIES.map((v) => (
              <button
                key={v.value}
                type="button"
                className={styles.pill}
                data-active={form.visibility === v.value ? 'true' : undefined}
                aria-pressed={form.visibility === v.value}
                title={v.blurb}
                onClick={() => patch({ visibility: v.value })}
              >
                {v.label}
              </button>
            ))}
          </div>
          <p className={styles.muted}>
            {VISIBILITIES.find((v) => v.value === form.visibility)?.blurb}
          </p>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Address (permanent)</span>
            <input className={styles.input} value={worldUrl} readOnly />
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Display name</span>
            <input
              className={styles.input}
              value={form.displayName}
              maxLength={60}
              onChange={(e) => patch({ displayName: e.target.value })}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Bio · {form.bio.length}/160</span>
            <textarea
              className={styles.input}
              rows={3}
              maxLength={160}
              value={form.bio}
              onChange={(e) => patch({ bio: e.target.value })}
            />
          </label>

          <p className={styles.fieldLabel}>Type</p>
          <div className={styles.pills}>
            {TYPES.map((t) => (
              <button
                key={t}
                type="button"
                className={styles.pill}
                data-active={form.type === t ? 'true' : undefined}
                aria-pressed={form.type === t}
                onClick={() => patch({ type: t })}
              >
                {t}
              </button>
            ))}
          </div>

          <p className={styles.fieldLabel}>Social links</p>
          {SOCIAL_KEYS.map((k) => (
            <input
              key={k}
              aria-label={`${k} link`}
              className={styles.input}
              placeholder={k}
              value={form.socialLinks[k] ?? ''}
              onChange={(e) =>
                patch({ socialLinks: { ...form.socialLinks, [k]: e.target.value } })
              }
            />
          ))}

          <p className={styles.fieldLabel}>Visual signature</p>
          <div className={styles.sigRow}>
            {(
              [
                ['primaryColor', 'Primary'],
                ['secondaryColor', 'Secondary'],
                ['accentColor', 'Accent'],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className={styles.colorField}>
                <span className={styles.fieldLabel}>{label}</span>
                <input
                  type="color"
                  value={form.signature[key]}
                  onChange={(e) =>
                    patch({ signature: { ...form.signature, [key]: e.target.value } })
                  }
                />
              </label>
            ))}
          </div>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>
              Gradient angle · {Math.round(form.signature.gradientAngle)}°
            </span>
            <input
              type="range"
              min={0}
              max={360}
              value={form.signature.gradientAngle}
              onChange={(e) =>
                patch({
                  signature: { ...form.signature, gradientAngle: Number(e.target.value) },
                })
              }
            />
          </label>
          <div className={styles.pills}>
            {AMBIENTS.map((a) => (
              <button
                key={a}
                type="button"
                className={styles.pill}
                data-active={form.signature.ambientEffect === a ? 'true' : undefined}
                onClick={() => patch({ signature: { ...form.signature, ambientEffect: a } })}
              >
                {a}
              </button>
            ))}
          </div>
          <div className={styles.pills}>
            {NODE_STYLES.map((n) => (
              <button
                key={n}
                type="button"
                className={styles.pill}
                data-active={form.signature.nodeStyle === n ? 'true' : undefined}
                onClick={() => patch({ signature: { ...form.signature, nodeStyle: n } })}
              >
                {n}
              </button>
            ))}
          </div>

          {status?.kind === 'error' ? (
            <p className={styles.error}>{status.message}</p>
          ) : null}
          {status?.kind === 'success' ? (
            <p className={styles.success}>Saved.</p>
          ) : null}
          <div className={styles.saveRow}>
            <GlassButton
              variant="primary"
              disabled={!dirty || saving || form.displayName.trim().length === 0}
              onClick={save}
            >
              {saving ? 'Saving…' : 'Save changes'}
            </GlassButton>
          </div>
        </GlassCard>

        {/* Story */}
        <GlassCard className={`${styles.card} ${styles.boardCard}`}>
          <p className={styles.cardLabel}>Your story</p>
          <p className={styles.muted}>
            {savedBlocks > 0
              ? `${savedBlocks} block${savedBlocks === 1 ? '' : 's'} saved to your world.`
              : 'Your world has no story yet.'}
          </p>
          {boardDraft.length > 0 ? (
            <>
              <p className={styles.muted}>
                A local draft with {boardDraft.length} block
                {boardDraft.length === 1 ? '' : 's'} is on this device. Saving
                replaces the world&rsquo;s story; photos upload as
                placeholders until media support ships.
              </p>
              {storyStatus?.kind === 'error' ? (
                <p className={styles.error}>{storyStatus.message}</p>
              ) : null}
              {storyStatus?.kind === 'success' ? (
                <p className={styles.success}>Story saved to your world.</p>
              ) : null}
              <GlassButton disabled={storySaving} onClick={saveStory}>
                {storySaving ? 'Saving…' : 'Save story to your world'}
              </GlassButton>
            </>
          ) : (
            <Link href="/create" className={styles.navLink}>
              {savedBlocks > 0 ? 'Edit in the studio' : 'Build your story'}
            </Link>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
