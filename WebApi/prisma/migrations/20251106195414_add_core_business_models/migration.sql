-- CreateEnum
CREATE TYPE "TipoReboque" AS ENUM ('LEVE', 'PESADO');

-- CreateEnum
CREATE TYPE "CategoriaCNH" AS ENUM ('A', 'B', 'C', 'D', 'E', 'AB', 'AC', 'AD', 'AE');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ATIVO', 'INATIVO');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'ATIVO';

-- CreateTable
CREATE TABLE "setores" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT,
    "ramal" TEXT,
    "responsavel" TEXT,
    "status" "Status" NOT NULL DEFAULT 'ATIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "setores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "acessorios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ATIVO',

    CONSTRAINT "acessorios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "empresas" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ATIVO',

    CONSTRAINT "empresas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reboques" (
    "id" TEXT NOT NULL,
    "placa" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "tipo" "TipoReboque" NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ATIVO',
    "empresaId" TEXT NOT NULL,

    CONSTRAINT "reboques_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orgaos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ATIVO',

    CONSTRAINT "orgaos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cidades" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ATIVO',
    "patioId" TEXT NOT NULL,

    CONSTRAINT "cidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT,
    "responsavel" TEXT,
    "status" "Status" NOT NULL DEFAULT 'ATIVO',

    CONSTRAINT "patios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guincheiros" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "cnh_categoria" "CategoriaCNH" NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ATIVO',
    "empresaId" TEXT NOT NULL,

    CONSTRAINT "guincheiros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AcessorioToReboque" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AcessorioToReboque_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_OrgaoToPatio" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_OrgaoToPatio_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CidadeToGuincheiro" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CidadeToGuincheiro_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_GuincheiroToReboque" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_GuincheiroToReboque_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_GuincheiroToPatio" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_GuincheiroToPatio_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_GuincheiroToOrgao" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_GuincheiroToOrgao_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "acessorios_nome_key" ON "acessorios"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "empresas_cnpj_key" ON "empresas"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "reboques_placa_key" ON "reboques"("placa");

-- CreateIndex
CREATE UNIQUE INDEX "orgaos_nome_key" ON "orgaos"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "patios_nome_key" ON "patios"("nome");

-- CreateIndex
CREATE INDEX "_AcessorioToReboque_B_index" ON "_AcessorioToReboque"("B");

-- CreateIndex
CREATE INDEX "_OrgaoToPatio_B_index" ON "_OrgaoToPatio"("B");

-- CreateIndex
CREATE INDEX "_CidadeToGuincheiro_B_index" ON "_CidadeToGuincheiro"("B");

-- CreateIndex
CREATE INDEX "_GuincheiroToReboque_B_index" ON "_GuincheiroToReboque"("B");

-- CreateIndex
CREATE INDEX "_GuincheiroToPatio_B_index" ON "_GuincheiroToPatio"("B");

-- CreateIndex
CREATE INDEX "_GuincheiroToOrgao_B_index" ON "_GuincheiroToOrgao"("B");

-- AddForeignKey
ALTER TABLE "reboques" ADD CONSTRAINT "reboques_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cidades" ADD CONSTRAINT "cidades_patioId_fkey" FOREIGN KEY ("patioId") REFERENCES "patios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guincheiros" ADD CONSTRAINT "guincheiros_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AcessorioToReboque" ADD CONSTRAINT "_AcessorioToReboque_A_fkey" FOREIGN KEY ("A") REFERENCES "acessorios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AcessorioToReboque" ADD CONSTRAINT "_AcessorioToReboque_B_fkey" FOREIGN KEY ("B") REFERENCES "reboques"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrgaoToPatio" ADD CONSTRAINT "_OrgaoToPatio_A_fkey" FOREIGN KEY ("A") REFERENCES "orgaos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrgaoToPatio" ADD CONSTRAINT "_OrgaoToPatio_B_fkey" FOREIGN KEY ("B") REFERENCES "patios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CidadeToGuincheiro" ADD CONSTRAINT "_CidadeToGuincheiro_A_fkey" FOREIGN KEY ("A") REFERENCES "cidades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CidadeToGuincheiro" ADD CONSTRAINT "_CidadeToGuincheiro_B_fkey" FOREIGN KEY ("B") REFERENCES "guincheiros"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GuincheiroToReboque" ADD CONSTRAINT "_GuincheiroToReboque_A_fkey" FOREIGN KEY ("A") REFERENCES "guincheiros"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GuincheiroToReboque" ADD CONSTRAINT "_GuincheiroToReboque_B_fkey" FOREIGN KEY ("B") REFERENCES "reboques"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GuincheiroToPatio" ADD CONSTRAINT "_GuincheiroToPatio_A_fkey" FOREIGN KEY ("A") REFERENCES "guincheiros"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GuincheiroToPatio" ADD CONSTRAINT "_GuincheiroToPatio_B_fkey" FOREIGN KEY ("B") REFERENCES "patios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GuincheiroToOrgao" ADD CONSTRAINT "_GuincheiroToOrgao_A_fkey" FOREIGN KEY ("A") REFERENCES "guincheiros"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GuincheiroToOrgao" ADD CONSTRAINT "_GuincheiroToOrgao_B_fkey" FOREIGN KEY ("B") REFERENCES "orgaos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
