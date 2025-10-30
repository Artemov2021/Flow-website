import {API_BASE_URL} from "./config.js";

export let isMenuOpened = false;

export function showMenu() {
    isMenuOpened = true;

    const menuBackground = document.createElement("div");
    menuBackground.id = "menu-background";
    menuBackground.className = "menu-background";


    const myStatsButton = document.createElement("div");
    myStatsButton.className = "menu-button";
    myStatsButton.style.marginBottom = "4px";
    myStatsButton.addEventListener("click",async (e) => {
        e.preventDefault();
        hideMenu();
        isMenuOpened = false;
        openMyStatsPage();
    });

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
        await deleteSessionUserId();
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
export function hideMenu() {
    isMenuOpened = false;
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

function openMyStatsPage() {
    window.location.href = '../pages/my-stats.html';
}
async function deleteSessionUserId() {
    const response = await fetch(`${API_BASE_URL}/session/user-id`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    });

    const data = await response.json();

    if (!data.success) {
        throw new Error(data.error);
    }
}
function reloadMainPage() {
    window.location.href = '../pages/index.html';
}
