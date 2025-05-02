document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("rateModal");
  const form = document.getElementById("rateForm");
  const fieldsWrap = document.getElementById("rateFields");
  const toastWrap = document.getElementById("toast-container");

  document.querySelectorAll(".btn-rate").forEach((btn) => {
    btn.addEventListener("click", () => {
      const bookingId = btn.dataset.bookingId;
      const players = JSON.parse(btn.dataset.players);

      console.log(players);

      fieldsWrap.innerHTML = "";
      players.forEach((player) => {
        const group = document.createElement("div");
        group.className = "mb-2";

        group.innerHTML = `
          <label class="form-label fw-bold">${
            player.username || "Player"
          }:</label>
          <select name="rating_${player.userId}" class="form-select"> 
            <option value="">Rate...</option>
            ${[5, 4, 3, 2, 1]
              .map((n) => `<option value="${n}">${n} ★</option>`)
              .join("")}
          </select>
        `;

        fieldsWrap.appendChild(group);
      });

      form.dataset.bookingId = bookingId;
      modal.style.display = "block";
    });
  });

  // Cancel Rating
  document.getElementById("rateCancel").addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Submit Ratings
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const bookingId = form.dataset.bookingId;
    const ratings = [];

    const formData = new FormData(form);

    formData.forEach((value, key) => {
      if (key.startsWith("rating_") && value !== "") {
        // Only if user actually rated
        const userId = key.replace("rating_", "");
        ratings.push({
          userId: userId,
          score: parseInt(value),
        });
      }
    });

    if (!ratings.length) {
      return showToast("Please select at least one rating.", "error");
    }

    console.log("Submitting ratings:", ratings);

    try {
      const res = await fetch("/profile/bookings/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ bookingId, ratings }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to submit rating");

      showToast("Ratings submitted successfully!", "success");
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      console.error(err);
      showToast(err.message, "error");
    }
  });

  // Toast function
  function showToast(msg, type = "info", delay = 4000) {
    const toast = document.createElement("div");
    toast.className = `toast toast--${type} show`;
    toast.innerHTML = `${msg} <button class="btn-close ms-2" onclick="this.parentNode.remove()">×</button>`;
    toastWrap.appendChild(toast);
    setTimeout(() => toast.remove(), delay);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  // Toggle rating panel
  document.querySelectorAll(".rate-players-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const bookingId = btn.getAttribute("data-booking-id");
      const panel = document.getElementById(`rate-players-${bookingId}`);
      panel.classList.toggle("d-none");
    });
  });

  // Star selection
  document.querySelectorAll(".stars:not(.disabled)").forEach((container) => {
    const stars = container.querySelectorAll(".star");

    stars.forEach((star) => {
      star.addEventListener("mouseenter", () => {
        const score = parseInt(star.dataset.score);
        stars.forEach((s, i) => {
          s.classList.toggle("selected", i < score);
        });
      });

      container.addEventListener("mouseleave", () => {
        const selectedScore = parseInt(container.dataset.selectedScore || 0);
        stars.forEach((s, i) => {
          s.classList.toggle("selected", i < selectedScore);
        });
      });

      star.addEventListener("click", () => {
        const score = parseInt(star.dataset.score);
        container.dataset.selectedScore = score;
        stars.forEach((s, i) => {
          s.classList.toggle("selected", i < score);
        });
      });
    });
  });

  // Submit ratings
  document.querySelectorAll(".rate-form").forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const bookingId = form.dataset.bookingId;
      const starsContainers = form.querySelectorAll(".stars");

      const ratings = [];

      starsContainers.forEach((container) => {
        const userId = container.dataset.userId;
        const score = parseInt(container.dataset.selectedScore || 0);
        const alreadyRated = container.dataset.rated === "true";

        if (!alreadyRated && score > 0) {
          ratings.push({ userId, score });
        }
      });

      if (ratings.length === 0) {
        alert("Please select a rating for at least one player.");
        return;
      }

      try {
        const response = await fetch("/profile/bookings/rate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ bookingId, ratings }),
        });

        const result = await response.json();
        if (result.success) {
          alert("Ratings submitted successfully!");
          // Disable all after submission
          starsContainers.forEach((c) => c.classList.add("disabled"));
        } else {
          alert("Failed to submit ratings. " + result.error);
        }
      } catch (err) {
        console.error("Error submitting ratings:", err);
        alert("Server error occurred.");
      }
    });
  });
});
