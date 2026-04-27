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

const form = document.getElementById('forgotForm');
const methodEl = document.getElementById('resetMethod');
const emailEl = document.getElementById('email');
const phoneEl = document.getElementById('phone');
const otpEl = document.getElementById('otp');
const passEl = document.getElementById('newPassword');
const btn = document.getElementById('submitBtn');

const emailGroup = document.getElementById('emailGroup');
const phoneGroup = document.getElementById('phoneGroup');
const otpGroup = document.getElementById('otpGroup');
const passwordGroup = document.getElementById('passwordGroup');

function setFieldError(groupId, errorId, message) {
    const group = document.getElementById(groupId);
    const error = document.getElementById(errorId);
    if (group) group.classList.add('error');
    if (error) error.textContent = message;
}

function clearFieldError(groupId, errorId) {
    const group = document.getElementById(groupId);
    const error = document.getElementById(errorId);
    if (group) group.classList.remove('error');
    if (error) error.textContent = '';
}

function setPhoneModeUI() {
    const isPhone = methodEl.value === 'phone';
    emailGroup.style.display = isPhone ? 'none' : 'block';
    phoneGroup.style.display = isPhone ? 'block' : 'none';
    otpGroup.style.display = isPhone ? 'block' : 'none';
    passwordGroup.style.display = isPhone ? 'block' : 'none';
    btn.querySelector('.btn-text').textContent = isPhone ? 'Send OTP' : 'Send Reset Link';
}

function validateEmail() {
    const email = emailEl.value.trim().toLowerCase();
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
        setFieldError('emailGroup', 'emailError', 'Email is required.');
        return false;
    }
    if (!emailRe.test(email)) {
        setFieldError('emailGroup', 'emailError', 'Please enter a valid email address.');
        return false;
    }
    clearFieldError('emailGroup', 'emailError');
    return true;
}

function validatePhoneFlow() {
    const phoneRaw = phoneEl.value.trim();
    const otp = otpEl.value.trim();
    const password = passEl.value;

    let ok = true;

    if (!phoneRaw || !/^\+?\d{10,13}$/.test(phoneRaw.replace(/\s|-/g, ''))) {
        setFieldError('phoneGroup', 'phoneError', 'Enter valid phone, e.g. +919876543210.');
        ok = false;
    } else {
        clearFieldError('phoneGroup', 'phoneError');
    }

    if (!otp || !/^\d{6}$/.test(otp)) {
        setFieldError('otpGroup', 'otpError', 'Enter valid 6-digit OTP.');
        ok = false;
    } else {
        clearFieldError('otpGroup', 'otpError');
    }

    if (!password || password.length < 6) {
        setFieldError('passwordGroup', 'passwordError', 'Password must be at least 6 characters.');
        ok = false;
    } else {
        clearFieldError('passwordGroup', 'passwordError');
    }

    return ok;
}

methodEl.addEventListener('change', setPhoneModeUI);
setPhoneModeUI();

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const method = methodEl.value;

    if (method === 'email' && !validateEmail()) return;
    if (method === 'phone') {
        const phoneRaw = phoneEl.value.trim();
        if (!phoneRaw || !/^\+?\d{10,13}$/.test(phoneRaw.replace(/\s|-/g, ''))) {
            setFieldError('phoneGroup', 'phoneError', 'Enter valid phone, e.g. +919876543210.');
            return;
        }
        clearFieldError('phoneGroup', 'phoneError');
    }

    btn.disabled = true;
    const hasOtpAndPass = otpEl.value.trim() && passEl.value;
    const defaultText = method === 'phone'
        ? (hasOtpAndPass ? 'Verify OTP & Reset' : 'Send OTP')
        : 'Send Reset Link';
    btn.querySelector('.btn-text').textContent = method === 'phone'
        ? (hasOtpAndPass ? 'Verifying...' : 'Sending OTP...')
        : 'Sending...';

    try {
        if (method === 'phone' && hasOtpAndPass && !validatePhoneFlow()) {
            btn.disabled = false;
            btn.querySelector('.btn-text').textContent = defaultText;
            return;
        }

        const endpoint = method === 'phone'
            ? (hasOtpAndPass ? `${API_BASE_URL}/api/reset-password/phone` : `${API_BASE_URL}/forgot-password`)
            : `${API_BASE_URL}/forgot-password`;

        const payload = method === 'phone'
            ? (hasOtpAndPass
                ? {
                    phone: phoneEl.value.trim(),
                    otp: otpEl.value.trim(),
                    password: passEl.value
                }
                : {
                    method: 'phone',
                    phone: phoneEl.value.trim()
                })
            : {
                method: 'email',
                email: emailEl.value.trim().toLowerCase()
            };

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();

        if (!response.ok) {
            const message = data.error || data.message || 'Request failed.';
            if (method === 'phone') {
                setFieldError('otpGroup', 'otpError', message);
            } else {
                setFieldError('emailGroup', 'emailError', message);
            }
            btn.disabled = false;
            btn.querySelector('.btn-text').textContent = defaultText;
            return;
        }

        if (method === 'email') {
            btn.querySelector('.btn-text').textContent = 'Email Sent!';
            if (data.resetLink) {
                alert(`Email not configured yet.\nUse this reset link:\n${data.resetLink}`);
            } else {
                alert('Password reset link has been sent to your email.');
            }
        } else if (hasOtpAndPass) {
            btn.querySelector('.btn-text').textContent = 'Password Updated!';
            alert(data.message || 'Password reset successful.');
        } else {
            btn.querySelector('.btn-text').textContent = 'OTP Sent!';
            if (data.devOtp) {
                alert(`SMS not configured yet.\nUse this OTP: ${data.devOtp}`);
            } else {
                alert('OTP sent to your phone. Enter OTP and new password to reset.');
            }
            btn.disabled = false;
            setTimeout(() => {
                btn.querySelector('.btn-text').textContent = 'Verify OTP & Reset';
            }, 700);
            return;
        }

        form.reset();
        setPhoneModeUI();
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1200);
    } catch (error) {
        console.error(error);
        alert('Network error. Please try again.');
        btn.disabled = false;
        btn.querySelector('.btn-text').textContent = defaultText;
    }
});