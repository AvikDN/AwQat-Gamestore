import React from 'react';
import logoImg from '../assets/pics/logo.png'; // Assuming your logo is in the assets folder

export default function Footer() {
  return (
    <footer className="w-full bg-[#0a0a0a] text-white pt-16 pb-8 px-4 md:px-8 xl:px-12 border-t border-white/10">
      <div className="max-w-[1920px] mx-auto">
        
        {/* Main Footer Content */}
        <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-8 mb-12">
          
          {/* Left Column: Navigation & Logo */}
          <div className="flex flex-col gap-6 lg:w-1/3">
            <div className="flex flex-col gap-4">
              <a href="/support" className="text-xl md:text-2xl tracking-wide hover:text-gray-400 transition-colors">Customer support</a>
              <a href="/account" className="text-xl md:text-2xl tracking-wide hover:text-gray-400 transition-colors">Account</a>
              <a href="/privacy" className="text-xl md:text-2xl tracking-wide hover:text-gray-400 transition-colors">Privacy & Policy</a>
            </div>
            
            {/* Logo Area */}
            <div className="flex items-end gap-3 mt-4 lg:mt-8">
              <img 
                src={logoImg} 
                alt="AwQat Logo" 
                className="h-16 md:h-24 w-auto object-contain" 
              />
              <span className="text-5xl md:text-7xl font-black tracking-tight leading-none mb-1">
                AwQat
              </span>
            </div>
          </div>

          {/* Middle Column: Socials */}
          <div className="flex flex-col gap-4 lg:items-center lg:w-1/3 lg:pt-16">
            <span className="text-xl md:text-2xl tracking-wide">Socials :</span>
            <div className="flex items-center gap-4">
              {/* Facebook Icon */}
              <a href="#" aria-label="Facebook" className="hover:text-gray-400 transition-colors">
                <svg className="w-8 h-8 md:w-10 md:h-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
                </svg>
              </a>
              {/* Instagram Icon */}
              <a href="#" aria-label="Instagram" className="hover:text-gray-400 transition-colors">
                <svg className="w-8 h-8 md:w-10 md:h-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 011.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 01-1.153 1.772 4.915 4.915 0 01-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 01-1.772-1.153 4.904 4.904 0 01-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 011.153-1.772A4.897 4.897 0 015.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 100 10 5 5 0 000-10zm0 8.2a3.2 3.2 0 110-6.4 3.2 3.2 0 010 6.4zm5.282-7.25a1.14 1.14 0 11-2.28 0 1.14 1.14 0 012.28 0z" />
                </svg>
              </a>
              {/* Discord Icon */}
              <a href="#" aria-label="Discord" className="hover:text-gray-400 transition-colors">
                <svg className="w-8 h-8 md:w-10 md:h-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Right Column: Review Form */}
          <div className="flex flex-col gap-4 lg:items-end lg:w-1/3 pt-8 lg:pt-0">
            <span className="text-xl md:text-2xl tracking-wide">Leave a review</span>
            <div className="flex flex-col gap-3 w-full max-w-[400px]">
              <textarea 
                className="w-full h-24 md:h-32 bg-[#e5e5e5] text-black p-4 outline-none resize-none"
                placeholder="Write your review here..."
              />
              <div className="flex justify-end">
                <button className="bg-[#b0b0b0] hover:bg-gray-400 text-black font-semibold text-lg px-8 py-2 rounded-xl transition-colors">
                  Send
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Divider and Copyright */}
        <div className="border-t border-gray-600 pt-6 mt-8 flex items-center justify-start">
          <p className="text-gray-400 text-sm md:text-base tracking-wide">
            2026 Reserved by Awqat
          </p>
        </div>

      </div>
    </footer>
  );
}