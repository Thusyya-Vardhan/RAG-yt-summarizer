import { useState } from "react";
import { VideoUploadForm } from "./components/VideoUploadForm";
import { AskQuestion } from "./components/AskQuestion";
import "./App.css";

export default function App() {
  const [video, setVideo] = useState(null);

  const handleVideoReady = (videoId, videoObj) => {
    setVideo(videoObj || { video_id: videoId });
  };

  const handleReset = () => {
    setVideo(null);
  };

  return (
    <div className="app-container">
      {/* Universal App Header */}
      <header className="app-header">
        <div className="brand-badge">
          <span className="brand-badge-dot"></span>
          <span>CuePoint • Video Intelligence</span>
        </div>
        <h1>
          Ask & Summarize <span>YouTube</span>
        </h1>
        <p className="subtitle">
          Turn any video into an interactive knowledge base with grounded transcript answers and clickable timestamp citations.
        </p>
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
          <VideoUploadForm onVideoReady={handleVideoReady} />
        )}
      </main>
    </div>
  );
}