import { API_BASE_URL } from "./common/config.js";

const signupEmailInput = document.getElementById("signup-email-input");
const toggleSignupPasswordButton = document.getElementById("signup-password-input-toggle-button");
const signupPasswordInput = document.getElementById("signup-password-input");
const authEmailErrorLabel = document.getElementById("signup-email-error-label");
const authPasswordErrorLabel = document.getElementById("signup-password-error-label");
const privacyPolicyButton = document.getElementById("privacy-policy-button");
const termsOfServiceButton = document.getElementById("terms-of-service-button");
const signupButton = document.getElementById("auth-signup-button");
const haveAlreadyAccount = document.getElementById("auth-login-navigation-text");
const flowTitle = document.getElementById("flow-title");

function initSignup() {
    setupSignupListeners();
}
function setupSignupListeners() {
    flowTitle.addEventListener("click",() => {
        window.location.href = "../pages/index.html";
    });

    // Toggle password
    toggleSignupPasswordButton.addEventListener("click", () => {
        const isPassword = signupPasswordInput.type === "password";
        signupPasswordInput.type = isPassword ? "text" : "password";

        // Swap the eye icon
        toggleSignupPasswordButton.src = isPassword
            ? "../assets/symbols/password-opened-eye.png"
            : "../assets/symbols/password-closed-eye.png";
    });

    // sign up page listener
    haveAlreadyAccount.addEventListener("click", () => {
        window.location.href = '../pages/login.html';
    })

    // Sign up listeners
    signupButton.addEventListener("click",async () => {
        await signUp();
    });
    signupPasswordInput.addEventListener("keydown", async (e) => {
        if (e.key === "Enter") {
            await signUp();
        }
    });

    privacyPolicyButton.addEventListener("click",() => {
        showPrivacyPolicyWindow();
    });
    termsOfServiceButton.addEventListener("click",() => {
        showTermsOfServiceWindow();
    });
}

async function signUp() {
    try {
        setSignupButtonLoadingStyle();
        setFieldsDefaultStyle();

        if (await isSignupInfoValid()) {
            await sendSignupCode();
            await setSessionEmail();
            await setSessionHashedPassword();
            showSignupVerificationPage();
        } else {
            await handleInvalidInfo();
        }

        setSignupButtonDefaultStyle();
    } catch (error) {
        alert("Error: "+error.message);
        setSignupButtonDefaultStyle();
    }
}
function isEmailValid() {
    const email = signupEmailInput.value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailPattern.test(email);
}
function isPasswordValid() {
    const password = signupPasswordInput.value.trim();
    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d).{12,}$/;

    return passwordPattern.test(password);
}
async function isUserInUsersDB() {
    const email = signupEmailInput.value.trim();

    const response = await fetch(`${API_BASE_URL}/user/availability?email=${encodeURIComponent(email)}`, {
            method: "GET",
            credentials: "include",
        }
    );

    const data = await response.json();

    if (data.success) {
        return data.result;
    } else {
        throw new Error(data.error);
    }
}
async function isSignupInfoValid(){
    return isEmailValid() && isPasswordValid() && !await isUserInUsersDB();
}
async function sendSignupCode() {
    const email = signupEmailInput.value.trim();

    const response = await fetch(`${API_BASE_URL}/auth/signup/request-code`, {
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
async function setSessionEmail() {
    const email = signupEmailInput.value.trim();

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
async function setSessionHashedPassword() {
    const password = signupPasswordInput.value.trim();

    const response = await fetch(`${API_BASE_URL}/session/password`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({password}),
        credentials: "include"
    });

    const data = await response.json();

    if (!data.success) {
        throw new Error(data.error);
    }
}
function showSignupVerificationPage() {
    window.location.href = '../pages/signup-verification.html';
}
function getBlackBackground() {
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0.6)"; // black 60% opacity
    overlay.style.zIndex = "999";
    return overlay;
}
function showPrivacyPolicyWindow() {
    const privacyPolicy = [
        {
            title: "1. Account Info",
            paragraph: "We collect your email, password (stored securely in hashed form), and optionally your avatar. You can sign up with email and password and optionally log in with Google."
        },
        {
            title: "2. Typing Data",
            paragraph: "We track your typing speed, accuracy, and progress to show your results and improve the service."
        },
        {
            title: "3. No Sharing",
            paragraph: "We do not sell or share your information with third parties."
        },
        {
            title: "4. Security",
            paragraph: "We take reasonable measures to keep your data safe."
        }
    ];
    showOverlayWindow("Privacy Policy",privacyPolicy);
}
function showTermsOfServiceWindow() {
    const termsOfService = [
        {
            title: "1. Account Responsibility",
            paragraph: "Users are responsible for their account, email, and password. Any activity under their account is their responsibility."
        },
        {
            title: "2. Acceptable Use",
            paragraph: "Users must not attempt to hack, disrupt, or abuse the service."
        },
        {
            title: "3. Changes to Terms",
            paragraph: "Terms may be updated, and continued use of the service constitutes acceptance."
        }
    ];
    showOverlayWindow("Privacy Policy",termsOfService);
}
function showOverlayWindow(title,sections) {
    const overlay = getBlackBackground();
    const modal = document.createElement("div");

    // make overlay a flex container to center the modal
    overlay.style.display = "flex";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";

    modal.style.position = "relative";
    modal.style.width = "395px";
    modal.style.height = "530px";
    modal.style.backgroundColor = "#171717";
    modal.style.borderRadius = "16px";
    modal.style.boxShadow = "0 4px 20px rgba(0,0,0,0.5)";
    modal.style.padding = "20px";
    modal.style.color = "#fff"; // for text visibility (optional)
    modal.style.transform = "translateX(45px)"; // start slightly to the right
    modal.style.opacity = "0"; // start invisible
    modal.style.transition = "transform 0.4s ease, opacity 0.2s ease"; // smooth movement + fade

    // Create the title element
    const titleElement = document.createElement("h1");
    titleElement.textContent = title;
    titleElement.style.fontFamily = "'Roboto', sans-serif";
    titleElement.style.width = "fit-content";
    titleElement.style.fontSize = "26px";
    titleElement.style.color = "#ffffff";
    titleElement.style.margin = "5px 0 40px 10px"; // optional spacing below title

    const exit = document.createElement("img");
    exit.src = "../assets/symbols/exit-default.png";
    exit.style.width = "47px";    // width of the image
    exit.style.height = "47px";
    exit.style.position = "absolute"; // place relative to modal
    exit.style.top = "21px";
    exit.style.left = "372px";
    exit.style.cursor = "pointer";

    const scrollArea = document.createElement("div");
    scrollArea.style.height = "432px";
    scrollArea.style.overflowY = "auto";   // enables vertical scroll
    scrollArea.style.overflowX = "hidden"; // disables horizontal scroll
    scrollArea.style.backgroundColor = "transparent";
    scrollArea.style.marginLeft = "10px";
    scrollArea.style.marginRight = "6px";
    scrollArea.style.paddingRight = "15px";
    scrollArea.style.scrollbarWidth = "thin"; // Firefox thin scrollbar
    scrollArea.style.scrollbarColor = "#363434 transparent"

    modal.append(titleElement,exit,scrollArea);

    sections.forEach((section, index) => {
        const subTitle = document.createElement("h2");
        subTitle.textContent = section.title;
        subTitle.style.fontSize = "22px";
        subTitle.style.color = "#E3E3E3";
        subTitle.style.fontFamily = "'Roboto', sans-serif";
        subTitle.style.fontWeight = "500";
        subTitle.style.paddingTop = (index === 0) ? "0px" : "45px";

        const paragraph = document.createElement("p");
        paragraph.textContent = section.paragraph;
        paragraph.style.fontFamily = "'Roboto', sans-serif";
        paragraph.style.color = "#E3E3E3";
        paragraph.style.marginTop = "10px";

        // ensure text wraps
        paragraph.style.whiteSpace = "normal";      // allows wrapping
        paragraph.style.wordWrap = "break-word";    // break long words if needed
        paragraph.style.wordBreak = "break-word";   // alternative for older browsers

        scrollArea.appendChild(subTitle);
        scrollArea.appendChild(paragraph);
    });

    overlay.appendChild(modal);
    document.body.appendChild(overlay);


    // slide-in + fade-in animation
    requestAnimationFrame(() => {
        modal.style.transform = "translateX(0)";
        modal.style.opacity = "1";
    });

    // click overlay to remove it
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
            document.body.removeChild(overlay);
        }
    });

    // exit hover effect
    exit.addEventListener("mouseover", () => {
        exit.src = "../assets/symbols/exit-active.png";
    });
    exit.addEventListener("mouseout", () => {
        exit.src = "../assets/symbols/exit-default.png";
    });

    // exit click event
    exit.addEventListener("click", (e) => {
        document.body.removeChild(overlay);
    });
}
function setSignupButtonLoadingStyle() {
    signupButton.className = "auth-signup-button-loading";
}
function setSignupButtonDefaultStyle() {
    signupButton.className = "auth-signup-button";
}
function setFieldsDefaultStyle() {
    setEmailDefaultStyle();
    setPasswordDefaultStyle();
}
async function handleInvalidInfo() {
    if (!isEmailValid()) {
        setEmailErrorStyle("Please enter a valid email address");
    }

    if (!isPasswordValid()) {
        setPasswordErrorStyle("Password must be 12+ length, letters & numbers");
    }

    if (await isUserInUsersDB()) {
        setEmailErrorStyle("Email address is already taken");
    }
}
function setEmailErrorStyle(error) {
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
function setPasswordErrorStyle(error) {
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

initSignup();