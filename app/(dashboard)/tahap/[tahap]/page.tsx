import Link from "next/link";
import { notFound } from "next/navigation";
import FormTahap1 from "./FormTahap1";
import FormTahap2 from "./FormTahap2";
import FormTahap3 from "./FormTahap3";
import FormTahap4 from "./FormTahap4";
import FormTahap5 from "./FormTahap5";
import { ChevronRight } from "lucide-react";

const TAHAP = ["1", "2", "3", "4", "5"] as const;

const TAHAP_DESC: Record<string, string> = {
  "1": "Pendaftaran proyek baru – data klien, pemohon, dan dokumen administrasi.",
  "2": "Data berkas spasial dan SPS.",
  "3": "Data ST, surat pemberitahuan, pengukuran, dan surveyor.",
  "4": "Legalisasi GU, GeoJSON, dan dokumen GU/NIB/PBT.",
  "5": "TTE, upload dokumen, dan tanggal selesai BPN.",
};

export default function TahapPage({ params }: { params: { tahap: string } }) {
  const { tahap } = params;
  if (!TAHAP.includes(tahap as (typeof TAHAP)[number])) notFound();

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <nav className="flex items-center gap-2 text-sm text-slate-500" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-primary-600 transition-colors duration-200">Beranda</Link>
        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
        <span className="text-slate-700 font-medium">Form Tahap {tahap}</span>
      </nav>
      <div>
        <h1 className="text-xl font-semibold text-slate-800 mb-1">Form Tahap {tahap}</h1>
        <p className="text-sm text-slate-600">{TAHAP_DESC[tahap] ?? ""}</p>
      </div>
      {tahap === "1" && <FormTahap1 />}
      {tahap === "2" && <FormTahap2 />}
      {tahap === "3" && <FormTahap3 />}
      {tahap === "4" && <FormTahap4 />}
      {tahap === "5" && <FormTahap5 />}
    </div>
  );
}
