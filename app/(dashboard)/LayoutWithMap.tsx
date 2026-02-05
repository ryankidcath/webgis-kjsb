"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { getProyekByKode, getProyekWithGeom, getNamaPemohonSuggestionsForMap } from "@/app/actions/proyek";
import type { ProyekMapFeature } from "@/types/proyek";
import type { ProyekRow } from "@/types/proyek";
import ProyekDetailSidebar from "@/components/sidebar/ProyekDetailSidebar";
import { Search, MapPinned } from "lucide-react";

const DEBOUNCE_MS = 280;

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
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchWrapperRef = useRef<HTMLDivElement>(null);
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

  const onSearch = useCallback(async () => {
    setSidebarOpen(false);
    setShowSuggestions(false);
    const result = await getProyekWithGeom(searchNamaPemohon.trim() || undefined);
    if (Array.isArray(result)) setFeatures(result);
  }, [searchNamaPemohon]);

  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    if (!searchNamaPemohon.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    searchDebounceRef.current = setTimeout(() => {
      setSuggestionsLoading(true);
      getNamaPemohonSuggestionsForMap(searchNamaPemohon).then((list) => {
        setSuggestions(list);
        setShowSuggestions(list.length > 0);
        setSuggestionsLoading(false);
      });
      searchDebounceRef.current = null;
    }, DEBOUNCE_MS);
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchNamaPemohon]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelectSuggestion(nama: string) {
    setSearchNamaPemohon(nama);
    setShowSuggestions(false);
    setSuggestions([]);
    setSidebarOpen(false);
    getProyekWithGeom(nama).then((result) => {
      if (Array.isArray(result)) setFeatures(result);
    });
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
                <div ref={searchWrapperRef} className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Cari berdasarkan Nama Pemohon..."
                    value={searchNamaPemohon}
                    onChange={(e) => setSearchNamaPemohon(e.target.value)}
                    onFocus={() => searchNamaPemohon.trim() && suggestions.length > 0 && setShowSuggestions(true)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setShowSuggestions(false);
                        onSearch();
                      }
                    }}
                    className="input-base pl-9"
                    autoComplete="off"
                  />
                  {showSuggestions && (
                    <ul
                      className="absolute z-50 mt-1 w-full max-h-48 overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg py-1"
                      role="listbox"
                    >
                      {suggestionsLoading ? (
                        <li className="px-3 py-2 text-sm text-slate-500">Memuat...</li>
                      ) : (
                        suggestions.map((nama) => (
                          <li
                            key={nama}
                            role="option"
                            className="px-3 py-2 text-sm text-slate-800 hover:bg-primary-50 cursor-pointer"
                            onMouseDown={() => handleSelectSuggestion(nama)}
                          >
                            {nama}
                          </li>
                        ))
                      )}
                    </ul>
                  )}
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
