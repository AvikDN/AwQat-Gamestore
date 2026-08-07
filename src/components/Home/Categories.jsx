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

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const rotations = [-6, 3, -3, 6, -2, 2, -6, 6];

  useEffect(() => {
    setIsLoading(true);
    
    apiClient.get('/categories')
      .then(response => {
        setCategories(response.data.results);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Error fetching categories:", error);
        setIsLoading(false);
      });
  }, []);

  return (
    <section className="w-full max-w-[1200px] mx-auto py-16 px-4 md:px-8 overflow-visible">
      
      <div className="flex items-center justify-center mb-16">
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
        // 1. Added a dynamic key here so the animation replays when data loads
        key={isLoading ? 'loading' : 'loaded'}
        className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {isLoading 
          ? [...Array(8)].map((_, index) => {
              const baseRotation = rotations[index % rotations.length];
              
              return (
                <motion.div 
                  key={`skeleton-${index}`} 
                  variants={itemVariants}
                  style={{ rotate: baseRotation }}
                  className="flex flex-col p-3 pb-8 bg-[#8c8c8c] rounded-lg shadow-xl"
                >
                  <div className="bg-gray-300 animate-pulse aspect-[4/3] rounded w-full shadow-inner"></div>
                  <div className="mt-6 flex justify-center">
                    <div className="h-6 w-24 bg-gray-400 animate-pulse rounded"></div>
                  </div>
                </motion.div>
              );
            })
          : categories.map((cat, index) => {
              const baseRotation = rotations[index % rotations.length];
              
              return (
                <motion.div 
                  key={cat.id} 
                  variants={itemVariants}
                  whileHover={{ 
                    scale: 1.05, 
                    rotate: 0, 
                    y: -10, 
                    transition: { type: "spring", stiffness: 300, damping: 20 } 
                  }}
                  whileTap={{ scale: 0.95 }}
                  style={{ rotate: baseRotation }}
                  className="flex flex-col p-3 pb-8 bg-[#8c8c8c] rounded-lg shadow-xl cursor-pointer"
                >
                  <div className="bg-white aspect-[4/3] rounded flex items-center justify-center shadow-inner overflow-hidden">
                    <img 
                      src={cat.image} 
                      alt={cat.name} 
                      className="w-16 h-16 object-contain" 
                    />
                  </div>
                  <div className="text-center mt-6 font-extrabold text-xl text-black tracking-wide">
                    {cat.name}
                  </div>
                </motion.div>
              );
            })
        }
      </motion.div>
    </section>
  );
}