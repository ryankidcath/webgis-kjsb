-- Klien and Pemohon as separate tables; proyek_kjsb references them by FK.
-- Migrates existing nama_klien/hp_klien and nama_pemohon/hp_pemohon into new tables.

-- 1. Table klien
CREATE TABLE klien (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_klien TEXT NOT NULL,
  nomor_telepon_klien TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_klien_nama ON klien (nama_klien);

CREATE TRIGGER tr_klien_updated_at
  BEFORE UPDATE ON klien
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

ALTER TABLE klien ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for anon" ON klien FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON klien FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service_role" ON klien FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 2. Table pemohon
CREATE TABLE pemohon (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_pemohon TEXT NOT NULL,
  nomor_telepon_pemohon TEXT,
  nik_pemohon TEXT,
  alamat_pemohon TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_pemohon_nama ON pemohon (nama_pemohon);

CREATE TRIGGER tr_pemohon_updated_at
  BEFORE UPDATE ON pemohon
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

ALTER TABLE pemohon ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for anon" ON pemohon FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON pemohon FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service_role" ON pemohon FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 3. Add FKs to proyek_kjsb (nullable for migration)
ALTER TABLE proyek_kjsb
  ADD COLUMN klien_id UUID REFERENCES klien(id),
  ADD COLUMN pemohon_id UUID REFERENCES pemohon(id);

-- 4. Migrate existing data: insert distinct klien/pemohon, then update proyek_kjsb
INSERT INTO klien (nama_klien, nomor_telepon_klien)
SELECT DISTINCT nama_klien, hp_klien
FROM proyek_kjsb
WHERE COALESCE(TRIM(nama_klien), '') <> '';

INSERT INTO pemohon (nama_pemohon, nomor_telepon_pemohon)
SELECT DISTINCT nama_pemohon, hp_pemohon
FROM proyek_kjsb
WHERE COALESCE(TRIM(nama_pemohon), '') <> '';

UPDATE proyek_kjsb p
SET klien_id = (
  SELECT k.id FROM klien k
  WHERE k.nama_klien = p.nama_klien AND k.nomor_telepon_klien IS NOT DISTINCT FROM p.hp_klien
  ORDER BY k.created_at
  LIMIT 1
)
WHERE p.nama_klien IS NOT NULL AND TRIM(p.nama_klien) <> '';

UPDATE proyek_kjsb p
SET pemohon_id = (
  SELECT pm.id FROM pemohon pm
  WHERE pm.nama_pemohon = p.nama_pemohon AND pm.nomor_telepon_pemohon IS NOT DISTINCT FROM p.hp_pemohon
  ORDER BY pm.created_at
  LIMIT 1
)
WHERE p.nama_pemohon IS NOT NULL AND TRIM(p.nama_pemohon) <> '';

-- 5. Drop view first (it depends on nama_pemohon column)
DROP VIEW IF EXISTS proyek_kjsb_map;

-- 6. Drop old columns
ALTER TABLE proyek_kjsb
  DROP COLUMN nama_klien,
  DROP COLUMN hp_klien,
  DROP COLUMN nama_pemohon,
  DROP COLUMN hp_pemohon;

-- 7. Recreate view proyek_kjsb_map with JOIN to pemohon
CREATE VIEW proyek_kjsb_map AS
SELECT
  p.id,
  p.kode_kjsb,
  pm.nama_pemohon,
  ST_AsGeoJSON(p.geom)::json AS geom
FROM proyek_kjsb p
LEFT JOIN pemohon pm ON p.pemohon_id = pm.id
WHERE p.geom IS NOT NULL;

GRANT SELECT ON proyek_kjsb_map TO anon;
GRANT SELECT ON proyek_kjsb_map TO authenticated;
GRANT SELECT ON proyek_kjsb_map TO service_role;
