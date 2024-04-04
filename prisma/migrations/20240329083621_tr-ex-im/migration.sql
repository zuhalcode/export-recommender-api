-- CreateTable
CREATE TABLE `Trademap` (
    `hscode` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `link` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    UNIQUE INDEX `Trademap_hscode_key`(`hscode`),
    PRIMARY KEY (`hscode`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
ALTER TABLE `Importers` ADD CONSTRAINT `Importers_hscode_fkey` FOREIGN KEY (`hscode`) REFERENCES `Trademap`(`hscode`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Exporters` ADD CONSTRAINT `Exporters_importer_id_fkey` FOREIGN KEY (`importer_id`) REFERENCES `Importers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
