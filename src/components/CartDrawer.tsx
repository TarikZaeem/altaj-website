import React, { useEffect, useRef, useState } from 'react';
import { X, Plus, Minus, Trash2, MessageCircle, Mail, Sprout } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { PRODUCTS } from '../data/products';
import { CONTACT_INFO, TRANSLATIONS } from '../data/translations';

export const CartDrawer: React.FC = () => {
  const {
    lang,
    cart,
    isCartOpen,
    setCartOpen,
    updateQty,
    removeFromCart,
    pushToast,
  } = useAppStore();
  const t = TRANSLATIONS[lang];

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerCity, setCustomerCity] = useState('');
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isCartOpen) return;
    closeRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCartOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isCartOpen, setCartOpen]);

  if (!isCartOpen) return null;

  const enriched = cart
    .map((item) => ({
      ...item,
      product: PRODUCTS.find((p) => p.id === item.productId),
    }))
    .filter((i) => i.product !== undefined);

  const estimatedSubtotal = enriched.reduce((sum, item) => {
    const unit = item.product?.priceSar ?? 0;
    return sum + unit * item.quantity;
  }, 0);

  const buildOrderMessage = () => {
    const header =
      lang === 'ar'
        ? 'السلام عليكم، أرغب في طلب تسعيرة من شركة التاج المميزة للأصناف التالية:'
        : 'Hello Al Taj Al Mumayyaz, I would like a wholesale quote for the following items:';

    const lines = enriched.map(
      (item, idx) =>
        `${idx + 1}. ${item.product!.name} (${item.product!.sizeLabel}) — ${item.colorName} × ${item.quantity}`
    );

    const footerParts = [
      customerName ? `${t.cart.customerName}: ${customerName}` : '',
      customerPhone ? `${t.cart.customerPhone}: ${customerPhone}` : '',
      customerCity ? `${t.cart.customerCity}: ${customerCity}` : '',
    ].filter(Boolean);

    return [header, '', ...lines, '', ...footerParts].join('\n');
  };

  const handleWhatsAppCheckout = () => {
    const text = encodeURIComponent(buildOrderMessage());
    pushToast(t.toast.quoteReady);
    window.open(
      `https://wa.me/${CONTACT_INFO.whatsappNumber}?text=${text}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleEmailCheckout = () => {
    const subject = encodeURIComponent(
      lang === 'ar'
        ? 'طلب تسعيرة جملة — شركة التاج المميزة'
        : 'Wholesale Quote Request — Al Taj Al Mumayyaz'
    );
    const body = encodeURIComponent(buildOrderMessage());
    window.location.href = `mailto:${CONTACT_INFO.email}?subject=${subject}&body=${body}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex"
      role="dialog"
      aria-modal="true"
      aria-label={t.cart.title}
      onClick={() => setCartOpen(false)}
    >
      {/* Opens from inline-start edge (right in RTL, left in LTR) via natural flex start */}
      <aside
        className="w-full max-w-md h-full bg-[var(--bg-glass)] backdrop-blur-2xl text-[var(--text-primary)] border-e border-[var(--border-subtle)] shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <h2 className="text-lg font-bold">{t.cart.title}</h2>
          <button
            ref={closeRef}
            type="button"
            onClick={() => setCartOpen(false)}
            aria-label={t.quickView.close}
            className="w-11 h-11 rounded-xl bg-[var(--bg-surface-alt)] flex items-center justify-center hover:bg-[var(--accent-teal)] hover:text-[#072628] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Cart Items or Empty Illustration */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {enriched.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
              <div className="w-20 h-20 rounded-3xl bg-[var(--bg-surface-alt)] flex items-center justify-center text-[var(--accent-teal-deep)]">
                <Sprout className="w-9 h-9" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold">{t.cart.emptyTitle}</h3>
              <p className="text-sm text-[var(--text-muted)] max-w-xs">
                {t.cart.emptyDesc}
              </p>
              <a
                href="#catalog"
                onClick={() => setCartOpen(false)}
                className="px-5 py-3 rounded-2xl bg-[var(--accent-teal-deep)] text-white text-sm font-semibold"
              >
                {t.cart.browseBtn}
              </a>
            </div>
          ) : (
            <>
              {enriched.map((item) => {
                const p = item.product!;
                return (
                  <div
                    key={`${item.productId}-${item.colorId}`}
                    className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-sm" dir="ltr">
                          {p.name}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">
                          {p.sizeLabel} · {item.colorName}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          removeFromCart(item.productId, item.colorId);
                          pushToast(t.toast.removed);
                        }}
                        aria-label={t.cart.remove}
                        className="w-9 h-9 rounded-lg text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center border border-[var(--border-subtle)] rounded-xl bg-[var(--bg-canvas)]">
                        <button
                          type="button"
                          onClick={() =>
                            updateQty(item.productId, item.colorId, item.quantity - 10)
                          }
                          aria-label="Decrease quantity"
                          className="w-9 h-9 flex items-center justify-center cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                        <span className="px-3 text-xs font-bold tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQty(item.productId, item.colorId, item.quantity + 10)
                          }
                          aria-label="Increase quantity"
                          className="w-9 h-9 flex items-center justify-center cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </div>

                      <span className="text-xs font-bold text-[var(--accent-teal-deep)] tabular-nums">
                        {p.priceSar !== null
                          ? `${(p.priceSar * item.quantity).toFixed(2)} SAR`
                          : t.catalog.requestPrice}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Optional Customer Info */}
              <div className="pt-4 border-t border-[var(--border-subtle)] space-y-2.5">
                <p className="text-xs font-semibold text-[var(--text-muted)]">
                  {t.cart.customerDetails}
                </p>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={t.cart.customerName}
                  className="w-full min-h-[42px] px-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder={t.cart.customerPhone}
                    className="w-full min-h-[42px] px-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs"
                  />
                  <input
                    type="text"
                    value={customerCity}
                    onChange={(e) => setCustomerCity(e.target.value)}
                    placeholder={t.cart.customerCity}
                    className="w-full min-h-[42px] px-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Checkout Actions */}
        {enriched.length > 0 && (
          <div className="p-6 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium text-[var(--text-muted)]">
                {t.cart.subtotalLabel}
              </span>
              <span className="text-lg font-bold tabular-nums text-[var(--text-primary)]">
                {estimatedSubtotal.toFixed(2)} SAR
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">
              {t.cart.subtotalNote}
            </p>

            <button
              type="button"
              onClick={handleWhatsAppCheckout}
              className="w-full min-h-[48px] rounded-2xl bg-[#168a53] hover:bg-[#137446] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <MessageCircle className="w-4.5 h-4.5" aria-hidden="true" />
              <span>{t.cart.checkoutWhatsapp}</span>
            </button>

            <button
              type="button"
              onClick={handleEmailCheckout}
              className="w-full min-h-[44px] rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface-alt)] text-[var(--text-primary)] font-semibold text-xs flex items-center justify-center gap-2 hover:border-[var(--accent-teal-deep)] transition-colors cursor-pointer"
            >
              <Mail className="w-4 h-4" aria-hidden="true" />
              <span>{t.cart.checkoutEmail}</span>
            </button>
          </div>
        )}
      </aside>
    </div>
  );
};
