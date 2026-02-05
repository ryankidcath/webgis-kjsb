-- Remove automatic Kode KJSB sequence: admin inputs manually (YYYY-XXXX), app prepends BKS-

DROP TRIGGER IF EXISTS tr_proyek_kjsb_kode ON proyek_kjsb;
DROP FUNCTION IF EXISTS trigger_set_kode_kjsb();
DROP FUNCTION IF EXISTS generate_kode_kjsb();
DROP SEQUENCE IF EXISTS seq_kode_kjsb_2026;
