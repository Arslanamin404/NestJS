-- AlterTable
ALTER TABLE `Users` ADD COLUMN `role` ENUM('admin', 'user') NOT NULL DEFAULT 'user';
