const input = document.getElementById("textInput") as HTMLInputElement;
const scrollArea = document.getElementById("scrollArea") as HTMLDivElement;
const overlayText = document.getElementById("overlayText") as HTMLParagraphElement;
const timer = document.getElementById("timerText") as HTMLParagraphElement;
const loginButton = document.getElementById("loginButton") as HTMLButtonElement;

// typed (white correct and red incorrect chars) and untyped (gradient) texts
let texts: string[] = [];

let currentCaretPosition: number = 0;

let isTimerRunning: boolean = false;

let isCurrentWordCorrect: boolean = true;
let correctWords: number = 0;

async function init(): Promise<void> {

    const text = await getRandomText();
    input.value = text;

    texts.push(`<span class="default">${text}</span>`);
    overlayText.innerHTML = texts.join("");

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
    input.addEventListener("focus",lockCaret);

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

    // remain scrolled position after being focused away
    input.addEventListener('blur', () => {
        // Capture scroll before blur
        const scrollPos = input.scrollLeft;

        // Use rAF to re-apply scroll without visual jerk
        requestAnimationFrame(() => {
            input.scrollLeft = scrollPos;
        });
    });

}
function lockCaret(): void {
    input.setSelectionRange(currentCaretPosition,currentCaretPosition);
}
async function getRandomText(): Promise<string> {
    const randomNumber: number = Math.floor(Math.random() * 10) + 1;

    // Read file
    const response = await fetch(`texts/text${randomNumber}.txt`);

    return await response.text();
}

function highlightCorrectChar(charPosition: number): void {
    const correctChar: string = input.value.charAt(charPosition);
    const rest: string = input.value.slice(charPosition+1);

    // Insert at last index - 1
    const index = texts.length - 1;
    texts.splice(index, 0, `<span class="correct">${correctChar}</span>`);

    // change rest text
    texts[texts.length - 1] = `<span class="default">${rest}</span>`;

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
    texts[texts.length - 1] = `<span class="default">${rest}</span>`;

    // add all texts
    overlayText.innerHTML = texts.join("");

}
function addSpace(): void {
    // Insert at last index - 1
    const index = texts.length - 1;
    texts.splice(index, 0, " ");

    //overlayText.innerHTML = texts.join("");
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
            timer.textContent = `Correct words: ${correctWords}`;
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
    const caretPos = input.selectionStart ?? 0;

    // measure text width up to caret
    const ctx = document.createElement("canvas").getContext("2d");
    ctx!.font = window.getComputedStyle(input).font;
    const textBeforeCaret = input.value.substring(0, caretPos);
    const caretPixelPos = ctx!.measureText(textBeforeCaret).width;

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


init();
setupListeners();


