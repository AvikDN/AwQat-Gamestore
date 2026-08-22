import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import authApiClient from '../services/auth-api-client';
import {
  FaClipboardList,
  FaFilter,
  FaSearch,
  FaCalendarAlt,
  FaSyncAlt,
  FaChevronDown,
  FaGamepad,
  FaCheckCircle,
  FaChevronLeft,
  FaChevronRight,
  FaBan,
  FaBoxOpen,
  FaTruckLoading,
  FaClock
} from 'react-icons/fa';

const darkStyle = {
  style: { 
    background: '#18181c', 
    color: '#fff', 
    border: '1px solid #27272a', 
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '600'
  },
  success: { iconTheme: { primary: '#10b981', secondary: '#18181c' } },
  error: { iconTheme: { primary: '#f87171', secondary: '#18181c' } }
};

const DashOrder = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search, Sort & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, sortOrder, statusFilter]);

  // Fetch Orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const res = await authApiClient.get('/api/orders/');
        const data = Array.isArray(res.data) ? res.data : (res.data.results || []);

        const formattedOrders = data.map(order => ({
          id: order.id,
          status: order.status || 'Pending',
          totalAmount: parseFloat(order.total_amount || 0),
          createdDate: new Date(order.created_at).toLocaleString(),
          rawDate: new Date(order.created_at).getTime(),
          updatedDate: new Date(order.updated_at).toLocaleString(),
          items: (order.items || []).map(item => ({
            id: item.id,
            name: item.game_title || item.game?.title || 'Unknown Game',
            quantity: item.quantity,
            unitPrice: parseFloat(item.price_at_purchase),
            totalPrice: parseFloat(item.price_at_purchase) * item.quantity
          }))
        }));

        setOrders(formattedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error("Failed to load orders.", { style: darkStyle.style, iconTheme: darkStyle.error.iconTheme });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Update Status Handler (Admin can change to any status)
  const handleStatusChange = async (orderId, newStatus) => {
    const previousOrders = [...orders];

    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: newStatus, updatedDate: new Date().toLocaleString() } : order
      )
    );

    const toastId = toast.loading(`Updating order #${orderId}...`, { style: darkStyle.style });

    try {
      await authApiClient.patch(`/api/orders/${orderId}/`, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`, { 
        id: toastId, 
        style: darkStyle.style, 
        iconTheme: darkStyle.success.iconTheme 
      });
    } catch (error) {
      console.error("Error updating status:", error);
      setOrders(previousOrders);
      toast.error("Failed to update status.", { 
        id: toastId, 
        style: darkStyle.style, 
        iconTheme: darkStyle.error.iconTheme 
      });
    }
  };

  // Filter & Sort Logic
  const filteredOrders = useMemo(() => {
    let result = orders.filter((order) => {
      const matchesSearch =
        order.id.toString().includes(debouncedSearch) ||
        order.items.some((item) =>
          item.name.toLowerCase().includes(debouncedSearch.toLowerCase())
        );

      const matchesStatus =
        statusFilter === 'ALL' ||
        order.status.toUpperCase() === statusFilter.toUpperCase();

      return matchesSearch && matchesStatus;
    });

    result.sort((a, b) => {
      if (sortOrder === 'asc') return a.rawDate - b.rawDate;
      return b.rawDate - a.rawDate;
    });

    return result;
  }, [orders, debouncedSearch, statusFilter, sortOrder]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredOrders, currentPage, itemsPerPage]);

  // Status Badge Helper
  const getStatusBadge = (status) => {
    const s = status.toUpperCase();
    if (s === 'COMPLETED') {
      return (
        <span className="px-3 py-1 text-[11px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg tracking-wide uppercase flex items-center gap-1.5">
          <FaCheckCircle className="text-xs" /> {s}
        </span>
      );
    } else if (s === 'PROCESSING') {
      return (
        <span className="px-3 py-1 text-[11px] font-extrabold bg-sky-500/10 text-sky-400 border border-sky-500/30 rounded-lg tracking-wide uppercase flex items-center gap-1.5">
          <FaTruckLoading className="text-xs" /> {s}
        </span>
      );
    } else if (s === 'PENDING') {
      return (
        <span className="px-3 py-1 text-[11px] font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-lg tracking-wide uppercase flex items-center gap-1.5">
          <FaClock className="text-xs" /> {s}
        </span>
      );
    } else if (s === 'CANCELLED') {
      return (
        <span className="px-3 py-1 text-[11px] font-extrabold bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-lg tracking-wide uppercase flex items-center gap-1.5">
          <FaBan className="text-xs" /> {s}
        </span>
      );
    }
    return (
      <span className="px-3 py-1 text-[11px] font-extrabold bg-zinc-500/10 text-zinc-400 border border-zinc-500/30 rounded-lg tracking-wide uppercase">
        {s}
      </span>
    );
  };

  return (
    <div className="w-full min-h-screen bg-transparent text-white font-sans p-3 sm:p-6 lg:p-8 flex justify-center items-start select-none">
      <Toaster position="top-center" containerStyle={{ zIndex: 999999 }} />

      <div className="w-full max-w-[1600px] mx-auto space-y-4 sm:space-y-6 md:space-y-8 relative pt-2 sm:pt-4 md:pt-8">

        {/* Floating Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222222] pb-4 sm:pb-5">
          <div className="flex items-center gap-3">
            <FaClipboardList className="text-2xl sm:text-4xl text-white shrink-0" />
            <div>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                Orders Management
              </h1>
            </div>
          </div>
        </div>

        {/* Search, Sort & Filter Bar */}
        <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-2xl p-3 sm:p-5 shadow-lg flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4">
          
          <div className="flex items-center gap-2 sm:gap-3 flex-1">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs sm:text-sm" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by Order ID or Game Title..."
                className="w-full bg-[#121212] border border-[#333] rounded-xl pl-10 pr-3 py-2 text-xs sm:text-sm text-white placeholder-gray-500 outline-none focus:border-[#2ecc71] transition-colors"
              />
            </div>

            <div className="relative shrink-0">
              <button
                onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
                className={`px-3 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 border transition cursor-pointer relative z-40 ${
                  sortOrder !== 'desc'
                    ? 'bg-[#2ecc71] text-black border-[#2ecc71] shadow-[0_0_12px_rgba(46,204,113,0.3)]'
                    : 'bg-[#121212] text-gray-300 border-[#333] hover:border-gray-500'
                }`}
              >
                <FaFilter className="text-xs" />
                <span className="hidden sm:block">
                  {sortOrder === 'asc' ? 'Date: Oldest' : 'Date: Newest'}
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
                      className="absolute top-full mt-2 right-0 sm:left-0 sm:right-auto w-38 bg-[#1c1c1c] border border-[#333] rounded-xl shadow-xl z-50 overflow-hidden flex flex-col"
                    >
                      <button
                        onClick={() => { setSortOrder('desc'); setIsSortMenuOpen(false); }}
                        className={`text-left px-4 py-3 text-sm font-bold hover:bg-[#2ecc71] hover:text-black transition-colors ${sortOrder === 'desc' ? 'bg-[#2ecc71]/20 text-[#2ecc71]' : 'text-gray-300'}`}
                      >
                        Newest First
                      </button>
                      <button
                        onClick={() => { setSortOrder('asc'); setIsSortMenuOpen(false); }}
                        className={`text-left px-4 py-3 text-sm font-bold hover:bg-[#2ecc71] hover:text-black transition-colors border-t border-[#333] ${sortOrder === 'asc' ? 'bg-[#2ecc71]/20 text-[#2ecc71]' : 'text-gray-300'}`}
                      >
                        Oldest First
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Filter by Status Toggles */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap w-full lg:w-auto">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'PENDING', label: 'Pending' },
              { id: 'PROCESSING', label: 'Processing' },
              { id: 'COMPLETED', label: 'Completed' },
              { id: 'CANCELLED', label: 'Cancelled' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`flex-1 sm:flex-none px-3 py-2 rounded-xl font-bold text-[10px] sm:text-xs md:text-sm border transition cursor-pointer text-center ${
                  statusFilter === tab.id
                    ? tab.id === 'COMPLETED'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/80'
                      : tab.id === 'PROCESSING'
                      ? 'bg-sky-500/20 text-sky-400 border-sky-500/80'
                      : tab.id === 'PENDING'
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/80'
                      : tab.id === 'CANCELLED'
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/80'
                      : 'bg-[#2ecc71] text-black border-[#2ecc71]'
                    : 'bg-[#121212] text-zinc-400 border-[#333] hover:border-zinc-500'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Cards Container */}
        <div className="space-y-6 relative z-10">
          {isLoading ? (
            // Skeleton Loader
            [...Array(4)].map((_, index) => (
              <div key={`skeleton-${index}`} className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-[22px] p-5 sm:p-6 shadow-xl space-y-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#262626] pb-4">
                  {/* Skeleton Header Left */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#2a2a2a] animate-pulse shrink-0"></div>
                    <div className="space-y-2">
                      <div className="h-5 bg-[#2a2a2a] animate-pulse rounded w-32"></div>
                      <div className="h-3 bg-[#2a2a2a] animate-pulse rounded w-48"></div>
                    </div>
                  </div>
                  {/* Skeleton Header Right */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full md:w-auto">
                    <div className="space-y-2 text-right">
                      <div className="h-3 bg-[#2a2a2a] animate-pulse rounded w-16 ml-auto"></div>
                      <div className="h-6 bg-[#2a2a2a] animate-pulse rounded w-24 ml-auto"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-[#2a2a2a] animate-pulse rounded w-20"></div>
                      <div className="h-8 bg-[#2a2a2a] animate-pulse rounded-xl w-32"></div>
                    </div>
                  </div>
                </div>
                {/* Skeleton Items List */}
                <div className="space-y-3">
                  <div className="h-4 bg-[#2a2a2a] animate-pulse rounded w-40"></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[...Array(2)].map((_, i) => (
                      <div key={`skel-item-${i}`} className="bg-[#161616] border border-[#262626] rounded-xl p-3.5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 w-full">
                          <div className="w-8 h-8 rounded-lg bg-[#2a2a2a] animate-pulse shrink-0 hidden sm:block"></div>
                          <div className="space-y-2 w-full">
                            <div className="h-4 bg-[#2a2a2a] animate-pulse rounded w-3/4"></div>
                            <div className="h-3 bg-[#2a2a2a] animate-pulse rounded w-1/2"></div>
                          </div>
                        </div>
                        <div className="w-16 h-5 bg-[#2a2a2a] animate-pulse rounded shrink-0"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <AnimatePresence>
              {filteredOrders.length === 0 ? (
                <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-2xl p-10 text-center text-gray-500 font-medium text-xs sm:text-sm">
                  No orders found matching your search query.
                </div>
              ) : (
                paginatedOrders.map((order) => (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-[22px] p-5 sm:p-6 shadow-xl space-y-5 transition-all duration-300 relative overflow-hidden group hover:border-[#383838]"
                  >
                    {/* Top Order Card Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#262626] pb-4">
                      
                      {/* Left Side: Order ID & Meta Info */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h2 className="text-lg font-black text-white transition-colors">
                            Order #{order.id}
                          </h2>
                          {getStatusBadge(order.status)}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 font-semibold">
                          <span className="flex items-center gap-1.5">
                            <FaCalendarAlt className="text-[#2ecc71]" />
                            Created: <span className="text-gray-300">{order.createdDate}</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <FaSyncAlt className="text-gray-500" />
                            Updated: <span className="text-gray-300">{order.updatedDate}</span>
                          </span>
                        </div>
                      </div>

                      {/* Right Side: Total Amount & Status Dropdown Selector */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 self-stretch md:self-auto pt-2 md:pt-0 border-t md:border-t-0 border-[#262626]">
                        <div className="text-left md:text-right">
                          <div className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                            Total Amount
                          </div>
                          <div className="text-xl sm:text-2xl font-black text-[#2ecc71]">
                            ৳{order.totalAmount.toFixed(0)}
                          </div>
                        </div>

                        {/* Admin Status Updater */}
                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-400 font-bold block">
                            Update Status
                          </label>
                          <div className="relative">
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              className="appearance-none bg-[#161616] border border-[#2a2a2a] hover:border-[#2ecc71] text-white text-xs font-bold py-1.5 pl-3 pr-8 rounded-xl focus:outline-none cursor-pointer transition"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Processing">Processing</option>
                              <option value="Completed">Completed</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                            <FaChevronDown className="text-xs text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Order Items List Box */}
                    <div className="space-y-3">
                      <span className="text-xs font-bold text-zinc-400 flex items-center gap-1.5 uppercase tracking-wider">
                        <FaBoxOpen className="text-emerald-400 text-sm" /> Ordered Items ({order.items?.length || 0})
                      </span>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="bg-[#161616] border border-[#262626] rounded-xl p-3.5 flex items-center justify-between gap-4 hover:border-[#333333] transition shadow-sm"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="p-2 bg-[#2ecc71]/10 rounded-lg text-[#2ecc71] shrink-0 hidden sm:block">
                                <FaGamepad className="text-sm" />
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-xs sm:text-sm font-extrabold text-white truncate" title={item.name}>
                                  {item.name}
                                </h4>
                                <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                                  Qty: <span className="text-gray-200 font-bold">{item.quantity}</span> × ৳{item.unitPrice.toFixed(0)}
                                </p>
                              </div>
                            </div>

                            <div className="text-xs sm:text-sm font-black text-white shrink-0">
                              ৳{item.totalPrice.toFixed(0)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Pagination Controls */}
        {!isLoading && filteredOrders.length > itemsPerPage && (
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-3 pt-4 pb-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="w-full sm:w-auto px-4 py-2 bg-[#1c1c1c] hover:bg-[#2a2a2a] disabled:opacity-40 disabled:hover:bg-[#1c1c1c] text-zinc-300 text-xs font-extrabold rounded-xl border border-[#2a2a2a] flex items-center justify-center gap-2 transition cursor-pointer disabled:cursor-not-allowed shadow-md"
            >
              <FaChevronLeft className="text-[10px]" /> Previous
            </button>
            
            <span className="text-xs text-zinc-400 font-semibold text-center whitespace-nowrap">
              Page <span className="text-white font-bold">{currentPage}</span> of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="w-full sm:w-auto px-4 py-2 bg-[#1c1c1c] hover:bg-[#2a2a2a] disabled:opacity-40 disabled:hover:bg-[#1c1c1c] text-zinc-300 text-xs font-extrabold rounded-xl border border-[#2a2a2a] flex items-center justify-center gap-2 transition cursor-pointer disabled:cursor-not-allowed shadow-md"
            >
              Next <FaChevronRight className="text-[10px]" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default DashOrder;