import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMinus, FaPlus, FaSpinner } from 'react-icons/fa6';
import { FaTimes, FaShoppingCart, FaArrowRight, FaLock } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import authApiClient from '../services/auth-api-client';
import { useCartContext } from '../contexts/CartContext';

const containerVariants = {
  hidden: { y: 40, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: [0.25, 1, 0.5, 1], staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

const darkStyle = {
  background: '#18181c', 
  color: '#fff', 
  border: '1px solid #27272a', 
  borderRadius: '12px',
  fontSize: '13px',
  fontWeight: '600'
};

const errorIconTheme = { primary: '#ef4444', secondary: '#18181c' };
const successIconTheme = { primary: '#2ecc71', secondary: '#18181c' };

export default function Cart() {
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState(null);
  
  const { fetchRemoteCart } = useCartContext();
  const navigate = useNavigate();

  const fetchCart = async (showSpinner = false) => {
    try {
      if (showSpinner) setIsLoading(true);
      const res = await authApiClient.get('/api/carts/');
      const cartData = Array.isArray(res.data) ? res.data[0] : res.data;
      if (cartData) {
        cartData.items = (cartData.items || []).filter(item => item.quantity > 0);
      }
      setCart(cartData);
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast.error("Failed to load your cart.", { style: darkStyle, iconTheme: errorIconTheme });
    } finally {
      if (showSpinner) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart(true);
  }, []);

  // Updated with toasts
  const updateQuantity = async (itemId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    if (!cart || updatingItemId === itemId) return;

    const isRemoving = newQuantity <= 0;
    const toastId = toast.loading(
      isRemoving ? "Removing item..." : "Updating quantity...",
      { style: darkStyle }
    );

    setUpdatingItemId(itemId);

    try {
      if (isRemoving) {
        await authApiClient.delete(`/api/carts/${cart.id}/items/${itemId}/`);
      } else {
        await authApiClient.post(`/api/carts/${cart.id}/items/`, {
          game: cart.items.find(i => i.id === itemId)?.game?.id,
          quantity: change
        });
      }
      
      await Promise.all([
        fetchCart(false),
        fetchRemoteCart()
      ]);

      toast.success(
        isRemoving ? "Item removed" : "Quantity updated",
        { id: toastId, style: darkStyle, iconTheme: successIconTheme }
      );
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Failed to update cart. Please try again.", {
        id: toastId,
        style: darkStyle,
        iconTheme: errorIconTheme
      });
    } finally {
      setUpdatingItemId(null);
    }
  };

  // Updated with toasts
  const removeItem = async (itemId) => {
    if (!cart || updatingItemId === itemId) return;

    const toastId = toast.loading("Removing item...", { style: darkStyle });
    setUpdatingItemId(itemId);

    try {
      await authApiClient.delete(`/api/carts/${cart.id}/items/${itemId}/`);
      
      await Promise.all([
        fetchCart(false),
        fetchRemoteCart()
      ]);

      toast.success("Item removed", {
        id: toastId,
        style: darkStyle,
        iconTheme: successIconTheme
      });
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item.", {
        id: toastId,
        style: darkStyle,
        iconTheme: errorIconTheme
      });
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handlePlaceOrder = async () => {
    if (!cart || !cart.items || cart.items.length === 0) {
      toast.error("Your cart is empty.", { style: darkStyle, iconTheme: errorIconTheme });
      return;
    }

    setIsProcessingOrder(true);
    const toastId = toast.loading("Placing your order...", { style: darkStyle });

    try {
      await authApiClient.post('/api/orders/', {});
      await fetchRemoteCart();
      toast.success("Order placed successfully!", {
        id: toastId,
        style: darkStyle,
        iconTheme: successIconTheme
      });
      navigate('/dashboard/history');
    } catch (error) {
      console.error("Order error:", error);
      toast.error(
        error.response?.data?.detail || error.response?.data?.cart || "Failed to place order.",
        { id: toastId, style: darkStyle, iconTheme: errorIconTheme }
      );
      setIsProcessingOrder(false);
    }
  };

  const items = cart?.items || [];
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  
  const total = items.reduce((sum, item) => {
    const game = item.game || {};
    const basePrice = parseFloat(game.price || 0);
    const discountVal = parseFloat(game.discount || 0);
    const unitPrice = discountVal > 0 
      ? (discountVal <= 100 ? basePrice - (basePrice * discountVal) / 100 : basePrice - discountVal)
      : basePrice;

    return sum + (unitPrice * item.quantity);
  }, 0);

  return (
    <div className="w-full min-h-screen bg-transparent text-white font-sans p-2 sm:p-6 lg:p-8 flex justify-center items-start select-none relative">
      
      <Toaster position="top-center" containerStyle={{ zIndex: 999999 }} />
      
      <div className="w-full max-w-[1600px] mx-auto space-y-4 sm:space-y-6 md:space-y-8 relative pt-2 sm:pt-4 md:pt-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-4 sm:space-y-6 md:space-y-8"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-[#222222] pb-4">
            <div className="flex items-center gap-3">
              <FaShoppingCart className="text-xl sm:text-3xl text-white shrink-0" />
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                My Cart
              </h1>
            </div>
            <span className="text-gray-400 text-xs sm:text-sm font-bold bg-[#1c1c1c] border border-[#2a2a2a] px-3.5 py-2 rounded-xl self-start sm:self-auto">
              Total Items: <span className="text-white">{totalItems}</span>
            </span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-8">
              <div className="lg:col-span-2 flex flex-col gap-3">
                {[...Array(2)].map((_, idx) => (
                  <div key={idx} className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-2xl p-4 sm:p-5 shadow-lg flex items-center gap-4">
                    <div className="w-16 h-20 sm:w-24 sm:h-28 bg-[#2a2a2a] animate-pulse rounded-xl shrink-0"></div>
                    <div className="flex flex-col justify-between w-full py-1 gap-3">
                      <div className="h-5 bg-[#2a2a2a] animate-pulse rounded w-3/4"></div>
                      <div className="h-4 bg-[#2a2a2a] animate-pulse rounded w-1/4"></div>
                      <div className="h-8 bg-[#2a2a2a] animate-pulse rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="lg:col-span-1">
                <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-2xl p-4 sm:p-6 shadow-lg flex flex-col gap-4">
                  <div className="h-6 bg-[#2a2a2a] animate-pulse rounded w-1/2"></div>
                  <div className="h-20 bg-[#2a2a2a] animate-pulse rounded w-full"></div>
                  <div className="h-10 bg-[#2a2a2a] animate-pulse rounded w-full"></div>
                </div>
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16 sm:py-20 px-4 bg-[#1c1c1c] border border-[#2a2a2a] rounded-2xl shadow-lg space-y-4">
              <p className="text-gray-400 text-xs sm:text-base font-medium">
                Your cart is empty. Explore products and add items to your cart!
              </p>
              <div>
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-[#2ecc71] hover:bg-[#27ae60] text-black font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md cursor-pointer"
                >
                  <span>Explore Products</span>
                  <FaArrowRight className="text-xs" />
                </Link>
              </div>
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-8"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              
              {/* Items List */}
              <div className="lg:col-span-2 flex flex-col gap-3">
                <AnimatePresence>
                  {items.map((item) => {
                    const game = item.game || {};
                    const gameImage = game.images?.[0]?.image || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=200&auto=format&fit=crop";
                    const basePrice = parseFloat(game.price || 0);
                    const discountVal = parseFloat(game.discount || 0);
                    const unitPrice = discountVal > 0 
                      ? (discountVal <= 100 ? basePrice - (basePrice * discountVal) / 100 : basePrice - discountVal)
                      : basePrice;
                    const isItemBusy = updatingItemId === item.id;

                    return (
                      <motion.div 
                        key={item.id}
                        variants={itemVariants}
                        layout
                        exit="exit"
                        className={`bg-[#1c1c1c] border border-[#2a2a2a] rounded-2xl p-3.5 sm:p-5 shadow-lg flex flex-row items-center gap-3 sm:gap-4 relative transition-all ${isItemBusy ? 'opacity-70' : 'hover:border-[#383838]'}`}
                      >
                        <button 
                          onClick={() => removeItem(item.id)}
                          disabled={isItemBusy}
                          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-white transition-colors cursor-pointer bg-[#121212] border border-[#333] p-1.5 sm:p-2 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <FaTimes size={12} />
                        </button>

                        <div className="w-16 h-20 sm:w-24 sm:h-28 shrink-0 rounded-xl overflow-hidden bg-[#121212] border border-[#333]">
                          <img 
                            src={gameImage} 
                            alt={game.title} 
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex flex-col justify-between w-full py-0.5 sm:py-1 gap-2 sm:gap-3 pr-6 sm:pr-0">
                          <div>
                            <h3 className="text-xs sm:text-lg font-bold text-white mb-1 line-clamp-1">
                              {game.title}
                            </h3>
                            <span className="bg-[#121212] border border-[#333] text-gray-300 text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg uppercase tracking-wide">
                              {game.platforms || 'PC'}
                            </span>
                          </div>

                          <div className="flex flex-row items-center justify-between gap-2 pt-2 border-t border-[#27272a]">
                            <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-gray-300 font-semibold">
                              <span className="hidden xs:inline">Qty:</span>
                              <div className="flex h-7 sm:h-8 bg-[#121212] border border-[#333] rounded-xl overflow-hidden">
                                <button 
                                  onClick={() => updateQuantity(item.id, item.quantity, -1)}
                                  disabled={isItemBusy}
                                  className="w-7 sm:w-8 h-full flex items-center justify-center bg-[#222] hover:bg-[#333] text-gray-200 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  <FaMinus size={9} />
                                </button>
                                <div className="px-2.5 sm:px-3.5 h-full flex items-center justify-center font-bold text-xs text-white border-x border-[#333]">
                                  {item.quantity}
                                </div>
                                <button 
                                  onClick={() => updateQuantity(item.id, item.quantity, 1)}
                                  disabled={isItemBusy}
                                  className="w-7 sm:w-8 h-full flex items-center justify-center bg-[#222] hover:bg-[#333] text-gray-200 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  <FaPlus size={9} />
                                </button>
                              </div>
                            </div>

                            <span className="text-sm sm:text-lg font-extrabold text-white">
                              {(unitPrice * item.quantity).toFixed(0)} ৳
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                <div className="pt-1">
                  <Link
                    to="/products"
                    className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-[#2ecc71] transition-colors"
                  >
                    <span>← Continue Shopping</span>
                  </Link>
                </div>
              </div>

              {/* Order Summary Sidebar */}
              <motion.div variants={itemVariants} className="lg:col-span-1">
                <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-2xl p-4 sm:p-6 shadow-lg flex flex-col gap-4 sm:gap-5 sticky top-8">
                  
                  <h2 className="text-lg sm:text-xl font-extrabold text-white border-b border-[#2a2a2a] pb-3">
                    Order Summary
                  </h2>

                  <div className="flex flex-col gap-2 max-h-48 sm:max-h-60 overflow-y-auto pr-1">
                    {items.map((item, idx) => {
                      const game = item.game || {};
                      const basePrice = parseFloat(game.price || 0);
                      const discountVal = parseFloat(game.discount || 0);
                      const unitPrice = discountVal > 0 
                        ? (discountVal <= 100 ? basePrice - (basePrice * discountVal) / 100 : basePrice - discountVal)
                        : basePrice;

                      return (
                        <div key={idx} className="bg-[#121212] border border-[#27272a] rounded-xl p-2.5 sm:p-3 flex items-center justify-between text-xs">
                          <div className="truncate pr-2">
                            <span className="font-bold text-zinc-200 block truncate">{game.title}</span>
                            <span className="text-zinc-500 text-[10px]">Qty: {item.quantity}</span>
                          </div>
                          <span className="font-extrabold text-white shrink-0">{(unitPrice * item.quantity).toFixed(0)} ৳</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="h-px w-full bg-[#2a2a2a]"></div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base text-white font-bold">Total Amount</span>
                    <span className="text-lg sm:text-xl font-extrabold text-[#2ecc71]">{total.toFixed(0)} ৳</span>
                  </div>

                  <div className="flex items-center gap-2 bg-[#2ecc71]/10 border border-[#2ecc71]/30 p-2.5 sm:p-3 rounded-xl text-xs text-[#2ecc71] font-semibold">
                    <FaLock className="text-sm shrink-0" />
                    <span>Secure Checkout . SSL Encrypted</span>
                  </div>

                  <button 
                    onClick={handlePlaceOrder}
                    disabled={isProcessingOrder}
                    className="w-full bg-[#2ecc71] hover:bg-[#27ae60] text-black disabled:opacity-50 font-extrabold text-xs sm:text-sm rounded-xl py-3 sm:py-3.5 transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                  >
                    {isProcessingOrder && <FaSpinner className="animate-spin text-sm" />}
                    <span>{isProcessingOrder ? 'Placing Order...' : 'Place Order'}</span>
                  </button>

                </div>
              </motion.div>

            </motion.div>
          )}

        </motion.div>
      </div>
    </div>
  );
}