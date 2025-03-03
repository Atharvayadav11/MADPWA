import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import TestList from '@/pages/TestList';
import TestInstructions from '@/pages/TestInstructions';
import TestInterface from '@/pages/TestInterface';
import TestResults from '@/pages/TestResults';
import MobileCheck from '@/components/mobile-check';
import './App.css';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="quiz-theme">
      <AuthProvider>
        <Router>
          <MobileCheck>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/categories/:categoryId" element={
                <ProtectedRoute>
                  <TestList />
                </ProtectedRoute>
              } />
              <Route path="/tests/:testId/instructions" element={
                <ProtectedRoute>
                  <TestInstructions />
                </ProtectedRoute>
              } />
              <Route path="/tests/:testId/start" element={
                <ProtectedRoute>
                  <TestInterface />
                </ProtectedRoute>
              } />
              <Route path="/tests/:testId/results" element={
                <ProtectedRoute>
                  <TestResults />
                </ProtectedRoute>
              } />
            </Routes>
          </MobileCheck>
          <Toaster />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;