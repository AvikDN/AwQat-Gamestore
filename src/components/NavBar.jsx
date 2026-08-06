import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import logoImg from '../assets/Awqat_full.png'; 
import heartImg from '../assets/pics/heart.png';

export default function Nav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="flex flex-wrap items-center justify-between w-full px-4 md:px-8 py-4 bg-transparent fixed top-0 left-0 z-50 transition-all duration-300">
      
      {/* Logo */}
      <NavLink to="/" className="z-20 flex items-center hover:opacity-80 transition-opacity">
        <img 
          src={logoImg} 
          alt="AwQat Logo" 
          className="h-8 md:h-12 w-auto object-contain" 
        />
      </NavLink>
      

      {/* Glass UI Center Links (Desktop Only) */}
      <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center justify-center gap-4 lg:gap-8 px-6 lg:px-8 py-2 lg:py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg z-20">
        
        {/* 2. Replaced <a> with <NavLink> and utilized the isActive callback for dynamic styling */}
        <NavLink 
          to="/" 
          className={({ isActive }) => 
            `font-bold transition-all duration-300 ${isActive ? 'text-[#2ecc71] drop-shadow-[0_0_8px_rgba(46,204,113,0.8)]' : 'text-white hover:text-gray-300'}`
          }
        >
          Home
        </NavLink>
        
        <NavLink 
          to="/products" 
          className={({ isActive }) => 
            `font-bold transition-all duration-300 ${isActive ? 'text-[#2ecc71] drop-shadow-[0_0_8px_rgba(46,204,113,0.8)]' : 'text-white hover:text-gray-300'}`
          }
        >
          Products
        </NavLink>
        
        <NavLink 
          to="/contact" 
          className={({ isActive }) => 
            `font-bold transition-all duration-300 ${isActive ? 'text-[#2ecc71] drop-shadow-[0_0_8px_rgba(46,204,113,0.8)]' : 'text-white hover:text-gray-300'}`
          }
        >
          Contact
        </NavLink>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 md:gap-4 z-20">
        
        {/* Icons (Profile & Heart) */}
        <div className="flex items-center gap-2 md:gap-3 mr-2 md:mr-4">
          
          {/* Profile User Icon */}
          <svg className="w-6 h-6 md:w-8 md:h-8 text-white cursor-pointer hover:text-[#2ecc71] transition-colors" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>

          {/* Heart Icon */}
          <img 
            src={heartImg} 
            alt="Favorite" 
            className="w-6 h-6 md:w-8 md:h-8 cursor-pointer hover:scale-110 transition-transform object-contain filter brightness-0 invert" 
          />
        </div>

        {/* Chevron Cart Container */}
        <div 
          className="flex items-center justify-center bg-[#2ecc71] w-20 md:w-32 h-10 md:h-14 relative cursor-pointer hover:bg-[#27ae60] hover:shadow-[0_0_15px_rgba(46,204,113,0.5)] transition-all duration-300" 
          style={{ clipPath: 'polygon(15% 0%, 100% 0, 100% 100%, 15% 100%, 0 50%)' }}
        >
          <svg className="w-5 h-5 md:w-6 md:h-6 text-black ml-2 md:ml-3 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        
        {/* Mobile Menu Hamburger Button */}
        <button 
          className="md:hidden flex items-center justify-center ml-2 text-white cursor-pointer hover:text-[#2ecc71] transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle Menu"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
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
        <div className="md:hidden flex flex-col items-center gap-4 w-full mt-4 py-6 rounded-2xl bg-black/90 backdrop-blur-xl border border-[#333] shadow-2xl z-50">
          <NavLink 
            to="/" 
            onClick={() => setIsMenuOpen(false)}
            className={({ isActive }) => 
              `font-bold text-xl transition-all duration-300 ${isActive ? 'text-[#2ecc71]' : 'text-white hover:text-gray-300'}`
            }
          >
            Home
          </NavLink>
          
          <NavLink 
            to="/products" 
            onClick={() => setIsMenuOpen(false)}
            className={({ isActive }) => 
              `font-bold text-xl transition-all duration-300 ${isActive ? 'text-[#2ecc71]' : 'text-white hover:text-gray-300'}`
            }
          >
            Products
          </NavLink>
          
          <NavLink 
            to="/contact" 
            onClick={() => setIsMenuOpen(false)}
            className={({ isActive }) => 
              `font-bold text-xl transition-all duration-300 ${isActive ? 'text-[#2ecc71]' : 'text-white hover:text-gray-300'}`
            }
          >
            Contact
          </NavLink>
        </div>
      )}

    </nav>
  );
}