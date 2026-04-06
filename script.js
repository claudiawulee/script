
// Get the default room state from classes.js
const defaultState = window.buildDefaultState();


// Get saved room counts from localStorage
// If a room has no saved data, use 0 tutors and 0 students
function getRoomCounts() {
  const savedData = localStorage.getItem("roomCounts");
  const savedCounts = savedData ? JSON.parse(savedData) : {};

  const counts = {};

  Object.keys(defaultState).forEach(room => {
    if (savedCounts[room]) {
      counts[room] = savedCounts[room];
    } else {
      counts[room] = { tutors: 0, students: 0 };
    }
  });

  return counts;
}

// Get the currently selected tab
function getActiveTabId() {
  const savedTab = localStorage.getItem("activeTab");
  const tabs = window.CLASS_TABS || [];

  // Check if saved tab is valid
  for (let i = 0; i < tabs.length; i++) {
    if (tabs[i].id === savedTab) {
      return savedTab;
    }
  }

  // If no saved tab, use the first tab
  if (tabs.length > 0) {
    return tabs[0].id;
  }

  // If there are no tabs
  return null;
}


// Save the selected tab to localStorage
function setActiveTabId(tabId) {
  localStorage.setItem("activeTab", tabId);
}


// Build the tab buttons at the top of the page
function generateTabs() {
  let tabsContainer = document.querySelector(".tabs");

  // Create tabs container if it does not exist yet
  if (!tabsContainer) {
    tabsContainer = document.createElement("div");
    tabsContainer.className = "tabs";

    const grid = document.querySelector(".grid");
    if (grid && grid.parentNode) {
      grid.parentNode.insertBefore(tabsContainer, grid);
    }
  }

  // Clear old tabs before rebuilding
  tabsContainer.innerHTML = "";

  const tabs = window.CLASS_TABS || [];
  const activeTab = getActiveTabId();

  tabs.forEach(tab => {
    const button = document.createElement("button");
    button.className = "tab-btn";
    button.textContent = tab.title;

    // Highlight the current tab
    if (tab.id === activeTab) {
      button.classList.add("active");
    }

    // When clicked, save new active tab and re-render page
    button.addEventListener("click", function () {
      setActiveTabId(tab.id);
      renderCounts();
    });

    tabsContainer.appendChild(button);
  });
}


// Build one room card for each class in the current tab
function generateCards() {
  const grid = document.querySelector(".grid");
  if (!grid) return;

  // Clear old cards before rebuilding
  grid.innerHTML = "";

  const activeTab = getActiveTabId();
  let rooms = [];

  // Get classes for current tab
  if (window.getClassesForTab && activeTab) {
    rooms = window.getClassesForTab(activeTab);
  } else {
    rooms = Object.keys(defaultState);
  }

  // Create a card for each room
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


// Fill each card with the saved tutor/student counts
function renderCounts() {
  const counts = getRoomCounts();

  // Rebuild tabs and cards
  generateTabs();
  generateCards();

  // Update each card with the correct numbers
  const cards = document.querySelectorAll(".card");

  cards.forEach(card => {
    const room = card.dataset.room;

    let roomCounts = counts[room];
    if (!roomCounts) {
      roomCounts = { tutors: 0, students: 0 };
    }

    const tutorsSpan = card.querySelector(".tutors");
    const studentsSpan = card.querySelector(".students");

    tutorsSpan.textContent = roomCounts.tutors;
    studentsSpan.textContent = roomCounts.students;
  });
}

renderCounts();