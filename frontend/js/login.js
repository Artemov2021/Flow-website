import {API_BASE_URL} from "./common/config.js";

const toggleLoginPasswordButton = document.getElementById("login-password-input-toggle-button");
const loginPasswordInput = document.getElementById("login-password-input");
const dontHaveAccountButton = document.getElementById("auth-signup-navigation-text");
const loginEmailInput = document.getElementById("login-email-input");
const forgotPasswordButton = document.getElementById("auth-password-forgot-password");
const loginPageLoginButton = document.getElementById("auth-login-button");
const loginEmailErrorLabel = document.getElementById("login-email-error-label");
const loginPasswordErrorLabel = document.getElementById("login-password-error-label");
const flowTitle = document.getElementById("flow-title");

function initLogin() {
    setupLoginListeners();
}
function setupLoginListeners() {
    flowTitle.addEventListener("click",() => {
        window.location.href = "../index.html";
    });

    // toggle password
    toggleLoginPasswordButton.addEventListener("click", () => {
        const isPassword = loginPasswordInput.type === "password";
        loginPasswordInput.type = isPassword ? "text" : "password";

        // Swap the eye icon
        toggleLoginPasswordButton.src = isPassword
            ? "../assets/symbols/password-opened-eye.png"
            : "../assets/symbols/password-closed-eye.png";
    });

    // sign up page listener
    dontHaveAccountButton.addEventListener("click", () => {
        window.location.href = '../pages/signup.html';
    });

    loginPageLoginButton.addEventListener("click",async () => {
        await login();
    });

    loginPasswordInput.addEventListener("keydown", async (e) => {
        if (e.key === "Enter") {
            await login();
        }
    });

    forgotPasswordButton.addEventListener("click", () => {
        openLoginEmailVerificationWindow();
    });
}
async function login() {
    try {
        setLoginButtonLoadingStyle();
        await checkAndLogin();
        setLoginButtonDefaultStyle();
    } catch (error) {
        alert("An error has occurred: " + error.message);
        setLoginButtonDefaultStyle();
    }
}
async function checkAndLogin() {
    setEmailDefaultStyle();
    setPasswordDefaultStyle();

    const emailExists = await isEnteredEmailInUsersDB();
    const isPasswordCorrect = emailExists &&  await validatePassword();

    if (emailExists && isPasswordCorrect) {
        await setSessionEmail();
        await setUserSessionId();
        await deleteSessionEmail();
        loadMainPage();
        setLoginButtonDefaultStyle();
        return;
    }

    if (!emailExists) {
        setEmailErrorStyle("Email is incorrect");
    }

    if (!isPasswordCorrect) {
        setPasswordErrorStyle("Password is incorrect");
    }
}
function setEmailErrorStyle(error) {
    // set error label
    loginEmailErrorLabel.className = "auth-error-label-visible";
    loginEmailErrorLabel.textContent = error;

    // set error input style
    loginEmailInput.className = "auth-error-input";
}
function setEmailDefaultStyle() {
    // set error label
    loginEmailErrorLabel.className = "auth-error-label-invisible";
    loginEmailErrorLabel.textContent = "";

    // set error input style
    loginEmailInput.className = "auth-email-input";
}
function setPasswordErrorStyle(error) {
    // set error label
    loginPasswordErrorLabel.className = "auth-error-label-visible";
    loginPasswordErrorLabel.textContent = error;

    // set error input style
    loginPasswordInput.className = "auth-error-input";
}
function setPasswordDefaultStyle() {
    // set error label
    loginPasswordErrorLabel.className = "auth-error-label-invisible";
    loginPasswordErrorLabel.textContent = "";

    // set error input style
    loginPasswordInput.className = "auth-password-input";
}
async function isEnteredEmailInUsersDB() {
    const email = loginEmailInput.value.trim();

    const response = await fetch(`${API_BASE_URL}/user/availability?email=${encodeURIComponent(email)}`, {
        method: "GET",
        credentials: "include"
    });

    const data = await response.json();

    if (!data.success) {
        throw new Error(data.error);
    }

    return data.result;
}
async function validatePassword() {
    const email = loginEmailInput.value.trim();
    const password = loginPasswordInput.value.trim();

    if (!password) {
        return false;
    }

    const response = await fetch(`${API_BASE_URL}/auth/password/validate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({email: email,password: password}),
    });

    const data = await response.json();

    if (!data.success) {
        throw new Error(data.error);
    }

    return data.result;
}
async function setSessionEmail() {
    const email = loginEmailInput.value.trim();

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
async function setUserSessionId() {
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
function loadMainPage() {
    window.location.href = '../index.html';
}
function setLoginButtonDefaultStyle() {
    loginPageLoginButton.className = "auth-login-button";
}
function setLoginButtonLoadingStyle() {
    loginPageLoginButton.className = "auth-login-button-loading";
}
function openLoginEmailVerificationWindow() {
    window.location.href = '../pages/login-email-verification.html';
}

initLogin();