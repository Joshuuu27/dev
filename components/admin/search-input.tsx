"use client";

import { SearchBar } from "@/components/common/SearchBar";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * Admin search input — uses the same SearchBar style as police SOS alerts.
 */
export default function SearchInput({
  value,
  onChange,
  placeholder = "Search drivers by name, address or license #...",
}: SearchInputProps) {
  return (
    <SearchBar
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full max-w-2xl"
    />
  );
}
