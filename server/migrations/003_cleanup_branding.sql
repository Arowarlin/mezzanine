-- 003_cleanup_branding.sql
-- Limpia cualquier resto de la marca anterior en los datos editables.
-- Es idempotente: se puede ejecutar más de una vez sin efectos secundarios.

UPDATE settings
SET setting_value = REPLACE(
      REPLACE(
        REPLACE(
          REPLACE(setting_value, '@casaveranda.do', '@mezzanine.local'),
          'Casa Veranda', 'Mezzanine'
        ),
        'casa-veranda', 'mezzanine'
      ),
      'casaveranda', 'mezzanine'
    )
WHERE setting_value LIKE '%Casa Veranda%'
   OR setting_value LIKE '%casa-veranda%'
   OR setting_value LIKE '%casaveranda%';

UPDATE categories
SET name = REPLACE(REPLACE(name, 'Casa Veranda', 'Mezzanine'), 'casaveranda', 'mezzanine'),
    slug = REPLACE(REPLACE(slug, 'casa-veranda', 'mezzanine'), 'casaveranda', 'mezzanine'),
    description = REPLACE(REPLACE(description, 'Casa Veranda', 'Mezzanine'), 'casaveranda', 'mezzanine')
WHERE name LIKE '%Casa Veranda%' OR name LIKE '%casaveranda%'
   OR slug LIKE '%casa-veranda%' OR slug LIKE '%casaveranda%'
   OR description LIKE '%Casa Veranda%' OR description LIKE '%casaveranda%';

UPDATE products
SET name = REPLACE(REPLACE(name, 'Casa Veranda', 'Mezzanine'), 'casaveranda', 'mezzanine'),
    slug = REPLACE(REPLACE(slug, 'casa-veranda', 'mezzanine'), 'casaveranda', 'mezzanine'),
    description = REPLACE(REPLACE(description, 'Casa Veranda', 'Mezzanine'), 'casaveranda', 'mezzanine'),
    ingredients = REPLACE(REPLACE(ingredients, 'Casa Veranda', 'Mezzanine'), 'casaveranda', 'mezzanine'),
    origin = REPLACE(REPLACE(origin, 'Casa Veranda', 'Mezzanine'), 'casaveranda', 'mezzanine')
WHERE name LIKE '%Casa Veranda%' OR name LIKE '%casaveranda%'
   OR slug LIKE '%casa-veranda%' OR slug LIKE '%casaveranda%'
   OR description LIKE '%Casa Veranda%' OR description LIKE '%casaveranda%'
   OR ingredients LIKE '%Casa Veranda%' OR ingredients LIKE '%casaveranda%'
   OR origin LIKE '%Casa Veranda%' OR origin LIKE '%casaveranda%';

UPDATE gallery_images
SET url = REPLACE(REPLACE(url, 'casa-veranda', 'mezzanine'), 'casaveranda', 'mezzanine'),
    title = REPLACE(REPLACE(title, 'Casa Veranda', 'Mezzanine'), 'casaveranda', 'mezzanine')
WHERE url LIKE '%casa-veranda%' OR url LIKE '%casaveranda%'
   OR title LIKE '%Casa Veranda%' OR title LIKE '%casaveranda%';

UPDATE career_openings
SET title = REPLACE(REPLACE(title, 'Casa Veranda', 'Mezzanine'), 'casaveranda', 'mezzanine'),
    description = REPLACE(REPLACE(description, 'Casa Veranda', 'Mezzanine'), 'casaveranda', 'mezzanine')
WHERE title LIKE '%Casa Veranda%' OR title LIKE '%casaveranda%'
   OR description LIKE '%Casa Veranda%' OR description LIKE '%casaveranda%';

UPDATE users
SET name = REPLACE(REPLACE(name, 'Casa Veranda', 'Mezzanine'), 'casaveranda', 'mezzanine'),
    email = REPLACE(REPLACE(email, '@casaveranda.do', '@mezzanine.local'), 'casaveranda', 'mezzanine')
WHERE name LIKE '%Casa Veranda%' OR name LIKE '%casaveranda%'
   OR email LIKE '%casaveranda%';

UPDATE customers
SET name = REPLACE(REPLACE(name, 'Casa Veranda', 'Mezzanine'), 'casaveranda', 'mezzanine'),
    email = REPLACE(REPLACE(email, '@casaveranda.do', '@mezzanine.local'), 'casaveranda', 'mezzanine'),
    notes = REPLACE(REPLACE(notes, 'Casa Veranda', 'Mezzanine'), 'casaveranda', 'mezzanine')
WHERE name LIKE '%Casa Veranda%' OR name LIKE '%casaveranda%'
   OR email LIKE '%casaveranda%'
   OR notes LIKE '%Casa Veranda%' OR notes LIKE '%casaveranda%';

UPDATE orders
SET address = REPLACE(REPLACE(address, 'Casa Veranda', 'Mezzanine'), 'casaveranda', 'mezzanine'),
    notes = REPLACE(REPLACE(notes, 'Casa Veranda', 'Mezzanine'), 'casaveranda', 'mezzanine')
WHERE address LIKE '%Casa Veranda%' OR address LIKE '%casaveranda%'
   OR notes LIKE '%Casa Veranda%' OR notes LIKE '%casaveranda%';

UPDATE reservations
SET notes = REPLACE(REPLACE(notes, 'Casa Veranda', 'Mezzanine'), 'casaveranda', 'mezzanine')
WHERE notes LIKE '%Casa Veranda%' OR notes LIKE '%casaveranda%';

UPDATE order_items
SET product_name = REPLACE(REPLACE(product_name, 'Casa Veranda', 'Mezzanine'), 'casaveranda', 'mezzanine'),
    notes = REPLACE(REPLACE(notes, 'Casa Veranda', 'Mezzanine'), 'casaveranda', 'mezzanine')
WHERE product_name LIKE '%Casa Veranda%' OR product_name LIKE '%casaveranda%'
   OR notes LIKE '%Casa Veranda%' OR notes LIKE '%casaveranda%';
