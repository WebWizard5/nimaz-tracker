// script.js with 3-year tracker + prayer summary per day + logout/reset fixes

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCsU16hWWOzdoWDrTnKP1p_dZVO51-7vRw",
  authDomain: "nimaz-tracker-b8516.firebaseapp.com",
  projectId: "nimaz-tracker-b8516",
  storageBucket: "nimaz-tracker-b8516.firebasestorage.app",
  messagingSenderId: "487763725503",
  appId: "1:487763725503:web:cae0512b7a58997de68a0a",
  measurementId: "G-FV3VFTXK5R"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore();
const auth = getAuth();
const provider = new GoogleAuthProvider();

let currentUser = null;
let checkboxData = {};

function renderLoginSection() {
  const container = document.createElement("div");
  container.id = "authSection";
  container.style.textAlign = "center";
  container.style.marginBottom = "25px";

  const info = document.createElement("p");
  info.id = "welcomeText";
  info.style.fontSize = "1.2rem";

  const loginBtn = document.createElement("button");
  loginBtn.textContent = "🔐 Sign in with Google";
  loginBtn.onclick = () => signInWithPopup(auth, provider);

  const logoutBtn = document.createElement("button");
  logoutBtn.textContent = "🚪 Sign Out";
  logoutBtn.onclick = () => {
    signOut(auth).then(() => {
      localStorage.removeItem("dark");
      location.reload();
    }).catch((error) => {
      alert("Logout failed: " + error.message);
    });
  };

  container.appendChild(info);
  container.appendChild(loginBtn);
  container.appendChild(logoutBtn);
  document.body.insertBefore(container, document.body.firstChild);
}

function renderDarkModeToggle() {
  const toggle = document.createElement("button");
  toggle.textContent = localStorage.getItem("dark") === "true" ? "☀️ Light Mode" : "🌙 Dark Mode";
  toggle.style.position = "fixed";
  toggle.style.bottom = "15px";
  toggle.style.right = "15px";
  toggle.style.zIndex = 1000;

  toggle.onclick = () => {
    const isDark = document.body.classList.toggle("dark-mode");
    localStorage.setItem("dark", isDark);
    toggle.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
  };

  document.body.appendChild(toggle);
  if (localStorage.getItem("dark") === "true") {
    document.body.classList.add("dark-mode");
  }
}

onAuthStateChanged(auth, async user => {
  const info = document.getElementById("welcomeText");
  const loginBtn = document.querySelector("#authSection button:nth-of-type(1)");
  const logoutBtn = document.querySelector("#authSection button:nth-of-type(2)");

  if (user) {
    currentUser = user;
    info.textContent = `👋 Welcome, ${user.displayName}`;
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
    await loadTrackerView();
  } else {
    currentUser = null;
    info.textContent = "Please sign in to sync your progress.";
    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  const dateElement = document.getElementById("currentDate");
  if (dateElement) {
    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
    dateElement.textContent = `Today: ${formattedDate}`;
  }
  renderLoginSection();
  renderDarkModeToggle();
});

async function loadTrackerView() {
  if (!currentUser) return;
  const container = document.getElementById("nimazList");
  if (!container) return;

  const docRef = doc(db, `tracker`, currentUser.uid);
  const snapshot = await getDoc(docRef);
  checkboxData = snapshot.exists() ? snapshot.data() : {};
  container.innerHTML = "";

  const prayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
  const today = new Date();

  for (let i = 0; i < 1095; i++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + i);
    const dateStr = currentDate.toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric"
    });
    const dayName = currentDate.toLocaleDateString("en-US", { weekday: "long" });

    const section = document.createElement("div");
    section.style.marginBottom = "25px";
    section.style.padding = "12px 18px";
    section.style.border = "1px solid #ccc";
    section.style.borderRadius = "10px";
    section.style.background = "#fdfdfd";

    const title = document.createElement("div");
    title.style.fontWeight = "bold";
    title.style.marginBottom = "10px";
    title.style.fontSize = "1.1rem";
    title.textContent = `${dateStr} — (${dayName})`;
    section.appendChild(title);

    const allPrayers = [...prayers];
    if (dayName === "Friday") allPrayers.push("Jumma");

    let dayCompleted = 0;
    allPrayers.forEach(prayer => {
      const key = `${dateStr}_${prayer}`;
      const div = document.createElement("div");

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = key;
      checkbox.checked = checkboxData[key]?.checked || false;
      if (checkbox.checked) dayCompleted++;

      const label = document.createElement("label");
      label.htmlFor = key;
      label.innerText = prayer;
      label.style.marginLeft = "10px";
      label.style.fontSize = "1.05rem";

      checkbox.onchange = async () => {
        checkboxData[key] = { checked: checkbox.checked };
        await setDoc(docRef, checkboxData);
        updateDaySummary(section, allPrayers, dateStr);
      };

      div.appendChild(checkbox);
      div.appendChild(label);
      div.style.marginBottom = "6px";

      section.appendChild(div);
    });

    const summary = document.createElement("div");
    summary.className = "day-summary";
    summary.style.fontSize = "0.95rem";
    summary.style.fontStyle = "italic";
    summary.style.marginTop = "6px";
    summary.textContent = `✅ ${dayCompleted} / ${allPrayers.length} prayers completed`;
    section.appendChild(summary);

    container.appendChild(section);
  }
}

function updateDaySummary(section, prayers, dateStr) {
  let count = 0;
  prayers.forEach(prayer => {
    const key = `${dateStr}_${prayer}`;
    if (checkboxData[key]?.checked) count++;
  });
  const summary = section.querySelector(".day-summary");
  if (summary) summary.textContent = `✅ ${count} / ${prayers.length} prayers completed`;
}

function resetAll() {
  if (!currentUser) return;
  if (confirm("Are you sure you want to reset all your Namaz records?")) {
    checkboxData = {};
    setDoc(doc(db, `tracker`, currentUser.uid), {}).then(() => location.reload());
  }
}

function showMonthlyHistory() {
  alert("(Cloud sync active) Monthly history coming soon.");
}

function exportData() {
  alert("(Cloud sync active) Export coming soon.");
}

window.resetAll = resetAll;
window.showMonthlyHistory = showMonthlyHistory;
window.exportData = exportData;
