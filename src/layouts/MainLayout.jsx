import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useRole } from '../context/RoleContext';
import { roles } from '../constants/roles';
import SkeletonLoader from '../components/SkeletonLoader';

const MainLayout = () => {
  const { activeRole } = useRole();
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const isLawyer = activeRole === roles.LAWYERS;
  const isMedia = activeRole === roles.MEDIA;

  return (
    <div className="flex min-h-screen bg-surface font-body text-on-surface selection:bg-tertiary-container selection:text-on-tertiary-container">
      {/* Sidebar - Role dependent visibility */}
      {!isMedia && <Sidebar />}

      <div className={`flex-1 ${!isMedia ? 'md:ml-64' : ''} ${isLawyer ? 'mr-96' : ''} flex flex-col`}>
        <Header />

        <main className="flex-1">
          {loading ? (
            <div className="p-8 max-w-7xl mx-auto space-y-8">
              <SkeletonLoader type={isMedia ? 'media-featured' : 'card'} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SkeletonLoader type="card" />
                <SkeletonLoader type="card" />
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </main>

        <footer className="w-full py-12 px-8 bg-slate-50 dark:bg-[#000a1e] border-t border-outline-variant/10 opacity-80 mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="space-y-4 max-w-sm">
              <p className="font-headline font-extrabold text-primary text-xl">The Digital Jurist</p>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                Bridging the gap between complex Moroccan jurisprudence and the digital era through Editorial Intelligence.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <p className="font-inter text-label-sm uppercase tracking-widest text-slate-500">
                © 2024 Smart Legal AI Platform (Morocco)
              </p>
              <div className="flex flex-wrap gap-6 text-[10px] uppercase tracking-widest text-slate-400">
                <a className="hover:text-slate-600 hover:underline decoration-[#cda72a] decoration-2 transition-all" href="#">Privacy Policy</a>
                <a className="hover:text-slate-600 hover:underline decoration-[#cda72a] decoration-2 transition-all" href="#">Terms of Service</a>
                <a className="hover:text-slate-600 hover:underline decoration-[#cda72a] decoration-2 transition-all" href="#">AI Ethics Disclaimer</a>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Lawyer Right Sidebar */}
      {isLawyer && (
        <aside className="w-96 h-screen fixed right-0 top-0 bg-surface-container-low flex flex-col border-l border-outline-variant/5 z-40">
          <div className="p-6 bg-primary-container text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary-fixed" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                <h2 className="font-headline font-bold text-lg">AI Assistant</h2>
              </div>
              <span className="text-[10px] bg-white/10 px-2 py-1 rounded font-bold uppercase tracking-tighter">Real-time</span>
            </div>
            <p className="text-xs text-on-primary-container">Analyzing Drafted Clauses against Law 49-16 and Cassation Precedents.</p>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
            {loading ? (
              <SkeletonLoader type="lawyer-stats" />
            ) : (
              <>
                <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-primary">Draft Compliance Score</span>
                    <span className="text-lg font-headline font-bold text-tertiary">94%</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-tertiary w-[94%] transition-all duration-1000"></div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Case Law Suggestions</h3>
                  <div className="group bg-surface-container-high/40 p-4 rounded-2xl border-l-2 border-transparent hover:border-tertiary transition-all cursor-pointer shadow-sm">
                    <div className="flex gap-3">
                      <span className="material-symbols-outlined text-primary text-xl">gavel</span>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-primary">Cour de Cassation #1024/2022</p>
                        <p className="text-[11px] text-on-surface-variant">Regarding the validity of "Clause Résolutoire" in commercial leases.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Inquiry</h3>
                  <div className="p-4 bg-primary text-white text-xs rounded-2xl rounded-tr-none ml-6 leading-relaxed shadow-sm">
                    Does the 10% annual rent increase cap apply to industrial zones in Casablanca?
                  </div>
                  <div className="p-4 bg-white text-on-surface text-xs rounded-2xl rounded-tl-none mr-6 shadow-sm border border-outline-variant/5 leading-relaxed">
                    Under Law 07-03, rent increases are capped at 10% for commercial premises...
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="p-4 bg-surface-container-low border-t border-outline-variant/5">
            <div className="relative bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-2 flex items-center gap-2 focus-within:ring-2 focus-within:ring-tertiary/20 transition-all shadow-sm">
              <input className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-2 outline-none" placeholder="Ask AI about a clause..." type="text"/>
              <button className="bg-primary text-white p-2 rounded-xl hover:bg-primary-container transition-colors shadow-lg">
                <span className="material-symbols-outlined text-sm">send</span>
              </button>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
};

export default MainLayout;
