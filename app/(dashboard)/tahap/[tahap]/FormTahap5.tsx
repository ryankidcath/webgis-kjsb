"use client";

import { useState } from "react";
import { getProyekByKodeForForm, updateProyekTahap5 } from "@/app/actions/proyek";
import type { ProyekRow } from "@/types/proyek";
import KodeKjsbInput from "@/components/forms/KodeKjsbInput";
import { Loader2, Search, CheckCircle, AlertCircle } from "lucide-react";
import DateInput from "@/components/forms/DateInput";

export default function FormTahap5() {
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
    setMessage(null);
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = {
      tgl_tte_gu: (formData.get("tgl_tte_gu") as string) || undefined,
      tgl_tte_pbt: (formData.get("tgl_tte_pbt") as string) || undefined,
      tgl_upload_gu: (formData.get("tgl_upload_gu") as string) || undefined,
      tgl_upload_pbt: (formData.get("tgl_upload_pbt") as string) || undefined,
      tgl_selesai_bpn: (formData.get("tgl_selesai_bpn") as string) || undefined,
    };
    const result = await updateProyekTahap5(kodeKjsb.trim(), data);
    setLoading(false);
    if ("error" in result) {
      setMessage({ type: "error", text: result.error });
      return;
    }
    setMessage({ type: "ok", text: "Tahap 5 berhasil diupdate." });
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
            {proyek.nama_pemohon ? ` — ${proyek.nama_pemohon}` : ""}
          </p>
          <div className="card-section space-y-4">
            <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">TTE & Selesai</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label-base">Tgl. TTE GU</label>
                <DateInput name="tgl_tte_gu" defaultValue={proyek.tgl_tte_gu ?? undefined} />
              </div>
              <div>
                <label className="label-base">Tgl. TTE PBT</label>
                <DateInput name="tgl_tte_pbt" defaultValue={proyek.tgl_tte_pbt ?? undefined} />
              </div>
              <div>
                <label className="label-base">Tgl. Upload GU</label>
                <DateInput name="tgl_upload_gu" defaultValue={proyek.tgl_upload_gu ?? undefined} />
              </div>
              <div>
                <label className="label-base">Tgl. Upload PBT</label>
                <DateInput name="tgl_upload_pbt" defaultValue={proyek.tgl_upload_pbt ?? undefined} />
              </div>
              <div>
                <label className="label-base">Tgl. Selesai BPN</label>
                <DateInput name="tgl_selesai_bpn" defaultValue={proyek.tgl_selesai_bpn ?? undefined} />
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
            Simpan Tahap 5
          </button>
        </form>
      )}
    </div>
  );
}
