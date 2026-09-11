import { useState } from "react";
import { useAskQuestion } from "../hooks/useAskQuestion";

export function AskQuestion({ videoId }) {
  const { answer, sources, loading, error, ask } = useAskQuestion();
  const [queryInput, setQueryInput] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!queryInput.trim()) return;
    ask(videoId, queryInput);
  }

  return (
    <div className="ask-panel">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={queryInput}
          onChange={(e) => setQueryInput(e.target.value)}
          placeholder="Ask a question, or say 'summarize this video'"
        />
        <button type="submit" disabled={loading}>
          {loading ? "Thinking…" : "Ask"}
        </button>
      </form>

      {error && <p className="error-text">{error}</p>}

      {answer && (
        <div className="answer-panel">
          <p>{answer}</p>

          {/* sources is null for a SummaryResponse (no per-chunk citations
              make sense for a whole-video summary) - only render this
              block when it's a real, non-empty array. */}
          {sources && sources.length > 0 && (
            <div className="sources-list">
              <p>Sources:</p>
              <ul>
                {sources.map((source, i) => (
                  <li key={i}>
                    <a href={source.timestamp_url} target="_blank" rel="noreferrer">
                      {Math.floor(source.start_sec / 60)}:
                      {String(Math.floor(source.start_sec % 60)).padStart(2, "0")}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}