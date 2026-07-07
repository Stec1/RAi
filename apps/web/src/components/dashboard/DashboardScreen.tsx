'use client';

// DashboardScreen — the owner's observatory management surface
// (PATCH-PIVOT-06, DL-47). Identity card + "as a node" preview +
// editable identity form (PATCH /api/v1/me/observatory) + a read-only
// local board-draft section. `name` is immutable (shown read-only).
//
// The "as a node" preview reuses the studio's SVG NodePreview (no second
// heavy 3D mount) and colors the orb by the parent domain (DL-45), so it
// matches how the observatory reads on the Explore graph.

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';
import { NodePreview } from '../studio/NodePreview';
import { useAuth } from '../../hooks/useAuth';
import { domainColor } from '../topology/topology-layout';
import type { DomainDTO } from '../../lib/topology-types';
import type { VisualSignature } from '../../data/mock-observatories';
import styles from './DashboardScreen.module.css';

export interface OwnerObservatory {
  id: string;
  name: string;
  displayName: string;
  type: 'individual' | 'studio' | 'product';
  publicMode: boolean;
  domainIds: string[];
  bio: string | null;
  socialLinks: Record<string, string> | null;
  visualSignature: VisualSignature | null;
  reputationScore: number;
  publicationsCount: number;
}

const SOCIAL_KEYS = ['github', 'x', 'telegram', 'linkedin', 'email', 'website'] as const;
const TYPES = ['individual', 'studio', 'product'] as const;
const AMBIENTS = ['glow', 'pulse', 'static', 'drift'] as const;
const NODE_STYLES = ['point', 'ring', 'pulse', 'cross'] as const;
const DRAFT_KEY = 'rai-observatory-draft';

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
  domainIds: string[];
  socialLinks: Record<string, string>;
  publicMode: boolean;
  signature: VisualSignature;
};

function toForm(o: OwnerObservatory): Form {
  return {
    displayName: o.displayName,
    bio: o.bio ?? '',
    type: o.type,
    domainIds: [...o.domainIds],
    socialLinks: { ...(o.socialLinks ?? {}) },
    publicMode: o.publicMode,
    signature: o.visualSignature ?? DEFAULT_SIGNATURE,
  };
}

function readBoardDraft(): { count: number; name?: string } | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { board?: unknown[]; name?: string };
    const count = Array.isArray(parsed.board) ? parsed.board.length : 0;
    if (count === 0) return null;
    return { count, name: parsed.name };
  } catch {
    return null;
  }
}

export function DashboardScreen({
  initial,
  domains,
}: {
  initial: OwnerObservatory;
  domains: DomainDTO[];
}) {
  const router = useRouter();
  const { signOut } = useAuth();
  const [current, setCurrent] = useState<OwnerObservatory>(initial);
  const [form, setForm] = useState<Form>(() => toForm(initial));
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<
    { kind: 'success' } | { kind: 'error'; message: string } | null
  >(null);
  const boardDraft = useRef(readBoardDraft()).current;

  const patch = (p: Partial<Form>) => setForm((f) => ({ ...f, ...p }));

  const domainName = (id: string) => domains.find((d) => d.id === id)?.name ?? null;
  const domainSlug = (id: string) => domains.find((d) => d.id === id)?.slug ?? '';

  // Parent-domain color for the node preview (DL-45): first domain's
  // color as primary, the observatory's signature accent as accent.
  const previewSignature: VisualSignature = useMemo(() => {
    const firstSlug = domainSlug(form.domainIds[0] ?? '');
    const raw = domainColor(firstSlug);
    const primary = raw.startsWith('#') ? raw : form.signature.primaryColor;
    return { ...form.signature, primaryColor: primary };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.signature, form.domainIds, domains]);

  const dirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(toForm(current)),
    [form, current],
  );

  async function save() {
    if (saving) return;
    setSaving(true);
    setStatus(null);
    try {
      const socialLinks = Object.fromEntries(
        Object.entries(form.socialLinks).filter(([, v]) => v.trim().length > 0),
      );
      const res = await fetch('/api/v1/me/observatory', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: form.displayName.trim(),
          bio: form.bio.trim() || null,
          type: form.type,
          domainIds: form.domainIds,
          socialLinks,
          publicMode: form.publicMode,
          visualSignature: form.signature,
        }),
      });
      if (res.status === 401) {
        router.replace('/login');
        return;
      }
      if (res.status === 404) {
        router.replace('/create');
        return;
      }
      const data = (await res.json().catch(() => null)) as
        | { observatory?: OwnerObservatory; error?: string }
        | null;
      if (res.ok && data?.observatory) {
        setCurrent(data.observatory);
        setForm(toForm(data.observatory));
        setStatus({ kind: 'success' });
        return;
      }
      setStatus({ kind: 'error', message: data?.error ?? 'Could not save. Try again.' });
    } catch {
      setStatus({ kind: 'error', message: 'Network error. Try again.' });
    } finally {
      setSaving(false);
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
          <p className={styles.addr}>rai.app/@{current.name}</p>
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
          <p className={styles.cardLabel}>Identity</p>
          <dl className={styles.identity}>
            <div className={styles.row}>
              <dt>Address</dt>
              <dd className={styles.mono}>rai.app/@{current.name}</dd>
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
              <dd>{current.publicMode ? 'Public' : 'Private'}</dd>
            </div>
          </dl>
          {current.bio ? <p className={styles.bio}>{current.bio}</p> : null}
          <div className={styles.pills}>
            {current.domainIds.length === 0 ? (
              <span className={styles.muted}>No domains</span>
            ) : (
              current.domainIds.map((id) => (
                <span key={id} className={styles.domainPill}>
                  <span
                    className={styles.dot}
                    style={{ background: domainColor(domainSlug(id)) }}
                    aria-hidden="true"
                  />
                  {domainName(id) ?? 'domain'}
                </span>
              ))
            )}
          </div>
          <dl className={styles.stats}>
            <div>
              <dt>Reputation</dt>
              <dd className={styles.mono}>{current.reputationScore}</dd>
            </div>
            <div>
              <dt>Publications</dt>
              <dd className={styles.mono}>{current.publicationsCount}</dd>
            </div>
          </dl>
        </GlassCard>

        {/* As a node */}
        <GlassCard className={`${styles.card} ${styles.nodeCard}`}>
          <p className={styles.cardLabel}>As a node</p>
          <NodePreview signature={previewSignature} />
          <p className={styles.muted}>
            How your observatory reads in the universe — colored by its
            domain.
          </p>
        </GlassCard>

        {/* Edit identity */}
        <GlassCard className={`${styles.card} ${styles.editCard}`}>
          <p className={styles.cardLabel}>Edit identity</p>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Address (permanent)</span>
            <input className={styles.input} value={`rai.app/@${current.name}`} readOnly />
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

          <p className={styles.fieldLabel}>Domains (up to 2)</p>
          <div className={styles.pills}>
            {domains.map((d) => {
              const on = form.domainIds.includes(d.id);
              return (
                <button
                  key={d.id}
                  type="button"
                  className={styles.pill}
                  data-active={on ? 'true' : undefined}
                  aria-pressed={on}
                  onClick={() =>
                    patch({
                      domainIds: on
                        ? form.domainIds.filter((x) => x !== d.id)
                        : form.domainIds.length < 2
                          ? [...form.domainIds, d.id]
                          : form.domainIds,
                    })
                  }
                >
                  {d.name}
                </button>
              );
            })}
          </div>

          <label className={styles.checkRow}>
            <input
              type="checkbox"
              checked={form.publicMode}
              onChange={(e) => patch({ publicMode: e.target.checked })}
            />
            <span className={styles.fieldLabel}>Public observatory</span>
          </label>

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

        {/* Board draft */}
        <GlassCard className={`${styles.card} ${styles.boardCard}`}>
          <p className={styles.cardLabel}>Your board (local draft)</p>
          {boardDraft ? (
            <>
              <p className={styles.muted}>
                {boardDraft.count} block{boardDraft.count === 1 ? '' : 's'} saved on
                this device. Board publishing to the universe is coming; for
                now the board and its photos stay local.
              </p>
              <Link href="/create" className={styles.navLink}>
                Continue in the studio
              </Link>
            </>
          ) : (
            <>
              <p className={styles.muted}>
                No board yet. Build the rooms, notes, and images that make up
                your observatory&rsquo;s story.
              </p>
              <Link href="/create" className={styles.navLink}>
                Build your board
              </Link>
            </>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
