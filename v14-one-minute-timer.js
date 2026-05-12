window.renderTimerButtons = function(r) {
  const stage = typeof getStageTimers === "function" ? getStageTimers(r) : [];
  const classic = [1, 3, 5, 10, 15, 20];
  return `<div class="timer-presets"><h3>⏲️ Таймеры по рецепту</h3><div class="timer-chip-row">${stage.map(t => `<button class="timer-chip" onclick="setTimer(${t.minutes},true)">${t.label}: ${t.minutes} мин</button>`).join("")}</div><h3>Классические</h3><div class="timer-chip-row">${classic.map(m => `<button class="timer-chip ghost" onclick="setTimer(${m},true)">${m} мин</button>`).join("")}</div></div>`;
};
