const toggleLoginPasswordButton = document.getElementById("login-password-input-toggle-button");
const loginPasswordInput = document.getElementById("login-password-input");
const dontHaveAccountButton = document.getElementById("auth-signup-navigation-text");
const forgotPasswordButton = document.getElementById("auth-password-forgot-password");
const loginPageLoginButton = document.getElementById("auth-login-button");
const loginWithGoogleButton = document.getElementById("auth-login-with-google-button");


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
    })

}

initLogin();