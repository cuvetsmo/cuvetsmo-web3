"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

/**
 * Theme toggle — flips data-theme attribute on <html> and persists in
 * localStorage under "cuvetsmo-web3-theme". The inline script in
 * layout.tsx applies the stored choice before React hydrates, so this
 * component only reads the current state on mount and exposes the
 * toggle button. No useEffect race on first paint.
 */
export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    setIsDark(current === "dark");
    setMounted(true);
  }, []);

  function toggle() {
    const next = isDark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("cuvetsmo-web3-theme", next);
    } catch {}
    setIsDark(!isDark);
  }

  // Render a placeholder shape during SSR + before hydration so layout
  // does not shift. Icon swap waits until we know the real state.
  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex items-center justify-center rounded-md p-2 text-[var(--color-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)] transition-colors"
      aria-label={mounted ? (isDark ? "Switch to light mode" : "Switch to dark mode") : "Toggle theme"}
      title={mounted ? (isDark ? "Light mode" : "Dark mode") : "Toggle theme"}
    >
      {mounted ? (
        isDark ? <Sun size={18} strokeWidth={1.75} /> : <Moon size={18} strokeWidth={1.75} />
      ) : (
        <span className="block w-[18px] h-[18px]" />
      )}
    </button>
  );
}
