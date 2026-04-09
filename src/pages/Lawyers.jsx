import React from 'react';
import { motion } from 'framer-motion';

const Lawyers = () => {
  return (
    <div className="p-8 space-y-12">
      {/* Featured Document Types */}
      <section>
        <div className="grid grid-cols-12 gap-6">
          {/* Corporate Law */}
          <motion.div
            whileHover={{ y: -5 }}
            className="col-span-8 group relative overflow-hidden rounded-3xl bg-primary-container p-8 text-white min-h-[300px] flex flex-col justify-end shadow-xl"
          >
            <div className="absolute inset-0 opacity-20 transition-transform duration-700 group-hover:scale-105"
                 style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAXL14ECGRbf9UoJCBt31Ua93NZtKPyrZymULSh7f_aNf1S-F2fAwwhjPKXlg02FpZgpyyWiCjpNqE3oDEDYJ3-ueIcuwdVTnoUOLrDdgxFiD9LmZ12qk4HCOyLPCjZIFjtvL8zbRrcC4tw9fh3GGBz8ckNgSo-R1JmbIWcTmh90jfIN6g800OExo6El4_MtCrxnmNbH2iHGS_FtogbVEkmE19rN_UXRoxe3GtRUydnqmjuVCEAwbwO04D9dVU3M2C1n4MedEB7JsbB")', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-primary to-transparent opacity-60"></div>
            <div className="relative z-10">
              <span className="bg-tertiary-container text-on-tertiary-container text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-4 inline-block shadow-sm">Premium Suite</span>
              <h3 className="text-3xl font-headline font-bold mb-2">Corporate Frameworks</h3>
              <p className="text-on-primary-container text-sm max-w-md mb-6">Unified templates for Moroccan S.A. and S.A.R.L structures with integrated BO registration docs.</p>
              <button className="flex items-center gap-2 text-sm font-semibold hover:text-tertiary-fixed transition-colors outline-none">
                Explore Library <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </motion.div>

          {/* Employment */}
          <motion.div
            whileHover={{ y: -5 }}
            className="col-span-4 rounded-3xl bg-surface-container-high p-8 flex flex-col justify-between border border-outline-variant/10 shadow-sm"
          >
            <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>work</span>
            <div>
              <h4 className="font-bold text-lg text-primary">Employment Law</h4>
              <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">Labor code compliant CDD/CDI contracts and internal regulation drafts.</p>
            </div>
            <button className="mt-4 text-xs font-bold text-primary flex items-center gap-1 group outline-none">
              Open Folders <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">chevron_right</span>
            </button>
          </motion.div>

          {/* Grid Items */}
          {[
            { icon: 'gavel', label: 'Litigation Filings', desc: 'Summons, statements of claim, and appeals for First Instance courts.' },
            { icon: 'description', label: 'Real Estate', desc: 'Lease agreements, property sale promises, and co-ownership statutes.' },
            { icon: 'history_edu', label: 'IP & Tech', desc: 'OMPIC registration drafts, software licensing, and NDAs.' }
          ].map((item) => (
            <motion.div
              key={item.label}
              whileHover={{ y: -2 }}
              className="col-span-4 rounded-3xl bg-surface-container-low p-6 transition-all hover:bg-surface-container-high cursor-pointer shadow-sm border border-outline-variant/5"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="material-symbols-outlined text-tertiary text-2xl">{item.icon}</span>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Templates</span>
              </div>
              <h5 className="font-bold text-md text-primary">{item.label}</h5>
              <p className="text-xs text-on-surface-variant mt-2">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Editor Preview Area */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-headline font-bold text-xl text-primary">Recent Active Draft</h2>
          <span className="text-xs font-medium px-3 py-1 bg-tertiary-container/20 text-tertiary rounded-full flex items-center gap-1">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            AI Enhanced
          </span>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-outline-variant/10 overflow-hidden">
          <div className="border-b border-outline-variant/5 px-6 py-4 flex items-center justify-between bg-surface-container-lowest">
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-primary/40">article</span>
              <span className="text-sm font-semibold text-primary">Commercial_Lease_Draft_v2.docx</span>
            </div>
            <div className="flex gap-2">
              {['print', 'download', 'share'].map((icon) => (
                <button key={icon} className="p-2 hover:bg-surface-container-low rounded-lg transition-colors text-slate-500">
                  <span className="material-symbols-outlined text-sm">{icon}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="p-10 space-y-6 max-h-[500px] overflow-y-auto no-scrollbar bg-[#fcfcfc]">
            <h4 className="text-center font-bold text-lg uppercase underline decoration-tertiary decoration-2 underline-offset-8 text-primary">CONTRAT DE BAIL COMMERCIAL</h4>
            <p className="text-sm leading-relaxed text-on-surface-variant italic text-center">Conformément à la Loi n° 49-16 relative aux baux d'immeubles...</p>
            <div className="space-y-4">
              <div className="bg-surface-container-low/50 p-4 rounded-xl border-l-4 border-tertiary shadow-sm">
                <p className="text-xs font-bold text-tertiary uppercase mb-1">Clause Art. 4 : Loyer et Révision</p>
                <p className="text-sm text-primary">Le loyer mensuel est fixé à [X,XXX] MAD, payable d'avance le premier jour de chaque mois...</p>
              </div>
              <p className="text-sm leading-relaxed text-on-surface">ENTRE LES SOUSSIGNÉS : <br/>1. La Société [NOM], S.A.R.L au capital de [MONTANT] DH, dont le siège social est à [ADRESSE]...</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Lawyers;
