/* ══════════════════════════════════════
   COMMON.JS — Shared state, utilities, auth
══════════════════════════════════════ */

const API_BASE = "http://localhost:3001";

/* ─── SHARED STATE ─── */
window.habits = [];
window.currentPage = "dashboard";
window.currentUser = null;
window.selectedDays = [];
window.selEmoji = "🧘‍♂️";
window.selColor = "#7c3aed";
window.editId = null;
window.nextId = 7;

window.emojis = ["🧘‍♂️","📚","💪","🏃","💧","🧠","🌙","🥗","🎨","🎵","💻","🌿","✍️","🚿","🎯","🔥","⭐","🏃‍♀️"];
window.colors = ["#7c3aed","#3b82f6","#22c55e","#f59e0b","#ec4899","#06b6d4","#ef4444","#f97316"];

window.settingsToggles = [
  {label:"Daily reminder notifications",key:"notif",on:true},
  {label:"Streak milestone alerts",key:"streak",on:true},
  {label:"Weekly AI insights email",key:"email",on:false},
  {label:"Achievement unlocked alerts",key:"ach",on:true},
  {label:"Motivational quotes",key:"quotes",on:true},
];

window.achievements = [
  {icon:"🔥",name:"Week Warrior",desc:"Complete all habits for 7 days straight",tier:"gold",xp:150,requiredStreak:7,unlocked:false,progress:0},
  {icon:"📚",name:"Bookworm",desc:"Read for 30 days total",tier:"silver",xp:120,requiredStreak:30,unlocked:false,progress:0},
  {icon:"💧",name:"Hydration Hero",desc:"Hit water goal 14 days in a row",tier:"gold",xp:150,requiredStreak:14,unlocked:false,progress:0},
  {icon:"🌅",name:"Early Bird",desc:"Complete a habit before 7 AM, 10 times",tier:"silver",xp:120,requiredStreak:10,unlocked:false,progress:0},
  {icon:"⚡",name:"Speed Runner",desc:"Complete all habits before noon",tier:"bronze",xp:80,requiredStreak:5,unlocked:false,progress:0},
  {icon:"🎯",name:"Perfect Week",desc:"100% completion rate for a full week",tier:"gold",xp:180,requiredStreak:7,unlocked:false,progress:0},
  {icon:"💪",name:"Iron Will",desc:"30-day workout streak",tier:"silver",xp:140,requiredStreak:30,unlocked:false,progress:0},
  {icon:"🌟",name:"Habit Master",desc:"Maintain 5 habits for 30 days",tier:"gold",xp:200,requiredStreak:30,unlocked:false,progress:0},
  {icon:"🏔️",name:"Mountain Mover",desc:"Complete 500 total habits",tier:"gold",xp:250,requiredStreak:50,unlocked:false,progress:0},
  {icon:"🎖️",name:"Century Club",desc:"100-day streak on any habit",tier:"gold",xp:300,requiredStreak:100,unlocked:false,progress:0},
  {icon:"🌈",name:"Well Rounded",desc:"Complete habits in all 5 categories",tier:"silver",xp:130,requiredStreak:15,unlocked:false,progress:0},
  {icon:"🦁",name:"Consistency King",desc:"90% rate for 60 days",tier:"gold",xp:220,requiredStreak:60,unlocked:false,progress:0},
  {icon:"🚀",name:"Rocket Start",desc:"Complete all habits for first 7 days",tier:"bronze",xp:90,requiredStreak:7,unlocked:false,progress:0},
  {icon:"🧘",name:"Inner Peace",desc:"50 meditation sessions",tier:"silver",xp:140,requiredStreak:50,unlocked:false,progress:0},
  {icon:"💎",name:"Diamond Habit",desc:"365 day streak",tier:"gold",xp:500,requiredStreak:365,unlocked:false,progress:0}
];

/* ══════════════════════════════════════
   UTILITY FUNCTIONS
══════════════════════════════════════ */
function easeOut(t){ return 1 - Math.pow(1-t, 3); }

function animNum(id, tgt){
  const el = document.getElementById(id);
  if(!el) return;
  const start = parseInt(el.textContent) || 0;
  const t0 = performance.now();
  const step = now => {
    const p = Math.min((now - t0) / 700, 1);
    el.textContent = Math.round(start + (tgt - start) * easeOut(p));
    if(p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function showToast(msg){
  const t = document.getElementById("toast");
  if(!t) return;
  document.getElementById("toast-msg").textContent = msg;
  t.classList.add("show");
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove("show"), 3000);
}

function launchConfetti(){
  const cols = ["#7c3aed","#3b82f6","#22c55e","#f59e0b","#ec4899","#06b6d4"];
  for(let i = 0; i < 28; i++){
    setTimeout(() => {
      const el = document.createElement("div");
      el.className = "confetti";
      el.style.cssText = `left:${Math.random()*100}vw;top:-10px;background:${cols[~~(Math.random()*cols.length)]};animation-duration:${1+Math.random()}s;animation-delay:${Math.random()*.2}s;transform:rotate(${Math.random()*360}deg)`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 2000);
    }, i * 25);
  }
}

function createParticles(){
  const cols = ["rgba(124,58,237,.8)","rgba(59,130,246,.8)","rgba(6,182,212,.8)","rgba(34,197,94,.8)"];
  for(let i = 0; i < 10; i++){
    const el = document.createElement("div");
    el.className = "particle";
    const s = 3 + Math.random() * 5;
    el.style.cssText = `width:${s}px;height:${s}px;left:${Math.random()*100}vw;background:${cols[~~(Math.random()*cols.length)]};animation-duration:${8+Math.random()*12}s;animation-delay:${Math.random()*8}s`;
    document.body.appendChild(el);
  }
}

function showUnlock(name){
  const div = document.createElement("div");
  div.className = "unlock-pop";
  div.textContent = "🏆 Achievement Unlocked: " + name;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}

function buildHeatmap(id, logs){
  const container = document.getElementById(id);
  if(!container) return;
  const map = {};
  if(!Array.isArray(logs)) logs = [];
  logs.forEach(l => {
    const d = new Date(l.date);
    const key = d.toISOString().split("T")[0];
    map[key] = (map[key] || 0) + 1;
  });
  let html = '<div class="heatmap-grid"><div class="hm-labels">';
  ["","M","","W","","F",""].forEach(d => { html += `<div class="hm-dl">${d}</div>`; });
  html += "</div><div class=\"hm-weeks\">";
  for(let w = 0; w < 26; w++){
    html += "<div class=\"hm-week\">";
    for(let d = 0; d < 7; d++){
      const date = new Date();
      date.setDate(date.getDate() - (w * 7 + d));
      const key = date.toISOString().split("T")[0];
      const val = map[key] || 0;
      const level = val >= 4 ? 4 : val >= 3 ? 3 : val >= 2 ? 2 : val >= 1 ? 1 : 0;
      html += `<div class="hm-cell" data-l="${level}"></div>`;
    }
    html += "</div>";
  }
  html += "</div></div>";
  container.innerHTML = html;
}

function renderWeekDots(id, streakCount){
  const el = document.getElementById(id);
  if(!el) return;
  const days = ["M","T","W","T","F","S","S"];
  el.innerHTML = days.map((d, i) => `<div class="wdot${i < 5 ? " on" : ""}">${d}</div>`).join("");
}

/* ══════════════════════════════════════
   HABIT DATA LOADING
══════════════════════════════════════ */
async function loadHabitsFromDB(){
  try{
    const res = await fetch(`${API_BASE}/api/habits`);
    const data = await res.json();
    if(data.length > 0){
      window.habits = data.map(h => ({
        id: h.id,
        name: h.name,
        emoji: h.emoji,
        color: h.color,
        done: h.done === 1,
        streak: h.streak,
        time: h.time,
        cat: h.category
      }));
    }
    if(typeof renderDashboard === "function") renderDashboard();
    if(typeof renderHabitsPage === "function") renderHabitsPage();
  } catch(err){
    console.error("DB Load Error:", err);
  }
}

async function toggleHabit(id){
  const h = window.habits.find(x => x.id === id);
  if(!h) return;
  h.done = !h.done;
  h.streak = h.done ? h.streak + 1 : 0;
  await fetch(`${API_BASE}/api/habits/${id}`, {
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({done: h.done ? 1 : 0, streak: h.streak})
  });
  if(typeof renderDashboard === "function") renderDashboard();
  if(typeof renderHabitsPage === "function") renderHabitsPage();
}

async function deleteHabit(id){
  await fetch(`${API_BASE}/api/habits/${id}`, {method: "DELETE"});
  await loadHabitsFromDB();
  if(typeof renderSchedule === "function") renderSchedule();
  showToast("🗑️ Habit removed");
}

/* ══════════════════════════════════════
   MODAL
══════════════════════════════════════ */
function openModal(){
  window.editId = null;
  document.getElementById("modal-title-text").textContent = "Add New Habit";
  document.getElementById("modal-sub-text").textContent = "Build a new routine, one day at a time.";
  document.getElementById("modal-btn-text").textContent = "Add Habit";
  document.getElementById("h-name").value = "";
  document.getElementById("h-time").value = "";
  window.selEmoji = window.emojis[0];
  window.selColor = window.colors[0];
  setupEmojiPicker();
  setupColorPicker();
  setupDayPicker();
  document.getElementById("overlay").classList.add("open");
  setTimeout(() => document.getElementById("h-name").focus(), 300);
}

function closeModal(){
  document.getElementById("overlay").classList.remove("open");
}

function closeModalOut(e){
  if(e.target === document.getElementById("overlay")) closeModal();
}

function editHabit(id){
  const h = window.habits.find(x => x.id === id);
  if(!h) return;
  window.editId = id;
  document.getElementById("modal-title-text").textContent = "Edit Habit";
  document.getElementById("modal-sub-text").textContent = "Update your habit details.";
  document.getElementById("modal-btn-text").textContent = "Save Changes";
  document.getElementById("h-name").value = h.name;
  document.getElementById("h-cat").value = h.cat;
  document.getElementById("h-time").value = h.time;
  window.selEmoji = h.emoji;
  window.selColor = h.color;
  setupEmojiPicker();
  setupColorPicker();
  document.getElementById("overlay").classList.add("open");
}

async function submitHabit(){
  const name = document.getElementById("h-name").value.trim();
  if(!name){ showToast("⚠️ Enter habit name"); return; }
  if(window.selectedDays.length === 0){ showToast("⚠️ Select at least one day"); return; }

  const habitData = {
    name,
    emoji: window.selEmoji,
    color: window.selColor,
    done: 0,
    streak: 0,
    time: document.getElementById("h-time").value || "Any time",
    category: document.getElementById("h-cat").value
  };

  try{
    const res = await fetch(`${API_BASE}/api/habits`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(habitData)
    });
    if(!res.ok) throw new Error("Habit save failed");
    const newHabit = await res.json();

    for(const day of window.selectedDays){
      await fetch(`${API_BASE}/api/schedule`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({habit_id: newHabit.id, weekday: day})
      });
    }

    closeModal();
    await loadHabitsFromDB();
    if(typeof renderSchedule === "function") renderSchedule();
    showToast("✅ Habit added + scheduled");
  } catch(err){
    console.error(err);
    showToast("❌ Add failed");
  }
}

function setupEmojiPicker(){
  const r = document.getElementById("ep-row");
  if(!r) return;
  r.innerHTML = window.emojis.map(e => `<div class="ep${e === window.selEmoji ? " sel" : ""}" data-e="${e}">${e}</div>`).join("");
  r.querySelectorAll(".ep").forEach(el => el.addEventListener("click", () => {
    r.querySelectorAll(".ep").forEach(x => x.classList.remove("sel"));
    el.classList.add("sel");
    window.selEmoji = el.dataset.e;
  }));
}

function setupColorPicker(){
  const r = document.getElementById("cp-row");
  if(!r) return;
  r.innerHTML = window.colors.map(c => `<div class="cp${c === window.selColor ? " sel" : ""}" style="background:${c}" data-c="${c}"></div>`).join("");
  r.querySelectorAll(".cp").forEach(el => el.addEventListener("click", () => {
    r.querySelectorAll(".cp").forEach(x => x.classList.remove("sel"));
    el.classList.add("sel");
    window.selColor = el.dataset.c;
  }));
}

function setupDayPicker(){
  const buttons = document.querySelectorAll(".day-btn");
  window.selectedDays = [];
  buttons.forEach(btn => {
    btn.classList.remove("active");
    btn.onclick = () => {
      const day = parseInt(btn.dataset.day);
      if(window.selectedDays.includes(day)){
        window.selectedDays = window.selectedDays.filter(d => d !== day);
        btn.classList.remove("active");
      } else {
        window.selectedDays.push(day);
        btn.classList.add("active");
      }
    };
  });
}

/* ══════════════════════════════════════
   ROUTER
══════════════════════════════════════ */
const pageTitles = {
  dashboard: "AI Habit Intelligence Dashboard",
  habits: "My Habits",
  analytics: "Analytics & Insights",
  insights: "AI Insights",
  achievements: "Achievements",
  schedule: "Weekly Schedule",
  calendar: "Monthly Calendar",
  settings: "Settings",
  features: "Smart Features"
};

function goTo(page){
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  const target = document.getElementById("page-" + page);
  if(!target){ console.error("Page not found:", page); return; }
  target.classList.add("active");
  document.querySelectorAll(".nav-item").forEach(n => {
    n.classList.toggle("active", n.dataset.page === page);
  });
  document.getElementById("pageTitle").textContent = pageTitles[page] || page;
  window.currentPage = page;

  if(page === "dashboard")       renderDashboard();
  else if(page === "habits")     renderHabitsPage();
  else if(page === "analytics")  renderAnalytics();
  else if(page === "insights")   renderInsightsPage();
  else if(page === "achievements") renderAchievements();
  else if(page === "schedule")   setTimeout(() => renderSchedule(), 50);
  else if(page === "calendar")   renderCalendar();
  else if(page === "settings")   renderSettings();
  else if(page === "features")   initFeatures();

  syncUserUI();
}

/* ══════════════════════════════════════
   SETTINGS
══════════════════════════════════════ */
function renderSettings(){
  document.getElementById("settings-toggles").innerHTML = window.settingsToggles.map(t => `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
      <div><div style="font-size:14px;font-weight:600">${t.label}</div></div>
      <div style="width:44px;height:24px;border-radius:12px;background:${t.on ? "var(--purple)" : "rgba(255,255,255,.1)"};cursor:pointer;position:relative;transition:background .3s;flex-shrink:0"
        onclick="toggleSetting('${t.key}',this)">
        <div style="width:20px;height:20px;background:white;border-radius:50%;position:absolute;top:2px;left:${t.on ? "22px" : "2px"};transition:left .3s"></div>
      </div>
    </div>`).join("");
}

function toggleSetting(key, el){
  const t = window.settingsToggles.find(x => x.key === key);
  if(!t) return;
  t.on = !t.on;
  el.style.background = t.on ? "var(--purple)" : "rgba(255,255,255,.1)";
  el.querySelector("div").style.left = t.on ? "22px" : "2px";
  showToast(t.on ? `🔔 ${t.label} enabled` : `🔕 ${t.label} disabled`);
}

async function loadSettings(){
  try{
    const res = await fetch(`${API_BASE}/api/habits/settings`);
    const data = await res.json();
    const nameEl = document.getElementById("set-name");
    const goalEl = document.getElementById("set-goal");
    if(nameEl) nameEl.value = data.name;
    if(goalEl) goalEl.value = data.dailyGoal;

    /* Sync name everywhere dynamically */
    const uname = document.querySelector(".user-name");
    if(uname) uname.textContent = data.name;

    /* Sync avatar initials */
    const avatar = document.querySelector(".user-avatar");
    if(avatar){
      const parts = (data.name || "U").split(" ");
      avatar.textContent = parts.map(p=>p[0]).join("").toUpperCase().slice(0,2);
    }

    /* Update greeting with settings name */
    if(data.name) updateGreeting(data.name);

    /* Store in currentUser so all pages see it */
    if(!window.currentUser) window.currentUser = {};
    window.currentUser.name = data.name;
  } catch(err){
    console.error("Settings load error:", err);
  }
}

async function saveSettings(){
  const name = document.getElementById("set-name").value;
  const goal = document.getElementById("set-goal").value;
  try{
    await fetch(`${API_BASE}/api/habits/settings`, {
      method: "PUT",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({name, dailyGoal: goal, notif: 1, streak: 1, email: 0, ach: 1, quotes: 1})
    });
    const uname = document.querySelector(".user-name");
    if(uname) uname.textContent = name;
    const avatar = document.querySelector(".user-avatar");
    if(avatar){
      const parts = (name || "U").split(" ");
      avatar.textContent = parts.map(p=>p[0]).join("").toUpperCase().slice(0,2);
    }
    if(window.currentUser) window.currentUser.name = name;
    updateGreeting(name);
    showToast("✅ Settings saved");
  } catch(err){
    showToast("❌ Save failed");
  }
}

function resetProgress(){
  if(confirm("Reset all habit streaks? This cannot be undone.")){
    window.habits.forEach(h => { h.done = false; h.streak = 0; });
    showToast("🔄 Progress reset");
    if(window.currentPage === "habits") renderHabitsPage();
    if(window.currentPage === "dashboard") renderDashboard();
  }
}

/* ══════════════════════════════════════
   AUTH
══════════════════════════════════════ */
function createAuthParticles(){
  const wrap = document.getElementById("auth-particles");
  if(!wrap) return;
  const cols = ["rgba(124,58,237,.7)","rgba(59,130,246,.7)","rgba(6,182,212,.7)","rgba(34,197,94,.5)","rgba(236,72,153,.6)"];
  for(let i = 0; i < 22; i++){
    const el = document.createElement("div");
    const s = 2 + Math.random() * 6;
    el.style.cssText = `position:absolute;width:${s}px;height:${s}px;border-radius:50%;background:${cols[~~(Math.random()*cols.length)]};left:${Math.random()*100}%;animation:floatup ${7+Math.random()*10}s linear ${Math.random()*8}s infinite;opacity:0;`;
    wrap.appendChild(el);
  }
  for(let i = 0; i < 4; i++){
    const orb = document.createElement("div");
    const size = 80 + Math.random() * 120;
    orb.style.cssText = `position:absolute;width:${size}px;height:${size}px;border-radius:50%;background:radial-gradient(circle,${cols[i]},transparent 70%);left:${Math.random()*90}%;top:${Math.random()*90}%;animation:floatCard ${6+Math.random()*8}s ease-in-out ${Math.random()*4}s infinite;pointer-events:none;opacity:.4;`;
    wrap.appendChild(orb);
  }
}

function switchAuthTab(tab){
  document.getElementById("tab-login").classList.toggle("active", tab === "login");
  document.getElementById("tab-register").classList.toggle("active", tab === "register");
  document.getElementById("form-login").classList.toggle("active", tab === "login");
  document.getElementById("form-register").classList.toggle("active", tab === "register");
  document.getElementById("login-error").classList.remove("show");
  document.getElementById("reg-error").classList.remove("show");
}

function checkStrength(val){
  const bar = document.getElementById("strength-bar");
  const lbl = document.getElementById("strength-label");
  if(!bar || !lbl) return;
  let score = 0;
  if(val.length >= 8) score++;
  if(/[A-Z]/.test(val)) score++;
  if(/[0-9]/.test(val)) score++;
  if(/[^A-Za-z0-9]/.test(val)) score++;
  const colors = ["#ef4444","#f59e0b","#3b82f6","#22c55e"];
  const labels = ["Weak","Fair","Good","Strong"];
  bar.style.width = (score / 4 * 100) + "%";
  bar.style.background = colors[score - 1] || "rgba(255,255,255,.1)";
  lbl.textContent = score > 0 ? (labels[score - 1] + " password") : "Password strength";
}

function doLogin(){
  const email = document.getElementById("login-email").value.trim();
  const pass = document.getElementById("login-pass").value;
  if(!email || !pass){ showAuthError("login", "Please enter email and password."); return; }
  const users = JSON.parse(localStorage.getItem("hab_users") || "[]");
  const user = users.find(u => u.email === email && u.pass === pass);
  if(!user){
    if(email === "demo@habitai.com" && pass === "demo123"){
      loginSuccess({name: "Demo User", email});
    } else {
      showAuthError("login", "Invalid email or password.");
    }
    return;
  }
  loginSuccess(user);
}

function doRegister(){
  const name = document.getElementById("reg-name").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const pass = document.getElementById("reg-pass").value;
  if(!name || !email || !pass){ showAuthError("reg", "Please fill all fields."); return; }
  if(pass.length < 6){ showAuthError("reg", "Password must be at least 6 characters."); return; }
  const users = JSON.parse(localStorage.getItem("hab_users") || "[]");
  if(users.find(u => u.email === email)){ showAuthError("reg", "Email already registered."); return; }
  users.push({name, email, pass});
  localStorage.setItem("hab_users", JSON.stringify(users));
  loginSuccess({name, email});
}

function doSocialLogin(provider){
  loginSuccess({name: provider + " User", email: provider.toLowerCase() + "@social.com"});
}

function showAuthError(type, msg){
  const id = type === "login" ? "login-error" : "reg-error";
  const el = document.getElementById(id);
  if(!el) return;
  el.textContent = msg;
  el.classList.remove("show");
  void el.offsetWidth;
  el.classList.add("show");
}

function loginSuccess(user){
  window.currentUser = user;
  localStorage.setItem("hab_user", JSON.stringify(user));
  const screen = document.getElementById("auth-screen");
  screen.style.transition = "opacity .5s ease, transform .5s ease";
  screen.style.opacity = "0";
  screen.style.transform = "scale(1.04)";
  setTimeout(() => {
    screen.classList.add("hidden");
    updateGreeting(user.name);
    launchConfetti();
    showToast("🎉 Welcome back, " + user.name.split(" ")[0] + "!");
  }, 500);
}

function updateGreeting(name){
  const hour = new Date().getHours();
  let greet, emoji, sub;
  if(hour >= 5 && hour < 12){
    greet = "Good morning"; emoji = "🌅"; sub = "Rise and shine! Your habits await.";
  } else if(hour >= 12 && hour < 17){
    greet = "Good afternoon"; emoji = "☀️"; sub = "Keep the momentum going!";
  } else if(hour >= 17 && hour < 21){
    greet = "Good evening"; emoji = "🌇"; sub = "Finishing strong — you've got this!";
  } else {
    greet = "Good night"; emoji = "🌙"; sub = "Almost there. End the day strong!";
  }
  const firstName = name.split(" ")[0];
  const msgEl = document.getElementById("greeting-msg");
  const subEl = document.getElementById("greeting-sub");
  const emoEl = document.getElementById("greeting-emoji");
  if(msgEl) msgEl.textContent = `${greet}, ${firstName}! 👋`;
  if(subEl) subEl.textContent = sub;
  if(emoEl) emoEl.textContent = emoji;
  const uname = document.querySelector(".user-name");
  if(uname) uname.textContent = name;
}

function doLogout(){
  if(!confirm("Sign out?")) return;
  localStorage.removeItem("hab_user");
  window.currentUser = null;
  const screen = document.getElementById("auth-screen");
  screen.style.opacity = "0";
  screen.style.transform = "scale(1.04)";
  screen.classList.remove("hidden");
  void screen.offsetWidth;
  screen.style.transition = "opacity .4s ease, transform .4s ease";
  screen.style.opacity = "1";
  screen.style.transform = "scale(1)";
  switchAuthTab("login");
  document.getElementById("login-email").value = "";
  document.getElementById("login-pass").value = "";
}

/* ══════════════════════════════════════
   XP & LEVEL
══════════════════════════════════════ */
async function loadXP(){
  try{
    const res = await fetch(`${API_BASE}/api/xp`);
    if(!res.ok) throw new Error("XP API failed");
    const data = await res.json();
    const setText = (id, value) => { const el = document.getElementById(id); if(el) el.textContent = value; };
    setText("sideLevel", data.level || 1);
    document.querySelectorAll("#dash-level").forEach(el => { el.textContent = data.level || 1; });
    setText("s-xp", data.xp || 0);
    setText("dash-xp-disp", (data.xp || 0) + " XP");
    setText("dash-xp-text", (data.xp || 0) + " XP");
    const remaining = document.getElementById("dash-xp-remaining");
    if(remaining) remaining.textContent = (data.remainingXP || 0) + " XP to Level " + ((data.level || 1) + 1);
    const fill = document.getElementById("dash-xpfill");
    if(fill){ const pct = ((data.xp || 0) % 500) / 500 * 100; fill.style.width = pct + "%"; }
  } catch(err){
    console.error("XP Load Error:", err);
  }
}

async function loadDashboardXP(){
  try{
    const res  = await fetch(`${API_BASE}/api/xp`);
    const data = await res.json();
    const xp    = data.xp    || 0;
    const level = data.level || 1;
    const nextLevelXP   = level * 500;
    const remainingXP   = nextLevelXP - xp;

    const levelTitles = {
      1:"Beginner", 2:"Apprentice", 3:"Consistent", 4:"Focused",
      5:"Dedicated", 6:"Expert", 7:"Master", 8:"Champion",
      9:"Legend", 10:"Grandmaster"
    };

    const set = (id, v) => { const el = document.getElementById(id); if(el) el.textContent = v; };
    set("s-xp",        xp);
    set("dash-xp-disp", xp + " XP");
    set("dash-xp-text", xp + " XP");
    set("dash-level",   level);
    set("dash-level-name", levelTitles[level] || "Legend");
    set("sideLevel",    level);

    /* Update "X XP to Level Y" text */
    const remEl2 = document.getElementById("dash-xp-remaining");
    if(remEl2) remEl2.textContent = remainingXP + " XP to Level " + (level + 1);
    /* Also update the static text in dashboard level card */
    document.querySelectorAll("[id='dash-level']").forEach(el => el.textContent = level);

    const pct = (xp % 500) / 500 * 100;
    const fill = document.getElementById("dash-xpfill");
    if(fill) fill.style.width = pct + "%";

    /* Update "of XXXX XP" text */
    document.querySelectorAll(".xp-of-text").forEach(el => el.textContent = "of " + nextLevelXP + " XP");
  } catch(err){
    console.error("XP Load Error:", err);
  }
}

async function loadDashboardStreak(){
  try{
    const res = await fetch(`${API_BASE}/api/habits/analytics/streak`);
    if(!res.ok) throw new Error("Streak API failed");
    const data = await res.json();
    const cur = document.getElementById("dash-streak");
    if(cur) cur.textContent = data.current ?? 0;
    const best = document.getElementById("dash-best");
    if(best) best.textContent = data.best ?? 0;
    const stat = document.getElementById("s-streak");
    if(stat) stat.textContent = data.current ?? 0;
    renderWeekDots("dash-wdots", data.current ?? 0);
  } catch(err){
    console.error("Streak Load Error:", err);
  }
}

/* ══════════════════════════════════════
   KEYBOARD SHORTCUTS
══════════════════════════════════════ */
document.addEventListener("keydown", e => {
  if(e.key === "Escape") closeModal();
  if(e.ctrlKey && e.key === "n"){ e.preventDefault(); openModal(); }
  if(e.ctrlKey && e.key === "k"){ e.preventDefault(); showToast("🔍 Search coming soon!"); }
  const keys = {"1":"dashboard","2":"habits","3":"analytics","4":"insights","5":"achievements","6":"schedule","7":"settings","8":"features"};
  if(e.altKey && keys[e.key]){ e.preventDefault(); goTo(keys[e.key]); }
});

/* ══════════════════════════════════════
   APPLE GLASS RIPPLE — tracks exact touch/click
   position so ripple bursts from finger point
══════════════════════════════════════ */
document.addEventListener("pointerdown", e => {
  const btn = e.target.closest(".btn, .icon-btn, .nav-item, .chart-tab, .auth-btn, .auth-social-btn");
  if(!btn) return;
  const rect = btn.getBoundingClientRect();
  const rx   = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1) + "%";
  const ry   = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1) + "%";
  btn.style.setProperty("--rx", rx);
  btn.style.setProperty("--ry", ry);
}, {passive:true});

/* ══════════════════════════════════════
   DYNAMIC USER DATA — ensure all user-
   specific elements update on page load
   and whenever currentUser changes
══════════════════════════════════════ */
function syncUserUI(){
  const user = window.currentUser;
  if(!user) return;

  /* Sidebar name */
  const sideNameEl = document.querySelector(".user-name");
  if(sideNameEl) sideNameEl.textContent = user.name || "User";

  /* Sidebar avatar initials */
  const avatarEl = document.querySelector(".user-avatar");
  if(avatarEl){
    const parts = (user.name || "U").split(" ");
    avatarEl.textContent = parts.map(p => p[0]).join("").toUpperCase().slice(0,2);
  }

  /* Update greeting with real name */
  updateGreeting(user.name || "User");
}