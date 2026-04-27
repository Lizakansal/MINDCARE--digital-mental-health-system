const API_BASE_URL = "http://127.0.0.1:5000";

const form = document.getElementById("resetPasswordForm");
const newPasswordEl = document.getElementById("newPassword");
const confirmPasswordEl = document.getElementById("confirmPassword");
const submitBtn = document.getElementById("resetPasswordBtn");
const submitText = submitBtn.querySelector(".btn-text");

const resetToken = sessionStorage.getItem("mindcare_fp_reset_token");
if (!resetToken) {
    window.location.href = "forgot-password.html";
}

function setError(groupId, errorId, message) {
    document.getElementById(groupId).classList.add("error");
    document.getElementById(errorId).textContent = message;
}

function clearError(groupId, errorId) {
    document.getElementById(groupId).classList.remove("error");
    document.getElementById(errorId).textContent = "";
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    clearError("newPasswordGroup", "newPasswordError");
    clearError("confirmPasswordGroup", "confirmPasswordError");

    const newPassword = newPasswordEl.value;
    const confirmPassword = confirmPasswordEl.value;

    if (newPassword.length < 8) {
        setError("newPasswordGroup", "newPasswordError", "Password must be at least 8 characters");
        return;
    }
    if (newPassword !== confirmPassword) {
        setError("confirmPasswordGroup", "confirmPasswordError", "Passwords do not match");
        return;
    }

    submitBtn.disabled = true;
    submitText.textContent = "Updating...";

    try {
        const response = await fetch(`${API_BASE_URL}/api/forgot-password/reset-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reset_token: resetToken, new_password: newPassword })
        });
        const data = await response.json();

        if (!response.ok) {
            setError("newPasswordGroup", "newPasswordError", data.error || "Failed to update password");
            submitBtn.disabled = false;
            submitText.textContent = "Update Password";
            return;
        }

        sessionStorage.removeItem("mindcare_fp_channel");
        sessionStorage.removeItem("mindcare_fp_identifier");
        sessionStorage.removeItem("mindcare_fp_reset_token");
        alert("Password updated successfully. Please sign in.");
        window.location.href = "login.html";
    } catch (_) {
        setError("newPasswordGroup", "newPasswordError", "Network error. Try again.");
        submitBtn.disabled = false;
        submitText.textContent = "Update Password";
    }
});
