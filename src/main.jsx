import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster position="top-right" toastOptions={{
        style: {
          background: '#1a2e1a',
          color: '#e8f5e9',
          border: '1px solid #2d5a2d',
          borderRadius: '12px',
          fontFamily: "'Inter', sans-serif",
        }
      }} />
    </BrowserRouter>
  </StrictMode>,
)
