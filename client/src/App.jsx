import { Routes, Route } from 'react-router-dom';

// Public dynamic portfolio
import DynamicPortfolio from './components/DynamicPortfolio';
import NoPortfolio from './components/NoPortfolio';

// Standalone pages
import ExperiencePage from './pages/ExperiencePage';
import ProjectsPage from './pages/ProjectsPage';
import CaseStudyPage from './pages/CaseStudyPage';

// Admin imports
import Login from './components/admin/Login';
import ProtectedRoute from './components/admin/ProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';

// Admin Views
import Dashboard from './components/admin/Dashboard';
import ProjectsList from './components/admin/ProjectsList';
import ProjectForm from './components/admin/ProjectForm';
import ExperienceList from './components/admin/ExperienceList';
import ExperienceForm from './components/admin/ExperienceForm';
import ProfileForm from './components/admin/ProfileForm';
import SkillsList from './components/admin/SkillsList';
import MessagesList from './components/admin/MessagesList';
import MoreHub from './components/admin/MoreHub';
import Settings from './components/admin/Settings';
import UsersList from './components/admin/UsersList';

function App() {
  return (
    <Routes>
      {/* 1. Admin Login (Public) */}
      <Route path="/admin" element={<Login />} />
      
      {/* 2. Protected Admin Dashboard */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/messages" element={<MessagesList />} />
          <Route path="/admin/profile" element={<ProfileForm />} />
          
          <Route path="/admin/projects" element={<ProjectsList />} />
          <Route path="/admin/projects/new" element={<ProjectForm />} />
          <Route path="/admin/projects/:id" element={<ProjectForm />} />
          
          <Route path="/admin/experience" element={<ExperienceList />} />
          <Route path="/admin/experience/new" element={<ExperienceForm />} />
          <Route path="/admin/experience/:id" element={<ExperienceForm />} />

          <Route path="/admin/skills" element={<SkillsList />} />
          <Route path="/admin/more" element={<MoreHub />} />
          <Route path="/admin/users" element={<UsersList />} />
          <Route path="/admin/settings" element={<Settings />} />
        </Route>
      </Route>

      {/* 3. Multi-Tenant User Sub-Pages (e.g. /kunal1/projects, /kartik/projects) */}
      <Route path="/:username/projects" element={<ProjectsPage />} />
      <Route path="/:username/experience" element={<ExperiencePage />} />
      <Route path="/:username/case-study/:slug" element={<CaseStudyPage />} />

      {/* Legacy / default aliases */}
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/experience" element={<ExperiencePage />} />
      <Route path="/case-study/:slug" element={<CaseStudyPage />} />

      {/* 4. Explicit portfolio route (e.g. /portfolio/alex) */}
      <Route path="/portfolio/:username" element={<DynamicPortfolio />} />

      {/* 5. Root domain displays No Portfolio Available */}
      <Route path="/" element={<NoPortfolio />} />

      {/* 6. Dynamic portfolio by username (e.g. /kartik, /alex, /sarah) */}
      <Route path="/:username" element={<DynamicPortfolio />} />
    </Routes>
  );
}

export default App;
