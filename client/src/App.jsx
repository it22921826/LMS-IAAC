import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
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
