import React from 'react';
import { motion } from 'framer-motion';

const AIInput = ({ placeholder = "Draft a rental agreement or ask about Moroccan Family Code..." }) => {
  return (
    <div className="relative group">
      <div className="glass-prompt p-4 rounded-full shadow-2xl flex items-center gap-4 border border-outline-variant/10 group-focus-within:bg-surface-container-lowest transition-all">
        <span className="material-symbols-outlined text-outline ml-4">auto_awesome</span>
        <input
          className="flex-1 bg-transparent border-none focus:ring-0 text-lg py-2 outline-none"
          placeholder={placeholder}
          type="text"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="milled-button p-3 rounded-full text-white flex items-center justify-center shadow-lg"
        >
          <span className="material-symbols-outlined">arrow_upward</span>
        </motion.button>
      </div>
    </div>
  );
};

export default AIInput;
