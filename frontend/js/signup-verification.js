import { API_BASE_URL } from "./config.js";
import {deleteFromVerificationDB} from "./common/verification.js";

const signupVerificationH2 = document.getElementById("signup-verification-h2");
const verificationSignupButton = document.getElementById("auth-signup-verification-button");
const inputsContainer = document.getElementById("signup-verification-input-group");
const inputs = Array.from(inputsContainer.querySelectorAll("input"));
const signupVerificationErrorLabel = document.getElementById("signup-verification-error-label");
const flowTitle = document.getElementById("flow-title");

let email = "example@gmail.com";

async function initSignupVerification() {
    await setEmail();
    setH2();
    setupSignupVerificationListeners();
}
async function setEmail() {
    try {
        const res = await fetch(`${API_BASE_URL}/session/email`, {
            method: "GET",
            credentials: "include"
        });

        const data = await res.json();

        if (!data.success) {
            alert(data.error);
        } else {
            email = data.result;
        }
    } catch (error) {
        alert(error.message);
    }
}
function setH2() {
    signupVerificationH2.textContent = `Enter the 4-digit code we sent to your email (${email}).`;
}
function setupSignupVerificationListeners() {
    flowTitle.addEventListener("click",() => {
        window.location.href = "../pages/index.html";
    });

    // Sign up verification inputs
    inputsContainer.addEventListener('input', (e) => {
        const input = e.target;
        if (input.value === " ") {
            input.value = "";
        }
        if (input && input.tagName === 'INPUT' && input.value) {
            const inputs = Array.from(inputsContainer.children);
            const index = inputs.indexOf(input);
            if (index >= 0 && index < inputs.length - 1) {
                setTimeout(() => {
                    inputs[index + 1].focus();
                }, 50); // 100ms delay
            }
        }
    });
    inputsContainer.addEventListener('keydown', async (e) => {
        const input = e.target;
        if (input && e.key === 'Backspace' && !input.value) {
            const inputs = Array.from(inputsContainer.children);
            const index = inputs.indexOf(input);
            if (index > 0) {
                inputs[index - 1].focus(); // backspace stays instant
            }
        } else if (e.key === "Enter") {
            await signUp();
        }
    });

    // Signup
    verificationSignupButton.addEventListener("click",async () => {
        await signUp();
    });
}

async function signUp() {
    try {
        const isUserInDB = await isUserInVerificationDB();
        const isTypedCodeCorrect = await isTypedVerificationCodeCorrect();

        setDefaultStyle();

        if (isUserInDB && isTypedCodeCorrect) {
            await signUpUser();
            await setSessionUserId();
            await deleteFromVerificationDB();
            await deleteSessionEmail();
            await deleteSessionPassword();
            showMainWindow();
        } else if (!isUserInDB) {
            showError("Failed to find the user");
        } else {
            showError("Invalid code");
        }
    } catch (error) {
        if (error instanceof Error) {
            showError(error.message);
        }
    }
}
async function isUserInVerificationDB() {
    const response = await fetch(`${API_BASE_URL}/auth/verification/status`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    });

    const data = await response.json();

    if (!data.success) {
        throw new Error(data.error);
    } else {
        return data.result;
    }
}
async function isTypedVerificationCodeCorrect() {
    const typedCode = inputs.map(input => input.value).join("");

    const response = await fetch(`${API_BASE_URL}/auth/verification/verify`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({typedCode}),
        credentials: "include"
    });

    const data = await response.json();

    if (!data.success) {
        throw new Error(data.error);
    } else {
        return data.result;
    }
}
async function signUpUser() {
    const response = await fetch(`${API_BASE_URL}/auth/signup/complete`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include"
    });

    const data = await response.json();

    if (!data.success) {
        throw new Error(data.error);
    }
}

async function deleteSessionEmail() {
    const response = await fetch(`${API_BASE_URL}/session/email`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    });

    const data = await response.json();

    if (!data.success) {
        throw new Error(data.error);
    }
}
async function deleteSessionPassword() {
    const response = await fetch(`${API_BASE_URL}/session/password`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    });

    const data = await response.json();

    if (!data.success) {
        throw new Error(data.error);
    }
}
async function setSessionUserId() {
    const response = await fetch(`${API_BASE_URL}/session/user-id`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    });

    const data = await response.json();

    if (!data.success) {
        throw new Error(data.error);
    }
}

function showError(text) {
    inputs.forEach((input) => {
        // Example: set different background colors
        input.className = "signup-verification-input-error";
    });

    signupVerificationErrorLabel.textContent = text;
}
function setDefaultStyle() {
    inputs.forEach((input) => {
        // Example: set different background colors
        input.className = "signup-verification-input-default";
    });

    signupVerificationErrorLabel.textContent = "";
}
function showMainWindow() {
    window.location.href = '../pages/index.html';
}

await initSignupVerification();