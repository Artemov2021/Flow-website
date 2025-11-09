import {hideMenu, isMenuOpened, showMenu} from "./common/menu.js";
import {API_BASE_URL} from "./common/config.js";

const statsMainAvatar = document.getElementById("my-stats-main-avatar");
const myStatsTitle = document.getElementById("my-stats-title");
const myStatsChart = document.getElementById("my-stats-chart");
const myStatsInfoBlock1 = document.getElementById("my-stats-info-block1");
const myStatsInfoBlock2 = document.getElementById("my-stats-info-block2");
const myStatsInfoBlock3 = document.getElementById("my-stats-info-block3");
const averageAccuracy = document.getElementById("stats-average-accuracy");
const bestWPM = document.getElementById("stats-best-wpm");
const currentStreak = document.getElementById("stats-current-streak");
const chartGrid = document.getElementById("chart-grid")
const chartLine = document.getElementById("chart-line");
const flowTitle = document.getElementById("flow-title");

let userData = [];
let userId = null;
let hasAvatar = false;

async function initMyStats() {
    try {
        await setUserId();
        await validateUserAvatar();
        setMyStatsMainAvatar();
        setupMyStatsListeners();
        showAppearingAnimations();
        await setData();
        if (userData) {
            await Promise.all([
                showGraphLine(),
                showAverageAccuracy(),
                showBestWPM(),
                showCurrentStreak()
            ]);
        }
    } catch (error) {
        console.log(error.message);
    }
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
async function validateUserAvatar() {
    const response = await fetch(`${API_BASE_URL}/user/has-avatar`, {
        method: "GET",
        credentials: "include"
    });

    const data = await response.json();

    if (!data.success) {
        console.log(data.error);
    }

    if (data.result) {
        hasAvatar = true;
    }
}
function setMyStatsMainAvatar() {
    if (hasAvatar) {
        statsMainAvatar.src = `${API_BASE_URL}/uploads/avatars/${userId}.jpg?${Date.now()}`;
    }
}
async function setData() {
    const response = await fetch(`${API_BASE_URL}/stats/sessions`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    });

    const data = await response.json();

    if (!data.success) {
        throw new Error(data.error);
    }

    userData = data.result;
}

function setupMyStatsListeners() {
    flowTitle.addEventListener("click",() => {
        window.location.href = "../index.html";
    });

    statsMainAvatar.addEventListener("click",(e) => {
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
function showAppearingAnimations() {
    showMyStatsTitleAppearing();
    showChartAppearing();
    showInfoBlocksAppearing();
}
function showMyStatsTitleAppearing() {
    setTimeout(() => {
        myStatsTitle.style.opacity = "1";
        myStatsTitle.style.transform = "translateX(0)";
    }, 350);
}
function showChartAppearing() {
    setTimeout(() => {
        myStatsChart.style.opacity = "1";
        myStatsChart.style.transform = "translateX(0)";
    }, 550);
}
function showInfoBlocksAppearing() {
    setTimeout(() => {
        myStatsInfoBlock1.style.opacity = "1";
        myStatsInfoBlock1.style.transform = "translateX(0)";
    }, 650);
    setTimeout(() => {
        myStatsInfoBlock2.style.opacity = "1";
        myStatsInfoBlock2.style.transform = "translateX(0)";
    }, 750);
    setTimeout(() => {
        myStatsInfoBlock3.style.opacity = "1";
        myStatsInfoBlock3.style.transform = "translateX(0)";
    }, 850);
}
async function showGraphLine() {
    try {
        const wpmSortedData = userData ? getSortedWPMData(userData) : [];

        if (userData.length >= 2 && wpmSortedData.length >= 2) {
            adjustYNumbers(userData);
            adjustXNumbers(userData);

            const chartWidth = chartGrid.clientWidth - 3;
            const chartHeight = 286;
            const maxScaleWPM = getMaxYAxisNumber(userData);

            // Convert values to (x,y) positions
            const points = wpmSortedData.map((wpm, i) => {
                const element = document.getElementById("x-number" + (i + 1));
                const rect = element.getBoundingClientRect();
                let x;
                if (i === 0) {
                    x = 0;
                } else if (i === 9) {
                    x = chartWidth;
                } else {
                    x = element.offsetLeft + rect.width / 2;
                }

                const y = ( ((chartHeight) / (0 - maxScaleWPM)) * wpm ) + chartHeight;
                return `${x},${y}`;
            }).join(" ");

            // Create or update polyline
            const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
            polyline.setAttribute("points", points);
            polyline.style.fill = "none";
            polyline.style.stroke = "#7DB2FF";
            polyline.style.strokeWidth = "2.5";
            polyline.style.strokeLinecap = "round";

            chartLine.appendChild(polyline);

            const length = polyline.getTotalLength();

            polyline.style.strokeDasharray = length;
            polyline.style.strokeDashoffset = length;

            polyline.getBoundingClientRect();

            polyline.style.transition = "stroke-dashoffset 2s ease";

            setTimeout(() => {
                requestAnimationFrame(() => {
                    polyline.style.strokeDashoffset = "0";
                });
            }, 850);
        }
    } catch (error) {
        console.log(error.message);
    }

}
async function showAverageAccuracy() {
    const totalWords = await getTotalWords(); // one number
    const correctWords = userData.reduce((a, b) => a + b, 0);
    const average = totalWords ? (correctWords / totalWords) * 100 : 0;

    startCountingAnimation(averageAccuracy,average,"%");
}
async function showBestWPM() {
    const maxWPM = Math.max(...userData);

    startCountingAnimation(bestWPM,maxWPM,"");
}
async function showCurrentStreak() {
    const currentStreakInDays = await getCurrentStreak();

    console.log("current streak: "+currentStreakInDays);

    startCountingAnimation(currentStreak,currentStreakInDays," days");
}
async function getCurrentStreak() {
    const response = await fetch(`${API_BASE_URL}/stats/current-streak`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    });

    const data = await response.json();

    if (!data.success) {
        throw new Error(data.error);
    }

    return data.result;
}
async function getTotalWords() {
    const response = await fetch(`${API_BASE_URL}/stats/total-words`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    });

    const data = await response.json();

    if (!data.success) {
        throw new Error(data.error);
    }

    return data.result;
}
function startCountingAnimation(label,number,afterNumberText) {
    // Animation setup
    let startTime;
    const duration = 2000; // total duration in ms

    // Easing function — easeOutCubic (fast start, slow end)
    const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

    const animate = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1); // 0 → 1
        const eased = easeOutCubic(progress);
        const current = number * eased;

        label.textContent = Math.floor(current) + afterNumberText;

        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    };

    // Delay before animation starts
    setTimeout(() => {
        requestAnimationFrame(animate);
    }, 700);
}
function adjustYNumbers(rawData) {
    const adjustedYNumbers = getYScaleRange(Math.max(...rawData));

    for (let i = 1; i <= 4; i++) {
        const numberElement = document.getElementById("y-number" + i);
        numberElement.textContent = adjustedYNumbers[i-1].toString();
    }
}
function getYScaleRange(maxWPM) {
    if (maxWPM <= 100) return [25, 50, 75, 100];
    if (maxWPM <= 200) return [50, 100, 150, 200];
    if (maxWPM <= 400) return [100, 200, 300, 400];
    if (maxWPM <= 800) return [200, 400, 600, 800];
    return [250, 500, 750, 1000]; // fallback if WPM is very high
}
function adjustXNumbers(rawData) {
    const sessions = rawData.length;
    const adjustedXNumbers = getRangeForSessions(sessions);
    for (let i = 1; i <= 10; i++) {
        const numberElement = document.getElementById("x-number" + i);
        numberElement.textContent = adjustedXNumbers[i-1];
    }
}
function getRangeForSessions(sessions) {
    let step = 1;

    while (true) {
        let min = step;
        let max = step * 10;

        if (sessions >= min && sessions <= max) {
            const range = [];
            for (let i = 1; i <= 10; i++) {
                range.push(step * i);
            }
            return range;
        }
        step *= 5;
    }
}
function getSortedWPMData(rawWPMData) {
    const range = getRangeForSessions(rawWPMData.length);
    const step = range[1] - range[0];
    const splitRawData = splitIntoChunks(rawWPMData,step);

    let sortedWPMData = [];

    for (let rawChunk of splitRawData) {
        if (rawChunk.length !== step) {
            return sortedWPMData;
        }

        const average = Math.floor(rawChunk.reduce((sum, num) => sum + num, 0) / step);
        sortedWPMData.push(average);
    }

    return sortedWPMData;
}
function splitIntoChunks(rawData,splitSize) {
    const res = [];
    for (let i = 0; i + splitSize <= rawData.length; i += splitSize) {
        res.push(rawData.slice(i, i + splitSize));
    }
    return res;
}
function getMaxYAxisNumber(rawData) {
    return Math.max(...getYScaleRange(Math.max(...rawData)));
}

await initMyStats();