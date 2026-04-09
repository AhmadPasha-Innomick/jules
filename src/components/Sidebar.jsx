import React from 'react';
import { motion } from 'framer-motion';
import { useRole } from '../context/RoleContext';
import { roles } from '../constants/roles';

const Sidebar = () => {
  const { activeRole } = useRole();

  const menuItems = [
    { id: 'research', label: 'Legal Research', icon: 'search_insights', activeOn: [roles.CITIZENS, roles.LAWYERS, roles.STUDENTS] },
    { id: 'analysis', label: 'Case Analysis', icon: 'balance', activeOn: [roles.LAWYERS, roles.STUDENTS] },
    { id: 'drafts', label: 'Document Drafts', icon: 'edit_note', activeOn: [roles.LAWYERS, roles.STUDENTS] },
    { id: 'consultations', label: 'AI Consultations', icon: 'forum', activeOn: [roles.CITIZENS, roles.LAWYERS, roles.STUDENTS] },
  ];

  const studentSpecificItems = [
    { id: 'students', label: 'Students', icon: 'school', activeOn: [roles.STUDENTS] },
  ];

  const currentMenuItems = activeRole === roles.STUDENTS
    ? [menuItems[0], ...studentSpecificItems, ...menuItems.slice(1)]
    : menuItems;

  return (
    <aside className="hidden md:flex flex-col h-screen fixed left-0 top-0 w-64 bg-slate-50 dark:bg-[#000a1e] font-inter text-body-md antialiased transition-all duration-300 z-50">
      <div className="p-8">
        <div className="flex items-center gap-3">
          {activeRole === roles.LAWYERS && (
            <img
              alt="User Profile"
              className="w-10 h-10 rounded-full bg-surface-container shadow-sm"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAUwmhrGZRbFxpNPPbBJ6xGFs7MSc12wo98VAgXEazS0AeVoV3ZJp8ZgHS9ZRxSnfuU9GBwOUVHmIfK3kUZjfmcbAb21a4AeOQPP2UQgaFo3w5ctXdmXDUY9ySLnUZHivWPxTyv6PnrOTFmpy_QZsgG_xJk4gcsr7UEewMyBapXGSSFisvKaNhMFLwdY1rMrzVI9NZJijI54QkaBDzqJVPd4Mk1pfiu9ze2LhySEdSuDOmy13Qe9P9GBPVRMUHqpXetZd4_Xe9z_x7w"
            />
          )}
          <div className="flex flex-col">
            <h2 className="font-manrope font-extrabold text-[#002147] text-xl leading-tight">The Digital Jurist</h2>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1 opacity-70">Moroccan Legal Framework</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-2">
        <button className="w-full milled-button text-white py-3 rounded-full font-bold shadow-lg flex items-center justify-center gap-2 hover:translate-x-1 transition-transform">
          <span className="material-symbols-outlined text-sm">add</span>
          <span className="text-sm font-semibold">New Consultation</span>
        </button>
      </div>

      <nav className="flex-1 mt-6 px-2 space-y-1 overflow-y-auto no-scrollbar">
        <div className="px-4 py-2 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] opacity-50">
          {activeRole === roles.STUDENTS ? 'Academic Portal' : 'Main Menu'}
        </div>

        {currentMenuItems.map((item) => {
          const isActive = (item.id === 'research' && activeRole !== roles.STUDENTS) || (item.id === 'students' && activeRole === roles.STUDENTS);
          return (
            <motion.a
              key={item.id}
              href="#"
              whileHover={{ x: 4 }}
              className={`flex items-center gap-3 rounded-full mx-2 my-1 px-4 py-3 transition-all duration-300 ${
                isActive
                  ? 'bg-[#002147] text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/5'
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={isActive && item.id === 'students' ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              <span className="text-sm font-medium">{item.label}</span>
            </motion.a>
          );
        })}

        {activeRole === roles.LAWYERS && (
          <>
            <div className="px-4 py-6 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] opacity-50">Active Cases</div>
            <div className="space-y-1 px-2">
              <div className="p-3 rounded-xl hover:bg-surface-container-high transition-colors cursor-pointer group">
                <p className="text-xs font-bold text-primary truncate">OCP Group vs. LogiPort</p>
                <p className="text-[10px] text-on-surface-variant">Commercial Dispute • 2d ago</p>
              </div>
              <div className="p-3 rounded-xl hover:bg-surface-container-high transition-colors cursor-pointer group">
                <p className="text-xs font-bold text-primary truncate">Real Estate Transfer - Tangier</p>
                <p className="text-[10px] text-on-surface-variant">Conveyancing • 5h ago</p>
              </div>
            </div>
          </>
        )}
      </nav>

      <div className="p-4 mt-auto border-t border-outline-variant/10">
        <a className="flex items-center gap-3 text-slate-400 p-3 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors" href="#">
          <span className="material-symbols-outlined">settings</span>
          <span className="text-sm font-medium">Settings</span>
        </a>
        <a className="flex items-center gap-3 text-slate-400 p-3 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors" href="#">
          <span className="material-symbols-outlined">help_center</span>
          <span className="text-sm font-medium">Legal Help</span>
        </a>

        {activeRole === roles.STUDENTS && (
          <div className="flex items-center gap-3 px-4 py-4 mt-2 border-t border-outline-variant/10">
            <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden">
              <img
                alt="User Profile"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDkUxJl9aDbIqb0bHsV3qyHOKL8Yvs-B7lcufIToUxskHLoTIDD4Fb46j2hogqDJvXuJ8S_Z5jjvNqt3kdkAzXlxYtN6FvYeSPoUdTmj2TN-GkXx1MzR2zHRO6fFG7LFE_NVtgFRuBF15UQ8lwJBvYx9UyErkYYxqTeIwioYDdFdzjzDEIf5rOIu6xq72159pN6onKnCtW7P-RinxO2xYjMjjatEtLg-BKQWuXyqvKB9g2Ida7gODfe2HpEEg7yUyuqSxbnk0k0vgGa"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-primary leading-tight">Sara Alami</span>
              <span className="text-xs text-on-surface-variant">L3 Law Student</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
