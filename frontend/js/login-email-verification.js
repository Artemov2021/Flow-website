const loginEmailVerificationInput = document.getElementById("login-email-verification-input");
const loginEmailVerificationButton = document.getElementById("login-email-verification-button");
const loginEmailVerificationErrorLabel = document.getElementById("login-email-verification-error-label");


function initLoginEmailVerification() {
    setupLoginEmailVerificationListeners();
}
function setupLoginEmailVerificationListeners() {
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
}
function setNextButtonDefaultStyle() {
    loginEmailVerificationButton.className = "auth-login-verification-button-loading";
}
function setNextButtonLoadingStyle() {
    loginEmailVerificationButton.className = "auth-login-verification-button";
}
async function checkAndSendLoginCode() {
    try {
        const email = loginEmailVerificationInput.value;

        setLoginInputDefaultStyle();

        if (await isUserInUsersDB(email)) {
            await sendLoginVerificationCode(email);
            await setLoginSessionEmail(email);
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

    try {
        const response = await fetch("http://localhost:8080/is-user-in-users-db", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({email: email}),
        });

        const data = await response.json();

        if (data.success) {
            const isUserInUsersDB = data.data;
            return isUserInUsersDB;
        } else {
            alert(data.errorMessage);
            return false;
        }
    } catch (error) {
        alert(error.message);
        return false;
    }
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
    try {
        const response = await fetch("http://localhost:8080/send-login-code", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({email: email}),
            credentials: "include"
        });

        const data = await response.json();

        if (data.success) {
            showLoginVerificationWindow();
        } else {
            alert("Failed to send verification email.");
        }
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error:", error.message);
            console.error(error.stack);
            alert("An error occurred: " + error.message);
            setNextButtonDefaultStyle();
        } else {
            console.error("Unknown error:", error);
            alert("An unknown error occurred");
        }
    }
}
async function setLoginSessionEmail(email) {
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
            alert("Failed to set session email");
            setSignupButtonDefaultStyle();
        }
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error sending signup code:", error.message);
            console.error(error.stack);
            alert("An error occurred: " + error.message);
            setNextButtonDefaultStyle();
        } else {
            console.error("Unknown error:", error);
            alert("An unknown error occurred");
        }
    }
}
function showLoginVerificationWindow() {
    window.location.href = '../pages/login-verification.html';
}

initLoginEmailVerification();