import React, { useState, useMemo } from 'react';
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

const INITIAL_REVIEWS = [
  {
    id: 1,
    user: 'gamer_pro99@gmail.com',
    rating: 5,
    content: 'The graphics and optimization on PC are incredible! Best RPG release this year.',
    game: 'Elden Ring: Shadow of the Erdtree',
    date: '9/13/2025',
    time: '11:53:36 AM'
  },
  {
    id: 2,
    user: 'cyber_v@yahoo.com',
    rating: 4,
    content: 'DLC runs smoothly after the latest patch. Multiplayer lobby fix was fast!',
    game: 'Cyberpunk 2077: Phantom Liberty',
    date: '9/12/2025',
    time: '3:16:32 PM'
  },
  {
    id: 3,
    user: 'shadow_ninja@gmail.com',
    rating: 5,
    content: 'Instant key delivery! Played immediately without any code activation issues.',
    game: 'Ghost of Tsushima Director\'s Cut',
    date: '9/12/2025',
    time: '2:33:05 PM'
  },
  {
    id: 4,
    user: 'tactical_pawn@gmail.com',
    rating: 3,
    content: 'Fun gameplay but server queues during peak hours were pretty annoying.',
    game: 'Helldivers 2',
    date: '9/10/2025',
    time: '08:12:10 AM'
  }
];

export default function Dashreview() {
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterRating, setFilterRating] = useState('all');

  const handleDelete = (id) => {
    setReviews((prev) => prev.filter((review) => review.id !== id));
  };

  const filteredReviews = useMemo(() => {
    return reviews
      .filter((review) => {
        const matchesSearch = 
          review.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
          review.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          review.game.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesRating = 
          filterRating === 'all' ? true : review.rating === Number(filterRating);

        return matchesSearch && matchesRating;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.date) - new Date(a.date);
        if (sortBy === 'oldest') return new Date(a.date) - new Date(b.date);
        if (sortBy === 'highest') return b.rating - a.rating;
        if (sortBy === 'lowest') return a.rating - b.rating;
        return 0;
      });
  }, [reviews, searchQuery, filterRating, sortBy]);

  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1)
    : '0.0';
  const uniqueUsers = new Set(reviews.map((r) => r.user)).size;
  const gamesReviewed = new Set(reviews.map((r) => r.game)).size;

  return (
    <div className="min-h-screen text-zinc-100 p-4 sm:p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="bg-[#18181c] border border-[#27272a] rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl space-y-8">
          
          {/* Header Section */}
          <div className="border-b border-[#27272a] pb-6">
            <div className="flex items-center gap-3">
              <FaStar className="w-6 h-6 text-400" />
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Customer Reviews
              </h1>
            </div>
            <p className="text-zinc-400 text-sm sm:text-base mt-1">
              Manage and monitor all game feedback and store ratings
            </p>
          </div>

          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Total Reviews */}
            <div className="bg-[#202025] border border-[#2e2e33] rounded-xl p-5 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Total Reviews</p>
                <p className="text-3xl font-black mt-2 text-white">{totalReviews}</p>
              </div>
              <FaStar className="w-6 h-6 text-white" />
            </div>

            {/* Average Rating */}
            <div className="bg-[#202025] border border-[#2e2e33] rounded-xl p-5 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Average Rating</p>
                <p className="text-3xl font-black mt-2 text-white">{avgRating}</p>
              </div>
              <FaArrowTrendUp className="w-6 h-6 text-white" />
            </div>

            {/* Unique Users */}
            <div className="bg-[#202025] border border-[#2e2e33] rounded-xl p-5 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Unique Users</p>
                <p className="text-3xl font-black mt-2 text-white">{uniqueUsers}</p>
              </div>
              <FaUsers className="w-6 h-6 text-white" />
            </div>

            {/* Games Reviewed */}
            <div className="bg-[#202025] border border-[#2e2e33] rounded-xl p-5 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Games Reviewed</p>
                <p className="text-3xl font-black mt-2 text-white">{gamesReviewed}</p>
              </div>
              <FaGamepad className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Search & Filters */}
          <div className="bg-[#202025] border border-[#2e2e33] rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <FaMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search reviews, games, or users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#18181c] border border-[#2e2e33] rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
              <div className="flex items-center gap-1 bg-[#18181c] border border-[#2e2e33] rounded-lg p-1">
                <button
                  onClick={() => setFilterRating('all')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                    filterRating === 'all' 
                      ? 'bg-[#10b981] text-black font-bold' 
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterRating('5')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                    filterRating === '5' 
                      ? 'bg-[#10b981] text-black font-bold' 
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
                  className="w-full sm:w-auto appearance-none bg-[#18181c] border border-[#2e2e33] text-zinc-200 text-sm rounded-lg px-4 py-2 pr-8 focus:outline-none focus:border-emerald-500 cursor-pointer"
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

          {/* Table Container */}
          <div className="bg-[#202025] border border-[#2e2e33] rounded-xl overflow-hidden shadow-inner">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-[#2e2e33] bg-[#1a1a1e] text-xs uppercase font-bold text-zinc-400 tracking-wider">
                    <th className="py-4 px-6">User & Rating</th>
                    <th className="py-4 px-6">Review Content</th>
                    <th className="py-4 px-6">Game</th>
                    <th className="py-4 px-6">Date</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#2e2e33] text-sm">
                  {filteredReviews.length > 0 ? (
                    filteredReviews.map((review) => (
                      <tr 
                        key={review.id} 
                        className="hover:bg-[#25252b] transition-colors group"
                      >
                        <td className="py-4 px-6 align-top">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#2a2a30] flex items-center justify-center shrink-0 border border-[#38383f]">
                              <span className="text-xs font-bold text-zinc-300">
                                {review.user.substring(0, 2).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-zinc-200 text-xs sm:text-sm">
                                {review.user}
                              </p>
                              {/* Green Rating Stars */}
                              <div className="flex items-center gap-1 mt-1">
                                {[...Array(5)].map((_, i) => (
                                  <FaStar
                                    key={i}
                                    className={`w-3.5 h-3.5 ${
                                      i < review.rating
                                        ? 'text-emerald-400'
                                        : 'text-zinc-600'
                                    }`}
                                  />
                                ))}
                                <span className="text-xs text-zinc-400 font-medium ml-1">
                                  ({review.rating})
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6 align-top max-w-xs sm:max-w-md">
                          <p className="text-zinc-300 text-sm leading-relaxed">
                            {review.content}
                          </p>
                        </td>

                        <td className="py-4 px-6 align-top whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#18181c] border border-[#2e2e33] text-xs font-medium text-zinc-300">
                            <FaGamepad className="w-3.5 h-3.5 text-emerald-400" />
                            {review.game}
                          </span>
                        </td>

                        <td className="py-4 px-6 align-top whitespace-nowrap text-xs text-zinc-400">
                          <p className="font-medium text-zinc-300">{review.date}</p>
                          <p className="text-[10px] text-zinc-500 mt-0.5">{review.time}</p>
                        </td>

                        <td className="py-4 px-6 align-top text-right whitespace-nowrap">
                          <button
                            onClick={() => handleDelete(review.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f87171] hover:bg-[#ef4444] text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
                            title="Delete Review"
                          >
                            <FaTrashCan className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-zinc-500">
                        <FaMessage className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        No reviews found matching your search or filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-400 pt-2">
            <p>
              Showing <span className="font-semibold text-zinc-200">{filteredReviews.length}</span> of{' '}
              <span className="font-semibold text-zinc-200">{reviews.length}</span> reviews
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}