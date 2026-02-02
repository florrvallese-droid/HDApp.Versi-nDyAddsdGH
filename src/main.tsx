import { createRoot } from "react-dom/client";
import App from "./App";
import "./globals.css";

// VitePWA se encarga del registro del Service Worker automáticamente
createRoot(document.getElementById("root")!).render(<App />);