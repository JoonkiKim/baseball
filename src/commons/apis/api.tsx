import axios from "axios";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "69420",
  },
});

API.interceptors.request.use(
  (config) => {
    if (config.url?.includes("/games")) {
      const isGet = config.method?.toLowerCase() === "get";
      const isResultEndpoint = config.url.endsWith("/result");
      if (!(isGet && isResultEndpoint)) {
        config.withCredentials = true;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
