import axios from "axios";

const API = axios.create({
  // baseURL: process.env.NEXT_PUBLIC_API_URL,

  baseURL: "https://2794-175-198-90-105.ngrok-free.app",
  //
  headers: {
    "Content-Type": "application/json",
  },
});

export default API;
