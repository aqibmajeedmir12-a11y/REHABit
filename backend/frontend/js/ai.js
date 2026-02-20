/* ══════════════════════════════════════
   AI.JS — Achievements, Schedule, Calendar logic
══════════════════════════════════════ */

/* ─── ACHIEVEMENTS ─── */
async function renderAchievements(){
  try{
    const resHabits = await fetch(`${API_BASE}/api/habits`);
    const habitsData = await resHabits.json();
    const maxStreak = Math.max(0, ...habitsData.map(h => h.streak || 0));

    const grid = document.getElementById("ach-grid");
    if(!grid) return;

    let unlockedCount = 0;
    let totalXP = 0;

    grid.innerHTML = window.achievements.map(a => {
      const unlocked = maxStreak >= (a.requiredStreak || 9999);
      const progress = Math.min((maxStreak / (a.requiredStreak || 1)) * 100, 100);
      if(unlocked){ unlockedCount++; totalXP += a.xp || 0; }
      return `
        <div class="ach-card ${unlocked ? "unlocked" : "locked"}">
          <div class="ach-icon">${a.icon}</div>
          <div class="ach-name">${a.name}</div>
          <div class="ach-desc">${a.desc}</div>
          <div class="ach-badge ${(a.tier || "bronze").toLowerCase()}">${unlocked ? "Unlocked" : "Locked"} • ${a.tier}</div>
          <div style="font-size:12px;color:var(--muted)">+${a.xp || 0} XP</div>
          ${!unlocked ? `<div class="ach-progress-w"><div class="ach-progress" style="width:${progress}%"></div></div>` : ""}
        </div>`;
    }).join("");

    const lockedCount = window.achievements.length - unlockedCount;
    const completion = Math.round(unlockedCount / window.achievements.length * 100);

    const achUnlocked = document.getElementById("ach-unlocked");
    const achLocked = document.getElementById("ach-locked");
    const achCompletion = document.getElementById("ach-completion");
    const achXp = document.getElementById("ach-xp");
    if(achUnlocked) achUnlocked.textContent = unlockedCount;
    if(achLocked) achLocked.textContent = lockedCount;
    if(achCompletion) achCompletion.textContent = completion + "%";
    if(achXp) achXp.textContent = totalXP;
  } catch(err){
    console.error("Achievements error:", err);
  }
}

/* ─── SCHEDULE ─── */
async function renderSchedule(){
  try{
    const res = await fetch(`${API_BASE}/api/schedule`);
    const data = await res.json();

    const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
    const grid = document.getElementById("schedule-grid");
    if(!grid) return;

    const grouped = {};
    data.forEach(item => {
      const day = parseInt(item.weekday);
      if(!grouped[day]) grouped[day] = [];
      const exists = grouped[day].some(h =>
        (item.id && h.id === item.id) ||
        (h.name === item.name && h.weekday === item.weekday)
      );
      if(!exists) grouped[day].push(item);
    });

    grid.innerHTML = days.map((day, i) => {
      const dayHabits = grouped[i] || [];
      return `
        <div class="sched-day">
          <div class="sched-day-name">${day}</div>
          ${dayHabits.length
            ? dayHabits.map(h => `<div class="sched-habit" style="background:${h.color}22;color:${h.color};border:1px solid ${h.color}55">${h.emoji} ${h.name}</div>`).join("")
            : `<div style="font-size:11px;color:var(--muted)">No habits</div>`}
        </div>`;
    }).join("");
  } catch(err){
    console.error("Schedule Load Error:", err);
  }
}

/* ─── CALENDAR ─── */
async function renderCalendar(){
  const grid = document.getElementById("calendar-grid");
  if(!grid) return;
  try{
    const res = await fetch(`${API_BASE}/api/habits/analytics/logs`);
    const data = await res.json();
    const heatmap = data.heatmap || {};
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    grid.innerHTML = "";
    for(let d = 1; d <= daysInMonth; d++){
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const div = document.createElement("div");
      div.className = "calendar-day" + (heatmap[dateStr] ? " active" : "");
      div.textContent = d;
      grid.appendChild(div);
    }
  } catch(err){
    console.error("Calendar error:", err);
    grid.innerHTML = '<div style="color:var(--muted);font-size:13px">Unable to load calendar.</div>';
  }
}