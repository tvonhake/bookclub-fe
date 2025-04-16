import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/layout/Header';
import Login from './pages/auth/Login';
import SignUp from './pages/auth/SignUp';
import Dashboard from './pages/Dashboard';
import AuthRoute from './components/auth/AuthRoute';
import { validateEnv } from './utils/envValidation';
import './App.css'

// Validate environment variables on app initialization
const envValidation = validateEnv();
if (!envValidation.isValid) {
  console.error('Environment validation failed:', envValidation.errors);
  throw new Error('Environment validation failed. Please check your environment variables.');
}

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={
        <AuthRoute type="auth">
          <Login />
        </AuthRoute>
      } />
      <Route path="/signup" element={
        <AuthRoute type="auth">
          <SignUp />
        </AuthRoute>
      } />
      <Route path="/dashboard" element={
        <AuthRoute type="protected">
          <Dashboard />
        </AuthRoute>
      } />
    </Routes>
  );
};

function App() {
  return (
    <div className="min-h-screen flex flex-col dark">
      <Header />
      <main className="flex-1 flex items-center justify-center pt-16">
        <AppRoutes />
      </main>
    </div>
  );
}

export default App;
