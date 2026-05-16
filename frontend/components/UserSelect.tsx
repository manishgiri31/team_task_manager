"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FieldLabel } from "@/components/ui/FieldLabel";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { getApiErrorMessage } from "@/services/api";
import { usersService } from "@/services/users.service";
import type { UserSummary } from "@/types/user";

const DEBOUNCE_MS = 350;

export interface UserSelectProps {
  fieldId?: string;
  label?: string;
  value: number | null;
  onChange: (userId: number | null) => void;
  disabled?: boolean;
  placeholder?: string;
  excludeUserIds?: readonly number[];
  allowClear?: boolean;
}

function formatUserLine(u: UserSummary): string {
  return `${u.name} (${u.email})`;
}

export function UserSelect({
  fieldId,
  label,
  value,
  onChange,
  disabled = false,
  placeholder = "Search by name or email…",
  excludeUserIds,
  allowClear = true,
}: UserSelectProps) {
  const autoId = useId();
  const inputId = fieldId ?? `user-select-${autoId}`;
  const listboxId = `${inputId}-listbox`;

  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const prevOpen = useRef(false);

  const excludeSet = useMemo(
    () => new Set(excludeUserIds ?? []),
    [excludeUserIds]
  );

  const loadUsers = useCallback(
    async (q: string) => {
      setLoading(true);
      setError(null);
      try {
        const data = await usersService.list({
          q: q || undefined,
          limit: 200,
        });
        setUsers(data.filter((u) => !excludeSet.has(u.id)));
      } catch (e) {
        setError(getApiErrorMessage(e));
        setUsers([]);
      } finally {
        setLoading(false);
      }
    },
    [excludeSet]
  );

  useEffect(() => {
    if (!open) return;
    const q = searchQuery.trim();
    const delay = q.length > 0 ? DEBOUNCE_MS : 0;
    const t = window.setTimeout(() => void loadUsers(q), delay);
    return () => window.clearTimeout(t);
  }, [open, searchQuery, loadUsers]);

  useEffect(() => {
    if (open && !prevOpen.current) {
      setSearchQuery("");
    }
    prevOpen.current = open;
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const selectedUser = useMemo(() => {
    if (value == null) return null;
    return users.find((u) => u.id === value) ?? null;
  }, [users, value]);

  const displayValue = useMemo(() => {
    if (value == null) return "";
    if (selectedUser) return formatUserLine(selectedUser);
    return `User #${value}`;
  }, [value, selectedUser]);

  const handleFocus = () => {
    if (disabled) return;
    setOpen(true);
  };

  const pick = (u: UserSummary) => {
    onChange(u.id);
    setOpen(false);
    setSearchQuery("");
  };

  return (
    <div ref={rootRef} className="relative">
      {label ? <FieldLabel htmlFor={inputId}>{label}</FieldLabel> : null}
      <div className="mt-1 flex gap-2">
        <div className="relative min-w-0 flex-1">
          <Input
            id={inputId}
            role="combobox"
            aria-expanded={open}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-invalid={error ? true : undefined}
            disabled={disabled}
            placeholder={placeholder}
            value={open ? searchQuery : value != null ? displayValue : ""}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (!open) setOpen(true);
            }}
            onFocus={handleFocus}
          />
          {open ? (
            <div
              id={listboxId}
              role="listbox"
              className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-slate-700 bg-slate-950 py-1 shadow-xl"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2 px-3 py-6 text-sm text-slate-400">
                  <Spinner className="h-5 w-5" />
                  Loading users…
                </div>
              ) : users.length === 0 ? (
                <p className="px-3 py-4 text-center text-sm text-slate-500">
                  No users match your search.
                </p>
              ) : (
                users.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    role="option"
                    aria-selected={value === u.id}
                    className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-sm hover:bg-slate-800/90"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => pick(u)}
                  >
                    <span className="font-medium text-slate-100">{u.name}</span>
                    <span className="text-xs text-slate-500">{u.email}</span>
                  </button>
                ))
              )}
            </div>
          ) : null}
        </div>
        {allowClear && value != null && !disabled ? (
          <Button
            type="button"
            variant="secondary"
            className="shrink-0 px-3"
            aria-label="Clear selected user"
            onClick={() => onChange(null)}
          >
            Clear
          </Button>
        ) : null}
      </div>
      {error ? (
        <p className="mt-2 text-xs text-rose-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
