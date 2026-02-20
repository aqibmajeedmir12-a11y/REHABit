const express = require("express");
const router  = express.Router();
const db      = require("../db");

/* ══════════════════════════════════════
   FEATURE 1 — RELAPSE RECOVERY ENGINE
   Detects users who missed 2+ completions
   in last 7 days and returns a recovery plan
══════════════════════════════════════ */
router.get("/recovery-check", (req, res) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const fromDate = sevenDaysAgo.toISOString().split("T")[0];

  db.all("SELECT * FROM habits", [], (err, habits) => {
    if (err) return res.status(500).json({ error: err.message });

    db.all(
      "SELECT habit_id, COUNT(*) as count FROM habit_logs WHERE date >= ? AND completed = 1 GROUP BY habit_id",
      [fromDate],
      (err2, logs) => {
        if (err2) return res.status(500).json({ error: err2.message });

        const logMap = {};
        logs.forEach(l => { logMap[l.habit_id] = l.count; });

        const atRisk = habits.filter(h => (logMap[h.id] || 0) < 2);

        const needsRecovery = atRisk.length >= 2;

        const plan = needsRecovery ? {
          triggered: true,
          message: "Hey, no judgment — life gets busy. Let's restart small.",
          steps: [
            { step: 1, title: "Acknowledge", desc: "You missed a few days. That's okay — every streak starts with day 1." },
            { step: 2, title: "Reduce Scope", desc: `Focus on just 1 habit today: "${atRisk[0]?.name || "your top habit"}". Drop everything else.` },
            { step: 3, title: "Micro-Win Now", desc: "Do just 2 minutes of your easiest habit right now to rebuild momentum." }
          ],
          atRiskHabits: atRisk.map(h => ({ id: h.id, name: h.name, emoji: h.emoji }))
        } : {
          triggered: false,
          message: "You're on track! Keep the momentum going.",
          steps: [],
          atRiskHabits: []
        };

        res.json(plan);
      }
    );
  });
});

/* ══════════════════════════════════════
   FEATURE 2 — CONTEXT-AWARE CUE ENGINE
   Returns smart nudge windows based on
   time of day + completion history patterns
══════════════════════════════════════ */
router.get("/smart-schedule", (req, res) => {
  db.all(
    "SELECT strftime('%H', date) as hour, COUNT(*) as count FROM habit_logs WHERE completed = 1 GROUP BY hour ORDER BY count DESC",
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      const now     = new Date();
      const hour    = now.getHours();

      /* Default windows if no history */
      const defaultWindows = [
        { label: "Morning Focus",   time: "07:00", reason: "High willpower window after waking",   score: 85 },
        { label: "Midday Reset",    time: "12:30", reason: "Natural break between tasks",           score: 70 },
        { label: "Evening Wind-down", time: "20:00", reason: "Reflection time before sleep",        score: 65 }
      ];

      if (!rows.length) return res.json({ windows: defaultWindows, bestHour: 7 });

      /* Build windows from real history */
      const topHours = rows.slice(0, 3).map((r, i) => {
        const h   = parseInt(r.hour);
        const pad = String(h).padStart(2, "0");
        const labels = ["Peak Performance Window", "Strong Completion Window", "Good Habit Window"];
        const reasons = [
          "Your historical best — highest completion rate",
          "Consistently strong in your past data",
          "Solid secondary window from your history"
        ];
        return {
          label:  labels[i],
          time:   `${pad}:00`,
          reason: reasons[i],
          score:  Math.max(40, 95 - i * 15)
        };
      });

      const bestHour = parseInt(rows[0].hour);

      /* Smart snooze: next best window after current hour */
      const nextWindow = topHours.find(w => parseInt(w.time) > hour) || topHours[0];

      res.json({ windows: topHours, bestHour, nextWindow });
    }
  );
});

/* ══════════════════════════════════════
   FEATURE 3 — PRIVACY AUDIT LOG
   Returns a log of what data is stored
   and provides clear transparency
══════════════════════════════════════ */
router.get("/privacy-audit", (req, res) => {
  db.all("SELECT COUNT(*) as habitCount FROM habits",        [], (e1, r1) => {
  db.all("SELECT COUNT(*) as logCount FROM habit_logs",      [], (e2, r2) => {
  db.all("SELECT COUNT(*) as schedCount FROM habit_schedule",[], (e3, r3) => {

    res.json({
      dataStored: [
        { type: "Habits",           count: r1[0]?.habitCount || 0, description: "Your habit names, emojis, colors, categories" },
        { type: "Completion Logs",  count: r2[0]?.logCount   || 0, description: "Dates you completed each habit" },
        { type: "Schedule Entries", count: r3[0]?.schedCount || 0, description: "Which days each habit is scheduled" }
      ],
      dataNotStored: [
        "Your real name or identity",
        "Location or GPS data",
        "Device identifiers",
        "Health sensor data",
        "Any third-party analytics"
      ],
      cloudSync:  false,
      localStorage: true,
      thirdParties: [],
      lastAudit: new Date().toISOString()
    });

  });});});
});

/* ══════════════════════════════════════
   FEATURE 4 — ADAPTIVE MOTIVATION SYSTEM
   Returns the right motivation style based
   on user's current streak & completion rate
══════════════════════════════════════ */
router.get("/motivation-style", (req, res) => {
  db.all("SELECT * FROM habits", [], (err, habits) => {
    if (err) return res.status(500).json({ error: err.message });

    const total      = habits.length;
    const done       = habits.filter(h => h.done === 1).length;
    const pct        = total ? Math.round(done / total * 100) : 0;
    const maxStreak  = Math.max(0, ...habits.map(h => h.streak || 0));
    const avgStreak  = total ? habits.reduce((s, h) => s + (h.streak || 0), 0) / total : 0;

    let style, rewards, message;

    if (avgStreak < 5) {
      /* Early stage — use points + visual streaks */
      style   = "gamified";
      rewards = ["🔥 Streak badges", "⭐ XP points", "🎯 Daily targets", "🏆 First milestones"];
      message = "You're just getting started! Every day you complete a habit earns XP and builds your streak. Hit 7 days for your first badge!";
    } else if (pct >= 80 && avgStreak >= 14) {
      /* Stable stage — switch to insight/autonomy cues */
      style   = "intrinsic";
      rewards = ["📈 Personal insights", "🧠 Progress narratives", "💡 Competence cues", "🌟 Mastery milestones"];
      message = `Incredible consistency — ${Math.round(avgStreak)}-day average streak! You've moved beyond streaks. Focus on the quality and depth of your habits now.`;
    } else {
      /* Mid stage — mix of both */
      style   = "mixed";
      rewards = ["🔥 Streaks", "📊 Progress charts", "💪 Consistency score", "🎖️ Habit mastery badges"];
      message = `You're building momentum with ${Math.round(avgStreak)}-day average streaks. Stay consistent for 14 days to unlock deeper insights.`;
    }

    res.json({ style, rewards, message, pct, avgStreak: Math.round(avgStreak), maxStreak });
  });
});

/* ══════════════════════════════════════
   FEATURE 5 — AUTO-DETECT & CONFIRM
   Suggests habits the user likely completed
   based on time-of-day patterns + pending habits
══════════════════════════════════════ */
router.get("/auto-suggest", (req, res) => {
  const now        = new Date();
  const hour       = now.getHours();
  const today      = now.toISOString().split("T")[0];

  db.all("SELECT * FROM habits WHERE done = 0", [], (err, pending) => {
    if (err) return res.status(500).json({ error: err.message });

    if (!pending.length) return res.json({ suggestions: [] });

    /* Score each pending habit by how likely it was done based on time */
    const timeScores = {
      morning:   [5,6,7,8,9,10],
      afternoon: [11,12,13,14,15,16],
      evening:   [17,18,19,20,21],
      night:     [22,23,0,1,2,3,4]
    };

    function getTimeOfDay(h){
      if (timeScores.morning.includes(h))   return "morning";
      if (timeScores.afternoon.includes(h)) return "afternoon";
      if (timeScores.evening.includes(h))   return "evening";
      return "night";
    }

    const currentPeriod = getTimeOfDay(hour);

    /* Map common habit keywords to expected time periods */
    const habitTimings = {
      morning:   ["morning","wake","breakfast","meditat","journal","yoga","run","exercise","stretch","shower","gym"],
      afternoon: ["lunch","walk","read","study","learn","focus","work"],
      evening:   ["evening","dinner","reflect","gratitude","plan","review","relax"],
      night:     ["sleep","night","bed","wind","screen"]
    };

    const suggestions = pending
      .map(h => {
        const nameLower = h.name.toLowerCase();
        let matchScore  = 0;

        /* Check if habit name matches current time period keywords */
        (habitTimings[currentPeriod] || []).forEach(kw => {
          if (nameLower.includes(kw)) matchScore += 40;
        });

        /* Bonus if scheduled time roughly matches */
        if (h.time) {
          const habitHour = parseInt(h.time.split(":")[0]);
          if (!isNaN(habitHour) && Math.abs(habitHour - hour) <= 2) matchScore += 30;
        }

        /* Base probability by time of day */
        matchScore += 20;

        return { ...h, confidence: Math.min(matchScore, 95) };
      })
      .filter(h => h.confidence >= 40)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);

    res.json({
      suggestions,
      currentPeriod,
      message: suggestions.length
        ? `Based on the time (${hour}:00), did you complete these?`
        : "No suggestions right now — check back later."
    });
  });
});

module.exports = router;