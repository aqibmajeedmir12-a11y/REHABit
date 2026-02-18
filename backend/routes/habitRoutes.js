const express = require("express");
const router = express.Router();
const habit = require("../models/habitModel");

// Routes
router.get("/", habit.getAllHabits);
router.post("/", habit.addHabit);
router.put("/:id", habit.updateHabit);
router.delete("/:id", habit.deleteHabit);

module.exports = router;

// Analytics summary
router.get("/analytics/summary", (req, res) => {
  const db = require("../config/db");

  const summary = {};

  db.all("SELECT * FROM habits", [], (err, rows) => {
    if (err) return res.status(500).json(err);

    const total = rows.length;
    const completed = rows.filter(h => h.done === 1).length;

    // Category breakdown
    const categories = {};
    rows.forEach(h => {
      categories[h.category] = (categories[h.category] || 0) + 1;
    });

    // Top streaks
    const topStreaks = rows
      .sort((a, b) => b.streak - a.streak)
      .slice(0, 5);

    res.json({
      total,
      completed,
      completionRate: total ? Math.round((completed / total) * 100) : 0,
      categories,
      topStreaks
    });
  });
});

// Insights API
router.get("/analytics/insights", (req, res) => {

  const db = require("../config/db");

  db.all("SELECT * FROM habits", [], (err, rows) => {
    if (err) return res.status(500).json(err);

    const total = rows.length;
    const done = rows.filter(h => h.done === 1).length;
    const pct = total ? Math.round((done / total) * 100) : 0;

    const insights = [];

    if (pct >= 80) {
      insights.push({
        emoji: "🚀",
        type: "Performance",
        typeColor: "#22c55e",
        title: "High Completion Rate",
        body: "You’re completing most of your habits consistently. Keep the momentum going!",
        chips: ["Consistency", "Momentum", "Focus"]
      });
    }

    if (pct < 50) {
      insights.push({
        emoji: "⚠️",
        type: "Warning",
        typeColor: "#f59e0b",
        title: "Low Completion Trend",
        body: "Your completion rate is dropping. Try reducing habit load or rescheduling.",
        chips: ["Balance", "Scheduling", "Energy"]
      });
    }

    const top = rows.sort((a,b)=>b.streak-a.streak)[0];

    if (top) {
      insights.push({
        emoji: "🔥",
        type: "Streak",
        typeColor: "#7c3aed",
        title: `${top.name} is your top streak`,
        body: `You’ve maintained ${top.streak} days streak. This is your strongest habit.`,
        chips: ["Discipline", "Habit strength", "Growth"]
      });
    }

    res.json({
      total,
      done,
      pct,
      insights
    });
  });
});
router.get("/analytics/summary", async (req,res)=>{

  db.all("SELECT * FROM habits",[],(err,rows)=>{

    if(err) return res.status(500).json(err);

    const total = rows.length;
    const completed = rows.filter(h=>h.done).length;

    const completionRate =
      total === 0 ? 0 :
      Math.round((completed/total)*100);

    /* CATEGORY BREAKDOWN */

    const categories = {};

    rows.forEach(h=>{
      categories[h.category] =
        (categories[h.category] || 0) + 1;
    });

    /* TOP STREAKS */

    const topStreaks = [...rows]
      .sort((a,b)=>b.streak-a.streak)
      .slice(0,5);

    res.json({
      total,
      completed,
      completionRate,
      categories,
      topStreaks
    });

  });

});
