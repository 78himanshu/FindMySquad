document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('passwordConfirm');
    
    // Toggle password visibility
    document.querySelectorAll('.toggle-password').forEach(button => {
        button.addEventListener('click', () => {
            const input = button.previousElementSibling;
            input.type = input.type === 'password' ? 'text' : 'password';
        });
    });
    
    // Real-time password validation
    passwordInput.addEventListener('input', validatePassword);
    confirmInput.addEventListener('input', validatePasswordMatch);
    
    // Form submission
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Clear previous errors
        document.querySelectorAll('.form__error').forEach(el => el.textContent = '');
        
        // Validate inputs
        const isValid = validateForm();
        if (!isValid) return;
        
        // Prepare form data
        const formData = {
            username: document.getElementById('username').value.trim(),
            email: document.getElementById('email').value.trim(),
            password: passwordInput.value
        };
        
        try {
            const response = await fetch('/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }
            
            // Redirect on success
            window.location.href = '/';
        } catch (error) {
            document.getElementById('error-messages').textContent = error.message;
        }
    });
    
    function validateForm() {
        let isValid = true;
        
        // Validate username
        const username = document.getElementById('username').value.trim();
        if (!/^[a-zA-Z0-9]{3,20}$/.test(username)) {
            document.getElementById('usernameError').textContent = 
                'Username must be 3-20 characters (letters and numbers only)';
            isValid = false;
        }
        
        // Validate email
        const email = document.getElementById('email').value.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            document.getElementById('emailError').textContent = 'Please enter a valid email';
            isValid = false;
        }
        
        // Validate password
        if (!validatePassword()) isValid = false;
        if (!validatePasswordMatch()) isValid = false;
        
        return isValid;
    }
    
    function validatePassword() {
        const password = passwordInput.value;
        const requirements = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[\W_]/.test(password)
        };
        
        if (!Object.values(requirements).every(Boolean)) {
            document.getElementById('passwordError').textContent = 
                'Password must contain: uppercase, lowercase, number, and special character';
            return false;
        }
        
        document.getElementById('passwordError').textContent = '';
        return true;
    }
    
    function validatePasswordMatch() {
        if (passwordInput.value !== confirmInput.value) {
            document.getElementById('confirmError').textContent = 'Passwords do not match';
            return false;
        }
        document.getElementById('confirmError').textContent = '';
        return true;
    }
});