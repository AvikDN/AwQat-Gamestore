import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  FaHeart, 
  FaMagnifyingGlass,
  FaChevronDown, 
  FaTrashCan,
  FaChevronLeft,
  FaChevronRight,
  FaArrowUpRightFromSquare,
  FaCartShopping,
  FaTag,
  FaSliders,
  FaClock,
  FaLayerGroup,
  FaStar,
} from 'react-icons/fa6';
import { Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import ApiClient from '../services/api-client';
import AuthApiClient from '../services/auth-api-client';
import { useWishlist } from '../contexts/WishlistContext';
import { useCartContext } from '../contexts/CartContext';

const darkToastStyle = {
  background: '#18181c',
  color: '#ffffff',
  border: '1px solid #27272a',
  borderRadius: '12px',
  fontSize: '13px',
  fontWeight: '600',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
};

const getFinalPrice = (product) => {
  const originalPrice = parseFloat(product.price) || 0;
  const discountVal = parseFloat(product.discount || 0);
  if (discountVal > 0) {
    return discountVal <= 100 
      ? originalPrice - (originalPrice * (discountVal / 100)) 
      : originalPrice - discountVal;
  }
  return originalPrice;
};

export default function DashWishlists() {
  const [wishlistEntries, setWishlistEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('default');
  const [selectedStudio, setSelectedStudio] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedAvailability, setSelectedAvailability] = useState('All');

  // Price range filters
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(3000);
  const [debouncedMinPrice, setDebouncedMinPrice] = useState(0);
  const [debouncedMaxPrice, setDebouncedMaxPrice] = useState(3000);

  // Show/hide advanced filter drawer
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  const [categories, setCategories] = useState([]);
  const [studios, setStudios] = useState([]);

  const topRef = useRef(null);
  const { toggleWishlist, fetchWishlist: refreshGlobalWishlist } = useWishlist();
  const { addToCart } = useCartContext();

  // Load Categories & Studios
  useEffect(() => {
    const fetchAllPages = async (endpoint) => {
      let results = [];
      let url = endpoint;

      while (url) {
        try {
          const isAbsolute = url.startsWith('http');
          const requestUrl = isAbsolute ? `${new URL(url).pathname}${new URL(url).search}` : url;
          const res = await ApiClient.get(requestUrl);

          if (res.data && res.data.results) {
            results = [...results, ...res.data.results];
            url = res.data.next;
          } else if (Array.isArray(res.data)) {
            results = [...results, ...res.data];
            url = null;
          } else {
            url = null;
          }
        } catch (error) {
          console.error(`Error loading filter options for ${endpoint}:`, error);
          break;
        }
      }
      return results;
    };

    const loadFilters = async () => {
      try {
        const [allCategories, allStudios] = await Promise.all([
          fetchAllPages('/categories/'),
          fetchAllPages('/studios/')
        ]);
        setCategories(allCategories);
        setStudios(allStudios);
      } catch (error) {
        console.error("Error loading filter data:", error);
      }
    };

    loadFilters();
  }, []);

  // Debounce search and price slider
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setDebouncedMinPrice(minPrice);
      setDebouncedMaxPrice(maxPrice);
    }, 450);
    return () => clearTimeout(timer);
  }, [searchQuery, minPrice, maxPrice]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sortOrder, debouncedMinPrice, debouncedMaxPrice, selectedStudio, selectedCategory, selectedAvailability]);

  // Fetch Wishlist
  const fetchWishlistData = useCallback(async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({ page });

      if (debouncedSearch) queryParams.append('search', debouncedSearch);

      if (sortOrder === 'price-asc') {
        queryParams.append('ordering', 'final_price');
        queryParams.append('min_price', debouncedMinPrice === 0 ? 1 : debouncedMinPrice);
      } else if (sortOrder === 'price-desc') {
        queryParams.append('ordering', '-final_price');
        queryParams.append('min_price', debouncedMinPrice);
      } else {
        queryParams.append('min_price', debouncedMinPrice);
      }

      queryParams.append('max_price', debouncedMaxPrice);
      if (selectedStudio !== 'All') queryParams.append('studio', selectedStudio);
      if (selectedCategory !== 'All') queryParams.append('category', selectedCategory);
      if (selectedAvailability !== 'All') queryParams.append('availability', selectedAvailability);

      const response = await AuthApiClient.get(`/api/wishlist/?${queryParams.toString()}`);
      const data = response.data;

      let fetchedResults = Array.isArray(data) ? data : (data.results || []);

      if (sortOrder === 'discounted') {
        fetchedResults = fetchedResults.filter(
          item => item.game_details && parseFloat(item.game_details.discount || 0) > 0
        );
      }

      setWishlistEntries(fetchedResults);

      if (Array.isArray(data)) {
        setHasNext(false);
        setHasPrev(false);
      } else {
        setHasNext(!!data.next);
        setHasPrev(!!data.previous);
      }
    } catch (error) {
      console.error("Error fetching wishlist items:", error);
      toast.error("Failed to load your wishlist.", { style: darkToastStyle });
    } finally {
      setIsLoading(false);
    }
  }, [
    page,
    debouncedSearch,
    sortOrder,
    debouncedMinPrice,
    debouncedMaxPrice,
    selectedStudio,
    selectedCategory,
    selectedAvailability
  ]);

  useEffect(() => {
    fetchWishlistData();
  }, [fetchWishlistData]);

  const handleNextPage = () => { if (hasNext) setPage(p => p + 1); };
  const handlePrevPage = () => { if (hasPrev) setPage(p => p - 1); };

  const handleMinChange = (e) => {
    const value = Math.min(Number(e.target.value), maxPrice - 100);
    setMinPrice(value);
  };

  const handleMaxChange = (e) => {
    const value = Math.max(Number(e.target.value), minPrice + 100);
    setMaxPrice(value);
  };

  const handleResetFilters = () => {
    setSortOrder('default');
    setSearchQuery('');
    setDebouncedSearch('');
    setMinPrice(0);
    setMaxPrice(3000);
    setSelectedStudio('All');
    setSelectedCategory('All');
    setSelectedAvailability('All');
    setPage(1);
  };

  const handleRemoveItem = async (game) => {
    await toggleWishlist(game);
    await fetchWishlistData();
    if (refreshGlobalWishlist) refreshGlobalWishlist();
  };

  return (
    <div className="w-full min-h-screen bg-transparent text-white font-sans p-3 sm:p-6 lg:p-8 flex justify-center items-start select-none">
      <style>
        {`
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
            height: 16px;
            width: 16px;
            border-radius: 50%;
            background: #2ecc71;
            cursor: pointer;
          }
        `}
      </style>

      <Toaster 
        position="top-center" 
        toastOptions={{ 
          duration: 4000,
          className: '!bg-[#18181c] !text-white !border !border-[#27272a] !shadow-2xl',
          style: darkToastStyle,
        }} 
      />

      <div ref={topRef} className="w-full max-w-[1600px] mx-auto space-y-4 sm:space-y-6 md:space-y-8 relative pt-2 sm:pt-4 md:pt-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-4 sm:space-y-6 md:space-y-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-4 border-b border-[#222222] pb-4 sm:pb-5">
            <div className="flex items-center gap-3">
              <FaHeart className="text-2xl sm:text-4xl text-white shrink-0" />
              <div>
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                  My Wishlist
                </h1>
              </div>
            </div>
          </div>

          {/* Search, Filter & Quick Options Bar */}
          <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-2xl p-3 sm:p-4 shadow-lg flex flex-col gap-3">
            
            {/* Top row: search + filter drawer toggle */}
            <div className="flex items-center gap-2 sm:gap-3 w-full">
              <div className="relative flex-1">
                <FaMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs sm:text-sm" />
                <input
                  type="text"
                  placeholder="Search wishlist..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#121212] border border-[#333] rounded-xl pl-9 sm:pl-10 pr-3 py-2 text-xs sm:text-sm text-white placeholder-gray-500 outline-none focus:border-[#2ecc71] transition-colors"
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-3 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 border transition cursor-pointer shrink-0 ${
                  showFilters
                    ? 'bg-[#2ecc71] text-black border-[#2ecc71] shadow-[0_0_12px_rgba(46,204,113,0.3)]'
                    : 'bg-[#121212] text-gray-300 border-[#333] hover:border-gray-500'
                }`}
              >
                <FaSliders className="text-xs" />
                <span className="hidden sm:inline">Filters</span>
              </button>
            </div>

            {/* Bottom row: mobile-friendly filter buttons & sort dropdown */}
            <div className="grid grid-cols-3 sm:flex sm:items-center sm:justify-end gap-1.5 sm:gap-2 w-full pt-1 sm:pt-0 border-t sm:border-t-0 border-[#262626]">
              <button
                onClick={() => setSortOrder(sortOrder === 'discounted' ? 'default' : 'discounted')}
                className={`px-2 sm:px-3 py-2 rounded-xl font-bold text-[11px] sm:text-xs md:text-sm border transition cursor-pointer text-center flex items-center justify-center gap-1 ${
                  sortOrder === 'discounted'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/80 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                    : 'bg-[#121212] text-zinc-400 border-[#333] hover:border-zinc-500'
                }`}
              >
                <FaTag className="text-[10px]" />
                <span>On Sale</span>
              </button>

              <button
                onClick={() => setSelectedAvailability(selectedAvailability === 'Available' ? 'All' : 'Available')}
                className={`px-2 sm:px-3 py-2 rounded-xl font-bold text-[11px] sm:text-xs md:text-sm border transition cursor-pointer text-center flex items-center justify-center ${
                  selectedAvailability === 'Available'
                    ? 'bg-[#2ecc71]/20 text-[#2ecc71] border-[#2ecc71]/80 shadow-[0_0_12px_rgba(46,204,113,0.2)]'
                    : 'bg-[#121212] text-zinc-400 border-[#333] hover:border-zinc-500'
                }`}
              >
                Available
              </button>

              <div className="relative">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full appearance-none bg-[#121212] border border-[#333] text-zinc-300 text-[11px] sm:text-xs md:text-sm font-bold rounded-xl px-2.5 sm:px-3 py-2 pr-6 focus:outline-none focus:border-[#2ecc71] cursor-pointer"
                >
                  <option value="default">Newest</option>
                  <option value="price-asc">Price: Low</option>
                  <option value="price-desc">Price: High</option>
                </select>
                <FaChevronDown className="w-2.5 h-2.5 text-zinc-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Advanced Drawer Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-2xl p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 shadow-lg">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-400">Category</label>
                    <div className="relative">
                      <select 
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full appearance-none bg-[#121212] border border-[#333] text-zinc-200 text-xs rounded-xl px-3 py-2 pr-8 focus:outline-none focus:border-[#2ecc71] cursor-pointer font-medium"
                      >
                        <option value="All">All Categories</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                      <FaChevronDown className="w-3 h-3 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-400">Publisher / Studio</label>
                    <div className="relative">
                      <select 
                        value={selectedStudio}
                        onChange={(e) => setSelectedStudio(e.target.value)}
                        className="w-full appearance-none bg-[#121212] border border-[#333] text-zinc-200 text-xs rounded-xl px-3 py-2 pr-8 focus:outline-none focus:border-[#2ecc71] cursor-pointer font-medium"
                      >
                        <option value="All">All Studios</option>
                        {studios.map(studio => (
                          <option key={studio.id} value={studio.id}>{studio.name}</option>
                        ))}
                      </select>
                      <FaChevronDown className="w-3 h-3 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-zinc-400">Price Window</label>
                      <span className="text-[11px] text-zinc-400 font-bold">৳{minPrice} - ৳{maxPrice}</span>
                    </div>
                    <div className="relative h-6 flex items-center">
                      <div className="absolute top-1/2 left-0 w-full h-1 bg-[#27272a] -translate-y-1/2 rounded-full"></div>
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

                  <div className="sm:col-span-3 flex justify-end pt-2 border-t border-[#262626]">
                    <button
                      onClick={handleResetFilters}
                      className="w-full sm:w-auto px-4 py-2 bg-[#121212] hover:bg-[#202025] text-zinc-300 text-xs font-bold rounded-xl transition-colors cursor-pointer border border-[#333]"
                    >
                      Clear All Filters
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Wishlist Items List (Responsive Row-to-Card) */}
          <div className="space-y-3 sm:space-y-3.5 relative z-10">
            {isLoading ? (
              [...Array(4)].map((_, index) => (
                <div 
                  key={`row-skeleton-${index}`}
                  className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-2xl sm:rounded-[22px] p-3 sm:p-5 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 animate-pulse"
                >
                  <div className="w-full sm:w-40 md:w-48 aspect-16/10 bg-[#2a2a2a] rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2 w-full">
                    <div className="h-4 sm:h-5 bg-[#2a2a2a] rounded w-1/2" />
                    <div className="h-3 bg-[#2a2a2a] rounded w-1/3" />
                  </div>
                  <div className="w-full sm:w-36 h-10 bg-[#2a2a2a] rounded-xl shrink-0" />
                </div>
              ))
            ) : wishlistEntries.length > 0 ? (
              <AnimatePresence>
                {wishlistEntries.map((entry) => {
                  const game = entry.game_details;
                  if (!game) return null;

                  const coverImage = game.images && game.images.length > 0 ? game.images[0].image : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80';
                  const originalPrice = parseFloat(game.price || 0);
                  const discountVal = parseFloat(game.discount || 0);
                  const hasDiscount = discountVal > 0;
                  const finalPrice = getFinalPrice(game);
                  const isComingSoon = !game.active;

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.25 }}
                      key={entry.id || game.id}
                      className="group bg-[#1c1c1c] hover:bg-[#202020] border border-[#2a2a2a] hover:border-[#383838] rounded-2xl sm:rounded-[22px] p-3 sm:p-4 md:p-5 transition-all duration-300 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4"
                    >
                      {/* Left: Thumbnail & Game Meta Info */}
                      <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                        <Link
                          to={`/product/${game.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="relative w-24 sm:w-32 md:w-40 aspect-16/10 rounded-xl overflow-hidden bg-[#121212] border border-[#2a2a2a] shrink-0 block group/thumb"
                        >
                          <img 
                            src={coverImage} 
                            alt={game.title} 
                            className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover/thumb:bg-black/30 transition-colors flex items-center justify-center">
                            <FaArrowUpRightFromSquare className="text-white opacity-0 group-hover/thumb:opacity-100 transition-opacity w-3.5 h-3.5 drop-shadow" />
                          </div>
                          {hasDiscount && !isComingSoon && (
                            <div className="absolute top-1 left-1 sm:top-1.5 sm:left-1.5 bg-[#2ecc71] text-black font-black text-[9px] px-1 sm:px-1.5 py-0.5 rounded shadow">
                              -{discountVal.toFixed(0)}%
                            </div>
                          )}
                        </Link>

                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                            <Link
                              to={`/product/${game.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-black text-sm sm:text-base text-white hover:text-[#2ecc71] transition-colors truncate max-w-50 sm:max-w-70 md:max-w-85"
                              title={game.title}
                            >
                              {game.title}
                            </Link>

                            {isComingSoon ? (
                              <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded border bg-cyan-950/70 text-cyan-300 border-cyan-800/50 flex items-center gap-1">
                                <FaClock className="text-[8px]" /> Soon
                              </span>
                            ) : (
                              <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded border bg-emerald-950/70 text-emerald-300 border-emerald-800/50">
                                In Store
                              </span>
                            )}
                          </div>

                          {/* Attribute Badges */}
                          <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] font-semibold text-zinc-400">
                            {game.developer && (
                              <span className="bg-[#121212] border border-[#2a2a2a] px-1.5 sm:px-2 py-0.5 rounded-md text-zinc-300 truncate max-w-30">
                                {game.developer}
                              </span>
                            )}
                            {game.platforms && (
                              <span className="bg-[#121212] border border-[#2a2a2a] px-1.5 sm:px-2 py-0.5 rounded-md text-zinc-300 flex items-center gap-1">
                                <FaLayerGroup className="text-[8px]" /> {game.platforms}
                              </span>
                            )}
                            {game.rating && (
                              <span className="bg-[#121212] border border-[#2a2a2a] px-1.5 sm:px-2 py-0.5 rounded-md text-amber-400 flex items-center gap-1 font-bold">
                                <FaStar className="text-[8px]" /> {game.rating}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Pricing & Action Buttons */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#262626]">
                        {/* Price Display */}
                        <div className="text-left sm:text-right shrink-0">
                          {isComingSoon ? (
                            <span className="text-cyan-400 font-extrabold text-xs">Unannounced</span>
                          ) : hasDiscount ? (
                            <div className="flex flex-col items-start sm:items-end">
                              <span className="text-gray-500 font-bold line-through text-[9px] sm:text-[10px]">
                                ৳{originalPrice.toFixed(2)}
                              </span>
                              <span className="text-sm sm:text-base md:text-lg font-black text-white leading-tight">
                                ৳{finalPrice.toFixed(2)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm sm:text-base md:text-lg font-black text-white">
                              ৳{originalPrice.toFixed(2)}
                            </span>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <Link
                            to={`/product/${game.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 sm:px-3 sm:py-2 bg-[#121212] hover:bg-[#202025] text-zinc-200 border border-[#2a2a2a] hover:border-[#383838] text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                            title="View details"
                          >
                            <FaArrowUpRightFromSquare className="w-3.5 h-3.5 text-cyan-400" />
                            <span className="hidden sm:inline">Details</span>
                          </Link>

                          {/* Icon-Only Add to Cart Button */}
                          <button
                            onClick={() => {
                              if (!isComingSoon && addToCart) {
                                addToCart(game, 1);
                              }
                            }}
                            disabled={isComingSoon}
                            className={`p-2 sm:p-2.5 rounded-xl transition-all flex items-center justify-center cursor-pointer ${
                              isComingSoon
                                ? 'bg-[#121212] text-zinc-600 border border-[#2a2a2a] cursor-not-allowed opacity-40'
                                : 'bg-[#2ecc71] hover:bg-[#27ae60] text-black shadow-md'
                            }`}
                            title={isComingSoon ? "Unavailable for purchase" : "Add to Cart"}
                          >
                            <FaCartShopping className="w-3.5 h-3.5" />
                          </button>

                          {/* Remove Button */}
                          <button
                            onClick={() => handleRemoveItem(game)}
                            className="p-2 sm:p-2.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 hover:border-rose-500 rounded-xl transition-all cursor-pointer"
                            title="Remove from wishlist"
                          >
                            <FaTrashCan className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            ) : (
              <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-2xl sm:rounded-[22px] py-12 sm:py-16 px-4 text-center text-zinc-400 flex flex-col items-center justify-center gap-3 shadow-lg">
                <div className="w-12 h-12 rounded-full bg-[#121212] border border-[#2a2a2a] flex items-center justify-center text-zinc-600">
                  <FaHeart className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-white">No wishlisted titles found</h3>
                <p className="text-xs text-zinc-500 max-w-xs">
                  Try clearing your search filters or explore the catalog to save titles you like.
                </p>
                <Link
                  to="/products"
                  className="mt-2 px-5 py-2 bg-[#2ecc71] hover:bg-[#27ae60] text-black text-xs font-black rounded-xl transition-all shadow-md"
                >
                  Browse Store
                </Link>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {!isLoading && (hasNext || hasPrev) && (
            <div className="flex items-center justify-between gap-3 pt-3 pb-2">
              <button
                onClick={handlePrevPage}
                disabled={page === 1 || !hasPrev}
                className="flex-1 sm:flex-none px-4 py-2 bg-[#1c1c1c] hover:bg-[#2a2a2a] disabled:opacity-40 disabled:hover:bg-[#1c1c1c] text-zinc-300 text-xs font-extrabold rounded-xl border border-[#2a2a2a] flex items-center justify-center gap-1.5 transition cursor-pointer disabled:cursor-not-allowed shadow-md"
              >
                <FaChevronLeft className="text-[10px]" /> Prev
              </button>

              <span className="text-xs text-zinc-400 font-semibold text-center whitespace-nowrap px-2">
                Page <span className="text-white font-bold">{page}</span>
              </span>

              <button
                onClick={handleNextPage}
                disabled={!hasNext}
                className="flex-1 sm:flex-none px-4 py-2 bg-[#1c1c1c] hover:bg-[#2a2a2a] disabled:opacity-40 disabled:hover:bg-[#1c1c1c] text-zinc-300 text-xs font-extrabold rounded-xl border border-[#2a2a2a] flex items-center justify-center gap-1.5 transition cursor-pointer disabled:cursor-not-allowed shadow-md"
              >
                Next <FaChevronRight className="text-[10px]" />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}