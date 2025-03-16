const withPWA = require("next-pwa")({
  dest: "public", // PWA 리소스 저장 위치
  register: true, // 서비스 워커 자동 등록
  skipWaiting: true, // 새로운 서비스 워커 즉시 적용
  disable: process.env.NODE_ENV === "development", // 개발 환경에서는 PWA 비활성화
});

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  webpack: (config, { isServer }) => {
    if (isServer) {
      console.log("🔄 Compiling sw.ts to sw.js...");
      try {
        execSync("tsc src/service-worker/sw.ts --outDir public", {
          stdio: "inherit",
        });
        console.log("✅ sw.ts successfully compiled to sw.js");
      } catch (error) {
        console.error("❌ Error compiling sw.ts:", error);
      }
    }
    return config;
  },
};

// HTTPS 환경 설정 (개발 환경에서만 적용)
if (process.env.NODE_ENV === "development") {
  console.log("🚀 Enabling HTTPS for development mode...");

  const keyPath = path.resolve(__dirname, "cert.key");
  const certPath = path.resolve(__dirname, "cert.crt");
  const caPath = path.resolve(__dirname, "ca.crt");

  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    nextConfig.devServer = {
      https: {
        key: fs.readFileSync(keyPath), // 인증서 개인 키 적용
        cert: fs.readFileSync(certPath), // 인증서 파일 적용
        ca: fs.existsSync(caPath) ? fs.readFileSync(caPath) : undefined, // CA 인증서가 있으면 적용
      },
    };
    console.log("✅ HTTPS successfully enabled!");
    console.log("🔍 현재 환경 변수 확인:", process.env);
  } else {
    console.warn("⚠️ HTTPS 인증서(cert.key, cert.crt)가 존재하지 않습니다.");
  }
}

module.exports = withPWA(nextConfig);
