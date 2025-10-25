const input = document.getElementById("textInput");
const overlayText = document.getElementById("overlayText");
const timer = document.getElementById("timerText");
const timerIcon = document.getElementById("timer-icon");
const loginButton = document.getElementById("loginButton");
const userSection = document.getElementById("user-section");
const textContainer = document.getElementById("text-container");
const textGradientCircle = document.getElementById("text-gradient-circle");

// typed (white correct and red incorrect chars) and untyped (gradient) texts
let userId = null;
let email = null;
let texts = [];
let currentCaretPosition = 0;
let isTimerRunning = false;
let isCurrentWordCorrect = true;
let tooltipBackground = null;
let isMenuOpened = false;
let totalSeconds = 3;

let correctWords = 0;
let totalTypedWords = 0;

async function initMain() {
    const text = await getRandomText();
    input.value = text;

    texts.push(`<span class="default">${text}</span>`);
    overlayText.innerHTML = texts.join("");

    input.setSelectionRange(0, 0);
}
async function setEmail() {
    const res = await fetch("http://localhost:8080/get-session-email", {
        credentials: "include"
    });
    const data = await res.json();
    email = data.data;
}
async function setUserId() {
    const response = await fetch("http://localhost:8080/get-session-user_id", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({email}),
    });
    const data = await response.json();

    if (data.success) {
        userId = data.data;
    } else {
        alert("error: "+data.errorMessage);
    }
}
async function setPotentialAvatar() {
    try {
        if (isThereUserEmail() && await isEmailInUsersDB()) {
            await setUserAvatar();
        }
    } catch (error) {
        alert(error.message);
    }
}
function setupMainListeners() {
    // Stop caret from moving on click
    input.addEventListener("mousedown", (e) => {
        e.preventDefault(); // block default caret reposition
        input.focus();
        lockCaret();
    });

    // Stop caret from moving on selection
    input.addEventListener("focus",lockCaret);

    // Handle keys
    input.addEventListener("keydown", (e) => {
        // Allow browser shortcuts
        if (e.ctrlKey || e.metaKey || e.altKey) {
            return; // do not block Ctrl+R, Ctrl+C, etc.
        }

        if (e.key.length === 1) {
            if (!isTimerRunning) {
                startTimer(e);
            }

            checkAndRemoveTooltip();

            const expectedChar = input.value.charAt(currentCaretPosition);
            const typedChar = e.key;
            const nextChar = input.value.charAt(currentCaretPosition+1);

            const correctCharacter = (expectedChar !== " " && typedChar === expectedChar);
            const incorrectCharacter = (expectedChar !== " " && typedChar !== expectedChar);
            const correctSpace = (expectedChar === " " && typedChar === expectedChar);

            const shouldCaretMove = correctCharacter || incorrectCharacter || correctSpace;

            if (shouldCaretMove) {
                if (correctCharacter) {
                    highlightCorrectChar(currentCaretPosition);
                } else if (incorrectCharacter) {
                    isCurrentWordCorrect = false;
                    highlightIncorrectChar(currentCaretPosition);
                } else if (correctSpace) {
                    addSpace();
                    isCurrentWordCorrect = true;
                }

                currentCaretPosition++;
                input.setSelectionRange(currentCaretPosition,currentCaretPosition);
                updateScroll();
            } else {
                lockCaret();
            }

            if (nextChar === " ") {
                totalTypedWords++;
                recountCorrectWords();
            }

            e.preventDefault();
        }

        // Prevent deletion keys and up,down,right,left keys
        const blockedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"];
        if (blockedKeys.indexOf(e.key) !== -1) {
            e.preventDefault();
            return;
        }
    });

    // Remain scrolled position after being focused away
    input.addEventListener('blur', () => {
        // Capture scroll before blur
        const scrollPos = input.scrollLeft;

        // Use rAF to re-apply scroll without visual jerk
        requestAnimationFrame(() => {
            input.scrollLeft = scrollPos;
        });
    });

    if (!isThereUserEmail()) {
        // Load Log In page, when login button clicked
        loginButton.addEventListener('click', () => {
            window.location.href = '../pages/login.html';
        });

        userSection.style.top = "7px";
        userSection.style.right = "22px";
    }

    setTimeout(function () {
        checkAndShowTextTooltip("As you start typing, the timer starts running");
    }, 2000);
}

async function setUserAvatar() {
    userSection.innerHTML = `
        <div class="user-profile">
            <img src="../assets/symbols/user-profile-default.png" alt="User Avatar" class="avatar" id="main-avatar">
        </div>
    `;
    userSection.style.top = "20px";
    userSection.style.right = "33px";

    const avatar = document.getElementById("main-avatar");
    avatar.addEventListener("click",(e) => {
        if (!isMenuOpened) {
            e.stopPropagation();
            showMenu();
            isMenuOpened = true;
        }
    });

    document.addEventListener("click",(e) => {
        if (isMenuOpened) {
            hideMenu();
            isMenuOpened = false;
        }
    });


}
function isThereUserEmail() {
    return email !== null && email !== "";
}
async function isEmailInUsersDB() {
    try {
        const response = await fetch("http://localhost:8080/is-user-in-users-db", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({email}),
        });

        const data = await response.json();

        if (data.success) {
            const isUserInUsersDB = data.data;
            return isUserInUsersDB;
        } else {
            alert(data.errorMessage);
        }
    } catch (error) {
        alert(error.message);
    }
}
function lockCaret() {
    input.setSelectionRange(currentCaretPosition,currentCaretPosition);
}
async function getRandomText() {
    const randomNumber = Math.floor(Math.random() * 10) + 1;

    // Read file
    const response = await fetch(`../assets/texts/text${randomNumber}.txt`);

    return await response.text();
}
function checkAndShowTextTooltip(text) {
    if (currentCaretPosition !== 0) {
        return;
    }
    showTooltip(text,"57px");
}
function showTooltip(text,topMarginInPx) {
    tooltipBackground = document.createElement("div");
    tooltipBackground.style.background = "#161616";
    tooltipBackground.style.borderRadius = "16px";

    tooltipBackground.style.top = topMarginInPx;
    tooltipBackground.style.position = "absolute";
    tooltipBackground.style.left = "50%";
    tooltipBackground.style.transform = "translateX(-50%)";
    tooltipBackground.style.padding = "8px 16px 8px 16px";
    tooltipBackground.style.opacity = "0"; // start invisible
    tooltipBackground.style.transform = "translateX(-50%) translateY(-5px)"; // start above
    tooltipBackground.style.transition = "opacity 0.45s ease, transform 0.45s ease"; // smooth animation


    const tooltipText = document.createElement("p");
    tooltipText.textContent = text;
    tooltipText.style.color = "#CECECE";
    tooltipText.style.fontSize = "16px";
    tooltipText.style.fontFamily = "'Roboto', sans-serif";
    tooltipText.style.margin = "0px";

    // trigger the animation
    requestAnimationFrame(() => {
        tooltipBackground.style.opacity = "1";
        tooltipBackground.style.transform = "translateX(-50%) translateY(0)"; // move to final position
    });

    tooltipBackground.appendChild(tooltipText);
    document.body.appendChild(tooltipBackground);
}
function checkAndRemoveTooltip() {
    if (tooltipBackground instanceof HTMLElement) {
        tooltipBackground.style.opacity = "0";
        tooltipBackground.style.transform = "translateX(-50%) translateY(-10px)";

        const handleTransitionEnd = () => {
            if (tooltipBackground && tooltipBackground.parentNode) {
                tooltipBackground.parentNode.removeChild(tooltipBackground);
            }
            tooltipBackground?.removeEventListener("transitionend", handleTransitionEnd);
            tooltipBackground = null;
        };

        tooltipBackground.addEventListener("transitionend", handleTransitionEnd, { once: true });
    }
}
function showMenu() {
    const menuBackground = document.createElement("div");
    menuBackground.id = "menu-background";
    menuBackground.className = "menu-background";


    const myStatsButton = document.createElement("div");
    myStatsButton.className = "menu-button";
    myStatsButton.style.marginBottom = "4px";

    const myStatsText = document.createElement("p");
    myStatsText.className = "menu-button-text";
    myStatsText.textContent = "My stats";

    const myStatsSymbol = document.createElement("img");
    myStatsSymbol.className = "my-stats-button-symbol";
    myStatsSymbol.src = "../assets/symbols/stats.png";
    myStatsSymbol.width = 27;
    myStatsSymbol.height = 27;


    const settingsButton = document.createElement("div");
    settingsButton.className = "menu-button";
    settingsButton.style.marginTop = "4px";

    const settingsText = document.createElement("p");
    settingsText.className = "menu-button-text";
    settingsText.textContent = "Settings";

    const settingsSymbol = document.createElement("img");
    settingsSymbol.className = "settings-button-symbol";
    settingsSymbol.src = "../assets/symbols/settings.png";
    settingsSymbol.width = 21;
    settingsSymbol.height = 21;


    const menuLine = document.createElement("div");
    menuLine.style.height = "0.5px";
    menuLine.style.marginLeft = "8px";
    menuLine.style.marginRight = "8px";
    menuLine.style.backgroundColor = "#2C2C2C";


    const logoutButton = document.createElement("div");
    logoutButton.id = "logout-button"
    logoutButton.className = "menu-button";
    logoutButton.addEventListener("click",async (e) => {
        e.preventDefault();
        hideMenu();
        isMenuOpened = false;
        await deleteSessionEmail();
        reloadMainPage();
    });

    const logoutButtonText = document.createElement("p");
    logoutButtonText.textContent = "Log out";
    logoutButtonText.className = "menu-logout-button-text";

    const logoutButtonSymbol = document.createElement("img");
    logoutButtonSymbol.className = "menu-logout-button-symbol";
    logoutButtonSymbol.src = "../assets/symbols/logout.png";
    logoutButtonSymbol.width = 20;
    logoutButtonSymbol.height = 20;



    myStatsButton.append(myStatsText,myStatsSymbol);
    settingsButton.append(settingsText,settingsSymbol);
    logoutButton.append(logoutButtonText,logoutButtonSymbol);
    menuBackground.append(myStatsButton,settingsButton,menuLine,logoutButton);
    document.body.appendChild(menuBackground);

    // Trigger fade-in (after the element is in the DOM)
    requestAnimationFrame(() => {
        menuBackground.style.opacity = "1";
    });

    menuBackground.addEventListener("click",(e) => {
        e.stopPropagation();
    })
}
function hideMenu() {
    const menu = document.getElementById("menu-background");
    // Fade out smoothly before removing
    menu.style.opacity = "0";

    // Wait for the transition to finish before removing
    menu.addEventListener(
        "transitionend",
        () => {
            if (menu.parentElement) {
                document.body.removeChild(menu);
            }
        },
        { once: true } // ensures it runs only once
    );
}
async function deleteSessionEmail() {
    try {
        const response = await fetch("http://localhost:8080/delete-session-email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include"
        });

        const data = await response.json();

        if (!data.success) {
            alert(data.errorMessage);
        }
    } catch (error) {
        alert(error.message);
    }
}
function reloadMainPage() {
    window.location.href = '../pages/index.html';
}

function highlightCorrectChar(charPosition) {
    const correctChar = input.value.charAt(charPosition);
    const rest = input.value.slice(charPosition+1);

    // Insert at last index - 1
    const index = texts.length - 1;
    texts.splice(index, 0, `<span class="correct">${correctChar}</span>`);

    // change rest text
    texts[texts.length - 1] = `<span class="default">${rest}</span>`;

    // add all texts
    overlayText.innerHTML = texts.join("");

}
function highlightIncorrectChar(charPosition) {
    const incorrectChar = input.value.charAt(charPosition);
    const rest = input.value.slice(charPosition+1);

    // Insert at last index - 1
    const index = texts.length - 1;
    texts.splice(index, 0, `<span class="incorrect">${incorrectChar}</span>`);

    // change rest text
    texts[texts.length - 1] = `<span class="default">${rest}</span>`;

    // add all texts
    overlayText.innerHTML = texts.join("");

}
function addSpace() {
    // Insert at last index - 1
    const index = texts.length - 1;
    texts.splice(index, 0, " ");

    //overlayText.innerHTML = texts.join("");
}

function startTimer(e) {
    if (e) e.preventDefault();
    isTimerRunning = true;

    const interval = setInterval(async () => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        // Format seconds to always show 2 digits
        timer.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

        if (totalSeconds === 0) {
            clearInterval(interval);      // stop the timer
            isTimerRunning = false;
            await onTimerEnd(e);
        } else {
            totalSeconds--;
        }

    }, 1000);
}
async function onTimerEnd() {
    hideMainPageAndShowResults();
    await checkAndShowRecords();
    await checkAndSaveResults();
}
function recountCorrectWords() {
    if (isCurrentWordCorrect) {
        correctWords++;
    }
}
function updateScroll() {
    const caretPos = input.selectionStart ?? 0;

    // measure text width up to caret
    const ctx = document.createElement("canvas").getContext("2d");
    ctx.font = window.getComputedStyle(input).font;
    const textBeforeCaret = input.value.substring(0, caretPos);
    const caretPixelPos = ctx.measureText(textBeforeCaret).width;

    const containerMid = input.clientWidth / 2;
    const maxScroll = input.scrollWidth - input.clientWidth;

    let targetScroll = 0;
    if (caretPixelPos > containerMid) {
        targetScroll = caretPixelPos - containerMid;
    }

    // clamp
    if (targetScroll > maxScroll) targetScroll = maxScroll;

    input.scrollLeft = targetScroll;


    // Ensure smooth transform animations
    overlayText.style.transition = "transform 0.15s ease-out";
    // 🔑 Move overlay text left to match scroll
    overlayText.style.transform = `translateX(-${targetScroll}px)`;
}
function hideMainPageAndShowResults() {
    makeTextInputDisabled();
    hideTimer();
    hideText();
    showSpeedTitle();
    showSpeedLabel();
    showTotalWordsLabel();
    showTryAgainButton();
}
function makeTextInputDisabled() {
    input.disabled = true;
}
function hideTimer() {
    timer.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    timer.style.transform = 'translateY(-20px)';
    timer.style.opacity = '0';

    timerIcon.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    timerIcon.style.transform = 'translateY(-20px)';
    timerIcon.style.opacity = '0';
}
function hideText() {
    textContainer.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    textContainer.style.transform = 'translate(-50%, calc(-50% + 40px))';
    textContainer.style.opacity = '0';

    textGradientCircle.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    textGradientCircle.style.transform = 'translateY(40px)';
    textGradientCircle.style.opacity = '0';
}
function showSpeedTitle() {
    const speedTitle = document.createElement("p");
    speedTitle.textContent = "Your typing speed is";
    speedTitle.style.display = "block";
    speedTitle.style.margin = "180px auto 0 auto";
    speedTitle.style.width = "300px";
    speedTitle.style.fontSize = "32px";
    speedTitle.style.fontFamily = "'Roboto', sans-serif";
    speedTitle.style.fontWeight = "600";
    speedTitle.style.textAlign = "center"; // optional: center text

    // Gradient text
    speedTitle.style.background = "linear-gradient(90deg, #FFFFFF 0%, #595959 100%)";
    speedTitle.style.webkitBackgroundClip = "text";
    speedTitle.style.backgroundClip = "text";
    speedTitle.style.color = "transparent";

    // Start hidden & slightly to the right
    speedTitle.style.opacity = "0";
    speedTitle.style.transform = "translateX(18px)";
    speedTitle.style.transition = "opacity 0.5s ease, transform 0.5s ease";

    document.body.appendChild(speedTitle);

    // Delay 1 second before showing
    setTimeout(() => {
        speedTitle.style.opacity = "1";
        speedTitle.style.transform = "translateX(0)";
    }, 350);
}
function showSpeedLabel() {
    const speedLabel = document.createElement("p");
    speedLabel.textContent = "0 WPM";
    speedLabel.style.display = "block";
    speedLabel.style.margin = "40px auto 0 auto";
    speedLabel.style.width = "384px";
    speedLabel.style.fontSize = "95px";
    speedLabel.style.fontFamily = "'Roboto', sans-serif";
    speedLabel.style.fontWeight = "700";
    speedLabel.style.textAlign = "center"; // optional: center text
    speedLabel.style.color = "white";

    // Start hidden & slightly to the right
    speedLabel.style.opacity = "0";
    speedLabel.style.transform = "translateX(18px)";
    speedLabel.style.transition = "opacity 0.7s ease, transform 0.7s ease";

    document.body.appendChild(speedLabel);

    // Delay 1 second before showing
    setTimeout(() => {
        speedLabel.style.opacity = "1";
        speedLabel.style.transform = "translateX(0)";
    }, 650);

    // Count up animation
    let current = 0;
    const duration = 1500;
    const steps = 60; // smooth animation
    const increment = correctWords / steps;

    setTimeout(() => {
        const counter = setInterval(() => {
            current += increment;
            if (current >= correctWords) {
                current = correctWords;
                clearInterval(counter);
            }
            speedLabel.textContent = Math.floor(current) + " WPM";
        }, duration / steps);
    }, 700); // start counting after fade-in
}
function showTotalWordsLabel() {
    const totalWordsLabel = document.createElement("p");
    totalWordsLabel.textContent = "Total words: "+totalTypedWords;
    totalWordsLabel.style.display = "block";
    totalWordsLabel.style.margin = "40px auto 0 auto";
    totalWordsLabel.style.width = "384px";
    totalWordsLabel.style.fontSize = "26px";
    totalWordsLabel.style.fontFamily = "'Roboto', sans-serif";
    totalWordsLabel.style.fontWeight = "500";
    totalWordsLabel.style.textAlign = "center"; // optional: center text
    totalWordsLabel.style.color = "#848484";

    // Start hidden & slightly to the right
    totalWordsLabel.style.opacity = "0";
    totalWordsLabel.style.transform = "translateX(18px)";
    totalWordsLabel.style.transition = "opacity 0.5s ease, transform 0.5s ease";

    document.body.appendChild(totalWordsLabel);

    // Delay 1 second before showing
    setTimeout(() => {
        totalWordsLabel.style.opacity = "1";
        totalWordsLabel.style.transform = "translateX(0)";
    }, 2150);
}
function showTryAgainButton() {
    const tryAgainButtonContainer = document.createElement("div");
    tryAgainButtonContainer.style.position = "fixed"; // stick to viewport
    tryAgainButtonContainer.style.left = "0";         // horizontal centering setup
    tryAgainButtonContainer.style.right = "0";
    tryAgainButtonContainer.style.margin = "150px auto 20px auto"; // keep your margin
    tryAgainButtonContainer.style.cursor = "pointer";
    tryAgainButtonContainer.style.width = "300px";
    tryAgainButtonContainer.style.height = "58px";

    // ✅ keep your animation exactly the same
    tryAgainButtonContainer.style.opacity = "0";
    tryAgainButtonContainer.style.transform = "translateX(18px)";
    tryAgainButtonContainer.style.transition = "opacity 0.5s ease, transform 0.5s ease, background-color 0.3s ease";

    const tryAgainSymbol = document.createElement("img");
    tryAgainSymbol.style.position = "absolute";
    tryAgainSymbol.style.marginLeft = "86px";
    tryAgainSymbol.style.marginTop = "16px";
    tryAgainSymbol.src = "../assets/symbols/try-again-symbol.png";
    tryAgainSymbol.width = 24;
    tryAgainSymbol.height = 25;
    tryAgainSymbol.style.pointerEvents = "none";

    const tryAgainButton = document.createElement("button");
    tryAgainButton.textContent = "Try again";
    tryAgainButton.style.display = "block";
    tryAgainButton.style.width = "100%";
    tryAgainButton.style.height = "100%";
    tryAgainButton.style.fontSize = "23px";
    tryAgainButton.style.fontFamily = "'Roboto', sans-serif";
    tryAgainButton.style.fontWeight = "500";
    tryAgainButton.style.textAlign = "center";
    tryAgainButton.style.color = "white";
    tryAgainButton.style.background = "#171717";
    tryAgainButton.style.border = "none";
    tryAgainButton.style.borderRadius = "16px";
    tryAgainButton.style.paddingLeft = "40px";
    tryAgainButton.style.cursor = "pointer";


    tryAgainButtonContainer.append(tryAgainSymbol,tryAgainButton);
    document.body.appendChild(tryAgainButtonContainer);

    // ✅ Hover effect using events
    tryAgainButton.addEventListener("mouseover", () => {
        tryAgainButton.style.background = "#1C1C1C"; // hover color
    });

    tryAgainButton.addEventListener("mouseout", () => {
        tryAgainButton.style.background = "#171717"; // back to normal
    });

    tryAgainButton.addEventListener("click",() => {
        window.location.href = "../pages/index.html"; // better reset
    });

    // ✅ same animation delay
    setTimeout(() => {
        tryAgainButtonContainer.style.opacity = "1";
        tryAgainButtonContainer.style.transform = "translateX(0)";
    }, 2250);
}
async function checkAndSaveResults() {
    if (email) {
        await saveResults();
    }
}
async function saveResults() {
    try {
        const response = await fetch("http://localhost:8080/save-results", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, totalWords: totalTypedWords, correctWords }),
        });

        if (!response.ok) {
            console.error("HTTP error", response.status);
            return;
        }

        // ✅ Prevent page reload by safely handling JSON
        const data = await response.json().catch(() => null);

        if (data && !data.success) {
            alert(data.errorMessage);
        }
    } catch (error) {
        console.error("Fetch error:", error);
    }
}
async function checkAndShowRecords() {
    if (email) {
        const record = await getCorrectWordsRecord();
        setTimeout(function () {
            if (correctWords > record) {
                showTooltip("New record: "+correctWords+" WPM!","32px");
            } else if (record > 0) {
                showTooltip("Your record: "+record+" WPM","32px");
            }

        }, 4000);
    }
}
async function getCorrectWordsRecord() {
    try {
        const response = await fetch("http://localhost:8080/get-correct-words-record", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId }),
        });

        if (!response.ok) {
            console.error("HTTP error", response.status);
            return null; // return something safe
        }

        const data = await response.json().catch(() => null);

        if (data && data.success) {
            return data.data; // ✅ return your record here
        } else {
            console.error(data?.errorMessage || "Unknown error");
            return null;
        }
    } catch (error) {
        console.error("Fetch error:", error);
        return null;
    }
}


await initMain();
setEmail().then(async () => {
    await setPotentialAvatar();
    await setUserId();
});
setupMainListeners();


