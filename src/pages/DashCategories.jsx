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
  FaImage,
  FaLayerGroup
} from 'react-icons/fa';
import ApiClient from '../services/api-client'; 
import AuthApiClient from '../services/auth-api-client'; 

const DashCategories = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('all');
  const [sortOrder, setSortOrder] = useState('default'); 
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
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

    if (sortOrder === 'asc') {
      result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortOrder === 'desc') {
      result.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
    }

    return result;
  }, [categories, searchTerm, filterMode, sortOrder]);

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage) || 1;
  const paginatedCategories = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCategories.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCategories, currentPage]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
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
      const response = await AuthApiClient.post('/api/categories/', formData);
      setCategories([response.data, ...categories]);
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

  const executeDelete = async (id) => {
    const toastId = toast.loading("Deleting category...");
    try {
      await AuthApiClient.delete(`/api/categories/${id}/`);
      setCategories(prevCats => prevCats.filter((cat) => cat.id !== id));
      
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
              className="px-3 py-1.5 bg-[#1a1a1a] hover:bg-black text-gray-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                executeDelete(id); 
              }}
              className="px-3 py-1.5 bg-[#ff6b6b] hover:bg-[#e05858] text-black rounded-lg text-xs font-bold transition-colors cursor-pointer"
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

  const handleStartEdit = (cat) => {
    setEditingId(cat.id);
    setEditName(cat.name || '');
    setEditDesc(cat.description || '');
    setEditImagePreview(cat.image || null);
    setEditImageFile(null);
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditImageFile(file);
      setEditImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditImageFile(null);
    setEditImagePreview(null);
  };

  const handleSaveEdit = async (id) => {
    const toastId = toast.loading("Updating category...");
    
    const formData = new FormData();
    formData.append('name', editName);
    formData.append('description', editDesc);
    if (editImageFile) {
      formData.append('image', editImageFile);
    }
    
    try {
      const response = await AuthApiClient.patch(`/api/categories/${id}/`, formData);
      setCategories(
        categories.map((cat) => (cat.id === id ? response.data : cat))
      );
      handleCancelEdit();
      toast.success("Category updated!", { id: toastId });
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category.", { id: toastId });
    }
  };

  return (
    <div className="w-full min-h-screen bg-transparent text-white font-sans p-3 sm:p-6 lg:p-8 flex justify-center items-start select-none">
      
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

      <div className="w-full max-w-[1600px] mx-auto space-y-4 sm:space-y-6 md:space-y-8 relative pt-2 sm:pt-4 md:pt-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-4 sm:space-y-6 md:space-y-8"
        >
          {/* Floating Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222222] pb-4 sm:pb-5">
            <div className="flex items-center gap-3">
              <FaLayerGroup className="text-2xl sm:text-4xl text-white shrink-0" />
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
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
                  : 'bg-[#1c1c1c] hover:bg-[#2ecc71] text-gray-200 hover:text-black border-[#2a2a2a] hover:border-[#2ecc71]'
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
                  <span>Add</span>
                </>
              )}
            </motion.button>
          </div>

          {/* Search, Sort & Filters - Boxed Section */}
          <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-2xl p-3 sm:p-5 shadow-lg flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4">
            
            <div className="flex items-center gap-2 sm:gap-3 flex-1">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs sm:text-sm" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-[#121212] border border-[#333] rounded-xl pl-10 pr-3 py-2 text-xs sm:text-sm text-white placeholder-gray-500 outline-none focus:border-[#2ecc71] transition-colors"
                />
              </div>

              <div className="relative shrink-0">
                <button
                  onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
                  className={`px-3 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 border transition cursor-pointer relative z-40 ${
                    sortOrder !== 'default'
                      ? 'bg-[#2ecc71] text-black border-[#2ecc71] shadow-[0_0_12px_rgba(46,204,113,0.3)]'
                      : 'bg-[#121212] text-gray-300 border-[#333] hover:border-gray-500'
                  }`}
                >
                  <FaFilter className="text-xs" />
                  <span className="hidden sm:block">
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
                        className="absolute top-full mt-2 right-0 sm:left-0 sm:right-auto w-36 bg-[#1c1c1c] border border-[#333] rounded-xl shadow-xl z-50 overflow-hidden flex flex-col"
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
            </div>

            <div className="flex items-center gap-2 w-full lg:w-auto">
              <button
                onClick={() => {
                  setFilterMode(filterMode === 'with_desc' ? 'all' : 'with_desc');
                  setCurrentPage(1);
                }}
                className={`flex-1 lg:flex-none justify-center px-2.5 sm:px-4 py-2 rounded-xl font-bold text-[10px] sm:text-xs md:text-sm flex items-center gap-1.5 border transition cursor-pointer ${
                  filterMode === 'with_desc'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/80 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                    : 'bg-[#121212] text-emerald-500/70 border-[#333] hover:border-emerald-500/50'
                }`}
              >
                <FaCheckCircle className="text-[10px] shrink-0" />
                <span className="whitespace-nowrap">With Desc</span>
              </button>

              <button
                onClick={() => {
                  setFilterMode(filterMode === 'no_desc' ? 'all' : 'no_desc');
                  setCurrentPage(1);
                }}
                className={`flex-1 lg:flex-none justify-center px-2.5 sm:px-4 py-2 rounded-xl font-bold text-[10px] sm:text-xs md:text-sm flex items-center gap-1.5 border transition cursor-pointer ${
                  filterMode === 'no_desc'
                    ? 'bg-red-500/20 text-red-400 border-red-500/80 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                    : 'bg-[#121212] text-red-400/70 border-[#333] hover:border-red-500/50'
                }`}
              >
                <FaExclamationTriangle className="text-[10px] shrink-0" />
                <span className="whitespace-nowrap">No Desc</span>
              </button>
            </div>
          </div>

          {/* Extendable Add Form */}
          <AnimatePresence>
            {isAddFormOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                animate={{ height: 'auto', opacity: 1, marginBottom: 20 }}
                exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <form onSubmit={handleAddNewCategory} className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-2xl p-4 sm:p-6 space-y-4 shadow-lg mt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs sm:text-sm font-bold text-gray-300">Category Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Simulation"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="w-full bg-[#121212] border border-[#333] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 outline-none focus:border-[#2ecc71] transition-colors"
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs sm:text-sm font-bold text-gray-300">Description</label>
                      <input
                        type="text"
                        placeholder="Describe the category..."
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                        className="w-full bg-[#121212] border border-[#333] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 outline-none focus:border-[#2ecc71] transition-colors"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
                    <div className="space-y-1.5">
                      <label className="text-xs sm:text-sm font-bold text-gray-300 block">Category Image</label>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center justify-center gap-2 px-4 py-2 bg-[#121212] border border-[#333] hover:border-[#2ecc71] rounded-xl cursor-pointer transition-colors group">
                          <FaImage className="text-gray-400 group-hover:text-[#2ecc71] text-xs" />
                          <span className="text-xs sm:text-sm font-bold text-gray-300 group-hover:text-white">Choose Image</span>
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
                            className="w-10 h-10 rounded-lg bg-cover bg-center border border-[#444] shadow-md"
                            style={{ backgroundImage: `url(${imagePreview})` }}
                          />
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={!newName.trim() || isSubmitting}
                      className="w-full sm:w-auto px-6 py-2.5 mt-2 sm:mt-0 bg-[#2ecc71] hover:bg-[#27ae60] disabled:bg-[#222] disabled:text-gray-500 text-black font-extrabold rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm transition-all cursor-pointer disabled:cursor-not-allowed shadow-[0_0_15px_rgba(46,204,113,0.3)] disabled:shadow-none"
                    >
                      <FaSave className="text-xs" /> {isSubmitting ? 'Saving...' : 'Save Category'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Category List - Minimal & Compact for Mobile */}
          <div className="space-y-3 relative z-10">
            {isLoading ? (
              <div className="text-center py-12 text-gray-500 text-xs sm:text-sm font-medium">
                Loading categories...
              </div>
            ) : (
              <AnimatePresence>
                {paginatedCategories.map((cat) => (
                  <motion.div
                    key={cat.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.3 }}
                    className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-2xl p-3.5 sm:p-5 shadow-lg flex items-center justify-between gap-3 hover:border-[#383838] transition-all"
                  >
                    {editingId === cat.id ? (
                      <div className="flex items-center gap-3 flex-1 min-w-0 flex-col sm:flex-row">
                        <div className="relative group shrink-0 self-start sm:self-center">
                          <div 
                            className="w-12 h-12 rounded-xl bg-cover bg-center border border-[#444] flex items-center justify-center bg-[#111] overflow-hidden shadow-sm"
                            style={{ backgroundImage: editImagePreview ? `url(${editImagePreview})` : 'none' }}
                          >
                            {!editImagePreview && <FaFolder className="text-gray-400 text-lg" />}
                            <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity z-10">
                              <FaImage className="text-white text-sm" />
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleEditImageChange} 
                                className="hidden" 
                              />
                            </label>
                          </div>
                        </div>
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="bg-[#121212] border border-[#444] rounded-xl px-3 py-1.5 text-xs sm:text-sm font-bold text-white outline-none focus:border-[#2ecc71] transition-colors"
                          />
                          <input
                            type="text"
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            placeholder="Description..."
                            className="bg-[#121212] border border-[#444] rounded-xl px-3 py-1.5 text-[11px] sm:text-xs text-gray-300 outline-none focus:border-[#2ecc71] transition-colors"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3.5 flex-1 min-w-0">
                        <div 
                          className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl bg-cover bg-center shrink-0 border border-[#333] flex items-center justify-center bg-[#121212] shadow-sm"
                          style={{ backgroundImage: cat.image ? `url(${cat.image})` : 'none' }}
                        >
                          {!cat.image && <FaFolder className="text-gray-400 text-lg sm:text-xl" />}
                        </div>

                        <div className="min-w-0 space-y-0.5 sm:space-y-1">
                          <h3 className="text-sm sm:text-lg font-extrabold text-white truncate">
                            {cat.name}
                          </h3>
                          {filterMode !== 'no_desc' && (
                            <p className="text-[11px] sm:text-xs text-gray-400 truncate font-semibold">
                              {cat.description || (
                                <span className="text-gray-600 italic">No description</span>
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                      {editingId === cat.id ? (
                        <>
                          <button
                            onClick={() => handleSaveEdit(cat.id)}
                            className="px-3 py-2 bg-[#2ecc71] hover:bg-[#27ae60] text-black rounded-xl font-extrabold text-[11px] sm:text-xs flex items-center gap-1 transition cursor-pointer shadow-md"
                          >
                            <FaSave className="text-[10px]" /> <span className="hidden xs:inline">Save</span>
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-3 py-2 bg-[#2a2a2a] hover:bg-[#383838] text-gray-300 rounded-xl font-extrabold text-[11px] sm:text-xs flex items-center gap-1 transition cursor-pointer"
                          >
                            <FaTimes className="text-[10px]" /> <span className="hidden xs:inline">Cancel</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleStartEdit(cat)}
                            className="p-2 sm:px-3 sm:py-2 text-gray-300 hover:text-white font-extrabold text-xs flex items-center gap-1 transition cursor-pointer hover:bg-[#2a2a2a] rounded-xl"
                            title="Edit"
                          >
                            <FaEdit className="text-xs text-gray-400" /> 
                            <span className="hidden sm:inline">Edit</span>
                          </button>
                          <button
                            onClick={() => confirmDelete(cat.id)}
                            className="p-2 sm:px-3 sm:py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/30 hover:border-red-500 rounded-xl font-extrabold text-xs flex items-center gap-1 shadow-sm transition-all duration-300 cursor-pointer"
                            title="Delete"
                          >
                            <FaTrashAlt className="text-xs" /> 
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}

            {!isLoading && paginatedCategories.length === 0 && (
              <div className="text-center py-12 bg-[#1c1c1c] border border-[#2a2a2a] rounded-2xl shadow-lg">
                <p className="text-gray-400 text-xs sm:text-sm font-medium">
                  No categories found matching your criteria.
                </p>
              </div>
            )}
          </div>

          {/* Pagination - Fixed Mobile Layout */}
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-3 pt-4 pb-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || isLoading}
              className="w-full sm:w-auto px-4 py-2 bg-[#1c1c1c] hover:bg-[#2a2a2a] disabled:opacity-40 disabled:hover:bg-[#1c1c1c] text-gray-300 text-xs font-extrabold rounded-xl border border-[#2a2a2a] flex items-center justify-center gap-2 transition cursor-pointer disabled:cursor-not-allowed shadow-md"
            >
              <FaChevronLeft className="text-[10px]" /> Previous
            </button>

            <span className="text-xs text-gray-400 font-semibold text-center whitespace-nowrap">
              Page <span className="text-white font-bold">{currentPage}</span> of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || isLoading}
              className="w-full sm:w-auto px-4 py-2 bg-[#1c1c1c] hover:bg-[#2a2a2a] disabled:opacity-40 disabled:hover:bg-[#1c1c1c] text-gray-300 text-xs font-extrabold rounded-xl border border-[#2a2a2a] flex items-center justify-center gap-2 transition cursor-pointer disabled:cursor-not-allowed shadow-md"
            >
              Next <FaChevronRight className="text-[10px]" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashCategories;