-- CreateEnum
CREATE TYPE "AIProvider" AS ENUM ('ANTHROPIC', 'OLLAMA');

-- CreateTable
CREATE TABLE "AISettings" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "provider" "AIProvider" NOT NULL DEFAULT 'ANTHROPIC',
    "anthropicModel" TEXT NOT NULL DEFAULT 'claude-haiku-4-5-20251001',
    "ollamaBaseUrl" TEXT NOT NULL DEFAULT 'http://localhost:11434',
    "ollamaModel" TEXT NOT NULL DEFAULT 'llama3.2',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AISettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AISettings_organizationId_key" ON "AISettings"("organizationId");

-- AddForeignKey
ALTER TABLE "AISettings" ADD CONSTRAINT "AISettings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
