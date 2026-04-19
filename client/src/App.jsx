import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from './admin/layouts/AdminLayout.jsx';
import AdminContentPage from './admin/pages/AdminContentPage.jsx';
import AdminDashboardPage from './admin/pages/AdminDashboardPage.jsx';
import AdminLoginPage from './admin/pages/AdminLoginPage.jsx';
import AdminPaymentsPage from './admin/pages/AdminPaymentsPage.jsx';
import AdminStudentsPage from './admin/pages/AdminStudentsPage.jsx';
import AdminUsersPage from './admin/pages/AdminUsersPage.jsx';
import StudentLayout from './layouts/StudentLayout.jsx';
import CoursesPage from './pages/CoursesPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import HelpDeskPage from './pages/HelpDeskPage.jsx';
import KnowledgeHubPage from './pages/KnowledgeHubPage.jsx';
import MaterialsPage from './pages/MaterialsPage.jsx';
import PolicyPage from './pages/PolicyPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import RecordingsPage from './pages/RecordingsPage.jsx';
import ResultsPage from './pages/ResultsPage.jsx';
import SchedulePage from './pages/SchedulePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="students" element={<AdminStudentsPage />} />
          <Route path="content" element={<AdminContentPage />} />
          <Route path="payments" element={<AdminPaymentsPage />} />
        </Route>

        {/* Student */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<StudentLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="courses" element={<CoursesPage />} />
          <Route path="materials" element={<MaterialsPage />} />
          <Route path="knowledge-hub" element={<KnowledgeHubPage />} />
          <Route path="schedule" element={<SchedulePage />} />
          <Route path="recordings" element={<RecordingsPage />} />
          <Route path="results" element={<ResultsPage />} />
          <Route path="policy" element={<PolicyPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="help" element={<HelpDeskPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
