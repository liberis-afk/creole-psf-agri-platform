
-- CreateEnum
CREATE TYPE "SaisonStatus" AS ENUM ('EN_COURS', 'TERMINEE');

-- CreateTable
CREATE TABLE "Saison" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "annee" INTEGER NOT NULL,
    "dateDebut" TIMESTAMP(3),
    "dateFin" TIMESTAMP(3),
    "statut" "SaisonStatus" NOT NULL DEFAULT 'EN_COURS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Saison_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Saison_farmId_statut_idx" ON "Saison"("farmId", "statut");

-- AddForeignKey
ALTER TABLE "Culture" ADD CONSTRAINT "Culture_saisonId_fkey" FOREIGN KEY ("saisonId") REFERENCES "Saison"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Saison" ADD CONSTRAINT "Saison_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

