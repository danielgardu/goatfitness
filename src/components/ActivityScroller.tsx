import React, { useEffect, useState } from 'react';
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
  "Dance.",
  "Padel.",
  "Hiking.",
  "Skate."
];

const itemType =
  'text-[1.32rem] sm:text-[1.5rem] md:text-[clamp(2rem,5vw,4.5rem)] font-bold tracking-tight leading-tight';

function useDesktop() {
  const [desktop, setDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = () => setDesktop(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return desktop;
}

const ActivityItem: React.FC<{ activity: string; viewport: { margin: string } }> = ({
  activity,
  viewport,
}) => {
  return (
    <motion.li
      className={`flex items-center gap-1.5 md:gap-4 ${itemType} py-2.5 md:py-2 whitespace-nowrap`}
      style={{ fontFamily: 'Space Grotesk, sans-serif' }}
      initial={{ opacity: 0.15, color: '#ffffff', textShadow: 'none' }}
      whileInView={{
        opacity: 1,
        color: '#ffffff',
        textShadow: '0 0 18px rgba(255,255,255,0.55)'
      }}
      viewport={viewport}
      transition={{ duration: 0.3 }}
    >
      <span>{activity}</span>
      <StickmanCanvas activity={activity} />
    </motion.li>
  );
};

const AndMoreItem: React.FC<{ viewport: { margin: string } }> = ({ viewport }) => {
  return (
    <motion.li
      className={`flex items-center gap-2 md:gap-4 ${itemType} py-2.5 md:py-2 min-h-[4.5rem] md:min-h-0 whitespace-nowrap`}
      style={{ fontFamily: 'Space Grotesk, sans-serif' }}
      initial={{ opacity: 0.15, color: '#ffffff', textShadow: 'none' }}
      whileInView={{
        opacity: 1,
        color: '#ffffff',
        textShadow: '0 0 18px rgba(255,255,255,0.55)',
      }}
      viewport={viewport}
      transition={{ duration: 0.3 }}
    >
      <motion.span
        className="relative inline-flex items-baseline"
        whileHover={{ letterSpacing: '0.035em' }}
        transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      >
        <motion.span
          animate={{
            textShadow: [
              '0 0 8px rgba(255,255,255,0.18)',
              '0 0 20px rgba(255,255,255,0.7)',
              '0 0 8px rgba(255,255,255,0.18)',
            ],
          }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          and more
        </motion.span>
        <span className="inline-flex w-[0.95em] ml-[0.02em]" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="inline-block"
              animate={{ opacity: [0.15, 1, 0.15], y: [1, -3.5, 1], scale: [0.82, 1.16, 0.82] }}
              transition={{
                duration: 1.5,
                delay: i * 0.18,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              .
            </motion.span>
          ))}
        </span>
      </motion.span>
      <span className="relative shrink-0 w-5 h-5 md:w-7 md:h-7 inline-flex items-center justify-center" aria-hidden="true">
        <motion.svg
          viewBox="0 0 24 24"
          className="w-full h-full drop-shadow-[0_0_7px_rgba(255,255,255,0.7)]"
          animate={{
            rotate: [0, 28, 0, -16, 0],
            scale: [0.82, 1.14, 0.9, 1.08, 0.82],
            opacity: [0.4, 1, 0.55, 1, 0.4],
          }}
          transition={{ duration: 4.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <path
            d="M12 1.2 L13.15 9.7 L21.8 12 L13.15 14.3 L12 22.8 L10.85 14.3 L2.2 12 L10.85 9.7 Z"
            fill="currentColor"
          />
        </motion.svg>
        <motion.span
          className="absolute -right-1.5 -top-0.5 w-1.5 h-1.5 rounded-full bg-white"
          animate={{ opacity: [0, 1, 0], scale: [0.4, 1.2, 0.4] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
        />
      </span>
    </motion.li>
  );
};

const ActivityScroller: React.FC = () => {
  const desktop = useDesktop();
  const viewport = {
    margin: desktop ? '-45% 0px -38% 0px' : '-38% 0px -22% 0px',
  };

  return (
    <div className="relative w-full pt-12 pb-10 md:pb-[18vh]">
      
      <div className="flex flex-row items-start w-full max-w-6xl mx-auto px-3 sm:px-4 md:px-12">
        
        {/* Sticky Left Section */}
        <h2 className={`sticky top-[40vh] md:top-[45vh] w-auto sm:w-[34%] md:w-1/2 m-0 h-fit min-h-[4.5rem] sm:min-h-0 flex items-center justify-end md:block ${itemType} text-white tracking-tighter text-right pr-2.5 md:pr-6 whitespace-normal sm:whitespace-nowrap`}>
          you can<br className="sm:hidden" /> log
        </h2>

        {/* Scrolling Right Section */}
        <ul className="flex-1 sm:w-[66%] md:w-1/2 min-w-0 m-0 p-0 pl-2.5 md:pl-6 list-none text-left overflow-visible">
          {activities.map((activity) => (
            <ActivityItem key={activity} activity={activity} viewport={viewport} />
          ))}
          <AndMoreItem viewport={viewport} />
        </ul>

      </div>
    </div>
  );
};

export default ActivityScroller;
