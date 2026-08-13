import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import authApiClient from "../services/auth-api-client";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaSignInAlt,
  FaEnvelope,
  FaHome
} from "react-icons/fa";

const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.4, ease: "easeOut" } 
  },
};

const iconVariants = {
  initial: { scale: 0, rotate: -90 },
  animate: { 
    scale: 1, 
    rotate: 0,
    transition: { type: "spring", stiffness: 200, damping: 15 }
  }
};

const ActivationPage = () => {
  const { uid, token } = useParams();
  const [status, setStatus] = useState("loading"); // "loading", "success", "error"
  const [message, setMessage] = useState("");

  useEffect(() => {
    const activateAccount = async () => {
      try {
        await authApiClient.post("/auth/users/activation/", {
          uid,
          token,
        });
        setStatus("success");
        setMessage("Account activated successfully! You can now log in to your AwQat account.");
      } catch (err) {
        setStatus("error");
        setMessage("Activation failed. The link may be invalid, already used, or expired.");
      }
    };

    activateAccount();
  }, [uid, token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent px-4 pt-32 pb-12 font-sans overflow-hidden">
      <motion.div 
        className="w-full max-w-md bg-[#1a1a1a] border border-[#333] rounded-3xl shadow-2xl overflow-hidden relative"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Decorative Top Glow */}
        <div className={`absolute top-0 left-0 w-full h-1.5 ${
          status === 'loading' ? 'bg-cyan-500' : 
          status === 'success' ? 'bg-[#2ecc71]' : 'bg-red-500'
        }`}></div>

        <div className="p-8 sm:p-10 flex flex-col items-center text-center">
          
          {/* Status Icon */}
          <motion.div 
            className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 border-4 ${
              status === "loading"
                ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-500"
                : status === "success"
                ? "bg-[#2ecc71]/10 border-[#2ecc71]/30 text-[#2ecc71]"
                : "bg-red-500/10 border-red-500/30 text-red-500"
            }`}
            variants={iconVariants}
            initial="initial"
            animate="animate"
            key={status}
          >
            {status === "loading" ? (
              <FaSpinner className="text-4xl animate-spin" />
            ) : status === "success" ? (
              <FaCheckCircle className="text-5xl" />
            ) : (
              <FaTimesCircle className="text-5xl" />
            )}
          </motion.div>

          {/* Title */}
          <motion.h2 
            className="text-2xl sm:text-3xl font-extrabold text-white mb-4 tracking-tight"
            variants={itemVariants}
          >
            {status === "loading"
              ? "Activating Account"
              : status === "success"
              ? "Activation Successful!"
              : "Activation Failed"}
          </motion.h2>

          {/* Message */}
          <motion.p 
            className="text-gray-400 text-sm sm:text-base mb-8 leading-relaxed px-2"
            variants={itemVariants}
          >
            {status === "loading"
              ? "Please wait a moment while we securely activate your account..."
              : message}
          </motion.p>

          {/* Action Buttons */}
          <motion.div className="w-full flex flex-col gap-3" variants={itemVariants}>
            <AnimatePresence mode="wait">
              {status === "success" && (
                <motion.div
                  key="success-btn"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Link 
                    to="/login" 
                    className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#2ecc71] hover:bg-[#27ae60] text-black font-extrabold rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(46,204,113,0.3)] hover:shadow-[0_0_20px_rgba(46,204,113,0.6)] cursor-pointer"
                  >
                    <FaSignInAlt /> Go to Login
                  </Link>
                </motion.div>
              )}

              {status === "error" && (
                <motion.div
                  key="error-btns"
                  className="flex flex-col gap-3 w-full"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Link 
                    to="/resend-activation" 
                    className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#333] hover:bg-[#444] text-white font-bold rounded-xl transition-all duration-300 border border-[#444] hover:border-gray-400 cursor-pointer"
                  >
                    <FaEnvelope /> Resend Activation Email
                  </Link>
                  <Link 
                    to="/" 
                    className="flex items-center justify-center gap-2 w-full py-3 text-gray-400 hover:text-white font-semibold transition-colors cursor-pointer"
                  >
                    <FaHome /> Return to Home
                  </Link>
                </motion.div>
              )}

              {status === "loading" && (
                <motion.div
                  key="loading-indicator"
                  className="w-full flex flex-col items-center py-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="flex gap-1.5 mb-3">
                    <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-2.5 h-2.5 bg-[#2ecc71] rounded-full"></motion.div>
                    <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2.5 h-2.5 bg-[#2ecc71] rounded-full"></motion.div>
                    <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2.5 h-2.5 bg-[#2ecc71] rounded-full"></motion.div>
                  </div>
                  <p className="text-xs text-gray-500 font-medium tracking-widest uppercase">Processing</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
};

export default ActivationPage;