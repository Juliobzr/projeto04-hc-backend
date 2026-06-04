/*
  Warnings:

  - The `role` column on the `Usuario` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "RoleUsuario" AS ENUM ('FUNCIONARIO', 'GESTOR');

-- AlterTable
ALTER TABLE "Usuario" DROP COLUMN "role",
ADD COLUMN     "role" "RoleUsuario" NOT NULL DEFAULT 'FUNCIONARIO';
