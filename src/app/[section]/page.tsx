import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ModulePage } from "@/components/modules";
const sections = [
  "knowledge",
  "community",
  "strategies",
  "requests",
  "settings",
  "leaderboard",
  "news",
  "economy",
  "ai",
  "copy-trading",
  "subscription",
];
export function generateStaticParams() {
  return sections.map((section) => ({ section }));
}
export default async function Section({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (!sections.includes(section)) notFound();
  return (
    <Suspense fallback={<p>Загрузка пространства…</p>}>
      <ModulePage slug={section} />
    </Suspense>
  );
}
