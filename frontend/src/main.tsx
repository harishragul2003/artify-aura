import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Ping the backend immediately on page load to wake Render from cold start
// so by the time user interacts, the server is already warm
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
fetch(`${API_URL}/health`, { method: 'GET' }).catch(() => {});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
