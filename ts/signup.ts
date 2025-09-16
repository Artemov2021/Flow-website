const signupEmailInput = document.getElementById("signup-email-input") as HTMLInputElement;
const toggleSignupPasswordButton = document.getElementById("signup-password-input-toggle-button") as HTMLImageElement;
const signupPasswordInput = document.getElementById("signup-password-input") as HTMLInputElement;
const signupButton = document.getElementById("auth-signup-button") as HTMLButtonElement;
const authEmailErrorLabel = document.getElementById("auth-email-error-label") as HTMLParagraphElement;
const authPasswordErrorLabel = document.getElementById("auth-password-error-label") as HTMLParagraphElement;



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
    signupButton?.addEventListener("click",() => {
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
function isSignupValid(): boolean {
    const email: string = signupEmailInput.value.trim();
    const password: string = signupPasswordInput.value.trim();

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
function setEmailErrorStyle(error: string) {
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
function setPasswordErrorStyle(error: string) {
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
        } else {
            alert(data.message || "Failed to send verification email.");
        }
    } catch (error) {
        console.error("Error sending signup code:", error);
        alert("An error occurred while sending the verification email.");
    }
}
function showSignupVerificationPage() {
    window.location.href = '../signup-verification.html';
}


initSignup();