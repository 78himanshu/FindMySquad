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
          <label class="form-label fw-bold">${player.username || "Player"
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



document.addEventListener('DOMContentLoaded', () => {
  // Toggle rate player panel
  document.querySelectorAll('.rate-players-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const bookingId = btn.dataset.bookingId;
      const panel = document.getElementById(`rate-players-${bookingId}`);
      panel.classList.toggle('d-none');
    });
  });

  // Handle stars click
  document.querySelectorAll('.rating-stars').forEach(stars => {
    stars.addEventListener('click', (e) => {
      if (e.target.matches('i')) {
        const score = parseInt(e.target.dataset.score);
        const allStars = stars.querySelectorAll('i');
        allStars.forEach((star, idx) => {
          if (idx < score) {
            star.classList.remove('fa-regular');
            star.classList.add('fa-solid');
          } else {
            star.classList.add('fa-regular');
            star.classList.remove('fa-solid');
          }
        });
        stars.dataset.selectedScore = score;
      }
    });
  });

  // Handle submit rating
  document.querySelectorAll('.rate-form').forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const bookingId = form.dataset.bookingId;
      const ratings = [];

      form.querySelectorAll('.rating-stars').forEach(starDiv => {
        const score = parseInt(starDiv.dataset.selectedScore || 0);
        if (score > 0) {
          ratings.push({
            userId: starDiv.dataset.userId,
            score
          });
        }
      });

      if (ratings.length === 0) {
        alert('Please rate at least one player.');
        return;
      }

      try {
        const res = await fetch('/profile/bookings/rate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId, ratings })
        });

        const data = await res.json();
        if (data.success) {
          alert('✅ Ratings submitted successfully!');
          form.closest('.rate-players-panel').classList.add('d-none');
        } else {
          throw new Error(data.error || 'Something went wrong');
        }
      } catch (err) {
        alert(`❌ ${err.message}`);
      }
    });
  });
});

