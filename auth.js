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

function showAdmin() {
  document.getElementById("authGate").style.display = "none";
  document.getElementById("adminContent").style.display = "block";
}

function hideAdmin(message) {
  document.getElementById("authGate").style.display = "block";
  document.getElementById("adminContent").style.display = "none";
  document.getElementById("authMessage").textContent = message;
}

async function handleSignIn() {
  console.log("Sign-in button clicked");

  try {
    await signInWithPopup(auth, provider);
    console.log("Popup opened successfully");
  } catch (error) {
    console.error("Sign-in failed:", error);
    hideAdmin(`Sign-in failed: ${error.code || "unknown error"}`);
  }
}

async function handleSignOut() {
  console.log("Sign-out button clicked");

  try {
    await signOut(auth);
    console.log("Signed out");
  } catch (error) {
    console.error("Sign-out failed:", error);
    hideAdmin(`Sign-out failed: ${error.code || "unknown error"}`);
  }
}

function setupAuth(startAdmin) {
  const signInBtn = document.getElementById("signInBtn");
  const signOutBtn = document.getElementById("signOutBtn");

  console.log("signInBtn:", signInBtn);
  console.log("signOutBtn:", signOutBtn);

  if (!signInBtn || !signOutBtn) {
    console.error("Auth buttons not found in HTML");
    return;
  }

  signInBtn.addEventListener("click", handleSignIn);
  signOutBtn.addEventListener("click", handleSignOut);

  onAuthStateChanged(auth, async user => {
    console.log("Auth state changed:", user);

    if (!user) {
      hideAdmin("Please sign in with Google to access the admin page.");
      return;
    }

    const email = (user.email || "").toLowerCase();

    const isAllowed = ALLOWED_EMAILS.some(
      allowedEmail => allowedEmail.toLowerCase() === email
    );

    if (!isAllowed) {
      await signOut(auth);
      hideAdmin("This Google account is not authorized.");
      return;
    }

    showAdmin();
    startAdmin();
  });
}

export { setupAuth };