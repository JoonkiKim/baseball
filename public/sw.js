// // public/sw.js
// importScripts(
//   "https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js"
// );

// const CACHE = "offline-v1";
// const OFFLINE_URL = "/offline.html";

// // self.addEventListener("install", (event) => {
// //   event.waitUntil(caches.open(CACHE).then((c) => c.addAll([OFFLINE_URL])));
// //   self.skipWaiting();
// // });

// import { precacheAndRoute, offlineFallback } from "workbox-recipes";
// precacheAndRoute(self.__WB_MANIFEST); // 빌드 자동 주입
// offlineFallback({ pageFallback: "/offline.html" });

// workbox.navigationPreload.enable();

// self.addEventListener("install", (event) => {
//   const OFFLINE_URL = "/offline.html";
//   event.waitUntil(
//     caches.open(CACHE).then(async (cache) => {
//       try {
//         await cache.addAll([OFFLINE_URL]); // 존재하는 파일만
//       } catch (e) {
//         console.error("❌ precache failed:", e); // 디버그용
//       }
//     })
//   );
// });

// sw.js (public/sw.js)
const CACHE = "v1";
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then(async (cache) => {
      try {
        await cache.add(OFFLINE_URL); // addAll X, add 1개만
      } catch (err) {
        console.error("❌ precache fail:", err);
      }
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_URL))
    );
  }
});

// self.addEventListener("fetch", (event) => {
//   if (event.request.mode === "navigate") {
//     event.respondWith(
//       (async () => {
//         try {
//           const preload = await event.preloadResponse;
//           if (preload) return preload;

//           const network = await fetch(event.request);
//           return network;
//         } catch {
//           const cache = await caches.open(CACHE);
//           return await cache.match(OFFLINE_URL);
//         }
//       })()
//     );
//   }
// });

// // This is the "Offline page" service worker

// importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

// const CACHE = "pwabuilder-page";

// // TODO: replace the following with the correct offline fallback page i.e.: const offlineFallbackPage = "offline.html";
// const offlineFallbackPage = "ToDo-replace-this-name.html";

// self.addEventListener("message", (event) => {
//   if (event.data && event.data.type === "SKIP_WAITING") {
//     self.skipWaiting();
//   }
// });

// self.addEventListener('install', async (event) => {
//   event.waitUntil(
//     caches.open(CACHE)
//       .then((cache) => cache.add(offlineFallbackPage))
//   );
// });

// if (workbox.navigationPreload.isSupported()) {
//   workbox.navigationPreload.enable();
// }

// self.addEventListener('fetch', (event) => {
//   if (event.request.mode === 'navigate') {
//     event.respondWith((async () => {
//       try {
//         const preloadResp = await event.preloadResponse;

//         if (preloadResp) {
//           return preloadResp;
//         }

//         const networkResp = await fetch(event.request);
//         return networkResp;
//       } catch (error) {

//         const cache = await caches.open(CACHE);
//         const cachedResp = await cache.match(offlineFallbackPage);
//         return cachedResp;
//       }
//     })());
//   }
// });
