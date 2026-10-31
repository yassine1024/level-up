from conftest import localized

LESSON = {"title": "Daily routines", "level": "A1"}
TASK = "Write 5 sentences about your daily routine. Use the present simple."
STUDENT_TEXT = "I wake up at 7. I go to the university by bus. My friend Sara study with me. We eats lunch together."
CORRECTED = "I wake up at 7. I go to the university by bus. My friend Sara studies with me. We eat lunch together."


def mistake(sentence, wrong, right):
    return {
        "sentence": sentence,
        "wrong": wrong,
        "right": right,
        "category": "Verb form",
        "explanation": localized("He, she and it take -s."),
        "focus": "present simple: he/she/it + -s",
    }


def review(corrected=CORRECTED, mistakes=None):
    if mistakes is None:
        mistakes = [
            mistake("My friend Sara study with me.", "study", "studies"),
            mistake("We eats lunch together.", "eats", "eat"),
        ]
    return {
        "headline": "Good work",
        "comment": localized("Clear ideas. Two small verb mistakes."),
        "correctedText": corrected,
        "mistakes": mistakes,
    }


def post_feedback(client, **overrides):
    body = {"lesson": LESSON, "task": TASK, "studentText": STUDENT_TEXT, **overrides}
    return client.post("/api/agents/writing/feedback", json=body)


def test_feedback_has_the_corrections_as_a_word_diff(client, model):
    model.queue(review())

    response = post_feedback(client, vocabularyText="wake up, bus, lunch")

    assert response.status_code == 200
    body = response.json()
    assert body["mistakes"] == review()["mistakes"]
    changes = [(segment["text"], segment["change"]) for segment in body["correctedSegments"] if segment["change"] != "same"]
    assert changes == [("study", "removed"), ("studies", "added"), ("eats", "removed"), ("eat", "added")]
    prompt = model.prompt()
    assert f"<task>\n{TASK}\n</task>" in prompt
    assert "<lesson_vocabulary>\nwake up, bus, lunch\n</lesson_vocabulary>" in prompt
    assert f"<student_text>\n{STUDENT_TEXT}\n</student_text>" in prompt


def test_mistake_quoting_a_sentence_the_student_did_not_write_is_sent_back(client, model):
    invented = review(mistakes=[mistake("My friend Sara studys with me.", "studys", "studies"),
                                mistake("We eats lunch together.", "eats", "eat")])
    model.queue(invented, review())

    assert post_feedback(client).status_code == 200
    assert "mistake 1: the sentence is not copied exactly from the student's text" in model.prompt()


def test_mistakes_without_a_corrected_text_are_sent_back(client, model):
    model.queue(review(corrected=STUDENT_TEXT), review(corrected=STUDENT_TEXT))

    response = post_feedback(client)

    assert response.status_code == 422
    assert "correctedText is the same as the student's text" in response.json()["detail"]


def test_text_without_mistakes(client, model):
    model.queue(review(corrected=CORRECTED, mistakes=[]))

    body = post_feedback(client, studentText=CORRECTED).json()

    assert body["mistakes"] == []
    assert body["correctedSegments"] == [{"text": CORRECTED, "change": "same"}]
