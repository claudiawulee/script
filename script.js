// Shared Firebase imports/initialization
import { db, ref, onValue } from './firebase.js';

const defaultState = window.buildDefaultState();
let state = defaultState;

function listenForCounts() {
  onValue(ref(db, "roomCounts"), snapshot => {
    const data = snapshot.val() || {};
    state = {};

    Object.keys(defaultState).forEach(room => {
      state[room] = data[room] || { tutors: 0, students: 0 };
    });

    renderCounts();
  });
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
    return { className: "orange", label: "Moderate", icon: "🟠" };
  }

  return { className: "red", label: "Busy", icon: "🔴" };
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

function generateTabs() {
  let tabsContainer = document.querySelector(".tabs");

  if (!tabsContainer) {
    tabsContainer = document.createElement("div");
    tabsContainer.className = "tabs";

    const grid = document.querySelector(".grid");
    if (grid && grid.parentNode) {
      grid.parentNode.insertBefore(tabsContainer, grid);
    }
  }

  tabsContainer.innerHTML = "";

  const tabs = window.CLASS_TABS || [];
  const activeTab = getActiveTabId();

  tabs.forEach(tab => {
    const button = document.createElement("button");
    button.className = "tab-btn";
    button.textContent = tab.title;

    if (tab.id === activeTab) {
      button.classList.add("active");
    }

    button.addEventListener("click", function () {
      setActiveTabId(tab.id);
      renderCounts();
    });

    tabsContainer.appendChild(button);
  });
}


function generateCards() {
  const grid = document.querySelector(".grid");
  if (!grid) return;

  grid.innerHTML = "";

  const activeTab = getActiveTabId();
  let rooms = [];

  if (window.getClassesForTab && activeTab) {
    rooms = window.getClassesForTab(activeTab);
  } else {
    rooms = Object.keys(defaultState);
  }

  rooms.forEach(room => {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.room = room;

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
  generateTabs();
  generateCards();

  const cards = document.querySelectorAll(".card");

  cards.forEach(card => {
  const room = card.dataset.room;
  const roomCounts = state[room] || { tutors: 0, students: 0 };

  const tutors = roomCounts.tutors;
  const students = roomCounts.students;

  // Update numbers
  card.querySelector(".tutors").textContent = tutors;
  card.querySelector(".students").textContent = students;

  // Get status
  const status = getRoomStatus(tutors, students);

  const title = card.querySelector(".room-title");
  const statusText = card.querySelector(".room-status");

  // Add icon + label
  statusText.textContent = `${status.icon} ${status.label}`;

  // Color title
  title.classList.remove("green", "orange", "red", "gray");
  title.classList.add(status.className);

  // Color status text
  statusText.className = `room-status ${status.className}`;
});
}

listenForCounts();