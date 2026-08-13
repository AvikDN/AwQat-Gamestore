import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import authApiClient from "../services/auth-api-client";
import {
  FaKey,
  FaCheckCircle,
  FaExclamationTriangle,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaSignInAlt,
  FaSpinner,
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

const ResetPasswordConfirm = () => {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const newPassword = watch("new_password");

  const onSubmit = async (data) => {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      await authApiClient.post("/auth/users/reset_password_confirm/", {
        uid,
        token,
        new_password: data.new_password,
        re_new_password: data.confirm_password,
      });

      setMessage("Password reset successfully! Redirecting to login...");
      reset();

      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(
        err.response?.data?.new_password?.[0] ||
        err.response?.data?.non_field_errors?.[0] ||
          "Failed to reset password. The link may be invalid or expired."
      );
      console.error(err);
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
              Set New Password
            </h2>
            <p className="text-gray-400 text-sm sm:text-base">
              Create a strong new password for your account
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

          {/* Password Reset Form */}
          <motion.form onSubmit={handleSubmit(onSubmit)} className="space-y-6" variants={itemVariants}>
            
            {/* New Password Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-gray-200 text-sm sm:text-base font-semibold">
                New Password
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  <FaLock />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your new password"
                  {...register("new_password", {
                    required: "New password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                  })}
                  className={`w-full bg-[#121212] border text-white rounded-xl py-3.5 pl-11 pr-12 outline-none transition-colors shadow-inner font-medium placeholder-gray-600 ${
                    errors.new_password ? "border-red-500 focus:border-red-500" : "border-[#333] focus:border-[#2ecc71]"
                  }`}
                  disabled={loading || message}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#2ecc71] transition-colors cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <AnimatePresence>
                {errors.new_password && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-red-400 text-xs mt-1"
                  >
                    {errors.new_password.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Confirm Password Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-gray-200 text-sm sm:text-base font-semibold">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  <FaLock />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm your new password"
                  {...register("confirm_password", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === newPassword || "Passwords do not match",
                  })}
                  className={`w-full bg-[#121212] border text-white rounded-xl py-3.5 pl-11 pr-12 outline-none transition-colors shadow-inner font-medium placeholder-gray-600 ${
                    errors.confirm_password ? "border-red-500 focus:border-red-500" : "border-[#333] focus:border-[#2ecc71]"
                  }`}
                  disabled={loading || message}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#2ecc71] transition-colors cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <AnimatePresence>
                {errors.confirm_password && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-red-400 text-xs mt-1"
                  >
                    {errors.confirm_password.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              type="submit"
              disabled={loading || message}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#2ecc71] hover:bg-[#27ae60] text-black font-extrabold text-lg rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(46,204,113,0.3)] hover:shadow-[0_0_20px_rgba(46,204,113,0.6)] cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <><FaSpinner className="animate-spin" /> Resetting...</>
              ) : (
                <><FaKey /> Reset Password</>
              )}
            </motion.button>
          </motion.form>

          {/* Password Requirements */}
          <motion.div 
            className="bg-[#121212] border border-[#333] rounded-xl p-5 mt-8"
            variants={itemVariants}
          >
            <h4 className="font-bold text-white mb-3 text-sm">
              Password Requirements:
            </h4>
            <ul className="text-sm text-gray-400 space-y-2 font-medium">
              <li className="flex gap-2 items-start"><span className="text-[#2ecc71]">•</span> At least 8 characters long</li>
              <li className="flex gap-2 items-start"><span className="text-[#2ecc71]">•</span> Use a combination of letters, numbers, and symbols</li>
              <li className="flex gap-2 items-start"><span className="text-[#2ecc71]">•</span> Avoid common words or patterns</li>
            </ul>
          </motion.div>

          {/* Security Notice */}
          <motion.div className="mt-8 text-center" variants={itemVariants}>
            <p className="text-xs text-gray-500 font-medium">
              For your security, please choose a strong password that you haven't used before.
            </p>
          </motion.div>

          {/* Redirect Notice */}
          <AnimatePresence>
            {message && (
              <motion.div 
                className="mt-6 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="flex items-center justify-center gap-2 text-sm text-[#2ecc71] font-bold">
                  <FaSignInAlt className="w-4 h-4 animate-bounce" />
                  <span>Redirecting to login page...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </motion.div>
    </div>
  );
};

export default ResetPasswordConfirm;