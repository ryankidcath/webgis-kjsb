"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { getProyekByKode, getProyekWithGeom } from "@/app/actions/proyek";
import type { ProyekMapFeature } from "@/types/proyek";
import type { ProyekRow } from "@/types/proyek";
import ProyekDetailSidebar from "@/components/sidebar/ProyekDetailSidebar";
import { Search, MapPinned } from "lucide-react";

const ProyekMapDynamic = dynamic(
  () => import("@/components/map/ProyekMapDynamic"),
  { ssr: false }
);

interface LayoutWithMapProps {
  initialFeatures: ProyekMapFeature[] | { error: string };
  children: React.ReactNode;
}

export default function LayoutWithMap({ initialFeatures, children }: LayoutWithMapProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [features, setFeatures] = useState<ProyekMapFeature[]>(() =>
    Array.isArray(initialFeatures) ? initialFeatures : []
  );
  const [searchNamaPemohon, setSearchNamaPemohon] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedProyek, setSelectedProyek] = useState<ProyekRow | null>(null);
  const [sidebarLoading, setSidebarLoading] = useState(false);
  const [zoomToKode, setZoomToKode] = useState<string | null>(null);

  useEffect(() => {
    if (Array.isArray(initialFeatures)) setFeatures(initialFeatures);
    else setFeatures([]);
  }, [initialFeatures]);

  const zoomTo = searchParams.get("zoomTo");
  useEffect(() => {
    if (!zoomTo) return;
    setZoomToKode(zoomTo);
    getProyekWithGeom().then((result) => {
      if (Array.isArray(result)) setFeatures(result);
    });
  }, [zoomTo]);

  const handleFeatureClick = useCallback(async (feature: ProyekMapFeature) => {
    const kode = feature.kode_kjsb;
    if (!kode) return;
    setSidebarOpen(true);
    setSidebarLoading(true);
    setSelectedProyek(null);
    const result = await getProyekByKode(kode);
    setSidebarLoading(false);
    if (result && !("error" in result)) setSelectedProyek(result);
    else setSelectedProyek(null);
  }, []);

  async function onSearch() {
    setSidebarOpen(false);
    const result = await getProyekWithGeom(searchNamaPemohon.trim() || undefined);
    if (Array.isArray(result)) setFeatures(result);
  }

  const isPetaPage = pathname === "/";

  return (
    <div className="h-[calc(100vh-56px)] flex flex-row min-h-0">
      <div className="flex-1 min-w-0 flex flex-col min-h-0 border-r border-slate-200 bg-slate-50/50">
        <div className="flex-1 min-h-0 p-2 md:p-4">
          <ProyekMapDynamic
            initialFeatures={features}
            searchNamaPemohon={searchNamaPemohon}
            onFeatureClick={handleFeatureClick}
            zoomToKode={zoomToKode}
            onZoomDone={() => {
              setZoomToKode(null);
              router.replace("/");
            }}
          />
        </div>
      </div>
      <div className="w-full md:w-[420px] lg:w-[480px] flex-shrink-0 flex flex-col min-h-0 overflow-auto bg-white border-l border-slate-200 shadow-panel">
        {isPetaPage ? (
          <>
            <div className="p-4 border-b border-slate-200 shrink-0 bg-white">
              <form
                onSubmit={(e) => { e.preventDefault(); onSearch(); }}
                className="flex flex-wrap gap-2"
              >
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Cari berdasarkan Nama Pemohon..."
                    value={searchNamaPemohon}
                    onChange={(e) => setSearchNamaPemohon(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") onSearch(); }}
                    className="input-base pl-9"
                  />
                </div>
                <button type="submit" className="btn-primary">
                  Cari
                </button>
              </form>
            </div>
            <div className="flex-1 min-h-0 overflow-auto">
              {sidebarOpen ? (
                <ProyekDetailSidebar
                  proyek={selectedProyek}
                  onClose={() => setSidebarOpen(false)}
                  loading={sidebarLoading}
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center min-h-[200px]">
                  <div className="rounded-full bg-slate-100 p-4 mb-4">
                    <MapPinned className="w-10 h-10 text-slate-400" />
                  </div>
                  <p className="text-slate-600 font-medium mb-1">Klik bidang tanah</p>
                  <p className="text-sm text-slate-500">Pilih salah satu bidang tanah untuk melihat data detail</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-auto">{children}</div>
        )}
      </div>
    </div>
  );
}
