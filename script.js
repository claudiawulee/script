// 0 is default value if nothing in localStorage
const defaultState = {
  MAT201: { tutors: 0, students: 0 },
  MOL214: { tutors: 0, students: 0 }
};

// Get room data from localStorage
// If nothing is saved, return the default values (0s)
function getRoomCounts() {
  const data = localStorage.getItem("roomCounts");
  return data ? JSON.parse(data) : defaultState;
}

// Update the numbers on page
function renderCounts() {
  const counts = getRoomCounts();

  // Loop through each room card 
  document.querySelectorAll(".card").forEach(card => {
    const room = card.dataset.room;

    // Update tutors count
    card.querySelector(".tutors").textContent =
      counts[room] ? counts[room].tutors : 0;

    // Update students count
    card.querySelector(".students").textContent =
      counts[room] ? counts[room].students : 0;
  });
}

// Listen for changes from admin page
window.addEventListener("storage", () => {
  renderCounts();
});

renderCounts();