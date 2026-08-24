import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import apiClient from '../../services/api-client';

export default function Upcoming() {
  const [isHovered, setIsHovered] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Ref to prevent hyper-fast scrolling on sensitive laptop trackpads
  const wheelTimeout = useRef(false);

  useEffect(() => {
    setLoading(true);
    apiClient.get('/games/upcoming/')
      .then(response => {
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

  // Handle Drag/Swipe Gestures (Mobile Touch & Mouse Drag)
  const handleDragEnd = (event, info) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) {
      nextSlide();
    } else if (info.offset.x > swipeThreshold) {
      prevSlide();
    }
  };

  // Handle Laptop Trackpad Scrolling (Wheel Gestures)
  const handleWheel = (e) => {
    if (wheelTimeout.current) return; // If in cooldown, ignore

    // Trigger only if the horizontal scroll is significant enough
    if (Math.abs(e.deltaX) > 30) {
      wheelTimeout.current = true; // Lock
      
      if (e.deltaX > 0) {
        nextSlide(); // Scrolled Right
      } else {
        prevSlide(); // Scrolled Left
      }

      // Unlock after 600ms to prevent rapid-fire sliding
      setTimeout(() => {
        wheelTimeout.current = false;
      }, 600);
    }
  };

  useEffect(() => {
    let timer;
    if (!isHovered && slides.length > 1) {
      timer = setInterval(() => {
        nextSlide();
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
      className="relative w-full max-w-[1600px] mx-auto flex items-center justify-center py-8 md:py-16 px-2 md:px-8 overflow-hidden"
    >
      
      {/* Desktop Left Arrow (Hidden on Mobile) */}
      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={prevSlide}
        className="hidden md:block absolute left-4 z-10 text-gray-500 hover:text-white transition-colors cursor-pointer"
      >
        <svg className="w-14 h-14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </motion.button>

      {/* Main Overflow Container */}
      <div 
        className="relative w-[95%] md:w-[88%] h-[350px] sm:h-[450px] md:h-[600px] lg:h-[75vh] max-h-[850px] bg-[#121212] overflow-hidden group shadow-2xl rounded-2xl md:rounded-xl touch-pan-y"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel} // Trackpad Support
      >
        
        <motion.div 
          className="flex w-full h-full cursor-grab active:cursor-grabbing"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          initial={false}
          animate={{ x: `-${currentIndex * 100}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {slides.map((slide, index) => {
            const imageUrl = slide.images && slide.images.length > 0 ? slide.images[0].image : null;
            const isUpcoming = !slide.active;

            return (
              <div key={slide.id} className="w-full h-full shrink-0 relative overflow-hidden bg-black pointer-events-none">
                
                {/* Upcoming Corner Ribbon */}
                {isUpcoming && (
                  <div className="absolute top-0 right-0 z-40 w-32 h-32 md:w-40 md:h-40">
                    <div className="absolute top-6 -right-10 md:top-8 md:-right-12 w-[160px] md:w-[200px] rotate-45 bg-white text-black text-center font-black py-1.5 md:py-2 shadow-lg uppercase tracking-widest text-[10px] md:text-sm">
                      Upcoming
                    </div>
                  </div>
                )}

                {/* Direct Video Background (Hidden on mobile for performance) */}
                {slide.video && index === currentIndex && (
                  <video
                    src={slide.video}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="hidden md:block absolute inset-0 w-full h-full object-cover scale-105 z-0"
                  />
                )}

                {/* Thumbnail Fallback / Cover */}
                {imageUrl && (
                  <motion.img 
                    src={imageUrl}
                    alt={slide.title}
                    initial={false}
                    animate={{ opacity: (isHovered && slide.video && index === currentIndex && window.innerWidth >= 768) ? 0 : 1 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 w-full h-full object-cover z-10"
                  />
                )}

                {/* Optimized Gradient Overlay (Mobile) vs Glass Mask (Desktop) */}
                <div 
                  className="absolute left-0 top-0 w-full md:w-3/5 lg:w-1/2 h-full z-20 flex flex-col justify-end md:justify-center px-6 pb-12 md:pb-0 md:px-16 lg:px-24 
                             bg-gradient-to-t from-black/90 via-black/50 to-transparent 
                             md:bg-white/10 md:backdrop-blur-md md:bg-none pointer-events-none"
                  style={{
                    WebkitMaskImage: window.innerWidth >= 768 ? 'linear-gradient(to right, black 50%, transparent 100%)' : 'none',
                    maskImage: window.innerWidth >= 768 ? 'linear-gradient(to right, black 50%, transparent 100%)' : 'none'
                  }}
                >
                  <motion.h2 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-3 md:mb-8 tracking-wide leading-tight line-clamp-2 md:line-clamp-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                  >
                    {slide.title}
                  </motion.h2>
                  
                  <Link to={`/product/${slide.id}`} className="pointer-events-auto w-max z-50">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-[#2ecc71] text-black px-6 py-2.5 md:px-8 md:py-4 rounded-xl text-xs md:text-sm lg:text-lg font-extrabold hover:bg-[#27ae60] hover:shadow-[0_0_15px_rgba(46,204,113,0.5)] transition-all shadow-lg cursor-pointer"
                    >
                      Check Details
                    </motion.button>
                  </Link>
                </div>

                {/* Scaled Play Icon (Hidden on mobile) */}
                {slide.video && (
                  <motion.div 
                    initial={false}
                    animate={{ 
                      opacity: (isHovered && index === currentIndex) ? 0 : 1,
                      scale: (isHovered && index === currentIndex) ? 0.8 : 1 
                    }}
                    transition={{ duration: 0.4 }}
                    className="hidden md:flex absolute inset-0 items-center justify-center z-30"
                  >
                    <svg className="w-24 h-24 lg:w-32 lg:h-32 text-white/80 ml-16 lg:ml-24 drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 6v12l10-6z" />
                    </svg>
                  </motion.div>
                )}

              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Desktop Right Arrow (Hidden on Mobile) */}
      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={nextSlide}
        className="hidden md:block absolute right-4 z-10 text-gray-500 hover:text-white transition-colors cursor-pointer"
      >
        <svg className="w-14 h-14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </motion.button>

      {/* Pagination Dots */}
      <div className="absolute bottom-2 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 md:gap-3 z-10">
        {slides.map((_, index) => (
          <motion.div 
            key={index}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 md:w-3 md:h-3 rounded-full cursor-pointer transition-colors ${
              currentIndex === index ? 'bg-[#2ecc71] shadow-[0_0_8px_#2ecc71]' : 'bg-gray-500 hover:bg-white'
            }`}
          />
        ))}
      </div>

    </motion.div>
  );
}