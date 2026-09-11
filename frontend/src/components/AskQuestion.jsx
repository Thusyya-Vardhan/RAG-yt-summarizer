import { useState } from "react";
import { useAskQuestion } from "../hooks/useAskQuestion";

export function AskQuestion({ videoId, video, onReset }) {
  const activeVideoId = video?.video_id || videoId;
  const { answer, sources, loading, error, ask, lastQuery } = useAskQuestion();
  const [queryInput, setQueryInput] = useState("");

  const handleSubmit = (e) => {
    e?.preventDefault();
    const trimmed = queryInput.trim();
    if (!trimmed || loading) return;
    ask(activeVideoId, trimmed);
  };

  const handleSuggestionClick = (prompt) => {
    setQueryInput(prompt);
    ask(activeVideoId, prompt);
  };

  const formatTimestamp = (sec) => {
    const total = Math.max(0, Math.floor(sec));
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  };

  const suggestions = [
    "Summarize this video",
    "What are the main takeaways?",
    "Explain the core concept",
  ];

  return (
    <div className="workspace">
      {/* Top Banner: Video Details + Reset Button */}
      <div className="video-banner">
        <div className="video-info-group">
          <div className="video-thumb-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </div>

          <div className="video-details">
            <div className="video-title" title={video?.title || `YouTube Video (${activeVideoId})`}>
              {video?.title || `YouTube Video (${activeVideoId})`}
            </div>
            <div className="video-meta">
              <span className="video-meta-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {video?.chunk_count ? `${video.chunk_count} chunks indexed` : "Indexed & ready"}
              </span>
              <span>•</span>
              <a 
                href={`https://youtube.com/watch?v=${activeVideoId}`}
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: "var(--text-secondary)", textDecoration: "underline" }}
              >
                Watch on YouTube
              </a>
            </div>
          </div>
        </div>

        {onReset && (
          <button type="button" className="btn-reset" onClick={onReset} title="Start over with another video">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>Try another video</span>
          </button>
        )}
      </div>

      {/* Query Input Card */}
      <div className="card-surface ask-card">
        <form onSubmit={handleSubmit}>
          <div className="input-bar">
            <div className="input-bar-icon" style={{ color: "var(--accent-blue)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>

            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Ask a specific question, or 'summarize this video'..."
              disabled={loading}
              autoFocus
            />

            <button
              type="submit"
              className="btn-primary"
              disabled={!queryInput.trim() || loading}
            >
              {loading ? (
                <>
                  <svg className="thinking-spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" />
                  </svg>
                  <span>Thinking...</span>
                </>
              ) : (
                <>
                  <span>Ask</span>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick Suggestion Chips */}
        <div className="suggestions-row">
          <span className="suggestion-label">Suggested:</span>
          {suggestions.map((item, index) => (
            <button
              key={index}
              type="button"
              className="chip-btn"
              onClick={() => handleSuggestionClick(item)}
              disabled={loading}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              <span>{item}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Query Error State */}
      {error && (
        <div className="error-banner">
          <svg className="error-banner-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div>
            <strong>Failed to generate answer:</strong> {error}
          </div>
        </div>
      )}

      {/* Thinking / Generation Skeleton State */}
      {loading && (
        <div className="thinking-card">
          <svg className="thinking-spinner" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" />
          </svg>
          <div className="thinking-text">
            <strong>Analyzing transcript</strong>
            <span>Retrieving relevant segments and synthesizing answer…</span>
          </div>
        </div>
      )}

      {/* Answer Display */}
      {answer && !loading && (
        <div className="card-surface answer-panel">
          <div className="answer-header">
            <span className={`answer-type-tag ${sources && sources.length > 0 ? "qa" : "summary"}`}>
              {sources && sources.length > 0 ? (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Grounded Answer
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="8" y1="6" x2="21" y2="6" />
                    <line x1="8" y1="12" x2="21" y2="12" />
                    <line x1="8" y1="18" x2="21" y2="18" />
                    <line x1="3" y1="6" x2="3.01" y2="6" />
                    <line x1="3" y1="12" x2="3.01" y2="12" />
                    <line x1="3" y1="18" x2="3.01" y2="18" />
                  </svg>
                  Video Summary
                </>
              )}
            </span>

            {lastQuery && (
              <span className="query-recap" title={lastQuery}>
                &ldquo;{lastQuery}&rdquo;
              </span>
            )}
          </div>

          <div className="answer-body">
            {answer}
          </div>

          {/* Citations: Only render if sources exists and has items (Question mode) */}
          {sources && sources.length > 0 && (
            <div className="citations-section">
              <div className="citations-header">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>Jump to Citations in Video ({sources.length})</span>
              </div>

              <div className="citations-grid">
                {sources.map((source, index) => (
                  <a
                    key={index}
                    href={source.timestamp_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="timestamp-pill"
                    title={`Jump to ${formatTimestamp(source.start_sec)} on YouTube`}
                  >
                    <svg className="timestamp-play-icon" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    <span>{formatTimestamp(source.start_sec)}</span>
                    <svg className="timestamp-ext-icon" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}