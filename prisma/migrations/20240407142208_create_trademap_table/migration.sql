-- CreateTable
CREATE TABLE `Trademap` (
    `hscode` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `link` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    UNIQUE INDEX `Trademap_hscode_key`(`hscode`),
    PRIMARY KEY (`hscode`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
