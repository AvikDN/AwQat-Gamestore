import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { FaEdit, FaSave, FaTimes, FaImage, FaUser, FaIdCard } from "react-icons/fa";
import { useAuthContext } from "../contexts/AuthContext";
import authApiClient from "../services/auth-api-client";
import toast, { Toaster } from "react-hot-toast";

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
                full_name: res.data.profile?.full_name || "",
                phone_number: res.data.profile?.phone_number || "",
                address: res.data.profile?.address || "",
                date_of_birth: res.data.profile?.date_of_birth || "",
                bio: res.data.profile?.bio || "",
                avatar: null,
            });
        } catch (err) {
            console.error("Failed to fetch user:", err);
            toast.error("Failed to load profile.");
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
        const toastId = toast.loading("Updating profile...");

        try {
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

            toast.success("Profile updated successfully!", { id: toastId });
            setEditMode(false);
            loadProfile();
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Failed to update profile.", { id: toastId });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="w-full min-h-screen bg-transparent text-white font-sans p-3 sm:p-6 lg:p-8 flex justify-center items-start select-none">
            <Toaster 
                position="top-center"
                toastOptions={{
                    style: {
                        background: '#1a1a1a',
                        color: '#ffffff',
                        border: '1px solid #333333',
                        borderRadius: '12px',
                        fontSize: '13px',
                        fontWeight: '600',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)'
                    },
                    success: { iconTheme: { primary: '#2ecc71', secondary: '#1a1a1a' } },
                    error: { iconTheme: { primary: '#ef4444', secondary: '#1a1a1a' } },
                    loading: { iconTheme: { primary: '#2ecc71', secondary: '#1a1a1a' } }
                }}
            />

            <div className="w-full max-w-[1600px] mx-auto space-y-4 sm:space-y-6 md:space-y-8 relative pt-2 sm:pt-4 md:pt-8">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-4 sm:space-y-6 md:space-y-8"
                >
                    {/* Floating Header matching DashCategories and DashGames */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222222] pb-4 sm:pb-5">
                        <div className="flex items-center gap-3">
                            <FaIdCard className="text-2xl sm:text-4xl text-white shrink-0" />
                            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                                My Profile
                            </h1>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => {
                                setEditMode(!editMode);
                                if (editMode) reset(); 
                            }}
                            className={`px-4 sm:px-5 py-2.5 font-extrabold rounded-xl border flex items-center justify-center gap-2 text-xs sm:text-sm transition-all shadow-md shrink-0 cursor-pointer group ${
                                editMode 
                                    ? 'bg-[#333] hover:bg-[#ff6b6b] text-gray-200 hover:text-black border-[#444] hover:border-[#ff6b6b]'
                                    : 'bg-[#1c1c1c] hover:bg-[#2ecc71] text-gray-200 hover:text-black border-[#2a2a2a] hover:border-[#2ecc71]'
                            }`}
                        >
                            {editMode ? (
                                <>
                                    <FaTimes className="text-xs text-gray-300 group-hover:text-black transition-colors" />
                                    <span>Cancel</span>
                                </>
                            ) : (
                                <>
                                    <FaEdit className="text-xs text-gray-300 group-hover:text-black transition-colors" />
                                    <span>Edit Profile</span>
                                </>
                            )}
                        </motion.button>
                    </div>

                    {loading ? (
                        /* Skeleton Loading State */
                        <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-2xl p-6 sm:p-8 shadow-lg space-y-6">
                            <div className="animate-pulse flex flex-col sm:flex-row items-center gap-4">
                                <div className="w-20 h-20 rounded-full bg-[#2a2a2a]"></div>
                                <div className="space-y-2 flex-1 w-full sm:w-auto text-center sm:text-left">
                                    <div className="h-6 bg-[#2a2a2a] rounded w-48 mx-auto sm:mx-0"></div>
                                    <div className="h-4 bg-[#2a2a2a] rounded w-32 mx-auto sm:mx-0"></div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#2a2a2a]">
                                <div className="h-12 bg-[#2a2a2a] rounded-xl animate-pulse"></div>
                                <div className="h-12 bg-[#2a2a2a] rounded-xl animate-pulse"></div>
                                <div className="h-12 bg-[#2a2a2a] rounded-xl animate-pulse"></div>
                                <div className="h-12 bg-[#2a2a2a] rounded-xl animate-pulse"></div>
                            </div>
                        </div>
                    ) : userProfile ? (
                        <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-2xl p-4 sm:p-8 shadow-lg space-y-6 sm:space-y-8">
                            
                            {/* Avatar & Basic Info Header */}
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                                <div className="relative group shrink-0">
                                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-[#2ecc71]/50 bg-[#121212] flex items-center justify-center overflow-hidden shadow-xl">
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
                            </div>

                            <AnimatePresence mode="wait">
                                {!editMode ? (
                                    <motion.div 
                                        key="view-mode"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.3 }}
                                        className="space-y-6 sm:space-y-8 pt-4 border-t border-[#2a2a2a]"
                                    >
                                        <div className="space-y-3">
                                            <h2 className="text-base sm:text-lg font-bold text-[#2ecc71] tracking-wide">
                                                Account Info:
                                            </h2>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="flex flex-col gap-1.5">
                                                    <span className="text-xs sm:text-sm text-gray-400 font-medium">User Name:</span>
                                                    <div className="w-full bg-[#121212] border border-[#333] rounded-xl p-3 text-sm text-white shadow-inner truncate">
                                                        {userProfile.username}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                    <span className="text-xs sm:text-sm text-gray-400 font-medium">Email:</span>
                                                    <div className="w-full bg-[#121212] border border-[#333] rounded-xl p-3 text-sm text-white shadow-inner truncate">
                                                        {userProfile.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <h2 className="text-base sm:text-lg font-bold text-[#2ecc71] tracking-wide">
                                                Personal Detail:
                                            </h2>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="flex flex-col gap-1.5">
                                                    <span className="text-xs sm:text-sm text-gray-400 font-medium">Full Name:</span>
                                                    <div className="w-full bg-[#121212] border border-[#333] rounded-xl p-3 text-sm text-white shadow-inner truncate">
                                                        {userProfile.profile?.full_name || "Not set"}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                    <span className="text-xs sm:text-sm text-gray-400 font-medium">Phone Number:</span>
                                                    <div className="w-full bg-[#121212] border border-[#333] rounded-xl p-3 text-sm text-white shadow-inner truncate">
                                                        {userProfile.profile?.phone_number || "Not set"}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-1.5 sm:col-span-2">
                                                    <span className="text-xs sm:text-sm text-gray-400 font-medium">Address:</span>
                                                    <div className="w-full bg-[#121212] border border-[#333] rounded-xl p-3 text-sm text-white shadow-inner truncate">
                                                        {userProfile.profile?.address || "Not set"}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-1.5 sm:col-span-2">
                                                    <span className="text-xs sm:text-sm text-gray-400 font-medium">Date of Birth:</span>
                                                    <div className="w-full bg-[#121212] border border-[#333] rounded-xl p-3 text-sm text-white shadow-inner sm:max-w-sm truncate">
                                                        {userProfile.profile?.date_of_birth || "Not set"}
                                                    </div>
                                                </div>
                                                {userProfile.profile?.bio && (
                                                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                                                        <span className="text-xs sm:text-sm text-gray-400 font-medium">Bio:</span>
                                                        <div className="w-full bg-[#121212] border border-[#333] rounded-xl p-3 text-sm text-white shadow-inner whitespace-pre-wrap">
                                                            {userProfile.profile.bio}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.form 
                                        key="edit-mode"
                                        onSubmit={handleSubmit(onSubmit)}
                                        className="space-y-6 pt-4 border-t border-[#2a2a2a]"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="space-y-4">
                                            <h2 className="text-base sm:text-lg font-bold text-[#2ecc71] tracking-wide">
                                                Account Info:
                                            </h2>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-xs sm:text-sm text-gray-400 font-medium">Username:</label>
                                                    <input 
                                                        type="text" 
                                                        value={userProfile.username}
                                                        disabled
                                                        className="w-full bg-[#121212] border border-[#333] rounded-xl p-3 text-sm text-zinc-500 outline-none shadow-inner cursor-not-allowed"
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-xs sm:text-sm text-gray-400 font-medium">Email:</label>
                                                    <input 
                                                        type="email" 
                                                        value={userProfile.email}
                                                        disabled
                                                        className="w-full bg-[#121212] border border-[#333] rounded-xl p-3 text-sm text-zinc-500 outline-none shadow-inner cursor-not-allowed"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h2 className="text-base sm:text-lg font-bold text-[#2ecc71] tracking-wide">
                                                Personal Detail:
                                            </h2>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-xs sm:text-sm text-gray-400 font-medium">Full Name:</label>
                                                    <input 
                                                        type="text" 
                                                        {...register("full_name")}
                                                        className="w-full bg-[#121212] border border-[#333] rounded-xl p-3 text-sm text-white focus:border-[#2ecc71] outline-none shadow-inner transition-colors"
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-xs sm:text-sm text-gray-400 font-medium">Phone Number:</label>
                                                    <input 
                                                        type="text" 
                                                        {...register("phone_number")}
                                                        className="w-full bg-[#121212] border border-[#333] rounded-xl p-3 text-sm text-white focus:border-[#2ecc71] outline-none shadow-inner transition-colors"
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-1.5 sm:col-span-2">
                                                    <label className="text-xs sm:text-sm text-gray-400 font-medium">Address:</label>
                                                    <input 
                                                        type="text" 
                                                        {...register("address")}
                                                        className="w-full bg-[#121212] border border-[#333] rounded-xl p-3 text-sm text-white focus:border-[#2ecc71] outline-none shadow-inner transition-colors"
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-1.5 sm:col-span-2">
                                                    <label className="text-xs sm:text-sm text-gray-400 font-medium">Date of Birth:</label>
                                                    <input 
                                                        type="date" 
                                                        {...register("date_of_birth")}
                                                        className="w-full bg-[#121212] border border-[#333] rounded-xl p-3 text-sm text-white focus:border-[#2ecc71] outline-none shadow-inner sm:max-w-sm transition-colors"
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-1.5 sm:col-span-2">
                                                    <label className="text-xs sm:text-sm text-gray-400 font-medium">Bio:</label>
                                                    <textarea 
                                                        {...register("bio")}
                                                        rows="4"
                                                        className="w-full bg-[#121212] border border-[#333] rounded-xl p-3 text-sm text-white focus:border-[#2ecc71] outline-none shadow-inner transition-colors resize-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <motion.button
                                            type="submit"
                                            disabled={saving}
                                            className="w-full sm:w-auto mt-6 px-8 py-3 bg-[#2ecc71] hover:bg-[#27ae60] text-black font-extrabold text-sm rounded-xl shadow-[0_0_15px_rgba(46,204,113,0.3)] flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <FaSave /> {saving ? "Saving..." : "Save Changes"}
                                        </motion.button>
                                    </motion.form>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-[#1c1c1c] border border-[#2a2a2a] rounded-2xl shadow-lg">
                            <p className="text-red-400 text-sm font-bold">Profile not found</p>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;