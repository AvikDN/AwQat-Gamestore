import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaGamepad, FaQuoteRight, FaStar } from 'react-icons/fa6';
import { Link } from 'react-router-dom';
import apiClient from '../../services/api-client';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 140, damping: 16 },
  },
};

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  // Responsive Count State
  const getStepSize = () => window.innerWidth < 768 ? 4 : 8;
  const [step, setStep] = useState(getStepSize());
  const [visibleCount, setVisibleCount] = useState(getStepSize());

  useEffect(() => {
    const handleResize = () => {
      setStep(getStepSize());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchReviews = (pageNum) => {
    if (pageNum === 1) setIsLoading(true);
    else setIsLoadingMore(true);

    apiClient.get(`/reviews/?page=${pageNum}`)
      .then(response => {
        const rawData = response.data?.results || response.data;
        const list = Array.isArray(rawData) ? rawData : [];
        const hasNext = !!response.data?.next;

        setHasNextPage(hasNext);
        setPage(pageNum);

        setReviews(prevReviews => {
          const combined = pageNum === 1 ? list : [...prevReviews, ...list];
          
          // Strict deduplication: Only keep ONE review per unique user
          const seenUsers = new Set();
          const filteredReviews = combined.filter((review) => {
            if (!review.user) return true; // Fallback for bad data
            if (seenUsers.has(review.user)) return false;
            seenUsers.add(review.user);
            return true;
          });

          // SMART FAILSAFE: If heavy duplicate filtering wiped out the entire new page 
          // and there is another page available, auto-fetch the next page immediately 
          // so the "See More" button doesn't visually stall.
          if (pageNum > 1 && filteredReviews.length === prevReviews.length && hasNext) {
            setTimeout(() => fetchReviews(pageNum + 1), 0);
          } else {
            setIsLoadingMore(false);
          }

          return filteredReviews;
        });
      })
      .catch(error => {
        console.error("Error fetching reviews:", error);
        setIsLoadingMore(false);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchReviews(1);
  }, []);

  const handleSeeMore = () => {
    if (isLoadingMore) return;
    
    const nextCount = visibleCount + step;
    setVisibleCount(nextCount);
    
    // If revealing these items takes us past the currently loaded reviews, fetch the next page
    if (nextCount > reviews.length && hasNextPage) {
      fetchReviews(page + 1);
    }
  };

  const renderStars = (rating) => {
    const maxStars = 5;
    return (
      <div className="flex gap-0.5 sm:gap-1">
        {[...Array(maxStars)].map((_, i) => (
          <FaStar
            key={i}
            className={`w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 ${
              i < rating
                ? 'text-[#2ecc71] drop-shadow-[0_0_6px_rgba(46,204,113,0.4)]'
                : 'text-zinc-700'
            }`}
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
      day: 'numeric',
    });
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const displayedReviews = reviews.slice(0, visibleCount);
  const showSeeMoreButton = hasNextPage || visibleCount < reviews.length;

  return (
    <section className="w-full max-w-[1920px] mx-auto py-8 md:py-16 px-3 sm:px-6 xl:px-12 relative overflow-hidden select-none">
      
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[200px] md:h-[300px] bg-[#2ecc71]/5 blur-[100px] md:blur-[140px] pointer-events-none rounded-full" />

      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-5 md:mb-10 gap-2 relative z-10">
        <motion.h2
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight"
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Reviews
        </motion.h2>
      </div>

      <motion.div
        key={isLoading ? 'loading' : 'loaded'}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-30px' }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5 relative z-10 items-start"
      >
        {isLoading
          ? [...Array(step)].map((_, index) => (
              <motion.div
                key={`skeleton-${index}`}
                variants={itemVariants}
                className="flex flex-col"
              >
                <div className="animate-pulse flex flex-col h-full bg-[#18181c] border border-[#27272a] rounded-2xl p-3 sm:p-5 shadow-xl">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-7 h-7 sm:w-10 sm:h-10 bg-[#27272a] rounded-lg shrink-0" />
                    <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                      <div className="h-3.5 bg-[#27272a] rounded w-16 sm:w-20" />
                      <div className="h-2.5 bg-[#27272a] rounded w-12 sm:w-14" />
                    </div>
                  </div>
                  <div className="h-12 sm:h-16 bg-[#27272a] rounded-lg w-full mb-3" />
                  <div className="mt-auto pt-2.5 border-t border-[#27272a] flex justify-between">
                    <div className="h-2.5 bg-[#27272a] rounded w-14 sm:w-16" />
                    <div className="h-2.5 bg-[#27272a] rounded w-10 sm:w-12" />
                  </div>
                </div>
              </motion.div>
            ))
          : displayedReviews.map((review, index) => {
              const isExpanded = expandedId === review.id;
              const isLongText = review.text.length > 100;

              return (
                <motion.div
                  layout
                  key={review.id ? `rev-${review.id}` : `rev-idx-${index}`}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "50px" }}
                  variants={itemVariants}
                  whileHover={{ y: -4 }}
                  onClick={() => toggleExpand(review.id)}
                  className="flex flex-col h-full cursor-pointer"
                >
                  <motion.div
                    layout
                    className="flex flex-col h-full bg-[#18181c] border border-[#27272a] hover:border-[#2ecc71]/40 rounded-2xl p-3 sm:p-5 shadow-lg group relative overflow-hidden transition-colors duration-300"
                  >
                    <FaQuoteRight className="absolute right-2 bottom-2 text-4xl sm:text-6xl text-white/[0.02] pointer-events-none group-hover:text-[#2ecc71]/[0.05] transition-colors duration-300" />

                    <motion.div layout className="flex items-center gap-2.5 mb-3 relative z-10">
                      <div
                        className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg bg-[#121212] border border-[#333] flex items-center justify-center shrink-0 bg-cover bg-center overflow-hidden shadow-inner group-hover:border-[#2ecc71]/50 transition-colors"
                        style={{
                          backgroundImage: review.user_avatar
                            ? `url(${review.user_avatar})`
                            : 'none',
                        }}
                      >
                        {!review.user_avatar && (
                          <span className="text-[9px] sm:text-xs font-black text-[#2ecc71]">
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

                    <motion.div layout className="flex-grow relative z-10 mb-3">
                      <p
                        className={`text-zinc-300 text-xs sm:text-sm font-medium leading-relaxed ${
                          isExpanded ? '' : 'line-clamp-3 sm:line-clamp-4'
                        }`}
                      >
                        {review.text}
                      </p>
                      {isLongText && (
                        <span className="text-[#2ecc71] text-[10px] sm:text-xs font-bold mt-0.5 inline-block opacity-80 group-hover:opacity-100 transition-opacity">
                          {isExpanded ? 'Show less' : 'Read more'}
                        </span>
                      )}
                    </motion.div>

                    <motion.div
                      layout
                      className="mt-auto pt-2.5 border-t border-[#262626] flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 relative z-10"
                    >
                      <div className="flex-1 min-w-0 flex items-center">
                        <Link
                          to={`/product/${review.game}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg bg-[#121212] border border-[#333] hover:border-[#2ecc71] hover:text-[#2ecc71] text-[8px] sm:text-[11px] font-bold text-white max-w-full transition-colors duration-200"
                          title={review.game_title || `Game #${review.game}`}
                        >
                          <FaGamepad className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#2ecc71] shrink-0" />
                          <span className="truncate">
                            {review.game_title || `Game #${review.game}`}
                          </span>
                        </Link>
                      </div>
                      <span className="text-[9px] sm:text-[11px] font-bold text-zinc-500 shrink-0 whitespace-nowrap">
                        {formatDate(review.created_at)}
                      </span>
                    </motion.div>
                  </motion.div>
                </motion.div>
              );
            })}
      </motion.div>

      {/* See More Button */}
      {showSeeMoreButton && !isLoading && (
        <div className="flex justify-center mt-6 md:mt-10 relative z-10">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSeeMore}
            disabled={isLoadingMore}
            className="flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl font-extrabold text-xs sm:text-sm text-black bg-[#2ecc71] hover:bg-[#27ae60] transition-colors shadow-[0_0_15px_rgba(46,204,113,0.3)] disabled:opacity-70"
          >
            {isLoadingMore && (
              <svg className="animate-spin h-3.5 w-3.5 sm:h-4 sm:w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isLoadingMore ? 'Loading...' : 'See More'}
          </motion.button>
        </div>
      )}
    </section>
  );
}