from conftest import localized

LESSON = {"title": "Introducing yourself", "level": "A1", "unitTitle": "Meeting people"}
VOCABULARY = "name, from, years old, nice to meet you"
GRAMMAR = "Verb to be: I am, you are, he/she/it is."


def slide(kind, exercise=None):
    return {
        "kind": kind,
        "title": f"{kind} slide",
        "bullets": ["My name is …", "I am from …"],
        "example": "Hello! My name is Sara. I am from Oran.",
        "hint": localized("Say your name."),
        "miniExercise": exercise,
    }


def exercise(answer="name"):
    return {"prompt": "My ____ is Amine.", "options": ["name", "nice", "from"], "answer": answer}


def deck(*slides):
    return {"slides": list(slides)}


GOOD_DECK = deck(
    slide("intro"),
    slide("vocabulary", exercise()),
    slide("grammar", exercise()),
    slide("recap"),
)


def request(**overrides):
    return {"lesson": LESSON, "vocabularyText": VOCABULARY, "grammarText": GRAMMAR, **overrides}


def test_deck_is_built_from_the_teacher_material(client, model):
    model.queue(GOOD_DECK)

    response = client.post("/api/agents/slides/generate", json=request())

    assert response.status_code == 200
    assert response.json() == GOOD_DECK
    prompt = model.prompt()
    assert 'Lesson "Introducing yourself", unit "Meeting people", CEFR level A1.' in prompt
    assert f"<vocabulary>\n{VOCABULARY}\n</vocabulary>" in prompt
    assert f"<grammar>\n{GRAMMAR}\n</grammar>" in prompt
    assert "<pronunciation>" not in prompt


def test_wrong_exercise_answer_is_sent_back_once(client, model):
    broken = deck(slide("intro"), slide("vocabulary", exercise(answer="names")), slide("grammar"), slide("recap"))
    model.queue(broken, GOOD_DECK)

    response = client.post("/api/agents/slides/generate", json=request())

    assert response.status_code == 200
    assert response.json() == GOOD_DECK
    assert "slide 2: the answer 'names' is not one of the options" in model.prompt()


def test_every_material_needs_its_own_slide(client, model):
    model.queue(deck(slide("intro"), slide("vocabulary"), slide("recap")), GOOD_DECK)

    client.post("/api/agents/slides/generate", json=request())

    assert "there is grammar material but no slide of kind grammar" in model.prompt()


def test_still_invalid_after_the_fix_request_is_a_422(client, model):
    too_short = deck(slide("vocabulary"), slide("grammar"))
    model.queue(too_short, too_short)

    response = client.post("/api/agents/slides/generate", json=request())

    assert response.status_code == 422
    assert "make between 3 and 10 slides, not 2" in response.json()["detail"]


def test_lesson_without_material_is_rejected(client):
    response = client.post("/api/agents/slides/generate", json=request(vocabularyText=" ", grammarText=""))

    assert response.status_code == 422


def test_long_material_is_cut(client, model):
    model.queue(deck(slide("intro"), slide("vocabulary"), slide("recap")))

    client.post("/api/agents/slides/generate", json=request(vocabularyText="word " * 5000, grammarText=""))

    vocabulary_block = model.prompt().split("<vocabulary>\n")[1].split("\n</vocabulary>")[0]
    assert len(vocabulary_block) == 12_000
