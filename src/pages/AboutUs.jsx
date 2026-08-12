import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const scaleVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export default function AboutUs() {
  const features = [
    {
      id: "01",
      title: "Streamlined Ordering",
      desc: "Enjoy a fast and simplified ordering process designed to deliver your digital gaming assets instantly."
    },
    {
      id: "02",
      title: "Local Payments",
      desc: "Complete transactions using secure local payment systems without requiring international credit cards."
    },
    {
      id: "03",
      title: "Multiple Games",
      desc: "Browse a diverse catalog supporting multiple games, currencies, and battle passes in one place."
    },
    {
      id: "04",
      title: "Account & Tracking",
      desc: "Manage your orders, track payment status in real time, and maintain user accounts with ease."
    },
    {
      id: "05",
      title: "Intuitive Interface",
      desc: "Navigate through a clean, modern user interface built to enhance your overall customer experience."
    },
    {
      id: "06",
      title: "Notifications",
      desc: "Stay informed with instant notifications regarding order progress, fulfillment status, and account updates."
    }
  ];

  return (
    <div className=" min-h-screen w-full text-white overflow-hidden selection:bg-[#2ecc71] selection:text-black">
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            About <span className="text-[#2ecc71] drop-shadow-[0_0_15px_rgba(46,204,113,0.4)]">AwQat</span>
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Powering your gameplay with seamless digital transactions.
          </motion.p>

          <motion.div 
            className="mt-12 flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <div className="w-1 h-16 bg-gradient-to-b from-[#2ecc71] to-transparent rounded-full animate-pulse"></div>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-12 ">
        <motion.div
          className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <motion.div
            className="relative bg-[#1a1a1a] border border-[#333] p-8 md:p-12 rounded-3xl shadow-2xl overflow-hidden group"
            variants={scaleVariants}
          >
            {/* Background glowing accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#2ecc71]/5 rounded-full blur-3xl -mr-20 -mt-20 transition-all duration-700 group-hover:bg-[#2ecc71]/10"></div>
            
            <h2 className="text-3xl font-bold mb-6 text-[#2ecc71] relative z-10">Our Mission</h2>
            <p className="text-gray-300 text-lg md:text-xl leading-relaxed relative z-10 font-medium">
              AwQat Gamestore is a web-based platform that enables users to purchase in-game currencies and digital gaming services using convenient local payment methods. We solve the difficulty faced by gamers who lack access to international payment options such as credit cards, ensuring you never miss a battle pass or exclusive drop.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Grid Section */}
      <section className="py-16 md:py-24">
        <motion.div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <div className="text-center mb-16">
            <motion.h2 className="text-3xl md:text-4xl font-bold mb-4" variants={itemVariants}>
              Platform Features
            </motion.h2>
            <motion.div className="w-20 h-1 bg-[#2ecc71] mx-auto rounded-full shadow-[0_0_10px_rgba(46,204,113,0.5)]" variants={itemVariants}></motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-[#1a1a1a] border border-[#333] hover:border-[#2ecc71] p-8 rounded-3xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_30px_-10px_rgba(46,204,113,0.2)] flex flex-col group"
                variants={itemVariants}
              >
                <div className="w-14 h-14 bg-black border border-[#2ecc71]/30 rounded-xl flex items-center justify-center text-[#2ecc71] font-black text-xl mb-6 group-hover:bg-[#2ecc71] group-hover:text-black transition-colors duration-300 shadow-lg">
                  {feature.id}
                </div>
                <h3 className="text-xl font-bold text-white mb-3 tracking-wide">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed text-sm md:text-base">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-[#333] bg-gradient-to-b from-black to-[#0a1a10]">
        <motion.div 
          className="max-w-4xl mx-auto px-4 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.h2 className="text-3xl md:text-4xl font-black mb-6" variants={itemVariants}>
            Ready to upgrade your inventory?
          </motion.h2>
          <motion.div variants={itemVariants}>
            <Link
              to="/products"
              className="inline-block mt-4 px-10 py-4 bg-[#2ecc71] text-black font-extrabold text-lg rounded-full hover:bg-[#27ae60] hover:shadow-[0_0_20px_rgba(46,204,113,0.6)] hover:scale-105 transition-all duration-300"
            >
              Browse Catalog
            </Link>
          </motion.div>
        </motion.div>
      </section>

    </div>
  );
}