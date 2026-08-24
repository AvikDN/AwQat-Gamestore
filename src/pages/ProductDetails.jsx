import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { FaStar, FaTrashCan, FaPenToSquare } from 'react-icons/fa6';
import { FaSpinner, FaSave, FaTimes } from 'react-icons/fa';

import apiClient from '../services/api-client';
import AuthApiClient from '../services/auth-api-client';
import { useCartContext } from '../contexts/CartContext';

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

  // Mobile Tabs State
  const [activeTab, setActiveTab] = useState('purchase'); // 'purchase', 'sysreq', 'reviews'

  // Current User State & Purchase Verification
  const [currentUser, setCurrentUser] = useState(null);
  const [hasPurchased, setHasPurchased] = useState(false);

  // Review Form States (Default 4 Stars)
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(4);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Edit Review States (Default 4 Stars)
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editReviewText, setEditReviewText] = useState('');
  const [editReviewRating, setEditReviewRating] = useState(4);
  const [isUpdatingReview, setIsUpdatingReview] = useState(false);

  const { addToCart } = useCartContext();

  useEffect(() => {
    setLoading(true);
    
    // Fetch product, reviews, and current user profile simultaneously
    Promise.allSettled([
      apiClient.get(`/games/${id}/`),
      apiClient.get(`/games/${id}/reviews/`),
      AuthApiClient.get('/api/profile/me/')
    ])
      .then(([productRes, reviewsRes, profileRes]) => {
        if (productRes.status === 'fulfilled') {
          const data = productRes.value.data;
          setProduct(data);
          if (data.video) {
            setActiveMedia({ type: 'video', url: data.video });
          } else if (data.images && data.images.length > 0) {
            setActiveMedia({ type: 'image', url: data.images[0].image });
          }
        }
        
        if (reviewsRes.status === 'fulfilled') {
          setReviews(reviewsRes.value.data.results || reviewsRes.value.data || []);
        }

        if (profileRes.status === 'fulfilled') {
          setCurrentUser(profileRes.value.data);
        }
        
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching product details:", error);
        setLoading(false);
      });
  }, [id]);

  // Check Purchase Status once currentUser is loaded
  useEffect(() => {
    if (currentUser) {
      const orders = currentUser.profile?.order_history || currentUser.order_history;
      
      if (orders) {
        const purchased = orders.some(o => 
          (o.status || o.order_status)?.toLowerCase() !== 'cancelled' &&
          (o.items || o.games || []).some(i => String(i.game || i.game_id) === String(id))
        );
        setHasPurchased(purchased);
      } else {
        AuthApiClient.get('/api/orders/')
          .then(res => {
            const allOrders = res.data.results || res.data || [];
            const purchased = allOrders.some(o => 
              o.status?.toLowerCase() !== 'cancelled' &&
              o.items?.some(i => String(i.game) === String(id))
            );
            setHasPurchased(purchased);
          })
          .catch(err => console.error("Could not verify purchase history:", err));
      }
    }
  }, [currentUser, id]);

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  // --- Review Handlers ---
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return toast.error("Review cannot be empty.");

    setIsSubmittingReview(true);
    const toastId = toast.loading("Posting review...");

    try {
      const response = await AuthApiClient.post(`/api/games/${id}/reviews/`, {
        game: id,
        text: reviewText.trim(),
        rating: reviewRating
      });
      
      setReviews([response.data, ...reviews]);
      setReviewText('');
      setReviewRating(4); 
      toast.success("Review posted successfully!", { id: toastId });
    } catch (error) {
      console.error("Review posting error:", error);
      toast.error(
        error.response?.data?.detail || 
        error.response?.data?.non_field_errors?.[0] || 
        error.response?.data?.game?.[0] ||
        "Failed to post review.", 
        { id: toastId }
      );
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    const toastId = toast.loading("Deleting review...");
    try {
      await AuthApiClient.delete(`/api/reviews/${reviewId}/`);
      setReviews(reviews.filter(r => r.id !== reviewId));
      toast.success("Review deleted.", { id: toastId });
    } catch (error) {
      console.error("Delete review error:", error);
      toast.error("Failed to delete review.", { id: toastId });
    }
  };

  const startEditing = (review) => {
    setEditingReviewId(review.id);
    setEditReviewText(review.text);
    setEditReviewRating(review.rating);
  };

  const cancelEditing = () => {
    setEditingReviewId(null);
    setEditReviewText('');
    setEditReviewRating(4);
  };

  const handleUpdateReview = async () => {
    if (!editReviewText.trim()) return toast.error("Review cannot be empty.");

    setIsUpdatingReview(true);
    const toastId = toast.loading("Updating review...");

    try {
      const response = await AuthApiClient.patch(`/api/reviews/${editingReviewId}/`, {
        text: editReviewText.trim(),
        rating: editReviewRating
      });

      setReviews(reviews.map(r => r.id === editingReviewId ? response.data : r));
      setEditingReviewId(null);
      toast.success("Review updated!", { id: toastId });
    } catch (error) {
      console.error("Update review error:", error);
      toast.error("Failed to update review.", { id: toastId });
    } finally {
      setIsUpdatingReview(false);
    }
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
  
  const discountPercentage = hasDiscount 
    ? (discountValue <= 100 ? discountValue : Math.round((discountValue / originalPrice) * 100))
    : 0;
  
  const unitFinalPrice = hasDiscount 
    ? (discountValue <= 100 ? originalPrice - (originalPrice * discountValue) / 100 : originalPrice - discountValue) 
    : originalPrice;

  const totalOriginalPrice = originalPrice * quantity;
  const totalPrice = unitFinalPrice * quantity;

  const hasReviewed = currentUser && reviews.some(r => r.user === currentUser.username);

  // --- Render Sections ---

  const renderPurchasePanel = () => (
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
        <div className="flex items-baseline gap-2 mb-6 relative z-10">
          <span className="text-sm font-bold text-white">Price:</span>
          {hasDiscount ? (
            <>
              <span className="text-sm font-bold text-gray-400 line-through">
                {totalOriginalPrice} ৳
              </span>
              <span className="text-3xl md:text-5xl font-black tracking-tight text-[#2ecc71] ml-2">
                {totalPrice.toFixed(0)} ৳
              </span>
            </>
          ) : (
            <span className="text-3xl md:text-5xl font-black tracking-tight text-[#2ecc71] ml-2">
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

      {!isComingSoon && (
        <>
          <div className="flex items-center gap-1.5 mb-6 relative z-10">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={decreaseQuantity} 
              className="w-8 h-8 bg-[#333] hover:bg-[#2ecc71] hover:text-black transition-colors text-white rounded-md font-bold flex items-center justify-center cursor-pointer"
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
              className="w-8 h-8 bg-[#333] hover:bg-[#2ecc71] hover:text-black transition-colors text-white rounded-md font-bold flex items-center justify-center cursor-pointer"
            >
              +
            </motion.button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 relative z-10">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => addToCart(product, quantity)}
              className="flex-1 bg-[#333] hover:bg-[#2ecc71] hover:text-black hover:shadow-[0_0_15px_rgba(46,204,113,0.5)] transition-all duration-300 py-3 rounded-lg text-white font-bold text-center border border-transparent cursor-pointer"
            >
              Add to cart
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => addToCart(product, quantity)}
              className="flex-1 bg-[#2ecc71] hover:bg-[#27ae60] hover:shadow-[0_0_15px_rgba(46,204,113,0.5)] transition-all duration-300 py-3 rounded-lg text-black font-extrabold text-center border border-transparent cursor-pointer"
            >
              Buy Now
            </motion.button>
          </div>
        </>
      )}
    </motion.div>
  );

  const renderSysReqPanel = () => (
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
  );

  const renderReviewsPanel = () => (
    <motion.div variants={itemVariants} className="w-full space-y-8">
      <h2 className="text-2xl md:text-3xl font-bold text-[#2ecc71] hidden lg:block">Customer Reviews</h2>
      
      {/* Write a Review Form - ONLY visible if they purchased the game */}
      {currentUser && hasPurchased && !hasReviewed && (
        <div className="bg-[#1a1a1a] border border-[#333] rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#2ecc71]/5 blur-3xl pointer-events-none rounded-full"></div>
          <h3 className="text-lg font-bold text-white mb-4 relative z-10">Write a Review</h3>
          <form onSubmit={handleSubmitReview} className="relative z-10">
            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Rating</label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map(num => (
                  <FaStar
                    key={num}
                    onClick={() => setReviewRating(num)}
                    className={`w-6 h-6 cursor-pointer transition-colors ${num <= reviewRating ? 'text-[#2ecc71] drop-shadow-[0_0_5px_rgba(46,204,113,0.5)]' : 'text-[#333] hover:text-[#555]'}`}
                  />
                ))}
              </div>
            </div>
            <div className="mb-4">
              <textarea
                rows="3"
                placeholder="What did you think about this game?"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="w-full bg-[#121212] border border-[#333] focus:border-[#2ecc71] rounded-xl p-4 text-sm text-white outline-none resize-none transition-colors shadow-inner"
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={isSubmittingReview}
              className="bg-[#2ecc71] hover:bg-[#27ae60] text-black font-extrabold px-6 py-2.5 rounded-xl transition-all shadow-[0_0_10px_rgba(46,204,113,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmittingReview ? <FaSpinner className="animate-spin" /> : <FaPenToSquare />}
              Post Review
            </button>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="flex flex-col gap-4">
        {reviews.length > 0 ? (
          reviews.map((review) => {
            const isEditing = editingReviewId === review.id;
            const isOwner = currentUser && currentUser.username === review.user;
            const dateObj = new Date(review.created_at || Date.now());

            return (
              <div 
                key={review.id} 
                className="bg-[#1a1a1a] border border-[#333] rounded-3xl p-5 sm:p-6 flex flex-col gap-4 w-full group relative overflow-hidden transition-colors hover:border-[#2ecc71]/30"
              >
                <div className="flex items-start justify-between gap-4 relative z-10">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-11 h-11 bg-[#121212] border border-[#333] rounded-full flex items-center justify-center shrink-0 bg-cover bg-center shadow-inner"
                      style={{ backgroundImage: review.user_avatar ? `url(${review.user_avatar})` : 'none' }}
                    >
                      {!review.user_avatar && (
                        <span className="text-[#2ecc71] font-black text-lg uppercase">
                          {review.user ? review.user.charAt(0) : 'U'}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-white font-bold sm:text-lg tracking-tight">
                        {review.user}
                      </span>
                      
                      {isEditing ? (
                        <div className="flex gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map(num => (
                            <FaStar
                              key={num}
                              onClick={() => setEditReviewRating(num)}
                              className={`w-4 h-4 cursor-pointer transition-colors ${num <= editReviewRating ? 'text-[#2ecc71]' : 'text-[#333]'}`}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <FaStar 
                              key={i}
                              className={`w-3.5 h-3.5 ${i < review.rating ? 'text-[#2ecc71]' : 'text-[#333]'}`} 
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {isOwner && !isEditing && (
                    <div className="flex items-center gap-2 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => startEditing(review)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#222] hover:bg-[#333] text-gray-300 transition-colors"
                        title="Edit Review"
                      >
                        <FaPenToSquare className="text-xs" />
                      </button>
                      <button 
                        onClick={() => handleDeleteReview(review.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white transition-colors border border-rose-500/20 hover:border-transparent"
                        title="Delete Review"
                      >
                        <FaTrashCan className="text-xs" />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="relative z-10 pl-[60px]">
                  {isEditing ? (
                    <div className="flex flex-col gap-3">
                      <textarea
                        rows="3"
                        value={editReviewText}
                        onChange={(e) => setEditReviewText(e.target.value)}
                        className="w-full bg-[#121212] border border-[#333] focus:border-[#2ecc71] rounded-xl p-3 text-sm text-white outline-none resize-none transition-colors"
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={cancelEditing}
                          disabled={isUpdatingReview}
                          className="px-4 py-1.5 bg-[#222] hover:bg-[#333] text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
                        >
                          <FaTimes /> Cancel
                        </button>
                        <button
                          onClick={handleUpdateReview}
                          disabled={isUpdatingReview}
                          className="px-4 py-1.5 bg-[#2ecc71] hover:bg-[#27ae60] text-black text-xs font-extrabold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
                        >
                          {isUpdatingReview ? <FaSpinner className="animate-spin" /> : <FaSave />}
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                        {review.text}
                      </p>
                      <p className="text-[11px] text-gray-500 font-medium mt-3">
                        {dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-[#1a1a1a] border border-[#333] rounded-3xl p-10 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-[#222] rounded-full flex items-center justify-center mb-4 text-[#333]">
              <FaStar className="w-8 h-8" />
            </div>
            <span className="text-gray-400 font-medium">No reviews available for this product yet.</span>
            <span className="text-gray-500 text-sm mt-1">Check back later for community thoughts!</span>
          </div>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="bg-transparent min-h-screen w-full text-white selection:bg-[#2ecc71] selection:text-black">
      <Toaster 
        position="top-center" 
        toastOptions={{ 
          style: { background: '#18181c', color: '#fff', border: '1px solid #27272a', borderRadius: '12px', fontSize: '13px', fontWeight: '600' },
          success: { iconTheme: { primary: '#10b981', secondary: '#18181c' } },
          error: { iconTheme: { primary: '#f87171', secondary: '#18181c' } }
        }} 
      />

      <div className="max-w-[1400px] mx-auto p-4 pt-28 md:p-8 md:pt-32 xl:p-12 xl:pt-36">
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12"
        >
          
          {/* Left Column (Desktop) / Top Section (Mobile) */}
          <div className="lg:col-span-7 flex flex-col">
            <motion.h1 variants={itemVariants} className="text-3xl md:text-5xl font-bold mb-5 md:mb-7 tracking-tight">
              {product.title}
            </motion.h1>
            
            <motion.div variants={itemVariants} className="w-full aspect-video bg-[#1a1a1a] rounded-xl overflow-hidden flex items-center justify-center shadow-xl border border-transparent hover:border-[#2ecc71]/30 transition-colors relative">
              {hasDiscount && !isComingSoon && (
                <div className="absolute top-4 right-4 z-10 bg-[#2ecc71] text-black font-extrabold text-sm sm:text-base px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(46,204,113,0.6)]">
                  -{discountPercentage}%
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

            {/* Desktop Reviews Section */}
            <div className="hidden lg:block mt-16">
              {renderReviewsPanel()}
            </div>
            
          </div>

          {/* Right Column (Desktop Only) */}
          <div className="lg:col-span-5 hidden lg:flex flex-col gap-6 lg:mt-17">
            {renderPurchasePanel()}
            {renderSysReqPanel()}
          </div>

          {/* Mobile Tabs Section (Mobile Only) */}
          <div className="lg:hidden col-span-1 flex flex-col mt-8">
            <div className="flex bg-[#1a1a1a] rounded-2xl p-1.5 mb-6 border border-[#333] shadow-lg sticky top-24 z-30 backdrop-blur-md bg-opacity-90">
              <button 
                onClick={() => setActiveTab('purchase')} 
                className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-colors ${activeTab === 'purchase' ? 'bg-[#2ecc71] text-black shadow-md' : 'text-gray-400 hover:text-white'}`}
              >
                Purchase
              </button>
              <button 
                onClick={() => setActiveTab('sysreq')} 
                className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-colors ${activeTab === 'sysreq' ? 'bg-[#2ecc71] text-black shadow-md' : 'text-gray-400 hover:text-white'}`}
              >
                .sys
              </button>
              <button 
                onClick={() => setActiveTab('reviews')} 
                className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-colors ${activeTab === 'reviews' ? 'bg-[#2ecc71] text-black shadow-md' : 'text-gray-400 hover:text-white'}`}
              >
                Reviews
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
                  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
                }}
                className="flex flex-col gap-6"
              >
                {activeTab === 'purchase' && renderPurchasePanel()}
                {activeTab === 'sysreq' && renderSysReqPanel()}
                {activeTab === 'reviews' && renderReviewsPanel()}
              </motion.div>
            </AnimatePresence>
          </div>
          
        </motion.div>
      </div>
    </div>
  );
}