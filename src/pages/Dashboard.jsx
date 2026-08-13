import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { FaEdit, FaSave, FaTimes, FaImage, FaUser } from "react-icons/fa";
import { useAuthContext } from "../contexts/AuthContext";
import authApiClient from "../services/auth-api-client";
import toast from "react-hot-toast";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const Dashboard = () => {
    const { user } = useAuthContext();
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [saving, setSaving] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm();

    const watchedAvatar = watch("avatar");

    useEffect(() => {
        if (watchedAvatar && watchedAvatar.length > 0) {
            const file = watchedAvatar[0];
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setPreviewUrl(null);
        }
    }, [watchedAvatar]);

    const loadProfile = async () => {
        setLoading(true);
        try {
            const res = await authApiClient.get("/auth/users/me/");
            setUserProfile(res.data);
            reset({
                username: res.data.username || "",
                email: res.data.email || "",
                full_name: res.data.profile?.full_name || "",
                phone_number: res.data.profile?.phone_number || "",
                address: res.data.profile?.address || "",
                date_of_birth: res.data.profile?.date_of_birth || "",
                bio: res.data.profile?.bio || "",
                avatar: null,
            });
        } catch (err) {
            console.error("Failed to fetch user:", err);
            toast.error("Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const onSubmit = async (data) => {
        setSaving(true);
        try {
            // Update User details if changed
            if (data.username !== userProfile.username || data.email !== userProfile.email) {
                await authApiClient.patch("/auth/users/me/", {
                    username: data.username,
                    email: data.email,
                });
            }

            // Update Profile details
            const formData = new FormData();
            if (data.full_name !== undefined) formData.append("full_name", data.full_name);
            if (data.phone_number !== undefined) formData.append("phone_number", data.phone_number);
            if (data.address !== undefined) formData.append("address", data.address);
            if (data.bio !== undefined) formData.append("bio", data.bio);
            if (data.date_of_birth !== undefined) formData.append("date_of_birth", data.date_of_birth);

            if (data.avatar && data.avatar.length > 0) {
                formData.append("avatar", data.avatar[0]);
            }

            if (Array.from(formData.keys()).length > 0) {
                await authApiClient.patch("/api/profile/me/", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            }

            toast.success("Profile updated successfully!");
            setEditMode(false);
            loadProfile();
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh] bg-transparent">
                <span className="loading loading-spinner loading-lg text-[#2ecc71]"></span>
            </div>
        );
    }

    if (!userProfile) {
        return (
            <div className="text-center py-8">
                <p className="text-red-500 text-lg font-bold">Profile not found</p>
            </div>
        );
    }

    return (
        <motion.div 
            className="w-full min-h-full text-white flex flex-col items-center justify-start py-4 sm:py-8 px-3 sm:px-6"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <motion.div 
                className="w-full max-w-3xl bg-[#121212]/90 backdrop-blur-md border border-[#333] rounded-2xl sm:rounded-3xl p-4 sm:p-8 md:p-10 shadow-2xl relative"
                variants={itemVariants}
            >
                {/* Header & Edit Button */}
                <motion.div 
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 pb-4 border-b border-[#333]"
                    variants={itemVariants}
                >
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                        My Dashboard
                    </h1>
                    <motion.button
                        onClick={() => {
                            setEditMode(!editMode);
                            if (editMode) reset(); // Reset form if canceling
                        }}
                        className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all duration-300 shadow-md cursor-pointer w-full sm:w-auto ${
                            editMode 
                                ? "bg-red-500/20 border border-red-500 text-red-400 hover:bg-red-500 hover:text-white" 
                                : "bg-[#cccccc] text-black hover:bg-white"
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {editMode ? <><FaTimes /> Cancel</> : <><FaEdit /> Edit Profile</>}
                    </motion.button>
                </motion.div>

                {/* Profile Picture and Names */}
                <motion.div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-8 text-center sm:text-left" variants={itemVariants}>
                    <div className="relative group shrink-0">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-[#2ecc71]/50 bg-[#1a1a1a] flex items-center justify-center overflow-hidden shadow-xl">
                            {previewUrl || userProfile.profile?.avatar ? (
                                <img 
                                    src={previewUrl || userProfile.profile?.avatar} 
                                    alt="Profile" 
                                    className="w-full h-full object-cover" 
                                />
                            ) : (
                                <FaUser className="w-10 h-10 text-gray-400" />
                            )}
                        </div>
                        {editMode && (
                            <label className="absolute -bottom-1 -right-1 bg-[#2ecc71] text-black p-2 rounded-full cursor-pointer shadow-lg hover:bg-[#27ae60] transition-transform hover:scale-110">
                                <FaImage className="w-3.5 h-3.5" />
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    {...register("avatar")}
                                    className="hidden" 
                                />
                            </label>
                        )}
                    </div>
                    <div className="flex flex-col justify-center overflow-hidden w-full">
                        <span className="text-xl sm:text-3xl font-bold text-white tracking-wide truncate">
                            {userProfile.profile?.full_name || userProfile.username || "User"}
                        </span>
                        <span className="text-sm text-gray-400 mt-1 truncate">
                            {userProfile.email}
                        </span>
                    </div>
                </motion.div>

                <AnimatePresence mode="wait">
                    {!editMode ? (
                        /* View Mode */
                        <motion.div 
                            key="view-mode"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6 sm:space-y-8"
                        >
                            {/* Account Info */}
                            <div className="space-y-3 sm:space-y-4">
                                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#2ecc71] tracking-wide">
                                    Account Info:
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                    <div className="flex flex-col gap-1.5">
                                        <span className="text-xs sm:text-sm text-gray-300 font-medium">User Name:</span>
                                        <div className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-3 sm:p-3.5 text-sm sm:text-base text-white shadow-inner truncate">
                                            {userProfile.username}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <span className="text-xs sm:text-sm text-gray-300 font-medium">Email:</span>
                                        <div className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-3 sm:p-3.5 text-sm sm:text-base text-white shadow-inner truncate">
                                            {userProfile.email}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Personal Detail */}
                            <div className="space-y-3 sm:space-y-4">
                                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#2ecc71] tracking-wide">
                                    Personal Detail:
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                    <div className="flex flex-col gap-1.5">
                                        <span className="text-xs sm:text-sm text-gray-300 font-medium">Full Name:</span>
                                        <div className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-3 sm:p-3.5 text-sm sm:text-base text-white shadow-inner truncate">
                                            {userProfile.profile?.full_name || "Not set"}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <span className="text-xs sm:text-sm text-gray-300 font-medium">Phone Number:</span>
                                        <div className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-3 sm:p-3.5 text-sm sm:text-base text-white shadow-inner truncate">
                                            {userProfile.profile?.phone_number || "Not set"}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                                        <span className="text-xs sm:text-sm text-gray-300 font-medium">Address:</span>
                                        <div className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-3 sm:p-3.5 text-sm sm:text-base text-white shadow-inner truncate">
                                            {userProfile.profile?.address || "Not set"}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                                        <span className="text-xs sm:text-sm text-gray-300 font-medium">Date of Birth:</span>
                                        <div className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-3 sm:p-3.5 text-sm sm:text-base text-white shadow-inner sm:max-w-sm truncate">
                                            {userProfile.profile?.date_of_birth || "Not set"}
                                        </div>
                                    </div>
                                    {userProfile.profile?.bio && (
                                        <div className="flex flex-col gap-1.5 sm:col-span-2">
                                            <span className="text-xs sm:text-sm text-gray-300 font-medium">Bio:</span>
                                            <div className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-3 sm:p-3.5 text-sm sm:text-base text-white shadow-inner whitespace-pre-wrap">
                                                {userProfile.profile.bio}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        /* Edit Mode Form */
                        <motion.form 
                            key="edit-mode"
                            onSubmit={handleSubmit(onSubmit)}
                            className="space-y-6"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="space-y-4">
                                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#2ecc71] tracking-wide">
                                    Account Info:
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs sm:text-sm text-gray-300 font-medium">Username:</label>
                                        <input 
                                            type="text" 
                                            {...register("username", { required: "Username is required" })}
                                            className={`w-full bg-[#1a1a1a] border rounded-xl p-3 sm:p-3.5 text-sm sm:text-base text-white outline-none shadow-inner transition-colors ${errors.username ? "border-red-500 focus:border-red-500" : "border-[#333] focus:border-[#2ecc71]"}`}
                                        />
                                        {errors.username && <span className="text-red-400 text-xs">{errors.username.message}</span>}
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs sm:text-sm text-gray-300 font-medium">Email:</label>
                                        <input 
                                            type="email" 
                                            {...register("email", { 
                                                required: "Email is required",
                                                pattern: { value: /^\S+@\S+$/i, message: "Invalid email" }
                                            })}
                                            className={`w-full bg-[#1a1a1a] border rounded-xl p-3 sm:p-3.5 text-sm sm:text-base text-white outline-none shadow-inner transition-colors ${errors.email ? "border-red-500 focus:border-red-500" : "border-[#333] focus:border-[#2ecc71]"}`}
                                        />
                                        {errors.email && <span className="text-red-400 text-xs">{errors.email.message}</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#2ecc71] tracking-wide">
                                    Personal Detail:
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs sm:text-sm text-gray-300 font-medium">Full Name:</label>
                                        <input 
                                            type="text" 
                                            {...register("full_name")}
                                            className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-3 sm:p-3.5 text-sm sm:text-base text-white focus:border-[#2ecc71] outline-none shadow-inner transition-colors"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs sm:text-sm text-gray-300 font-medium">Phone Number:</label>
                                        <input 
                                            type="text" 
                                            {...register("phone_number")}
                                            className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-3 sm:p-3.5 text-sm sm:text-base text-white focus:border-[#2ecc71] outline-none shadow-inner transition-colors"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                                        <label className="text-xs sm:text-sm text-gray-300 font-medium">Address:</label>
                                        <input 
                                            type="text" 
                                            {...register("address")}
                                            className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-3 sm:p-3.5 text-sm sm:text-base text-white focus:border-[#2ecc71] outline-none shadow-inner transition-colors"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                                        <label className="text-xs sm:text-sm text-gray-300 font-medium">Date of Birth:</label>
                                        <input 
                                            type="date" 
                                            {...register("date_of_birth")}
                                            className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-3 sm:p-3.5 text-sm sm:text-base text-white focus:border-[#2ecc71] outline-none shadow-inner sm:max-w-sm transition-colors"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                                        <label className="text-xs sm:text-sm text-gray-300 font-medium">Bio:</label>
                                        <textarea 
                                            {...register("bio")}
                                            rows="4"
                                            className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-3 sm:p-3.5 text-sm sm:text-base text-white focus:border-[#2ecc71] outline-none shadow-inner transition-colors resize-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <motion.button
                                type="submit"
                                disabled={saving}
                                className="w-full sm:w-auto mt-6 px-8 py-3 bg-[#cccccc] hover:bg-white text-black font-bold text-lg rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <FaSave /> {saving ? "Saving..." : "Save Changes"}
                            </motion.button>
                        </motion.form>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
};

export default Dashboard;