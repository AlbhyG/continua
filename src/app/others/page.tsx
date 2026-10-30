import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/current-user";
import OthersHome from "./others-home";

export const metadata: Metadata = {
  title: "How Others See You",
  description: "See your Continua profile through the eyes of people who know you.",
};

export default async function OthersPage() {
  await requireUser("/others");
  return <OthersHome />;
}
