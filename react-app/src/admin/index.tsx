import React from "react";
import { createRoot } from "react-dom/client";
import "./admin.css";
import { Provider } from "react-redux";
import { adminStore } from "./store";
import App from "./app";

// Debugging helper
(window as any).ttDebug = () => {
    console.log("Current Admin Store State:", adminStore.getState());
};
console.log("Trail Trivia Admin Initialized. Type ttDebug() to inspect state.");

const container = document.getElementById("trail-trivia-admin-root");
if (!container) throw new Error("Admin root element not found");

createRoot(container).render(
    <React.StrictMode>
        <Provider store={adminStore}>
            <App />
        </Provider>
    </React.StrictMode>
);
