import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaSignOutAlt, FaChevronDown } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import logoImg from '../assets/Awqat_full.png'; 
import heartImg from '../assets/pics/heart.png';
import defaultImg from '../assets/pics/profile_icon.svg';
import { useAuthContext } from '../contexts/AuthContext';
import { useCartContext } from '../contexts/CartContext';
import CartDropdown from './CartDropdown'; 
import GlassSurface from '../components/ReactBits/GlassSurface';

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const profileRef = useRef(null);
  const cartRef = useRef(null);
  
  const { user, logoutUser } = useAuthContext();
  const { totalItems } = useCartContext();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
      if (cartRef.current && !cartRef.current.contains(e.target)) {
        setIsCartOpen(false);
      }
    };
    document.addEventListener("mouseup", handleClickOutside);
    return () => document.removeEventListener("mouseup", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logoutUser();
    setIsProfileOpen(false);
    setIsMenuOpen(false);
    
    toast.custom((t) => (
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="max-w-sm w-full bg-[#1a1a1a] shadow-[0_8px_32px_0_rgba(0,0,0,0.8)] border border-[#333] rounded-2xl pointer-events-auto flex overflow-hidden"
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#2ecc71]/10 border border-[#2ecc71]/30 flex items-center justify-center text-[#2ecc71] font-bold text-lg">
              ✓
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white">
                Logged Out
              </p>
              <p className="mt-0.5 text-xs text-gray-400">
                You have successfully signed out of AwQat.
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-[#333]">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none p-4 flex items-center justify-center text-xs font-bold text-[#2ecc71] hover:bg-white/5 transition-colors focus:outline-none cursor-pointer"
          >
            DISMISS
          </button>
        </div>
      </motion.div>
    ), {
      position: 'bottom-right',
      duration: 4000,
    });
  };

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

  const isCustomer = user && user.groups && user.groups.includes("Customer");

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="flex flex-wrap items-center justify-between w-full px-3 sm:px-4 md:px-8 py-3 md:py-4 bg-transparent fixed top-0 left-0 z-50"
    >
      <Toaster 
        position="top-center"
        toastOptions={{
          style: { 
            background: '#18181c', 
            color: '#fff', 
            border: '1px solid #27272a', 
            borderRadius: '12px' 
          },
          success: { 
            iconTheme: { 
              primary: '#10b981', 
              secondary: '#18181c' 
            } 
          },
        }}
      />
      
      {/* Logo */}
      <NavLink to="/" className="z-20 flex items-center">
        <motion.img 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          src={logoImg} 
          alt="AwQat Logo" 
          className="h-7 sm:h-8 md:h-12 w-auto object-contain hover:opacity-80 transition-opacity" 
        />
      </NavLink>
      
      {/* Glass UI Center Links (Desktop Only - lg and up) */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="hidden lg:flex absolute left-1/2 -translate-x-1/2 z-20"
      >
        <GlassSurface
          width="max-content"
          height={60}
          borderRadius={30}
          blur={11}
          displace={0}          
          distortionScale={-180}  
          redOffset={0}
          greenOffset={15}        
          blueOffset={30}          
          brightness={50}
          opacity={0.93}
          backgroundOpacity={0}
          mixBlendMode="screen"
        >
          <div className="flex items-center justify-center gap-6 lg:gap-10 px-8 whitespace-nowrap h-full">
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
          </div>
        </GlassSurface>
      </motion.div>

      {/* Right Section */}
      <div className="flex items-center gap-1 sm:gap-2 md:gap-4 z-20">
        
       <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          
          {/* Auth Section / Profile */}
          {user ? (
            <>
              {/* Heart Icon (Wishlist) - Visible ONLY for Customers */}
              {isCustomer && (
                <NavLink to="/dashboard/wishlists" className="flex items-center justify-center" aria-label="Wishlist">
                  <motion.img 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    src={heartImg} 
                    alt="Favorite" 
                    className="w-6 h-6 md:w-7 md:h-7 cursor-pointer object-contain" 
                    style={{ filter: 'brightness(0) saturate(100%) invert(27%) sepia(91%) saturate(7483%) hue-rotate(356deg) brightness(99%) contrast(115%)' }}
                  />
                </NavLink>
              )}

              <div className="relative" ref={profileRef}>
                <motion.button
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      navigate('/dashboard');
                    } else {
                      setIsProfileOpen(!isProfileOpen);
                    }
                  }}
                  className="flex items-center gap-1 sm:gap-2 p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden border-2 border-[#2ecc71]/50 bg-[#1a1a1a]">
                    <img
                      src={user.profile?.avatar || defaultImg}
                      alt={user.profile?.full_name || user.username}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <FaChevronDown className="text-white text-xs hidden lg:block mr-1" />
                </motion.button>

                {/* Profile Dropdown - Desktop Only (lg and up) */}
                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="hidden lg:block absolute right-0 top-full mt-2 w-56 bg-neutral-900/95 backdrop-blur-2xl rounded-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.8)] border border-[#333] py-2 z-50 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-[#333]">
                        <p className="font-bold text-white truncate">
                          {user.profile?.full_name || user.username}
                        </p>
                        <p className="text-sm text-gray-400 truncate">
                          {user.email}
                        </p>
                      </div>

                      <div className="py-2 flex flex-col">
                        <NavLink
                          to="/dashboard"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-[#2ecc71] transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <FaUser />
                          <span>Dashboard</span>
                        </NavLink>
                      </div>

                      <div className="border-t border-[#333] pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors text-left cursor-pointer"
                        >
                          <FaSignOutAlt />
                          <span>Logout</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="hidden lg:flex items-center gap-4">
              <NavLink to="/login" className="text-white hover:text-[#2ecc71] font-bold transition-colors">
                Login
              </NavLink>
              <NavLink to="/register" className="bg-[#2ecc71] text-black px-5 py-2 rounded-full font-bold hover:bg-[#27ae60] hover:shadow-[0_0_15px_rgba(46,204,113,0.5)] transition-all">
                Sign Up
              </NavLink>
            </div>
          )}
        </div>

{/* Standard Cart Icon Toggle */}
<div className="relative flex items-center justify-center" ref={cartRef}>
  <motion.button 
    onClick={() => setIsCartOpen(!isCartOpen)}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    className="relative flex items-center justify-center cursor-pointer transition-colors"
    aria-label="Cart"
  >
    {/* Standalone Green Cart Icon (No Glow) */}
    <svg 
      className="w-6 h-6 md:w-7 md:h-7 text-[#2ecc71] transition-colors" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>

    {/* Dynamic Cart Badge */}
    <AnimatePresence>
      {totalItems > 0 && (
        <motion.span 
          initial={{ scale: 0, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          exit={{ scale: 0, opacity: 0 }} 
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="absolute -top-1.5 -right-2 bg-white text-black text-[10px] md:text-[11px] font-black px-1.5 py-0.5 rounded-full shadow-sm flex items-center justify-center min-w-[18px] min-h-[18px] border border-gray-200"
        >
          {totalItems}
        </motion.span>
      )}
    </AnimatePresence>
  </motion.button>

  {/* Cart Dropdown Flyout Window */}
  <CartDropdown isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
</div>
        
        {/* Tablet & Mobile Menu Hamburger Button (Visible below lg) */}
        <motion.button 
          whileTap={{ scale: 0.8 }}
          className="lg:hidden flex items-center justify-center ml-1 sm:ml-2 text-white cursor-pointer hover:text-[#2ecc71] transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle Menu"
        >
          <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </motion.button>

      </div>

      {/* Tablet & Mobile Menu Dropdown (Visible below lg) */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="lg:hidden flex flex-col items-center gap-4 w-full mt-4 py-6 rounded-2xl bg-black/90 backdrop-blur-xl border border-[#333] shadow-2xl z-50 overflow-hidden"
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

            {/* Auth Tablet & Mobile Links */}
            {user ? (
              <motion.div variants={linkVariants} className="w-full px-8 pt-4 border-t border-[#333] mt-2 flex flex-col gap-3">
                <NavLink 
                  to="/dashboard" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center gap-3 w-full py-3 rounded-xl font-bold text-white bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <FaUser className="text-[#2ecc71]"/> Dashboard
                </NavLink>
                <button 
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-3 w-full py-3 rounded-xl font-bold text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-colors cursor-pointer"
                >
                  <FaSignOutAlt /> Logout
                </button>
              </motion.div>
            ) : (
              <motion.div variants={linkVariants} className="w-full px-8 pt-4 border-t border-[#333] mt-2 flex flex-col gap-3">
                <NavLink 
                  to="/login" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center w-full py-3 rounded-xl font-bold text-white border border-[#333] hover:border-[#2ecc71] transition-colors"
                >
                  Login
                </NavLink>
                <NavLink 
                  to="/register" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center w-full py-3 rounded-xl font-extrabold text-black bg-[#2ecc71] hover:bg-[#27ae60] transition-colors shadow-[0_0_15px_rgba(46,204,113,0.3)]"
                >
                  Sign Up
                </NavLink>
              </motion.div>
            )}

          </motion.div>
        )}
      </AnimatePresence>

    </motion.nav>
  );
}