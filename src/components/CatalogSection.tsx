import React, { useMemo, useState } from 'react';
import {
  Search,
  Plus,
  Minus,
  ShoppingBag,
  Eye,
  ArrowUpLeft,
  ArrowUpRight,
} from 'lucide-react';
import {
  PRODUCTS,
  type ProductCategory,
  type ProductColorOption,
  type ProductItem,
} from '../data/products';
import { TRANSLATIONS } from '../data/translations';
import { useAppStore } from '../store/useAppStore';
import { ProductVisual } from './ProductVisual';

interface CatalogSectionProps {
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  onQuickView: (product: ProductItem) => void;
}

type CategoryFilter = 'all' | ProductCategory;
type SortMode = 'featured' | 'sizeAsc' | 'priceAsc';

function launchFlyToCart(sourceEl: HTMLElement | null) {
  if (
    !sourceEl ||
    typeof window === 'undefined' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return;
  }
  const targetEl = document.getElementById('cart-icon-target');
  if (!targetEl) return;

  const sRect = sourceEl.getBoundingClientRect();
  const tRect = targetEl.getBoundingClientRect();

  const orb = document.createElement('div');
  orb.style.position = 'fixed';
  orb.style.zIndex = '9999';
  orb.style.width = '16px';
  orb.style.height = '16px';
  orb.style.borderRadius = '9999px';
  orb.style.backgroundColor = '#2acbd2';
  orb.style.boxShadow = '0 4px 14px rgba(42,203,210,0.55)';
  orb.style.pointerEvents = 'none';
  orb.style.left = `${sRect.left + sRect.width / 2 - 8}px`;
  orb.style.top = `${sRect.top + sRect.height / 2 - 8}px`;
  orb.style.transition =
    'transform 620ms cubic-bezier(0.16, 1, 0.3, 1), opacity 620ms ease';

  document.body.appendChild(orb);

  requestAnimationFrame(() => {
    const dx = tRect.left + tRect.width / 2 - (sRect.left + sRect.width / 2);
    const dy = tRect.top + tRect.height / 2 - (sRect.top + sRect.height / 2);
    orb.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(0.35)`;
    orb.style.opacity = '0.2';
  });

  setTimeout(() => {
    orb.remove();
  }, 660);
}

export const CatalogSection: React.FC<CatalogSectionProps> = ({
  searchInputRef,
  onQuickView,
}) => {
  const { lang, addToCart, pushToast } = useAppStore();
  const t = TRANSLATIONS[lang];
  const isRtl = lang === 'ar';

  const [filter, setFilter] = useState<CategoryFilter>('all');
  const [sortBy, setSortBy] = useState<SortMode>('featured');
  const [query, setQuery] = useState('');
  const [cardColors, setCardColors] = useState<Record<string, ProductColorOption>>({});
  const [cardQtys, setCardQtys] = useState<Record<string, number>>({});

  const applyFilterWithTransition = (next: CategoryFilter) => {
    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => void;
    };
    if (
      typeof doc.startViewTransition === 'function' &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      doc.startViewTransition(() => setFilter(next));
    } else {
      setFilter(next);
    }
  };

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = PRODUCTS.filter((p) => {
      if (filter !== 'all' && p.category !== filter) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.sizeLabel.toLowerCase().includes(q) ||
        p.descriptionAr.toLowerCase().includes(q) ||
        p.descriptionEn.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
      );
    });

    if (sortBy === 'sizeAsc') {
      return [...list].sort((a, b) => a.capacityLiters - b.capacityLiters);
    }
    if (sortBy === 'priceAsc') {
      return [...list].sort(
        (a, b) => (a.priceSar ?? 9999) - (b.priceSar ?? 9999)
      );
    }
    return [...list].sort(
      (a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured))
    );
  }, [filter, query, sortBy]);

  const DirectionalArrow = isRtl ? ArrowUpLeft : ArrowUpRight;

  return (
    <>
      {/* Category Bento Grid */}
      <section id="divisions" className="py-16 sm:py-24">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10 scroll-reveal">
            <p className="text-xs font-semibold text-[var(--accent-teal-deep)] mb-2">
              {t.bento.kicker}
            </p>
            <h2 className="fluid-section-title font-bold text-[var(--text-primary)]">
              {t.bento.title}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Production Supplies Bento Card */}
            <button
              type="button"
              onClick={() => {
                applyFilterWithTransition('production');
                document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group relative text-start rounded-[28px] overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-surface)] min-h-[340px] sm:min-h-[400px] flex flex-col justify-end p-7 sm:p-9 cursor-pointer shadow-sm hover:shadow-xl transition-all"
            >
              <img
                src="src/assets/images/cat_production_supplies_1795437449850.jpg"
                alt={t.bento.prodTitle}
                width={800}
                height={600}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#092022]/90 via-[#092022]/45 to-transparent" />
              <div className="relative z-10 text-white space-y-3 max-w-lg">
                <h3 className="text-2xl sm:text-3xl font-bold">{t.bento.prodTitle}</h3>
                <p className="text-sm text-white/85 leading-relaxed">
                  {t.bento.prodDesc}
                </p>
                <span className="inline-flex items-center gap-2 pt-2 text-sm font-semibold text-[#6beaf0]">
                  <span>{t.bento.prodCta}</span>
                  <DirectionalArrow className={`w-4 h-4 transition-transform ${isRtl ? 'group-hover:-translate-x-0.5' : 'group-hover:translate-x-0.5'} group-hover:-translate-y-0.5`} aria-hidden="true" />
                </span>
              </div>
            </button>

            {/* Decor Planters Bento Card */}
            <button
              type="button"
              onClick={() => {
                applyFilterWithTransition('decor');
                document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group relative text-start rounded-[28px] overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-surface)] min-h-[340px] sm:min-h-[400px] flex flex-col justify-end p-7 sm:p-9 cursor-pointer shadow-sm hover:shadow-xl transition-all"
            >
              <img
                src="src/assets/images/cat_decor_planters_1795437449154.jpg"
                alt={t.bento.decorTitle}
                width={800}
                height={600}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#241610]/90 via-[#241610]/45 to-transparent" />
              <div className="relative z-10 text-white space-y-3 max-w-lg">
                <h3 className="text-2xl sm:text-3xl font-bold">{t.bento.decorTitle}</h3>
                <p className="text-sm text-white/85 leading-relaxed">
                  {t.bento.decorDesc}
                </p>
                <span className="inline-flex items-center gap-2 pt-2 text-sm font-semibold text-[#f3a688]">
                  <span>{t.bento.decorCta}</span>
                  <DirectionalArrow className={`w-4 h-4 transition-transform ${isRtl ? 'group-hover:-translate-x-0.5' : 'group-hover:translate-x-0.5'} group-hover:-translate-y-0.5`} aria-hidden="true" />
                </span>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Full Interactive Product Catalog */}
      <section id="catalog" className="py-16 sm:py-24 border-t border-[var(--border-subtle)]">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold text-[var(--accent-teal-deep)] mb-2">
                {t.catalog.kicker}
              </p>
              <h2 className="fluid-section-title font-bold text-[var(--text-primary)]">
                {t.catalog.title}
              </h2>
              <p className="text-sm text-[var(--text-muted)] mt-2 leading-relaxed">
                {t.catalog.subtitle}
              </p>
            </div>

            {/* Filter + Sort + Search Controls */}
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
              {/* Filter Tabs */}
              <div
                className="flex sm:inline-flex items-stretch p-1 rounded-2xl bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)]"
                role="tablist"
                aria-label="Product category filter"
              >
                {(['all', 'production', 'decor'] as CategoryFilter[]).map((key) => {
                  const active = filter === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => applyFilterWithTransition(key)}
                      className={`flex-1 sm:flex-none min-w-0 min-h-[40px] px-2 sm:px-4 py-1.5 rounded-xl text-xs font-semibold leading-tight text-center transition-all cursor-pointer sm:whitespace-nowrap ${
                        active
                          ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm'
                          : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {t.catalog.filters[key]}
                    </button>
                  );
                })}
              </div>

              {/* Search Input */}
              <div className="relative min-w-[220px] sm:w-64">
                <Search
                  className="w-4 h-4 text-[var(--text-muted)] absolute top-1/2 -translate-y-1/2 inset-s-3.5 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  ref={searchInputRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t.catalog.searchPlaceholder}
                  className="w-full min-h-[44px] ps-10 pe-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                />
              </div>

              {/* Sort Select */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortMode)}
                aria-label={t.catalog.sortLabel}
                className="min-h-[44px] px-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-primary)] cursor-pointer"
              >
                <option value="featured">{t.catalog.sortOptions.featured}</option>
                <option value="sizeAsc">{t.catalog.sortOptions.sizeAsc}</option>
                <option value="priceAsc">{t.catalog.sortOptions.priceAsc}</option>
              </select>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="py-16 text-center rounded-[24px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4">
              <p className="text-sm text-[var(--text-muted)]">{t.catalog.noResults}</p>
              <button
                type="button"
                onClick={() => {
                  setFilter('all');
                  setQuery('');
                }}
                className="px-5 py-2.5 rounded-xl bg-[var(--accent-teal-deep)] text-white text-xs font-semibold cursor-pointer"
              >
                {t.catalog.resetFilters}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => {
                const activeColor =
                  cardColors[product.id] ?? product.colors[0];
                const qty = cardQtys[product.id] ?? product.minOrderQty;

                return (
                  <article
                    key={product.id}
                    id={`product-${product.id}`}
                    className="@container rounded-[24px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-4 flex flex-col justify-between gap-4 hover:-translate-y-1 transition-all duration-300 shadow-[var(--shadow-soft)]"
                  >
                    <div className="space-y-3.5">
                      <div className="relative">
                        <ProductVisual product={product} activeColor={activeColor} />
                        <button
                          type="button"
                          onClick={() => onQuickView(product)}
                          aria-label={`${t.catalog.quickView} — ${product.name}`}
                          className="absolute top-3 inset-e-3 w-10 h-10 rounded-xl bg-[var(--bg-surface)]/90 border border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--accent-teal)] hover:text-[#072628] flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between gap-2 text-[11px] text-[var(--text-muted)]">
                        <span className="tabular-nums">{product.sku}</span>
                        <div className="flex items-center gap-2 sm:gap-1.5">
                          {product.colors.map((c) => {
                            const selected = c.id === activeColor.id;
                            return (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() =>
                                  setCardColors((prev) => ({
                                    ...prev,
                                    [product.id]: c,
                                  }))
                                }
                                aria-label={lang === 'ar' ? c.nameAr : c.nameEn}
                                className={`relative w-5 h-5 sm:w-4 sm:h-4 rounded-full border transition-transform cursor-pointer after:absolute after:-inset-1 after:rounded-full ${
                                  selected
                                    ? 'border-[var(--accent-teal-deep)] scale-125'
                                    : 'border-black/15 hover:scale-110'
                                }`}
                                style={{ backgroundColor: c.hex }}
                              />
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <h3
                          className="font-bold text-base text-[var(--text-primary)] leading-snug"
                          dir="ltr"
                        >
                          {product.name}
                        </h3>
                        <p className="text-xs text-[var(--text-muted)] mt-1.5 line-clamp-2 leading-relaxed">
                          {lang === 'ar'
                            ? product.descriptionAr
                            : product.descriptionEn}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[var(--border-subtle)] space-y-3">
                      <div className="flex items-baseline justify-between gap-2">
                        {product.priceSar !== null ? (
                          <span className="text-base font-bold text-[var(--accent-teal-deep)] tabular-nums">
                            {product.priceSar.toFixed(2)} {t.catalog.sarPerUnit}
                          </span>
                        ) : (
                          <span className="text-sm font-bold text-[var(--accent-clay)]">
                            {t.catalog.requestPrice}
                          </span>
                        )}
                        <span className="text-[11px] text-[var(--text-muted)] tabular-nums">
                          {t.catalog.minOrder} {product.minOrderQty}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-[var(--border-subtle)] rounded-xl bg-[var(--bg-canvas)]">
                          <button
                            type="button"
                            onClick={() =>
                              setCardQtys((prev) => ({
                                ...prev,
                                [product.id]: Math.max(1, qty - 10),
                              }))
                            }
                            aria-label="Decrease quantity"
                            className="w-9 h-11 flex items-center justify-center cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                          <span className="px-2 text-xs font-bold tabular-nums min-w-[34px] text-center">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setCardQtys((prev) => ({
                                ...prev,
                                [product.id]: qty + 10,
                              }))
                            }
                            aria-label="Increase quantity"
                            className="w-9 h-11 flex items-center justify-center cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            addToCart({
                              productId: product.id,
                              colorId: activeColor.id,
                              colorName:
                                lang === 'ar'
                                  ? activeColor.nameAr
                                  : activeColor.nameEn,
                              quantity: qty,
                            });
                            launchFlyToCart(e.currentTarget);
                            pushToast(`${t.toast.added} ${product.name}`);
                          }}
                          className="flex-1 min-h-[44px] px-3 rounded-xl bg-[var(--accent-teal-deep)] text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:opacity-95 transition-opacity cursor-pointer whitespace-nowrap"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>{t.catalog.addToCart}</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
};
