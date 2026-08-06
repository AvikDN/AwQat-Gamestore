import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../services/api-client';

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  
  // Track the currently displayed media
  const [activeMedia, setActiveMedia] = useState({ type: 'image', url: '' });

  useEffect(() => {
    setLoading(true);
    apiClient.get(`/games/${id}/`)
      .then(response => {
        const data = response.data;
        setProduct(data);
        
        // Set default media: video first, otherwise the first image
        if (data.video) {
          setActiveMedia({ type: 'video', url: data.video });
        } else if (data.images && data.images.length > 0) {
          setActiveMedia({ type: 'image', url: data.images[0].image });
        }
        
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching product details:", error);
        setLoading(false);
      });
  }, [id]);

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  if (loading) {
    return (
      <div className="bg-black min-h-screen w-full flex items-center justify-center text-[#2ecc71] font-bold text-xl">
        Loading...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-black min-h-screen w-full flex items-center justify-center text-red-500 font-bold text-xl">
        Product not found.
      </div>
    );
  }

  const totalPrice = Number(product.price) * quantity;

  return (
    <div className="bg-black min-h-screen w-full text-white">
      
      <div className="max-w-[1400px] mx-auto p-4 pt-28 md:p-8 md:pt-32 xl:p-12 xl:pt-36">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          <div className="lg:col-span-7 flex flex-col">
            <h1 className="text-3xl md:text-5xl font-bold mb-5 md:mb-7 tracking-tight">{product.title}</h1>
            
            {/* Main Media Block */}
            <div className="w-full aspect-video bg-[#1a1a1a] rounded-xl overflow-hidden flex items-center justify-center shadow-xl border border-transparent hover:border-[#2ecc71]/30 transition-colors">
              {activeMedia.type === 'video' && activeMedia.url ? (
                <video 
                  key={activeMedia.url}
                  className="w-full h-full object-cover"
                  src={activeMedia.url} 
                  controls
                  autoPlay
                  muted
                ></video>
              ) : activeMedia.type === 'image' && activeMedia.url ? (
                <img 
                  key={activeMedia.url}
                  src={activeMedia.url} 
                  alt={product.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-500">No media available</span>
              )}
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-4 mt-2 sm:mt-4">
              
              {/* Video Thumbnail */}
              {product.video && (
                <div 
                  onClick={() => setActiveMedia({ type: 'video', url: product.video })}
                  className={`aspect-video bg-black rounded-lg overflow-hidden relative border-2 cursor-pointer transition-colors ${activeMedia.url === product.video ? 'border-[#2ecc71]' : 'border-transparent hover:border-[#2ecc71]/50'}`}
                >
                    <video 
                        className="absolute top-0 left-0 w-full h-full object-cover opacity-50 pointer-events-none"
                        src={product.video} 
                        muted
                    ></video>
                    {/* Play icon overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                </div>
              )}

              {/* Image Thumbnails */}
              {product.images && product.images.map((imgObj) => (
                <div 
                  key={imgObj.id} 
                  onClick={() => setActiveMedia({ type: 'image', url: imgObj.image })}
                  className={`aspect-video bg-[#1a1a1a] rounded-lg overflow-hidden border-2 cursor-pointer transition-colors ${activeMedia.url === imgObj.image ? 'border-[#2ecc71]' : 'border-transparent hover:border-[#2ecc71]/50'}`}
                >
                    <img 
                        src={imgObj.image} 
                        alt="Thumbnail" 
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                </div>
              ))}
            </div>

            <div className="mt-10 md:mt-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-[#2ecc71]">Description</h2>
              
              <div className="flex flex-col gap-4 text-gray-300 text-base md:text-lg leading-relaxed whitespace-pre-line">
                  <p>{product.description}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-6 lg:mt-17">
            
            <div className="bg-[#1a1a1a] border border-[#333] rounded-3xl p-6 md:p-8 flex flex-col text-white shadow-2xl">
              <span className="text-xl font-bold mb-1 text-gray-400">Purchase Panel</span>
              
              <span className="text-4xl md:text-5xl font-black tracking-tight mb-6 text-[#2ecc71]">
                {totalPrice} BDT
              </span>
              
              <span className="text-sm font-bold mb-2 text-gray-400">Supported Platforms</span>
              <div className="flex mb-6">
                <span className="bg-[#2ecc71]/20 text-[#2ecc71] py-2 px-4 rounded-md font-bold tracking-wider">
                  {product.platforms}
                </span>
              </div>

              <div className="flex items-center gap-1.5 mb-6">
                <button 
                  onClick={decreaseQuantity} 
                  className="w-8 h-8 bg-[#333] hover:bg-[#2ecc71] hover:text-black transition-colors text-white rounded-md font-bold flex items-center justify-center"
                >
                  -
                </button>
                <div className="w-12 h-8 bg-black border border-[#333] text-white font-bold flex items-center justify-center rounded-md">
                  {quantity}
                </div>
                <button 
                  onClick={increaseQuantity} 
                  className="w-8 h-8 bg-[#333] hover:bg-[#2ecc71] hover:text-black transition-colors text-white rounded-md font-bold flex items-center justify-center"
                >
                  +
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button className="flex-1 bg-[#333] hover:bg-[#2ecc71] hover:text-black hover:shadow-[0_0_15px_rgba(46,204,113,0.5)] transition-all duration-300 py-3 rounded-lg text-white font-bold text-center border border-transparent">
                  Add to cart
                </button>
                <button className="flex-1 bg-[#2ecc71] hover:bg-[#27ae60] hover:shadow-[0_0_15px_rgba(46,204,113,0.5)] transition-all duration-300 py-3 rounded-lg text-black font-extrabold text-center border border-transparent">
                  Buy Now
                </button>
              </div>
            </div>

            <div className="bg-[#1a1a1a] border border-[#333] rounded-3xl p-6 md:p-8 flex flex-col text-white shadow-xl">
              <h3 className="text-xl font-bold mb-5 text-[#2ecc71]">System requirement</h3>
              
              <ul className="flex flex-col gap-3 text-sm md:text-base font-medium text-gray-400">
                  <li><strong className="text-white">OS:</strong> Windows 10 / 11 (64-bit)</li>
                  <li><strong className="text-white">Processor:</strong> AMD Ryzen 5 3600 / Intel Core i5-10400</li>
                  <li><strong className="text-white">Memory:</strong> 16 GB RAM</li>
                  <li><strong className="text-white">Graphics:</strong> Radeon RX 6700 XT / GeForce RTX 3060</li>
                  <li><strong className="text-white">DirectX:</strong> Version 12</li>
                  <li><strong className="text-white">Storage:</strong> 60 GB available space</li>
              </ul>
            </div>
            
          </div>
          
        </div>
      </div>
    </div>
  );
}