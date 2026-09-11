import { useState, useEffect } from "react";
import { VideoUploadForm } from "./components/VideoUploadForm";
import { AskQuestion } from "./components/AskQuestion";
import "./App.css";

const BASE_URL = import.meta.env.VITE_API_URL;

export default function App() {
  const [video, setVideo] = useState(null);
  const [serverStatus, setServerStatus] = useState("checking"); // "checking" | "waking" | "online" | "error"

  const handleVideoReady = (videoId, videoObj) => {
    setVideo(videoObj || { video_id: videoId });
  };

  const handleReset = () => {
    setVideo(null);
  };

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 50; // 50 attempts * 2.5s = 125s (~2 minutes total)
    let intervalId = null;

    const checkServer = async () => {
      try {
        const response = await fetch(`${BASE_URL}/status`);
        if (response.ok) {
          setServerStatus("online");
          if (intervalId) clearInterval(intervalId);
          return;
        }
      } catch (err) { }

      attempts++;
      setServerStatus("waking");

      if (attempts >= maxAttempts) {
        setServerStatus("error");
        if (intervalId) clearInterval(intervalId);
      }
    };

    // Run once immediately on mount, then poll every 2.5 seconds until online
    checkServer();
    intervalId = setInterval(checkServer, 2500);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="app-container">
      {/* Universal App Header */}
      <header className="app-header">
        <div className="header-badges-row">
          <div className="brand-badge">
            <span className="brand-badge-dot"></span>
            <span>CuePoint • Video Intelligence</span>
          </div>

          <div className={`server-status-badge ${serverStatus}`} title="Cloud backend server health status">
            <span className={`status-dot ${serverStatus}`}></span>
            <span>
              {serverStatus === "online" && "Server Online"}
              {serverStatus === "waking" && "Waking Server (~50-60s)"}
              {serverStatus === "checking" && "Connecting..."}
              {serverStatus === "error" && "Server Offline"}
            </span>
          </div>
        </div>

        <h1>
          Ask & Summarize <span>YouTube</span>
        </h1>
        <p className="subtitle">
          Turn any video into an interactive knowledge base with grounded transcript answers and clickable timestamp citations.
        </p>

        {/* Cold-start notification banner displayed only when the server is actively waking up */}
        {serverStatus === "waking" && !video && (
          <div className="server-waking-banner">
            <svg className="thinking-spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" />
            </svg>
            <span>
              <strong>Cloud server is waking up:</strong> Render free-tier sleeps when idle. Initial boot takes ~50–60s — will be ready in a moment!
            </span>
          </div>
        )}
      </header>

      {/* Main Screen Switcher: Screen 1 (Upload/Ingest) vs Screen 2 (Workspace) */}
      <main>
        {video ? (
          <AskQuestion
            video={video}
            videoId={video.video_id}
            onReset={handleReset}
          />
        ) : (
          <VideoUploadForm onVideoReady={handleVideoReady} serverStatus={serverStatus} />
        )}
      </main>
    </div>
  );
}