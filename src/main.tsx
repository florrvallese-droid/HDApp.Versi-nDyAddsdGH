import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";

// Check if SW registration is needed here or handled by plugin-generated code.
// VitePWA 'autoUpdate' usually injects the registration script.

createRoot(document.getElementById("root")!).render(<App />);