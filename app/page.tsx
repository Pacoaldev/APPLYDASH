"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  Target, 
  BarChart3, 
  LayoutGrid, 
  Shield, 
  CheckCircle2, 
  Sparkles, 
  Briefcase, 
  Clock, 
  TrendingUp,
  MapPin,
  DollarSign
} from "lucide-react";
import { useLocale } from "@/components/locale-provider";

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeDemoColumn, setActiveDemoColumn] = useState<"applied" | "interviewing" | "offer">("applied");
  const [activeTab, setActiveTab] = useState<"tracking" | "analytics" | "kanban">("tracking");
  const [showCelebration, setShowCelebration] = useState(false);
  const router = useRouter();
  const { t } = useLocale();

  useEffect(() => {
    setIsLoaded(true);
    const checkSession = async () => {
      try {
        const { createClient } = await import("@/utils/supabase/client");
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setIsLoggedIn(!!session?.user);
      } catch {
        setIsLoggedIn(false);
      }
    };
    checkSession();
  }, []);

  // Update celebration state when demo card reaches 'offer'
  useEffect(() => {
    if (activeDemoColumn === "offer") {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 5000);
      return () => clearTimeout(timer);
    } else {
      setShowCelebration(false);
    }
  }, [activeDemoColumn]);

  // Demo stats calculator based on card position
  const getDemoStats = () => {
    switch (activeDemoColumn) {
      case "applied":
        return { active: 12, rate: "33%", interviews: 2 };
      case "interviewing":
        return { active: 13, rate: "50%", interviews: 3 };
      case "offer":
        return { active: 12, rate: "58%", interviews: 3 };
    }
  };

  const stats = getDemoStats();

  const handleStart = () => {
    router.push(isLoggedIn ? "/dashboard" : "/login");
  };

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden transition-colors duration-300">
      {/* Dynamic Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/20 dark:bg-blue-600/10 blur-[120px] animate-pulse duration-8000" />
        <div className="absolute top-[40%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-400/15 dark:bg-purple-600/10 blur-[130px] animate-pulse duration-10000" />
        <div className="absolute bottom-[-10%] left-[20%] w-[45%] h-[45%] rounded-full bg-indigo-400/20 dark:bg-indigo-600/10 blur-[110px] animate-pulse duration-9000" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
        {/* HERO SECTION */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2 bg-blue-100/80 dark:bg-blue-900/30 border border-blue-200/50 dark:border-blue-800/40 rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium text-blue-800 dark:text-blue-300 mb-6 backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin duration-10000" />
            <span>ApplyDash v2.0 Live</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-tight sm:leading-none"
          >
            {t.landing.title}{" "}
            <span className="bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent drop-shadow-sm">
              {t.landing.titleHighlight}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg sm:text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed"
          >
            {t.landing.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={handleStart}
              className="group relative w-full sm:w-auto bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-3 cursor-pointer"
            >
              <span>{t.landing.cta}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </motion.div>
        </div>

        {/* METRICS & MILESTONES */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-24 relative"
        >
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl p-8 border border-slate-200/50 dark:border-slate-800/50 text-center shadow-xl shadow-slate-100/50 dark:shadow-none hover:border-blue-500/30 transition-all duration-300">
            <h3 className="text-4xl font-extrabold text-blue-600 dark:text-blue-400 mb-2">{t.landing.milestone1Number}</h3>
            <p className="text-slate-600 dark:text-slate-300 font-medium">{t.landing.milestone1Label}</p>
          </div>
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl p-8 border border-slate-200/50 dark:border-slate-800/50 text-center shadow-xl shadow-slate-100/50 dark:shadow-none hover:border-indigo-500/30 transition-all duration-300">
            <h3 className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 mb-2">{t.landing.milestone2Number}</h3>
            <p className="text-slate-600 dark:text-slate-300 font-medium">{t.landing.milestone2Label}</p>
          </div>
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl p-8 border border-slate-200/50 dark:border-slate-800/50 text-center shadow-xl shadow-slate-100/50 dark:shadow-none hover:border-purple-500/30 transition-all duration-300">
            <h3 className="text-4xl font-extrabold text-purple-600 dark:text-purple-400 mb-2">{t.landing.milestone3Number}</h3>
            <p className="text-slate-600 dark:text-slate-300 font-medium">{t.landing.milestone3Label}</p>
          </div>
        </motion.div>

        {/* INTERACTIVE DEMO (MINI KANBAN + STATS) */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 sm:p-8 max-w-5xl mx-auto mb-28 shadow-2xl relative"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-1.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive Simulator</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold">{t.landing.demoTitle}</h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base mt-2">
              {t.landing.demoSubtitle}
            </p>
          </div>

          {/* Celebration Banner */}
          <AnimatePresence>
            {showCelebration && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                className="absolute top-2 left-4 right-4 bg-linear-to-r from-emerald-500 to-teal-600 text-white text-center py-3 px-6 rounded-2xl shadow-lg z-20 font-bold flex items-center justify-center space-x-2"
              >
                <CheckCircle2 className="w-5 h-5 animate-bounce" />
                <span>{t.landing.demoCelebration}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Simulated Stats Bar */}
          <div className="grid grid-cols-3 gap-4 mb-8 bg-white/80 dark:bg-slate-950/70 rounded-2xl p-4 border border-slate-200/50 dark:border-slate-800/50">
            <div className="text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t.landing.demoStatsActive}</p>
              <motion.p key={stats.active} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white mt-1">
                {stats.active}
              </motion.p>
            </div>
            <div className="text-center border-x border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t.landing.demoStatsResponse}</p>
              <motion.p key={stats.rate} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                {stats.rate}
              </motion.p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t.landing.demoStatsInterviews}</p>
              <motion.p key={stats.interviews} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                {stats.interviews}
              </motion.p>
            </div>
          </div>

          {/* Mini-Kanban Board */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-auto min-h-55">
            {/* Column 1: Applied */}
            <div 
              onClick={() => setActiveDemoColumn("applied")}
              className={`rounded-2xl p-4 transition-all duration-300 cursor-pointer border ${
                activeDemoColumn === "applied" 
                  ? "bg-blue-500/5 border-blue-500/30 shadow-inner" 
                  : "bg-slate-100/50 dark:bg-slate-900/50 border-slate-200/40 dark:border-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-900"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{t.landing.demoApplied}</span>
                <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-semibold">
                  {activeDemoColumn === "applied" ? "1" : "0"}
                </span>
              </div>
              <div className="min-h-35 flex items-center justify-center">
                {activeDemoColumn === "applied" && <DemoJobCard />}
              </div>
            </div>

            {/* Column 2: Interviewing */}
            <div 
              onClick={() => setActiveDemoColumn("interviewing")}
              className={`rounded-2xl p-4 transition-all duration-300 cursor-pointer border ${
                activeDemoColumn === "interviewing" 
                  ? "bg-amber-500/5 border-amber-500/30 shadow-inner" 
                  : "bg-slate-100/50 dark:bg-slate-900/50 border-slate-200/40 dark:border-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-900"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{t.landing.demoInterviewing}</span>
                <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-semibold">
                  {activeDemoColumn === "interviewing" ? "1" : "0"}
                </span>
              </div>
              <div className="min-h-35 flex items-center justify-center">
                {activeDemoColumn === "interviewing" && <DemoJobCard color="amber" />}
              </div>
            </div>

            {/* Column 3: Offer */}
            <div 
              onClick={() => setActiveDemoColumn("offer")}
              className={`rounded-2xl p-4 transition-all duration-300 cursor-pointer border relative overflow-hidden ${
                activeDemoColumn === "offer" 
                  ? "bg-emerald-500/5 border-emerald-500/30 shadow-inner" 
                  : "bg-slate-100/50 dark:bg-slate-900/50 border-slate-200/40 dark:border-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-900"
              }`}
            >
              {activeDemoColumn === "offer" && (
                <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none animate-pulse" />
              )}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{t.landing.demoOffer}</span>
                <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-semibold">
                  {activeDemoColumn === "offer" ? "1" : "0"}
                </span>
              </div>
              <div className="min-h-35 flex items-center justify-center">
                {activeDemoColumn === "offer" && <DemoJobCard color="emerald" />}
              </div>
            </div>
          </div>
        </motion.div>

        {/* INTERACTIVE FEATURES TABS SHOWCASE */}
        <div className="max-w-5xl mx-auto mb-28">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              {t.landing.featuresTitle}
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mt-2">
              {t.landing.featuresSubtitle}
            </p>
          </div>

          {/* Tabs header selector */}
          <div className="flex justify-center p-1 bg-slate-200/50 dark:bg-slate-900/80 rounded-2xl max-w-lg mx-auto mb-10 border border-slate-300/30 dark:border-slate-800/40">
            <button
              onClick={() => setActiveTab("tracking")}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${
                activeTab === "tracking"
                  ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-md"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Target className="w-4 h-4" />
              <span>{t.landing.smartTracking}</span>
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${
                activeTab === "analytics"
                  ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-md"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>{t.landing.analytics}</span>
            </button>
            <button
              onClick={() => setActiveTab("kanban")}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${
                activeTab === "kanban"
                  ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-md"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>{t.landing.kanban}</span>
            </button>
          </div>

          {/* Tabs Content */}
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-200/50 dark:border-slate-800/50 p-6 sm:p-8 min-h-75 flex flex-col md:flex-row items-center gap-8 shadow-xl">
            <div className="flex-1 space-y-4">
              {activeTab === "tracking" && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center space-x-2">
                    <Target className="w-6 h-6 text-blue-500" />
                    <span>{t.landing.demoTabTrackingTitle}</span>
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed mt-4">
                    {t.landing.demoTabTrackingDesc}
                  </p>
                  <ul className="space-y-2 mt-6">
                    <li className="flex items-center space-x-2.5 text-sm text-slate-600 dark:text-slate-400">
                      <CheckCircle2 className="w-4.5 h-4.5 text-blue-500" />
                      <span>Filtros rápidos e inteligentes para candidaturas prioritarias.</span>
                    </li>
                    <li className="flex items-center space-x-2.5 text-sm text-slate-600 dark:text-slate-400">
                      <CheckCircle2 className="w-4.5 h-4.5 text-blue-500" />
                      <span>Atajos de teclado rápidos para guardar y añadir ofertas.</span>
                    </li>
                  </ul>
                </motion.div>
              )}
              {activeTab === "analytics" && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center space-x-2">
                    <BarChart3 className="w-6 h-6 text-indigo-500" />
                    <span>{t.landing.demoTabAnalyticsTitle}</span>
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed mt-4">
                    {t.landing.demoTabAnalyticsDesc}
                  </p>
                  <ul className="space-y-2 mt-6">
                    <li className="flex items-center space-x-2.5 text-sm text-slate-600 dark:text-slate-400">
                      <CheckCircle2 className="w-4.5 h-4.5 text-indigo-500" />
                      <span>Reportes automatizados y tasas de conversión de ofertas.</span>
                    </li>
                    <li className="flex items-center space-x-2.5 text-sm text-slate-600 dark:text-slate-400">
                      <CheckCircle2 className="w-4.5 h-4.5 text-indigo-500" />
                      <span>Seguimiento de actividad semanal para mantenerte constante.</span>
                    </li>
                  </ul>
                </motion.div>
              )}
              {activeTab === "kanban" && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center space-x-2">
                    <LayoutGrid className="w-6 h-6 text-purple-500" />
                    <span>{t.landing.demoTabKanbanTitle}</span>
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed mt-4">
                    {t.landing.demoTabKanbanDesc}
                  </p>
                  <ul className="space-y-2 mt-6">
                    <li className="flex items-center space-x-2.5 text-sm text-slate-600 dark:text-slate-400">
                      <CheckCircle2 className="w-4.5 h-4.5 text-purple-500" />
                      <span>Flujo visual intuitivo mediante arrastrar y soltar columnas.</span>
                    </li>
                    <li className="flex items-center space-x-2.5 text-sm text-slate-600 dark:text-slate-400">
                      <CheckCircle2 className="w-4.5 h-4.5 text-purple-500" />
                      <span>Sincronización instantánea con tu base de datos centralizada.</span>
                    </li>
                  </ul>
                </motion.div>
              )}
            </div>

            {/* Graphic simulator on the right of tabs */}
            <div className="flex-1 w-full flex items-center justify-center bg-slate-100/50 dark:bg-slate-950/40 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/40 relative overflow-hidden min-h-55">
              {activeTab === "tracking" && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full space-y-3">
                  <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span className="font-semibold text-sm">Stripe</span>
                    </div>
                    <span className="text-xs text-slate-500">Product Designer</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">Applied</span>
                  </div>
                  <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <span className="font-semibold text-sm">Netflix</span>
                    </div>
                    <span className="text-xs text-slate-500">Frontend Engineer</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">Interviewing</span>
                  </div>
                </motion.div>
              )}
              {activeTab === "analytics" && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full flex justify-around items-center">
                  <div className="flex flex-col items-center">
                    <div className="relative w-20 h-20 rounded-full border-[6px] border-slate-200 dark:border-slate-800 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-[6px] border-blue-500 border-t-transparent border-r-transparent rotate-45" />
                      <span className="text-sm font-bold text-blue-500">45%</span>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">Conversion</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="relative w-20 h-20 rounded-full border-[6px] border-slate-200 dark:border-slate-800 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-[6px] border-indigo-500 border-b-transparent rotate-12" />
                      <span className="text-sm font-bold text-indigo-500">75%</span>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">Response Rate</span>
                  </div>
                </motion.div>
              )}
              {activeTab === "kanban" && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full flex gap-3">
                  <div className="flex-1 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="h-2 w-8 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
                    <div className="h-10 bg-slate-100 dark:bg-slate-955 rounded-lg p-1.5 flex flex-col justify-between">
                      <div className="h-1.5 w-full bg-blue-400 rounded" />
                      <div className="h-1.5 w-2/3 bg-slate-300 dark:bg-slate-700 rounded" />
                    </div>
                  </div>
                  <div className="flex-1 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="h-2 w-8 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
                    <div className="h-10 bg-slate-100 dark:bg-slate-955 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center">
                      <span className="text-[10px] text-slate-400">+ Drop Here</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* SECURITY & PRIVACY CALLOUT */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto bg-slate-100 dark:bg-slate-900/50 rounded-3xl p-8 border border-slate-200/50 dark:border-slate-800/50 flex flex-col sm:flex-row items-center gap-6"
        >
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center shrink-0">
            <Shield className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t.landing.secure}</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              {t.landing.secureDesc}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Subcomponent: DemoJobCard
function DemoJobCard({ color = "blue" }: { color?: "blue" | "amber" | "emerald" }) {
  const colorMap = {
    blue: {
      border: "border-blue-500/30 dark:border-blue-500/40",
      glow: "shadow-blue-500/5 dark:shadow-blue-500/10",
      accent: "text-blue-600 dark:text-blue-400",
      bgBadge: "bg-blue-500/10",
    },
    amber: {
      border: "border-amber-500/30 dark:border-amber-500/40",
      glow: "shadow-amber-500/5 dark:shadow-amber-500/10",
      accent: "text-amber-600 dark:text-amber-400",
      bgBadge: "bg-amber-500/10",
    },
    emerald: {
      border: "border-emerald-500/30 dark:border-emerald-500/40",
      glow: "shadow-emerald-500/5 dark:shadow-emerald-500/10",
      accent: "text-emerald-600 dark:text-emerald-400",
      bgBadge: "bg-emerald-500/10",
    },
  };

  const current = colorMap[color];
  const { t } = useLocale();

  return (
    <motion.div
      layoutId="demo-card"
      className={`w-full max-w-60 bg-white dark:bg-slate-950 p-4 rounded-xl border ${current.border} shadow-lg ${current.glow} flex flex-col justify-between h-33.75 text-left hover:scale-[1.02] transition-transform duration-200`}
    >
      <div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t.landing.demoCardCompany}</span>
          <span className={`px-2 py-0.5 rounded text-[8px] font-semibold ${current.bgBadge} ${current.accent}`}>
            Full-Time
          </span>
        </div>
        <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate mt-1.5">
          {t.landing.demoCardPosition}
        </h4>
      </div>

      <div className="space-y-1.5 border-t border-slate-100 dark:border-slate-900 pt-2 text-[10px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center space-x-1">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span className="truncate">{t.landing.demoCardLocation}</span>
        </div>
        <div className="flex items-center space-x-1">
          <DollarSign className="w-3.5 h-3.5 text-slate-400" />
          <span>{t.landing.demoCardSalary}</span>
        </div>
      </div>
    </motion.div>
  );
}
