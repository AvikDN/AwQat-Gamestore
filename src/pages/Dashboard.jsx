import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEdit, FaSave, FaTimes, FaImage, FaUser } from 'react-icons/fa';
import { useAuthContext } from '../contexts/AuthContext';
import apiClient from '../services/api-client';

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
    const [editMode, setEditMode] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        full_name: "",
        phone_number: "",
        address: "",
        date_of_birth: "",
        bio: "",
        avatar: null
    });

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || "",
                email: user.email || "",
                full_name: user.profile?.full_name || "",
                phone_number: user.profile?.phone_number || "",
                address: user.profile?.address || "",
                date_of_birth: user.profile?.date_of_birth || "",
                bio: user.profile?.bio || "",
                avatar: user.profile?.avatar || null
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({ 
                ...formData, 
                avatarFile: e.target.files[0], 
                avatar: URL.createObjectURL(e.target.files[0]) 
            });
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        
        try {
            const submitData = new FormData();
            submitData.append('username', formData.username);
            submitData.append('email', formData.email);
            submitData.append('profile.full_name', formData.full_name);
            submitData.append('profile.phone_number', formData.phone_number);
            submitData.append('profile.address', formData.address);
            submitData.append('profile.date_of_birth', formData.date_of_birth);
            submitData.append('profile.bio', formData.bio);
            
            if (formData.avatarFile) {
                submitData.append('profile.avatar', formData.avatarFile);
            }

            await apiClient.patch(`/users/${user.id}/`, submitData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            setEditMode(false);
        } catch (error) {
            console.error("Error updating profile:", error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <motion.div 
            className="w-full min-h-full text-white flex flex-col items-center justify-start py-4 sm:py-8 px-3 sm:px-6"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            {/* Encapsulating Box Wrapper with responsive padding and spacing */}
            <motion.div 
                className="w-full max-w-3xl bg-[#121212]/90 backdrop-blur-md border border-[#333] rounded-2xl sm:rounded-3xl p-4 sm:p-8 md:p-10 shadow-2xl relative"
                variants={itemVariants}
            >
                {/* My Dashboard Heading & Edit Button Top Row (Stacked nicely on mobile to prevent button overlap) */}
                <motion.div 
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 pb-4 border-b border-[#333]"
                    variants={itemVariants}
                >
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                        My Dashboard
                    </h1>
                    <motion.button
                        onClick={() => setEditMode(!editMode)}
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

                {/* Profile Picture and Username Row (Stacked on mobile, aligned on desktop) */}
                <motion.div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-8 text-center sm:text-left" variants={itemVariants}>
                    <div className="relative group shrink-0">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-gray-400 bg-[#1a1a1a] flex items-center justify-center overflow-hidden shadow-xl">
                            {formData.avatar ? (
                                <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <FaUser className="w-10 h-10 text-gray-400" />
                            )}
                        </div>
                        {editMode && (
                            <label className="absolute -bottom-1 -right-1 bg-[#2ecc71] text-black p-2 rounded-full cursor-pointer shadow-lg hover:bg-[#27ae60] transition-transform hover:scale-110">
                                <FaImage className="w-3.5 h-3.5" />
                                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                            </label>
                        )}
                    </div>
                    <div className="flex flex-col justify-center overflow-hidden w-full">
                        <span className="text-xl sm:text-3xl font-bold text-white tracking-wide truncate">
                            {formData.full_name || formData.username || "User"}
                        </span>
                        <span className="text-sm text-gray-400 mt-1 truncate">
                            {formData.email || "User@gmail.com"}
                        </span>
                    </div>
                </motion.div>

                <AnimatePresence mode="wait">
                    {!editMode ? (
                        /* View Mode Layout responsive for all screens */
                        <motion.div 
                            key="view-mode"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6 sm:space-y-8"
                        >
                            {/* Account Info Section */}
                            <div className="space-y-3 sm:space-y-4">
                                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-wide">
                                    Account Info:
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                    <div className="flex flex-col gap-1.5">
                                        <span className="text-xs sm:text-sm text-gray-300 font-medium">User Name:</span>
                                        <div className="w-full bg-[#1a1a1a] border border-gray-400 rounded-xl p-3 sm:p-3.5 text-sm sm:text-base text-white shadow-inner truncate">
                                            {formData.full_name || formData.username || "User full"}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <span className="text-xs sm:text-sm text-gray-300 font-medium">Email:</span>
                                        <div className="w-full bg-[#1a1a1a] border border-gray-400 rounded-xl p-3 sm:p-3.5 text-sm sm:text-base text-white shadow-inner truncate">
                                            {formData.email || "User@gmail.com"}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Personal Detail Section */}
                            <div className="space-y-3 sm:space-y-4">
                                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-wide">
                                    Personal Detail:
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                    <div className="flex flex-col gap-1.5">
                                        <span className="text-xs sm:text-sm text-gray-300 font-medium">Phone Number:</span>
                                        <div className="w-full bg-[#1a1a1a] border border-gray-400 rounded-xl p-3 sm:p-3.5 text-sm sm:text-base text-white shadow-inner truncate">
                                            {formData.phone_number || "0181*********0"}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <span className="text-xs sm:text-sm text-gray-300 font-medium">Address:</span>
                                        <div className="w-full bg-[#1a1a1a] border border-gray-400 rounded-xl p-3 sm:p-3.5 text-sm sm:text-base text-white shadow-inner truncate">
                                            {formData.address || "Chattogram, Bangladesh."}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                                        <span className="text-xs sm:text-sm text-gray-300 font-medium">Date of Birth:</span>
                                        <div className="w-full bg-[#1a1a1a] border border-gray-400 rounded-xl p-3 sm:p-3.5 text-sm sm:text-base text-white shadow-inner sm:max-w-sm truncate">
                                            {formData.date_of_birth || "28/08/2000"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        /* Edit Mode Form Inputs responsive for all screens */
                        <motion.form 
                            key="edit-mode"
                            onSubmit={handleSave}
                            className="space-y-6"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="space-y-4">
                                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-wide">
                                    Account Info:
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs sm:text-sm text-gray-300 font-medium">User Name:</label>
                                        <input 
                                            type="text" 
                                            name="full_name" 
                                            value={formData.full_name} 
                                            onChange={handleChange}
                                            className="w-full bg-[#1a1a1a] border border-gray-400 rounded-xl p-3 sm:p-3.5 text-sm sm:text-base text-white focus:border-[#2ecc71] outline-none shadow-inner"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs sm:text-sm text-gray-300 font-medium">Email:</label>
                                        <input 
                                            type="email" 
                                            name="email" 
                                            value={formData.email} 
                                            onChange={handleChange}
                                            className="w-full bg-[#1a1a1a] border border-gray-400 rounded-xl p-3 sm:p-3.5 text-sm sm:text-base text-white focus:border-[#2ecc71] outline-none shadow-inner"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-wide">
                                    Personal Detail:
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs sm:text-sm text-gray-300 font-medium">Phone Number:</label>
                                        <input 
                                            type="text" 
                                            name="phone_number" 
                                            value={formData.phone_number} 
                                            onChange={handleChange}
                                            className="w-full bg-[#1a1a1a] border border-gray-400 rounded-xl p-3 sm:p-3.5 text-sm sm:text-base text-white focus:border-[#2ecc71] outline-none shadow-inner"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs sm:text-sm text-gray-300 font-medium">Address:</label>
                                        <input 
                                            type="text" 
                                            name="address" 
                                            value={formData.address} 
                                            onChange={handleChange}
                                            className="w-full bg-[#1a1a1a] border border-gray-400 rounded-xl p-3 sm:p-3.5 text-sm sm:text-base text-white focus:border-[#2ecc71] outline-none shadow-inner"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                                        <label className="text-xs sm:text-sm text-gray-300 font-medium">Date of Birth:</label>
                                        <input 
                                            type="date" 
                                            name="date_of_birth" 
                                            value={formData.date_of_birth} 
                                            onChange={handleChange}
                                            className="w-full bg-[#1a1a1a] border border-gray-400 rounded-xl p-3 sm:p-3.5 text-sm sm:text-base text-white focus:border-[#2ecc71] outline-none shadow-inner sm:max-w-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <motion.button
                                type="submit"
                                disabled={saving}
                                className="w-full sm:w-auto mt-6 px-8 py-3 bg-[#cccccc] hover:bg-white text-black font-bold text-lg rounded-md shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
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