import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEdit, FaSave, FaTimes, FaImage, FaUser, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaInfoCircle } from 'react-icons/fa';

const Dashboard = () => {
    const [editMode, setEditMode] = useState(false);
    const [saving, setSaving] = useState(false);

    // Mock static user data matching your theme/aesthetic
    const [formData, setFormData] = useState({
        username: "awqat.admin",
        email: "awqat@example.com",
        full_name: "AwQat Admin",
        phone_number: "+8801234567890",
        address: "Chattogram, Bangladesh",
        date_of_birth: "2000-01-01",
        bio: "Admin of AwQat Gamestore"
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = (e) => {
        e.preventDefault();
        setSaving(true);
        setTimeout(() => {
            setSaving(false);
            setEditMode(false);
        }, 1000);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    };

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
    };

    return (
        <motion.div 
            className="w-full space-y-6 text-white"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            {/* Header */}
            <motion.div 
                className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"
                variants={itemVariants}
            >
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                        My Dashboard
                    </h1>
                    <p className="text-gray-400 mt-1">
                        Welcome back, {formData.full_name}!
                    </p>
                </div>
                <motion.button
                    onClick={() => setEditMode(!editMode)}
                    className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 w-full sm:w-auto ${
                        editMode 
                            ? "bg-red-500/10 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white" 
                            : "bg-[#2ecc71] text-black hover:bg-[#27ae60] hover:shadow-[0_0_15px_rgba(46,204,113,0.5)]"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {editMode ? <><FaTimes /> Cancel</> : <><FaEdit /> Edit Profile</>}
                </motion.button>
            </motion.div>

            {/* Profile Section Card */}
            <motion.div 
                className="bg-[#1a1a1a] p-6 md:p-8 rounded-3xl border border-[#333] shadow-2xl relative overflow-hidden"
                variants={cardVariants}
            >
                <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#2ecc71]/5 rounded-full blur-3xl pointer-events-none"></div>

                <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start relative z-10">
                    
                    {/* Avatar Block */}
                    <div className="flex flex-col items-center">
                        <motion.div 
                            className="relative group"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="w-32 h-32 md:w-36 md:h-36 rounded-2xl md:rounded-[2rem] bg-white/5 border-2 border-[#333] flex items-center justify-center overflow-hidden shadow-xl">
                                <FaUser className="w-16 h-16 text-gray-500" />
                            </div>
                            {editMode && (
                                <label className="absolute -bottom-2 -right-2 bg-[#2ecc71] text-black p-3 rounded-full cursor-pointer shadow-lg hover:bg-[#27ae60] transition-transform hover:scale-110">
                                    <FaImage className="w-4 h-4" />
                                    <input type="file" accept="image/*" className="hidden" />
                                </label>
                            )}
                        </motion.div>
                    </div>

                    {/* Content / Form Block */}
                    <div className="flex-1 w-full max-w-2xl">
                        <AnimatePresence mode="wait">
                            {!editMode ? (
                                <motion.div 
                                    key="view-mode"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-1">
                                        {formData.full_name}
                                    </h2>
                                    <p className="text-[#2ecc71] font-semibold mb-6">
                                        @{formData.username}
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
                                        <div className="bg-black/40 border border-[#333] p-4 rounded-xl flex items-center gap-3">
                                            <FaUser className="text-[#2ecc71]" />
                                            <div>
                                                <span className="block text-xs text-gray-500 font-bold uppercase">Username</span>
                                                <span className="font-semibold text-white">{formData.username}</span>
                                            </div>
                                        </div>
                                        <div className="bg-black/40 border border-[#333] p-4 rounded-xl flex items-center gap-3">
                                            <FaPhone className="text-[#2ecc71]" />
                                            <div>
                                                <span className="block text-xs text-gray-500 font-bold uppercase">Phone</span>
                                                <span className="font-semibold text-white">{formData.phone_number}</span>
                                            </div>
                                        </div>
                                        <div className="bg-black/40 border border-[#333] p-4 rounded-xl flex items-center gap-3">
                                            <FaMapMarkerAlt className="text-[#2ecc71]" />
                                            <div>
                                                <span className="block text-xs text-gray-500 font-bold uppercase">Address</span>
                                                <span className="font-semibold text-white">{formData.address}</span>
                                            </div>
                                        </div>
                                        <div className="bg-black/40 border border-[#333] p-4 rounded-xl flex items-center gap-3">
                                            <FaCalendarAlt className="text-[#2ecc71]" />
                                            <div>
                                                <span className="block text-xs text-gray-500 font-bold uppercase">Date of Birth</span>
                                                <span className="font-semibold text-white">{formData.date_of_birth}</span>
                                            </div>
                                        </div>
                                        <div className="md:col-span-2 bg-black/40 border border-[#333] p-4 rounded-xl flex items-start gap-3">
                                            <FaInfoCircle className="text-[#2ecc71] mt-1" />
                                            <div>
                                                <span className="block text-xs text-gray-500 font-bold uppercase">Bio</span>
                                                <span className="font-semibold text-white">{formData.bio}</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.form 
                                    key="edit-mode"
                                    onSubmit={handleSave}
                                    className="space-y-4"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs text-gray-400 font-bold uppercase mb-1">Username</label>
                                            <input 
                                                type="text" 
                                                name="username" 
                                                value={formData.username} 
                                                onChange={handleChange}
                                                className="w-full bg-black border border-[#333] rounded-xl px-4 py-3 text-white focus:border-[#2ecc71] outline-none transition"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-400 font-bold uppercase mb-1">Email</label>
                                            <input 
                                                type="email" 
                                                name="email" 
                                                value={formData.email} 
                                                onChange={handleChange}
                                                className="w-full bg-black border border-[#333] rounded-xl px-4 py-3 text-white focus:border-[#2ecc71] outline-none transition"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-400 font-bold uppercase mb-1">Full Name</label>
                                            <input 
                                                type="text" 
                                                name="full_name" 
                                                value={formData.full_name} 
                                                onChange={handleChange}
                                                className="w-full bg-black border border-[#333] rounded-xl px-4 py-3 text-white focus:border-[#2ecc71] outline-none transition"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-400 font-bold uppercase mb-1">Phone Number</label>
                                            <input 
                                                type="text" 
                                                name="phone_number" 
                                                value={formData.phone_number} 
                                                onChange={handleChange}
                                                className="w-full bg-black border border-[#333] rounded-xl px-4 py-3 text-white focus:border-[#2ecc71] outline-none transition"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-400 font-bold uppercase mb-1">Date of Birth</label>
                                            <input 
                                                type="date" 
                                                name="date_of_birth" 
                                                value={formData.date_of_birth} 
                                                onChange={handleChange}
                                                className="w-full bg-black border border-[#333] rounded-xl px-4 py-3 text-white focus:border-[#2ecc71] outline-none transition"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs text-gray-400 font-bold uppercase mb-1">Address</label>
                                            <input 
                                                type="text" 
                                                name="address" 
                                                value={formData.address} 
                                                onChange={handleChange}
                                                className="w-full bg-black border border-[#333] rounded-xl px-4 py-3 text-white focus:border-[#2ecc71] outline-none transition"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs text-gray-400 font-bold uppercase mb-1">Bio</label>
                                            <textarea 
                                                name="bio" 
                                                rows="3"
                                                value={formData.bio} 
                                                onChange={handleChange}
                                                className="w-full bg-black border border-[#333] rounded-xl px-4 py-3 text-white focus:border-[#2ecc71] outline-none transition resize-none"
                                            ></textarea>
                                        </div>
                                    </div>

                                    <motion.button
                                        type="submit"
                                        disabled={saving}
                                        className="w-full md:w-auto mt-4 px-8 py-3 bg-[#2ecc71] hover:bg-[#27ae60] text-black font-extrabold rounded-xl shadow-[0_0_15px_rgba(46,204,113,0.5)] flex items-center justify-center gap-2 transition-all"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <FaSave /> {saving ? "Saving..." : "Save Changes"}
                                    </motion.button>
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </div>

                </div>
            </motion.div>
        </motion.div>
    );
};

export default Dashboard;