import axios from "axios";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// /games 요청에만 credentials 붙이기 (단, GET & …/result 로 끝나면 예외)
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
