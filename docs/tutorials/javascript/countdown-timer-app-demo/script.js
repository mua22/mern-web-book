// How many seconds the countdown started at (for the progress bar's math)
// and how many are left right now. intervalId is null whenever the timer
// is NOT currently running — that's what lets startTimer()/pauseTimer()
// tell "running" from "not running."
let totalSeconds = 0;
let remainingSeconds = 0;
let intervalId = null;

// Turns a count of seconds into a "MM:SS" string, always two digits each.
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return String(minutes).padStart(2, "0") + ":" + String(secs).padStart(2, "0");
}

// Writes the current remainingSeconds to the page: the big MM:SS readout
// and the progress bar's width.
function updateDisplay() {
  document.getElementById("timeDisplay").textContent = formatTime(remainingSeconds);

  const percentElapsed = ((totalSeconds - remainingSeconds) / totalSeconds) * 100;
  document.getElementById("progressFill").style.width = percentElapsed + "%";
}

// This is NOT bound to any HTML attribute — nothing ever writes
// onclick="tick()" anywhere. It's called by setInterval(), below, which is
// a completely different mechanism: "run this function automatically,
// over and over, every N milliseconds," with no user interaction involved.
function tick() {
  remainingSeconds = remainingSeconds - 1;
  updateDisplay();

  if (remainingSeconds <= 0) {
    finishTimer();
  }
}

function finishTimer() {
  clearInterval(intervalId);
  intervalId = null;

  document.getElementById("statusMessage").textContent = "Time's up!";
  document.getElementById("startBtn").disabled = false;
  document.getElementById("pauseBtn").disabled = true;
}

// Called by the Start button's onclick="startTimer()" attribute.
function startTimer() {
  if (intervalId !== null) {
    return; // already running — ignore a second click
  }

  document.getElementById("statusMessage").textContent = "";
  document.getElementById("startBtn").disabled = true;
  document.getElementById("pauseBtn").disabled = false;
  document.getElementById("minutesInput").disabled = true;

  // setInterval's first argument is the function to run, the second is the
  // delay in milliseconds between each run. It immediately returns an ID
  // number — save it, because that ID is the only way to cancel this
  // interval later with clearInterval().
  intervalId = setInterval(tick, 1000);
}

// Called by the Pause button's onclick="pauseTimer()" attribute.
function pauseTimer() {
  if (intervalId === null) {
    return; // not running — nothing to pause
  }

  clearInterval(intervalId);
  intervalId = null;

  document.getElementById("startBtn").disabled = false;
  document.getElementById("pauseBtn").disabled = true;
}

// Called by the Reset button's onclick="resetTimer()" attribute. Also
// called once at the very bottom of this file to set up the initial
// display when the page first loads.
function resetTimer() {
  clearInterval(intervalId);
  intervalId = null;

  const minutesInput = document.getElementById("minutesInput");
  const minutes = Number(minutesInput.value) || 5;

  totalSeconds = minutes * 60;
  remainingSeconds = totalSeconds;

  document.getElementById("statusMessage").textContent = "";
  document.getElementById("startBtn").disabled = false;
  document.getElementById("pauseBtn").disabled = true;
  minutesInput.disabled = false;

  updateDisplay();
}

// Not bound to any event — just the next line in the file, so it runs
// once, immediately, to draw 05:00 (or whatever the input says) before
// anyone has clicked anything.
resetTimer();
