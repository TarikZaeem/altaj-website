import React, { useEffect, useState } from 'react';
import { Phone, MessageCircle, ShoppingBag } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { CONTACT_INFO, TRANSLATIONS } from '../data/translations';

export const CustomCursor: React.FC = () => {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!canHover || reduced) {
      setEnabled(false);
      return;
    }

    setEnabled(true);

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') {
        setVisible(false);
        return;
      }
      setPos({ x: e.clientX, y: e.clientY });
      setVisible(true);
      const target = e.target as HTMLElement | null;
      setActive(Boolean(target?.closest('a, button, input, select, textarea')));
    };

    const onLeave = () => {
      setVisible(false);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);
    window.addEventListener('blur', onLeave);

    return () => {
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('blur', onLeave);
    };
  }, []);

  if (!enabled || !visible || !pos) return null;

  return (
    <div
      aria-hidden="true"
      className="hidden lg:block fixed top-0 left-0 pointer-events-none z-[100] rounded-full border border-[var(--accent-teal-deep)]/65 dark:border-[var(--accent-teal)]/75 transition-transform duration-150 ease-out"
      style={{
        width: active ? 34 : 22,
        height: active ? 34 : 22,
        transform: `translate3d(${pos.x - (active ? 17 : 11)}px, ${pos.y - (active ? 17 : 11)}px, 0)`,
        backgroundColor: active ? 'oklch(0.74 0.125 192 / 0.14)' : 'transparent',
      }}
    />
  );
};

export const MobileBottomBar: React.FC = () => {
  const { lang, cart, setCartOpen } = useAppStore();
  const t = TRANSLATIONS[lang];
  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <nav
      aria-label={lang === 'ar' ? 'اختصارات سريعة للجوال' : 'Mobile quick actions'}
      className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-[var(--bg-glass)] backdrop-blur-xl border-t border-[var(--border-subtle)] px-3 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] grid grid-cols-3 gap-2"
    >
      <a
        href={`tel:${CONTACT_INFO.phones[0]}`}
        className="min-h-[44px] rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center gap-1.5 text-xs font-semibold text-[var(--text-primary)]"
      >
        <Phone className="w-4 h-4 text-[var(--accent-teal-deep)]" aria-hidden="true" />
        <span>{t.mobileBar.call}</span>
      </a>

      <a
        href={`https://wa.me/${CONTACT_INFO.whatsappNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        className="min-h-[44px] rounded-xl bg-[#168a53] text-white flex items-center justify-center gap-1.5 text-xs font-semibold"
      >
        <MessageCircle className="w-4 h-4" aria-hidden="true" />
        <span>{t.mobileBar.whatsapp}</span>
      </a>

      <button
        type="button"
        onClick={() => setCartOpen(true)}
        className="min-h-[44px] rounded-xl bg-[var(--accent-teal-deep)] text-white flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer"
      >
        <ShoppingBag className="w-4 h-4" aria-hidden="true" />
        <span>
          {t.mobileBar.cart} ({totalItems})
        </span>
      </button>
    </nav>
  );
};

export const ToastContainer: React.FC = () => {
  const toasts = useAppStore((s) => s.toasts);
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-20 md:bottom-6 inset-e-4 z-50 flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="px-4 py-3 rounded-2xl bg-[var(--text-primary)] text-[var(--bg-canvas)] text-xs font-semibold shadow-xl max-w-xs"
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
};
