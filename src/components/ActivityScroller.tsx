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
      className="text-[1.5rem] md:text-[clamp(2rem,5vw,4.5rem)] font-bold tracking-tight py-2 snap-center whitespace-nowrap leading-tight"
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
    <div className="relative w-full pt-12 pb-12">
      
      <div className="flex flex-row items-start w-full max-w-5xl mx-auto px-4 md:px-12">
        
        {/* Sticky Left Section */}
        <h2 className="sticky top-[45vh] w-1/2 m-0 h-fit text-[1.5rem] md:text-[clamp(2rem,5vw,4.5rem)] font-bold text-white leading-tight tracking-tighter text-right pr-3 md:pr-6 whitespace-nowrap">
          you can log
        </h2>

        {/* Scrolling Right Section */}
        <ul className="w-1/2 m-0 p-0 pl-3 md:pl-6 list-none text-left">
          {activities.map((activity, i) => (
            <ActivityItem key={activity} activity={activity} index={i} />
          ))}
        </ul>

      </div>
    </div>
  );
};

export default ActivityScroller;
