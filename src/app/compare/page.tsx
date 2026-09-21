import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/current-user";
import CompareHome from "./compare-home";

export const metadata: Metadata = {
  title: "Compare",
  description: "Compare your Continua profile with someone else's.",
};

export default async function ComparePage() {
  await requireUser("/compare");
  return <CompareHome />;
}
