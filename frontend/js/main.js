const input = document.getElementById("textInput");
const overlayText = document.getElementById("overlayText");
const timer = document.getElementById("timerText");
const loginButton = document.getElementById("loginButton");

// typed (white correct and red incorrect chars) and untyped (gradient) texts
let texts = [];
let currentCaretPosition = 0;
let isTimerRunning = false;
let isCurrentWordCorrect = true;
let correctWords = 0;
let tooltipBackground = null;
let isMenuOpened = false;

async function initMain() {
    const text = await getRandomText();
    input.value = text;

    texts.push(`<span class="default">${text}</span>`);
    overlayText.innerHTML = texts.join("");

    input.setSelectionRange(0, 0);
}
async function setPotentialAvatar() {
    try {
        if (isThereUserEmail() && await isLocalStorageEmailInUsersDB()) {
            setUserAvatar();
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
                startTimer();
            }

            checkAndRemoveTooltip();

            const expectedChar = input.value.charAt(currentCaretPosition);
            const typedChar = e.key;

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
                    recountCorrectWords();
                    addSpace();
                    isCurrentWordCorrect = true;
                }
                currentCaretPosition++;
                input.setSelectionRange(currentCaretPosition,currentCaretPosition);
                updateScroll();
            } else {
                lockCaret();
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
    }

    // Show tooltip in 1 sec
    setTimeout(showTooltip, 2000);
}

async function setUserAvatar() {
    const userSection = document.getElementById("user-section");

    userSection.innerHTML = `
        <div class="user-profile">
            <img src="../assets/symbols/user-profile-default.png" alt="User Avatar" class="avatar" id="main-avatar">
        </div>
    `;

    const avatar = document.getElementById("main-avatar");
    avatar.addEventListener("click",() => {
        isMenuOpened = true;
        showMenu();
    });


}
function isThereUserEmail() {
    const email = localStorage.getItem("userEmail");
    return email !== null && email !== "";
}
async function isLocalStorageEmailInUsersDB() {
    const email = localStorage.getItem("userEmail");
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
function showTooltip() {
    if (currentCaretPosition !== 0) {
        return;
    }

    tooltipBackground = document.createElement("div");
    tooltipBackground.style.background = "#161616";
    tooltipBackground.style.borderRadius = "16px";

    tooltipBackground.style.top = "57px";
    tooltipBackground.style.position = "absolute";
    tooltipBackground.style.left = "50%";
    tooltipBackground.style.transform = "translateX(-50%)";
    tooltipBackground.style.padding = "8px 16px 8px 16px";
    tooltipBackground.style.opacity = "0"; // start invisible
    tooltipBackground.style.transform = "translateX(-50%) translateY(-5px)"; // start above
    tooltipBackground.style.transition = "opacity 0.45s ease, transform 0.45s ease"; // smooth animation


    const tooltipText = document.createElement("p");
    tooltipText.textContent = "As you start typing, the timer starts running";
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
    if (tooltipBackground !== null && tooltipBackground !== "") {
        tooltipBackground.style.opacity = "0";
        tooltipBackground.style.transform = "translateX(-50%) translateY(-10px)";

        tooltipBackground.addEventListener("transitionend", () => {
            document.body.removeChild(tooltipBackground);
            tooltipBackground = null;
        });
    }
}
function showMenu() {

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

function startTimer() {
    isTimerRunning = true;
    let totalSeconds = 59; // 1 minute

    const interval = setInterval(() => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        // Format seconds to always show 2 digits
        timer.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

        if (totalSeconds === 0) {
            clearInterval(interval);      // stop the timer
            isTimerRunning = false;
            timer.textContent = `Correct words: ${correctWords}`;
        }

        totalSeconds--;
    }, 1000);
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

localStorage.setItem("userEmail","artemovtymur@gmail.com");

initMain();
setPotentialAvatar();
setupMainListeners();



