const API_BASE_URL = "http://127.0.0.1:5000";

const form = document.getElementById("forgotForm");
const channelEl = document.getElementById("channel");
const identifierEl = document.getElementById("identifier");
const sendOtpBtn = document.getElementById("sendOtpBtn");
const sendOtpText = sendOtpBtn.querySelector(".btn-text");

function setError(groupId, errorId, message) {
    document.getElementById(groupId).classList.add("error");
    document.getElementById(errorId).textContent = message;
}

function clearError(groupId, errorId) {
    document.getElementById(groupId).classList.remove("error");
    document.getElementById(errorId).textContent = "";
}

function validateInputs() {
    let isValid = true;
    const channel = (channelEl.value || "").trim().toLowerCase();
    const identifier = (identifierEl.value || "").trim();

    clearError("channelGroup", "channelError");
    clearError("identifierGroup", "identifierError");

    if (!["email", "phone"].includes(channel)) {
        setError("channelGroup", "channelError", "Choose email or phone");
        isValid = false;
    }

    if (!identifier) {
        setError("identifierGroup", "identifierError", "Email or phone is required");
        isValid = false;
    } else if (channel === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
        setError("identifierGroup", "identifierError", "Enter a valid email");
        isValid = false;
    } else if (channel === "phone" && !/^\+?\d{10,15}$/.test(identifier.replace(/\s+/g, ""))) {
        setError("identifierGroup", "identifierError", "Enter a valid phone number");
        isValid = false;
    }

    return isValid;
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validateInputs()) return;

    const channel = channelEl.value.trim().toLowerCase();
    const identifier = identifierEl.value.trim();

    sendOtpBtn.disabled = true;
    sendOtpText.textContent = "Sending OTP...";

    try {
        const response = await fetch(`${API_BASE_URL}/api/forgot-password/request-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ channel, identifier })
        });
        const data = await response.json();

        if (!response.ok) {
            setError("identifierGroup", "identifierError", data.error || "Failed to send OTP");
            sendOtpBtn.disabled = false;
            sendOtpText.textContent = "Send OTP";
            return;
        }

        sessionStorage.setItem("mindcare_fp_channel", channel);
        sessionStorage.setItem("mindcare_fp_identifier", identifier);
        window.location.href = "verify-otp.html";
    } catch (_) {
        setError("identifierGroup", "identifierError", "Network error. Try again.");
        sendOtpBtn.disabled = false;
        sendOtpText.textContent = "Send OTP";
    }
});
