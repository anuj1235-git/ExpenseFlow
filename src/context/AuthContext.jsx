import {
  createContext,
  useContext,
  useState
}
from 'react';
const C = createContext();
const USERS_KEY =
'expenseflow_users';
const CURRENT_USER_KEY =
'expenseflow_current_user';
export function AuthProvider( {
  children
}
) {
  const [user,
  setUser] = useState(() => {
    try {
      return JSON.parse(
      localStorage.getItem(
      CURRENT_USER_KEY
      )
      );
    }
  catch {
    return null;
  }
}
);
function signup( {
  name,
  email,
  password
}
) {
  const users = JSON.parse(
  localStorage.getItem(
  USERS_KEY
  ) || '[]'
  );
  const normalizedEmail =
  email.trim().toLowerCase();
  const exists = users.some(
  (item) =>
  item.email.toLowerCase() ===
  normalizedEmail
  );
  if (exists) {
    throw new Error(
    'An account with this email already exists.'
    );
  }
const newUser = {
  id: `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 9)}`,
  name: name.trim(),
  email: normalizedEmail,
  password
}
;
localStorage.setItem(
USERS_KEY,
JSON.stringify([
...users,
newUser
])
);
const sessionUser = {
  id: newUser.id,
  name: newUser.name,
  email: newUser.email
}
;
localStorage.setItem(
CURRENT_USER_KEY,
JSON.stringify(
sessionUser
)
);
setUser(sessionUser);
}
function login( {
  email,
  password
}
) {
  const users = JSON.parse(
  localStorage.getItem(
  USERS_KEY
  ) || '[]'
  );
  const normalizedEmail =
  email.trim().toLowerCase();
  const emailExists = users.some(
  (item) =>
  item.email.toLowerCase() ===
  normalizedEmail
  );
  if (!emailExists) {
    throw new Error(
    'No account found with this email. Please create an account first.'
    );
  }
const found = users.find(
(item) =>
item.email.toLowerCase() ===
normalizedEmail &&
item.password === password
);
if (!found) {
  throw new Error(
  'Incorrect password. Please try again.'
  );
}
const sessionUser = {
  id: found.id,
  name: found.name,
  email: found.email
}
;
localStorage.setItem(
CURRENT_USER_KEY,
JSON.stringify(
sessionUser
)
);
setUser(sessionUser);
}
function logout() {
  localStorage.removeItem(
  CURRENT_USER_KEY
  );
  setUser(null);
}
function deleteAccount() {
  if (!user) {
    return;
  }
const users = JSON.parse(
localStorage.getItem(
USERS_KEY
) || '[]'
);
const updatedUsers =
users.filter(
(item) =>
item.id !== user.id
);
localStorage.setItem(
USERS_KEY,
JSON.stringify(
updatedUsers
)
);
const prefix =
`expenseflow_${user.id}`;
const userKeys = [
`${prefix}_transactions`,
`${prefix}_budgets`,
`${prefix}_goals`,
`${prefix}_settings`
];
userKeys.forEach(
(key) => {
  localStorage.removeItem(
  key
  );
}
);
localStorage.removeItem(
CURRENT_USER_KEY
);
setUser(null);
}
return (
<C.Provider
value= {
  {
    user,
    signup,
    login,
    logout,
    deleteAccount
  }
}
> {
  children
}
</C.Provider>
);
}
export const useAuth = () =>
useContext(C);
