export async function loadNavbar() {
  const container = document.getElementById("navbar-container");
  if (!container) return;

  try {
    const response = await fetch("navbar.html");
    const html = await response.text();
    container.innerHTML = html;
  } catch (err) {
    console.error("Failed to load navbar:", err);
  }
}