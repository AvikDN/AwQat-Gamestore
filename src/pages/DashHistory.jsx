import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import {
  FaClipboardList,
  FaSearch,
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
  FaReceipt,
  FaBoxOpen,
  FaCalendarAlt,
  FaCreditCard,
  FaSpinner,
  FaShieldAlt,
  FaBan
} from 'react-icons/fa';
import AuthApiClient from '../services/auth-api-client';

const DashHistory = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [payingOrderId, setPayingOrderId] = useState(null);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, sortOrder, statusFilter]);

  const fetchOrderHistory = async () => {
    try {
      setIsLoading(true);
      const response = await AuthApiClient.get('/api/profile/me/');
      const profileData = response.data;
      
      const orderHistory = profileData.order_history || [];
      setOrders(orderHistory);
    } catch (error) {
      console.error("Error fetching order history:", error);
      toast.error("Failed to load order history.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  const handlePayNow = async (order) => {
    setPayingOrderId(order.order_id);
    const toastId = toast.loading("Connecting to payment gateway...");

    try {
      const response = await AuthApiClient.post('/api/payment/initiate/', {
        orderId: order.order_id,
        amount: order.total_price,
        numItems: order.games?.reduce((sum, g) => sum + g.quantity, 0) || 1
      });

      if (response.data && response.data.payment_url) {
        toast.success("Redirecting to gateway...", { id: toastId });
        window.location.href = response.data.payment_url;
      } else {
        throw new Error("Invalid payment gateway response.");
      }
    } catch (error) {
      console.error("Payment initiation error:", error);
      toast.error(
        error.response?.data?.error || error.response?.data?.detail || "Payment initiation failed.",
        { id: toastId }
      );
      setPayingOrderId(null);
    }
  };

  const handleCancelOrder = async (orderId) => {
    setCancellingOrderId(orderId);
    const toastId = toast.loading("Cancelling order...");

    try {
      await AuthApiClient.patch(`/api/orders/${orderId}/`, {
        status: 'Cancelled'
      });

      setOrders((prevOrders) =>
        prevOrders.map((o) =>
          o.order_id === orderId ? { ...o, order_status: 'Cancelled' } : o
        )
      );

      toast.success("Order cancelled successfully.", { id: toastId });
    } catch (error) {
      console.error("Order cancellation error:", error);
      toast.error(
        error.response?.data?.detail || error.response?.data?.status?.[0] || "Failed to cancel order.",
        { id: toastId }
      );
    } finally {
      setCancellingOrderId(null);
    }
  };

  const getStatusBadgeStyle = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'completed') {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
    if (s === 'processing' || s === 'paid') {
      return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
    }
    if (s === 'pending') {
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    }
    if (s === 'cancelled') {
      return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    }
    return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30';
  };

  const filteredOrders = useMemo(() => {
    let result = orders.filter((order) => {
      const orderIdStr = String(order.order_id || '');
      const matchesSearch =
        orderIdStr.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        order.games?.some((g) => g.title.toLowerCase().includes(debouncedSearch.toLowerCase()));

      const matchesStatus =
        statusFilter === 'all'
          ? true
          : order.order_status?.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });

    result.sort((a, b) => {
      const dateA = new Date(a.ordered_at).getTime();
      const dateB = new Date(b.ordered_at).getTime();
      if (sortOrder === 'asc') return dateA - dateB;
      return dateB - dateA;
    });

    return result;
  }, [orders, debouncedSearch, sortOrder, statusFilter]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredOrders, currentPage, itemsPerPage]);

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
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222222] pb-4 sm:pb-5">
            <div className="flex items-center gap-3">
              <FaClipboardList className="text-2xl sm:text-4xl text-white shrink-0" />
              <div>
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                  Order History
                </h1>
              </div>
            </div>
          </div>

          {/* Search, Sort & Status Filters */}
          <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-2xl p-3 sm:p-5 shadow-lg flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4">
            
            <div className="flex items-center gap-2 sm:gap-3 flex-1">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs sm:text-sm" />
                <input
                  type="text"
                  placeholder="Search by Order ID or Game Title..."
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
                { id: 'all', label: 'All' },
                { id: 'pending', label: 'Pending' },
                { id: 'processing', label: 'Processing' },
                { id: 'completed', label: 'Completed' },
                { id: 'cancelled', label: 'Cancelled' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`flex-1 sm:flex-none px-3 py-2 rounded-xl font-bold text-[10px] sm:text-xs md:text-sm border transition cursor-pointer text-center ${
                    statusFilter === tab.id
                      ? tab.id === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/80 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                        : tab.id === 'processing'
                        ? 'bg-sky-500/20 text-sky-400 border-sky-500/80 shadow-[0_0_12px_rgba(14,165,233,0.2)]'
                        : tab.id === 'pending'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/80 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                        : tab.id === 'cancelled'
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/80 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
                        : 'bg-[#2ecc71] text-black border-[#2ecc71]'
                      : 'bg-[#121212] text-zinc-400 border-[#333] hover:border-zinc-500'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Orders List View */}
          <div className="space-y-4 relative z-10">
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
                      <div className="h-8 bg-[#2a2a2a] animate-pulse rounded-lg w-20"></div> {/* Badge */}
                      <div className="space-y-2 text-right">
                        <div className="h-3 bg-[#2a2a2a] animate-pulse rounded w-16 ml-auto"></div>
                        <div className="h-6 sm:h-8 bg-[#2a2a2a] animate-pulse rounded w-24 ml-auto"></div>
                      </div>
                      <div className="flex items-center gap-2 hidden sm:flex"> {/* Action Buttons placeholder */}
                        <div className="h-8 w-24 bg-[#2a2a2a] animate-pulse rounded-xl"></div>
                        <div className="h-8 w-24 bg-[#2a2a2a] animate-pulse rounded-xl"></div>
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
            ) : paginatedOrders.length > 0 ? (
              <AnimatePresence>
                {paginatedOrders.map((order) => {
                  const isPending = order.order_status?.toLowerCase() === 'pending';

                  return (
                    <motion.div
                      key={order.order_id}
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.3 }}
                      className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-[22px] p-5 sm:p-6 shadow-xl space-y-5 transition-all duration-300 relative overflow-hidden group hover:border-[#383838]"
                    >
                      {/* Top Order Card Header */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#262626] pb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#121212] border border-[#333] flex items-center justify-center text-emerald-400 shrink-0">
                            <FaReceipt className="text-lg" />
                          </div>
                          <div>
                            <span className="text-xs sm:text-sm text-zinc-300 font-bold block">
                              Order ID: <span className="text-white">#{order.order_id}</span>
                            </span>
                            <span className="text-[11px] sm:text-xs text-zinc-500 flex items-center gap-1.5 mt-0.5 font-medium">
                              <FaCalendarAlt /> {new Date(order.ordered_at).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 mt-2 sm:mt-0">
                          <span className={`text-[10px] sm:text-xs font-extrabold px-3 py-1.5 rounded-lg border uppercase tracking-wider ${getStatusBadgeStyle(order.order_status)}`}>
                            {order.order_status || 'Unknown'}
                          </span>
                          
                          <div className="text-right">
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Total</p>
                            <span className="text-lg sm:text-xl font-black text-white">
                              ৳{parseFloat(order.total_price || 0).toFixed(2)}
                            </span>
                          </div>

                          {/* Action Controls for Pending Orders */}
                          {isPending && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handlePayNow(order)}
                                disabled={payingOrderId === order.order_id || cancellingOrderId === order.order_id}
                                className="px-3.5 py-2 bg-[#2ecc71] hover:bg-[#27ae60] text-black text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-md shadow-emerald-950/20"
                              >
                                {payingOrderId === order.order_id ? (
                                  <FaSpinner className="animate-spin text-xs" />
                                ) : (
                                  <FaCreditCard className="text-xs" />
                                )}
                                <span className="hidden sm:inline">Pay Now</span>
                              </button>

                              <button
                                onClick={() => handleCancelOrder(order.order_id)}
                                disabled={cancellingOrderId === order.order_id || payingOrderId === order.order_id}
                                className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 hover:border-rose-500 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
                                title="Cancel this pending order"
                              >
                                {cancellingOrderId === order.order_id ? (
                                  <FaSpinner className="animate-spin text-xs" />
                                ) : (
                                  <FaBan className="text-xs" />
                                )}
                                <span className="hidden sm:inline">Cancel</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Items Breakdown */}
                      <div className="space-y-3">
                        <span className="text-xs font-bold text-zinc-400 flex items-center gap-1.5 uppercase tracking-wider">
                          <FaBoxOpen className="text-emerald-400 text-sm" /> Purchased Items ({order.games?.length || 0})
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {order.games?.map((game, idx) => (
                            <div key={idx} className="bg-[#121212] border border-[#27272a] hover:border-[#3f3f46] transition-colors rounded-xl p-3 flex items-center justify-between text-xs sm:text-sm shadow-sm">
                              <span className="font-bold text-zinc-200 truncate pr-3" title={game.title}>
                                {game.title}
                              </span>
                              <div className="flex items-center gap-4 shrink-0 bg-[#18181c] px-2 py-1 rounded-lg border border-[#27272a]">
                                <span className="text-zinc-500 font-semibold">Qty: <span className="text-zinc-300">{game.quantity}</span></span>
                                <span className="font-black text-emerald-400">৳{parseFloat(game.price_at_purchase || 0).toFixed(2)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            ) : (
              <div className="text-center py-16 bg-[#1c1c1c] border border-[#2a2a2a] rounded-2xl shadow-lg">
                <FaClipboardList className="mx-auto text-4xl text-zinc-600 mb-3" />
                <p className="text-zinc-400 text-sm font-semibold">
                  No order history found matching your selected criteria.
                </p>
              </div>
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

          {/* Footer Count */}
          {!isLoading && filteredOrders.length <= itemsPerPage && filteredOrders.length > 0 && (
            <div className="flex items-center justify-between text-xs text-zinc-500 px-2 pt-2">
              <p>
                Showing all <span className="font-bold text-zinc-300">{filteredOrders.length}</span> matching orders
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default DashHistory;