const input = document.getElementById("textInput") as HTMLInputElement;
const overlayText = document.getElementById("highlightedText") as HTMLDivElement;
const timer = document.getElementById("timerText") as HTMLParagraphElement;
const loginButton = document.getElementById("loginButton") as HTMLButtonElement;

// typed (white correct and red incorrect chars) and untyped (gradient) texts
let texts: string[] = [];

let currentCaretPosition: number = 0;

let isTimerRunning: boolean = false;

let isCurrentWordCorrect: boolean = true;
let correctWords: number = 0;

function init(): void {
    input.value = "Rain fell gently over the quiet town. Birds sang softly as children played. An old man smiled, remembering youth. Time passed slowly yet beautifully. Life moved like the river, sometimes calm, sometimes wild, but always forward with hope.";

    texts.push(`<span class="gradient">${input.value}</span>`);
    overlayText.innerHTML = texts.join("");

    // Move caret to the beginning
    input.setSelectionRange(0, 0);
}
function setupListeners(): void {
    // Stop caret from moving on click
    input.addEventListener("mousedown", (e) => {
        e.preventDefault(); // block default caret reposition
        input.focus();
        lockCaret();
    });

    // Stop caret from moving on selection
    input.addEventListener("focus", lockCaret);

    // Handle keys
    input.addEventListener("keydown", (e: KeyboardEvent): void => {
        // Allow browser shortcuts
        if (e.ctrlKey || e.metaKey || e.altKey) {
            return; // do not block Ctrl+R, Ctrl+C, etc.
        }

        if (e.key.length === 1) {
            if (!isTimerRunning) {
                startTimer();
            }

            const expectedChar: string = input.value.charAt(currentCaretPosition);
            const typedChar: string = e.key;

            const correctCharacter: boolean = (expectedChar !== " " && typedChar === expectedChar);
            const incorrectCharacter: boolean = (expectedChar !== " " && typedChar !== expectedChar);
            const correctSpace: boolean = (expectedChar === " " && typedChar === expectedChar);

            const shouldCaretMove: boolean = correctCharacter || incorrectCharacter || correctSpace;

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
        const blockedKeys: string[] = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"];
        if (blockedKeys.indexOf(e.key) !== -1) {
            e.preventDefault();
            return;
        }
    });
}
function lockCaret(): void {
    input.setSelectionRange(currentCaretPosition,currentCaretPosition);
}

function highlightCorrectChar(charPosition: number): void {
    const correctChar: string = input.value.charAt(charPosition);
    const rest: string = input.value.slice(charPosition+1);

    // Insert at last index - 1
    const index = texts.length - 1;
    texts.splice(index, 0, `<span class="correct">${correctChar}</span>`);

    // change rest text
    texts[texts.length - 1] = `<span class="gradient">${rest}</span>`;

    // add all texts
    overlayText.innerHTML = texts.join("");

}
function highlightIncorrectChar(charPosition: number): void {
    const incorrectChar: string = input.value.charAt(charPosition);
    const rest: string = input.value.slice(charPosition+1);

    // Insert at last index - 1
    const index = texts.length - 1;
    texts.splice(index, 0, `<span class="incorrect">${incorrectChar}</span>`);

    // change rest text
    texts[texts.length - 1] = `<span class="gradient">${rest}</span>`;

    // add all texts
    overlayText.innerHTML = texts.join("");

}
function addSpace(): void {
    // Insert at last index - 1
    const index = texts.length - 1;
    texts.splice(index, 0, " ");

    overlayText.innerHTML = texts.join("");
}

function startTimer(): void {
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
            timer.textContent = "Timer is over";
        }

        totalSeconds--;
    }, 1000);
}
function recountCorrectWords(): void {
    if (isCurrentWordCorrect) {
        correctWords++;
    }
}
function updateScroll(): void {
    const container = document.querySelector(".text-container") as HTMLDivElement;
    const scrollArea = document.querySelector(".scroll-area") as HTMLDivElement;

    const caretX = input.selectionStart || 0;

    // Estimate character width (you can refine this with actual measureText)
    const charWidth = 24; // ~40px font size → ~24px per char
    const caretPixelPos = caretX * charWidth;

    const containerMid = container.clientWidth / 2;

    if (caretPixelPos > containerMid) {
        const shift = caretPixelPos - containerMid;
        scrollArea.style.transform = `translateX(-${shift}px)`;
    } else {
        scrollArea.style.transform = `translateX(0)`;
    }
}

init();
setupListeners();



