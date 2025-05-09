// This file contains common JavaScript functions used across the application
function showToast(message, type = "info", duration = 5000) {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = `toast toast--${type} show`;
  toast.innerHTML = `
        <span>${message}</span>
        <button class="toast__close">&times;</button>
      `;
  container.appendChild(toast);
  const id = setTimeout(() => {
    toast.classList.add("fade-out");
    setTimeout(() => toast.remove(), 300);
  }, duration);
  toast.querySelector(".toast__close").onclick = () => {
    clearTimeout(id);
    toast.remove();
  };
}
