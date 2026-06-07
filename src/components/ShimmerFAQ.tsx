import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    question: "Is GOAT free?",
    answer: "Yes! GOAT Fitness offers a generous free tier that allows you to track your workouts, use the Apple Watch app, and access the massive exercise database without paying a dime."
  },
  {
    question: "Can I use the app without an internet connection?",
    answer: "Absolutely. We know gyms often have terrible reception. GOAT Fitness works offline so you can log your sets, reps, and RPE seamlessly, and it will sync once you're back online."
  },
  {
    question: "Does it have exercise demonstration videos?",
    answer: "Yes, we integrate YouTube embeds for form checks directly inside the exercise logging screen. You can review the exact movement path before your heavy sets to ensure perfect execution."
  }
];

const FAQItem: React.FC<{ faq: typeof faqs[0]; isOpen: boolean; onToggle: () => void }> = ({ faq, isOpen, onToggle }) => {
  return (
    <div className="border-b border-white/10 overflow-hidden">
      <button 
        onClick={onToggle}
        className="w-full py-6 md:py-8 flex justify-between items-center text-left focus:outline-none group"
      >
        <span className="text-xl md:text-3xl font-semibold text-white/90 group-hover:text-white transition-colors" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          {faq.question}
        </span>
        <motion.div 
          animate={{ rotate: isOpen ? 225 : 0 }} 
          transition={{ duration: 0.3 }}
          className="text-white/50 group-hover:text-[#4F60FC] transition-colors shrink-0 ml-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.215, 0.61, 0.355, 1] }}
          >
            <div className="pb-8 pr-12">
              <motion.p 
                className="text-lg md:text-xl font-medium leading-relaxed inline text-transparent bg-clip-text"
                initial={{ backgroundPosition: "200% 0" }}
                animate={{ backgroundPosition: "0% 0" }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
                style={{
                  backgroundImage: 'linear-gradient(110deg, #ffffff 0%, #ffffff 40%, #2C41FC 45%, #ffffff 50%, rgba(255,255,255,0.15) 60%, rgba(255,255,255,0.15) 100%)',
                  backgroundSize: '300% 100%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {faq.answer}
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ShimmerFAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="w-full max-w-4xl mx-auto py-24 px-6 md:px-12 relative z-10">
      <h2 className="text-3xl md:text-5xl font-bold text-white mb-12" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
        Frequently Asked Questions
      </h2>
      
      <div className="flex flex-col">
        {faqs.map((faq, idx) => (
          <FAQItem 
            key={idx} 
            faq={faq} 
            isOpen={openIndex === idx} 
            onToggle={() => setOpenIndex(openIndex === idx ? null : idx)} 
          />
        ))}
      </div>
    </section>
  );
};

export default ShimmerFAQ;
