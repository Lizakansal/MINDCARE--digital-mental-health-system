const API_BASE_URL = 'http://127.0.0.1:5000';

// Get token from URL (?token=abc123)
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get("token");

// Elements
const form = document.getElementById('resetForm');
const passEl = document.getElementById('newPassword');
const confirmEl = document.getElementById('confirmPassword');
const btn = document.getElementById('resetBtn');
const toggleBtn = document.getElementById('togglePassword');
const eyeIcon = document.getElementById('eyeIcon');

// Error handling
function setError(groupId, errorId, message) {
    const group = document.getElementById(groupId);
    const error = document.getElementById(errorId);

    group.classList.add('error');
    group.classList.remove('success');
    error.textContent = message;
}

function setSuccess(groupId, errorId) {
    const group = document.getElementById(groupId);
    const error = document.getElementById(errorId);

    group.classList.remove('error');
    group.classList.add('success');
    error.textContent = '';
}

// Validation
function validatePassword() {
    const pass = passEl.value;

    if (!pass) {
        setError('passwordGroup', 'passwordError', 'Password is required.');
        return false;
    }

    if (pass.length < 6) {
        setError('passwordGroup', 'passwordError', 'Minimum 6 characters required.');
        return false;
    }

    setSuccess('passwordGroup', 'passwordError');
    return true;
}

function validateConfirm() {
    if (!confirmEl.value) {
        setError('confirmGroup', 'confirmError', 'Please confirm your password.');
        return false;
    }

    if (confirmEl.value !== passEl.value) {
        setError('confirmGroup', 'confirmError', 'Passwords do not match.');
        return false;
    }

    setSuccess('confirmGroup', 'confirmError');
    return true;
}

// Toggle password visibility
toggleBtn.addEventListener('click', () => {
    const hidden = passEl.type === 'password';

    passEl.type = hidden ? 'text' : 'password';
    confirmEl.type = hidden ? 'text' : 'password';

    eyeIcon.className = hidden
        ? 'fa-solid fa-eye-slash'
        : 'fa-solid fa-eye';
});

// Submit form
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!token) {
        alert("Invalid or missing reset token.");
        return;
    }

    if (!validatePassword() || !validateConfirm()) return;

    btn.disabled = true;
    btn.querySelector('.btn-text').textContent = 'Resetting...';

    try {
        const response = await fetch(`${API_BASE_URL}/reset-password/${token}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                password: passEl.value
            })
        });

        const data = await response.json();

        if (!response.ok) {
            setError('passwordGroup', 'passwordError', data.error || data.message || 'Reset failed.');
            btn.disabled = false;
            btn.querySelector('.btn-text').textContent = 'Reset Password';
            return;
        }

        // Success
        btn.querySelector('.btn-text').textContent = 'Password Updated!';

        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);

    } catch (error) {
        setError('passwordGroup', 'passwordError', 'Network error. Please try again.');
        btn.disabled = false;
        btn.querySelector('.btn-text').textContent = 'Reset Password';
        console.error(error);
    }
});