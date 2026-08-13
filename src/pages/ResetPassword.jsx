import { useForm } from "react-hook-form";
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import authApiClient from "../services/auth-api-client";
import {
  FaEnvelope,
  FaPaperPlane,
  FaCheckCircle,
  FaExclamationTriangle,
  FaArrowLeft,
  FaKey,
  FaSpinner
} from "react-icons/fa";

const containerVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
      staggerChildren: 0.1,
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

const ResetPassword = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (data) => {
    setLoading(true);
    setMessage("");
    setError("");
    try {
      await authApiClient.post("/auth/users/reset_password/", data);
      setMessage("Password reset instructions have been sent to your email!");
      reset();
    } catch (err) {
      setError(
        err.response?.data?.email?.[0] ||
        err.response?.data?.detail ||
          "Failed to send password reset email. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent px-4 pt-32 pb-12 font-sans overflow-hidden">
      <motion.div 
        className="w-full max-w-md bg-[#1a1a1a] border border-[#333] rounded-3xl shadow-2xl overflow-hidden relative"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Decorative Top Glow */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-[#2ecc71]"></div>

        <div className="p-8 sm:p-10 flex flex-col">
          
          {/* Header */}
          <motion.div className="text-center mb-8" variants={itemVariants}>
            <div className="flex justify-center mb-5">
              <div className="w-20 h-20 bg-[#2ecc71]/10 border-2 border-[#2ecc71]/30 rounded-full flex items-center justify-center text-[#2ecc71] shadow-[0_0_15px_rgba(46,204,113,0.15)]">
                <FaKey className="text-3xl" />
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight">
              Reset Password
            </h2>
            <p className="text-gray-400 text-sm sm:text-base">
              Enter your email address to receive password reset instructions
            </p>
          </motion.div>

          {/* Messages */}
          <AnimatePresence mode="wait">
            {message && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="w-full bg-[#2ecc71]/10 border border-[#2ecc71]/30 text-[#2ecc71] px-4 py-3.5 rounded-xl flex items-start gap-3 text-sm font-medium shadow-inner overflow-hidden"
              >
                <FaCheckCircle className="text-lg shrink-0 mt-0.5" />
                <span>{message}</span>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="w-full bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-3.5 rounded-xl flex items-start gap-3 text-sm font-medium shadow-inner overflow-hidden"
              >
                <FaExclamationTriangle className="text-lg shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reset Password Form */}
          <motion.form onSubmit={handleSubmit(onSubmit)} className="space-y-6" variants={itemVariants}>
            <div className="flex flex-col gap-1.5">
              <label className="text-gray-200 text-sm sm:text-base font-semibold">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  <FaEnvelope />
                </span>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Please enter a valid email address",
                    },
                  })}
                  className={`w-full bg-[#121212] border text-white rounded-xl py-3.5 pl-11 pr-4 outline-none transition-colors shadow-inner font-medium placeholder-gray-600 ${
                    errors.email ? "border-red-500 focus:border-red-500" : "border-[#333] focus:border-[#2ecc71]"
                  }`}
                  disabled={loading}
                />
              </div>
              <AnimatePresence>
                {errors.email && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-red-400 text-xs mt-1"
                  >
                    {errors.email.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#2ecc71] hover:bg-[#27ae60] text-black font-extrabold text-lg rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(46,204,113,0.3)] hover:shadow-[0_0_20px_rgba(46,204,113,0.6)] cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><FaSpinner className="animate-spin" /> Sending...</>
              ) : (
                <><FaPaperPlane /> Send Reset Instructions</>
              )}
            </motion.button>
          </motion.form>

          {/* Additional Information */}
          <motion.div 
            className="bg-[#121212] border border-[#333] rounded-xl p-5 mt-8"
            variants={itemVariants}
          >
            <h3 className="font-bold text-white mb-3 text-sm">
              What to expect:
            </h3>
            <ul className="text-sm text-gray-400 space-y-2 font-medium">
              <li className="flex gap-2 items-start"><span className="text-[#2ecc71]">•</span> Check your inbox for a password reset link</li>
              <li className="flex gap-2 items-start"><span className="text-[#2ecc71]">•</span> The link will expire for security reasons</li>
              <li className="flex gap-2 items-start"><span className="text-[#2ecc71]">•</span> If you don't see the email, check your spam folder</li>
            </ul>
          </motion.div>

          {/* Links Section */}
          <motion.div className="space-y-4 mt-8 pt-6 border-t border-[#333]" variants={itemVariants}>
            <div className="text-center">
              <Link
                to="/login"
                className="text-gray-400 hover:text-[#2ecc71] font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer w-max mx-auto"
              >
                <FaArrowLeft className="w-3.5 h-3.5" />
                Back to Login
              </Link>
            </div>

            <div className="text-center">
              <p className="text-gray-400 text-sm font-medium">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-[#2ecc71] hover:text-white font-extrabold transition-colors cursor-pointer"
                >
                  Create Account
                </Link>
              </p>
            </div>
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;