import React, { useState, useMemo } from 'react';
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
  FaPenToSquare
} from 'react-icons/fa6';

const INITIAL_USERS = [
  {
    id: 1,
    name: 'Alex Mercer',
    email: 'alex_mercer@gmail.com',
    role: 'VIP Gamer',
    status: 'Active',
    gamesOwned: 28,
    totalSpent: '$480.00',
    joinedDate: 'Jan 15, 2025'
  },
  {
    id: 2,
    name: 'Sarah Connor',
    email: 's_connor@cyber.net',
    role: 'Customer',
    status: 'Active',
    gamesOwned: 12,
    totalSpent: '$195.50',
    joinedDate: 'Mar 02, 2025'
  },
  {
    id: 3,
    name: 'Dave Vance',
    email: 'dave_v@admin.gamestore.com',
    role: 'Admin',
    status: 'Active',
    gamesOwned: 84,
    totalSpent: '$1,240.00',
    joinedDate: 'Nov 10, 2024'
  },
  {
    id: 4,
    name: 'Toxic_Player00',
    email: 'banned_user@yahoo.com',
    role: 'Customer',
    status: 'Banned',
    gamesOwned: 3,
    totalSpent: '$45.00',
    joinedDate: 'Feb 18, 2025'
  }
];

export default function DashUsers() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const handleDelete = (id) => {
    setUsers((prev) => prev.filter((user) => user.id !== id));
  };

  const filteredUsers = useMemo(() => {
    return users
      .filter((user) => {
        const matchesSearch = 
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesRole = 
          roleFilter === 'all' 
            ? true 
            : user.role.toLowerCase().replace(' ', '') === roleFilter.toLowerCase().replace(' ', '');

        return matchesSearch && matchesRole;
      })
      .sort((a, b) => {
        if (sortBy === 'games') return b.gamesOwned - a.gamesOwned;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return b.id - a.id;
      });
  }, [users, searchQuery, roleFilter, sortBy]);

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === 'Active').length;
  const vipCount = users.filter((u) => u.role === 'VIP Gamer').length;
  const totalGamesOwned = users.reduce((acc, curr) => acc + curr.gamesOwned, 0);

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 md:space-y-8 relative">
      
      {/* 1. Header Box */}
      <div className="bg-[#18181c] border border-[#27272a] rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
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
          <span>Add user</span>
        </button>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#18181c] border border-[#27272a] rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Users</p>
            <p className="text-2xl sm:text-3xl font-black mt-1 text-white">{totalUsers}</p>
          </div>
          <FaUsers className="w-5 h-5 sm:w-6 sm:h-6 text-white opacity-80" />
        </div>

        <div className="bg-[#18181c] border border-[#27272a] rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-wider">Active Gamers</p>
            <p className="text-2xl sm:text-3xl font-black mt-1 text-white">{activeUsers}</p>
          </div>
          <FaUserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white opacity-80" />
        </div>

        <div className="bg-[#18181c] border border-[#27272a] rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-wider">VIP Members</p>
            <p className="text-2xl sm:text-3xl font-black mt-1 text-white">{vipCount}</p>
          </div>
          <FaCrown className="w-5 h-5 sm:w-6 sm:h-6 text-white opacity-80" />
        </div>

        <div className="bg-[#18181c] border border-[#27272a] rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-wider">Games Owned</p>
            <p className="text-2xl sm:text-3xl font-black mt-1 text-white">{totalGamesOwned}</p>
          </div>
          <FaGamepad className="w-5 h-5 sm:w-6 sm:h-6 text-white opacity-80" />
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
                className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors capitalize text-center ${
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
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[#1e1e23] transition-colors">
                    
                    {/* User Profile */}
                    <td className="py-3.5 px-5 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#27272a] flex items-center justify-center shrink-0 border border-[#3f3f46]">
                          <span className="text-xs font-bold text-zinc-300">
                            {user.name.substring(0, 2).toUpperCase()}
                          </span>
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
                          user.role === 'Admin' 
                            ? 'bg-purple-950/40 text-purple-300 border-purple-800/50'
                            : user.role === 'VIP Gamer'
                            ? 'bg-amber-950/40 text-amber-300 border-amber-800/50'
                            : 'bg-[#25252b] text-zinc-300 border-[#33333b]'
                        }`}>
                          {user.role === 'Admin' && <FaUserShield className="w-3 h-3" />}
                          {user.role === 'VIP Gamer' && <FaCrown className="w-3 h-3 text-amber-400" />}
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
                        {user.totalSpent}
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

      {/* 5. Footer Info */}
      <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
        <p>
          Showing <span className="font-semibold text-zinc-200">{filteredUsers.length}</span> of{' '}
          <span className="font-semibold text-zinc-200">{users.length}</span> registered users
        </p>
      </div>

    </div>
  );
}