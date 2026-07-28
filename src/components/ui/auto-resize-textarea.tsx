"use client";

import { useEffect, useRef } from "react";

function resize(el: HTMLTextAreaElement) {
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
}

export function AutoResizeTextarea({
  className,
  onInput,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (ref.current) resize(ref.current);
  }, []);

  return (
    <textarea
      ref={ref}
      rows={1}
      onInput={(e) => {
        resize(e.currentTarget);
        onInput?.(e);
      }}
      className={`resize-none overflow-hidden ${className ?? ""}`}
      {...props}
    />
  );
}
