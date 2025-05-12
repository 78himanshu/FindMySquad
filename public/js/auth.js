document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signupForm");
  const loginForm = document.getElementById("loginForm");

  const passwordInput = document.getElementById("password");
  const confirmInput = document.getElementById("passwordConfirm");

  // ------------------ PASSWORD VISIBILITY TOGGLE ------------------ //
  // Password toggle eye icon
  document.querySelectorAll(".toggle-password").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = btn.parentElement.querySelector("input");
      const icon = btn.querySelector(".eye-icon");

      if (input.type === "password") {
        input.type = "text";
        icon.setAttribute("data-state", "visible");
      } else {
        input.type = "password";
        icon.setAttribute("data-state", "hidden");
      }
    });
  });

  // ------------------ SIGNUP ------------------ //
  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const submitButton = signupForm.querySelector(".submit-button");
      submitButton.disabled = true;
      submitButton.textContent = "Signing up...";

      const isValid = validateSignupForm();
      if (!isValid) {
        submitButton.disabled = false;
        submitButton.textContent = "Sign Up";
        return;
      }

      const username = document.getElementById("username").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = passwordInput.value;
      const confirmPassword = confirmInput.value;

      try {
        const response = await fetch("/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password, confirmPassword }),
        });

        const data = await response.json();

        if (!response.ok) {
          if (data.errors) {
            Object.entries(data.errors).forEach(([field, message]) => {
              const errorDiv = document.getElementById(`${field}Error`);
              if (errorDiv) errorDiv.textContent = message;
            });
          } else {
            showToast(data.error || "Signup failed", "error");
          }
          return;
        }

        showToast("Signup successful! Redirecting...", "success");

        setTimeout(() => {
          if (data.redirect) {
            window.location.href = data.redirect; // redirect to /profile/addprofile
          } else {
            window.location.href = "/login"; // fallback
          }
        }, 1500);
      } catch (error) {
        showToast(error.message || "Something went wrong", "error");
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Sign Up";
      }
    });
  }

  // ------------------ LOGIN ------------------ //
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const emailInput = document.getElementById("email");
      const passwordInput = document.getElementById("password");
      const redirectInput = document.getElementById("redirectInput");

      const email = emailInput.value.trim();
      const password = passwordInput.value;
      const redirect = redirectInput?.value || "/";

      // Field error clear
      document
        .querySelectorAll(".form__error")
        .forEach((el) => (el.textContent = ""));
      // Client-side validation
      let isValid = true;

      if (!email) {
        showToast("Email is required", "error");
        isValid = false;
        return false;
      }

      if (!password) {
        showToast("Password is required", "error");
        isValid = false;
        return false;
      }

      const submitButton = loginForm.querySelector(".submit-button");
      submitButton.disabled = true;
      submitButton.textContent = "Signing In...";

      try {
        const response = await fetch("/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password, redirect }),
        });

        const data = await response.json();

        if (!response.ok) {
          if (data.errors) {
            Object.entries(data.errors).forEach(([field, message]) => {
              const errorDiv = document.getElementById(`${field}Error`);
              if (errorDiv) errorDiv.textContent = message;
            });
          } else {
            showToast(data.error || "Login failed", "error");
          }
          return;
        }

        showToast("Login successful! Redirecting...", "success");

        setTimeout(() => {
          if (data.redirect) {
            //  Redirect to the original page user intended (e.g., /host)
            window.location.href = data.redirect;
          } else if (data.user.profileCompleted) {
            // fallback logic if no redirect provided
            window.location.href = "/";
          } else {
            window.location.href = "/profile/addprofile";
          }
        }, 1500);
      } catch (error) {
        showToast(error.message || "Something went wrong", "error");
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = "LOG IN";
      }
    });
  }

  // ------------------ VALIDATION ------------------ //
  function validateSignupForm() {
    let isValid = true;

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmInput.value;

    // Username
    if (!/^[a-zA-Z0-9]{3,20}$/.test(username)) {
      showToast(
        "Username must be 3–20 characters (letters and numbers only)",
        "error"
      );
      return false;
    }

    // Email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast("Please enter a valid email address", "error");

      isValid = false;
      return false;
    }

    // Password Strength
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[\W_]/.test(password),
    };

    const strengthCount = Object.values(requirements).filter(Boolean).length;

    const passwordStrength = document.getElementById("passwordStrength");
    if (passwordStrength) {
      if (strengthCount <= 2) passwordStrength.textContent = "Strength: Weak";
      else if (strengthCount <= 4)
        passwordStrength.textContent = "Strength: Medium";
      else passwordStrength.textContent = "Strength: Strong";
    }

    if (!Object.values(requirements).every(Boolean)) {
      showToast(
        "Password must be 8+ characters, including uppercase, lowercase, number, and special characte",
        "error"
      );

      isValid = false;

      return false;
    }

    // Confirm Password
    if (password !== confirmPassword) {
      showToast("Passwords do not match", "error");

      isValid = false;
      return false;
    }

    return isValid;
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
  toast.innerHTML = `
    <span>${message}</span>
    <button class="toast__close" aria-label="Close">&times;</button>
  `;

  // Add toast to DOM
  container.appendChild(toast);

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
