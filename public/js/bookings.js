// bookings.js

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("rateModal");
  const form = document.getElementById("rateForm");
  const fieldsWrap = document.getElementById("rateFields");
  const toastWrap = document.getElementById("toast-container");

  // Open modal with players list
  document.querySelectorAll(".btn-rate").forEach((btn) => {
    btn.addEventListener("click", () => {
      const bookingId = btn.dataset.bookingId;
      const players = JSON.parse(btn.dataset.players);

      fieldsWrap.innerHTML = "";
      players.forEach((player) => {
        if (!player.isHost) {
          const group = document.createElement("div");
          group.className = "mb-3";

          const html = `
            <label class="form-label fw-bold">${player.username}:</label>
            <div class="d-flex align-items-center mb-1 star-container" data-user-id="${player.userId}">
              ${[1, 2, 3, 4, 5]
              .map(
                (n) => `
                <i class="bi bi-star star me-1" data-score="${n}" style="cursor:pointer;font-size:1.2rem;"></i>
              `
              )
              .join("")}
            </div>
            <textarea class="form-control review-input" name="review_${player.userId}" placeholder="Write a short review..."></textarea>
          `;

          group.innerHTML = html;
          fieldsWrap.appendChild(group);
        }
      });

      form.dataset.bookingId = bookingId;
      modal.style.display = "block";
    });
  });

  // // Close modal
  // document.getElementById("rateCancel").addEventListener("click", () => {
  //   modal.style.display = "none";
  // });

  // Star selection logic
  form.addEventListener("mouseover", (e) => {
    if (e.target.classList.contains("star")) {
      const container = e.target.closest(".star-container");
      const score = parseInt(e.target.dataset.score);
      highlightStars(container, score);
    }
  });

  form.addEventListener("mouseout", (e) => {
    if (e.target.classList.contains("star")) {
      const container = e.target.closest(".star-container");
      resetStars(container);
    }
  });

  form.addEventListener("click", (e) => {
    if (e.target.classList.contains("star")) {
      const container = e.target.closest(".star-container");
      container.dataset.selectedScore = e.target.dataset.score;
      highlightStars(container, parseInt(e.target.dataset.score));
    }
  });

  function highlightStars(container, score) {
    const stars = container.querySelectorAll(".star");
    stars.forEach((star, i) => {
      star.classList.toggle("text-warning", i < score);
    });
  }

  function resetStars(container) {
    const score = parseInt(container.dataset.selectedScore || 0);
    const stars = container.querySelectorAll(".star");
    stars.forEach((star, i) => {
      star.classList.toggle("text-warning", i < score);
    });
  }

  // Submit review form
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const bookingId = form.dataset.bookingId;
    const containers = form.querySelectorAll(".star-container");
    const ratings = [];

    containers.forEach((container) => {
      const userId = container.dataset.userId;
      const score = parseInt(container.dataset.selectedScore || 0);
      const review = form.querySelector(`[name='review_${userId}']`).value.trim();

      if (score > 0 || review) {
        ratings.push({ userId, score, review });
      }
    });

    if (ratings.length === 0) {
      showToast("Please provide at least one rating or review.", "error");
      return;
    }

    try {
      const res = await fetch("/profile/bookings/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, ratings }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to submit.");

      showToast("Feedback submitted successfully!", "success");
      setTimeout(() => location.reload(), 1200);
    } catch (err) {
      console.error(err);
      showToast(err.message, "error");
    }
  });

  function showToast(msg, type = "info", delay = 4000) {
    const toast = document.createElement("div");
    toast.className = `toast toast--${type} show`;
    toast.innerHTML = `${msg} <button class="btn-close ms-2" onclick="this.parentNode.remove()">&times;</button>`;
    toastWrap.appendChild(toast);
    setTimeout(() => toast.remove(), delay);
  }
});
