import React from 'react';
import { motion } from 'framer-motion';

const Media = () => {
  return (
    <div className="pt-12 pb-12 px-6 lg:px-12 max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
      {/* Left Column: Featured & Content */}
      <div className="lg:col-span-8 space-y-16">
        <section>
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-tertiary-container text-on-tertiary-container px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>spark</span>
              Editorial Feature
            </span>
            <h2 className="font-headline font-bold text-sm uppercase tracking-[0.2em] text-outline">Legal Explanations of Real-World Events</h2>
          </div>
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="relative group overflow-hidden rounded-xl bg-primary-container aspect-[21/9] shadow-2xl"
          >
            <img
              alt="Featured Case"
              className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmKpFIpHIXo1KdDfhFllgUno7Gnr3rfI4_VlTkGbkZCOFjAd3YqMn394MTE7KIyDsgFOLCLAO7OKO5o7pysj2fPtCzt_ttEl8tGguzBaPE-1Sy0lm71tzuszelKvUAcgajMP1vTx9ehXBsvOn5uOBRf-gMsGgHI4O9ls8XKgZLP7ZedkcmLecbi4AR43ngWERA4rXvP8LidUDMy8cj1RKINdBknwXqntB9cIBRnuwLHZ39boIlX-_lmNNgg2iEHjWpsCfXNi2qEZCz"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent flex flex-col justify-end p-10">
              <span className="text-tertiary-fixed font-bold text-sm mb-2">Video Documentary • 14 min</span>
              <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-white max-w-2xl leading-tight mb-4 shadow-sm">
                The Arbitration of the High-Stakes Stadium Contract Dispute
              </h1>
              <div className="flex gap-4">
                <button className="bg-white text-primary px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-tertiary-fixed transition-colors shadow-lg outline-none">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                  Watch Now
                </button>
                <button className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-white/20 transition-colors shadow-lg outline-none">
                  <span className="material-symbols-outlined">bookmark</span>
                  Save for later
                </button>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Video & Podcast Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Video Item */}
          <motion.div whileHover={{ y: -5 }} className="space-y-4 cursor-pointer">
            <div className="relative aspect-video rounded-xl overflow-hidden bg-surface-container shadow-md">
              <img
                alt="Legal Basics"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAgCLMp8b2VCvZbU2s-Kly7gYoBmeh6x-wisVEyNE-fJpHP7XYp7WtU4Iji_QD5pRldxAYud6HMUOA1JmRqBSZiZgbPn4oQiL3E6mstBlLw3daMkn1BruCn5KrywdPR_LGY6iVA3IOj3ZIws-TrbSvLReOt5PgmRbQTg_BMzcJDUgpsZCmhIUcbaX_64Jz8fMgKBUAW_AqQ1EEt8y7_eiJ003ym0vkBVQnFKqc1SKDrQ4yEAUl0bid0ozCKMNXTIJ0a2LrJBQnoyN9A"
              />
              <div className="absolute bottom-3 right-3 bg-black/70 text-white text-[10px] px-2 py-1 rounded">12:45</div>
            </div>
            <div>
              <span className="text-xs font-bold text-tertiary uppercase tracking-wider">Legal Basics for Citizens</span>
              <h3 className="font-headline text-xl font-bold mt-1 leading-snug text-primary">Tenant Rights in Moroccan Urban Leases: 2024 Update</h3>
              <p className="text-on-surface-variant text-sm mt-2 line-clamp-2">An AI-synthesized guide to the latest modifications in residential property law.</p>
            </div>
          </motion.div>

          {/* Podcast Item */}
          <motion.div whileHover={{ y: -5 }} className="bg-surface-container-low p-6 rounded-xl flex gap-6 shadow-sm border border-outline-variant/10 cursor-pointer">
            <div className="w-32 h-32 flex-shrink-0 bg-primary-container rounded-lg overflow-hidden relative shadow-md">
              <img
                alt="Podcast Cover"
                className="w-full h-full object-cover opacity-80"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBw8pFdW6v-WftPpJ6zO7jqieuwhttWRFFjAo9yOSIB3PfPJpsMNAYEv7MRZWdSwAfijQwAU-g-9HVZ3MWdyx5zzjpjyOPVhKalKmHJyL6gSWTM7SdAytBnm9Uzh1Q8VVxMDil9_eIkl0dgFUVbHvUc9eQiRdb31x8q6CneL3gN1dqNNss9V2u8jsaQHbutfOJCPSvjsIA9C96QkTrXd5h0ark4zKUnii2plqw50wK5MsgAW8ch3CwkeJBuWpe6NRqJYGD5kGxDrjxv"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-3xl">mic</span>
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-xs font-bold text-tertiary uppercase tracking-wider">The Digital Jurist Podcast</span>
              <h3 className="font-headline text-lg font-bold mt-1 text-primary">S1 E14: Moroccan Fintech Regulations</h3>
              <p className="text-on-surface-variant text-sm mt-1">32 mins • AI Analysis Included</p>
              <div className="mt-4 flex items-center gap-3">
                <button className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white hover:bg-secondary transition-colors shadow-sm outline-none">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                </button>
                <div className="h-1 w-24 bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="bg-tertiary h-full w-1/3 transition-all"></div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* News Section */}
        <section className="space-y-8">
          <div className="flex justify-between items-end border-b border-outline-variant/30 pb-4">
            <h2 className="font-headline text-3xl font-extrabold text-primary">Moroccan Legal News</h2>
            <a className="text-sm font-bold text-tertiary flex items-center gap-1 hover:underline transition-all" href="#">View All Archive <span className="material-symbols-outlined text-sm">arrow_forward</span></a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-surface-container-lowest p-8 rounded-xl shadow-lg border border-outline-variant/10">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
                <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Breaking Analysis</span>
              </div>
              <h3 className="font-headline text-2xl font-bold mb-4 text-primary">Constitutional Court Issues Landmark Ruling on Digital Privacy</h3>
              <p className="text-on-surface-variant mb-6 leading-relaxed">The recent decision regarding data sovereignty marks a pivotal moment for technology firms operating within the Kingdom. Our AI breaks down the 140-page document into actionable insights...</p>
              <div className="flex items-center gap-4">
                <img
                  alt="Expert"
                  className="w-10 h-10 rounded-full object-cover border border-outline-variant/20 shadow-sm"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDVc2o9o_2ltVF72-mLZ230Q9R4VtV_fq-mD8X_v_qmq_umkk2yHV8orVEqmP_f_xP3dzjb5ZDMjlEl1gyT9lvLjjwDMmFlfYth61vKhGiO_ndvprF1E1aa-LHmgeU2XC7Xo6lvkY7ie-Z-nm7BrveJBkCfflZwGq4Vo1Y6Y94DN5rBAtYUvanXSPKz7_UNXLeuIckji2AuBd16M4ZsZ98odaOAxWuxE4nRo0Dag2YWO3h3667rdxlQILmdhzKeW1AXxfe6tClkEJYr"
                />
                <div>
                  <p className="text-sm font-bold text-primary">Dr. Ahmed Mansouri</p>
                  <p className="text-xs text-on-surface-variant">Senior Legal Analyst • 4 min read</p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <motion.div whileHover={{ scale: 1.02 }} className="bg-surface-container-high p-6 rounded-xl shadow-sm cursor-pointer">
                <span className="text-[10px] font-black uppercase text-secondary tracking-widest">Legislative Update</span>
                <h4 className="font-headline font-bold mt-2 text-primary">New Corporate Governance Code Drafted</h4>
                <p className="text-xs text-on-surface-variant mt-2">Impact on SMEs and family-owned businesses analyzed by our AI model.</p>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} className="bg-surface-container p-6 rounded-xl shadow-sm cursor-pointer border border-outline-variant/5">
                <span className="text-[10px] font-black uppercase text-tertiary tracking-widest">Intellectual Property</span>
                <h4 className="font-headline font-bold mt-2 text-primary">Argan Oil Trademark Dispute Resolved</h4>
                <p className="text-xs text-on-surface-variant mt-2">How geographic indications are being enforced in international courts.</p>
              </motion.div>
            </div>
          </div>
        </section>
      </div>

      {/* Right Column: AI Contextual Sidebar */}
      <aside className="lg:col-span-4 space-y-8">
        <div className="bg-primary-container text-white p-8 rounded-2xl sticky top-28 shadow-2xl border border-white/5">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-tertiary-fixed text-3xl">psychology</span>
            <h2 className="font-headline text-xl font-bold">AI Contextual Insight</h2>
          </div>
          <div className="space-y-6">
            <div className="bg-white/10 p-5 rounded-xl border border-white/10 shadow-inner">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-tertiary-fixed">Topic: Sports Law Scandals</span>
                <span className="material-symbols-outlined text-sm text-tertiary-fixed">info</span>
              </div>
              <p className="text-sm font-medium leading-relaxed italic text-slate-200">
                "In simple terms, the current football contract dispute revolves around 'Unilateral Termination without Just Cause'. Under Moroccan FRMF regulations, this can lead to 'Sporting Sanctions'—meaning player bans, not just fines."
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest opacity-80">Key Concepts Mentioned</h4>
              <div className="flex flex-wrap gap-2">
                {['Force Majeure', 'Arbitration Clause', 'CAS Jurisdiction'].map((concept) => (
                  <span key={concept} className="bg-white/5 px-3 py-1 rounded-full text-[11px] border border-white/10 hover:bg-white/10 transition-colors cursor-default">
                    {concept}
                  </span>
                ))}
              </div>
            </div>
            <div className="pt-6 border-t border-white/10">
              <p className="text-xs text-slate-400 mb-4 opacity-70">Want a deeper explanation of a specific news item?</p>
              <div className="relative">
                <input
                  className="w-full bg-white/5 border-none rounded-lg text-sm py-3 px-4 focus:ring-1 focus:ring-tertiary-fixed placeholder:text-slate-500 outline-none transition-all"
                  placeholder="Ask the Digital Jurist..."
                  type="text"
                />
                <button className="absolute right-2 top-1.5 p-1.5 text-tertiary-fixed hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Media;
