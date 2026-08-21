import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaExclamationTriangle, FaArrowRight } from 'react-icons/fa';

const PaymentFailed = () => {
  const [countdown, setCountdown] = useState(7);
  const navigate = useNavigate();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      navigate('/dashboard/history');
    }
  }, [countdown, navigate]);

  return (
    <div className="min-h-screen font-sans flex items-center justify-center p-4 text-white">
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
        className="max-w-md w-full bg-[#1c1c1c] border border-[#2a2a2a] rounded-[2rem] shadow-2xl p-8 text-center relative overflow-hidden"
      >
        {/* Glow Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-2 bg-amber-500 blur-xl opacity-50"></div>

        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              <FaExclamationTriangle className="w-10 h-10 text-amber-500" />
            </div>
            <motion.div 
              animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-full border-2 border-amber-500/40" 
            />
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
          Payment Failed
        </h1>

        <p className="text-gray-400 text-sm mb-6">
          Your payment was unsuccessful. Please check your payment details or try again.
        </p>

        <div className="bg-[#121212] border border-[#2a2a2a] rounded-xl p-3.5 mb-6">
          <p className="text-amber-400 text-xs font-semibold">
            Redirecting in <span className="font-bold text-white">{countdown}</span> seconds
          </p>
        </div>

        <Link
          to="/dashboard/history"
          className="w-full bg-[#2a2a2a] hover:bg-[#333] border border-[#444] text-white font-extrabold rounded-xl py-3.5 px-6 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg cursor-pointer group"
        >
          <span>Go to Order History</span>
          <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
        </Link>

        <p className="text-gray-500 text-xs mt-6">
          Need assistance?{" "}
          <a href="/contact" className="text-[#2ecc71] hover:underline font-medium">
            Contact support
          </a>
        </p>
      </motion.div>
    </div>
  );
};

export default PaymentFailed;