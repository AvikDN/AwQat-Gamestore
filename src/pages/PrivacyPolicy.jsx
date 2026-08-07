import React from 'react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export default function PrivacyPolicy() {
  const lastUpdated = "August 7, 2026";

  const policySections = [
    {
      title: "1. Information We Collect",
      content: "When you use AwQat, we collect information necessary to process your transactions and maintain your account. This includes your Player ID, UID, email address, and order history. We do not collect or store your game account passwords. For payment processing, we collect the necessary billing details required by our local payment gateway partners."
    },
    {
      title: "2. How We Use Your Information",
      content: "We use your information exclusively to fulfill your orders, provide customer support, and improve your browsing experience. We use your Player ID solely to deliver in-game currency or items. We use your email to send order confirmations, receipts, and important security notices regarding your account."
    },
    {
      title: "3. Data Security",
      content: "We implement robust security measures to protect your personal information from unauthorized access, alteration, or disclosure. We encrypt all sensitive data transmitted between your browser and our servers. We restrict access to your personal information to authorized employees who need it to process your orders."
    },
    {
      title: "4. Third-Party Sharing",
      content: "We do not sell, trade, or rent your personal identification information to others. We share necessary data only with trusted third-party service providers, such as payment gateways, strictly for the purpose of processing your transactions. These providers are bound by strict confidentiality agreements."
    },
    {
      title: "5. Cookies and Tracking",
      content: "We use cookies to maintain your session, remember your preferences, and keep you logged in. You can choose to disable cookies through your browser settings; however, doing so will limit your ability to use essential features of the AwQat platform, such as the shopping cart and checkout process."
    },
    {
      title: "6. Your Rights",
      content: "You have the right to access, correct, or delete your personal information stored on our servers. You can update your account details directly through your profile settings. To request a complete deletion of your account and associated data, please contact our support team."
    }
  ];

  return (
    <div className="bg-black min-h-screen w-full text-white overflow-hidden selection:bg-[#2ecc71] selection:text-black">
      
      {/* Header Section */}
      <section className="relative pt-32 pb-12 md:pt-40 md:pb-16 border-b border-[#333]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            Privacy <span className="text-[#2ecc71] drop-shadow-[0_0_15px_rgba(46,204,113,0.4)]">Policy</span>
          </motion.h1>
          
          <motion.p 
            className="text-gray-400 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Last Updated: {lastUpdated}
          </motion.p>
        </div>
      </section>

      {/* Policy Content Section */}
      <section className="py-12 md:py-20">
        <motion.div
          className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
        >
          <motion.div 
            className="mb-10 p-6 md:p-8 bg-[#1a1a1a] border border-[#333] rounded-2xl md:rounded-3xl shadow-lg"
            variants={itemVariants}
          >
            <p className="text-gray-300 text-lg leading-relaxed">
              At AwQat, we respect your privacy and are committed to protecting the personal data you share with us. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website and purchase digital goods.
            </p>
          </motion.div>

          <div className="flex flex-col gap-8 md:gap-10">
            {policySections.map((section, index) => (
              <motion.div key={index} variants={itemVariants} className="flex flex-col">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  {section.title}
                </h2>
                <p className="text-gray-400 text-base md:text-lg leading-relaxed">
                  {section.content}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div 
            className="mt-12 pt-8 border-t border-[#333]"
            variants={itemVariants}
          >
            <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
            <p className="text-gray-400 text-base md:text-lg leading-relaxed">
              If you have any questions or concerns regarding this Privacy Policy or how we handle your data, please contact us at <a href="mailto:support@awqat.com" className="text-[#2ecc71] hover:underline font-bold">support@awqat.com</a>.
            </p>
          </motion.div>

        </motion.div>
      </section>

    </div>
  );
}