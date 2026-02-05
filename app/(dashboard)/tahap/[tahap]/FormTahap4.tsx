"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getProyekByKodeForForm, uploadGeojsonTahap4 } from "@/app/actions/proyek";
import type { ProyekRow } from "@/types/proyek";
import type { PenggunaanTanahB } from "@/types/proyek";
import KodeKjsbInput from "@/components/forms/KodeKjsbInput";
import { Loader2, Search, Upload, CheckCircle, AlertCircle } from "lucide-react";
import DateInput from "@/components/forms/DateInput";

const PENGGUNAAN_TANAH_B_OPTIONS: { value: PenggunaanTanahB; label: string }[] = [
  { value: "pertanian", label: "Pertanian" },
  { value: "non_pertanian", label: "Non-Pertanian" },
];

export default function FormTahap4() {
  const router = useRouter();
  const [kodeKjsb, setKodeKjsb] = useState("");
  const [loading, setLoading] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [proyek, setProyek] = useState<ProyekRow | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

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
    if (!kodeKjsb.trim()) return;
    const form = e.currentTarget;
    const fileInput = form.querySelector('input[name="geojson"]') as HTMLInputElement;
    if (!fileInput?.files?.length) {
      setMessage({ type: "error", text: "Pilih file .geojson terlebih dahulu." });
      return;
    }
    setMessage(null);
    setLoading(true);
    const formData = new FormData(form);
    formData.set("geojson", fileInput.files[0]);
    const result = await uploadGeojsonTahap4(kodeKjsb.trim(), formData);
    setLoading(false);
    if ("error" in result) {
      setMessage({ type: "error", text: result.error });
      return;
    }
    setMessage({ type: "ok", text: "Tahap 4 (GeoJSON + atribut) berhasil disimpan." });
    router.push("/?zoomTo=" + encodeURIComponent(kodeKjsb.trim()));
  }

  return (
    <div className="space-y-6">
      <div className="card-section flex flex-wrap gap-2 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="label-base">Kode KJSB</label>
          <KodeKjsbInput value={kodeKjsb} onChange={setKodeKjsb} onSelect={async (kode) => onLookup(kode)} />
        </div>
        <button type="button" onClick={() => onLookup()} disabled={lookupLoading} className="btn-secondary">
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

      {proyek && (
        <form onSubmit={onSubmit} className="space-y-6">
          <p className="text-sm text-slate-600">
            Proyek: <span className="font-medium text-slate-800">{proyek.kode_kjsb}</span>
            {proyek.pemohon?.nama_pemohon ? ` — ${proyek.pemohon.nama_pemohon}` : ""}
          </p>

          <div className="card-section space-y-4">
            <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">File GeoJSON</h2>
            <div>
              <label className="label-base">Sistem koordinat file</label>
              <select name="input_srid" className="input-base" defaultValue="23835">
                <option value="23835">TM-3 Zona 49.1 (EPSG:23835) — hasil pengukuran</option>
                <option value="4326">WGS84 (lon/lat derajat, EPSG:4326)</option>
              </select>
            </div>
            <div>
              <label className="label-base">File GeoJSON (.geojson) *</label>
              <input
                type="file"
                name="geojson"
                accept=".geojson,.json"
                required
                className="input-base file:mr-3 file:rounded-lg file:border-0 file:bg-primary-50 file:px-3 file:py-1.5 file:text-primary-700 file:text-sm"
              />
            </div>
          </div>

          <div className="card-section space-y-4">
            <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">Legalisasi GU & Dokumen</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label-base">No. Berkas Legalisasi GU</label>
                <input type="text" name="no_berkas_legalisasi_gu" defaultValue={proyek.no_berkas_legalisasi_gu ?? ""} className="input-base" />
              </div>
              <div>
                <label className="label-base">Tgl. Berkas Legalisasi GU</label>
                <DateInput name="tgl_berkas_legalisasi_gu" defaultValue={proyek.tgl_berkas_legalisasi_gu ?? undefined} />
              </div>
              <div>
                <label className="label-base">Luas Hasil Ukur (m²)</label>
                <input type="number" step="any" name="luas_hasil_ukur" defaultValue={proyek.luas_hasil_ukur ?? ""} className="input-base" />
              </div>
              <div>
                <label className="label-base">Penggunaan Tanah B</label>
                <select name="penggunaan_tanah_b" className="input-base" defaultValue={proyek.penggunaan_tanah_b ?? ""}>
                  <option value="">— Pilih —</option>
                  {PENGGUNAAN_TANAH_B_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-base">Tgl. SPS Legal GU</label>
                <DateInput name="tgl_sps_legal_gu" defaultValue={proyek.tgl_sps_legal_gu ?? undefined} />
              </div>
              <div>
                <label className="label-base">Biaya SPS Legal GU</label>
                <input type="number" step="any" name="biaya_sps_legal_gu" defaultValue={proyek.biaya_sps_legal_gu ?? ""} className="input-base" />
              </div>
              <div>
                <label className="label-base">Tgl. Bayar SPS Legal GU</label>
                <DateInput name="tgl_bayar_sps_legal_gu" defaultValue={proyek.tgl_bayar_sps_legal_gu ?? undefined} />
              </div>
              <div>
                <label className="label-base">No. GU</label>
                <input type="text" name="no_gu" defaultValue={proyek.no_gu ?? ""} className="input-base" />
              </div>
              <div>
                <label className="label-base">Tgl. GU</label>
                <DateInput name="tgl_gu" defaultValue={proyek.tgl_gu ?? undefined} />
              </div>
              <div>
                <label className="label-base">NIB</label>
                <input type="text" name="nib" defaultValue={proyek.nib ?? ""} className="input-base" />
              </div>
              <div>
                <label className="label-base">Tgl. NIB</label>
                <DateInput name="tgl_nib" defaultValue={proyek.tgl_nib ?? undefined} />
              </div>
              <div>
                <label className="label-base">No. PBT</label>
                <input type="text" name="no_pbt" defaultValue={proyek.no_pbt ?? ""} className="input-base" />
              </div>
              <div>
                <label className="label-base">Tgl. PBT</label>
                <DateInput name="tgl_pbt" defaultValue={proyek.tgl_pbt ?? undefined} />
              </div>
            </div>
          </div>

          {message && proyek && (
            <div className={message.type === "ok" ? "message-ok" : "message-error"} role="alert">
              <div className="flex items-start gap-2">
                {message.type === "ok" ? <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
                <p>{message.text}</p>
              </div>
            </div>
          )}
          <button type="submit" disabled={loading} className="btn-primary">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <Upload className="w-4 h-4" />
            Unggah GeoJSON & Simpan Tahap 4
          </button>
        </form>
      )}
    </div>
  );
}
