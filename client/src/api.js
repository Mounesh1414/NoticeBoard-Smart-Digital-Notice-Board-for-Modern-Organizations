const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function getApiUrl() {
  return API_URL;
}

export function getToken() {
  return localStorage.getItem('noticeboard_token');
}

export function setSession(token, user) {
  localStorage.setItem('noticeboard_token', token);
  localStorage.setItem('noticeboard_user', JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem('noticeboard_token');
  localStorage.removeItem('noticeboard_user');
}

export function getStoredUser() {
  const value = localStorage.getItem('noticeboard_user');
  return value ? JSON.parse(value) : null;
}

export async function apiRequest(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  const token = getToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  if (!isFormData && options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    throw new Error(data?.message || 'Request failed');
  }

  return data;
}
