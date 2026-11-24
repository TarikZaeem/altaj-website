import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { X, Plus, Minus, ShoppingBag, RotateCw } from 'lucide-react';
import type { ProductColorOption, ProductItem } from '../data/products';
import { TRANSLATIONS } from '../data/translations';
import { useAppStore } from '../store/useAppStore';

const PotViewer3D = lazy(() => import('./PotViewer3D'));

interface QuickViewModalProps {
  product: ProductItem | null;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  onClose,
}) => {
  const { lang, addToCart, pushToast, setCartOpen } = useAppStore();
  const t = TRANSLATIONS[lang];
  const [selectedColor, setSelectedColor] = useState<ProductColorOption | null>(null);
  const [qty, setQty] = useState(1);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (product) {
      setSelectedColor(product.colors[0]);
      setQty(product.minOrderQty);
      closeBtnRef.current?.focus();
    }
  }, [product]);

  useEffect(() => {
    if (!product) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [product, onClose]);

  if (!product) return null;

  const activeColor = selectedColor ?? product.colors[0];

  const handleAdd = () => {
    addToCart({
      productId: product.id,
      colorId: activeColor.id,
      colorName: lang === 'ar' ? activeColor.nameAr : activeColor.nameEn,
      quantity: qty,
    });
    pushToast(`${t.toast.added} ${product.name}`);
    onClose();
    setCartOpen(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={product.name}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-[var(--bg-surface)] text-[var(--text-primary)] rounded-[28px] border border-[var(--border-subtle)] shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeBtnRef}
          type="button"
          onClick={onClose}
          aria-label={t.quickView.close}
          className="absolute top-4 inset-e-4 z-20 w-11 h-11 rounded-full bg-[var(--bg-surface-alt)] text-[var(--text-primary)] hover:bg-[var(--accent-teal)] hover:text-[#072628] flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        {/* Left / Start Column: Interactive 3D Pot Viewer */}
        <div className="md:col-span-6 bg-[var(--bg-surface-alt)] relative flex flex-col justify-between p-4">
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] px-2 pt-1">
            <RotateCw className="w-3.5 h-3.5 text-[var(--accent-teal-deep)]" aria-hidden="true" />
            <span>{t.quickView.dragHint}</span>
          </div>

          <div className="flex-1 min-h-[290px]">
            <Suspense
              fallback={
                <div className="w-full h-[300px] rounded-2xl bg-[var(--bg-canvas)] animate-pulse" />
              }
            >
              <PotViewer3D product={product} selectedColor={activeColor} />
            </Suspense>
          </div>
        </div>

        {/* Right / End Column: Product Specs & B2B Add to Quote */}
        <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <div className="text-xs font-medium text-[var(--text-muted)] flex items-center gap-2">
              <span>{product.sku}</span>
              <span aria-hidden="true">·</span>
              <span>
                {product.category === 'production'
                  ? t.catalog.filters.production
                  : t.catalog.filters.decor}
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight" dir="ltr">
              {product.name}
            </h3>

            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              {lang === 'ar' ? product.descriptionAr : product.descriptionEn}
            </p>

            {/* Color / Finish Swatches */}
            <div className="pt-2">
              <p className="text-xs font-semibold mb-2.5 text-[var(--text-primary)]">
                {t.quickView.colorLabel}:{' '}
                <span className="font-normal text-[var(--text-muted)]">
                  {lang === 'ar' ? activeColor.nameAr : activeColor.nameEn}
                </span>
              </p>
              <div className="flex flex-wrap items-center gap-2.5">
                {product.colors.map((c) => {
                  const isSelected = c.id === activeColor.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedColor(c)}
                      aria-label={lang === 'ar' ? c.nameAr : c.nameEn}
                      className={`w-9 h-9 rounded-full border-2 transition-transform cursor-pointer ${
                        isSelected
                          ? 'border-[var(--accent-teal-deep)] scale-110'
                          : 'border-[var(--border-subtle)] hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.hex }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Technical Specs Grid */}
            <dl className="grid grid-cols-2 gap-3 pt-3 border-t border-[var(--border-subtle)] text-xs">
              <div>
                <dt className="text-[var(--text-muted)]">{t.quickView.dimensions}</dt>
                <dd className="font-semibold mt-0.5 tabular-nums" dir="ltr">
                  {product.dimensionsCm}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--text-muted)]">{t.quickView.capacity}</dt>
                <dd className="font-semibold mt-0.5 tabular-nums">
                  {product.capacityLiters} {t.quickView.liters}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--text-muted)]">{t.quickView.material}</dt>
                <dd className="font-semibold mt-0.5">
                  {lang === 'ar' ? product.materialAr : product.materialEn}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--text-muted)]">{t.quickView.packaging}</dt>
                <dd className="font-semibold mt-0.5">
                  {lang === 'ar' ? product.packUnitAr : product.packUnitEn}
                </dd>
              </div>
            </dl>
          </div>

          <div className="pt-4 border-t border-[var(--border-subtle)] space-y-4">
            <div className="flex items-baseline justify-between gap-4">
              <div>
                {product.priceSar !== null ? (
                  <p className="text-xl font-bold text-[var(--accent-teal-deep)] tabular-nums">
                    {product.priceSar.toFixed(2)} {t.catalog.sarPerUnit}
                  </p>
                ) : (
                  <p className="text-lg font-bold text-[var(--accent-clay)]">
                    {t.catalog.requestPrice}
                  </p>
                )}
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                  {t.quickView.priceNotice}
                </p>
              </div>

              {/* Quantity Stepper */}
              <div className="flex items-center border border-[var(--border-subtle)] rounded-xl bg-[var(--bg-canvas)]">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 10))}
                  aria-label="Decrease quantity"
                  className="w-10 h-10 flex items-center justify-center text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)] rounded-s-xl cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
                <input
                  type="number"
                  min={1}
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  aria-label="Quantity"
                  className="w-14 text-center text-sm font-semibold bg-transparent tabular-nums focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setQty((q) => q + 10)}
                  aria-label="Increase quantity"
                  className="w-10 h-10 flex items-center justify-center text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)] rounded-e-xl cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              className="w-full min-h-[48px] rounded-2xl bg-[var(--accent-teal-deep)] text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-95 transition-opacity cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" aria-hidden="true" />
              <span>{t.catalog.addToCart}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
