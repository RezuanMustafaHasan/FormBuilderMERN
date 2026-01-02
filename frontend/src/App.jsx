
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import FormBuilder from './pages/FormBuilder';
import PublicForm from './pages/PublicForm';
import ResponsesView from './pages/ResponsesView';
import AuthPage from './pages/AuthPage';
import { Toast } from './components/UI';

// Simple Auth state management (in a real app, use Context or Redux)
const getUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

function App() {
  const [user, setUser] = useState(getUser());
  const [toast, setToast] = useState(null); // { message, type }

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // Protected Route Wrapper
  const ProtectedRoute = ({ children }) => {
    if (!user) return <Navigate to="/login" replace />;
    // Clone children to inject props if needed
    return React.cloneElement(children, { user, showToast, handleLogout });
  };

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        <Routes>
          <Route path="/" element={<LandingPage user={user} />} />
          
          <Route path="/login" element={
            user ? <Navigate to="/dashboard" /> : <AuthPage type="login" onLogin={handleLogin} showToast={showToast} />
          } />
          
          <Route path="/signup" element={
            user ? <Navigate to="/dashboard" /> : <AuthPage type="signup" onLogin={handleLogin} showToast={showToast} />
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/builder/:id" element={
            <ProtectedRoute>
              <FormBuilder />
            </ProtectedRoute>
          } />
          
          <Route path="/f/:id" element={<PublicForm showToast={showToast} />} />
          
          <Route path="/f/:id/responses" element={<ResponsesView user={user} publicView={true} showToast={showToast} />} />
          
          {/* Private response view for owner */}
          <Route path="/builder/:id/responses" element={
            <ProtectedRoute>
              <ResponsesView publicView={false} />
            </ProtectedRoute>
          } />
          
        </Routes>

        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </div>
    </Router>
  );
}

export default App;
