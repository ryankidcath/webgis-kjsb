-- Surveyor as FK on proyek_kjsb (same pattern as klien/pemohon).
-- Migrates existing nama_surveyor, hp_surveyor, lisensi_surveyor into surveyor table and drops old columns.

-- 1. Add FK to proyek_kjsb (nullable for migration)
ALTER TABLE proyek_kjsb
  ADD COLUMN surveyor_id UUID REFERENCES surveyor(id);

-- 2. Insert distinct surveyors from proyek_kjsb
INSERT INTO surveyor (nama, hp, lisensi)
SELECT DISTINCT nama_surveyor, hp_surveyor, lisensi_surveyor
FROM proyek_kjsb
WHERE COALESCE(TRIM(nama_surveyor), '') <> '';

-- 3. Set surveyor_id on proyek_kjsb by matching nama, hp, lisensi (pick one by created_at)
UPDATE proyek_kjsb p
SET surveyor_id = (
  SELECT s.id FROM surveyor s
  WHERE s.nama = p.nama_surveyor
    AND s.hp IS NOT DISTINCT FROM p.hp_surveyor
    AND s.lisensi IS NOT DISTINCT FROM p.lisensi_surveyor
  ORDER BY s.created_at
  LIMIT 1
)
WHERE p.nama_surveyor IS NOT NULL AND TRIM(p.nama_surveyor) <> '';

-- 4. Drop old columns
ALTER TABLE proyek_kjsb
  DROP COLUMN nama_surveyor,
  DROP COLUMN hp_surveyor,
  DROP COLUMN lisensi_surveyor;

-- 5. Index for FK lookups (consistent with other FKs)
CREATE INDEX idx_proyek_kjsb_surveyor ON proyek_kjsb (surveyor_id);
