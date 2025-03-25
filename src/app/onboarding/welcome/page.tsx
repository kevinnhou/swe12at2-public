"use client";

import { useEffect } from "react";

import { useAnimation, motion } from "framer-motion";

import { site } from "@/lib/config";

import Logo from "@/components/logo";

import { ArrowRight } from "lucide-react";

export default function Welcome() {
  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      x: [0, 10, 0],
      transition: {
        duration: 1.5,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      },
    });
  }, [controls]);

  return (
    <motion.div
      className="min-h-[calc(100vh-20rem)] flex flex-col items-center justify-center cursor-pointer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="flex flex-col items-center gap-12"
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-full bg-background filter invert p-4 w-24 h-24 flex items-center justify-center"
        >
          <Logo className="w-24 h-24 text-primary-foreground filter invert" />
        </motion.div>

        <div className="flex flex-col items-center">
          <motion.span
            className="text-2xl text-muted-foreground font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Welcome to
          </motion.span>
          <motion.h1
            className="text-7xl font-bold p-2 bg-gradient-to-r from-[#FF100D] to-[#FF7903] text-transparent bg-clip-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {site.name.short}
          </motion.h1>
        </div>
      </motion.div>
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <span className="mr-2">Click anywhere to continue</span>
        <motion.div animate={controls}>
          <ArrowRight size={24} />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
