"use client";

import React from 'react';
import { getDeveloperUrl } from '@/lib/urls';
import { useLocale } from '@/components/locale-provider';

interface FooterProps {
  className?: string;
}

export function Footer({ className = '' }: FooterProps) {
  const developerUrl = getDeveloperUrl();
  const { t } = useLocale();

  return (
    <footer className={`bg-card text-foreground border-t border-border py-5 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <img
              src="/applydashlogo.webp"
              alt="ApplyDash Logo"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="text-xl font-bold">APPLYDASH</span>
          </div>
          <p className="text-muted-foreground mb-2">
            {t.footer.tagline}
          </p>
          <div className="border-t border-border pt-4 mt-4">
            <p className="text-sm text-muted-foreground">
              © 2026 ApplyDash. {t.footer.rights} - {t.footer.developedBy}{' '}
              <a
                href={developerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 font-semibold underline hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
              >
                Pacoaldev
              </a>
            </p>
            <p className="text-xs text-muted-foreground/80 mt-1">
              {t.footer.visitPortfolio}{' '}
              <a
                href={developerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
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
