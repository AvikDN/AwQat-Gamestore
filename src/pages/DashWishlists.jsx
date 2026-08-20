import React from 'react';
import { motion } from 'framer-motion';
import { FaHeart, FaScrewdriverWrench } from 'react-icons/fa6';

const DashWishlists = () => {
  return (
    <div className="w-full min-h-screen bg-transparent text-white font-sans p-3 sm:p-6 lg:p-8 flex justify-center items-start select-none">
      <div className="w-full max-w-[1600px] mx-auto space-y-4 sm:space-y-6 md:space-y-8 relative pt-2 sm:pt-4 md:pt-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-4 sm:space-y-6 md:space-y-8"
        >
          {/* Floating Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222222] pb-4 sm:pb-5">
            <div className="flex items-center gap-3">
              <FaHeart className="text-2xl sm:text-4xl text-white shrink-0" />
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                My Wishlist
              </h1>
            </div>
          </div>

          {/* Coming Soon Section */}
          <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-2xl p-8 sm:p-12 md:p-16 shadow-lg flex flex-col items-center justify-center min-h-[50vh] text-center space-y-5">
            
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 sm:w-24 sm:h-24 bg-[#121212] border border-[#333] rounded-full flex items-center justify-center shadow-inner mb-2"
            >
              <FaScrewdriverWrench className="text-3xl sm:text-4xl text-[#2ecc71]" />
            </motion.div>

            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-wide">
              Feature Coming Soon
            </h2>
            
            <p className="text-sm sm:text-base text-gray-400 max-w-lg mx-auto leading-relaxed font-medium">
              We are working on bringing your wishlist to life! Soon, you will be able to save your favorite games here, get notified about sales, and build your ultimate dream library!
            </p>

            <div className="mt-8 flex gap-2">
              <div className="w-2 h-2 rounded-full bg-[#333] animate-pulse"></div>
              <div className="w-2 h-2 rounded-full bg-[#333] animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 rounded-full bg-[#333] animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashWishlists;