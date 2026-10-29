import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/current-user";
import RateForm from "./rate-form";

export const metadata: Metadata = {
  title: "How you see them",
  description: "Answer a few questions about someone you know.",
};

export default async function RatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireUser(`/others/rate/${id}`);
  return <RateForm id={id} />;
}
