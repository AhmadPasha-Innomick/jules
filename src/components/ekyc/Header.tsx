"use client";

import React from "react";
import { IdCard, ShieldCheck } from "lucide-react";

const Header: React.FC = () => {
    return (
        <header className="bg-blue-800 text-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <IdCard size={24} className="text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">TeleConnect EKYC</span>
                </div>

               
                <div className="hidden sm:flex items-center space-x-2 text-sm text-blue-100">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Secure Agent Portal</span>
                </div>
            </div>
        </header>
    );
};

export default Header;