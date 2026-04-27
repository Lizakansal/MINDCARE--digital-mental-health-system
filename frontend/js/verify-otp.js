const API_BASE_URL = "http://127.0.0.1:5000";

const form = document.getElementById("verifyOtpForm");
const otpEl = document.getElementById("otp");
const otpHintEl = document.getElementById("otpHint");
const verifyBtn = document.getElementById("verifyOtpBtn");
const verifyText = verifyBtn.querySelector(".btn-text");

const channel = sessionStorage.getItem("mindcare_fp_channel");
const identifier = sessionStorage.getItem("mindcare_fp_identifier");

if (!channel || !identifier) {
    window.location.href = "forgot-password.html";
}

if (otpHintEl && channel && identifier) {
    otpHintEl.textContent = `Enter the 6-digit OTP sent to ${identifier}`;
}

function setOtpError(message) {
    document.getElementById("otpGroup").classList.add("error");
    document.getElementById("otpError").textContent = message;
}

function clearOtpError() {
    document.getElementById("otpGroup").classList.remove("error");
    document.getElementById("otpError").textContent = "";
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearOtpError();

    const otp = (otpEl.value || "").trim();
    if (!/^\d{6}$/.test(otp)) {
        setOtpError("Enter a valid 6-digit OTP");
        return;
    }

    verifyBtn.disabled = true;
    verifyText.textContent = "Verifying...";

    try {
        const response = await fetch(`${API_BASE_URL}/api/forgot-password/verify-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ channel, identifier, otp })
        });
        const data = await response.json();

        if (!response.ok) {
            setOtpError(data.error || "OTP verification failed");
            verifyBtn.disabled = false;
            verifyText.textContent = "Verify OTP";
            return;
        }

        sessionStorage.setItem("mindcare_fp_reset_token", data.reset_token);
        window.location.href = "reset-password.html";
    } catch (_) {
        setOtpError("Network error. Try again.");
        verifyBtn.disabled = false;
        verifyText.textContent = "Verify OTP";
    }
});
