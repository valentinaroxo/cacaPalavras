(function (root, factory) {
  const persistence = factory(root.WordGame);
  if (typeof module === "object" && module.exports) module.exports = persistence;
  root.WordPersistence = persistence;
})(typeof globalThis === "object" ? globalThis : this, function (WordGame) {
  "use strict";

  const STORAGE_KEY = "palavra-game-v1";

  function createInitialData() {
    return {
      version: 1,
      stats: WordGame.emptyStats(),
      dailyRound: null,
      practiceRound: null
    };
  }

  function isNonNegativeInteger(value) {
    return Number.isInteger(value) && value >= 0;
  }

  function isValidRound(round) {
    return round === null || (
      typeof round === "object" &&
      typeof round.puzzleId === "string" &&
      (round.mode === "daily" || round.mode === "practice") &&
      /^\d{4}-\d{2}-\d{2}$/.test(round.dateId) &&
      Array.isArray(round.guesses) &&
      round.guesses.length <= WordGame.MAX_GUESSES &&
      ["playing", "won", "lost"].includes(round.status) &&
      typeof round.hintRevealed === "boolean" &&
      typeof round.countedAsPlayed === "boolean" &&
      typeof round.countedAsCompleted === "boolean"
    );
  }

  function isValidData(data) {
    return Boolean(
      data &&
      data.version === 1 &&
      data.stats &&
      isNonNegativeInteger(data.stats.played) &&
      isNonNegativeInteger(data.stats.completed) &&
      isNonNegativeInteger(data.stats.dailyStreak) &&
      isNonNegativeInteger(data.stats.bestDailyStreak) &&
      (data.stats.lastDailyCompletedDate === null ||
        /^\d{4}-\d{2}-\d{2}$/.test(data.stats.lastDailyCompletedDate)) &&
      isValidRound(data.dailyRound) &&
      isValidRound(data.practiceRound)
    );
  }

  function createRepository(storage) {
    return {
      load() {
        if (!storage) {
          return {
            data: createInitialData(),
            persistent: false,
            error: "O armazenamento local não está disponível. O progresso pode não ser mantido após fechar a página."
          };
        }

        let serialized;
        try {
          serialized = storage.getItem(STORAGE_KEY);
        } catch {
          return {
            data: createInitialData(),
            persistent: false,
            error: "Não foi possível ler o progresso salvo. Esta sessão continuará sem salvamento."
          };
        }

        if (serialized === null) {
          return { data: createInitialData(), persistent: true, error: null };
        }

        let parsed;
        try {
          parsed = JSON.parse(serialized);
        } catch {
          return {
            data: createInitialData(),
            persistent: false,
            error: "O progresso salvo não pôde ser lido. Esta sessão continuará sem salvamento."
          };
        }

        if (!isValidData(parsed)) {
          return {
            data: createInitialData(),
            persistent: false,
            error: "O formato do progresso salvo não é compatível. Esta sessão continuará sem salvamento."
          };
        }

        return { data: parsed, persistent: true, error: null };
      },

      save(data) {
        if (!storage) return { ok: false, error: "O armazenamento local não está disponível." };
        try {
          storage.setItem(STORAGE_KEY, JSON.stringify(data));
          return { ok: true, error: null };
        } catch {
          return { ok: false, error: "Não foi possível salvar o progresso neste navegador." };
        }
      }
    };
  }

  return { STORAGE_KEY, createInitialData, createRepository, isValidData };
});
