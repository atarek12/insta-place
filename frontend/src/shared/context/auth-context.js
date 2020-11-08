import { createContext } from 'react';

export const AuthContext = createContext({
  isLoggedIn: false,
  userId: null,
  token: null,
  login: () => { },
  logout: () => { }
});


// context hold isLoggedIn state for all other components