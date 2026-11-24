import React, { useEffect, useState } from 'react';
import {
  Search,
  ShoppingBag,
  Sun,
  Moon,
  Menu,
  X,
  Globe,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { TRANSLATIONS } from '../data/translations';

interface NavbarProps {
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSearch }) => {
  const { lang, toggleLang, theme, toggleTheme, cart, setCartOpen } =
    useAppStore();
  const t = TRANSLATIONS[lang];
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeHref, setActiveHref] = useState('#hero');

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 36);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const ids = ['hero', 'catalog', 'divisions', 'about', 'contact'];
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0 && visible[0].target.id) {
          setActiveHref(`#${visible[0].target.id}`);
        }
      },
      { rootMargin: '-35% 0px -45% 0px', threshold: [0.1, 0.35, 0.6] }
    );

    sections.forEach((sec) => observer.observe(sec));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileMenuOpen]);

  const navLinks = [
    { href: '#hero', label: t.nav.home },
    { href: '#catalog', label: t.nav.production },
    { href: '#divisions', label: t.nav.decor },
    { href: '#about', label: t.nav.about },
    { href: '#contact', label: t.nav.contact },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 border-b border-[var(--border-subtle)] bg-[#f7fcfb]/88 dark:bg-[#06262b]/86 backdrop-blur-xl ${
          scrolled ? 'py-2.5 shadow-sm' : 'py-3.5'
        }`}
      >
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand Logo */}
          <a
            href="#hero"
            className="flex items-center gap-2.5 sm:gap-3 min-w-0 group min-h-[44px]"
          >
            <span className="w-10 h-10 shrink-0 rounded-xl bg-[var(--accent-teal)] text-[#092b2d] flex items-center justify-center shadow-sm transition-transform group-hover:scale-105">
              {/* Geometric Crown + Sprout Brand Mark */}
              <svg
                viewBox="0 0 32 32"
                className="w-6 h-6"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M6 22L4.5 11L11 16L16 8L21 16L27.5 11L26 22H6Z"
                  fill="currentColor"
                />
                <rect x="6" y="24" width="20" height="2.5" rx="1.25" fill="currentColor" />
              </svg>
            </span>
            <span className="font-bold text-[15px] sm:text-lg tracking-tight text-[var(--text-primary)] truncate">
              {t.brandShort}
            </span>
          </a>

          {/* Desktop Navigation Links */}
          <nav
            aria-label={lang === 'ar' ? 'التنقل الرئيسي' : 'Main navigation'}
            className="hidden lg:flex items-center gap-3 xl:gap-8 text-sm xl:text-base font-medium"
          >
            {navLinks.map((link) => {
              const isActive = activeHref === link.href;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setActiveHref(link.href)}
                  className={`transition-colors whitespace-nowrap shrink-0 py-2 relative after:absolute after:bottom-0.5 after:inset-s-0 after:h-0.5 after:rounded-full after:bg-[var(--accent-teal-deep)] dark:after:bg-[var(--accent-teal)] after:transition-all ${
                    isActive
                      ? 'text-[var(--accent-teal-deep)] dark:text-[var(--accent-teal)] font-semibold after:w-full'
                      : 'text-[var(--text-primary)]/85 hover:text-[var(--accent-teal-deep)] dark:hover:text-[var(--accent-teal)] after:w-0 hover:after:w-full'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenSearch}
              aria-label={t.nav.searchAria}
              className="hidden sm:flex w-11 h-11 rounded-xl items-center justify-center text-[var(--text-primary)]/90 hover:bg-[var(--bg-surface-alt)] transition-colors cursor-pointer"
            >
              <Search className="w-[18px] h-[18px]" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={t.nav.themeAria}
              className="hidden sm:flex w-11 h-11 rounded-xl items-center justify-center text-[var(--text-primary)]/90 hover:bg-[var(--bg-surface-alt)] transition-colors cursor-pointer"
            >
              {theme === 'dark' ? (
                <Sun className="w-[18px] h-[18px] text-[var(--accent-teal)]" aria-hidden="true" />
              ) : (
                <Moon className="w-[18px] h-[18px]" aria-hidden="true" />
              )}
            </button>

            <button
              type="button"
              onClick={toggleLang}
              aria-label={t.nav.langAria}
              className="hidden sm:flex min-h-[44px] px-3.5 rounded-xl items-center gap-1.5 text-xs sm:text-[13px] font-semibold border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:border-[var(--accent-teal-deep)] dark:hover:border-[var(--accent-teal)] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Globe className="w-4 h-4 text-[var(--accent-teal-deep)] dark:text-[var(--accent-teal)]" aria-hidden="true" />
              <span>{t.nav.langSwitch}</span>
            </button>

            <button
              id="cart-icon-target"
              type="button"
              onClick={() => setCartOpen(true)}
              aria-label={t.nav.cartAria}
              className="relative min-w-[44px] h-11 px-3 rounded-xl flex items-center justify-center gap-1.5 bg-[var(--accent-teal-deep)] dark:bg-[var(--accent-teal)] text-white dark:text-[#052326] font-bold hover:opacity-92 transition-all cursor-pointer shrink-0 shadow-sm"
            >
              <ShoppingBag className="w-[18px] h-[18px]" aria-hidden="true" />
              <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-white/22 dark:bg-[#052326]/16 text-xs font-bold tabular-nums flex items-center justify-center">
                {totalItems}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label={t.nav.menuAria}
              className="lg:hidden w-11 h-11 rounded-xl flex items-center justify-center text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)] transition-colors cursor-pointer"
            >
              <Menu className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* Fullscreen Animated Mobile Menu */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-[var(--bg-canvas)]/95 backdrop-blur-2xl flex flex-col justify-between p-6 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label={t.nav.menuAria}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-xl text-[var(--text-primary)]">
              {t.brandName}
            </span>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              aria-label={t.nav.closeMenuAria}
              className="w-11 h-11 rounded-xl bg-[var(--bg-surface-alt)] flex items-center justify-center text-[var(--text-primary)] cursor-pointer"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          <nav className="flex flex-col gap-4 my-auto">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-2xl font-bold text-[var(--text-primary)] hover:text-[var(--accent-teal-deep)] py-2 border-b border-[var(--border-subtle)] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Utility controls (hidden from the header on small phones) */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSearch();
              }}
              aria-label={t.nav.searchAria}
              className="min-h-[56px] rounded-2xl flex flex-col items-center justify-center gap-1 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs font-semibold hover:border-[var(--accent-teal-deep)] dark:hover:border-[var(--accent-teal)] transition-colors cursor-pointer"
            >
              <Search className="w-5 h-5" aria-hidden="true" />
              <span>{t.nav.searchLabel}</span>
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={t.nav.themeAria}
              className="min-h-[56px] rounded-2xl flex flex-col items-center justify-center gap-1 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs font-semibold hover:border-[var(--accent-teal-deep)] dark:hover:border-[var(--accent-teal)] transition-colors cursor-pointer"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-[var(--accent-teal)]" aria-hidden="true" />
              ) : (
                <Moon className="w-5 h-5" aria-hidden="true" />
              )}
              <span>{t.nav.themeLabel}</span>
            </button>
            <button
              type="button"
              onClick={toggleLang}
              aria-label={t.nav.langAria}
              className="min-h-[56px] rounded-2xl flex flex-col items-center justify-center gap-1 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs font-semibold hover:border-[var(--accent-teal-deep)] dark:hover:border-[var(--accent-teal)] transition-colors cursor-pointer"
            >
              <Globe className="w-5 h-5 text-[var(--accent-teal-deep)] dark:text-[var(--accent-teal)]" aria-hidden="true" />
              <span>{t.nav.langSwitch}</span>
            </button>
          </div>

          <div className="flex items-center justify-between text-sm text-[var(--text-muted)]">
            <span>{t.tagline}</span>
            <span>Riyadh · Est. 2010</span>
          </div>
        </div>
      )}
    </>
  );
};
