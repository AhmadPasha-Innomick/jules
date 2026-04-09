import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SourcePanel = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-surface-container-low rounded-lg p-4 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full font-bold text-sm text-primary outline-none"
      >
        <span>Legal Sources (4)</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          className="material-symbols-outlined"
        >
          expand_more
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 grid md:grid-cols-2 gap-3"
          >
            <div className="bg-surface-container-lowest p-3 rounded border border-outline-variant/10 text-xs flex gap-3 shadow-sm hover:border-tertiary/30 transition-colors">
              <span className="material-symbols-outlined text-tertiary">menu_book</span>
              <div>
                <p className="font-bold">Code des Droits Réels</p>
                <p className="text-outline">Articles 1-15, Dahir 1.11.178</p>
              </div>
            </div>
            <div className="bg-surface-container-lowest p-3 rounded border border-outline-variant/10 text-xs flex gap-3 shadow-sm hover:border-tertiary/30 transition-colors">
              <span className="material-symbols-outlined text-tertiary">gavel</span>
              <div>
                <p className="font-bold">Court of Cassation</p>
                <p className="text-outline">Decision #442, Civil Chamber</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SourcePanel;
