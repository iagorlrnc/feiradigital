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
import AdminProductsPage from "./pages/admin/AdminProductsPage"
import CeoLoginPage from "./pages/ceo/CeoLoginPage"
import CeoDashboard from "./pages/ceo/CeoDashboard"
import CeoStoresPage from "./pages/ceo/CeoStoresPage"
import CeoMapPage from "./pages/ceo/CeoMapPage"
import CeoAccountsPage from "./pages/ceo/CeoAccountsPage"
import CeoSettingsPage from "./pages/ceo/CeoSettingsPage"

// Stores
import { useAuthStore } from "./store/authStore"

// Lib
import { getSubdomain } from "./lib/subdomain"

function AppRoutes() {
  const { init, user, initialized } = useAuthStore()
  const subdomain = getSubdomain()

  useEffect(() => {
    init()
  }, [init])

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-palmas-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-palmas-blue/20 border-t-palmas-blue rounded-full animate-spin" />
          <p className="text-palmas-text font-medium animate-pulse">Carregando...</p>
        </div>
      </div>
    )
  }

  // ─── ADMIN SUBDOMAIN ───
  if (subdomain === "admin") {
    return (
      <BrowserRouter>
        <Routes>
          {!user ? (
            <>
              <Route path="/register" element={<AdminRegisterPage />} />
              <Route path="*" element={<AdminLoginPage />} />
            </>
          ) : (
            <Route element={<AdminLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<AdminDashboard />} />
              <Route path="/store" element={<AdminStorePage />} />
               <Route path="/hours" element={<AdminHoursPage />} />
              <Route path="/products" element={<AdminProductsPage />} />
              <Route path="/plans" element={<AdminPlansPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          )}
        </Routes>
      </BrowserRouter>
    )
  }

  // ─── CEO (DEV) SUBDOMAIN ───
  if (subdomain === "dev") {
    return (
      <BrowserRouter>
        <Routes>
          {!user || user.role !== "ceo" ? (
            <Route path="*" element={<CeoLoginPage />} />
          ) : (
            <Route element={<CeoLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<CeoDashboard />} />
              <Route path="/stores" element={<CeoStoresPage />} />
              <Route path="/map" element={<CeoMapPage />} />
              <Route path="/accounts" element={<CeoAccountsPage />} />
              <Route path="/settings" element={<CeoSettingsPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          )}
        </Routes>
      </BrowserRouter>
    )
  }

  // ─── PUBLIC DOMAIN ───
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<HomePage />} />
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
