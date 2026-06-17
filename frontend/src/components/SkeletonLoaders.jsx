/**
 * SkeletonLoaders.jsx — Shimmer skeleton components for loading states
 * Used across the ERP to replace spinners with content-aware placeholders.
 */
import React from 'react';

// ─── Shimmer Animation (injected once) ───────────────────────────────────────
const shimmerStyle = `
  @keyframes skeletonShimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  .skel-block {
    background: linear-gradient(
      90deg,
      var(--border-glass, rgba(255,255,255,0.06)) 25%,
      rgba(255,255,255,0.12)                       50%,
      var(--border-glass, rgba(255,255,255,0.06)) 75%
    );
    background-size: 800px 100%;
    animation: skeletonShimmer 1.4s infinite linear;
    border-radius: 6px;
  }
`;

let _styleInjected = false;
function ensureStyle() {
  if (_styleInjected) return;
  _styleInjected = true;
  const tag = document.createElement('style');
  tag.textContent = shimmerStyle;
  document.head.appendChild(tag);
}

// ─── Base Block ──────────────────────────────────────────────────────────────
export function SkelBlock({ width = '100%', height = '14px', style = {} }) {
  ensureStyle();
  return (
    <div
      className="skel-block"
      style={{ width, height, borderRadius: '6px', flexShrink: 0, ...style }}
    />
  );
}

// ─── Table Skeleton ──────────────────────────────────────────────────────────
export function TableSkeleton({ rows = 6, cols = 6 }) {
  ensureStyle();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      {/* Header row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: '12px',
        padding: '14px 20px',
        borderBottom: '1px solid var(--border-glass)',
        marginBottom: '4px'
      }}>
        {Array.from({ length: cols }).map((_, i) => (
          <SkelBlock key={i} height="12px" width={i === 0 ? '70%' : '85%'} />
        ))}
      </div>
      {/* Data rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={rowIdx}
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: '12px',
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.03)',
            alignItems: 'center'
          }}
        >
          {Array.from({ length: cols }).map((_, colIdx) => (
            colIdx === 1 ? (
              // Name column: avatar + text
              <div key={colIdx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <SkelBlock width="32px" height="32px" style={{ borderRadius: '50%', flexShrink: 0 }} />
                <SkelBlock width="80%" height="13px" />
              </div>
            ) : (
              <SkelBlock
                key={colIdx}
                height="13px"
                width={colIdx === cols - 1 ? '60%' : `${65 + (colIdx * 7) % 25}%`}
              />
            )
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Card Skeleton ───────────────────────────────────────────────────────────
export function CardSkeleton({ count = 3 }) {
  ensureStyle();
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${count}, 1fr)`,
      gap: '16px'
    }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="glass-panel"
          style={{
            borderRadius: '16px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            border: '1px solid var(--border-glass)',
            background: 'var(--bg-card)'
          }}
        >
          {/* Header: icon + label + count bubble */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <SkelBlock width="46px" height="46px" style={{ borderRadius: '12px' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <SkelBlock width="60px" height="10px" />
                <SkelBlock width="100px" height="14px" />
              </div>
            </div>
            <SkelBlock width="56px" height="48px" style={{ borderRadius: '12px' }} />
          </div>
          {/* Divider */}
          <div style={{ height: '1px', background: 'var(--border-glass)' }} />
          {/* Gender bar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <SkelBlock height="7px" style={{ borderRadius: '99px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <SkelBlock width="80px" height="11px" />
              <SkelBlock width="80px" height="11px" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Stat Row Skeleton (simple count cards) ──────────────────────────────────
export function StatRowSkeleton({ count = 3 }) {
  ensureStyle();
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${count}, 1fr)`, gap: '16px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="glass-panel"
          style={{
            borderRadius: '16px', padding: '24px 20px',
            border: '1px solid var(--border-glass)', background: 'var(--bg-card)',
            display: 'flex', alignItems: 'center', gap: '18px'
          }}
        >
          <SkelBlock width="52px" height="52px" style={{ borderRadius: '14px' }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <SkelBlock width="80px" height="11px" />
            <SkelBlock width="50px" height="28px" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Form Skeleton ───────────────────────────────────────────────────────────
export function FormSkeleton({ fields = 6 }) {
  ensureStyle();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <SkelBlock width={`${80 + (i * 13) % 40}px`} height="12px" />
          <SkelBlock height="40px" style={{ borderRadius: '10px' }} />
        </div>
      ))}
      <SkelBlock height="44px" width="160px" style={{ borderRadius: '10px', marginTop: '8px' }} />
    </div>
  );
}

// ─── Page-Level Content Skeleton ─────────────────────────────────────────────
export function PageSkeleton() {
  ensureStyle();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* Filter bar */}
      <div
        className="glass-panel"
        style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px',
          border: '1px solid var(--border-glass)', borderRadius: '16px', background: 'var(--bg-card)' }}
      >
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <SkelBlock height="40px" width="320px" style={{ borderRadius: '10px' }} />
          <SkelBlock height="40px" width="140px" style={{ borderRadius: '10px' }} />
          <SkelBlock height="40px" width="100px" style={{ borderRadius: '10px', marginLeft: 'auto' }} />
        </div>
        <div style={{ display: 'flex', gap: '8px', paddingTop: '10px', borderTop: '1px solid var(--border-glass)' }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <SkelBlock key={i} height="32px" width={`${55 + (i * 10) % 25}px`} style={{ borderRadius: '8px' }} />
          ))}
        </div>
      </div>
      {/* Table */}
      <div
        className="glass-panel"
        style={{ padding: '24px', border: '1px solid var(--border-glass)', borderRadius: '16px', background: 'var(--bg-card)' }}
      >
        <TableSkeleton rows={8} cols={6} />
      </div>
    </div>
  );
}

// ─── List Item Skeleton (for feeds/notices) ───────────────────────────────────
export function ListSkeleton({ rows = 5 }) {
  ensureStyle();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'center', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
          <SkelBlock width="40px" height="40px" style={{ borderRadius: '10px', flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <SkelBlock width={`${55 + (i * 17) % 35}%`} height="13px" />
            <SkelBlock width={`${40 + (i * 11) % 40}%`} height="11px" />
          </div>
          <SkelBlock width="70px" height="12px" />
        </div>
      ))}
    </div>
  );
}

// ─── Section Loading (inline spinner fallback for lazy components) ───────────
export function SectionLoading() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '300px', width: '100%', flexDirection: 'column', gap: '12px'
    }}>
      <div style={{
        width: '32px', height: '32px',
        border: '3px solid var(--border-glass)',
        borderTopColor: 'hsl(var(--color-primary))',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite'
      }} />
      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Loading...</span>
    </div>
  );
}
