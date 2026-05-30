import { Search, Bell, Activity } from "lucide-react";
import { Input } from "@/components/ui/input";

interface TopbarProps {
  activePatient?: { name: string; mrn: string } | null;
  onSearch?: (query: string) => void;
  searchValue?: string;
}

const Topbar = ({ activePatient, onSearch, searchValue = "" }: TopbarProps) => {
  return (
    <header className="topbar">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2 shrink-0">
          <div
            className="w-8 h-8 rounded-md flex items-center justify-center"
            style={{ background: "var(--color-brand-600)" }}
          >
            <Activity className="w-4 h-4 text-white" aria-hidden="true" />
          </div>
          <span
            className="font-semibold hidden sm:block"
            style={{ fontSize: "var(--text-heading-md)", color: "var(--color-brand-900)" }}
          >
            DiaTrack
          </span>
        </div>
      </div>

      <div className="flex-1 max-w-[280px] mx-4 hidden md:block">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
            style={{ color: "var(--color-text-tertiary)" }}
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Search patients, MRN..."
            value={searchValue}
            onChange={(e) => onSearch?.(e.target.value)}
            className="pl-9 h-9"
            aria-label="Global search"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {activePatient && (
          <div
            className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full text-sm"
            style={{
              background: "var(--color-brand-50)",
              color: "var(--color-brand-700)",
              border: "1px solid var(--color-brand-200)",
            }}
          >
            <span className="font-medium">{activePatient.name}</span>
            <span style={{ color: "var(--color-text-tertiary)" }}>·</span>
            <span className="tabular-nums" style={{ fontSize: "var(--text-body-sm)" }}>
              {activePatient.mrn}
            </span>
          </div>
        )}

        <button
          type="button"
          className="relative p-2 rounded-md hover:bg-[var(--color-bg-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]"
          aria-label="Notifications"
        >
          <Bell className="h-[18px] w-[18px]" style={{ color: "var(--color-text-secondary)" }} />
        </button>

        <div
          className="w-8 h-8 rounded-md flex items-center justify-center text-sm font-semibold"
          style={{
            background: "var(--color-brand-600)",
            color: "var(--color-text-inverse)",
          }}
          aria-label="Clinician profile"
          role="img"
        >
          DR
        </div>
      </div>
    </header>
  );
};

export default Topbar;
