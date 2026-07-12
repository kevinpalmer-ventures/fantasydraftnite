import { useEffect, useState, type ReactNode } from "react";

// Render children only after mount so live-clock UIs never hydrate against a
// stale server timestamp.
export function ClientOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? <>{children}</> : <>{fallback}</>;
}
