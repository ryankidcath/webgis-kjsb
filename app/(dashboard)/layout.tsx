import Link from "next/link";
import { Map } from "lucide-react";
import { getProyekWithGeom } from "@/app/actions/proyek";
import LayoutWithMap from "./LayoutWithMap";
import NavLinks from "./NavLinks";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialFeatures = await getProyekWithGeom();
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white shadow-panel shrink-0">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold text-slate-800 text-base shrink-0 transition-colors duration-200 hover:text-primary-600"
          >
            <Map className="w-6 h-6 text-primary-600 shrink-0" />
            WebGIS KJSB Benning dan Rekan
          </Link>
          <div className="h-8 w-px bg-slate-200 shrink-0 hidden sm:block" aria-hidden />
          <NavLinks />
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        <LayoutWithMap initialFeatures={initialFeatures}>{children}</LayoutWithMap>
      </main>
    </div>
  );
}
