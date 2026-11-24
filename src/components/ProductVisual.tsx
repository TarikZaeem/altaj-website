import React, { useState } from 'react';
import type { ProductColorOption, ProductItem } from '../data/products';

interface ProductVisualProps {
  product: ProductItem;
  activeColor: ProductColorOption;
}

export const ProductVisual: React.FC<ProductVisualProps> = ({
  product,
  activeColor,
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const { profileType, dimensions3d } = product;

  const isSteel = activeColor.isMetal;
  const baseFill = activeColor.hex;

  // Render crisp tailored SVG silhouette preview reflecting exact pot shape + color
  const topW = Math.min(112, Math.max(66, dimensions3d.topRadius * 64));
  const botW = Math.min(96, Math.max(44, dimensions3d.bottomRadius * 64));
  const h = Math.min(118, Math.max(64, dimensions3d.height * 72));
  const cx = 100;
  const topY = 148 - h;
  const botY = 148;

  return (
    <div className="relative w-full aspect-[4/3] overflow-hidden rounded-[18px] bg-[var(--bg-surface-alt)] flex items-center justify-center group">
      {/* Subtle Studio Backdrop Photo (lazy decoded) */}
      {!imgFailed && (
        <img
          src={product.image}
          alt={`${product.name} — ${product.sizeLabel}`}
          width={400}
          height={300}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          className="absolute inset-0 w-full h-full object-cover opacity-22 dark:opacity-15 scale-105 group-hover:scale-110 transition-transform duration-500"
        />
      )}

      {/* Radial Studio Lighting Glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 42%, oklch(1 0 0 / 0.55) 0%, transparent 72%)',
        }}
      />

      {/* Precision SVG Pot Silhouette in Selected Color */}
      <svg
        viewBox="0 0 200 170"
        className="relative z-10 w-40 h-36 drop-shadow-md transition-transform duration-300 group-hover:-translate-y-1"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`grad-${product.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={baseFill} stopOpacity="0.88" />
            <stop offset="35%" stopColor={isSteel ? '#ffffff' : baseFill} stopOpacity={isSteel ? '0.92' : '1'} />
            <stop offset="75%" stopColor={baseFill} stopOpacity="0.92" />
            <stop offset="100%" stopColor="#0b1516" stopOpacity="0.45" />
          </linearGradient>
        </defs>

        {/* Soft floor shadow */}
        <ellipse cx={cx} cy={botY + 6} rx={botW * 0.68} ry="6" fill="rgba(10,25,25,0.16)" />

        {/* Optional foliage */}
        {dimensions3d.hasPlant && (
          <g transform={`translate(${cx}, ${topY})`}>
            <path
              d="M0,4 C-14,-28 -32,-24 -26,-2 C-18,-8 -8,-4 0,4 Z"
              fill="#2f7d4f"
            />
            <path
              d="M0,4 C14,-32 34,-26 24,-2 C16,-8 8,-4 0,4 Z"
              fill="#3d935f"
            />
            <path
              d="M-3,4 C-6,-38 6,-38 3,4 Z"
              fill="#4ba870"
            />
          </g>
        )}

        {/* Main Pot Body */}
        {profileType === 'round' ? (
          <path
            d={`M ${cx - topW / 2} ${topY} Q ${cx - topW * 0.66} ${(topY + botY) / 2} ${cx - botW / 2} ${botY} L ${cx + botW / 2} ${botY} Q ${cx + topW * 0.66} ${(topY + botY) / 2} ${cx + topW / 2} ${topY} Z`}
            fill={`url(#grad-${product.id})`}
          />
        ) : (
          <polygon
            points={`${cx - topW / 2},${topY} ${cx + topW / 2},${topY} ${cx + botW / 2},${botY} ${cx - botW / 2},${botY}`}
            fill={`url(#grad-${product.id})`}
          />
        )}

        {/* Horizontal Molded Ribs */}
        {dimensions3d.ribs > 0 &&
          Array.from({ length: Math.min(4, dimensions3d.ribs) }).map((_, i) => {
            const ry = topY + ((i + 1) / (Math.min(4, dimensions3d.ribs) + 1)) * h;
            const t = (ry - topY) / h;
            const rw = topW * (1 - t) + botW * t;
            return (
              <line
                key={i}
                x1={cx - rw / 2 + 2}
                y1={ry}
                x2={cx + rw / 2 - 2}
                y2={ry}
                stroke="rgba(255,255,255,0.28)"
                strokeWidth="1.5"
              />
            );
          })}

        {/* Rolled Nursery Rim */}
        <rect
          x={cx - topW / 2 - 5}
          y={topY - 5}
          width={topW + 10}
          height="10"
          rx="4"
          fill={baseFill}
          stroke="rgba(255,255,255,0.28)"
          strokeWidth="1"
        />
      </svg>

      {/* Size Label (Clean Unboxed Typography) */}
      <span className="absolute bottom-3 inset-s-3.5 text-[11px] font-semibold text-[var(--text-primary)] bg-[var(--bg-surface)]/85 px-2.5 py-1 rounded-lg border border-[var(--border-subtle)] tabular-nums">
        {product.sizeLabel}
      </span>
    </div>
  );
};
