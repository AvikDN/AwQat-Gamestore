import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../services/api-client';

export default function Offers() {
  const [cards, setCards] = useState([]);
  const [animDirection, setAnimDirection] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const cardThemes = [
    { bgColor: '#062427', badgeColor: '#2ecc71' },
    { bgColor: '#232E3C', badgeColor: '#999999' },
    { bgColor: '#161C21', badgeColor: '#666666' }
  ];

  useEffect(() => {
    setIsLoading(true);
    
    apiClient.get('/games/discounted/')
      .then(response => {
        const data = response.data;
        const discountedGames = Array.isArray(data) ? data : (data.results || []);

        const formattedCards = discountedGames.map((game, index) => {
          const theme = cardThemes[index % cardThemes.length];
          const discountValue = parseFloat(game.discount);
          
          return {
            id: game.id,
            title: game.title,
            desc: `Get ${discountValue}% off`,
            discount: `-${discountValue}%`,
            image: game.images && game.images.length > 0 ? game.images[0].image : null,
            bgColor: theme.bgColor,
            badgeColor: theme.badgeColor
          };
        });

        setCards(formattedCards);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Error fetching offers:", error);
        setIsLoading(false);
      });
  }, []);

  const handleNext = () => {
    if (animDirection || cards.length <= 1 || isLoading) return; 
    setAnimDirection('next');

    setTimeout(() => {
      setCards((prev) => {
        const newCards = [...prev];
        newCards.push(newCards.shift());
        return newCards;
      });
      setAnimDirection(null);
    }, 400);
  };

  const handlePrev = () => {
    if (animDirection || cards.length <= 1 || isLoading) return; 
    setAnimDirection('prev');

    setTimeout(() => {
      setCards((prev) => {
        const newCards = [...prev];
        newCards.unshift(newCards.pop());
        return newCards;
      });
      setAnimDirection(null);
    }, 400);
  };

  useEffect(() => {
    if (cards.length > 1 && !isLoading) {
      const timer = setInterval(() => {
        handleNext();
      }, 10000);
      return () => clearInterval(timer);
    }
  }, [animDirection, cards.length, isLoading]);

  const handleWheel = (e) => {
    if (animDirection) return;
    if (e.deltaX > 30) {
      handleNext();
    } else if (e.deltaX < -30) {
      handlePrev();
    }
  };

  const getCardAnimation = (index, dir, totalCards) => {
    if (dir === 'next') {
      if (index === 0) return { x: "-30%", y: 0, rotate: -5, scale: 1, zIndex: 40, opacity: 0 };
      if (index === 1) return { x: "0%", y: 0, rotate: 0, scale: 1, zIndex: 30, opacity: 1 };
      if (index === 2) return { x: "15%", y: 0, rotate: 0, scale: 0.95, zIndex: 20, opacity: 1 };
      if (index === 3) return { x: "30%", y: 0, rotate: 0, scale: 0.9, zIndex: 10, opacity: 1 };
    }
    
    if (dir === 'prev') {
      if (index === 0) return { x: "15%", y: 0, rotate: 0, scale: 0.95, zIndex: 20, opacity: 1 };
      if (index === 1) return { x: "30%", y: 0, rotate: 0, scale: 0.9, zIndex: 10, opacity: 1 };
      if (index === totalCards - 1) return { x: "0%", y: 0, rotate: 0, scale: 1, zIndex: 40, opacity: 1 }; 
    }

    if (index === 0) return { x: "0%", y: 0, rotate: 0, scale: 1, zIndex: 30, opacity: 1 };
    if (index === 1) return { x: "15%", y: 0, rotate: 0, scale: 0.95, zIndex: 20, opacity: 1 };
    if (index === 2) return { x: "30%", y: 0, rotate: 0, scale: 0.9, zIndex: 10, opacity: 1 };
    return { x: "40%", y: 0, rotate: 0, scale: 0.85, zIndex: 0, opacity: 0 };
  };

  if (!isLoading && cards.length === 0) {
    return null; 
  }

  return (
    <section className="w-full max-w-[1920px] mx-auto py-12 md:py-20 px-4 md:px-8 xl:px-12 overflow-hidden">
      
      <div className="flex flex-col mb-12 md:mb-16">
        <motion.h2 
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Special Offers
        </motion.h2>
      </div>

      <div className="relative w-full max-w-[300px] sm:max-w-[400px] md:max-w-[500px] lg:max-w-[700px] xl:max-w-[900px] h-[240px] sm:h-[300px] md:h-[360px] lg:h-[480px] xl:h-[600px] mx-auto">
        
        <motion.div 
          className="absolute inset-0 z-40 touch-pan-y"
          onWheel={handleWheel}
          onPanEnd={(e, info) => {
            const swipeThreshold = 40;
            if (info.offset.x < -swipeThreshold) {
              handleNext();
            } else if (info.offset.x > swipeThreshold) {
              handlePrev();
            }
          }}
        >
          <AnimatePresence>
            {isLoading && (
              [...Array(3)].map((_, index) => (
                <motion.div
                  key={`skeleton-${index}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={getCardAnimation(index, false, 3)}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="absolute top-0 left-0 w-full h-full rounded-[2rem] p-5 md:p-8 lg:p-10 shadow-2xl flex flex-col bg-[#1a1a1a] border border-[#333]"
                >
                  <div className="relative w-full h-[65%] flex items-center justify-center">
                    <div className="absolute inset-0 w-full h-full bg-[#333] animate-pulse rounded-xl z-10"></div>
                    <motion.div
                      animate={{ scale: index === 0 ? 1 : 0 }}
                      className="absolute -right-4 -bottom-4 md:-right-8 md:-bottom-6 lg:-right-10 lg:-bottom-8 xl:-right-12 xl:-bottom-10 w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 xl:w-48 xl:h-48 flex items-center justify-center origin-center drop-shadow-lg z-20"
                    >
                      <div className="absolute inset-0 bg-[#444] animate-pulse" style={{ clipPath: 'polygon(50% 0%, 61% 16%, 80% 9%, 83% 27%, 100% 34%, 90% 50%, 100% 65%, 83% 73%, 80% 90%, 61% 83%, 50% 100%, 39% 83%, 20% 90%, 17% 73%, 0% 65%, 10% 50%, 0% 34%, 17% 27%, 20% 9%, 39% 16%)' }}></div>
                    </motion.div>
                  </div>
                  <div className="mt-auto flex flex-col">
                    <div className="h-8 md:h-10 lg:h-12 bg-[#444] animate-pulse rounded w-3/4 mb-2"></div>
                    <div className="h-5 md:h-6 lg:h-8 bg-[#333] animate-pulse rounded w-1/2 mt-1 md:mt-2"></div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>

          <AnimatePresence>
            {!isLoading && cards.map((card, index) => (
              <motion.div
                key={card.id}
                onClick={() => {
                  if (index === 0 && !animDirection) {
                    navigate(`/product/${card.id}`);
                  } else if (index > 0 && !animDirection) {
                    handleNext();
                  }
                }}
                initial={{ 
                  opacity: 0, 
                  scale: 0.6, 
                  y: 50, 
                  x: index === 0 ? "0%" : index === 1 ? "15%" : "30%" 
                }}
                animate={getCardAnimation(index, animDirection, cards.length)}
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={`absolute top-0 left-0 w-full h-full rounded-[2rem] p-5 md:p-8 lg:p-10 shadow-2xl flex flex-col ${index <= 2 ? 'pointer-events-auto cursor-pointer' : 'pointer-events-none'}`}
                style={{ backgroundColor: card.bgColor }}
              >
                
                <div className="relative w-full h-[65%] flex items-center justify-center pointer-events-none">
                  <div className="absolute inset-0 w-full h-full bg-black/10 rounded-xl overflow-hidden z-10 flex items-center justify-center">
                    {card.image ? (
                      <img src={card.image} alt={card.title} className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-20 h-20 text-white/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 20L12 10L16 15L20 9L24 15" />
                          <path d="M4 20h20" />
                      </svg>
                    )}
                  </div>

                  <motion.div
                    animate={{ scale: (index === 0 && !animDirection) || (index === 1 && animDirection === 'next') || (index === cards.length - 1 && animDirection === 'prev') ? 1 : 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="absolute -right-4 -bottom-4 md:-right-8 md:-bottom-6 lg:-right-10 lg:-bottom-8 xl:-right-12 xl:-bottom-10 w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 xl:w-48 xl:h-48 flex items-center justify-center origin-center drop-shadow-lg z-20"
                  >
                    <div className="absolute inset-0" style={{ backgroundColor: card.badgeColor, clipPath: 'polygon(50% 0%, 61% 16%, 80% 9%, 83% 27%, 100% 34%, 90% 50%, 100% 65%, 83% 73%, 80% 90%, 61% 83%, 50% 100%, 39% 83%, 20% 90%, 17% 73%, 0% 65%, 10% 50%, 0% 34%, 17% 27%, 20% 9%, 39% 16%)' }}></div>
                    <span className="relative z-10 text-black font-extrabold text-xl md:text-3xl lg:text-4xl xl:text-5xl tracking-tight">
                      {card.discount}
                    </span>
                  </motion.div>
                </div>

                <div className="mt-auto flex flex-col text-white pointer-events-none">
                  <span className="font-extrabold text-2xl md:text-3xl lg:text-4xl xl:text-5xl tracking-tight line-clamp-1">{card.title}</span>
                  <span className="text-gray-300 font-medium text-base md:text-lg lg:text-xl xl:text-2xl mt-1 md:mt-2 line-clamp-1">{card.desc}</span>
                  
                  <div className={`mt-3 md:mt-4 overflow-hidden transition-all duration-500 ${index === 0 ? 'opacity-100 max-h-14' : 'opacity-0 max-h-0'}`}>
                     <span className="inline-flex items-center text-black bg-[#2ecc71] font-bold px-4 py-2 rounded-full text-sm md:text-base shadow-[0_0_10px_rgba(46,204,113,0.5)]">
                       View Deal
                       <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                     </span>
                  </div>
                </div>
                
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
      
    </section>
  );
}