// Keeps track of how many times the "Greet Me" button has been clicked.
let clickCount = 0;

// Called by the <input>'s oninput="updatePreview()" attribute every time
// the visitor types a character.
function updatePreview() {
  const input = document.getElementById("nameInput");
  const previewName = document.getElementById("previewName");
  const name = input.value;

  if (name === "") {
    previewName.textContent = "...";
  } else {
    previewName.textContent = name;
  }
}

// Called by the button's onclick="greetUser()" attribute.
function greetUser() {
  const input = document.getElementById("nameInput");
  const greeting = document.getElementById("greeting");
  const name = input.value.trim();

  clickCount = clickCount + 1;
  document.getElementById("clickCount").textContent = clickCount;

  if (name === "") {
    greeting.textContent = "Please type your name first!";
  } else {
    greeting.textContent = "Hello, " + name + "! Welcome to JavaScript.";
  }
}

// Called by the <select>'s onchange="changeTheme()" attribute.
function changeTheme() {
  const select = document.getElementById("themeSelect");
  const color = select.value;
  document.documentElement.style.setProperty("--color-primary", color);
}

// Called by the button's onclick="toggleDarkMode()" attribute.
function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  const btn = document.getElementById("darkModeBtn");

  if (document.body.classList.contains("dark-mode")) {
    btn.textContent = "Turn Off Dark Mode";
  } else {
    btn.textContent = "Turn On Dark Mode";
  }
}
