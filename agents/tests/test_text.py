from app.text import contains_words, normalize_answer, word_diff


def test_normalize_ignores_case_punctuation_quotes_and_contractions():
    assert normalize_answer("I’m FROM Oran!") == normalize_answer("i am from oran")
    assert normalize_answer("She doesn't like tea.") == normalize_answer("she does not like tea")
    assert normalize_answer("goes") != normalize_answer("go")


def test_normalize_ignores_the_length_of_a_gap():
    assert normalize_answer("She ___ to school.") == normalize_answer("She ____ to school")


def test_word_diff_marks_replaced_words():
    segments = word_diff("My friend Sara study with me.", "My friend Sara studies with me.")

    assert [(s.text, s.change) for s in segments] == [
        ("My friend Sara", "same"),
        ("study", "removed"),
        ("studies", "added"),
        ("with me.", "same"),
    ]


def test_word_diff_of_identical_text_is_one_segment():
    assert [(s.text, s.change) for s in word_diff("I wake up at 7.", "I wake up  at 7.")] == [
        ("I wake up at 7.", "same"),
    ]


def test_contains_words_ignores_line_breaks():
    assert contains_words("I wake up at 7.\nI go to the\nuniversity by bus.", "I go to the university by bus.")
    assert not contains_words("I wake up at 7.", "I woke up at 7.")
