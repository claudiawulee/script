import { auth, signOut, onAuthStateChanged } from "./firebase.js";

// Emails that are allowed to see the Admin tab
const ALLOWED_EMAILS = [
  "cl7359@princeton.edu",
  "claudialee57@gmail.com"
];

// Check if signed-in user is an admin
function isAdminEmail(email) {
  if (!email) return false;

  return ALLOWED_EMAILS.some(
    allowedEmail => allowedEmail.toLowerCase() === email.toLowerCase()
  );
}

// Figure out which page we are currently on
function getCurrentPage() {
  const path = window.location.pathname;

  if (path.includes("admin.html")) return "admin";
  if (path.includes("chat.html")) return "chat";
  return "home";
}

// Create one navbar link
function createNavLink(label, href, isActive) {
  const link = document.createElement("a");
  link.href = href;
  link.className = "nav-item";
  link.textContent = label;

  if (isActive) {
    link.classList.add("active");
  }

  return link;
}

// Create one navbar button
function createButton(label, onClick) {
  const button = document.createElement("button");
  button.className = "nav-btn";
  button.textContent = label;
  button.addEventListener("click", onClick);
  return button;
}

// Sign user out and send them back home
async function handleSignOut() {
  try {
    await signOut(auth);
    window.location.href = "index.html";
  } catch (error) {
    console.error("Sign out failed:", error);
  }
}

// Build navbar based on whether user is signed in and whether they are admin
function renderNavbar(user) {
  const navbar = document.getElementById("navbar");
  if (!navbar) return;

  navbar.innerHTML = "";

  const left = document.createElement("div");
  left.className = "nav-left";

  const right = document.createElement("div");
  right.className = "nav-right";

  const currentPage = getCurrentPage();
  const isSignedIn = !!user;
  const isAdmin = isAdminEmail(user?.email);

  // Everyone sees Home
  left.appendChild(
    createNavLink("🏠 Home", "index.html", currentPage === "home")
  );

  // Signed-out users see Sign In
  if (!isSignedIn) {
    right.appendChild(
      createNavLink("👤 Sign In", "admin.html", currentPage === "admin")
    );
  } else {
    // Signed-in users see Chat
    left.appendChild(
      createNavLink("💬 Chat", "chat.html", currentPage === "chat")
    );

    // Admin users also see Admin
    if (isAdmin) {
      left.appendChild(
        createNavLink("🔒 Admin", "admin.html", currentPage === "admin")
      );
    }

    // Signed-in users see Sign Out
    right.appendChild(
      createButton("Sign Out", handleSignOut)
    );
  }

  navbar.appendChild(left);
  navbar.appendChild(right);
}

// Re-render navbar whenever auth state changes
function setupNavbar() {
  onAuthStateChanged(auth, user => {
    renderNavbar(user);
  });
}

export { setupNavbar };