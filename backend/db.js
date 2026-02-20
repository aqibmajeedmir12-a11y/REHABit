const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database(
  "./habits.db",
  (err) => {
    if (err) {
      console.error("❌ DB Connection Error:", err);
    } else {
      console.log("✅ Connected to SQLite Local Database");
      initTables();
    }
  }
);

/* ══════════════════════════════════════
   INIT ALL TABLES IN SERIES
   (run inside the connection callback so
    the DB handle is guaranteed to be open)
══════════════════════════════════════ */
function initTables() {

  db.serialize(() => {

    /* ── habits ── */
    db.run(`
      CREATE TABLE IF NOT EXISTS habits (
        id       INTEGER PRIMARY KEY AUTOINCREMENT,
        name     TEXT    NOT NULL,
        emoji    TEXT,
        color    TEXT,
        category TEXT    DEFAULT 'General',
        time     TEXT    DEFAULT 'Anytime',
        streak   INTEGER DEFAULT 0,
        done     INTEGER DEFAULT 0
      )
    `);

    /* ── habit_logs ──
       UNIQUE on (habit_id, date) so INSERT OR IGNORE
       correctly skips duplicate same-day entries.        */
    db.run(`
      CREATE TABLE IF NOT EXISTS habit_logs (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        habit_id   INTEGER NOT NULL,
        date       TEXT    NOT NULL,
        completed  INTEGER DEFAULT 1,
        UNIQUE(habit_id, date),
        FOREIGN KEY (habit_id) REFERENCES habits(id)
      )
    `);

    /* ── habit_schedule ──
       UNIQUE prevents duplicate day-assignments when
       the auto-insert block below runs on every restart. */
    db.run(`
      CREATE TABLE IF NOT EXISTS habit_schedule (
        id        INTEGER PRIMARY KEY AUTOINCREMENT,
        habit_id  INTEGER NOT NULL,
        weekday   INTEGER NOT NULL,   -- 0 = Monday … 6 = Sunday
        UNIQUE(habit_id, weekday),
        FOREIGN KEY (habit_id) REFERENCES habits(id)
      )
    `);

    /* ── settings ── */
    db.run(`
      CREATE TABLE IF NOT EXISTS settings (
        id        INTEGER PRIMARY KEY,
        name      TEXT    DEFAULT 'Alex Johnson',
        dailyGoal INTEGER DEFAULT 6,
        notif     INTEGER DEFAULT 1,
        streak    INTEGER DEFAULT 1,
        email     INTEGER DEFAULT 0,
        ach       INTEGER DEFAULT 1,
        quotes    INTEGER DEFAULT 1
      )
    `);

    /* ── user_stats ──
       Insert the seed row so XP reads never return null. */
    db.run(`
      CREATE TABLE IF NOT EXISTS user_stats (
        id    INTEGER PRIMARY KEY,
        xp    INTEGER DEFAULT 0,
        level INTEGER DEFAULT 1
      )
    `);

    db.run(`
      INSERT OR IGNORE INTO user_stats (id, xp, level)
      VALUES (1, 0, 1)
    `);

    /* ── auto-assign existing habits to Mon/Wed/Fri ── */
    db.all("SELECT id FROM habits", [], (err, habits) => {
      if (err) return;
      habits.forEach(h => {
        [0, 2, 4].forEach(day => {
          db.run(
            "INSERT OR IGNORE INTO habit_schedule (habit_id, weekday) VALUES (?, ?)",
            [h.id, day]
          );
        });
      });
    });

  });
}

module.exports = db;