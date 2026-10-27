import difflib
import re
from typing import Literal

from app.schemas import CamelModel

CONTRACTIONS = {
    "i'm": "i am",
    "you're": "you are",
    "we're": "we are",
    "they're": "they are",
    "he's": "he is",
    "she's": "she is",
    "it's": "it is",
    "that's": "that is",
    "there's": "there is",
    "what's": "what is",
    "where's": "where is",
    "who's": "who is",
    "isn't": "is not",
    "aren't": "are not",
    "wasn't": "was not",
    "weren't": "were not",
    "don't": "do not",
    "doesn't": "does not",
    "didn't": "did not",
    "haven't": "have not",
    "hasn't": "has not",
    "hadn't": "had not",
    "can't": "cannot",
    "couldn't": "could not",
    "won't": "will not",
    "wouldn't": "would not",
    "shouldn't": "should not",
    "i've": "i have",
    "you've": "you have",
    "we've": "we have",
    "they've": "they have",
    "i'll": "i will",
    "you'll": "you will",
    "he'll": "he will",
    "she'll": "she will",
    "we'll": "we will",
    "they'll": "they will",
    "i'd": "i would",
    "let's": "let us",
}


def normalize_answer(text: str) -> str:
    """Compare form of an answer or prompt: case, punctuation, gaps, curly quotes and contractions removed."""
    text = text.lower().replace("_", " ").replace("’", "'").replace("‘", "'")
    words = re.findall(r"[\w']+", text)
    return " ".join(CONTRACTIONS.get(word, word) for word in words).replace("'", "")


def same_words(text: str, other: str) -> bool:
    return text.split() == other.split()


def contains_words(text: str, part: str) -> bool:
    """True when `part` appears in `text`, ignoring differences in spacing and line breaks."""
    return " ".join(part.split()) in " ".join(text.split())


class DiffSegment(CamelModel):
    text: str
    change: Literal["same", "removed", "added"]


def word_diff(before: str, after: str) -> list[DiffSegment]:
    old, new = before.split(), after.split()
    segments = []
    matcher = difflib.SequenceMatcher(a=old, b=new, autojunk=False)
    for operation, old_start, old_end, new_start, new_end in matcher.get_opcodes():
        if operation == "equal":
            segments.append(DiffSegment(text=" ".join(old[old_start:old_end]), change="same"))
            continue
        if old_end > old_start:
            segments.append(DiffSegment(text=" ".join(old[old_start:old_end]), change="removed"))
        if new_end > new_start:
            segments.append(DiffSegment(text=" ".join(new[new_start:new_end]), change="added"))
    return segments
