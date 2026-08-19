import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import apiClient from '../services/api-client';

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 100, damping: 15 },
    },
};

// Helper function to calculate final price for sorting and display
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

export default function CategoryGames() {
    const { id } = useParams();
    
    const [games, setGames] = useState([]);
    const [categoryName, setCategoryName] = useState('Games');
    const [isLoading, setIsLoading] = useState(true);

    // Pagination states
    const [page, setPage] = useState(1);
    const [hasNext, setHasNext] = useState(false);
    const [hasPrev, setHasPrev] = useState(false);

    // Filter & Sorting states
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [ordering, setOrdering] = useState('default');

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Reset page to 1 when filters or sorting change
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, ordering]);

    // Fetch category details for the dynamic title
    useEffect(() => {
        apiClient.get(`/categories/${id}/`)
            .then(response => {
                if (response.data && response.data.name) {
                    setCategoryName(response.data.name);
                }
            })
            .catch(error => {
                console.error("Error fetching category details:", error);
            });
    }, [id]);

    // Fetch games from category endpoint with low-to-high parameters
    useEffect(() => {
        setIsLoading(true);

        const queryParams = new URLSearchParams({ page: page });

        if (debouncedSearch) queryParams.append('search', debouncedSearch);

        // Apply ordering logic matching ProductList
        if (ordering === 'low-to-high') {
            queryParams.append('ordering', 'final_price');
            queryParams.append('min_price', '1');
        } else if (ordering === 'high-to-low') {
            queryParams.append('ordering', '-final_price');
        }

        apiClient.get(`/categories/${id}/games/?${queryParams.toString()}`)
            .then(response => {
                const data = response.data;
                
                let fetchedGames = Array.isArray(data) ? data : (data.results || []);

                // Extra frontend safety net to exclude upcoming/0 price items on low-to-high sort
                if (ordering === 'low-to-high') {
                    fetchedGames = fetchedGames.filter(game => game.active && parseFloat(game.price) > 0);
                }

                setGames(fetchedGames);
                if (!Array.isArray(data)) {
                    setHasNext(!!data.next);
                    setHasPrev(!!data.previous);
                } else {
                    setHasNext(false);
                    setHasPrev(false);
                }
                setIsLoading(false);
            })
            .catch(error => {
                console.error("Error fetching category games:", error);
                setIsLoading(false);
            });

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [id, page, ordering, debouncedSearch]);

    const handleNextPage = () => {
        if (hasNext) setPage(prev => prev + 1);
    };

    const handlePrevPage = () => {
        if (hasPrev) setPage(prev => prev - 1);
    };

    // --- Frontend Filtering & Sorting ---
    let processedGames = [...games];

    if (debouncedSearch) {
        processedGames = processedGames.filter(game => 
            game.title.toLowerCase().includes(debouncedSearch.toLowerCase())
        );
    }

    if (ordering === 'low-to-high') {
        processedGames = processedGames.filter(game => game.active && parseFloat(game.price) > 0);
        processedGames.sort((a, b) => getFinalPrice(a) - getFinalPrice(b));
    } else if (ordering === 'high-to-low') {
        processedGames.sort((a, b) => getFinalPrice(b) - getFinalPrice(a));
    } else if (ordering === 'discounted') {
        processedGames = processedGames.filter(game => parseFloat(game.discount || 0) > 0);
    } else if (ordering === 'title') {
        processedGames.sort((a, b) => a.title.localeCompare(b.title));
    } else if (ordering === '-title') {
        processedGames.sort((a, b) => b.title.localeCompare(a.title));
    }

    return (
        <section className="w-full max-w-[1920px] mx-auto pt-32 pb-16 md:pt-36 md:pb-20 px-4 md:px-8 xl:px-12 min-h-screen">
            
            {/* Top Bar: Title, Search, and Sort */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 bg-[#1a1a1a] p-4 md:p-6 rounded-3xl border border-[#333] shadow-lg">
                
                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                    {categoryName} <span className="text-[#2ecc71]">Games</span>
                </h1>

                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    {/* Search Input */}
                    <div className="relative w-full sm:w-[250px] md:w-[300px]">
                        <input 
                            type="text" 
                            placeholder="Search games..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#121212] text-white rounded-xl py-3 pl-4 pr-10 outline-none focus:ring-2 focus:ring-[#2ecc71] transition-shadow border border-[#333] placeholder-gray-500 font-medium"
                        />
                        <svg className="absolute right-3 top-3.5 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                    </div>

                    {/* Ordering Select */}
                    <div className="relative w-full sm:w-[200px]">
                        <select 
                            value={ordering}
                            onChange={(e) => setOrdering(e.target.value)}
                            className="w-full bg-[#121212] text-white font-bold rounded-xl py-3 pl-4 pr-10 appearance-none outline-none cursor-pointer hover:bg-[#1f1f1f] transition-colors border border-[#333]"
                        >
                            <option value="default">Default</option>
                            <option value="low-to-high">Low to High</option>
                            <option value="high-to-low">High to Low</option>
                            <option value="discounted">Discounted</option>
                            <option value="title">Name: A to Z</option>
                            <option value="-title">Name: Z to A</option>
                        </select>
                        <svg className="absolute right-4 top-3.5 w-5 h-5 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </div>
                </div>
            </div>

            {/* Game Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 xl:gap-8">
                {isLoading ? (
                    [...Array(10)].map((_, index) => (
                        <div key={`skeleton-${index}`} className="flex flex-col">
                            <div className="animate-pulse flex flex-col h-full">
                                <div className="relative w-full aspect-square rounded-2xl md:rounded-[2rem] mb-4 bg-[#333]"></div>
                                <div className="flex flex-col px-1 mb-4">
                                    <div className="h-6 bg-[#444] rounded w-3/4 mb-2"></div>
                                    <div className="h-4 bg-[#222] rounded w-1/2"></div>
                                </div>
                                <div className="mt-auto w-full h-[48px] bg-[#333] rounded-xl"></div>
                            </div>
                        </div>
                    ))
                ) : processedGames.length > 0 ? (
                    processedGames.map((product, index) => {
                        const imageUrl = product.images && product.images.length > 0 ? product.images[0].image : null;
                        const originalPrice = parseFloat(product.price);
                        const discountVal = parseFloat(product.discount || 0);
                        const hasDiscount = discountVal > 0;
                        const finalPrice = getFinalPrice(product);
                        const isComingSoon = !product.active;

                        return (
                            <motion.div
                                key={product.id}
                                variants={itemVariants}
                                initial="hidden"
                                animate="visible"
                                style={{ transitionDelay: `${(index % 5) * 50}ms` }}
                                className="flex flex-col group"
                            >
                                <Link to={`/product/${product.id}`} className="block cursor-pointer flex-grow">
                                    
                                    <div className="relative w-full aspect-square rounded-2xl md:rounded-[2rem] flex items-center justify-center mb-4 bg-[#1a1a1a] overflow-hidden">
                                        {imageUrl ? (
                                            <img 
                                                src={imageUrl} 
                                                alt={product.title} 
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                                                No Image
                                            </div>
                                        )}
                                        
                                        {/* Dynamic Tags */}
                                        {hasDiscount && !isComingSoon && (
                                            <div className="absolute top-4 right-4 bg-[#2ecc71] text-black text-xs sm:text-sm font-bold px-3 py-1 rounded-full z-10 shadow-lg">
                                                Sale
                                            </div>
                                        )}
                                        {isComingSoon && (
                                            <div className="absolute top-4 right-4 bg-cyan-400 text-black text-xs sm:text-sm font-bold px-3 py-1 rounded-full z-10 shadow-lg">
                                                Upcoming
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col mb-4 px-1">
                                        <span className="font-extrabold text-white text-lg md:text-xl xl:text-2xl mb-1 group-hover:text-[#2ecc71] transition-colors truncate">
                                            {product.title}
                                        </span>
                                        
                                        {/* Price Logic */}
                                        {isComingSoon ? (
                                            <span className="text-cyan-400 font-bold text-sm md:text-base">Available soon</span>
                                        ) : hasDiscount ? (
                                            <div className="flex items-center gap-2 text-sm md:text-base">
                                                <span className="text-white font-bold">Price:</span>
                                                <span className="text-gray-400 font-bold line-through">{originalPrice} ৳</span>
                                                <span className="text-white font-extrabold">{finalPrice.toFixed(0)} ৳</span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-300 font-bold text-sm md:text-base">Price: {originalPrice} ৳</span>
                                        )}
                                    </div>

                                </Link>

                                <button className="mt-auto w-full py-3.5 bg-[#b0b0b0] hover:bg-[#2ecc71] hover:shadow-[0_0_15px_rgba(46,204,113,0.5)] transition-all duration-300 rounded-xl flex items-center justify-center group cursor-pointer">
                                    <svg className="w-6 h-6 text-black group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </button>
                            </motion.div>
                        );
                    })
                ) : (
                    <div className="col-span-full pt-12 text-center text-gray-400 text-lg md:text-xl font-bold">
                        No products match your current filters.
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {!isLoading && (hasPrev || hasNext) && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center gap-6 mt-16"
                >
                    <button
                        onClick={handlePrevPage}
                        disabled={!hasPrev}
                        className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                            hasPrev 
                                ? 'border-[#2ecc71] text-[#2ecc71] hover:bg-[#2ecc71] hover:text-black cursor-pointer shadow-md hover:shadow-[0_0_15px_rgba(46,204,113,0.5)]' 
                                : 'border-[#333] text-[#555] cursor-not-allowed'
                        }`}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    
                    <div className="text-white font-extrabold text-lg px-4 bg-[#1a1a1a] py-2 rounded-xl border border-[#333]">
                        Page {page}
                    </div>

                    <button
                        onClick={handleNextPage}
                        disabled={!hasNext}
                        className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                            hasNext 
                                ? 'border-[#2ecc71] text-[#2ecc71] hover:bg-[#2ecc71] hover:text-black cursor-pointer shadow-[0_0_10px_rgba(46,204,113,0.3)] hover:shadow-[0_0_20px_rgba(46,204,113,0.6)]' 
                                : 'border-[#333] text-[#555] cursor-not-allowed'
                        }`}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </motion.div>
            )}

        </section>
    );
}