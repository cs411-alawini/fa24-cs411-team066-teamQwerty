// src/contexts/LoginStatusContext.js
import React, { createContext, useState } from 'react';

export const LoginStatusContext = createContext();

export function LoginStatusProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const enableCredentials = () => {
    setIsLoggedIn(true);
  };

  const disableCredentials = () => {
    setIsLoggedIn(false);
  };

  return (
    <LoginStatusContext.Provider value={{ isLoggedIn, enableCredentials, disableCredentials }}>
      {children}
    </LoginStatusContext.Provider>
  );
}