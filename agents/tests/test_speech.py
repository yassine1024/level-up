import base64

from app.speech import MAX_AUDIO_BYTES

AUDIO = b"RIFF\x24\x00\x00\x00WAVEfmt "


def upload(client, data=AUDIO, content_type="audio/wav"):
    return client.post("/api/agents/speech/transcribe", files={"audio": ("answer.wav", data, content_type)})


def test_audio_goes_to_the_model_and_the_transcript_comes_back(client, model):
    model.queue({"text": "I eat chicken yesterday", "language": "en"})

    response = upload(client)

    assert response.status_code == 200
    assert response.json() == {"text": "I eat chicken yesterday", "language": "en"}
    text_block, audio_block = model.prompts[0][0].content
    assert "Keep every grammar mistake" in text_block["text"]
    assert audio_block == {"type": "audio", "base64": base64.b64encode(AUDIO).decode(), "mime_type": "audio/wav"}


def test_phone_recordings_in_m4a_are_accepted(client, model):
    model.queue({"text": "hello", "language": "en"})

    assert upload(client, content_type="audio/x-m4a").status_code == 200
    assert model.prompts[0][0].content[1]["mime_type"] == "audio/m4a"


def test_unsupported_audio_type(client):
    assert upload(client, content_type="audio/amr").status_code == 415


def test_empty_audio(client):
    assert upload(client, data=b"").status_code == 400


def test_audio_over_the_size_limit(client):
    assert upload(client, data=b"0" * (MAX_AUDIO_BYTES + 1)).status_code == 413
