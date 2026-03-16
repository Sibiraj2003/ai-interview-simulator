import { useRef, useState } from "react";
import axios from "axios";

export default function AudioRecorder({ sessionId, onResult }: any) {

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const [recording, setRecording] = useState(false);

  const startRecording = async () => {

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    mediaRecorder.current = new MediaRecorder(stream);

    mediaRecorder.current.ondataavailable = (event) => {
      chunks.current.push(event.data);
    };

 mediaRecorder.current.onstop = async () => {

  const blob = new Blob(chunks.current, { type: "audio/webm" });

  const formData = new FormData();

  formData.append("file", blob, "answer.webm");
  formData.append("session_id", sessionId);

  const res = await axios.post(
    "http://127.0.0.1:8000/audio-answer",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );

  console.log("Whisper transcription:", res.data.transcribed_text);
  console.log("Score:", res.data.score);

  chunks.current = [];

  onResult(res.data);
};



    mediaRecorder.current.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorder.current?.stop();
    setRecording(false);
  };

  return (
    <div style={{ marginTop: "15px" }}>
      {!recording ? (
        <button onClick={startRecording}>
          🎤 Start Recording
        </button>
      ) : (
        <button onClick={stopRecording}>
          ⏹ Stop Recording
        </button>
      )}
    </div>
  );
}
