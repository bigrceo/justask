"use client";

import { motion, type HTMLMotionProps } from "motion/react";

type Props = HTMLMotionProps<"div"> & { delay?: number; y?: number; once?: boolean };

/** Fade + rise on scroll, the template's default entrance for blocks. */
export function Reveal({ delay = 0, y = 16, once = true, children, ...rest }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y, filter: "blur(2px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once, amount: 0.15 }}
      transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
