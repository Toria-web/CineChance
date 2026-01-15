-- DropForeignKey
ALTER TABLE "FilterSession" DROP CONSTRAINT "FilterSession_sessionId_fkey";

-- AlterTable
ALTER TABLE "FilterSession" ALTER COLUMN "sessionId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "FilterSession" ADD CONSTRAINT "FilterSession_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "UserSession"("sessionId") ON DELETE SET NULL ON UPDATE CASCADE;
