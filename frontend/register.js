/* ============================================
   register.js — Form validation & interactivity
   Mental Health Support System
   ============================================ */

// ── Password show/hide toggle ──────────────────
function setupToggle(btnId, inputId, iconId) {
    const btn   = document.getElementById(btnId);
    const input = document.getElementById(inputId);
    const icon  = document.getElementById(iconId);
    if (!btn) return;

    btn.addEventListener('click', () => {
        const isHidden = input.type === 'password';
        input.type     = isHidden ? 'text' : 'password';
        icon.className = isHidden ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
    });
}

setupToggle('togglePassword', 'password', 'eyeIcon');
setupToggle('toggleConfirm', 'confirmPassword', 'eyeIconConfirm');

// ── Password Strength Meter ────────────────────
const passwordInput  = document.getElementById('password');
const strengthBar    = document.getElementById('strengthBar');
const strengthText   = document.getElementById('strengthText');
const strengthWrapper = document.getElementById('strengthWrapper');

passwordInput.addEventListener('input', () => {
    const val = passwordInput.value;

    if (val.length === 0) {
        strengthWrapper.classList.remove('visible');
        strengthBar.className = 'strength-bar';
        strengthText.textContent = '';
        strengthText.className = 'strength-text';
        return;
    }

    strengthWrapper.classList.add('visible');
    const score = calcStrength(val);

    if (score < 2) {
        strengthBar.className  = 'strength-bar weak';
        strengthText.textContent = '⚠ Weak password';
        strengthText.className = 'strength-text weak';
    } else if (score < 4) {
        strengthBar.className  = 'strength-bar medium';
        strengthText.textContent = '→ Medium strength';
        strengthText.className = 'strength-text medium';
    } else {
        strengthBar.className  = 'strength-bar strong';
        strengthText.textContent = '✔ Strong password';
        strengthText.className = 'strength-text strong';
    }
});

function calcStrength(password) {
    let score = 0;
    if (password.length >= 8)  score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
}

// ── Helpers ────────────────────────────────────
function setError(groupId, errorId, message) {
    const group = document.getElementById(groupId);
    const error = document.getElementById(errorId);
    if (group) group.classList.add('error');
    if (group) group.classList.remove('success');
    if (error) error.textContent = message;
}

function setSuccess(groupId, errorId) {
    const group = document.getElementById(groupId);
    const error = document.getElementById(errorId);
    if (group) group.classList.remove('error');
    if (group) group.classList.add('success');
    if (error) error.textContent = '';
}

function clearState(groupId, errorId) {
    const group = document.getElementById(groupId);
    const error = document.getElementById(errorId);
    if (group) { group.classList.remove('error', 'success'); }
    if (error) error.textContent = '';
}

// ── Live validation on blur ────────────────────
document.getElementById('fullname').addEventListener('blur', validateName);
document.getElementById('email').addEventListener('blur', validateEmail);
document.getElementById('phone').addEventListener('blur', validatePhone);
document.getElementById('password').addEventListener('blur', validatePassword);
document.getElementById('confirmPassword').addEventListener('blur', validateConfirm);
document.getElementById('role').addEventListener('change', validateRole);

function validateName() {
    const val = document.getElementById('fullname').value.trim();
    if (!val) return setError('nameGroup', 'nameError', 'Full name is required.');
    if (val.length < 2) return setError('nameGroup', 'nameError', 'Name must be at least 2 characters.');
    setSuccess('nameGroup', 'nameError');
    return true;
}

function validateEmail() {
    const val = document.getElementById('email').value.trim();
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!val) return setError('emailGroup', 'emailError', 'Email address is required.');
    if (!emailRe.test(val)) return setError('emailGroup', 'emailError', 'Please enter a valid email.');
    setSuccess('emailGroup', 'emailError');
    return true;
}

function validatePhone() {
    const val = document.getElementById('phone').value.trim();
    if (val && !/^[6-9]\d{9}$/.test(val)) {
        return setError('phoneGroup', 'phoneError', 'Enter a valid 10-digit Indian mobile number.');
    }
    clearState('phoneGroup', 'phoneError');
    return true;
}

function validatePassword() {
    const val = document.getElementById('password').value;
    if (!val) return setError('passwordGroup', 'passwordError', 'Password is required.');
    if (val.length < 8) return setError('passwordGroup', 'passwordError', 'Password must be at least 8 characters.');
    setSuccess('passwordGroup', 'passwordError');
    return true;
}

function validateConfirm() {
    const pass    = document.getElementById('password').value;
    const confirm = document.getElementById('confirmPassword').value;
    if (!confirm) return setError('confirmGroup', 'confirmError', 'Please confirm your password.');
    if (pass !== confirm) return setError('confirmGroup', 'confirmError', 'Passwords do not match.');
    setSuccess('confirmGroup', 'confirmError');
    return true;
}

function validateRole() {
    const val = document.getElementById('role').value;
    if (!val) return setError('roleGroup', 'roleError', 'Please select your role.');
    setSuccess('roleGroup', 'roleError');
    return true;
}

function validateTerms() {
    const checked = document.getElementById('agreeTerms').checked;
    if (!checked) {
        document.getElementById('termsError').textContent = 'You must agree to the Terms of Service.';
        return false;
    }
    document.getElementById('termsError').textContent = '';
    return true;
}

// ── Form Submit ────────────────────────────────
const registerForm = document.getElementById('registerForm');
const registerBtn  = document.getElementById('registerBtn');

registerForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const ok = [
        validateName(),
        validateEmail(),
        validatePhone(),
        validatePassword(),
        validateConfirm(),
        validateRole(),
        validateTerms()
    ].every(Boolean);

    if (!ok) return;

    // Show loading state
    registerBtn.disabled = true;
    registerBtn.querySelector('.btn-text').textContent = 'Creating account…';
    registerBtn.querySelector('.btn-icon').className = 'fa-solid fa-spinner fa-spin btn-icon';

    // TODO: Replace with real API call
    setTimeout(() => {
        registerBtn.querySelector('.btn-text').textContent = 'Account Created!';
        registerBtn.querySelector('.btn-icon').className = 'fa-solid fa-check btn-icon';
        registerBtn.style.background = 'linear-gradient(135deg, #43C6AC, #2ea88d)';

        setTimeout(() => {
            // Clear any saved language so onboarding always starts fresh for new users
            localStorage.removeItem('mindcare_lang');
            window.location.href = 'onboarding.html';
        }, 1200);
    }, 1800);
});
