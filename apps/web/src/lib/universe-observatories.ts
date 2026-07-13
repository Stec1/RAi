// World normalization (GENESIS R-01).
//
// The Explore graph, registry, and inspector consume the `World` shape.
// The graph list API (`GET /api/v1/observatories`) is the ONLY source —
// the demo-mock era is over; RA's first worlds are real DB rows now.
// This module also maps server content blocks to the ObservatoryStory
// renderer's StoryBlock shape (used by the overlay, the /@name page, and
// the save-story paths).

import type {
  ContentBlock,
  ContentBlockType,
  VisualSignature,
  World,
} from './topology-types';
import type { StoryBlock } from '../components/observatory/ObservatoryStory';

// The graph-list payload shape (mirrors GET /api/v1/observatories).
export interface ObservatoryDTO {
  id: string;
  name: string;
  displayName: string;
  type: string;
  visualSignature: VisualSignature | null;
  publishedAt: string | null;
  updatedAt: string | null;
}

// Neutral identity for worlds created without a signature — quiet slate,
// never a broken color (R-DL-10 fallback).
export function neutralSignature(): VisualSignature {
  return {
    primaryColor: '#8890a8',
    secondaryColor: '#22304a',
    accentColor: '#e8edf5',
    gradientAngle: 32,
    ambientEffect: 'glow',
    effectIntensity: 0.45,
    surfaceStyle: 'smooth',
    nodeStyle: 'point',
  };
}

// A signature is usable when its node-facing colors are concrete hexes.
function usableSignature(sig: VisualSignature | null): sig is VisualSignature {
  return Boolean(
    sig &&
      typeof sig.primaryColor === 'string' &&
      sig.primaryColor.startsWith('#') &&
      typeof sig.accentColor === 'string',
  );
}

export function toWorld(dto: ObservatoryDTO): World {
  return {
    slug: dto.name,
    name: dto.name,
    title: dto.displayName || dto.name,
    tagline: '',
    signature: usableSignature(dto.visualSignature)
      ? dto.visualSignature
      : neutralSignature(),
    publishedAt: dto.publishedAt ?? null,
    updatedAt: dto.updatedAt ?? null,
  };
}

// Server content blocks → the shared renderer's StoryBlock shape.
// pendingMedia image blocks map to an image StoryBlock WITHOUT imageUrl,
// which the renderer presents as its framed placeholder plate.
export function contentToStoryBlocks(content: ContentBlock[] | null | undefined): StoryBlock[] {
  if (!Array.isArray(content)) return [];
  return content.map((b) => ({
    id: b.id,
    type: b.type,
    content: (b.type === 'link' ? b.label : b.text) ?? '',
    caption: b.caption,
    url: b.href,
    variant: b.variant,
    fullBleed: b.fullBleed,
  }));
}

// A locally drafted board block (the v1 studio's local draft shape; also
// read by the dashboard's "Save story to your world" action).
export interface DraftBoardBlock {
  id: string;
  type: ContentBlockType;
  content?: string;
  caption?: string;
  url?: string;
  variant?: string;
  fullBleed?: boolean;
}

// Draft board → server content blocks (R-01). Image blocks carry no
// binary until media lands (R-02): they are sent as pendingMedia
// placeholders and keep only their caption.
export function draftBoardToContent(board: DraftBoardBlock[]): ContentBlock[] {
  return board.map((b) => {
    const block: ContentBlock = { id: b.id, type: b.type };
    if (b.type === 'image') {
      block.pendingMedia = true;
    } else if (b.type === 'link') {
      if (b.content) block.label = b.content;
      if (b.url) block.href = b.url;
    } else if (b.content) {
      block.text = b.content;
    }
    if (b.caption) block.caption = b.caption;
    if (b.variant) block.variant = b.variant;
    if (b.fullBleed) block.fullBleed = true;
    return block;
  });
}
