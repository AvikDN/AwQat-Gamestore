import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaClipboardList,
  FaFilter,
  FaSearch,
  FaCalendarAlt,
  FaSyncAlt,
  FaClock,
  FaInfoCircle,
  FaChevronDown,
  FaGamepad,
  FaCheckCircle
} from 'react-icons/fa';

const DashOrder = () => {
  // Orders Data tailored to Awqat Gamestore
  const [orders, setOrders] = useState([
    {
      id: 1024,
      status: 'IN PROGRESS',
      createdDate: '8/12/2026',
      updatedDate: '8/13/2026',
      
      items: [
        {
          id: 'item-1',
          name: 'Cyberpunk 2077: Phantom Liberty (Steam Key)',
          quantity: 2,
          unitPrice: 35.0,
          totalPrice: 70.0
        },
        {
          id: 'item-2',
          name: 'Elden Ring: Shadow of the Erdtree (Global Key)',
          quantity: 1,
          unitPrice: 40.0,
          totalPrice: 40.0
        }
      ]
    },
    {
      id: 1025,
      status: 'COMPLETED',
      createdDate: '8/10/2026',
      updatedDate: '8/10/2026',
      
      items: [
        {
          id: 'item-3',
          name: 'Valorant 5350 VP Digital Top-Up Code',
          quantity: 2,
          unitPrice: 50.0,
          totalPrice: 100.0
        },
        {
          id: 'item-4',
          name: 'EA Sports FC 24 - Ultimate Edition Key',
          quantity: 1,
          unitPrice: 60.0,
          totalPrice: 60.0
        }
      ]
    }
  ]);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // Update Status Handler
  const handleStatusChange = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  // Filtered Orders Logic
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.id.toString().includes(searchTerm) ||
        order.items.some((item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesStatus =
        statusFilter === 'ALL' ||
        order.status.toUpperCase() === statusFilter.toUpperCase();

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  // Status Badge Helper
  const getStatusBadge = (status) => {
    switch (status.toUpperCase()) {
      case 'IN PROGRESS':
        return (
          <span className="px-3 py-1 text-[11px] font-extrabold bg-[#e1ff77] text-black rounded-full tracking-wide uppercase  flex items-center gap-1.5">
            
            IN PROGRESS
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-3 py-1 text-[11px] font-extrabold bg-[#2ecc71] text-black rounded-full tracking-wide uppercase  flex items-center gap-1.5">
            <FaCheckCircle className="text-xs" />
            COMPLETED
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-3 py-1 text-[11px] font-extrabold bg-[#e25a5a] text-black rounded-full tracking-wide uppercase flex items-center gap-1.5">
            
            CANCELLED
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 text-[11px] font-extrabold bg-[#222222] text-gray-300 border border-[#333333] rounded-full tracking-wide uppercase">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="w-full min-h-screen text-white font-sans p-4 sm:p-6 lg:p-8 flex justify-center items-start select-none">
      {/* Main Glassmorphism Dashboard Container */}
      <div className="w-full max-w-5xl bg-[#161616] border border-[#262626] rounded-[24px] sm:rounded-[32px] p-5 sm:p-8 md:p-10 shadow-2xl space-y-8 relative overflow-hidden">

        {/* Section Header */}
        <div className="text-center space-y-2 relative z-10 border-b border-[#222222] pb-6">
          <div className="flex items-center  gap-2 mb-1">
            <FaClipboardList className="text-2xl sm:text-3xl " />
            <h1 className="text-5xl sm:text-5xl md:text-5xl font-extrabold tracking-tight text-white">
              Orders
            </h1>
          </div>
          
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10 shadow-lg">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Filter Dropdown Toggle Button */}
            <div className="relative">
              <button
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-[#222222]  text-gray-200 font-extrabold rounded-xl border border-[#333333] hover:border-[#2ecc71] text-xs transition cursor-pointer shrink-0 shadow-md"
              >
                <FaFilter className="text-xs" />
                <span>Filters</span>
              </button>

              {/* Filter Dropdown Options */}
              {showFilterMenu && (
                <div className="absolute top-full left-0 mt-2 w-44 bg-[#1c1c1c] border border-[#2a2a2a] rounded-xl shadow-2xl z-20 py-1.5 text-xs overflow-hidden">
                  {['ALL', 'IN PROGRESS', 'COMPLETED', 'CANCELLED'].map((st) => (
                    <button
                      key={st}
                      onClick={() => {
                        setStatusFilter(st);
                        setShowFilterMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2 font-bold transition hover:bg-[#222222] ৳{
                        statusFilter === st ? 'text-[#2ecc71]' : 'text-gray-300'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search Input Box */}
            <div className="relative flex-1 sm:w-64">
              <FaSearch className="text-xs text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search orders or games..."
                className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#2ecc71] transition"
              />
            </div>
          </div>

          {/* Showing Count Indicator */}
          <div className="text-xs text-gray-500 font-semibold self-end sm:self-center">
            Showing <span className="text-white font-bold">{filteredOrders.length}</span> of {orders.length} orders
          </div>
        </div>

        {/* Orders Cards Container */}
        <div className="space-y-6 relative z-10">
          <AnimatePresence>
            {filteredOrders.length === 0 ? (
              <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-2xl p-10 text-center text-gray-500 font-medium text-xs sm:text-sm">
                No orders found matching your search query.
              </div>
            ) : (
              filteredOrders.map((order) => {
                const totalAmount = order.items.reduce(
                  (sum, item) => sum + item.totalPrice,
                  0
                );

                return (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-[22px] p-5 sm:p-6 shadow-xl space-y-5 transition-all duration-300 relative overflow-hidden group"
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
                            ৳{totalAmount.toFixed(2)}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-400 font-bold block">
                            Update Status
                          </label>
                          <div className="relative">
                            <select
                              value={order.status}
                              onChange={(e) =>
                                handleStatusChange(order.id, e.target.value)
                              }
                              className="appearance-none bg-[#161616] border border-[#2a2a2a] hover:border-[#2ecc71] text-white text-xs font-bold py-1.5 pl-3 pr-8 rounded-xl focus:outline-none cursor-pointer transition"
                            >
                              <option value="IN PROGRESS">In Progress</option>
                              <option value="COMPLETED">Completed</option>
                              <option value="CANCELLED">Cancelled</option>
                            </select>
                            <FaChevronDown className="text-xs text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Order Items List Box */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs font-extrabold text-gray-300">
                        <FaInfoCircle className="text-[#2ecc71]" />
                        <span>Order Items</span>
                      </div>

                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="bg-[#161616] border border-[#262626] rounded-xl p-3.5 flex items-center justify-between gap-4 hover:border-[#333333] transition"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-[#2ecc71]/10 rounded-lg text-[#2ecc71] shrink-0 hidden sm:block">
                                <FaGamepad className="text-sm" />
                              </div>
                              <div>
                                <h4 className="text-xs sm:text-sm font-extrabold text-white">
                                  {item.name}
                                </h4>
                                <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                                  Quantity: <span className="text-gray-200 font-bold">{item.quantity}</span> × ৳{item.unitPrice.toFixed(2)}
                                </p>
                              </div>
                            </div>

                            <div className="text-xs sm:text-sm font-black text-white shrink-0">
                              ৳{item.totalPrice.toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Hover Glow Line */}
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#2ecc71] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default DashOrder;