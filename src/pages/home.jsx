import React from 'react';
import Upcoming from '../components/Home/Upcoming';
import Categories from '../components/Home/Categories';
import bgImage from '../assets/pics/Categories/bg.jpg';
import FeProducts from '../components/Home/FeProducts';
import Offers from '../components/Home/Offers';
import Reviews from '../components/Home/Reviews'; 

const Home = () => {
    return (
       <div 
            className="relative w-full min-h-screen bg-cover bg-center bg-no-repeat overflow-x-hidden"
            style={{ backgroundImage: `url(${bgImage})` }}
        >
            
            <main className="relative z-10 w-full pt-32 pb-16 flex flex-col items-center justify-center">
                <Upcoming />
                
                <div className="mt-8 flex items-center justify-between w-full max-w-100 bg-white/40 backdrop-blur-md border border-white/20 rounded-full px-6 py-3 shadow-lg">
                    <input 
                        type="text" 
                        placeholder="Search" 
                        className="bg-transparent text-gray-800 placeholder-gray-600 outline-none w-full text-lg font-light"
                    />
                    <button type="submit" aria-label="Search">
                        <svg className="w-7 h-7 text-black cursor-pointer" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>
                </div>
                <Categories/>
                <FeProducts />
                <Offers/> 
                <Reviews/> 
            </main>
        </div>
    );
};

export default Home;