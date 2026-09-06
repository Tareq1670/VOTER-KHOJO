"use client";

const DEFAULT_SIZE = 1;

export function RippleLoader({ size = DEFAULT_SIZE, label, color = "white" }) {
  return (
    <div
      className={`ripple-loader${color === "brand" ? " is-brand" : ""}`}
      role="status"
      aria-live="polite"
      style={{ "--rl-size": `${size}px` }}
    >
      <span className="loader" aria-hidden="true" />
      {label ? <span className="ripple-loader-label">{label}</span> : null}
    </div>
  );
}