"use client";

const DEFAULT_SIZE = 1.5;

export function PrinterLoader({ size = DEFAULT_SIZE, label, compact = false }) {
  return (
    <div
      className={`printer-loader${compact ? " is-compact" : ""}`}
      role="status"
      aria-live="polite"
      style={{ "--pl-size": `${size}px` }}
    >
      <span className="loader" aria-hidden="true" />
      {label ? <span className="printer-loader-label">{label}</span> : null}
    </div>
  );
}