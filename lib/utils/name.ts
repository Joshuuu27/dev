/**
 * Name parts stored for users (First, Last, Middle, Suffix).
 * Used across registration, admin create user, police add officer, operator/driver profiles.
 */
export interface NameParts {
  firstName: string;
  lastName: string;
  middleName?: string;
  suffix?: string;
}

/**
 * Build a single display name string from parts.
 * Order: FirstName MiddleName LastName Suffix (e.g. "Juan M. Dela Cruz Jr.")
 */
export function formatDisplayName(parts: {
  firstName: string;
  lastName: string;
  middleName?: string;
  suffix?: string;
}): string {
  const { firstName, lastName, middleName, suffix } = parts;
  const segments = [
    (firstName || "").trim(),
    (middleName || "").trim(),
    (lastName || "").trim(),
    (suffix || "").trim(),
  ].filter(Boolean);
  return segments.join(" ");
}

/**
 * Get display name from a user-like object that may have
 * either name parts (firstName, lastName, ...) or legacy `name`.
 */
export function getDisplayName(user: {
  name?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  suffix?: string;
  displayName?: string;
} | null | undefined): string {
  if (!user) return "";
  const first = (user as any).firstName ?? "";
  const last = (user as any).lastName ?? "";
  if (first || last) {
    return formatDisplayName({
      firstName: first,
      lastName: last,
      middleName: (user as any).middleName,
      suffix: (user as any).suffix,
    });
  }
  return (user as any).name || (user as any).displayName || "";
}
