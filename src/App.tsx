import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AcademyProvider } from './context/AcademyContext';
import { testConnection } from './firebase/config';

// Public Components
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { Chatbot } from './components/common/Chatbot';

// Public Pages
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { CoursesPage } from './pages/CoursesPage';
import { TeachersPage } from './pages/TeachersPage';
import { AdmissionsPage } from './pages/AdmissionsPage';
import { AdmissionStatusPage } from './pages/AdmissionStatusPage';
import { ResultsLookupPage } from './pages/ResultsLookupPage';
import { GalleryPage } from './pages/GalleryPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { ContactPage } from './pages/ContactPage';

// Admin Pages
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { StudentsManager } from './pages/admin/StudentsManager';
import { AdmissionsManager } from './pages/admin/AdmissionsManager';
import { FeeManager } from './pages/admin/FeeManager';
import { CourseManager } from './pages/admin/CourseManager';
import { TeacherManager } from './pages/admin/TeacherManager';
import { AttendanceManager } from './pages/admin/AttendanceManager';
import { ExamManager } from './pages/admin/ExamManager';
import { CMSManager } from './pages/admin/CMSManager';
import { ReviewManager } from './pages/admin/ReviewManager';
import { ContactManager } from './pages/admin/ContactManager';
import { ReportsManager } from './pages/admin/ReportsManager';
import { SettingsManager } from './pages/admin/SettingsManager';
import { ChatbotSettingsManager } from './pages/admin/ChatbotSettingsManager';

const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Chatbot />
    </div>
  );
};

export default function App() {
  useEffect(() => {
    // Test initial connection to Firestore as mandated by Firebase skill
    testConnection().catch(console.error);
  }, []);

  return (
    <AuthProvider>
      <AcademyProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Academy Portal */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/teachers" element={<TeachersPage />} />
              <Route path="/admissions" element={<AdmissionsPage />} />
              <Route path="/admission-status" element={<AdmissionStatusPage />} />
              <Route path="/results" element={<ResultsLookupPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/reviews" element={<ReviewsPage />} />
              <Route path="/contact" element={<ContactPage />} />
            </Route>

            {/* Admin Authentication */}
            <Route path="/admin/login" element={<AdminLoginPage />} />

            {/* Protected Admin Management Portal */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="students" element={<StudentsManager />} />
              <Route path="admissions" element={<AdmissionsManager />} />
              <Route path="fees" element={<FeeManager />} />
              <Route path="courses" element={<CourseManager />} />
              <Route path="teachers" element={<TeacherManager />} />
              <Route path="attendance" element={<AttendanceManager />} />
              <Route path="exams" element={<ExamManager />} />
              <Route path="cms" element={<CMSManager />} />
              <Route path="reviews" element={<ReviewManager />} />
              <Route path="messages" element={<ContactManager />} />
              <Route path="reports" element={<ReportsManager />} />
              <Route path="chatbot" element={<ChatbotSettingsManager />} />
              <Route path="settings" element={<SettingsManager />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AcademyProvider>
    </AuthProvider>
  );
}
