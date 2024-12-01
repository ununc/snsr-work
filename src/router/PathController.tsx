import { Routes, Route, Navigate } from "react-router-dom";
import { CalendarPage } from "@/pages/CalendarPage";
import { ProgrammePage } from "@/pages/ProgrammePage";
import { AddressPage } from "@/pages/AddressPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { LoginPage } from "@/pages/LoginPage";
import { SignUpPage } from "@/pages/SignUpPage";
import { AccountLayout } from "@/layouts/AccountLayout";
import { BoardPage } from "@/pages/BoardPage";
import { NewsPage } from "@/pages/NewsPage";

export const PathController = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/news" replace />} />
      <Route
        path="/news"
        element={
          <ProtectedRoute>
            <NewsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/programme"
        element={
          <ProtectedRoute>
            <ProgrammePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar"
        element={
          <ProtectedRoute>
            <CalendarPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/address"
        element={
          <ProtectedRoute>
            <AddressPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/board"
        element={
          <ProtectedRoute>
            <BoardPage />
          </ProtectedRoute>
        }
      />
      <Route path="/account" element={<AccountLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="signin" element={<SignUpPage />} />
      </Route>
    </Routes>
  );
};
