export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

let _refreshing = null;

async function _refresh() {
  const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Session expired");
}

export async function apiRequest(path, options = {}, _retry = false) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  const isAuthEndpoint = path === "/auth/login" || path === "/auth/refresh";

  if (response.status === 401 && !isAuthEndpoint) {
    if (!_retry) {
      try {
        if (!_refreshing) _refreshing = _refresh().finally(() => { _refreshing = null; });
        await _refreshing;
        return apiRequest(path, options, true);
      } catch {
        // refresh failed — fall through to redirect
      }
    }
    // Either refresh failed or the retry also returned 401 — kick to login
    localStorage.removeItem("authToken");
    window.location.href = "/login";
    return new Promise(() => {}); // never resolves; page is navigating away
  }

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export const loginAdmin = ({ email, password }) =>
  apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const logoutAdmin = () => apiRequest("/auth/logout", { method: "POST" });
