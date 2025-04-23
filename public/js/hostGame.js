// for selecting custom sports for host game

const form = document.getElementById('hostGameForm');
const sportSelect = document.getElementById('sportSelect');
const customSport = document.getElementById('customSport');

sportSelect.addEventListener('change', () => {
  customSport.style.display = sportSelect.value === 'Other' ? 'block' : 'none';
});

form.addEventListener('submit', async (e) => {


  e.preventDefault();

  console.log("cliked")

  const errors = [];
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  // Clean + Convert fields
  data.playersRequired = Number(data.playersRequired || 0);
  data.costPerHead = Number(data.costPerHead || 0);

  if (!data.title.trim()) {

    showToast("Game Title is required", "error");
    return;
  };
  if (!data.sport) {
    showToast("Sport is required", "error");
    return;
  }
  if (data.sport === "Other" && !data.customSport.trim()) {
    showToast("Custom sport name is required", "error");
    return;
  }
  if (!data.venue.trim()) {
    showToast("Venue is required", "error");
    return;
  }
  if (!data.gameDate) {
    showToast("Game date is required", "error");
    return;
  }

  const today = new Date().toISOString().split("T")[0];
  if (data.gameDate < today) {
    showToast("Game date cannot be in the past", "error");
    return;
  }

  if (!data.startTime || !data.endTime) {
    showToast("Start and end times are required", "error");
    return;
  }
  if (data.startTime >= data.endTime) {
    showToast("End time must be after start time", "error");
    return;
  }

  if (data.playersRequired <= 0) {
    showToast("Players required must be more than 0", "error");
    return;
  }
  if (!data.skillLevel) {
    showToast("Skill level is required", "error");
    return;
  }
  if (!data.location.trim()) {
    showToast("Location is required", "error");
    return;
  }
  if (data.costPerHead < 0) {
    showToast("Cost per head must be positive", "error");
    return;
  }

  if (errors.length > 0) {
    // Show all errors
    errors.forEach(err => showToast(err, 'error'));
    return;
  }

  // Adjust sport field if 'Other' selected
  if (data.sport === "Other") data.sport = data.customSport;

  // Handle checkboxes
  data.bringEquipment = form.bringEquipment.checked;
  data.costShared = form.costShared.checked;

  // Send AJAX request
  try {
    const response = await fetch("/host", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) throw new Error(result.error || "Something went wrong");

    showToast("✅ Game hosted successfully!", "success");
    form.reset();
    customSport.style.display = "none";
  } catch (error) {
    showToast(error.message, 'danger');
  }
});


function showToast(message, type = "info", duration = 10000) {
  const container = document.getElementById("toast-container");

  if (!container) {
    console.warn("Toast container not found.");
    return;
  }

  // Create toast element
  const toast = document.createElement("div");
  toast.className = `toast toast--${type} show`;
  // toast.className = `toast toast--${type}`;
  toast.innerHTML = `
      <span>${message}</span>
      <button class="toast__close" aria-label="Close">&times;</button>
    `;

  // Add toast to DOM
  container.appendChild(toast);

  // Force a repaint to trigger animation
  // requestAnimationFrame(() => {
  //   toast.style.opacity = "1";
  // });

  // Auto remove after duration
  const timeoutId = setTimeout(() => {
    toast.classList.add("fade-out");
    setTimeout(() => toast.remove(), 300); // match fade duration
  }, duration);

  // Close button manually removes toast
  toast.querySelector(".toast__close").addEventListener("click", () => {
    clearTimeout(timeoutId);
    toast.classList.add("fade-out");
    setTimeout(() => toast.remove(), 300);
  });
}

