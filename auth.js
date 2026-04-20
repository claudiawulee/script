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
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error("Sign-in failed:", error);
    hideAdmin("Sign-in failed. Please try again.");
  }
}

async function handleSignOut() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Sign-out failed:", error);
  }
}

function setupAuth(startAdmin) {
  const signInBtn = document.getElementById("signInBtn");
  const signOutBtn = document.getElementById("signOutBtn");

  signInBtn.addEventListener("click", handleSignIn);
  signOutBtn.addEventListener("click", handleSignOut);

  onAuthStateChanged(auth, async user => {
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