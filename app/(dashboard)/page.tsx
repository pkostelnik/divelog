import { redirect } from "next/navigation";

export default function LegacyDashboardRoot() {
  redirect("/dashboard");
}
