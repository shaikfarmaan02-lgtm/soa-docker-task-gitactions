import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export function getApiErrorMessage(error) {
  const data = error.response?.data;

  if (typeof data === 'string' && data.trim()) {
    return data;
  }

  if (data && typeof data === 'object') {
    const fieldMessages = Array.isArray(data.errors)
      ? data.errors
          .map((item) => item.defaultMessage || item.message)
          .filter(Boolean)
      : [];

    const detail =
      data.message ||
      data.detail ||
      data.title ||
      (fieldMessages.length ? fieldMessages.join(' ') : '');

    if (detail) {
      return detail;
    }

    if (data.errors && typeof data.errors === 'object') {
      const messages = Object.values(data.errors)
        .flat()
        .filter((message) => typeof message === 'string');

      if (messages.length) {
        return messages.join(' ');
      }
    }
  }

  if (error.response) {
    return `The server returned an error (${error.response.status}). Please review the license details and try again.`;
  }

  if (error.request) {
    return 'Could not reach the backend. Make sure the Spring Boot service is running at http://localhost:8081.';
  }

  return error.message || 'Something went wrong. Please try again.';
}

export default api;
