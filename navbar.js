import {
  auth,
  provider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "./firebase.js";

const ALLOWED_EMAILS = [
  "cl7359@princeton.edu",
  "claudialee57@gmail.com"
];

function isAdminEmail(email) {
  if (!email) return false;

  return ALLOWED_EMAILS.some(
    allowedEmail => allowedEmail.toLowerCase() === email.toLowerCase()
  );
}

function getCurrentPage() {
  const path = window.location.pathname.toLowerCase();

  if (path.includes("admin.html")) return "admin";
  if (path.includes("chat.html")) return "chat";
  return "home";
}

function getActiveTabId() {
  return localStorage.getItem("activeTab") || window.CLASS_TABS?.[0]?.id || "";
}

function setActiveTabId(tabId) {
  localStorage.setItem("activeTab", tabId);
}

function createSessionButton(tab, isActive, onTabChange) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "session-link";
  button.textContent = tab.title;
  button.dataset.tabId = tab.id;

  if (isActive) {
    button.classList.add("active");
  }

  button.addEventListener("click", () => {
    setActiveTabId(tab.id);
    renderDashboardMenu(onTabChange);

    if (typeof onTabChange === "function") {
      onTabChange(tab.id);
    }
  });

  return button;
}

function renderDashboardMenu(onTabChange) {
  const dashboardMenu = document.getElementById("dashboardMenu");
  if (!dashboardMenu) return;

  dashboardMenu.innerHTML = "";

  const tabs = window.CLASS_TABS || [];
  const activeTabId = getActiveTabId();

  tabs.forEach(tab => {
    const button = createSessionButton(tab, tab.id === activeTabId, onTabChange);
    dashboardMenu.appendChild(button);
  });
}

function setActiveNavLink() {
  const currentPage = getCurrentPage();
  const navLinks = document.querySelectorAll(".nav-link[data-page]");

  navLinks.forEach(link => {
    const page = link.dataset.page;

    if (
      (currentPage === "home" && (page === "home" || page === "dashboard")) ||
      page === currentPage
    ) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

function setupDashboardBehavior() {
  const dashboardLink = document.getElementById("dashboardLink");
  const dashboardMenu = document.getElementById("dashboardMenu");
  const dashboardSymbol = document.getElementById("dashboardSymbol");

  if (!dashboardLink || !dashboardMenu || !dashboardSymbol) return;

  const isHomePage = getCurrentPage() === "home";

  if (isHomePage) {
    // Default: open on first load
    dashboardMenu.classList.remove("hidden");
    dashboardSymbol.textContent = "-";

    dashboardLink.addEventListener("click", (e) => {
      e.preventDefault(); // stay on index

      const isHidden = dashboardMenu.classList.contains("hidden");

      dashboardMenu.classList.toggle("hidden");
      dashboardSymbol.textContent = isHidden ? "-" : "+";
    });

  } else {
    // Other pages → always "+"
    dashboardMenu.classList.add("hidden");
    dashboardSymbol.textContent = "+";
    // no click handler needed (normal navigation)
  }
}
function setupAuthButtons() {
  const signInBtn = document.getElementById("signInBtn");
  const signOutBtn = document.getElementById("signOutBtn");

  if (!signInBtn || !signOutBtn) {
    console.error("Navbar auth buttons not found");
    return;
  }

  signInBtn.addEventListener("click", async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Sign in failed:", error);
      alert("Sign in failed.");
    }
  });

  signOutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      window.location.href = "index.html";
    } catch (error) {
      console.error("Sign out failed:", error);
      alert("Sign out failed.");
    }
  });

  onAuthStateChanged(auth, user => {
    if (user) {
      signInBtn.style.display = "none";
      signOutBtn.style.display = "inline-flex";
    } else {
      signInBtn.style.display = "inline-flex";
      signOutBtn.style.display = "none";
    }
  });
}

function setupAdminVisibility() {
  const adminLink = document.querySelector('.nav-link[data-page="admin"]');
  if (!adminLink) return;

  onAuthStateChanged(auth, user => {
    const userEmail = user?.email || "";
    const isAdmin = isAdminEmail(userEmail);

    adminLink.style.display = isAdmin ? "inline-flex" : "none";
  });
}

export function initNavbar(onTabChange) {
  setActiveNavLink();
  renderDashboardMenu(onTabChange);
  setupDashboardBehavior();
  setupAuthButtons();
  setupAdminVisibility();
}