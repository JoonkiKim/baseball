// libs/api.tsx
import axios, { AxiosError, AxiosRequestConfig } from "axios";
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "../libraries/token";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: false, // refreshToken 쿠키 전송
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use(
  (config) => {
    // ── 1) games 관련 withCredentials 로직 유지 ──
    const method = config.method?.toLowerCase();
    const url = config.url ?? "";
    if (url.includes("/games")) {
      const isGet = method === "get";
      const isResultEndpoint = url.endsWith("/result");
      if (!(isGet && isResultEndpoint)) {
        config.withCredentials = false;
      }
    }

    // ── 2) 메모리 액세스 토큰을 Authorization 헤더에 주입 ──
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (res) => res,
  async (
    error: AxiosError & { config?: AxiosRequestConfig & { _retry?: boolean } }
  ) => {
    const originalReq = error.config!;
    if (error.response?.status === 401 && !originalReq._retry) {
      originalReq._retry = true;
      try {
        // refreshToken 쿠키로 새 accessToken 요청
        const { data } = await API.post(`/auth/refresh`);
        setAccessToken(data.accessToken);

        // 원래 요청 헤더에 새 토큰 세팅 후 재시도
        if (originalReq.headers) {
          originalReq.headers.Authorization = `Bearer ${data.accessToken}`;
        }
        return API(originalReq);
      } catch {
        // 리프레시 실패 시 토큰 초기화 & 로그인 페이지로 이동
        clearAccessToken();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default API;
