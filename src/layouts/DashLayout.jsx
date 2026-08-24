import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import DashboardFooter from '../components/Dashfooter';
import bgImage from '../assets/pics/BGs/AwBG.png';
import logoImg from '../assets/Awqat_full.png';

const DashLayout = () => {
    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-black text-white">
            {/* Mobile Top Header with Logo (Absolute/Static on top, does not scroll with content) */}
            <header className="md:hidden flex items-center justify-center px-4 py-3 bg-[#121212] border-b border-[#222] z-40">
                <Link to="/" className="flex items-center">
                    <img src={logoImg} alt="AwQat Logo" className="h-7 object-contain" />
                </Link>
            </header>

            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
                {/* Main content area with background image and dark overlay */}
                <main 
                    className="flex-1 p-4 sm:p-6 md:p-8 lg:p-12 overflow-y-auto relative bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${bgImage})` }}
                >
                    {/* Optional dark overlay to ensure readability over the background image */}
                    <div className="absolute inset-0 pointer-events-none z-0"></div>

                    {/* Content wrapper to keep outlet above the overlay */}
                    <div className="relative z-10">
                        <Outlet />
                    </div>
                </main>

                {/* Dashboard footer hidden on mobile devices */}
                <div className="hidden md:block">
                    <DashboardFooter />
                </div>
            </div>
        </div>
    );
};

export default DashLayout;