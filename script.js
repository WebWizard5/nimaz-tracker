// script.js with 3-year daily namaz tracker view, dark mode, calendar jump, and logout fix

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
  renderCalendarJump();
  if (auth.currentUser) {
    currentUser = auth.currentUser;
    await loadTrackerView();
  }
});

function renderCalendarJump() {
  const jumpSection = document.createElement("div");
  jumpSection.style.textAlign = "center";
  jumpSection.style.margin = "20px auto";

  const input = document.createElement("input");
  input.type = "date";
  input.style.padding = "10px";
  input.style.fontSize = "1rem";

  const button = document.createElement("button");
  button.textContent = "📅 Go to Date";
  button.style.marginLeft = "10px";
  button.onclick = () => {
    const date = new Date(input.value);
    if (!isNaN(date)) {
      const label = date.toLocaleDateString("en-US", {
        year: "numeric", month: "short", day: "numeric"
      });
      const header = Array.from(document.querySelectorAll("h3"))
        .find(h => h.textContent.startsWith(label));
      if (header) header.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  jumpSection.appendChild(input);
  jumpSection.appendChild(button);
  document.body.insertBefore(jumpSection, document.getElementById("nimazList"));
}

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
    section.style.marginBottom = "30px";
    section.style.border = "1px solid #ccc";
    section.style.borderRadius = "8px";
    section.style.padding = "15px";
    section.style.background = "#fafafa";

    const dateTitle = document.createElement("h3");
    dateTitle.textContent = `${dateStr} — (${dayName})`;
    section.appendChild(dateTitle);

    prayers.forEach(prayer => {
      const key = `${dateStr}_${prayer}`;
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = key;
      checkbox.checked = checkboxData[key]?.checked || false;

      const label = document.createElement("label");
      label.htmlFor = key;
      label.innerText = prayer;

      checkbox.onchange = async () => {
        checkboxData[key] = { checked: checkbox.checked };
        await setDoc(docRef, checkboxData);
      };

      const div = document.createElement("div");
      div.style.display = "flex";
      div.style.alignItems = "center";
      div.style.gap = "10px";
      div.style.margin = "5px 0";
      div.appendChild(checkbox);
      div.appendChild(label);
      section.appendChild(div);
    });

    if (dayName === "Friday") {
      const key = `${dateStr}_Jumma`;
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = key;
      checkbox.checked = checkboxData[key]?.checked || false;

      const label = document.createElement("label");
      label.htmlFor = key;
      label.innerText = "Jumma";

      checkbox.onchange = async () => {
        checkboxData[key] = { checked: checkbox.checked };
        await setDoc(docRef, checkboxData);
      };

      const div = document.createElement("div");
      div.style.display = "flex";
      div.style.alignItems = "center";
      div.style.gap = "10px";
      div.style.margin = "5px 0";
      div.appendChild(checkbox);
      div.appendChild(label);
      section.appendChild(div);
    }

    container.appendChild(section);
  }
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
