"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const Game = require("../src/game.js");
const WordData = require("../src/words.js");
const Persistence = require("../src/persistence.js");

const guessSet = Game.createGuessSet([
  ...WordData.puzzles.map((puzzle) => puzzle.answer),
  ...WordData.extraGuesses
]);

test("the curated answer bank contains unique five-letter comparison forms", () => {
  const answers = WordData.puzzles.map((puzzle) => Game.normalizedString(puzzle.answer));
  assert.ok(answers.length >= 50);
  assert.equal(new Set(answers).size, answers.length);
  assert.ok(answers.every((answer) => /^[A-Z]{5}$/.test(answer)));
  assert.ok(WordData.puzzles.every((puzzle) => puzzle.hint && puzzle.definition));
});

test("all accepted guesses normalize to five letters", () => {
  const invalid = WordData.extraGuesses.filter((word) => !/^[A-Z]{5}$/.test(Game.normalizedString(word)));
  assert.deepEqual(invalid, []);
});

test("normalization ignores Portuguese accents and cedilla", () => {
  assert.equal(Game.normalizedString("dança"), "DANCA");
  assert.equal(Game.normalizedString("LÁPIS"), "LAPIS");
  assert.equal(Game.normalizedString("saúde"), "SAUDE");
});

test("guess validation checks length and dictionary membership", () => {
  assert.equal(Game.validateGuess("", guessSet).code, "empty");
  assert.equal(Game.validateGuess("sol", guessSet).code, "length");
  assert.equal(Game.validateGuess("xxxxx", guessSet).code, "unknown");
  assert.equal(Game.validateGuess("danca", guessSet).valid, true);
  assert.equal(Game.validateGuess("DANÇA", guessSet).normalized, "DANCA");
});

test("feedback marks exact letters before allocating repeated occurrences", () => {
  assert.deepEqual(
    Game.calculateFeedback("LUGAR", "LLLXX"),
    ["correct", "absent", "absent", "absent", "absent"]
  );
  assert.deepEqual(
    Game.calculateFeedback("SABOR", "ROSAS"),
    ["present", "present", "present", "present", "absent"]
  );
});

test("winning and losing rounds finish at the correct time", () => {
  let round = Game.createRound({ id: "folha", answer: "FOLHA" }, "daily", "2026-10-27");
  const answerSet = Game.createGuessSet(["FOLHA", "BARCO"]);

  const invalid = Game.submitGuess(round, "TESTE", answerSet, "FOLHA");
  assert.equal(invalid.accepted, false);
  assert.equal(round.guesses.length, 0);

  const win = Game.submitGuess(round, "folha", answerSet, "FOLHA");
  assert.equal(win.round.status, "won");
  assert.equal(win.round.guesses.length, 1);
  assert.equal(Game.submitGuess(win.round, "BARCO", answerSet, "FOLHA").code, "finished");

  round = Game.createRound({ id: "folha", answer: "FOLHA" }, "daily", "2026-10-27");
  for (let attempt = 0; attempt < Game.MAX_GUESSES; attempt += 1) {
    round = Game.submitGuess(round, "BARCO", answerSet, "FOLHA").round;
  }
  assert.equal(round.status, "lost");
  assert.equal(round.guesses.length, 6);
});

test("daily selection is stable for the same UTC date and advances next day", () => {
  const first = Game.selectDailyPuzzle(WordData.puzzles, "2026-10-27", "2026-10-27");
  const repeated = Game.selectDailyPuzzle(WordData.puzzles, "2026-10-27", "2026-10-27");
  const next = Game.selectDailyPuzzle(WordData.puzzles, "2026-10-28", "2026-10-27");
  assert.equal(first.id, repeated.id);
  assert.notEqual(first.id, next.id);
  assert.equal(Game.utcDateId(new Date("2026-10-27T23:59:00Z")), "2026-10-27");
});

test("daily streak counts completed days regardless of win or loss and excludes practice", () => {
  let stats = Game.emptyStats();
  const first = { mode: "daily", dateId: "2026-10-27", countedAsCompleted: false };
  stats = Game.updateStatsForCompletion(stats, first);
  assert.equal(stats.dailyStreak, 1);

  const practice = { mode: "practice", dateId: "2026-10-28", countedAsCompleted: false };
  stats = Game.updateStatsForCompletion(stats, practice);
  assert.equal(stats.dailyStreak, 1);

  const nextDay = { mode: "daily", dateId: "2026-10-28", countedAsCompleted: false };
  stats = Game.updateStatsForCompletion(stats, nextDay);
  assert.equal(stats.dailyStreak, 2);
  assert.equal(stats.bestDailyStreak, 2);
  assert.equal(Game.visibleDailyStreak(stats, "2026-10-29"), 2);
  assert.equal(Game.visibleDailyStreak(stats, "2026-10-30"), 0);
  assert.equal(Game.visibleDailyStreak(stats, "2026-10-27"), 0);

  const afterGap = { mode: "daily", dateId: "2026-10-31", countedAsCompleted: false };
  stats = Game.updateStatsForCompletion(stats, afterGap);
  assert.equal(stats.dailyStreak, 1);
  assert.equal(stats.bestDailyStreak, 2);
});

test("local repository persists valid data and reports corrupt/unavailable data", () => {
  const memory = new Map();
  const storage = {
    getItem: (key) => memory.get(key) ?? null,
    setItem: (key, value) => memory.set(key, value)
  };
  const repository = Persistence.createRepository(storage);
  const data = Persistence.createInitialData();
  data.dailyRound = {
    puzzleId: "folha",
    mode: "daily",
    dateId: "2026-10-27",
    guesses: [],
    status: "playing",
    hintRevealed: false,
    countedAsPlayed: false,
    countedAsCompleted: false
  };
  data.practiceRound = {
    ...data.dailyRound,
    mode: "practice"
  };
  assert.equal(repository.save(data).ok, true);
  assert.deepEqual(repository.load().data, data);
  assert.equal(Persistence.isValidData({
    ...data,
    practiceRound: { ...data.practiceRound, dateId: "2026-10-27-practice-1" }
  }), false);

  const corrupt = Persistence.createRepository({
    getItem: () => "{broken",
    setItem: () => {}
  }).load();
  assert.equal(corrupt.persistent, false);
  assert.match(corrupt.error, /não pôde ser lido/);

  assert.equal(Persistence.createRepository(null).load().persistent, false);
});
