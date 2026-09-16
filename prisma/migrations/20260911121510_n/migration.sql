/*
  Warnings:

  - Made the column `stripePaymentId` on table `order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `amount` on table `order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `status` on table `order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `currentcy` on table `order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `categoryId` on table `product` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `product` DROP FOREIGN KEY `Product_categoryId_fkey`;

-- AlterTable
ALTER TABLE `order` MODIFY `stripePaymentId` VARCHAR(191) NOT NULL,
    MODIFY `amount` INTEGER NOT NULL,
    MODIFY `status` VARCHAR(191) NOT NULL,
    MODIFY `currentcy` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `product` MODIFY `categoryId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
