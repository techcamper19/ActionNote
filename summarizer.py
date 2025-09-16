"""
Utility functions for summarising meeting transcripts and extracting action items.

Since we cannot rely on external AI APIs in this environment, the summarisation
algorithm uses a simple heuristic: it scores each sentence based on the
frequency of non‑stop words it contains and selects the top sentences as the
summary.  Action items are extracted by looking for modal verbs and phrases
that typically signal tasks (e.g. "should", "need to", "we will").
"""

import re
from collections import Counter
from typing import List


def _preprocess_text(text: str) -> List[str]:
    """Splits text into sentences using punctuation boundaries."""
    # Normalize whitespace
    text = re.sub(r"\s+", " ", text.strip())
    # Split on sentence boundaries (.!?), retaining the delimiter
    sentences = re.split(r"(?<=[.!?])\s+", text)
    return [s.strip() for s in sentences if s.strip()]


def _word_frequencies(text: str) -> Counter:
    """Computes word frequencies ignoring common stop words."""
    # Basic list of English stop words; can be expanded
    stop_words = {
        "the", "a", "an", "and", "or", "but", "if", "in", "on", "for", "to", "of", "with",
        "is", "are", "was", "were", "be", "have", "has", "had", "it", "this", "that", "as",
        "at", "by", "from", "our", "we", "you", "they", "he", "she", "i", "me", "my", "your",
        "their", "them", "so", "not", "no", "do", "does", "did", "into", "because"
    }
    words = re.findall(r"\b\w+\b", text.lower())
    frequencies: Counter = Counter(w for w in words if w not in stop_words and len(w) > 2)
    return frequencies


def summarize(text: str, num_sentences: int = 3) -> str:
    """
    Produces a summary by extracting the top `num_sentences` sentences based on
    word frequency scores.  If the transcript is short, returns it as is.

    Parameters
    ----------
    text: str
        The full meeting transcript.
    num_sentences: int, optional
        The number of sentences to include in the summary.

    Returns
    -------
    str
        A summary composed of the highest‑scoring sentences.
    """
    sentences = _preprocess_text(text)
    if len(sentences) <= num_sentences:
        # If fewer sentences than requested summary length, return original
        return text.strip()
    frequencies = _word_frequencies(text)
    # Score sentences by summing word frequencies
    sentence_scores = []
    for idx, sentence in enumerate(sentences):
        words = re.findall(r"\b\w+\b", sentence.lower())
        score = sum(frequencies.get(w, 0) for w in words)
        sentence_scores.append((idx, score, sentence))
    # Select top sentences by score (preserving original order)
    top_sentences = sorted(sentence_scores, key=lambda x: (-x[1], x[0]))[:num_sentences]
    # Sort back to original order
    top_sentences.sort(key=lambda x: x[0])
    summary = " ".join(s for (_, _, s) in top_sentences)
    return summary


def extract_tasks(text: str) -> List[str]:
    """
    Extracts potential action items from the transcript by identifying sentences
    containing modal verbs or task‑oriented keywords.

    A sentence is considered a task if it contains phrases like "to do",
    "we need", "should", "must", "action", "follow up", etc.

    Parameters
    ----------
    text: str
        The meeting transcript.

    Returns
    -------
    List[str]
        A list of identified action items.  Duplicate items are removed while
        preserving order.
    """
    patterns = [
        r"\bwe need\b",
        r"\byou need\b",
        r"\bshould\b",
        r"\bmust\b",
        r"\bto do\b",
        r"\baction item\b",
        r"\bfollow up\b",
        r"\bassign\b",
        r"\btask\b",
        r"\bwill\b",
    ]
    sentences = _preprocess_text(text)
    tasks: List[str] = []
    for sentence in sentences:
        lower = sentence.lower()
        if any(re.search(pat, lower) for pat in patterns):
            tasks.append(sentence.strip())
    # Remove duplicates while preserving order
    seen = set()
    unique_tasks = []
    for task in tasks:
        if task not in seen:
            unique_tasks.append(task)
            seen.add(task)
    return unique_tasks
