// script.js

// Show current date at the top
document.addEventListener('DOMContentLoaded', () => {
  const dateElement = document.getElementById('currentDate');
  if (dateElement) {
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    dateElement.textContent = `Today: ${formattedDate}`;
  }

  if (document.getElementById('nimazList')) loadCheckboxes('nimaz', 1000);
  if (document.getElementById('dayList')) loadCheckboxes('day', 1000);
  setupDarkMode();
  setupNotifications();
  showMotivationalSuggestion();
  addDashboardLink();
});

function addDashboardLink() {
  const nav = document.createElement('div');
  nav.innerHTML = '<a href="dashboard.html" style="position:fixed; top:10px; right:10px; background:#007bff; color:#fff; padding:10px 15px; border-radius:8px; text-decoration:none; font-weight:bold; z-index:1000;">🏠 Dashboard</a>';
  document.body.appendChild(nav);
}

// Load checkboxes and their saved state + date
function loadCheckboxes(type, total) {
  const container = document.getElementById(`${type}List`);
  let count = 0;

  for (let i = 1; i <= total; i++) {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `${type}_${i}`;
    checkbox.checked = localStorage.getItem(`${type}_${i}`) === 'true';

    if (checkbox.checked) count++;

    const dateKey = `${type}_${i}_date`;
    const savedDate = localStorage.getItem(dateKey);

    const label = document.createElement('label');
    label.htmlFor = checkbox.id;
    label.innerText = `${type.charAt(0).toUpperCase() + type.slice(1)} ${i}`;

    const dateSpan = document.createElement('span');
    dateSpan.style.marginLeft = '15px';
    dateSpan.style.fontSize = '1rem';
    dateSpan.style.color = '#555';
    dateSpan.textContent = savedDate ? `✔ ${savedDate}` : '';

    checkbox.onchange = () => {
      if (checkbox.checked) {
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: '2-digit'
        });
        localStorage.setItem(`${type}_${i}`, true);
        localStorage.setItem(dateKey, dateStr);
        dateSpan.textContent = `✔ ${dateStr}`;
      } else {
        localStorage.setItem(`${type}_${i}`, false);
        localStorage.removeItem(dateKey);
        dateSpan.textContent = '';
      }
      updateProgress(type, total);
    };

    const div = document.createElement('div');
    div.appendChild(checkbox);
    div.appendChild(label);
    div.appendChild(dateSpan);

    container.appendChild(div);
  }

  updateProgress(type, total, count);
}

// Jump to last checked box
function jumpToLast(type) {
  const total = 1000;
  for (let i = total; i >= 1; i--) {
    if (localStorage.getItem(`${type}_${i}`) === 'true') {
      const el = document.getElementById(`${type}_${i}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      break;
    }
  }
}

// Reset all checkboxes and dates
function resetAll(type) {
  if (confirm("Are you sure you want to reset all?")) {
    for (let i = 1; i <= 1000; i++) {
      localStorage.removeItem(`${type}_${i}`);
      localStorage.removeItem(`${type}_${i}_date`);
    }
    location.reload();
  }
}

// Update progress display and show milestones
function updateProgress(type, total, checked = 0) {
  if (!checked) {
    for (let i = 1; i <= total; i++) {
      if (localStorage.getItem(`${type}_${i}`) === 'true') checked++;
    }
  }
  const progressEl = document.getElementById(`${type}Progress`);
  if (progressEl) {
    progressEl.textContent = `${type.charAt(0).toUpperCase() + type.slice(1)} Progress: ${checked} / ${total}`;
  }

  // Milestones
  if ((type === 'nimaz' && checked === 50) || (type === 'day' && checked === 10)) {
    alert(`🎉 MashaAllah! You’ve completed ${checked} ${type === 'nimaz' ? 'Nimaz' : 'Days'}! Keep going!`);
  }
}

// Export checked data to CSV
function exportData(type) {
  let csvContent = "Data\n";
  for (let i = 1; i <= 1000; i++) {
    if (localStorage.getItem(`${type}_${i}`) === 'true') {
      const date = localStorage.getItem(`${type}_${i}_date`) || '';
      csvContent += `${type}_${i},${date}\n`;
    }
  }
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  link.setAttribute("href", URL.createObjectURL(blob));
  link.setAttribute("download", `${type}_tracker_data.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Dark mode toggle
function setupDarkMode() {
  const isDark = localStorage.getItem('darkmode') === 'true';
  document.body.classList.toggle('dark-mode', isDark);

  const button = document.createElement('button');
  button.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
  button.onclick = () => {
    const dark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkmode', dark);
    button.textContent = dark ? "☀️ Light Mode" : "🌙 Dark Mode";
  };
  document.body.insertBefore(button, document.body.firstChild);
}

// Show monthly history in alert
function showMonthlyHistory(type) {
  const history = [];
  for (let i = 1; i <= 1000; i++) {
    if (localStorage.getItem(`${type}_${i}`) === 'true') {
      const date = localStorage.getItem(`${type}_${i}_date`) || 'Unknown';
      history.push(`${type}_${i}: ${date}`);
    }
  }
  if (history.length) {
    alert(`History for ${type.toUpperCase()}\n\n` + history.join("\n"));
  } else {
    alert("No data yet.");
  }
}

// Ask for notification permission and set daily reminder
function setupNotifications() {
  if ("Notification" in window && Notification.permission !== "denied") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        setTimeout(() => {
          new Notification("🕌 Did you complete your Nimaz today?");
        }, 2000);
      }
    });
  }
}

// Suggestion system based on data
function showMotivationalSuggestion() {
  const today = new Date().toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: '2-digit'
  });

  let lastDoneDate = null;
  for (let i = 1000; i >= 1; i--) {
    if (localStorage.getItem(`nimaz_${i}`) === 'true') {
      lastDoneDate = localStorage.getItem(`nimaz_${i}_date`);
      break;
    }
  }

  if (!lastDoneDate) {
    alert("💡 Start your journey today — even one Nimaz makes a difference!");
  } else if (lastDoneDate !== today) {
    alert("⏳ You haven’t logged Nimaz today. Stay consistent, you're doing great!");
  } else {
    const streakMsg = [
      "🔥 You're on fire! Keep the streak going!",
      "🌟 Amazing discipline! Keep pushing!",
      "💪 Strong progress — may Allah bless you!"
    ];
    const msg = streakMsg[Math.floor(Math.random() * streakMsg.length)];
    setTimeout(() => alert(msg), 1500);
  }
}
