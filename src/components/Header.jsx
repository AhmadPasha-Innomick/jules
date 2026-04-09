import React from 'react';
import { NavLink } from 'react-router-dom';
import { useRole } from '../context/RoleContext';
import { roles } from '../constants/roles';

const Header = () => {
  const { activeRole } = useRole();

  const isLawyerDashboard = activeRole === roles.LAWYERS;
  const isMediaDashboard = activeRole === roles.MEDIA;

  const getNavClass = (role) => {
    const base = "transition-colors font-body text-sm";
    const active = "text-[#cda72a] border-b-2 border-[#cda72a] pb-1 font-bold";
    const inactive = "text-slate-300 hover:text-white";
    return `${base} ${activeRole === role ? active : inactive}`;
  };

  if (isLawyerDashboard) {
    return (
      <header className="sticky top-0 z-20 bg-surface-container-lowest/80 backdrop-blur-md px-8 py-6 flex justify-between items-center border-b border-outline-variant/5">
        <div>
          <h1 className="font-headline font-bold text-3xl tracking-tight text-primary">Workspace</h1>
          <p className="text-body-md text-on-surface-variant">Select or draft Moroccan legal instruments.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
            <input
              className="pl-10 pr-4 py-2 bg-surface-container-low rounded-full border-none focus:ring-2 focus:ring-primary/10 text-sm w-64 transition-all"
              placeholder="Search templates..."
              type="text"
            />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-[#000a1e] flex justify-between items-center w-full px-8 py-4 shadow-[0px_20px_40px_rgba(0,33,71,0.06)] bg-gradient-to-b from-[#002147] to-[#000a1e] sticky top-0 z-40 transition-all duration-300">
      <div className="flex items-center gap-6">
        <span className="text-2xl font-black text-[#f8fafc] font-manrope">Smart Legal AI</span>
        <nav className="hidden lg:flex items-center gap-6">
          <NavLink to="/citizens" className={getNavClass(roles.CITIZENS)}>Citizens</NavLink>
          <NavLink to="/students" className={getNavClass(roles.STUDENTS)}>Students</NavLink>
          <NavLink to="/lawyers" className={getNavClass(roles.LAWYERS)}>Lawyers</NavLink>
          <NavLink to="/media" className={getNavClass(roles.MEDIA)}>Media</NavLink>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        {activeRole === roles.STUDENTS && (
          <div className="relative hidden md:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              className="bg-white/10 border-none rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder-slate-400 focus:ring-1 focus:ring-[#cda72a] w-64"
              placeholder="Search Moroccan Statutes..."
              type="text"
            />
          </div>
        )}
        <button className="p-2 rounded-full hover:bg-white/5 transition-all text-[#cda72a]">
          <span className="material-symbols-outlined">{isMediaDashboard ? 'newspaper' : 'account_balance'}</span>
        </button>
        <button className="p-2 rounded-full hover:bg-white/5 transition-all text-[#cda72a]">
          <span className="material-symbols-outlined">{isMediaDashboard ? 'account_balance' : 'gavel'}</span>
        </button>
        {activeRole !== roles.STUDENTS && (
          <div className="h-8 w-8 rounded-full bg-tertiary-container flex items-center justify-center overflow-hidden">
            <span className="material-symbols-outlined text-on-tertiary-container text-sm">person</span>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
