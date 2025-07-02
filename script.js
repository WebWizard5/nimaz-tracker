// script.js with Firebase login and sync

// Firebase SDKs
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

function renderLoginButtons() {
  const container = document.createElement("div");
  container.style.textAlign = "center";
  container.style.marginBottom = "20px";

  const loginBtn = document.createElement("button");
  loginBtn.textContent = "🔐 Sign in with Google";
  loginBtn.onclick = () => signInWithPopup(auth, provider);

  const logoutBtn = document.createElement("button");
  logoutBtn.textContent = "🚪 Sign Out";
  logoutBtn.onclick = () => signOut(auth);

  container.appendChild(loginBtn);
  container.appendChild(logoutBtn);

  document.body.insertBefore(container, document.body.firstChild);
}

onAuthStateChanged(auth, async user => {
  if (user) {
    currentUser = user;
    loadCheckboxes("nimaz", 1000);
    loadCheckboxes("day", 1000);
  } else {
    currentUser = null;
    alert("Please sign in to sync your progress.");
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

  renderLoginButtons();
});

async function loadCheckboxes(type, total) {
  const container = document.getElementById(`${type}List`);
  if (!container || !currentUser) return;

  const docRef = doc(db, `${type}s`, currentUser.uid);
  const snapshot = await getDoc(docRef);
  const data = snapshot.exists() ? snapshot.data() : {};

  for (let i = 1; i <= total; i++) {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = `${type}_${i}`;
    checkbox.checked = data[`${type}_${i}`]?.checked || false;

    const date = data[`${type}_${i}`]?.date || "";

    const label = document.createElement("label");
    label.htmlFor = checkbox.id;
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

      data[`${type}_${i}`] = checkbox.checked
        ? { checked: true, date: dateStr }
        : { checked: false, date: "" };

      await setDoc(docRef, data);
      dateSpan.textContent = checkbox.checked ? `✔ ${dateStr}` : "";
    };

    const div = document.createElement("div");
    div.appendChild(checkbox);
    div.appendChild(label);
    div.appendChild(dateSpan);
    container.appendChild(div);
  }
}

function jumpToLast(type) {
  // Optional for Firebase. Local fallback version can be added if needed.
}

function resetAll(type) {
  if (!currentUser) return;
  if (confirm("Are you sure you want to reset all?")) {
    const docRef = doc(db, `${type}s`, currentUser.uid);
    setDoc(docRef, {});
    location.reload();
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
