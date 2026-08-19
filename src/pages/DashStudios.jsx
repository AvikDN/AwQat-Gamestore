import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { SiRobloxstudio } from 'react-icons/si';
import {
  FaSearch,
  FaFilter,
  FaPlus,
  FaEdit,
  FaTrashAlt,
  FaChevronLeft,
  FaChevronRight,
  FaSave,
  FaTimes
} from 'react-icons/fa';
import ApiClient from '../services/api-client'; 
import AuthApiClient from '../services/auth-api-client'; 

const DashStudios = () => {
  const [studios, setStudios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('default'); // 'default', 'asc', 'desc'
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page when search or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, sortOrder]);

  // Fetch Studios from API
  useEffect(() => {
    const fetchStudios = async () => {
      try {
        setIsLoading(true);
        const queryParams = new URLSearchParams({ page: currentPage });

        if (debouncedSearch) {
          queryParams.append('search', debouncedSearch);
        }

        if (sortOrder === 'asc') {
          queryParams.append('ordering', 'name');
        } else if (sortOrder === 'desc') {
          queryParams.append('ordering', '-name');
        }

        const response = await ApiClient.get(`/studios/?${queryParams.toString()}`);
        const data = response.data;

        if (Array.isArray(data)) {
          setStudios(data);
          setHasNext(false);
          setHasPrev(false);
        } else {
          setStudios(data.results || []);
          setHasNext(!!data.next);
          setHasPrev(!!data.previous);
        }
      } catch (error) {
        console.error("Error fetching studios:", error);
        toast.error("Failed to load studios.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudios();
  }, [currentPage, debouncedSearch, sortOrder]);

  const handleAddNewStudio = async (e) => {
    e.preventDefault();
    if (!newName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const toastId = toast.loading("Creating studio...");
    
    try {
      const response = await AuthApiClient.post('/api/studios/', { name: newName.trim() });
      setStudios([response.data, ...studios]);
      setNewName('');
      setIsAddFormOpen(false);
      toast.success("Studio created successfully!", { id: toastId });
    } catch (error) {
      console.error("Error creating studio:", error);
      toast.error(
        error.response?.status === 401 
          ? "Unauthorized! Please log in again." 
          : "Failed to create studio.", 
        { id: toastId }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const executeDelete = async (id) => {
    const toastId = toast.loading("Deleting studio...");
    try {
      await AuthApiClient.delete(`/api/studios/${id}/`);
      setStudios(prev => prev.filter((item) => item.id !== id));
      toast.success("Studio deleted!", { id: toastId });
    } catch (error) {
      console.error("Error deleting studio:", error);
      toast.error("Failed to delete studio.", { id: toastId });
    }
  };

  const confirmDelete = (id) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3 min-w-[200px]">
          <p className="text-sm font-semibold text-white">
            Are you sure you want to delete this studio?
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
          background: '#18181c',
          color: '#fff',
          border: '1px solid #27272a',
          borderRadius: '12px',
        }
      }
    );
  };

  const handleStartEdit = (studio) => {
    setEditingId(studio.id);
    setEditName(studio.name || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleSaveEdit = async (id) => {
    if (!editName.trim()) return;
    const toastId = toast.loading("Updating studio...");
    
    try {
      const response = await AuthApiClient.patch(`/api/studios/${id}/`, { name: editName.trim() });
      setStudios(
        studios.map((item) => (item.id === id ? response.data : item))
      );
      handleCancelEdit();
      toast.success("Studio updated!", { id: toastId });
    } catch (error) {
      console.error("Error updating studio:", error);
      toast.error("Failed to update studio.", { id: toastId });
    }
  };

  return (
    <div className="w-full min-h-screen bg-transparent text-white font-sans p-3 sm:p-6 lg:p-8 flex justify-center items-start select-none">
      
      <Toaster 
        position="top-center"
        toastOptions={{
          style: { background: '#18181c', color: '#fff', border: '1px solid #27272a', borderRadius: '12px' },
          success: { iconTheme: { primary: '#10b981', secondary: '#18181c' } },
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
              <SiRobloxstudio className="text-2xl sm:text-4xl text-white shrink-0" />
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                Studios Management
              </h1>
            </div>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setIsAddFormOpen(!isAddFormOpen)}
              disabled={isSubmitting}
              className={`px-4 sm:px-5 py-2.5 font-extrabold rounded-xl border flex items-center justify-center gap-2 text-xs sm:text-sm transition-all shadow-md shrink-0 cursor-pointer group disabled:opacity-50 ${
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
                  <span>Add Studio</span>
                </>
              )}
            </motion.button>
          </div>

          {/* Extendable Add Form (Positioned right below the header) */}
          <AnimatePresence>
            {isAddFormOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                animate={{ height: 'auto', opacity: 1, marginBottom: 20 }}
                exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <form onSubmit={handleAddNewStudio} className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-2xl p-4 sm:p-6 space-y-4 shadow-lg">
                  <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm font-bold text-gray-300">Studio Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Capcom"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full bg-[#121212] border border-[#333] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 outline-none focus:border-[#2ecc71] transition-colors"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={!newName.trim() || isSubmitting}
                      className="w-full sm:w-auto px-6 py-2.5 bg-[#2ecc71] hover:bg-[#27ae60] disabled:bg-[#222] disabled:text-gray-500 text-black font-extrabold rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm transition-all cursor-pointer disabled:cursor-not-allowed shadow-[0_0_15px_rgba(46,204,113,0.3)] disabled:shadow-none"
                    >
                      <FaSave className="text-xs" /> {isSubmitting ? 'Saving...' : 'Save Studio'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search and Sort Section */}
          <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-2xl p-3 sm:p-5 shadow-lg flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 flex-1">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs sm:text-sm" />
                <input
                  type="text"
                  placeholder="Search studios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
          </div>

          {/* Studio List */}
          <div className="space-y-3 relative z-10">
            {isLoading ? (
              [...Array(6)].map((_, index) => (
                <div key={`skeleton-${index}`} className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-2xl p-3.5 sm:p-5 shadow-lg flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#2a2a2a] animate-pulse shrink-0"></div>
                    <div className="h-4 sm:h-5 bg-[#2a2a2a] animate-pulse rounded w-1/3"></div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <div className="w-14 h-8 sm:w-16 sm:h-9 bg-[#2a2a2a] animate-pulse rounded-xl"></div>
                    <div className="w-14 h-8 sm:w-16 sm:h-9 bg-[#2a2a2a] animate-pulse rounded-xl"></div>
                  </div>
                </div>
              ))
            ) : (
              <AnimatePresence>
                {studios.map((studio) => (
                  <motion.div
                    key={studio.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.3 }}
                    className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-2xl p-3.5 sm:p-5 shadow-lg flex items-center justify-between gap-3 hover:border-[#383838] transition-all"
                  >
                    {editingId === studio.id ? (
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full bg-[#121212] border border-[#444] rounded-xl px-3.5 py-2 text-xs sm:text-sm font-bold text-white outline-none focus:border-[#2ecc71] transition-colors"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-3.5 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-[#121212] border border-[#333] flex items-center justify-center shrink-0">
                          <SiRobloxstudio className="text-gray-400 text-sm" />
                        </div>
                        <h3 className="text-sm sm:text-lg font-extrabold text-white truncate">
                          {studio.name}
                        </h3>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                      {editingId === studio.id ? (
                        <>
                          <button
                            onClick={() => handleSaveEdit(studio.id)}
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
                            onClick={() => handleStartEdit(studio)}
                            className="p-2 sm:px-3 sm:py-2 text-gray-300 hover:text-white font-extrabold text-xs flex items-center gap-1 transition cursor-pointer hover:bg-[#2a2a2a] rounded-xl"
                            title="Edit"
                          >
                            <FaEdit className="text-xs text-gray-400" /> 
                            <span className="hidden sm:inline">Edit</span>
                          </button>
                          <button
                            onClick={() => confirmDelete(studio.id)}
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

            {!isLoading && studios.length === 0 && (
              <div className="text-center py-12 bg-[#1c1c1c] border border-[#2a2a2a] rounded-2xl shadow-lg">
                <p className="text-gray-400 text-xs sm:text-sm font-medium">
                  No studios found matching your criteria.
                </p>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {!isLoading && (hasPrev || hasNext || currentPage > 1) && (
            <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-3 pt-4 pb-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={!hasPrev || currentPage === 1 || isLoading}
                className="w-full sm:w-auto px-4 py-2 bg-[#1c1c1c] hover:bg-[#2a2a2a] disabled:opacity-40 disabled:hover:bg-[#1c1c1c] text-gray-300 text-xs font-extrabold rounded-xl border border-[#2a2a2a] flex items-center justify-center gap-2 transition cursor-pointer disabled:cursor-not-allowed shadow-md"
              >
                <FaChevronLeft className="text-[10px]" /> Previous
              </button>
              
              <span className="text-xs text-gray-400 font-semibold text-center whitespace-nowrap">
                Page <span className="text-white font-bold">{currentPage}</span>
              </span>

              <button
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={!hasNext || isLoading}
                className="w-full sm:w-auto px-4 py-2 bg-[#1c1c1c] hover:bg-[#2a2a2a] disabled:opacity-40 disabled:hover:bg-[#1c1c1c] text-gray-300 text-xs font-extrabold rounded-xl border border-[#2a2a2a] flex items-center justify-center gap-2 transition cursor-pointer disabled:cursor-not-allowed shadow-md"
              >
                Next <FaChevronRight className="text-[10px]" />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default DashStudios;