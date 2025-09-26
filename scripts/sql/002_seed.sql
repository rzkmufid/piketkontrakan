INSERT OR IGNORE INTO users (username, password, role, group_name)
VALUES ('superadmin', 'superadmin', 'superadmin', 'Grup 1');

INSERT OR IGNORE INTO tasks (id, name, description) VALUES
(1, 'Sapu Lantai', 'Menyapu lantai ruang utama'),
(2, 'Pel Lantai', 'Mengepel lantai setelah disapu'),
(3, 'Bersihkan Meja', 'Lap dan rapikan meja kerja'),
(4, 'Buang Sampah', 'Kumpulkan dan buang sampah'),
(5, 'Cek Kamar Mandi', 'Periksa dan bersihkan fasilitas kamar mandi');
