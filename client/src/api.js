// ======================================================
// API HELPER
// ======================================================

// Backend URL. Set VITE_API_URL in client/.env for deployments.
export const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

// Remove the saved login and tell App to show the login page.
export const clearLogin = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  localStorage.removeItem("user");

  window.dispatchEvent(new Event("auth:logout"));
};

// Build headers with the JWT token (when logged in).
export const authHeaders = (headers = {}) => {
  const token = localStorage.getItem("token");

  return {
    ...headers,
    ...(token && {
      Authorization: `Bearer ${token}`,
    }),
  };
};

// fetch() wrapper that sends JSON + JWT and returns the parsed body.
// Throws an Error with the server's message when the request fails.
export const apiFetch = async (path, options = {}) => {
  const isFormData = options.body instanceof FormData;

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: authHeaders({
      ...(options.body && !isFormData && {
        "Content-Type": "application/json",
      }),
      ...options.headers,
    }),
  });

  const data = await response.json().catch(() => ({}));

  // Expired or invalid token: sign the user out.
  if (
    (response.status === 401 || response.status === 403) &&
    localStorage.getItem("token")
  ) {
    clearLogin();
  }

  if (!response.ok) {
    throw new Error(
      data.message || `Request failed (${response.status})`
    );
  }

  return data;
};
