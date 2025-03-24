import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

// Components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import MyFamily from './pages/MyFamily';
import FamilyList from './pages/FamilyList';
import FamilyShow from './pages/FamilyShow';
import YearList from './pages/YearList';
import YearRoster from './pages/YearRoster';
import Users from './pages/Users';

// TODO: Create FamilyRegistrations component
const FamilyRegistrations = () => <div>Family Registrations Page (Not yet implemented)</div>;

// Import YearContracts component
import YearContracts from './pages/YearContracts';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected routes with Layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Home />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-family"
            element={
              <ProtectedRoute>
                <Layout>
                  <MyFamily />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Admin-only routes */}
          <Route
            path="/families"
            element={
              <ProtectedRoute requireAdmin={true}>
                <Layout>
                  <FamilyList />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/families/:id"
            element={
              <ProtectedRoute requireAdmin={true}>
                <Layout>
                  <FamilyShow />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/families/:id/registrations"
            element={
              <ProtectedRoute requireAdmin={true}>
                <Layout>
                  <FamilyRegistrations />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/years"
            element={
              <ProtectedRoute requireAdmin={true}>
                <Layout>
                  <YearList />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/years/:id/roster"
            element={
              <ProtectedRoute requireAdmin={true}>
                <Layout>
                  <YearRoster />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/years/:id/contracts"
            element={
              <ProtectedRoute requireAdmin={true}>
                <Layout>
                  <YearContracts />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute requireAdmin={true}>
                <Layout>
                  <Users />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
