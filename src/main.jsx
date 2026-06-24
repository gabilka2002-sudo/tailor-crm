import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { CrmProvider } from "./context/CrmContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ToastProvider>
      <CrmProvider>
        <App />
      </CrmProvider>
    </ToastProvider>
  </StrictMode>
);