document.addEventListener("DOMContentLoaded", () => {
    const signupForm = document.getElementById("signupForm");
    const loginForm = document.getElementById("loginForm");
  
    const passwordInput = document.getElementById("password");
    const confirmInput = document.getElementById("passwordConfirm");
  
    // Toggle password visibility
    document.querySelectorAll(".toggle-password").forEach((button) => {
      button.addEventListener("click", () => {
        const input = button.previousElementSibling;
        if (input && input.type === "password") {
          input.type = "text";
        } else if (input) {
          input.type = "password";
        }
      });
    });
  
    // ------------------ SIGNUP ------------------ //
    if (signupForm) {
      signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();
  
        // Clear all previous errors
        document.querySelectorAll(".form__error").forEach((el) => (el.textContent = ""));
        const signupError = document.getElementById("error-messages");
        if (signupError) signupError.textContent = "";
  
        // Run validations
        const isValid = validateSignupForm();
        if (!isValid) return;
  
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
          if (!response.ok) throw new Error(data.error || "Signup failed");
  
          // Redirect after success
          window.location.href = "/";
        } catch (error) {
          if (signupError) signupError.textContent = error.message;
        }
      });
    }
  
    // ------------------ LOGIN ------------------ //
    if (loginForm) {
      loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
  
        const loginError = document.getElementById("error-messages");
        if (loginError) loginError.textContent = "";
  
        try {
          const response = await fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              email: document.getElementById("email").value.trim(),
              password: document.getElementById("password").value,            }),
          });
  
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || "Login failed");
  
          window.location.href = "/";
        } catch (error) {
          if (loginError) loginError.textContent = error.message;
        }
      });
    }
  
    // ------------------ Signup Form Validation ------------------ //
    function validateSignupForm() {
      let isValid = true;
  
      const username = document.getElementById("username").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = passwordInput.value;
      const confirmPassword = confirmInput.value;
  
      // Username
      if (!/^[a-zA-Z0-9]{3,20}$/.test(username)) {
        document.getElementById("usernameError").textContent =
          "Username must be 3–20 characters (letters and numbers only)";
        isValid = false;
      }
  
      // Email
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        document.getElementById("emailError").textContent =
          "Please enter a valid email address";
        isValid = false;
      }
  
      // Password strength
      const requirements = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
        special: /[\W_]/.test(password),
      };
  
      if (!Object.values(requirements).every(Boolean)) {
        document.getElementById("passwordError").textContent =
          "Password must be 8+ characters, including uppercase, lowercase, number, and special character";
        isValid = false;
      }
  
      // Confirm password
      if (password !== confirmPassword) {
        document.getElementById("confirmError").textContent = "Passwords do not match";
        isValid = false;
      }
  
      return isValid;
    }
  });
  