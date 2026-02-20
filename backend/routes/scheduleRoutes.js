const express = require("express");
const router  = express.Router();
const db      = require("../db");

/* ══════════════════════════════════════
   GET WEEKLY SCHEDULE
══════════════════════════════════════ */
router.get("/", (req, res) => {
  const sql = `
    SELECT hs.weekday, h.*
    FROM habit_schedule hs
    JOIN habits h ON hs.habit_id = h.id
    ORDER BY hs.weekday ASC
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

/* ══════════════════════════════════════
   ASSIGN HABIT TO DAY
══════════════════════════════════════ */
router.post("/", (req, res) => {
  const { habit_id, weekday } = req.body;
  if (habit_id === undefined || weekday === undefined)
    return res.status(400).json({ error: "habit_id and weekday are required" });

  db.run(
    "INSERT OR IGNORE INTO habit_schedule (habit_id, weekday) VALUES (?, ?)",
    [habit_id, weekday],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

/* ══════════════════════════════════════
   REMOVE HABIT FROM DAY
══════════════════════════════════════ */
router.delete("/", (req, res) => {
  const { habit_id, weekday } = req.body;
  db.run(
    "DELETE FROM habit_schedule WHERE habit_id = ? AND weekday = ?",
    [habit_id, weekday],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

module.exports = router;