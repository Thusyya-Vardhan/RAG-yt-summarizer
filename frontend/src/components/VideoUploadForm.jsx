import { useState, useEffect } from "react";
import { useVideoIngestion } from "../hooks/useVideoIngestion";

export function VideoUploadForm({ onVideoReady }) {
  const { video, error, submit } = useVideoIngestion();
  const [urlInput, setUrlInput] = useState("");

  const isProcessing = video && (video.status === "pending" || video.status === "processing");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed || isProcessing) return;
    submit(trimmed);
  };

  // Safe notification to parent once video ingestion is ready
  useEffect(() => {
    if (video?.status === "ready" && onVideoReady) {
      onVideoReady(video.video_id, video);
    }
  }, [video, onVideoReady]);

  const handleRetry = () => {
    if (urlInput.trim()) {
      submit(urlInput.trim());
    }
  };

  return (
    <div className="card-surface upload-card">
      <form onSubmit={handleSubmit}>
        <div className="input-bar">
          <div className="input-bar-icon" title="YouTube">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </div>

          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Paste a YouTube URL (e.g. https://www.youtube.com/watch?v=...)"
            disabled={isProcessing}
            autoFocus
          />

          <button
            type="submit"
            className="btn-primary"
            disabled={!urlInput.trim() || isProcessing}
          >
            {isProcessing ? (
              <>
                <svg className="thinking-spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" />
                </svg>
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <span>Ingest Video</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </div>
      </form>

      <div className="format-hint">
        <span>Supports standard YouTube & short links</span>
        <code>youtube.com/watch?v=...</code>
      </div>

      {/* Immediate submission error */}
      {error && !video && (
        <div className="error-banner">
          <svg className="error-banner-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div>
            <strong>Unable to ingest video:</strong> {error}
          </div>
        </div>
      )}

      {/* Ingestion status states */}
      {video && (
        <div className="status-panel">
          <div className="status-header">
            {isProcessing && (
              <>
                <span className="status-badge processing">
                  <svg className="thinking-spinner" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" />
                  </svg>
                  Processing
                </span>
                <span className="status-desc">Fetching transcript & embedding chunks…</span>
              </>
            )}

            {video.status === "failed" && (
              <span className="status-badge failed">Failed</span>
            )}

            {video.status === "ready" && (
              <span className="status-badge ready">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Ready
              </span>
            )}
          </div>

          {isProcessing && (
            <div className="progress-bar-track">
              <div className="progress-bar-fill"></div>
            </div>
          )}

          {video.status === "failed" && (
            <div>
              <p className="status-desc" style={{ color: "#fca5a5" }}>
                {video.error_message || "An error occurred while transcribing or embedding the video."}
              </p>
              <button type="button" className="btn-retry" onClick={handleRetry}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                </svg>
                Retry Ingestion
              </button>
            </div>
          )}

          {video.status === "ready" && (
            <p className="status-desc">
              Indexed {video.chunk_count || 0} chunks successfully. Redirecting to workspace…
            </p>
          )}
        </div>
      )}
    </div>
  );
}