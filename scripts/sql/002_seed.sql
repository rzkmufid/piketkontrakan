-- file: scripts/sql/002_seed.sql

-- Seed users table
INSERT OR IGNORE INTO users (name, username, password, group_name, role)
VALUES ('Super Admin', 'superadmin', 'mupidsuper', 'Grup 1', 'superadmin');

-- Seed tasks table
INSERT OR IGNORE INTO tasks (id, name, description) VALUES
(1, 'Cek Gas', 'Jika gas habis, langsung beli dengan meminta uang ke bendahara'),
(2, 'Cek Magiccom', 'Jika Magiccom sudah tidka ada nasi yang layak untuk dimakan, bersihkan'),
(3, 'Cek Sabun Cuci Piring', 'Jika Sabun Habis,  langsung beli dengan meminta uang ke bendahara'),
(4, 'Cek Token Listrik', 'Jika Token terasa sudah sedikit atau sudah bunyi,  langsung beli dengan meminta uang ke bendahara'),
(5, 'Membersihkan Kamar Mandi', 'Buang Sampah yang ada, dan sikat Kamar Mandi'),
(6, 'Membuang Sampah', 'Membuang Sampah yang ada di area luar kamar, dan membuangnya ke tempat sampah utama, jika kantong plastiknya habis beli dengan meminta uang ke bendahara'),
(7, 'Mengecek Beras', 'Jika beras habis,  langsung beli dengan meminta uang ke bendahara'),
(8, 'Mengganti Galon', 'Jika Level air galon sudah menyentuh garis hitam,  langsung beli dengan meminta uang ke bendahara'),
(9, 'Merapikan Kain Berantakan', 'Jika ada kain yang berserakan dan tidak tahu pemiliknya, maka taruh dikasur pemilik Kain. Jika tidak maka satukan di kotak yang sudah disediakan'),
(10, 'Sapu dan Pel', 'Sapu Seluruh area rumah, dan pel area tengah rumah');

-- Seed groups table
INSERT OR IGNORE INTO groups (name) VALUES
  ('Grup 1'),
  ('Grup 2'),
  ('Grup 3');