import React, { useState } from 'react';
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

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      // Reset status message after 3 seconds
      setTimeout(() => setSubmitStatus(null), 3000);
    }, 1500);
  };

  return (
    <div className="bg-black min-h-screen w-full text-white overflow-hidden selection:bg-[#2ecc71] selection:text-black">
      
      {/* Header Section */}
      <section className="relative pt-32 pb-12 md:pt-40 md:pb-16 border-b border-[#333]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            Get in <span className="text-[#2ecc71] drop-shadow-[0_0_15px_rgba(46,204,113,0.4)]">Touch</span>
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Have a question about an order, need technical support, or want to partner with us? Drop us a message.
          </motion.p>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-16 md:py-24">
        <motion.div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
        >
          
          {/* Contact Information (Left Column) */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            <motion.div variants={itemVariants} className="bg-[#1a1a1a] border border-[#333] p-8 md:p-10 rounded-3xl shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#2ecc71]/5 rounded-full blur-3xl -mr-10 -mt-10 transition-all duration-700 group-hover:bg-[#2ecc71]/10"></div>
              
              <h3 className="text-2xl font-bold text-white mb-8 relative z-10">Contact Information</h3>
              
              <div className="flex flex-col gap-6 relative z-10">
                
                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-black border border-[#333] flex items-center justify-center text-[#2ecc71] shrink-0 group-hover:border-[#2ecc71]/50 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-400 text-sm font-medium mb-1">Email Us</span>
                    <a href="mailto:support@awqat.com" className="text-white font-bold hover:text-[#2ecc71] transition-colors">support@awqat.com</a>
                  </div>
                </div>

                {/* Discord */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-black border border-[#333] flex items-center justify-center text-[#2ecc71] shrink-0 group-hover:border-[#2ecc71]/50 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 9v2m-10-2v2m14 4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4a2 2 0 012-2h14a2 2 0 012 2v4z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 5h-6a2 2 0 00-2 2v2h10V7a2 2 0 00-2-2z" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-400 text-sm font-medium mb-1">Discord Community</span>
                    <a href="#" className="text-white font-bold hover:text-[#2ecc71] transition-colors">Join AwQat Server</a>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-black border border-[#333] flex items-center justify-center text-[#2ecc71] shrink-0 group-hover:border-[#2ecc71]/50 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-400 text-sm font-medium mb-1">Office Location</span>
                    <span className="text-white font-bold leading-relaxed">Bangladesh</span>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>

          {/* Contact Form (Right Column) */}
          <motion.div variants={itemVariants} className="lg:col-span-7">
            <div className="bg-[#1a1a1a] border border-[#333] p-8 md:p-10 rounded-3xl shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-6">Send a Message</h3>
              
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name Input */}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="name" className="text-sm font-bold text-gray-400">Your Name</label>
                    <input 
                      type="text" 
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full bg-black border border-[#333] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#2ecc71] focus:ring-1 focus:ring-[#2ecc71] transition-all duration-300"
                    />
                  </div>

                  {/* Email Input */}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="email" className="text-sm font-bold text-gray-400">Email Address</label>
                    <input 
                      type="email" 
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      className="w-full bg-black border border-[#333] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#2ecc71] focus:ring-1 focus:ring-[#2ecc71] transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Subject Input */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="subject" className="text-sm font-bold text-gray-400">Subject</label>
                  <input 
                    type="text" 
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Order Issue / General Inquiry"
                    className="w-full bg-black border border-[#333] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#2ecc71] focus:ring-1 focus:ring-[#2ecc71] transition-all duration-300"
                  />
                </div>

                {/* Message Textarea */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="message" className="text-sm font-bold text-gray-400">Message</label>
                  <textarea 
                    id="message"
                    name="message"
                    required
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="How can we help you?"
                    className="w-full bg-black border border-[#333] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#2ecc71] focus:ring-1 focus:ring-[#2ecc71] transition-all duration-300 resize-none"
                  ></textarea>
                </div>

                {/* Submit Button & Status */}
                <div className="flex items-center justify-between mt-2">
                  <motion.button 
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`px-8 py-4 rounded-xl font-extrabold text-lg transition-all duration-300 flex items-center gap-2 ${
                      isSubmitting 
                        ? 'bg-[#333] text-gray-400 cursor-not-allowed' 
                        : 'bg-[#2ecc71] text-black hover:bg-[#27ae60] hover:shadow-[0_0_15px_rgba(46,204,113,0.5)]'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : 'Send Message'}
                  </motion.button>

                  {submitStatus === 'success' && (
                    <motion.span 
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-[#2ecc71] font-bold"
                    >
                      Message sent successfully!
                    </motion.span>
                  )}
                </div>

              </form>
            </div>
          </motion.div>

        </motion.div>
      </section>

    </div>
  );
}