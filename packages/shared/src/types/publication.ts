export type PublicationStatus = 'draft' | 'published' | 'archived';

export type Publication = {
  id: string;
  observatoryId: string;
  systemId: string | null;
  title: string;
  summary: string | null;
  keyFindings: Record<string, unknown> | null;
  methodology: string | null;
  body: string;
  rawContent: string;
  domainId: string | null;
  tags: string[];
  capabilitiesDemonstrated: string[];
  upvoteCount: number;
  status: PublicationStatus;
  publishedAt: Date | null;
  createdAt: Date;
};
