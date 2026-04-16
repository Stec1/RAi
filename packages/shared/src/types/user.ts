export type PlanTier = 'free' | 'pro';

export type User = {
  id: string;
  email: string;
  name: string | null;
  planTier: PlanTier;
  creditsBalance: number;
  stripeCustomerId: string | null;
  createdAt: Date;
};
