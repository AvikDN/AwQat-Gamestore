import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaFolder,
  FaSearch,
  FaFilter,
  FaCheckCircle,
  FaExclamationTriangle,
  FaPlus,
  FaEdit,
  FaTrashAlt,
  FaChevronLeft,
  FaChevronRight,
  FaSave,
  FaTimes,
  FaThLarge,
  FaArrowLeft,
  FaCrosshairs,
  FaCompass,
  FaMagic,
  FaGamepad,
  FaRoute,
  FaTrophy,
  FaChess,
  FaGhost,
  FaCode,
  FaArrowRight
} from 'react-icons/fa';

const AwqatCategories = () => {
  // Navigation State: Defaults to 'manage' view
  const [viewMode, setViewMode] = useState('manage');

  // Unified Categories Data (supporting both Manage list & Grid showcase)
  const [categories, setCategories] = useState([
    {
      id: 'action',
      name: 'Action',
      description: 'Fast-paced combat & intense encounters',
      count: '420+ Games',
      icon: FaCrosshairs,
      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 'adventure',
      name: 'Adventure',
      description: 'Uncharted worlds & epic story journeys',
      count: '310+ Games',
      icon: FaCompass,
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 'rpg',
      name: 'RPG',
      description: 'Deep progression & immersive lore',
      count: '280+ Games',
      icon: FaMagic,
      image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 'shooter',
      name: 'Shooter',
      description: 'Tactical gunplay & competitive arenas',
      count: '190+ Games',
      icon: FaGamepad,
      image: 'https://images.unsplash.com/photo-1552824722-24d5e4210e3d?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 'racing',
      name: 'Racing',
      description: 'High-speed adrenaline & precision tracks',
      count: '140+ Games',
      icon: FaRoute,
      image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 'sports',
      name: 'Sports',
      description: 'Authentic athletic competition & leagues',
      count: '160+ Games',
      icon: FaTrophy,
      image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 'strategy',
      name: 'Strategy',
      description: 'Tactical mastery & domain conquest',
      count: '210+ Games',
      icon: FaChess,
      image: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 'horror',
      name: 'Horror',
      description: 'Dark atmosphere & survival chills',
      count: '95+ Games',
      icon: FaGhost,
      image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 'indie',
      name: 'Indie',
      description: 'Innovative gems by creative studios',
      count: '350+ Games',
      icon: FaCode,
      image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop',
    },
  ]);

  // Management Section States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'with_desc' | 'no_desc'
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Management Search & Filter Logic
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const matchesSearch =
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.description.toLowerCase().includes(searchTerm.toLowerCase());

      if (filterMode === 'with_desc') {
        return matchesSearch && cat.description.trim() !== '';
      }
      if (filterMode === 'no_desc') {
        return matchesSearch && cat.description.trim() === '';
      }

      return matchesSearch;
    });
  }, [categories, searchTerm, filterMode]);

  // Management Pagination Logic
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage) || 1;
  const paginatedCategories = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCategories.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCategories, currentPage]);

  // Management Handlers
  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newCat = {
      id: Date.now().toString(),
      name: newName.trim(),
      description: newDesc.trim(),
      count: '0 Games',
      icon: FaGamepad,
      image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop',
    };

    setCategories([newCat, ...categories]);
    setNewName('');
    setNewDesc('');
  };

  const handleDelete = (id) => {
    setCategories(categories.filter((cat) => cat.id !== id));
  };

  const handleStartEdit = (cat) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditDesc(cat.description);
  };

  const handleSaveEdit = (id) => {
    setCategories(
      categories.map((cat) =>
        cat.id === id ? { ...cat, name: editName, description: editDesc } : cat
      )
    );
    setEditingId(null);
  };

  return (
    <div className="w-full min-h-screen text-white font-sans p-4 sm:p-6 lg:p-8 flex justify-center items-start select-none">
      <div className="w-full max-w-6xl bg-[#161616] border border-[#262626] rounded-[24px] sm:rounded-[32px] p-5 sm:p-8 md:p-10 shadow-2xl space-y-6">
        
        {/* VIEW 1: MANAGE CATEGORIES (DEFAULT DEFAULT VIEW) */}
        {viewMode === 'manage' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Header Section with Folder Icon and View All Button at Top Right */}
            <div className="flex flex-row items-center justify-between gap-4 border-b border-[#222222] pb-5">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#222222] border border-[#333333] rounded-2xl text-[#2ecc71] text-2xl sm:text-3xl shadow-inner">
                  <FaFolder />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                    Manage Categories
                  </h1>
                  <p className="text-gray-400 text-xs sm:text-sm mt-0.5 font-medium">
                    Organize, add, and update your game categories
                  </p>
                </div>
              </div>

              {/* View All Button -> Opens Explore Categories Page */}
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setViewMode('grid')}
                className="px-4 sm:px-5 py-2.5 bg-[#222222] hover:bg-[#2ecc71] text-gray-200 hover:text-black font-extrabold rounded-xl border border-[#333333] hover:border-[#2ecc71] flex items-center justify-center gap-2 text-xs sm:text-sm transition-all shadow-md shrink-0 cursor-pointer group"
              >
                <FaThLarge className="text-xs text-gray-300 group-hover:text-black transition-colors" />
                <span>View All</span>
              </motion.button>
            </div>

            {/* Search & Filter Pills Bar */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              {/* Search Field */}
              <div className="relative flex-1">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#1c1c1c] border border-[#2a2a2a] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-[#2ecc71] transition"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setFilterMode('all')}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 border transition cursor-pointer ${
                    filterMode === 'all'
                      ? 'bg-[#2ecc71] text-black border-[#2ecc71] shadow-[0_0_12px_rgba(46,204,113,0.3)]'
                      : 'bg-[#222222] text-gray-300 border-[#333333] hover:border-gray-500'
                  }`}
                >
                  <FaFilter className="text-xs" />
                  <span>All</span>
                </button>

                <button
                  onClick={() => setFilterMode('with_desc')}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 border transition cursor-pointer ${
                    filterMode === 'with_desc'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/80 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                      : 'bg-[#222222] text-emerald-500/70 border-[#333333] hover:border-emerald-500/50'
                  }`}
                >
                  <FaCheckCircle className="text-xs" />
                  <span>With Description</span>
                </button>

                <button
                  onClick={() => setFilterMode('no_desc')}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 border transition cursor-pointer ${
                    filterMode === 'no_desc'
                      ? 'bg-red-500/20 text-red-400 border-red-500/80 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                      : 'bg-[#222222] text-red-400/70 border-[#333333] hover:border-red-500/50'
                  }`}
                >
                  <FaExclamationTriangle className="text-xs" />
                  <span>No Description</span>
                </button>
              </div>
            </div>

            {/* Quick Add Form Row */}
            <form
              onSubmit={handleAddCategory}
              className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-2xl p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center shadow-inner"
            >
              <div className="sm:col-span-5">
                <input
                  type="text"
                  placeholder="Category name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-[#111111] border border-[#333333] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-[#2ecc71] transition"
                />
              </div>

              <div className="sm:col-span-5">
                <input
                  type="text"
                  placeholder="Category description"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-[#111111] border border-[#333333] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-[#2ecc71] transition"
                />
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={!newName.trim()}
                  className="w-full h-[42px] bg-[#222222] hover:bg-[#2ecc71] disabled:hover:bg-[#222222] text-gray-300 hover:text-black disabled:text-gray-600 disabled:opacity-50 border border-[#333333] hover:border-[#2ecc71] disabled:border-[#333] font-extrabold rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm transition-all cursor-pointer disabled:cursor-not-allowed shadow-md"
                >
                  <FaPlus /> Add
                </button>
              </div>
            </form>

            {/* Category Items Management List */}
            <div className="space-y-3">
              <AnimatePresence>
                {paginatedCategories.map((cat) => (
                  <motion.div
                    key={cat.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#383838] transition-all shadow-md"
                  >
                    {editingId === cat.id ? (
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="bg-[#111111] border border-[#444] rounded-xl px-3 py-1.5 text-sm font-bold text-white outline-none focus:border-[#2ecc71]"
                        />
                        <input
                          type="text"
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.target.value)}
                          placeholder="Description..."
                          className="bg-[#111111] border border-[#444] rounded-xl px-3 py-1.5 text-xs text-gray-300 outline-none focus:border-[#2ecc71]"
                        />
                      </div>
                    ) : (
                      <div className="flex items-start gap-3.5 flex-1 min-w-0">
                        <FaFolder className="text-gray-400 text-xl shrink-0 mt-1" />
                        <div className="min-w-0 space-y-0.5">
                          <h3 className="text-base sm:text-lg font-bold text-white truncate">
                            {cat.name}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-400 truncate font-medium">
                            {cat.description || (
                              <span className="text-gray-600 italic">No description provided</span>
                            )}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                      {editingId === cat.id ? (
                        <>
                          <button
                            onClick={() => handleSaveEdit(cat.id)}
                            className="px-3.5 py-2 bg-[#2ecc71] hover:bg-[#27ae60] text-black rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <FaSave /> Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-3.5 py-2 bg-[#2a2a2a] hover:bg-[#383838] text-gray-300 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <FaTimes /> Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleStartEdit(cat)}
                            className="px-3 py-2 text-gray-300 hover:text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer hover:bg-[#262626] rounded-xl"
                          >
                            <FaEdit className="text-xs" /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id)}
                            className="px-4 py-2 bg-[#ff6b6b] hover:bg-[#e05858] text-black rounded-xl font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition cursor-pointer"
                          >
                            <FaTrashAlt className="text-xs" /> Delete
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {paginatedCategories.length === 0 && (
                <div className="text-center py-12 text-gray-500 text-sm font-medium">
                  No categories found matching your criteria.
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-center gap-3 pt-4 border-t border-[#222222]">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-[#222222] hover:bg-[#2a2a2a] disabled:opacity-40 disabled:hover:bg-[#222222] text-gray-300 text-xs sm:text-sm font-bold rounded-xl border border-[#333333] flex items-center gap-2 transition cursor-pointer disabled:cursor-not-allowed"
              >
                <FaChevronLeft className="text-xs" /> Previous
              </button>

              <span className="text-xs text-gray-400 font-semibold px-2">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-[#222222] hover:bg-[#2a2a2a] disabled:opacity-40 disabled:hover:bg-[#222222] text-gray-300 text-xs sm:text-sm font-bold rounded-xl border border-[#333333] flex items-center gap-2 transition cursor-pointer disabled:cursor-not-allowed"
              >
                Next <FaChevronRight className="text-xs" />
              </button>
            </div>
          </motion.div>
        )}

        {/* VIEW 2: EXPLORE CATEGORIES SHOWCASE GRID (OPENED VIA VIEW ALL) */}
        {viewMode === 'grid' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-8"
          >
            {/* Header Section matching exact AWQAT design from image */}
            <div className="flex flex-row items-center justify-between gap-4 border-b border-[#222222] pb-6">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#2ecc71] animate-pulse" />
                  <span className="text-[10px] sm:text-xs font-bold tracking-widest text-[#2ecc71] uppercase">
                    AWQAT STORE NAVIGATION
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                  Explore Categories
                </h1>
                <p className="text-gray-400 text-xs sm:text-sm mt-1 font-medium">
                  Find your next adventure.
                </p>
              </div>

              {/* Back to Management Button */}
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setViewMode('manage')}
                className="px-4 sm:px-5 py-2.5 bg-[#222222] hover:bg-[#2ecc71] text-gray-200 hover:text-black font-extrabold rounded-xl border border-[#333333] hover:border-[#2ecc71] flex items-center justify-center gap-2 text-xs sm:text-sm transition-all shadow-md shrink-0 cursor-pointer group"
              >
                <FaArrowLeft className="text-xs text-gray-300 group-hover:text-black transition-colors" />
                <span>Back to Manage</span>
              </motion.button>
            </div>

            {/* Responsive Categories Grid (3x3) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {categories.map((cat) => {
                const IconComponent = cat.icon || FaGamepad;
                return (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -6 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="group relative h-52 rounded-[22px] overflow-hidden border border-[#2a2a2a] hover:border-[#2ecc71]/80 bg-[#1c1c1c] shadow-lg hover:shadow-[0_0_25px_rgba(46,204,113,0.2)] transition-all cursor-pointer flex flex-col justify-between p-5"
                  >
                    {/* Background Artwork */}
                    {cat.image && (
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
                        style={{ backgroundImage: `url(${cat.image})` }}
                      />
                    )}

                    {/* Cyberpunk Glassmorphism Dark Gradients */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/75 to-black/40 group-hover:via-[#111111]/65 transition-all duration-300" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />

                    {/* Card Header: Icon Badge & Count Pill */}
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-[#161616]/85 backdrop-blur-md border border-[#333333] group-hover:border-[#2ecc71] flex items-center justify-center text-gray-200 group-hover:text-[#2ecc71] transition-all shadow-md">
                        <IconComponent className="text-lg transition-transform group-hover:scale-110" />
                      </div>

                      <span className="text-[11px] font-bold tracking-wider text-gray-300 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 group-hover:border-[#2ecc71]/40 transition-colors">
                        {cat.count}
                      </span>
                    </div>

                    {/* Card Footer: Title, Subtitle & Interactive Arrow */}
                    <div className="relative z-10 space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-wide group-hover:text-[#2ecc71] transition-colors">
                          {cat.name}
                        </h3>

                        <div className="flex items-center gap-1 text-xs font-extrabold text-[#2ecc71] opacity-0 -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                          <span>Explore</span>
                          <FaArrowRight className="text-xs" />
                        </div>
                      </div>

                      <p className="text-xs text-gray-400 font-medium line-clamp-1 group-hover:text-gray-300 transition-colors">
                        {cat.description || 'Explore top titles in this category.'}
                      </p>
                    </div>

                    {/* Subtle Neon Bottom Accent Glow */}
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#2ecc71] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default AwqatCategories;