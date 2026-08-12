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

export default function TermsOfService() {
  const lastUpdated = "August 7, 2026";

  const termsSections = [
    {
      title: "1. Acceptance of Terms",
      content: "By accessing or using the AwQat platform, you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions, you must not access the website or use any of our services."
    },
    {
      title: "2. User Accounts",
      content: "You must provide accurate and complete information when creating an account. You are responsible for maintaining the security of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized access."
    },
    {
      title: "3. Digital Goods and Delivery",
      content: "We deliver digital goods, such as in-game currency, directly to the Player ID or UID provided during checkout. You are solely responsible for entering the correct Player ID. We cannot reverse transactions or issue replacements if you provide an incorrect ID."
    },
    {
      title: "4. Refunds and Cancellations",
      content: "All sales of digital goods are final. We do not offer refunds or cancellations once we have successfully delivered the items to the provided Player ID. We will only issue a refund if a technical error on our end prevents the delivery of your purchased items within 24 hours."
    },
    {
      title: "5. Prohibited Conduct",
      content: "You agree not to engage in fraudulent activities, including unauthorized chargebacks or the use of stolen payment methods. Any attempt to exploit platform vulnerabilities, manipulate pricing, or abuse our systems will result in immediate account termination and a permanent ban."
    },
    {
      title: "6. Limitation of Liability",
      content: "AwQat operates as an independent third-party vendor and is not affiliated with the official game developers. We are not responsible for any actions taken against your game account, including bans or suspensions, by the game developers. We provide our services 'as is' without warranties of any kind."
    }
  ];

  return (
    <div className=" min-h-screen w-full text-white overflow-hidden selection:bg-[#2ecc71] selection:text-black">
      
      {/* Header Section */}
      <section className="relative pt-32 pb-12 md:pt-40 md:pb-16 border-b border-[#333]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            Terms of <span className="text-[#2ecc71] drop-shadow-[0_0_15px_rgba(46,204,113,0.4)]">Service</span>
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

      {/* Terms Content Section */}
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
              Please read these Terms of Service carefully before using our platform. These terms govern your use of AwQat and establish the legal agreement between you and our service.
            </p>
          </motion.div>

          <div className="flex flex-col gap-8 md:gap-10">
            {termsSections.map((section, index) => (
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
            <h2 className="text-2xl font-bold text-white mb-4">Questions?</h2>
            <p className="text-gray-400 text-base md:text-lg leading-relaxed">
              If you have any questions about these Terms of Service, contact our legal team at <a href="mailto:legal@awqat.com" className="text-[#2ecc71] hover:underline font-bold">legal@awqat.com</a>.
            </p>
          </motion.div>

        </motion.div>
      </section>

    </div>
  );
}