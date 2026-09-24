import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Import global styles
import './styles/global.css';

// Remove default vite CSS files like index.css

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
