import { API_BASE_URL } from "./config.js";

export async function deleteFromVerificationDB() {
    const response = await fetch(`${API_BASE_URL}/auth/verification/remove`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include"
    });

    const data = await response.json();

    if (!data.success) {
        throw new Error(data.error);
    }
}