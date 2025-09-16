"use strict";
const signupEmailInput = document.getElementById("signup-email-input");
const toggleSignupPasswordButton = document.getElementById("signup-password-input-toggle-button");
const signupPasswordInput = document.getElementById("signup-password-input");
const signupButton = document.getElementById("auth-signup-button");
const authEmailErrorLabel = document.getElementById("auth-email-error-label");
const authPasswordErrorLabel = document.getElementById("auth-password-error-label");
function initSignup() {
    setupSignupListeners();
}
function setupSignupListeners() {
    // Toggle password
    toggleSignupPasswordButton.addEventListener("click", () => {
        const isPassword = signupPasswordInput.type === "password";
        signupPasswordInput.type = isPassword ? "text" : "password";
        // Swap the eye icon
        toggleSignupPasswordButton.src = isPassword
            ? "assets/symbols/password-opened-eye.png"
            : "assets/symbols/password-closed-eye.png";
    });
    // Sign up button listener
    signupButton === null || signupButton === void 0 ? void 0 : signupButton.addEventListener("click", () => {
        setSignupButtonLoadingStyle();
        if (isSignupValid()) {
            sendSignupCode();
        }
    });
}
function setSignupButtonLoadingStyle() {
    signupButton.className = "auth-signup-button-loading";
}
function setSignupButtonDefaultStyle() {
    signupButton.className = "auth-signup-button";
}
function isSignupValid() {
    const email = signupEmailInput.value.trim();
    const password = signupPasswordInput.value.trim();
    // Basic regex check
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d).{12,}$/;
    setEmailDefaultStyle();
    setPasswordDefaultStyle();
    if (emailPattern.test(email) && passwordPattern.test(password)) {
        return true;
    }
    if (!emailPattern.test(email)) {
        setEmailErrorStyle("Please enter a valid email address");
        setSignupButtonDefaultStyle();
    }
    if (!passwordPattern.test(password)) {
        setPasswordErrorStyle("Password must be 12+ chars, letters & numbers");
        setSignupButtonDefaultStyle();
    }
    return false;
}
function setEmailErrorStyle(error) {
    // set error label
    authEmailErrorLabel.className = "auth-error-label-visible";
    authEmailErrorLabel.textContent = error;
    // set error input style
    signupEmailInput.className = "auth-error-input";
}
function setEmailDefaultStyle() {
    // set error label
    authEmailErrorLabel.className = "auth-error-label-invisible";
    authEmailErrorLabel.textContent = "";
    // set error input style
    signupEmailInput.className = "auth-email-input";
}
function setPasswordErrorStyle(error) {
    // set error label
    authPasswordErrorLabel.className = "auth-error-label-visible";
    authPasswordErrorLabel.textContent = error;
    // set error input style
    signupPasswordInput.className = "auth-error-input";
}
function setPasswordDefaultStyle() {
    // set error label
    authPasswordErrorLabel.className = "auth-error-label-invisible";
    authPasswordErrorLabel.textContent = "";
    // set error input style
    signupPasswordInput.className = "auth-password-input";
}
async function sendSignupCode() {
    const email = signupEmailInput.value.trim();
    try {
        const response = await fetch("http://localhost:3000/send-signup-code", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
        });
        const data = await response.json();
        if (response.ok) {
            showSignupVerificationPage();
        }
        else {
            alert(data.message || "Failed to send verification email.");
        }
    }
    catch (error) {
        console.error("Error sending signup code:", error);
        alert("An error occurred while sending the verification email.");
    }
}
function showSignupVerificationPage() {
    window.location.href = '../signup-verification.html';
}
initSignup();
