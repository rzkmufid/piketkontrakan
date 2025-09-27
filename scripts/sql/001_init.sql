-- Hapus semua tabel yang ada terlebih dahulu untuk memastikan keadaan bersih.
-- Urutan penghapusan penting jika ada foreign key.
DROP TABLE IF EXISTS task_completions;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS groups;
DROP TABLE IF EXISTS users;

-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --

-- Buat ulang semua tabel dengan skema yang benar.

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT, 
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  group_name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS groups (
  name TEXT PRIMARY KEY NOT NULL
);

CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS task_completions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  user_id INTEGER NOT NULL,
  UNIQUE (task_id, date),
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);