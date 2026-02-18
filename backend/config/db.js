const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// DB path
const dbPath = path.join(__dirname, "../database/database.db");

// Connect DB
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ DB Connection Failed:", err.message);
  } else {
    console.log("✅ Connected to SQLite Local Database");
  }
});

// Create table if not exists
db.run(`
CREATE TABLE IF NOT EXISTS habits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  emoji TEXT,
  color TEXT,
  done INTEGER,
  streak INTEGER,
  time TEXT,
  category TEXT
)
`);

module.exports = db;
