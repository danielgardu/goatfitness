import React from 'react';
import ActivityScroller from './ActivityScroller';

const SEOContent: React.FC = () => {
  return (
    <section className="relative z-40 bg-black text-white pt-16 pb-0 md:pt-20 px-6 md:px-12 w-full max-w-6xl mx-auto flex flex-col font-sans">
      <div className="w-full -mx-6 md:-mx-12 px-6 md:px-12 bg-black/50">
        <ActivityScroller />
      </div>
    </section>
  );
};

export default SEOContent;
