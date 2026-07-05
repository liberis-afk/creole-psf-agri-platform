"use client";

import dynamic from "next/dynamic";
import type { ParcelMarker } from "./parcel-map";

export type { ParcelMarker };

export const ParcelMap = dynamic(
  () => import("./parcel-map").then((mod) => mod.ParcelMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center text-sm opacity-70">
        Chargement de la carte...
      </div>
    ),
  },
);
