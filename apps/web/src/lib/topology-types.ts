// Local DTO for the public Domain payload returned by `/api/v1/domains`.
//
// Defined here (instead of importing from `@rai/shared`) so that the web app
// production build does not depend on resolving workspace package types from
// outside `apps/web`. The shape mirrors the API response: `createdAt` is an
// ISO string post JSON serialization.

export interface DomainDTO {
  id: string;
  name: string;
  slug: string;
  description: string;
  theme: string;
  positionX: number;
  positionY: number;
  active: boolean;
  createdAt: string;
}
