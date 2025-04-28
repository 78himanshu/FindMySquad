// for selecting custom sports for host game
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".host-game-form");
  const customSportInput = document.getElementById("customSport");
  const sportSelect = document.getElementById("sportSelect");
  const costInput = document.querySelector("input[name='costPerHead']");
  const hostId = document.querySelector("input[name='host']").value;

  // Redirect to login if user not logged in
  if (!hostId) {
    window.location.href = "/login?redirect=/host";
  }

  // Show/hide custom sport input
  sportSelect.addEventListener("change", () => {
    if (sportSelect.value === "Other") {
      customSportInput.style.display = "block";
      customSportInput.required = true;
    } else {
      customSportInput.style.display = "none";
      customSportInput.required = false;
    }
  });

  // Form validation
  form.addEventListener("submit", (e) => {
    const startTime = form.startTime.value;
    const endTime = form.endTime.value;

    if (startTime >= endTime) {
      alert("End time must be after start time.");
      e.preventDefault();
      return;
    }

    if (form.costPerHead.value === "" || isNaN(form.costPerHead.value)) {
      alert("Cost per Head must be a number.");
      e.preventDefault();
      return;
    }

    if (
      form.playersRequired.value === "" ||
      isNaN(form.playersRequired.value)
    ) {
      alert("Players Required must be a number.");
      e.preventDefault();
      return;
    }
  });
});