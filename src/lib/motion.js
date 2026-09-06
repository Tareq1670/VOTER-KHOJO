import { motion } from "framer-motion";

// Shared motion variants — single source of truth for entrances across the app.
// Use with: initial="hidden" animate="visible" variants={fadeUp} custom={delay}

export const EASE = [0.16, 1, 0.3, 1];

export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay, ease: EASE },
  }),
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: (delay = 0) => ({
    opacity: 1,
    transition: { duration: 0.4, delay, ease: EASE },
  }),
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: (delay = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, delay, ease: EASE },
  }),
};

export const staggerContainer = {
  hidden: {},
  visible: (delay = 0) => ({
    transition: { staggerChildren: 0.06, delayChildren: delay },
  }),
};

export const fadeUpItem = {
  hidden: { opacity: 0, y: 14 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay, ease: EASE },
  }),
};

// Spring used for slide-in panels
export const slideInSpring = { type: "spring", damping: 28, stiffness: 300 };

// Animated wrapper for list rows / cards that stagger in on mount.
export function StaggerGroup({ children, className, delay = 0, itemDelay = 0 }) {
  return (
    <motion.div
      className={className}
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      custom={delay}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className, delay = 0 }) {
  return (
    <motion.div
      className={className}
      variants={fadeUpItem}
      initial="hidden"
      animate="visible"
      custom={delay}
    >
      {children}
    </motion.div>
  );
}
