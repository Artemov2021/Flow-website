var input = document.getElementById("textInput");
var overlayText = document.getElementById("highlightedText");
var timer = document.getElementById("timerText");
var loginButton = document.getElementById("loginButton");
// typed (white correct and red incorrect chars) and untyped (gradient) texts
var texts = [];
var currentCaretPosition = 0;
var isTimerRunning = false;
var isCurrentWordCorrect = true;
var correctWords = 0;
function init() {
    input.value = "Rain fell gently over the quiet town. Birds sang softly as children played. An old man smiled, remembering youth. Time passed slowly yet beautifully. Life moved like the river, sometimes calm, sometimes wild, but always forward with hope.";
    texts.push("<span class=\"gradient\">".concat(input.value, "</span>"));
    overlayText.innerHTML = texts.join("");
    // Move caret to the beginning
    input.setSelectionRange(0, 0);
}
function setupListeners() {
    // Stop caret from moving on click
    input.addEventListener("mousedown", function (e) {
        e.preventDefault(); // block default caret reposition
        input.focus();
        lockCaret();
    });
    // Stop caret from moving on selection
    input.addEventListener("focus", lockCaret);
    // Handle keys
    input.addEventListener("keydown", function (e) {
        // Allow browser shortcuts
        if (e.ctrlKey || e.metaKey || e.altKey) {
            return; // do not block Ctrl+R, Ctrl+C, etc.
        }
        if (e.key.length === 1) {
            if (!isTimerRunning) {
                startTimer();
            }
            var expectedChar = input.value.charAt(currentCaretPosition);
            var typedChar = e.key;
            var correctCharacter = (expectedChar !== " " && typedChar === expectedChar);
            var incorrectCharacter = (expectedChar !== " " && typedChar !== expectedChar);
            var correctSpace = (expectedChar === " " && typedChar === expectedChar);
            var shouldCaretMove = correctCharacter || incorrectCharacter || correctSpace;
            if (shouldCaretMove) {
                if (correctCharacter) {
                    highlightCorrectChar(currentCaretPosition);
                }
                else if (incorrectCharacter) {
                    isCurrentWordCorrect = false;
                    highlightIncorrectChar(currentCaretPosition);
                }
                else if (correctSpace) {
                    recountCorrectWords();
                    addSpace();
                    isCurrentWordCorrect = true;
                }
                currentCaretPosition++;
                input.setSelectionRange(currentCaretPosition, currentCaretPosition);
                updateScroll();
            }
            else {
                lockCaret();
            }
            e.preventDefault();
        }
        // Prevent deletion keys and up,down,right,left keys
        var blockedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"];
        if (blockedKeys.indexOf(e.key) !== -1) {
            e.preventDefault();
            return;
        }
    });
}
function lockCaret() {
    input.setSelectionRange(currentCaretPosition, currentCaretPosition);
}
function highlightCorrectChar(charPosition) {
    var correctChar = input.value.charAt(charPosition);
    var rest = input.value.slice(charPosition + 1);
    // Insert at last index - 1
    var index = texts.length - 1;
    texts.splice(index, 0, "<span class=\"correct\">".concat(correctChar, "</span>"));
    // change rest text
    texts[texts.length - 1] = "<span class=\"gradient\">".concat(rest, "</span>");
    // add all texts
    overlayText.innerHTML = texts.join("");
}
function highlightIncorrectChar(charPosition) {
    var incorrectChar = input.value.charAt(charPosition);
    var rest = input.value.slice(charPosition + 1);
    // Insert at last index - 1
    var index = texts.length - 1;
    texts.splice(index, 0, "<span class=\"incorrect\">".concat(incorrectChar, "</span>"));
    // change rest text
    texts[texts.length - 1] = "<span class=\"gradient\">".concat(rest, "</span>");
    // add all texts
    overlayText.innerHTML = texts.join("");
}
function addSpace() {
    // Insert at last index - 1
    var index = texts.length - 1;
    texts.splice(index, 0, " ");
    overlayText.innerHTML = texts.join("");
}
function startTimer() {
    isTimerRunning = true;
    var totalSeconds = 59; // 1 minute
    var interval = setInterval(function () {
        var minutes = Math.floor(totalSeconds / 60);
        var seconds = totalSeconds % 60;
        // Format seconds to always show 2 digits
        timer.textContent = "".concat(minutes, ":").concat(seconds < 10 ? '0' : '').concat(seconds);
        if (totalSeconds === 0) {
            clearInterval(interval); // stop the timer
            isTimerRunning = false;
            timer.textContent = "Timer is over";
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
    var container = document.querySelector(".text-container");
    var scrollArea = document.querySelector(".scroll-area");
    var caretX = input.selectionStart || 0;
    // Estimate character width (you can refine this with actual measureText)
    var charWidth = 24; // ~40px font size → ~24px per char
    var caretPixelPos = caretX * charWidth;
    var containerMid = container.clientWidth / 2;
    if (caretPixelPos > containerMid) {
        var shift = caretPixelPos - containerMid;
        scrollArea.style.transform = "translateX(-".concat(shift, "px)");
    }
    else {
        scrollArea.style.transform = "translateX(0)";
    }
}
init();
setupListeners();
