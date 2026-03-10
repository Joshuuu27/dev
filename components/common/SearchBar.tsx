"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Wrapper className (e.g. flex-1 min-w-[200px] max-w-sm for toolbar, or w-full for standalone) */
  className?: string;
  /** Input element className */
  inputClassName?: string;
  /** Show clear (X) button when value is non-empty. Default true */
  showClear?: boolean;
  /** Accessible label for the search input */
  "aria-label"?: string;
  /** id for the input (e.g. for Label htmlFor) */
  id?: string;
}

/**
 * Unified search bar matching the police SOS alerts style.
 * Use in toolbars (DataTable extraToolbarContent), standalone sections, or forms.
 */
export function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  className,
  inputClassName,
  showClear = true,
  "aria-label": ariaLabel = "Search",
  id,
}: SearchBarProps) {
  return (
    <div
      className={cn(
        "relative flex-1 min-w-[200px] max-w-sm",
        className
      )}
    >
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
      <Input
        id={id}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn("h-8 pl-8 pr-8", inputClassName)}
        aria-label={ariaLabel}
      />
      {showClear && value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
