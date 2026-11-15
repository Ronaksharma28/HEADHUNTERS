// frontend/js/config.js
const isLocal =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

// Replace the Render URL below once your Render service is created in Step 2
window.BACKEND_BASE_URL = isLocal
  ? "http://127.0.0.1:8000"
  : "https://flame-in-freefall-api.onrender.com";