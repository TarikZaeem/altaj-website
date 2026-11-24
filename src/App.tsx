import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import {
  ArrowDownLeft,
  ArrowDownRight,
  CalendarCheck,
  Factory,
  Globe,
  Pause,
  Play,
  Phone,
  Mail,
  MessageCircle,
} from 'lucide-react';
import { useAppStore } from './store/useAppStore';
import { COLOR_SWATCHES, type ProductItem } from './data/products';
import { CONTACT_INFO, TRANSLATIONS } from './data/translations';
import { Navbar } from './components/Navbar';
import { CatalogSection } from './components/CatalogSection';
import { WhyTajAndAbout } from './components/WhyTajAndAbout';
import { ContactSection } from './components/ContactSection';
import { QuickViewModal } from './components/QuickViewModal';
import { CartDrawer } from './components/CartDrawer';
import {
  CustomCursor,
  MobileBottomBar,
  ToastContainer,
} from './components/PolishExtras';

const Hero3DScene = lazy(() => import('./components/Hero3DScene'));

const HERO_SWATCH_LIST = [
  COLOR_SWATCHES.teal,
  COLOR_SWATCHES.terracotta,
  COLOR_SWATCHES.white,
  COLOR_SWATCHES.black,
  COLOR_SWATCHES.green,
];

export default function App() {
  const { lang, theme, heroColorHex, setHeroColorHex } = useAppStore();
  const t = TRANSLATIONS[lang];
  const isRtl = lang === 'ar';

  const [quickViewProduct, setQuickViewProduct] = useState<ProductItem | null>(null);
  const [mount3D, setMount3D] = useState(false);
  const [isOrbitPlaying, setIsOrbitPlaying] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return true;
  });
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const handleSelectHeroProduct = (product: ProductItem) => {
    setQuickViewProduct(product);
    document
      .getElementById(`product-${product.id}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // Sync HTML lang, dir, title, and dark mode class
  useEffect(() => {
    const html = document.documentElement;
    html.lang = lang;
    html.dir = isRtl ? 'rtl' : 'ltr';
    document.title =
      lang === 'ar'
        ? 'شركة التاج المميزة | أحواض نباتات ومستلزمات مشاتل منذ 2010 — الرياض'
        : 'Al Taj Al Mumayyaz | Plastic Nursery Pots & Decorative Planters — Riyadh';
  }, [lang, isRtl]);

  useEffect(() => {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [theme]);

  // Defer 3D chunk hydration slightly after first paint for fast LCP
  useEffect(() => {
    const id = window.setTimeout(() => setMount3D(true), 60);
    return () => clearTimeout(id);
  }, []);

  // Lenis Smooth Scrolling (disabled on reduced motion)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis({
      duration: 1.05,
      smoothWheel: true,
    });
    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  const handleOpenSearch = () => {
    const el = document.getElementById('catalog');
    el?.scrollIntoView({ behavior: 'smooth' });
    window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 350);
  };

  const CtaArrow = isRtl ? ArrowDownLeft : ArrowDownRight;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-canvas)] text-[var(--text-primary)] relative">
      {/* Subtle grain texture */}
      <div className="grain-overlay fixed inset-0 pointer-events-none z-10" aria-hidden="true" />

      {/* Skip to Content Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:inset-s-3 focus:z-50 focus:px-4 focus:py-2.5 focus:rounded-xl focus:bg-[var(--accent-teal-deep)] focus:text-white focus:text-sm focus:font-semibold"
      >
        {t.skipToContent}
      </a>

      <CustomCursor />
      <Navbar onOpenSearch={handleOpenSearch} />

      <main id="main-content" className="flex-1 pb-20 md:pb-0">
        {/* Clean 2-Zone Responsive Hero Section */}
        <section
          id="hero"
          className="relative min-h-[calc(100svh-4.5rem)] lg:min-h-[calc(100dvh-4.5rem)] flex items-center overflow-hidden hero-surface-bg border-b border-[var(--border-subtle)] py-8 sm:py-10 lg:py-12"
        >
          <p className="sr-only">{t.hero.sceneSrDescription}</p>

          <div className="relative z-20 max-w-[1380px] mx-auto w-full px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Zone 1: Lightweight Editorial Text Block (5fr on desktop, below 3D on mobile/tablet) */}
            <div className="order-2 lg:order-1 lg:col-span-5 flex flex-col items-start md:items-center lg:items-start text-start md:text-center lg:text-start space-y-5 sm:space-y-6">
              <p className="text-xs sm:text-sm font-semibold tracking-wide text-[var(--accent-teal-deep)] dark:text-[var(--accent-teal)]">
                {t.hero.eyebrow}
              </p>

              <h1 className="fluid-hero-title tracking-tight text-[var(--text-primary)]">
                {t.hero.headlinePrefix}
                <span className="text-[var(--accent-teal-deep)] dark:text-[var(--accent-teal)]">
                  {t.hero.headlineHighlight}
                </span>
                {t.hero.headlineSuffix}
              </h1>

              <p className="text-[clamp(1rem,1.4vw,1.25rem)] text-[var(--text-primary)]/82 leading-relaxed max-w-xl">
                {t.hero.subline}
              </p>

              {/* CTAs */}
              <div className="w-full md:w-auto flex flex-col md:flex-row items-stretch md:items-center gap-3.5 pt-1">
                <a
                  href="#catalog"
                  className="min-h-[56px] px-7 rounded-2xl bg-[var(--accent-teal)] text-[#052326] text-[1.05rem] font-bold inline-flex items-center justify-center gap-2.5 hover:brightness-105 hover:shadow-[0_14px_32px_-6px_rgba(42,203,210,0.55)] hover:-translate-y-0.5 transition-all shadow-md"
                >
                  <span>{t.hero.ctaCatalog}</span>
                  <CtaArrow className="w-4 h-4" aria-hidden="true" />
                </a>
                <a
                  href="#contact"
                  className="min-h-[56px] px-7 rounded-2xl bg-transparent border-2 border-[var(--text-primary)]/25 text-[var(--text-primary)] text-[1.05rem] font-semibold inline-flex items-center justify-center gap-2 hover:border-[var(--accent-teal-deep)] dark:hover:border-[var(--accent-teal)] hover:-translate-y-0.5 transition-all"
                >
                  <span>{t.hero.ctaQuote}</span>
                </a>
              </div>

              {/* 3 Stat Chips with Icons */}
              <div className="flex flex-wrap items-center justify-start md:justify-center lg:justify-start gap-3 pt-1">
                {t.hero.stats.map((stat, i) => {
                  const StatIcon =
                    i === 0 ? CalendarCheck : i === 1 ? Factory : Globe;
                  return (
                    <span
                      key={stat}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--bg-surface)]/85 dark:bg-[#073138]/85 border border-[var(--border-subtle)] text-xs sm:text-[13px] font-semibold text-[var(--text-primary)] shadow-xs"
                    >
                      <StatIcon
                        className="w-4 h-4 text-[var(--accent-teal-deep)] dark:text-[var(--accent-teal)] shrink-0"
                        aria-hidden="true"
                      />
                      <span>{stat}</span>
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Zone 2: Dedicated 3D Stage + Floating Swatches Pill (7fr on desktop, top on mobile/tablet) */}
            <div className="order-1 lg:order-2 lg:col-span-7 flex flex-col items-center w-full relative">
              <div className="relative w-full h-[45svh] md:h-[50svh] lg:h-[64dvh] xl:h-[68dvh] min-h-[290px] max-h-[680px]">
                {/* Radial teal spotlight centered behind the 3D pots */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-6 z-0 rounded-full"
                  style={{
                    background:
                      'radial-gradient(circle at 50% 48%, rgba(42, 203, 210, 0.28) 0%, rgba(42, 203, 210, 0.08) 44%, transparent 70%)',
                  }}
                />
                {mount3D ? (
                  <Suspense
                    fallback={
                      <img
                        src="src/assets/images/hero_pots_poster_1795437449315.jpg"
                        alt={t.hero.sceneSrDescription}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover rounded-[28px] opacity-90"
                      />
                    }
                  >
                    <Hero3DScene
                      isOrbitPlaying={isOrbitPlaying}
                      isProductSelected={Boolean(quickViewProduct)}
                      onSelectProduct={handleSelectHeroProduct}
                    />
                  </Suspense>
                ) : (
                  <img
                    src="src/assets/images/hero_pots_poster_1795437449315.jpg"
                    alt={t.hero.sceneSrDescription}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-[28px] opacity-90"
                  />
                )}
              </div>

              {/* Floating Color Swatch Pill + 44x44px Orbit Pause/Play Button */}
              <div className="mt-4 max-w-full flex items-center justify-center gap-2.5">
                <div className="max-w-full overflow-x-auto no-scrollbar py-1 px-1">
                  <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[var(--bg-surface)]/92 dark:bg-[#073138]/92 border border-[var(--border-subtle)] shadow-lg whitespace-nowrap">
                    <span className="text-xs sm:text-sm font-semibold text-[var(--text-primary)]/85">
                      {t.hero.colorLabel}
                    </span>
                    <div className="flex items-center gap-2.5">
                      {HERO_SWATCH_LIST.map((sw) => {
                        const active = heroColorHex === sw.hex;
                        const label = lang === 'ar' ? sw.nameAr : sw.nameEn;
                        return (
                          <button
                            key={sw.id}
                            type="button"
                            onClick={() => setHeroColorHex(sw.hex)}
                            aria-label={label}
                            aria-pressed={active}
                            title={label}
                            className={`w-10 h-10 rounded-full border border-black/15 dark:border-white/20 transition-all cursor-pointer shrink-0 ${
                              active
                                ? 'ring-2 ring-[var(--accent-teal-deep)] dark:ring-[var(--accent-teal)] ring-offset-[3px] ring-offset-[var(--bg-surface)] scale-105 shadow-md'
                                : 'hover:scale-105 opacity-90 hover:opacity-100'
                            }`}
                            style={{ backgroundColor: sw.hex }}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOrbitPlaying((prev) => !prev)}
                  aria-label={isOrbitPlaying ? t.hero.pauseOrbitAria : t.hero.playOrbitAria}
                  aria-pressed={!isOrbitPlaying}
                  title={isOrbitPlaying ? t.hero.pauseOrbitAria : t.hero.playOrbitAria}
                  className="w-11 h-11 rounded-full bg-[var(--bg-surface)]/92 dark:bg-[#073138]/92 border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--accent-teal-deep)] dark:hover:border-[var(--accent-teal)] hover:text-[var(--accent-teal-deep)] dark:hover:text-[var(--accent-teal)] shadow-lg flex items-center justify-center transition-colors cursor-pointer shrink-0"
                >
                  {isOrbitPlaying ? (
                    <Pause className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <Play className="w-4 h-4" aria-hidden="true" />
                  )}
                </button>
              </div>

              {/* Interaction Hint (Pointer vs Touch) */}
              <p className="hint-pointer-only mt-2.5 text-[13px] sm:text-sm font-medium text-[var(--text-primary)]/80 text-center">
                {t.hero.sceneHintPointer}
              </p>
              <p className="hint-touch-only mt-2.5 text-[13px] sm:text-sm font-medium text-[var(--text-primary)]/80 text-center">
                {t.hero.sceneHintTouch}
              </p>
            </div>
          </div>
        </section>

        {/* Marquee Value Props Strip */}
        <div
          className="overflow-hidden border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] py-3.5"
          aria-label={t.marquee.join(' • ')}
        >
          <div
            className={`flex w-max gap-10 text-xs sm:text-sm font-semibold text-[var(--text-primary)] ${
              isRtl ? 'animate-marquee-rtl' : 'animate-marquee-ltr'
            }`}
          >
            {[...t.marquee, ...t.marquee].map((item, idx) => (
              <span
                key={`${item}-${idx}`}
                className="inline-flex items-center gap-10 whitespace-nowrap"
              >
                <span>{item}</span>
                <span className="text-[var(--accent-teal-deep)]" aria-hidden="true">
                  •
                </span>
              </span>
            ))}
          </div>
        </div>

        <CatalogSection
          searchInputRef={searchInputRef}
          onQuickView={(p) => setQuickViewProduct(p)}
        />

        <WhyTajAndAbout />

        <ContactSection />
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] py-12 pb-28 md:pb-12">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-5 space-y-3">
            <p className="text-xl font-bold text-[var(--text-primary)]">
              {t.brandName}
            </p>
            <p className="text-sm font-semibold text-[var(--accent-teal-deep)]">
              {t.tagline}
            </p>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed max-w-sm">
              {t.contact.addressValue}
            </p>
          </div>

          <div className="md:col-span-3 space-y-2.5 text-sm">
            <p className="font-bold text-xs text-[var(--text-muted)]">
              {t.footer.quickLinks}
            </p>
            <ul className="space-y-1.5 text-[var(--text-primary)]">
              <li>
                <a href="#hero" className="hover:text-[var(--accent-teal-deep)]">
                  {t.nav.home}
                </a>
              </li>
              <li>
                <a href="#divisions" className="hover:text-[var(--accent-teal-deep)]">
                  {t.nav.decor}
                </a>
              </li>
              <li>
                <a href="#catalog" className="hover:text-[var(--accent-teal-deep)]">
                  {t.nav.production}
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-[var(--accent-teal-deep)]">
                  {t.nav.about}
                </a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-3 text-sm">
            <p className="font-bold text-xs text-[var(--text-muted)]">
              {t.footer.contactDetails}
            </p>
            <div className="space-y-1.5 tabular-nums" dir="ltr">
              <a
                href={`tel:${CONTACT_INFO.phones[0]}`}
                className="flex items-center gap-2 hover:text-[var(--accent-teal-deep)]"
              >
                <Phone className="w-4 h-4 text-[var(--accent-teal-deep)]" aria-hidden="true" />
                <span>{CONTACT_INFO.phones[0]}</span>
              </a>
              <a
                href={`tel:${CONTACT_INFO.phones[1]}`}
                className="flex items-center gap-2 hover:text-[var(--accent-teal-deep)]"
              >
                <Phone className="w-4 h-4 text-[var(--accent-teal-deep)]" aria-hidden="true" />
                <span>{CONTACT_INFO.phones[1]}</span>
              </a>
              <a
                href={`mailto:${CONTACT_INFO.email}`}
                className="flex items-center gap-2 hover:text-[var(--accent-teal-deep)]"
              >
                <Mail className="w-4 h-4 text-[var(--accent-teal-deep)]" aria-hidden="true" />
                <span>{CONTACT_INFO.email}</span>
              </a>
            </div>
            <div className="pt-1 flex items-center gap-2">
              <a
                href={`https://wa.me/${CONTACT_INFO.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-10 h-10 rounded-xl bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] flex items-center justify-center hover:border-[var(--accent-teal-deep)]"
              >
                <MessageCircle className="w-4 h-4 text-[#168a53]" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 mt-10 pt-6 border-t border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
          {t.footer.copyright}
        </div>
      </footer>

      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
      <CartDrawer />
      <MobileBottomBar />
      <ToastContainer />
    </div>
  );
}
