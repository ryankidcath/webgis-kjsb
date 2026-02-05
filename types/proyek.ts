export type PenggunaanTanah = "pertanian" | "hunian" | "komersial" | "industri" | "pertambangan";

export type PenggunaanTanahB = "pertanian" | "non_pertanian";

export interface KlienRow {
  id: string;
  nama_klien: string;
  nomor_telepon_klien: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PemohonRow {
  id: string;
  nama_pemohon: string;
  nomor_telepon_pemohon: string | null;
  nik_pemohon: string | null;
  alamat_pemohon: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface SurveyorRow {
  id: string;
  nama: string;
  hp: string | null;
  lisensi: string | null;
  created_at?: string;
}

export interface ProyekTahap1 {
  kode_kjsb?: string | null;
  tgl_permohonan?: string;
  klien_id?: string | null;
  pemohon_id?: string | null;
  klienBaru?: { nama_klien: string; nomor_telepon_klien?: string };
  pemohonBaru?: {
    nama_pemohon: string;
    nomor_telepon_pemohon?: string;
    nik_pemohon?: string;
    alamat_pemohon?: string;
  };
  luas_permohonan?: number;
  penggunaan_tanah_a?: PenggunaanTanah;
  no_tanda_terima?: string;
  tgl_tanda_terima?: string;
  no_sla?: string;
  tgl_sla?: string;
  no_invoice?: string;
  tgl_invoice?: string;
  no_kwitansi?: string;
  tgl_kwitansi?: string;
  nominal_bayar?: number;
}

export interface ProyekTahap2 {
  no_berkas_spasial?: string;
  tgl_berkas_spasial?: string;
  nib_eksisting?: string;
  tgl_sps_spasial?: string;
  biaya_sps_spasial?: number;
  tgl_bayar_sps_spasial?: string;
  tgl_download?: string;
}

export interface ProyekTahap3 {
  no_st?: string;
  tgl_st?: string;
  no_surat_pemberitahuan?: string;
  tgl_surat_pemberitahuan?: string;
  tgl_pengukuran?: string;
  surveyor_id?: string | null;
}

export interface ProyekTahap4 {
  no_berkas_legalisasi_gu?: string;
  tgl_berkas_legalisasi_gu?: string;
  luas_hasil_ukur?: number;
  penggunaan_tanah_b?: PenggunaanTanahB;
  tgl_sps_legal_gu?: string;
  biaya_sps_legal_gu?: number;
  tgl_bayar_sps_legal_gu?: string;
  no_gu?: string;
  tgl_gu?: string;
  nib?: string;
  tgl_nib?: string;
  no_pbt?: string;
  tgl_pbt?: string;
}

export interface ProyekTahap5 {
  tgl_tte_gu?: string;
  tgl_tte_pbt?: string;
  tgl_upload_gu?: string;
  tgl_upload_pbt?: string;
  tgl_selesai_bpn?: string;
}

export interface ProyekRow {
  id: string;
  kode_kjsb: string | null;
  geom?: unknown;
  luas_hitung_otomatis?: number | null;
  tgl_permohonan?: string | null;
  klien_id?: string | null;
  pemohon_id?: string | null;
  klien?: Pick<KlienRow, "nama_klien" | "nomor_telepon_klien"> | null;
  pemohon?: Pick<PemohonRow, "nama_pemohon" | "nomor_telepon_pemohon" | "nik_pemohon" | "alamat_pemohon"> | null;
  surveyor_id?: string | null;
  surveyor?: Pick<SurveyorRow, "nama" | "hp" | "lisensi"> | null;
  luas_permohonan?: number | null;
  penggunaan_tanah_a?: PenggunaanTanah | null;
  no_tanda_terima?: string | null;
  tgl_tanda_terima?: string | null;
  no_sla?: string | null;
  tgl_sla?: string | null;
  no_invoice?: string | null;
  tgl_invoice?: string | null;
  no_kwitansi?: string | null;
  tgl_kwitansi?: string | null;
  nominal_bayar?: number | null;
  no_berkas_spasial?: string | null;
  tgl_berkas_spasial?: string | null;
  nib_eksisting?: string | null;
  tgl_sps_spasial?: string | null;
  biaya_sps_spasial?: number | null;
  tgl_bayar_sps_spasial?: string | null;
  tgl_download?: string | null;
  no_st?: string | null;
  tgl_st?: string | null;
  no_surat_pemberitahuan?: string | null;
  tgl_surat_pemberitahuan?: string | null;
  tgl_pengukuran?: string | null;
  no_berkas_legalisasi_gu?: string | null;
  tgl_berkas_legalisasi_gu?: string | null;
  luas_hasil_ukur?: number | null;
  penggunaan_tanah_b?: PenggunaanTanahB | null;
  tgl_sps_legal_gu?: string | null;
  biaya_sps_legal_gu?: number | null;
  tgl_bayar_sps_legal_gu?: string | null;
  no_gu?: string | null;
  tgl_gu?: string | null;
  nib?: string | null;
  tgl_nib?: string | null;
  no_pbt?: string | null;
  tgl_pbt?: string | null;
  tgl_tte_gu?: string | null;
  tgl_tte_pbt?: string | null;
  tgl_upload_gu?: string | null;
  tgl_upload_pbt?: string | null;
  tgl_selesai_bpn?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ProyekMapFeature {
  id: string;
  kode_kjsb: string | null;
  nama_pemohon: string | null;
  geom: GeoJSON.Polygon | GeoJSON.MultiPolygon | null;
}
