import { useState } from "react";
import { VideoUploadForm } from "./components/VideoUploadForm";
import { AskQuestion } from "./components/AskQuestion";

export default function App(){
  const [videoid,setVideoid] = useState(null);

  return (
    <>
    {Boolean(videoid) ? (
      <div>
      <button onClick={() => setVideoid(null)}>Try  another video</button>
      <AskQuestion videoId={videoid}/>
      </div>
    ): (
      <VideoUploadForm onVideoReady={setVideoid}/>
    )}
  </>
  )
}