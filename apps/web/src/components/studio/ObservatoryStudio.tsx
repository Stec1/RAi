'use client';

// ObservatoryStudio — the /create multi-step creation environment
// (PATCH-PIVOT-04, DL-42; adapted at GENESIS R-01). Steps: Identity →
// Board → Signature → Finish, with a persistent live preview (right pane
// on desktop, a Preview tab below ~1024px).
//
// R-01 model: on Finish the board draft is POSTed WITH the base fields as
// `content` — the world's story persists server-side from day one
// (R-DL-06). Image blocks carry no binary until media lands (R-02): they
// are sent as `{ type:'image', caption, pendingMedia:true }` and render
// as framed placeholder plates. Every world is created `unpublished`;
// publishing is a deliberate step on the Dashboard.
//
// The local draft (localStorage['rai-observatory-draft'], debounced) only
// bridges page reloads BEFORE the world exists. Photos are session-only
// object URLs. The v1 `world` (virtual/real) step and the domain pills
// died at R-01 (kill-map W-11 interim); this whole stepper is replaced by
// the Composer at R-07.
//
// The visual signature is chosen manually — no AI generation.

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';
import type { VisualSignature } from '../../lib/topology-types';
import { draftBoardToContent } from '../../lib/universe-observatories';
import { NodePreview } from './NodePreview';
import {
  ObservatoryStory,
  type StoryBlock,
} from '../observatory/ObservatoryStory';
import styles from './ObservatoryStudio.module.css';

const DRAFT_KEY = 'rai-observatory-draft';

type BlockType = 'heading' | 'text' | 'image' | 'note' | 'link';
type Block = {
  id: string;
  type: BlockType;
  content: string;
  caption: string;
  url?: string;
  /** Session-only object URL — never persisted, never sent to the API. */
  objectUrl?: string;
  /** Optional presentational hints (DL-49) — additive, defaulted. */
  variant?: string;
  fullBleed?: boolean;
};

type Draft = {
  name: string;
  displayName: string;
  bio: string;
  type: 'individual' | 'studio' | 'product';
  socialLinks: Record<string, string>;
  signature: VisualSignature;
  board: Block[];
};

const PRESETS: Array<{ label: string; sig: VisualSignature }> = [
  {
    label: 'Warm amber',
    sig: { primaryColor: '#d08a4e', secondaryColor: '#8a4a32', accentColor: '#ffd9a8', gradientAngle: 24, ambientEffect: 'glow', effectIntensity: 0.6, surfaceStyle: 'grain', nodeStyle: 'ring' },
  },
  {
    label: 'Violet-teal',
    sig: { primaryColor: '#6a4da8', secondaryColor: '#2e6e6a', accentColor: '#9fe0d8', gradientAngle: 152, ambientEffect: 'drift', effectIntensity: 0.5, surfaceStyle: 'mesh', nodeStyle: 'pulse' },
  },
  {
    label: 'Cold blue',
    sig: { primaryColor: '#4a7dbf', secondaryColor: '#22304a', accentColor: '#bcd8ff', gradientAngle: 210, ambientEffect: 'pulse', effectIntensity: 0.45, surfaceStyle: 'smooth', nodeStyle: 'point' },
  },
];

const EMPTY_DRAFT: Draft = {
  name: '',
  displayName: '',
  bio: '',
  type: 'individual',
  socialLinks: {},
  signature: PRESETS[0]!.sig,
  board: [],
};

const STEPS = ['Identity', 'Board', 'Signature', 'Finish'] as const;
const SOCIAL_KEYS = ['github', 'x', 'telegram', 'linkedin', 'email', 'website'] as const;
const NAME_RE = /^[a-z0-9](?:[a-z0-9-]{1,28})[a-z0-9]$/;

type NameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'reserved' | 'invalid';

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function loadDraft(): Draft {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return EMPTY_DRAFT;
    const parsed = JSON.parse(raw) as Partial<Draft> & Record<string, unknown>;
    // Object URLs never survive reload; image blocks come back empty.
    // Old drafts may carry retired v1 fields — only the known Draft
    // fields are lifted, so they simply drop away.
    const board = (Array.isArray(parsed.board) ? parsed.board : []).map((b) => ({
      ...(b as Block),
      objectUrl: undefined,
    }));
    return {
      name: typeof parsed.name === 'string' ? parsed.name : '',
      displayName: typeof parsed.displayName === 'string' ? parsed.displayName : '',
      bio: typeof parsed.bio === 'string' ? parsed.bio : '',
      type:
        parsed.type === 'studio' || parsed.type === 'product'
          ? parsed.type
          : 'individual',
      socialLinks:
        parsed.socialLinks && typeof parsed.socialLinks === 'object'
          ? (parsed.socialLinks as Record<string, string>)
          : {},
      signature: (parsed.signature as VisualSignature) ?? EMPTY_DRAFT.signature,
      board,
    };
  } catch {
    return EMPTY_DRAFT;
  }
}

export function ObservatoryStudio({ userName }: { userName: string }) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [hydrated, setHydrated] = useState(false);
  const [step, setStep] = useState(0);
  const [mobilePane, setMobilePane] = useState<'edit' | 'preview'>('edit');
  const [nameStatus, setNameStatus] = useState<NameStatus>('idle');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdName, setCreatedName] = useState<string | null>(null);

  // Hydrate the local draft after mount (SSR-safe).
  useEffect(() => {
    const loaded = loadDraft();
    setDraft(loaded);
    if (!loaded.displayName && userName) {
      setDraft((d) => ({ ...d, displayName: userName }));
    }
    setHydrated(true);
  }, [userName]);

  // Debounced draft autosave. Object URLs are stripped (session-only).
  useEffect(() => {
    if (!hydrated) return;
    const t = setTimeout(() => {
      try {
        const toSave = {
          ...draft,
          board: draft.board.map(({ objectUrl: _drop, ...b }) => b),
        };
        localStorage.setItem(DRAFT_KEY, JSON.stringify(toSave));
      } catch {
        // Quota exceeded — the draft simply doesn't persist this pass.
      }
    }, 500);
    return () => clearTimeout(t);
  }, [draft, hydrated]);

  // Revoke all object URLs on unmount.
  const urlsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const urls = urlsRef.current;
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

  // Live name availability (debounced ~300ms).
  useEffect(() => {
    const name = draft.name;
    if (!name) {
      setNameStatus('idle');
      return;
    }
    if (!NAME_RE.test(name)) {
      setNameStatus('invalid');
      return;
    }
    setNameStatus('checking');
    const c = new AbortController();
    const t = setTimeout(() => {
      fetch(`/api/v1/observatories/check/${encodeURIComponent(name)}`, {
        credentials: 'include',
        signal: c.signal,
      })
        .then(async (r) => {
          const j = (await r.json().catch(() => null)) as {
            available?: boolean;
            reason?: string;
          } | null;
          if (j?.available) setNameStatus('available');
          else if (j?.reason === 'reserved') setNameStatus('reserved');
          else if (j?.reason === 'taken') setNameStatus('taken');
          else setNameStatus('invalid');
        })
        .catch(() => setNameStatus('idle'));
    }, 300);
    return () => {
      clearTimeout(t);
      c.abort();
    };
  }, [draft.name]);

  const patch = useCallback((p: Partial<Draft>) => setDraft((d) => ({ ...d, ...p })), []);

  const resetDraft = () => {
    urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    urlsRef.current.clear();
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* ignore */
    }
    setDraft({ ...EMPTY_DRAFT, displayName: userName });
    setStep(0);
    setSubmitError(null);
  };

  // ── Board actions ──
  const addBlock = (type: BlockType) =>
    patch({ board: [...draft.board, { id: uid(), type, content: '', caption: '' }] });
  const updateBlock = (id: string, p: Partial<Block>) =>
    patch({ board: draft.board.map((b) => (b.id === id ? { ...b, ...p } : b)) });
  const removeBlock = (id: string) => {
    const b = draft.board.find((x) => x.id === id);
    if (b?.objectUrl) {
      URL.revokeObjectURL(b.objectUrl);
      urlsRef.current.delete(b.objectUrl);
    }
    patch({ board: draft.board.filter((x) => x.id !== id) });
  };
  const moveBlock = (id: string, dir: -1 | 1) => {
    const i = draft.board.findIndex((b) => b.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= draft.board.length) return;
    const next = [...draft.board];
    const [b] = next.splice(i, 1);
    next.splice(j, 0, b!);
    patch({ board: next });
  };
  const attachImage = (id: string, file: File) => {
    const url = URL.createObjectURL(file);
    urlsRef.current.add(url);
    updateBlock(id, { objectUrl: url, content: file.name });
  };

  const identityValid =
    nameStatus === 'available' &&
    draft.displayName.trim().length > 0 &&
    draft.bio.length <= 160;

  // ── Finish: POST base fields + the board as `content` (R-01 §6). ──
  async function submit() {
    if (submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch('/api/v1/observatories', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: draft.name,
          displayName: draft.displayName.trim(),
          type: draft.type,
          bio: draft.bio || undefined,
          socialLinks: Object.keys(draft.socialLinks).length ? draft.socialLinks : undefined,
          visualSignature: draft.signature,
          content: draft.board.length > 0 ? draftBoardToContent(draft.board) : undefined,
        }),
      });
      if (res.status === 201) {
        // The story now lives on the server — the local draft has done
        // its job.
        try {
          localStorage.removeItem(DRAFT_KEY);
        } catch {
          /* ignore */
        }
        setCreatedName(draft.name);
        return;
      }
      if (res.status === 401) {
        router.replace('/login');
        return;
      }
      const j = (await res.json().catch(() => null)) as {
        error?: string;
        reason?: string;
        field?: string;
      } | null;
      if (res.status === 409 && j?.reason === 'already_exists') {
        router.replace('/dashboard');
        return;
      }
      if (res.status === 409 && j?.reason === 'taken') {
        setNameStatus('taken');
        setStep(0);
        setSubmitError('That name was just taken. Pick another.');
        return;
      }
      setSubmitError(j?.error ?? 'Could not create the observatory. Try again.');
      if (j?.field === 'name') setStep(0);
    } catch {
      setSubmitError('Network error. Check the connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (createdName) {
    return (
      <GlassCard className={styles.success}>
        <p className={styles.eyebrow}>World created</p>
        <h2 className={styles.successTitle}>{draft.displayName || createdName}</h2>
        <p className={styles.addr}>rai.app/@{createdName}</p>
        <p className={styles.help}>
          Your world exists — as <strong>unpublished</strong>, so only you can
          see it until you publish from the dashboard. Your story is saved to
          it; photos arrive with media support.
        </p>
        <div className={styles.navRow}>
          <Link href={`/@${createdName}`} className={styles.resetDraft}>
            View your world
          </Link>
          <GlassButton variant="primary" onClick={() => router.replace('/dashboard')}>
            Go to dashboard
          </GlassButton>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className={styles.studio}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Observatory Studio</p>
          <h1 className={styles.title}>Create your world</h1>
        </div>
        <button type="button" className={styles.resetDraft} onClick={resetDraft}>
          Reset draft
        </button>
      </header>

      <nav className={styles.stepper} aria-label="Studio steps">
        {STEPS.map((label, i) => (
          <button
            key={label}
            type="button"
            className={styles.stepBtn}
            data-active={i === step ? 'true' : undefined}
            aria-current={i === step ? 'step' : undefined}
            onClick={() => setStep(i)}
          >
            <span className={styles.stepNum}>{i + 1}</span> {label}
          </button>
        ))}
      </nav>

      <div className={styles.mobileTabs} role="tablist" aria-label="Studio panes">
        {(['edit', 'preview'] as const).map((p) => (
          <button
            key={p}
            type="button"
            role="tab"
            aria-selected={mobilePane === p}
            data-active={mobilePane === p ? 'true' : undefined}
            className={styles.mobileTab}
            onClick={() => setMobilePane(p)}
          >
            {p === 'edit' ? 'Edit' : 'Preview'}
          </button>
        ))}
      </div>

      <div className={styles.body} data-pane={mobilePane}>
        <main className={styles.work}>
          {step === 0 && (
            <GlassCard className={styles.form}>
              <label className={styles.label} htmlFor="obs-name">
                Name
              </label>
              <input
                id="obs-name"
                className={styles.input}
                value={draft.name}
                placeholder="lowercase-and-hyphens"
                onChange={(e) =>
                  patch({ name: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })
                }
              />
              <p className={styles.addr}>
                rai.app/@{draft.name || 'name'}
                <span className={styles.nameStatus} data-status={nameStatus}>
                  {nameStatus === 'checking' && ' · checking…'}
                  {nameStatus === 'available' && ' · available'}
                  {nameStatus === 'taken' && ' · taken'}
                  {nameStatus === 'reserved' && ' · reserved'}
                  {nameStatus === 'invalid' && ' · 3–30 chars, a–z, 0–9, hyphens'}
                </span>
              </p>

              <label className={styles.label} htmlFor="obs-display">
                Display name
              </label>
              <input
                id="obs-display"
                className={styles.input}
                value={draft.displayName}
                maxLength={60}
                onChange={(e) => patch({ displayName: e.target.value })}
              />

              <label className={styles.label} htmlFor="obs-bio">
                Bio <span className={styles.help}>{draft.bio.length}/160</span>
              </label>
              <textarea
                id="obs-bio"
                className={styles.input}
                rows={3}
                maxLength={160}
                value={draft.bio}
                onChange={(e) => patch({ bio: e.target.value })}
              />

              <p className={styles.label}>Type</p>
              <div className={styles.pills}>
                {(['individual', 'studio', 'product'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={styles.pill}
                    aria-pressed={draft.type === t}
                    data-active={draft.type === t ? 'true' : undefined}
                    onClick={() => patch({ type: t })}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <p className={styles.label}>Social links (optional)</p>
              {SOCIAL_KEYS.map((k) => (
                <input
                  key={k}
                  aria-label={`${k} link`}
                  className={styles.input}
                  placeholder={k}
                  value={draft.socialLinks[k] ?? ''}
                  onChange={(e) =>
                    patch({ socialLinks: { ...draft.socialLinks, [k]: e.target.value } })
                  }
                />
              ))}
            </GlassCard>
          )}

          {step === 1 && (
            <GlassCard className={styles.form}>
              <p className={styles.help}>
                Your story saves to your world when you create it. Photos are
                placeholders for now — real images arrive with media support.
              </p>
              {draft.board.length === 0 ? (
                <p className={styles.empty}>No blocks yet. Start the story below.</p>
              ) : (
                draft.board.map((b, i) => (
                  <div key={b.id} className={styles.block}>
                    <div className={styles.blockHead}>
                      <span className={styles.blockType}>{b.type}</span>
                      <span className={styles.blockActions}>
                        <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => moveBlock(b.id, -1)}>↑</button>
                        <button type="button" aria-label="Move down" disabled={i === draft.board.length - 1} onClick={() => moveBlock(b.id, 1)}>↓</button>
                        <button type="button" aria-label="Delete block" onClick={() => removeBlock(b.id)}>×</button>
                      </span>
                    </div>
                    {b.type === 'image' ? (
                      <>
                        {b.objectUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={b.objectUrl} alt={b.caption || 'Board image'} className={styles.blockImg} />
                        ) : (
                          <label className={styles.imgPick}>
                            {b.content ? `Re-add photo (${b.content})` : 'Choose a photo'}
                            <input
                              type="file"
                              accept="image/*"
                              hidden
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) attachImage(b.id, f);
                              }}
                            />
                          </label>
                        )}
                      </>
                    ) : (
                      <textarea
                        aria-label={`${b.type} content`}
                        className={styles.input}
                        rows={b.type === 'heading' ? 1 : 3}
                        placeholder={b.type === 'link' ? 'Link label' : `${b.type} …`}
                        value={b.content}
                        onChange={(e) => updateBlock(b.id, { content: e.target.value })}
                      />
                    )}
                    {b.type === 'link' && (
                      <input
                        aria-label="Link URL"
                        className={styles.input}
                        placeholder="https://…"
                        value={b.url ?? ''}
                        onChange={(e) => updateBlock(b.id, { url: e.target.value })}
                      />
                    )}
                    <input
                      aria-label="Block description"
                      className={styles.input}
                      placeholder="Description (optional)"
                      value={b.caption}
                      onChange={(e) => updateBlock(b.id, { caption: e.target.value })}
                    />
                  </div>
                ))
              )}
              <div className={styles.pills}>
                {(['heading', 'text', 'image', 'note', 'link'] as const).map((t) => (
                  <button key={t} type="button" className={styles.pill} onClick={() => addBlock(t)}>
                    + {t}
                  </button>
                ))}
              </div>
            </GlassCard>
          )}

          {step === 2 && (
            <GlassCard className={styles.form}>
              <p className={styles.label}>Presets</p>
              <div className={styles.pills}>
                {PRESETS.map((p) => (
                  <button key={p.label} type="button" className={styles.pill} onClick={() => patch({ signature: p.sig })}>
                    {p.label}
                  </button>
                ))}
              </div>
              {(
                [
                  ['primaryColor', 'Primary'],
                  ['secondaryColor', 'Secondary'],
                  ['accentColor', 'Accent'],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className={styles.rowField}>
                  <span className={styles.label}>{label}</span>
                  <input
                    type="color"
                    value={draft.signature[key]}
                    onChange={(e) => patch({ signature: { ...draft.signature, [key]: e.target.value } })}
                  />
                </label>
              ))}
              <label className={styles.rowField}>
                <span className={styles.label}>Gradient angle · {Math.round(draft.signature.gradientAngle)}°</span>
                <input
                  type="range"
                  min={0}
                  max={360}
                  value={draft.signature.gradientAngle}
                  onChange={(e) => patch({ signature: { ...draft.signature, gradientAngle: Number(e.target.value) } })}
                />
              </label>
              <label className={styles.rowField}>
                <span className={styles.label}>Effect intensity · {draft.signature.effectIntensity.toFixed(2)}</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={draft.signature.effectIntensity}
                  onChange={(e) => patch({ signature: { ...draft.signature, effectIntensity: Number(e.target.value) } })}
                />
              </label>
              {(
                [
                  ['ambientEffect', ['glow', 'pulse', 'static', 'drift']],
                  ['surfaceStyle', ['smooth', 'grain', 'mesh', 'void']],
                  ['nodeStyle', ['point', 'ring', 'pulse', 'cross']],
                ] as const
              ).map(([key, options]) => (
                <div key={key}>
                  <p className={styles.label}>{key}</p>
                  <div className={styles.pills}>
                    {options.map((o) => (
                      <button
                        key={o}
                        type="button"
                        className={styles.pill}
                        aria-pressed={draft.signature[key] === o}
                        data-active={draft.signature[key] === o ? 'true' : undefined}
                        onClick={() => patch({ signature: { ...draft.signature, [key]: o } })}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </GlassCard>
          )}

          {step === 3 && (
            <GlassCard className={styles.form}>
              <p className={styles.help}>
                Creating persists your identity, links, visual signature, and
                your story (the board) to your world. It starts
                <strong> unpublished</strong> — only you can see it until you
                publish from the dashboard. Photos arrive with media support.
              </p>
              {!identityValid && (
                <p className={styles.error}>
                  Identity is incomplete — the name must be available and the
                  display name filled in.
                </p>
              )}
              {submitError && <p className={styles.error}>{submitError}</p>}
              <GlassButton
                variant="primary"
                disabled={!identityValid || submitting}
                onClick={submit}
              >
                {submitting ? 'Creating…' : 'Create world'}
              </GlassButton>
            </GlassCard>
          )}

          <div className={styles.navRow}>
            <GlassButton disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>
              Back
            </GlassButton>
            <GlassButton
              disabled={step === STEPS.length - 1}
              onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
            >
              Next
            </GlassButton>
          </div>
        </main>

        <aside className={styles.preview} aria-label="Live preview">
          <p className={styles.label}>As a node</p>
          <GlassCard className={styles.nodeCard}>
            <NodePreview signature={draft.signature} />
            <p className={styles.nodeName}>{draft.displayName || draft.name || 'Unnamed'}</p>
            <p className={styles.help}>rai.app/@{draft.name || 'name'}</p>
          </GlassCard>
          <p className={styles.label}>World view</p>
          {/* The SAME shared renderer the Explore overlay and /@name page
              use (DL-49), so the studio preview can never diverge from the
              public story. Board blocks (with local image previews) map to
              StoryBlocks. */}
          <div className={styles.storyPreview}>
            <ObservatoryStory
              title={draft.displayName || 'Your world'}
              eyebrow="World"
              metadata={draft.type}
              lede={draft.bio}
              signature={draft.signature}
              blocks={draft.board.map(
                (b): StoryBlock => ({
                  id: b.id,
                  type: b.type,
                  content: b.content,
                  caption: b.caption,
                  url: b.url,
                  imageUrl: b.objectUrl,
                  variant: b.variant,
                  fullBleed: b.fullBleed,
                }),
              )}
              emptyMessage="Board blocks appear here as the interior."
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
