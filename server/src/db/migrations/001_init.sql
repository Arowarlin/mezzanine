-- 001_init.sql — esquema inicial del proyecto
-- Dinero en centavos enteros. Fechas DATE/DATETIME, sin zona horaria en la base.

CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(190) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('admin', 'staff') NOT NULL DEFAULT 'admin',
  is_active     TINYINT(1) NOT NULL DEFAULT 1,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS categories (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name        VARCHAR(120) NOT NULL,
  slug        VARCHAR(140) NOT NULL,
  description TEXT NULL,
  image_url   VARCHAR(500) NULL,
  sort_order  INT NOT NULL DEFAULT 0,
  is_active   TINYINT(1) NOT NULL DEFAULT 1,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_categories_slug (slug),
  KEY idx_categories_active_order (is_active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS products (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  category_id  INT UNSIGNED NOT NULL,
  name         VARCHAR(160) NOT NULL,
  slug         VARCHAR(180) NOT NULL,
  description  TEXT NULL,
  price_cents  INT UNSIGNED NOT NULL,
  image_url    VARCHAR(500) NULL,
  is_featured  TINYINT(1) NOT NULL DEFAULT 0,
  is_available TINYINT(1) NOT NULL DEFAULT 1,
  sort_order   INT NOT NULL DEFAULT 0,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_products_slug (slug),
  KEY idx_products_category (category_id),
  KEY idx_products_public (is_available, is_featured, sort_order),
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories (id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS customers (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name       VARCHAR(120) NOT NULL,
  phone      VARCHAR(30) NOT NULL,
  email      VARCHAR(190) NULL,
  notes      TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_customers_phone (phone),
  KEY idx_customers_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS orders (
  id                INT UNSIGNED NOT NULL AUTO_INCREMENT,
  code              VARCHAR(20) NOT NULL,
  customer_id       INT UNSIGNED NOT NULL,
  type              ENUM('delivery', 'pickup') NOT NULL,
  status            ENUM('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
  subtotal_cents    INT UNSIGNED NOT NULL,
  delivery_fee_cents INT UNSIGNED NOT NULL DEFAULT 0,
  total_cents       INT UNSIGNED NOT NULL,
  address           VARCHAR(300) NULL,
  notes             TEXT NULL,
  scheduled_for     DATETIME NULL,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_orders_code (code),
  KEY idx_orders_status_created (status, created_at),
  KEY idx_orders_customer (customer_id),
  CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers (id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_items (
  id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id         INT UNSIGNED NOT NULL,
  product_id       INT UNSIGNED NULL,
  product_name     VARCHAR(160) NOT NULL,
  unit_price_cents INT UNSIGNED NOT NULL,
  quantity         SMALLINT UNSIGNED NOT NULL,
  notes            VARCHAR(300) NULL,
  line_total_cents INT UNSIGNED NOT NULL,
  PRIMARY KEY (id),
  KEY idx_order_items_order (order_id),
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders (id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products (id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reservations (
  id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  code             VARCHAR(20) NOT NULL,
  customer_id      INT UNSIGNED NOT NULL,
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  party_size       TINYINT UNSIGNED NOT NULL,
  notes            TEXT NULL,
  status           ENUM('pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show') NOT NULL DEFAULT 'pending',
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_reservations_code (code),
  KEY idx_reservations_slot (reservation_date, reservation_time, status),
  KEY idx_reservations_customer (customer_id),
  CONSTRAINT fk_reservations_customer FOREIGN KEY (customer_id) REFERENCES customers (id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS gallery_images (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  url        VARCHAR(500) NOT NULL,
  title      VARCHAR(160) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active  TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_gallery_active_order (is_active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS settings (
  setting_key   VARCHAR(60) NOT NULL,
  setting_value TEXT NOT NULL,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
