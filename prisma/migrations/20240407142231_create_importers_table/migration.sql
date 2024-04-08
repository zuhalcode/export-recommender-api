-- CreateTable
CREATE TABLE `Importers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `hscode` VARCHAR(191) NOT NULL,
    `trade_balance` DOUBLE NOT NULL,
    `quantity_imported` DOUBLE NOT NULL,
    `value_imported` DOUBLE NOT NULL,
    `quantity_unit` VARCHAR(191) NULL,
    `unit_value` DOUBLE NOT NULL,
    `prediction` DOUBLE NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Importers` ADD CONSTRAINT `Importers_hscode_fkey` FOREIGN KEY (`hscode`) REFERENCES `Trademap`(`hscode`) ON DELETE RESTRICT ON UPDATE CASCADE;
