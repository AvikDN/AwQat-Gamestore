import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaGamepad, FaQuoteRight, FaStar } from 'react-icons/fa6';
import { Link } from 'react-router-dom';
import apiClient from '../../services/api-client';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 120, damping: 18 },
  },
};

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    apiClient.get('/reviews/')
      .then(response => {
        const data = response.data.results || response.data;
        setReviews(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Error fetching reviews:", error);
        setIsLoading(false);
      });
  }, []);

  const renderStars = (rating) => {
    const maxStars = 5;
    return (
      <div className="flex gap-1">
        {[...Array(maxStars)].map((_, i) => (
          <FaStar 
            key={i} 
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${i < rating ? 'text-[#2ecc71] drop-shadow-[0_0_8px_rgba(46,204,113,0.5)]' : 'text-zinc-700'}`} 
          />
        ))}
      </div>
    );
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <section className="w-full max-w-[1920px] mx-auto py-16 md:py-24 px-4 md:px-8 xl:px-12 relative overflow-hidden select-none">
      
      {/* Background Ambient Glow FX */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#2ecc71]/5 blur-[140px] pointer-events-none rounded-full" />

      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-4 relative z-10">
        <div>
          <motion.h2 
            className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Reviews
          </motion.h2>
        </div>
      </div>

      <motion.div 
        key={isLoading ? 'loading' : 'loaded'}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 lg:gap-6 relative z-10 items-start"
      >
        {isLoading 
          ? [...Array(4)].map((_, index) => (
              <motion.div
                key={`skeleton-${index}`}
                variants={itemVariants}
                className="flex flex-col"
              >
                <div className="animate-pulse flex flex-col h-full bg-[#18181c] border border-[#27272a] rounded-[22px] p-4 sm:p-6 shadow-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 sm:w-11 sm:h-11 bg-[#27272a] rounded-xl shrink-0"></div>
                    <div className="flex flex-col gap-2 min-w-0 flex-1">
                      <div className="h-4 bg-[#27272a] rounded w-20"></div>
                      <div className="h-3 bg-[#27272a] rounded w-14"></div>
                    </div>
                  </div>
                  <div className="h-16 sm:h-20 bg-[#27272a] rounded-xl w-full mb-4"></div>
                  <div className="mt-auto pt-3 border-t border-[#27272a] flex justify-between">
                    <div className="h-3 bg-[#27272a] rounded w-16"></div>
                    <div className="h-3 bg-[#27272a] rounded w-12"></div>
                  </div>
                </div>
              </motion.div>
            ))
          : reviews.map((review) => {
              const isExpanded = expandedId === review.id;
              const isLongText = review.text.length > 120; 

              return (
                <motion.div
                  layout
                  key={review.id}
                  variants={itemVariants}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  onClick={() => toggleExpand(review.id)}
                  className="flex flex-col h-full cursor-pointer"
                >
                  <motion.div 
                    layout
                    className="flex flex-col h-full bg-[#18181c] border border-[#27272a] hover:border-[#2ecc71]/40 rounded-[22px] p-4 sm:p-7 shadow-xl group relative overflow-hidden transition-colors duration-300"
                  >
                    {/* Subtle Background Cyber Watermark Icon */}
                    <FaQuoteRight className="absolute right-3 bottom-3 text-6xl text-white/[0.02] pointer-events-none group-hover:text-[#2ecc71]/[0.05] transition-colors duration-300" />

                    {/* User Profile & Rating Row */}
                    <motion.div layout className="flex items-center gap-3 mb-4 relative z-10">
                      <div 
                        className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#121212] border border-[#333] flex items-center justify-center shrink-0 bg-cover bg-center overflow-hidden shadow-inner group-hover:border-[#2ecc71]/50 transition-colors"
                        style={{ backgroundImage: review.user_avatar ? `url(${review.user_avatar})` : 'none' }}
                      >
                        {!review.user_avatar && (
                          <span className="text-[11px] sm:text-xs font-black text-[#2ecc71]">
                            {review.user ? review.user.substring(0, 2).toUpperCase() : '??'}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-col min-w-0">
                        <span className="text-white font-extrabold text-xs sm:text-base tracking-tight truncate group-hover:text-[#2ecc71] transition-colors">
                          {review.user}
                        </span>
                        <div className="mt-0.5 scale-90 sm:scale-100 origin-left">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                    </motion.div>

                    {/* Review Text Body */}
                    <motion.div layout className="flex-grow relative z-10 mb-5">
                      <p className={`text-zinc-300 text-xs sm:text-sm font-medium leading-relaxed ${isExpanded ? '' : 'line-clamp-4'}`}>
                        {review.text}
                      </p>
                      {isLongText && (
                        <span className="text-[#2ecc71] text-[10px] sm:text-xs font-bold mt-1 inline-block opacity-80 group-hover:opacity-100 transition-opacity">
                          {isExpanded ? 'Show less' : 'Read more'}
                        </span>
                      )}
                    </motion.div>

                    {/* Game Tag & Timestamp Footer */}
                    <motion.div layout className="mt-auto pt-3 border-t border-[#262626] flex flex-col sm:flex-row sm:items-center justify-between gap-2 relative z-10">
                      <div className="flex-1 min-w-0 flex items-center">
                        <Link 
                          to={`/product/${review.game}`} 
                          onClick={(e) => e.stopPropagation()} 
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#121212] border border-[#333] hover:border-[#2ecc71] hover:text-[#2ecc71] text-[9px] sm:text-[11px] font-bold text-white max-w-full transition-colors duration-200" 
                          title={review.game_title || `Game #${review.game}`}
                        >
                          <FaGamepad className="w-3 h-3 text-[#2ecc71] shrink-0" />
                          <span className="truncate">{review.game_title || `Game #${review.game}`}</span>
                        </Link>
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-bold text-zinc-500 shrink-0 whitespace-nowrap">
                        {formatDate(review.created_at)}
                      </span>
                    </motion.div>

                  </motion.div>
                </motion.div>
              );
            })
        }
      </motion.div>
    </section>
  );
}