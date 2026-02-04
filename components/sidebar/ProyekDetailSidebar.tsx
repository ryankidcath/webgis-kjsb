"use client";

import { X, FileText, MapPin, ClipboardList, FileCheck, CheckCircle, MapPinned } from "lucide-react";
import type { ProyekRow } from "@/types/proyek";

function formatDate(v: string | null | undefined) {
  if (!v) return "–";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "–";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatNum(v: number | null | undefined) {
  if (v == null) return "–";
  return new Intl.NumberFormat("id-ID").format(v);
}

const SIDEBAR_BASE = "h-full flex flex-col bg-white border-l border-slate-200 shadow-panel w-full md:w-[400px] lg:w-[420px] overflow-hidden";

function SidebarHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="p-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white">
      <span className="font-semibold text-slate-800">Detail Proyek</span>
      <button
        type="button"
        onClick={onClose}
        className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors duration-200"
        aria-label="Tutup"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="p-4 flex-1 flex flex-col gap-4">
      <div className="h-4 w-3/4 rounded bg-slate-200 animate-pulse" />
      <div className="h-3 w-full rounded bg-slate-100 animate-pulse" />
      <div className="h-3 w-full rounded bg-slate-100 animate-pulse" />
      <div className="h-3 w-5/6 rounded bg-slate-100 animate-pulse" />
      <div className="mt-4 h-4 w-1/2 rounded bg-slate-200 animate-pulse" />
      <div className="h-3 w-full rounded bg-slate-100 animate-pulse" />
      <div className="h-3 w-full rounded bg-slate-100 animate-pulse" />
      <div className="h-3 w-4/5 rounded bg-slate-100 animate-pulse" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div className="rounded-full bg-slate-100 p-4 mb-4">
        <MapPinned className="w-10 h-10 text-slate-400" />
      </div>
      <p className="text-slate-600 font-medium mb-1">Belum ada proyek dipilih</p>
      <p className="text-sm text-slate-500">Klik bidang tanah untuk melihat data detail.</p>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <section className="card-section">
      <h3 className="flex items-center gap-2 font-semibold text-slate-800 mb-3 text-sm">
        <Icon className="w-4 h-4 text-primary-600 shrink-0" />
        {title}
      </h3>
      <div className="grid gap-2 text-sm">{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 border-b border-slate-100 last:border-0">
      <span className="text-slate-500 shrink-0">{label}</span>
      <span className="text-slate-900 text-right break-words min-w-0">{value ?? "–"}</span>
    </div>
  );
}

interface ProyekDetailSidebarProps {
  proyek: ProyekRow | null;
  onClose: () => void;
  loading?: boolean;
}

export default function ProyekDetailSidebar({ proyek, onClose, loading }: ProyekDetailSidebarProps) {
  if (loading) {
    return (
      <div className={SIDEBAR_BASE}>
        <SidebarHeader onClose={onClose} />
        <LoadingSkeleton />
      </div>
    );
  }

  if (!proyek) {
    return (
      <div className={SIDEBAR_BASE}>
        <SidebarHeader onClose={onClose} />
        <EmptyState />
      </div>
    );
  }

  return (
    <div className={SIDEBAR_BASE}>
      <div className="p-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white">
        <div className="min-w-0">
          <h2 className="font-semibold text-slate-900 truncate">{proyek.kode_kjsb ?? "–"}</h2>
          <p className="text-sm text-slate-500 truncate">{proyek.pemohon?.nama_pemohon ?? "–"}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors duration-200 shrink-0"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-4 overflow-y-auto space-y-4">
        <Section title="Administrasi Permohonan" icon={FileText}>
          <Row label="Tgl. Permohonan" value={formatDate(proyek.tgl_permohonan)} />
          <Row label="Nama Klien" value={proyek.klien?.nama_klien} />
          <Row label="Nomor Telepon Klien" value={proyek.klien?.nomor_telepon_klien} />
          <Row label="Nama Pemohon" value={proyek.pemohon?.nama_pemohon} />
          <Row label="Nomor Telepon Pemohon" value={proyek.pemohon?.nomor_telepon_pemohon} />
          <Row label="NIK Pemohon" value={proyek.pemohon?.nik_pemohon} />
          <Row label="Alamat Pemohon" value={proyek.pemohon?.alamat_pemohon} />
          <Row label="Luas Permohonan (m²)" value={formatNum(proyek.luas_permohonan)} />
          <Row label="Penggunaan Tanah" value={proyek.penggunaan_tanah_a ?? undefined} />
          <Row label="No. Tanda Terima" value={proyek.no_tanda_terima} />
          <Row label="Tgl. Tanda Terima" value={formatDate(proyek.tgl_tanda_terima)} />
          <Row label="No. SLA" value={proyek.no_sla} />
          <Row label="Tgl. SLA" value={formatDate(proyek.tgl_sla)} />
          <Row label="No. Invoice" value={proyek.no_invoice} />
          <Row label="Tgl. Invoice" value={formatDate(proyek.tgl_invoice)} />
          <Row label="No. Kwitansi" value={proyek.no_kwitansi} />
          <Row label="Tgl. Kwitansi" value={formatDate(proyek.tgl_kwitansi)} />
          <Row label="Nominal Bayar" value={formatNum(proyek.nominal_bayar)} />
        </Section>

        <Section title="Informasi Spasial & Survey" icon={MapPin}>
          <Row label="No. Berkas Spasial" value={proyek.no_berkas_spasial} />
          <Row label="Tgl. Berkas Spasial" value={formatDate(proyek.tgl_berkas_spasial)} />
          <Row label="NIB Eksisting" value={proyek.nib_eksisting} />
          <Row label="Tgl. SPS Spasial" value={formatDate(proyek.tgl_sps_spasial)} />
          <Row label="Biaya SPS Spasial" value={formatNum(proyek.biaya_sps_spasial)} />
          <Row label="Tgl. Bayar SPS Spasial" value={formatDate(proyek.tgl_bayar_sps_spasial)} />
          <Row label="Tgl. Download" value={formatDate(proyek.tgl_download)} />
          <Row label="No. ST" value={proyek.no_st} />
          <Row label="Tgl. ST" value={formatDate(proyek.tgl_st)} />
          <Row label="No. Surat Pemberitahuan" value={proyek.no_surat_pemberitahuan} />
          <Row label="Tgl. Surat Pemberitahuan" value={formatDate(proyek.tgl_surat_pemberitahuan)} />
          <Row label="Tgl. Pengukuran" value={formatDate(proyek.tgl_pengukuran)} />
          <Row label="Nama Surveyor" value={proyek.nama_surveyor} />
          <Row label="HP Surveyor" value={proyek.hp_surveyor} />
          <Row label="Lisensi Surveyor" value={proyek.lisensi_surveyor} />
        </Section>

        <Section title="Legalisasi GU" icon={ClipboardList}>
          <Row label="No. Berkas Legalisasi GU" value={proyek.no_berkas_legalisasi_gu} />
          <Row label="Tgl. Berkas Legalisasi GU" value={formatDate(proyek.tgl_berkas_legalisasi_gu)} />
          <Row label="Luas Tertulis (m²)" value={formatNum(proyek.luas_hasil_ukur)} />
          <Row label="Luas Peta" value={formatNum(proyek.luas_hitung_otomatis)} />
          <Row label="Penggunaan Tanah B" value={proyek.penggunaan_tanah_b === "non_pertanian" ? "Non-Pertanian" : proyek.penggunaan_tanah_b === "pertanian" ? "Pertanian" : proyek.penggunaan_tanah_b ?? undefined} />
          <Row label="Tgl. SPS Legal GU" value={formatDate(proyek.tgl_sps_legal_gu)} />
          <Row label="Biaya SPS Legal GU" value={formatNum(proyek.biaya_sps_legal_gu)} />
          <Row label="Tgl. Bayar SPS Legal GU" value={formatDate(proyek.tgl_bayar_sps_legal_gu)} />
          <Row label="No. GU" value={proyek.no_gu} />
          <Row label="Tgl. GU" value={formatDate(proyek.tgl_gu)} />
          <Row label="NIB" value={proyek.nib} />
          <Row label="Tgl. NIB" value={formatDate(proyek.tgl_nib)} />
          <Row label="No. PBT" value={proyek.no_pbt} />
          <Row label="Tgl. PBT" value={formatDate(proyek.tgl_pbt)} />
        </Section>

        <Section title="Persetujuan & Penyelesaian" icon={CheckCircle}>
          <Row label="Tgl. TTE GU" value={formatDate(proyek.tgl_tte_gu)} />
          <Row label="Tgl. TTE PBT" value={formatDate(proyek.tgl_tte_pbt)} />
          <Row label="Tgl. Upload GU" value={formatDate(proyek.tgl_upload_gu)} />
          <Row label="Tgl. Upload PBT" value={formatDate(proyek.tgl_upload_pbt)} />
          <Row label="Tgl. Selesai BPN" value={formatDate(proyek.tgl_selesai_bpn)} />
        </Section>

        <Section title="Meta" icon={FileCheck}>
          <Row label="ID" value={proyek.id} />
          <Row label="Dibuat" value={proyek.created_at ? new Date(proyek.created_at).toLocaleString("id-ID") : "–"} />
          <Row label="Diubah" value={proyek.updated_at ? new Date(proyek.updated_at).toLocaleString("id-ID") : "–"} />
        </Section>
      </div>
    </div>
  );
}
