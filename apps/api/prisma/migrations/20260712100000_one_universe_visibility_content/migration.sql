-- GENESIS R-01 — migration #1 (Phase 1, R-DL-09): one universe.
-- Observatory gains visibility / content / publishedAt / updatedAt;
-- publicMode and domainIds are dropped; the Domain model is demolished.
-- Ordered to be safe against existing production rows.

-- 1. The visibility enum (R-DL-05).
CREATE TYPE "ObservatoryVisibility" AS ENUM ('unpublished', 'private', 'public');

-- 2. Add visibility. New rows default to unpublished (R-01 API contract).
ALTER TABLE "Observatory"
  ADD COLUMN "visibility" "ObservatoryVisibility" NOT NULL DEFAULT 'unpublished';

-- 3. Map EXISTING rows from the old flag (R-01 §2 / OQ-06 answer):
--    publicMode = true  → public
--    publicMode = false → private
UPDATE "Observatory"
SET "visibility" = CASE
  WHEN "publicMode" THEN 'public'::"ObservatoryVisibility"
  ELSE 'private'::"ObservatoryVisibility"
END;

-- 4. Drop the replaced flag.
ALTER TABLE "Observatory" DROP COLUMN "publicMode";

-- 5. Server-persisted world content — the ordered block list (R-DL-06).
ALTER TABLE "Observatory" ADD COLUMN "content" JSONB;

-- 6. publishedAt — set on the FIRST transition to public. Rows public at
--    migration time were already publicly visible, so their effective
--    first publish is their creation: backfill with createdAt.
ALTER TABLE "Observatory" ADD COLUMN "publishedAt" TIMESTAMP(3);
UPDATE "Observatory" SET "publishedAt" = "createdAt" WHERE "visibility" = 'public';

-- 7. updatedAt (@updatedAt is Prisma-client-managed; the temporary DEFAULT
--    lets the NOT NULL column land on a non-empty table, then goes away).
ALTER TABLE "Observatory"
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
UPDATE "Observatory" SET "updatedAt" = "createdAt";
ALTER TABLE "Observatory" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- 8. The domain break (R-DL-02): the association array and the model.
ALTER TABLE "Observatory" DROP COLUMN "domainIds";
DROP TABLE "Domain";
