import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaEye, 
  FaEyeSlash, 
  FaSpinner, 
  FaExclamationCircle
} from 'react-icons/fa';
import { useAuthContext } from '../contexts/AuthContext'; 
import logoImg from '../assets/Join_Awqat.png'; 

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

export default function Register() {
  const { registerUser } = useAuthContext();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    watch,
    formState: { errors },
  } = useForm();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Watch password to validate confirm password
  const password = watch("password");

  const onSubmit = async (data) => {
    clearErrors();
    setLoading(true);

    // Djoser backend expects 're_password' to match 'password'
    const payload = {
      email: data.email,
      username: data.username,
      password: data.password,
      re_password: data.confirmPassword 
    };

    try {
      const result = await registerUser(payload);

      if (result.success) {
        // Send straight to login
        navigate('/login');
      } else {
        let generalErrorSet = false;

        // Safely extract field-specific errors
        if (result.fieldErrors && typeof result.fieldErrors === "object") {
          for (const [field, messages] of Object.entries(result.fieldErrors)) {
            let errorText = "Invalid input.";
            
            if (Array.isArray(messages)) {
              errorText = typeof messages[0] === 'string' ? messages[0] : JSON.stringify(messages[0]);
            } else if (typeof messages === "string") {
              errorText = messages;
            }

            // Map backend "re_password" to frontend "confirmPassword"
            const uiField = field === "re_password" ? "confirmPassword" : field;

            if (["email", "username", "password", "confirmPassword"].includes(uiField)) {
              setError(uiField, { type: "server", message: String(errorText) });
            } else {
              setError("general", { type: "server", message: String(errorText) });
              generalErrorSet = true;
            }
          }
        } 
        
        // Safely extract general message errors
        if (!generalErrorSet && result.message) {
          let errorText = "Registration failed. Please try again.";
          
          if (typeof result.message === "string") {
            errorText = result.message;
          } else if (typeof result.message === "object") {
            const firstKey = Object.keys(result.message)[0];
            if (firstKey && Array.isArray(result.message[firstKey])) {
              errorText = result.message[firstKey][0];
            } else if (firstKey && typeof result.message[firstKey] === "string") {
              errorText = result.message[firstKey];
            }
          }
          
          setError("general", { type: "server", message: String(errorText) });
          generalErrorSet = true;
        } 
        
        // Fallback if no specific error format was found
        if (!generalErrorSet && !result.fieldErrors) {
          setError("general", {
            type: "server",
            message: "Registration failed. Please try again.",
          });
        }
      }
    } catch (err) {
      console.error("Registration error:", err);
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
      className="min-h-screen flex items-center justify-center bg-transparent font-sans px-4 pt-24 pb-12 overflow-x-hidden"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div 
        className="bg-[#5c5c5c] p-6 sm:p-8 md:p-12 w-full max-w-[500px] flex flex-col items-center shadow-2xl relative my-auto rounded-3xl md:rounded-none"
        style={{ 
          clipPath: 'polygon(0 20px, 20px 0, 20% 0, 28% 20px, 72% 20px, 80% 0, calc(100% - 20px) 0, 100% 20px, 100% calc(100% - 20px), calc(100% - 20px) 100%, 75% 100%, 65% calc(100% - 70px), 35% calc(100% - 70px), 25% 100%, 20px 100%, 0 calc(100% - 20px))',
          paddingBottom: '90px'
        }}
        variants={itemVariants}
      >
        
        {/* Header with Centered Logo */}
        <motion.div className="w-full flex items-center justify-center mt-4 sm:mt-6 mb-6 sm:mb-8" variants={itemVariants}>
          <img 
            src={logoImg} 
            alt="AwQat Logo" 
            className="h-14 sm:h-16 md:h-20 w-auto object-contain mx-auto" 
          />
        </motion.div>

        {/* General Error Message */}
        <AnimatePresence>
          {errors.general && (
            <motion.div
              className="w-full bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-md mb-6 flex items-start gap-3 text-sm"
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3 }}
            >
              <FaExclamationCircle className="text-lg shrink-0 mt-0.5" />
              <span>{errors.general.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.form 
          onSubmit={handleSubmit(onSubmit)} 
          className="w-full flex flex-col gap-4"
          variants={containerVariants}
        >
          {/* Email */}
          <motion.div className="flex flex-col gap-1.5" variants={itemVariants}>
            <label className="text-gray-200 text-sm md:text-base font-medium">Email:</label>
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
              className={`w-full bg-[#1a1a1a] border text-white rounded-md p-3 text-sm sm:text-base outline-none transition-colors shadow-inner ${
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

          {/* Username */}
          <motion.div className="flex flex-col gap-1.5" variants={itemVariants}>
            <label className="text-gray-200 text-sm md:text-base font-medium">Username:</label>
            <input 
              type="text" 
              {...register("username", {
                required: "Username is required",
                pattern: {
                  value: /^[\w.@+-]+$/,
                  message: "Only letters, numbers, and @/./+/-/_ are allowed",
                },
                minLength: {
                  value: 3,
                  message: "Minimum 3 characters required",
                },
                onChange: () => clearErrors("general"),
              })}
              className={`w-full bg-[#1a1a1a] border text-white rounded-md p-3 text-sm sm:text-base outline-none transition-colors shadow-inner ${
                errors.username 
                  ? "border-red-500 focus:border-red-500" 
                  : "border-gray-400 focus:border-[#2ecc71]"
              }`}
              disabled={loading}
            />
            <AnimatePresence>
              {errors.username && (
                <motion.span 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-red-400 text-xs mt-1"
                >
                  {errors.username.message}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Password */}
          <motion.div className="flex flex-col gap-1.5" variants={itemVariants}>
            <label className="text-gray-200 text-sm md:text-base font-medium">Password:</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Minimum 8 characters required",
                  },
                  onChange: () => clearErrors("general"),
                })}
                className={`w-full bg-[#1a1a1a] border text-white rounded-md p-3 pr-12 text-sm sm:text-base outline-none transition-colors shadow-inner ${
                  errors.password 
                    ? "border-red-500 focus:border-red-500" 
                    : "border-gray-400 focus:border-[#2ecc71]"
                }`}
                disabled={loading}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#2ecc71] transition-colors cursor-pointer"
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
          </motion.div>

          {/* Confirm Password */}
          <motion.div className="flex flex-col gap-1.5" variants={itemVariants}>
            <label className="text-gray-200 text-sm md:text-base font-medium">Confirm Password:</label>
            <div className="relative">
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) => value === password || "Passwords do not match",
                  onChange: () => clearErrors("general"),
                })}
                className={`w-full bg-[#1a1a1a] border text-white rounded-md p-3 pr-12 text-sm sm:text-base outline-none transition-colors shadow-inner ${
                  errors.confirmPassword 
                    ? "border-red-500 focus:border-red-500" 
                    : "border-gray-400 focus:border-[#2ecc71]"
                }`}
                disabled={loading}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#2ecc71] transition-colors cursor-pointer"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
            <AnimatePresence>
              {errors.confirmPassword && (
                <motion.span 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-red-400 text-xs mt-1"
                >
                  {errors.confirmPassword.message}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Submit Button */}
          <motion.button 
            type="submit" 
            disabled={loading}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            className="w-full bg-[#cccccc] hover:bg-white text-black font-bold text-base sm:text-lg rounded-md py-3 mt-4 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-md cursor-pointer"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" /> Registering...
              </>
            ) : (
              "Register"
            )}
          </motion.button>
        </motion.form>

        <motion.div 
          className="mt-6 text-center space-y-3"
          variants={itemVariants}
        >
          <div className="text-gray-200 text-sm md:text-base">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-white hover:underline transition-all focus:outline-none">
              Login
            </Link>
          </div>
        </motion.div>

      </motion.div>
    </motion.div>
  );
}