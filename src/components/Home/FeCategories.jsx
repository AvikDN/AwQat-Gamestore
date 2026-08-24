import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
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

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Expanded rotations array for the scattered effect
  const rotations = [-5, 4, -3, 5, -2, 3, -4, 2, -5, 4];

  useEffect(() => {
    setIsLoading(true);
    
    apiClient.get('/categories')
      .then(response => {
        setCategories(response.data.results || []);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Error fetching categories:", error);
        setIsLoading(false);
      });
  }, []);

  // Fetch up to 9 items so the "See More" card makes exactly 10 (Max 2 rows of 5)
  const displayedCategories = categories.slice(0, 9);

  return (
    <section className="w-full max-w-[1000px] mx-auto py-16 px-4 md:px-8 overflow-visible">
      
      <div className="flex items-center justify-center mb-12">
        <motion.h2 
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Categories
        </motion.h2>
      </div>

      <motion.div 
        key={isLoading ? 'loading' : 'loaded'}
        // Changed to Flexbox with wrap and center alignment to fix gaps
        className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {isLoading 
          ? [...Array(10)].map((_, index) => {
              const baseRotation = rotations[index % rotations.length];
              
              return (
                <motion.div 
                  key={`skeleton-${index}`} 
                  variants={itemVariants}
                  style={{ rotate: baseRotation }}
                  // Fixed smaller width for the skeleton cards
                  className="flex flex-col w-[130px] sm:w-[150px] md:w-[160px] p-2 pb-5 bg-[#8c8c8c] rounded-md shadow-xl"
                >
                  <div className="bg-gray-800 animate-pulse aspect-[4/3] rounded-sm w-full shadow-inner"></div>
                  <div className="mt-3 flex justify-center">
                    <div className="h-3 w-16 bg-gray-500 animate-pulse rounded"></div>
                  </div>
                </motion.div>
              );
            })
          : (
            <>
              {displayedCategories.map((cat, index) => {
                const baseRotation = rotations[index % rotations.length];
                
                return (
                  <motion.div 
                    key={cat.id} 
                    variants={itemVariants}
                    whileHover={{ 
                      scale: 1.15, 
                      rotate: 0, 
                      y: -10,
                      zIndex: 40, // Pops card to the front
                      transition: { type: "spring", stiffness: 300, damping: 20 } 
                    }}
                    whileTap={{ scale: 0.95 }}
                    style={{ rotate: baseRotation }}
                    onClick={() => navigate(`/category/${cat.id}`)}
                    // Fixed smaller width, reduced padding
                    className="flex flex-col w-[130px] sm:w-[140px] md:w-[160px] p-2 pb-5 bg-[#8c8c8c] transition-colors rounded-md shadow-[0_10px_20px_rgba(0,0,0,0.4)] cursor-pointer group relative"
                  >
                    {/* Black Inner Background */}
                    <div className="bg-black aspect-[4/3] rounded-sm flex items-center justify-center shadow-[inset_0_0_15px_rgba(0,0,0,0.8)] border border-[#000] overflow-hidden">
                      <img 
                        src={cat.image} 
                        alt={cat.name} 
                        // Invert color to contrast against black, smaller icon sizes
                        className="w-10 h-10 md:w-12 md:h-12 object-contain invert opacity-90 group-hover:opacity-100 transition-opacity duration-300" 
                      />
                    </div>
                    <div className="text-center mt-3 font-extrabold text-[10px] sm:text-xs text-black uppercase tracking-wider group-hover:text-black truncate px-1">
                      {cat.name}
                    </div>
                  </motion.div>
                );
              })}

              {/* See More Card */}
              <motion.div 
                key="see-more" 
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.15, 
                  rotate: 0, 
                  y: -10, 
                  zIndex: 40,
                  transition: { type: "spring", stiffness: 300, damping: 20 } 
                }}
                whileTap={{ scale: 0.95 }}
                style={{ rotate: rotations[displayedCategories.length % rotations.length] }}
                onClick={() => navigate('/categories/')}
                className="flex flex-col w-[130px] sm:w-[140px] md:w-[160px] p-2 pb-5 bg-[#8c8c8c] transition-colors rounded-md shadow-[0_10px_20px_rgba(0,0,0,0.4)] cursor-pointer relative"
              >
                <div className="bg-black aspect-[4/3] rounded-sm flex items-center justify-center shadow-[inset_0_0_15px_rgba(0,0,0,0.8)] border border-[#000] overflow-hidden">
                  <svg className="w-10 h-10 md:w-12 md:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
                <div className="text-center mt-3 font-extrabold text-[10px] sm:text-xs text-black uppercase tracking-wider truncate px-1">
                  See More
                </div>
              </motion.div>
            </>
          )
        }
      </motion.div>
    </section>
  );
}