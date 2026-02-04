"use server";

import { createClient } from "@/lib/supabase/server";
import type {
  ProyekRow,
  ProyekTahap1,
  ProyekTahap2,
  ProyekTahap3,
  ProyekTahap4,
  ProyekTahap5,
  ProyekMapFeature,
} from "@/types/proyek";

export async function createProyekTahap1(data: ProyekTahap1): Promise<{ id: string; kode_kjsb: string } | { error: string }> {
  const supabase = createClient();
  const { data: row, error } = await supabase
    .from("proyek_kjsb")
    .insert({
      tgl_permohonan: data.tgl_permohonan || null,
      nama_klien: data.nama_klien || null,
      hp_klien: data.hp_klien || null,
      nama_pemohon: data.nama_pemohon || null,
      hp_pemohon: data.hp_pemohon || null,
      luas_permohonan: data.luas_permohonan ?? null,
      penggunaan_tanah_a: data.penggunaan_tanah_a || null,
      no_tanda_terima: data.no_tanda_terima || null,
      tgl_tanda_terima: data.tgl_tanda_terima || null,
      no_sla: data.no_sla || null,
      tgl_sla: data.tgl_sla || null,
      no_invoice: data.no_invoice || null,
      tgl_invoice: data.tgl_invoice || null,
      no_kwitansi: data.no_kwitansi || null,
      tgl_kwitansi: data.tgl_kwitansi || null,
      nominal_bayar: data.nominal_bayar ?? null,
    })
    .select("id, kode_kjsb")
    .single();
  if (error) return { error: error.message };
  if (!row?.kode_kjsb) return { error: "kode_kjsb not generated" };
  return { id: row.id, kode_kjsb: row.kode_kjsb };
}

export async function getProyekByKode(kode_kjsb: string): Promise<ProyekRow | null | { error: string }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("proyek_kjsb")
    .select("*")
    .eq("kode_kjsb", kode_kjsb)
    .single();
  if (error) {
    if (error.code === "PGRST116") return null;
    return { error: error.message };
  }
  return data as ProyekRow;
}

export async function getProyekByKodeForForm(kode_kjsb: string): Promise<ProyekRow | null | { error: string }> {
  return getProyekByKode(kode_kjsb);
}

export async function getKodeKjsbSuggestions(query: string): Promise<{ kode_kjsb: string }[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("proyek_kjsb")
    .select("kode_kjsb")
    .ilike("kode_kjsb", `%${(query || "").trim()}%`)
    .limit(10)
    .order("kode_kjsb");
  if (error) return [];
  return (data ?? []).map((r: { kode_kjsb: string | null }) => ({ kode_kjsb: r.kode_kjsb ?? "" })).filter((r) => r.kode_kjsb);
}

export async function getProyekWithGeom(namaPemohon?: string): Promise<ProyekMapFeature[] | { error: string }> {
  const supabase = createClient();
  let q = supabase.from("proyek_kjsb_map").select("id, kode_kjsb, nama_pemohon, geom");
  if (namaPemohon?.trim()) {
    q = q.ilike("nama_pemohon", `%${namaPemohon.trim()}%`);
  }
  const { data, error } = await q;
  if (error) return { error: error.message };
  return (data ?? []).map((r: { id: string; kode_kjsb: string | null; nama_pemohon: string | null; geom: unknown }) => ({
    id: r.id,
    kode_kjsb: r.kode_kjsb,
    nama_pemohon: r.nama_pemohon,
    geom: r.geom as ProyekMapFeature["geom"],
  }));
}

export async function updateProyekTahap2(kode_kjsb: string, data: ProyekTahap2): Promise<{ ok: true } | { error: string }> {
  const supabase = createClient();
  const { error } = await supabase
    .from("proyek_kjsb")
    .update({
      no_berkas_spasial: data.no_berkas_spasial ?? undefined,
      tgl_berkas_spasial: data.tgl_berkas_spasial ?? undefined,
      nib_eksisting: data.nib_eksisting ?? undefined,
      tgl_sps_spasial: data.tgl_sps_spasial ?? undefined,
      biaya_sps_spasial: data.biaya_sps_spasial ?? undefined,
      tgl_bayar_sps_spasial: data.tgl_bayar_sps_spasial ?? undefined,
      tgl_download: data.tgl_download ?? undefined,
    })
    .eq("kode_kjsb", kode_kjsb);
  if (error) return { error: error.message };
  return { ok: true };
}

export async function updateProyekTahap3(kode_kjsb: string, data: ProyekTahap3): Promise<{ ok: true } | { error: string }> {
  const supabase = createClient();
  const { error } = await supabase
    .from("proyek_kjsb")
    .update({
      no_st: data.no_st ?? undefined,
      tgl_st: data.tgl_st ?? undefined,
      no_surat_pemberitahuan: data.no_surat_pemberitahuan ?? undefined,
      tgl_surat_pemberitahuan: data.tgl_surat_pemberitahuan ?? undefined,
      tgl_pengukuran: data.tgl_pengukuran ?? undefined,
      nama_surveyor: data.nama_surveyor ?? undefined,
      hp_surveyor: data.hp_surveyor ?? undefined,
      lisensi_surveyor: data.lisensi_surveyor ?? undefined,
    })
    .eq("kode_kjsb", kode_kjsb);
  if (error) return { error: error.message };
  return { ok: true };
}

function extractFirstPolygonFromGeoJSON(geojson: unknown): string | null {
  if (!geojson || typeof geojson !== "object") return null;
  const obj = geojson as Record<string, unknown>;
  if (obj.type === "Feature") {
    const geom = obj.geometry;
    if (geom && typeof geom === "object") return JSON.stringify(geom);
  }
  if (obj.type === "FeatureCollection") {
    const features = obj.features as unknown[] | undefined;
    if (Array.isArray(features) && features.length > 0) {
      const first = features[0] as Record<string, unknown>;
      const geom = first.geometry;
      if (geom && typeof geom === "object") return JSON.stringify(geom);
    }
  }
  if (obj.type === "Polygon" || obj.type === "MultiPolygon") return JSON.stringify(obj);
  return null;
}

export async function uploadGeojsonTahap4(
  kode_kjsb: string,
  formData: FormData
): Promise<{ ok: true } | { error: string }> {
  const file = formData.get("geojson") as File | null;
  if (!file) return { error: "File GeoJSON wajib diunggah" };
  const text = await file.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { error: "File bukan JSON/GeoJSON valid" };
  }
  const geojsonStr = extractFirstPolygonFromGeoJSON(parsed);
  if (!geojsonStr) return { error: "GeoJSON harus berisi Feature/FeatureCollection dengan geometry Polygon/MultiPolygon" };

  const supabase = createClient();
  const { error } = await supabase.rpc("update_proyek_tahap4_with_geom", {
    p_kode_kjsb: kode_kjsb,
    p_geojson: geojsonStr,
    p_no_berkas_legalisasi_gu: (formData.get("no_berkas_legalisasi_gu") as string) || null,
    p_tgl_berkas_legalisasi_gu: (formData.get("tgl_berkas_legalisasi_gu") as string) || null,
    p_luas_hasil_ukur: formData.get("luas_hasil_ukur") ? Number(formData.get("luas_hasil_ukur")) : null,
    p_penggunaan_tanah_b: (formData.get("penggunaan_tanah_b") as string) || null,
    p_tgl_sps_legal_gu: (formData.get("tgl_sps_legal_gu") as string) || null,
    p_biaya_sps_legal_gu: formData.get("biaya_sps_legal_gu") ? Number(formData.get("biaya_sps_legal_gu")) : null,
    p_tgl_bayar_sps_legal_gu: (formData.get("tgl_bayar_sps_legal_gu") as string) || null,
    p_no_gu: (formData.get("no_gu") as string) || null,
    p_tgl_gu: (formData.get("tgl_gu") as string) || null,
    p_nib: (formData.get("nib") as string) || null,
    p_tgl_nib: (formData.get("tgl_nib") as string) || null,
    p_no_pbt: (formData.get("no_pbt") as string) || null,
    p_tgl_pbt: (formData.get("tgl_pbt") as string) || null,
  });
  if (error) return { error: error.message };
  return { ok: true };
}

export async function updateProyekTahap5(kode_kjsb: string, data: ProyekTahap5): Promise<{ ok: true } | { error: string }> {
  const supabase = createClient();
  const { error } = await supabase
    .from("proyek_kjsb")
    .update({
      tgl_tte_gu: data.tgl_tte_gu ?? undefined,
      tgl_tte_pbt: data.tgl_tte_pbt ?? undefined,
      tgl_upload_gu: data.tgl_upload_gu ?? undefined,
      tgl_upload_pbt: data.tgl_upload_pbt ?? undefined,
      tgl_selesai_bpn: data.tgl_selesai_bpn ?? undefined,
    })
    .eq("kode_kjsb", kode_kjsb);
  if (error) return { error: error.message };
  return { ok: true };
}

export interface SurveyorRow {
  id: string;
  nama: string;
  hp: string | null;
  lisensi: string | null;
  created_at?: string;
}

export async function getSurveyorList(): Promise<SurveyorRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("surveyor").select("id, nama, hp, lisensi, created_at").order("nama");
  if (error) return [];
  return (data ?? []) as SurveyorRow[];
}

export async function createSurveyor(nama: string, hp: string, lisensi: string): Promise<SurveyorRow | { error: string }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("surveyor")
    .insert({ nama: nama.trim(), hp: hp.trim() || null, lisensi: lisensi.trim() || null })
    .select("id, nama, hp, lisensi, created_at")
    .single();
  if (error) return { error: error.message };
  return data as SurveyorRow;
}
