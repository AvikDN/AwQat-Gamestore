import React, { useState, useMemo } from 'react';
import { 
  FaGamepad, 
  FaPlus, 
  FaMagnifyingGlass, 
  FaChevronDown, 
  FaPenToSquare, 
  FaTrashCan,
  FaChevronLeft,
  FaChevronRight,
  FaArrowDownAZ
} from 'react-icons/fa6';

const INITIAL_GAMES = [
  {
    id: 1,
    title: 'Elden Ring',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    description: 'A dark fantasy action RPG set in the Lands Between.',
    price: 59.99,
    category: 'RPG',
    stock: 25,
    status: 'Active'
  },
  {
    id: 2,
    title: 'God of War',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80',
    description: 'Kratos and Atreus embark on an epic journey in the Norse realms.',
    price: 49.99,
    category: 'Action',
    stock: 18,
    status: 'Active'
  },
  {
    id: 3,
    title: 'Red Dead Redemption 2',
    image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=400&q=80',
    description: "An epic tale of life in America's unforgiving heartland.",
    price: 39.99,
    category: 'Adventure',
    stock: 30,
    status: 'Active'
  },
  {
    id: 4,
    title: 'Cyberpunk 2077',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=80',
    description: 'An open-world, action-adventure story set in Night City.',
    price: 29.99,
    category: 'RPG',
    stock: 0,
    status: 'Inactive'
  },
  {
    id: 5,
    title: 'Horizon Forbidden West',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=400&q=80',
    description: 'Explore distant lands and fight deadly machines in this action RPG.',
    price: 49.99,
    category: 'Action',
    stock: 12,
    status: 'Active'
  },
  {
    id: 6,
    title: 'Minecraft',
    image: 'https://images.unsplash.com/photo-1627856013091-fed6e4e30025?auto=format&fit=crop&w=400&q=80',
    description: 'Build, explore, and survive in your own blocky world.',
    price: 26.95,
    category: 'Sandbox',
    stock: 40,
    status: 'Active'
  }
];

export default function DashGames() {
  const [games, setGames] = useState(INITIAL_GAMES);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [isAscending, setIsAscending] = useState(true);

  const handleDelete = (id) => {
    setGames((prev) => prev.filter((game) => game.id !== id));
  };

  const filteredGames = useMemo(() => {
    return games
      .filter((game) => {
        const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All' ? true : game.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortBy === 'name') comp = a.title.localeCompare(b.title);
        if (sortBy === 'price') comp = a.price - b.price;
        if (sortBy === 'stock') comp = a.stock - b.stock;
        return isAscending ? comp : -comp;
      });
  }, [games, searchQuery, statusFilter, sortBy, isAscending]);

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 md:space-y-8 relative">
      
      {/* 1. Header Box */}
      <div className="bg-[#18181c] border border-[#27272a] rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <FaGamepad className="w-6 h-6 sm:w-7 sm:h-7 text-white shrink-0" />
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Games Management
            </h1>
          </div>
          <p className="text-zinc-400 text-xs sm:text-sm pl-9 sm:pl-10">
            Manage your game inventory
          </p>
        </div>

        <button className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#10b981] hover:bg-[#059669] text-black font-bold text-xs sm:text-sm rounded-xl transition-all duration-200 shadow-lg hover:shadow-emerald-900/20 w-full sm:w-auto cursor-pointer shrink-0">
          <FaPlus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Add Game</span>
        </button>
      </div>

      {/* 2. Search & Filters Bar */}
      <div className="bg-[#18181c] border border-[#27272a] rounded-2xl p-3 sm:p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4">
        
        {/* Search Input */}
        <div className="relative w-full lg:w-80 xl:w-96">
          <FaMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search games by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#111114] border border-[#27272a] rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Filters and Order Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 justify-end">
          
          {/* Status Dropdown */}
          <div className="relative inline-block flex-1 sm:flex-none">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none bg-[#111114] border border-[#27272a] text-zinc-200 text-xs sm:text-sm rounded-xl px-3 sm:px-4 py-2 pr-8 focus:outline-none focus:border-emerald-500 cursor-pointer font-medium"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <FaChevronDown className="w-3 h-3 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Sort By Dropdown */}
          <div className="relative inline-block flex-1 sm:flex-none">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full appearance-none bg-[#111114] border border-[#27272a] text-zinc-200 text-xs sm:text-sm rounded-xl px-3 sm:px-4 py-2 pr-8 focus:outline-none focus:border-emerald-500 cursor-pointer font-medium"
            >
              <option value="name">Sort by Name</option>
              <option value="price">Sort by Price</option>
              <option value="stock">Sort by Stock</option>
            </select>
            <FaChevronDown className="w-3 h-3 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Ascending / Descending Button */}
          <button
            onClick={() => setIsAscending(!isAscending)}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#111114] border border-[#27272a] hover:border-zinc-500 text-zinc-200 text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer"
            title="Toggle Sort Order"
          >
            <FaArrowDownAZ className={`w-3.5 h-3.5 text-emerald-400 transition-transform ${!isAscending ? 'rotate-180' : ''}`} />
            <span className="hidden xs:inline">{isAscending ? 'A-Z' : 'Z-A'}</span>
          </button>
        </div>
      </div>

      {/* 3. Games Grid (Half card width layout: 4 to 5 cards per row on large screens) */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {filteredGames.length > 0 ? (
          filteredGames.map((game) => (
            <div 
              key={game.id} 
              className="bg-[#18181c] border border-[#27272a] hover:border-[#3f3f46] rounded-2xl p-3 flex flex-col justify-between transition-all duration-200 shadow-sm group"
            >
              <div>
                {/* Image & Header Info */}
                <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden mb-2.5 bg-[#111114] border border-[#27272a]">
                  <img 
                    src={game.image} 
                    alt={game.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md border ${
                    game.status === 'Active' 
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60' 
                      : 'bg-rose-950/80 text-rose-300 border-rose-700/60'
                  }`}>
                    {game.status}
                  </span>
                </div>

                {/* Game Title */}
                <h3 className="font-extrabold text-sm text-white truncate" title={game.title}>
                  {game.title}
                </h3>

                {/* Description */}
                <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed min-h-[32px]">
                  {game.description}
                </p>

                {/* Meta details list */}
                <div className="mt-3 pt-2.5 border-t border-[#27272a] space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 font-medium text-[11px]">Price:</span>
                    <span className="font-extrabold text-white">${game.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 font-medium text-[11px]">Category:</span>
                    <span className="font-semibold text-zinc-300 text-[11px] bg-[#111114] px-1.5 py-0.5 rounded border border-[#27272a]">
                      {game.category}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 font-medium text-[11px]">Stock:</span>
                    <span className={`font-bold text-[11px] ${game.stock > 0 ? 'text-zinc-200' : 'text-rose-400'}`}>
                      {game.stock}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-1.5 mt-3 pt-2 border-t border-[#27272a]">
                <button 
                  className="inline-flex items-center justify-center gap-1 py-1.5 bg-[#111114] hover:bg-[#202025] text-zinc-200 border border-[#27272a] text-[11px] font-semibold rounded-lg transition-colors cursor-pointer"
                  title="Edit Game"
                >
                  <FaPenToSquare className="w-3 h-3 text-emerald-400" />
                  <span>Edit</span>
                </button>

                <button 
                  onClick={() => handleDelete(game.id)}
                  className="inline-flex items-center justify-center gap-1 py-1.5 bg-[#f87171] hover:bg-[#ef4444] text-white text-[11px] font-semibold rounded-lg transition-colors cursor-pointer"
                  title="Delete Game"
                >
                  <FaTrashCan className="w-3 h-3" />
                  <span>Delete</span>
                </button>
              </div>

            </div>
          ))
        ) : (
          <div className="col-span-full bg-[#18181c] border border-[#27272a] rounded-2xl py-12 text-center text-zinc-500 text-xs sm:text-sm">
            No games found matching your search or filters.
          </div>
        )}
      </div>

      {/* 4. Footer Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400 pt-1 px-1">
        <p>
          Showing <span className="font-semibold text-zinc-200">1</span> to{' '}
          <span className="font-semibold text-zinc-200">{filteredGames.length}</span> of{' '}
          <span className="font-semibold text-zinc-200">{games.length}</span> games
        </p>

        <div className="flex items-center gap-1.5">
          <button 
            className="w-8 h-8 rounded-lg bg-[#18181c] border border-[#27272a] text-zinc-400 hover:text-white flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer"
            disabled
          >
            <FaChevronLeft className="w-3 h-3" />
          </button>
          <button className="w-8 h-8 rounded-lg bg-[#10b981] text-black font-bold flex items-center justify-center shadow-sm">
            1
          </button>
          <button 
            className="w-8 h-8 rounded-lg bg-[#18181c] border border-[#27272a] text-zinc-400 hover:text-white flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer"
            disabled
          >
            <FaChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

    </div>
  );
}