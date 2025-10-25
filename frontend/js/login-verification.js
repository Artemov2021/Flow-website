const loginVerificationH2 = document.getElementById("login-verification-h2");
const loginVerificationButton = document.getElementById("auth-login-verification-button");

const loginVerificationInputsContainer = document.getElementById("login-verification-input-group");
const loginVerificationInputs = Array.from(loginVerificationInputsContainer.querySelectorAll("input"));
const loginVerificationErrorLabel = document.getElementById("login-verification-error-label");

let loginVerificationEmail = "example@gmail.com";

async function initLoginVerification() {
    await setLoginVerificationEmail();
    setLoginVerificationH2();
    setupLoginVerificationListeners();
}
async function setLoginVerificationEmail() {
    const res = await fetch("http://localhost:8080/get-session-email", {
            credentials: "include"
        });
    const data = await res.json();
    loginVerificationEmail = data.data;
}
function setLoginVerificationH2() {
    loginVerificationH2.textContent = `Enter the 4-digit code we sent to your email (${loginVerificationEmail}).`;
}
function setupLoginVerificationListeners() {
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
            showMainWindow();
            await deleteFromVerificationDB();
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
    const response = await fetch("http://localhost:8080/is-user-in-verification-db", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({email: loginVerificationEmail}),
    });

    const data = await response.json();
    const isUserInVerificationDB = data.data;

    return data.success && isUserInVerificationDB;
}
async function isTypedCodeCorrect() {
    const typedCode = loginVerificationInputs.map(input => input.value).join("");

    const response = await fetch("http://localhost:8080/is-typed-code-correct", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({email:loginVerificationEmail,typedCode:typedCode}),
    });

    const data = await response.json();
    const isTypedCodeCorrect = data.data;

    console.log(data.success && isTypedCodeCorrect);

    return data.success && isTypedCodeCorrect;
}
async function deleteFromVerificationDB() {
    const response = await fetch("http://localhost:8080/delete-user-from-verification-db", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({email: loginVerificationEmail}),
    });

    const data = await response.json();
    if (!data.success) {
        throw new Error(data.errorMessage);
    }
}

function showError() {
    loginVerificationInputs.forEach((input) => {
        // Example: set different background colors
        input.className = "signup-verification-input-error";
    });

    loginVerificationErrorLabel.textContent = "Invalid code";
}
function setDefaultStyle() {
    loginVerificationInputs.forEach((input) => {
        // Example: set different background colors
        input.className = "signup-verification-input-default";
    });

    loginVerificationErrorLabel.textContent = "";
}
function showMainWindow() {
    window.location.href = '../pages/index.html';
}

await initLoginVerification();