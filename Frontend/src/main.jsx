import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './theme.css'
import { BrowserRouter } from 'react-router-dom' // এটি ইমপোর্ট নিশ্চিত করুন

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter> {/* এর ভেতর App কে রাখুন */}
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
// 🚀 Render এর ফ্রি সার্ভার ঘুমিয়ে থাকলে পেজ খোলার সাথে সাথেই জাগিয়ে তোলা
import { API_BASE } from './config'
fetch(API_BASE, { mode: 'no-cors' }).catch(() => {})
