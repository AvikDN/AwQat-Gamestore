import React, { useState, useMemo, useEffect } from 'react';
import { 
  FaStar, 
  FaArrowTrendUp, 
  FaUsers, 
  FaGamepad, 
  FaMagnifyingGlass, 
  FaTrashCan, 
  FaMessage,
  FaChevronDown
} from 'react-icons/fa6';

import {
  FaEdit,
  FaSave,
  FaTimes,
  FaSpinner
} from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import ApiClient from '../services/api-client';
import AuthApiClient from '../services/auth-api-client';

export default function Dashreview() {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filtering & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterRating, setFilterRating] = useState('all');

  // Edit State
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editRating, setEditRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true);
        const response = await ApiClient.get('/reviews/');
        const data = response.data.results || response.data;
        setReviews(data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        toast.error("Failed to load reviews.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, []);

  // Filter & Sort Logic
  const filteredReviews = useMemo(() => {
    return reviews
      .filter((review) => {
        const rUser = review.user || '';
        const rText = review.text || '';
        const rGame = review.game ? review.game.toString() : '';

        const matchesSearch = 
          rUser.toLowerCase().includes(searchQuery.toLowerCase()) ||
          rText.toLowerCase().includes(searchQuery.toLowerCase()) ||
          rGame.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesRating = 
          filterRating === 'all' ? true : review.rating === Number(filterRating);

        return matchesSearch && matchesRating;
      })
      .sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();

        if (sortBy === 'newest') return dateB - dateA;
        if (sortBy === 'oldest') return dateA - dateB;
        if (sortBy === 'highest') return Number(b.rating) - Number(a.rating);
        if (sortBy === 'lowest') return Number(a.rating) - Number(b.rating);
        return 0;
      });
  }, [reviews, searchQuery, filterRating, sortBy]);

  // Metrics
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1)
    : '0.0';
  const uniqueUsers = new Set(reviews.map((r) => r.user)).size;
  const gamesReviewed = new Set(reviews.map((r) => r.game)).size;

  // --- Handlers for Editing ---
  const handleStartEdit = (review) => {
    setEditingId(review.id);
    setEditText(review.text);
    setEditRating(review.rating);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
    setEditRating(5);
  };

  const handleSaveEdit = async (id) => {
    if (!editText.trim()) {
      toast.error("Review text cannot be empty.");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Updating review...");
    
    try {
      const response = await AuthApiClient.patch(`/reviews/${id}/`, {
        text: editText.trim(),
        rating: editRating
      });
      
      setReviews(prev => prev.map(r => r.id === id ? response.data : r));
      setEditingId(null);
      toast.success("Review updated successfully!", { id: toastId });
    } catch (error) {
      console.error("Error updating review:", error);
      toast.error("Failed to update review.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Handlers for Deletion ---
  const executeDelete = async (id) => {
    const toastId = toast.loading("Deleting review...");
    try {
      await AuthApiClient.delete(`/reviews/${id}/`);
      setReviews(prev => prev.filter(r => r.id !== id));
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
              className="px-3 py-1.5 bg-[#1a1a1a] hover:bg-black text-gray-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                executeDelete(id); 
              }}
              className="px-3 py-1.5 bg-[#f87171] hover:bg-[#ef4444] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        style: {
          background: '#333',
          color: '#fff',
          border: '1px solid #444',
          borderRadius: '10px',
        }
      }
    );
  };

  return (
    <div className="w-full min-h-screen bg-transparent text-zinc-100 p-4 sm:p-6 lg:p-8 font-sans flex justify-center items-start">
      
      {/* Dark Theme Toaster */}
      <Toaster 
        position="top-center"
        toastOptions={{
          style: { background: '#333', color: '#fff', borderRadius: '10px' },
          success: { iconTheme: { primary: '#10b981', secondary: '#333' } },
        }}
      />

      {/* Transparent Layout Wrapper with Increased Max Width */}
      <div className="w-full max-w-[1600px] mx-auto space-y-6 md:space-y-8 relative pt-4 md:pt-8">
        
        {/* Floating Header Section */}
        <div className="flex flex-col gap-1 pb-5 md:pb-6 border-b border-[#27272a]">
          <div className="flex items-center gap-3.5">
            <FaStar className="text-3xl sm:text-4xl text-white shrink-0" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
              Customer Reviews
            </h1>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Total Reviews */}
          <div className="bg-[#202025] border border-[#2e2e33] rounded-2xl p-5 sm:p-6 flex items-center justify-between shadow-lg">
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total Reviews</p>
              <p className="text-2xl sm:text-3xl font-black mt-2 text-white">{isLoading ? '-' : totalReviews}</p>
            </div>
            <FaStar className="w-7 h-7 text-white" />
          </div>

          {/* Average Rating */}
          <div className="bg-[#202025] border border-[#2e2e33] rounded-2xl p-5 sm:p-6 flex items-center justify-between shadow-lg">
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Average Rating</p>
              <p className="text-2xl sm:text-3xl font-black mt-2 text-white">{isLoading ? '-' : avgRating}</p>
            </div>
            <FaArrowTrendUp className="w-7 h-7 text-white" />
          </div>

          {/* Unique Users */}
          <div className="bg-[#202025] border border-[#2e2e33] rounded-2xl p-5 sm:p-6 flex items-center justify-between shadow-lg">
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Unique Users</p>
              <p className="text-2xl sm:text-3xl font-black mt-2 text-white">{isLoading ? '-' : uniqueUsers}</p>
            </div>
            <FaUsers className="w-7 h-7 text-white" />
          </div>

          {/* Games Reviewed */}
          <div className="bg-[#202025] border border-[#2e2e33] rounded-2xl p-5 sm:p-6 flex items-center justify-between shadow-lg">
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Games Reviewed</p>
              <p className="text-2xl sm:text-3xl font-black mt-2 text-white">{isLoading ? '-' : gamesReviewed}</p>
            </div>
            <FaGamepad className="w-7 h-7 text-white" />
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-[#202025] border border-[#2e2e33] rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
          <div className="relative w-full md:w-96">
            <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search reviews, games, or users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#18181c] border border-[#2e2e33] rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#10b981] transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            <div className="flex items-center gap-1 bg-[#18181c] border border-[#2e2e33] rounded-xl p-1.5 shadow-sm">
              <button
                onClick={() => setFilterRating('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  filterRating === 'all' 
                    ? 'bg-[#10b981] text-black font-extrabold' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterRating('5')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  filterRating === '5' 
                    ? 'bg-[#10b981] text-black font-extrabold' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                5★
              </button>
            </div>

            <div className="relative inline-block w-full sm:w-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto appearance-none bg-[#18181c] border border-[#2e2e33] text-zinc-200 text-sm font-bold rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:border-[#10b981] cursor-pointer shadow-sm"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Rating</option>
                <option value="lowest">Lowest Rating</option>
              </select>
              <FaChevronDown className="w-3 h-3 text-zinc-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-[#202025] border border-[#2e2e33] rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-[#2e2e33] bg-[#1a1a1e] text-xs uppercase font-extrabold text-zinc-400 tracking-wider">
                  <th className="py-4 px-6 w-1/4">User & Rating</th>
                  <th className="py-4 px-6 w-2/4">Review Content</th>
                  <th className="py-4 px-6">Game (ID)</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#2e2e33] text-sm">
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="py-16 text-center text-zinc-500">
                      <FaSpinner className="w-8 h-8 animate-spin mx-auto mb-3 text-[#10b981]" />
                      Loading reviews...
                    </td>
                  </tr>
                ) : filteredReviews.length > 0 ? (
                  filteredReviews.map((review) => {
                    const isEditing = editingId === review.id;
                    const dateObj = new Date(review.created_at || Date.now());

                    return (
                      <tr 
                        key={review.id} 
                        className="hover:bg-[#25252b] transition-colors group"
                      >
                        <td className="py-4 px-6 align-top">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#2a2a30] flex items-center justify-center shrink-0 border border-[#38383f]">
                              <span className="text-xs font-bold text-zinc-300">
                                {review.user ? review.user.substring(0, 2).toUpperCase() : '??'}
                              </span>
                            </div>
                            <div>
                              <p className="font-bold text-zinc-200 text-sm">
                                {review.user}
                              </p>
                              
                              {isEditing ? (
                                <select 
                                  value={editRating}
                                  onChange={(e) => setEditRating(Number(e.target.value))}
                                  className="mt-1.5 bg-[#18181c] border border-[#38383f] text-xs font-bold rounded-lg outline-none p-1.5 text-zinc-200"
                                >
                                  {[1,2,3,4,5].map(num => (
                                    <option key={num} value={num}>{num} Stars</option>
                                  ))}
                                </select>
                              ) : (
                                <div className="flex items-center gap-1 mt-1">
                                  {[...Array(5)].map((_, i) => (
                                    <FaStar
                                      key={i}
                                      className={`w-3.5 h-3.5 ${
                                        i < review.rating
                                          ? 'text-[#10b981]'
                                          : 'text-zinc-600'
                                      }`}
                                    />
                                  ))}
                                  <span className="text-xs text-zinc-400 font-bold ml-1.5">
                                    ({review.rating})
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6 align-top max-w-xs sm:max-w-md">
                          {isEditing ? (
                            <textarea
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              rows="3"
                              className="w-full bg-[#18181c] border border-[#38383f] rounded-xl p-3 text-sm text-zinc-200 focus:border-[#10b981] outline-none resize-none transition-colors"
                            />
                          ) : (
                            <p className="text-zinc-300 text-sm font-medium leading-relaxed">
                              {review.text}
                            </p>
                          )}
                        </td>

                        <td className="py-4 px-6 align-top whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#18181c] border border-[#2e2e33] text-xs font-bold text-zinc-300">
                            <FaGamepad className="w-3.5 h-3.5 text-[#10b981]" />
                            Game #{review.game}
                          </span>
                        </td>

                        <td className="py-4 px-6 align-top whitespace-nowrap text-xs text-zinc-400">
                          <p className="font-bold text-zinc-300">{dateObj.toLocaleDateString()}</p>
                          <p className="text-[10px] font-medium text-zinc-500 mt-1">{dateObj.toLocaleTimeString()}</p>
                        </td>

                        <td className="py-4 px-6 align-top text-right whitespace-nowrap">
                          {isEditing ? (
                            <div className="flex flex-col gap-2 items-end">
                              <button
                                onClick={() => handleSaveEdit(review.id)}
                                disabled={isSubmitting}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#10b981] hover:bg-emerald-400 text-black text-xs font-extrabold rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isSubmitting ? <FaSpinner className="w-3.5 h-3.5 animate-spin"/> : <FaSave className="w-3.5 h-3.5" />}
                                <span>Save</span>
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                disabled={isSubmitting}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2a2a30] hover:bg-[#38383f] text-zinc-200 text-xs font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <FaTimes className="w-3.5 h-3.5" />
                                <span>Cancel</span>
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-2 items-end opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleStartEdit(review)}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2a2a30] hover:bg-[#38383f] text-zinc-200 text-xs font-bold rounded-xl transition-colors shadow-sm w-[90px] justify-center"
                              >
                                <FaEdit className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => confirmDelete(review.id)}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-500/10 hover:bg-red-500 border border-red-500/30 hover:border-red-500 text-red-500 hover:text-white text-xs font-extrabold rounded-xl transition-all duration-300 shadow-sm w-[90px] justify-center"
                              >
                                <FaTrashCan className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="py-16 text-center text-zinc-500">
                      <FaMessage className="w-8 h-8 mx-auto mb-3 opacity-40 text-zinc-600" />
                      <span className="font-medium">No reviews found matching your criteria.</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {!isLoading && (
          <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 font-medium">
            <p>
              Showing <span className="font-bold text-zinc-200">{filteredReviews.length}</span> of{' '}
              <span className="font-bold text-zinc-200">{reviews.length}</span> reviews
            </p>
          </div>
        )}

      </div>
    </div>
  );
}