/* ══════════════════════════════════════
   DASHBOARD.JS — Dashboard page logic
══════════════════════════════════════ */

async function renderDashboard(){
  if(!window.habits.length) return;

  document.getElementById("pageDate").textContent =
    new Date().toLocaleDateString("en-US", {weekday:"long", year:"numeric", month:"long", day:"numeric"});

  const dh = document.getElementById("dash-habits");
  if(!dh) return;
  dh.innerHTML = "";

  window.habits.slice(0, 5).forEach(h => {
    const el = document.createElement("div");
    el.className = "habit-item" + (h.done ? " done" : "");
    el.innerHTML = `
      <div class="habit-check">${h.done ? '<i class="fa fa-check"></i>' : ""}</div>
      <div class="h-dot" style="background:${h.color}"></div>
      <div class="habit-info">
        <div class="habit-name">${h.emoji} ${h.name}</div>
        <div class="habit-meta">${h.cat} · ${h.time}</div>
      </div>
      <div class="habit-streak">🔥 ${h.streak}</div>
    `;
    el.addEventListener("click", async () => {
      await toggleHabit(h.id);
      await loadHabitsFromDB();
      await loadDashboardStreak();
      await loadDashboardXP();
    });
    dh.appendChild(el);
  });

  const done = window.habits.filter(h => h.done).length;
  const total = window.habits.length;
  const pct = total ? Math.round(done / total * 100) : 0;

  const sDone = document.getElementById("s-done");
  const sRate = document.getElementById("s-rate");
  const sideCount = document.getElementById("sideHabitCount");
  if(sDone) sDone.textContent = done;
  if(sRate) sRate.textContent = pct + "%";
  if(sideCount) sideCount.textContent = total;

  animateRing();
  renderRingStats();
  renderWeekDots("dash-wdots");
  await loadDashboardXP();

  // Load heatmap
  try{
    const logsRes = await fetch(`${API_BASE}/api/habits/analytics/logs`);
    const logsData = await logsRes.json();
    buildHeatmap("dash-heatmap", logsData.logs || []);
  } catch(err){
    console.error("Heatmap error:", err);
    buildHeatmap("dash-heatmap", []);
  }

  // Load AI motivation quote
  try{
    const resAI = await fetch(`${API_BASE}/api/ai/motivation`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({habits: window.habits})
    });
    const ai = await resAI.json();
    const quoteEl = document.getElementById("dash-quote");
    if(quoteEl) quoteEl.textContent = ai.line || "Stay consistent 🚀";
  } catch{
    const quoteEl = document.getElementById("dash-quote");
    if(quoteEl) quoteEl.textContent = "Stay consistent 🚀";
  }

  await loadDashboardStreak();
}

function animateRing(){
  const done = window.habits.filter(h => h.done).length;
  const pct = done / window.habits.length;
  const circ = 377;
  const el = document.getElementById("dash-ring");
  if(!el) return;
  el.style.transition = "stroke-dashoffset 1.2s cubic-bezier(.22,1,.36,1)";
  el.style.strokeDashoffset = circ - pct * circ;
  const sc = document.getElementById("dash-score");
  if(!sc) return;
  let cur = parseInt(sc.textContent) || 0;
  const tgt = Math.round(pct * 100);
  const t0 = performance.now();
  const step = now => {
    const p = Math.min((now - t0) / 800, 1);
    sc.textContent = Math.round(cur + (tgt - cur) * easeOut(p)) + "%";
    if(p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function renderRingStats(){
  const cats = [
    {name:"Mind & Focus",   color:"#7c3aed", val:80},
    {name:"Health & Body",  color:"#22c55e", val:67},
    {name:"Learning",       color:"#3b82f6", val:90},
    {name:"Productivity",   color:"#f59e0b", val:55},
  ];
  const c = document.getElementById("dash-ring-stats");
  if(!c) return;
  c.innerHTML = cats.map(x => `
    <div class="ring-stat">
      <div class="rs-dot" style="background:${x.color}"></div>
      <div class="rs-info">
        <div class="rs-name">${x.name}</div>
        <div class="rs-bar-w"><div class="rs-bar" style="background:${x.color};width:0%" data-t="${x.val}"></div></div>
      </div>
      <div class="rs-val" style="color:${x.color}">${x.val}%</div>
    </div>`).join("");
  setTimeout(() => c.querySelectorAll(".rs-bar").forEach(b => b.style.width = b.dataset.t + "%"), 300);
}