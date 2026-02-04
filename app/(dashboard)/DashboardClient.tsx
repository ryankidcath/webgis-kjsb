"use client";

import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { getProyekByKode } from "@/app/actions/proyek";
import type { ProyekMapFeature } from "@/types/proyek";
import type { ProyekRow } from "@/types/proyek";
import ProyekDetailSidebar from "@/components/sidebar/ProyekDetailSidebar";
import { Search } from "lucide-react";

const ProyekMapDynamic = dynamic(
  () => import("@/components/map/ProyekMapDynamic"),
  { ssr: false }
);

interface DashboardClientProps {
  initialFeatures: ProyekMapFeature[] | { error: string };
}

export default function DashboardClient({ initialFeatures }: DashboardClientProps) {
  const [searchNamaPemohon, setSearchNamaPemohon] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedProyek, setSelectedProyek] = useState<ProyekRow | null>(null);
  const [sidebarLoading, setSidebarLoading] = useState(false);

  const handleFeatureClick = useCallback(async (feature: ProyekMapFeature) => {
    const kode = feature.kode_kjsb;
    if (!kode) return;
    setSidebarOpen(true);
    setSidebarLoading(true);
    setSelectedProyek(null);
    const result = await getProyekByKode(kode);
    setSidebarLoading(false);
    if (result && !("error" in result)) {
      setSelectedProyek(result);
    } else {
      setSelectedProyek(null);
    }
  }, []);

  return (
    <div className="h-[calc(100vh-56px)] flex flex-col md:flex-row">
      <div className="flex-1 flex flex-col min-h-0">
        <div className="p-2 md:p-4 shrink-0 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan Nama Pemohon..."
              value={searchNamaPemohon}
              onChange={(e) => setSearchNamaPemohon(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex-1 min-h-0 px-2 md:px-4 pb-2 md:pb-4">
          <ProyekMapDynamic
            initialFeatures={initialFeatures}
            searchNamaPemohon={searchNamaPemohon}
            onFeatureClick={handleFeatureClick}
          />
        </div>
      </div>
      {sidebarOpen && (
        <ProyekDetailSidebar
          proyek={selectedProyek}
          onClose={() => setSidebarOpen(false)}
          loading={sidebarLoading}
        />
      )}
    </div>
  );
}
