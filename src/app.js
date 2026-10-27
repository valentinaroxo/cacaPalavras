(function () {
  "use strict";

  const Game = window.WordGame;
  const WordData = window.WordData;
  const Persistence = window.WordPersistence;
  const puzzlesById = new Map(WordData.puzzles.map((puzzle) => [puzzle.id, puzzle]));
  const acceptedGuesses = Game.createGuessSet([
    ...WordData.puzzles.map((puzzle) => puzzle.answer),
    ...WordData.extraGuesses
  ]);
  const dayEpoch = "2026-10-27";
  let todayId = Game.utcDateId(new Date());
  let dailyPuzzle = Game.selectDailyPuzzle(WordData.puzzles, todayId, dayEpoch);

  let browserStorage = null;
  try {
    browserStorage = window.localStorage;
  } catch {
    browserStorage = null;
  }

  const repository = Persistence.createRepository(browserStorage);
  const loaded = repository.load();
  const data = loaded.data;
  let persistenceAvailable = loaded.persistent;
  let mode = "daily";
  let practiceCounter = 0;

  const elements = {
    storageNotice: document.querySelector("#storage-notice"),
    dailyMode: document.querySelector("#daily-mode"),
    practiceMode: document.querySelector("#practice-mode"),
    topTag: document.querySelector("#top-tag"),
    attemptCount: document.querySelector("#attempt-count"),
    title: document.querySelector("#game-title"),
    instructions: document.querySelector("#game-instructions"),
    board: document.querySelector("#board"),
    form: document.querySelector("#guess-form"),
    input: document.querySelector("#guess-input"),
    inputHelp: document.querySelector("#input-help"),
    hintButton: document.querySelector("#hint-button"),
    hintPanel: document.querySelector("#hint-panel"),
    result: document.querySelector("#round-result"),
    resultTitle: document.querySelector("#result-title"),
    resultAnswer: document.querySelector("#result-answer"),
    resultDefinition: document.querySelector("#result-definition"),
    shareArea: document.querySelector("#share-area"),
    shareButton: document.querySelector("#share-button"),
    shareFallback: document.querySelector("#share-fallback"),
    shareFallbackLabel: document.querySelector("#share-fallback-label"),
    replayButton: document.querySelector("#replay-button"),
    liveStatus: document.querySelector("#live-status"),
    statPlayed: document.querySelector("#stat-played"),
    statCompleted: document.querySelector("#stat-completed"),
    statStreak: document.querySelector("#stat-streak"),
    statBestStreak: document.querySelector("#stat-best-streak")
  };

  let dailyRound = isCurrentDailyRound(data.dailyRound)
    ? data.dailyRound
    : Game.createRound(dailyPuzzle, "daily", todayId);
  if (dailyRound.puzzleId !== dailyPuzzle.id) dailyRound = Game.createRound(dailyPuzzle, "daily", todayId);
  data.dailyRound = dailyRound;

  let practiceRound = getStoredPracticeRound();
  if (!practiceRound) practiceRound = createPracticeRound();
  data.practiceRound = practiceRound;

  function isCurrentDailyRound(round) {
    return round && round.mode === "daily" && round.dateId === todayId;
  }

  function getStoredPracticeRound() {
    const round = data.practiceRound;
    return round && round.mode === "practice" && puzzlesById.has(round.puzzleId) ? round : null;
  }

  function createPracticeRound() {
    const priorId = data.practiceRound && data.practiceRound.puzzleId;
    const choices = WordData.puzzles.filter((puzzle) => puzzle.id !== priorId);
    const puzzle = choices[Math.floor(Math.random() * choices.length)];
    practiceCounter += 1;
    return Game.createRound(puzzle, "practice", todayId);
  }

  function activeRound() {
    return mode === "daily" ? dailyRound : practiceRound;
  }

  function activePuzzle() {
    return puzzlesById.get(activeRound().puzzleId);
  }

  function announce(message) {
    elements.liveStatus.textContent = "";
    window.requestAnimationFrame(() => {
      elements.liveStatus.textContent = message;
    });
  }

  function persist() {
    if (!persistenceAvailable) return;
    const saved = repository.save(data);
    if (!saved.ok) {
      persistenceAvailable = false;
      showStorageNotice(`${saved.error} O jogo continua funcionando nesta sessão.`);
    }
  }

  function showStorageNotice(message) {
    elements.storageNotice.textContent = message;
    elements.storageNotice.hidden = false;
  }

  function feedbackLabel(status) {
    if (status === "correct") return "posição correta";
    if (status === "present") return "presente em outra posição";
    return "ausente da palavra";
  }

  function feedbackMark(status) {
    if (status === "correct") return "✓";
    if (status === "present") return "↔";
    return "×";
  }

  function renderBoard(round) {
    elements.board.replaceChildren();
    for (let rowIndex = 0; rowIndex < Game.MAX_GUESSES; rowIndex += 1) {
      const row = document.createElement("li");
      row.className = "board-row";
      row.setAttribute("aria-label", `Tentativa ${rowIndex + 1}`);
      const guess = round.guesses[rowIndex];

      for (let columnIndex = 0; columnIndex < Game.LETTER_COUNT; columnIndex += 1) {
        const tile = document.createElement("span");
        tile.className = "tile";
        if (guess) {
          const letterStatus = guess.feedback[columnIndex];
          tile.classList.add(`tile-${letterStatus}`);
          tile.setAttribute("aria-label", `${guess.display[columnIndex]}, ${feedbackLabel(letterStatus)}`);
          tile.append(document.createTextNode(guess.display[columnIndex]));
          const mark = document.createElement("span");
          mark.className = "tile-mark";
          mark.setAttribute("aria-hidden", "true");
          mark.textContent = feedbackMark(letterStatus);
          tile.append(mark);
        } else {
          tile.setAttribute("aria-hidden", "true");
        }
        row.append(tile);
      }

      elements.board.append(row);
    }
  }

  function renderStats() {
    elements.statPlayed.textContent = String(data.stats.played);
    elements.statCompleted.textContent = String(data.stats.completed);
    elements.statStreak.textContent = String(Game.visibleDailyStreak(data.stats, todayId));
    elements.statBestStreak.textContent = String(data.stats.bestDailyStreak);
  }

  function renderResult(round, puzzle) {
    const finished = round.status !== "playing";
    elements.result.hidden = !finished;
    elements.shareArea.hidden = !finished || round.mode !== "daily";
    elements.replayButton.hidden = !finished || round.mode !== "practice";
    if (!finished) return;

    elements.resultTitle.textContent = round.status === "won" ? "Muito bem, você descobriu!" : "Boa tentativa! Aqui vai a resposta:";
    elements.resultAnswer.textContent = puzzle.answer;
    elements.resultDefinition.textContent = puzzle.definition;
  }

  function render() {
    const round = activeRound();
    const puzzle = activePuzzle();
    const isDaily = mode === "daily";

    elements.dailyMode.setAttribute("aria-pressed", String(isDaily));
    elements.practiceMode.setAttribute("aria-pressed", String(!isDaily));
    elements.topTag.textContent = isDaily
      ? "Uma palavra por dia · sem cronômetro"
      : "Partidas livres · sem cronômetro";
    elements.title.textContent = isDaily ? "Descubra a palavra de hoje" : "Uma palavra nova para praticar";
    elements.instructions.textContent = isDaily
      ? "A palavra tem 5 letras. Você tem até 6 tentativas e pode jogar sem pressa."
      : "A palavra tem 5 letras. Use até 6 tentativas e pratique quantas vezes quiser.";
    elements.attemptCount.textContent = round.status === "playing"
      ? `${round.guesses.length} de ${Game.MAX_GUESSES} tentativas usadas`
      : `${round.guesses.length} de ${Game.MAX_GUESSES} tentativas`;

    renderBoard(round);
    renderResult(round, puzzle);
    renderStats();
    elements.hintButton.disabled = round.status !== "playing";
    elements.hintButton.setAttribute("aria-expanded", String(round.hintRevealed));
    elements.hintPanel.hidden = !round.hintRevealed;
    elements.hintPanel.textContent = round.hintRevealed ? puzzle.hint : "";
    elements.input.disabled = round.status !== "playing";
    elements.form.querySelector("button").disabled = round.status !== "playing";
    if (round.status === "playing") {
      elements.shareFallback.hidden = true;
      elements.shareFallbackLabel.hidden = true;
      elements.shareFallback.value = "";
    }
  }

  function getFeedbackAnnouncement(guess) {
    return `Palpite ${guess.display}: ${guess.feedback.map((status, index) =>
      `${guess.display[index]}, ${feedbackLabel(status)}`
    ).join("; ")}.`;
  }

  function onGuessSubmit(event) {
    event.preventDefault();
    const dateChanged = refreshUtcDate();
    if (dateChanged && mode === "daily") render();
    const round = activeRound();
    const puzzle = activePuzzle();
    const result = Game.submitGuess(round, elements.input.value, acceptedGuesses, puzzle.answer);

    if (!result.accepted) {
      const messages = {
        empty: "Digite uma palavra de cinco letras.",
        length: "O palpite precisa ter cinco letras. Acentos não são necessários.",
        unknown: "Não reconheci essa palavra. Confira a escrita e tente outra palavra válida.",
        finished: "Esta rodada já terminou."
      };
      elements.inputHelp.textContent = messages[result.code];
      announce(messages[result.code]);
      if (result.code !== "finished") elements.input.focus();
      return;
    }

    const wasCounted = round.countedAsPlayed;
    let updated = result.round;
    data.stats = Game.updateStatsForAcceptedGuess(data.stats, wasCounted);
    if (updated.status !== "playing") {
      data.stats = Game.updateStatsForCompletion(data.stats, {
        ...updated,
        countedAsCompleted: false
      });
    }
    if (mode === "daily") dailyRound = updated;
    else practiceRound = updated;
    data.dailyRound = dailyRound;
    data.practiceRound = practiceRound;
    persist();
    elements.input.value = "";
    elements.inputHelp.textContent = "Acentos não são necessários.";
    render();
    announce(updated.status === "won"
      ? `${getFeedbackAnnouncement(updated.guesses.at(-1))} Você acertou a palavra.`
      : updated.status === "lost"
        ? `${getFeedbackAnnouncement(updated.guesses.at(-1))} As tentativas terminaram. A resposta é ${puzzle.answer}.`
        : getFeedbackAnnouncement(updated.guesses.at(-1)));
  }

  function switchMode(nextMode) {
    if (nextMode !== "daily" && nextMode !== "practice") return;
    refreshUtcDate();
    mode = nextMode;
    elements.inputHelp.textContent = "Acentos não são necessários.";
    elements.liveStatus.textContent = "";
    render();
  }

  function refreshUtcDate() {
    const currentDate = Game.utcDateId(new Date());
    if (currentDate === todayId) return false;
    todayId = currentDate;
    dailyPuzzle = Game.selectDailyPuzzle(WordData.puzzles, todayId, dayEpoch);
    dailyRound = Game.createRound(dailyPuzzle, "daily", todayId);
    data.dailyRound = dailyRound;
    persist();
    return true;
  }

  function revealHint() {
    const dateChanged = refreshUtcDate();
    if (dateChanged && mode === "daily") render();
    const round = activeRound();
    if (round.status !== "playing") return;
    round.hintRevealed = !round.hintRevealed;
    if (mode === "daily") dailyRound = round;
    else practiceRound = round;
    data.dailyRound = dailyRound;
    data.practiceRound = practiceRound;
    persist();
    render();
    announce(round.hintRevealed ? `Pista: ${activePuzzle().hint}` : "Pista recolhida.");
  }

  function startAnotherPracticeRound() {
    practiceRound = createPracticeRound();
    data.practiceRound = practiceRound;
    persist();
    render();
    elements.input.focus();
    announce("Nova palavra de prática. Você tem seis tentativas.");
  }

  function shareText() {
    const round = dailyRound;
    const symbols = {
      correct: "🟩",
      present: "🟨",
      absent: "⬜"
    };
    const resultGrid = round.guesses
      .map((guess) => guess.feedback.map((status) => symbols[status]).join(""))
      .join("\n");
    const score = round.status === "won" ? `${round.guesses.length}/6` : "X/6";
    const dateLabel = new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      timeZone: "UTC"
    }).format(new Date(`${round.dateId}T12:00:00.000Z`));
    return `Palavra! · Desafio diário ${dateLabel} · ${score}\n\n${resultGrid}`;
  }

  function showManualShare(text) {
    elements.shareFallback.value = text;
    elements.shareFallback.hidden = false;
    elements.shareFallbackLabel.hidden = false;
    elements.shareFallback.focus();
    elements.shareFallback.select();
    announce("Não foi possível compartilhar automaticamente. O resultado está selecionado para você copiar.");
  }

  async function shareDailyResult() {
    const text = shareText();
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ text });
        announce("Resultado compartilhado sem revelar a palavra.");
        return;
      } catch (error) {
        if (error && error.name === "AbortError") {
          announce("Compartilhamento cancelado.");
          return;
        }
        announce("O compartilhamento do dispositivo falhou. Vou oferecer a opção de copiar.");
      }
    }

    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      try {
        await navigator.clipboard.writeText(text);
        announce("Resultado copiado. A palavra não foi incluída.");
        return;
      } catch {
        showManualShare(text);
        return;
      }
    }

    showManualShare(text);
  }

  elements.form.addEventListener("submit", onGuessSubmit);
  elements.dailyMode.addEventListener("click", () => switchMode("daily"));
  elements.practiceMode.addEventListener("click", () => switchMode("practice"));
  elements.hintButton.addEventListener("click", revealHint);
  elements.replayButton.addEventListener("click", startAnotherPracticeRound);
  elements.shareButton.addEventListener("click", shareDailyResult);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && refreshUtcDate()) render();
  });

  if (loaded.error) showStorageNotice(loaded.error);
  else persist();
  render();
})();
