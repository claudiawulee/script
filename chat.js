import { db, ref, onValue, auth } from "./firebase.js";
import {
  push,
  set
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";

import { loadNavbar } from "./loadnavbar.js";
import { initNavbar } from "./navbar.js";

let selectedClass = "";
let allMessages = [];

// Build dropdown options from unique course codes only
function buildClassOptions() {
  const uniqueClasses = new Set();

  (window.CLASS_TABS || []).forEach(tab => {
    (tab.classes || []).forEach(room => {
      uniqueClasses.add(room);
    });
  });

  return [...uniqueClasses].sort().map(courseCode => ({
    key: courseCode,
    label: courseCode
  }));
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

  selectedClass = select.value;

  select.addEventListener("change", () => {
    selectedClass = select.value;
    renderFilteredMessages();
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

// Show messages on the page
function renderMessages(messages) {
  const container = document.getElementById("messages");
  if (!container) return;

  container.innerHTML = "";

  if (messages.length === 0) {
    container.innerHTML = `<p class="empty-chat">No messages yet for ${selectedClass}.</p>`;
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

  container.scrollTop = container.scrollHeight;
}

// Filter messages by selected class
function renderFilteredMessages() {
  if (!selectedClass) {
    renderMessages(allMessages);
    return;
  }

  const filtered = allMessages.filter(msg => msg.classKey === selectedClass);
  renderMessages(filtered);
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

    messages.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

    allMessages = messages;
    renderFilteredMessages();
  });
}

// Send a new message to Firebase
async function sendMessage(user) {
  const input = document.getElementById("messageInput");
  const select = document.getElementById("classSelect");

  if (!input || !select) return;

  const text = input.value.trim();
  const classKey = select.value;
  const classLabel = classKey;

  if (!text || !classKey) return;

  if (!user) {
    alert("You must be signed in to send messages.");
    return;
  }

  const messagesRef = ref(db, "chatMessages");
  const newMessageRef = push(messagesRef);

  await set(newMessageRef, {
    classKey,
    classLabel,
    text,
    author: user.email || "Unknown user",
    timestamp: Date.now()
  });

  input.value = "";
}

// Set up the chat page
function setupChat() {
  populateClassDropdown();
  listenForMessages();

  const input = document.getElementById("messageInput");
  const sendBtn = document.getElementById("sendBtn");

  let currentUser = null;

  onAuthStateChanged(auth, user => {
    currentUser = user || null;
  });

  sendBtn.addEventListener("click", () => {
    sendMessage(currentUser);
  });

  input.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      sendMessage(currentUser);
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadNavbar();
  initNavbar();
  setupChat();
});