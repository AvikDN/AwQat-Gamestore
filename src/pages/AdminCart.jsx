import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTrashAlt,
  FaPlus,
  FaMinus,
  FaSpinner,
  FaUserCircle,
  FaClock,
  FaDollarSign,
  FaBoxOpen,
  FaCheckCircle,
  FaUsers,
  FaShoppingCart,
  FaExclamationTriangle,
  FaSearch,
} from "react-icons/fa";
import defaultImage from "../assets/logo.svg";

// --- FAKE DATA ---
const FAKE_CARTS = [
  {
    id: 101,
    user: "admin",
    created_at: "2026-08-15T10:00:00Z",
    items: [
      {
        id: 1,
        service: 10,
        quantity: 2,
        service_name: "Premium Game Bundle",
        price: 59.99,
        duration: "0:00",
        durationSeconds: 0,
        image: defaultImage,
        service_available: true,
      },
    ],
  },
  {
    id: 102,
    user: "johndoe89",
    created_at: "2026-08-14T14:30:00Z",
    items: [
      {
        id: 2,
        service: 12,
        quantity: 1,
        service_name: "Valorant Battle Pass",
        price: 10.00,
        duration: "0:00",
        durationSeconds: 0,
        image: defaultImage,
        service_available: false, // Testing unavailable state
      },
      {
        id: 3,
        service: 15,
        quantity: 3,
        service_name: "Fortnite V-Bucks (1000)",
        price: 8.99,
        duration: "0:00",
        durationSeconds: 0,
        image: defaultImage,
        service_available: true,
      },
    ],
  },
  {
    id: 103,
    user: "janedoe",
    created_at: "2026-08-12T09:15:00Z",
    items: [],
  },
];

const AdminCart = () => {
  const [carts, setCarts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingItem, setUpdatingItem] = useState(null);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filterBy, setFilterBy] = useState("all");

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  };
  const slideUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };
  const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

  // Helpers for durations
  const formatDuration = (duration) => {
    if (!duration) return "0h 0m";
    const parts = duration.split(":").map(Number);
    if (parts.length < 2) return duration;
    const [hours, minutes] = parts;
    return `${hours}h ${minutes}m`;
  };
  
  const renderTotalDuration = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const fetchCarts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API loading delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const cartsWithDetails = FAKE_CARTS.map((cart) => {
        if (!cart.items || cart.items.length === 0) {
          return { ...cart, items: [], totalPrice: 0, totalDuration: 0, itemCount: 0, createdAt: new Date(cart.created_at) };
        }

        const itemsWithDetails = cart.items;

        const totalPrice = itemsWithDetails.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        const totalDuration = itemsWithDetails.reduce(
          (sum, item) => sum + item.durationSeconds * item.quantity,
          0
        );

        return {
          ...cart,
          items: itemsWithDetails,
          totalPrice,
          totalDuration,
          itemCount: itemsWithDetails.length,
          createdAt: new Date(cart.created_at || cart.date_created),
        };
      });

      setCarts(cartsWithDetails);
    } catch (err) {
      console.error("Fetch carts error:", err);
      setError("Failed to fetch carts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarts();
  }, []);

  const handleUpdateQuantity = async (cartId, item, newQty) => {
    if (newQty < 1) return;
    setUpdatingItem(item.id);
    try {
      // Simulate network request
      await new Promise((resolve) => setTimeout(resolve, 500));

      setCarts((prev) =>
        prev.map((cart) =>
          cart.id === cartId
            ? {
                ...cart,
                items: cart.items.map((i) =>
                  i.id === item.id ? { ...i, quantity: newQty } : i
                ),
                totalPrice: cart.items.reduce(
                  (sum, i) =>
                    sum + i.price * (i.id === item.id ? newQty : i.quantity),
                  0
                ),
                totalDuration: cart.items.reduce(
                  (sum, i) =>
                    sum +
                    i.durationSeconds *
                      (i.id === item.id ? newQty : i.quantity),
                  0
                ),
              }
            : cart
        )
      );
    } catch {
      setError("Failed to update quantity.");
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleRemoveItem = async (cartId, itemId) => {
    setUpdatingItem(itemId);
    try {
      // Simulate network request
      await new Promise((resolve) => setTimeout(resolve, 500));

      setCarts((prev) =>
        prev.map((cart) =>
          cart.id === cartId
            ? {
                ...cart,
                items: cart.items.filter((i) => i.id !== itemId),
                totalPrice: cart.items
                  .filter((i) => i.id !== itemId)
                  .reduce((sum, i) => sum + i.price * i.quantity, 0),
                totalDuration: cart.items
                  .filter((i) => i.id !== itemId)
                  .reduce((sum, i) => sum + i.durationSeconds * i.quantity, 0),
                itemCount: cart.items.filter((i) => i.id !== itemId).length,
              }
            : cart
        )
      );
    } catch {
      setError("Failed to remove item.");
    } finally {
      setUpdatingItem(null);
    }
  };

  const filteredCarts = carts
    .filter((cart) => {
      const matchesSearch =
        cart.id.toString().includes(searchTerm) ||
        cart.user.toString().includes(searchTerm) ||
        cart.items.some((item) =>
          item.service_name.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesFilter =
        filterBy === "all" ||
        (filterBy === "empty" && cart.items.length === 0) ||
        (filterBy === "hasItems" && cart.items.length > 0);

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return b.createdAt - a.createdAt;
        case "oldest":
          return a.createdAt - b.createdAt;
        case "priceHigh":
          return b.totalPrice - a.totalPrice;
        case "priceLow":
          return a.totalPrice - b.totalPrice;
        case "itemsHigh":
          return b.itemCount - a.itemCount;
        case "itemsLow":
          return a.itemCount - b.itemCount;
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="min-h-screen flex items-center justify-center bg-transparent p-4"
      >
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-[#2ecc71] mx-auto mb-4" />
          <p className="text-gray-400 font-bold">Loading carts...</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="min-h-screen flex items-center justify-center bg-transparent p-4"
      >
        <div className="text-center p-6 sm:p-8 bg-[#1a1a1a] border border-[#333] rounded-3xl max-w-md shadow-2xl">
          <div className="bg-red-500/10 border border-red-500/30 rounded-full p-4 inline-block mb-4">
            <FaExclamationTriangle className="text-3xl text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Error</h2>
          <p className="text-gray-400 mb-6 font-medium">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchCarts}
            className="btn border-none bg-[#2ecc71] hover:bg-[#27ae60] text-black font-extrabold px-8 py-3 rounded-xl"
          >
            Try Again
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="min-h-screen bg-transparent py-8 px-2 sm:px-4 md:px-6 lg:px-8 font-sans"
    >
      <div className="max-w-[1600px] mx-auto pt-24 md:pt-28">
        
        {/* Header */}
        <motion.div variants={slideUp} className="text-center mb-10">
          <div className="flex justify-center mb-5">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-[#2ecc71]/10 border-2 border-[#2ecc71]/30 p-5 rounded-[2rem] shadow-[0_0_15px_rgba(46,204,113,0.15)]"
            >
              <FaShoppingCart className="text-4xl text-[#2ecc71]" />
            </motion.div>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-3 tracking-tight">
            Admin <span className="text-[#2ecc71]">Cart Management</span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base font-medium">
            Manage and monitor all user shopping carts
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10"
        >
          {[
            {
              icon: FaUsers,
              label: "Total Carts",
              value: carts.length,
              colorClass: "text-[#2ecc71] bg-[#2ecc71]/10 border-[#2ecc71]/20",
              delay: 0,
            },
            {
              icon: FaCheckCircle,
              label: "Active Items",
              value: carts.reduce((sum, cart) => sum + cart.items.length, 0),
              colorClass: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
              delay: 0.1,
            },
            {
              icon: FaDollarSign,
              label: "Total Value",
              value: `$${carts
                .reduce((sum, cart) => sum + cart.totalPrice, 0)
                .toFixed(2)}`,
              colorClass: "text-purple-400 bg-purple-400/10 border-purple-400/20",
              delay: 0.2,
            },
            {
              icon: FaBoxOpen,
              label: "Empty Carts",
              value: carts.filter((cart) => cart.items.length === 0).length,
              colorClass: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
              delay: 0.3,
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              variants={slideUp}
              transition={{ delay: stat.delay }}
              whileHover={{ y: -4 }}
              className="bg-[#1a1a1a] p-5 sm:p-6 rounded-[2rem] shadow-lg border border-[#333] flex items-center gap-4"
            >
              <div className={`rounded-2xl p-4 border ${stat.colorClass}`}>
                <stat.icon className={`text-3xl`} />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">
                  {stat.label}
                </p>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                  {stat.value}
                </h3>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-[#1a1a1a] rounded-[2rem] shadow-lg border border-[#333] p-4 sm:p-6 mb-10"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaSearch className="text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Search by ID, user, or service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#121212] text-white border border-[#333] rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-[#2ecc71] transition-shadow placeholder-gray-600 font-medium"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative w-full sm:w-48">
                <select
                  className="w-full bg-[#121212] text-white border border-[#333] rounded-xl py-3 pl-4 pr-10 appearance-none outline-none focus:ring-2 focus:ring-[#2ecc71] font-bold cursor-pointer transition-shadow"
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                >
                  <option value="all">All Carts</option>
                  <option value="hasItems">With Items</option>
                  <option value="empty">Empty Carts</option>
                </select>
                <svg className="absolute right-4 top-4 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>

              <div className="relative w-full sm:w-56">
                <select
                  className="w-full bg-[#121212] text-white border border-[#333] rounded-xl py-3 pl-4 pr-10 appearance-none outline-none focus:ring-2 focus:ring-[#2ecc71] font-bold cursor-pointer transition-shadow"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Sort: Newest First</option>
                  <option value="oldest">Sort: Oldest First</option>
                  <option value="priceHigh">Price: High to Low</option>
                  <option value="priceLow">Price: Low to High</option>
                  <option value="itemsHigh">Items: High to Low</option>
                  <option value="itemsLow">Items: Low to High</option>
                </select>
                <svg className="absolute right-4 top-4 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Carts List */}
        <AnimatePresence mode="popLayout">
          {filteredCarts.length === 0 ? (
            <motion.div
              key="no-carts"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-12 sm:py-20 bg-[#1a1a1a] rounded-[3rem] border border-[#333] shadow-lg"
            >
              <div className="bg-[#121212] border border-[#333] rounded-full p-5 inline-block mb-4">
                <FaBoxOpen className="text-4xl sm:text-5xl text-gray-500" />
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-2">
                No carts found
              </h3>
              <p className="text-gray-400 font-medium mb-6">
                {searchTerm
                  ? "Try adjusting your search criteria"
                  : "No carts match the current filters"}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSearchTerm("");
                  setFilterBy("all");
                  setSortBy("newest");
                }}
                className="bg-[#333] hover:bg-[#2ecc71] text-white hover:text-black font-extrabold px-6 py-3 rounded-xl transition-colors cursor-pointer"
              >
                Clear Filters
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="space-y-6 sm:space-y-8"
            >
              {filteredCarts.map((cart) => (
                <motion.div
                  key={cart.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-[#1a1a1a] rounded-[2rem] shadow-xl border border-[#333] p-5 sm:p-8 hover:border-[#2ecc71]/30 transition-colors"
                >
                  {/* Cart Header */}
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 pb-6 border-b border-[#333]">
                    <div className="flex items-center gap-4">
                      <motion.div
                        whileHover={{ rotate: 5 }}
                        className="bg-[#121212] border border-[#333] p-3 sm:p-4 rounded-2xl text-white"
                      >
                        <FaUserCircle className="text-2xl sm:text-3xl" />
                      </motion.div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
                          Cart #{cart.id}
                        </h3>
                        <p className="text-sm font-bold text-gray-400 mt-1">
                          User: <span className="text-[#2ecc71]">{cart.user}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center gap-2 bg-[#121212] border border-[#333] px-4 py-2 rounded-xl text-white font-bold shadow-inner"
                      >
                        <FaDollarSign className="text-[#2ecc71]" />
                        {cart.totalPrice.toFixed(2)}
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center gap-2 bg-[#121212] border border-[#333] px-4 py-2 rounded-xl text-white font-bold shadow-inner"
                      >
                        <FaClock className="text-cyan-400" />
                        {renderTotalDuration(cart.totalDuration)}
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center gap-2 bg-[#121212] border border-[#333] px-4 py-2 rounded-xl text-white font-bold shadow-inner"
                      >
                        <FaCheckCircle className="text-purple-400" />
                        {cart.itemCount} item{cart.itemCount !== 1 ? "s" : ""}
                      </motion.div>
                    </div>
                  </div>

                  {/* Cart Items */}
                  {cart.items.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-6 sm:py-8 bg-[#121212] rounded-2xl border border-[#222]"
                    >
                      <FaBoxOpen className="text-3xl sm:text-4xl text-gray-600 mx-auto mb-3" />
                      <p className="text-sm sm:text-base font-bold text-gray-500">
                        This cart is empty
                      </p>
                    </motion.div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 sm:gap-4">
                      <AnimatePresence>
                        {cart.items.map((item) => {
                          const isUnavailable = !item.service_available;
                          return (
                            <motion.div
                              key={item.id}
                              layout
                              initial={{ opacity: 0, scale: 0.98 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{ duration: 0.2 }}
                              className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-5 rounded-2xl border ${
                                isUnavailable
                                  ? "border-red-500/30 bg-red-500/5"
                                  : "border-[#333] bg-[#121212]"
                              }`}
                            >
                              {/* Item Info */}
                              <div className="flex items-center gap-4 flex-1 min-w-0 mb-3 sm:mb-0">
                                <motion.div whileHover={{ scale: 1.05 }} className="shrink-0">
                                  <img
                                    src={item.image}
                                    alt={item.service_name}
                                    className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-xl border border-[#333]"
                                  />
                                </motion.div>
                                <div className="flex-1 min-w-0">
                                  <h4
                                    className={`font-extrabold truncate text-base sm:text-lg mb-1 ${
                                      isUnavailable
                                        ? "text-red-400"
                                        : "text-white"
                                    }`}
                                  >
                                    {item.service_name}
                                    {isUnavailable && (
                                      <span className="ml-2 px-2 py-0.5 bg-red-500/20 border border-red-500/50 text-red-500 text-[10px] sm:text-xs rounded-full uppercase tracking-widest align-middle">
                                        Unavailable
                                      </span>
                                    )}
                                  </h4>
                                  <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-medium text-gray-400">
                                    <span>${item.price} each</span>
                                    <span className="text-[#333]">|</span>
                                    <span>{formatDuration(item.duration)}</span>
                                    <span className="text-[#333]">|</span>
                                    <span className="text-[#2ecc71] font-bold">
                                      Total: ${(item.price * item.quantity).toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Quantity Controls */}
                              <div className="flex items-center gap-3 shrink-0">
                                <motion.div
                                  className="flex items-center gap-1 bg-[#1a1a1a] border border-[#333] rounded-xl p-1"
                                >
                                  <motion.button
                                    whileHover={{ scale: 1.1, backgroundColor: "#333" }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() =>
                                      handleUpdateQuantity(
                                        cart.id,
                                        item,
                                        item.quantity - 1
                                      )
                                    }
                                    disabled={
                                      updatingItem === item.id ||
                                      item.quantity <= 1
                                    }
                                    className="p-2 text-white hover:text-[#2ecc71] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                                  >
                                    <FaMinus className="w-3 h-3" />
                                  </motion.button>
                                  
                                  <span className="font-extrabold text-white w-8 text-center text-sm sm:text-base">
                                    {item.quantity}
                                  </span>
                                  
                                  <motion.button
                                    whileHover={{ scale: 1.1, backgroundColor: "#333" }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() =>
                                      handleUpdateQuantity(
                                        cart.id,
                                        item,
                                        item.quantity + 1
                                      )
                                    }
                                    disabled={
                                      updatingItem === item.id ||
                                      !item.service_available
                                    }
                                    className="p-2 text-white hover:text-[#2ecc71] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                                  >
                                    <FaPlus className="w-3 h-3" />
                                  </motion.button>
                                </motion.div>
                                
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleRemoveItem(cart.id, item.id)}
                                  disabled={updatingItem === item.id}
                                  className="p-3 sm:p-3.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/30 hover:border-red-500 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                                  aria-label="Remove"
                                >
                                  {updatingItem === item.id ? (
                                    <FaSpinner className="animate-spin text-sm" />
                                  ) : (
                                    <FaTrashAlt className="text-sm" />
                                  )}
                                </motion.button>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default AdminCart;