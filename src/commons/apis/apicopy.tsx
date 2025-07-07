// import axios from "axios";

// const APIpre = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_URL,
//   headers: {
//     "Content-Type": "application/json",
//     // "ngrok-skip-browser-warning": "69420",
//   },
// });

// APIpre.interceptors.request.use(
//   (config) => {
//     const method = config.method?.toLowerCase();
//     const url = config.url ?? "";

//     // games 관련 요청은 기존 로직 유지
//     if (url.includes("/games")) {
//       const isGet = method === "get";
//       const isResultEndpoint = url.endsWith("/result");
//       if (!(isGet && isResultEndpoint)) {
//         config.withCredentials = false;
//       }
//     }

//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// export default API;
