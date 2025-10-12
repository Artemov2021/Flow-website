const toggleLoginPasswordButton = document.getElementById("login-password-input-toggle-button");
const loginPasswordInput = document.getElementById("login-password-input");
const dontHaveAccountButton = document.getElementById("auth-signup-navigation-text");
const loginEmailInput = document.getElementById("login-email-input");
const forgotPasswordButton = document.getElementById("auth-password-forgot-password");
const loginPageLoginButton = document.getElementById("auth-login-button");
const loginWithGoogleButton = document.getElementById("auth-login-with-google-button");
const loginEmailErrorLabel = document.getElementById("login-email-error-label");
const loginPasswordErrorLabel = document.getElementById("login-password-error-label");


function initLogin() {
    setupLoginListeners();
}
function setupLoginListeners() {
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
        try {
            setLoginButtonLoadingStyle();
            await checkAndLogin();
            setLoginButtonDefaultStyle();
        } catch (error) {
            alert("An error has occurred: " + error.message);
            setLoginButtonDefaultStyle();
        }
    });

    loginPasswordInput.addEventListener("keydown", async (e) => {
        if (e.key === "Enter") {
            try {
                await checkAndLogin();
            } catch (error) {
                alert("An error has occurred: " + error.message);
                setLoginButtonDefaultStyle();
            }
        }
    });
}
async function checkAndLogin() {
    setEmailDefaultStyle();
    setPasswordDefaultStyle();

    if (await isEnteredEmailInUsersDB() && await isPasswordCorrect()) {
        await login();
        setLoginButtonDefaultStyle();
        return;
    }

    if (!await isEnteredEmailInUsersDB()) {
        setEmailErrorStyle("Email is incorrect");
    }

    if (!await isPasswordCorrect()) {
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

    const response = await fetch("http://localhost:8080/is-user-in-users-db", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({email: email}),
    });

    const data = await response.json();
    const isUserInVerificationDB = data.data;

    return data.success && isUserInVerificationDB;
}
async function isPasswordCorrect() {
    const email = loginEmailInput.value.trim();
    const password = loginPasswordInput.value.trim();

    const response = await fetch("http://localhost:8080/is-plain-password-correct", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({email: email,password: password}),
    });

    const data = await response.json();
    const isPlainPasswordCorrect = data.data;

    return data.success && isPlainPasswordCorrect;
}
async function login() {
    await setSessionEmail();
    window.location.href = '../pages/index.html';
}
async function setSessionEmail() {
    const email = loginEmailInput.value.trim();

    try {
        const response = await fetch("http://localhost:8080/set-session-email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({email: email}),
            credentials: "include"
        });

        const data = await response.json();

        if (!data.success) {
            alert("Failed to set session email: "+data.errorMessage);
            setLoginButtonDefaultStyle();
        }
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error:", error.message);
            console.error(error.stack);
            alert("An error occurred: " + error.message);
            setLoginButtonDefaultStyle();
        } else {
            console.error("Unknown error:", error);
            alert("An unknown error occurred");
        }
    }
}
function setLoginButtonDefaultStyle() {
    loginPageLoginButton.className = "auth-login-button";
}
function setLoginButtonLoadingStyle() {
    loginPageLoginButton.className = "auth-login-button-loading";
}


initLogin();