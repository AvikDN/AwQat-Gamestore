import React, { useState, useMemo, useEffect } from 'react';
import { 
  FaUsers, 
  FaGamepad, 
  FaUserCheck, 
  FaMagnifyingGlass, 
  FaTrashCan, 
  FaChevronDown,
  FaUserShield,
  FaCrown,
  FaPlus,
  FaPenToSquare,
  FaChevronLeft,
  FaChevronRight,
  FaSpinner
} from 'react-icons/fa6';
import toast, { Toaster } from 'react-hot-toast';
import AuthApiClient from '../services/auth-api-client';

export default function DashUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search, Filter & Sort States
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch Users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        // Using the admin-restricted UserViewSet endpoint[cite: 3]
        const response = await AuthApiClient.get('/api/users/');
        const data = response.data.results || response.data;
        
        // Map backend data to our frontend requirements
        const mappedUsers = data.map(u => {
          // Extract order history from the nested profile[cite: 3]
          const orders = u.profile?.order_history || [];
          
          // Calculate derived metrics
          const gamesOwned = orders.reduce((acc, curr) => acc + (curr.games?.length || 0), 0);
          const totalSpent = orders.reduce((acc, curr) => acc + parseFloat(curr.total_price || 0), 0);
          
          // Determine Role from admin-assigned groups[cite: 3]
          const role = u.groups && u.groups.length > 0 ? u.groups[0] : 'Customer';

          return {
            id: u.id,
            name: u.profile?.full_name || u.username,
            username: u.username,
            email: u.email,
            role: role,
            status: 'Active', // Defaulting to Active as is_active isn't in UserSerializer
            avatar: u.profile?.avatar,
            gamesOwned,
            totalSpent,
            joinedDate: u.profile?.created_at ? new Date(u.profile.created_at).toLocaleDateString() : 'N/A',
            rawDate: u.profile?.created_at ? new Date(u.profile.created_at) : new Date(0)
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
  }, []);

  // Handle User Deletion
  const handleDelete = async (id) => {
    const toastId = toast.loading("Deleting user...");
    try {
      // Calls the destroy method on the UserViewSet[cite: 3]
      await AuthApiClient.delete(`/api/users/${id}/`);
      setUsers((prev) => prev.filter((user) => user.id !== id));
      toast.success("User deleted successfully!", { id: toastId });
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user.", { id: toastId });
    }
  };

  // Filter and Sort Logic
  const filteredUsers = useMemo(() => {
    let result = users.filter((user) => {
      const matchesSearch = 
        user.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        user.email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        user.username.toLowerCase().includes(debouncedSearch.toLowerCase());
      
      const matchesRole = 
        roleFilter === 'all' 
          ? true 
          : user.role.toLowerCase().replace(' ', '') === roleFilter.toLowerCase().replace(' ', '');

      return matchesSearch && matchesRole;
    });

    result.sort((a, b) => {
      if (sortBy === 'games') return b.gamesOwned - a.gamesOwned;
      if (sortBy === 'spent') return b.totalSpent - a.totalSpent;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return b.rawDate - a.rawDate; // Default to 'newest'
    });

    return result;
  }, [users, debouncedSearch, roleFilter, sortBy]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  // Reset to page 1 if filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, roleFilter, sortBy]);

  // Top Metrics Calculations
  const totalUsersCount = users.length;
  const activeUsersCount = users.filter((u) => u.status === 'Active').length;
  const vipCount = users.filter((u) => u.role.toLowerCase().includes('vip')).length;
  const totalGamesOwnedCount = users.reduce((acc, curr) => acc + curr.gamesOwned, 0);

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 md:space-y-8 relative select-none">
      <Toaster 
        position="top-center" 
        toastOptions={{ 
          style: { background: '#18181c', color: '#fff', border: '1px solid #27272a', borderRadius: '12px' },
          success: { iconTheme: { primary: '#10b981', secondary: '#18181c' } },
        }} 
      />
      
      {/* 1. Header Box */}
      <div className="bg-[#18181c] border border-[#27272a] rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md mt-2 sm:mt-4 md:mt-8">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <FaUsers className="w-6 h-6 sm:w-7 sm:h-7 text-white shrink-0" />
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              User Management
            </h1>
          </div>
          <p className="text-zinc-400 text-xs sm:text-sm pl-9 sm:pl-10">
            Manage gamer accounts, roles, libraries, and spending history
          </p>
        </div>

        <button className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#10b981] hover:bg-[#059669] text-black font-bold text-xs sm:text-sm rounded-xl transition-all duration-200 shadow-lg hover:shadow-emerald-900/20 w-full sm:w-auto cursor-pointer shrink-0">
          <FaPlus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Add User</span>
        </button>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#18181c] border border-[#27272a] rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Users</p>
            <p className="text-2xl sm:text-3xl font-black mt-1 text-white">{totalUsersCount}</p>
          </div>
          <FaUsers className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500 opacity-80" />
        </div>

        <div className="bg-[#18181c] border border-[#27272a] rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-wider">Active Gamers</p>
            <p className="text-2xl sm:text-3xl font-black mt-1 text-white">{activeUsersCount}</p>
          </div>
          <FaUserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500 opacity-80" />
        </div>

        <div className="bg-[#18181c] border border-[#27272a] rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-wider">VIP Members</p>
            <p className="text-2xl sm:text-3xl font-black mt-1 text-white">{vipCount}</p>
          </div>
          <FaCrown className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 opacity-80" />
        </div>

        <div className="bg-[#18181c] border border-[#27272a] rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-wider">Games Owned</p>
            <p className="text-2xl sm:text-3xl font-black mt-1 text-white">{totalGamesOwnedCount}</p>
          </div>
          <FaGamepad className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500 opacity-80" />
        </div>
      </div>

      {/* 3. Search & Filters Bar */}
      <div className="bg-[#18181c] border border-[#27272a] rounded-2xl p-3 sm:p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4">
        {/* Search Input */}
        <div className="relative w-full lg:w-80 xl:w-96">
          <FaMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#111114] border border-[#27272a] rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Filter Pill & Dropdown */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full lg:w-auto justify-end">
          <div className="flex items-center justify-between sm:justify-start gap-1 bg-[#111114] border border-[#27272a] rounded-xl p-1 overflow-x-auto">
            {['all', 'customer', 'vip', 'admin'].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors capitalize text-center cursor-pointer ${
                  roleFilter === role 
                    ? 'bg-[#10b981] text-black font-bold' 
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
              className="w-full sm:w-auto appearance-none bg-[#111114] border border-[#27272a] text-zinc-200 text-xs sm:text-sm rounded-xl px-4 py-2 pr-8 focus:outline-none focus:border-emerald-500 cursor-pointer font-medium"
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

      {/* 4. Table Container */}
      <div className="bg-[#18181c] border border-[#27272a] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[720px]">
            <thead>
              <tr className="border-b border-[#27272a] bg-[#121215] text-[11px] uppercase font-bold text-zinc-400 tracking-wider">
                <th className="py-3.5 px-5">User</th>
                <th className="py-3.5 px-5">Role & Status</th>
                <th className="py-3.5 px-5">Library</th>
                <th className="py-3.5 px-5">Total Spent</th>
                <th className="py-3.5 px-5">Joined Date</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#27272a] text-xs sm:text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <FaSpinner className="w-6 h-6 text-emerald-500 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[#1e1e23] transition-colors">
                    
                    {/* User Profile */}
                    <td className="py-3.5 px-5 align-middle">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#27272a] bg-cover bg-center flex items-center justify-center shrink-0 border border-[#3f3f46]"
                          style={{ backgroundImage: user.avatar ? `url(${user.avatar})` : 'none' }}
                        >
                          {!user.avatar && (
                            <span className="text-xs font-bold text-zinc-300">
                              {user.name.substring(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-zinc-100 text-xs sm:text-sm">
                            {user.name}
                          </p>
                          <p className="text-[11px] text-zinc-400 mt-0.5">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Role & Status */}
                    <td className="py-3.5 px-5 align-middle whitespace-nowrap">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${
                          user.role.toLowerCase() === 'admin' 
                            ? 'bg-purple-950/40 text-purple-300 border-purple-800/50'
                            : user.role.toLowerCase().includes('vip')
                            ? 'bg-amber-950/40 text-amber-300 border-amber-800/50'
                            : 'bg-[#25252b] text-zinc-300 border-[#33333b]'
                        }`}>
                          {user.role.toLowerCase() === 'admin' && <FaUserShield className="w-3 h-3" />}
                          {user.role.toLowerCase().includes('vip') && <FaCrown className="w-3 h-3 text-amber-400" />}
                          {user.role}
                        </span>
                        
                        <span className={`text-[11px] font-semibold flex items-center gap-1.5 ${
                          user.status === 'Active' ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            user.status === 'Active' ? 'bg-emerald-400' : 'bg-rose-400'
                          }`}></span>
                          {user.status}
                        </span>
                      </div>
                    </td>

                    {/* Games Owned */}
                    <td className="py-3.5 px-5 align-middle whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 text-zinc-300 text-xs sm:text-sm font-semibold">
                        <FaGamepad className="w-3.5 h-3.5 text-emerald-400" />
                        {user.gamesOwned} Games
                      </span>
                    </td>

                    {/* Total Spent */}
                    <td className="py-3.5 px-5 align-middle whitespace-nowrap">
                      <span className="text-xs sm:text-sm font-extrabold text-zinc-100">
                        ৳{user.totalSpent.toFixed(2)}
                      </span>
                    </td>

                    {/* Joined Date */}
                    <td className="py-3.5 px-5 align-middle whitespace-nowrap text-xs text-zinc-400 font-medium">
                      {user.joinedDate}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-5 align-middle text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {/* Edit Button */}
                        <button
                          className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-[#202025] hover:bg-[#2e2e38] text-zinc-200 border border-[#2e2e38] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                          title="Edit User"
                        >
                          <FaPenToSquare className="w-3 h-3 text-emerald-400" />
                          <span>Edit</span>
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-[#f87171] hover:bg-[#ef4444] text-white text-xs font-semibold rounded-lg transition-colors shadow-sm cursor-pointer"
                          title="Delete User"
                        >
                          <FaTrashCan className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-zinc-500 text-xs sm:text-sm">
                    No users found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination & Footer Info */}
      {!isLoading && filteredUsers.length > itemsPerPage && (
        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-3 pt-2 pb-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="w-full sm:w-auto px-4 py-2 bg-[#18181c] hover:bg-[#2a2a2a] disabled:opacity-40 disabled:hover:bg-[#18181c] text-gray-300 text-xs font-extrabold rounded-xl border border-[#2a2a2a] flex items-center justify-center gap-2 transition cursor-pointer disabled:cursor-not-allowed shadow-md"
          >
            <FaChevronLeft className="text-[10px]" /> Previous
          </button>
          
          <span className="text-xs text-zinc-400 font-semibold text-center whitespace-nowrap px-4">
            Showing <span className="text-white font-bold">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="text-white font-bold">{Math.min(currentPage * itemsPerPage, filteredUsers.length)}</span> of <span className="text-white font-bold">{filteredUsers.length}</span>
          </span>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="w-full sm:w-auto px-4 py-2 bg-[#18181c] hover:bg-[#2a2a2a] disabled:opacity-40 disabled:hover:bg-[#18181c] text-gray-300 text-xs font-extrabold rounded-xl border border-[#2a2a2a] flex items-center justify-center gap-2 transition cursor-pointer disabled:cursor-not-allowed shadow-md"
          >
            Next <FaChevronRight className="text-[10px]" />
          </button>
        </div>
      )}

      {/* Minimal string fallback for when items are few */}
      {!isLoading && filteredUsers.length <= itemsPerPage && (
        <div className="flex items-center justify-between text-xs text-zinc-400 px-1 pt-1">
          <p>
            Showing <span className="font-semibold text-zinc-200">{filteredUsers.length}</span> of{' '}
            <span className="font-semibold text-zinc-200">{users.length}</span> registered users
          </p>
        </div>
      )}

    </div>
  );
}