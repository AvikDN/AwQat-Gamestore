import React, { useState } from 'react';
import logoImg from '../assets/pics/logo.png'; 
import heartImg from '../assets/pics/heart.png';

export default function Nav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="flex flex-wrap items-center justify-between w-full px-4 md:px-8 py-4 bg-transparent absolute top-0 left-0 z-50">
      
      {/* Logo */}
     {/* Replaced Text Logo with Image Logo */}
      <a href="/" className="z-20 flex items-center hover:opacity-80 transition-opacity">
        <img 
          src={logoImg} 
          alt="AwQat Logo" 
          className="h-8 md:h-12 w-auto object-contain" 
        />
        <span className="text-2xl md:text-4xl text-black tracking-tight">
          AwQat
        </span>
      </a>
      

      {/* Glass UI Center Links (Desktop Only) - Now absolutely centered */}
      <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center justify-center gap-4 lg:gap-8 px-6 lg:px-8 py-2 lg:py-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 shadow-lg z-20">
        <a href="/" className="font-bold text-black hover:opacity-70 transition-opacity">Home</a>
        <a href="/products" className="text-black hover:opacity-70 transition-opacity">Products</a>
        <a href="/contact" className="text-black hover:opacity-70 transition-opacity">Contact</a>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 md:gap-4 z-20">
        
        {/* Icons (Profile & Heart) */}
        <div className="flex items-center gap-2 md:gap-3 mr-2 md:mr-4">
          
          {/* Profile User Icon */}
          <svg className="w-6 h-6 md:w-8 md:h-8 text-gray-800 cursor-pointer hover:opacity-70 transition-opacity" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>

         {/* Replaced SVG Heart with Image Heart */}
          <img 
            src={heartImg} 
            alt="Favorite" 
            className="w-6 h-6 md:w-8 md:h-8 cursor-pointer hover:opacity-70 transition-opacity object-contain" 
          />
        
        </div>

        {/* Chevron Cart Container */}
        <div 
          className="flex items-center justify-center bg-gray-200 w-20 md:w-32 h-10 md:h-14 relative cursor-pointer hover:bg-gray-300 transition-colors" 
          style={{ clipPath: 'polygon(15% 0%, 100% 0, 100% 100%, 15% 100%, 0 50%)' }}
        >
          <svg className="w-5 h-5 md:w-6 md:h-6 text-black ml-2 md:ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        
        {/* Mobile Menu Hamburger Button */}
        <button 
          className="md:hidden flex items-center justify-center ml-2 text-black cursor-pointer hover:opacity-70"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle Menu"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden flex flex-col items-center gap-4 w-full mt-4 py-6 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 shadow-lg z-10">
          <a href="/" className="font-bold text-black text-lg hover:opacity-70 transition-opacity">Home</a>
          <a href="/products" className="text-black text-lg hover:opacity-70 transition-opacity">Products</a>
          <a href="/contact" className="text-black text-lg hover:opacity-70 transition-opacity">Contact</a>
        </div>
      )}

    </nav>
  );
}