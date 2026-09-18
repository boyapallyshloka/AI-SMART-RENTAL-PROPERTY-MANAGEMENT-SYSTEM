import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ScoutProvider } from './context/ScoutContext'
import AppRoutes from './routes/AppRoutes'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScoutProvider>
          <AppRoutes />
        </ScoutProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
