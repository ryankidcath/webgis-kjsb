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

## Deploy (GitHub + Vercel)

Repo sudah di-init dan commit pertama sudah dibuat. Untuk deploy agar admin bisa akses di browser:

1. **GitHub**
   - Buat repo baru di [github.com/new](https://github.com/new) (nama mis. `webgis-kjsb`). Jangan centang "Add a README" jika sudah ada README lokal.
   - Tambah remote dan push:
     ```bash
     git remote add origin https://github.com/<username>/webgis-kjsb.git
     git push -u origin main
     ```
   - Ganti `<username>` dengan username GitHub Anda.

2. **Vercel**
   - Login di [vercel.com](https://vercel.com) (bisa pakai akun GitHub).
   - Add New → Project → Import Git Repository → pilih repo `webgis-kjsb`.
   - Framework Preset: Next.js (biasanya terdeteksi otomatis).
   - Di **Environment Variables**, tambah:
     - `NEXT_PUBLIC_SUPABASE_URL` = nilai dari `.env.local` (Supabase Project URL).
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = nilai dari `.env.local` (Supabase anon key).
   - Klik Deploy. Setelah selesai, dapat URL production (mis. `https://webgis-kjsb.vercel.app`).

3. **Akses admin**
   - Bagi URL production ke admin. Admin cukup buka URL di browser tanpa install apa pun.
