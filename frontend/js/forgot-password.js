const API_BASE_URL = 'http://127.0.0.1:5000';

const form = document.getElementById('forgotForm');
const methodEl = document.getElementById('resetMethod');
const emailEl = document.getElementById('email');
const phoneEl = document.getElementById('phone');
const otpEl = document.getElementById('otp');
const passEl = document.getElementById('newPassword');
const confirmEl = document.getElementById('confirmPassword');
const sendOtpBtn = document.getElementById('sendOtpBtn');
const btn = document.getElementById('resetBtn');
const toggleBtn = document.getElementById('togglePassword');
const eyeIcon = document.getElementById('eyeIcon');

function setError(groupId, errorId, message) {
    const group = document.getElementById(groupId);
    const error = document.getElementById(errorId);
    group.classList.add('error');
    group.classList.remove('success');
    error.textContent = message;
    error.style.color = '';
}

function setSuccess(groupId, errorId) {
    const group = document.getElementById(groupId);
    const error = document.getElementById(errorId);
    group.classList.remove('error');
    group.classList.add('success');
    error.textContent = '';
    error.style.color = '';
}

function setInfo(errorId, message) {
    const error = document.getElementById(errorId);
    error.textContent = message;
    error.style.color = '#43C6AC';
}

function validateEmail() {
    const email = emailEl.value.trim().toLowerCase();
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
        setError('emailGroup', 'emailError', 'Email is required.');
        return false;
    }
    if (!emailRe.test(email)) {
        setError('emailGroup', 'emailError', 'Please enter a valid email.');
        return false;
    }
    setSuccess('emailGroup', 'emailError');
    return true;
}

function validatePhone() {
    const phone = phoneEl.value.trim();
    if (!phone) {
        setError('phoneGroup', 'phoneError', 'Phone number is required.');
        return false;
    }
    if (!/^[6-9]\d{9}$/.test(phone)) {
        setError('phoneGroup', 'phoneError', 'Enter a valid 10-digit number.');
        return false;
    }
    setSuccess('phoneGroup', 'phoneError');
    return true;
}

function validateOtp() {
    const otp = otpEl.value.trim();
    if (!/^\d{6}$/.test(otp)) {
        setError('otpGroup', 'otpError', 'Enter valid 6-digit OTP.');
        return false;
    }
    setSuccess('otpGroup', 'otpError');
    return true;
}

function validatePassword() {
    const pass = passEl.value;
    if (!pass) {
        setError('passwordGroup', 'passwordError', 'New password is required.');
        return false;
    }
    if (pass.length < 6) {
        setError('passwordGroup', 'passwordError', 'Password must be at least 6 characters.');
        return false;
    }
    setSuccess('passwordGroup', 'passwordError');
    return true;
}

function validateConfirm() {
    if (!confirmEl.value) {
        setError('confirmGroup', 'confirmError', 'Please confirm your new password.');
        return false;
    }
    if (confirmEl.value !== passEl.value) {
        setError('confirmGroup', 'confirmError', 'Passwords do not match.');
        return false;
    }
    setSuccess('confirmGroup', 'confirmError');
    return true;
}

function toggleMethodFields() {
    const method = methodEl.value;
    document.getElementById('emailGroup').style.display = method === 'email' ? 'block' : 'none';
    document.getElementById('phoneGroup').style.display = method === 'phone' ? 'block' : 'none';
}

methodEl.addEventListener('change', toggleMethodFields);
toggleMethodFields();

toggleBtn.addEventListener('click', () => {
    const hidden = passEl.type === 'password';
    passEl.type = hidden ? 'text' : 'password';
    confirmEl.type = hidden ? 'text' : 'password';
    eyeIcon.className = hidden ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
});

sendOtpBtn.addEventListener('click', async () => {
    const method = methodEl.value;
    const identifierValid = method === 'email' ? validateEmail() : validatePhone();
    if (!identifierValid) return;

    sendOtpBtn.disabled = true;
    sendOtpBtn.querySelector('.btn-text').textContent = 'Sending OTP...';

    try {
        const response = await fetch(`${API_BASE_URL}/api/forgot-password/request-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                method,
                email: emailEl.value.trim().toLowerCase(),
                phone: phoneEl.value.trim()
            })
        });
        const data = await response.json();
        if (!response.ok) {
            const targetGroup = method === 'email' ? 'emailGroup' : 'phoneGroup';
            const targetError = method === 'email' ? 'emailError' : 'phoneError';
            setError(targetGroup, targetError, data.error || 'OTP send failed.');
        } else {
            setSuccess('otpGroup', 'otpError');
            setInfo('otpError', `OTP sent. (Dev OTP: ${data.otp})`);
        }
    } catch (err) {
        const targetGroup = method === 'email' ? 'emailGroup' : 'phoneGroup';
        const targetError = method === 'email' ? 'emailError' : 'phoneError';
        setError(targetGroup, targetError, 'Network error while sending OTP.');
    } finally {
        sendOtpBtn.disabled = false;
        sendOtpBtn.querySelector('.btn-text').textContent = 'Send OTP';
    }
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const method = methodEl.value;
    const identifierValid = method === 'email' ? validateEmail() : validatePhone();
    if (!identifierValid || !validateOtp() || !validatePassword() || !validateConfirm()) return;

    btn.disabled = true;
    btn.querySelector('.btn-text').textContent = 'Resetting...';

    try {
        const response = await fetch(`${API_BASE_URL}/api/forgot-password/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                method,
                email: emailEl.value.trim().toLowerCase(),
                phone: phoneEl.value.trim(),
                otp: otpEl.value.trim(),
                newPassword: passEl.value
            })
        });

        const data = await response.json();
        if (!response.ok) {
            setError('otpGroup', 'otpError', data.error || 'Could not reset password.');
            btn.disabled = false;
            btn.querySelector('.btn-text').textContent = 'Reset Password';
            return;
        }

        btn.querySelector('.btn-text').textContent = 'Password Updated!';
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1200);
    } catch (err) {
        setError('otpGroup', 'otpError', 'Network error. Please try again.');
        btn.disabled = false;
        btn.querySelector('.btn-text').textContent = 'Reset Password';
    }
});
