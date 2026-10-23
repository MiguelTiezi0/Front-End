export const API_BASE =
  process.env.REACT_APP_API_BASE || "http://localhost:8080";

/** Fetch com JWT injetado automaticamente e Content-Type JSON. */
export function apiFetch(path, options = {}) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token;
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };
  return fetch(`${API_BASE}${path}`, { ...options, headers });
}

// Patch global fetch — injeta JWT em todas as chamadas para o back-end Java
// (cobre fetch(linkXxx) usados nos componentes sem precisar alterar cada um)
const _origFetch = window.fetch.bind(window);
window.fetch = function jwtFetch(input, init = {}) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token;
  const isApiCall =
    typeof input === "string" && input.includes(":8080");
  if (token && isApiCall) {
    init = {
      ...init,
      headers: {
        ...(init.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    };
  }
  return _origFetch(input, init);
};
