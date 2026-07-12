"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { logout } from "@/app/(auth)/logout/action";
import { ThemeToggle } from "@/components/theme-toggle";
import { LocaleToggle } from "@/components/locale-toggle";
import { useLocale } from "@/components/locale-provider";

export function NavbarDemo() {
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const { t } = useLocale();
  const supabase = createClient();

  useEffect(() => {
    let isMounted = true;
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (isMounted) {
        setUser(session?.user || null);
      }
    };
    getSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) setUser(session?.user || null);
    });
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      // Force a full page reload to clear all state and redirect to home
      window.location.href = "/";
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout anyway and redirect to home
      setUser(null);
      window.location.href = "/";
    }
  };

  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  return (
    <div className="relative w-full">
      <nav className="flex items-center justify-between w-full px-4 py-2 bg-transparent lg:px-8">
        {/* Logo and Title */}
        <div className="flex items-center gap-2">
          <span>
            <img src="/applydashlogo.svg" alt="App Logo" width={60} height={60} className="rounded-xl" />
          </span>
          <span className="font-bold text-xl text-blue-700 dark:text-blue-400 tracking-wide">APPLYDASH</span>
        </div>
        {/* Desktop Navigation - only render after mount */}
        {mounted && (
          <div className="hidden lg:flex items-center gap-4 text-base font-medium">
            <LocaleToggle />
            <ThemeToggle />
            {!user ? (
              <>
                <a href="/" className="text-muted-foreground hover:text-blue-700 dark:hover:text-blue-400 transition">{t.nav.home}</a>
                <a href="/login" className="px-4 py-2 text-muted-foreground hover:text-blue-700 dark:hover:text-blue-400 transition rounded-lg hover:bg-accent">{t.nav.login}</a>
                <a href="/register" className="px-4 py-2 text-muted-foreground hover:text-blue-700 dark:hover:text-blue-400 transition rounded-lg hover:bg-accent">{t.nav.register}</a>
              </>
            ) : (
              <>
                <a href="/" className="text-muted-foreground hover:text-blue-700 dark:hover:text-blue-400 transition">{t.nav.home}</a>
                <span className="text-blue-700 dark:text-blue-400 font-semibold px-3 py-2">{user.email}</span>
                <a href="/dashboard" className="px-4 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-700 shadow hover:scale-105 transition">{t.nav.dashboard}</a>
                <button onClick={handleLogout} className="px-4 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-red-500 to-red-700 shadow hover:scale-105 transition">{t.nav.logout}</button>
              </>
            )}
          </div>
        )}
        {/* Mobile Hamburger */}
        <div className="lg:hidden flex items-center gap-2">
          <LocaleToggle />
          <ThemeToggle />
          <button className="flex items-center p-2" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Open menu">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-blue-700 dark:text-blue-400">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          </button>
        </div>
      </nav>
      {/* Mobile Menu */}
      {mounted && mobileOpen && (
        <div className="lg:hidden fixed top-0 left-0 w-full h-screen bg-background shadow-md z-50 flex flex-col px-4 pt-20 gap-4 text-base font-medium animate-fade-in border-b border-border">
          {!user ? (
            <>
              <a href="/login" className="text-muted-foreground hover:text-blue-700 dark:hover:text-blue-400 transition w-full text-center py-3 rounded-xl" onClick={() => setMobileOpen(false)}>{t.nav.login}</a>
              <a href="/register" className="text-muted-foreground hover:text-blue-700 dark:hover:text-blue-400 transition w-full text-center py-3 rounded-xl" onClick={() => setMobileOpen(false)}>{t.nav.register}</a>
            </>
          ) : (
            <>
              <span className="text-blue-700 dark:text-blue-400 font-semibold w-full text-center mb-2">{user.email}</span>
              <a href="/dashboard" className="w-full px-4 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 to-blue-700 shadow hover:scale-105 transition text-center" onClick={() => setMobileOpen(false)}>{t.nav.dashboard}</a>
              <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="w-full px-4 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 to-blue-700 shadow hover:scale-105 transition">{t.nav.logout}</button>
            </>
          )}
          <a href="/" className="text-muted-foreground hover:text-blue-700 dark:hover:text-blue-400 transition w-full text-center py-3 rounded-xl" onClick={() => setMobileOpen(false)}>{t.nav.home}</a>
        </div>
      )}
    </div>
  );
}
