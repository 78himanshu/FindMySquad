document.addEventListener("DOMContentLoaded", () => {
  const rateModal = new bootstrap.Modal(document.getElementById("rateModal"));
  const form = document.getElementById("rateForm");
  const fieldsWrap = document.getElementById("rateFields");

  document.querySelectorAll(".btn-rate").forEach((btn) => {
    btn.addEventListener("click", () => {
      const bookingId = btn.dataset.bookingId;
      const players = JSON.parse(btn.dataset.players);
      const hostId = btn.dataset.host;
      fieldsWrap.innerHTML = "";

      players.forEach((player) => {
        if (String(player._id) === String(hostId)) return; // ⛔ Skip logged-in user

        const group = document.createElement("div");
        group.className = "mb-4";

        // Stars: disabled if already rated
        let starsHtml = `<div class="stars mb-2 ${player.hasBeenRated ? "disabled" : ""}" data-user-id="${player._id}">`;
        for (let i = 1; i <= 5; i++) {
          const selected = i <= player.ratedScore ? "selected" : "";
          const dataAttr = player.hasBeenRated ? "" : `data-score="${i}"`;
          starsHtml += `<i class="bi bi-star-fill star me-1 ${selected}" ${dataAttr}></i>`;
        }
        starsHtml += `</div>`;

        const disabledAttr = player.hasBeenRated ? "disabled" : "";

        group.innerHTML = `
          <label class="form-label fw-bold">${player.username}</label>
          ${starsHtml}
          <input type="hidden" name="rating_${player._id}" value="${player.hasBeenRated ? player.ratedScore : ""}">
          <textarea name="review_${player._id}" class="form-control" rows="2" placeholder="Write a review..." ${disabledAttr}>${player.hasBeenRated ? player.review : ""}</textarea>
          ${player.hasBeenRated ? '<p class="text-muted small fst-italic">You have already rated this player.</p>' : ""}
        `;

        fieldsWrap.appendChild(group);
      });

      form.dataset.bookingId = bookingId;
      rateModal.show();
    });
  });

  // Interactive Stars Logic
  fieldsWrap.addEventListener("click", (e) => {
    if (e.target.classList.contains("star") && !e.target.closest(".stars").classList.contains("disabled")) {
      const clickedStar = e.target;
      const selectedScore = parseInt(clickedStar.dataset.score);
      const starsContainer = clickedStar.closest(".stars");
      const userId = starsContainer.dataset.userId;

      starsContainer.querySelectorAll(".star").forEach((star) => {
        const score = parseInt(star.dataset.score);
        star.classList.toggle("selected", score <= selectedScore);
      });

      const hiddenInput = document.querySelector(`input[name="rating_${userId}"]`);
      if (hiddenInput) hiddenInput.value = selectedScore;
    }
  });

  // Submit Review & Rating
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const bookingId = form.dataset.bookingId;
    const formData = new FormData(form);
    const payload = { bookingId, ratings: [] };

    for (let [key, value] of formData.entries()) {
      if (key.startsWith("rating_")) {
        const userId = key.split("_")[1];
        const rating = parseInt(value);
        const review = formData.get(`review_${userId}`) || "";
        if (rating > 0) {
          payload.ratings.push({ userId, rating, review });
        }
      }
    }

    try {
      const response = await fetch("/profile/bookings/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Ratings submitted successfully!");
        rateModal.hide();
        form.reset();
      } else {
        alert(result.message || "Something went wrong!");
      }
    } catch (err) {
      console.error("AJAX Error:", err);
      alert("Error submitting ratings. Please try again.");
    }
  });
});
