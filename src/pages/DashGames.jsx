import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { 
  FaGamepad, 
  FaPlus, 
  FaMagnifyingGlass, 
  FaChevronDown, 
  FaPenToSquare, 
  FaTrashCan,
  FaChevronLeft,
  FaChevronRight,
  FaXmark,
  FaImage,
  FaVideo,
  FaSpinner,
  FaArrowUpRightFromSquare,
} from 'react-icons/fa6';
import { Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import ApiClient from '../services/api-client';
import AuthApiClient from '../services/auth-api-client';

const MAX_IMAGE_SIZE_MB = 10;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

const darkToastStyle = {
  background: '#18181c',
  color: '#ffffff',
  border: '1px solid #27272a',
  borderRadius: '12px',
  fontSize: '13px',
  fontWeight: '600',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
};

const defaultSysReq = {
  os: '',
  processor: '',
  memory: '',
  graphics: '',
  storage: '',
  directx: ''
};

// Fast client-side image compression to WebP
const compressImage = async (file) => {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    const img = document.createElement('img');
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target.result;
    };

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const maxDimension = 1920;
      let { width, height } = img;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const cleanName = file.name.replace(/\.[^/.]+$/, '') + '.webp';
          resolve(new File([blob], cleanName, { type: 'image/webp' }));
        },
        'image/webp',
        0.82
      );
    };

    img.onerror = () => resolve(file);
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
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

export default function DashGames() {
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Sorting States
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('default');
  const [selectedStudio, setSelectedStudio] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedAvailability, setSelectedAvailability] = useState('All');

  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(3000);
  const [debouncedMinPrice, setDebouncedMinPrice] = useState(0);
  const [debouncedMaxPrice, setDebouncedMaxPrice] = useState(3000);

  // Pagination States
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  // Form Data
  const [categories, setCategories] = useState([]);
  const [studios, setStudios] = useState([]);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('0.00');
  const [category, setCategory] = useState('');
  const [studio, setStudio] = useState('');
  const [developer, setDeveloper] = useState('');
  const [platforms, setPlatforms] = useState('');
  const [active, setActive] = useState(true); // true = Available, false = Upcoming
  const [sysReqs, setSysReqs] = useState(defaultSysReq);

  const [selectedImages, setSelectedImages] = useState([]); 
  const [existingImages, setExistingImages] = useState([]); 
  const [videoUrl, setVideoUrl] = useState('');

  const topRef = useRef(null);

  // Fetch Studios and Categories
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
          console.error(`Error fetching all pages for ${endpoint}:`, error);
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
        console.error("Error loading dependencies:", error);
      }
    };

    loadFilters();
  }, []);

  useEffect(() => {
    if (categories.length > 0 && !category && !isEditing) {
      setCategory(categories[0].id);
    }
  }, [categories, category, isEditing]);

  useEffect(() => {
    if (studios.length > 0 && !studio && !isEditing) {
      setStudio(studios[0].id);
    }
  }, [studios, studio, isEditing]);

  // Debounce Search & Price
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setDebouncedMinPrice(minPrice);
      setDebouncedMaxPrice(maxPrice);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, minPrice, maxPrice]);

  // Reset Page on Filter Change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sortOrder, debouncedMinPrice, debouncedMaxPrice, selectedStudio, selectedCategory, selectedAvailability]);

  // Fetch Games (Memoized to preserve active filters across mutations)
  const fetchGames = useCallback(async () => {
    setIsLoading(true);
    try {
      let endpoint = '/games/';
      if (selectedAvailability === 'Coming soon') {
        endpoint = '/games/upcoming/';
      } else if (sortOrder === 'discounted') {
        endpoint = '/games/discounted/';
      }

      const queryParams = new URLSearchParams({ page });

      if (debouncedSearch) queryParams.append('search', debouncedSearch);

      if (sortOrder === 'price-asc') {
        queryParams.append('ordering', 'final_price');
        queryParams.append('min_price', debouncedMinPrice === 0 ? 1 : debouncedMinPrice);
      } else {
        queryParams.append('min_price', debouncedMinPrice);
        if (sortOrder === 'price-desc') queryParams.append('ordering', '-final_price');
      }

      queryParams.append('max_price', debouncedMaxPrice);
      if (selectedStudio !== 'All') queryParams.append('studio', selectedStudio);
      if (selectedCategory !== 'All') queryParams.append('category', selectedCategory);

      const response = await ApiClient.get(`${endpoint}?${queryParams.toString()}`);
      const data = response.data;

      let fetchedGames = Array.isArray(data) ? data : (data.results || []);

      if (sortOrder === 'price-asc') {
        fetchedGames = fetchedGames.filter(game => game.active && parseFloat(game.price) > 0);
      }

      setGames(fetchedGames);

      if (Array.isArray(data)) {
        setHasNext(false);
        setHasPrev(false);
      } else {
        setHasNext(!!data.next);
        setHasPrev(!!data.previous);
      }
    } catch (error) {
      console.error("Error fetching games:", error);
      toast.error("Failed to load games inventory.", { style: darkToastStyle });
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
    fetchGames();
    scrollToFormArea();
  }, [fetchGames]);

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

  const scrollToFormArea = () => {
    setTimeout(() => {
      if (topRef.current) {
        const yOffset = -90; 
        const y = topRef.current.getBoundingClientRect().top + window.scrollY + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 150);
  };

  const handleOpenAddModal = () => {
    if (isSubmitting) return;
    setIsEditing(false);
    setCurrentEditId(null);
    setTitle('');
    setDescription('');
    setPrice('');
    setDiscount('0.00');
    setCategory(categories[0]?.id || '');
    setStudio(studios[0]?.id || '');
    setDeveloper('');
    setPlatforms('');
    setSysReqs(defaultSysReq);
    setActive(true); // Default to Available
    setSelectedImages([]);
    setExistingImages([]);
    setVideoUrl('');
    setIsModalOpen(true);
    scrollToFormArea();
  };

  const handleOpenEditModal = (game) => {
    if (isSubmitting) return;
    setIsEditing(true);
    setCurrentEditId(game.id);
    setTitle(game.title || '');
    setDescription(game.description || '');
    setPrice(game.price || '');
    setDiscount(game.discount || '0.00');
    setCategory(game.category || '');
    setStudio(game.studio || '');
    setDeveloper(game.developer || '');
    setPlatforms(game.platforms || '');
    setSysReqs(game.system_requirements || defaultSysReq);
    setActive(game.active ?? true);
    setSelectedImages([]);
    setExistingImages(game.images || []); 
    setVideoUrl(game.video || '');
    setIsModalOpen(true);
    scrollToFormArea();
  };

  const executeDelete = async (id) => {
    const toastId = toast.loading("Deleting game...", { style: darkToastStyle });
    try {
      await AuthApiClient.delete(`/api/games/${id}/`);
      await fetchGames();
      toast.success("Game deleted successfully!", { id: toastId, style: darkToastStyle });
    } catch (error) {
      console.error("Error deleting game:", error);
      toast.error("Failed to delete game.", { id: toastId, style: darkToastStyle });
    }
  };

  const confirmDelete = (id) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3 min-w-50">
          <p className="text-sm font-semibold text-white">
            Are you sure you want to delete this game?
          </p>
          <div className="flex gap-2 justify-end mt-1">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1.5 bg-[#121212] hover:bg-[#202025] text-zinc-300 border border-[#27272a] rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                executeDelete(id); 
              }}
              className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-md"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        style: darkToastStyle,
      }
    );
  };

  const handleSysReqChange = (field, value) => {
    setSysReqs(prev => ({ ...prev, [field]: value }));
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    const oversizedFiles = files.filter(f => f.size > MAX_IMAGE_SIZE_BYTES);

    if (oversizedFiles.length > 0) {
      toast.error(`Each image must be smaller than ${MAX_IMAGE_SIZE_MB}MB.`, { style: darkToastStyle });
      e.target.value = '';
      return;
    }

    const totalCurrentCount = existingImages.length + selectedImages.length + files.length;
    if (totalCurrentCount > 4) {
      toast.error("You can only upload up to 4 images total.", { style: darkToastStyle });
      return;
    }

    setSelectedImages(prev => [...prev, ...files]);
  };

  const removeSelectedImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = async (imageId) => {
    const toastId = toast.loading("Deleting image...", { style: darkToastStyle });
    try {
      await AuthApiClient.delete(`/api/game-images/${imageId}/`);
      setExistingImages(prev => prev.filter(img => img.id !== imageId));
      toast.success("Image removed!", { id: toastId, style: darkToastStyle });
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to remove image.", { id: toastId, style: darkToastStyle });
    }
  };

  const handleSubmitGameForm = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!title.trim() || !price) {
      toast.error("Please fill in required fields (Title, Price).", { style: darkToastStyle });
      return;
    }

    if (!category) {
      toast.error("Please select a Category.", { style: darkToastStyle });
      return;
    }

    if (!studio) {
      toast.error("Please select a Studio.", { style: darkToastStyle });
      return;
    }

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) {
      toast.error("Please enter a valid numeric price.", { style: darkToastStyle });
      return;
    }

    const numDiscount = discount === '' ? 0 : parseFloat(discount);
    if (isNaN(numDiscount) || numDiscount < 0 || numDiscount > 100) {
      toast.error("Discount must be between 0 and 100.", { style: darkToastStyle });
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading(
      isEditing ? "Updating game details..." : "Creating game record...",
      { style: darkToastStyle }
    );

    try {
      const cleanSysReqs = {};
      Object.entries(sysReqs || {}).forEach(([key, val]) => {
        if (val && typeof val === 'string' && val.trim()) {
          cleanSysReqs[key] = val.trim();
        }
      });

      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('price', numPrice);
      formData.append('discount', numDiscount);
      formData.append('category', category);
      formData.append('studio', studio);
      formData.append('active', active);
      formData.append('description', description.trim() || 'No description provided.');
      formData.append('developer', developer.trim() || 'Unknown');
      formData.append('platforms', platforms.trim() || 'PC');
      formData.append('system_requirements', JSON.stringify(cleanSysReqs));

      if (videoUrl && videoUrl.trim()) {
        formData.append('video', videoUrl.trim());
      }

      let gameId = currentEditId;

      if (isEditing) {
        await AuthApiClient.patch(`/api/games/${gameId}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        const createRes = await AuthApiClient.post('/api/games/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        gameId = createRes.data.id;
      }

      if (selectedImages.length > 0) {
        toast.loading(`Optimizing and uploading ${selectedImages.length} images...`, {
          id: toastId,
          style: darkToastStyle,
        });

        const compressedFiles = await Promise.all(selectedImages.map(compressImage));

        await Promise.all(
          compressedFiles.map((file) => {
            const imgFormData = new FormData();
            imgFormData.append('game', gameId);
            imgFormData.append('image', file);
            return AuthApiClient.post('/api/game-images/', imgFormData, {
              headers: { 'Content-Type': 'multipart/form-data' }
            });
          })
        );
      }

      await fetchGames();

      toast.success(isEditing ? "Game updated successfully!" : "Game created successfully!", {
        id: toastId,
        style: darkToastStyle,
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Backend error response:", error.response?.data || error);

      let errorMessage = "Process failed. Check your inputs.";
      if (error.response?.data) {
        const data = error.response.data;
        if (typeof data === 'string') {
          errorMessage = data;
        } else if (Array.isArray(data)) {
          errorMessage = data.join(', ');
        } else if (typeof data === 'object') {
          errorMessage = Object.entries(data)
            .map(([field, err]) => `${field}: ${Array.isArray(err) ? err.join(' ') : err}`)
            .join(' | ');
        }
      }

      toast.error(errorMessage, { id: toastId, duration: 6000, style: darkToastStyle });
    } finally {
      setIsSubmitting(false);
    }
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

          div[data-toaster] div,
          div[role="status"] {
            background-color: #18181c !important;
            color: #ffffff !important;
            border-color: #27272a !important;
          }
          div[role="status"] > div {
            color: #ffffff !important;
          }
        `}
      </style>

      <Toaster 
        position="top-center" 
        toastOptions={{ 
          duration: 4000,
          className: '!bg-[#18181c] !text-white !border !border-[#27272a] !shadow-2xl',
          style: darkToastStyle,
          success: {
            className: '!bg-[#18181c] !text-white !border !border-[#27272a]',
            style: darkToastStyle,
            iconTheme: {
              primary: '#2ecc71',
              secondary: '#18181c',
            },
          },
          error: {
            className: '!bg-[#18181c] !text-white !border !border-[#27272a]',
            style: darkToastStyle,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#18181c',
            },
          },
          loading: {
            className: '!bg-[#18181c] !text-white !border !border-[#27272a]',
            style: darkToastStyle,
            iconTheme: {
              primary: '#2ecc71',
              secondary: '#18181c',
            },
          },
        }} 
      />

      <div ref={topRef} className="w-full max-w-[1600px] mx-auto space-y-4 sm:space-y-6 md:space-y-8 relative pt-2 sm:pt-4 md:pt-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-4 sm:space-y-6 md:space-y-8"
        >
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222222] pb-4 sm:pb-5">
            <div className="flex items-center gap-3">
              <FaGamepad className="text-2xl sm:text-4xl text-white shrink-0" />
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                Games Management
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  if (isModalOpen && !isEditing) {
                    setIsModalOpen(false);
                  } else {
                    handleOpenAddModal();
                  }
                }}
                disabled={isSubmitting}
                className={`px-4 sm:px-5 py-2.5 font-extrabold rounded-xl border flex items-center justify-center gap-2 text-xs sm:text-sm transition-all shadow-md shrink-0 cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed ${
                  isModalOpen && !isEditing 
                    ? 'bg-[#18181c] hover:bg-[#ef4444] text-gray-200 hover:text-white border-[#27272a] hover:border-[#ef4444]'
                    : 'bg-[#18181c] hover:bg-[#2ecc71] text-gray-200 hover:text-black border-[#27272a] hover:border-[#2ecc71]'
                }`}
              >
                {isModalOpen && !isEditing ? (
                  <>
                    <FaXmark className="text-xs text-gray-300 group-hover:text-white transition-colors" />
                    <span>Cancel</span>
                  </>
                ) : (
                  <>
                    <FaPlus className="text-xs text-gray-300 group-hover:text-black transition-colors" />
                    <span>Add Game</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {/* Form Container */}
          <AnimatePresence>
            {isModalOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                animate={{ height: 'auto', opacity: 1, marginBottom: 24 }}
                exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="bg-[#18181c] border border-[#27272a] rounded-2xl w-full p-4 sm:p-6 shadow-2xl relative mt-2 sm:mt-4 space-y-6">
                  <div className="flex items-center justify-between border-b border-[#27272a] pb-4">
                    <h2 className="text-lg font-black text-white">
                      {isEditing ? 'Edit Game' : 'Add New Game'}
                    </h2>
                    <button 
                      type="button"
                      onClick={() => !isSubmitting && setIsModalOpen(false)}
                      disabled={isSubmitting}
                      className="text-zinc-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <FaXmark className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmitGameForm} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-300">Game Title *</label>
                        <input
                          type="text"
                          required
                          disabled={isSubmitting}
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="e.g. Cyberpunk 2077"
                          className="w-full bg-[#121212] border border-[#27272a] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#2ecc71] disabled:opacity-50 transition-colors"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-300">Price (৳) *</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          disabled={isSubmitting}
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          placeholder="59.99"
                          className="w-full bg-[#121212] border border-[#27272a] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#2ecc71] disabled:opacity-50 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-300">Discount (%)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          disabled={isSubmitting}
                          value={discount}
                          onChange={(e) => setDiscount(e.target.value)}
                          className="w-full bg-[#121212] border border-[#27272a] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#2ecc71] disabled:opacity-50 transition-colors"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-300">Category *</label>
                        <div className="relative">
                          <select
                            value={category}
                            required
                            disabled={isSubmitting}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full appearance-none bg-[#121212] border border-[#27272a] rounded-xl px-3 py-2 pr-8 text-sm text-white focus:outline-none focus:border-[#2ecc71] disabled:opacity-50 cursor-pointer transition-colors"
                          >
                            <option value="">Select Category</option>
                            {categories.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                          <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-400 pointer-events-none" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-300">Studio *</label>
                        <div className="relative">
                          <select
                            value={studio}
                            required
                            disabled={isSubmitting}
                            onChange={(e) => setStudio(e.target.value)}
                            className="w-full appearance-none bg-[#121212] border border-[#27272a] rounded-xl px-3 py-2 pr-8 text-sm text-white focus:outline-none focus:border-[#2ecc71] disabled:opacity-50 cursor-pointer transition-colors"
                          >
                            <option value="">Select Studio</option>
                            {studios.map(s => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                          <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-300">Developer</label>
                        <input
                          type="text"
                          disabled={isSubmitting}
                          value={developer}
                          onChange={(e) => setDeveloper(e.target.value)}
                          placeholder="e.g. Ubisoft, Rockstar"
                          className="w-full bg-[#121212] border border-[#27272a] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#2ecc71] disabled:opacity-50 transition-colors"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-300">Platforms</label>
                        <input
                          type="text"
                          disabled={isSubmitting}
                          value={platforms}
                          onChange={(e) => setPlatforms(e.target.value)}
                          placeholder="Example: PC, PS5, Xbox Series X"
                          className="w-full bg-[#121212] border border-[#27272a] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#2ecc71] disabled:opacity-50 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-300">Description</label>
                      <textarea
                        rows="3"
                        disabled={isSubmitting}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter detailed game plot and gameplay features..."
                        className="w-full bg-[#121212] border border-[#27272a] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#2ecc71] resize-none disabled:opacity-50 transition-colors"
                      />
                    </div>

                    <div className="space-y-3 pt-2 border-t border-[#27272a]">
                      <label className="text-xs font-bold text-zinc-300">System Requirements</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input
                          type="text"
                          disabled={isSubmitting}
                          value={sysReqs.os}
                          onChange={(e) => handleSysReqChange('os', e.target.value)}
                          placeholder="OS (e.g. Windows 11)"
                          className="w-full bg-[#121212] border border-[#27272a] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#2ecc71] disabled:opacity-50 transition-colors"
                        />
                        <input
                          type="text"
                          disabled={isSubmitting}
                          value={sysReqs.processor}
                          onChange={(e) => handleSysReqChange('processor', e.target.value)}
                          placeholder="Processor (e.g. Intel Core i5)"
                          className="w-full bg-[#121212] border border-[#27272a] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#2ecc71] disabled:opacity-50 transition-colors"
                        />
                        <input
                          type="text"
                          disabled={isSubmitting}
                          value={sysReqs.memory}
                          onChange={(e) => handleSysReqChange('memory', e.target.value)}
                          placeholder="Memory (e.g. 16 GB RAM)"
                          className="w-full bg-[#121212] border border-[#27272a] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#2ecc71] disabled:opacity-50 transition-colors"
                        />
                        <input
                          type="text"
                          disabled={isSubmitting}
                          value={sysReqs.graphics}
                          onChange={(e) => handleSysReqChange('graphics', e.target.value)}
                          placeholder="Graphics (e.g. NVIDIA RTX 3060)"
                          className="w-full bg-[#121212] border border-[#27272a] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#2ecc71] disabled:opacity-50 transition-colors"
                        />
                        <input
                          type="text"
                          disabled={isSubmitting}
                          value={sysReqs.storage}
                          onChange={(e) => handleSysReqChange('storage', e.target.value)}
                          placeholder="Storage (e.g. 80 GB)"
                          className="w-full bg-[#121212] border border-[#27272a] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#2ecc71] disabled:opacity-50 transition-colors"
                        />
                        <input
                          type="text"
                          disabled={isSubmitting}
                          value={sysReqs.directx}
                          onChange={(e) => handleSysReqChange('directx', e.target.value)}
                          placeholder="DirectX (e.g. Version 12)"
                          className="w-full bg-[#121212] border border-[#27272a] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#2ecc71] disabled:opacity-50 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Toggle Switch for Availability Status */}
                    <div className="flex flex-col gap-1.5 pt-2 border-t border-[#27272a]">
                      <label className="text-xs font-bold text-zinc-300">Store Status</label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => setActive(!active)}
                          className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 cursor-pointer disabled:opacity-50 ${
                            active ? 'bg-[#2ecc71]' : 'bg-cyan-500'
                          }`}
                        >
                          <motion.div
                            layout
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className={`w-6 h-6 bg-black rounded-full shadow-md transform ${
                              active ? 'translate-x-0' : 'translate-x-6'
                            }`}
                          />
                        </button>
                        <span className={`text-xs font-extrabold px-3 py-1 rounded-lg border ${
                          active 
                            ? 'bg-emerald-950/60 text-emerald-400 border-emerald-700/50' 
                            : 'bg-cyan-950/60 text-cyan-400 border-cyan-700/50'
                        }`}>
                          {active ? 'Available in store' : 'Coming soon'}
                        </span>
                      </div>
                    </div>

                    {/* Game Images Section */}
                    <div className="space-y-2 pt-2 border-t border-[#27272a]">
                      <label className="text-xs font-bold text-zinc-300 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span>Game Images (Max 4 allowed)</span>
                        <span className="text-[10px] text-zinc-400">
                          Existing: {existingImages.length} | New: {selectedImages.length}
                        </span>
                      </label>
                      <p className="text-[11px] text-zinc-400 mb-2">
                        Files are auto-optimized before upload for fast loading.
                      </p>

                      {isEditing && existingImages.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {existingImages.map(imgObj => (
                            <div key={imgObj.id} className="relative w-20 h-16 rounded-lg overflow-hidden border border-[#27272a] bg-[#111]">
                              <img src={imgObj.image} alt="Game preview" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => removeExistingImage(imgObj.id)}
                                className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-[10px] hover:bg-red-700 cursor-pointer disabled:opacity-50"
                                title="Delete saved image"
                              >
                                <FaXmark />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {selectedImages.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {selectedImages.map((file, idx) => (
                            <div key={idx} className="relative w-20 h-16 rounded-lg overflow-hidden border border-[#2ecc71]/50 bg-[#111]">
                              <img src={URL.createObjectURL(file)} alt="New preview" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => removeSelectedImage(idx)}
                                className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-[10px] hover:bg-red-700 cursor-pointer disabled:opacity-50"
                              >
                                <FaXmark />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {(existingImages.length + selectedImages.length) < 4 && (
                        <label className={`flex flex-col items-center justify-center border-2 border-dashed border-[#27272a] hover:border-[#2ecc71]/50 rounded-xl p-4 transition-colors bg-[#121212] ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                          <FaImage className="w-5 h-5 text-zinc-400 mb-1" />
                          <span className="text-xs font-semibold text-zinc-300">Click to upload screenshot</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            multiple 
                            disabled={isSubmitting}
                            onChange={handleImagesChange} 
                            className="hidden" 
                          />
                        </label>
                      )}
                    </div>

                    {/* Video URL Input Section */}
                    <div className="space-y-1.5 pt-2 border-t border-[#27272a]">
                      <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                        <FaVideo className="text-[#2ecc71]" />
                        <span>Game Trailer / Video URL</span>
                      </label>
                      <input
                        type="url"
                        disabled={isSubmitting}
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=... or Vimeo / direct MP4 link"
                        className="w-full bg-[#121212] border border-[#27272a] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#2ecc71] disabled:opacity-50 transition-colors"
                      />
                      <p className="text-[11px] text-zinc-400">
                        Paste any link from <span className="text-[#2ecc71] font-bold">YouTube</span>, <span className="text-[#2ecc71] font-bold">Vimeo</span>, or a direct <span className="text-[#2ecc71] font-bold">Cloudinary/MP4</span> file.
                      </p>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#27272a]">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-[#121212] border border-[#27272a] hover:bg-[#202025] text-zinc-300 text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-2 px-6 py-2 bg-[#2ecc71] hover:bg-[#27ae60] text-black text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting && <FaSpinner className="w-3.5 h-3.5 animate-spin" />}
                        <span>{isEditing ? 'Save Changes' : 'Create Game'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filters Section */}
          <div className="bg-[#18181c] border border-[#27272a] rounded-2xl p-4 sm:p-5 flex flex-col gap-4 shadow-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
              <div className="relative col-span-1 lg:col-span-2">
                <FaMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search games by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#121212] border border-[#27272a] rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#2ecc71] transition-colors"
                />
              </div>

              <div className="relative">
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full appearance-none bg-[#121212] border border-[#27272a] text-zinc-200 text-xs sm:text-sm rounded-xl px-3 sm:px-4 py-2 pr-8 focus:outline-none focus:border-[#2ecc71] cursor-pointer font-medium"
                >
                  <option value="All">Category (All)</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <FaChevronDown className="w-3 h-3 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <div className="relative">
                <select 
                  value={selectedStudio}
                  onChange={(e) => setSelectedStudio(e.target.value)}
                  className="w-full appearance-none bg-[#121212] border border-[#27272a] text-zinc-200 text-xs sm:text-sm rounded-xl px-3 sm:px-4 py-2 pr-8 focus:outline-none focus:border-[#2ecc71] cursor-pointer font-medium"
                >
                  <option value="All">Studio (All)</option>
                  {studios.map(studio => (
                    <option key={studio.id} value={studio.id}>{studio.name}</option>
                  ))}
                </select>
                <FaChevronDown className="w-3 h-3 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <div className="relative">
                <select 
                  value={selectedAvailability}
                  onChange={(e) => setSelectedAvailability(e.target.value)}
                  className="w-full appearance-none bg-[#121212] border border-[#27272a] text-zinc-200 text-xs sm:text-sm rounded-xl px-3 sm:px-4 py-2 pr-8 focus:outline-none focus:border-[#2ecc71] cursor-pointer font-medium"
                >
                  <option value="All">Availability (All)</option>
                  <option value="Available">Available</option>
                  <option value="Coming soon">Coming soon</option>
                </select>
                <FaChevronDown className="w-3 h-3 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4 pt-2 border-t border-[#27272a]">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full lg:w-2/3">
                <span className="text-xs font-bold text-zinc-400">Price Range:</span>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    value={minPrice}
                    onChange={handleMinChange}
                    className="w-20 bg-[#121212] border border-[#27272a] text-white text-xs font-bold rounded-lg py-1.5 px-2 text-center outline-none focus:border-[#2ecc71]"
                  />
                  <span className="text-zinc-500">-</span>
                  <input 
                    type="number" 
                    value={maxPrice}
                    onChange={handleMaxChange}
                    className="w-20 bg-[#121212] border border-[#27272a] text-white text-xs font-bold rounded-lg py-1.5 px-2 text-center outline-none focus:border-[#2ecc71]"
                  />
                </div>
                <div className="relative h-4 w-full sm:max-w-50">
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

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-40">
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full appearance-none bg-[#121212] border border-[#27272a] text-zinc-200 text-xs sm:text-sm rounded-xl px-3 py-2 pr-8 focus:outline-none focus:border-[#2ecc71] cursor-pointer font-medium"
                  >
                    <option value="default">Sort: Default</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="discounted">Discounted</option>
                  </select>
                  <FaChevronDown className="w-3 h-3 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                <button 
                  onClick={handleResetFilters}
                  className="px-3 py-2 bg-[#202025] hover:bg-[#27272a] text-white text-xs sm:text-sm font-bold rounded-xl transition-colors cursor-pointer border border-[#27272a]"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Games Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4 relative z-10">
            {isLoading ? (
              [...Array(8)].map((_, index) => (
                <div key={`skeleton-${index}`} className="bg-[#18181c] border border-[#27272a] rounded-2xl p-3 flex flex-col justify-between h-75 shadow-lg">
                  <div className="animate-pulse flex flex-col h-full">
                    <div className="aspect-16/10 w-full rounded-xl bg-[#27272a] mb-2.5"></div>
                    <div className="h-4 bg-[#27272a] rounded w-3/4 mb-1.5"></div>
                    <div className="h-3 bg-[#27272a] rounded w-full mb-1"></div>
                    <div className="h-3 bg-[#27272a] rounded w-5/6 mb-3"></div>

                    <div className="mt-auto pt-2.5 border-t border-[#27272a] space-y-2">
                      <div className="flex justify-between">
                        <div className="h-3 bg-[#27272a] rounded w-8"></div>
                        <div className="h-3 bg-[#27272a] rounded w-12"></div>
                      </div>
                      <div className="flex justify-between">
                        <div className="h-3 bg-[#27272a] rounded w-10"></div>
                        <div className="h-3 bg-[#27272a] rounded w-8"></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 mt-3 pt-2 border-t border-[#27272a]">
                      <div className="h-7 bg-[#27272a] rounded-lg"></div>
                      <div className="h-7 bg-[#27272a] rounded-lg"></div>
                      <div className="h-7 bg-[#27272a] rounded-lg"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : games.length > 0 ? (
              games.map((game) => {
                const coverImage = game.images && game.images.length > 0 ? game.images[0].image : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80';
                const originalPrice = parseFloat(game.price || 0);
                const discountVal = parseFloat(game.discount || 0);
                const hasDiscount = discountVal > 0;
                const finalPrice = getFinalPrice(game);
                const isComingSoon = !game.active;

                return (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.3 }}
                    key={game.id} 
                    className="bg-[#18181c] border border-[#27272a] hover:border-[#383838] rounded-2xl p-3 flex flex-col justify-between transition-all duration-200 shadow-lg group"
                  >
                    <div>
                      {/* Clickable Card Media */}
                      <Link 
                        to={`/product/${game.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block relative aspect-16/10 w-full rounded-xl overflow-hidden mb-2.5 bg-[#121212] border border-[#27272a] group/thumb"
                        title="View game page"
                      >
                        <img 
                          src={coverImage} 
                          alt={game.title} 
                          className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover/thumb:bg-black/30 transition-colors flex items-center justify-center">
                          <FaArrowUpRightFromSquare className="text-white opacity-0 group-hover/thumb:opacity-100 transition-opacity w-4 h-4 drop-shadow" />
                        </div>
                        {hasDiscount && !isComingSoon && (
                          <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md border bg-emerald-950/80 text-emerald-300 border-emerald-700/60">
                            Sale
                          </span>
                        )}
                        {isComingSoon && (
                          <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md border bg-cyan-950/80 text-cyan-300 border-cyan-700/60">
                            Upcoming
                          </span>
                        )}
                      </Link>

                      {/* Clickable Title */}
                      <Link
                        to={`/product/${game.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block font-extrabold text-sm text-white hover:text-[#2ecc71] transition-colors truncate"
                        title={game.title}
                      >
                        {game.title}
                      </Link>

                      <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed min-h-8">
                        {game.description || 'No description provided.'}
                      </p>

                      <div className="mt-3 pt-2.5 border-t border-[#27272a] space-y-1.5 text-xs">
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-zinc-500 font-medium text-[11px] shrink-0 pt-0.5">Price:</span>
                          {isComingSoon ? (
                            <span className="text-cyan-400 font-bold text-[11px] text-right">Available soon</span>
                          ) : hasDiscount ? (
                            <div className="flex flex-wrap justify-end items-center gap-x-1.5 gap-y-0.5">
                              <span className="text-gray-500 font-bold line-through text-[10px]">৳{originalPrice.toFixed(2)}</span>
                              <span className="font-extrabold text-white text-[11px]">৳{finalPrice.toFixed(2)}</span>
                            </div>
                          ) : (
                            <span className="font-extrabold text-white text-[11px] text-right">৳{originalPrice.toFixed(2)}</span>
                          )}
                        </div>

                        <div className="flex justify-between items-center mt-1">
                          <span className="text-zinc-500 font-medium text-[11px]">Rating:</span>
                          <span className="font-semibold text-zinc-300 text-[11px] bg-[#121212] px-1.5 py-0.5 rounded border border-[#27272a]">
                            {game.rating ?? 'N/A'} ★
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons: View, Edit, Delete */}
                    <div className="grid grid-cols-3 gap-1.5 mt-3 pt-2 border-t border-[#27272a]">
                      <Link
                        to={`/product/${game.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1 py-1.5 sm:py-2 bg-[#121212] hover:bg-[#202025] text-zinc-200 border border-[#27272a] hover:border-[#383838] text-[11px] font-semibold rounded-lg transition-colors cursor-pointer"
                        title="Open product page"
                      >
                        <FaArrowUpRightFromSquare className="w-3 h-3 text-cyan-400" />
                        <span className="hidden sm:inline">View</span>
                      </Link>

                      <button 
                        onClick={() => handleOpenEditModal(game)}
                        className="inline-flex items-center justify-center gap-1 py-1.5 sm:py-2 bg-[#121212] hover:bg-[#202025] text-zinc-200 border border-[#27272a] hover:border-[#383838] text-[11px] font-semibold rounded-lg transition-colors cursor-pointer"
                        title="Edit Game"
                      >
                        <FaPenToSquare className="w-3 h-3 text-emerald-400" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>

                      <button 
                        onClick={() => confirmDelete(game.id)}
                        className="inline-flex items-center justify-center gap-1 py-1.5 sm:py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/30 hover:border-red-500 text-[11px] font-semibold rounded-lg transition-all duration-300 cursor-pointer"
                        title="Delete Game"
                      >
                        <FaTrashCan className="w-3 h-3" />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="col-span-full bg-[#18181c] border border-[#27272a] rounded-2xl py-12 text-center text-zinc-500 text-xs sm:text-sm shadow-lg">
                No games found matching your search or filters.
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-3 pt-4 pb-2">
            <button
              onClick={handlePrevPage}
              disabled={page === 1 || isLoading}
              className="w-full sm:w-auto px-4 py-2 bg-[#18181c] hover:bg-[#202025] disabled:opacity-40 disabled:hover:bg-[#18181c] text-gray-300 text-xs font-extrabold rounded-xl border border-[#27272a] flex items-center justify-center gap-2 transition cursor-pointer disabled:cursor-not-allowed shadow-md"
            >
              <FaChevronLeft className="text-[10px]" /> Previous
            </button>

            <span className="text-xs text-gray-400 font-semibold text-center whitespace-nowrap">
              Page <span className="text-white font-bold">{page}</span>
            </span>

            <button
              onClick={handleNextPage}
              disabled={!hasNext || isLoading}
              className="w-full sm:w-auto px-4 py-2 bg-[#18181c] hover:bg-[#202025] disabled:opacity-40 disabled:hover:bg-[#18181c] text-gray-300 text-xs font-extrabold rounded-xl border border-[#27272a] flex items-center justify-center gap-2 transition cursor-pointer disabled:cursor-not-allowed shadow-md"
            >
              Next <FaChevronRight className="text-[10px]" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}