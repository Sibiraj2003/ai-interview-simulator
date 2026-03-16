import whisper

model = whisper.load_model("small")

def transcribe_audio(audio_path):

    result = model.transcribe(
        audio_path,
        language="en"
    )

    transcript = result["text"].strip()

    # calculate confidence
    confidences = []

    for segment in result["segments"]:
        if "avg_logprob" in segment:
            confidences.append(segment["avg_logprob"])

    if len(confidences) == 0:
        confidence = -10
    else:
        confidence = sum(confidences) / len(confidences)

    return {
        "text": transcript,
        "confidence": confidence
    }