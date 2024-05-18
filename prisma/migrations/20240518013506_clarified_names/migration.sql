/*
  Warnings:

  - The primary key for the `ProductTag` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `ProductTag` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `ProductTag` table. All the data in the column will be lost.
  - You are about to drop the `TagOnProduct` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `productId` to the `ProductTag` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tagId` to the `ProductTag` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "TagOnProduct" DROP CONSTRAINT "TagOnProduct_productId_fkey";

-- DropForeignKey
ALTER TABLE "TagOnProduct" DROP CONSTRAINT "TagOnProduct_tagId_fkey";

-- DropIndex
DROP INDEX "ProductTag_name_key";

-- AlterTable
ALTER TABLE "ProductTag" DROP CONSTRAINT "ProductTag_pkey",
DROP COLUMN "id",
DROP COLUMN "name",
ADD COLUMN     "productId" TEXT NOT NULL,
ADD COLUMN     "tagId" TEXT NOT NULL,
ADD CONSTRAINT "ProductTag_pkey" PRIMARY KEY ("productId", "tagId");

-- DropTable
DROP TABLE "TagOnProduct";

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- AddForeignKey
ALTER TABLE "ProductTag" ADD CONSTRAINT "ProductTag_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductTag" ADD CONSTRAINT "ProductTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
