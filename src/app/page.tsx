import { redirect } from "next/navigation";
import { listYears } from "@/lib/calculations";

export const dynamic = "force-dynamic";

export default async function Home() {
  const years = await listYears();
  const latest = years[years.length - 1];
  redirect(`/dashboard?year=${latest}`);
}
