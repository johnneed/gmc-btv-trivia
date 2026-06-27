import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { adminStore } from "./store";
import App from "./app";

const container = document.getElementById("trail-trivia-admin-root");
if (!container) throw new Error("Admin root element not found");

createRoot(container).render(
    <React.StrictMode>
        <Provider store={adminStore}>
            <App />
        </Provider>
    </React.StrictMode>
);
