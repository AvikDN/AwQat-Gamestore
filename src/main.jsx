import React from "react";
import ReactDOM from "react-dom/client";
import AppRoutes from "./routes/AppRoutes";
import "./index.css";
import { BrowserRouter } from "react-router";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from './contexts/CartContext';

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);