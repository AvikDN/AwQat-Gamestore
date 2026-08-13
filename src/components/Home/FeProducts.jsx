import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(10); 

  useEffect(() => {
    const calculateVisibleItems = () => {
      const width = window.innerWidth;
      if (width >= 1280) {
        setVisibleCount(10); 
      } else if (width >= 1024) {
        setVisibleCount(8);  
      } else if (width >= 768) {
        setVisibleCount(6);  
      } else {
        setVisibleCount(4);  
      }
    };

    calculateVisibleItems();

    window.addEventListener('resize', calculateVisibleItems);
    return () => window.removeEventListener('resize', calculateVisibleItems);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    
    apiClient.get('/games/')
      .then(response => {
        // Filter out upcoming/inactive games and games with price 0
        const activeProducts = response.data.results.filter(
          product => product.active && Number(product.price) > 0
        );
        setProducts(activeProducts);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Error fetching featured products:", error);
        setIsLoading(false);
      });
  }, []);

  const displayedProducts = products.slice(0, visibleCount);

  return (
    <section className="w-full max-w-[1920px] mx-auto py-12 md:py-20 px-4 md:px-8 xl:px-12 overflow-visible">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 md:mb-12 gap-4">
        <motion.h2 
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Featured Products
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Link to="/products" className="text-white font-bold hover:text-[#2ecc71] transition-colors text-lg md:text-xl">
            See All
          </Link>
        </motion.div>
      </div>

      <motion.div 
        key={isLoading ? 'loading' : 'loaded'}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 xl:gap-8"
      >
        {isLoading 
          ? [...Array(visibleCount)].map((_, index) => (
              <motion.div
                key={`skeleton-${index}`}
                variants={itemVariants}
                className="flex flex-col"
              >
                <div className="animate-pulse flex flex-col h-full">
                  <div className="relative w-full aspect-square rounded-2xl md:rounded-[2rem] mb-4 sm:mb-6 bg-[#333]"></div>
                  <div className="flex flex-col px-1 sm:px-2 mb-4 sm:mb-6">
                    <div className="h-5 sm:h-7 bg-[#444] rounded w-3/4 mb-2 sm:mb-3"></div>
                    <div className="h-4 sm:h-6 bg-[#222] rounded w-1/2"></div>
                  </div>
                  <div className="mt-auto w-full h-[48px] sm:h-[60px] md:h-[72px] bg-[#333] rounded-xl md:rounded-2xl"></div>
                </div>
              </motion.div>
            ))
          : displayedProducts.map((product) => {
              const imageUrl = product.images && product.images.length > 0 ? product.images[0].image : null;
              
              const originalPrice = Number(product.price);
              const discountValue = Number(product.discount || 0);
              const hasDiscount = discountValue > 0;
              
              const finalPrice = hasDiscount 
                ? (discountValue <= 100 ? originalPrice - (originalPrice * discountValue) / 100 : originalPrice - discountValue) 
                : originalPrice;

              return (
                <motion.div
                  key={product.id}
                  variants={itemVariants}
                  whileHover={{ y: -8 }}
                  className="flex flex-col"
                >
                  <Link to={`/product/${product.id}`} className="block group cursor-pointer flex-grow">
                    
                    <div className="relative w-full aspect-square rounded-2xl md:rounded-[2rem] flex items-center justify-center mb-4 sm:mb-6 bg-white/5 overflow-hidden border border-transparent group-hover:border-[#2ecc71]/30 transition-colors duration-300">
                        {hasDiscount && (
                          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 bg-[#2ecc71] text-black font-extrabold text-xs sm:text-sm px-3 py-1 rounded-full shadow-[0_0_10px_rgba(46,204,113,0.5)]">
                            Sale
                          </div>
                        )}

                        {imageUrl ? (
                          <img 
                            src={imageUrl} 
                            alt={product.title} 
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <>
                            <div className="absolute top-2 left-2 sm:top-4 sm:left-4 w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full bg-white/20"></div>
                            <svg className="w-3/4 h-3/4 text-white/30 absolute bottom-[-4px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 20L12 10L16 15L20 9L24 15" />
                                <path d="M4 20h20" />
                            </svg>
                          </>
                        )}
                    </div>

                    <div className="flex flex-col px-1 sm:px-2 mb-4 sm:mb-6">
                      <span className="font-extrabold text-white text-base sm:text-lg md:text-xl mb-1 group-hover:text-[#2ecc71] transition-colors line-clamp-1">{product.title}</span>
                      
                      {hasDiscount ? (
                        <div className="flex items-center flex-wrap gap-x-2 text-sm sm:text-base md:text-lg">
                          <span className="text-gray-400 line-through font-bold">{originalPrice} ৳</span>
                          <span className="text-white font-extrabold">{finalPrice.toFixed(0)} ৳</span>
                        </div>
                      ) : (
                        <span className="text-gray-300 font-bold text-sm sm:text-base md:text-lg">{originalPrice} ৳</span>
                      )}
                    </div>

                  </Link>

                  <button className="mt-auto w-full py-3 sm:py-4 md:py-5 bg-[#b0b0b0] hover:bg-[#2ecc71] hover:shadow-[0_0_15px_rgba(46,204,113,0.5)] transition-all duration-300 rounded-xl md:rounded-2xl flex items-center justify-center group cursor-pointer">
                    <svg className="w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8 text-black group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </button>
                  
                </motion.div>
              );
            })
        }
      </motion.div>

    </section>
  );
}