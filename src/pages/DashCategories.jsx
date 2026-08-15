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
  FaGamepad,
  FaCrosshairs,
  FaCompass,
  FaMagic,
  FaRoute,
  FaTrophy,
  FaChess,
  FaGhost,
  FaCode,
  FaImage,
  FaLayerGroup
} from 'react-icons/fa';

const DashCategories = () => {
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
  ]);

  // Management Section States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('all');
  const [sortOrder, setSortOrder] = useState('default'); // 'default', 'asc', 'desc'
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // New Category Form States
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  // Search, Filter & Sort Logic
  const filteredCategories = useMemo(() => {
    let result = categories.filter((cat) => {
      const matchesSearch =
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.description.toLowerCase().includes(searchTerm.toLowerCase());

      if (filterMode === 'with_desc') {
        return matchesSearch && cat.description.trim() !== '';
      }
      
      // When filterMode is 'no_desc', return all matches (UI hides the description)
      return matchesSearch;
    });

    // Apply Sorting
    if (sortOrder === 'asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOrder === 'desc') {
      result.sort((a, b) => b.name.localeCompare(a.name));
    }

    return result;
  }, [categories, searchTerm, filterMode, sortOrder]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage) || 1;
  const paginatedCategories = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCategories.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCategories, currentPage]);

  // Handlers
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
    }
  };

  const handleAddNewCategory = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newCat = {
      id: Date.now().toString(),
      name: newName.trim(),
      description: newDesc.trim(),
      count: '0 Games',
      icon: FaGamepad,
      image: imagePreview || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop',
    };

    setCategories([newCat, ...categories]);
    
    // Reset form and close it
    setNewName('');
    setNewDesc('');
    setImagePreview(null);
    setIsAddFormOpen(false);
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
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex flex-row items-center justify-between gap-4 border-b border-[#222222] pb-5">
            <div className="flex items-center gap-3 sm:gap-4">
            <FaLayerGroup className="text-3xl sm:text-4xl text-white shrink-0" />
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
               Categories
            </h1>
          </div>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setIsAddFormOpen(!isAddFormOpen)}
              className={`px-4 sm:px-5 py-2.5 font-extrabold rounded-xl border flex items-center justify-center gap-2 text-xs sm:text-sm transition-all shadow-md shrink-0 cursor-pointer group ${
                isAddFormOpen 
                  ? 'bg-[#333] hover:bg-[#ff6b6b] text-gray-200 hover:text-black border-[#444] hover:border-[#ff6b6b]'
                  : 'bg-[#222222] hover:bg-[#2ecc71] text-gray-200 hover:text-black border-[#333333] hover:border-[#2ecc71]'
              }`}
            >
              {isAddFormOpen ? (
                <>
                  <FaTimes className="text-xs text-gray-300 group-hover:text-black transition-colors" />
                  <span>Cancel</span>
                </>
              ) : (
                <>
                  <FaPlus className="text-xs text-gray-300 group-hover:text-black transition-colors" />
                  <span>Add Category</span>
                </>
              )}
            </motion.button>
          </div>

          {/* Search, Sort & Filters */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
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

            <div className="flex flex-wrap items-center gap-2 relative">
              
              {/* Sorting Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 border transition cursor-pointer relative z-40 ${
                    sortOrder !== 'default'
                      ? 'bg-[#2ecc71] text-black border-[#2ecc71] shadow-[0_0_12px_rgba(46,204,113,0.3)]'
                      : 'bg-[#222222] text-gray-300 border-[#333333] hover:border-gray-500'
                  }`}
                >
                  <FaFilter className="text-xs" />
                  <span>
                    {sortOrder === 'asc' ? 'Sort: A-Z' : sortOrder === 'desc' ? 'Sort: Z-A' : 'Sort'}
                  </span>
                </button>

                <AnimatePresence>
                  {isSortMenuOpen && (
                    <>
                      {/* Invisible backdrop to detect clicks outside the dropdown */}
                      <div 
                        className="fixed inset-0 z-30" 
                        onClick={() => setIsSortMenuOpen(false)} 
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full mt-2 left-0 w-36 bg-[#1c1c1c] border border-[#333] rounded-xl shadow-xl z-50 overflow-hidden flex flex-col"
                      >
                        <button
                          onClick={() => { setSortOrder('asc'); setIsSortMenuOpen(false); }}
                          className={`text-left px-4 py-3 text-sm font-bold hover:bg-[#2ecc71] hover:text-black transition-colors ${sortOrder === 'asc' ? 'bg-[#2ecc71]/20 text-[#2ecc71]' : 'text-gray-300'}`}
                        >
                          A-Z
                        </button>
                        <button
                          onClick={() => { setSortOrder('desc'); setIsSortMenuOpen(false); }}
                          className={`text-left px-4 py-3 text-sm font-bold hover:bg-[#2ecc71] hover:text-black transition-colors border-t border-[#333] ${sortOrder === 'desc' ? 'bg-[#2ecc71]/20 text-[#2ecc71]' : 'text-gray-300'}`}
                        >
                          Z-A
                        </button>
                        {sortOrder !== 'default' && (
                          <button
                            onClick={() => { setSortOrder('default'); setIsSortMenuOpen(false); }}
                            className="text-left px-4 py-3 text-sm font-bold text-gray-400 hover:bg-red-500 hover:text-white transition-colors border-t border-[#333]"
                          >
                            Clear Sort
                          </button>
                        )}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Toggable Filters */}
              <button
                onClick={() => setFilterMode(filterMode === 'with_desc' ? 'all' : 'with_desc')}
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
                onClick={() => setFilterMode(filterMode === 'no_desc' ? 'all' : 'no_desc')}
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

          {/* Extendable Add Form */}
          <AnimatePresence>
            {isAddFormOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                animate={{ height: 'auto', opacity: 1, marginBottom: 24 }}
                exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <form onSubmit={handleAddNewCategory} className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-2xl p-5 sm:p-6 space-y-5 shadow-inner mt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-300">Category Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Simulation"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="w-full bg-[#111111] border border-[#333333] rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-[#2ecc71] transition"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-300">Description</label>
                      <input
                        type="text"
                        placeholder="Describe the category..."
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                        className="w-full bg-[#111111] border border-[#333333] rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-[#2ecc71] transition"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-300 block">Category Image</label>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#222] border border-[#333] hover:border-[#2ecc71] rounded-xl cursor-pointer transition-colors group">
                          <FaImage className="text-gray-400 group-hover:text-[#2ecc71]" />
                          <span className="text-sm font-bold text-gray-300 group-hover:text-white">Choose Image</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageChange} 
                            className="hidden" 
                          />
                        </label>
                        {imagePreview && (
                          <div 
                            className="w-12 h-12 rounded-lg bg-cover bg-center border border-[#444] shadow-md"
                            style={{ backgroundImage: `url(${imagePreview})` }}
                          />
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={!newName.trim()}
                      className="w-full sm:w-auto px-8 py-3 mt-6 sm:mt-0 bg-[#2ecc71] hover:bg-[#27ae60] disabled:bg-[#222] disabled:text-gray-500 text-black font-extrabold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:cursor-not-allowed shadow-[0_0_15px_rgba(46,204,113,0.3)] disabled:shadow-none"
                    >
                      <FaSave /> Save Category
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Category List */}
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
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div 
                        className="w-12 h-12 rounded-lg bg-cover bg-center shrink-0 border border-[#333] flex items-center justify-center bg-[#111]"
                        style={{ backgroundImage: cat.image ? `url(${cat.image})` : 'none' }}
                      >
                        {!cat.image && <FaFolder className="text-gray-400 text-xl" />}
                      </div>

                      <div className="min-w-0 space-y-0.5 mt-0.5">
                        <h3 className="text-base sm:text-lg font-bold text-white truncate">
                          {cat.name}
                        </h3>
                        {/* Description visually hidden if filterMode is 'no_desc' */}
                        {filterMode !== 'no_desc' && (
                          <p className="text-xs sm:text-sm text-gray-400 truncate font-medium">
                            {cat.description || (
                              <span className="text-gray-600 italic">No description provided</span>
                            )}
                          </p>
                        )}
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

          {/* Pagination */}
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
      </div>
    </div>
  );
};

export default DashCategories;