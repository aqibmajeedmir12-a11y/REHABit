/* ══════════════════════════════════════
   ANALYTICS.JS — Analytics page logic
══════════════════════════════════════ */

async function renderAnalytics(){
  try{
    const res = await fetch(`${API_BASE}/api/habits/analytics/summary`);
    const data = await res.json();

    const weeklyEl = document.getElementById("an-weekly");
    const completedEl = document.getElementById("an-completed");
    const startEl = document.getElementById("an-start");
    const gradeEl = document.getElementById("an-grade");

    if(weeklyEl) weeklyEl.textContent = data.completionRate + "%";
    if(completedEl) completedEl.textContent = data.completed;
    if(startEl) startEl.textContent = "7:00";
    if(gradeEl) gradeEl.textContent =
      data.completionRate >= 80 ? "A+" :
      data.completionRate >= 60 ? "A"  :
      data.completionRate >= 40 ? "B"  : "C";

    renderBarChartFromDB(data);
    renderDonutFromDB(data.categories);
    renderTopStreaksFromDB(data.topStreaks);
    renderTimeChartFromDB(data);

    const logsRes = await fetch(`${API_BASE}/api/habits/analytics/logs`);
    const logsData = await logsRes.json();
    buildHeatmap("full-heatmap", logsData.logs || []);
  } catch(err){
    console.error("Analytics error:", err);
  }
}

function renderBarChartFromDB(data){
  const c = document.getElementById("bar-chart");
  if(!c) return;
  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const weekly = data.weekly || {};
  const max = Math.max(...Object.values(weekly), 1);
  c.innerHTML = `<div style="display:flex;align-items:flex-end;gap:8px;height:140px;padding-bottom:24px;position:relative">` +
    days.map(d => {
      const value = weekly[d] || 0;
      const pct = Math.round(value / max * 100);
      return `
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;height:100%;justify-content:flex-end">
          <div style="font-size:10px;font-weight:700;color:var(--text)">${value}</div>
          <div style="width:100%;height:${Math.max(pct, 4)}%;background:var(--grad1);border-radius:6px 6px 0 0;min-height:4px"></div>
          <div style="font-size:10px;color:var(--muted);font-weight:600">${d}</div>
        </div>`;
    }).join("") + `</div>`;
}

function renderDonutFromDB(categories){
  if(!categories) return;
  const total = Object.values(categories).reduce((a, b) => a + b, 0);
  const circ = 314;
  let offset = 0;
  const donutColors = ["#7c3aed","#22c55e","#3b82f6","#f59e0b","#ec4899"];
  const keys = Object.keys(categories);
  keys.slice(0, 3).forEach((cat, i) => {
    const el = document.getElementById("donut" + (i + 1));
    if(!el) return;
    const pct = (categories[cat] / total) * 100;
    const dash = circ * pct / 100;
    el.style.stroke = donutColors[i];
    el.style.strokeDasharray = `${dash} ${circ}`;
    el.style.strokeDashoffset = -offset;
    offset += dash;
  });
  const leg = document.getElementById("donut-legend");
  if(!leg) return;
  leg.innerHTML = keys.map((cat, i) => {
    const pct = Math.round((categories[cat] / total) * 100);
    return `<div class="donut-leg-item">
      <div class="dl-dot" style="background:${donutColors[i]}"></div>
      <div class="dl-name">${cat}</div>
      <div class="dl-pct">${pct}%</div>
    </div>`;
  }).join("");
}

function renderTopStreaksFromDB(streaks){
  const c = document.getElementById("top-streaks");
  if(!c || !streaks) return;
  c.innerHTML = streaks.map((h, i) => `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
      <div style="font-weight:700;width:20px">${i + 1}</div>
      <div style="font-size:20px">${h.emoji}</div>
      <div style="flex:1">
        <div style="font-size:13px;font-weight:600">${h.name}</div>
        <div style="height:5px;background:rgba(255,255,255,.08);border-radius:10px;margin-top:5px">
          <div style="height:100%;border-radius:10px;background:${h.color};width:${Math.min(h.streak / 30 * 100, 100)}%"></div>
        </div>
      </div>
      <div style="font-weight:700;color:#f59e0b">🔥${h.streak}</div>
    </div>`).join("");
}

function renderTimeChartFromDB(data){
  const pct = data.completionRate || 0;
  const slots = [
    {label:"6–9 AM",  pct: pct + 10, color:"#7c3aed"},
    {label:"9–12 PM", pct: pct - 5,  color:"#3b82f6"},
    {label:"12–3 PM", pct: pct - 15, color:"#06b6d4"},
    {label:"3–6 PM",  pct: pct - 8,  color:"#22c55e"},
    {label:"6–9 PM",  pct: pct + 4,  color:"#f59e0b"},
    {label:"9–12 AM", pct: pct - 20, color:"#ec4899"},
  ].map(s => ({...s, pct: Math.max(0, Math.min(100, s.pct))}));
  const c = document.getElementById("time-chart");
  if(!c) return;
  c.innerHTML = slots.map(s => `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
      <div style="font-size:11px;color:var(--muted);font-weight:600;width:60px">${s.label}</div>
      <div style="flex:1;height:8px;background:rgba(255,255,255,.07);border-radius:10px;overflow:hidden">
        <div style="height:100%;border-radius:10px;background:${s.color};width:${s.pct}%"></div>
      </div>
      <div style="font-size:12px;font-weight:700;color:${s.color};width:30px">${s.pct}%</div>
    </div>`).join("");
}