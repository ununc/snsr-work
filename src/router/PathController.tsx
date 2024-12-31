import { Routes, Route, Navigate } from "react-router-dom";
import { CalendarPage } from "@/pages/CalendarPage";
import { ProgrammePage } from "@/pages/ProgrammePage";
import { AddressPage } from "@/pages/AddressPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { LoginPage } from "@/pages/LoginPage";
import { SignUpPage } from "@/pages/SignUpPage";
import { AccountLayout } from "@/layouts/AccountLayout";
import { NewsPage } from "@/pages/NewsPage";
import { ManualPage } from "@/pages/board-sub/ManualPage";
import { CollegeLeaderReportPage } from "@/pages/board-sub/CollegeLeaderReportPage";
import { SongPage } from "@/pages/board-sub/SongPage";
import { BoardPage } from "@/pages/BoardPage";

export const PathController = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/calendar" replace />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/news" element={<NewsPage />} />
        <Route path="/programme" element={<ProgrammePage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/address" element={<AddressPage />} />
        <Route path="/board">
          <Route path="manual" element={<ManualPage boardId="manual" />} />
          <Route
            path="monthly-report"
            element={<BoardPage boardId="monthly-report" />}
          />
          <Route
            path="college-leader-report"
            element={<CollegeLeaderReportPage daechung={true} />}
          />
          <Route
            path="youth-leader-report"
            element={<CollegeLeaderReportPage daechung={false} />}
          />
          <Route path="praise-sheet" element={<SongPage kind={true} />} />
          <Route
            path="special-song-sheet"
            element={<SongPage kind={false} />}
          />
          <Route
            path="event-plan"
            element={<BoardPage boardId="event-plan" />}
          />
          <Route
            path="event-result"
            element={<BoardPage boardId="event-result" />}
          />
          <Route
            path="newcomer-individual"
            element={<BoardPage boardId="newcomer-individual" />}
          />
          <Route
            path="newcomer-weekly"
            element={<BoardPage boardId="newcomer-weekly" />}
          />
          <Route
            path="promotion-report"
            element={<BoardPage boardId="promotion-report" />}
          />
          <Route
            path="advertisement"
            element={<BoardPage boardId="advertisement" />}
          />
          <Route
            path="worship-committee"
            element={<BoardPage boardId="worship-committee" />}
          />
          <Route
            path="worship-script"
            element={<BoardPage boardId="worship-script" />}
          />
        </Route>
      </Route>
      <Route path="/account" element={<AccountLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="signin" element={<SignUpPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/calendar" replace />} />
    </Routes>
  );
};
