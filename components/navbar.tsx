"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { logout } from "@/app/(auth)/logout/action";
import { useRouter } from "next/navigation";

export function NavbarDemo() {
  const [user, setUser] = useState<any>(null);
  const [, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    let isMounted = true;
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (isMounted) {
        setUser(session?.user || null);
        setLoading(false);
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
      <nav className="flex items-center justify-between w-full px-4 py-3 bg-transparent lg:px-8">
        {/* Logo and Title */}
        <div className="flex items-center gap-2">
          <span>
            <img src="/applydashlogo.svg" alt="App Logo" width={60} height={60} className="rounded-xl" />
          </span>
          <span className="font-bold text-xl text-blue-700 tracking-wide">APPLYDASH</span>
        </div>
        {/* Desktop Navigation - only render after mount */}
        {mounted && (
          <div className="hidden lg:flex items-center gap-6 text-base font-medium">
            {!user ? (
              <>
                <a href="/login" className="text-gray-600 hover:text-blue-700 transition">Login</a>
                <a href="/register" className="text-gray-600 hover:text-blue-700 transition">Register</a>
              </>
            ) : (
              <>
                <span className="text-blue-700 font-semibold mr-2">{user.email}</span>
                <button onClick={handleLogout} className="px-3 py-1 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 to-blue-700 shadow hover:scale-105 transition">Logout</button>
              </>
            )}
            <a href="/" className="text-gray-600 hover:text-blue-700 transition">Home</a>
            <a href="/dashboard" className="px-4 py-2 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 to-blue-700 shadow hover:scale-105 transition">Dashboard</a>
          </div>
        )}
        {/* Mobile Hamburger */}
        <button className="lg:hidden flex items-center p-2" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Open menu">
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-blue-700">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </nav>
      {/* Mobile Menu */}
      {mounted && mobileOpen && (
        <div className="lg:hidden fixed top-0 left-0 w-full h-screen bg-white shadow-md z-50 flex flex-col px-4 pt-20 gap-4 text-base font-medium animate-fade-in">
          {!user ? (
            <>
              <a href="/login" className="text-gray-600 hover:text-blue-700 transition w-full text-center py-3 rounded-xl" onClick={() => setMobileOpen(false)}>Login</a>
              <a href="/register" className="text-gray-600 hover:text-blue-700 transition w-full text-center py-3 rounded-xl" onClick={() => setMobileOpen(false)}>Register</a>
            </>
          ) : (
            <>
              <span className="text-blue-700 font-semibold w-full text-center mb-2">{user.email}</span>
              <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="w-full px-4 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 to-blue-700 shadow hover:scale-105 transition">Logout</button>
            </>
          )}
          <a href="/" className="text-gray-600 hover:text-blue-700 transition w-full text-center py-3 rounded-xl" onClick={() => setMobileOpen(false)}>Home</a>
          <a href="/dashboard" className="w-full px-4 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 to-blue-700 shadow hover:scale-105 transition text-center" onClick={() => setMobileOpen(false)}>Dashboard</a>
        </div>
      )}
    </div>
  );
}
