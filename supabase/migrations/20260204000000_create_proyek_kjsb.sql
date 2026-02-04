-- WebGIS KJSB Benning dan Rekan: proyek_kjsb table with PostGIS
-- Run in Supabase SQL Editor or via supabase db push

CREATE EXTENSION IF NOT EXISTS postgis;

-- Sequence for kode_kjsb (year 2026)
CREATE SEQUENCE IF NOT EXISTS seq_kode_kjsb_2026 START 1;

-- Enum for penggunaan_tanah (Tahap 1 & 4)
CREATE TYPE penggunaan_tanah_enum AS ENUM (
  'pertanian', 'hunian', 'komersial', 'industri', 'pertambangan'
);

-- Table proyek_kjsb: all 5 tahap columns + geom + generated area
CREATE TABLE proyek_kjsb (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kode_kjsb TEXT UNIQUE,

  -- Spatial (nullable until Tahap 4 GeoJSON upload)
  geom GEOMETRY(Polygon, 4326),

  -- Generated: area in m² (TM-3 Zona 49.1 / EPSG:23835)
  luas_hitung_otomatis NUMERIC GENERATED ALWAYS AS (
    CASE WHEN geom IS NOT NULL THEN ST_Area(ST_Transform(geom, 23835)) ELSE NULL END
  ) STORED,

  -- Tahap 1
  tgl_permohonan DATE,
  nama_klien TEXT,
  hp_klien TEXT,
  nama_pemohon TEXT,
  hp_pemohon TEXT,
  luas_permohonan NUMERIC,
  penggunaan_tanah_a penggunaan_tanah_enum,
  no_tanda_terima TEXT,
  tgl_tanda_terima DATE,
  no_sla TEXT,
  tgl_sla DATE,
  no_invoice TEXT,
  tgl_invoice DATE,
  no_kwitansi TEXT,
  tgl_kwitansi DATE,
  nominal_bayar NUMERIC,

  -- Tahap 2 & 3
  no_berkas_spasial TEXT,
  tgl_berkas_spasial DATE,
  nib_eksisting TEXT,
  tgl_sps_spasial DATE,
  biaya_sps_spasial NUMERIC,
  tgl_bayar_sps_spasial DATE,
  tgl_download DATE,
  no_st TEXT,
  tgl_st DATE,
  no_surat_pemberitahuan TEXT,
  tgl_surat_pemberitahuan DATE,
  tgl_pengukuran DATE,
  nama_surveyor TEXT,
  hp_surveyor TEXT,
  lisensi_surveyor TEXT,

  -- Tahap 4
  no_berkas_legalisasi_gu TEXT,
  tgl_berkas_legalisasi_gu DATE,
  luas_hasil_ukur NUMERIC,
  penggunaan_tanah_b penggunaan_tanah_enum,
  tgl_sps_legal_gu DATE,
  biaya_sps_legal_gu NUMERIC,
  tgl_bayar_sps_legal_gu DATE,
  no_gu TEXT,
  tgl_gu DATE,
  nib TEXT,
  tgl_nib DATE,
  no_pbt TEXT,
  tgl_pbt DATE,

  -- Tahap 5
  tgl_tte_gu DATE,
  tgl_tte_pbt DATE,
  tgl_upload_gu DATE,
  tgl_upload_pbt DATE,
  tgl_persetujuan_bpn DATE,
  tgl_selesai_bpn DATE,

  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Trigger: auto-generate kode_kjsb on INSERT when NULL
CREATE OR REPLACE FUNCTION generate_kode_kjsb()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  yr INT := EXTRACT(YEAR FROM current_date)::INT;
  seq_name TEXT;
  next_val BIGINT;
BEGIN
  seq_name := 'seq_kode_kjsb_' || yr;
  IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = seq_name) THEN
    EXECUTE format('CREATE SEQUENCE %I START 1', seq_name);
  END IF;
  EXECUTE format('SELECT nextval(%I)', seq_name) INTO next_val;
  RETURN 'BKS-' || yr || '-' || LPAD(next_val::TEXT, 4, '0');
END;
$$;

CREATE OR REPLACE FUNCTION trigger_set_kode_kjsb()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.kode_kjsb IS NULL OR NEW.kode_kjsb = '' THEN
    NEW.kode_kjsb := generate_kode_kjsb();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER tr_proyek_kjsb_kode
  BEFORE INSERT ON proyek_kjsb
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_kode_kjsb();

-- Trigger: updated_at
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER tr_proyek_kjsb_updated_at
  BEFORE UPDATE ON proyek_kjsb
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

-- Indexes
CREATE UNIQUE INDEX idx_proyek_kjsb_kode ON proyek_kjsb (kode_kjsb);
CREATE INDEX idx_proyek_kjsb_geom ON proyek_kjsb USING GIST (geom);
CREATE INDEX idx_proyek_kjsb_nama_pemohon ON proyek_kjsb (nama_pemohon);

-- RLS
ALTER TABLE proyek_kjsb ENABLE ROW LEVEL SECURITY;

-- Allow read for anon (e.g. app using anon key without Supabase Auth)
CREATE POLICY "Allow read for anon" ON proyek_kjsb
  FOR SELECT TO anon USING (true);

CREATE POLICY "Allow insert for anon" ON proyek_kjsb
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow update for anon" ON proyek_kjsb
  FOR UPDATE TO anon USING (true);

-- Allow read/write for authenticated users (if using Supabase Auth)
CREATE POLICY "Allow read for authenticated" ON proyek_kjsb
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow insert for authenticated" ON proyek_kjsb
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow update for authenticated" ON proyek_kjsb
  FOR UPDATE TO authenticated USING (true);

-- Optional: allow anon/service role for local dev (remove in production if needed)
CREATE POLICY "Allow all for service_role" ON proyek_kjsb
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- View for map: id, kode_kjsb, nama_pemohon, geom as GeoJSON
CREATE VIEW proyek_kjsb_map AS
SELECT
  id,
  kode_kjsb,
  nama_pemohon,
  ST_AsGeoJSON(geom)::json AS geom
FROM proyek_kjsb
WHERE geom IS NOT NULL;

GRANT SELECT ON proyek_kjsb_map TO anon;
GRANT SELECT ON proyek_kjsb_map TO authenticated;
GRANT SELECT ON proyek_kjsb_map TO service_role;

-- RPC: update Tahap 4 with geometry from GeoJSON (extract first Polygon from Feature/FeatureCollection)
CREATE OR REPLACE FUNCTION update_proyek_tahap4_with_geom(
  p_kode_kjsb TEXT,
  p_geojson TEXT,
  p_no_berkas_legalisasi_gu TEXT DEFAULT NULL,
  p_tgl_berkas_legalisasi_gu DATE DEFAULT NULL,
  p_luas_hasil_ukur NUMERIC DEFAULT NULL,
  p_penggunaan_tanah_b penggunaan_tanah_enum DEFAULT NULL,
  p_tgl_sps_legal_gu DATE DEFAULT NULL,
  p_biaya_sps_legal_gu NUMERIC DEFAULT NULL,
  p_tgl_bayar_sps_legal_gu DATE DEFAULT NULL,
  p_no_gu TEXT DEFAULT NULL,
  p_tgl_gu DATE DEFAULT NULL,
  p_nib TEXT DEFAULT NULL,
  p_tgl_nib DATE DEFAULT NULL,
  p_no_pbt TEXT DEFAULT NULL,
  p_tgl_pbt DATE DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  g geometry;
BEGIN
  g := ST_GeomFromGeoJSON(p_geojson);
  IF ST_GeometryType(g) = 'ST_MultiPolygon' THEN
    g := ST_GeometryN(g, 1);
  ELSIF ST_GeometryType(g) = 'ST_GeometryCollection' THEN
    g := ST_CollectionExtract(g, 3);
    IF ST_NumGeometries(g) >= 1 THEN
      g := ST_GeometryN(g, 1);
    END IF;
  END IF;
  g := ST_Transform(ST_SetSRID(g, 4326), 4326);
  IF ST_GeometryType(g) != 'ST_Polygon' THEN
    RAISE EXCEPTION 'Geometry must be Polygon or MultiPolygon';
  END IF;

  UPDATE proyek_kjsb
  SET
    geom = g,
    no_berkas_legalisasi_gu = COALESCE(p_no_berkas_legalisasi_gu, no_berkas_legalisasi_gu),
    tgl_berkas_legalisasi_gu = COALESCE(p_tgl_berkas_legalisasi_gu, tgl_berkas_legalisasi_gu),
    luas_hasil_ukur = COALESCE(p_luas_hasil_ukur, luas_hasil_ukur),
    penggunaan_tanah_b = COALESCE(p_penggunaan_tanah_b, penggunaan_tanah_b),
    tgl_sps_legal_gu = COALESCE(p_tgl_sps_legal_gu, tgl_sps_legal_gu),
    biaya_sps_legal_gu = COALESCE(p_biaya_sps_legal_gu, biaya_sps_legal_gu),
    tgl_bayar_sps_legal_gu = COALESCE(p_tgl_bayar_sps_legal_gu, tgl_bayar_sps_legal_gu),
    no_gu = COALESCE(p_no_gu, no_gu),
    tgl_gu = COALESCE(p_tgl_gu, tgl_gu),
    nib = COALESCE(p_nib, nib),
    tgl_nib = COALESCE(p_tgl_nib, tgl_nib),
    no_pbt = COALESCE(p_no_pbt, no_pbt),
    tgl_pbt = COALESCE(p_tgl_pbt, tgl_pbt)
  WHERE kode_kjsb = p_kode_kjsb;
END;
$$;

GRANT EXECUTE ON FUNCTION update_proyek_tahap4_with_geom TO anon;
GRANT EXECUTE ON FUNCTION update_proyek_tahap4_with_geom TO authenticated;
GRANT EXECUTE ON FUNCTION update_proyek_tahap4_with_geom TO service_role;
