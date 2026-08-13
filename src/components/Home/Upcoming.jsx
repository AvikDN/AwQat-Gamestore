import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import apiClient from '../../services/api-client';

export default function Upcoming() {
  const [isHovered, setIsHovered] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiClient.get('/games/upcoming/')
      .then(response => {
        // Handle both paginated and non-paginated responses
        const data = Array.isArray(response.data) ? response.data : (response.data.results || []);
        setSlides(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching upcoming games:", error);
        setLoading(false);
      });
  }, []);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  const nextSlide = () => {
    if (slides.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex === slides.length - 1 ? 0 : prevIndex + 1));
  };

  const prevSlide = () => {
    if (slides.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? slides.length - 1 : prevIndex - 1));
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    let timer;
    if (!isHovered && slides.length > 1) {
      timer = setInterval(() => {
        setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
      }, 10000);
    }
    return () => clearInterval(timer);
  }, [isHovered, slides.length]);

  if (loading) {
    return (
      <div className="relative w-full max-w-[1600px] mx-auto flex items-center justify-center py-8 md:py-16 px-2 md:px-8 h-[350px] sm:h-[450px] md:h-[600px]">
        <div className="w-[90%] md:w-[88%] h-full bg-[#1a1a1a] animate-pulse shadow-2xl rounded-xl"></div>
      </div>
    );
  }

  if (slides.length === 0) {
    return null;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative w-full max-w-[1600px] mx-auto flex items-center justify-center py-8 md:py-16 px-2 md:px-8"
    >
      
      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={prevSlide}
        className="absolute left-1 md:left-4 z-10 text-gray-500 hover:text-white transition-colors cursor-pointer"
      >
        <svg className="w-8 h-8 md:w-14 md:h-14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </motion.button>

      {/* Main Overflow Container */}
      <div 
        className="relative w-[90%] md:w-[88%] h-[350px] sm:h-[450px] md:h-[600px] lg:h-[75vh] max-h-[850px] bg-[#d9d9d9] overflow-hidden group shadow-2xl rounded-xl"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        
        <motion.div 
          className="flex w-full h-full"
          initial={false}
          animate={{ x: `-${currentIndex * 100}%` }}
          transition={{ type: "tween", ease: "easeInOut", duration: 0.7 }}
        >
          {slides.map((slide, index) => {
            const imageUrl = slide.images && slide.images.length > 0 ? slide.images[0].image : null;
            const isUpcoming = !slide.active;

            return (
              <div key={slide.id} className="w-full h-full shrink-0 relative overflow-hidden bg-black">
                
                {/* Upcoming Corner Ribbon */}
                {isUpcoming && (
                  <div className="absolute top-0 right-0 z-40 w-40 h-40 pointer-events-none">
                    <div className="absolute top-8 -right-12 w-[200px] rotate-45 bg-white text-black text-center font-extrabold py-2 shadow-lg uppercase tracking-widest text-sm md:text-base">
                      Upcoming
                    </div>
                  </div>
                )}

                {/* Direct Video Background */}
                {slide.video && index === currentIndex && (
                  <video
                    src={slide.video}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none scale-105 md:scale-110 z-0"
                  />
                )}

                {/* Thumbnail Fallback / Cover */}
                {imageUrl && (
                  <motion.img 
                    src={imageUrl}
                    alt={slide.title}
                    initial={false}
                    animate={{ opacity: (isHovered && slide.video && index === currentIndex) ? 0 : 1 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 w-full h-full object-cover z-10 pointer-events-none"
                  />
                )}

                {/* Responsive Frosted Glass Mask */}
                <div 
                  className="absolute left-0 top-0 w-3/4 md:w-3/5 lg:w-1/2 h-full bg-white/10 backdrop-blur-md flex flex-col justify-center px-6 md:px-16 lg:px-24 z-20 pointer-events-none"
                  style={{
                    WebkitMaskImage: 'linear-gradient(to right, black 50%, transparent 100%)',
                    maskImage: 'linear-gradient(to right, black 50%, transparent 100%)'
                  }}
                >
                  <motion.h2 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-3xl md:text-5xl lg:text-7xl font-bold text-white mb-4 md:mb-8 tracking-wide pointer-events-auto leading-tight line-clamp-2 md:line-clamp-3 drop-shadow-lg"
                  >
                    {slide.title}
                  </motion.h2>
                  
                  <Link to={`/product/${slide.id}`} className="pointer-events-auto w-max">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-[#2ecc71] text-black px-5 py-2.5 md:px-8 md:py-4 rounded-xl text-sm md:text-lg font-extrabold hover:bg-[#27ae60] hover:shadow-[0_0_15px_rgba(46,204,113,0.5)] transition-all shadow-lg cursor-pointer"
                    >
                      Check Details
                    </motion.button>
                  </Link>
                </div>

                {/* Scaled Play Icon */}
                {slide.video && (
                  <motion.div 
                    initial={false}
                    animate={{ 
                      opacity: (isHovered && index === currentIndex) ? 0 : 1,
                      scale: (isHovered && index === currentIndex) ? 0.8 : 1 
                    }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
                  >
                    <svg className="w-20 h-20 md:w-32 md:h-32 text-white/80 ml-12 md:ml-24 drop-shadow-2xl" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 6v12l10-6z" />
                    </svg>
                  </motion.div>
                )}

              </div>
            );
          })}
        </motion.div>
      </div>

      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={nextSlide}
        className="absolute right-1 md:right-4 z-10 text-gray-500 hover:text-white transition-colors cursor-pointer"
      >
        <svg className="w-8 h-8 md:w-14 md:h-14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </motion.button>

      {/* Pagination Dots */}
      <div className="absolute bottom-1 md:bottom-4 left-1/2 -translate-x-1/2 flex gap-2 md:gap-3 z-10">
        {slides.map((_, index) => (
          <motion.div 
            key={index}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => goToSlide(index)}
            className={`w-2.5 h-2.5 md:w-4 md:h-4 rounded-full cursor-pointer transition-colors ${
              currentIndex === index ? 'bg-[#2ecc71]' : 'bg-[#d1d1d1] hover:bg-white'
            }`}
          />
        ))}
      </div>

    </motion.div>
  );
}