import React from 'react';
import { motion } from 'framer-motion';
import StickmanCanvas from './StickmanCanvas';

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

const ActivityItem: React.FC<{ activity: string }> = ({ activity }) => {
  return (
    <motion.li
      className="flex items-center gap-1.5 md:gap-4 text-[1.2rem] sm:text-[1.5rem] md:text-[clamp(2rem,5vw,4.5rem)] font-bold tracking-tight py-2 snap-center whitespace-nowrap leading-tight"
      style={{ fontFamily: 'Space Grotesk, sans-serif' }}
      initial={{ opacity: 0.15, color: '#ffffff', textShadow: 'none' }}
      whileInView={{
        opacity: 1,
        color: '#ffffff',
        textShadow: '0 0 18px rgba(255,255,255,0.55)'
      }}
      viewport={{ margin: "-45% 0px -45% 0px" }}
      transition={{ duration: 0.3 }}
    >
      <span>{activity}</span>
      <StickmanCanvas activity={activity} />
    </motion.li>
  );
};

const ActivityScroller: React.FC = () => {
  return (
    <div className="relative w-full pt-12 pb-12">
      
      <div className="flex flex-row items-start w-full max-w-6xl mx-auto px-4 md:px-12">
        
        {/* Sticky Left Section */}
        <h2 className="sticky top-[45vh] w-[34%] md:w-1/2 m-0 h-fit text-[1.2rem] sm:text-[1.5rem] md:text-[clamp(2rem,5vw,4.5rem)] font-bold text-white leading-tight tracking-tighter text-right pr-3 md:pr-6 whitespace-nowrap">
          you can log
        </h2>

        {/* Scrolling Right Section */}
        <ul className="w-[66%] md:w-1/2 m-0 p-0 pl-3 md:pl-6 list-none text-left overflow-visible">
          {activities.map((activity) => (
            <ActivityItem key={activity} activity={activity} />
          ))}
        </ul>

      </div>
    </div>
  );
};

export default ActivityScroller;
