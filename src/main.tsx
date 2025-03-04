import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerSW } from "virtual:pwa-register";

// // Register Service Worker
// if ("serviceWorker" in navigator) {
//   window.addEventListener("load", () => {
//     navigator.serviceWorker
//       .register("/serviceWorker.js")
//       .then((reg) => console.log("Service Worker registered!", reg))
//       .catch((err) => console.error("Service Worker registration failed!", err));
//   });
// }


const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm("New version available. Reload?")) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log("PWA is ready to work offline");
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
