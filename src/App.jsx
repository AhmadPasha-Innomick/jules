import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RoleProvider } from './context/RoleContext';
import MainLayout from './layouts/MainLayout';
import Citizens from './pages/Citizens';
import Students from './pages/Students';
import Lawyers from './pages/Lawyers';
import Media from './pages/Media';

function App() {
  return (
    <BrowserRouter>
      <RoleProvider>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/citizens" replace />} />
            <Route path="/citizens" element={<Citizens />} />
            <Route path="/students" element={<Students />} />
            <Route path="/lawyers" element={<Lawyers />} />
            <Route path="/media" element={<Media />} />
            <Route path="*" element={<Navigate to="/citizens" replace />} />
          </Route>
        </Routes>
      </RoleProvider>
    </BrowserRouter>
  );
}

export default App;
