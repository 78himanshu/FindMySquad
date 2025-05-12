function initAutocomplete() {
  const input = document.getElementById("autocomplete");
  if (!input) return;
  const autocomplete = new google.maps.places.Autocomplete(input);
}
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("editProfileForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErrors();

    let isValid = true;
    const showError = (id, msg) => {
      document.getElementById(id).textContent = msg;
      isValid = false;
    };

    // Grab values
    const firstName = form.firstName.value.trim();
    const lastName = form.lastName.value.trim();
    const gender = form.gender.value;
    const bio = form.bio.value.trim();
    const city = form.city.value.trim();
    const phoneNumber = form.phoneNumber.value.trim();

    // 1) Name checks: letters only, 1–50
    const nameRe = /^[A-Za-z]{1,50}$/;
    if (!nameRe.test(firstName))
      showError("firstNameError", "First name 1–50 letters");
    if (!nameRe.test(lastName))
      showError("lastNameError", "Last name 1–50 letters");

    // 2) Gender
    if (!gender) showError("genderError", "Select a gender");

    // 3) Bio ≤ 300 chars
    if (bio.length > 300) showError("bioError", "Bio max 300 characters");

    // 5) City/State letters + spaces
    const locRe = /^[A-Za-z0-9\s,.-]{3,100}$/;
    if (city && !locRe.test(city))
      showError("cityError", "Location can have only letters/spaces");

    // 6) Phone number: 10 digits
    const phoneRe = /^\d{10}$/;
    if (phoneNumber && !phoneRe.test(phoneNumber))
      showError("phoneError", "Phone number 10 digits");

    if (!isValid) return;

    // Submit via AJAX
    const submitBtn = form.querySelector(".submit-button");
    submitBtn.disabled = true;
    submitBtn.textContent = "Saving...";

    try {
      const res = await fetch("/profile/", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          profile: { firstName, lastName, gender, bio, phoneNumber },
          location: { city },
        }),
      });

      const data = await res.json();

      // console.log("data", data);
      if (!res.ok) {
        showToast(data.error || "Update failed", "error");
      } else {
        showToast("Profile updated!", "success");
        setTimeout(() => (window.location = "/profile/view"), 1500);
      }
    } catch (err) {
      showToast("Network error", "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Save Changes";
    }
  });

  function clearErrors() {
    document
      .querySelectorAll(".form-text.text-danger")
      .forEach((el) => (el.textContent = ""));
  }
});

const followBtn = document.getElementById("followBtn");
if (followBtn) {
  followBtn.addEventListener("click", async () => {
    const targetId = followBtn.dataset.userId;
    const isFollowing = followBtn.dataset.following === "true";
    const action = isFollowing ? "unfollow" : "follow";

    try {
      const res = await fetch(`/profile/${action}/${targetId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok)
        throw new Error(json.error || "Failed to update follow status");

      // Toggle UI
      followBtn.dataset.following = (!isFollowing).toString();
      followBtn.textContent = isFollowing ? "Follow" : "Following";
      followBtn.classList.toggle("btn-primary");
      followBtn.classList.toggle("btn-outline-primary");

      // Update follower count
      const countEl = document.getElementById("followersCount");
      if (countEl) countEl.textContent = json.followersCount;
    } catch (err) {
      alert(err.message);
    }
  });
}

// Reuse your existing toast helper from auth.js:
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

window.initAutocomplete = initAutocomplete;

document
  .getElementById("editProfileForm")
  .addEventListener("submit", function (e) {
    const phoneInput = document.getElementById("phoneNumber");
    const phoneError = document.getElementById("phoneError");

    const phonePattern =
      /^(\+?1\s?)?(\(\d{3}\)|\d{3})[\s.-]?\d{3}[\s.-]?\d{4}$/;

    if (!phonePattern.test(phoneInput.value.trim())) {
      e.preventDefault();
      phoneError.textContent =
        "Please enter a valid phone number (e.g., 123-456-7890, (123) 456-7890)";
      phoneInput.classList.add("is-invalid");
    } else {
      phoneError.textContent = "";
      phoneInput.classList.remove("is-invalid");
    }
  });
