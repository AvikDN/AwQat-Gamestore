import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { 
  FaUsers, 
  FaGamepad, 
  FaUserCheck, 
  FaMagnifyingGlass, 
  FaTrashCan, 
  FaChevronDown,
  FaUserShield,
  FaPlus,
  FaChevronLeft,
  FaChevronRight,
  FaSpinner
} from 'react-icons/fa6';
import AuthApiClient from '../services/auth-api-client';

export default function DashUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Search, Filter & Sort States
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const itemsPerPage = 16;

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, roleFilter, sortBy]);

  // Fetch Users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const queryParams = new URLSearchParams({ 
          page: currentPage, 
          page_size: itemsPerPage 
        });

        if (debouncedSearch) {
          queryParams.append('search', debouncedSearch);
        }

        if (roleFilter !== 'all') {
          queryParams.append('role', roleFilter);
        }

        if (sortBy === 'newest') queryParams.append('ordering', '-id');
        if (sortBy === 'name') queryParams.append('ordering', 'username');
        if (sortBy === 'games') queryParams.append('ordering', '-games_owned'); 
        if (sortBy === 'spent') queryParams.append('ordering', '-total_spent');

        const response = await AuthApiClient.get(`/api/users/?${queryParams.toString()}`);
        const data = response.data;
        
        setTotalCount(data.count || 0);
        setHasNext(!!data.next);
        setHasPrev(!!data.previous);

        const results = Array.isArray(data) ? data : (data.results || []);

        const mappedUsers = results.map(u => {
          const orders = u.profile?.order_history || [];
          const gamesOwned = orders.reduce((acc, curr) => acc + (curr.games?.length || 0), 0);
          const totalSpent = orders.reduce((acc, curr) => acc + parseFloat(curr.total_price || 0), 0);
          const role = u.groups && u.groups.length > 0 ? u.groups[0] : 'Customer';

          return {
            id: u.id,
            name: u.profile?.full_name || u.username,
            username: u.username,
            email: u.email,
            role: role,
            status: u.is_active ? 'Active' : 'Banned',
            avatar: u.profile?.avatar,
            gamesOwned,
            totalSpent,
            joinedDate: u.profile?.created_at ? new Date(u.profile.created_at).toLocaleDateString() : 'N/A'
          };
        });

        setUsers(mappedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to load user data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [currentPage, debouncedSearch, roleFilter, sortBy]);

  // Actual User Deletion Execution
  const handleDelete = async (id) => {
    const toastId = toast.loading("Deleting user...");
    try {
      await AuthApiClient.delete(`/api/users/${id}/`);
      setUsers((prev) => prev.filter((user) => user.id !== id));
      setTotalCount(prev => prev - 1);
      toast.success("User deleted successfully!", { id: toastId });
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user.", { id: toastId });
    }
  };

  // Warning Confirmation Toast
  const confirmDelete = (userId, userName) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3 min-w-[200px]">
          <div>
            <p className="text-sm font-extrabold text-white">Delete User?</p>
            <p className="text-xs text-zinc-400 mt-1">
              Are you sure you want to delete <span className="text-zinc-200 font-bold">{userName}</span>? This cannot be undone.
            </p>
          </div>
          <div className="flex gap-2 justify-end mt-2">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1.5 bg-[#2a2a2a] hover:bg-[#333] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                handleDelete(userId);
              }}
              className="px-3 py-1.5 bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      { duration: 6000, id: `confirm-${userId}` } 
    );
  };

  // Handle Role Update
  const handleRoleChange = async (userId, newRole) => {
    const toastId = toast.loading("Updating role...");
    try {
      await AuthApiClient.patch(`/api/users/${userId}/`, { groups: [newRole] });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast.success("Role updated successfully!", { id: toastId });
    } catch (error) {
      toast.error("Failed to update role.", { id: toastId });
    }
  };

  // Handle Status (Ban/Active) Update
  const handleStatusChange = async (userId, newStatus) => {
    const isActive = newStatus === 'Active';
    const toastId = toast.loading("Updating status...");
    try {
      await AuthApiClient.patch(`/api/users/${userId}/`, { is_active: isActive });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
      toast.success(`User is now ${newStatus}.`, { id: toastId });
    } catch (error) {
      toast.error("Failed to update status.", { id: toastId });
    }
  };

  // Current Page Metrics
  const activeUsersCount = users.filter((u) => u.status === 'Active').length;
  const adminCount = users.filter((u) => u.role.toLowerCase() === 'admin').length;
  const totalGamesOwnedCount = users.reduce((acc, curr) => acc + curr.gamesOwned, 0);
  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;

  return (
    <div className="w-full min-h-screen bg-transparent text-white font-sans p-3 sm:p-6 lg:p-8 flex justify-center items-start select-none">
      <Toaster 
        position="top-center" 
        toastOptions={{ 
          style: { background: '#18181c', color: '#fff', border: '1px solid #27272a', borderRadius: '12px', fontSize: '13px', fontWeight: '600' },
          success: { iconTheme: { primary: '#10b981', secondary: '#18181c' } },
          error: { iconTheme: { primary: '#f87171', secondary: '#18181c' } }
        }} 
      />
      
      <div className="w-full max-w-[1600px] mx-auto space-y-4 sm:space-y-6 md:space-y-8 relative pt-2 sm:pt-4 md:pt-8">
        
        {/* Header - Matched to DashOrder */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222222] pb-4 sm:pb-5">
          <div className="flex items-center gap-3">
            <FaUsers className="text-2xl sm:text-4xl text-white shrink-0" />
            <div>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                User Management
              </h1>
            </div>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-[22px] p-4 sm:p-5 flex items-center justify-between shadow-lg">
            <div>
              <p className="text-[10px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Users</p>
              <p className="text-2xl sm:text-3xl font-black mt-1 text-white">{totalCount}</p>
            </div>
            <FaUsers className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500 opacity-80" />
          </div>

          <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-[22px] p-4 sm:p-5 flex items-center justify-between shadow-lg">
            <div>
              <p className="text-[10px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-wider">Page Active</p>
              <p className="text-2xl sm:text-3xl font-black mt-1 text-white">{activeUsersCount}</p>
            </div>
            <FaUserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500 opacity-80" />
          </div>

          <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-[22px] p-4 sm:p-5 flex items-center justify-between shadow-lg">
            <div>
              <p className="text-[10px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-wider">Page Admins</p>
              <p className="text-2xl sm:text-3xl font-black mt-1 text-white">{adminCount}</p>
            </div>
            <FaUserShield className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 opacity-80" />
          </div>

          <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-[22px] p-4 sm:p-5 flex items-center justify-between shadow-lg">
            <div>
              <p className="text-[10px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-wider">Page Games</p>
              <p className="text-2xl sm:text-3xl font-black mt-1 text-white">{totalGamesOwnedCount}</p>
            </div>
            <FaGamepad className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500 opacity-80" />
          </div>
        </div>

        {/* Search & Filters Bar */}
        <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-[22px] p-3 sm:p-5 shadow-lg flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4">
          <div className="relative w-full lg:flex-1 max-w-md">
            <FaMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by name, email, or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#121212] border border-[#333] rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#2ecc71] transition-colors"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full lg:w-auto justify-end">
            <div className="flex items-center justify-between sm:justify-start gap-1 bg-[#121212] border border-[#333] rounded-xl p-1 overflow-x-auto">
              {['all', 'customer', 'admin'].map((role) => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-lg transition-colors capitalize text-center cursor-pointer ${
                    roleFilter === role 
                      ? 'bg-[#2ecc71] text-black' 
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            <div className="relative inline-block w-full sm:w-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto appearance-none bg-[#121212] border border-[#333] hover:border-zinc-500 text-zinc-200 text-xs sm:text-sm font-bold rounded-xl px-4 py-2 pr-8 focus:outline-none transition cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="games">Most Games</option>
                <option value="spent">Most Spent</option>
                <option value="name">Name (A-Z)</option>
              </select>
              <FaChevronDown className="w-3 h-3 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* LOADING STATE */}
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <FaSpinner className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 bg-[#1c1c1c] border border-[#2a2a2a] rounded-[22px] shadow-lg">
            <FaUsers className="mx-auto text-4xl text-zinc-600 mb-3" />
            <p className="text-zinc-400 text-sm font-semibold">
              No users found matching your search query.
            </p>
          </div>
        ) : (
          <>
            {/* MOBILE VIEW (CARDS) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xl:hidden">
              {users.map((user) => (
                <motion.div 
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-[22px] p-5 shadow-xl space-y-4 group hover:border-[#383838] transition-colors"
                >
                  {/* Top Header */}
                  <div className="flex items-center justify-between gap-3 border-b border-[#262626] pb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div 
                        className="w-10 h-10 rounded-xl bg-[#121212] border border-[#333] flex items-center justify-center shrink-0 bg-cover bg-center"
                        style={{ backgroundImage: user.avatar ? `url(${user.avatar})` : 'none' }}
                      >
                        {!user.avatar && (
                          <span className="text-xs font-bold text-zinc-300">
                            {user.name.substring(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-extrabold text-white text-sm truncate">{user.name}</h3>
                        <p className="text-[11px] text-zinc-400 truncate">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => confirmDelete(user.id, user.name)}
                      className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                      title="Delete User"
                    >
                      <FaTrashCan className="text-xs" />
                    </button>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-[#121212] border border-[#262626] rounded-xl p-3 flex flex-col gap-1 shadow-sm">
                      <span className="text-zinc-500 font-bold uppercase tracking-wider text-[9px]">Games Library</span>
                      <span className="font-black text-emerald-400 flex items-center gap-1.5"><FaGamepad className="text-[10px]"/> {user.gamesOwned}</span>
                    </div>
                    <div className="bg-[#121212] border border-[#262626] rounded-xl p-3 flex flex-col gap-1 shadow-sm">
                      <span className="text-zinc-500 font-bold uppercase tracking-wider text-[9px]">Total Spent</span>
                      <span className="font-black text-white">৳{user.totalSpent.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Dropdowns Row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold ml-1">Update Role</label>
                      <div className="relative">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="appearance-none w-full bg-[#161616] border border-[#2a2a2a] hover:border-[#2ecc71] text-white text-[11px] font-bold py-2 pl-3 pr-8 rounded-xl focus:outline-none transition-colors"
                        >
                          <option value="Customer">Customer</option>
                          <option value="Admin">Admin</option>
                        </select>
                        <FaChevronDown className="w-2.5 h-2.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold ml-1">Update Status</label>
                      <div className="relative">
                        <select
                          value={user.status}
                          onChange={(e) => handleStatusChange(user.id, e.target.value)}
                          className="appearance-none w-full bg-[#161616] border border-[#2a2a2a] hover:border-[#2ecc71] text-white text-[11px] font-bold py-2 pl-3 pr-8 rounded-xl focus:outline-none transition-colors"
                        >
                          <option value="Active">Active</option>
                          <option value="Banned">Banned</option>
                        </select>
                        <FaChevronDown className="w-2.5 h-2.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* DESKTOP VIEW (TABLE) */}
            <div className="hidden xl:block bg-[#1c1c1c] border border-[#2a2a2a] rounded-[22px] overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[850px]">
                  <thead>
                    <tr className="border-b border-[#2a2a2a] bg-[#121212] text-[11px] uppercase font-bold text-zinc-400 tracking-wider">
                      <th className="py-4 px-5">User</th>
                      <th className="py-4 px-5">Assign Role</th>
                      <th className="py-4 px-5">Set Status</th>
                      <th className="py-4 px-5">Library</th>
                      <th className="py-4 px-5">Total Spent</th>
                      <th className="py-4 px-5 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#2a2a2a] text-sm">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-[#222222] transition-colors group">
                        
                        <td className="py-4 px-5 align-middle">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-10 h-10 rounded-xl bg-[#121212] border border-[#333] bg-cover bg-center flex items-center justify-center shrink-0"
                              style={{ backgroundImage: user.avatar ? `url(${user.avatar})` : 'none' }}
                            >
                              {!user.avatar && (
                                <span className="text-xs font-bold text-zinc-300">
                                  {user.name.substring(0, 2).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="font-extrabold text-white text-sm">
                                {user.name}
                              </p>
                              <p className="text-[11px] text-zinc-400 mt-0.5">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-5 align-middle whitespace-nowrap">
                          <div className="relative inline-block w-32">
                            <select
                              value={user.role}
                              onChange={(e) => handleRoleChange(user.id, e.target.value)}
                              className={`appearance-none w-full border text-[11px] font-bold py-2 pl-3 pr-8 rounded-xl focus:outline-none cursor-pointer transition ${
                                user.role.toLowerCase() === 'admin'
                                  ? 'bg-purple-950/40 text-purple-300 border-purple-800/50 hover:border-purple-600'
                                  : 'bg-[#161616] text-zinc-300 border-[#333] hover:border-[#2ecc71]'
                              }`}
                            >
                              <option value="Customer">Customer</option>
                              <option value="Admin">Admin</option>
                            </select>
                            <FaChevronDown className="w-2.5 h-2.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </td>

                        <td className="py-4 px-5 align-middle whitespace-nowrap">
                          <div className="relative inline-block w-28">
                            <select
                              value={user.status}
                              onChange={(e) => handleStatusChange(user.id, e.target.value)}
                              className={`appearance-none w-full border text-[11px] font-bold py-2 pl-3 pr-8 rounded-xl focus:outline-none cursor-pointer transition ${
                                user.status === 'Active'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:border-emerald-500'
                                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:border-rose-500'
                              }`}
                            >
                              <option value="Active">Active</option>
                              <option value="Banned">Banned</option>
                            </select>
                            <FaChevronDown className="w-2.5 h-2.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </td>

                        <td className="py-4 px-5 align-middle whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 text-zinc-300 text-sm font-bold">
                            <FaGamepad className="w-3.5 h-3.5 text-emerald-400" />
                            {user.gamesOwned} Games
                          </span>
                        </td>

                        <td className="py-4 px-5 align-middle whitespace-nowrap">
                          <span className="text-sm font-black text-white">
                            ৳{user.totalSpent.toFixed(2)}
                          </span>
                        </td>

                        <td className="py-4 px-5 align-middle text-right whitespace-nowrap">
                          <button
                            onClick={() => confirmDelete(user.id, user.name)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/30 hover:border-rose-500 text-xs font-bold rounded-xl transition-colors shadow-sm cursor-pointer"
                            title="Delete User"
                          >
                            <FaTrashCan className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Pagination Controls */}
        {!isLoading && totalCount > itemsPerPage && (
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-3 pt-2 pb-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={!hasPrev}
              className="w-full sm:w-auto px-4 py-2 bg-[#1c1c1c] hover:bg-[#2a2a2a] disabled:opacity-40 disabled:hover:bg-[#1c1c1c] text-zinc-300 text-xs font-extrabold rounded-xl border border-[#2a2a2a] flex items-center justify-center gap-2 transition cursor-pointer disabled:cursor-not-allowed shadow-md"
            >
              <FaChevronLeft className="text-[10px]" /> Previous
            </button>
            
            <span className="text-xs text-zinc-400 font-semibold text-center whitespace-nowrap px-4">
              Page <span className="text-white font-bold">{currentPage}</span> of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={!hasNext}
              className="w-full sm:w-auto px-4 py-2 bg-[#1c1c1c] hover:bg-[#2a2a2a] disabled:opacity-40 disabled:hover:bg-[#1c1c1c] text-zinc-300 text-xs font-extrabold rounded-xl border border-[#2a2a2a] flex items-center justify-center gap-2 transition cursor-pointer disabled:cursor-not-allowed shadow-md"
            >
              Next <FaChevronRight className="text-[10px]" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}