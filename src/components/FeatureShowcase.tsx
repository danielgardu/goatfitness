import React from 'react';
import { motion } from 'framer-motion';

const features = [
  {
    title: "What is GOAT Fitness...",
    text: "The ultimate workout companion. Track gym routines, runs, and 40+ sports effortlessly. Monitor live heart rate on Apple Watch without distractions, and focus purely on progressing.",
    color: "#2C41FC"
  },
  {
    title: "The best exercise database.",
    text: "Access 252+ curated exercises correctly categorized by muscle group, equipment, and unilateral variants for hyper-precise volume tracking.",
    color: "#4F60FC"
  },
  {
    title: "Total flexibility.",
    text: "Build any split you need: Push/Pull/Legs, Upper/Lower, Full Body, or your own custom routine. Adaptable to your exact experience level and schedule.",
    color: "#1E2CB8"
  },
  {
    title: "Log sets & effort intuitively.",
    text: "Track weight, reps, and RPE in taps. Enjoy automatic rest timers, built-in form check videos, and real-time intra-workout calorie calculations.",
    color: "#2C41FC"
  },
  {
    title: "Developed for serious lifters.",
    text: "Built by lifters, for lifters. It solves real gym problems, prioritizing intense hypertrophy, accuracy, and seamless usability during heavy sets.",
    color: "#4F60FC"
  },
  {
    title: "Seamless ecosystem.",
    text: "Deep Apple Watch integration. Control iPhone workouts from your wrist, view live heart rate, and automatically sync all active data with Apple Health.",
    color: "#2C41FC"
  }
];

const FeatureShowcase: React.FC = () => {
  return (
    <section className="relative w-full max-w-4xl mx-auto py-16 flex flex-col gap-12 md:gap-20 bg-black">
      {features.map((feature, idx) => (
        <motion.div 
          key={idx}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.7, delay: idx * 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="flex flex-col md:flex-row gap-4 md:gap-12 items-start relative group cursor-default"
        >
          {/* Subtle glowing line on the left that illuminates on hover */}
          <div className="absolute -left-4 md:-left-8 top-0 bottom-0 w-[2px] bg-white/5 group-hover:bg-white/20 transition-colors duration-500 overflow-hidden">
            <motion.div 
              className="w-full h-1/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: `linear-gradient(to bottom, transparent, ${feature.color}, transparent)` }}
              animate={{ y: ["-100%", "300%"] }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            />
          </div>

          {/* Minimalist Index */}
          <div 
            className="font-mono text-xs md:text-sm tracking-widest text-white/30 group-hover:text-white/80 transition-colors duration-500 pt-2"
          >
            {String(idx + 1).padStart(2, '0')}
          </div>
          
          <div className="flex flex-col gap-2 relative">
            <h3 
              className="text-2xl md:text-4xl font-bold tracking-tight text-white/90 group-hover:text-white transition-all duration-300" 
              style={{ 
                fontFamily: 'Space Grotesk, sans-serif',
                textShadow: '0 0 0px transparent'
              }}
            >
              {feature.title}
            </h3>
            <p className="text-base md:text-lg text-white/50 leading-relaxed max-w-2xl group-hover:text-white/80 transition-colors duration-500 font-light">
              {feature.text}
            </p>
          </div>
        </motion.div>
      ))}
    </section>
  );
};

export default FeatureShowcase;
