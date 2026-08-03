import React, { useState, useEffect } from 'react';

import summerImg from '../../assets/pics/Categories/steam summer.webp';
import xboxImg from '../../assets/pics/Categories/xbox.webp';
import SteamImg from '../../assets/pics/Categories/STEAM-upcoming-Sales.webp';

export default function Offers() {
  const [cards, setCards] = useState([
    { 
      id: 1, 
      title: 'Summer Sale', 
      desc: 'Get upto 50% off', 
      discount: '-90%', 
      image: summerImg,
      bgColor: '#062427',
      badgeColor: '#a3a3a3'
    },
    { 
      id: 2, 
      title: 'Publisher Sale', 
      desc: 'Get upto 40% off', 
      discount: '-40%', 
      image: xboxImg,
      bgColor: '#232E3C',
      badgeColor: '#999999'
    },
    { 
      id: 3, 
      title: 'Steam Sale', 
      desc: 'Get upto 60% off', 
      discount: '-60%', 
      image: SteamImg, 
      bgColor: '#161C21',
      badgeColor: '#666666'
    }
  ]);

  
  const [isAnimating, setIsAnimating] = useState(false);

  const shuffleCards = () => {
    if (isAnimating) return; 
    
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
    const timer = setInterval(() => {
      shuffleCards();
    }, 10000);
    
    return () => clearInterval(timer);
  }, [isAnimating]);

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

  return (
    <section className="w-full max-w-[1920px] mx-auto py-12 md:py-20 px-4 md:px-8 xl:px-12 overflow-hidden">
      
      <div className="flex flex-col mb-16 md:mb-24">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">Special Offers</h2>
      </div>

      {/* Added lg and xl classes to drastically increase the max width and height on desktop */}
      <div 
        className="relative w-full max-w-[300px] sm:max-w-[400px] md:max-w-[500px] lg:max-w-[700px] xl:max-w-[900px] h-[240px] sm:h-[300px] md:h-[360px] lg:h-[480px] xl:h-[600px] mx-auto cursor-pointer" 
        onClick={shuffleCards}
      >
         {cards.map((card, index) => (
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

                {/* Scaled up the badge size and position for lg and xl screens */}
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
                  
                  {/* Scaled up the percentage text for lg and xl screens */}
                  <span className="relative z-10 text-white font-extrabold text-xl md:text-3xl lg:text-4xl xl:text-5xl tracking-tight">{card.discount}</span>
                </div>
                
              </div>

              {/* Converted text to white/gray and added larger responsive sizes */}
              <div className="mt-auto flex flex-col text-white">
                <span className="font-extrabold text-2xl md:text-3xl lg:text-4xl xl:text-5xl tracking-tight">{card.title}</span>
                <span className="text-gray-300 font-medium text-base md:text-lg lg:text-xl xl:text-2xl mt-1 md:mt-2">{card.desc}</span>
              </div>
              
            </div>
         ))}
      </div>
      
    </section>
  );
}