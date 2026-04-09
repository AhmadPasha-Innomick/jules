import React from 'react';
import { motion } from 'framer-motion';

const Students = () => {
  return (
    <section className="p-8 max-w-7xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary-container text-on-tertiary-container text-xs font-bold tracking-wide shadow-sm">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
            AI STUDY PORTAL ACTIVE
          </div>
          <h2 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight text-primary">Academic Workspace</h2>
          <p className="text-on-surface-variant text-lg max-w-2xl">Refining your mastery of the Mudawana and Constitutional Law through editorial AI intelligence.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-surface-container-high text-primary px-6 py-3 rounded-full font-bold hover:bg-surface-container-highest transition-all shadow-sm">
            <span className="material-symbols-outlined">history</span>
            Study Log
          </button>
          <button className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-bold hover:shadow-lg transition-all shadow-md">
            <span className="material-symbols-outlined">upload_file</span>
            Upload Lecture
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <motion.div whileHover={{ y: -5 }} className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-lg border border-outline-variant/10 group">
            <div className="h-48 bg-primary-container relative">
              <img alt="Legal Books" className="w-full h-full object-cover opacity-50 mix-blend-overlay transition-transform duration-700 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB0EFkNG7g_qWzVEutxF6sqkFqHw9YwL53lZV0aDn102VrVHCW7yhWweDi6rHVlSDrwyFuZlQKNZl7WIBsYAy13lUNwJpd5O2X7KLE8iobVZ2AfS01QvisJPB0_6gHvYifqQjHd-bqP1iO4Kc6js634mvrZNIX49Qx7jfrPEsVqQufstBxNt6vsOOHB4iHsh1apXhdk4if_HYCG5fKJtj4w5xwkSk1eLN9cTHe63WSana49MH3z7pjN9tAa021mnstcXu__3RGyd2rM"/>
              <div className="absolute inset-0 p-8 flex flex-col justify-end bg-gradient-to-t from-primary/60 to-transparent">
                <h3 className="text-2xl font-bold text-white font-headline">The Moroccan Civil Code: Contractual Obligations</h3>
                <p className="text-slate-200 text-sm opacity-90">Module 4: Interpretation of Commercial Contracts</p>
              </div>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex items-start gap-6">
                <div className="flex-1 space-y-4">
                  <div className="p-4 bg-surface-container-low rounded-xl border-l-4 border-[#cda72a] shadow-sm">
                    <p className="text-sm font-semibold text-primary mb-2">AI Summary Insight</p>
                    <p className="text-on-surface-variant italic text-sm leading-relaxed">"The Dahir of Obligations and Contracts (DOC) remains the cornerstone of Moroccan civil law, emphasizing the 'autonomy of will' principle..."</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {['Summarize', 'Learn AI', 'Gen Quiz'].map((btn, i) => (
                      <button key={btn} className="flex flex-col items-center justify-center p-4 rounded-xl bg-surface hover:bg-surface-container transition-colors group shadow-sm border border-outline-variant/5">
                        <span className="material-symbols-outlined text-primary mb-2 group-hover:scale-110 transition-transform">
                          {['summarize_auto', 'psychology', 'quiz'][i]}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{btn}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="hidden md:block w-48 aspect-square bg-surface-container-low rounded-xl p-4 overflow-hidden border border-outline-variant/10 shadow-inner">
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 border border-dashed border-outline-variant rounded-lg">
                    <span className="material-symbols-outlined text-on-primary-container text-3xl opacity-50">schema</span>
                    <span className="text-[10px] text-center font-bold text-on-surface-variant uppercase opacity-70">AI Concept Map</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: 'Constitutional Reforms 2011', desc: 'Analysis of the separation of powers and the role of Head of Government.', progress: 75, date: '2H AGO' },
              { title: 'Criminal Procedure Code', desc: 'Focus on the rights of the defense during preliminary investigation.', progress: 32, date: 'YESTERDAY' }
            ].map((item) => (
              <motion.div key={item.title} whileHover={{ scale: 1.02 }} className="bg-surface-container-low p-6 rounded-xl space-y-4 border border-outline-variant/10 shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-white rounded-lg shadow-sm border border-outline-variant/10">
                    <span className="material-symbols-outlined text-primary">{item.title.includes('Criminal') ? 'gavel' : 'description'}</span>
                  </div>
                  <span className="text-[10px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest">Updated {item.date}</span>
                </div>
                <h4 className="font-bold text-lg text-primary">{item.title}</h4>
                <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-2">{item.desc}</p>
                <div className="pt-4 flex items-center gap-3">
                  <div className="h-1.5 flex-1 bg-surface-container-highest rounded-full overflow-hidden shadow-inner">
                    <div className={`h-full bg-primary rounded-full transition-all duration-1000`} style={{ width: `${item.progress}%` }}></div>
                  </div>
                  <span className="text-xs font-bold text-primary">{item.progress}%</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <aside className="space-y-8">
          <div className="bg-primary text-white p-8 rounded-xl shadow-2xl relative overflow-hidden border border-white/5">
            <div className="absolute -right-12 -top-12 w-40 h-40 bg-[#cda72a]/20 rounded-full blur-3xl"></div>
            <h3 className="text-xl font-bold font-headline mb-6">Exam Prep Assistant</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2 opacity-80">
                  <span>Semester Readiness</span>
                  <span>68%</span>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden shadow-inner">
                  <div className="h-full bg-[#cda72a] w-[68%] shadow-[0_0_15px_#cda72a] transition-all duration-1000"></div>
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Upcoming Mock Exams</p>
                {[
                  { date: '14', month: 'OCT', title: 'International Private Law', sub: '30 Questions • Advanced' },
                  { date: '18', month: 'OCT', title: 'Administrative Law', sub: 'Scenario Based • AI Graded' }
                ].map((exam) => (
                  <div key={exam.title} className="bg-white/5 rounded-lg p-4 flex gap-4 items-center border border-white/10 shadow-sm hover:bg-white/10 transition-colors cursor-pointer">
                    <div className="text-center bg-white/10 rounded px-2 py-1 min-w-[40px]">
                      <span className="block text-lg font-bold">{exam.date}</span>
                      <span className="block text-[8px] uppercase">{exam.month}</span>
                    </div>
                    <div>
                      <p className="font-bold text-sm">{exam.title}</p>
                      <p className="text-xs opacity-60">{exam.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full py-4 bg-[#cda72a] text-[#000a1e] rounded-full font-bold hover:bg-[#ffe089] transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95 outline-none">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
                Start Mock Exam
              </button>
            </div>
          </div>

          <div className="bg-surface-container p-6 rounded-xl border border-outline-variant/10 space-y-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary">lightbulb</span>
              <h4 className="font-bold text-primary">Daily Study Insight</h4>
            </div>
            <p className="text-sm text-on-surface-variant italic leading-relaxed">
              "Focus on Article 54 of the Moroccan Constitution today. It defines the Supreme Security Council's role..."
            </p>
            <div className="flex gap-2 flex-wrap">
              {['#Mudawana', '#Art54', '#Constitution'].map((tag) => (
                <span key={tag} className="px-2 py-1 bg-white rounded text-[10px] font-bold text-primary border border-outline-variant/20 shadow-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default Students;
