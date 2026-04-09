import React from 'react';
import { motion } from 'framer-motion';
import AIInput from '../components/AIInput';
import SourcePanel from '../components/SourcePanel';

const Citizens = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 pt-24 pb-12">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="font-headline text-display-lg font-bold text-primary tracking-tight mb-8">
          How can I assist your legal <span className="text-tertiary">journey</span> today?
        </h1>

        <AIInput />

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <span className="text-label-sm text-on-surface-variant uppercase tracking-widest mr-2 py-1.5 flex items-center">Quick Actions:</span>
          {['Divorce Procedure', 'Labor Law Rights', 'Business Registration'].map((action) => (
            <button key={action} className="px-4 py-1.5 rounded-full bg-surface-container text-body-md hover:bg-surface-container-high transition-colors shadow-sm">
              {action}
            </button>
          ))}
        </div>
      </motion.section>

      {/* Example AI Response */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-24"
      >
        <div className="bg-surface-container-lowest p-8 rounded-xl shadow-lg space-y-6 border border-outline-variant/10">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary-container text-on-tertiary-container font-medium text-sm">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              High Confidence (98%)
            </div>
            <span className="text-label-sm text-outline">Generated 2m ago</span>
          </div>

          <div className="prose prose-slate max-w-none">
            <h3 className="font-headline text-xl font-bold text-primary">Summary of Moroccan Land Ownership Law (Moulkia)</h3>
            <p className="text-body-md leading-relaxed text-on-surface-variant">
              Based on the <strong>Dahir No. 1-11-178</strong> (Real Estate Code), ownership of unregistered land in Morocco is traditionally proven through a "Moulkia" deed. To upgrade this to a "Conservation Foncière" title, you must follow the administrative requisition process...
            </p>
          </div>

          <SourcePanel />

          <div className="mt-12 text-body-sm text-on-surface-variant/70 border-t border-outline-variant/10 pt-6 italic">
            Smart Legal AI provides information based on current Moroccan legislation. This is not a substitute for professional legal advice from a registered member of the Moroccan Bar Association.
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default Citizens;
