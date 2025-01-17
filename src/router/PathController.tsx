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
import { BoardPage } from "@/pages/BoardPage";
import { LiturgyPage } from "@/pages/posts/LiturgyPage";
import { PraisePage } from "@/pages/posts/PraisePage";
import { LiturgistsPage } from "@/pages/posts/LiturgistsPage";
import { CongregationPage } from "@/pages/posts/CongregationPage";
import { AdvertisementPage } from "@/pages/posts/AdvertisementPage";
import { NewcomerPage } from "@/pages/posts/NewcomerPage";
import { AbsenteeismPage } from "@/pages/posts/AbsenteeismPage";
import { PromotionPage } from "@/pages/posts/PromotionPage";

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
          <Route path="liturgy" element={<LiturgyPage boardId="liturgy" />} />
          <Route path="praise" element={<PraisePage boardId="praise" />} />
          <Route
            path="liturgists"
            element={<LiturgistsPage boardId="liturgists" />}
          />
          <Route
            path="congregation"
            element={<CongregationPage boardId="congregation" />}
          />
          <Route
            path="advertisement"
            element={<AdvertisementPage boardId="advertisement" />}
          />
          <Route
            path="newcomer"
            element={<NewcomerPage boardId="newcomer" />}
          />
          <Route
            path="absenteeism"
            element={<AbsenteeismPage boardId="absenteeism" />}
          />

          <Route
            path="promotion"
            element={<PromotionPage boardId="promotion" />}
          />
          {/*  */}
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
          <Route
            path="event-plan"
            element={<BoardPage boardId="event-plan" />}
          />
          <Route
            path="event-result"
            element={<BoardPage boardId="event-result" />}
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
