import axios from "axios";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
    // "ngrok-skip-browser-warning": "69420",
  },
});

API.interceptors.request.use(
  (config) => {
    const method = config.method?.toLowerCase();
    const url = config.url ?? "";

    // GET요청이고 /auth/me인 경우 withCredentials 제외
    if (method === "get" && url.includes("/auth/me")) {
      config.withCredentials = true;
      return config;
    }

    // games 관련 요청은 기존 로직 유지
    if (url.includes("/games")) {
      const isGet = method === "get";
      const isResultEndpoint = url.endsWith("/result");
      if (!(isGet && isResultEndpoint)) {
        config.withCredentials = true;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
