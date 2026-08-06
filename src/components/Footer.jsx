import React from 'react';
import logofullImg from '../assets/Awqat_full.png'; 

export default function Footer() {
  return (
    <footer className="w-full bg-[#323232] text-white pt-10 md:pt-12 pb-6 px-6 md:px-12 xl:px-24 border-t border-[#404040]">
      <div className="max-w-[1400px] mx-auto flex flex-col">
        
        {/* Top Row: Links and Review Form */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-10 lg:gap-12">
          
          {/* Links Grid: Stacks tighter on mobile, spreads on desktop */}
          <div className="grid grid-cols-2 gap-x-8 sm:gap-x-16 md:gap-x-24 gap-y-6 text-base sm:text-lg md:text-xl font-bold w-full lg:w-auto">
            <div className="flex flex-col gap-4 md:gap-5">
              <a href="/about" className="hover:text-gray-300 transition-colors">About Us</a>
              <a href="/account" className="hover:text-gray-300 transition-colors">Account</a>
              <a href="/privacy" className="hover:text-gray-300 transition-colors">Privacy & Policy</a>
              <a href="/location" className="hover:text-gray-300 transition-colors">Location</a>
            </div>
            <div className="flex flex-col gap-4 md:gap-5">
              <a href="/faq" className="hover:text-gray-300 transition-colors">FAQ</a>
              <a href="/terms" className="hover:text-gray-300 transition-colors">Terms of service</a>
              <a href="/contact" className="hover:text-gray-300 transition-colors">Contact</a>
              <a href="/products" className="hover:text-gray-300 transition-colors">Products</a>
            </div>
          </div>

          {/* Review Box: Full width on mobile, fixed max-width on desktop */}
          <div className="flex flex-col gap-3 w-full sm:max-w-[320px] mt-4 lg:mt-0">
            <span className="text-xl md:text-2xl font-bold mb-1">Leave a review</span>
            <textarea 
              className="w-full h-16 bg-[#d9d9d9] text-black p-3 rounded-xl outline-none resize-none"
            />
            <button className="self-end bg-[#c7c7c7] hover:bg-[#a0a0a0] transition-colors text-black font-bold text-base md:text-lg px-6 py-1.5 rounded-lg mt-1">
              Send
            </button>
          </div>

        </div>

        {/* Bottom Row: Logo and Socials */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-12 md:mt-16 gap-8">
          
          {/* Logo: Uses standard Tailwind responsive heights and negative margins */}
          <div className="flex items-center">
            <img 
              src={logofullImg} 
              alt="AwQat Logo" 
              className="h-16 sm:h-20 md:h-24 lg:h-32 w-auto object-contain -ml-2 sm:-ml-4 lg:-ml-6" 
            />
          </div>

          {/* Socials: Left aligned on mobile, right aligned on desktop */}
          <div className="flex flex-col items-start md:items-end gap-3 lg:mr-4">
            <span className="text-xl md:text-2xl font-bold">Socials :</span>
            <div className="flex items-center gap-3 sm:gap-4">
              
              <a href="#" aria-label="Facebook" className="hover:opacity-75 transition-opacity">
                <svg className="w-7 h-7 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11h-4v9h-4v-9H5V7h3V5.5C8 3.5 9.5 2 12 2h4v4h-3c-.5 0-1 .5-1 1v4h4l-1 4z"></path>
                </svg>
              </a>
              
              <a href="#" aria-label="Instagram" className="hover:opacity-75 transition-opacity">
                <svg className="w-7 h-7 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              
              <a href="#" aria-label="Discord" className="hover:opacity-75 transition-opacity">
                <svg className="w-8 h-8 md:w-9 md:h-9 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12h.01"></path>
                  <path d="M15 12h.01"></path>
                  <path d="M7.5 4.5L6.5 6"></path>
                  <path d="M16.5 4.5L17.5 6"></path>
                  <path d="M6 6c-3 1.5-4 5-4 9 0 3 2 4.5 2 4.5h16s2-1.5 2-4.5c0-4-1-7.5-4-9-2 0-3 1.5-3 1.5h-6s-1-1.5-3-1.5z"></path>
                </svg>
              </a>

              <a href="#" aria-label="Email" className="hover:opacity-75 transition-opacity">
                <svg className="w-8 h-8 md:w-9 md:h-9 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </a>

            </div>
          </div>

        </div>

        <div className="w-full border-t border-gray-500 pt-5 mt-8 md:mt-6 text-center md:text-left">
          <p className="text-white text-xs sm:text-sm tracking-wide font-bold">
            &copy; 2026 AwQat. All rights reserved.
          </p>
        </div>
        
      </div>
    </footer>
  );
}