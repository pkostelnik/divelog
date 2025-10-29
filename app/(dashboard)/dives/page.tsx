import { redirect } from "next/navigation";

export default function LegacyDivesPage() {
  redirect("/dashboard/dives");
}
