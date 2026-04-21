import { db, ref, onValue } from "./firebase.js";
import { loadNavbar } from "./loadnavbar.js";
import { initNavbar } from "./navbar.js";

// Make a unique key for each class in each tab/session
function getSessionRoomKey(tabId, room) {
  return `${tabId}__${room}`;
}

// Build default empty state using tab + room
function buildDisplayDefaultState() {
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

function getRoomStatus(tutors, students) {
  if (tutors === 0) {
    return { className: "gray", label: "Closed", icon: "⚪" };
  }

  const ratio = students / tutors;

  if (ratio <= 1) {
    return { className: "green", label: "Open", icon: "🟢" };
  }

  if (ratio < 3) {
    return { className: "orange", label: "Busy", icon: "🟠" };
  }

  return { className: "red", label: "Full", icon: "🔴" };
}

const defaultState = buildDisplayDefaultState();
let state = { ...defaultState };

function listenForCounts() {
  onValue(ref(db, "roomCounts"), snapshot => {
    const data = snapshot.val() || {};
    const newState = {};

    Object.keys(defaultState).forEach(roomKey => {
      newState[roomKey] = data[roomKey] || { tutors: 0, students: 0 };
    });

    state = newState;
    renderCounts();
  });
}

function getActiveTabId() {
  const savedTab = localStorage.getItem("activeTab");
  const tabs = window.CLASS_TABS || [];

  for (let i = 0; i < tabs.length; i++) {
    if (tabs[i].id === savedTab) {
      return savedTab;
    }
  }

  if (tabs.length > 0) {
    return tabs[0].id;
  }

  return null;
}

function setActiveTabId(tabId) {
  localStorage.setItem("activeTab", tabId);
}

function generateCards() {
  const grid = document.querySelector(".grid");
  if (!grid) return;

  grid.innerHTML = "";

  const activeTab = getActiveTabId();
  let rooms = [];

  if (window.getClassesForTab && activeTab) {
    rooms = window.getClassesForTab(activeTab);
  }

  rooms.forEach(room => {
    const roomKey = getSessionRoomKey(activeTab, room);

    const card = document.createElement("div");
    card.className = "card";
    card.dataset.room = room;
    card.dataset.roomKey = roomKey;

    card.innerHTML = `
      <div class="room-title">${room}</div>
      <div class="room-status"></div>

      <div class="count">
        <span>Tutors</span>
        <span class="tutors">0</span>
      </div>

      <div class="count">
        <span>Students</span>
        <span class="students">0</span>
      </div>
    `;

    grid.appendChild(card);
  });
}

function renderCounts() {
  generateCards();

  const cards = document.querySelectorAll(".card");

  cards.forEach(card => {
    const room = card.dataset.room;
    const roomKey = card.dataset.roomKey;
    const roomCounts = state[roomKey] || { tutors: 0, students: 0 };

    const tutors = roomCounts.tutors;
    const students = roomCounts.students;

    card.querySelector(".tutors").textContent = tutors;
    card.querySelector(".students").textContent = students;

    const status = getRoomStatus(tutors, students);

    const title = card.querySelector(".room-title");
    const statusText = card.querySelector(".room-status");

    title.textContent = room;
    title.classList.remove("green", "orange", "red", "gray");
    title.classList.add(status.className);

    statusText.textContent = `${status.icon} ${status.label}`;
    statusText.className = `room-status ${status.className}`;
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadNavbar();

  initNavbar((tabId) => {
    setActiveTabId(tabId);
    renderCounts();
  });

  listenForCounts();
});