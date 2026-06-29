import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useAnimationFrame } from 'framer-motion';

const images = [
  'homeinglesd.webp',
  'eee2.webp',
  'eee.webp',
  'eee3.webp',
  'runningsplash.webp',
  '1sheetroutine.webp',
  '1week.webp',
  '3week.webp',
  '2eat.webp',
  '3eat.webp',
  'sheetmusclerecovery.webp',
];

// Duplicate images to create an infinite loop effect
// We use 3 sets so we can start centered on the middle set without empty space on the left
const duplicatedImages = [...images, ...images, ...images];

const Carousel: React.FC = () => {
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [isDragging, setIsDragging] = useState(false);
  const isInitialized = useRef(false);

  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        const children = containerRef.current.children;
        // There are `images.length * 3` children total
        if (children.length > images.length) {
          const firstItem = children[0] as HTMLElement;
          const firstDuplicate = children[images.length] as HTMLElement;
          // The exact distance to shift back is the difference in their left positions
          const width = firstDuplicate.offsetLeft - firstItem.offsetLeft;
          setContainerWidth(width);

          // Center the first image of the second set on initial load
          if (!isInitialized.current && width > 0) {
            const centerOffset = (window.innerWidth / 2) - (firstDuplicate.offsetLeft + firstDuplicate.offsetWidth / 2);
            x.set(centerOffset);
            isInitialized.current = true;
          }
        }
      }
    };
    
    measure();
    // Use a slight timeout for the initial measure to ensure fonts/images are layouted
    setTimeout(measure, 100);
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [x]);

  useAnimationFrame((_time, delta) => {
    if (isDragging || containerWidth === 0) return;

    let moveBy = delta * 0.05; // Adjust speed here
    let currentX = x.get();
    
    // Auto-scroll from right to left
    currentX -= moveBy;

    // Reset position for infinite loop effect
    if (currentX <= -containerWidth) {
      currentX += containerWidth;
    } else if (currentX > 0) {
      // In case they drag it far right
      currentX -= containerWidth;
    }

    x.set(currentX);
  });

  return (
    <div className="w-full overflow-hidden py-10 relative">
      <motion.div
        ref={containerRef}
        className="flex gap-6 w-max cursor-grab active:cursor-grabbing px-6"
        style={{ x }}
        drag="x"
        dragConstraints={{ left: -containerWidth * 2, right: containerWidth }}
        dragElastic={0.1}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
        // dragTransition provides the momentum
        dragTransition={{ power: 0.2, timeConstant: 200 }}
        onUpdate={(latest) => {
          const currentX = Number(latest.x);
          // Manual wrap during drag if they drag too far
          if (currentX <= -containerWidth) {
             x.set(currentX + containerWidth);
          } else if (currentX > 0) {
             x.set(currentX - containerWidth);
          }
        }}
      >
        {duplicatedImages.map((src, index) => (
          <div 
            key={index} 
            className="shrink-0 w-[240px] md:w-[280px] lg:w-[320px] rounded-[2rem] overflow-hidden shadow-xl"
            style={{ pointerEvents: 'none' /* Prevents image dragging */ }}
          >
            <img
              src={`/${src}`}
              alt={`GOAT screenshot ${index}`}
              className="w-full h-auto object-cover select-none pointer-events-none"
              draggable={false}
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default Carousel;
