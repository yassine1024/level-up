from conftest import localized

from app.practice import SPOKEN_NOTE

LESSON = {"title": "Daily routines", "level": "A1"}
GRAMMAR = "Present simple: I go, you go, she goes."
FOCUS = "present simple: he/she/it + -s"


def item(prompt, answer, options=(), focus=FOCUS):
    return {
        "prompt": prompt,
        "options": list(options),
        "correctAnswer": answer,
        "acceptedAnswers": [],
        "explanation": localized("With she, the verb takes -s."),
        "focus": focus,
    }


def items(*generated):
    return {"items": list(generated)}


def request(game_type, count=3, **overrides):
    return {"lesson": LESSON, "gameType": game_type, "count": count, "grammarText": GRAMMAR, **overrides}


FILL_BLANKS = items(
    item("She ___ to school every day.", "goes", ["go", "goes", "going", "gone"]),
    item("He ____ football on Sundays.", "plays", ["play", "plays", "playing"]),
    item("My mother _____ tea every morning.", "drinks", ["drink", "drinks", "drinking", "drank"]),
)


def post_questions(client, body):
    return client.post("/api/agents/practice/questions", json=body)


def test_fill_blank_items_are_indexed_with_one_standard_gap(client, model):
    model.queue(FILL_BLANKS)

    response = post_questions(client, request("FILL_BLANK"))

    assert response.status_code == 200
    body = response.json()
    assert body["gameType"] == "FILL_BLANK"
    for index, (returned, generated) in enumerate(zip(body["items"], FILL_BLANKS["items"])):
        assert returned["index"] == index
        assert returned["prompt"].count("____") == 1
        assert "_____" not in returned["prompt"]
        assert sorted(returned["options"]) == sorted(generated["options"])
        assert returned["correctAnswer"] in returned["options"]
    assert "<grammar>\nPresent simple: I go, you go, she goes.\n</grammar>" in model.prompt()


def test_answer_missing_from_the_options_is_sent_back(client, model):
    broken = items(item("Where does she work?", "In a bank", ["At school", "In a shop", "At home", "In a café"]),
                   item("What time does he wake up?", "At 7", ["At 7", "At 8", "At 9", "At 10"]),
                   item("Who cooks dinner?", "Her mother", ["Her mother", "Her father", "Her sister", "Nobody"]))
    repaired = items(item("Where does she work?", "In a bank", ["At school", "In a bank", "At home", "In a café"]),
                     *broken["items"][1:])
    model.queue(broken, repaired)

    response = post_questions(client, request("QUIZ"))

    assert response.status_code == 200
    assert "item 1: correctAnswer 'In a bank' is not one of the options" in model.prompt()


def test_wrong_number_of_items_is_sent_back(client, model):
    model.queue(items(*FILL_BLANKS["items"][:2]), FILL_BLANKS)

    post_questions(client, request("FILL_BLANK"))

    assert "write exactly 3 items, not 2" in model.prompt()


def test_true_false_options_are_set_by_the_service(client, model):
    model.queue(items(item("We use goes with she.", "true", ["yes", "no"])))

    body = post_questions(client, request("TRUE_FALSE", count=1)).json()

    assert body["items"][0]["options"] == ["True", "False"]
    assert body["items"][0]["correctAnswer"] == "True"


def test_word_scramble_shows_the_shuffled_letters(client, model):
    model.queue(items(item("The first meal of the day", "breakfast")))

    returned = post_questions(client, request("WORD_SCRAMBLE", count=1)).json()["items"][0]

    assert sorted(returned["options"]) == sorted("breakfast")
    assert "".join(returned["options"]) != "breakfast"


def test_spelling_bee_word_is_read_aloud_but_not_shown(client, model):
    model.queue(
        items(item("Lunch is the meal you eat at noon", "lunch")),
        items(item("The meal you eat at noon", "lunch")),
    )

    returned = post_questions(client, request("SPELLING_BEE", count=1)).json()["items"][0]

    assert "item 1: the clue contains the word to spell" in model.prompt()
    assert returned["audioText"] == "lunch"
    assert returned["options"] == []


def test_word_match_meanings_must_differ(client, model):
    model.queue(
        items(item("breakfast", "a meal"), item("dinner", "a meal")),
        items(item("breakfast", "the morning meal"), item("dinner", "the evening meal")),
    )

    body = post_questions(client, request("WORD_MATCH", count=2)).json()

    assert "item 2: another item has the same meaning" in model.prompt()
    assert [returned["options"] for returned in body["items"]] == [[], []]


def test_listening_quiz_needs_a_transcript(client):
    assert post_questions(client, request("LISTENING_QUIZ")).status_code == 422


def test_repeated_mistakes_are_practised_again(client, model):
    model.queue(FILL_BLANKS)
    mistakes = [
        {"prompt": "She ____ to school.", "studentAnswer": "go", "correction": "goes", "focus": FOCUS},
        {"prompt": "He ____ tennis.", "studentAnswer": "play", "correction": "plays", "focus": " Present simple:  he/she/it + -s"},
        {"prompt": "Yesterday I ____ home.", "studentAnswer": "go", "correction": "went", "focus": "past simple"},
    ]

    post_questions(client, request("FILL_BLANK", recentMistakes=mistakes))

    prompt = model.prompt()
    assert f"The student keeps making mistakes on: {FOCUS}." in prompt
    assert "He ____ tennis. | answered: play | correct: plays" in prompt
    assert "Yesterday I" not in prompt
    assert "Make 1 of the 3 items practise these points again" in prompt


def test_a_single_mistake_is_not_a_review_target(client, model):
    model.queue(FILL_BLANKS)
    mistakes = [{"prompt": "She ____ to school.", "studentAnswer": "go", "correction": "goes", "focus": FOCUS}]

    post_questions(client, request("FILL_BLANK", recentMistakes=mistakes))

    assert "keeps making mistakes" not in model.prompt()


def test_prompts_the_student_has_seen_are_not_reused(client, model):
    model.queue(
        FILL_BLANKS,
        items(item("They ____ breakfast at 8.", "eat", ["eat", "eats", "eating"]), *FILL_BLANKS["items"][1:]),
    )

    post_questions(client, request("FILL_BLANK", excludePrompts=["She ____ to school every day!"]))

    assert "The student has seen these prompts" in model.prompt(0)
    assert "item 1: the prompt was already used" in model.prompt()


def check(client, **body):
    defaults = {"level": "A1", "prompt": "Where are you from?", "correctAnswer": "I am from Oran."}
    return client.post("/api/agents/practice/check-answer", json={**defaults, **body})


def test_matching_answer_is_correct_without_the_model(client):
    body = check(client, studentAnswer="i'm from ORAN").json()
    assert body.pop("meta") is None
    assert body == {
        "correct": True, "correction": None, "explanation": None, "focus": None,
    }


def test_empty_answer_is_wrong_without_the_model(client):
    body = check(client, studentAnswer="  ").json()

    assert body["correct"] is False
    assert body["correction"] == "I am from Oran."


def test_other_answers_are_judged_by_the_model(client, model):
    model.queue({"correct": False, "correction": "I am from Algiers.", "explanation": localized("Use am with I."), "focus": "verb to be"})

    body = check(client, studentAnswer="I from Algiers", spoken=True).json()

    meta = body.pop("meta")
    assert meta["attempts"] == 1
    assert body == {
        "correct": False,
        "correction": "I am from Algiers.",
        "explanation": localized("Use am with I."),
        "focus": "verb to be",
    }
    assert "<student_answer>\nI from Algiers\n</student_answer>" in model.prompt()
    assert SPOKEN_NOTE in model.prompt()


def test_model_accepts_a_different_correct_answer(client, model):
    model.queue({"correct": True, "correction": "", "explanation": localized(""), "focus": ""})

    body = check(client, studentAnswer="I come from Constantine.").json()

    assert body["correct"] is True
    assert body["correction"] is None
    assert SPOKEN_NOTE not in model.prompt()


def test_wrong_verdict_without_correction_is_sent_back(client, model):
    model.queue(
        {"correct": False, "correction": "", "explanation": localized("Use am."), "focus": "verb to be"},
        {"correct": False, "correction": "I am from Oran.", "explanation": localized("Use am."), "focus": "verb to be"},
    )

    assert check(client, studentAnswer="I is from Oran").json()["correction"] == "I am from Oran."
