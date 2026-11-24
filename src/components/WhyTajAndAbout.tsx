import React, { useEffect, useRef, useState } from 'react';
import { Factory, Layers, Globe2, Handshake } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { TRANSLATIONS } from '../data/translations';

const CounterNumber: React.FC<{ target: number; suffix: string }> = ({
  target,
  suffix,
}) => {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setVal(target);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        const start = performance.now();
        const duration = 950;
        const step = (now: number) => {
          const p = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          setVal(Math.round(target * eased));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        observer.disconnect();
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref} className="tabular-nums">
      {val}
      {suffix}
    </span>
  );
};

export const WhyTajAndAbout: React.FC = () => {
  const { lang } = useAppStore();
  const t = TRANSLATIONS[lang];

  const icons = [Factory, Layers, Globe2, Handshake];

  return (
    <>
      {/* Why Al Taj Section */}
      <section className="py-16 sm:py-24 border-t border-[var(--border-subtle)] bg-[var(--bg-surface-alt)]/55">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="max-w-2xl scroll-reveal">
              <p className="text-xs font-semibold text-[var(--accent-teal-deep)] mb-2">
                {t.whyTaj.kicker}
              </p>
              <h2 className="fluid-section-title font-bold text-[var(--text-primary)]">
                {t.whyTaj.title}
              </h2>
            </div>

            {/* Animated Counters */}
            <div className="grid grid-cols-3 gap-6 sm:gap-10">
              {t.whyTaj.counters.map((c) => (
                <div key={c.label}>
                  <p className="text-3xl sm:text-4xl font-bold text-[var(--accent-teal-deep)]">
                    <CounterNumber target={c.value} suffix={c.suffix} />
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-1 leading-snug">
                    {c.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 4 Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {t.whyTaj.pillars.map((pillar, idx) => {
              const Icon = icons[idx] ?? Factory;
              return (
                <div
                  key={pillar.title}
                  className="scroll-reveal rounded-[24px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 space-y-3 shadow-[var(--shadow-soft)]"
                >
                  <div className="w-11 h-11 rounded-2xl bg-[var(--accent-teal)]/20 text-[var(--accent-teal-deep)] flex items-center justify-center">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <h3 className="font-bold text-base text-[var(--text-primary)]">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Story Section with Factory Visual */}
      <section id="about" className="py-16 sm:py-24 border-t border-[var(--border-subtle)]">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-6 space-y-5 scroll-reveal">
              <p className="text-xs font-semibold text-[var(--accent-clay)]">
                {t.about.kicker}
              </p>
              <h2 className="fluid-section-title font-bold text-[var(--text-primary)]">
                {t.about.title}
              </h2>
              <div className="space-y-4 text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
                {t.about.paragraphs.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative rounded-[28px] overflow-hidden border border-[var(--border-subtle)] shadow-xl aspect-[16/10] bg-[var(--bg-surface-alt)]">
                <img
                  src="src/assets/images/factory_about_riyadh_1795437449054.jpg"
                  alt={
                    lang === 'ar'
                      ? 'مصنع شركة التاج المميزة للأحواض البلاستيكية بالرياض'
                      : 'Al Taj Plastic Pots Factory and logistics warehouse in Riyadh'
                  }
                  width={960}
                  height={600}
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
