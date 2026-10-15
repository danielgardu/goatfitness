import React, { useEffect, useRef, useState } from 'react';
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

const FONT = { fontFamily: 'Space Grotesk, sans-serif' } as const;

// Below 640px the stage sets --activity-size. sm/md keep the previous scale.
const itemType =
  'sm:text-[1.5rem] md:text-[clamp(2rem,5vw,4.5rem)] font-bold tracking-tight leading-tight';

const rowLayout =
  'flex items-center gap-[0.32em] sm:gap-1.5 md:gap-4 py-[0.62em] sm:py-2.5 md:py-2 whitespace-nowrap';

function smoothstep(t: number) {
  const x = Math.max(0, Math.min(1, t));
  return x * x * (3 - 2 * x);
}

function useDesktop() {
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = () => setDesktop(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return desktop;
}

function fitActivitySize(stage: HTMLElement) {
  const mobile = window.matchMedia('(max-width: 639px)').matches;
  if (!mobile) {
    stage.style.removeProperty('--activity-size');
    return;
  }

  const overflows = () => {
    const rows = stage.querySelectorAll<HTMLElement>('[data-activity-row]');
    for (const row of rows) {
      if (row.scrollWidth > row.clientWidth + 1) return true;
    }
    return stage.scrollWidth > stage.clientWidth + 1;
  };

  let lo = 12;
  let hi = 21;
  let best = 14;
  for (let i = 0; i < 10; i++) {
    const mid = (lo + hi) / 2;
    stage.style.setProperty('--activity-size', `${mid}px`);
    if (!overflows()) {
      best = mid;
      lo = mid;
    } else {
      hi = mid;
    }
  }
  stage.style.setProperty('--activity-size', `${Math.max(12, best - 0.35).toFixed(2)}px`);
}

function clearActivityFocus(list: HTMLElement, log: HTMLElement) {
  log.style.opacity = '';
  log.style.transform = '';
  log.style.textShadow = '';
  log.removeAttribute('aria-hidden');
  list.querySelectorAll<HTMLElement>('[data-activity-row]').forEach((el) => {
    el.style.opacity = '';
    el.style.transform = '';
    el.style.zIndex = '';
    const name = el.querySelector<HTMLElement>('[data-activity-name]');
    if (name) name.style.textShadow = '';
    const icon = el.querySelector<HTMLElement>('[data-activity-icon]');
    if (icon) {
      icon.style.transform = '';
      icon.style.filter = '';
    }
  });
}

// Scroll-locked spotlight. The phrase stays on the row whose center crosses
// the label, and dissolves once "and more" takes that slot.
// Focal geometry comes from the sticky heading, not the fading span:
// transforming the span would move the measure and fight the fade.
function applyActivityFocus(list: HTMLElement, log: HTMLElement, anchor: HTMLElement, reduced: boolean) {
  const items = list.querySelectorAll<HTMLElement>('[data-activity-row]');
  if (!items.length) return;

  const anchorRect = anchor.getBoundingClientRect();
  const focal = anchorRect.top + anchorRect.height / 2;
  let hide = 0;

  items.forEach((el) => {
    const rect = el.getBoundingClientRect();
    const mid = rect.top + rect.height / 2;
    const rowH = Math.max(rect.height, 24);
    const signed = (mid - focal) / rowH;
    const dist = Math.abs(signed);
    const influence = Math.exp(-dist * dist * 1.25);
    const opacity = reduced ? (dist < 0.7 ? 1 : 0.26) : 0.045 + influence * 0.955;
    const isAndMore = el.dataset.andMore === 'true';
    const scale = reduced ? 1 : 0.965 + influence * (isAndMore ? 0.07 : 0.045);
    let x = 0;

    if (isAndMore) {
      // Gone once the closer is nearly in the slot, so the two never read as one phrase.
      if (signed <= 0.22) hide = 1;
      else hide = smoothstep(1 - Math.min((signed - 0.22) / 0.68, 1));
      const shift = signed >= 0.22 ? 0 : signed <= 0 ? 1 : 1 - signed / 0.22;
      if (!reduced) x = -shift * Math.min(anchorRect.width * 0.5, 84);
    }

    el.style.opacity = opacity.toFixed(3);
    el.style.transform = `translate3d(${x.toFixed(2)}px,0,0) scale(${scale.toFixed(4)})`;
    el.style.zIndex = String(Math.round(influence * 8));

    const name = el.querySelector<HTMLElement>('[data-activity-name]');
    if (name) {
      const glow = reduced ? 0 : influence;
      name.style.textShadow = glow < 0.08
        ? 'none'
        : `0 0 ${(7 + glow * 16).toFixed(1)}px rgba(255,255,255,${(0.16 + glow * 0.5).toFixed(3)})`;
    }

    const icon = el.querySelector<HTMLElement>('[data-activity-icon]');
    if (icon) {
      const iconScale = reduced ? 1 : 0.9 + influence * 0.16;
      icon.style.transform = `scale(${iconScale.toFixed(4)})`;
      icon.style.filter = !reduced && influence > 0.42
        ? `drop-shadow(0 0 ${(2.5 + influence * 8).toFixed(1)}px rgba(255,255,255,${(0.22 + influence * 0.5).toFixed(3)}))`
        : 'none';
    }
  });

  const fade = 1 - hide;
  log.style.opacity = fade < 0.04 ? '0' : fade.toFixed(3);
  log.style.transform = reduced ? 'none' : `translate3d(0, ${(-hide * 4).toFixed(2)}px, 0)`;
  log.style.textShadow = fade < 0.05
    ? 'none'
    : `0 0 ${(14 * fade).toFixed(1)}px rgba(255,255,255,${(0.38 * fade).toFixed(3)})`;
  const hidden = fade < 0.08;
  if ((log.getAttribute('aria-hidden') === 'true') !== hidden) {
    if (hidden) log.setAttribute('aria-hidden', 'true');
    else log.removeAttribute('aria-hidden');
  }
}

const ActivityItem: React.FC<{
  activity: string;
  viewport: { margin: string };
  compact: boolean;
}> = ({ activity, viewport, compact }) => {
  const className = `relative ${rowLayout} ${itemType}`;
  const body = (
    <>
      <span data-activity-name={compact ? '' : undefined}>{activity}</span>
      {compact ? (
        <span data-activity-icon className="inline-flex origin-center">
          <StickmanCanvas activity={activity} />
        </span>
      ) : (
        <StickmanCanvas activity={activity} />
      )}
    </>
  );

  if (compact) {
    return (
      <li
        data-activity-row
        className={`${className} origin-left`}
        style={FONT}
      >
        {body}
      </li>
    );
  }

  return (
    <motion.li
      className={className}
      style={FONT}
      initial={{ opacity: 0.15, color: '#ffffff', textShadow: 'none' }}
      whileInView={{
        opacity: 1,
        color: '#ffffff',
        textShadow: '0 0 18px rgba(255,255,255,0.55)'
      }}
      viewport={viewport}
      transition={{ duration: 0.3 }}
    >
      {body}
    </motion.li>
  );
};

const AndMoreItem: React.FC<{ viewport: { margin: string }; compact: boolean }> = ({
  viewport,
  compact,
}) => {
  const className = `relative flex items-center gap-[0.4em] sm:gap-2 md:gap-4 ${itemType} py-[0.62em] sm:py-2.5 md:py-2 min-h-0 sm:min-h-[4.5rem] md:min-h-0 whitespace-nowrap`;
  const body = (
    <>
      <motion.span
        data-activity-name={compact ? '' : undefined}
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
      <span
        {...(compact ? { 'data-activity-icon': '' } : {})}
        className="relative shrink-0 w-5 h-5 md:w-7 md:h-7 inline-flex items-center justify-center origin-center"
        aria-hidden="true"
      >
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
    </>
  );

  if (compact) {
    return (
      <li
        data-activity-row
        data-and-more="true"
        className={`${className} origin-left`}
        style={FONT}
      >
        {body}
      </li>
    );
  }

  return (
    <motion.li
      className={className}
      style={FONT}
      initial={{ opacity: 0.15, color: '#ffffff', textShadow: 'none' }}
      whileInView={{
        opacity: 1,
        color: '#ffffff',
        textShadow: '0 0 18px rgba(255,255,255,0.55)',
      }}
      viewport={viewport}
      transition={{ duration: 0.3 }}
    >
      {body}
    </motion.li>
  );
};

const ActivityScroller: React.FC = () => {
  const desktop = useDesktop();
  const compact = !desktop;
  const sectionRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const labelRef = useRef<HTMLHeadingElement>(null);
  const logRef = useRef<HTMLSpanElement>(null);
  const viewport = {
    margin: desktop ? '-45% 0px -38% 0px' : '-38% 0px -22% 0px',
  };

  useEffect(() => {
    if (!compact) return;
    const stage = stageRef.current;
    if (!stage) return;

    let alive = true;
    const fit = () => {
      if (alive) fitActivitySize(stage);
    };
    fit();
    window.addEventListener('resize', fit);
    document.fonts?.ready.then(fit);

    return () => {
      alive = false;
      window.removeEventListener('resize', fit);
      stage.style.removeProperty('--activity-size');
    };
  }, [compact]);

  useEffect(() => {
    if (!compact) return;
    const section = sectionRef.current;
    const list = listRef.current;
    const log = logRef.current;
    const anchor = labelRef.current;
    if (!section || !list || !log || !anchor) return;

    let frame = 0;
    let running = false;
    const reducedMq = window.matchMedia('(prefers-reduced-motion: reduce)');

    const tick = () => {
      if (!running) return;
      applyActivityFocus(list, log, anchor, reducedMq.matches);
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running) return;
      running = true;
      frame = requestAnimationFrame(tick);
    };

    const stop = () => {
      running = false;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };

    const io = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) start();
      else stop();
    }, { rootMargin: '35% 0px' });
    io.observe(section);

    return () => {
      stop();
      io.disconnect();
      clearActivityFocus(list, log);
    };
  }, [compact]);

  return (
    <div ref={sectionRef} className="relative w-full pt-12 pb-10 md:pb-[18vh]">
      <div
        ref={stageRef}
        className="activity-stage flex flex-row items-start w-full max-w-6xl mx-auto px-1.5 sm:px-4 md:px-12"
      >
        <h2 ref={labelRef} className={`sticky top-[36vh] sm:top-[40vh] md:top-[45vh] w-auto shrink-0 sm:shrink sm:w-[34%] md:w-1/2 m-0 h-fit min-h-0 flex items-center justify-end md:block ${itemType} text-white tracking-tighter text-right pr-[0.4em] sm:pr-2.5 md:pr-6 whitespace-nowrap`}>
          <span ref={logRef} data-log-label className="inline-block">
            you can log
          </span>
        </h2>

        <ul
          ref={listRef}
          className="flex-1 sm:w-[66%] md:w-1/2 min-w-0 m-0 p-0 pl-[0.35em] sm:pl-2.5 md:pl-6 pb-[32vh] md:pb-0 list-none text-left overflow-visible"
        >
          {activities.map((activity) => (
            <ActivityItem key={activity} activity={activity} viewport={viewport} compact={compact} />
          ))}
          <AndMoreItem viewport={viewport} compact={compact} />
        </ul>
      </div>
    </div>
  );
};

export default ActivityScroller;
