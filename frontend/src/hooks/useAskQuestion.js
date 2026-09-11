import { useState } from "react";
import { askQuestion } from "../libs/api";

export function useAskQuestion() {
    const [answer, setAnswer] = useState(null);
    const [sources, setSources] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    async function ask(video_id, query) {
        setLoading(true);
        setError(null);
        try {
            const response = await askQuestion(video_id, query);
            setAnswer(response.answer);
            setSources(response.sources ?? null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return { answer, sources, loading, error, ask };
}