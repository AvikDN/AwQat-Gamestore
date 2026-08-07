import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import logoImg from '../assets/Awqat_full.png'; 
import heartImg from '../assets/pics/heart.png';

export default function Nav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Stagger variants for the mobile menu links
  const menuVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
  };

  const linkVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="flex flex-wrap items-center justify-between w-full px-4 md:px-8 py-4 bg-transparent fixed top-0 left-0 z-50"
    >
      
      {/* Logo */}
      <NavLink to="/" className="z-20 flex items-center">
        <motion.img 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          src={logoImg} 
          alt="AwQat Logo" 
          className="h-8 md:h-12 w-auto object-contain hover:opacity-80 transition-opacity" 
        />
      </NavLink>
      
      {/* Glass UI Center Links (Desktop Only) */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center justify-center gap-4 lg:gap-8 px-6 lg:px-8 py-2.5 lg:py-3.5 rounded-full bg-neutral-900/40 backdrop-blur-2xl border border-white/25 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] ring-1 ring-white/10 z-20"
      >
        <NavLink 
          to="/" 
          className={({ isActive }) => 
            `relative font-bold transition-colors duration-300 ${isActive ? 'text-[#2ecc71]' : 'text-white hover:text-gray-300'}`
          }
        >
          {({ isActive }) => (
            <>
              Home
              {isActive && (
                <motion.div 
                  layoutId="desktop-nav-underline"
                  className="absolute -bottom-1.5 left-0 right-0 h-[5px] bg-[#2ecc71] rounded-full"
                />
              )}
            </>
          )}
        </NavLink>
        
        <NavLink 
          to="/products" 
          className={({ isActive }) => 
            `relative font-bold transition-colors duration-300 ${isActive ? 'text-[#2ecc71]' : 'text-white hover:text-gray-300'}`
          }
        >
          {({ isActive }) => (
            <>
              Products
              {isActive && (
                <motion.div 
                  layoutId="desktop-nav-underline"
                  className="absolute -bottom-1.5 left-0 right-0 h-[5px] bg-[#2ecc71] rounded-full"
                />
              )}
            </>
          )}
        </NavLink>
        
        <NavLink 
          to="/contact" 
          className={({ isActive }) => 
            `relative font-bold transition-colors duration-300 ${isActive ? 'text-[#2ecc71]' : 'text-white hover:text-gray-300'}`
          }
        >
          {({ isActive }) => (
            <>
              Contact
              {isActive && (
                <motion.div 
                  layoutId="desktop-nav-underline"
                  className="absolute -bottom-1.5 left-0 right-0 h-[5px] bg-[#2ecc71] rounded-full"
                />
              )}
            </>
          )}
        </NavLink>
      </motion.div>

      {/* Right Section */}
      <div className="flex items-center gap-2 md:gap-4 z-20">
        
        {/* Icons (Profile & Heart) */}
        <div className="flex items-center gap-2 md:gap-3 mr-2 md:mr-4">
          
          {/* Profile User Icon */}
          <motion.svg 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-6 h-6 md:w-8 md:h-8 text-white cursor-pointer hover:text-[#2ecc71] transition-colors" 
            fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
          </motion.svg>

          {/* Heart Icon */}
          <motion.img 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            src={heartImg} 
            alt="Favorite" 
            className="w-6 h-6 md:w-8 md:h-8 cursor-pointer object-contain filter brightness-0 invert" 
          />
        </div>

        {/* Chevron Cart Container */}
        <motion.div 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center justify-center bg-[#2ecc71] w-20 md:w-32 h-10 md:h-14 relative cursor-pointer hover:bg-[#27ae60] hover:shadow-[0_0_15px_rgba(46,204,113,0.5)] transition-colors duration-300" 
          style={{ clipPath: 'polygon(15% 0%, 100% 0, 100% 100%, 15% 100%, 0 50%)' }}
        >
          <svg className="w-5 h-5 md:w-6 md:h-6 text-black ml-2 md:ml-3 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </motion.div>
        
        {/* Mobile Menu Hamburger Button */}
        <motion.button 
          whileTap={{ scale: 0.8 }}
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
        </motion.button>

      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="md:hidden flex flex-col items-center gap-4 w-full mt-4 py-6 rounded-2xl bg-black/90 backdrop-blur-xl border border-[#333] shadow-2xl z-50 overflow-hidden"
          >
            <motion.div variants={linkVariants}>
              <NavLink 
                to="/" 
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) => 
                  `relative font-bold text-xl transition-colors duration-300 ${isActive ? 'text-[#2ecc71]' : 'text-white hover:text-gray-300'}`
                }
              >
                {({ isActive }) => (
                  <>
                    Home
                    {isActive && (
                      <motion.div 
                        layoutId="mobile-nav-underline"
                        className="absolute -bottom-1.5 left-0 right-0 h-[5px] bg-[#2ecc71] rounded-full"
                      />
                    )}
                  </>
                )}
              </NavLink>
            </motion.div>
            
            <motion.div variants={linkVariants}>
              <NavLink 
                to="/products" 
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) => 
                  `relative font-bold text-xl transition-colors duration-300 ${isActive ? 'text-[#2ecc71]' : 'text-white hover:text-gray-300'}`
                }
              >
                {({ isActive }) => (
                  <>
                    Products
                    {isActive && (
                      <motion.div 
                        layoutId="mobile-nav-underline"
                        className="absolute -bottom-1.5 left-0 right-0 h-[5px] bg-[#2ecc71] rounded-full"
                      />
                    )}
                  </>
                )}
              </NavLink>
            </motion.div>
            
            <motion.div variants={linkVariants}>
              <NavLink 
                to="/contact" 
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) => 
                  `relative font-bold text-xl transition-colors duration-300 ${isActive ? 'text-[#2ecc71]' : 'text-white hover:text-gray-300'}`
                }
              >
                {({ isActive }) => (
                  <>
                    Contact
                    {isActive && (
                      <motion.div 
                        layoutId="mobile-nav-underline"
                        className="absolute -bottom-1.5 left-0 right-0 h-[5px] bg-[#2ecc71] rounded-full"
                      />
                    )}
                  </>
                )}
              </NavLink>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.nav>
  );
}