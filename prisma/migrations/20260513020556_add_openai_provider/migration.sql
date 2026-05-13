-- AlterEnum
ALTER TYPE "AIProvider" ADD VALUE 'OPENAI';

-- AlterTable
ALTER TABLE "AISettings" ADD COLUMN     "openaiApiKey" TEXT,
ADD COLUMN     "openaiModel" TEXT NOT NULL DEFAULT 'gpt-4o-mini';
