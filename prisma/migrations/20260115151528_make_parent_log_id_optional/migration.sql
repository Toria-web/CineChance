-- AlterTable
ALTER TABLE "IntentSignal" ALTER COLUMN "recommendationLogId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "RecommendationEvent" ALTER COLUMN "parentLogId" DROP NOT NULL;
