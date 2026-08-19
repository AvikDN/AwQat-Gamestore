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
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  
  const [activeMedia, setActiveMedia] = useState({ type: 'image', url: '' });

  useEffect(() => {
    setLoading(true);
    
    Promise.all([
      apiClient.get(`/games/${id}/`),
      apiClient.get(`/games/${id}/reviews/`)
    ])
      .then(([productRes, reviewsRes]) => {
        const data = productRes.data;
        setProduct(data);
        setReviews(reviewsRes.data.results || []);
        
        if (data.video) {
          setActiveMedia({ type: 'video', url: data.video });
        } else if (data.images && data.images.length > 0) {
          setActiveMedia({ type: 'image', url: data.images[0].image });
        }
        
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching product details or reviews:", error);
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
      <div className="bg-transparent min-h-screen w-full text-white">
        <div className="max-w-[1400px] mx-auto p-4 pt-28 md:p-8 md:pt-32 xl:p-12 xl:pt-36">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 animate-pulse">
            
            <div className="lg:col-span-7 flex flex-col">
              <div className="h-12 bg-[#333] rounded-xl w-3/4 mb-6"></div>
              <div className="w-full aspect-video bg-[#1a1a1a] rounded-xl mb-4"></div>
              <div className="grid grid-cols-5 gap-4 mb-8">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="aspect-video bg-[#1a1a1a] rounded-lg"></div>
                ))}
              </div>
              <div className="h-8 bg-[#333] rounded w-1/4 mb-4"></div>
              <div className="h-24 bg-[#1a1a1a] rounded-2xl mb-8"></div>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-6 lg:mt-17">
              <div className="bg-[#1a1a1a] border border-[#333] rounded-3xl p-8 h-64"></div>
              <div className="bg-[#1a1a1a] border border-[#333] rounded-3xl p-8 h-48"></div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="bg-transparent min-h-screen w-full flex items-center justify-center text-red-500 font-bold text-xl"
      >
        Product not found.
      </motion.div>
    );
  }

  const isComingSoon = !product.active;
  const originalPrice = Number(product.price);
  const discountValue = Number(product.discount || 0);
  const hasDiscount = discountValue > 0;
  
  const unitFinalPrice = hasDiscount 
    ? (discountValue <= 100 ? originalPrice - (originalPrice * discountValue) / 100 : originalPrice - discountValue) 
    : originalPrice;

  const totalOriginalPrice = originalPrice * quantity;
  const totalPrice = unitFinalPrice * quantity;

  return (
    <div className="bg-transparent min-h-screen w-full text-white selection:bg-[#2ecc71] selection:text-black">
      
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
              {hasDiscount && !isComingSoon && (
                <div className="absolute top-4 right-4 z-10 bg-[#2ecc71] text-black font-extrabold text-sm sm:text-base px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(46,204,113,0.6)]">
                  Sale
                </div>
              )}
              {isComingSoon && (
                <div className="absolute top-4 right-4 z-10 bg-cyan-400 text-black font-extrabold text-sm sm:text-base px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.6)]">
                  Upcoming
                </div>
              )}

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

            {/* Description Section */}
            <motion.div variants={itemVariants} className="mt-10 md:mt-12 flex flex-col gap-4">
              <h2 className="text-2xl md:text-3xl font-bold text-[#2ecc71]">Description</h2>
              
              {product.developer && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 font-bold">Developed By:</span>
                  <span className="bg-[#1a1a1a] border border-[#333] text-white px-3 py-1 rounded-lg text-sm font-semibold">
                    {product.developer}
                  </span>
                </div>
              )}

              <div className="text-gray-300 text-base md:text-lg leading-relaxed whitespace-pre-line">
                <p>{product.description}</p>
              </div>
            </motion.div>

            {/* Dynamic Reviews Section */}
            <motion.div variants={itemVariants} className="mt-10 md:mt-12 w-full">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-[#2ecc71]">Customer Reviews</h2>
              <div className="flex flex-col gap-4">
               {reviews.length > 0 ? (
                 reviews.map((review) => (
                   <div 
                     key={review.id} 
                     className="bg-[#1a1a1a] border border-[#333] rounded-3xl p-6 flex flex-col gap-4 w-full"
                   >
                     <div className="flex items-center gap-4">
                       
                       <div className="w-12 h-12 bg-[#2ecc71]/10 border border-[#2ecc71]/20 rounded-full flex items-center justify-center shrink-0">
                         <span className="text-[#2ecc71] font-bold text-xl uppercase">
                           {review.user ? review.user.charAt(0) : 'U'}
                         </span>
                       </div>
                       
                       <div className="flex flex-col">
                         <span className="text-white font-bold text-xl">
                           {review.user}
                         </span>
                         
                         <div className="flex items-center gap-1 mt-1">
                           {[...Array(5)].map((_, i) => (
                             <svg 
                               key={i} 
                               className={`w-5 h-5 ${i < Math.floor(review.rating) ? 'text-[#2ecc71]' : 'text-[#333]'}`} 
                               viewBox="0 0 20 20" 
                               fill="currentColor"
                             >
                               <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                             </svg>
                           ))}
                         </div>
                       </div>
                     </div>
                     
                     <p className="text-white font-bold text-lg mt-2">
                       "{review.text}"
                     </p>
                   </div>
                 ))
               ) : (
                 <span className="text-gray-400">No reviews available for this product yet.</span>
               )}
              </div>
            </motion.div>
            
          </div>

          <div className="lg:col-span-5 flex flex-col gap-6 lg:mt-17">
            
            <motion.div variants={itemVariants} className="bg-[#1a1a1a] border border-[#333] rounded-3xl p-6 md:p-8 flex flex-col text-white shadow-2xl relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#2ecc71]/5 rounded-full blur-3xl pointer-events-none"></div>

              <span className="text-xl font-bold mb-1 text-gray-400 relative z-10">Purchase Panel</span>
              
              {isComingSoon ? (
                <div className="flex items-baseline gap-3 mb-6 relative z-10">
                  <span className="text-3xl md:text-4xl font-black tracking-tight text-cyan-400">
                    Available soon
                  </span>
                </div>
              ) : (
                <div className="flex items-baseline gap-3 mb-6 relative z-10">
                  <span className="text-sm font-bold text-white">Price:</span>
                  {hasDiscount ? (
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 line-through text-2xl md:text-3xl font-bold">
                        {totalOriginalPrice} ৳
                      </span>
                      <span className="text-3xl md:text-5xl font-black tracking-tight text-[#2ecc71]">
                        {totalPrice.toFixed(0)} ৳
                      </span>
                    </div>
                  ) : (
                    <span className="text-3xl md:text-5xl font-black tracking-tight text-[#2ecc71]">
                      {totalOriginalPrice} ৳
                    </span>
                  )}
                </div>
              )}
              
              <span className="text-sm font-bold mb-2 text-gray-400 relative z-10">Supported Platforms</span>
              <div className="flex mb-6 relative z-10">
                <span className="bg-[#2ecc71]/10 border border-[#2ecc71]/30 text-[#2ecc71] py-2 px-4 rounded-md font-bold tracking-wider">
                  {product.platforms}
                </span>
              </div>

              {/* Hide Action Buttons if product is upcoming */}
              {!isComingSoon && (
                <>
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
                </>
              )}
            </motion.div>

            {/* Dynamic System Requirements */}
            <motion.div variants={itemVariants} className="bg-[#1a1a1a] border border-[#333] rounded-3xl p-6 md:p-8 flex flex-col text-white shadow-xl">
              <h3 className="text-xl font-bold mb-5 text-[#2ecc71]">System requirement</h3>
              
              <ul className="flex flex-col gap-3 text-sm md:text-base font-medium text-gray-400">
                {product.system_requirements ? (
                  Object.entries(product.system_requirements).map(([key, value]) => (
                    <li key={key}>
                      <strong className="text-white uppercase">{key}:</strong> {value}
                    </li>
                  ))
                ) : (
                  <li>No system requirements specified.</li>
                )}
              </ul>
            </motion.div>
            
          </div>
          
        </motion.div>
      </div>
    </div>
  );
}