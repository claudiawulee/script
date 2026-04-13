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

    card.querySelector(".tutors").textContent = roomCounts.tutors;
    card.querySelector(".students").textContent = roomCounts.students;
  });
}

listenForCounts();