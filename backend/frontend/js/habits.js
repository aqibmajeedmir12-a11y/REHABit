/* ══════════════════════════════════════
   HABITS.JS — Habits page logic
══════════════════════════════════════ */

function renderHabitsPage(){
  const filterEl = document.getElementById("habit-filter");
  const filter = filterEl ? filterEl.value : "all";
  const filtered = filter === "all" ? window.habits : window.habits.filter(h => h.cat === filter);

  const totalEl = document.getElementById("hp-total");
  const streaksEl = document.getElementById("hp-streaks");
  if(totalEl) totalEl.textContent = window.habits.length;
  if(streaksEl) streaksEl.textContent = window.habits.filter(h => h.streak > 0).length;

  const list = document.getElementById("habits-list");
  if(!list) return;
  list.innerHTML = "";

  filtered.forEach(h => {
    const el = document.createElement("div");
    el.className = "manage-habit";
    el.innerHTML = `
      <div style="font-size:28px;width:44px;text-align:center">${h.emoji}</div>
      <div class="mh-info">
        <div class="mh-name">${h.name}</div>
        <div class="mh-tags">
          <span class="tag" style="background:${h.color}22;color:${h.color};border:1px solid ${h.color}44">${h.cat}</span>
          <span class="tag" style="background:rgba(245,158,11,.15);color:var(--amber)">🔥 ${h.streak} day streak</span>
          <span class="tag" style="background:rgba(255,255,255,.05);color:var(--muted);border:1px solid var(--border)">⏰ ${h.time}</span>
          ${h.done ? `<span class="tag" style="background:rgba(34,197,94,.15);color:var(--green);border:1px solid rgba(34,197,94,.3)">✓ Done today</span>` : ""}
        </div>
      </div>
      <div class="mh-actions">
        <div class="mh-btn" title="Toggle complete" onclick="(async()=>{await toggleHabit(${h.id});await loadHabitsFromDB();renderHabitsPage()})()">
          ${h.done ? '<i class="fa fa-rotate-left"></i>' : '<i class="fa fa-check"></i>'}
        </div>
        <div class="mh-btn" title="Edit" onclick="editHabit(${h.id})"><i class="fa fa-pen"></i></div>
        <div class="mh-btn del" title="Delete" onclick="deleteHabit(${h.id})"><i class="fa fa-trash"></i></div>
      </div>`;
    list.appendChild(el);
  });

  if(filtered.length === 0){
    list.innerHTML = `<div style="text-align:center;padding:40px;color:var(--muted)">No habits in this category. <span style="color:var(--purple-light);cursor:pointer" onclick="openModal()">Add one!</span></div>`;
  }
}