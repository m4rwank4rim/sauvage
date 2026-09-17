"use client";

import React from "react";
import { motion, Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

export interface StaggeredContainerProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  stagger?: number;
}

export const StaggeredContainer: React.FC<StaggeredContainerProps> = ({
  children,
  className = "",
  delay = 0.1,
  stagger = 0.08,
}) => {
  const customVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={customVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export interface StaggeredItemProps {
  children: React.ReactNode;
  className?: string;
  customVariants?: Variants;
  index?: number;
}

export const StaggeredItem: React.FC<StaggeredItemProps> = ({
  children,
  className = "",
  customVariants,
  index,
}) => {
  return (
    <motion.div
      variants={customVariants || itemVariants}
      className={className}
      style={{ ["--stagger-index" as any]: index }}
    >
      {children}
    </motion.div>
  );
};

export const StaggeredSection: React.FC<{
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
}> = ({ children, className = "", stagger = 0.08, delay = 0.1 }) => {
  const childArray = React.Children.toArray(children);
  return (
    <div className={className}>
      {childArray.map((child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94],
            delay: delay + index * stagger,
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
};

export const FadeInUp: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}> = ({ children, className = "", delay = 0, duration = 0.5 }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration, ease: [0.25, 0.46, 0.45, 0.94], delay }}
    className={className}
  >
    {children}
  </motion.div>
);

export const FadeIn: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}> = ({ children, className = "", delay = 0, duration = 0.4 }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration, ease: "easeOut", delay }}
    className={className}
  >
    {children}
  </motion.div>
);

export const ScaleIn: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}> = ({ children, className = "", delay = 0, duration = 0.4 }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration, ease: [0.25, 0.46, 0.45, 0.94], delay }}
    className={className}
  >
    {children}
  </motion.div>
);

export const SlideInLeft: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}> = ({ children, className = "", delay = 0, duration = 0.5 }) => (
  <motion.div
    initial={{ opacity: 0, x: -32 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration, ease: [0.25, 0.46, 0.45, 0.94], delay }}
    className={className}
  >
    {children}
  </motion.div>
);

export const SlideInRight: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}> = ({ children, className = "", delay = 0, duration = 0.5 }) => (
  <motion.div
    initial={{ opacity: 0, x: 32 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration, ease: [0.25, 0.46, 0.45, 0.94], delay }}
    className={className}
  >
    {children}
  </motion.div>
);