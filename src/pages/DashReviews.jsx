import React, { useState, useEffect } from 'react';
import { 
  FaStar, 
  FaArrowTrendUp, 
  FaUsers, 
  FaGamepad, 
  FaMagnifyingGlass, 
  FaTrashCan, 
  FaMessage,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaSpinner
} from 'react-icons/fa6';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import AuthApiClient from '../services/auth-api-client';

export default function Dashreview() {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filtering & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterRating, setFilterRating] = useState('all');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const itemsPerPage = 16;

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filterRating, sortBy]);

  // Fetch Reviews from Backend
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true);
        const queryParams = new URLSearchParams({
          page: currentPage,
          page_size: itemsPerPage
        });

        if (debouncedSearch) {
          queryParams.append('search', debouncedSearch);
        }

        if (filterRating !== 'all') {
          queryParams.append('rating', filterRating);
        }

        if (sortBy === 'newest') queryParams.append('ordering', '-created_at');
        if (sortBy === 'oldest') queryParams.append('ordering', 'created_at');
        if (sortBy === 'highest') queryParams.append('ordering', '-rating');
        if (sortBy === 'lowest') queryParams.append('ordering', 'rating');

        const response = await AuthApiClient.get(`/api/reviews/?${queryParams.toString()}`);
        const data = response.data;

        setTotalCount(data.count || 0);
        setHasNext(!!data.next);
        setHasPrev(!!data.previous);

        const results = Array.isArray(data) ? data : (data.results || []);
        setReviews(results);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        toast.error("Failed to load reviews.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [currentPage, debouncedSearch, filterRating, sortBy]);

  // Metrics
  const totalReviews = totalCount;
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : '0.0';
  const uniqueUsers = new Set(reviews.map((r) => r.user)).size;
  const gamesReviewed = new Set(reviews.map((r) => r.game)).size;

  // Deletion Handlers
  const executeDelete = async (id) => {
    const toastId = toast.loading("Deleting review...");
    try {
      await AuthApiClient.delete(`reviews/${id}/`);
      setReviews(prev => prev.filter(r => r.id !== id));
      setTotalCount(prev => prev - 1);
      toast.success("Review deleted!", { id: toastId });
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review.", { id: toastId });
    }
  };

  const confirmDelete = (id) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3 min-w-[200px]">
          <p className="text-sm font-semibold text-white">
            Are you sure you want to delete this review?
          </p>
          <div className="flex gap-2 justify-end mt-1">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1.5 bg-[#2a2a2a] hover:bg-[#333] text-gray-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                executeDelete(id); 
              }}
              className="px-3 py-1.5 bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        style: {
          background: '#18181c',
          color: '#fff',
          border: '1px solid #27272a',
          borderRadius: '12px',
          fontSize: '13px',
          fontWeight: '600'
        }
      }
    );
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;

  return (
    <div className="w-full min-h-screen bg-transparent text-zinc-100 p-3 sm:p-6 lg:p-8 font-sans flex justify-center items-start select-none">
      
      <Toaster 
        position="top-center"
        toastOptions={{
          style: { background: '#18181c', color: '#fff', border: '1px solid #27272a', borderRadius: '12px', fontSize: '13px', fontWeight: '600' },
          success: { iconTheme: { primary: '#10b981', secondary: '#18181c' } },
          error: { iconTheme: { primary: '#f87171', secondary: '#18181c' } }
        }}
      />

      <div className="w-full max-w-[1600px] mx-auto space-y-4 sm:space-y-6 md:space-y-8 relative pt-2 sm:pt-4 md:pt-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222222] pb-4 sm:pb-5">
          <div className="flex items-center gap-3">
            <FaStar className="text-2xl sm:text-4xl text-white shrink-0" />
            <div>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                Customer Reviews
              </h1>
            </div>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-[22px] p-4 sm:p-5 flex items-center justify-between shadow-lg">
            <div>
              <p className="text-[10px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Reviews</p>
              <p className="text-2xl sm:text-3xl font-black mt-1 text-white">{isLoading ? '-' : totalReviews}</p>
            </div>
            <FaStar className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500 opacity-80" />
          </div>

          <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-[22px] p-4 sm:p-5 flex items-center justify-between shadow-lg">
            <div>
              <p className="text-[10px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-wider">Average Rating</p>
              <p className="text-2xl sm:text-3xl font-black mt-1 text-white">{isLoading ? '-' : avgRating}</p>
            </div>
            <FaArrowTrendUp className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500 opacity-80" />
          </div>

          <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-[22px] p-4 sm:p-5 flex items-center justify-between shadow-lg">
            <div>
              <p className="text-[10px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-wider">Unique Users</p>
              <p className="text-2xl sm:text-3xl font-black mt-1 text-white">{isLoading ? '-' : uniqueUsers}</p>
            </div>
            <FaUsers className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500 opacity-80" />
          </div>

          <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-[22px] p-4 sm:p-5 flex items-center justify-between shadow-lg">
            <div>
              <p className="text-[10px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-wider">Games Reviewed</p>
              <p className="text-2xl sm:text-3xl font-black mt-1 text-white">{isLoading ? '-' : gamesReviewed}</p>
            </div>
            <FaGamepad className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500 opacity-80" />
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-[22px] p-3 sm:p-5 shadow-lg flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4">
          <div className="relative w-full lg:flex-1 max-w-md">
            <FaMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search reviews, games, or users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#121212] border border-[#333] rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#2ecc71] transition-colors"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full lg:w-auto justify-end">
            <div className="flex items-center justify-between sm:justify-start gap-1 bg-[#121212] border border-[#333] rounded-xl p-1 overflow-x-auto">
              <button
                onClick={() => setFilterRating('all')}
                className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  filterRating === 'all' 
                    ? 'bg-[#2ecc71] text-black' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                All Ratings
              </button>
              <button
                onClick={() => setFilterRating('5')}
                className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  filterRating === '5' 
                    ? 'bg-[#2ecc71] text-black' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                5★ Only
              </button>
            </div>

            <div className="relative inline-block w-full sm:w-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto appearance-none bg-[#121212] border border-[#333] hover:border-zinc-500 text-zinc-200 text-xs sm:text-sm font-bold rounded-xl px-4 py-2 pr-8 focus:outline-none transition cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Rating</option>
                <option value="lowest">Lowest Rating</option>
              </select>
              <FaChevronDown className="w-3 h-3 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* LOADING STATE */}
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <FaSpinner className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16 bg-[#1c1c1c] border border-[#2a2a2a] rounded-[22px] shadow-lg">
            <FaMessage className="w-8 h-8 mx-auto mb-3 opacity-40 text-zinc-600" />
            <p className="text-zinc-400 text-sm font-semibold">
              No reviews found matching your criteria.
            </p>
          </div>
        ) : (
          <>
            {/* MOBILE VIEW (CARDS) - Eliminates horizontal layout scrolling */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xl:hidden">
              {reviews.map((review) => {
                const dateObj = new Date(review.created_at || Date.now());

                return (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-[22px] p-5 shadow-xl space-y-4 group hover:border-[#383838] transition-colors"
                  >
                    {/* Header Row */}
                    <div className="flex items-center justify-between gap-3 border-b border-[#262626] pb-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div 
                          className="w-10 h-10 rounded-xl bg-[#121212] border border-[#333] flex items-center justify-center shrink-0 bg-cover bg-center"
                          style={{ backgroundImage: review.user_avatar ? `url(${review.user_avatar})` : 'none' }}
                        >
                          {!review.user_avatar && (
                            <span className="text-xs font-bold text-zinc-300">
                              {review.user ? review.user.substring(0, 2).toUpperCase() : '??'}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-extrabold text-white text-sm truncate">{review.user}</h3>
                          <div className="flex items-center gap-1 mt-0.5">
                            {[...Array(5)].map((_, i) => (
                              <FaStar
                                key={i}
                                className={`w-3 h-3 ${
                                  i < review.rating ? 'text-emerald-400' : 'text-zinc-700'
                                }`}
                              />
                            ))}
                            <span className="text-[11px] text-zinc-400 font-bold ml-1">({review.rating})</span>
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => confirmDelete(review.id)}
                        className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                        title="Delete Review"
                      >
                        <FaTrashCan className="text-xs" />
                      </button>
                    </div>

                    {/* Content Row */}
                    <p className="text-zinc-300 text-xs sm:text-sm font-medium leading-relaxed">
                      {review.text}
                    </p>

                    {/* Footer Row */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#262626] text-[11px] text-zinc-400 font-semibold">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#121212] border border-[#333] text-zinc-300">
                        <FaGamepad className="w-3 h-3 text-emerald-400" />
                        {review.game_title || `Game #${review.game}`}
                      </span>
                      <span>{dateObj.toLocaleDateString()}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* DESKTOP VIEW (TABLE) */}
            <div className="hidden xl:block bg-[#1c1c1c] border border-[#2a2a2a] rounded-[22px] overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[850px]">
                  <thead>
                    <tr className="border-b border-[#2a2a2a] bg-[#121212] text-[11px] uppercase font-bold text-zinc-400 tracking-wider">
                      <th className="py-4 px-5 w-1/4">User & Rating</th>
                      <th className="py-4 px-5 w-2/4">Review Content</th>
                      <th className="py-4 px-5">Game</th>
                      <th className="py-4 px-5">Date</th>
                      <th className="py-4 px-5 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#2a2a2a] text-sm">
                    {reviews.map((review) => {
                      const dateObj = new Date(review.created_at || Date.now());

                      return (
                        <tr key={review.id} className="hover:bg-[#222222] transition-colors group">
                          
                          <td className="py-4 px-5 align-top">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-10 h-10 rounded-xl bg-[#121212] border border-[#333] bg-cover bg-center flex items-center justify-center shrink-0"
                                style={{ backgroundImage: review.user_avatar ? `url(${review.user_avatar})` : 'none' }}
                              >
                                {!review.user_avatar && (
                                  <span className="text-xs font-bold text-zinc-300">
                                    {review.user ? review.user.substring(0, 2).toUpperCase() : '??'}
                                  </span>
                                )}
                              </div>
                              <div>
                                <p className="font-extrabold text-white text-sm">
                                  {review.user}
                                </p>
                                <div className="flex items-center gap-1 mt-1">
                                  {[...Array(5)].map((_, i) => (
                                    <FaStar
                                      key={i}
                                      className={`w-3.5 h-3.5 ${
                                        i < review.rating ? 'text-emerald-400' : 'text-zinc-700'
                                      }`}
                                    />
                                  ))}
                                  <span className="text-xs text-zinc-400 font-bold ml-1">
                                    ({review.rating})
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-5 align-top max-w-xs sm:max-w-md">
                            <p className="text-zinc-300 text-sm font-medium leading-relaxed">
                              {review.text}
                            </p>
                          </td>

                          <td className="py-4 px-5 align-top whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#121212] border border-[#333] text-xs font-bold text-zinc-300">
                              <FaGamepad className="w-3.5 h-3.5 text-emerald-400" />
                              {review.game_title || `Game #${review.game}`}
                            </span>
                          </td>

                          <td className="py-4 px-5 align-top whitespace-nowrap text-xs text-zinc-400">
                            <p className="font-bold text-zinc-300">{dateObj.toLocaleDateString()}</p>
                            <p className="text-[10px] font-medium text-zinc-500 mt-1">{dateObj.toLocaleTimeString()}</p>
                          </td>

                          <td className="py-4 px-5 align-top text-right whitespace-nowrap">
                            <button
                              onClick={() => confirmDelete(review.id)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500 border border-rose-500/30 hover:border-rose-500 text-rose-400 hover:text-white text-xs font-extrabold rounded-xl transition-all shadow-sm cursor-pointer"
                              title="Delete Review"
                            >
                              <FaTrashCan className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Pagination Controls */}
        {!isLoading && totalCount > itemsPerPage && (
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-3 pt-2 pb-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={!hasPrev}
              className="w-full sm:w-auto px-4 py-2 bg-[#1c1c1c] hover:bg-[#2a2a2a] disabled:opacity-40 disabled:hover:bg-[#1c1c1c] text-zinc-300 text-xs font-extrabold rounded-xl border border-[#2a2a2a] flex items-center justify-center gap-2 transition cursor-pointer disabled:cursor-not-allowed shadow-md"
            >
              <FaChevronLeft className="text-[10px]" /> Previous
            </button>
            
            <span className="text-xs text-zinc-400 font-semibold text-center whitespace-nowrap px-4">
              Page <span className="text-white font-bold">{currentPage}</span> of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={!hasNext}
              className="w-full sm:w-auto px-4 py-2 bg-[#1c1c1c] hover:bg-[#2a2a2a] disabled:opacity-40 disabled:hover:bg-[#1c1c1c] text-zinc-300 text-xs font-extrabold rounded-xl border border-[#2a2a2a] flex items-center justify-center gap-2 transition cursor-pointer disabled:cursor-not-allowed shadow-md"
            >
              Next <FaChevronRight className="text-[10px]" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}