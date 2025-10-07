import React from 'react';
import { getDeveloperUrl } from '@/lib/urls';

interface FooterProps {
  className?: string;
  variant?: 'dark' | 'light';
}

export function Footer({ className = '', variant = 'dark' }: FooterProps) {
  const isDark = variant === 'dark';
  const developerUrl = getDeveloperUrl();
  
  return (
    <footer className={`${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} py-8 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <img 
              src="/applydashlogo.svg" 
              alt="ApplyDash Logo" 
              width={32} 
              height={32} 
              className="rounded-lg" 
            />
            <span className="text-xl font-bold">APPLYDASH</span>
          </div>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
            Track your job applications with style and precision
          </p>
          <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} pt-4 mt-4`}>
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              © 2025 ApplyDash. All rights reserved - Developed by{' '}
              <a 
                href={developerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 font-semibold hover:text-blue-400 transition-colors hover:underline"
              >
                Pacoaldev
              </a>
            </p>
            <p className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'} mt-1`}>
              Visit my portfolio at{' '}
              <a 
                href={developerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-400 transition-colors hover:underline"
              >
                pacoal.dev
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;