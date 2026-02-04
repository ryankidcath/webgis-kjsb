"use client";

import { useEffect, useState } from "react";
import { createSurveyor, getProyekByKodeForForm, getSurveyorList, updateProyekTahap3 } from "@/app/actions/proyek";
import type { ProyekRow } from "@/types/proyek";
import type { SurveyorRow } from "@/app/actions/proyek";
import KodeKjsbInput from "@/components/forms/KodeKjsbInput";
import { Loader2, Search, CheckCircle, AlertCircle } from "lucide-react";
import DateInput from "@/components/forms/DateInput";

const OPT_NEW = "__new__";

export default function FormTahap3() {
  const [kodeKjsb, setKodeKjsb] = useState("");
  const [loading, setLoading] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [proyek, setProyek] = useState<ProyekRow | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [surveyorList, setSurveyorList] = useState<SurveyorRow[]>([]);
  const [selectedSurveyorId, setSelectedSurveyorId] = useState<string>(OPT_NEW);
  const [surveyorFields, setSurveyorFields] = useState({ nama_surveyor: "", hp_surveyor: "", lisensi_surveyor: "" });

  useEffect(() => {
    getSurveyorList().then(setSurveyorList);
  }, []);

  useEffect(() => {
    if (!proyek) return;
    setSurveyorFields({
      nama_surveyor: proyek.nama_surveyor ?? "",
      hp_surveyor: proyek.hp_surveyor ?? "",
      lisensi_surveyor: proyek.lisensi_surveyor ?? "",
    });
    const match = surveyorList.find((s) => s.nama === (proyek.nama_surveyor ?? ""));
    setSelectedSurveyorId(match ? match.id : OPT_NEW);
  }, [proyek, surveyorList]);

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

  function onSurveyorSelect(surveyorId: string) {
    setSelectedSurveyorId(surveyorId);
    if (surveyorId === OPT_NEW) return;
    const s = surveyorList.find((x) => x.id === surveyorId);
    if (s) setSurveyorFields({ nama_surveyor: s.nama, hp_surveyor: s.hp ?? "", lisensi_surveyor: s.lisensi ?? "" });
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!kodeKjsb.trim()) return;
    setMessage(null);
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    let nama_surveyor = surveyorFields.nama_surveyor.trim();
    let hp_surveyor = surveyorFields.hp_surveyor.trim();
    let lisensi_surveyor = surveyorFields.lisensi_surveyor.trim();
    if (selectedSurveyorId === OPT_NEW && nama_surveyor) {
      const created = await createSurveyor(nama_surveyor, hp_surveyor, lisensi_surveyor);
      if ("error" in created) {
        setLoading(false);
        setMessage({ type: "error", text: created.error });
        return;
      }
      nama_surveyor = created.nama;
      hp_surveyor = created.hp ?? "";
      lisensi_surveyor = created.lisensi ?? "";
      setSurveyorList((prev) => [...prev, created]);
    }
    const data = {
      no_st: (formData.get("no_st") as string) || undefined,
      tgl_st: (formData.get("tgl_st") as string) || undefined,
      no_surat_pemberitahuan: (formData.get("no_surat_pemberitahuan") as string) || undefined,
      tgl_surat_pemberitahuan: (formData.get("tgl_surat_pemberitahuan") as string) || undefined,
      tgl_pengukuran: (formData.get("tgl_pengukuran") as string) || undefined,
      nama_surveyor: nama_surveyor || undefined,
      hp_surveyor: hp_surveyor || undefined,
      lisensi_surveyor: lisensi_surveyor || undefined,
    };
    const result = await updateProyekTahap3(kodeKjsb.trim(), data);
    setLoading(false);
    if ("error" in result) {
      setMessage({ type: "error", text: result.error });
      return;
    }
    setMessage({ type: "ok", text: "Tahap 3 berhasil diupdate." });
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
            <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">ST & Surat Pemberitahuan</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label-base">No. ST</label>
                <input type="text" name="no_st" defaultValue={proyek.no_st ?? ""} className="input-base" />
              </div>
              <div>
                <label className="label-base">Tgl. ST</label>
                <DateInput name="tgl_st" defaultValue={proyek.tgl_st ?? undefined} />
              </div>
              <div>
                <label className="label-base">No. Surat Pemberitahuan</label>
                <input type="text" name="no_surat_pemberitahuan" defaultValue={proyek.no_surat_pemberitahuan ?? ""} className="input-base" />
              </div>
              <div>
                <label className="label-base">Tgl. Surat Pemberitahuan</label>
                <DateInput name="tgl_surat_pemberitahuan" defaultValue={proyek.tgl_surat_pemberitahuan ?? undefined} />
              </div>
              <div>
                <label className="label-base">Tgl. Pengukuran</label>
                <DateInput name="tgl_pengukuran" defaultValue={proyek.tgl_pengukuran ?? undefined} />
              </div>
            </div>
          </div>

          <div className="card-section space-y-4">
            <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">Data Surveyor</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label-base">Nama Surveyor</label>
                <select
                  value={selectedSurveyorId}
                  onChange={(e) => onSurveyorSelect(e.target.value)}
                  className="input-base"
                >
                  <option value={OPT_NEW}>— Lainnya (tambah baru) —</option>
                  {surveyorList.map((s) => (
                    <option key={s.id} value={s.id}>{s.nama}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-base">HP Surveyor</label>
                <input
                  type="text"
                  value={surveyorFields.hp_surveyor}
                  onChange={(e) => setSurveyorFields((p) => ({ ...p, hp_surveyor: e.target.value }))}
                  className="input-base"
                />
              </div>
              <div>
                <label className="label-base">Lisensi Surveyor</label>
                <input
                  type="text"
                  value={surveyorFields.lisensi_surveyor}
                  onChange={(e) => setSurveyorFields((p) => ({ ...p, lisensi_surveyor: e.target.value }))}
                  className="input-base"
                />
              </div>
              {selectedSurveyorId === OPT_NEW && (
                <div className="sm:col-span-2">
                  <label className="label-base">Nama Surveyor (baru)</label>
                  <input
                    type="text"
                    value={surveyorFields.nama_surveyor}
                    onChange={(e) => setSurveyorFields((p) => ({ ...p, nama_surveyor: e.target.value }))}
                    placeholder="Nama surveyor baru"
                    className="input-base"
                  />
                </div>
              )}
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
            Simpan Tahap 3
          </button>
        </form>
      )}
    </div>
  );
}
