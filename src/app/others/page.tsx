import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/current-user";
import OthersHome from "./others-home";

export const metadata: Metadata = {
  title: "How others see you",
  description: "See where people who know you place you on the six Continua axes.",
};

export default async function OthersPage() {
  await requireUser("/others");
  return <OthersHome />;
}
