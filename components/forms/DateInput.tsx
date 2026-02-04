"use client";

import { useMemo, useState } from "react";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

function parseIso(iso: string | undefined): { day: number; month: number; year: number } | null {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [y, m, d] = iso.split("-").map(Number);
  if (y < 1900 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) return null;
  const lastDay = new Date(y, m, 0).getDate();
  if (d > lastDay) return null;
  return { day: d, month: m, year: y };
}

function toIso(day: number, month: number, year: number): string {
  const d = String(day).padStart(2, "0");
  const m = String(month).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

const YEAR_MIN = new Date().getFullYear() - 5;
const YEAR_MAX = new Date().getFullYear() + 2;

interface DateInputProps {
  name: string;
  defaultValue?: string;
  required?: boolean;
  className?: string;
  id?: string;
}

export default function DateInput({
  name,
  defaultValue,
  required,
  className = "",
  id,
}: DateInputProps) {
  const parsed = useMemo(() => parseIso(defaultValue), [defaultValue]);
  const [day, setDay] = useState(parsed?.day ?? 1);
  const [month, setMonth] = useState(parsed?.month ?? new Date().getMonth() + 1);
  const [year, setYear] = useState(parsed?.year ?? new Date().getFullYear());

  const maxDay = getDaysInMonth(month, year);
  const safeDay = day > maxDay ? maxDay : day;

  const isoDate = toIso(safeDay, month, year);

  const days = useMemo(() => Array.from({ length: maxDay }, (_, i) => i + 1), [maxDay]);
  const years = useMemo(
    () => Array.from({ length: YEAR_MAX - YEAR_MIN + 1 }, (_, i) => YEAR_MIN + i),
    []
  );

  return (
    <div className={`flex flex-wrap gap-2 items-center ${className}`}>
      <input type="hidden" name={name} value={isoDate} required={required} />
      <select
        aria-label="Tanggal"
        value={safeDay}
        onChange={(e) => setDay(Number(e.target.value))}
        className="input-base flex-1 min-w-0"
      >
        {days.map((d) => (
          <option key={d} value={d}>{String(d).padStart(2, "0")}</option>
        ))}
      </select>
      <select
        aria-label="Bulan"
        value={month}
        onChange={(e) => {
          const m = Number(e.target.value);
          setMonth(m);
          const max = getDaysInMonth(m, year);
          if (day > max) setDay(max);
        }}
        className="input-base flex-1 min-w-0"
      >
        {MONTH_NAMES.map((label, i) => (
          <option key={i} value={i + 1}>{label}</option>
        ))}
      </select>
      <select
        aria-label="Tahun"
        value={year}
        onChange={(e) => {
          const y = Number(e.target.value);
          setYear(y);
          const max = getDaysInMonth(month, y);
          if (day > max) setDay(max);
        }}
        className="input-base flex-1 min-w-0"
      >
        {years.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
    </div>
  );
}
