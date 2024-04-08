-- CreateTable
CREATE TABLE `Exporters` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `importer_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `trade_balance` DOUBLE NOT NULL,
    `quantity_imported` DOUBLE NOT NULL,
    `value_imported` DOUBLE NOT NULL,
    `unit_value` DOUBLE NOT NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Exporters` ADD CONSTRAINT `Exporters_importer_id_fkey` FOREIGN KEY (`importer_id`) REFERENCES `Importers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
