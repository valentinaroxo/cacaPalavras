(function (root, factory) {
  const game = factory();
  if (typeof module === "object" && module.exports) module.exports = game;
  root.WordGame = game;
})(typeof globalThis === "object" ? globalThis : this, function () {
  "use strict";

  const LETTER_COUNT = 5;
  const MAX_GUESSES = 6;

  function normalizeWord(value) {
    return Array.from(String(value ?? "").trim().normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleUpperCase("pt-BR"));
  }

  function normalizedString(value) {
    return normalizeWord(value).join("");
  }

  function isFiveLetterInput(value) {
    const trimmed = String(value ?? "").trim();
    return /^\p{L}{5}$/u.test(trimmed) &&
      normalizeWord(trimmed).length === LETTER_COUNT &&
      normalizeWord(trimmed).every((letter) => /^[A-Z]$/.test(letter));
  }

  function createGuessSet(words) {
    return new Set(words.map((word) => normalizedString(word)));
  }

  function validateGuess(value, guessSet) {
    const trimmed = String(value ?? "").trim();
    if (!trimmed) return { valid: false, code: "empty" };
    if (!isFiveLetterInput(trimmed)) return { valid: false, code: "length" };

    const normalized = normalizedString(trimmed);
    if (!guessSet.has(normalized)) return { valid: false, code: "unknown" };

    return {
      valid: true,
      display: trimmed.toLocaleUpperCase("pt-BR"),
      normalized
    };
  }

  function calculateFeedback(answer, guess) {
    const answerLetters = Array.isArray(answer) ? answer : normalizeWord(answer);
    const guessLetters = Array.isArray(guess) ? guess : normalizeWord(guess);
    if (answerLetters.length !== LETTER_COUNT || guessLetters.length !== LETTER_COUNT) {
      throw new RangeError("A resposta e o palpite precisam ter cinco letras.");
    }

    const feedback = Array(LETTER_COUNT).fill("absent");
    const remaining = new Map();

    answerLetters.forEach((letter) => {
      remaining.set(letter, (remaining.get(letter) || 0) + 1);
    });

    guessLetters.forEach((letter, index) => {
      if (letter === answerLetters[index]) {
        feedback[index] = "correct";
        remaining.set(letter, remaining.get(letter) - 1);
      }
    });

    guessLetters.forEach((letter, index) => {
      if (feedback[index] === "correct") return;
      const count = remaining.get(letter) || 0;
      if (count > 0) {
        feedback[index] = "present";
        remaining.set(letter, count - 1);
      }
    });

    return feedback;
  }

  function utcDateId(date) {
    return date.toISOString().slice(0, 10);
  }

  function selectDailyPuzzle(puzzles, dateId, epochDateId) {
    const epoch = Date.parse(`${epochDateId}T00:00:00.000Z`);
    const date = Date.parse(`${dateId}T00:00:00.000Z`);
    if (!Number.isFinite(epoch) || !Number.isFinite(date)) {
      throw new TypeError("Data diária inválida.");
    }
    const daysSinceEpoch = Math.floor((date - epoch) / 86400000);
    const index = ((daysSinceEpoch % puzzles.length) + puzzles.length) % puzzles.length;
    return puzzles[index];
  }

  function createRound(puzzle, mode, dateId) {
    return {
      puzzleId: puzzle.id,
      mode,
      dateId,
      guesses: [],
      status: "playing",
      hintRevealed: false,
      countedAsPlayed: false,
      countedAsCompleted: false
    };
  }

  function submitGuess(round, rawGuess, guessSet, answer) {
    if (round.status !== "playing") {
      return { accepted: false, code: "finished", round };
    }

    const validation = validateGuess(rawGuess, guessSet);
    if (!validation.valid) return { accepted: false, code: validation.code, round };

    const feedback = calculateFeedback(answer, validation.normalized);
    const guesses = [...round.guesses, {
      display: validation.display,
      normalized: validation.normalized,
      feedback
    }];
    const won = validation.normalized === normalizedString(answer);
    const status = won ? "won" : guesses.length >= MAX_GUESSES ? "lost" : "playing";

    return {
      accepted: true,
      round: {
        ...round,
        guesses,
        status,
        countedAsPlayed: true,
        countedAsCompleted: status !== "playing"
      }
    };
  }

  function emptyStats() {
    return {
      played: 0,
      completed: 0,
      dailyStreak: 0,
      bestDailyStreak: 0,
      lastDailyCompletedDate: null
    };
  }

  function updateStatsForAcceptedGuess(stats, wasCounted) {
    if (wasCounted) return stats;
    return { ...stats, played: stats.played + 1 };
  }

  function updateStatsForCompletion(stats, round) {
    if (round.countedAsCompleted) return stats;
    const next = { ...stats, completed: stats.completed + 1 };
    if (round.mode !== "daily") return next;

    if (stats.lastDailyCompletedDate === round.dateId) return next;

    const previousDay = new Date(Date.parse(`${round.dateId}T00:00:00.000Z`) - 86400000)
      .toISOString().slice(0, 10);
    const dailyStreak = stats.lastDailyCompletedDate === previousDay
      ? stats.dailyStreak + 1
      : 1;

    return {
      ...next,
      dailyStreak,
      bestDailyStreak: Math.max(stats.bestDailyStreak, dailyStreak),
      lastDailyCompletedDate: round.dateId
    };
  }

  function visibleDailyStreak(stats, todayId) {
    if (!stats.lastDailyCompletedDate) return 0;
    const today = Date.parse(`${todayId}T00:00:00.000Z`);
    const last = Date.parse(`${stats.lastDailyCompletedDate}T00:00:00.000Z`);
    const elapsedDays = Math.floor((today - last) / 86400000);
    return elapsedDays >= 0 && elapsedDays <= 1 ? stats.dailyStreak : 0;
  }

  return {
    LETTER_COUNT,
    MAX_GUESSES,
    calculateFeedback,
    createGuessSet,
    createRound,
    emptyStats,
    isFiveLetterInput,
    normalizeWord,
    normalizedString,
    selectDailyPuzzle,
    submitGuess,
    updateStatsForAcceptedGuess,
    updateStatsForCompletion,
    utcDateId,
    validateGuess,
    visibleDailyStreak
  };
});
