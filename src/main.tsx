import React, { useEffect } from "react"
import ReactDOM from "react-dom/client"
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom"
import "./index.css"

// Layouts
import PublicLayout from "./layouts/PublicLayout"
import AdminLayout from "./layouts/AdminLayout"
import CeoLayout from "./layouts/CeoLayout"

// Pages
import HomePage from "./pages/public/HomePage"
import AdminLoginPage from "./pages/admin/AdminLoginPage"
import AdminRegisterPage from "./pages/admin/AdminRegisterPage"
import AdminDashboard from "./pages/admin/AdminDashboard"
import AdminStorePage from "./pages/admin/AdminStorePage"
import AdminHoursPage from "./pages/admin/AdminHoursPage"
import AdminPlansPage from "./pages/admin/AdminPlansPage"
import CeoLoginPage from "./pages/ceo/CeoLoginPage"
import CeoDashboard from "./pages/ceo/CeoDashboard"
import CeoStoresPage from "./pages/ceo/CeoStoresPage"
import CeoMapPage from "./pages/ceo/CeoMapPage"
import CeoAccountsPage from "./pages/ceo/CeoAccountsPage"
import CeoSettingsPage from "./pages/ceo/CeoSettingsPage"

// Stores
import { useAuthStore } from "./store/authStore"

// Lib
import { getSubdomain, getSubdomainUrl } from "./lib/subdomain"

// ─── Helper Components ────────────────────────────────────────────────────────

// Redirects from the root domain based on subdomain
function RootPage() {
  const subdomain = getSubdomain()

  if (subdomain === "admin") {
    return <Navigate to="/admin/dashboard" replace />
  }
  if (subdomain === "ceo") {
    return <Navigate to="/ceo/dashboard" replace />
  }

  return <HomePage />
}

// Protected route component that validates subdomain access
function SubdomainGuard({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuthStore()
  const currentSubdomain = getSubdomain()

  useEffect(() => {
    if (!initialized) return

    // If on admin subdomain, CEOs are allowed (superusers), no redirect needed.

    // If on CEO subdomain, only allow CEO role
    if (currentSubdomain === "ceo") {
      if (user && user.role !== "ceo") {
        window.location.href = getSubdomainUrl("admin", "/admin/dashboard")
        return
      }
    }
  }, [user, initialized, currentSubdomain])

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Carregando...
      </div>
    )
  }

  return <>{children}</>
}

function AppRoutes() {
  const { init } = useAuthStore()

  useEffect(() => {
    init()
  }, [init])

  return (
    <BrowserRouter>
      <Routes>
        {/* ── Root (redirects based on subdomain) ── */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<RootPage />} />
        </Route>

        {/* ── Admin (admin. subdomain or /admin prefix in dev) ── */}
        <Route
          path="/admin/*"
          element={
            <SubdomainGuard>
              <AdminLayout />
            </SubdomainGuard>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="login" element={<AdminLoginPage />} />
          <Route path="register" element={<AdminRegisterPage />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="store" element={<AdminStorePage />} />
          <Route path="hours" element={<AdminHoursPage />} />
          <Route path="plans" element={<AdminPlansPage />} />
        </Route>

        {/* ── CEO (ceo. subdomain or /ceo prefix in dev) ── */}
        <Route
          path="/ceo/*"
          element={
            <SubdomainGuard>
              <CeoLayout />
            </SubdomainGuard>
          }
        >
          <Route index element={<Navigate to="/ceo/dashboard" replace />} />
          <Route path="login" element={<CeoLoginPage />} />
          <Route path="dashboard" element={<CeoDashboard />} />
          <Route path="stores" element={<CeoStoresPage />} />
          <Route path="map" element={<CeoMapPage />} />
          <Route path="accounts" element={<CeoAccountsPage />} />
          <Route path="settings" element={<CeoSettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppRoutes />
  </React.StrictMode>,
)
