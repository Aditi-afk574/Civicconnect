import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import IssueList from './pages/IssueList';
import IssueDetail from './pages/IssueDetail';
import ReportIssue from './pages/ReportIssue';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminIssues from './pages/admin/AdminIssues';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAnalytics from './pages/admin/AdminAnalytics';

const GOOGLE_CLIENT_ID = '823390635993-7hqkf7qjt8bmbimghmgrot6v672b49c9.apps.googleusercontent.com';

// Protected route component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return <div className="spinner" />;
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin()) return <Navigate to="/" replace />;
  return children;
};

const AppRoutes = () => (
  <>
    <Navbar />
    <main>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/issues" element={<IssueList />} />
        <Route path="/issues/:id" element={<IssueDetail />} />
        <Route path="/report" element={<ProtectedRoute><ReportIssue /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/issues" element={<ProtectedRoute adminOnly><AdminIssues /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute adminOnly><AdminAnalytics /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
    <Footer />
  </>
);

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <ToastContainer
            position="bottom-right"
            theme="dark"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
          />
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
