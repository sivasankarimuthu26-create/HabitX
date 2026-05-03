let habits = JSON.parse(localStorage.getItem('habits')) || [];
let chart = null;
let reminderInterval = null;

// ─── Particles ───────────────────────────────────────
function createParticles() {
  const container = document.getElementById('particles');
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDuration = (Math.random() * 15 + 10) + 's';
    p.style.animationDelay = (Math.random() * 15) + 's';
    p.style.width = p.style.height = (Math.random() * 3 + 1) + 'px';
    p.style.opacity = Math.random() * 0.5 + 0.1;
    container.appendChild(p);
  }
}

// ─── Theme ───────────────────────────────────────────
function toggleTheme() {
  document.body.classList.toggle('light');
  document.getElementById('themeBtn').textContent =
    document.body.classList.contains('light') ? '🌙' : '☀️';
  localStorage.setItem('theme', document.body.classList.contains('light') ? 'light' : 'dark');
}

function loadTheme() {
  if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light');
    document.getElementById('themeBtn').textContent = '🌙';
  }
}

// ─── Habits ──────────────────────────────────────────
function saveHabits() {
  localStorage.setItem('habits', JSON.stringify(habits));
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
}

function addHabit() {
  const input = document.getElementById('habitInput');
  const name = input.value.trim();
  if (!name) return;
  habits.push({ id: Date.now(), name, streak: 0, lastChecked: null, history: [] });
  saveHabits();
  input.value = '';
  renderHabits();
  renderChart();
  updateStats();
}

function checkIn(id) {
  const today = getTodayKey();
  const habit = habits.find(h => h.id === id);
  if (!habit || habit.lastChecked === today) return;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yKey = yesterday.toISOString().slice(0, 10);
  habit.streak = habit.lastChecked === yKey ? habit.streak + 1 : 1;
  habit.lastChecked = today;
  if (!habit.history) habit.history = [];
  habit.history.push(today);
  saveHabits();
  renderHabits();
  renderChart();
  updateStats();
}

function deleteHabit(id) {
  habits = habits.filter(h => h.id !== id);
  saveHabits();
  renderHabits();
  renderChart();
  updateStats();
}

function updateStats() {
  const today = getTodayKey();
  const total = habits.length;
  const completed = habits.filter(h => h.lastChecked === today).length;
  const best = habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
  document.getElementById('totalHabits').textContent = total;
  document.getElementById('completedToday').textContent = completed;
  document.getElementById('bestStreak').textContent = best;
  document.getElementById('successRate').textContent = rate + '%';
}

function renderHabits() {
  const list = document.getElementById('habitList');
  const today = getTodayKey();
  if (habits.length === 0) {
    list.innerHTML = `<div class="empty-state">⚡ No habits yet.<br>Add your first habit to begin your journey!</div>`;
    return;
  }
  list.innerHTML = habits.map(habit => {
    const doneToday = habit.lastChecked === today;
    const isHot = habit.streak >= 3;
    const progress = Math.min((habit.streak / 30) * 100, 100);
    return `
      <div class="habit-card ${doneToday ? 'done-card' : ''}">
        <div class="habit-top">
          <div>
            <div class="habit-name">${habit.name}</div>
            <div class="habit-status">${doneToday ? '✅ Completed today' : '⏳ Pending today'}</div>
          </div>
          <div class="habit-right">
            <span class="streak-badge ${isHot ? 'hot' : ''}">
              ${isHot ? '🔥' : '⚡'} ${habit.streak}
            </span>
            <button class="done-btn" onclick="checkIn(${habit.id})" ${doneToday ? 'disabled' : ''}>
              ${doneToday ? '✓ DONE' : 'DONE'}
            </button>
            <button class="delete-btn" onclick="deleteHabit(${habit.id})">×</button>
          </div>
        </div>
        <div class="progress-line">
          <div class="progress-fill" style="width:${progress}%"></div>
        </div>
      </div>`;
  }).join('');
}

// ─── Chart ───────────────────────────────────────────
function renderChart() {
  const days = getLast7Days();
  const labels = days.map(d => new Date(d).toLocaleDateString('en-US', { weekday: 'short' }));
  const data = days.map(day => habits.filter(h => h.history && h.history.includes(day)).length);
  const ctx = document.getElementById('progressChart').getContext('2d');
  if (chart) chart.destroy();

  const isDark = !document.body.classList.contains('light');
  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: data.map((v, i) =>
          i === data.length - 1
            ? 'rgba(0,212,255,0.8)'
            : 'rgba(123,47,255,0.5)'
        ),
        borderColor: data.map((v, i) =>
          i === data.length - 1 ? '#00d4ff' : '#7b2fff'
        ),
        borderWidth: 1,
        borderRadius: 8,
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            color: isDark ? 'rgba(180,200,255,0.6)' : 'rgba(60,60,120,0.6)',
            font: { family: 'Rajdhani', size: 12 }
          },
          grid: { color: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)' }
        },
        x: {
          ticks: {
            color: isDark ? 'rgba(180,200,255,0.6)' : 'rgba(60,60,120,0.6)',
            font: { family: 'Rajdhani', size: 12 }
          },
          grid: { display: false }
        }
      }
    }
  });
}

// ─── Reminder ────────────────────────────────────────
function setReminder() {
  const timeVal = document.getElementById('reminderTime').value;
  localStorage.setItem('reminderTime', timeVal);
  document.getElementById('reminderStatus').textContent = `✅ Reminder activated for ${timeVal} daily!`;

  // Call Android native alarm
  const [hour, minute] = timeVal.split(':').map(Number);
  if (window.AndroidBridge) {
    window.AndroidBridge.setReminder(hour, minute);
  }

  scheduleReminder(timeVal);
}

function scheduleReminder(timeVal) {
  if (reminderInterval) clearInterval(reminderInterval);
  reminderInterval = setInterval(() => {
    const now = new Date();
    const current = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    if (current === timeVal) showReminderAlert();
  }, 30000);
}

function showReminderAlert() {
  const alert = document.createElement('div');
  alert.style.cssText = `
    position:fixed;top:20px;left:50%;transform:translateX(-50%);
    background:linear-gradient(135deg,#00d4ff,#7b2fff);
    color:#fff;padding:16px 24px;border-radius:14px;
    font-family:'Orbitron',monospace;font-size:13px;font-weight:700;
    z-index:9999;box-shadow:0 0 40px rgba(0,212,255,0.5);
    text-align:center;min-width:280px;letter-spacing:1px;cursor:pointer;
  `;
  alert.innerHTML = `⏰ HABIT CHECK-IN TIME!<br><span style="font-size:11px;opacity:0.8;font-family:Rajdhani">Complete your daily habits now 💪</span>`;
  alert.onclick = () => document.body.removeChild(alert);
  document.body.appendChild(alert);
  setTimeout(() => { if (alert.parentNode) document.body.removeChild(alert); }, 8000);
}

// ─── Chatbot ─────────────────────────────────────────
const botReplies = {
  "hello": "Hello, champion! 🚀 Ready to level up your habits today?",
  "hi": "Hey there! Your consistency is building your future. How can I help?",
  "how to build habits": "The formula: Start tiny → Do it daily → Stack habits together → Track progress. 21 days to form, 90 days to lock in! 🎯",
  "i feel lazy": "Laziness is just resistance. Do just 2 minutes of your habit — starting is the hardest part. Action beats motivation! 💥",
  "streak": "Streaks create momentum! Every day you complete a habit, you vote for who you want to become. Don't break the chain! 🔥",
  "motivation": "Motivation is unreliable. Build SYSTEMS instead. Your future self is watching every choice you make today! ⭐",
  "tips": "Top 5 tips: 1) Start tiny 2) Same time daily 3) Never miss twice 4) Track everything 5) Celebrate wins! 🏆",
  "best time": "Morning habits win! Your willpower is highest after waking. Own your morning, own your day! ☀️",
  "how many habits": "Max 3 habits to start! Master them before adding more. Depth beats breadth every time. 🎯",
  "i give up": "Don't stop! Missing one day is an accident. Missing two is a choice. Get back NOW — your streak can restart! 💙",
  "progress": "Progress compounds like interest! 1% better every day = 37x better in a year. Keep going! 📈",
};

function getBotReply(msg) {
  const lower = msg.toLowerCase();
  for (const key in botReplies) {
    if (lower.includes(key)) return botReplies[key];
  }
  const habit = habits.find(h => lower.includes(h.name.toLowerCase()));
  if (habit) {
    const done = habit.lastChecked === getTodayKey();
    return `"${habit.name}" — ${habit.streak} day streak! ${done ? "Crushed it today! 🎉 Keep the momentum!" : "Not done yet today. You've got this! ⚡"}`;
  }
  return "Every habit you build is a vote for your future self. Stay consistent, track daily, and trust the process! 🌟";
}

function sendChat() {
  const input = document.getElementById('chatInput');
  const msg = input.value.trim();
  if (!msg) return;
  input.value = '';
  const messages = document.getElementById('chatMessages');

  const userMsg = document.createElement('div');
  userMsg.className = 'msg user';
  userMsg.innerHTML = `<div class="msg-bubble">${msg}</div>`;
  messages.appendChild(userMsg);

  const typing = document.createElement('div');
  typing.className = 'msg bot typing';
  typing.innerHTML = `<div class="bot-avatar">🤖</div><div class="msg-bubble">Processing...</div>`;
  messages.appendChild(typing);
  messages.scrollTop = messages.scrollHeight;

  setTimeout(() => {
    messages.removeChild(typing);
    const botMsg = document.createElement('div');
    botMsg.className = 'msg bot';
    botMsg.innerHTML = `<div class="bot-avatar">🤖</div><div class="msg-bubble">${getBotReply(msg)}</div>`;
    messages.appendChild(botMsg);
    messages.scrollTop = messages.scrollHeight;
  }, 800);
}

// ─── Init ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  createParticles();
  loadTheme();
  renderHabits();
  renderChart();
  updateStats();
  const saved = localStorage.getItem('reminderTime');
  if (saved) {
    document.getElementById('reminderTime').value = saved;
    document.getElementById('reminderStatus').textContent = `✅ Reminder activated for ${saved} daily!`;
    scheduleReminder(saved);
  }
  // Show welcome message
  const user = JSON.parse(localStorage.getItem('hx_current') || '{}');
  if (user.name) {
    document.getElementById('welcomeMsg').textContent = `Welcome back, ${user.name}! 👋`;
  }
});
function logout() {
  localStorage.removeItem('hx_current');
  window.location.href = 'login.html';
}
function addHabit() {
  const input = document.getElementById('habitInput');
  const name = input.value.trim();
  if (!name) return;
  SoundFX.play('add'); // 🔊 ADD SOUND
  habits.push({ id: Date.now(), name, streak: 0, lastChecked: null, history: [] });
  saveHabits();
  input.value = '';
  renderHabits();
  renderChart();
  updateStats();
}

function checkIn(id) {
  const today = getTodayKey();
  const habit = habits.find(h => h.id === id);
  if (!habit || habit.lastChecked === today) return;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yKey = yesterday.toISOString().slice(0, 10);
  habit.streak = habit.lastChecked === yKey ? habit.streak + 1 : 1;
  habit.lastChecked = today;
  if (!habit.history) habit.history = [];
  habit.history.push(today);
  SoundFX.play('done'); // 🔊 DONE SOUND
  saveHabits();
  renderHabits();
  renderChart();
  updateStats();
}

function deleteHabit(id) {
  SoundFX.play('delete'); // 🔊 DELETE SOUND
  habits = habits.filter(h => h.id !== id);
  saveHabits();
  renderHabits();
  renderChart();
  updateStats();
}
function exportPDF() {
  const today = new Date().toLocaleDateString('en-US',{
    weekday:'long', year:'numeric', month:'long', day:'numeric'
  });
  const user = JSON.parse(localStorage.getItem('hx_current')||'{}');
  const total = habits.reduce((s,h)=>(h.history||[]).length+s,0);
  const best = habits.reduce((m,h)=>Math.max(m,h.streak||0),0);

  const content = `
    HABITX — PROGRESS REPORT
    Generated: ${today}
    User: ${user.name || 'Guest'}
    ================================
    SUMMARY
    Total Habits: ${habits.length}
    Total Completions: ${total}
    Best Streak: ${best} days
    ================================
    HABITS DETAIL
    ${habits.map(h=>`
    • ${h.name}
      Streak: ${h.streak} days
      Total done: ${(h.history||[]).length} times
      Last checked: ${h.lastChecked || 'Never'}
    `).join('')}
    ================================
    Keep building great habits!
    HabitX — Your Future Self Starts Today ⚡
  `;

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `HabitX_Report_${new Date().toISOString().slice(0,10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}