import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../services/api-client';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  
  const [activeMedia, setActiveMedia] = useState({ type: 'image', url: '' });

  useEffect(() => {
    setLoading(true);
    apiClient.get(`/games/${id}/`)
      .then(response => {
        const data = response.data;
        setProduct(data);
        
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
      <div className="bg-black min-h-screen w-full flex items-center justify-center">
        <motion.div 
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="text-[#2ecc71] font-bold text-xl drop-shadow-[0_0_10px_rgba(46,204,113,0.8)]"
        >
          Loading Details...
        </motion.div>
      </div>
    );
  }

  if (!product) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="bg-black min-h-screen w-full flex items-center justify-center text-red-500 font-bold text-xl"
      >
        Product not found.
      </motion.div>
    );
  }

  const totalPrice = Number(product.price) * quantity;

  return (
    <div className="bg-black min-h-screen w-full text-white selection:bg-[#2ecc71] selection:text-black">
      
      <div className="max-w-[1400px] mx-auto p-4 pt-28 md:p-8 md:pt-32 xl:p-12 xl:pt-36">
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12"
        >
          
          <div className="lg:col-span-7 flex flex-col">
            <motion.h1 variants={itemVariants} className="text-3xl md:text-5xl font-bold mb-5 md:mb-7 tracking-tight">
              {product.title}
            </motion.h1>
            
            {/* Main Media Block */}
            <motion.div variants={itemVariants} className="w-full aspect-video bg-[#1a1a1a] rounded-xl overflow-hidden flex items-center justify-center shadow-xl border border-transparent hover:border-[#2ecc71]/30 transition-colors relative">
              <AnimatePresence mode="wait">
                {activeMedia.type === 'video' && activeMedia.url ? (
                  <motion.video 
                    key={activeMedia.url}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full object-cover absolute inset-0"
                    src={activeMedia.url} 
                    controls
                    autoPlay
                    muted
                  ></motion.video>
                ) : activeMedia.type === 'image' && activeMedia.url ? (
                  <motion.img 
                    key={activeMedia.url}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    src={activeMedia.url} 
                    alt={product.title} 
                    className="w-full h-full object-cover absolute inset-0"
                  />
                ) : (
                  <span className="text-gray-500">No media available</span>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Thumbnails */}
            <motion.div variants={itemVariants} className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-4 mt-2 sm:mt-4">
              
              {/* Video Thumbnail */}
              {product.video && (
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveMedia({ type: 'video', url: product.video })}
                  className={`aspect-video bg-black rounded-lg overflow-hidden relative border-2 cursor-pointer transition-colors ${activeMedia.url === product.video ? 'border-[#2ecc71]' : 'border-transparent hover:border-[#2ecc71]/50'}`}
                >
                    <video 
                        className="absolute top-0 left-0 w-full h-full object-cover opacity-50 pointer-events-none"
                        src={product.video} 
                        muted
                    ></video>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-8 h-8 text-white drop-shadow-md" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                </motion.div>
              )}

              {/* Image Thumbnails */}
              {product.images && product.images.map((imgObj) => (
                <motion.div 
                  key={imgObj.id} 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveMedia({ type: 'image', url: imgObj.image })}
                  className={`aspect-video bg-[#1a1a1a] rounded-lg overflow-hidden border-2 cursor-pointer transition-colors ${activeMedia.url === imgObj.image ? 'border-[#2ecc71]' : 'border-transparent hover:border-[#2ecc71]/50'}`}
                >
                    <img 
                        src={imgObj.image} 
                        alt="Thumbnail" 
                        className="w-full h-full object-cover"
                    />
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={itemVariants} className="mt-10 md:mt-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-[#2ecc71]">Description</h2>
          
          <div className="flex flex-col gap-4 text-gray-300 text-base md:text-lg leading-relaxed whitespace-pre-line">
              <p>From {product.studio_name}, {product.description}</p>
          </div>
            </motion.div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-6 lg:mt-17">
            
            <motion.div variants={itemVariants} className="bg-[#1a1a1a] border border-[#333] rounded-3xl p-6 md:p-8 flex flex-col text-white shadow-2xl relative overflow-hidden">
              {/* Subtle background glow */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#2ecc71]/5 rounded-full blur-3xl pointer-events-none"></div>

              <span className="text-xl font-bold mb-1 text-gray-400 relative z-10">Purchase Panel</span>
              
              <span className="text-4xl md:text-5xl font-black tracking-tight mb-6 text-[#2ecc71] relative z-10">
                {totalPrice} BDT
              </span>
              
              <span className="text-sm font-bold mb-2 text-gray-400 relative z-10">Supported Platforms</span>
              <div className="flex mb-6 relative z-10">
                <span className="bg-[#2ecc71]/10 border border-[#2ecc71]/30 text-[#2ecc71] py-2 px-4 rounded-md font-bold tracking-wider">
                  {product.platforms}
                </span>
              </div>

              <div className="flex items-center gap-1.5 mb-6 relative z-10">
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={decreaseQuantity} 
                  className="w-8 h-8 bg-[#333] hover:bg-[#2ecc71] hover:text-black transition-colors text-white rounded-md font-bold flex items-center justify-center"
                >
                  -
                </motion.button>
                <div className="w-12 h-8 bg-black border border-[#333] text-white font-bold flex items-center justify-center rounded-md">
                  {quantity}
                </div>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={increaseQuantity} 
                  className="w-8 h-8 bg-[#333] hover:bg-[#2ecc71] hover:text-black transition-colors text-white rounded-md font-bold flex items-center justify-center"
                >
                  +
                </motion.button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 relative z-10">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-[#333] hover:bg-[#2ecc71] hover:text-black hover:shadow-[0_0_15px_rgba(46,204,113,0.5)] transition-all duration-300 py-3 rounded-lg text-white font-bold text-center border border-transparent"
                >
                  Add to cart
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-[#2ecc71] hover:bg-[#27ae60] hover:shadow-[0_0_15px_rgba(46,204,113,0.5)] transition-all duration-300 py-3 rounded-lg text-black font-extrabold text-center border border-transparent"
                >
                  Buy Now
                </motion.button>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-[#1a1a1a] border border-[#333] rounded-3xl p-6 md:p-8 flex flex-col text-white shadow-xl">
              <h3 className="text-xl font-bold mb-5 text-[#2ecc71]">System requirement</h3>
              
              <ul className="flex flex-col gap-3 text-sm md:text-base font-medium text-gray-400">
                  <li><strong className="text-white">OS:</strong> Windows 10 / 11 (64-bit)</li>
                  <li><strong className="text-white">Processor:</strong> AMD Ryzen 5 3600 / Intel Core i5-10400</li>
                  <li><strong className="text-white">Memory:</strong> 16 GB RAM</li>
                  <li><strong className="text-white">Graphics:</strong> Radeon RX 6700 XT / GeForce RTX 3060</li>
                  <li><strong className="text-white">DirectX:</strong> Version 12</li>
                  <li><strong className="text-white">Storage:</strong> 60 GB available space</li>
              </ul>
            </motion.div>
            
          </div>
          
        </motion.div>
      </div>
    </div>
  );
}