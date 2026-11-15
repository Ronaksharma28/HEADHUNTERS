const isLocal =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

window.BACKEND_BASE_URL = isLocal
  ? "http://127.0.0.1:8000"
  : "https://flame-in-freefall-api-k7wl.onrender.com";