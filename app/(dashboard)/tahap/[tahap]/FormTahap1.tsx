"use client";

import { useState } from "react";
import { createProyekTahap1 } from "@/app/actions/proyek";
import type { PenggunaanTanah } from "@/types/proyek";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import DateInput from "@/components/forms/DateInput";

const PENGGUNAAN_TANAH_OPTIONS: { value: PenggunaanTanah; label: string }[] = [
  { value: "pertanian", label: "Pertanian" },
  { value: "hunian", label: "Hunian" },
  { value: "komersial", label: "Komersial" },
  { value: "industri", label: "Industri" },
  { value: "pertambangan", label: "Pertambangan" },
];

export default function FormTahap1() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [generatedKode, setGeneratedKode] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    setGeneratedKode(null);
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = {
      tgl_permohonan: (formData.get("tgl_permohonan") as string) || undefined,
      nama_klien: (formData.get("nama_klien") as string) || undefined,
      hp_klien: (formData.get("hp_klien") as string) || undefined,
      nama_pemohon: (formData.get("nama_pemohon") as string) || undefined,
      hp_pemohon: (formData.get("hp_pemohon") as string) || undefined,
      luas_permohonan: formData.get("luas_permohonan") ? Number(formData.get("luas_permohonan")) : undefined,
      penggunaan_tanah_a: (formData.get("penggunaan_tanah_a") as PenggunaanTanah) || undefined,
      no_tanda_terima: (formData.get("no_tanda_terima") as string) || undefined,
      tgl_tanda_terima: (formData.get("tgl_tanda_terima") as string) || undefined,
      no_sla: (formData.get("no_sla") as string) || undefined,
      tgl_sla: (formData.get("tgl_sla") as string) || undefined,
      no_invoice: (formData.get("no_invoice") as string) || undefined,
      tgl_invoice: (formData.get("tgl_invoice") as string) || undefined,
      no_kwitansi: (formData.get("no_kwitansi") as string) || undefined,
      tgl_kwitansi: (formData.get("tgl_kwitansi") as string) || undefined,
      nominal_bayar: formData.get("nominal_bayar") ? Number(formData.get("nominal_bayar")) : undefined,
    };
    const result = await createProyekTahap1(data);
    setLoading(false);
    if ("error" in result) {
      setMessage({ type: "error", text: result.error });
      return;
    }
    setMessage({ type: "ok", text: "Proyek Tahap 1 berhasil dibuat." });
    setGeneratedKode(result.kode_kjsb);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="card-section space-y-4">
        <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">Data Klien & Pemohon</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label-base">Tanggal Permohonan</label>
            <DateInput name="tgl_permohonan" />
          </div>
          <div>
            <label className="label-base">Nama Klien</label>
            <input type="text" name="nama_klien" className="input-base" placeholder="Nama lengkap klien" />
          </div>
          <div>
            <label className="label-base">HP Klien</label>
            <input type="text" name="hp_klien" className="input-base" placeholder="Nomor HP" />
          </div>
          <div>
            <label className="label-base">Nama Pemohon</label>
            <input type="text" name="nama_pemohon" className="input-base" placeholder="Nama lengkap pemohon" />
          </div>
          <div>
            <label className="label-base">HP Pemohon</label>
            <input type="text" name="hp_pemohon" className="input-base" placeholder="Nomor HP" />
          </div>
          <div>
            <label className="label-base">Luas Permohonan (m²)</label>
            <input type="number" step="any" name="luas_permohonan" className="input-base" placeholder="0" />
          </div>
          <div className="sm:col-span-2">
            <label className="label-base">Penggunaan Tanah A</label>
            <select name="penggunaan_tanah_a" className="input-base">
              <option value="">— Pilih —</option>
              {PENGGUNAAN_TANAH_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card-section space-y-4">
        <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">Dokumen & Pembayaran</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label-base">No. Tanda Terima</label>
            <input type="text" name="no_tanda_terima" className="input-base" />
          </div>
          <div>
            <label className="label-base">Tgl. Tanda Terima</label>
            <DateInput name="tgl_tanda_terima" />
          </div>
          <div>
            <label className="label-base">No. SLA</label>
            <input type="text" name="no_sla" className="input-base" />
          </div>
          <div>
            <label className="label-base">Tgl. SLA</label>
            <DateInput name="tgl_sla" />
          </div>
          <div>
            <label className="label-base">No. Invoice</label>
            <input type="text" name="no_invoice" className="input-base" />
          </div>
          <div>
            <label className="label-base">Tgl. Invoice</label>
            <DateInput name="tgl_invoice" />
          </div>
          <div>
            <label className="label-base">No. Kwitansi</label>
            <input type="text" name="no_kwitansi" className="input-base" />
          </div>
          <div>
            <label className="label-base">Tgl. Kwitansi</label>
            <DateInput name="tgl_kwitansi" />
          </div>
          <div>
            <label className="label-base">Nominal Bayar</label>
            <input type="number" step="any" name="nominal_bayar" className="input-base" placeholder="0" />
          </div>
        </div>
      </div>

      {message && (
        <div className={message.type === "ok" ? "message-ok" : "message-error"} role="alert">
          <div className="flex items-start gap-2">
            {message.type === "ok" ? (
              <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            )}
            <div>
              <p>{message.text}</p>
              {generatedKode && <p className="mt-2 font-mono font-semibold">Kode KJSB: {generatedKode}</p>}
            </div>
          </div>
        </div>
      )}

      <button type="submit" disabled={loading} className="btn-primary">
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        Simpan Tahap 1
      </button>
    </form>
  );
}
