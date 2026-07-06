"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { getCropRecommendation } from "@/app/(dashboard)/cultures/[cropId]/ai-actions";

export function CropRecommendation({ cropId }: { cropId: string }) {
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const text = await getCropRecommendation(cropId);
      setRecommendation(text);
    } catch {
      setError("Impossible d'obtenir une recommandation pour le moment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={handleClick}
        disabled={loading}
        className="inline-flex w-fit items-center gap-2 rounded-lg bg-primary-soft px-3 py-2 text-sm font-medium text-primary-soft-foreground transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Sparkles className="h-4 w-4" strokeWidth={2} />
        {loading ? "Analyse en cours..." : "Recommandation IA"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {recommendation && (
        <div className="whitespace-pre-wrap rounded-xl border border-primary-soft bg-primary-soft/40 p-4 text-sm shadow-sm">
          {recommendation}
        </div>
      )}
    </div>
  );
}
