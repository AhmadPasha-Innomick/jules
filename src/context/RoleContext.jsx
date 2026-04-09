import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { roles } from '../constants/roles';

const RoleContext = createContext();

export const RoleProvider = ({ children }) => {
  const location = useLocation();
  const [activeRole, setActiveRole] = useState(() => {
    const path = window.location.pathname.split('/')[1];
    if (Object.values(roles).includes(path)) {
      return path;
    }
    return roles.CITIZENS;
  });

  useEffect(() => {
    const path = location.pathname.split('/')[1];
    if (Object.values(roles).includes(path)) {
      setActiveRole(path);
    } else if (location.pathname === '/') {
      setActiveRole(roles.CITIZENS);
    }
  }, [location]);

  return (
    <RoleContext.Provider value={{ activeRole, setActiveRole }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};
