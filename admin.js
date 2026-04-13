// Shared Firebase imports/initialization
import { db, ref, set } from './firebase.js';



// Prevents crash if classes.js doesn't load
let defaultStateAdmin
if (window.buildDefaultState) {
  defaultStateAdmin = window.buildDefaultState();
} else {
  defaultStateAdmin = {};
}

let state = loadState();

// Load saved counts from localStorage or initialize with default values (0s)
function loadState() {
  // either get saved counts or nothing if no saved counts
  const saved = JSON.parse(localStorage.getItem("roomCounts") || "{}");
  const res = {};
  // Gets all room names from classes.js and sets the saved counts else put 0s in
  Object.keys(defaultStateAdmin).forEach(room => {
    res[room] = saved[room] || { tutors: 0, students: 0 };
  });
  // returns rooms and their counts
  return res;
}

// Get the tab that is currently selected (when user clicks on tab it displays corresponding tab's info)
function getActiveTab() {
  const tabs = window.CLASS_TABS || [];
  const saved = localStorage.getItem("activeTab");

  // If saved tab exists and is valid, return it
  for (let i = 0; i < tabs.length; i++) {
    if (tabs[i].id === saved) {
      return saved;
    }
  }

  // Otherwise return first tab if it exists
  // Like when you first enter page, there is no saved tab so it will default to first tab
  if (tabs.length > 0) {
    return tabs[0].id;
  }

  // If no tabs at all
  return null;
}

function saveCounts() {
  set(ref(db, "roomCounts"), state);
}

// Generates the tab buttons (1 for each tutoring session)
function generateAdminTabs() {
  // gets the grid area (if it doesn't exist, use whole body) 
  const wrap = document.querySelector(".wrap") || document.body;
  // finds the tabs container (if it doesn't exist, will be null) 
  let tabsContainer = document.querySelector(".tabs");

  // Create tabs container if it does not exist
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

  //gets all tabs from classes.js 
  const tabs = window.CLASS_TABS || [];
  // active tab to know which tab's info to display
  const activeTab = getActiveTab();

  // Create one button for each tab (each tutoring session)
  tabs.forEach(tab => {
    // creates HTML button element
    const button = document.createElement("button");
    // gives it class so CSS can style it
    button.className = "tab-btn";
    // Renames button to day of the week and time of session
    button.textContent = tab.title;

    // If this tab is the tab user clicks on, it will be "active" and highlighted 
    if (tab.id === activeTab) {
      button.classList.add("active");
    }

    // Listens for when user clicks on any of the tab buttons, will display the new active tab with the correspond cards and counts
    button.addEventListener("click", function () {
      localStorage.setItem("activeTab", tab.id);
      generateAdminTabs();
      generateAdminCards();
      renderInputs();
    });
    // puts button inside the tabs container HTML element
    tabsContainer.appendChild(button);
  });
}

function generateAdminCards() {
  // Get the main grid area
  const main = document.querySelector("main.grid");
  if (!main) return;

  // Clear existing cards
  main.innerHTML = "";

  // Get current tab + rooms
  const activeTab = getActiveTab();
  let rooms;
  // if there is a function to get classes for each tab and there is an active tab
  // then get the rooms for that tab
  if (window.getClassesForTab && activeTab) {
    rooms = window.getClassesForTab(activeTab);
  // else get all rooms from classes.js
  } else {
    rooms = Object.keys(defaultStateAdmin);
  }

  // Create a card for each room
  rooms.forEach(room => {
    const card = document.createElement("section");
    card.className = "card";
    card.dataset.room = room;
    // Stores course code in HTML tag 
    // like <div class="card" data-room="COS126"></div>
    card.innerHTML = createRoomHTML(room);
    // append card to main grid area
    main.appendChild(card);
  });
}

// Helper: builds HTML for one room
function createRoomHTML(room) {
  return `
    <div class="room-title">${room}</div>

    ${createRow("Tutors", room, "tutors")}
    ${createRow("Students", room, "students")}
  `;
}

// Helper: builds one row (Tutors or Students)
function createRow(label, room, type) {
  return `
    <div class="row">
      <div class="label">${label}</div>
      <button onclick="changeCount('${room}', '${type}', -1)">-</button>
      <input type="number" min="0" class="${type}" oninput="setCount('${room}', '${type}')">
      <button onclick="changeCount('${room}', '${type}', 1)">+</button>
    </div>
  `;
}

// Show the current tutor/student counts in each card input box
function renderInputs() {
  const cards = document.querySelectorAll(".card");

  cards.forEach(card => {
    // Get room name from data-room attribute
    const room = card.dataset.room;

    // Get saved values for this room, or use 0 if missing
    const roomState = state[room] || { tutors: 0, students: 0 };

    // Find the two input boxes inside this card
    const tutorsInput = card.querySelector(".tutors");
    const studentsInput = card.querySelector(".students");

    // Put the saved values into the input boxes
    tutorsInput.value = roomState.tutors;
    studentsInput.value = roomState.students;
  });
}


// Increase or decrease a count when + or - is clicked
function changeCount(room, type, amount) {
  // If this room is not in state yet, start it at 0
  if (!state[room]) {
    state[room] = { tutors: 0, students: 0 };
  }

  // Add the amount to the current value
  state[room][type] = state[room][type] + amount;

  // Do not allow negative numbers
  if (state[room][type] < 0) {
    state[room][type] = 0;
  }

  // Save updated data and refresh the inputs on screen
  saveCounts();
  renderInputs();
}


// Update state when user types directly into an input box
function setCount(room, type) {
  // Find the card for this room
  const card = document.querySelector(`[data-room="${room}"]`);
  if (!card) return;

  // Find the correct input inside that card
  const input = card.querySelector(`.${type}`);

  // If this room is not in state yet, start it at 0
  if (!state[room]) {
    state[room] = { tutors: 0, students: 0 };
  }

  // Convert input value to a number
  let value = Number(input.value) || 0;

  // Do not allow negative numbers
  if (value < 0) {
    value = 0;
  }

  // Save the new value into state
  state[room][type] = value;

  // Save updated data
  saveCounts();
}


// Reset every room back to 0 tutors and 0 students
function resetAll() {
  const newState = {};

  // Go through every room in the default state
  Object.keys(defaultStateAdmin).forEach(room => {
    newState[room] = { tutors: 0, students: 0 };
  });

  // Replace old state with the new reset state
  state = newState;

  // Save updated data and refresh the inputs on screen
  saveCounts();
  renderInputs();
}

function initializeAdmin() {
  generateAdminTabs();
  generateAdminCards();
  renderInputs();
}

// Only run when classes.js has definitely loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAdmin);
} else {
  initializeAdmin();
}
