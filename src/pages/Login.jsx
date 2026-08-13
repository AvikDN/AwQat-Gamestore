import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEye, FaEyeSlash, FaSpinner, FaExclamationCircle, FaCheckCircle } from 'react-icons/fa';
import { useAuthContext } from '../contexts/AuthContext'; 
import logoImg from '../assets/Welcome_Awqat_full.png';

const containerVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.15, duration: 0.6 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const buttonVariants = {
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
};

export default function Login() {
  const { loginUser } = useAuthContext();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm();

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data) => {
    clearErrors();
    setLoading(true);
    setSuccessMsg("");

    try {
      const res = await loginUser(data);

      if (res.success) {
        setSuccessMsg("Login successful! Redirecting...");
        setTimeout(() => navigate("/"), 1000);
      } else if (res.fieldErrors?.detail) {
        setError("general", {
          type: "server",
          message: res.fieldErrors.detail,
        });
      } else {
        setError("general", {
          type: "server",
          message: "Login failed. Please check your credentials.",
        });
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("general", {
        type: "server",
        message: "Server error. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="min-h-screen flex items-center justify-center font-sans px-4 pt-32 pb-16 md:py-24"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div 
        className="bg-[#5c5c5c] p-6 sm:p-8 md:p-12 w-full max-w-[500px] flex flex-col items-center shadow-2xl relative rounded-2xl md:rounded-none"
        style={{ 
          // Applies the controller polygon cut-out strictly on medium screens and up to prevent mobile squishing
          clipPath: window.innerWidth >= 768 ? 'polygon(0 20px, 20px 0, 20% 0, 28% 20px, 72% 20px, 80% 0, calc(100% - 20px) 0, 100% 20px, 100% calc(100% - 20px), calc(100% - 20px) 100%, 75% 100%, 65% calc(100% - 70px), 35% calc(100% - 70px), 25% 100%, 20px 100%, 0 calc(100% - 20px))' : 'none',
          paddingBottom: window.innerWidth >= 768 ? '100px' : '2.5rem'
        }}
        variants={itemVariants}
      >
        
       {/* Header with inline Logo */}
<motion.div className="flex items-center justify-center gap-0 mb-8 mt-4" variants={itemVariants}>
  
  <img 
    src={logoImg} 
    alt="AwQat Logo" 
    className="h-10 md:h-14 w-auto object-contain" 
  />
</motion.div>

        {/* General Error Message */}
        <AnimatePresence>
          {errors.general && (
            <motion.div
              className="w-full bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-md mb-6 flex items-center gap-3 text-sm"
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3 }}
            >
              <FaExclamationCircle className="text-lg shrink-0" />
              <span>{errors.general.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Message */}
        <AnimatePresence>
          {successMsg && (
            <motion.div
              className="w-full bg-[#2ecc71]/10 border border-[#2ecc71]/50 text-[#2ecc71] px-4 py-3 rounded-md mb-6 flex items-center gap-3 text-sm"
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3 }}
            >
              <FaCheckCircle className="text-lg shrink-0" />
              <span>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.form 
          onSubmit={handleSubmit(onSubmit)} 
          className="w-full flex flex-col gap-4"
          variants={containerVariants}
        >
          {/* Email/Username */}
          <motion.div className="flex flex-col gap-1" variants={itemVariants}>
            <label className="text-gray-200 text-sm md:text-base font-medium">
              Email/Username:
            </label>
            <input 
              type="email" 
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address"
                },
                onChange: () => clearErrors("general"),
              })}
              className={`w-full bg-[#1a1a1a] border text-white rounded-md p-2.5 outline-none transition-colors shadow-inner ${
                errors.email 
                  ? "border-red-500 focus:border-red-500" 
                  : "border-gray-400 focus:border-[#2ecc71]"
              }`}
              disabled={loading}
            />
            <AnimatePresence>
              {errors.email && (
                <motion.span 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-red-400 text-xs mt-1"
                >
                  {errors.email.message}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Password */}
          <motion.div className="flex flex-col gap-1" variants={itemVariants}>
            <label className="text-gray-200 text-sm md:text-base font-medium">
              Password:
            </label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                {...register("password", {
                  required: "Password is required",
                  onChange: () => clearErrors("general"),
                })}
                className={`w-full bg-[#1a1a1a] border text-white rounded-md p-2.5 pr-12 outline-none transition-colors shadow-inner ${
                  errors.password 
                    ? "border-red-500 focus:border-red-500" 
                    : "border-gray-400 focus:border-[#2ecc71]"
                }`}
                disabled={loading}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
            
            <AnimatePresence>
              {errors.password && (
                <motion.span 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-red-400 text-xs mt-1"
                >
                  {errors.password.message}
                </motion.span>
              )}
            </AnimatePresence>

            <div className="flex justify-end mt-1">
              <Link 
                to="/reset-password" 
                className="text-gray-300 hover:text-white text-xs transition-colors focus:outline-none focus:text-white"
              >
                Forgot Password?
              </Link>
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.button 
            type="submit" 
            disabled={loading}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            className="w-full bg-[#cccccc] hover:bg-white text-black font-bold text-lg rounded-md py-2.5 mt-4 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-md cursor-pointer"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" /> Logging in...
              </>
            ) : (
              "Login"
            )}
          </motion.button>
        </motion.form>

        <motion.div 
          className="mt-6 text-gray-300 text-sm md:text-base font-medium text-center"
          variants={itemVariants}
        >
          New to AwQat?{' '}
          <Link to="/register" className="font-bold text-white hover:underline transition-all focus:outline-none focus:underline">
            Sign-up
          </Link>
        </motion.div>

      </motion.div>
    </motion.div>
  );
}