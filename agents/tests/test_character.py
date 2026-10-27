from conftest import localized

LESSON = {"title": "Food and drinks", "level": "A1"}
EPISODE = {
    "title": "Dinner talk with Yasmine",
    "setting": "You and Yasmine are at the table. She wants to know about your evening.",
    "character": {"name": "Yasmine", "role": "your cousin", "personality": "Curious and cheerful."},
    "goals": ["Food words", "Past simple"],
    "targetWords": ["chicken", "rice", "cook", "spicy", "dinner"],
    "openingLine": "Hi! What did you have for dinner last night?",
}
HISTORY = [
    {"role": "character", "text": "Hi! What did you have for dinner last night?"},
    {"role": "student", "text": "I had chicken and rice."},
    {"role": "character", "text": "Nice! Did you cook it yourself?"},
]


def test_episode_is_built_from_the_teacher_material_and_the_chosen_role(client, model):
    model.queue(EPISODE)

    response = client.post("/api/agents/character/episode", json={
        "lesson": LESSON,
        "characterRole": "cousin",
        "scenario": "At a family dinner",
        "otherDescription": "Topic: what did you have for dinner last night? Reuse food vocabulary.",
    })

    assert response.status_code == 200
    assert response.json() == EPISODE
    prompt = model.prompt()
    assert "<character_role>\ncousin\n</character_role>" in prompt
    assert "<student_scenario>\nAt a family dinner\n</student_scenario>" in prompt
    assert "<role_play_description>\nTopic: what did you have for dinner last night?" in prompt


def test_episode_needs_some_material(client):
    response = client.post("/api/agents/character/episode", json={"lesson": LESSON, "characterRole": "boss"})

    assert response.status_code == 422


def test_episode_with_too_many_goals_is_sent_back(client, model):
    model.queue({**EPISODE, "goals": ["a", "b", "c", "d", "e"]}, EPISODE)

    client.post("/api/agents/character/episode", json={"lesson": LESSON, "vocabularyText": "rice, bread"})

    assert "give 1 to 4 goals, not 5" in model.prompt()


def turn(correction=None, suggestions=(), reply="Yum! Was it spicy?"):
    return {"correction": correction, "reply": reply, "emotion": "happy", "suggestions": list(suggestions)}


def correction(original="I eat chicken and rice yesterday."):
    return {
        "original": original,
        "corrected": "I ate chicken and rice yesterday.",
        "explanation": localized("Use the past simple for yesterday."),
        "focus": "past simple: irregular verbs",
    }


def post_reply(client, **overrides):
    body = {
        "level": "A1",
        "episode": EPISODE,
        "history": HISTORY,
        "studentMessage": "No. I eat chicken and rice yesterday.",
        **overrides,
    }
    return client.post("/api/agents/character/reply", json=body)


def test_reply_shows_the_correction_as_a_word_diff(client, model):
    model.queue(turn(correction(), suggestions=["Yes", "No", "A little"]))

    response = post_reply(client)

    assert response.status_code == 200
    body = response.json()
    assert body["reply"] == "Yum! Was it spicy?"
    assert body["emotion"] == "happy"
    assert body["correction"]["segments"] == [
        {"text": "I", "change": "same"},
        {"text": "eat", "change": "removed"},
        {"text": "ate", "change": "added"},
        {"text": "chicken and rice yesterday.", "change": "same"},
    ]
    assert body["nextInput"] == {"mode": "type", "suggestions": []}
    assert body["episodeComplete"] is False


def test_reply_prompt_has_the_persona_and_the_conversation(client, model):
    model.queue(turn())

    post_reply(client)

    prompt = model.prompt()
    assert prompt.startswith("You are Yasmine, your cousin, in a role-play")
    assert "Words to use, and to get the student to use: chicken, rice, cook, spicy, dinner." in prompt
    assert "Student: I had chicken and rice.\nYasmine: Nice! Did you cook it yourself?" in prompt
    assert "<student_last_message>\nNo. I eat chicken and rice yesterday.\n</student_last_message>" in prompt
    assert "transcribed automatically" not in prompt


def test_correction_must_quote_what_the_student_wrote(client, model):
    model.queue(turn(correction("I eated chicken.")), turn(correction()))

    assert post_reply(client).status_code == 200
    assert "correction.original must copy the student's sentence exactly" in model.prompt()


def test_choose_and_record_needs_three_suggestions(client, model):
    model.queue(turn(suggestions=["Yes, very.", "No."]), turn(suggestions=["Yes, very.", "No.", "A little."]))

    body = post_reply(client, allowedModes=["choose_and_record"]).json()

    assert "give exactly three different suggestions" in model.prompt()
    assert body["nextInput"] == {"mode": "choose_and_record", "suggestions": ["Yes, very.", "No.", "A little."]}


def test_mode_is_one_of_the_allowed_modes(client, model):
    model.queue(*[turn() for _ in range(10)])

    modes = {post_reply(client, allowedModes=["type", "record"]).json()["nextInput"]["mode"] for _ in range(10)}

    assert modes <= {"type", "record"}


def test_last_turn_closes_the_episode(client, model):
    model.queue(turn(reply="It was lovely to talk. See you soon!"))

    body = post_reply(client, maxTurns=2, allowedModes=["choose_and_record"]).json()

    assert body["episodeComplete"] is True
    assert body["nextInput"]["suggestions"] == []
    assert "This is the last turn" in model.prompt()
    assert "three different short answers" not in model.prompt()


def test_spoken_messages_are_marked_as_transcripts(client, model):
    model.queue(turn())

    post_reply(client, spoken=True, studentMessage="no i eat chicken and rice yesterday")

    assert "transcribed automatically" in model.prompt()


def test_spoken_message_is_not_corrected_for_punctuation(client, model):
    message = "yes my mother cooked it she is a good cook"
    punctuation_only = {**correction(message), "corrected": "Yes, my mother cooked it. She is a good cook."}
    model.queue(turn(punctuation_only), turn())

    body = post_reply(client, spoken=True, studentMessage=message).json()

    assert "punctuation and capital letters are not mistakes" in model.prompt()
    assert body["correction"] is None


def test_typed_message_can_be_corrected_for_punctuation(client, model):
    message = "yes my mother cooked it she is a good cook"
    model.queue(turn({**correction(message), "corrected": "Yes, my mother cooked it. She is a good cook."}))

    body = post_reply(client, studentMessage=message).json()

    assert body["correction"]["corrected"] == "Yes, my mother cooked it. She is a good cook."
