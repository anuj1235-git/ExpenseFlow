import {
  NavLink,
  Outlet
}
from 'react-router-dom';
import {
  LayoutDashboard,
  WalletCards,
  PlusCircle,
  PiggyBank,
  BarChart3,
  CalendarDays,
  Settings,
  Menu,
  X,
  Target
}
from 'lucide-react';
import {
  useState
}
from 'react';
import {
  useAuth
}
from '../../context/AuthContext';
const links=[['/',
'Dashboard',
LayoutDashboard],
['/transactions',
'Transactions',
WalletCards],
['/add-transaction',
'Add Transaction',
PlusCircle],
['/budgets',
'Budgets',
PiggyBank],
['/goals',
'Goals',
Target],
['/analytics',
'Analytics',
BarChart3],
['/monthly-summary',
'Monthly Summary',
CalendarDays],
['/settings',
'Settings',
Settings]];
export default function AppLayout() {
  const [open,
  setOpen]=useState(false);
  const {
    user,
    logout
  }
=useAuth();
return <div className="app-shell"><aside className= {
  `sidebar ${open?'open':''}`
}
><div className="brand"><div className="brand-mark">₹</div><div><strong>ExpenseFlow</strong><span>Personal Finance</span></div></div><nav> {
  links.map(([to,
  label,
  Icon])=><NavLink onClick= {
    ()=>setOpen(false)
  }
key= {
  to
}
to= {
  to
}
end= {
  to==='/'
}
className= {
  ( {
    isActive
  }
)=>isActive?'nav-link active':'nav-link'
}
><Icon size= {
  18
}
/><span> {
  label
}
</span></NavLink>)
}
</nav><div className="sidebar-user"><div className="user-avatar"> {
  user?.name?.[0]?.toUpperCase()||'U'
}
</div><div className="user-info"><strong> {
  user?.name||'User'
}
</strong><span> {
  user?.email||''
}
</span></div><button onClick= {
  logout
}
title="Logout">↪</button></div></aside><main className="main-content"><header className="topbar"><button className="icon-btn mobile-menu" onClick= {
  ()=>setOpen(!open)
}
aria-label="Menu"> {
  open?<X/>:<Menu/>
}
</button><div><p className="eyebrow">Personal Finance</p><h2>Take control of your money,
one expense at a time.</h2></div></header><div className="page-content"><Outlet/></div></main></div>
}
