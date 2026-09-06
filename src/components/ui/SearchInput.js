import { Input } from "@heroui/react";

export default function SearchInput({ icon: Icon, endContent, className = "", disabled, isDisabled, ...props }) {
  return (
    <div className="relative">
      {Icon ? (
        <span className="pointer-events-none absolute top-1/2 left-3 z-10 -translate-y-1/2">
          <Icon className="size-4 text-ink-600" />
        </span>
      ) : null}
      <Input
        className={`${Icon ? "pl-9" : ""} ${endContent ? "pr-9" : ""} ${className}`}
        disabled={disabled ?? isDisabled}
        {...props}
      />
      {endContent ? (
        <span className="absolute top-1/2 right-3 z-10 -translate-y-1/2">
          {endContent}
        </span>
      ) : null}
    </div>
  );
}