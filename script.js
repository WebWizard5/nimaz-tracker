// script.js with Firebase login, UI cleanup, and Firestore-compatible reset & jump

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
let checkboxData = { nimaz: {}, day: {} };

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
  logoutBtn.onclick = () => signOut(auth);

  container.appendChild(info);
  container.appendChild(loginBtn);
  container.appendChild(logoutBtn);
  document.body.insertBefore(container, document.body.firstChild);
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
    await loadAllCheckboxData();
  } else {
    currentUser = null;
    info.textContent = "Please sign in to sync your progress.";
    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
  }
});

document.addEventListener("DOMContentLoaded", () => {
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
});

async function loadAllCheckboxData() {
  if (!currentUser) return;

  const types = ["nimaz", "day"];
  for (const type of types) {
    const listContainer = document.getElementById(`${type}List`);
    if (!listContainer) continue;

    const docRef = doc(db, `${type}s`, currentUser.uid);
    const snapshot = await getDoc(docRef);
    checkboxData[type] = snapshot.exists() ? snapshot.data() : {};

    listContainer.innerHTML = "";

    for (let i = 1; i <= 1000; i++) {
      const boxID = `${type}_${i}`;
      const checked = checkboxData[type][boxID]?.checked || false;
      const date = checkboxData[type][boxID]?.date || "";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = boxID;
      checkbox.checked = checked;

      const label = document.createElement("label");
      label.htmlFor = boxID;
      label.innerText = `${type.charAt(0).toUpperCase() + type.slice(1)} ${i}`;

      const dateSpan = document.createElement("span");
      dateSpan.style.marginLeft = "15px";
      dateSpan.style.fontSize = "1rem";
      dateSpan.style.color = "#555";
      dateSpan.textContent = date ? `✔ ${date}` : "";

      checkbox.onchange = async () => {
        const now = new Date();
        const dateStr = now.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "2-digit"
        });

        checkboxData[type][boxID] = checkbox.checked
          ? { checked: true, date: dateStr }
          : { checked: false, date: "" };

        await setDoc(doc(db, `${type}s`, currentUser.uid), checkboxData[type]);
        dateSpan.textContent = checkbox.checked ? `✔ ${dateStr}` : "";
      };

      const div = document.createElement("div");
      div.appendChild(checkbox);
      div.appendChild(label);
      div.appendChild(dateSpan);
      listContainer.appendChild(div);
    }
  }
}

function jumpToLast(type) {
  if (!currentUser || !checkboxData[type]) return;
  for (let i = 1000; i >= 1; i--) {
    if (checkboxData[type][`${type}_${i}`]?.checked) {
      const el = document.getElementById(`${type}_${i}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      break;
    }
  }
}

function resetAll(type) {
  if (!currentUser) return;
  if (confirm("Are you sure you want to reset all?")) {
    checkboxData[type] = {};
    setDoc(doc(db, `${type}s`, currentUser.uid), {}).then(() => location.reload());
  }
}

function showMonthlyHistory(type) {
  alert("(Cloud sync active) Monthly history coming soon.");
}

function exportData(type) {
  alert("(Cloud sync active) Export coming soon.");
}

function setupDarkMode() {
  const isDark = localStorage.getItem("darkmode") === "true";
  document.body.classList.toggle("dark-mode", isDark);

  const button = document.createElement("button");
  button.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
  button.onclick = () => {
    const dark = document.body.classList.toggle("dark-mode");
    localStorage.setItem("darkmode", dark);
    button.textContent = dark ? "☀️ Light Mode" : "🌙 Dark Mode";
  };
  document.body.insertBefore(button, document.body.firstChild);
}

function addDashboardLink() {
  const nav = document.createElement("div");
  nav.innerHTML = '<a href="dashboard.html" style="position:fixed; top:10px; right:10px; background:#007bff; color:#fff; padding:10px 15px; border-radius:8px; text-decoration:none; font-weight:bold; z-index:1000;">🏠 Dashboard</a>';
  document.body.appendChild(nav);
}

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

function showMotivationalSuggestion() {
  // Firebase version coming soon
}
