import type { Metadata } from "next";
export const metadata: Metadata = { title: "VANTAGE — Trading Intelligence" };
import { Dashboard } from "@/components/dashboard";
export default function Home() {
  return <Dashboard />;
}
