import React, { useState } from 'react';
import Re9Img from '../assets/pics/GamesPic/RE9.webp';
export default function ProductDetails() {
  const [quantity, setQuantity] = useState(1);

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  return (
    // Added heavy top padding (pt-32) to clear your absolute/fixed navigation bar
    <div className="w-full max-w-[1400px] mx-auto p-4 pt-28 md:p-8 md:pt-32 xl:p-12 xl:pt-36 text-white">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* LEFT COLUMN: Title, Media, and Description */}
        <div className="lg:col-span-7 flex flex-col">
          <h1 className="text-3xl md:text-5xl font-bold mb-5 md:mb-7 tracking-tight">Resident Evil 9</h1>
          
          {/* Main Media Block */}
          <div className="w-full aspect-[16/9] bg-[#1a1a1a] rounded-xl overflow-hidden flex items-center justify-center shadow-xl">
            <img 
              src={Re9Img} 
              alt="Resident Evil 9" 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Thumbnails */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-2 sm:mt-4">
            
            {/* Left Gameplay Pic */}
            <div className="aspect-[16/9] bg-[#1a1a1a] rounded-lg overflow-hidden">
                <img 
                    src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop" 
                    alt="Gameplay screenshot 1" 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                />
            </div>
            
            {/* Middle YouTube Trailer */}
            <div className="aspect-[16/9] bg-black rounded-lg overflow-hidden relative border-2 border-transparent hover:border-gray-500 transition-colors">
                <iframe 
                    className="absolute top-0 left-0 w-full h-full"
                    src="https://www.youtube.com/embed/E69tKrfEQag?si=Rj4vEwG-5lCgV1gC" 
                    title="Resident Evil 9 Trailer" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowFullScreen
                ></iframe>
            </div>
            
            {/* Right Gameplay Pic */}
            <div className="aspect-[16/9] bg-[#1a1a1a] rounded-lg overflow-hidden">
                <img 
                    src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop" 
                    alt="Gameplay screenshot 2" 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                />
            </div>
          </div>

          {/* Description Section */}
          <div className="mt-10 md:mt-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Description</h2>
            
            <div className="flex flex-col gap-4 text-gray-300 text-base md:text-lg leading-relaxed">
                <p>
                    Resident Evil 9 pushes the boundaries of survival horror. Explore a dense, atmospheric open world filled with unpredictable bio-weapons. This entry introduces advanced enemy AI that adapts to your playstyle, forcing you to constantly change tactics to survive.
                </p>
                <p>
                    Manage scarce resources, solve intricate environmental puzzles, and uncover the dark secrets behind the latest outbreak. The upgraded RE Engine delivers hyper-realistic lighting and volumetric shadows, making every dark corridor a tense experience.
                </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Purchase Panel and Requirements */}
        {/* Added lg:mt-[68px] to offset the title height and align the panel with the main image */}
        <div className="lg:col-span-5 flex flex-col gap-6 lg:mt-[68px]">
          
          {/* Purchase Panel Box */}
          <div className="bg-[#d6d6d6] rounded-[1.5rem] p-6 md:p-8 flex flex-col text-black shadow-xl">
            <span className="text-xl font-bold mb-1">Purchase Panel</span>
            <span className="text-4xl md:text-5xl font-black tracking-tight mb-6">1400TK</span>
            
            <span className="text-sm font-bold mb-2">Platform</span>
            <div className="flex gap-2 mb-6">
              <button className="w-10 h-10 bg-white rounded-md flex items-center justify-center border border-gray-300 hover:bg-gray-100 transition-colors">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="8" y1="21" x2="16" y2="21"></line>
                  <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
              </button>
              
              <button className="w-10 h-10 bg-white rounded-md flex items-center justify-center border border-gray-300 hover:bg-gray-100 transition-colors">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M8 12l8-8M16 12l-8-8M8 12l4 4 4-4"></path>
                </svg>
              </button>
              
              <button className="w-10 h-10 bg-white rounded-md flex items-center justify-center border border-gray-300 hover:bg-gray-100 transition-colors">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 21.5c-4.5 0-8-1.5-8-3.5 0-1.8 3-3.2 7-3.4V10L7 12.5v2.3M11 6.5V2l5.5 3v13.5c0 1.2-2.5 2.2-5.5 3z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-1.5 mb-6">
              <button 
                onClick={decreaseQuantity} 
                className="w-8 h-8 bg-[#404040] hover:bg-black transition-colors text-white rounded-md font-bold flex items-center justify-center"
              >
                -
              </button>
              <div className="w-10 h-8 bg-white border border-gray-300 text-black font-bold flex items-center justify-center rounded-md">
                {quantity}
              </div>
              <button 
                onClick={increaseQuantity} 
                className="w-8 h-8 bg-[#404040] hover:bg-black transition-colors text-white rounded-md font-bold flex items-center justify-center"
              >
                +
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button className="flex-1 bg-[#b0b0b0] hover:bg-[#909090] transition-colors py-3 rounded-lg text-black font-bold text-center border border-gray-400">
                Add to cart
              </button>
              <button className="flex-1 bg-[#b0b0b0] hover:bg-[#909090] transition-colors py-3 rounded-lg text-black font-bold text-center border border-gray-400">
                Buy Now
              </button>
            </div>
          </div>

          {/* System Requirements Box */}
          <div className="bg-[#d6d6d6] rounded-[1.5rem] p-6 md:p-8 flex flex-col text-black shadow-xl">
            <h3 className="text-xl font-bold mb-5">System requirement</h3>
            
            <ul className="flex flex-col gap-3 text-sm md:text-base font-medium text-gray-900">
                <li><strong className="text-black">OS:</strong> Windows 10 / 11 (64-bit)</li>
                <li><strong className="text-black">Processor:</strong> AMD Ryzen 5 3600 / Intel Core i5-10400</li>
                <li><strong className="text-black">Memory:</strong> 16 GB RAM</li>
                <li><strong className="text-black">Graphics:</strong> Radeon RX 6700 XT / GeForce RTX 3060</li>
                <li><strong className="text-black">DirectX:</strong> Version 12</li>
                <li><strong className="text-black">Storage:</strong> 60 GB available space</li>
            </ul>
          </div>
          
        </div>
        
      </div>
    </div>
  );
}