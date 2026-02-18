const db = require("../config/db");

// Get all habits
exports.getAllHabits = (req, res) => {
  db.all("SELECT * FROM habits", [], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
};

// Add habit
exports.addHabit = (req, res) => {
  const { name, emoji, color, done, streak, time, category } = req.body;

  const sql = `
    INSERT INTO habits (name, emoji, color, done, streak, time, category)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(sql,
    [name, emoji, color, done, streak, time, category],
    function (err) {
      if (err) return res.status(500).json(err);
      res.json({ id: this.lastID });
    }
  );
};

// Update habit
exports.updateHabit = (req, res) => {
  const { done, streak } = req.body;

  db.run(
    `UPDATE habits SET done=?, streak=? WHERE id=?`,
    [done, streak, req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Habit updated" });
    }
  );
};

// Delete habit
exports.deleteHabit = (req, res) => {
  db.run(
    `DELETE FROM habits WHERE id=?`,
    req.params.id,
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Habit deleted" });
    }
  );
};
