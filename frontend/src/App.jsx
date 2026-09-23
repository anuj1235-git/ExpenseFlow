import {
  Navigate,
  Route,
  Routes
}
from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import AddTransaction from './pages/AddTransaction';
import Budgets from './pages/Budgets';
import Analytics from './pages/Analytics';
import MonthlySummary from './pages/MonthlySummary';
import Settings from './pages/Settings';
import Goals from './pages/Goals';
export default function App() {
  return (
  <Routes>
  <Route path="/login" element= {
    <Login />
  }
/>
<Route path="/signup" element= {
  <Signup />
}
/>
<Route element= {
  <ProtectedRoute />
}
>
<Route element= {
  <AppLayout />
}
>
<Route path="/" element= {
  <Dashboard />
}
/>
<Route path="/transactions" element= {
  <Transactions />
}
/>
<Route path="/add-transaction" element= {
  <AddTransaction />
}
/>
<Route path="/budgets" element={<Budgets />} />
<Route path="/goals" element={<Goals />} />
<Route path="/analytics" element= {
  <Analytics />
}
/>
<Route path="/monthly-summary" element= {
  <MonthlySummary />
}
/>
<Route path="/settings" element= {
  <Settings />
}
/>
</Route>
</Route>
<Route path="*" element= {
  <Navigate to="/" replace />
}
/>
</Routes>
);
}
