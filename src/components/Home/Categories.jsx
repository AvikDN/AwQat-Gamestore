import React, { useEffect, useRef, useState } from 'react';
import apiClient from '../../services/api-client';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const sectionRef = useRef(null);

  const rotations = [
    '-rotate-6', 'rotate-3', '-rotate-3', 'rotate-6',
    '-rotate-2', 'rotate-2', '-rotate-6', 'rotate-6'
  ];

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
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">Categories</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
        {isLoading 
          ? [...Array(8)].map((_, index) => {
              const rotateClass = rotations[index % rotations.length];
              return (
                <div 
                  key={`skeleton-${index}`} 
                  className={`slide-up-physical ${isVisible ? 'in-view' : ''}`}
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  <div className={`flex flex-col p-3 pb-8 bg-[#8c8c8c] rounded-lg shadow-xl transform ${rotateClass}`}>
                    <div className="bg-gray-300 animate-pulse aspect-[4/3] rounded w-full shadow-inner"></div>
                    <div className="mt-6 flex justify-center">
                      <div className="h-6 w-24 bg-gray-400 animate-pulse rounded"></div>
                    </div>
                  </div>
                </div>
              );
            })
          : categories.map((cat, index) => {
              const rotateClass = rotations[index % rotations.length];
              return (
                <div 
                  key={cat.id} 
                  className={`slide-up-physical ${isVisible ? 'in-view' : ''}`}
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  <div 
                    className={`flex flex-col p-3 pb-8 bg-[#8c8c8c] rounded-lg shadow-xl cursor-pointer transform ${rotateClass} hover:rotate-0 hover:scale-105 hover:-translate-y-2 transition-all duration-300 ease-out`}
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
                  </div>
                </div>
              );
            })
        }
      </div>
    </section>
  );
}