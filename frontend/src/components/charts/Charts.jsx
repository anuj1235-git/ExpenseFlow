import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
}
from 'recharts';
export function CategoryChart( {
  data
}
) {
  return <ResponsiveContainer width="100%" height= {
    280
  }
><PieChart><Pie data= {
  data
}
dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius= {
  95
}
label> {
  data.map((_,
  i)=><Cell key= {
    i
  }
/>)
}
</Pie><Tooltip/></PieChart></ResponsiveContainer>
}
export function MonthlyBar( {
  data
}
) {
  return <ResponsiveContainer width="100%" height= {
    280
  }
><BarChart data= {
  data
}
><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="name"/><YAxis/><Tooltip/><Bar dataKey="expense" name="Expenses"/></BarChart></ResponsiveContainer>
}
export function IncomeExpenseLine( {
  data
}
) {
  return <ResponsiveContainer width="100%" height= {
    280
  }
><LineChart data= {
  data
}
><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="name"/><YAxis/><Tooltip/><Legend/><Line type="monotone" dataKey="income"/><Line type="monotone" dataKey="expense"/></LineChart></ResponsiveContainer>
}
