'use client';

// ObservatoryStudio — the /create multi-step creation environment
// (PATCH-PIVOT-04, DL-42). Steps: World → Identity → Board → Signature →
// Finish, with a persistent live preview (right pane on desktop, a
// Preview tab below ~1024px).
//
// Persistence model (DL-41/DL-42):
//   • POSTed to /api/v1/observatories on Finish: name, displayName,
//     type, publicMode, domainIds, bio, socialLinks, visualSignature.
//   • LOCAL only (localStorage['rai-observatory-draft'], debounced):
//     the world choice and the board blocks. After a successful create
//     the board is re-keyed to `rai-observatory-board-{name}` so it can
//     attach when board publishing ships.
//   • Photos are SESSION-ONLY object URLs (no storage provider exists);
//     they are never sent to the API and do not survive reload.
//
// The visual signature is chosen manually — no AI generation.

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';
import type { DomainDTO } from '../../lib/topology-types';
import type { VisualSignature } from '../../data/mock-observatories';
import { NodePreview } from './NodePreview';
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
};

type Draft = {
  world: 'virtual' | 'real' | null;
  name: string;
  displayName: string;
  bio: string;
  type: 'individual' | 'studio' | 'product';
  domainIds: string[];
  socialLinks: Record<string, string>;
  signature: VisualSignature;
  board: Block[];
  publicMode: boolean;
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
  world: null,
  name: '',
  displayName: '',
  bio: '',
  type: 'individual',
  domainIds: [],
  socialLinks: {},
  signature: PRESETS[0]!.sig,
  board: [],
  publicMode: true,
};

const STEPS = ['World', 'Identity', 'Board', 'Signature', 'Finish'] as const;
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
    const parsed = JSON.parse(raw) as Partial<Draft>;
    // Object URLs never survive reload; image blocks come back empty.
    const board = (parsed.board ?? []).map((b) => ({ ...b, objectUrl: undefined }));
    return { ...EMPTY_DRAFT, ...parsed, board };
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
  const [domains, setDomains] = useState<DomainDTO[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [created, setCreated] = useState(false);

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

  // Active domains for the pill selector.
  useEffect(() => {
    const c = new AbortController();
    fetch('/api/v1/domains', { credentials: 'include', signal: c.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((j: { domains?: DomainDTO[] } | null) => {
        if (j?.domains) setDomains(j.domains.filter((d) => d.active));
      })
      .catch(() => {});
    return () => c.abort();
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

  // ── Finish: POST base fields only (never board / world / photos). ──
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
          publicMode: draft.publicMode,
          bio: draft.bio || undefined,
          domainIds: draft.domainIds,
          socialLinks: Object.keys(draft.socialLinks).length ? draft.socialLinks : undefined,
          visualSignature: draft.signature,
        }),
      });
      if (res.status === 201) {
        // Keep the board draft, keyed for later attach; clear the main draft.
        try {
          const board = draft.board.map(({ objectUrl: _drop, ...b }) => b);
          localStorage.setItem(`rai-observatory-board-${draft.name}`, JSON.stringify(board));
          localStorage.removeItem(DRAFT_KEY);
        } catch {
          /* ignore */
        }
        setCreated(true);
        setTimeout(() => router.replace('/dashboard'), 1800);
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
        setStep(1);
        setSubmitError('That name was just taken. Pick another.');
        return;
      }
      setSubmitError(j?.error ?? 'Could not create the observatory. Try again.');
      if (j?.field === 'name') setStep(1);
    } catch {
      setSubmitError('Network error. Check the connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const activePreviewDomain = domains.find((d) => draft.domainIds.includes(d.id));

  if (created) {
    return (
      <GlassCard className={styles.success}>
        <p className={styles.eyebrow}>Observatory created</p>
        <h2 className={styles.successTitle}>{draft.displayName || draft.name}</h2>
        <p className={styles.help}>
          Your observatory is created. The board layout is saved on this
          device and will attach once board publishing ships; photos stay
          local. Heading to your dashboard.
        </p>
        <GlassButton variant="primary" onClick={() => router.replace('/dashboard')}>
          Go to dashboard
        </GlassButton>
      </GlassCard>
    );
  }

  return (
    <div className={styles.studio}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Observatory Studio</p>
          <h1 className={styles.title}>Create your observatory</h1>
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
            <div className={styles.worldGrid}>
              {(
                [
                  ['virtual', 'Virtual', 'Present an idea that may one day become real.'],
                  ['real', 'Real', 'An existing place on Earth.'],
                ] as const
              ).map(([value, label, blurb]) => (
                <GlassCard key={value} className={styles.worldCard}>
                  <button
                    type="button"
                    className={styles.worldChoice}
                    aria-pressed={draft.world === value}
                    data-active={draft.world === value ? 'true' : undefined}
                    onClick={() => patch({ world: value })}
                  >
                    <span className={styles.worldLabel}>{label}</span>
                    <span className={styles.help}>{blurb}</span>
                  </button>
                </GlassCard>
              ))}
              <p className={styles.help}>
                The world choice is saved on this device for now; it is not
                sent to the API yet.
              </p>
            </div>
          )}

          {step === 1 && (
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

              <p className={styles.label}>Domains (up to 2)</p>
              <div className={styles.pills}>
                {domains.map((d) => {
                  const on = draft.domainIds.includes(d.id);
                  return (
                    <button
                      key={d.id}
                      type="button"
                      className={styles.pill}
                      aria-pressed={on}
                      data-active={on ? 'true' : undefined}
                      onClick={() =>
                        patch({
                          domainIds: on
                            ? draft.domainIds.filter((x) => x !== d.id)
                            : draft.domainIds.length < 2
                              ? [...draft.domainIds, d.id]
                              : draft.domainIds,
                        })
                      }
                    >
                      {d.name}
                    </button>
                  );
                })}
              </div>

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

          {step === 2 && (
            <GlassCard className={styles.form}>
              <p className={styles.help}>
                The board is saved on this device for now. It will attach to
                your observatory when board publishing ships. Photos stay
                local and do not survive reload.
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

          {step === 3 && (
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

          {step === 4 && (
            <GlassCard className={styles.form}>
              <p className={styles.help}>
                Creating persists your identity, domains, links, visibility,
                and visual signature. The board layout stays on this device
                until board publishing ships; photos stay local. The world
                choice is recorded locally.
              </p>
              <label className={styles.rowField}>
                <input
                  type="checkbox"
                  checked={draft.publicMode}
                  onChange={(e) => patch({ publicMode: e.target.checked })}
                />
                <span className={styles.label}>Public observatory</span>
              </label>
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
                {submitting ? 'Creating…' : 'Create observatory'}
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
            <p className={styles.help}>
              {draft.world === 'real' ? 'Real place' : draft.world === 'virtual' ? 'Virtual world' : '—'}
              {activePreviewDomain ? ` · ${activePreviewDomain.name}` : ''}
            </p>
          </GlassCard>
          <p className={styles.label}>Observatory view</p>
          <div className={styles.storyPreview}>
            <div
              className={styles.storyHero}
              style={{
                background: `linear-gradient(${draft.signature.gradientAngle}deg, ${draft.signature.primaryColor}, ${draft.signature.secondaryColor})`,
              }}
            >
              <p className={styles.storyEyebrow}>
                {draft.world === 'real' ? 'Real place' : 'Virtual world'}
              </p>
              <h3 className={styles.storyTitle}>{draft.displayName || 'Your observatory'}</h3>
              {draft.bio ? <p className={styles.storyTagline}>{draft.bio}</p> : null}
            </div>
            <div className={styles.storyBody}>
              {draft.board.length === 0 ? (
                <p className={styles.empty}>Board blocks appear here as the interior.</p>
              ) : (
                draft.board.map((b) => (
                  <div key={b.id} className={styles.storyBlock} data-type={b.type}>
                    {b.type === 'heading' && <h4>{b.content || '…'}</h4>}
                    {b.type === 'text' && <p>{b.content || '…'}</p>}
                    {b.type === 'note' && <blockquote>{b.content || '…'}</blockquote>}
                    {b.type === 'link' && (
                      <p className={styles.storyLink}>{b.content || b.url || 'link'}</p>
                    )}
                    {b.type === 'image' &&
                      (b.objectUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={b.objectUrl} alt={b.caption || 'Board image'} />
                      ) : (
                        <div className={styles.imgPlaceholder}>photo</div>
                      ))}
                    {b.caption ? <p className={styles.storyCaption}>{b.caption}</p> : null}
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
