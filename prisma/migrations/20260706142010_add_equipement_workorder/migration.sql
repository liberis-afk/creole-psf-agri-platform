
-- CreateEnum
CREATE TYPE "EquipementStatus" AS ENUM ('OPERATIONNEL', 'EN_PANNE', 'EN_MAINTENANCE', 'HORS_SERVICE');

-- CreateEnum
CREATE TYPE "WorkOrderType" AS ENUM ('REPARATION', 'MAINTENANCE_PREVENTIVE', 'INSPECTION');

-- CreateEnum
CREATE TYPE "WorkOrderStatus" AS ENUM ('OUVERT', 'EN_COURS', 'TERMINE', 'ANNULE');

-- CreateEnum
CREATE TYPE "Priorite" AS ENUM ('BASSE', 'NORMALE', 'HAUTE', 'URGENTE');

-- CreateTable
CREATE TABLE "Equipement" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "identifiant" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "type" TEXT,
    "statut" "EquipementStatus" NOT NULL DEFAULT 'OPERATIONNEL',
    "dateAcquisition" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Equipement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkOrder" (
    "id" TEXT NOT NULL,
    "equipementId" TEXT NOT NULL,
    "type" "WorkOrderType" NOT NULL,
    "description" TEXT NOT NULL,
    "statut" "WorkOrderStatus" NOT NULL DEFAULT 'OUVERT',
    "priorite" "Priorite" NOT NULL DEFAULT 'NORMALE',
    "dateOuverture" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateCloture" TIMESTAMP(3),
    "coutEstime" DOUBLE PRECISION,
    "coutReel" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assigneAId" TEXT,

    CONSTRAINT "WorkOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Equipement_farmId_idx" ON "Equipement"("farmId");

-- CreateIndex
CREATE UNIQUE INDEX "Equipement_farmId_identifiant_key" ON "Equipement"("farmId", "identifiant");

-- CreateIndex
CREATE INDEX "WorkOrder_equipementId_statut_idx" ON "WorkOrder"("equipementId", "statut");

-- AddForeignKey
ALTER TABLE "Equipement" ADD CONSTRAINT "Equipement_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_equipementId_fkey" FOREIGN KEY ("equipementId") REFERENCES "Equipement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_assigneAId_fkey" FOREIGN KEY ("assigneAId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

