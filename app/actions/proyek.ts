"use server";

import { createClient } from "@/lib/supabase/server";
import type {
  KlienRow,
  PemohonRow,
  ProyekRow,
  ProyekTahap1,
  ProyekTahap2,
  ProyekTahap3,
  ProyekTahap4,
  ProyekTahap5,
  ProyekMapFeature,
  SurveyorRow,
} from "@/types/proyek";

export type { SurveyorRow };

export async function searchKlien(query: string): Promise<KlienRow[]> {
  const supabase = createClient();
  const q = (query || "").trim();
  if (!q) return [];
  const { data, error } = await supabase
    .from("klien")
    .select("id, nama_klien, nomor_telepon_klien, created_at, updated_at")
    .ilike("nama_klien", `%${q}%`)
    .limit(10)
    .order("nama_klien");
  if (error) return [];
  return (data ?? []) as KlienRow[];
}

export async function searchPemohon(query: string): Promise<PemohonRow[]> {
  const supabase = createClient();
  const q = (query || "").trim();
  if (!q) return [];
  const { data, error } = await supabase
    .from("pemohon")
    .select("id, nama_pemohon, nomor_telepon_pemohon, nik_pemohon, alamat_pemohon, created_at, updated_at")
    .ilike("nama_pemohon", `%${q}%`)
    .limit(10)
    .order("nama_pemohon");
  if (error) return [];
  return (data ?? []) as PemohonRow[];
}

export async function createKlien(payload: {
  nama_klien: string;
  nomor_telepon_klien?: string;
}): Promise<KlienRow | { error: string }> {
  const supabase = createClient();
  const nama = (payload.nama_klien || "").trim();
  if (!nama) return { error: "Nama klien wajib diisi" };
  const { data, error } = await supabase
    .from("klien")
    .insert({ nama_klien: nama, nomor_telepon_klien: (payload.nomor_telepon_klien || "").trim() || null })
    .select("id, nama_klien, nomor_telepon_klien, created_at, updated_at")
    .single();
  if (error) return { error: error.message };
  return data as KlienRow;
}

export async function createPemohon(payload: {
  nama_pemohon: string;
  nomor_telepon_pemohon?: string;
  nik_pemohon?: string;
  alamat_pemohon?: string;
}): Promise<PemohonRow | { error: string }> {
  const supabase = createClient();
  const nama = (payload.nama_pemohon || "").trim();
  if (!nama) return { error: "Nama pemohon wajib diisi" };
  const { data, error } = await supabase
    .from("pemohon")
    .insert({
      nama_pemohon: nama,
      nomor_telepon_pemohon: (payload.nomor_telepon_pemohon || "").trim() || null,
      nik_pemohon: (payload.nik_pemohon || "").trim() || null,
      alamat_pemohon: (payload.alamat_pemohon || "").trim() || null,
    })
    .select("id, nama_pemohon, nomor_telepon_pemohon, nik_pemohon, alamat_pemohon, created_at, updated_at")
    .single();
  if (error) return { error: error.message };
  return data as PemohonRow;
}

export async function createProyekTahap1(data: ProyekTahap1): Promise<{ id: string; kode_kjsb: string } | { error: string }> {
  const supabase = createClient();
  let klien_id: string | null = data.klien_id ?? null;
  let pemohon_id: string | null = data.pemohon_id ?? null;

  if (data.klienBaru?.nama_klien?.trim()) {
    const created = await createKlien({
      nama_klien: data.klienBaru.nama_klien.trim(),
      nomor_telepon_klien: data.klienBaru.nomor_telepon_klien,
    });
    if ("error" in created) return created;
    klien_id = created.id;
  }

  if (data.pemohonBaru?.nama_pemohon?.trim()) {
    const created = await createPemohon({
      nama_pemohon: data.pemohonBaru.nama_pemohon.trim(),
      nomor_telepon_pemohon: data.pemohonBaru.nomor_telepon_pemohon,
      nik_pemohon: data.pemohonBaru.nik_pemohon,
      alamat_pemohon: data.pemohonBaru.alamat_pemohon,
    });
    if ("error" in created) return created;
    pemohon_id = created.id;
  }

  const kodeManual = (data.kode_kjsb || "").trim() || null;
  const { data: row, error } = await supabase
    .from("proyek_kjsb")
    .insert({
      kode_kjsb: kodeManual,
      tgl_permohonan: data.tgl_permohonan || null,
      klien_id: klien_id || null,
      pemohon_id: pemohon_id || null,
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

export async function updateProyekTahap1(kode_kjsb: string, data: ProyekTahap1): Promise<{ ok: true } | { error: string }> {
  const supabase = createClient();
  let klien_id: string | null = data.klien_id ?? null;
  let pemohon_id: string | null = data.pemohon_id ?? null;

  if (data.klienBaru?.nama_klien?.trim()) {
    const created = await createKlien({
      nama_klien: data.klienBaru.nama_klien.trim(),
      nomor_telepon_klien: data.klienBaru.nomor_telepon_klien,
    });
    if ("error" in created) return created;
    klien_id = created.id;
  }

  if (data.pemohonBaru?.nama_pemohon?.trim()) {
    const created = await createPemohon({
      nama_pemohon: data.pemohonBaru.nama_pemohon.trim(),
      nomor_telepon_pemohon: data.pemohonBaru.nomor_telepon_pemohon,
      nik_pemohon: data.pemohonBaru.nik_pemohon,
      alamat_pemohon: data.pemohonBaru.alamat_pemohon,
    });
    if ("error" in created) return created;
    pemohon_id = created.id;
  }

  const { error } = await supabase
    .from("proyek_kjsb")
    .update({
      tgl_permohonan: data.tgl_permohonan || null,
      klien_id: klien_id ?? null,
      pemohon_id: pemohon_id ?? null,
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
    .eq("kode_kjsb", kode_kjsb);
  if (error) return { error: error.message };
  return { ok: true };
}

export async function getProyekByKode(kode_kjsb: string): Promise<ProyekRow | null | { error: string }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("proyek_kjsb")
    .select("*, klien(nama_klien, nomor_telepon_klien), pemohon(nama_pemohon, nomor_telepon_pemohon, nik_pemohon, alamat_pemohon), surveyor(nama, hp, lisensi)")
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

export async function getNamaPemohonSuggestionsForMap(query: string): Promise<string[]> {
  const q = (query || "").trim();
  if (!q) return [];
  const supabase = createClient();
  const { data, error } = await supabase
    .from("proyek_kjsb_map")
    .select("nama_pemohon")
    .ilike("nama_pemohon", `%${q}%`)
    .limit(20);
  if (error) return [];
  const names = (data ?? [])
    .map((r: { nama_pemohon: string | null }) => r.nama_pemohon)
    .filter((n): n is string => n != null && n.trim() !== "");
  const unique = Array.from(new Set(names));
  return unique.slice(0, 10);
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
      surveyor_id: data.surveyor_id ?? null,
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

  const inputSrid = formData.get("input_srid");
  const p_input_srid = inputSrid === "23835" ? 23835 : 4326;

  const supabase = createClient();
  const { error } = await supabase.rpc("update_proyek_tahap4_with_geom", {
    p_kode_kjsb: kode_kjsb,
    p_geojson: geojsonStr,
    p_input_srid: p_input_srid,
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
