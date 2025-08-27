"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function AnimatedHero() {
  const router = useRouter();

  const handleStart = () => {
    router.push("/dashboard");
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-background via-background to-secondary/5">
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-background/50 to-background opacity-60" />

      {/* Central content */}
      <div className="absolute inset-0 flex items-center justify-center z-20 overflow-auto">
        <div className="text-center space-y-6">
          <motion.h1
            className="text-3xl sm:text-5xl md:text-7xl font-bold 
             bg-gradient-to-r from-primary via-primary/80 to-primary/60 
             bg-clip-text text-transparent px-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            Job Application Tracker
          </motion.h1>

          <motion.p
            className="text-base sm:text-lg md:text-2xl text-muted-foreground 
             max-w-md sm:max-w-2xl mx-auto px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            Track your job applications with style and precision. Watch your
            career opportunities come to life.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.1 }}
          >
            <button
              onClick={handleStart}
              className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Get Started
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
