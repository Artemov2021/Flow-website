var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var input = document.getElementById("textInput");
var scrollArea = document.getElementById("scrollArea");
var overlayText = document.getElementById("overlayText");
var timer = document.getElementById("timerText");
var loginButton = document.getElementById("loginButton");
// typed (white correct and red incorrect chars) and untyped (gradient) texts
var texts = [];
var currentCaretPosition = 0;
var isTimerRunning = false;
var isCurrentWordCorrect = true;
var correctWords = 0;
function init() {
    getRandomText().then(function (text) { return input.value = text; });
    console.log("text: " + input.value);
    texts.push("<span class=\"default\">".concat(input.value, "</span>"));
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
    // remain scrolled position after being focused away
    input.addEventListener('blur', function () {
        // Capture scroll before blur
        var scrollPos = input.scrollLeft;
        // Use rAF to re-apply scroll without visual jerk
        requestAnimationFrame(function () {
            input.scrollLeft = scrollPos;
        });
    });
}
function lockCaret() {
    input.setSelectionRange(currentCaretPosition, currentCaretPosition);
}
function getRandomText() {
    return __awaiter(this, void 0, void 0, function () {
        var randomNumber, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    randomNumber = Math.floor(Math.random() * 10) + 1;
                    return [4 /*yield*/, fetch("public/texts/text".concat(randomNumber, ".txt"))];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.text()];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function highlightCorrectChar(charPosition) {
    var correctChar = input.value.charAt(charPosition);
    var rest = input.value.slice(charPosition + 1);
    // Insert at last index - 1
    var index = texts.length - 1;
    texts.splice(index, 0, "<span class=\"correct\">".concat(correctChar, "</span>"));
    // change rest text
    texts[texts.length - 1] = "<span class=\"default\">".concat(rest, "</span>");
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
    texts[texts.length - 1] = "<span class=\"default\">".concat(rest, "</span>");
    // add all texts
    overlayText.innerHTML = texts.join("");
}
function addSpace() {
    // Insert at last index - 1
    var index = texts.length - 1;
    texts.splice(index, 0, " ");
    //overlayText.innerHTML = texts.join("");
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
            timer.textContent = "Correct words: ".concat(correctWords);
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
    var _a;
    var caretPos = (_a = input.selectionStart) !== null && _a !== void 0 ? _a : 0;
    // measure text width up to caret
    var ctx = document.createElement("canvas").getContext("2d");
    ctx.font = window.getComputedStyle(input).font;
    var textBeforeCaret = input.value.substring(0, caretPos);
    var caretPixelPos = ctx.measureText(textBeforeCaret).width;
    var containerMid = input.clientWidth / 2;
    var maxScroll = input.scrollWidth - input.clientWidth;
    var targetScroll = 0;
    if (caretPixelPos > containerMid) {
        targetScroll = caretPixelPos - containerMid;
    }
    // clamp
    if (targetScroll > maxScroll)
        targetScroll = maxScroll;
    input.scrollLeft = targetScroll;
    // Ensure smooth transform animations
    overlayText.style.transition = "transform 0.15s ease-out";
    // 🔑 Move overlay text left to match scroll
    overlayText.style.transform = "translateX(-".concat(targetScroll, "px)");
}
init();
setupListeners();
