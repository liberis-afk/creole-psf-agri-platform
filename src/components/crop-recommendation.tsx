"use client";

import { useState } from "react";
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
    <div className="flex flex-col gap-2">
      <button
        onClick={handleClick}
        disabled={loading}
        className="w-fit rounded border border-black/20 px-3 py-2 text-sm disabled:opacity-50 dark:border-white/20"
      >
        {loading ? "Analyse en cours..." : "Recommandation IA"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {recommendation && (
        <div className="whitespace-pre-wrap rounded border border-black/10 p-3 text-sm dark:border-white/10">
          {recommendation}
        </div>
      )}
    </div>
  );
}
