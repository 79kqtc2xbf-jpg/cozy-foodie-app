let cfTimerInterval = null;
let cfTimerTotal = 0;
let cfTimerLeft = 0;
let cfAudioCtx = null;

function cfParseDisplaySeconds() {
  const display = document.getElementById("timerDisplay");
  if (!display) return 600;
  const m = String(display.textContent || "").match(/(\d{1,2}):(\d{2})/);
  if (!m) return cfTimerLeft || cfTimerTotal || 600;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

function cfFormatTimer(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function cfUpdateTimerDisplay(text) {
  const display = document.getElementById("timerDisplay");
  if (display) display.textContent = text || cfFormatTimer(cfTimerLeft);
}

function cfUnlockAudio() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    if (!cfAudioCtx) cfAudioCtx = new Ctx();
    if (cfAudioCtx.state === "suspended") cfAudioCtx.resume();
  } catch (e) {}
}

function cfPlayTimerSound() {
  try {
    cfUnlockAudio();
    if (!cfAudioCtx) return;
    const now = cfAudioCtx.currentTime;
    [0, 0.18, 0.36].forEach((offset, i) => {
      const osc = cfAudioCtx.createOscillator();
      const gain = cfAudioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(i === 1 ? 880 : 660, now + offset);
      gain.gain.setValueAtTime(0.0001, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.22, now + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.14);
      osc.connect(gain);
      gain.connect(cfAudioCtx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.16);
    });
    if (navigator.vibrate) navigator.vibrate([120, 80, 120]);
  } catch (e) {}
}

window.setTimer = function(minutes, start = false) {
  window.pauseTimer();
  cfTimerTotal = Math.max(1, Number(minutes) || 10) * 60;
  cfTimerLeft = cfTimerTotal;
  cfUpdateTimerDisplay();
  cfUnlockAudio();
  if (start) window.startTimer();
};

window.startTimer = function() {
  cfUnlockAudio();
  if (cfTimerInterval) return;
  const current = cfParseDisplaySeconds();
  cfTimerLeft = current > 0 ? current : (cfTimerTotal || 600);
  if (!cfTimerTotal || cfTimerLeft > cfTimerTotal) cfTimerTotal = cfTimerLeft;
  cfUpdateTimerDisplay();
  cfTimerInterval = setInterval(() => {
    cfTimerLeft = Math.max(0, cfTimerLeft - 1);
    cfUpdateTimerDisplay();
    if (cfTimerLeft <= 0) {
      clearInterval(cfTimerInterval);
      cfTimerInterval = null;
      cfUpdateTimerDisplay("готово ✨");
      cfPlayTimerSound();
    }
  }, 1000);
};

window.pauseTimer = function() {
  if (cfTimerInterval) {
    clearInterval(cfTimerInterval);
    cfTimerInterval = null;
  }
};

window.resetTimer = function() {
  window.pauseTimer();
  if (!cfTimerTotal) cfTimerTotal = cfParseDisplaySeconds() || 600;
  cfTimerLeft = cfTimerTotal;
  cfUpdateTimerDisplay();
};

document.addEventListener("click", function(e) {
  if (e.target && (e.target.closest(".timer-actions") || e.target.closest(".timer-chip"))) {
    cfUnlockAudio();
  }
}, true);
