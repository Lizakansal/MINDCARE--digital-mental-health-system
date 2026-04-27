// const API_BASE_URL = 'http://127.0.0.1:5000';

// const form = document.getElementById('forgotForm');
// const emailEl = document.getElementById('email');
// const passEl = document.getElementById('newPassword');
// const confirmEl = document.getElementById('confirmPassword');
// const btn = document.getElementById('resetBtn');
// const toggleBtn = document.getElementById('togglePassword');
// const eyeIcon = document.getElementById('eyeIcon');

// function setError(groupId, errorId, message) {
//     const group = document.getElementById(groupId);
//     const error = document.getElementById(errorId);
//     group.classList.add('error');
//     group.classList.remove('success');
//     error.textContent = message;
// }

// function setSuccess(groupId, errorId) {
//     const group = document.getElementById(groupId);
//     const error = document.getElementById(errorId);
//     group.classList.remove('error');
//     group.classList.add('success');
//     error.textContent = '';
// }

// function validateEmail() {
//     const email = emailEl.value.trim().toLowerCase();
//     const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!email) {
//         setError('emailGroup', 'emailError', 'Email is required.');
//         return false;
//     }
//     if (!emailRe.test(email)) {
//         setError('emailGroup', 'emailError', 'Please enter a valid email.');
//         return false;
//     }
//     setSuccess('emailGroup', 'emailError');
//     return true;
// }

// function validatePassword() {
//     const pass = passEl.value;
//     if (!pass) {
//         setError('passwordGroup', 'passwordError', 'New password is required.');
//         return false;
//     }
//     if (pass.length < 6) {
//         setError('passwordGroup', 'passwordError', 'Password must be at least 6 characters.');
//         return false;
//     }
//     setSuccess('passwordGroup', 'passwordError');
//     return true;
// }

// function validateConfirm() {
//     if (!confirmEl.value) {
//         setError('confirmGroup', 'confirmError', 'Please confirm your new password.');
//         return false;
//     }
//     if (confirmEl.value !== passEl.value) {
//         setError('confirmGroup', 'confirmError', 'Passwords do not match.');
//         return false;
//     }
//     setSuccess('confirmGroup', 'confirmError');
//     return true;
// }

// toggleBtn.addEventListener('click', () => {
//     const hidden = passEl.type === 'password';
//     passEl.type = hidden ? 'text' : 'password';
//     confirmEl.type = hidden ? 'text' : 'password';
//     eyeIcon.className = hidden ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
// });

// form.addEventListener('submit', async (e) => {
//     e.preventDefault();
//     if (!validateEmail() || !validatePassword() || !validateConfirm()) return;

//     btn.disabled = true;
//     btn.querySelector('.btn-text').textContent = 'Resetting...';

//     try {
//         const response = await fetch(`${API_BASE_URL}/api/forgot-password`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//                 email: emailEl.value.trim().toLowerCase(),
//                 newPassword: passEl.value
//             })
//         });

//         const data = await response.json();
//         if (!response.ok) {
//             setError('emailGroup', 'emailError', data.error || 'Could not reset password.');
//             btn.disabled = false;
//             btn.querySelector('.btn-text').textContent = 'Reset Password';
//             return;
//         }

//         btn.querySelector('.btn-text').textContent = 'Password Updated!';
//         setTimeout(() => {
//             window.location.href = 'login.html';
//         }, 1200);
//     } catch (err) {
//         setError('emailGroup', 'emailError', 'Network error. Please try again.');
//         btn.disabled = false;
//         btn.querySelector('.btn-text').textContent = 'Reset Password';
//     }
// });



const API_BASE_URL = 'http://127.0.0.1:5000';

// Elements
const form = document.getElementById('forgotForm');
const emailEl = document.getElementById('email');
const btn = document.getElementById('submitBtn');

// Error handling
function setError(message) {
    document.getElementById('emailError').textContent = message;
    document.getElementById('emailGroup').classList.add('error');
}

function clearError() {
    document.getElementById('emailError').textContent = '';
    document.getElementById('emailGroup').classList.remove('error');
}

// Email validation
function validateEmail() {
    const email = emailEl.value.trim().toLowerCase();
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
        setError('Email is required.');
        return false;
    }

    if (!emailRe.test(email)) {
        setError('Please enter a valid email address.');
        return false;
    }

    clearError();
    return true;
}

// Form submit
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateEmail()) return;

    btn.disabled = true;
    btn.querySelector('.btn-text').textContent = 'Sending...';

    try {
        const response = await fetch(`${API_BASE_URL}/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: emailEl.value.trim().toLowerCase()
            })
        });

        const data = await response.json();

        if (!response.ok) {
            setError(data.error || data.message || 'Failed to send reset link.');
            btn.disabled = false;
            btn.querySelector('.btn-text').textContent = 'Send Reset Link';
            return;
        }

        // Success
        clearError();
        btn.querySelector('.btn-text').textContent = 'Email Sent!';

        if (data.resetLink) {
            alert(`Email not configured yet.\nUse this reset link:\n${data.resetLink}`);
        } else {
            alert('Password reset link has been sent to your email.');
        }

        form.reset();

        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);

    } catch (error) {
        setError('Network error. Please try again.');
        btn.disabled = false;
        btn.querySelector('.btn-text').textContent = 'Send Reset Link';
        console.error(error);
    }
});