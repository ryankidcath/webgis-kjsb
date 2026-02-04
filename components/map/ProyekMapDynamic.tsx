"use client";

import dynamic from "next/dynamic";
import type { ProyekMapFeature } from "@/types/proyek";

const ProyekMap = dynamic(() => import("./ProyekMap"), { ssr: false });

interface ProyekMapDynamicProps {
  initialFeatures: ProyekMapFeature[] | { error: string };
  searchNamaPemohon?: string;
  onFeatureClick?: (feature: ProyekMapFeature) => void;
  zoomToKode?: string | null;
  onZoomDone?: () => void;
}

export default function ProyekMapDynamic(props: ProyekMapDynamicProps) {
  return <ProyekMap {...props} />;
}
