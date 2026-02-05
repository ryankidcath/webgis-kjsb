"use client";

import { useEffect, useState } from "react";
import ReactDatePicker from "react-datepicker";
import { id } from "date-fns/locale";

function parseIso(iso: string | undefined): Date | null {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function toIso(date: Date | null): string {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

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
  const [selected, setSelected] = useState<Date | null>(() => parseIso(defaultValue) ?? null);

  useEffect(() => {
    const parsed = parseIso(defaultValue);
    setSelected(parsed ?? null);
  }, [defaultValue]);

  const isoDate = toIso(selected);

  return (
    <div className={className}>
      <input type="hidden" name={name} value={isoDate} required={required} />
      <ReactDatePicker
        selected={selected}
        onChange={(date: Date | null) => setSelected(date ?? null)}
        dateFormat="dd/MM/yyyy"
        locale={id}
        placeholderText="dd/mm/yyyy"
        className="input-base w-full"
        id={id}
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        yearDropdownItemNumber={10}
        minDate={new Date(1900, 0, 1)}
        maxDate={new Date(2100, 11, 31)}
      />
    </div>
  );
}
