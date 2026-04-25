import { MatchPageClient } from "@/components/MatchPageClient";

export const metadata = {
  title: "Match by mood · Threadline",
  description:
    "Upload a mood board, sketch, or runway shot. Our AI extracts palette, mood and texture, then ranks Nigerian fabrics with explainable reasoning.",
};

export default function MatchPage() {
  return <MatchPageClient />;
}
