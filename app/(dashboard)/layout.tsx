/**
 * Legacy route-group layout.
 *
 * The child pages in this route group only exist to redirect old URLs
 * (e.g. /dives, /equipment) to their canonical /dashboard/* equivalents.
 * The actual dashboard layout and auth guard lives in app/dashboard/layout.tsx.
 */
import type { ReactNode } from "react";

export default function LegacyDashboardLayout({ children }: { children: ReactNode }) {
  return children;
}
