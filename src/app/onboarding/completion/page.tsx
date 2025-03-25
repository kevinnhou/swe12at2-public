/* eslint-disable react/no-unescaped-entities */
"use client";

import { useRouter } from "next/navigation";

import { motion } from "framer-motion";

import { site } from "@/lib/config";

import Logo from "@/components/logo";

export default function Completion() {
  const router = useRouter();

  const handleTransition = () => {
    router.push("/dashboard");
  };

  return (
    <motion.div
      className="min-h-[calc(100vh-12rem)] flex flex-col items-center justify-center px-4 cursor-pointer relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      onClick={handleTransition}
    >
      <motion.div
        className="w-full max-w-2xl space-y-12 text-center"
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-full bg-background filter invert p-4 w-24 h-24 mx-auto flex items-center justify-center"
        >
          <Logo className="w-24 h-24 text-primary-foreground filter invert" />
        </motion.div>

        <div className="space-y-4">
          <motion.h1
            className="text-4xl font-bold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            You're{" "}
            <span className="bg-gradient-to-r from-[#FF100D] to-[#FF7903] text-transparent bg-clip-text">
              Ready to Go!
            </span>
          </motion.h1>
          <motion.p
            className="text-xl text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Your {site.name.short} workspace is set up and waiting for you.
          </motion.p>
        </div>
      </motion.div>
    </motion.div>
  );
}
