-- Surveyor table, penggunaan_tanah_b enum (Pertanian/Non-Pertanian), drop tgl_persetujuan_bpn, update RPC

-- 1. Table surveyor
CREATE TABLE IF NOT EXISTS surveyor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  hp TEXT,
  lisensi TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE surveyor ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for anon" ON surveyor FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON surveyor FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service_role" ON surveyor FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 2. Enum penggunaan_tanah_b (Pertanian / Non-Pertanian only)
DO $$ BEGIN
  CREATE TYPE penggunaan_tanah_b_enum AS ENUM ('pertanian', 'non_pertanian');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 3. Alter proyek_kjsb: penggunaan_tanah_b to new enum (from existing penggunaan_tanah_enum)
ALTER TABLE proyek_kjsb
  ALTER COLUMN penggunaan_tanah_b TYPE penggunaan_tanah_b_enum
  USING (
    CASE
      WHEN (penggunaan_tanah_b)::text = 'pertanian' THEN 'pertanian'::penggunaan_tanah_b_enum
      ELSE 'non_pertanian'::penggunaan_tanah_b_enum
    END
  );

-- 4. Drop tgl_persetujuan_bpn from Tahap 5
ALTER TABLE proyek_kjsb DROP COLUMN IF EXISTS tgl_persetujuan_bpn;

-- 5. Hapus fungsi lama (signature dengan penggunaan_tanah_enum) agar tidak bentrok nama
DROP FUNCTION IF EXISTS update_proyek_tahap4_with_geom(
  TEXT, TEXT, TEXT, DATE, NUMERIC, penggunaan_tanah_enum, DATE, NUMERIC, DATE,
  TEXT, DATE, TEXT, DATE, TEXT, DATE
);

-- 6. Buat RPC update_proyek_tahap4_with_geom dengan p_penggunaan_tanah_b sebagai penggunaan_tanah_b_enum
CREATE OR REPLACE FUNCTION update_proyek_tahap4_with_geom(
  p_kode_kjsb TEXT,
  p_geojson TEXT,
  p_no_berkas_legalisasi_gu TEXT DEFAULT NULL,
  p_tgl_berkas_legalisasi_gu DATE DEFAULT NULL,
  p_luas_hasil_ukur NUMERIC DEFAULT NULL,
  p_penggunaan_tanah_b penggunaan_tanah_b_enum DEFAULT NULL,
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
