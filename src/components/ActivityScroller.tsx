import React from 'react';
import { motion } from 'framer-motion';

const activities = [
  "Strength Training.",
  "Calisthenics.",
  "Running.",
  "Cycling.",
  "Swimming.",
  "Cardio.",
  "HIIT.",
  "Yoga.",
  "Pilates.",
  "Core.",
  "Soccer.",
  "Basketball.",
  "Baseball.",
  "Tennis.",
  "Volleyball.",
  "Golf.",
  "Boxing.",
  "Martial Arts.",
  "American Football.",
  "Hockey.",
  "Surfing.",
  "Padel.",
  "Hiking.",
  "Skate."
];

const ActivityItem: React.FC<{ activity: string; index: number }> = ({ activity, index }) => {
  return (
    <motion.li
      className="text-[clamp(1.5rem,7vw,4.5rem)] md:text-[clamp(2rem,5vw,4.5rem)] font-bold tracking-tight py-1 md:py-2 snap-center whitespace-nowrap leading-tight"
      style={{ fontFamily: 'Space Grotesk, sans-serif' }}
      initial={{ opacity: 0.15, color: '#ffffff', textShadow: 'none' }}
      whileInView={{ 
        opacity: 1, 
        color: index % 3 === 0 ? '#2C41FC' : index % 3 === 1 ? '#4F60FC' : '#ffffff',
        textShadow: index % 3 !== 2 ? '0 0 20px rgba(44,65,252,0.8)' : '0 0 20px rgba(255,255,255,0.6)'
      }}
      viewport={{ margin: "-45% 0px -45% 0px" }}
      transition={{ duration: 0.3 }}
    >
      {activity}
    </motion.li>
  );
};

const ActivityScroller: React.FC = () => {
  return (
    <div className="relative w-full pt-8 md:pt-12 pb-12">
      
      <div className="flex flex-col md:flex-row items-start w-full max-w-5xl mx-auto px-4 md:px-12 gap-8 md:gap-0">
        
        {/* Sticky Left Section */}
        <h2 className="sticky top-[18vh] md:top-[45vh] w-full md:w-1/2 m-0 h-fit text-[clamp(1.9rem,8vw,4.5rem)] md:text-[clamp(2rem,5vw,4.5rem)] font-bold text-white leading-tight tracking-tighter text-left md:text-right pr-0 md:pr-6 whitespace-normal md:whitespace-nowrap">
          you can log
        </h2>

        {/* Scrolling Right Section */}
        <ul className="w-full md:w-1/2 m-0 p-0 md:pl-6 list-none text-left">
          {activities.map((activity, i) => (
            <ActivityItem key={activity} activity={activity} index={i} />
          ))}
        </ul>

      </div>
    </div>
  );
};

export default ActivityScroller;
