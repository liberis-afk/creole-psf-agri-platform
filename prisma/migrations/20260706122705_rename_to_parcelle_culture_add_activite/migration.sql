-- Rename Parcel -> Parcelle (data-preserving, table renamed in place)
ALTER TABLE "Parcel" RENAME TO "Parcelle";
ALTER TABLE "Parcelle" RENAME CONSTRAINT "Parcel_pkey" TO "Parcelle_pkey";
ALTER TABLE "Parcelle" RENAME CONSTRAINT "Parcel_farmId_fkey" TO "Parcelle_farmId_fkey";

-- Rename Crop -> Culture (data-preserving, table renamed in place)
ALTER TABLE "Crop" RENAME TO "Culture";
ALTER TABLE "Culture" RENAME CONSTRAINT "Crop_pkey" TO "Culture_pkey";
ALTER TABLE "Culture" RENAME CONSTRAINT "Crop_parcelId_fkey" TO "Culture_parcelleId_fkey";

-- Rename/adjust Culture columns to match the new field names
ALTER TABLE "Culture" RENAME COLUMN "parcelId" TO "parcelleId";
ALTER TABLE "Culture" RENAME COLUMN "name" TO "nomCulture";
ALTER TABLE "Culture" RENAME COLUMN "plantedAt" TO "dateDebut";
ALTER TABLE "Culture" RENAME COLUMN "harvestedAt" TO "dateFin";
ALTER TABLE "Culture" ADD COLUMN "variete" TEXT;
ALTER TABLE "Culture" ADD COLUMN "saisonId" TEXT;
ALTER TABLE "Culture" DROP COLUMN "expectedYield";
ALTER TABLE "Culture" DROP COLUMN "actualYield";

-- Replace CropStage (5 values) with CultureStatus (3 values), mapping existing data
CREATE TYPE "CultureStatus" AS ENUM ('EN_COURS', 'TERMINEE', 'ABANDONNEE');

ALTER TABLE "Culture" ADD COLUMN "statut" "CultureStatus";

UPDATE "Culture" SET "statut" = CASE
  WHEN "stage" IN ('PLANIFIEE', 'PLANTEE', 'EN_CROISSANCE') THEN 'EN_COURS'::"CultureStatus"
  WHEN "stage" = 'RECOLTEE' THEN 'TERMINEE'::"CultureStatus"
  ELSE 'ABANDONNEE'::"CultureStatus"
END;

ALTER TABLE "Culture" ALTER COLUMN "statut" SET NOT NULL;
ALTER TABLE "Culture" ALTER COLUMN "statut" SET DEFAULT 'EN_COURS';

ALTER TABLE "Culture" DROP COLUMN "stage";
DROP TYPE "CropStage";

-- CreateIndex
CREATE INDEX "Culture_parcelleId_statut_idx" ON "Culture"("parcelleId", "statut");

-- CreateEnum
CREATE TYPE "ActiviteType" AS ENUM ('PLANTATION', 'IRRIGATION', 'APPLICATION', 'CULTIVATION', 'RECOLTE');

-- CreateTable
CREATE TABLE "Activite" (
    "id" TEXT NOT NULL,
    "cultureId" TEXT NOT NULL,
    "type" "ActiviteType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "quantite" DOUBLE PRECISION,
    "unite" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Activite_cultureId_idx" ON "Activite"("cultureId");

-- CreateIndex
CREATE INDEX "Activite_type_idx" ON "Activite"("type");

-- AddForeignKey
ALTER TABLE "Activite" ADD CONSTRAINT "Activite_cultureId_fkey" FOREIGN KEY ("cultureId") REFERENCES "Culture"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activite" ADD CONSTRAINT "Activite_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
