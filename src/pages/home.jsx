import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Upcoming from '../components/Home/Upcoming';
import FeCategories from '../components/Home/FeCategories';
import FeProducts from '../components/Home/FeProducts';
import Offers from '../components/Home/Offers';
import Reviews from '../components/Home/Reviews'; 

const Home = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
        }
    };

    return (
        <div className="w-full min-h-screen overflow-x-hidden">
            <main className="w-full pt-32 pb-16 flex flex-col items-center justify-center">
                <Upcoming />
                
                <form 
                    onSubmit={handleSearchSubmit}
                    className="mt-8 flex items-center justify-between w-[90%] sm:w-full max-w-[320px] sm:max-w-md lg:max-w-lg bg-white/40 backdrop-blur-md border border-white/20 rounded-full px-4 py-2.5 sm:px-6 sm:py-3 shadow-lg transition-all focus-within:bg-white/50 focus-within:shadow-xl hover:bg-white/50"
                >
                    <input 
                        type="text" 
                        placeholder="Search games..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent text-gray-900 placeholder-gray-700 outline-none w-full text-base sm:text-lg font-medium pr-3"
                    />
                    <button type="submit" aria-label="Search" className="shrink-0 transition-transform hover:scale-110 active:scale-95">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-black cursor-pointer" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>
                </form>

                <FeCategories/>
                <FeProducts />
                <Offers/> 
                <Reviews/> 
            </main>
        </div>
    );
};

export default Home;