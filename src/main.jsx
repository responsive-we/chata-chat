import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthContextProvider } from './context/AuthContext.jsx'
import { ThemeProvider } from "@/components/theme-provider"
ReactDOM.createRoot(document.getElementById('root')).render(
  <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
  <AuthContextProvider>
  <React.StrictMode>
    <App />
  </React.StrictMode>
  </AuthContextProvider>
  </ThemeProvider>
)
