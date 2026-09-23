import {
  createContext,
  useContext,
  useEffect,
  useState
}
from 'react';
import {
  readStorage,
  writeStorage
}
from '../utils/storage';
const C = createContext();
export function ThemeProvider( {
  children
}
) {
  const [theme,
  setTheme] = useState(() => readStorage('expenseflow_settings',
  {
    theme: 'light',
    currency: 'INR'
  }
).theme || 'light');
useEffect(() => {
  const apply = () => {
    const resolved = theme === 'system'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme;
    document.documentElement.dataset.theme = resolved;
  }
;
apply();
const media = window.matchMedia('(prefers-color-scheme: dark)');
media.addEventListener?.('change',
apply);
writeStorage('expenseflow_settings',
{
  ...readStorage('expenseflow_settings',
  {
    currency: 'INR'
  }
),
theme
}
);
return () => media.removeEventListener?.('change',
apply);
}
,
[theme]);
return <C.Provider value= {
  {
    theme,
    setTheme
  }
}
> {
  children
}
</C.Provider>;
}
export const useTheme = () => useContext(C);
