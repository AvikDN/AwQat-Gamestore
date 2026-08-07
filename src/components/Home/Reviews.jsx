import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import apiClient from '../../services/api-client';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
};

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    
    apiClient.get('/reviews/')
      .then(response => {
        setReviews(response.data.results);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Error fetching reviews:", error);
        setIsLoading(false);
      });
  }, []);

  // Helper function to render stars based on the rating number
  const renderStars = (rating) => {
    const maxStars = 5;
    return (
      <div className="flex gap-1">
        {[...Array(maxStars)].map((_, i) => (
          <svg 
            key={i} 
            className={`w-5 h-5 md:w-6 md:h-6 ${i < rating ? 'text-[#2ecc71]' : 'text-gray-600'}`} 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
    );
  };

  // Helper function to format the ISO date string
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <section className="w-full max-w-[1920px] mx-auto py-12 md:py-20 px-4 md:px-8 xl:px-12 overflow-visible">
      
      <div className="flex flex-col mb-8 md:mb-12">
        <motion.h2 
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Recent Reviews
        </motion.h2>
      </div>

      <motion.div 
        key={isLoading ? 'loading' : 'loaded'}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 xl:gap-8"
      >
        {isLoading 
          ? [...Array(4)].map((_, index) => (
              <motion.div
                key={`skeleton-${index}`}
                variants={itemVariants}
                className="flex flex-col"
              >
                <div className="animate-pulse flex flex-col h-full bg-[#1a1a1a] border border-[#333] rounded-2xl md:rounded-[2rem] p-6 sm:p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-[#333] rounded-full"></div>
                    <div className="flex flex-col gap-2">
                      <div className="h-5 bg-[#444] rounded w-24"></div>
                      <div className="h-4 bg-[#222] rounded w-32"></div>
                    </div>
                  </div>
                  <div className="h-20 bg-[#333] rounded w-full mb-4"></div>
                  <div className="mt-auto h-4 bg-[#222] rounded w-20"></div>
                </div>
              </motion.div>
            ))
          : reviews.map((review) => (
              <motion.div
                key={review.id}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                className="flex flex-col h-full"
              >
                <div className="flex flex-col h-full bg-[#1a1a1a] border border-[#333] hover:border-[#2ecc71]/50 rounded-2xl md:rounded-[2rem] p-6 sm:p-8 transition-colors duration-300 shadow-xl group">
                  
                  {/* User Info & Rating */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center justify-center w-12 h-12 bg-[#2ecc71]/10 rounded-full border border-[#2ecc71]/30 text-[#2ecc71] font-bold text-xl uppercase group-hover:bg-[#2ecc71] group-hover:text-black transition-colors duration-300">
                      {review.user.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white font-extrabold text-lg sm:text-xl tracking-wide">{review.user}</span>
                      {renderStars(review.rating)}
                    </div>
                  </div>

                  {/* Review Text */}
                  <div className="text-gray-300 text-base sm:text-lg leading-relaxed mb-6 flex-grow">
                    "{review.text}"
                  </div>

                  {/* Date */}
                  <div className="mt-auto pt-4 border-t border-[#333] flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-500">Game ID: {review.game}</span>
                    <span className="text-sm font-medium text-gray-500">{formatDate(review.created_at)}</span>
                  </div>
                  
                </div>
              </motion.div>
            ))
        }
      </motion.div>
    </section>
  );
}