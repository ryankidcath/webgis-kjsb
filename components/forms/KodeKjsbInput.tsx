"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getKodeKjsbSuggestions } from "@/app/actions/proyek";

interface KodeKjsbInputProps {
  value: string;
  onChange: (v: string) => void;
  onSelect: (kode: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const DEBOUNCE_MS = 250;

export default function KodeKjsbInput({
  value,
  onChange,
  onSelect,
  placeholder = "Kode KJSB (contoh: BKS-2026-0001)",
  disabled,
  className,
}: KodeKjsbInputProps) {
  const [suggestions, setSuggestions] = useState<{ kode_kjsb: string }[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (!q.trim()) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    setLoading(true);
    const list = await getKodeKjsbSuggestions(q);
    setSuggestions(list);
    setShowDropdown(list.length > 0);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
      debounceRef.current = null;
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, fetchSuggestions]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(kode: string) {
    onChange(kode);
    setShowDropdown(false);
    setSuggestions([]);
    onSelect(kode);
  }

  const inputClass = className ?? "input-base min-w-[220px]";

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => value.trim() && suggestions.length > 0 && setShowDropdown(true)}
        disabled={disabled}
        className={inputClass}
        autoComplete="off"
      />
      {showDropdown && (
        <ul className="absolute z-50 mt-1 w-full max-h-48 overflow-auto rounded-lg border border-slate-200 bg-white shadow-card py-1">
          {loading ? (
            <li className="px-3 py-2 text-slate-500 text-sm">Memuat...</li>
          ) : (
            suggestions.map((s) => (
              <li
                key={s.kode_kjsb}
                role="button"
                tabIndex={0}
                className="px-3 py-2 text-slate-800 text-sm hover:bg-primary-50 cursor-pointer transition-colors duration-200"
                onMouseDown={() => handleSelect(s.kode_kjsb)}
              >
                {s.kode_kjsb}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
