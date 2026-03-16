import { useRef, useEffect, useState } from "react";
import axios from "axios";
import Draggable from "react-draggable";

export default function VideoRecorder({ sessionId }: any) {

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const dragRef = useRef<HTMLDivElement>(null); // important fix

  const [warning, setWarning] = useState("");
  const [hidden, setHidden] = useState(false);

  useEffect(() => {

    async function startCamera() {

      try {

        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });

        if (videoRef.current) {

          videoRef.current.srcObject = stream;

          videoRef.current.onloadedmetadata = () => {
            startMonitoring();
          };

        }

      } catch (err) {

        console.error("Camera access error:", err);

      }

    }

    startCamera();

  }, []);

  const startMonitoring = () => {

    setInterval(async () => {

      if (!videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video.videoWidth === 0) return;

      const ctx = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx?.drawImage(video, 0, 0);

      canvas.toBlob(async (blob) => {

        if (!blob) return;

        const formData = new FormData();
        formData.append("file", blob);
        formData.append("session_id", sessionId);

        try {

          const res = await axios.post(
            "http://127.0.0.1:8000/proctor/frame",
            formData
          );

          const data = res.data;

          if (data.engagement === "multiple_faces") {
            setWarning("⚠ Multiple faces detected");
          }

          else if (data.engagement === "no_face_detected") {
            setWarning("⚠ Face not detected");
          }

          else if (data.engagement === "distracted") {
            setWarning("⚠ Looking away from screen");
          }

          else {
            setWarning("");
          }

        } catch (err) {

          console.error("Proctor error:", err);

        }

      }, "image/jpeg");

    }, 3000);

  };

  return (

    <Draggable nodeRef={dragRef}>

      <div
        ref={dragRef}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 9999,
          background: "rgba(0,0,0,0.75)",
          padding: "10px",
          borderRadius: "12px",
          border: "2px solid gold",
          width: "220px",
          cursor: "move"
        }}
      >

        <div style={{
          display: "flex",
          justifyContent: "space-between",
          color: "white",
          fontSize: "12px",
          marginBottom: "6px"
        }}>

          <span>🎥 Proctor Cam</span>

          <button
            onClick={() => setHidden(!hidden)}
            style={{
              background: "transparent",
              border: "none",
              color: "white",
              cursor: "pointer"
            }}
          >
            {hidden ? "Show" : "Hide"}
          </button>

        </div>

        <video
  ref={videoRef}
  autoPlay
  muted
  width="200"
  style={{
    borderRadius: "8px",
    display: hidden ? "none" : "block"
  }}
/>

        <canvas ref={canvasRef} style={{ display: "none" }} />

        {warning && (

          <div style={{
            marginTop: "8px",
            color: "#ff4d4d",
            fontWeight: "bold",
            fontSize: "12px",
            textAlign: "center"
          }}>
            {warning}
          </div>

        )}

      </div>

    </Draggable>

  );

}