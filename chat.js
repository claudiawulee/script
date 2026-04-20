import {
  db,
  ref,
  onValue
} from "./firebase.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";

import {
  push,
  set,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";

// Firebase auth object from your shared Firebase setup
import { auth } from "./firebase.js";

// Navbar setup
import { setupNavbar } from "./navbar.js";


// Build dropdown options from CLASS_TABS
// Each option is one class/session combination
function buildClassOptions() {
  const options = [];

  (window.CLASS_TABS || []).forEach(tab => {
    (tab.classes || []).forEach(room => {
      const classKey = `${tab.id}__${room}`;
      const classLabel = `${tab.title} — ${room}`;

      options.push({
        key: classKey,
        label: classLabel
      });
    });
  });

  return options;
}


// Fill the class dropdown on the chat page
function populateClassDropdown() {
  const select = document.getElementById("classSelect");
  if (!select) return;

  const options = buildClassOptions();
  select.innerHTML = "";

  options.forEach(option => {
    const el = document.createElement("option");
    el.value = option.key;
    el.textContent = option.label;
    select.appendChild(el);
  });
}


// Format timestamp into readable date + time
function formatDateTime(timestamp) {
  if (!timestamp) return "";

  const date = new Date(timestamp);
  return date.toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}


// Show all messages on the page
function renderMessages(messages) {
  const container = document.getElementById("messages");
  if (!container) return;

  container.innerHTML = "";

  // Show placeholder if no messages yet
  if (messages.length === 0) {
    container.innerHTML = `<p class="empty-chat">No messages yet.</p>`;
    return;
  }

  messages.forEach(msg => {
    const item = document.createElement("div");
    item.className = "message";

    item.innerHTML = `
      <div class="message-top">
        <span class="message-class">${msg.classLabel}</span>
        <span class="message-time">${formatDateTime(msg.timestamp)}</span>
      </div>
      <div class="message-meta">${msg.author}</div>
      <div class="message-text">${msg.text}</div>
    `;

    container.appendChild(item);
  });

  // Auto-scroll to newest message
  container.scrollTop = container.scrollHeight;
}


// Listen for live updates from Firebase chatMessages
function listenForMessages() {
  const messagesRef = ref(db, "chatMessages");

  onValue(messagesRef, snapshot => {
    const data = snapshot.val() || {};

    const messages = Object.keys(data).map(id => ({
      id,
      ...data[id]
    }));

    // Sort messages oldest to newest
    messages.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

    renderMessages(messages);
  });
}


// Send a new message to Firebase
async function sendMessage(user) {
  const input = document.getElementById("messageInput");
  const select = document.getElementById("classSelect");

  if (!input || !select) return;

  const text = input.value.trim();
  const classKey = select.value;
  const classLabel = select.options[select.selectedIndex]?.text || "";

  // Stop if message is empty or no class is selected
  if (!text) return;
  if (!classKey) return;

  // Only signed-in users can send
  if (!user) {
    alert("You must be signed in to send messages.");
    return;
  }

  const messagesRef = ref(db, "chatMessages");
  const newMessageRef = push(messagesRef);

  // Save message in Firebase
  await set(newMessageRef, {
    classKey,
    classLabel,
    text,
    author: user.email || "Unknown user",
    timestamp: Date.now()
  });

  // Clear input after sending
  input.value = "";
}


// Set up the chat page
function setupChat() {
  populateClassDropdown();
  listenForMessages();

  const input = document.getElementById("messageInput");
  const sendBtn = document.getElementById("sendBtn");

  let currentUser = null;

  // Keep track of current signed-in user
  onAuthStateChanged(auth, user => {
    currentUser = user || null;
  });

  // Send message when button is clicked
  sendBtn.addEventListener("click", () => {
    sendMessage(currentUser);
  });

  // Send message when Enter is pressed
  input.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      sendMessage(currentUser);
    }
  });
}


// Set up navbar
setupNavbar();


// Wait until page is loaded before running chat setup
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupChat);
} else {
  setupChat();
}