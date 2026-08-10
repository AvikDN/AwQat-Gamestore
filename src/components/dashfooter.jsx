import React from 'react';
import { Link } from 'react-router-dom';

export default function DashboardFooter() {
  return (
    <footer className="w-full bg-[#121212] border-t border-[#333] py-4 px-6 md:px-8 mt-auto shrink-0">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Copyright Text */}
        <p className="text-white font-bold text-sm md:text-base tracking-wide">
          2026 AwQat. All rights reserved.
        </p>

        {/* Footer Links */}
        <div className="flex items-center gap-6 md:gap-8">
          <Link 
            to="/about" 
            className="text-gray-400 hover:text-white font-semibold transition-colors text-sm md:text-base"
          >
            About us
          </Link>
          <Link 
            to="/privacy" 
            className="text-gray-400 hover:text-white font-semibold transition-colors text-sm md:text-base"
          >
            Privacy & policy
          </Link>
        </div>
        
      </div>
    </footer>
  );
}