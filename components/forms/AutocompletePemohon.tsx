"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { searchPemohon } from "@/app/actions/proyek";
import type { PemohonRow } from "@/types/proyek";
import { ChevronDown, X } from "lucide-react";

export type PemohonValue =
  | { id: string; nama_pemohon: string; nomor_telepon_pemohon?: string | null; nik_pemohon?: string | null; alamat_pemohon?: string | null }
  | { baru: { nama_pemohon: string; nomor_telepon_pemohon?: string; nik_pemohon?: string; alamat_pemohon?: string } }
  | null;

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 1;

interface AutocompletePemohonProps {
  value: PemohonValue;
  onChange: (value: PemohonValue) => void;
  placeholder?: string;
}

export default function AutocompletePemohon({ value, onChange, placeholder = "Ketik nama pemohon..." }: AutocompletePemohonProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PemohonRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newForm, setNewForm] = useState({
    nama_pemohon: "",
    nomor_telepon_pemohon: "",
    nik_pemohon: "",
    alamat_pemohon: "",
  });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const runSearch = useCallback(async (q: string) => {
    if (q.length < MIN_QUERY_LENGTH) {
      setResults([]);
      return;
    }
    setLoading(true);
    const list = await searchPemohon(q);
    setResults(list ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(() => runSearch(query), DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, runSearch]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedExisting = value && "id" in value && !("baru" in value);
  const selectedNew = value && "baru" in value;

  function handleSelect(row: PemohonRow) {
    onChange({
      id: row.id,
      nama_pemohon: row.nama_pemohon,
      nomor_telepon_pemohon: row.nomor_telepon_pemohon,
      nik_pemohon: row.nik_pemohon,
      alamat_pemohon: row.alamat_pemohon,
    });
    setQuery("");
    setOpen(false);
    setShowNewForm(false);
  }

  function handleSelectNew() {
    setShowNewForm(true);
    setOpen(false);
    setNewForm({
      nama_pemohon: query.trim(),
      nomor_telepon_pemohon: "",
      nik_pemohon: "",
      alamat_pemohon: "",
    });
    onChange({
      baru: {
        nama_pemohon: query.trim() || "",
        nomor_telepon_pemohon: "",
        nik_pemohon: "",
        alamat_pemohon: "",
      },
    });
  }

  function handleClear() {
    onChange(null);
    setQuery("");
    setShowNewForm(false);
    setNewForm({ nama_pemohon: "", nomor_telepon_pemohon: "", nik_pemohon: "", alamat_pemohon: "" });
  }

  function updateNewForm(fields: Partial<typeof newForm>) {
    const next = { ...newForm, ...fields };
    setNewForm(next);
    onChange({
      baru: {
        nama_pemohon: next.nama_pemohon,
        nomor_telepon_pemohon: next.nomor_telepon_pemohon || undefined,
        nik_pemohon: next.nik_pemohon || undefined,
        alamat_pemohon: next.alamat_pemohon || undefined,
      },
    });
  }

  return (
    <div ref={containerRef} className="space-y-2">
      {selectedExisting ? (
        <div className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50">
          <span className="flex-1 text-sm text-slate-800">
            {value.nama_pemohon}
            {value.nomor_telepon_pemohon ? ` · ${value.nomor_telepon_pemohon}` : ""}
          </span>
          <button type="button" onClick={handleClear} className="p-1 rounded text-slate-500 hover:bg-slate-200" aria-label="Hapus pilihan">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : showNewForm || selectedNew ? (
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <label className="label-base">Nama Pemohon</label>
            <input
              type="text"
              value={newForm.nama_pemohon}
              onChange={(e) => updateNewForm({ nama_pemohon: e.target.value })}
              className="input-base"
              placeholder="Nama lengkap pemohon"
            />
          </div>
          <div>
            <label className="label-base">Nomor Telepon Pemohon</label>
            <input
              type="text"
              value={newForm.nomor_telepon_pemohon}
              onChange={(e) => updateNewForm({ nomor_telepon_pemohon: e.target.value })}
              className="input-base"
              placeholder="Nomor HP"
            />
          </div>
          <div>
            <label className="label-base">NIK Pemohon</label>
            <input
              type="text"
              value={newForm.nik_pemohon}
              onChange={(e) => updateNewForm({ nik_pemohon: e.target.value })}
              className="input-base"
              placeholder="NIK"
            />
          </div>
          <div>
            <label className="label-base">Alamat Pemohon</label>
            <input
              type="text"
              value={newForm.alamat_pemohon}
              onChange={(e) => updateNewForm({ alamat_pemohon: e.target.value })}
              className="input-base"
              placeholder="Alamat"
            />
          </div>
          <div className="sm:col-span-2">
            <button type="button" onClick={handleClear} className="text-sm text-slate-500 hover:text-slate-700">
              Hapus, pilih dari daftar
            </button>
          </div>
        </div>
      ) : (
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            className="input-base pr-9"
            placeholder={placeholder}
            autoComplete="off"
          />
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          {open && (query.length >= MIN_QUERY_LENGTH || results.length > 0) && (
            <ul
              className="absolute z-10 w-full mt-1 py-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-auto"
              role="listbox"
            >
              {loading && (
                <li className="px-3 py-2 text-sm text-slate-500">Memuat...</li>
              )}
              {!loading && query.length >= MIN_QUERY_LENGTH && (
                <li>
                  <button
                    type="button"
                    onClick={handleSelectNew}
                    className="w-full text-left px-3 py-2 text-sm text-primary-600 hover:bg-slate-100 rounded"
                  >
                    + Tambah Pemohon baru
                  </button>
                </li>
              )}
              {!loading && results.map((row) => (
                <li key={row.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(row)}
                    className="w-full text-left px-3 py-2 text-sm text-slate-800 hover:bg-slate-100 rounded flex flex-col"
                    role="option"
                  >
                    <span>{row.nama_pemohon}</span>
                    {(row.nomor_telepon_pemohon || row.nik_pemohon) && (
                      <span className="text-xs text-slate-500">
                        {[row.nomor_telepon_pemohon, row.nik_pemohon].filter(Boolean).join(" · ")}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
