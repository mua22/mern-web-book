// Tiny schema validation: no dependencies, returns { ok, value } or { ok:false, errors }.
const STATUSES = ["to-read", "reading", "done"];

export function validateBook(input, { partial = false } = {}) {
  const errors = [];
  const out = {};
  const body = input && typeof input === "object" && !Array.isArray(input) ? input : null;
  if (!body) return { ok: false, errors: ["body must be a JSON object"] };

  const rules = {
    title: (v) => typeof v === "string" && v.trim().length > 0 && v.length <= 200,
    author: (v) => typeof v === "string" && v.trim().length > 0 && v.length <= 120,
    status: (v) => STATUSES.includes(v),
    pages: (v) => Number.isInteger(v) && v > 0 && v <= 10000,
    rating: (v) => Number.isInteger(v) && v >= 1 && v <= 5,
    notes: (v) => typeof v === "string" && v.length <= 2000,
  };
  const required = ["title", "author"];

  for (const key of Object.keys(body)) {
    if (!(key in rules)) errors.push(`unknown field "${key}"`);
  }
  for (const [key, check] of Object.entries(rules)) {
    if (key in body) {
      if (!check(body[key])) errors.push(`invalid "${key}"`);
      else out[key] = typeof body[key] === "string" ? body[key].trim() : body[key];
    } else if (!partial && required.includes(key)) {
      errors.push(`"${key}" is required`);
    }
  }
  // Business rule: only finished books can carry a rating.
  // On create, a missing status means the default "to-read"; on partial updates it is unknown here.
  const status = out.status ?? (partial ? undefined : "to-read");
  if ("rating" in out && status !== undefined && status !== "done") {
    errors.push('"rating" is only allowed when status is "done"');
  }
  return errors.length ? { ok: false, errors } : { ok: true, value: out };
}

export { STATUSES };
