import React, { useEffect, useRef, useState } from 'react';
import Action from '../../assets/pics/Categories/action.png'; 
import RPG from '../../assets/pics/Categories/RPG.png'; 
import Adventure from '../../assets/pics/Categories/Adventure.png'; 
import Sport from '../../assets/pics/Categories/sports.png'; 
import Strategy from '../../assets/pics/Categories/strategy.png'; 
import indie from '../../assets/pics/Categories/indie.png'; 

export default function Categories() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        rootMargin: '0px 0px -15% 0px',
        threshold: 0.1
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  // Added static rotation classes to simulate the scattered look
  const categories = [
    { 
      id: 1, name: 'Action', rotate: '-rotate-6',
      icon:  <img 
                  src={Action} 
                  alt="Favorite" 
                  className="w-16 h-16 text-black" viewBox="0 0 24 24" fill="currentColor" 
                />
    },
    { 
      id: 2, name: 'RPG', rotate: 'rotate-3',
      icon: <img src={RPG} alt="Favorite" className="w-16 h-16 text-black" viewBox="0 0 24 24" fill="currentColor" />
    },
    { 
      id: 3, name: 'Co-op', rotate: '-rotate-3',
      icon: <svg className="w-16 h-16 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 8M8 8M4 12h16M4 12l4-4M4 12l4 4M20 12l-4-4M20 12l-4 4" /></svg>
    },
    { 
      id: 4, name: 'Adventure', rotate: 'rotate-6',
      icon: <img src={Adventure} alt="Favorite" className="w-16 h-16 text-black" viewBox="0 0 24 24" fill="currentColor" />
    },
    { 
      id: 5, name: 'Sports', rotate: '-rotate-2',
      icon: <img src={Sport} alt="Favorite" className="w-16 h-16 text-black" viewBox="0 0 24 24" fill="currentColor" />
    },
    { 
      id: 6, name: 'Strategy', rotate: 'rotate-2',
      icon: <img src={Strategy} alt="Favorite" className="w-16 h-16 text-black" viewBox="0 0 24 24" fill="currentColor" />
    },
    { 
      id: 7, name: 'Indie', rotate: '-rotate-6',
      icon: <img src={indie} alt="Favorite" className="w-16 h-16 text-black" viewBox="0 0 24 24" fill="currentColor" />
    },
    { 
      id: 8, name: 'Others', rotate: 'rotate-6',
      icon: <svg className="w-16 h-16 text-black" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2.5"/><circle cx="12" cy="12" r="2.5"/><circle cx="19" cy="12" r="2.5"/></svg>
    },
  ];

  return (
    <section ref={sectionRef} className="w-full max-w-[1200px] mx-auto py-16 px-4 md:px-8 overflow-visible">
      
      <style>
        {`
          .slide-up-physical {
            transform: translateY(150px);
            transition: transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
          }
          .slide-up-physical.in-view {
            transform: translateY(0);
          }
        `}
      </style>

      <div className="flex items-center justify-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-black tracking-tight">Categories</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
        {categories.map((cat, index) => (
          // Outer wrapper handles the scroll animation safely
          <div 
            key={cat.id} 
            className={`slide-up-physical ${isVisible ? 'in-view' : ''}`}
            style={{ transitionDelay: `${index * 50}ms` }}
          >
            {/* Inner wrapper handles the tilt, background, and hover interactions */}
            <div 
              className={`flex flex-col p-3 pb-8 bg-[#8c8c8c] rounded-lg shadow-xl cursor-pointer transform ${cat.rotate} hover:rotate-0 hover:scale-105 hover:-translate-y-2 transition-all duration-300 ease-out`}
            >
              <div className="bg-white aspect-[4/3] rounded flex items-center justify-center shadow-inner">
                {cat.icon}
              </div>
              <div className="text-center mt-6 font-extrabold text-xl text-black tracking-wide">
                {cat.name}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}