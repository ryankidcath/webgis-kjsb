"use client";

import { useState, useEffect } from "react";
import { createProyekTahap1, getProyekByKodeForForm, updateProyekTahap1 } from "@/app/actions/proyek";
import type { PenggunaanTanah } from "@/types/proyek";
import type { ProyekRow } from "@/types/proyek";
import { Loader2, CheckCircle, AlertCircle, Search } from "lucide-react";
import DateInput from "@/components/forms/DateInput";
import AutocompleteKlien, { type KlienValue } from "@/components/forms/AutocompleteKlien";
import AutocompletePemohon, { type PemohonValue } from "@/components/forms/AutocompletePemohon";
import KodeKjsbInput from "@/components/forms/KodeKjsbInput";

const PENGGUNAAN_TANAH_OPTIONS: { value: PenggunaanTanah; label: string }[] = [
  { value: "pertanian", label: "Pertanian" },
  { value: "hunian", label: "Hunian" },
  { value: "komersial", label: "Komersial" },
  { value: "industri", label: "Industri" },
  { value: "pertambangan", label: "Pertambangan" },
];

function buildFormData(formData: FormData, klienValue: KlienValue, pemohonValue: PemohonValue) {
  return {
    tgl_permohonan: (formData.get("tgl_permohonan") as string) || undefined,
    klien_id: klienValue && "id" in klienValue ? klienValue.id : undefined,
    pemohon_id: pemohonValue && "id" in pemohonValue ? pemohonValue.id : undefined,
    klienBaru:
      klienValue && "baru" in klienValue && klienValue.baru.nama_klien?.trim()
        ? { nama_klien: klienValue.baru.nama_klien.trim(), nomor_telepon_klien: klienValue.baru.nomor_telepon_klien }
        : undefined,
    pemohonBaru:
      pemohonValue && "baru" in pemohonValue && pemohonValue.baru.nama_pemohon?.trim()
        ? {
            nama_pemohon: pemohonValue.baru.nama_pemohon.trim(),
            nomor_telepon_pemohon: pemohonValue.baru.nomor_telepon_pemohon,
            nik_pemohon: pemohonValue.baru.nik_pemohon,
            alamat_pemohon: pemohonValue.baru.alamat_pemohon,
          }
        : undefined,
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
}

export default function FormTahap1() {
  const [kodeKjsb, setKodeKjsb] = useState("");
  const [loading, setLoading] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [proyek, setProyek] = useState<ProyekRow | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [generatedKode, setGeneratedKode] = useState<string | null>(null);
  const [klienValue, setKlienValue] = useState<KlienValue>(null);
  const [pemohonValue, setPemohonValue] = useState<PemohonValue>(null);

  useEffect(() => {
    if (!proyek) return;
    setKlienValue(
      proyek.klien && proyek.klien_id
        ? {
            id: proyek.klien_id,
            nama_klien: proyek.klien.nama_klien,
            nomor_telepon_klien: proyek.klien.nomor_telepon_klien ?? undefined,
          }
        : null
    );
    setPemohonValue(
      proyek.pemohon && proyek.pemohon_id
        ? {
            id: proyek.pemohon_id,
            nama_pemohon: proyek.pemohon.nama_pemohon,
            nomor_telepon_pemohon: proyek.pemohon.nomor_telepon_pemohon ?? undefined,
            nik_pemohon: proyek.pemohon.nik_pemohon ?? undefined,
            alamat_pemohon: proyek.pemohon.alamat_pemohon ?? undefined,
          }
        : null
    );
  }, [proyek]);

  async function onLookup(kode?: string) {
    const kodeToUse = (kode ?? kodeKjsb).trim();
    if (!kodeToUse) return;
    setMessage(null);
    setProyek(null);
    setLookupLoading(true);
    const result = await getProyekByKodeForForm(kodeToUse);
    setLookupLoading(false);
    if (result && !("error" in result)) setProyek(result);
    else setMessage({ type: "error", text: "Proyek tidak ditemukan atau error." });
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    setGeneratedKode(null);
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = buildFormData(formData, klienValue, pemohonValue);

    if (proyek?.kode_kjsb) {
      const result = await updateProyekTahap1(proyek.kode_kjsb, data);
      setLoading(false);
      if ("error" in result) {
        setMessage({ type: "error", text: result.error });
        return;
      }
      setMessage({ type: "ok", text: "Tahap 1 berhasil diupdate." });
    } else {
      const kodeManual = (formData.get("kode_kjsb_manual") as string)?.trim();
      const result = await createProyekTahap1({
        ...data,
        kode_kjsb: kodeManual || undefined,
      });
      setLoading(false);
      if ("error" in result) {
        setMessage({ type: "error", text: result.error });
        return;
      }
      setMessage({ type: "ok", text: "Proyek Tahap 1 berhasil dibuat." });
      setGeneratedKode(result.kode_kjsb);
    }
  }

  return (
    <div className="space-y-6">
      <div className="card-section flex flex-wrap gap-2 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="label-base">Kode KJSB</label>
          <KodeKjsbInput
            value={kodeKjsb}
            onChange={setKodeKjsb}
            onSelect={async (kode) => onLookup(kode)}
          />
        </div>
        <button
          type="button"
          onClick={() => onLookup()}
          disabled={lookupLoading}
          className="btn-secondary"
        >
          {lookupLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          <Search className="w-4 h-4" />
          Cari
        </button>
      </div>

      {message && !proyek && (
        <div className="message-error flex items-start gap-2" role="alert">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{message.text}</p>
        </div>
      )}

      <form key={proyek?.id ?? "new"} onSubmit={onSubmit} className="space-y-6">
        {proyek && (
          <p className="text-sm text-slate-600">
            Proyek: <span className="font-medium text-slate-800">{proyek.kode_kjsb}</span>
            {proyek.pemohon?.nama_pemohon ? ` — ${proyek.pemohon.nama_pemohon}` : ""}
          </p>
        )}

        <div className="card-section space-y-4">
          <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">Data Klien & Pemohon</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {!proyek && (
              <div>
                <label className="label-base">Kode KJSB (opsional)</label>
                <input
                  type="text"
                  name="kode_kjsb_manual"
                  className="input-base"
                  placeholder="Kosongkan untuk auto (BKS-2026-xxxx)"
                />
              </div>
            )}
            <div>
              <label className="label-base">Tanggal Permohonan</label>
              <DateInput
                name="tgl_permohonan"
                defaultValue={proyek?.tgl_permohonan ?? undefined}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label-base">Klien</label>
              <AutocompleteKlien value={klienValue} onChange={setKlienValue} />
            </div>
            <div className="sm:col-span-2">
              <label className="label-base">Pemohon</label>
              <AutocompletePemohon value={pemohonValue} onChange={setPemohonValue} />
            </div>
            <div>
              <label className="label-base">Luas Permohonan (m²)</label>
              <input
                type="number"
                step="any"
                name="luas_permohonan"
                className="input-base"
                placeholder="0"
                defaultValue={proyek?.luas_permohonan ?? ""}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label-base">Penggunaan Tanah A</label>
              <select
                name="penggunaan_tanah_a"
                className="input-base"
                defaultValue={proyek?.penggunaan_tanah_a ?? ""}
              >
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
              <input
                type="text"
                name="no_tanda_terima"
                className="input-base"
                defaultValue={proyek?.no_tanda_terima ?? ""}
              />
            </div>
            <div>
              <label className="label-base">Tgl. Tanda Terima</label>
              <DateInput
                name="tgl_tanda_terima"
                defaultValue={proyek?.tgl_tanda_terima ?? undefined}
              />
            </div>
            <div>
              <label className="label-base">No. SLA</label>
              <input
                type="text"
                name="no_sla"
                className="input-base"
                defaultValue={proyek?.no_sla ?? ""}
              />
            </div>
            <div>
              <label className="label-base">Tgl. SLA</label>
              <DateInput name="tgl_sla" defaultValue={proyek?.tgl_sla ?? undefined} />
            </div>
            <div>
              <label className="label-base">No. Invoice</label>
              <input
                type="text"
                name="no_invoice"
                className="input-base"
                defaultValue={proyek?.no_invoice ?? ""}
              />
            </div>
            <div>
              <label className="label-base">Tgl. Invoice</label>
              <DateInput name="tgl_invoice" defaultValue={proyek?.tgl_invoice ?? undefined} />
            </div>
            <div>
              <label className="label-base">No. Kwitansi</label>
              <input
                type="text"
                name="no_kwitansi"
                className="input-base"
                defaultValue={proyek?.no_kwitansi ?? ""}
              />
            </div>
            <div>
              <label className="label-base">Tgl. Kwitansi</label>
              <DateInput name="tgl_kwitansi" defaultValue={proyek?.tgl_kwitansi ?? undefined} />
            </div>
            <div>
              <label className="label-base">Nominal Bayar</label>
              <input
                type="number"
                step="any"
                name="nominal_bayar"
                className="input-base"
                placeholder="0"
                defaultValue={proyek?.nominal_bayar ?? ""}
              />
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
          {proyek ? "Simpan Perubahan Tahap 1" : "Simpan Tahap 1"}
        </button>
      </form>
    </div>
  );
}
