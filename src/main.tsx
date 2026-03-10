import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500 font-medium">Loading application...</div>}>
        <App />
      </Suspense>
    </AuthProvider>
  </StrictMode>,
)
