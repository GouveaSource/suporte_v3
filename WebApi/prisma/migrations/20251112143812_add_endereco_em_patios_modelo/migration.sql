/*
  Warnings:

  - Added the required column `updatedAt` to the `cidades` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `patios` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "cidades" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "patios" ADD COLUMN     "bairro" TEXT,
ADD COLUMN     "cep" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "linkMaps" TEXT,
ADD COLUMN     "numero" TEXT,
ADD COLUMN     "referencia" TEXT,
ADD COLUMN     "rua" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
