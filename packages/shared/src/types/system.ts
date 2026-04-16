export type SystemType = 'agent' | 'workflow' | 'tool' | 'service';
export type SystemStatus = 'active' | 'demo' | 'concept';

export type System = {
  id: string;
  observatoryId: string;
  name: string;
  type: SystemType;
  description: string | null;
  capabilities: string[];
  status: SystemStatus;
  externalUrl: string | null;
  createdAt: Date;
};
