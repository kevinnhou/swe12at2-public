"use client";

import Logo from "@/components/logo";
import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-20rem)] bg-background">
      <motion.div
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
        initial={{ opacity: 0, scale: 0.5 }}
        transition={{ duration: 0.5 }}
      >
        <Logo className="w-24 h-24 mx-auto mb-4 text-primary" />
      </motion.div>
    </div>
  );
}
