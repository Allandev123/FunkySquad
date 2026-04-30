import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import { ContactPage, Layout, PortfolioPage } from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<PortfolioPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
