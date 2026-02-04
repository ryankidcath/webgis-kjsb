# WebGIS KJSB Benning dan Rekan

Spatial Management System for KJSB Benning dan Rekan: Next.js (App Router), Tailwind, React-Leaflet, Supabase + PostGIS.

## Setup

1. **Supabase**
   - Create a project at [supabase.com](https://supabase.com).
   - Enable PostGIS: run the SQL in `supabase/migrations/20260204000000_create_proyek_kjsb.sql` in the SQL Editor (Supabase Dashboard → SQL Editor). Note: PostGIS extension must be enabled in the project (Database → Extensions).
   - Copy Project URL and anon key: Settings → API.

2. **Env**
   - Copy `.env.local.example` to `.env.local`.
   - Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

3. **Run**
   - `npm install`
   - `npm run dev`
   - Open [http://localhost:3000](http://localhost:3000).

## Routes

- **/** — Peta (map + search by Nama Pemohon + detail sidebar on polygon click).
- **/tahap/1** — Form Tahap 1 (create proyek, generate kode_kjsb).
- **/tahap/2** … **/tahap/5** — Update by kode_kjsb; Tahap 4 includes GeoJSON upload.

## Database

- Table `proyek_kjsb`: all 5 tahap columns, `geom` (GEOMETRY Polygon 4326), generated `luas_hitung_otomatis` (area in m², EPSG:23835).
- View `proyek_kjsb_map`: id, kode_kjsb, nama_pemohon, geom as GeoJSON for the map.
- RPC `update_proyek_tahap4_with_geom`: update geometry + Tahap 4 attributes from GeoJSON.
