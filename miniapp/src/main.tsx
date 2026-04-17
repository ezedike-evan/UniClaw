import React from "react";
import ReactDOM from "react-dom/client";
import "@telegram-apps/telegram-ui/dist/styles.css";
import App from "./App";
import "./styles/globals.css";

const root = document.getElementById("root");
if (!root) throw new Error("#root element not found");

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
