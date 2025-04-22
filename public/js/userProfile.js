<<<<<<< HEAD
// document.addEventListener('DOMContentLoaded', () => {
//     console.log("User Profile Loaded");
  
//     // Future actions like edit profile functionality etc can go here.
//   });
  


// public/js/userProfile.js

// document.addEventListener('DOMContentLoaded', () => {
//     const form = document.getElementById('editProfileForm');
  
//     form.addEventListener('submit', (e) => {
//       // Prevent actual submission to validate first
//       e.preventDefault();
//       clearErrors();
  
//       let isValid = true;
  
//       // Helper to show errors
//       const showError = (id, msg) => {
//         document.getElementById(id).textContent = msg;
//       };
  
//       // Field values
//       const firstName = form.firstName.value.trim();
//       const lastName = form.lastName.value.trim();
//       const gender = form.gender.value;
//       const bio = form.bio.value.trim();
//       const avatar = form.avatar.value.trim();
//       const city = form.city.value.trim();
//       const state = form.state.value.trim();
//       const zip = form.zipCode.value.trim();
  
//       // 1. First & Last Name: letters only, 1–50 chars
//       const nameRegex = /^[A-Za-z]{1,50}$/;
//       if (!nameRegex.test(firstName)) {
//         showError('firstNameError', 'First name should be 1–50 letters.');
//         isValid = false;
//       }
//       if (!nameRegex.test(lastName)) {
//         showError('lastNameError', 'Last name should be 1–50 letters.');
//         isValid = false;
//       }
  
//       // 2. Gender: must select
//       if (!gender) {
//         showError('genderError', 'Please select a gender.');
//         isValid = false;
//       }
  
//       // 3. Bio: max 300 chars
//       if (bio.length > 300) {
//         showError('bioError', 'Bio cannot exceed 300 characters.');
//         isValid = false;
//       }
  
//       // 4. Avatar: valid URL if provided
//       if (avatar) {
//         try {
//           new URL(avatar);
//         } catch {
//           showError('avatarError', 'Please enter a valid URL.');
//           isValid = false;
//         }
//       }
  
//       // 5. City & State: non-empty, letters/spaces only
//       const locationRegex = /^[A-Za-z\s]{1,100}$/;
//       if (city && !locationRegex.test(city)) {
//         showError('cityError', 'City can only contain letters and spaces.');
//         isValid = false;
//       }
//       if (state && !locationRegex.test(state)) {
//         showError('stateError', 'State can only contain letters and spaces.');
//         isValid = false;
//       }
  
//       // 6. Zip Code: 5 digits
//       if (zip && !/^\d{5}$/.test(zip)) {
//         showError('zipCodeError', 'Zip code must be 5 digits.');
//         isValid = false;
//       }
  
//       // If all valid, submit form
//       if (isValid) {
//         form.submit();
//       }
//     });
  
//     function clearErrors() {
//       document.querySelectorAll('.form__error').forEach(el => el.textContent = '');
//     }
//   });
  




// public/js/userProfile.js

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
      const avatar = form.avatar.value.trim();
      const city = form.city.value.trim();
      const state = form.state.value.trim();
      const zip = form.zipCode.value.trim();
  
      // 1) Name checks: letters only, 1–50
      const nameRe = /^[A-Za-z]{1,50}$/;
      if (!nameRe.test(firstName)) showError("firstNameError", "First name 1–50 letters");
      if (!nameRe.test(lastName)) showError("lastNameError", "Last name 1–50 letters");
  
      // 2) Gender
      if (!gender) showError("genderError", "Select a gender");
  
      // 3) Bio ≤ 300 chars
      if (bio.length > 300) showError("bioError", "Bio max 300 characters");
  
      // 4) Avatar URL
      if (avatar) {
        try { new URL(avatar); }
        catch { showError("avatarError", "Invalid URL"); }
      }
  
      // 5) City/State letters + spaces
      const locRe = /^[A-Za-z\s]{1,100}$/;
      if (city && !locRe.test(city)) showError("cityError", "City only letters/spaces");
      if (state && !locRe.test(state)) showError("stateError", "State only letters/spaces");
  
      // 6) Zip 5 digits
      if (zip && !/^\d{5}$/.test(zip)) showError("zipCodeError", "Zip must be 5 digits");
  
      if (!isValid) return;
  
      // Submit via AJAX
      const submitBtn = form.querySelector(".submit-button");
      submitBtn.disabled = true;
      submitBtn.textContent = "Saving...";
  
      try {
        const res = await fetch("/profile/edit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            profile: { firstName, lastName, gender, bio, avatar },
            location: { city, state, zipCode: zip }
          }),
        });
  
        const data = await res.json();
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
      document.querySelectorAll(".form-text.text-danger").forEach(el => (el.textContent = ""));
    }
  });
  
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
=======
document.addEventListener('DOMContentLoaded', () => {
    console.log("User Profile Loaded");
  
    // Future actions like edit profile functionality etc can go here.
  });
>>>>>>> Join_Game
  