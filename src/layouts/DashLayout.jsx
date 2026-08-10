import React from 'react';
import { Outlet } from 'react-router';
import Sidebar from '../components/Sidebar';
import DashboardFooter from '../components/Dashfooter';

const DashLayout = () => {
    return (
        <div className="min-h-screen flex bg-black text-white">
            {/* Sidebar fixed or persistent on the left */}
            <Sidebar />

            {/* Main content area containing top content and the small footer */}
            <div className="flex-1 flex flex-col min-w-0">
                <main className="flex-1 p-6 md:p-8 lg:p-12 overflow-y-auto">
                    <Outlet />
                </main>

                <DashboardFooter />
            </div>
        </div>
    );
};

export default DashLayout;