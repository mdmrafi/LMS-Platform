import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks';
import { Loading } from './components/common';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminCourses from './pages/AdminCourses';
import AdminTransactions from './pages/AdminTransactions';
import Courses from './pages/Courses';
import MyCourses from './pages/MyCourses';
import CourseDetail from './pages/CourseDetail';
import CreateCourse from './pages/CreateCourse';
import Transactions from './pages/Transactions';
import BankAccount from './pages/BankAccount';
import './App.css';

// Routes component that uses auth
function AppRoutes() {
  const { user, loading } = useAuth();

  const PrivateRoute = ({ children }) => {
    if (loading) return <Loading fullPage message="Loading..." />;
    return user ? children : <Navigate to="/login" />;
  };

  const PublicRoute = ({ children }) => {
    if (loading) return <Loading fullPage message="Loading..." />;
    return !user ? children : <Navigate to="/dashboard" />;
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />

      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <PrivateRoute>
            <AdminDashboard />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <PrivateRoute>
            <AdminUsers />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/courses"
        element={
          <PrivateRoute>
            <AdminCourses />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/transactions"
        element={
          <PrivateRoute>
            <AdminTransactions />
          </PrivateRoute>
        }
      />

      <Route
        path="/courses"
        element={
          <PrivateRoute>
            <Courses />
          </PrivateRoute>
        }
      />

      <Route
        path="/my-courses"
        element={
          <PrivateRoute>
            <MyCourses />
          </PrivateRoute>
        }
      />

      <Route
        path="/course/:id"
        element={
          <PrivateRoute>
            <CourseDetail />
          </PrivateRoute>
        }
      />

      <Route
        path="/create-course"
        element={
          <PrivateRoute>
            <CreateCourse />
          </PrivateRoute>
        }
      />

      <Route
        path="/transactions"
        element={
          <PrivateRoute>
            <Transactions />
          </PrivateRoute>
        }
      />

      <Route
        path="/bank-account"
        element={
          <PrivateRoute>
            <BankAccount />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

// Main App component with AuthProvider
function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
