import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import GTA5Img from '../assets/pics/GamesPic/GTA5.jpg';
import RDR2Img from '../assets/pics/GamesPic/red-dead 2.jpg';
import GOTImg from '../assets/pics/GamesPic/GOT.webp';
import SOTRImg from '../assets/pics/GamesPic/shadow-of-the-tomb-raider.webp';
import ULImg from '../assets/pics/GamesPic/Uncharted_Legacy_of_Thieves_Collection.webp';
import FC26Img from '../assets/pics/GamesPic/fc26.webp';
import FH6Img from '../assets/pics/GamesPic/Forza Horizon 6.webp';
import CODmw2Img from '../assets/pics/GamesPic/codmw2.webp';
import ACBfrImg from '../assets/pics/GamesPic/acbf.webp';
import RE9Img from '../assets/pics/GamesPic/RE9.webp';

export default function ProductList() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [priceLimit, setPriceLimit] = useState(3000);
  const [selectedStudio, setSelectedStudio] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPlatform, setSelectedPlatform] = useState('All');
  const [selectedMode, setSelectedMode] = useState('All');

  const allProducts = [
    { id: 1, title: 'GTA 5', price: 1500, image: GTA5Img, studio: 'Rockstar', category: 'Action', platform: 'PC', mode: 'Multiplayer' },
    { id: 2, title: 'Red dead redemption 2', price: 2000, image: RDR2Img, studio: 'Rockstar', category: 'Action', platform: 'Console', mode: 'Singleplayer' },
    { id: 3, title: 'Ghost of Tsushima', price: 1400, image: GOTImg, studio: 'Sony', category: 'Action', platform: 'Console', mode: 'Singleplayer' },
    { id: 4, title: 'Shadow of the Tomb Raider', price: 600, image: SOTRImg, studio: 'Square Enix', category: 'Adventure', platform: 'PC', mode: 'Singleplayer' },
    { id: 5, title: 'Uncharted Legacy', price: 1600, image: ULImg, studio: 'Sony', category: 'Adventure', platform: 'PC', mode: 'Singleplayer' },
    { id: 6, title: 'FC 26', price: 1200, image: FC26Img, studio: 'EA', category: 'Sports', platform: 'Console', mode: 'Multiplayer' },
    { id: 7, title: 'Forza Horizon 6', price: 1800, image: FH6Img, studio: 'Microsoft', category: 'Racing', platform: 'PC', mode: 'Multiplayer' },
    { id: 8, title: 'Call Of Duty: MW2', price: 1600, image: CODmw2Img, studio: 'Activision', category: 'Shooter', platform: 'PC', mode: 'Multiplayer' },
    { id: 9, title: 'AC black flag resynced', price: 1800, image: ACBfrImg, studio: 'Ubisoft', category: 'Action', platform: 'Console', mode: 'Singleplayer' },
    { id: 10, title: 'Resident Evil 9:Requiem', price: 1400, image: RE9Img, studio: 'Capcom', category: 'Horror', platform: 'PC', mode: 'Singleplayer' },
  ];

  const filteredProducts = allProducts.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPrice = product.price <= priceLimit;
    const matchesStudio = selectedStudio === 'All' || product.studio === selectedStudio;
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesPlatform = selectedPlatform === 'All' || product.platform === selectedPlatform;
    const matchesMode = selectedMode === 'All' || product.mode === selectedMode;

    return matchesSearch && matchesPrice && matchesStudio && matchesCategory && matchesPlatform && matchesMode;
  });

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
          input[type=range]::-webkit-slider-thumb {
            -webkit-appearance: none;
            height: 20px;
            width: 20px;
            border-radius: 50%;
            background: #ffffff;
            cursor: pointer;
            margin-top: -8px;
          }
          input[type=range]::-webkit-slider-runnable-track {
            width: 100%;
            height: 4px;
            cursor: pointer;
            background: #404040;
            border-radius: 2px;
          }
        `}
      </style>

      {/* items-start guarantees the sidebar and product grid align perfectly at the top */}
      <div className="flex flex-col lg:flex-row gap-6 xl:gap-8 items-start">
        
        {/* SIDEBAR */}
        <aside className="w-full lg:w-[280px] xl:w-[320px] bg-[#1a1a1a] rounded-[2rem] p-6 sm:p-8 flex-shrink-0 flex flex-col gap-6 lg:sticky lg:top-8 mt-0">
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
            <div className="flex items-center justify-between">
              <span className="bg-[#333333] text-gray-300 font-bold px-4 py-1.5 rounded-lg text-xs xl:text-sm">Price-Range</span>
              <span className="bg-white text-black font-bold px-3 py-1.5 rounded-lg text-xs xl:text-sm">{priceLimit}</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="3000" 
              step="100"
              value={priceLimit}
              onChange={(e) => setPriceLimit(Number(e.target.value))}
              className="w-full appearance-none bg-transparent"
            />
            <div className="w-full h-0.5 bg-[#333333] my-2"></div>
          </div>

          <div className="flex flex-col gap-4">
            
            <div className="relative">
              <select 
                value={selectedStudio}
                onChange={(e) => setSelectedStudio(e.target.value)}
                className="w-full bg-[#333333] text-gray-300 font-bold rounded-xl p-3.5 xl:p-4 appearance-none outline-none cursor-pointer hover:bg-[#404040] transition-colors text-sm xl:text-base"
              >
                <option value="All">Studio</option>
                <option value="Rockstar">Rockstar</option>
                <option value="Sony">Sony</option>
                <option value="Square Enix">Square Enix</option>
                <option value="EA">EA</option>
                <option value="Activision">Activision</option>
                <option value="Ubisoft">Ubisoft</option>
                <option value="Capcom">Capcom</option>
              </select>
              <svg className="absolute right-4 top-4 w-5 h-5 xl:w-6 xl:h-6 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>

            <div className="relative">
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-[#333333] text-gray-300 font-bold rounded-xl p-3.5 xl:p-4 appearance-none outline-none cursor-pointer hover:bg-[#404040] transition-colors text-sm xl:text-base"
              >
                <option value="All">Category</option>
                <option value="Action">Action</option>
                <option value="Adventure">Adventure</option>
                <option value="Shooter">Shooter</option>
                <option value="Sports">Sports</option>
                <option value="Racing">Racing</option>
                <option value="Horror">Horror</option>
              </select>
              <svg className="absolute right-4 top-4 w-5 h-5 xl:w-6 xl:h-6 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>

            <div className="relative">
              <select 
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="w-full bg-[#333333] text-gray-300 font-bold rounded-xl p-3.5 xl:p-4 appearance-none outline-none cursor-pointer hover:bg-[#404040] transition-colors text-sm xl:text-base"
              >
                <option value="All">Platform</option>
                <option value="PC">PC</option>
                <option value="Console">Console</option>
              </select>
              <svg className="absolute right-4 top-4 w-5 h-5 xl:w-6 xl:h-6 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>

            <div className="relative">
              <select 
                value={selectedMode}
                onChange={(e) => setSelectedMode(e.target.value)}
                className="w-full bg-[#333333] text-gray-300 font-bold rounded-xl p-3.5 xl:p-4 appearance-none outline-none cursor-pointer hover:bg-[#404040] transition-colors text-sm xl:text-base"
              >
                <option value="All">Mode</option>
                <option value="Singleplayer">Singleplayer</option>
                <option value="Multiplayer">Multiplayer</option>
              </select>
              <svg className="absolute right-4 top-4 w-5 h-5 xl:w-6 xl:h-6 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>

          </div>
        </aside>

        {/* MAIN PRODUCT GRID - Responsive columns (2 on mobile, 3 on tablet, 4 on PC) */}
        <div className="flex-1 w-full mt-0">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 xl:gap-8">
            
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product, index) => (
                <div
                  key={product.id}
                  className={`flex flex-col slide-up-physical ${isVisible ? 'in-view' : ''}`}
                  style={{ transitionDelay: `${(index % 5) * 100}ms` }}
                >
                  
                  <Link to={`/product/${product.id}`} className="block group cursor-pointer flex-grow">
                    
                    <div className="relative w-full aspect-square rounded-2xl md:rounded-[2rem] flex items-center justify-center mb-4 bg-[#1a1a1a] overflow-hidden">
                        {product.image ? (
                          <img 
                            src={product.image} 
                            alt={product.title} 
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500">
                            No Image
                          </div>
                        )}
                    </div>

                    <div className="flex flex-col mb-4">
                      <span className="font-extrabold text-white text-lg md:text-xl xl:text-2xl mb-1 group-hover:text-gray-300 transition-colors truncate">{product.title}</span>
                      <span className="text-gray-300 font-bold text-sm md:text-base">Price: {product.price} BDT</span>
                    </div>

                  </Link>

                 <button className="mt-auto w-full py-3 sm:py-4 md:py-5 bg-[#b0b0b0] hover:bg-[#2ecc71] hover:shadow-[0_0_15px_rgba(46,204,113,0.5)] transition-all duration-300 rounded-xl md:rounded-2xl flex items-center justify-center group">
                    <svg className="w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8 text-black group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </button>
                  
                </div>
              ))
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