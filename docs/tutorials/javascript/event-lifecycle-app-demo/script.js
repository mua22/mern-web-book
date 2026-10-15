// -----------------------------------------------------------------
// Part 0: Readiness — DOMContentLoaded vs. window.onload
// -----------------------------------------------------------------
// This script tag lives in <head>, so none of the elements referenced
// below exist yet the instant this file first runs. Everything that
// touches the page is wrapped in DOMContentLoaded, which waits until
// the HTML has been fully parsed — but does NOT wait for images or
// other external resources, unlike window.onload.
function logReadiness(label) {
  const list = document.getElementById("readinessLog");
  if (!list) return;
  const item = document.createElement("li");
  item.textContent = `${label} fired at ${performance.now().toFixed(1)}ms`;
  list.appendChild(item);
}

document.addEventListener("DOMContentLoaded", () => {
  logReadiness("DOMContentLoaded");
  setupPhaseDemo();
  setupDelegation();
});

window.onload = () => {
  logReadiness("window.onload");
};

// -----------------------------------------------------------------
// Part 1: Capturing, target, and bubbling
// -----------------------------------------------------------------
function appendLog(text) {
  const list = document.getElementById("eventLog");
  const item = document.createElement("li");
  item.textContent = text;
  list.prepend(item); // newest entry on top
}

function setupPhaseDemo() {
  const captureToggle = document.getElementById("captureToggle");
  const ids = ["outer", "middle", "inner"];
  const captureHandlers = new Map();

  ids.forEach((id) => {
    const el = document.getElementById(id);

    // Bubbling-phase listener: always attached, on every level.
    el.addEventListener("click", (event) => {
      appendLog(`BUBBLE  (phase ${event.eventPhase}): ${id}`);
    });

    // Capturing-phase listener: only attached while the checkbox is
    // checked, so you can directly compare the log with and without it.
    captureHandlers.set(id, (event) => {
      appendLog(`CAPTURE (phase ${event.eventPhase}): ${id}`);
    });
  });

  captureToggle.addEventListener("change", () => {
    ids.forEach((id) => {
      const el = document.getElementById(id);
      const handler = captureHandlers.get(id);
      if (captureToggle.checked) {
        el.addEventListener("click", handler, true); // true = capturing phase
      } else {
        el.removeEventListener("click", handler, true);
      }
    });
  });

  document.getElementById("clearLogBtn").addEventListener("click", () => {
    document.getElementById("eventLog").innerHTML = "";
  });
}

// -----------------------------------------------------------------
// Part 2: Event delegation
// -----------------------------------------------------------------
function setupDelegation() {
  const input = document.getElementById("taskInput");
  const list = document.getElementById("taskList");

  function addTask() {
    const text = input.value.trim();
    if (text === "") return;

    const item = document.createElement("li");

    const label = document.createElement("span");
    label.textContent = text;

    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-btn";
    removeBtn.type = "button";
    removeBtn.textContent = "×";

    item.appendChild(label);
    item.appendChild(removeBtn);
    list.appendChild(item);

    input.value = "";
    input.focus();
  }

  document.getElementById("addTaskBtn").addEventListener("click", addTask);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") addTask();
  });

  // ONE listener on the parent <ul> handles every <li> inside it — even
  // ones created above, AFTER this listener was already attached. That
  // only works because a click on a child bubbles up to this parent.
  list.addEventListener("click", (event) => {
    if (event.target.classList.contains("remove-btn")) {
      event.target.closest("li").remove();
      return;
    }
    if (event.target.tagName === "SPAN") {
      event.target.closest("li").classList.toggle("done");
    }
  });
}
