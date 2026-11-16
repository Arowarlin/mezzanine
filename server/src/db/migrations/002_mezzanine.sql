-- 002_mezzanine.sql — contenido y estructura para la propuesta Mezzanine Rooftop
-- Todo el contenido sembrado con este esquema es de demostración local (is_demo = 1).
-- MariaDB 10.4 admite ADD COLUMN IF NOT EXISTS; así la migración es re-ejecutable sin daño.

ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS kind ENUM('food', 'drink') NOT NULL DEFAULT 'food' AFTER slug;

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS menu_type ENUM('lunch', 'dinner', 'cocktails', 'beer', 'wine') NULL AFTER category_id,
  ADD COLUMN IF NOT EXISTS ingredients TEXT NULL AFTER description,
  ADD COLUMN IF NOT EXISTS origin VARCHAR(160) NULL AFTER ingredients,
  ADD COLUMN IF NOT EXISTS is_demo TINYINT(1) NOT NULL DEFAULT 0 AFTER is_available;

ALTER TABLE products
  ADD KEY IF NOT EXISTS idx_products_menu_type (menu_type, is_available);

ALTER TABLE gallery_images
  ADD COLUMN IF NOT EXISTS category VARCHAR(40) NOT NULL DEFAULT 'rooftop' AFTER title;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS is_demo TINYINT(1) NOT NULL DEFAULT 0 AFTER status;

ALTER TABLE reservations
  ADD COLUMN IF NOT EXISTS is_demo TINYINT(1) NOT NULL DEFAULT 0 AFTER status;

CREATE TABLE IF NOT EXISTS career_openings (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  title           VARCHAR(160) NOT NULL,
  description     TEXT NULL,
  employment_type ENUM('full_time', 'part_time', 'seasonal') NOT NULL DEFAULT 'full_time',
  sort_order      INT NOT NULL DEFAULT 0,
  is_active       TINYINT(1) NOT NULL DEFAULT 1,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_careers_active_order (is_active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
