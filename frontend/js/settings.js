import {hideMenu, isMenuOpened, showMenu} from "./common/menu.js";
import {API_BASE_URL} from "./common/config.js";

const flowTitle = document.getElementById("flow-title");
const settingsMainAvatar = document.getElementById("settings-main-avatar");
const settingsTitle = document.getElementById("settings-title");
const settingsInfo = document.getElementById("settings-info-background");
const settingsInfoAvatar = document.getElementById("settings-info-avatar");
const settingsEmail = document.getElementById("settings-info-group-sector-email");
const settingsCreatedAt = document.getElementById("settings-info-group-sector-created-at");
const settingsDeleteAccountButton = document.getElementById("settings-delete-account-button");

let userId = null;
let areAvatarButtonsOpened = false;
let hasAvatarPicture = false;

async function initSettings() {
    await setUserId();
    await validateUserAvatar();
    setSettingsMainAvatar();
    setupSettingsListener();
    showElements();
    setSettingsInfoAvatar();
    await setSettingsInfoEmail();
    await setSettingsInfoCreatedAt();
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
        hasAvatarPicture = true;
    }
}
function setupSettingsListener() {
    flowTitle.addEventListener("click",() => {
        window.location.href = "../pages/index.html";
    });

    settingsMainAvatar.addEventListener("click",(e) => {
        if (areAvatarButtonsOpened) {
            hideAvatarButtons();
        }

        if (!isMenuOpened) {
            e.stopPropagation();
            showMenu();
        }
    });
    document.addEventListener("click",() => {
        if (areAvatarButtonsOpened) {
            hideAvatarButtons();
        }

        if (isMenuOpened) {
            hideMenu();
        }
    });

    settingsInfoAvatar.addEventListener("click",async (e) => {
        e.stopPropagation();
        if (areAvatarButtonsOpened) {
            hideAvatarButtons();
        } else {
            await showAvatarButtons();
        }

        if (isMenuOpened) {
            hideMenu();
        }
    });

    settingsDeleteAccountButton.addEventListener("click",async (e) => {
        e.stopPropagation();
        await showDeleteAccountConfirmation();
    });
}
function showElements() {
    showSettingsTitle();
    showSettingsInfo();
}
function showSettingsTitle() {
    setTimeout(() => {
        settingsTitle.style.opacity = "1";
        settingsTitle.style.transform = "translateX(0)";
    }, 350);
}
function showSettingsInfo() {
    setTimeout(() => {
        settingsInfo.style.opacity = "1";
        settingsInfo.style.transform = "translateX(0)";
    }, 500);
}
function setSettingsInfoAvatar() {
    if (hasAvatarPicture) {
        settingsInfoAvatar.src = `${API_BASE_URL}/uploads/avatars/${userId}.jpg`;
    }
}
async function showAvatarButtons() {
    areAvatarButtonsOpened = true;

    const buttonsBackground = document.createElement("div");
    buttonsBackground.id = "avatar-buttons";
    buttonsBackground.className = "avatar-buttons-background";

    const editButton = document.createElement("button");
    editButton.className = "avatar-edit-button";
    editButton.textContent = "Change picture";
    editButton.addEventListener("click",(e) => {
        e.stopPropagation()
        // Create an invisible file input
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*"; // accept any image format
        input.click();

        // Handle file selection
        input.onchange = async () => {
            const file = input.files[0];
            if (!file) return;
            await uploadAvatar(file);
            hasAvatarPicture = true;
            setSettingsMainAvatar();
        };
        hideAvatarButtons();
    });

    const editSymbol = document.createElement("img");
    editSymbol.className = "avatar-edit-symbol";
    editSymbol.src = "../assets/symbols/edit.png";

    const deleteButton = document.createElement("button");
    deleteButton.className = "avatar-delete-button";
    deleteButton.textContent = "Delete picture";
    deleteButton.addEventListener("click",async (e) => {
        e.stopPropagation();
        await deleteAvatar();
        removeAvatarSettingsPicture();
        removeSettingsMainAvatar();
        hasAvatarPicture = false;
        hideAvatarButtons();
    });

    const deleteSymbol = document.createElement("img");
    deleteSymbol.className = "avatar-delete-symbol";
    deleteSymbol.src = "../assets/symbols/delete-white.png";

    buttonsBackground.append(editButton, editSymbol);
    settingsInfo.appendChild(buttonsBackground);

    // fade in after DOM paint
    requestAnimationFrame(() => {
        buttonsBackground.style.opacity = "1";
    });

    if (hasAvatarPicture) {
        buttonsBackground.append(deleteButton,deleteSymbol);
    }
}
function hideAvatarButtons() {
    areAvatarButtonsOpened = false;

    const avatarButtons = document.getElementById("avatar-buttons");
    // Fade out smoothly before removing
    avatarButtons.style.opacity = "0";

    // Wait for the transition to finish before removing
    avatarButtons.addEventListener(
        "transitionend",
        () => {
            if (avatarButtons.parentElement) {
                avatarButtons.parentElement.removeChild(avatarButtons);
            }
        },
        { once: true } // ensures it runs only once
    );
}
async function uploadAvatar(file) {
    const formData = new FormData();
    formData.append("avatar", file);

    try {
        const response = await fetch(`${API_BASE_URL}/user/avatar`, {
            method: "POST",
            credentials: "include",
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            console.log("Avatar uploaded!");
            // Refresh avatar
            settingsInfoAvatar.src = `${API_BASE_URL}/uploads/avatars/${userId}.jpg?${Date.now()}`;
        } else {
            console.error("Upload failed: ", data.error);
            alert("An error occurred while uploading the picture");
        }
    } catch (err) {
        console.error("Error uploading avatar:", err);
        alert("An error occurred while uploading the picture");
    }
}
function setSettingsMainAvatar() {
    if (hasAvatarPicture) {
        settingsMainAvatar.src = `${API_BASE_URL}/uploads/avatars/${userId}.jpg?${Date.now()}`;
    }
}
function removeSettingsMainAvatar() {
    settingsMainAvatar.src = `../assets/symbols/user-profile-default.png`;
}
async function deleteAvatar() {
    try {
        const response = await fetch(`${API_BASE_URL}/user/avatar`, {
            method: "DELETE",
            credentials: "include",
        });

        const data = await response.json();

        if (!data.success) {
            console.error(data.error);
            alert(data.error);
        }
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
}
async function setSettingsInfoEmail() {
    try {
        const res = await fetch(`${API_BASE_URL}/user/email`, {
            method: "GET",
            credentials: "include"
        });

        const data = await res.json();

        if (!data.success) {
            console.log(data.error);
            alert(data.error);
        } else {
            settingsEmail.textContent = data.result;
        }
    } catch (error) {
        console.log(error.message);
        alert(error.message);
    }
}
async function setSettingsInfoCreatedAt() {
    try {
        const res = await fetch(`${API_BASE_URL}/user/created-at`, {
            method: "GET",
            credentials: "include"
        });

        const data = await res.json();

        if (!data.success) {
            console.log(data.error);
            alert(data.error);
        } else {
            settingsCreatedAt.textContent = data.result;
        }
    } catch (error) {
        console.log(error.message);
        alert(error.message);
    }
}
function removeAvatarSettingsPicture() {
    settingsInfoAvatar.src = "../assets/symbols/user-profile-default.png";
}
async function showDeleteAccountConfirmation() {
    const confirmationOverlay = document.createElement("div");
    confirmationOverlay.style.position = "fixed";
    confirmationOverlay.style.top = "0";
    confirmationOverlay.style.left = "0";
    confirmationOverlay.style.width = "100%";
    confirmationOverlay.style.height = "100%";
    confirmationOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.6)"; // black 60% opacity
    confirmationOverlay.style.zIndex = "999";
    confirmationOverlay.style.display = "flex";
    confirmationOverlay.style.justifyContent = "center";
    confirmationOverlay.style.alignItems = "flex-start";
    confirmationOverlay.style.paddingTop = "calc(50vh - 90px)"; // centers - about 30px higher

    const modal = document.createElement("div");
    modal.style.position = "relative";
    modal.style.width = "410px";
    modal.style.height = "180px";
    modal.style.backgroundColor = "#171717";
    modal.style.borderRadius = "16px";
    modal.style.boxShadow = "0 4px 20px rgba(0,0,0,0.5)";
    modal.style.color = "#fff"; // for text visibility (optional)
    modal.style.transform = "translateX(45px)"; // start slightly to the right
    modal.style.transition = "transform 0.4s ease, opacity 0.2s ease"; // smooth movement + fade
    modal.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.25)';
    modal.style.opacity = "0";

    const text = document.createElement("p");
    text.textContent = "Are you sure you want to delete your account?";
    text.style.margin = "20px 0 0 0";
    text.style.fontSize = "21px";
    text.style.color = "white";
    text.style.fontFamily = "'Roboto', sans-serif";
    text.style.fontWeight = "400";
    text.style.textAlign = "center";

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.style.position = "absolute";
    deleteButton.style.bottom = "17px";
    deleteButton.style.right = "17px";
    deleteButton.style.backgroundColor = "#D71818";
    deleteButton.style.width = "105px";
    deleteButton.style.height = "40px";
    deleteButton.style.color = "white";
    deleteButton.style.fontSize = "18px";
    deleteButton.style.fontFamily = "'Roboto', sans-serif";
    deleteButton.style.border = "none";
    deleteButton.style.borderRadius = "10px";
    deleteButton.style.cursor = "pointer";
    deleteButton.addEventListener("click",async () => {
        document.body.removeChild(confirmationOverlay);
        await deleteAccount();
        await deleteAvatar();
        await deleteAllUserSessions();
        await deleteSessionUserId();
        loadMainPage();
    });

    const cancelButton = document.createElement("button");
    cancelButton.textContent = "Cancel";
    cancelButton.style.position = "absolute";
    cancelButton.style.bottom = "17px";
    cancelButton.style.right = "130px";
    cancelButton.style.backgroundColor = "#212121";
    cancelButton.style.width = "120px";
    cancelButton.style.height = "40px";
    cancelButton.style.color = "white";
    cancelButton.style.fontSize = "18px";
    cancelButton.style.fontFamily = "'Roboto', sans-serif";
    cancelButton.style.border = "none";
    cancelButton.style.borderRadius = "10px";
    cancelButton.style.cursor = "pointer";
    cancelButton.style.transition = "background-color 0.3s ease";
    cancelButton.addEventListener("mouseenter",() => {
        cancelButton.style.backgroundColor = "#2D2D2D";
    });
    cancelButton.addEventListener("mouseleave",() => {
        cancelButton.style.backgroundColor = "#212121";
    });
    cancelButton.addEventListener("click",() => {
        document.body.removeChild(confirmationOverlay);
    });

    modal.append(text,deleteButton,cancelButton);
    confirmationOverlay.appendChild(modal);
    document.body.appendChild(confirmationOverlay);

    requestAnimationFrame(() => {
        modal.style.transform = "translate(0)";
        modal.style.opacity = "1";
    });

    // click confirmationOverlay to remove it
    confirmationOverlay.addEventListener("click", (e) => {
        if (e.target === confirmationOverlay) {
            document.body.removeChild(confirmationOverlay);
        }
    });
}
async function deleteAccount() {
    try {
        const response = await fetch(`${API_BASE_URL}/user/account`, {
            method: "DELETE",
            credentials: "include",
        });

        const data = await response.json();

        if (!data.success) {
            console.log(data.error);
            alert(data.error);
        }
    } catch (err) {
        console.log(err.message);
        alert(err.message);
    }
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
async function deleteAllUserSessions() {
    const response = await fetch(`${API_BASE_URL}/user/sessions`, {
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
function loadMainPage() {
    window.location.href = './../pages/index.html';
}

await initSettings();