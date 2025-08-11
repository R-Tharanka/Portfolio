import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import SEO from './SEO';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home, Sparkles } from 'lucide-react';

/*
  404 Not Found Page
  - Playful + mysterious vibe with subtle particle orbit + parallax glow
  - Adapts to dark / light theme
  - Provides quick routes back home & anchor scroll shortcuts (if user landed here internally)
*/

const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

const ParticleField: React.FC<{ count?: number }> = ({ count = 48 }) => {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    size: randomInRange(3, 7),
    duration: randomInRange(10, 26),
    delay: randomInRange(-15, 0),
    // Position across viewport (percentage)
    x: randomInRange(0, 100),
    y: randomInRange(0, 100),
    driftX: randomInRange(20, 120),
    driftY: randomInRange(15, 90),
    phase: Math.random() * Math.PI * 2,
  opacityPeak: randomInRange(0.35, 0.8),
  glowColor: Math.random() > 0.5 ? '#5d6bf3' : '#fb923c',
  glowCycle: randomInRange(8, 16)
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map(p => {
        // Generate looping keyframes for organic drifting (elliptical-ish)
        const steps = 5;
        const xKeyframes: number[] = [];
        const yKeyframes: number[] = [];
        for (let s = 0; s < steps; s++) {
          const t = (s / (steps - 1)) * Math.PI * 2;
            // elliptical path with individual phase offset
          xKeyframes.push(Math.cos(t + p.phase) * p.driftX);
          yKeyframes.push(Math.sin(t + p.phase) * p.driftY * 0.6);
        }
        // ensure seamless loop by repeating first coordinate implicitly
        const glowTimes = [0, 0.65, 0.7, 1]; // brief glow window
        const baseBg = 'rgba(59,130,246,0.30)'; // Tailwind primary 500
        const glowBg = p.glowColor + 'CC'; // add alpha
        return (
          <motion.span
            key={p.id}
            className="absolute rounded-full blur-[1px] will-change-transform"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.x}%`,
              top: `${p.y}%`,
              marginLeft: -p.size / 2,
              marginTop: -p.size / 2,
              backgroundColor: baseBg
            }}
            initial={{ opacity: 0, scale: 1 }}
            animate={{
              opacity: [0, p.opacityPeak, p.opacityPeak, 0],
              x: xKeyframes,
              y: yKeyframes,
              backgroundColor: [baseBg, baseBg, glowBg, baseBg],
              boxShadow: [
                '0 0 0px rgba(0,0,0,0)',
                '0 0 0px rgba(0,0,0,0)',
                `0 0 14px ${p.glowColor}AA, 0 0 22px ${p.glowColor}66`,
                '0 0 0px rgba(0,0,0,0)'
              ],
              scale: [1, 1, 1.35, 1]
            }}
            transition={{
              opacity: { repeat: Infinity, duration: p.duration, delay: p.delay, ease: 'linear' },
              x: { repeat: Infinity, duration: p.duration, delay: p.delay, ease: 'linear' },
              y: { repeat: Infinity, duration: p.duration, delay: p.delay, ease: 'linear' },
              backgroundColor: { repeat: Infinity, duration: p.glowCycle, delay: p.delay, ease: 'easeInOut', times: glowTimes },
              boxShadow: { repeat: Infinity, duration: p.glowCycle, delay: p.delay, ease: 'easeInOut', times: glowTimes },
              scale: { repeat: Infinity, duration: p.glowCycle, delay: p.delay, ease: 'easeInOut', times: glowTimes }
            }}
          />
        );
      })}
    </div>
  );
};

const Floating404: React.FC = () => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-80, 80], [15, -15]);
  const rotateY = useTransform(x, [-80, 80], [-15, 15]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      x.set((e.clientX - innerWidth / 2) / 8);
      y.set((e.clientY - innerHeight / 2) / 8);
    };
    window.addEventListener('pointermove', handler);
    return () => window.removeEventListener('pointermove', handler);
  }, [x, y]);

  return (
    <motion.div
      className="relative select-none"
      style={{ perspective: 1000 }}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <motion.div
        style={{ rotateX, rotateY }}
        className="relative"
      >
        <div className="text-[10rem] md:text-[14rem] font-extrabold leading-none tracking-tighter bg-gradient-to-br from-primary via-secondary to-accent bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(59,130,246,0.35)]">
          404
        </div>
        <motion.div
          className="absolute inset-0 -z-10 blur-3xl opacity-40"
          style={{
            background: 'radial-gradient(circle at 40% 55%, rgba(var(--color-primary)/0.6), transparent), radial-gradient(circle at 70% 40%, rgba(var(--color-secondary)/0.4), transparent)'
          }}
          animate={{ opacity: [0.3, 0.55, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </motion.div>
  );
};

const phrases = [
  'Lost in the code nebula',
  'This route slipped into a black hole',
  'You discovered a void',
  'Nothing renders here (yet)',
  'A wild 404 appears'
];

const NotFound: React.FC = () => {
  const [phrase, setPhrase] = useState(phrases[0]);

  useEffect(() => {
    setPhrase(phrases[Math.floor(Math.random() * phrases.length)]);
  }, []);

  return (
    <>
      <SEO
        title="404 | Page Not Found"
        description="The page you are looking for does not exist or has been moved. Return to the portfolio home to continue exploring projects, skills, and contact information."
        ogUrl={typeof window !== 'undefined' ? window.location.href : undefined}
      />
      {/* <Header /> */}
      <div className="min-h-screen flex flex-col relative overflow-hidden">
        <ParticleField />
        <div className="flex-1 flex flex-col items-center justify-center px-6 pt-56 pb-24 text-center">
          <Floating404 />
          <AnimatePresence mode="wait">
            <motion.p
              key={phrase}
              className="mt-6 text-lg md:text-xl font-medium text-foreground/70 dark:text-foreground/80"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
            >
              {phrase}
            </motion.p>
          </AnimatePresence>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary/90 via-secondary/90 to-accent/90 text-white font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Home size={18} /> Back to Home
            </Link>
            <button
              onClick={() => setPhrase(phrases[Math.floor(Math.random() * phrases.length)])}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-card/70 backdrop-blur-md border border-border/60 text-foreground/80 hover:text-foreground hover:bg-card/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Sparkles size={18} /> New Message
            </button>
          </div>
          <div className="mt-12 flex items-center gap-2 text-xs text-foreground/40">
            <ArrowLeft size={14} /> You can head back home or generate a new message.
          </div>
        </div>
        {/* <Footer /> */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(var(--color-primary)/0.12),transparent_60%),radial-gradient(circle_at_80%_70%,rgba(var(--color-secondary)/0.1),transparent_65%)]" />
        <div className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-40 dark:opacity-30" style={{ backgroundImage: 'linear-gradient(125deg, rgba(255,255,255,0.05) 0%, transparent 60%)' }} />
      </div>
    </>
  );
};

export default NotFound;
