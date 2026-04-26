// ============================================================
//  Mental Health Support System — Login Page Script
// ============================================================
const API_BASE_URL = 'http://127.0.0.1:5000';

document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('loginForm');
    const usernameEl = document.getElementById('username');
    const passwordEl = document.getElementById('password');
    const toggleBtn = document.getElementById('togglePassword');
    const eyeIcon = document.getElementById('eyeIcon');

    // ---- Password toggle ----
    toggleBtn.addEventListener('click', () => {
        const isPassword = passwordEl.type === 'password';
        passwordEl.type = isPassword ? 'text' : 'password';
        eyeIcon.className = isPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
    });

    // ---- Live validation helpers ----
    function setValid(groupId) {
        const group = document.getElementById(groupId);
        group.classList.remove('error');
        group.classList.add('success');
        document.getElementById(groupId.replace('Group', 'Error')).textContent = '';
    }

    function setError(groupId, message) {
        const group = document.getElementById(groupId);
        group.classList.remove('success');
        group.classList.add('error');
        document.getElementById(groupId.replace('Group', 'Error')).textContent = message;
    }

    function clearState(groupId) {
        const group = document.getElementById(groupId);
        group.classList.remove('error', 'success');
        document.getElementById(groupId.replace('Group', 'Error')).textContent = '';
    }

    // ---- Validate individual fields ----
    function validateUsername() {
        const val = usernameEl.value.trim();
        if (!val) {
            setError('usernameGroup', 'Username or email is required.');
            return false;
        }
        setValid('usernameGroup');
        return true;
    }

    function validatePassword() {
        const val = passwordEl.value;
        if (!val) {
            setError('passwordGroup', 'Password is required.');
            return false;
        }
        if (val.length < 8) {
            setError('passwordGroup', 'Password must be at least 8 characters.');
            return false;
        }
        setValid('passwordGroup');
        return true;
    }

    // ---- Attach blur listeners for real-time feedback ----
    usernameEl.addEventListener('blur', validateUsername);
    passwordEl.addEventListener('blur', validatePassword);

    usernameEl.addEventListener('input', () => {
        if (usernameEl.value) clearState('usernameGroup');
    });

    passwordEl.addEventListener('input', () => {
        if (passwordEl.value) clearState('passwordGroup');
    });

    // ---- Form submission ----
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const isUsernameValid = validateUsername();
        const isPasswordValid = validatePassword();

        if (!isUsernameValid || !isPasswordValid) return;

        const btn = document.getElementById('loginBtn');
        const btnText = btn.querySelector('.btn-text');

        // Loading state
        btn.disabled = true;
        btnText.textContent = 'Signing in…';

        try {
            const response = await fetch(`${API_BASE_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: usernameEl.value.trim(),
                    password: passwordEl.value,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                btnText.textContent = 'Success! Redirecting…';
                if (data.token) localStorage.setItem('mindcare_token', data.token);
                if (data.name) localStorage.setItem('mindcare_user_name', data.name);

                try {
                    const meRes = await fetch(`${API_BASE_URL}/api/me`, {
                        headers: {
                            Authorization: `Bearer ${data.token}`
                        }
                    });
                    if (meRes.ok) {
                        const me = await meRes.json();
                        localStorage.setItem('mindcare_user', JSON.stringify(me));
                    } else {
                        localStorage.setItem('mindcare_user', JSON.stringify({
                            name: data.name || '',
                            email: usernameEl.value.trim().toLowerCase()
                        }));
                    }
                } catch (_) {
                    localStorage.setItem('mindcare_user', JSON.stringify({
                        name: data.name || '',
                        email: usernameEl.value.trim().toLowerCase()
                    }));
                }
                setTimeout(() => { window.location.href = 'home.html'; }, 800);
            } else {
                setError('passwordGroup', data.error || data.message || 'Invalid credentials. Please try again.');
                btn.disabled = false;
                btnText.textContent = 'Sign In';
            }
        } catch (err) {
            setError('passwordGroup', 'Network error. Please check your connection.');
            btn.disabled = false;
            btnText.textContent = 'Sign In';
        }
    });

});
