import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

window.onerror = (msg, src, line, col, err) => {
  document.body.innerHTML = `<div style="padding:32px;font-family:monospace;color:red;background:white;min-height:100vh">
    <h2>Runtime Error</h2>
    <p><b>${msg}</b></p>
    <p>${src}:${line}:${col}</p>
    <pre>${err?.stack || ""}</pre>
  </div>`;
};

window.onunhandledrejection = (e) => {
  document.body.innerHTML = `<div style="padding:32px;font-family:monospace;color:red;background:white;min-height:100vh">
    <h2>Unhandled Promise Rejection</h2>
    <pre>${e.reason?.stack || e.reason || "Unknown error"}</pre>
  </div>`;
};

createRoot(document.getElementById("root")!).render(<App />);
