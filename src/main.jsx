import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  BrowserRouter
}
from 'react-router-dom';
import {
  AuthProvider
}
from './context/AuthContext';
import {
  ExpenseProvider
}
from './context/ExpenseContext';
import {
  ThemeProvider
}
from './context/ThemeContext';
import App from './App';
import './styles/index.css';
import './styles/auth.css';
ReactDOM.createRoot(document.getElementById('root')).render(
<React.StrictMode>
<BrowserRouter>
<AuthProvider>
<ThemeProvider>
<ExpenseProvider>
<App />
</ExpenseProvider>
</ThemeProvider>
</AuthProvider>
</BrowserRouter>
</React.StrictMode>
);
