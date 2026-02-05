"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import type { ProyekMapFeature } from "@/types/proyek";
import { getProyekWithGeom } from "@/app/actions/proyek";

// Fix default marker icons in Next.js (Leaflet uses file paths that break with bundler)
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const DEFAULT_CENTER: [number, number] = [-6.9, 108.5];
const DEFAULT_ZOOM = 10;

function FitBounds({ features }: { features: ProyekMapFeature[] }) {
  const map = useMap();
  useEffect(() => {
    if (features.length === 0) return;
    const bounds = L.latLngBounds([] as L.LatLngLiteral[]);
    features.forEach((f) => {
      if (!f.geom) return;
      if (f.geom.type === "Polygon") {
        (f.geom.coordinates[0] as [number, number][]).forEach((c) => bounds.extend([c[1], c[0]]));
      } else if (f.geom.type === "MultiPolygon") {
        f.geom.coordinates.forEach((ring) => {
          (ring[0] as [number, number][]).forEach((c) => bounds.extend([c[1], c[0]]));
        });
      }
    });
    if (bounds.isValid()) map.flyToBounds(bounds, { padding: [24, 24], maxZoom: 18, duration: 1.2 });
  }, [map, features]);
  return null;
}

function FitBoundsToKode({
  features,
  zoomToKode,
  onDone,
}: {
  features: ProyekMapFeature[];
  zoomToKode: string | null | undefined;
  onDone?: () => void;
}) {
  const map = useMap();
  useEffect(() => {
    if (!zoomToKode?.trim() || !onDone) return;
    const f = features.find((x) => x.kode_kjsb === zoomToKode.trim());
    if (!f?.geom) return;
    const bounds = L.latLngBounds([] as L.LatLngLiteral[]);
    if (f.geom.type === "Polygon") {
      (f.geom.coordinates[0] as [number, number][]).forEach((c) => bounds.extend([c[1], c[0]]));
    } else if (f.geom.type === "MultiPolygon") {
      f.geom.coordinates.forEach((ring) => {
        (ring[0] as [number, number][]).forEach((c) => bounds.extend([c[1], c[0]]));
      });
    }
    if (bounds.isValid()) {
      map.flyToBounds(bounds, { padding: [40, 40], maxZoom: 16, duration: 1.2 });
      onDone();
    }
  }, [map, features, zoomToKode, onDone]);
  return null;
}

interface ProyekMapProps {
  initialFeatures: ProyekMapFeature[] | { error: string };
  searchNamaPemohon?: string;
  onFeatureClick?: (feature: ProyekMapFeature) => void;
  zoomToKode?: string | null;
  onZoomDone?: () => void;
}

export default function ProyekMap({
  initialFeatures,
  searchNamaPemohon = "",
  onFeatureClick,
  zoomToKode,
  onZoomDone,
}: ProyekMapProps) {
  const [features, setFeatures] = useState<ProyekMapFeature[]>(() =>
    Array.isArray(initialFeatures) ? initialFeatures : []
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (Array.isArray(initialFeatures)) {
      setFeatures(initialFeatures);
      return;
    }
    setFeatures([]);
  }, [initialFeatures]);

  const filtered = useMemo(() => {
    if (!searchNamaPemohon.trim()) return features;
    const q = searchNamaPemohon.trim().toLowerCase();
    return features.filter(
      (f) => f.nama_pemohon?.toLowerCase().includes(q)
    );
  }, [features, searchNamaPemohon]);

  const refresh = useCallback(async () => {
    setLoading(true);
    const result = await getProyekWithGeom();
    setLoading(false);
    if (Array.isArray(result)) setFeatures(result);
  }, []);

  return (
    <div className="relative h-full w-full rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className="h-full w-full z-0"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds features={zoomToKode ? [] : filtered} />
        <FitBoundsToKode features={filtered} zoomToKode={zoomToKode} onDone={onZoomDone} />
        {filtered.map((f) => {
          if (!f.geom) return null;
          const geojson = { type: "Feature" as const, properties: { id: f.id, kode_kjsb: f.kode_kjsb, nama_pemohon: f.nama_pemohon }, geometry: f.geom };
          return (
            <GeoJSON
              key={f.id}
              data={geojson}
              eventHandlers={{
                click: () => onFeatureClick?.(f),
              }}
              style={{
                color: "#0ea5e9",
                weight: 2,
                fillOpacity: 0.2,
              }}
            />
          );
        })}
      </MapContainer>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-[1000]">
          <span className="text-slate-600">Memuat...</span>
        </div>
      )}
    </div>
  );
}

export { getProyekWithGeom };
