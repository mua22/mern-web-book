// API-key authentication with roles.
// SHELF_KEYS="k_ada:ada:admin,k_bob:bob"  ->  key:owner[:role]   (role defaults to "member")
import { timingSafeEqual } from "node:crypto";

export const ROLES = ["member", "admin"];

export function parseKeys(spec = "") {
  const keys = new Map();
  for (const pair of spec.split(",").map((s) => s.trim()).filter(Boolean)) {
    const [key, owner, role = "member"] = pair.split(":");
    if (key && owner && ROLES.includes(role)) keys.set(key, { owner, role });
  }
  return keys;
}

const safeEqual = (a, b) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

/** Returns { owner, role } for a request, or null when the key is missing/unknown. */
export function authenticate(keys, headers) {
  const presented = headers["x-api-key"];
  if (typeof presented !== "string" || !presented) return null;
  let found = null;
  for (const [key, identity] of keys) {
    // Check every key (no early exit) so timing does not reveal how many characters matched.
    if (safeEqual(key, presented)) found = identity;
  }
  return found;
}
