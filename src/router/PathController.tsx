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
import { MonthlyReportPage } from "@/pages/board-sub/MonthlyReportPage";
import { CollegeLeaderReportPage } from "@/pages/board-sub/CollegeLeaderReportPage";
import { PraiseSheetPage } from "@/pages/board-sub/PraiseSheetPage";
import { SpecialSongSheetPage } from "@/pages/board-sub/SpecialSongSheetPage";
import { EventPlanPage } from "@/pages/board-sub/EventPlanPage";
import { EventResultReportPage } from "@/pages/board-sub/EventResultReportPage";
import { NewcomerIndividualReportPage } from "@/pages/board-sub/NewcomerIndividualReportPage";
import { NewcomerWeeklyReportPage } from "@/pages/board-sub/NewcomerWeeklyReportPage";
import { PromotionReportPage } from "@/pages/board-sub/PromotionReportPage";
import { AdvertisementRequestPage } from "@/pages/board-sub/AdvertisementRequestPage";
import { WorshipCommitteePage } from "@/pages/board-sub/WorshipCommitteePage";
import { WorshipScriptPage } from "@/pages/board-sub/WorshipScriptPage";
import { AttendanceReportPage } from "@/pages/board-sub/AttendanceReportPage";
import { ManualCreatePage } from "@/pages/board-sub/ManualCreatePage";
import { ManualContentPage } from "@/pages/board-sub/ManualContentPage";

export const PathController = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/news" replace />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/news" element={<NewsPage />} />
        <Route path="/programme" element={<ProgrammePage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/address" element={<AddressPage />} />
        <Route path="/board">
          <Route path="manual" element={<ManualPage />} />
          <Route path="manual/:id" element={<ManualContentPage />} />
          <Route path="manual/create" element={<ManualCreatePage />} />
          <Route path="monthly-report" element={<MonthlyReportPage />} />
          <Route
            path="college-leader-report"
            element={<CollegeLeaderReportPage daechung={true} />}
          />
          <Route
            path="youth-leader-report"
            element={<CollegeLeaderReportPage daechung={false} />}
          />
          <Route path="praise-sheet" element={<PraiseSheetPage />} />
          <Route path="special-song-sheet" element={<SpecialSongSheetPage />} />
          <Route path="event-plan" element={<EventPlanPage />} />
          <Route path="event-result" element={<EventResultReportPage />} />
          <Route
            path="newcomer-individual"
            element={<NewcomerIndividualReportPage />}
          />
          <Route
            path="newcomer-weekly"
            element={<NewcomerWeeklyReportPage />}
          />
          <Route path="promotion-report" element={<PromotionReportPage />} />
          <Route path="advertisement" element={<AdvertisementRequestPage />} />
          <Route path="worship-committee" element={<WorshipCommitteePage />} />
          <Route path="worship-script" element={<WorshipScriptPage />} />
          <Route path="attendance" element={<AttendanceReportPage />} />
        </Route>
      </Route>
      <Route path="/account" element={<AccountLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="signin" element={<SignUpPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/news" replace />} />
    </Routes>
  );
};
