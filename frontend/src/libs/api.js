// src/libs/api.js
const BASE_URL = import.meta.env.VITE_API_URL

export async function ingestVideo(url) {
    const response = await fetch(`${BASE_URL}/videos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            url: url
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Request failed");
    }

    return response.json();
}

export async function getVideoStatus(videoId) {
    const response = await fetch(`${BASE_URL}/videos/${videoId}`);
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Request failed");
    }

    return response.json();
}

export async function askQuestion(videoId, query) {
    const response = await fetch(`${BASE_URL}/videos/${videoId}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            query: query,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Request failed");
    };

    return response.json();
}