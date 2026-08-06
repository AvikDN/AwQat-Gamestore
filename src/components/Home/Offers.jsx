import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api-client';

export default function Offers() {
  const [cards, setCards] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const cardThemes = [
    { bgColor: '#062427', badgeColor: '#2ecc71' },
    { bgColor: '#232E3C', badgeColor: '#999999' },
    { bgColor: '#161C21', badgeColor: '#666666' }
  ];

  useEffect(() => {
    setIsLoading(true);
    
    apiClient.get('/games/')
      .then(response => {
        const discountedGames = response.data.results.filter(
          game => parseFloat(game.discount) > 0
        );

        const formattedCards = discountedGames.slice(0, 3).map((game, index) => {
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

  const shuffleCards = () => {
    if (isAnimating || cards.length <= 1 || isLoading) return; 
    
    setIsAnimating(true);

    setTimeout(() => {
      setCards((prev) => {
        const newCards = [...prev];
        const topCard = newCards.shift();
        newCards.push(topCard);
        return newCards;
      });
      setIsAnimating(false);
    }, 300);
  };

  useEffect(() => {
    if (cards.length > 1 && !isLoading) {
      const timer = setInterval(() => {
        shuffleCards();
      }, 10000);
      
      return () => clearInterval(timer);
    }
  }, [isAnimating, cards.length, isLoading]);

  const getPositionalClasses = (index) => {
    if (index === 0) {
      return isAnimating
        ? '-translate-x-[30%] rotate-[-5deg] z-40' 
        : 'translate-x-0 rotate-0 z-30'; 
    }
    if (index === 1) {
      return isAnimating
        ? 'translate-x-0 rotate-0 z-30' 
        : 'translate-x-[15%] rotate-0 z-20'; 
    }
    if (index === 2) {
      return isAnimating
        ? 'translate-x-[15%] rotate-0 z-20' 
        : 'translate-x-[30%] rotate-0 z-10'; 
    }
    return 'hidden';
  };

  // Only hide the section if it finished loading AND there are no sales
  if (!isLoading && cards.length === 0) {
    return null; 
  }

  return (
    <section className="w-full max-w-[1920px] mx-auto py-12 md:py-20 px-4 md:px-8 xl:px-12 overflow-hidden">
      
      <div className="flex flex-col mb-16 md:mb-24">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">Special Offers</h2>
      </div>

      <div 
        className="relative w-full max-w-[300px] sm:max-w-[400px] md:max-w-[500px] lg:max-w-[700px] xl:max-w-[900px] h-[240px] sm:h-[300px] md:h-[360px] lg:h-[480px] xl:h-[600px] mx-auto cursor-pointer" 
        onClick={shuffleCards}
      >
        {isLoading ? (
          [...Array(3)].map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className={`absolute top-0 left-0 w-full h-full rounded-[2rem] p-5 md:p-8 lg:p-10 shadow-2xl transition-all duration-500 ease-in-out flex flex-col bg-[#1a1a1a] border border-[#333] ${getPositionalClasses(index)}`}
            >
              
              <div className="relative w-full h-[65%] flex items-center justify-center">
                {/* Image Skeleton */}
                <div className="absolute inset-0 w-full h-full bg-[#333] animate-pulse rounded-xl z-10"></div>

                {/* Badge Skeleton */}
                <div
                  className={`absolute -right-4 -bottom-4 md:-right-8 md:-bottom-6 lg:-right-10 lg:-bottom-8 xl:-right-12 xl:-bottom-10 w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 xl:w-48 xl:h-48 flex items-center justify-center transition-transform duration-500 origin-center drop-shadow-lg z-20 ${
                    index === 0 && !isAnimating ? 'scale-100' : 'scale-0'
                  }`}
                >
                  <div 
                    className="absolute inset-0 bg-[#444] animate-pulse" 
                    style={{ 
                      clipPath: 'polygon(50% 0%, 61% 16%, 80% 9%, 83% 27%, 100% 34%, 90% 50%, 100% 65%, 83% 73%, 80% 90%, 61% 83%, 50% 100%, 39% 83%, 20% 90%, 17% 73%, 0% 65%, 10% 50%, 0% 34%, 17% 27%, 20% 9%, 39% 16%)' 
                    }}
                  ></div>
                </div>
              </div>

              {/* Text Skeleton */}
              <div className="mt-auto flex flex-col">
                <div className="h-8 md:h-10 lg:h-12 bg-[#444] animate-pulse rounded w-3/4 mb-2"></div>
                <div className="h-5 md:h-6 lg:h-8 bg-[#333] animate-pulse rounded w-1/2 mt-1 md:mt-2"></div>
              </div>
              
            </div>
          ))
        ) : (
          cards.map((card, index) => (
            <div
              key={card.id}
              className={`absolute top-0 left-0 w-full h-full rounded-[2rem] p-5 md:p-8 lg:p-10 shadow-2xl transition-all duration-500 ease-in-out flex flex-col ${getPositionalClasses(index)}`}
              style={{ backgroundColor: card.bgColor }}
            >
              
              <div className="relative w-full h-[65%] flex items-center justify-center">
                
                <div className="absolute inset-0 w-full h-full bg-black/10 rounded-xl overflow-hidden z-10 flex items-center justify-center">
                  {card.image ? (
                    <img 
                      src={card.image} 
                      alt={card.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg className="w-20 h-20 text-white/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 20L12 10L16 15L20 9L24 15" />
                        <path d="M4 20h20" />
                    </svg>
                  )}
                </div>

                <div
                  className={`absolute -right-4 -bottom-4 md:-right-8 md:-bottom-6 lg:-right-10 lg:-bottom-8 xl:-right-12 xl:-bottom-10 w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 xl:w-48 xl:h-48 flex items-center justify-center transition-transform duration-500 origin-center drop-shadow-lg z-20 ${
                    (index === 0 && !isAnimating) || (index === 1 && isAnimating) ? 'scale-100' : 'scale-0'
                  }`}
                >
                  <div 
                    className="absolute inset-0" 
                    style={{ 
                      backgroundColor: card.badgeColor,
                      clipPath: 'polygon(50% 0%, 61% 16%, 80% 9%, 83% 27%, 100% 34%, 90% 50%, 100% 65%, 83% 73%, 80% 90%, 61% 83%, 50% 100%, 39% 83%, 20% 90%, 17% 73%, 0% 65%, 10% 50%, 0% 34%, 17% 27%, 20% 9%, 39% 16%)' 
                    }}
                  ></div>
                  
                  <span className="relative z-10 text-black font-extrabold text-xl md:text-3xl lg:text-4xl xl:text-5xl tracking-tight">{card.discount}</span>
                </div>
                
              </div>

              <div className="mt-auto flex flex-col text-white">
                <span className="font-extrabold text-2xl md:text-3xl lg:text-4xl xl:text-5xl tracking-tight line-clamp-1">{card.title}</span>
                <span className="text-gray-300 font-medium text-base md:text-lg lg:text-xl xl:text-2xl mt-1 md:mt-2 line-clamp-1">{card.desc}</span>
              </div>
              
            </div>
          ))
        )}
      </div>
      
    </section>
  );
}