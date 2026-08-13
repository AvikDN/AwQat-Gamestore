import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FaUser, 
  FaGamepad, 
  FaLayerGroup, 
  FaStar, 
  FaClipboardList, 
  FaShoppingCart, 
  FaUsers, 
  FaSignOutAlt,
  FaHome,
  FaBars,
  FaTimes,
  FaHeart,
  FaHistory,
  FaCompass
} from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import logoImg from '../assets/Awqat_full.png'; 
import defaultImg from '../assets/pics/profile_icon.svg';
import { useAuthContext } from '../contexts/AuthContext';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logoutUser } = useAuthContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const isActive = (path) => location.pathname === path;
  const isAdmin = user?.groups?.includes("Admin");

  const adminNavItems = [
    { name: 'Profile', path: '/dashboard', icon: <FaUser className="text-xl" /> },
    { name: 'Games', path: '/dashboard/games', icon: <FaGamepad className="text-xl" /> },
    { name: 'Categories', path: '/dashboard/categories', icon: <FaLayerGroup className="text-xl" /> },
    { name: 'Review', path: '/dashboard/review', icon: <FaStar className="text-xl" /> },
    { name: 'Orders', path: '/dashboard/orders', icon: <FaClipboardList className="text-xl" /> },
    { name: 'Cart', path: '/dashboard/cart', icon: <FaShoppingCart className="text-xl" /> },
    { name: 'Users', path: '/dashboard/users', icon: <FaUsers className="text-xl" /> },
    { name: 'Wishlists', path: '/dashboard/wishlists', icon: <FaHeart className="text-xl" /> },
  ];

  const customerNavItems = [
    { name: 'Profile', path: '/dashboard', icon: <FaUser className="text-xl" /> },
    { name: 'Browse', path: '/products', icon: <FaCompass className="text-xl" /> },
    { name: 'Cart', path: '/dashboard/cart', icon: <FaShoppingCart className="text-xl" /> },
    { name: 'Orders', path: '/dashboard/orders', icon: <FaClipboardList className="text-xl" /> },
    { name: 'Wishlists', path: '/dashboard/wishlists', icon: <FaHeart className="text-xl" /> },
    { name: 'History', path: '/dashboard/history', icon: <FaHistory className="text-xl" /> },
  ];

  const navItems = isAdmin ? adminNavItems : customerNavItems;

  const getCurrentTabDetails = () => {
    const currentItem = navItems.find((item) => isActive(item.path));
    return currentItem ? currentItem : { name: 'Dashboard', icon: <FaUser className="text-xl" /> };
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logoutUser();
    setIsMenuOpen(false);
    navigate('/');

    const isMobile = window.innerWidth < 768;

    if (isMobile) {
      toast.success('Successfully logged out', {
        position: 'bottom-right',
        style: {
          background: '#1a1a1a',
          color: '#fff',
          border: '1px solid #333',
        },
        iconTheme: {
          primary: '#2ecc71',
          secondary: '#1a1a1a',
        },
      });
    } else {
      toast.custom((t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-sm w-full bg-[#1a1a1a] shadow-[0_8px_32px_0_rgba(0,0,0,0.8)] border border-[#333] rounded-2xl pointer-events-auto flex overflow-hidden`}
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
              className="w-full border border-transparent rounded-none p-4 flex items-center justify-center text-xs font-bold text-[#2ecc71] hover:bg-white/5 transition-colors focus:outline-none"
            >
              DISMISS
            </button>
          </div>
        </div>
      ), {
        position: 'bottom-right',
        duration: 4000,
      });
    }
  };

  const currentTab = getCurrentTabDetails();

  return (
    <>
      <Toaster />

      {/* Desktop Sidebar */}
      <motion.aside 
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="hidden md:flex w-[280px] h-screen bg-[#121212] flex-col p-6 border-r border-[#222] shrink-0 sticky top-0 overflow-y-auto"
      >
        
        {/* Logo Section */}
        <Link to="/" className="flex items-center justify-center mb-10 w-full hover:opacity-80 transition-opacity shrink-0">
          <motion.img 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            src={logoImg} 
            alt="AwQat Logo" 
            className="h-11 object-contain" 
          />
        </Link>

        {/* User Profile Card */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
          className="w-full bg-[#a3a3a3] rounded-2xl p-4 flex items-center gap-4 mb-8 shadow-md shrink-0"
        >
          <div className="w-12 h-12 bg-[#1a1a1a] border-2 border-[#2ecc71]/50 rounded-full flex items-center justify-center shrink-0 overflow-hidden">
            <img 
              src={user?.profile?.avatar || defaultImg} 
              alt={user?.profile?.full_name || 'User'} 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-black font-extrabold text-lg leading-tight truncate">
              {user?.profile?.full_name || user?.username || 'User'}
            </span>
            <span className="text-black/80 font-medium text-xs truncate">
              {user?.email || 'Guest'}
            </span>
          </div>
        </motion.div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-2 flex-grow">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <motion.div key={item.name} whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-colors ${
                    active
                      ? 'bg-[#222222] text-[#2ecc71] font-bold'
                      : 'text-gray-300 hover:bg-[#222222]/50 hover:text-[#2ecc71] font-semibold'
                  }`}
                >
                  {item.icon}
                  <span className="text-[15px]">{item.name}</span>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Log Out Button */}
        <motion.button 
          onClick={handleLogout}
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          className="mt-6 flex items-center gap-3 px-4 py-3 text-red-500 font-extrabold hover:bg-red-500/10 rounded-xl transition-colors w-full cursor-pointer shrink-0"
        >
          <span className="text-[17px]">Log Out</span>
          <FaSignOutAlt className="w-6 h-6 ml-auto" />
        </motion.button>

      </motion.aside>

      {/* Mobile Bottom Navigation Bar */}
      <motion.nav 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#121212] border-t border-[#222] flex items-center justify-between px-6 z-50 shadow-2xl"
      >
        
        {/* Left: Home Button */}
        <motion.div whileTap={{ scale: 0.9 }}>
          <Link
            to="/"
            className="flex flex-col items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <FaHome className="text-xl" />
            <span className="text-[10px] mt-1 font-medium">Home</span>
          </Link>
        </motion.div>

        {/* Middle: Current Page Icon & Name Indicator */}
        <div className="flex flex-col items-center justify-center text-[#2ecc71]">
          {currentTab.icon}
          <span className="text-[10px] mt-1 font-bold tracking-wide text-white">
            {currentTab.name}
          </span>
        </div>

        {/* Right: Drop-up Menu Trigger */}
        <div className="relative" ref={menuRef}>
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute bottom-16 right-0 w-56 bg-[#1a1a1a] border border-[#333] rounded-2xl shadow-2xl py-3 flex flex-col gap-1 z-50 backdrop-blur-xl max-h-[70vh] overflow-y-auto"
              >
                {navItems.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 text-sm font-semibold transition-colors ${
                        active ? 'text-[#2ecc71] bg-white/5 font-bold' : 'text-gray-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {item.icon}
                      <span>{item.name}</span>
                    </Link>
                  );
                })}

                <div className="border-t border-[#333] my-1 pt-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-500/10 w-full transition-colors text-left cursor-pointer"
                  >
                    <FaSignOutAlt className="text-xl" />
                    <span>Logout</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center justify-center text-gray-300 focus:outline-none cursor-pointer"
            aria-label="Toggle Menu"
          >
            <div className="w-11 h-11 rounded-full bg-[#222222] border border-[#333] flex items-center justify-center shadow-sm">
              {isMenuOpen ? <FaTimes className="text-lg text-white" /> : <FaBars className="text-lg text-white" />}
            </div>
            <span className="text-[10px] mt-1 font-medium text-gray-300">Menu</span>
          </motion.button>
        </div>

      </motion.nav>
    </>
  );
}