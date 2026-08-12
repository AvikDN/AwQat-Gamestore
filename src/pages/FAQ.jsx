import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "How long does it take to receive my order?",
      answer: "We process most orders instantly. You will typically see the in-game currency or items in your account within 5 to 10 minutes after completing the payment."
    },
    {
      question: "Do you need my account password?",
      answer: "No. We fulfill 99% of our orders using only your Player ID or UID. We will never ask for your personal account password for standard top-ups."
    },
    {
      question: "What local payment methods do you accept?",
      answer: "We support major local mobile wallets and bank transfers. You will see the exact list of available payment options at checkout based on your region."
    },
    {
      question: "Is it safe to buy in-game currency here?",
      answer: "Yes. We operate entirely within the official top-up guidelines provided by game developers. Your account remains 100% secure and free from ban risks."
    },
    {
      question: "What should I do if my top-up fails?",
      answer: "If you do not receive your items within 30 minutes, contact our support team immediately. Provide your Order ID and Player ID, and we will resolve the issue."
    },
    {
      question: "Can I get a refund if I change my mind?",
      answer: "We cannot issue refunds once we deliver the digital goods to your account. Please double-check your Player ID and selected items before finalizing your purchase."
    }
  ];

  return (
    <div className=" min-h-screen w-full text-white overflow-hidden selection:bg-[#2ecc71] selection:text-black">
      
      {/* Header Section */}
      <section className="relative pt-32 pb-12 md:pt-40 md:pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            Frequently Asked <span className="text-[#2ecc71] drop-shadow-[0_0_15px_rgba(46,204,113,0.4)]">Questions</span>
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Find quick answers to common questions about orders, payments, and account security.
          </motion.p>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="pb-24">
        <motion.div
          className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
        >
          <div className="flex flex-col gap-4">
            {faqs.map((faq, index) => {
              const isActive = activeIndex === index;

              return (
                <motion.div 
                  key={index} 
                  variants={itemVariants}
                  className={`bg-[#1a1a1a] border rounded-2xl overflow-hidden transition-colors duration-300 ${
                    isActive ? 'border-[#2ecc71]' : 'border-[#333] hover:border-[#2ecc71]/50'
                  }`}
                >
                  <button
                    onClick={() => toggleAccordion(index)}
                    className="w-full px-6 py-5 md:px-8 md:py-6 flex items-center justify-between text-left focus:outline-none group"
                  >
                    <span className={`font-bold text-lg md:text-xl pr-4 transition-colors duration-300 ${isActive ? 'text-[#2ecc71]' : 'text-white group-hover:text-[#2ecc71]'}`}>
                      {faq.question}
                    </span>
                    
                    <motion.div 
                      className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors duration-300 ${isActive ? 'border-[#2ecc71] text-[#2ecc71]' : 'border-gray-500 text-gray-500 group-hover:border-[#2ecc71] group-hover:text-[#2ecc71]'}`}
                      animate={{ rotate: isActive ? 180 : 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <div className="px-6 pb-6 md:px-8 md:pb-8 pt-0">
                          <p className="text-gray-300 text-base md:text-lg leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

    </div>
  );
}