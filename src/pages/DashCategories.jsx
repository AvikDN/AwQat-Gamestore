import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
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
  FaImage,
  FaLayerGroup
} from 'react-icons/fa';
import ApiClient from '../services/api-client'; 
import AuthApiClient from '../services/auth-api-client'; 

const DashCategories = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Management Section States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('all');
  const [sortOrder, setSortOrder] = useState('default'); 
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
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Categories on Mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        // ApiClient uses /categories/
        const response = await ApiClient.get('/categories/');
        const data = response.data.results || response.data;
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Search, Filter & Sort Logic
  const filteredCategories = useMemo(() => {
    let result = categories.filter((cat) => {
      const catName = cat.name || '';
      const catDesc = cat.description || '';
      
      const matchesSearch =
        catName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        catDesc.toLowerCase().includes(searchTerm.toLowerCase());

      if (filterMode === 'with_desc') {
        return matchesSearch && catDesc.trim() !== '';
      }
      
      return matchesSearch;
    });

    // Apply Sorting
    if (sortOrder === 'asc') {
      result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortOrder === 'desc') {
      result.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
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
      setImageFile(file);
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
    }
  };

  const handleAddNewCategory = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setIsSubmitting(true);
    const toastId = toast.loading("Creating category...");
    
    const formData = new FormData();
    formData.append('name', newName.trim());
    formData.append('description', newDesc.trim());
    
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      // AuthApiClient uses /api/categories/
      const response = await AuthApiClient.post('/api/categories/', formData);
      
      setCategories([response.data, ...categories]);
      
      // Reset form and close
      setNewName('');
      setNewDesc('');
      setImageFile(null);
      setImagePreview(null);
      setIsAddFormOpen(false);
      
      toast.success("Category created successfully!", { id: toastId });
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error(
        error.response?.status === 401 
          ? "Unauthorized! Please log in again." 
          : "Failed to create category.", 
        { id: toastId }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // The actual deletion logic
  const executeDelete = async (id) => {
    const toastId = toast.loading("Deleting category...");
    
    try {
      // AuthApiClient uses /api/categories/
      await AuthApiClient.delete(`/api/categories/${id}/`);
      setCategories(prevCats => prevCats.filter((cat) => cat.id !== id));
      
      // Adjust pagination if deleting the last item on a page
      const newTotalPages = Math.ceil((filteredCategories.length - 1) / itemsPerPage) || 1;
      if (currentPage > newTotalPages) {
        setCurrentPage(newTotalPages);
      }
      
      toast.success("Category deleted!", { id: toastId });
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category.", { id: toastId });
    }
  };

  // Custom Toast Confirmation Prompt
  const confirmDelete = (id) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3 min-w-[200px]">
          <p className="text-sm font-semibold text-white">
            Are you sure you want to delete this category?
          </p>
          <div className="flex gap-2 justify-end mt-1">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1.5 bg-[#333] hover:bg-[#444] text-gray-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                executeDelete(id); // Run deletion if confirmed
              }}
              className="px-3 py-1.5 bg-[#ff6b6b] hover:bg-[#e05858] text-black rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity, // Keep the toast open until they click a button
        style: {
          background: '#1c1c1c',
          border: '1px solid #333',
        }
      }
    );
  };

  const handleStartEdit = (cat) => {
    setEditingId(cat.id);
    setEditName(cat.name || '');
    setEditDesc(cat.description || '');
  };

  const handleSaveEdit = async (id) => {
    const toastId = toast.loading("Updating category...");
    
    // Create FormData so the backend parser accepts it (Fixes 415 error)
    const formData = new FormData();
    formData.append('name', editName);
    formData.append('description', editDesc);
    
    try {
      // Send the FormData instead of a standard object
      const response = await AuthApiClient.patch(`/api/categories/${id}/`, formData);
      
      setCategories(
        categories.map((cat) => (cat.id === id ? response.data : cat))
      );
      setEditingId(null);
      
      toast.success("Category updated!", { id: toastId });
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category.", { id: toastId });
    }
  };

  return (
    <div className="w-full min-h-screen text-white font-sans p-4 sm:p-6 lg:p-8 flex justify-center items-start select-none">
      
      {/* Toast notifications container */}
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
            borderRadius: '10px',
          },
          success: { iconTheme: { primary: '#2ecc71', secondary: '#333' } },
        }}
      />

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
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
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
                onClick={() => {
                  setFilterMode(filterMode === 'with_desc' ? 'all' : 'with_desc');
                  setCurrentPage(1);
                }}
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
                onClick={() => {
                  setFilterMode(filterMode === 'no_desc' ? 'all' : 'no_desc');
                  setCurrentPage(1);
                }}
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
                        disabled={isSubmitting}
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
                        disabled={isSubmitting}
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
                            disabled={isSubmitting}
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
                      disabled={!newName.trim() || isSubmitting}
                      className="w-full sm:w-auto px-8 py-3 mt-6 sm:mt-0 bg-[#2ecc71] hover:bg-[#27ae60] disabled:bg-[#222] disabled:text-gray-500 text-black font-extrabold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:cursor-not-allowed shadow-[0_0_15px_rgba(46,204,113,0.3)] disabled:shadow-none"
                    >
                      <FaSave /> {isSubmitting ? 'Saving...' : 'Save Category'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Category List */}
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-12 text-gray-500 text-sm font-medium">
                Loading categories...
              </div>
            ) : (
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
                            // TRASH BUTTON NOW CALLS THE CUSTOM PROMPT
                            onClick={() => confirmDelete(cat.id)}
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
            )}

            {!isLoading && paginatedCategories.length === 0 && (
              <div className="text-center py-12 text-gray-500 text-sm font-medium">
                No categories found matching your criteria.
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-3 pt-4 border-t border-[#222222]">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || isLoading}
              className="px-4 py-2 bg-[#222222] hover:bg-[#2a2a2a] disabled:opacity-40 disabled:hover:bg-[#222222] text-gray-300 text-xs sm:text-sm font-bold rounded-xl border border-[#333333] flex items-center gap-2 transition cursor-pointer disabled:cursor-not-allowed"
            >
              <FaChevronLeft className="text-xs" /> Previous
            </button>

            <span className="text-xs text-gray-400 font-semibold px-2">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || isLoading}
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