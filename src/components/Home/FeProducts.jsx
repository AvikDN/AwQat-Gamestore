import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom'; // 1. Import Link here

import GTA5Img from '../../assets/pics/GamesPic/GTA5.jpg';
import RDR2Img from '../../assets/pics/GamesPic/red-dead 2.jpg';
import GOTImg from '../../assets/pics/GamesPic/GOT.webp';
import SOTRImg from '../../assets/pics/GamesPic/shadow-of-the-tomb-raider.webp';
import ULImg from '../../assets/pics/GamesPic/Uncharted_Legacy_of_Thieves_Collection.webp';
import FC26Img from '../../assets/pics/GamesPic/fc26.webp';
import FH6Img from '../../assets/pics/GamesPic/Forza Horizon 6.webp';
import CODmw2Img from '../../assets/pics/GamesPic/codmw2.webp';
import ACBfrImg from '../../assets/pics/GamesPic/acbf.webp';
import RE9Img from '../../assets/pics/GamesPic/RE9.webp';

export default function FeaturedProducts() {
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

  const products = [
    { id: 1, title: 'GTA 5', price: '1500 BDT', image: GTA5Img },
    { id: 2, title: 'Red dead redemption 2', price: '2000 BDT', image: RDR2Img },
    { id: 3, title: 'Ghost of Tsushima', price: '1400 BDT', image: GOTImg },
    { id: 4, title: 'Shadow of the Tomb Raider', price: '600 BDT',image:SOTRImg },
    { id: 5, title: 'Uncharted Legacy', price: '1600 BDT',image:ULImg },
    { id: 6, title: 'FC 26', price: '1200 BDT',image:FC26Img },
    { id: 7, title: 'Forza Horizon 6', price: '1800 BDT', image: FH6Img },
    { id: 8, title: 'Call Of Duty: MW2', price: '1600 BDT',image:CODmw2Img },
    { id: 9, title: 'AC black flag resynced', price: '1800 BDT',image:ACBfrImg },
    { id: 10, title: 'Resident Evil 9:Requiem ', price: '1400 BDT',image:RE9Img },
  ];

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
        <a href="/products" className="text-white font-bold hover:underline text-lg md:text-xl">See All</a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 xl:gap-8">
        {products.map((product, index) => (
          <div
            key={product.id}
            className={`flex flex-col slide-up-physical ${isVisible ? 'in-view' : ''}`}
            style={{ transitionDelay: `${(index % 5) * 100}ms` }}
          >
            
            {/* 2. Wrap the image and text blocks in a Link component */}
            <Link to={`/product/${product.id}`} className="block group cursor-pointer">
              
              <div className="relative w-full aspect-square rounded-2xl md:rounded-[2rem] flex items-center justify-center mb-6 bg-white/5 overflow-hidden">
                  {product.image ? (
                    <img 
                      src={product.image} 
                      alt={product.title} 
                      // Added group-hover:scale-105 for a nice interaction effect when hovering over the card
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <>
                      <div className="absolute top-4 left-4 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/20"></div>
                      <svg className="w-3/4 h-3/4 text-white/30 absolute bottom-[-4px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 20L12 10L16 15L20 9L24 15" />
                          <path d="M4 20h20" />
                      </svg>
                    </>
                  )}
              </div>

              <div className="flex flex-col px-2 mb-6">
                {/* Added group-hover:underline so the text underlines when the card is hovered */}
                <span className="font-extrabold text-white text-2xl md:text-3xl mb-1 group-hover:underline">{product.title}</span>
                <span className="text-gray-300 font-bold text-lg md:text-xl">{product.price}</span>
              </div>

            </Link>

            {/* 3. The button stays outside the Link tag so it doesn't trigger navigation */}
            <button className="mt-auto w-full py-4 md:py-5 bg-[#b0b0b0] hover:bg-gray-500 transition-colors rounded-xl md:rounded-2xl flex items-center justify-center shadow-sm">
              <svg className="w-7 h-7 md:w-8 md:h-8 text-black" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </button>
            
          </div>
        ))}
      </div>
    </section>
  );
}