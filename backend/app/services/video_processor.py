import subprocess
import uuid
import os

ffmpeg = r"C:\\ffmpeg\\bin\\ffmpeg.exe"

def process_video(video_path):

    if not os.path.exists(ffmpeg):
        raise RuntimeError("FFmpeg executable not found.")

    uid = str(uuid.uuid4())

    audio_path = f"temp/{uid}.wav"
    frames_folder = f"temp/{uid}_frames"

    os.makedirs(frames_folder, exist_ok=True)

    # Extract audio
    subprocess.run(
        [
            ffmpeg,
            "-y",
            "-i", video_path,
            "-vn",
            "-acodec", "pcm_s16le",
            "-ar", "16000",
            "-ac", "1",
            audio_path
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        check=True
    )

    # Extract frames
    subprocess.run(
        [
            ffmpeg,
            "-y",
            "-i", video_path,
            "-vf", "fps=0.5",
            f"{frames_folder}/frame_%03d.jpg"
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        check=True
    )

    return audio_path, frames_folder