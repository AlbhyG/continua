import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/current-user";
import ComparisonView from "./comparison-view";

export const metadata: Metadata = {
  title: "Comparison",
  description: "Compare two Continua profiles.",
};

export default async function ComparisonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireUser(`/compare/${id}`);
  return <ComparisonView id={id} />;
}
