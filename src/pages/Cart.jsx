import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaMinus, FaPlus, FaCheck } from 'react-icons/fa';

// Pure vertical slide-up animation
const containerVariants = {
  hidden: { y: 40 },
  visible: {
    y: 0,
    transition: { 
      duration: 0.5, 
      ease: [0.25, 1, 0.5, 1],
      staggerChildren: 0.1
    },
  },
};

const itemVariants = {
  hidden: { y: 30 },
  visible: { y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function Cart() {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      title: "Assasians's Creed: II",
      platform: "PC",
      price: 800,
      originalPrice: 1200,
      onSale: true,
      quantity: 1,
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=200&auto=format&fit=crop"
    },
    {
      id: 2,
      title: "GTA 5",
      platform: "PC",
      price: 1200,
      originalPrice: null,
      onSale: false,
      quantity: 1,
      image: "https://images.unsplash.com/photo-1552824722-24d5e4210e3d?q=80&w=200&auto=format&fit=crop"
    }
  ]);

  const [coupon, setCoupon] = useState("");

  const updateQuantity = (id, change) => {
    setCartItems(items => 
      items.map(item => {
        if (item.id === id) {
          const newQuantity = item.quantity + change;
          return { ...item, quantity: newQuantity > 0 ? newQuantity : 1 };
        }
        return item;
      })
    );
  };

  const removeItem = (id) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  // Dynamic calculations based on quantity and original price
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  
  const total = cartItems.reduce((sum, item) => {
    const itemValue = item.originalPrice ? item.originalPrice : item.price;
    return sum + (itemValue * item.quantity);
  }, 0);

  const discount = cartItems.reduce((sum, item) => {
    if (item.onSale && item.originalPrice) {
      return sum + ((item.originalPrice - item.price) * item.quantity);
    }
    return sum;
  }, 0);

  const subTotal = total - discount;

  return (
    <div className="min-h-screen font-sans p-4 md:p-8 lg:p-12 overflow-hidden flex justify-center items-start">
      
      {/* Main Container with rounded corners */}
      <div className="w-full max-w-6xl bg-[#121212] rounded-[2.5rem] p-6 md:p-10 lg:p-12 shadow-2xl">
        
        {/* Header Section */}
        <div className="flex justify-between items-end mb-8 border-b border-[#222] pb-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Cart
          </h1>
          <span className="text-gray-300 text-sm md:text-base font-medium">
            Total Item: {totalItems}
          </span>
        </div>

        {/* Main Grid Layout */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          
          {/* Left Column: Cart Items */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {cartItems.map((item) => (
              <motion.div 
                key={item.id}
                variants={itemVariants}
                className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-xl p-4 flex flex-col sm:flex-row relative"
              >
                {/* Close Button */}
                <button 
                  onClick={() => removeItem(item.id)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <FaTimes size={18} />
                </button>

                <div className="flex gap-4 sm:gap-6 w-full pr-8">
                  {/* Item Image */}
                  <div className="w-20 h-24 sm:w-24 sm:h-28 shrink-0 rounded-md overflow-hidden bg-[#222]">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Item Details */}
                  <div className="flex flex-col justify-between w-full py-1">
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-2 line-clamp-1">
                        {item.title}
                      </h3>
                      <span className="bg-[#333] text-gray-300 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wide">
                        {item.platform}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-end justify-between mt-4 sm:mt-0 gap-4">
                      
                     {/* Quantity Selector - Fully filled buttons */}
                    <div className="flex items-center gap-2 text-sm text-gray-300 font-medium">
                    <span className="mr-1">Quantity:</span>
                    <div className="flex h-7 bg-[#222] rounded-sm overflow-hidden">
                        <button 
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-7 h-full flex items-center justify-center bg-[#9c9c9c] hover:bg-[#d3d3d3] text-black transition-colors cursor-pointer"
                        >
                        <FaMinus size={10} />
                        </button>
                        <div className="px-3 h-full flex items-center justify-center font-bold min-w-[36px] text-center text-white border-x border-[#333]">
                        {item.quantity}
                        </div>
                        <button 
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-7 h-full flex items-center justify-center bg-[#9c9c9c] hover:bg-[#d3d3d3] text-black transition-colors cursor-pointer"
                        >
                        <FaPlus size={10} />
                        </button>
                    </div>
                    </div>

                      {/* Pricing */}
                      <div className="flex items-center gap-3">
                        {item.onSale && (
                          <>
                            <span className="bg-[#7fb6d6] text-black text-xs font-bold px-3 py-0.5 rounded-full">
                              Sale
                            </span>
                            <span className="text-gray-500 line-through text-sm sm:text-base font-bold">
                              {item.originalPrice * item.quantity}Tk
                            </span>
                          </>
                        )}
                        <span className="text-xl sm:text-2xl font-extrabold text-white">
                          {item.price * item.quantity}Tk
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right Column: Order Summary */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-2xl p-6 sm:p-8 flex flex-col gap-6 sticky top-8">
              
              <h2 className="text-2xl font-bold text-white mb-2">
                Order summary:
              </h2>

              <div className="flex justify-between items-center text-gray-300 text-lg">
                <span>Total</span>
                <span className="font-bold text-white tracking-wide">{total}TK</span>
              </div>

              <div className="flex justify-between items-center text-gray-300 text-lg">
                <span>Discount</span>
                <span className="font-bold text-white tracking-wide">-{discount}TK</span>
              </div>

              {/* Coupon Code Input */}
              <div className="flex flex-col gap-1.5 mt-2">
                <label className="text-gray-400 text-sm">
                  Coupon Code: <span className="text-[10px] text-gray-500">(optional)</span>
                </label>
                <div className="flex gap-3 h-11">
                  <input 
                    type="text" 
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    className="w-full bg-[#2a2a2a] border border-[#444] rounded-lg px-4 text-white outline-none focus:border-[#7fb6d6] transition-colors"
                  />
                  <button className="h-full px-4 bg-[#c0c0c0] hover:bg-white transition-colors rounded-lg flex items-center justify-center text-black shrink-0 cursor-pointer">
                    <FaCheck size={16} />
                  </button>
                </div>
              </div>

              <div className="h-px w-full bg-[#333] my-2"></div>

              <div className="flex justify-between items-center">
                <span className="text-xl text-white font-medium">Sub Total</span>
                <span className="text-xl font-bold text-white tracking-wide">{subTotal}TK</span>
              </div>

              <button className="w-full bg-[#c0c0c0] hover:bg-white text-black font-bold text-lg rounded-lg py-3 mt-4 transition-colors cursor-pointer shadow-md">
                Checkout
              </button>

            </div>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}