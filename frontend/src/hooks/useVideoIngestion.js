//hooks/useVideoIngestion.js
import { useState, useEffect } from "react";
import { ingestVideo,getVideoStatus } from "../libs/api";


export function useVideoIngestion(){
    const [video,setVideo] = useState(null);
    const [error,setError] = useState(null);

    async function submit(url){
        try{
            setError(null);
            const response = await ingestVideo(url);
            setVideo(response);
        }catch (err){
            setError(err.message);
        }    
    }

    useEffect(()=>{
        if(!video || video.status === "ready" || video.status === "failed") return;

        const interval = setInterval(async () => {
            try {
                const updated = await getVideoStatus(video.video_id);
                setVideo(updated);
            } catch (err) {
                // Keep polling or mark error if failed
                console.error("Polling error:", err);
            }
        }, 2500);

        return () => clearInterval(interval);
    }, [video]);

    return {video, error, submit};
}