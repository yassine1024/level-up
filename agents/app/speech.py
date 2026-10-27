import base64

from fastapi import APIRouter, HTTPException, UploadFile
from langchain_core.messages import HumanMessage
from pydantic import Field

from app.llm import Model, generate
from app.schemas import CamelModel

router = APIRouter(prefix="/api/agents/speech", tags=["Speech-to-text tool"])

# Gemini allows 20 MB per request; a spoken answer is far smaller.
MAX_AUDIO_BYTES = 10 * 1024 * 1024

# Audio formats Gemini accepts (https://ai.google.dev/gemini-api/docs/audio),
# with the other names phones and browsers give them.
AUDIO_TYPES = {
    "audio/wav": "audio/wav",
    "audio/x-wav": "audio/wav",
    "audio/wave": "audio/wav",
    "audio/mp3": "audio/mp3",
    "audio/mpeg": "audio/mpeg",
    "audio/aiff": "audio/aiff",
    "audio/x-aiff": "audio/aiff",
    "audio/aac": "audio/aac",
    "audio/ogg": "audio/ogg",
    "audio/flac": "audio/flac",
    "audio/x-flac": "audio/flac",
    "audio/m4a": "audio/m4a",
    "audio/x-m4a": "audio/m4a",
    "audio/mp4": "audio/m4a",
    "audio/opus": "audio/opus",
    "audio/webm": "audio/webm",
}


class Transcript(CamelModel):
    text: str = Field(description="Exactly the words spoken; empty if nobody speaks")
    language: str = Field(
        description="ISO 639-1 code of the main language spoken, e.g. en, fr, ar; empty if nobody speaks"
    )


TRANSCRIBE_PROMPT = """Transcribe this recording of an English learner word for word.
Keep every grammar mistake, wrong word form and repeated word exactly as spoken. Do not correct, complete or tidy anything: the app uses the transcript to find the learner's mistakes.
If a word is unclear, write the closest word you hear. If there is no speech, return an empty text."""


@router.post("/transcribe", response_model=Transcript)
async def transcribe(audio: UploadFile, model: Model) -> Transcript:
    mime_type = AUDIO_TYPES.get((audio.content_type or "").split(";")[0].strip().lower())
    if mime_type is None:
        raise HTTPException(status_code=415, detail=f"Unsupported audio type: {audio.content_type}")
    if audio.size is not None and audio.size > MAX_AUDIO_BYTES:
        raise HTTPException(status_code=413, detail="Audio is larger than 10 MB.")
    data = await audio.read()
    if not data:
        raise HTTPException(status_code=400, detail="The audio file is empty.")

    message = HumanMessage(
        content=[
            {"type": "text", "text": TRANSCRIBE_PROMPT},
            {"type": "audio", "base64": base64.b64encode(data).decode("ascii"), "mime_type": mime_type},
        ]
    )
    return await generate(model, [message], Transcript)
