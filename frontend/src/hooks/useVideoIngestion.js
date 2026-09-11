//hooks/useVideoIngestion.js
import { useState, useEffect } from "react";
import { ingestVideo,getVideoStatus } from "../libs/api";


export function useVideoIngestion(){
    const [video,setVideo] = useState(null);
    const [error,setError] = useState(null);

    async function submit(url){
        try{
        const response = await ingestVideo(url);
        setVideo(response);
        }catch (err){
            setError(err.message);
        }    
    }

    useEffect(()=>{
        if(!video || video.status === "ready" || video.status === "failed") return;

        const interval = setInterval(async () => {
            const updated = await getVideoStatus(video.video_id);
            setVideo(updated);
        },3000);

        return () => clearInterval(interval);
    }, [video]);

    return {video, error, submit};
}