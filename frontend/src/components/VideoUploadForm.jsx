import { useState } from "react";
import { useVideoIngestion } from "../hooks/useVideoIngestion";

export function VideoUploadForm({ onVideoReady }) {
  const { video, error, submit } = useVideoIngestion();
  const [urlInput, setUrlInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault(); // stops the browser's default full-page-reload form submit
    if (!urlInput.trim()) return;
    submit(urlInput);
  }

  // Notify the parent once ingestion finishes successfully, so App.jsx
  // knows when it's safe to show the question-asking UI. This is a plain
  // callback prop, not a new concept - just how child components hand
  // data back up to a parent that doesn't share the same hook instance.
  if (video?.status === "ready" && onVideoReady) {
    onVideoReady(video.video_id);
  };

  return (
    <div className="upload-form">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="Paste a YouTube URL"
        />
        <button type="submit" disabled={video && video.status !== "failed" && video.status !== "ready"}>
          Ingest
        </button>
      </form>

      {error && <p className="error-text">{error}</p>}

      {video && (
        <div className="status-panel">
          <p>Status: {video.status}</p>
          {video.status === "processing" && <p>Fetching transcript and generating embeddings…</p>}
          {video.status === "failed" && <p className="error-text">{video.error_message}</p>}
          {video.status === "ready" && (
            <p>
              Ready — {video.chunk_count} chunks indexed
              {video.title ? ` for "${video.title}"` : ""}
            </p>
          )}
        </div>
      )}
    </div>
  );
}