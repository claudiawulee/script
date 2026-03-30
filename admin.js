// 0 is default value if nothing in localStorage
const defaultState = {
  MAT201: { tutors: 0, students: 0 },
  MOL214: { tutors: 0, students: 0 }
};

// Load saved counts from localStorage
// If nothing is saved yet, use default counts
let state = localStorage.getItem("roomCounts")
  ? JSON.parse(localStorage.getItem("roomCounts"))
  : defaultState;

// Show the current numbers in input boxes
function renderInputs() {
  document.querySelectorAll(".card").forEach(card => {
    const room = card.dataset.room;
    card.querySelector(".tutors").value = state[room].tutors;
    card.querySelector(".students").value = state[room].students;
  });
}

// Save the current state into localStorage
function saveCounts() {
  localStorage.setItem("roomCounts", JSON.stringify(state));
}

// Can update count with buttons or by typing into box

// Add or subtract from a room count
function changeCount(room, type, amount) {
  state[room][type] += amount;

  // Count can't go below 0
  if (state[room][type] < 0) {
    state[room][type] = 0;
  }

  saveCounts();
  renderInputs();
}

// Set a room count to number in input box
function setCount(room, type) {
  const card = document.querySelector(`[data-room="${room}"]`);
  const input = card.querySelector(`.${type}`);

  state[room][type] = Number(input.value) || 0;

  // Count can't go below 0
  if (state[room][type] < 0) {
    state[room][type] = 0;
  }

  saveCounts();
  renderInputs();
}

// Reset every room back to 0
function resetAll() {
  state = {
    MAT201: { tutors: 0, students: 0 },
    MOL214: { tutors: 0, students: 0 }
  };

  saveCounts();
  renderInputs();
}

renderInputs();