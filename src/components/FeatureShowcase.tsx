import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const features = [
  {
    title: "What is GOAT Fitness?",
    text: "GOAT Fitness is the best iOS workout app for tracking gym routines, running, and over 40 different sports. It allows you to quickly log sets, reps, and effort levels, or use your Apple Watch to monitor live heart rate without distractions so you can focus on lifting heavy and progressing consistently.",
    gradient: "from-[#2C41FC] to-[#1E2CB8]"
  },
  {
    title: "Why does GOAT have the best exercise database?",
    text: "We feature a meticulously curated database of over 252 exercises. Each one is categorized by muscle group and includes unilateral variants and different equipment options (dumbbells, barbells, cables). This ensures hyper-precise tracking of your training volume.",
    gradient: "from-[#4F60FC] to-[#2C41FC]"
  },
  {
    title: "What routines can you follow on GOAT?",
    text: "Flexibility is key. In GOAT you can create and follow any training split:\n\n• Push / Pull / Legs (PPL): Optimized for hypertrophy and frequency.\n• Upper / Lower: Perfect for balancing fatigue and stimulus.\n• Full Body & Bro Splits: Adaptable to any experience level and available days.",
    gradient: "from-[#1E2CB8] to-[#111A7A]"
  },
  {
    title: "How do I track my sets, reps, and effort?",
    text: "GOAT features an intuitive interface where with just a couple of taps you can log weight, reps, and RPE (Rate of Perceived Exertion) from 1 to 10. Plus, it integrates an automatic rest timer, YouTube embeds for form checks, and intra-workout calorie calculations, giving you total control over your progress.",
    gradient: "from-[#2C41FC] to-[#1E2CB8]"
  },
  {
    title: "Developed for those who train seriously",
    text: "Built by an iOS developer who trains consistently. GOAT isn't just another generic tracker; it's a tool created to solve the real problems we face in the gym, prioritizing serious hypertrophy and ease of use during heavy sets.",
    gradient: "from-[#4F60FC] to-[#2C41FC]"
  },
  {
    title: "GOAT Fitness and the Apple Watch",
    text: "GOAT Fitness features profound Apple Watch integration. Experience Apple Watch mirror mode to seamlessly control your iPhone workouts from your wrist. It continuously tracks your live heart rate, burns active calories, and automatically logs thousands of data points to Apple Health for complete ecosystem harmony.",
    gradient: "from-[#2C41FC] to-[#4F60FC]"
  }
];

const FeatureShowcase: React.FC = () => {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // Create a scroll trigger for this specific container
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  useEffect(() => {
    const updateIsMobile = () => setIsMobile(window.innerWidth < 768);

    updateIsMobile();
    window.addEventListener('resize', updateIsMobile);

    return () => window.removeEventListener('resize', updateIsMobile);
  }, []);

  // Map vertical scroll progress to horizontal translation
  // We have 6 cards, but they are now narrower.
  const x = useTransform(scrollYProgress, [0, 1], ["5%", isMobile ? "-80%" : "-60%"]);

  return (
    <section ref={targetRef} className="relative h-[220vh] md:h-[250vh] bg-black">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        
        {/* Track that moves horizontally */}
        <motion.div style={{ x }} className="flex gap-4 md:gap-12 px-4 md:px-12 w-max">
          {features.map((feature, idx) => (
            <div 
              key={idx} 
              className="w-[84vw] sm:w-[75vw] md:w-[40vw] lg:w-[30vw] min-h-[50vh] md:min-h-[65vh] flex flex-col justify-center bg-white/5 border border-white/10 rounded-[2.5rem] p-6 md:p-12 hover:border-white/20 hover:bg-white/10 transition-all duration-500 backdrop-blur-md relative overflow-hidden group"
              style={{ flexShrink: 0 }}
            >
              {/* Background ambient glows */}
              <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${feature.gradient} opacity-20 blur-[100px] rounded-full group-hover:opacity-40 transition-opacity duration-700`} />
              <div className={`absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br ${feature.gradient} opacity-20 blur-[120px] rounded-full group-hover:opacity-40 transition-opacity duration-700`} />
              
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-4 md:mb-8 tracking-tight relative z-10" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {feature.title}
              </h2>
              <div className="text-base md:text-xl text-white/80 leading-relaxed whitespace-pre-wrap relative z-10">
                {feature.text}
              </div>
            </div>
          ))}
        </motion.div>
        
        {/* Fade edges to smooth out the entry/exit */}
        <div className="absolute top-0 left-0 w-12 h-full bg-gradient-to-r from-black to-transparent pointer-events-none z-20" />
        <div className="absolute top-0 right-0 w-12 h-full bg-gradient-to-l from-black to-transparent pointer-events-none z-20" />
      </div>
    </section>
  );
};

export default FeatureShowcase;
