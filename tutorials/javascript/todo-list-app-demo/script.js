// Every task is an object: { id, text, done }. This array is the one
// "source of truth" for the whole app — the <ul> on screen is always
// rebuilt FROM this array, never edited directly.
let tasks = [];
let nextId = 1;

// Called by the <form>'s onsubmit="addTask(event)" attribute.
function addTask(event) {
  // A form's default behavior is to submit itself to a server and reload
  // the page. event.preventDefault() cancels that default, so this page
  // can handle the submission itself instead.
  event.preventDefault();

  const input = document.getElementById("taskInput");
  const text = input.value.trim();

  if (text === "") {
    return;
  }

  tasks.push({ id: nextId, text: text, done: false });
  nextId = nextId + 1;

  input.value = "";
  renderTasks();
}

// Called by a task's onclick="toggleTask(ID)" attribute — built dynamically
// for each task inside renderTasks() below.
function toggleTask(id) {
  const task = tasks.find(function (t) {
    return t.id === id;
  });

  if (task) {
    task.done = !task.done;
  }

  renderTasks();
}

// Called by a task's onclick="deleteTask(ID)" attribute.
function deleteTask(id) {
  tasks = tasks.filter(function (t) {
    return t.id !== id;
  });

  renderTasks();
}

// Called by the "Clear Completed" button's onclick="clearCompleted()" attribute.
function clearCompleted() {
  tasks = tasks.filter(function (t) {
    return !t.done;
  });

  renderTasks();
}

// Rebuilds the entire <ul> from the tasks array. Every function above ends
// by calling this — rather than trying to patch the list in place, it's
// simplest to clear it out and build it fresh every single time.
function renderTasks() {
  const list = document.getElementById("taskList");
  list.innerHTML = "";

  if (tasks.length === 0) {
    const message = document.createElement("li");
    message.className = "empty-message";
    message.textContent = "Nothing here yet — add your first task above.";
    list.appendChild(message);
  }

  tasks.forEach(function (task) {
    const li = document.createElement("li");
    li.className = task.done ? "done" : "";

    const span = document.createElement("span");
    span.textContent = task.text;
    span.setAttribute("onclick", "toggleTask(" + task.id + ")");

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.setAttribute("onclick", "deleteTask(" + task.id + ")");

    li.appendChild(span);
    li.appendChild(deleteBtn);
    list.appendChild(li);
  });

  const remaining = tasks.filter(function (t) {
    return !t.done;
  }).length;

  const label = remaining === 1 ? "task" : "tasks";
  document.getElementById("taskSummary").textContent = remaining + " " + label + " left";
}

// Draw the list once when the page first loads, so the "Nothing here yet"
// message shows immediately — this isn't bound to any event, it's just the
// next line of the script, which runs the moment the browser reaches it.
renderTasks();
