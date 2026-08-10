import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import apiClient from '../services/api-client';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
};

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    
    // Fetch categories with pagination query
    apiClient.get(`/categories/?page=${page}`)
      .then(response => {
        setCategories(response.data.results || []);
        setHasNext(!!response.data.next);
        setHasPrev(!!response.data.previous);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Error fetching categories:", error);
        setIsLoading(false);
      });
      
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  const handleNextPage = () => {
    if (hasNext) setPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    if (hasPrev) setPage(prev => prev - 1);
  };

  return (
    <div className="bg-black min-h-screen w-full text-white selection:bg-[#2ecc71] selection:text-black">
      <div className="max-w-[1400px] mx-auto p-4 pt-28 md:p-8 md:pt-32 xl:p-12 xl:pt-36">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-16 gap-4">
          <div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white mb-2"
            >
              All Categories
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-gray-400 text-lg md:text-xl font-medium"
            >
              Explore games by your favorite genres.
            </motion.p>
          </div>
        </div>

        {/* Grid */}
        <motion.div 
          key={isLoading ? 'loading' : `page-${page}`}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
        >
          {isLoading ? (
            // Skeletons
            [...Array(8)].map((_, index) => (
              <motion.div 
                key={`skeleton-${index}`} 
                variants={itemVariants}
                className="bg-[#1a1a1a] border border-[#333] rounded-3xl overflow-hidden flex flex-col h-[380px]"
              >
                <div className="w-full h-48 bg-[#222] animate-pulse"></div>
                <div className="p-6 flex flex-col flex-1 gap-4">
                  <div className="h-8 bg-[#333] animate-pulse rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-[#222] animate-pulse rounded w-full"></div>
                    <div className="h-4 bg-[#222] animate-pulse rounded w-5/6"></div>
                    <div className="h-4 bg-[#222] animate-pulse rounded w-4/6"></div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : categories.length > 0 ? (
            categories.map((category) => (
              <motion.div 
                key={category.id} 
                variants={itemVariants}
                whileHover={{ y: -10 }}
                className="group bg-[#1a1a1a] border border-[#333] hover:border-[#2ecc71]/50 rounded-3xl overflow-hidden flex flex-col h-full shadow-lg hover:shadow-[0_10px_30px_rgba(46,204,113,0.15)] transition-all duration-300 cursor-pointer"
              >
                <Link to={`/products?category=${category.id}`} className="flex flex-col h-full">
                  <div className="w-full h-48 bg-black relative overflow-hidden">
                    {category.image ? (
                      <img 
                        src={category.image} 
                        alt={category.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#222]">
                        <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] to-transparent opacity-80"></div>
                  </div>
                  
                  <div className="p-6 flex flex-col flex-1">
                    <h2 className="text-2xl font-extrabold text-white mb-3 group-hover:text-[#2ecc71] transition-colors">
                      {category.name}
                    </h2>
                    <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
                      {category.description || "No description available for this category."}
                    </p>
                    
                    <div className="mt-auto pt-6 flex items-center text-[#2ecc71] font-bold text-sm">
                      Browse Games 
                      <svg className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <p className="text-gray-500 text-xl font-bold">No categories found.</p>
            </div>
          )}
        </motion.div>

        {/* Pagination Controls */}
        {!isLoading && (hasPrev || hasNext) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-4 mt-16"
          >
            <button
              onClick={handlePrevPage}
              disabled={!hasPrev}
              className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                hasPrev 
                  ? 'border-[#2ecc71] text-[#2ecc71] hover:bg-[#2ecc71] hover:text-black cursor-pointer' 
                  : 'border-[#333] text-[#555] cursor-not-allowed'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="text-white font-extrabold text-lg px-4">
              Page {page}
            </div>

            <button
              onClick={handleNextPage}
              disabled={!hasNext}
              className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                hasNext 
                  ? 'border-[#2ecc71] text-[#2ecc71] hover:bg-[#2ecc71] hover:text-black cursor-pointer shadow-[0_0_10px_rgba(46,204,113,0.3)] hover:shadow-[0_0_20px_rgba(46,204,113,0.6)]' 
                  : 'border-[#333] text-[#555] cursor-not-allowed'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </motion.div>
        )}

      </div>
    </div>
  );
}