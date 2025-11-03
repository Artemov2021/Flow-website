import { showMenu, hideMenu, isMenuOpened } from "./common/menu.js";
import { API_BASE_URL } from "./common/config.js";

const input = document.getElementById("textInput");
const overlayText = document.getElementById("overlayText");
const timer = document.getElementById("timerText");
const timerIcon = document.getElementById("timer-icon");
const loginButton = document.getElementById("loginButton");
const userSection = document.getElementById("user-section");
const textContainer = document.getElementById("text-container");
const textGradientCircle = document.getElementById("text-gradient-circle");
const flowTitle = document.getElementById("flow-title");

// typed (white correct and red incorrect chars) and untyped (gradient) texts
let userId = null;
let hasAvatarPicture = false;
let texts = [];
let currentCaretPosition = 0;
let isTimerRunning = false;
let isCurrentWordCorrect = true;
let tooltipBackground = null;
let totalSeconds = 30;
let correctWords = 0;
let totalTypedWords = 0;

async function initMain() {
    await setupText();
    await setUserId().then(async () => {
        await setPotentialAvatar();
    });
    await validateUserAvatarPicture();
    setAvatarPicture();
    setupMainListeners();

}
async function setupText() {
    const text = await getRandomText();
    input.value = text;

    texts.push(`<span class="default">${text}</span>`);
    overlayText.innerHTML = texts.join("");

    input.setSelectionRange(0, 0);
}
async function setUserId() {
    const response = await fetch(`${API_BASE_URL}/session/user-id`, {
        method: "GET",
        credentials: "include"
    });

    const data = await response.json();

    if (!data.success) {
        throw new Error(data.error);
    }

    userId = data.result;
    console.log("User session ID: ", data.result);
}
async function setPotentialAvatar() {
    try {
        if (userId) {
            await setUserAvatar();
        }
    } catch (error) {
        alert(error.message);
    }
}
async function validateUserAvatarPicture() {
    if (userId) {
        const response = await fetch(`${API_BASE_URL}/user/has-avatar`, {
            method: "GET",
            credentials: "include"
        });

        const data = await response.json();

        if (!data.success) {
            console.log(data.error);
        }

        if (data.result) {
            hasAvatarPicture = true;
        }
    }
}
function setAvatarPicture() {
    if (hasAvatarPicture) {
        const mainAvatar = document.getElementById("main-avatar");
        mainAvatar.src = `${API_BASE_URL}/uploads/avatars/${userId}.jpg?${Date.now()}`;
    }
}
function setupMainListeners() {
    flowTitle.addEventListener("click",() => {
        window.location.href = "../pages/index.html";
    });

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
        // Prevent deletion keys and up,down,right,left keys
        const blockedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"];
        if (blockedKeys.indexOf(e.key) !== -1) {
            e.preventDefault();
            return;
        }

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

    if (!userId) {
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
        }
    });

    document.addEventListener("click",(e) => {
        if (isMenuOpened) {
            hideMenu();
        }
    });
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
    try {
        hideMainPageAndShowResults();
        await checkAndShowRecords();
        await checkAndSaveResults();
    } catch (error) {
        console.error(error);
        alert(error.message);
    }

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
    showResultsElements();
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
function showResultsElements() {
    const resultsElements = document.createElement("div");
    resultsElements.style.margin = "150px auto 0 auto";
    resultsElements.style.display = "flex";
    resultsElements.style.flexDirection = "column";
    resultsElements.style.alignItems = "center";
    resultsElements.style.width = "fit-content";


    const speedTitle = document.createElement("p");
    speedTitle.textContent = "Typing speed";
    speedTitle.style.display = "block";
    speedTitle.style.margin = "0 auto 0 auto";
    speedTitle.style.fontSize = "28px";
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
    // Delay 1 second before showing
    setTimeout(() => {
        speedTitle.style.opacity = "1";
        speedTitle.style.transform = "translateX(0)";
    }, 350);
    // Delay 1 second before showing
    setTimeout(() => {
        speedLabel.style.opacity = "1";
        speedLabel.style.transform = "translateX(0)";
    }, 650);


    const speedLabel = document.createElement("p");
    speedLabel.textContent = "0 WPM";
    speedLabel.style.display = "block";
    speedLabel.style.margin = "75px auto 0 auto";
    speedLabel.style.fontSize = "95px";
    speedLabel.style.fontFamily = "'Roboto', sans-serif";
    speedLabel.style.fontWeight = "700";
    speedLabel.style.textAlign = "center"; // optional: center text
    speedLabel.style.color = "white";
    // Start hidden & slightly to the right
    speedLabel.style.opacity = "0";
    speedLabel.style.transform = "translateX(18px)";
    speedLabel.style.transition = "opacity 0.7s ease, transform 0.7s ease";
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


    const totalWordsLabel = document.createElement("p");
    totalWordsLabel.textContent = "Total words: "+totalTypedWords;
    totalWordsLabel.style.display = "block";
    totalWordsLabel.style.margin = "10px auto 0 auto";
    totalWordsLabel.style.fontSize = "22px";
    totalWordsLabel.style.fontFamily = "'Roboto', sans-serif";
    totalWordsLabel.style.fontWeight = "500";
    totalWordsLabel.style.textAlign = "center"; // optional: center text
    totalWordsLabel.style.color = "#848484";
    // Start hidden & slightly to the right
    totalWordsLabel.style.opacity = "0";
    totalWordsLabel.style.transform = "translateX(18px)";
    totalWordsLabel.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    // Delay 1 second before showing
    setTimeout(() => {
        totalWordsLabel.style.opacity = "1";
        totalWordsLabel.style.transform = "translateX(0)";
    }, 2150);


    const tryAgainButtonContainer = document.createElement("div");
    tryAgainButtonContainer.style.margin = "75px auto 0 auto";
    tryAgainButtonContainer.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    tryAgainButtonContainer.style.opacity = "0";
    tryAgainButtonContainer.style.transform = "translateX(18px)";
    tryAgainButtonContainer.style.display = "block";
    tryAgainButtonContainer.style.justifyContent = "center";

    const tryAgainText = document.createElement("span");
    tryAgainText.textContent = "Try again";
    tryAgainText.style.display = "inline-block";
    tryAgainText.style.transform = "translateX(5px)"; // move text 5px right

    const tryAgainSymbol = document.createElement("img");
    tryAgainSymbol.src = "../assets/symbols/try-again-symbol.png";
    tryAgainSymbol.width = 24;
    tryAgainSymbol.height = 25;
    tryAgainSymbol.style.position = "absolute";
    tryAgainSymbol.style.left = "calc(50% - 78px)"; // roughly 5px left of text start
    tryAgainSymbol.style.top = "50%";
    tryAgainSymbol.style.transform = "translateY(-50%)";
    tryAgainSymbol.style.pointerEvents = "none";

    const tryAgainButton = document.createElement("button");
    tryAgainButton.style.position = "relative";
    tryAgainButton.style.display = "flex";
    tryAgainButton.style.alignItems = "center";
    tryAgainButton.style.justifyContent = "center";
    tryAgainButton.style.height = "58px";
    tryAgainButton.style.padding = "0";
    tryAgainButton.style.fontSize = "23px";
    tryAgainButton.style.fontWeight = "500";
    tryAgainButton.style.color = "white";
    tryAgainButton.style.background = "#171717";
    tryAgainButton.style.border = "none";
    tryAgainButton.style.borderRadius = "16px";
    tryAgainButton.style.cursor = "pointer";
    tryAgainButton.style.transition = "background 0.3s ease, transform 0.3s ease";
    tryAgainButton.style.transform = "none";
    tryAgainButton.addEventListener("mouseover", () => {
        tryAgainButton.style.background = "#1C1C1C"; // hover color
    });
    tryAgainButton.addEventListener("mouseout", () => {
        tryAgainButton.style.background = "#171717"; // back to normal
    });
    tryAgainButton.addEventListener("click",() => {
        window.location.href = "../pages/index.html";
    });
    setTimeout(() => {
        tryAgainButtonContainer.style.opacity = "1";
        tryAgainButtonContainer.style.transform = "translateX(0)";
    }, 2250);

    tryAgainButton.append(tryAgainSymbol, tryAgainText);
    tryAgainButtonContainer.appendChild(tryAgainButton);
    resultsElements.append(speedTitle,speedLabel,totalWordsLabel,tryAgainButtonContainer);
    document.body.appendChild(resultsElements);

    // Wait for animation + rendering to finish before matching widths
    setTimeout(() => {
        const wpmWidth = speedLabel.offsetWidth;

        // Apply width to both container and button
        tryAgainButtonContainer.style.width = `${wpmWidth}px`;
        tryAgainButtonContainer.style.width = "100%";
        tryAgainButton.style.width = "100%";

        // Keep proportions consistent (centered + rounded)
        tryAgainButton.style.maxWidth = "480px"; // optional limit for large screens
        tryAgainButton.style.minWidth = "220px"; // optional lower limit
    }, 800);
}
async function checkAndSaveResults() {
    if (userId) {
        await saveResults();
    }
}
async function saveResults() {
    const response = await fetch(`${API_BASE_URL}/stats/results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({totalWords: totalTypedWords, correctWords}),
        credentials: "include",
    });

    const data = await response.json();

    if (!data.success) {
        throw new Error(data.error);
    }
}
async function checkAndShowRecords() {
    if (userId) {
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
    const response = await fetch(`${API_BASE_URL}/stats/records/correct-words`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
    });

    const data = await response.json();

    if (!data.success) {
        throw new Error(data.error);
    }

    return data.result;
}

await initMain();

