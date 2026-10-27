const API_BASE = "https://usmanlive.com/wp-json/api/stories";

const TITLE_MIN = 3;
const TITLE_MAX = 80;
const CONTENT_MIN = 10;
const CONTENT_MAX = 500;

// ---------------------------------------------------------------
// Validation — pure functions, no DOM. Each returns an error
// string, or "" when the value is valid. The API itself accepts
// anything (even {}), so these rules are the only real protection
// the data has.
// ---------------------------------------------------------------
function validateTitle(value) {
  const trimmed = value.trim();
  if (trimmed === "") return "Title is required.";
  if (trimmed.length < TITLE_MIN) return `Title must be at least ${TITLE_MIN} characters.`;
  if (trimmed.length > TITLE_MAX) return `Title must be ${TITLE_MAX} characters or fewer.`;
  return "";
}

function validateContent(value) {
  const trimmed = value.trim();
  if (trimmed === "") return "Content is required.";
  if (trimmed.length < CONTENT_MIN) return `Content must be at least ${CONTENT_MIN} characters.`;
  if (trimmed.length > CONTENT_MAX) return `Content must be ${CONTENT_MAX} characters or fewer.`;
  return "";
}

// ---------------------------------------------------------------
// API calls — one small async function per HTTP method, each
// checking response.ok before trusting the result.
// ---------------------------------------------------------------
async function apiGetStories() {
  const response = await fetch(API_BASE);
  if (!response.ok) throw new Error(`Failed to load stories (status ${response.status})`);
  return response.json();
}

async function apiCreateStory(title, content) {
  const response = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, content }),
  });
  if (!response.ok) throw new Error(`Failed to create story (status ${response.status})`);
  return response.json();
}

async function apiUpdateStory(id, title, content) {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, content }),
  });
  if (!response.ok) throw new Error(`Failed to update story ${id} (status ${response.status})`);
  return response.json();
}

async function apiDeleteStory(id) {
  const response = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error(`Failed to delete story ${id} (status ${response.status})`);
  return response.json();
}

// ---------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function renderStories(stories) {
  const list = document.getElementById("storyList");
  list.innerHTML = "";

  if (stories.length === 0) {
    list.innerHTML = '<li class="empty-state">No stories yet — add the first one above.</li>';
    return;
  }

  stories.forEach((story) => {
    const li = document.createElement("li");
    li.className = "story-card";
    li.dataset.id = story.id;
    li.innerHTML = `
      <div class="story-view">
        <h3 class="story-title">${escapeHtml(story.title)}</h3>
        <p class="story-content">${escapeHtml(story.content)}</p>
        <div class="story-actions">
          <button type="button" class="edit-btn">Edit</button>
          <button type="button" class="delete-btn">Delete</button>
        </div>
      </div>
      <div class="story-edit" hidden>
        <div class="field">
          <label>Title</label>
          <input type="text" class="edit-title-input" value="${escapeHtml(story.title)}">
          <p class="field-error edit-title-error"></p>
        </div>
        <div class="field">
          <label>Content</label>
          <textarea class="edit-content-input" rows="3">${escapeHtml(story.content)}</textarea>
          <p class="field-error edit-content-error"></p>
        </div>
        <div class="story-actions">
          <button type="button" class="save-btn">Save</button>
          <button type="button" class="cancel-btn">Cancel</button>
        </div>
      </div>
    `;
    list.appendChild(li);
  });
}

// ---------------------------------------------------------------
// Loading the list
// ---------------------------------------------------------------
async function loadStories() {
  const status = document.getElementById("listStatus");
  const list = document.getElementById("storyList");
  status.textContent = "Loading stories…";
  status.hidden = false;
  list.innerHTML = "";

  try {
    const stories = await apiGetStories();
    status.hidden = true;
    renderStories(stories);
  } catch (error) {
    status.textContent = `Couldn't load stories: ${error.message}`;
    status.hidden = false;
  }
}

// ---------------------------------------------------------------
// Create
// ---------------------------------------------------------------
function setupCreateForm() {
  const form = document.getElementById("storyForm");
  const titleInput = document.getElementById("titleInput");
  const contentInput = document.getElementById("contentInput");
  const titleError = document.getElementById("titleError");
  const contentError = document.getElementById("contentError");
  const submitBtn = document.getElementById("submitBtn");
  const formStatus = document.getElementById("formStatus");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const titleMsg = validateTitle(titleInput.value);
    const contentMsg = validateContent(contentInput.value);
    titleError.textContent = titleMsg;
    contentError.textContent = contentMsg;
    titleInput.classList.toggle("invalid", Boolean(titleMsg));
    contentInput.classList.toggle("invalid", Boolean(contentMsg));

    if (titleMsg || contentMsg) {
      formStatus.textContent = "";
      return;
    }

    submitBtn.disabled = true;
    formStatus.textContent = "Saving…";
    formStatus.className = "form-status";

    try {
      await apiCreateStory(titleInput.value.trim(), contentInput.value.trim());
      form.reset();
      titleInput.classList.remove("invalid");
      contentInput.classList.remove("invalid");
      formStatus.textContent = "Story added.";
      formStatus.className = "form-status success";
      await loadStories();
    } catch (error) {
      formStatus.textContent = error.message;
      formStatus.className = "form-status error";
    } finally {
      submitBtn.disabled = false;
    }
  });
}

// ---------------------------------------------------------------
// Edit / Delete — one delegated listener on the list handles every
// card, including ones that didn't exist when the page first loaded.
// ---------------------------------------------------------------
function setupListDelegation() {
  const list = document.getElementById("storyList");

  list.addEventListener("click", async (event) => {
    const card = event.target.closest(".story-card");
    if (!card) return;
    const id = card.dataset.id;

    if (event.target.classList.contains("edit-btn")) {
      card.querySelector(".story-view").hidden = true;
      card.querySelector(".story-edit").hidden = false;
      return;
    }

    if (event.target.classList.contains("cancel-btn")) {
      card.querySelector(".story-view").hidden = false;
      card.querySelector(".story-edit").hidden = true;
      return;
    }

    if (event.target.classList.contains("save-btn")) {
      const titleInput = card.querySelector(".edit-title-input");
      const contentInput = card.querySelector(".edit-content-input");
      const titleError = card.querySelector(".edit-title-error");
      const contentError = card.querySelector(".edit-content-error");

      const titleMsg = validateTitle(titleInput.value);
      const contentMsg = validateContent(contentInput.value);
      titleError.textContent = titleMsg;
      contentError.textContent = contentMsg;
      titleInput.classList.toggle("invalid", Boolean(titleMsg));
      contentInput.classList.toggle("invalid", Boolean(contentMsg));
      if (titleMsg || contentMsg) return;

      const saveBtn = event.target;
      saveBtn.disabled = true;
      saveBtn.textContent = "Saving…";

      try {
        await apiUpdateStory(id, titleInput.value.trim(), contentInput.value.trim());
        await loadStories();
      } catch (error) {
        contentError.textContent = error.message;
        saveBtn.disabled = false;
        saveBtn.textContent = "Save";
      }
      return;
    }

    if (event.target.classList.contains("delete-btn")) {
      const title = card.querySelector(".story-title").textContent;
      const confirmed = window.confirm(`Delete "${title}"? This can't be undone.`);
      if (!confirmed) return;

      event.target.disabled = true;
      event.target.textContent = "Deleting…";

      try {
        await apiDeleteStory(id);
        await loadStories();
      } catch (error) {
        window.alert(error.message);
        event.target.disabled = false;
        event.target.textContent = "Delete";
      }
    }
  });
}

// ---------------------------------------------------------------
// Live validation feedback as the visitor types, plus startup.
// ---------------------------------------------------------------
function setupLiveValidation() {
  const titleInput = document.getElementById("titleInput");
  const contentInput = document.getElementById("contentInput");

  titleInput.addEventListener("input", () => {
    const msg = validateTitle(titleInput.value);
    document.getElementById("titleError").textContent = titleInput.value === "" ? "" : msg;
    titleInput.classList.toggle("invalid", Boolean(msg) && titleInput.value !== "");
  });

  contentInput.addEventListener("input", () => {
    const msg = validateContent(contentInput.value);
    document.getElementById("contentError").textContent = contentInput.value === "" ? "" : msg;
    contentInput.classList.toggle("invalid", Boolean(msg) && contentInput.value !== "");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupCreateForm();
  setupListDelegation();
  setupLiveValidation();
  document.getElementById("refreshBtn").addEventListener("click", loadStories);
  loadStories();
});
