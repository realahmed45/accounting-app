import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import { AccountProvider } from "./context/AccountContext";
import { NotificationProvider } from "./context/NotificationContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <AccountProvider>
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </AccountProvider>
  </AuthProvider>,
);
