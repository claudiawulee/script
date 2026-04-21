import { setupAuth } from "./auth.js";
import { db, ref, set, onValue } from "./firebase.js";
import { loadNavbar } from "./loadNavbar.js";
import { initNavbar } from "./navbar.js";

document.addEventListener("DOMContentLoaded", async () => {
  await loadNavbar();   // inject HTML first
  initNavbar();         // then attach logic

  // your existing logic
});

// Make a unique key for each class in each tab/session
function getSessionRoomKey(tabId, room) {
  return `${tabId}__${room}`;
}

// Build default state using tab + room
// keeps repeated classes in different sessions separate
function buildAdminDefaultState() {
  const state = {};
  const tabs = window.CLASS_TABS || [];

  tabs.forEach(tab => {
    tab.classes.forEach(room => {
      const roomKey = getSessionRoomKey(tab.id, room);
      state[roomKey] = { tutors: 0, students: 0 };
    });
  });

  return state;
}

// empty state
const defaultStateAdmin = buildAdminDefaultState();

// Current live state
let state = { ...defaultStateAdmin };

let adminStarted = false;

// Save current state to Firebase
function saveCounts() {
  set(ref(db, "roomCounts"), state);
}

// Listen for live updates from Firebase
function listenForCounts() {
  onValue(ref(db, "roomCounts"), snapshot => {
    const data = snapshot.val() || {};
    const newState = {};

    Object.keys(defaultStateAdmin).forEach(roomKey => {
      newState[roomKey] = data[roomKey] || { tutors: 0, students: 0 };
    });

    state = newState;
    renderInputs();
  });
}

// Get the currently selected tab
function getActiveTab() {
  const tabs = window.CLASS_TABS || [];
  const saved = localStorage.getItem("activeTab");

  for (let i = 0; i < tabs.length; i++) {
    if (tabs[i].id === saved) {
      return saved;
    }
  }

  return tabs.length > 0 ? tabs[0].id : null;
}


// Generate tab buttons
function generateAdminTabs() {
  const wrap = document.querySelector(".wrap") || document.body;
  let tabsContainer = document.querySelector(".tabs");

  // Create tabs container if needed
  if (!tabsContainer) {
    tabsContainer = document.createElement("div");
    tabsContainer.className = "tabs";

    const mainGrid = document.querySelector("main.grid");

    if (mainGrid && mainGrid.parentNode) {
      mainGrid.parentNode.insertBefore(tabsContainer, mainGrid);
    } else {
      wrap.insertBefore(tabsContainer, wrap.firstChild);
    }
  }

  // Clear old tabs
  tabsContainer.innerHTML = "";

  const tabs = window.CLASS_TABS || [];
  const activeTab = getActiveTab();

  tabs.forEach(tab => {
    const button = document.createElement("button");
    button.className = "tab-btn";
    button.textContent = tab.title;

    if (tab.id === activeTab) {
      button.classList.add("active");
    }

    button.addEventListener("click", function () {
      localStorage.setItem("activeTab", tab.id);
      generateAdminTabs();
      generateAdminCards();
      renderInputs();
    });

    tabsContainer.appendChild(button);
  });
}


// Generate cards for the active tab
function generateAdminCards() {
  const main = document.querySelector("main.grid");
  if (!main) return;

  main.innerHTML = "";

  const activeTab = getActiveTab();
  let rooms = [];

  if (window.getClassesForTab && activeTab) {
    rooms = window.getClassesForTab(activeTab);
  }

  rooms.forEach(room => {
    const roomKey = getSessionRoomKey(activeTab, room);

    const card = document.createElement("section");
    card.className = "card";
    card.dataset.room = room;
    card.dataset.roomKey = roomKey;

    card.innerHTML = createRoomHTML(room, roomKey);

    main.appendChild(card);
  });
}

// Build one room card
function createRoomHTML(room, roomKey) {
  return `
    <div class="room-title">${room}</div>

    ${createRow("Tutors", roomKey, "tutors")}
    ${createRow("Students", roomKey, "students")}
  `;
}

// Build one row 
function createRow(label, roomKey, type) {
  return `
    <div class="row">
      <div class="label">${label}</div>
      <button onclick="changeCount('${roomKey}', '${type}', -1)">-</button>
      <input type="number" min="0" class="${type}" oninput="setCount('${roomKey}', '${type}')">
      <button onclick="changeCount('${roomKey}', '${type}', 1)">+</button>
    </div>
  `;
}


// Show current values in each input
function renderInputs() {
  const cards = document.querySelectorAll(".card");

  cards.forEach(card => {
    const roomKey = card.dataset.roomKey;
    const roomState = state[roomKey] || { tutors: 0, students: 0 };

    const tutorsInput = card.querySelector(".tutors");
    const studentsInput = card.querySelector(".students");

    tutorsInput.value = roomState.tutors;
    studentsInput.value = roomState.students;
  });
}


// update count when + or - is clicked
function changeCount(roomKey, type, amount) {
  if (!state[roomKey]) {
    state[roomKey] = { tutors: 0, students: 0 };
  }

  state[roomKey][type] = state[roomKey][type] + amount;

  if (state[roomKey][type] < 0) {
    state[roomKey][type] = 0;
  }

  saveCounts();
  renderInputs();
}

// Change count when user types directly
function setCount(roomKey, type) {
  const card = document.querySelector(`[data-room-key="${roomKey}"]`);
  if (!card) return;

  const input = card.querySelector(`.${type}`);

  if (!state[roomKey]) {
    state[roomKey] = { tutors: 0, students: 0 };
  }

  let value = Number(input.value) || 0;

  if (value < 0) {
    value = 0;
  }

  state[roomKey][type] = value;

  saveCounts();
}

// Reset all session/class counts to 0
function resetAll() {
  const newState = {};

  Object.keys(defaultStateAdmin).forEach(roomKey => {
    newState[roomKey] = { tutors: 0, students: 0 };
  });

  state = newState;
  saveCounts();
  renderInputs();
}


function initializeAdmin() {
  generateAdminTabs();
  generateAdminCards();
  renderInputs();
  listenForCounts();
}

function startAdminOnce() {
  if (adminStarted) return;
  adminStarted = true;
  initializeAdmin();
}


// Make functions global so inline onclick/oninput works
window.changeCount = changeCount;
window.setCount = setCount;
window.resetAll = resetAll;

// Wait until page is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function () {
    setupAuth(startAdminOnce);
  });
} else {
  setupAuth(startAdminOnce);
}