import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTrashAlt,
  FaPlus,
  FaMinus,
  FaSpinner,
  FaUserCircle,
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
        service_available: false,
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

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4 } },
  };
  const slideUp = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };
  const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

  const fetchCarts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await new Promise(resolve => setTimeout(resolve, 800));

      const cartsWithDetails = FAKE_CARTS.map((cart) => {
        if (!cart.items || cart.items.length === 0) {
          return { ...cart, items: [], totalPrice: 0, itemCount: 0, createdAt: new Date(cart.created_at) };
        }

        const itemsWithDetails = cart.items;
        const totalPrice = itemsWithDetails.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );

        return {
          ...cart,
          items: itemsWithDetails,
          totalPrice,
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
          <FaSpinner className="animate-spin text-4xl text-white mx-auto mb-4" />
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
            className="btn border-none bg-white hover:bg-gray-200 text-black font-extrabold px-8 py-3 rounded-xl"
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
      <div className="max-w-[1600px] mx-auto pt-6 md:pt-10">
        
        {/* Left-Aligned Header */}
        <motion.div variants={slideUp} className="flex items-center gap-3.5 mb-8 border-b border-[#222] pb-5">
          <FaShoppingCart className="text-3xl sm:text-4xl text-white shrink-0" />
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Cart Management
          </h1>
        </motion.div>

        {/* Minimal Stats Overview */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8"
        >
          {[
            {
              icon: FaUsers,
              label: "Total Carts",
              value: carts.length,
              color: "text-white",
              delay: 0,
            },
            {
              icon: FaCheckCircle,
              label: "Active Items",
              value: carts.reduce((sum, cart) => sum + cart.items.length, 0),
              color: "text-white",
              delay: 0.05,
            },
           {
            icon: (props) => <span {...props} className={`${props.className} font-serif font-extrabold leading-none`}>৳</span>,
            label: "Total Value",
            value: `৳${carts
              .reduce((sum, cart) => sum + cart.totalPrice, 0)
              .toFixed(2)}`,
            color: "text-white",
            delay: 0.1,
          },
            {
              icon: FaBoxOpen,
              label: "Empty Carts",
              value: carts.filter((cart) => cart.items.length === 0).length,
              color: "text-white",
              delay: 0.15,
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              variants={slideUp}
              transition={{ delay: stat.delay }}
              className="bg-[#1c1c1c] p-5 sm:p-6 rounded-2xl border border-[#2a2a2a] flex items-center gap-4"
            >
              <stat.icon className={`text-3xl sm:text-4xl ৳{stat.color} shrink-0`} />
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
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
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-[#1c1c1c] rounded-2xl border border-[#2a2a2a] p-4 sm:p-5 mb-8"
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
                className="w-full bg-[#121212] text-white border border-[#333] rounded-xl py-2.5 pl-11 pr-4 outline-none focus:border-[#2ecc71] transition-colors placeholder-gray-500 font-medium text-sm"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-48">
                <select
                  className="w-full bg-[#121212] text-white border border-[#333] rounded-xl py-2.5 pl-4 pr-10 appearance-none outline-none focus:border-[#2ecc71] font-bold text-sm cursor-pointer transition-colors"
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                >
                  <option value="all">All Carts</option>
                  <option value="hasItems">With Items</option>
                  <option value="empty">Empty Carts</option>
                </select>
                <svg className="absolute right-4 top-3.5 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>

              <div className="relative w-full sm:w-56">
                <select
                  className="w-full bg-[#121212] text-white border border-[#333] rounded-xl py-2.5 pl-4 pr-10 appearance-none outline-none focus:border-[#2ecc71] font-bold text-sm cursor-pointer transition-colors"
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
                <svg className="absolute right-4 top-3.5 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-12 sm:py-16 bg-[#1c1c1c] rounded-2xl border border-[#2a2a2a]"
            >
              <FaBoxOpen className="text-4xl text-gray-500 mx-auto mb-3" />
              <h3 className="text-lg sm:text-xl font-bold text-white mb-1">
                No carts found
              </h3>
              <p className="text-gray-400 text-sm font-medium mb-5">
                {searchTerm
                  ? "Try adjusting your search criteria"
                  : "No carts match the current filters"}
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterBy("all");
                  setSortBy("newest");
                }}
                className="bg-[#2a2a2a] hover:bg-[#333] text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            </motion.div>
          ) : (
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              {filteredCarts.map((cart) => (
                <motion.div
                  key={cart.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="bg-[#1c1c1c] rounded-2xl border border-[#2a2a2a] p-5 sm:p-6"
                >
                  {/* Cart Header */}
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5 pb-4 border-b border-[#2a2a2a]">
                    <div className="flex items-center gap-3">
                      <FaUserCircle className="text-3xl sm:text-4xl text-white shrink-0" />
                      <div>
                        <h3 className="text-base sm:text-lg font-extrabold text-white">
                          Cart #{cart.id}
                        </h3>
                        <p className="text-xs font-semibold text-gray-400 mt-0.5">
                          User: <span className="text-[#2ecc71]">{cart.user}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                      <div className="flex items-center gap-1.5 bg-[#121212] border border-[#2a2a2a] px-3.5 py-1.5 rounded-xl text-white font-bold">
                      <span className="text-white font-serif">৳</span>
                      {cart.totalPrice.toFixed(2)}
                    </div>
                      <div className="flex items-center gap-1.5 bg-[#121212] border border-[#2a2a2a] px-3.5 py-1.5 rounded-xl text-white font-bold">
                        <FaCheckCircle className="text-white" />
                        {cart.itemCount} item{cart.itemCount !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>

                  {/* Cart Items */}
                  {cart.items.length === 0 ? (
                    <div className="text-center py-6 bg-[#121212] rounded-xl border border-[#242424]">
                      <FaBoxOpen className="text-2xl text-gray-600 mx-auto mb-2" />
                      <p className="text-xs sm:text-sm font-semibold text-gray-500">
                        This cart is empty
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      <AnimatePresence>
                        {cart.items.map((item) => (
                            <motion.div
                              key={item.id}
                              layout
                              initial={{ opacity: 0, scale: 0.98 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{ duration: 0.2 }}
                              className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-xl border border-[#2a2a2a] bg-[#121212]"
                            >
                              {/* Item Info */}
                              <div className="flex items-center gap-3.5 flex-1 min-w-0 mb-3 sm:mb-0">
                                <img
                                  src={item.image}
                                  alt={item.service_name}
                                  className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded-xl shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold truncate text-sm sm:text-base mb-1 text-white">
                                    {item.service_name}
                                  </h4>
                                  <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-gray-400">
                                    <span>৳{item.price} each</span>
                                    <span className="text-[#333]">|</span>
                                    <span className="text-[#2ecc71] font-bold">
                                      Total: ৳{(item.price * item.quantity).toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Quantity Controls & Delete */}
                              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                                <div className="flex h-7 bg-[#222] rounded-sm overflow-hidden border border-[#333]">
                                  <button
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
                                    className="w-7 h-full flex items-center justify-center bg-gray-300 hover:bg-white text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                  >
                                    <FaMinus size={9} />
                                  </button>
                                  
                                  <div className="px-3 h-full flex items-center justify-center font-bold min-w-[32px] text-center text-white text-xs border-x border-[#333]">
                                    {item.quantity}
                                  </div>
                                  
                                  <button
                                    onClick={() =>
                                      handleUpdateQuantity(
                                        cart.id,
                                        item,
                                        item.quantity + 1
                                      )
                                    }
                                    disabled={updatingItem === item.id}
                                    className="w-7 h-full flex items-center justify-center bg-gray-300 hover:bg-white text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                  >
                                    <FaPlus size={9} />
                                  </button>
                                </div>
                                
                                <button
                                  onClick={() => handleRemoveItem(cart.id, item.id)}
                                  disabled={updatingItem === item.id}
                                  className="p-2 text-white hover:bg-[#333] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                  aria-label="Remove"
                                >
                                  {updatingItem === item.id ? (
                                    <FaSpinner className="animate-spin text-sm" />
                                  ) : (
                                    <FaTrashAlt className="text-sm" />
                                  )}
                                </button>
                              </div>
                            </motion.div>
                          )
                        )}
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