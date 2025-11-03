import {API_BASE_URL} from "./common/config.js";

const loginEmailVerificationInput = document.getElementById("login-email-verification-input");
const loginEmailVerificationButton = document.getElementById("login-email-verification-button");
const loginEmailVerificationErrorLabel = document.getElementById("login-email-verification-error-label");
const flowTitle = document.getElementById("flow-title");

function initLoginEmailVerification() {
    setupLoginEmailVerificationListeners();
}

function setupLoginEmailVerificationListeners() {
    flowTitle.addEventListener("click",() => {
        window.location.href = "../pages/index.html";
    });

    loginEmailVerificationButton.addEventListener("click",async (e) => {
        await handleButtonClick(e);
    });

    // Password field enter listener
    loginEmailVerificationButton.addEventListener("keydown", async (e) => {
        if (e.key === "Enter") {
            await handleButtonClick(e);
        }
    });
}
async function handleButtonClick(event) {
    event?.preventDefault();
    setNextButtonLoadingStyle();
    await checkAndSendLoginCode();
    setNextButtonDefaultStyle();
}
function setNextButtonDefaultStyle() {
    loginEmailVerificationButton.className = "auth-login-verification-button";
}
function setNextButtonLoadingStyle() {
    loginEmailVerificationButton.className = "auth-login-verification-button-loading";
}
async function checkAndSendLoginCode() {
    try {
        const email = loginEmailVerificationInput.value;

        setLoginInputDefaultStyle();

        if (await isUserInUsersDB(email)) {
            await sendLoginVerificationCode(email);
            await setLoginSessionEmail(email);
            showLoginVerificationWindow();
        } else {
            setLoginInputErrorStyle("The email address is wrong");
        }
    } catch (error) {
        alert("Error: "+error.message);
    }
}
async function isUserInUsersDB(email) {
    if (!email) {
        return false;
    }

    const response = await fetch(`${API_BASE_URL}/user/availability?email=${encodeURIComponent(email)}`, {
        method: "GET",
        credentials: "include",
    });

    const data = await response.json();

    if (!data.success) {
        throw new Error(data.error);
    }

    return data.result;
}
function setLoginInputErrorStyle(error) {
    // set error label
    loginEmailVerificationErrorLabel.className = "auth-error-label-visible";
    loginEmailVerificationErrorLabel.textContent = error;

    // set error input style
    loginEmailVerificationInput.className = "auth-error-input";
}
function setLoginInputDefaultStyle() {
    // set error label
    loginEmailVerificationErrorLabel.className = "auth-error-label-invisible";
    loginEmailVerificationErrorLabel.textContent = "";

    // set error input style
    loginEmailVerificationInput.className = "auth-email-input";
}
async function sendLoginVerificationCode(email) {
    const response = await fetch(`${API_BASE_URL}/auth/login/request-code`, {
        method: "POST",
        headers: {
                "Content-Type": "application/json",
            },
        body: JSON.stringify({email}),
    });

    const data = await response.json();

    if (!data.success) {
       throw new Error(data.error);
    }
}
async function setLoginSessionEmail(email) {
    const response = await fetch(`${API_BASE_URL}/session/email`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({email}),
        credentials: "include"
    });

    const data = await response.json();

    if (!data.success) {
        throw new Error(data.error);
    }
}
function showLoginVerificationWindow() {
    window.location.href = '../pages/login-verification.html';
}

initLoginEmailVerification();