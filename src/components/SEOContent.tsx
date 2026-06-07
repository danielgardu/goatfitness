import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ActivityScroller from './ActivityScroller';
import FeatureShowcase from './FeatureShowcase';
import ShimmerFAQ from './ShimmerFAQ';

/**
 * SEOContent - Optimized section for Search Engines and AI Overviews.
 * Includes structured headings, FAQs, and clear answers.
 */
const SEOContent: React.FC = () => {
  return (
    <section className="relative z-40 bg-black text-white py-20 px-6 md:px-12 w-full max-w-5xl mx-auto flex flex-col gap-16 font-sans">
      
      {/* Horizontal Scroll Feature Showcase */}
      <div className="w-screen relative left-[50%] right-[50%] -ml-[50vw] -mr-[50vw]">
        <FeatureShowcase />
      </div>

      {/* ULTRA WOW Apple Watch & Activities Scroller */}
      <div className="w-full -mx-6 md:-mx-12 px-6 md:px-12 bg-black/50">
        <ActivityScroller />
      </div>

      {/* Shimmer FAQ Section */}
      <div className="w-screen relative left-[50%] right-[50%] -ml-[50vw] -mr-[50vw]">
        <ShimmerFAQ />
      </div>



    </section>
  );
};

export default SEOContent;
