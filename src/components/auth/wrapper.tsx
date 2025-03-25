"use client";

import type { ReactNode } from "react";

import Logo from "@/components/logo";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

interface AuthWrapperProps {
  children: ((props: {
    goToNext: () => void;
    goToPrevious: () => void;
  }) => ReactNode)[];
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    document.documentElement.style.setProperty("--animation-duration", "150ms");
  }, []);

  function goToNext() {
    setCurrentIndex((prevIndex) =>
      prevIndex < children.length - 1 ? prevIndex + 1 : prevIndex
    );
  }

  function goToPrevious() {
    setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : prevIndex));
  }

  return (
    <div className="min-h-[calc(100vh-16rem)] bg-background flex flex-col items-center justify-start p-4">
      <div className="w-full max-w-md mt-[max(0px,calc(-240px+100svh/2))]">
        <div className="flex justify-center mb-8">
          <Logo className="h-8 w-8" />
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.95 }}
            key={currentIndex}
            transition={{ duration: 0.15, ease: "easeInOut" }}
          >
            {children[currentIndex]({ goToNext, goToPrevious })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
