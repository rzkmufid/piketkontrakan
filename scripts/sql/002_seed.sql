INSERT OR IGNORE INTO users (username, password, role, group_name)
VALUES ('superadmin', 'mupit', 'superadmin', 'Grup 1');

INSERT OR IGNORE INTO tasks (id, name, description) VALUES
(1, 'Sapu Lantai', 'Menyapu lantai ruang utama'),
(2, 'Pel Lantai', 'Mengepel lantai setelah disapu'),
(3, 'Bersihkan Meja', 'Lap dan rapikan meja kerja'),
(4, 'Buang Sampah', 'Kumpulkan dan buang sampah'),
(5, 'Cek Kamar Mandi', 'Periksa dan bersihkan fasilitas kamar mandi');

-- Tambahkan ini di file 002_seed.sql

-- Seed groups table
INSERT OR IGNORE INTO groups (name) VALUES
  ('Grup 1'),
  ('Grup 2'),
  ('Grup 3');