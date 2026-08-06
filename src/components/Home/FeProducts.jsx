import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../services/api-client';

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // New states to handle dynamic row limits
  const [showAll, setShowAll] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10); // Default to 2 rows on XL screens (5 cols * 2)
  
  const sectionRef = useRef(null);

  // Dynamically calculate how many items constitute 2 rows based on Tailwind breakpoints
  useEffect(() => {
    const calculateVisibleItems = () => {
      const width = window.innerWidth;
      if (width >= 1280) {
        setVisibleCount(10); // xl: 5 columns * 2 rows
      } else if (width >= 1024) {
        setVisibleCount(8);  // lg: 4 columns * 2 rows
      } else if (width >= 768) {
        setVisibleCount(6);  // md: 3 columns * 2 rows
      } else {
        setVisibleCount(4);  // mobile: 2 columns * 2 rows
      }
    };

    // Run once on mount
    calculateVisibleItems();

    // Listen for window resizes to adjust the layout dynamically
    window.addEventListener('resize', calculateVisibleItems);
    return () => window.removeEventListener('resize', calculateVisibleItems);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    
    apiClient.get('/games/')
      .then(response => {
        setProducts(response.data.results);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Error fetching featured products:", error);
        setIsLoading(false);
      });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        rootMargin: '0px 0px -20% 0px',
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

  // Determine which products to display based on the toggle state
  const displayedProducts = showAll ? products : products.slice(0, visibleCount);

  return (
    <section ref={sectionRef} className="w-full max-w-[1920px] mx-auto py-12 md:py-20 px-4 md:px-8 xl:px-12 overflow-hidden">
      
      <style>
        {`
          .slide-up-physical {
            transform: translateY(150px);
            transition: transform 0.8s cubic-bezier(0.25, 1, 0.5, 1);
          }
          .slide-up-physical.in-view {
            transform: translateY(0);
          }
        `}
      </style>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 md:mb-12 gap-4">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">Featured Products</h2>
        <Link to="/products" className="text-white font-bold hover:text-[#2ecc71] transition-colors text-lg md:text-xl">See All</Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 xl:gap-8">
        {isLoading 
          ? [...Array(visibleCount)].map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className={`flex flex-col slide-up-physical ${isVisible ? 'in-view' : ''}`}
                style={{ transitionDelay: `${(index % 5) * 100}ms` }}
              >
                <div className="animate-pulse flex flex-col h-full">
                  <div className="relative w-full aspect-square rounded-2xl md:rounded-[2rem] mb-4 sm:mb-6 bg-[#333]"></div>
                  <div className="flex flex-col px-1 sm:px-2 mb-4 sm:mb-6">
                    <div className="h-5 sm:h-8 bg-[#444] rounded w-3/4 mb-2 sm:mb-3"></div>
                    <div className="h-4 sm:h-6 bg-[#222] rounded w-1/2"></div>
                  </div>
                  <div className="mt-auto w-full h-[48px] sm:h-[60px] md:h-[72px] bg-[#333] rounded-xl md:rounded-2xl"></div>
                </div>
              </div>
            ))
          : displayedProducts.map((product, index) => {
              const imageUrl = product.images && product.images.length > 0 ? product.images[0].image : null;

              return (
                <div
                  key={product.id}
                  className={`flex flex-col slide-up-physical ${isVisible ? 'in-view' : ''}`}
                  style={{ transitionDelay: `${(index % 5) * 100}ms` }}
                >
                  
                  <Link to={`/product/${product.id}`} className="block group cursor-pointer flex-grow">
                    
                    <div className="relative w-full aspect-square rounded-2xl md:rounded-[2rem] flex items-center justify-center mb-4 sm:mb-6 bg-white/5 overflow-hidden border border-transparent group-hover:border-[#2ecc71]/30 transition-colors duration-300">
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
                      <span className="font-extrabold text-white text-lg sm:text-2xl md:text-3xl mb-1 group-hover:text-[#2ecc71] transition-colors line-clamp-1">{product.title}</span>
                      <span className="text-gray-300 font-bold text-base sm:text-lg md:text-xl">{Number(product.price)} BDT</span>
                    </div>

                  </Link>

                  <button className="mt-auto w-full py-3 sm:py-4 md:py-5 bg-[#b0b0b0] hover:bg-[#2ecc71] hover:shadow-[0_0_15px_rgba(46,204,113,0.5)] transition-all duration-300 rounded-xl md:rounded-2xl flex items-center justify-center group">
                    <svg className="w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8 text-black group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </button>
                  
                </div>
              );
            })
        }
      </div>

      {/* Conditionally render the See More button if there are hidden products */}
      {!isLoading && !showAll && products.length > visibleCount && (
        <div className="flex justify-center mt-10 md:mt-16 w-full">
          <button
            onClick={() => setShowAll(true)}
            className="px-8 py-3 bg-transparent border-2 border-[#2ecc71] text-[#2ecc71] font-bold text-lg md:text-xl rounded-full hover:bg-[#2ecc71] hover:text-black hover:shadow-[0_0_15px_rgba(46,204,113,0.8)] transition-all duration-300"
          >
            See More
          </button>
        </div>
      )}

    </section>
  );
}