import type { VisualSignature } from './visual-signature.js';

export type ObservatoryType = 'individual' | 'studio' | 'product';

export type Observatory = {
  id: string;
  userId: string;
  name: string;
  displayName: string;
  type: ObservatoryType;
  publicMode: boolean;
  visualSignature: VisualSignature | null;
  domainIds: string[];
  bio: string | null;
  socialLinks: Record<string, string> | null;
  reputationScore: number;
  publicationsCount: number;
  createdAt: Date;
};
