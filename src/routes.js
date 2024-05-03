import { Navigate, useRoutes, Routes, Route } from "react-router-dom";

// layouts
import DashboardLayout from "./layouts/dashboard/DashboardLayout";
import ProtectedRoute from "./layouts/ProtectedRoute";
import OpinionPollSurveyPage from "./pages/OpinionPollSurveyPage";


const Router = () => {
  return (
    <Routes>

    
        <Route path="" element={<DashboardLayout />}>


          <Route path="/" element={<OpinionPollSurveyPage />} />

        </Route>







      {/* <Route path="*" element={<Navigate to="/404" replace />} /> */}
    </Routes>
  );
};

export default Router;
