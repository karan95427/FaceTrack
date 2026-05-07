import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./App.jsx";
import EnrollmentPage from "./pages/EnrollmentPage.jsx";
import LiveDetectionPage from "./pages/LiveDetectionPage.jsx";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/enrollment" replace />} />
          <Route path="/enrollment" element={<EnrollmentPage />} />
          <Route path="/live" element={<LiveDetectionPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
