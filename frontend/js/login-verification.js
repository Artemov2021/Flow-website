import {API_BASE_URL} from "./common/config.js";
import {deleteFromVerificationDB} from "./common/verification.js";

const loginVerificationH2 = document.getElementById("login-verification-h2");
const loginVerificationButton = document.getElementById("auth-login-verification-button");
const loginVerificationInputsContainer = document.getElementById("login-verification-input-group");
const loginVerificationInputs = Array.from(loginVerificationInputsContainer.querySelectorAll("input"));
const loginVerificationErrorLabel = document.getElementById("login-verification-error-label");
const flowTitle = document.getElementById("flow-title");

let loginVerificationEmail = "example@gmail.com";

async function initLoginVerification() {
    await setLoginVerificationEmail();
    setLoginVerificationH2();
    setupLoginVerificationListeners();
}

async function setLoginVerificationEmail() {
    try {
        const res = await fetch(`${API_BASE_URL}/session/email`, {
            credentials: "include"
        });

        const data = await res.json();

        if (!data.success) {
            alert(data.error);
        } else {
            loginVerificationEmail = data.result;
        }
    } catch (error) {
        alert(error.message);
    }
}
function setLoginVerificationH2() {
    loginVerificationH2.textContent = `Enter the 4-digit code we sent to your email (${loginVerificationEmail}).`;
}
function setupLoginVerificationListeners() {
    flowTitle.addEventListener("click",() => {
        window.location.href = "../pages/index.html";
    });

    // Login verification inputs
    loginVerificationInputsContainer.addEventListener('input', (e) => {
        const input = e.target;
        if (input.value === " ") {
            input.value = "";
        }
        if (input && input.tagName === 'INPUT' && input.value) {
            const inputs = Array.from(loginVerificationInputsContainer.children);
            const index = inputs.indexOf(input);
            if (index >= 0 && index < inputs.length - 1) {
                setTimeout(() => {
                    inputs[index + 1].focus();
                }, 50); // 100ms delay
            }
        }
    });
    loginVerificationInputsContainer.addEventListener('keydown', async (e) => {
        const input = e.target;
        if (input && e.key === 'Backspace' && !input.value) {
            const inputs = Array.from(loginVerificationInputsContainer.children);
            const index = inputs.indexOf(input);
            if (index > 0) {
                inputs[index - 1].focus(); // backspace stays instant
            }
        } else if (e.key === "Enter") {
            await checkAndLogin();
        }
    });

    // Login button
    loginVerificationButton.addEventListener("click",async () => {
        await checkAndLogin();
    });
}
async function checkAndLogin() {
    try {
        if (await isUserInVerificationDB() && await isTypedCodeCorrect()) {
            setDefaultStyle();
            await setSessionUserId();
            await deleteFromVerificationDB();
            await deleteSessionEmail();
            showMainWindow();
        } else {
            showError();
        }
    } catch (error) {
        if (error instanceof Error) {
            alert("Error : " + error.message);
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
    }

    return data.result;
}
async function isTypedCodeCorrect() {
    const typedCode = loginVerificationInputs.map(input => input.value).join("");

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
function showError() {
    loginVerificationInputs.forEach((input) => {
        input.className = "signup-verification-input-error";
    });

    loginVerificationErrorLabel.textContent = "Invalid code";
}
function setDefaultStyle() {
    loginVerificationInputs.forEach((input) => {
        input.className = "signup-verification-input-default";
    });

    loginVerificationErrorLabel.textContent = "";
}
function showMainWindow() {
    window.location.href = '../pages/index.html';
}

await initLoginVerification();