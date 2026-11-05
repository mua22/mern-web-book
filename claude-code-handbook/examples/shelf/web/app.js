import { formErrors, renderState } from "./ui.js";

const $ = (s) => document.querySelector(s);
let apiKey = sessionStorage.getItem("shelf-key") ?? "";
$("#key").value = apiKey;

const headers = () => ({ "content-type": "application/json", ...(apiKey ? { "x-api-key": apiKey } : {}) });

async function load() {
  $("#list").innerHTML = renderState({ loading: true });
  try {
    const res = await fetch("/books?sort=title", { headers: headers() });
    if (!res.ok) throw new Error(res.status === 401 ? "Enter a valid API key." : `Server said ${res.status}`);
    $("#list").innerHTML = renderState({ books: await res.json() });
  } catch (e) {
    $("#list").innerHTML = renderState({ error: e.message });
  }
}

$("#key").addEventListener("change", (e) => {
  apiKey = e.target.value.trim();
  sessionStorage.setItem("shelf-key", apiKey);
  load();
});

$("#add").addEventListener("submit", async (e) => {
  e.preventDefault();
  const values = Object.fromEntries(new FormData(e.target));
  const errors = formErrors(values);
  for (const f of ["title", "author", "pages"]) $(`#err-${f}`).textContent = errors[f] ?? "";
  if (Object.keys(errors).length) return; // stop here: no request for obviously bad input
  const body = Object.fromEntries(Object.entries(values).filter(([, v]) => v !== ""));
  if (body.pages) body.pages = Number(body.pages);
  const res = await fetch("/books", { method: "POST", headers: headers(), body: JSON.stringify(body) });
  if (res.ok) { e.target.reset(); load(); }
  else $("#err-form").textContent = (await res.json()).errors?.join(", ") ?? "Could not save.";
});

load();
