import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/api-client';

export default function ProductList() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [studios, setStudios] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [sortOrder, setSortOrder] = useState('default');
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(3000);
  const [selectedStudio, setSelectedStudio] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedAvailability, setSelectedAvailability] = useState('All');

  // Fetch games, studios, and categories on mount
  useEffect(() => {
    setIsLoading(true);
    
    Promise.all([
      apiClient.get('/games/'),
      apiClient.get('/studios/'),
      apiClient.get('/categories/')
    ])
      .then(([gamesRes, studiosRes, categoriesRes]) => {
        setProducts(gamesRes.data.results);
        setStudios(studiosRes.data.results);
        setCategories(categoriesRes.data.results);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Error fetching product list data:", error);
        setIsLoading(false);
      });
  }, []);

  let processedProducts = products.filter(product => {
    const originalPrice = parseFloat(product.price);
    const discountValue = parseFloat(product.discount || 0);
    const finalPrice = discountValue > 0 ? originalPrice - (originalPrice * (discountValue / 100)) : originalPrice;
    
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPrice = finalPrice >= minPrice && finalPrice <= maxPrice;
    const matchesStudio = selectedStudio === 'All' || product.studio_name === selectedStudio;
    const matchesCategory = selectedCategory === 'All' || product.category === Number(selectedCategory);
    
    // Availability mapping: active = true -> 'Available', active = false -> 'Coming soon'
    const productAvailability = product.active ? 'Available' : 'Coming soon';
    const matchesAvailability = selectedAvailability === 'All' || productAvailability === selectedAvailability;

    return matchesSearch && matchesPrice && matchesStudio && matchesCategory && matchesAvailability;
  });

  if (sortOrder === 'low-to-high') {
    processedProducts.sort((a, b) => {
      const priceA = parseFloat(a.price) - parseFloat(a.discount || 0);
      const priceB = parseFloat(b.price) - parseFloat(b.discount || 0);
      return priceA - priceB;
    });
  } else if (sortOrder === 'high-to-low') {
    processedProducts.sort((a, b) => {
      const priceA = parseFloat(a.price) - parseFloat(a.discount || 0);
      const priceB = parseFloat(b.price) - parseFloat(b.discount || 0);
      return priceB - priceA;
    });
  } else if (sortOrder === 'discounted') {
    processedProducts.sort((a, b) => {
      const discA = parseFloat(a.discount || 0) > 0 ? 1 : 0;
      const discB = parseFloat(b.discount || 0) > 0 ? 1 : 0;
      return discB - discA;
    });
  }

  const handleResetFilters = () => {
    setSortOrder('default');
    setSearchTerm('');
    setMinPrice(0);
    setMaxPrice(3000);
    setSelectedStudio('All');
    setSelectedCategory('All');
    setSelectedAvailability('All');
  };

  const handleMinChange = (e) => {
    const value = Math.min(Number(e.target.value), maxPrice - 100);
    setMinPrice(value);
  };

  const handleMaxChange = (e) => {
    const value = Math.max(Number(e.target.value), minPrice + 100);
    setMaxPrice(value);
  };

  useEffect(() => {
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

  return (
    <section ref={sectionRef} className="w-full max-w-[1920px] mx-auto py-12 md:py-20 px-4 md:px-8 xl:px-12 overflow-hidden bg-[#121212]">
      
      <style>
        {`
          .slide-up-physical {
            transform: translateY(150px);
            transition: transform 0.8s cubic-bezier(0.25, 1, 0.5, 1);
          }
          .slide-up-physical.in-view {
            transform: translateY(0);
          }
          input[type="number"]::-webkit-inner-spin-button,
          input[type="number"]::-webkit-outer-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          input[type="number"] {
            -moz-appearance: textfield;
          }
          .dual-range::-webkit-slider-thumb {
            pointer-events: auto;
            -webkit-appearance: none;
            height: 20px;
            width: 20px;
            border-radius: 50%;
            background: #2ecc71;
            cursor: pointer;
          }
        `}
      </style>

      <div className="flex flex-col lg:flex-row gap-6 xl:gap-8 items-start">
        
        <aside className="w-full lg:w-[280px] xl:w-[320px] flex-shrink-0 flex flex-col gap-6 lg:sticky lg:top-8 mt-0">
          
          {/* Box 1: Sort By */}
          <div className="w-full bg-[#1a1a1a] rounded-[2rem] p-6 sm:p-8 flex flex-col gap-4">
            <span className="text-xl font-bold text-[#ffffff] tracking-tight">Sort By:</span>
            <div className="relative">
              <select 
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full bg-[#333333] text-gray-300 font-bold rounded-xl p-3.5 xl:p-4 appearance-none outline-none cursor-pointer hover:bg-[#404040] transition-colors text-sm xl:text-base border border-[#404040]"
              >
                <option value="default">Default</option>
                <option value="low-to-high">Low to High</option>
                <option value="high-to-low">High to Low</option>
                <option value="discounted">Discounted</option>
              </select>
              <svg className="absolute right-4 top-4 w-5 h-5 xl:w-6 xl:h-6 text-[#ffffff] pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>

          {/* Box 2: Filters */}
          <div className="w-full bg-[#1a1a1a] rounded-[2rem] p-6 sm:p-8 flex flex-col gap-6">
            <h2 className="text-2xl xl:text-3xl font-bold text-white tracking-tight">Filters</h2>
            
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#333333] text-white rounded-full py-3 pl-5 pr-12 outline-none focus:ring-2 focus:ring-[#b0b0b0] transition-shadow placeholder-gray-400"
              />
              <svg className="absolute right-4 top-3.5 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>

            <div className="flex flex-col gap-4 mt-2">
              <span className="bg-[#333333] text-gray-300 font-bold px-4 py-1.5 rounded-lg text-xs xl:text-sm self-start">Price-Range</span>
              
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  value={minPrice}
                  onChange={handleMinChange}
                  className="w-full bg-[#333333] text-white font-bold rounded-lg py-2 px-3 text-center outline-none focus:ring-2 focus:ring-[#b0b0b0]"
                />
                <span className="text-white font-bold">-</span>
                <input 
                  type="number" 
                  value={maxPrice}
                  onChange={handleMaxChange}
                  className="w-full bg-[#333333] text-white font-bold rounded-lg py-2 px-3 text-center outline-none focus:ring-2 focus:ring-[#b0b0b0]"
                />
              </div>

              {/* Dual Range Slider */}
              <div className="relative h-6 w-full mt-2">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-[#333333] -translate-y-1/2 rounded-full"></div>
                <div 
                  className="absolute top-1/2 h-1 bg-[#2ecc71] -translate-y-1/2 rounded-full pointer-events-none"
                  style={{ left: `${(minPrice / 3000) * 100}%`, right: `${100 - (maxPrice / 3000) * 100}%` }}
                ></div>
                <input 
                  type="range" min="0" max="3000" step="100" value={minPrice} onChange={handleMinChange} 
                  className="absolute top-0 left-0 w-full h-full appearance-none bg-transparent pointer-events-none dual-range" 
                />
                <input 
                  type="range" min="0" max="3000" step="100" value={maxPrice} onChange={handleMaxChange} 
                  className="absolute top-0 left-0 w-full h-full appearance-none bg-transparent pointer-events-none dual-range" 
                />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {/* Studio Filter */}
              <div className="relative">
                <select 
                  value={selectedStudio}
                  onChange={(e) => setSelectedStudio(e.target.value)}
                  className="w-full bg-[#333333] text-gray-300 font-bold rounded-xl p-3.5 xl:p-4 appearance-none outline-none cursor-pointer hover:bg-[#404040] transition-colors text-sm xl:text-base"
                >
                  <option value="All">Studio</option>
                  {studios.map(studio => (
                    <option key={studio.id} value={studio.name}>{studio.name}</option>
                  ))}
                </select>
                <svg className="absolute right-4 top-4 w-5 h-5 xl:w-6 xl:h-6 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>

              {/* Category Filter */}
              <div className="relative">
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-[#333333] text-gray-300 font-bold rounded-xl p-3.5 xl:p-4 appearance-none outline-none cursor-pointer hover:bg-[#404040] transition-colors text-sm xl:text-base"
                >
                  <option value="All">Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <svg className="absolute right-4 top-4 w-5 h-5 xl:w-6 xl:h-6 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>

              {/* Availability Filter */}
              <div className="relative">
                <select 
                  value={selectedAvailability}
                  onChange={(e) => setSelectedAvailability(e.target.value)}
                  className="w-full bg-[#333333] text-gray-300 font-bold rounded-xl p-3.5 xl:p-4 appearance-none outline-none cursor-pointer hover:bg-[#404040] transition-colors text-sm xl:text-base"
                >
                  <option value="All">Availability</option>
                  <option value="Available">Available</option>
                  <option value="Coming soon">Coming soon</option>
                </select>
                <svg className="absolute right-4 top-4 w-5 h-5 xl:w-6 xl:h-6 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
              
              <button 
                onClick={handleResetFilters}
                className="mt-4 w-full py-4 bg-[#b0b0b0] hover:bg-white text-black font-extrabold rounded-xl transition-colors text-sm xl:text-base"
              >
                Reset Filters
              </button>

            </div>
          </div>
        </aside>

        {/* MAIN PRODUCT GRID */}
        <div className="flex-1 w-full mt-0">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 xl:gap-8">
            
            {isLoading ? (
              [...Array(8)].map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="flex flex-col"
                >
                  <div className="animate-pulse flex flex-col h-full">
                    <div className="relative w-full aspect-square rounded-2xl md:rounded-[2rem] mb-4 bg-[#333]"></div>
                    <div className="flex flex-col px-1 mb-4">
                      <div className="h-6 bg-[#444] rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-[#222] rounded w-1/2"></div>
                    </div>
                    <div className="mt-auto w-full h-[48px] bg-[#333] rounded-xl"></div>
                  </div>
                </div>
              ))
            ) : processedProducts.length > 0 ? (
              processedProducts.map((product, index) => {
                const imageUrl = product.images && product.images.length > 0 ? product.images[0].image : null;
                const originalPrice = parseFloat(product.price);
                const discountVal = parseFloat(product.discount || 0);
                const hasDiscount = discountVal > 0;
                const finalPrice = hasDiscount ? originalPrice - (originalPrice * (discountVal / 100)) : originalPrice;
                const isComingSoon = !product.active;

                return (
                  <div
                    key={product.id}
                    className={`flex flex-col slide-up-physical ${isVisible ? 'in-view' : ''}`}
                    style={{ transitionDelay: `${(index % 5) * 100}ms` }}
                  >
                    
                    <Link to={`/product/${product.id}`} className="block group cursor-pointer flex-grow">
                      
                      <div className="relative w-full aspect-square rounded-2xl md:rounded-[2rem] flex items-center justify-center mb-4 bg-[#1a1a1a] overflow-hidden">
                          {imageUrl ? (
                            <img 
                              src={imageUrl} 
                              alt={product.title} 
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                              No Image
                            </div>
                          )}
                          
                          {/* Dynamic Tags */}
                          {hasDiscount && (
                            <div className="absolute top-4 right-4 bg-[#2ecc71] text-black text-xs sm:text-sm font-bold px-3 py-1 rounded-full z-10">
                              Sale
                            </div>
                          )}
                          {isComingSoon && (
                            <div className="absolute top-4 right-4 bg-cyan-400 text-black text-xs sm:text-sm font-bold px-3 py-1 rounded-full z-10">
                              Upcoming
                            </div>
                          )}
                      </div>

                      <div className="flex flex-col mb-4">
                        <span className="font-extrabold text-white text-lg md:text-xl xl:text-2xl mb-1 group-hover:text-gray-300 transition-colors truncate">{product.title}</span>
                        
                        {/* Price Logic */}
                        {hasDiscount ? (
                          <div className="flex items-center gap-2 text-sm md:text-base">
                            <span className="text-gray-300 font-bold">
                              Price: <span className="text-gray-500 line-through">{originalPrice} ৳</span>
                            </span>
                            <span className="text-white font-bold">{finalPrice} ৳</span>
                          </div>
                        ) : (
                          <span className="text-gray-300 font-bold text-sm md:text-base">Price: {originalPrice} ৳</span>
                        )}
                      </div>

                    </Link>

                    <button className="mt-auto w-full py-3.5 bg-[#b0b0b0] hover:bg-[#2ecc71] transition-colors rounded-xl flex items-center justify-center shadow-sm">
                      <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </button>
                    
                  </div>
                );
              })
            ) : (
              <div className="col-span-full pt-12 text-center text-gray-400 text-lg md:text-xl font-bold">
                No products match your current filters.
              </div>
            )}
            
          </div>
        </div>

      </div>
    </section>
  );
}