const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'tunnels.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS tunnels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    remote_host TEXT,
    ssh_username TEXT,
    local_port INTEGER,
    remote_port INTEGER,
    pid INTEGER,
    status TEXT DEFAULT 'stopped'
  )`);
});

module.exports = db;
