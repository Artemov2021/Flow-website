const signupVerificationH2 = document.getElementById("signup-verification-h2");
const verificationSignupButton = document.getElementById("auth-signup-verification-button");

const inputsContainer = document.getElementById("signup-verification-input-group");
const inputs = Array.from(inputsContainer.querySelectorAll("input"));
const signupVerificationErrorLabel = document.getElementById("signup-verification-error-label");

let email = "example@gmail.com";

async function initSignupVerification() {
    await setEmail();
    setH2();
    setupSignupVerificationListeners();
}
async function setEmail() {
    const res = await fetch("http://localhost:8080/get-session-email", {
        credentials: "include"
    });
    const data = await res.json();
    email = data.data;
}
function setH2() {
    signupVerificationH2.textContent = `Enter the 4-digit code we sent to your email (${email}).`;
}
function setupSignupVerificationListeners() {
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
            await checkAndSignup();
        }
    });

    // Signup button
    verificationSignupButton.addEventListener("click",() => {
        checkAndSignup();
    });
}

async function checkAndSignup() {
    try {
        if (await isUserInVerificationDB() && await isTypedCodeCorrect()) {
            setDefaultStyle();
            await signUpUser();
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
        body: JSON.stringify({email: email}),
    });

    const data = await response.json();
    const isUserInVerificationDB = data.data;

    return data.success && isUserInVerificationDB;
}
async function isTypedCodeCorrect() {
    const typedCode = inputs.map(input => input.value).join("");

    const response = await fetch("http://localhost:8080/is-typed-code-correct", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({email,typedCode}),
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
        body: JSON.stringify({email: email}),
    });

    const data = await response.json();
    if (!data.success) {
        throw new Error(data.errorMessage);
    }
}
async function signUpUser() {
    const response = await fetch("http://localhost:8080/sign-up-user", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({email: email}),
        credentials: "include"
    });

    const data = await response.json();
    if (!data.success) {
        throw new Error(data.errorMessage);
    }
}

function showError() {
    inputs.forEach((input) => {
        // Example: set different background colors
        input.className = "signup-verification-input-error";
    });

    signupVerificationErrorLabel.textContent = "Invalid code";
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

initSignupVerification();