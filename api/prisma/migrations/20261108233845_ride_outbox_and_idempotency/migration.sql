/*
  Warnings:

  - A unique constraint covering the columns `[passengerId,idempotencyKey]` on the table `Ride` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Ride` ADD COLUMN `idempotencyKey` VARCHAR(255) NULL,
    ADD COLUMN `requestHash` VARCHAR(255) NULL,
    ADD COLUMN `version` INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE `RideOutboxEvent` (
    `id` CHAR(36) NOT NULL,
    `rideId` CHAR(36) NOT NULL,
    `type` VARCHAR(64) NOT NULL,
    `payload` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `publishedAt` DATETIME(3) NULL,

    INDEX `RideOutboxEvent_publishedAt_createdAt_idx`(`publishedAt`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Ride_passengerId_idempotencyKey_key` ON `Ride`(`passengerId`, `idempotencyKey`);
