import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './index.css'
import AdminLoginPage from './admin/AdminLoginPage.jsx'
import RequireAdmin from './admin/RequireAdmin.jsx'
import { ContactPage, Layout, PortfolioPage } from './App.jsx'
import AdminPage from './AdminPage.jsx'
import NotFound from './NotFound.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<PortfolioPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<AdminLoginPage />} />
          <Route path="/admin/login" element={<Navigate to="/login" replace />} />
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminPage />
              </RequireAdmin>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
