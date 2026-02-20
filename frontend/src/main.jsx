import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: 'hsl(222, 47%, 10%)',
          color: 'hsl(213, 31%, 91%)',
          border: '1px solid hsl(222, 47%, 16%)',
          borderRadius: '12px',
          fontSize: '14px',
          padding: '12px 16px',
        },
        success: {
          iconTheme: { primary: '#10b981', secondary: 'hsl(222, 47%, 10%)' },
        },
        error: {
          iconTheme: { primary: '#ef4444', secondary: 'hsl(222, 47%, 10%)' },
        },
      }}
    />
  </React.StrictMode>,
)
