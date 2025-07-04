import { Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

// Components
import Layout from "@components/Layout";
import LoadingSpinner from "@components/LoadingSpinner";
import ProtectedRoute from "@components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";

// Lazy-loaded Pages
const Home = lazy(() => import("@pages/Home"));
const Login = lazy(() => import("@pages/Login"));
const ForgotPassword = lazy(() => import("@pages/ForgotPassword"));
const CreateAccount = lazy(() => import("@pages/CreateAccount"));
const MyFamily = lazy(() => import("@/pages/families/MyFamily"));
const FamilyList = lazy(() => import("@/pages/families/FamilyList"));
const FamilyShow = lazy(() => import("@/pages/families/FamilyShow"));
const Registration = lazy(() => import("@/pages/contracts/Registration"));
const YearList = lazy(() => import("@/pages/years/YearList"));
const YearRoster = lazy(() => import("@/pages/years/YearRoster"));
const Users = lazy(() => import("@/pages/users/Users"));
const YearContracts = lazy(() => import("@/pages/years/YearContracts"));
const SlidingScaleDesigner = lazy(() => import("@/pages/contracts/SlidingScaleDesigner"));

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route
            path="/login"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <Login />
              </Suspense>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <ForgotPassword />
              </Suspense>
            }
          />
          <Route
            path="/create-account"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <CreateAccount />
              </Suspense>
            }
          />

          {/* Protected routes with Layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingSpinner />}>
                    <Home />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-family"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingSpinner />}>
                    <MyFamily />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/register"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingSpinner />}>
                    <Registration />
                  </Suspense>
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
                  <Suspense fallback={<LoadingSpinner />}>
                    <FamilyList />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/families/:id"
            element={
              <ProtectedRoute requireAdmin={true}>
                <Layout>
                  <Suspense fallback={<LoadingSpinner />}>
                    <FamilyShow />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/families/:id/register"
            element={
              <ProtectedRoute requireAdmin={true}>
                <Layout>
                  <Suspense fallback={<LoadingSpinner />}>
                    <Registration />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/years"
            element={
              <ProtectedRoute requireAdmin={true}>
                <Layout>
                  <Suspense fallback={<LoadingSpinner />}>
                    <YearList />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/years/:id/roster"
            element={
              <ProtectedRoute requireAdmin={true}>
                <Layout>
                  <Suspense fallback={<LoadingSpinner />}>
                    <YearRoster />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/years/:id/contracts"
            element={
              <ProtectedRoute requireAdmin={true}>
                <Layout>
                  <Suspense fallback={<LoadingSpinner />}>
                    <YearContracts />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute requireAdmin={true}>
                <Layout>
                  <Suspense fallback={<LoadingSpinner />}>
                    <Users />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/sliding-scale"
            element={
              <ProtectedRoute requireAdmin={true}>
                <Layout>
                  <Suspense fallback={<LoadingSpinner />}>
                    <SlidingScaleDesigner />
                  </Suspense>
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
